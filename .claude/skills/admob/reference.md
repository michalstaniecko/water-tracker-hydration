# AdMob ad-type reference

Per-ad-type recipes for this codebase. Each template assumes:

- File location: `components/ads/<Name>.tsx` (or a `hooks/use<Name>Ad.ts` for non-rendering types)
- Consent gate via `useConsentStore` is mandatory
- Logging via `@/utils/errorLogging`
- Replace `<iOS-id>` / `<Android-id>` with real ad unit IDs from AdMob console (publisher prefix `ca-app-pub-7007354971618918`)

---

## Banner

The canonical example lives at `components/ads/Banner.tsx`. Other banner sizes use the same shape, only `size` and the unit ID change.

Available sizes from `BannerAdSize`:

| Size constant | Use case |
| --- | --- |
| `ANCHORED_ADAPTIVE_BANNER` | Default. Fills width, height adapts to device. Already used for the bottom-tab banner. |
| `INLINE_ADAPTIVE_BANNER` | Inline within a scroll view; height grows with available space. |
| `BANNER` | 320×50 fixed. Avoid — adaptive banners earn more. |
| `LARGE_BANNER` | 320×100 fixed. |
| `MEDIUM_RECTANGLE` | 300×250. Good for inline placements between content. |
| `FULL_BANNER` | 468×60 (tablet). |
| `LEADERBOARD` | 728×90 (tablet). |

For inline adaptive, prefer wrapping the `BannerAd` in a measured container so width is known.

---

## Interstitial

Full-screen ad shown at natural transitions (after a task completes, between major flows). Never on launch.

**Hook (`hooks/useInterstitialAd.ts`):**

```ts
import { useEffect, useRef } from "react";
import { Platform } from "react-native";
import {
  InterstitialAd,
  AdEventType,
  TestIds,
} from "react-native-google-mobile-ads";
import { useConsentStore } from "@/stores/consent";
import { logError, logInfo } from "@/utils/errorLogging";

const adUnitId = __DEV__
  ? TestIds.INTERSTITIAL
  : Platform.OS === "ios"
    ? "ca-app-pub-7007354971618918/<iOS-id>"
    : "ca-app-pub-7007354971618918/<Android-id>";

export function useInterstitialAd() {
  const { canRequestAds, isMobileAdsInitialized } = useConsentStore();
  const adRef = useRef<InterstitialAd | null>(null);
  const loadedRef = useRef(false);

  useEffect(() => {
    if (!canRequestAds || !isMobileAdsInitialized) return;

    const ad = InterstitialAd.createForAdRequest(adUnitId, {
      requestNonPersonalizedAdsOnly: false,
    });
    adRef.current = ad;

    const unsubLoaded = ad.addAdEventListener(AdEventType.LOADED, () => {
      loadedRef.current = true;
      logInfo("Interstitial loaded", {
        operation: "useInterstitialAd",
        component: "InterstitialAd",
      });
    });
    const unsubError = ad.addAdEventListener(AdEventType.ERROR, (error) => {
      loadedRef.current = false;
      logError(error, {
        operation: "useInterstitialAd.load",
        component: "InterstitialAd",
      });
    });
    const unsubClosed = ad.addAdEventListener(AdEventType.CLOSED, () => {
      loadedRef.current = false;
      ad.load(); // preload next
    });

    ad.load();

    return () => {
      unsubLoaded();
      unsubError();
      unsubClosed();
    };
  }, [canRequestAds, isMobileAdsInitialized]);

  return {
    show: () => {
      if (loadedRef.current && adRef.current) {
        adRef.current.show().catch((error) =>
          logError(error, {
            operation: "useInterstitialAd.show",
            component: "InterstitialAd",
          }),
        );
      }
    },
    isReady: () => loadedRef.current,
  };
}
```

**Usage:**

```tsx
const { show, isReady } = useInterstitialAd();
// ...
const handleCompleteDay = () => {
  finishDailyGoal();
  if (isReady()) show();
};
```

Frequency cap: enforce in calling code (e.g. show at most once per session, or every Nth completion). Do not let the SDK decide.

---

## Rewarded

User opts in, watches an ad, gets a reward. The reward payload (`type`, `amount`) is configured per unit in AdMob console.

```ts
import { RewardedAd, RewardedAdEventType, AdEventType, TestIds } from "react-native-google-mobile-ads";

const adUnitId = __DEV__ ? TestIds.REWARDED : /* prod IDs */;

const ad = RewardedAd.createForAdRequest(adUnitId);

ad.addAdEventListener(RewardedAdEventType.LOADED, () => { /* ready */ });
ad.addAdEventListener(RewardedAdEventType.EARNED_REWARD, (reward) => {
  // grant in-app reward — e.g. unlock theme, extend streak grace period
});
ad.addAdEventListener(AdEventType.ERROR, (error) => logError(error, { ... }));
ad.addAdEventListener(AdEventType.CLOSED, () => ad.load()); // preload next

ad.load();
```

Same hook structure as interstitial. The reward grant **must** happen in the `EARNED_REWARD` listener, not after `show()` resolves — show resolves when the ad starts, not when the user qualifies for the reward.

---

## Rewarded Interstitial

Like rewarded but auto-plays at a transition with an opt-out screen first. Use `RewardedInterstitialAd` from the same package; events are identical to rewarded. AdMob policy requires an intro screen — most apps just reuse the SDK's built-in one.

---

## App Open

Shown when the user foregrounds the app. There is **one** correct mount point: a top-level controller wired to `AppState`.

```ts
import { AppOpenAd, AdEventType, TestIds } from "react-native-google-mobile-ads";
import { AppState } from "react-native";

const adUnitId = __DEV__ ? TestIds.APP_OPEN : /* prod IDs */;

// Inside a top-level useEffect, gated by useConsentStore:
const ad = AppOpenAd.createForAdRequest(adUnitId);
ad.load();

const sub = AppState.addEventListener("change", (state) => {
  if (state === "active" && /* ad loaded && not first launch && cooldown elapsed */) {
    ad.show();
  }
});
```

Rules:
- Ad expires 4 hours after load — refresh before showing.
- Skip the very first foreground after install (cold-start launch screen handles that branding).
- Don't show if the user just returned from an in-app browser / share sheet (AppState fires `active` for those too — track via a "left for an ad" flag or a min-background-time threshold of ~5 seconds).
- Mount the controller at `app/_layout.tsx` level, not in a tab.

---

## Native ads

Native ads require custom UI per placement. Use `NativeAd.createForAdRequest` from `react-native-google-mobile-ads` and lay out the components (`NativeAsset`, `NativeMediaView`) yourself. Required disclosure: an "Ad" badge must be visibly attached to the placement.

Native ads are heavier work — confirm with the user that a native ad is really needed (vs. an inline adaptive banner, which is much simpler) before going down this path.

---

## Mediation (advanced)

The project does not currently use mediation. If adding it later:

1. Install adapter packages (e.g. `react-native-google-mobile-ads/lib/typescript/...` per network).
2. Add SKAdNetwork IDs to `app.json` plugin config under `skAdNetworkItems` (iOS).
3. Configure mediation groups in AdMob console.
4. No code changes required at the ad-component level — mediation is transparent.

---

## Test IDs cheat sheet

```ts
import { TestIds } from "react-native-google-mobile-ads";

TestIds.ADAPTIVE_BANNER
TestIds.BANNER
TestIds.INTERSTITIAL
TestIds.REWARDED
TestIds.REWARDED_INTERSTITIAL
TestIds.APP_OPEN
TestIds.NATIVE
```

Always wrap with `__DEV__` — never use test IDs in a production build or AdMob may flag the account.
