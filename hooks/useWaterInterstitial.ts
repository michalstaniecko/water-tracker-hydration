import { useEffect, useRef, useCallback, useState } from "react";
import { Platform } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  InterstitialAd,
  AdEventType,
  TestIds,
} from "react-native-google-mobile-ads";
import { useConsentStore } from "@/stores/consent";
import { logError, logInfo } from "@/utils/errorLogging";

const WATER_ADD_COUNT_KEY = "waterAddCount";
const AD_FREQUENCY = 5;
const AD_COUNTDOWN_SECONDS = 5;

const adUnitId = __DEV__
  ? TestIds.INTERSTITIAL
  : Platform.OS === "ios"
    ? "ca-app-pub-7007354971618918/8594705309"
    : "ca-app-pub-7007354971618918/4998330361";

export function useWaterInterstitial() {
  const { canRequestAds, isMobileAdsInitialized } = useConsentStore();
  const adRef = useRef<InterstitialAd | null>(null);
  const loadedRef = useRef(false);
  const addCountRef = useRef(0);
  const countdownIntervalRef = useRef<ReturnType<typeof setInterval> | null>(
    null,
  );
  const adTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [countdown, setCountdown] = useState<number | null>(null);

  useEffect(() => {
    return () => {
      if (countdownIntervalRef.current)
        clearInterval(countdownIntervalRef.current);
      if (adTimeoutRef.current) clearTimeout(adTimeoutRef.current);
    };
  }, []);

  useEffect(() => {
    AsyncStorage.getItem(WATER_ADD_COUNT_KEY)
      .then((value) => {
        if (value !== null) {
          addCountRef.current = parseInt(value, 10) || 0;
        }
      })
      .catch((error) => {
        logError(error, {
          operation: "useWaterInterstitial.loadCount",
          component: "InterstitialAd",
        });
      });
  }, []);

  useEffect(() => {
    if (!canRequestAds || !isMobileAdsInitialized) return;

    const ad = InterstitialAd.createForAdRequest(adUnitId, {
      requestNonPersonalizedAdsOnly: false,
    });
    adRef.current = ad;

    const unsubLoaded = ad.addAdEventListener(AdEventType.LOADED, () => {
      loadedRef.current = true;
      logInfo("Interstitial loaded", {
        operation: "useWaterInterstitial",
        component: "InterstitialAd",
      });
    });

    const unsubError = ad.addAdEventListener(AdEventType.ERROR, (error) => {
      loadedRef.current = false;
      logError(error, {
        operation: "useWaterInterstitial.load",
        component: "InterstitialAd",
      });
    });

    const unsubClosed = ad.addAdEventListener(AdEventType.CLOSED, () => {
      loadedRef.current = false;
      logInfo("Interstitial closed, preloading next", {
        operation: "useWaterInterstitial",
        component: "InterstitialAd",
      });
      ad.load();
    });

    ad.load();

    return () => {
      unsubLoaded();
      unsubError();
      unsubClosed();
    };
  }, [canRequestAds, isMobileAdsInitialized]);

  const trackWaterAdd = useCallback(async () => {
    const newCount = addCountRef.current + 1;
    addCountRef.current = newCount;

    try {
      await AsyncStorage.setItem(WATER_ADD_COUNT_KEY, String(newCount));
    } catch (error) {
      logError(error, {
        operation: "useWaterInterstitial.saveCount",
        component: "InterstitialAd",
      });
    }

    if (newCount % AD_FREQUENCY === 0 && loadedRef.current && adRef.current) {
      setCountdown(AD_COUNTDOWN_SECONDS);

      let remaining = AD_COUNTDOWN_SECONDS;
      const intervalId = setInterval(() => {
        remaining -= 1;
        if (remaining > 0) {
          setCountdown(remaining);
        } else {
          clearInterval(intervalId);
          setCountdown(null);
        }
      }, 1000);
      countdownIntervalRef.current = intervalId;

      const timeoutId = setTimeout(() => {
        adRef.current?.show().catch((error) =>
          logError(error, {
            operation: "useWaterInterstitial.show",
            component: "InterstitialAd",
          }),
        );
      }, AD_COUNTDOWN_SECONDS * 1000);
      adTimeoutRef.current = timeoutId;
    }
  }, []);

  return { trackWaterAdd, countdown };
}
