---
name: admob
description: Configure AdMob and add ad units in this Expo/React Native app — banner, interstitial, rewarded, rewarded interstitial, app open, and native ads. Use when adding a new ad placement, changing an ad size or unit ID, wiring a new ad type to the UMP consent gate, registering test devices, or editing the `react-native-google-mobile-ads` plugin config in `app.json`.
allowed-tools: Read Edit Write Grep Glob Bash(npm test*) Bash(npm run lint*)
---

# AdMob skill

Project uses `react-native-google-mobile-ads` (^16.x) with Google UMP for GDPR consent. Every ad surface in this app **must** be gated by the consent store before rendering or loading.

## Architecture map

| Concern | File | Notes |
| --- | --- | --- |
| Plugin config (app IDs, init flag) | `app.json` → `plugins → react-native-google-mobile-ads` | `androidAppId`, `iosAppId`, `delayAppMeasurementInit: true` |
| UMP wrappers | `services/consentService.ts` | `requestConsentInfo`, `loadAndShowConsentFormIfRequired`, `showPrivacyOptionsForm`, `resetConsent` |
| Consent + Mobile Ads SDK init | `stores/consent.ts` | Calls `mobileAds().initialize()` only when `canRequestAds === true` |
| Consent state defaults | `constants/consent.ts` | `ConsentInitializationStatus`, `initialConsentState` |
| Ad components | `components/ads/` | One file per ad type. `Banner.tsx` is the canonical example |
| Mount point | `app/(tabs)/_layout.tsx` | Banner is rendered above the tab bar |
| Logging | `@/utils/errorLogging` | Always use `logInfo`/`logError` with `{ operation, component }` |

Production publisher ID: `ca-app-pub-7007354971618918`. Test ad units come from `TestIds` in dev — never hardcode test IDs in production paths.

## The consent gate (non-negotiable)

Every ad component or hook **must** read `useConsentStore` and short-circuit until consent has been resolved and the SDK initialized:

```tsx
const { isInitialized, canRequestAds, isMobileAdsInitialized } = useConsentStore();
if (!isInitialized || !canRequestAds || !isMobileAdsInitialized) {
  return null; // or <View /> for banner-shaped layouts
}
```

For non-rendering ad types (interstitial, rewarded, app open), the equivalent guard goes around `.load()` and `.show()` calls. Loading before consent throws at the SDK level and pollutes Crashlytics.

## Ad unit IDs — pattern

Use the same shape as `components/ads/Banner.tsx:11-15`:

```ts
const adUnitId = __DEV__
  ? TestIds.<TYPE>                              // ADAPTIVE_BANNER, INTERSTITIAL, REWARDED, REWARDED_INTERSTITIAL, APP_OPEN
  : Platform.OS === "ios"
    ? "ca-app-pub-7007354971618918/<iOS-id>"
    : "ca-app-pub-7007354971618918/<Android-id>";
```

When the user adds a new placement, ask them for both the iOS and Android unit IDs from AdMob console; do not invent them. If they don't have them yet, leave a clearly-marked `TODO:` placeholder and fail loud at runtime rather than silently using test IDs in production.

## Adding a new ad type — workflow

1. **Confirm intent.** Ask which ad type and where it should appear (screen, trigger). For interstitial/rewarded, also confirm the trigger event (e.g. "after logging Nth glass", "tap on settings"). Never ship interstitials on app launch — that's an AdMob policy violation; use App Open ads for launch.
2. **Get unit IDs.** Ask for the iOS + Android production unit IDs. Use `TestIds.<TYPE>` only in `__DEV__`.
3. **Create the component or hook in `components/ads/`.** One file per type. Mirror the consent-gate, dev/prod-id, and logging conventions from `Banner.tsx`. See `reference.md` for ready-made templates per ad type.
4. **Wire it up.**
   - Banner / Native: render the component where it should appear; respect layout (banners go in fixed-height containers).
   - Interstitial / Rewarded / Rewarded Interstitial / App Open: instantiate via the dedicated hook (e.g. `useInterstitialAd`) inside the screen or in a top-level controller; preload on mount, show on the trigger, recreate after dismissal.
5. **Add structured logging** at every load/show/error boundary using `logInfo`/`logError` from `@/utils/errorLogging`, with `{ operation, component }` matching existing patterns in `services/consentService.ts`.
6. **Don't touch `stores/consent.ts`** unless the change is genuinely about consent. Adding a new ad type does NOT require store changes — the store already exposes everything ads need.
7. **Tests.** Co-locate a unit test in `components/ads/__tests__/` mocking `react-native-google-mobile-ads` and `useConsentStore`. Verify: (a) renders nothing / does not load when consent gate is false, (b) loads/shows when gate is true, (c) test IDs in dev, prod IDs otherwise. See the project's existing Jest+expo-modules patterns in memory if mocking native modules.
8. **Lint + test:** run `npm run lint` and `npm test -- <new-file>` before reporting done.

## Configuring AdMob plugin options

Edits go in `app.json` under `plugins → ["react-native-google-mobile-ads", { ... }]`. Common knobs:

- `androidAppId`, `iosAppId` — app-level IDs from AdMob (NOT ad unit IDs).
- `delayAppMeasurementInit: true` — already set; required for our consent flow so ads SDK doesn't auto-init before UMP resolves.
- `userTrackingUsageDescription` (iOS) — add this if/when ATT prompt copy needs to change.
- `skAdNetworkItems` (iOS) — only edit when adding new ad networks via mediation; otherwise leave to plugin defaults.

After editing `app.json`, native rebuild is required (`expo prebuild` + `npm run ios`/`npm run android`). Mention this when the user makes plugin-level changes.

## Test devices

To register a test device for production builds, call `mobileAds().setRequestConfiguration({ testDeviceIdentifiers: [...] })` once after `mobileAds().initialize()` in `stores/consent.ts`. The device's hashed ID prints in the Xcode/adb logs on first ad request. Treat the list as developer-only: don't commit personal device IDs without the user's go-ahead.

## What NOT to do

- Do not call `mobileAds().initialize()` from anywhere except `stores/consent.ts`. Re-initialization is silent and breaks the consent contract.
- Do not bypass the consent gate with `if (__DEV__)` shortcuts — UMP must be honored in dev too, otherwise EU testing is invalid.
- Do not introduce a parallel ad-loading path (e.g. a custom `useAd` hook that reads `mobileAds()` directly) outside `components/ads/`.
- Do not show interstitials at app launch, between every screen, or back-to-back. Stick to natural break points.
- Do not delete `delayAppMeasurementInit: true`.

## Reference

For per-ad-type code templates (banner sizes, interstitial controller hook, rewarded reward callback, app open foreground handling, native ad layout primitives) see [reference.md](reference.md).
