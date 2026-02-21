import {
  BannerAd,
  BannerAdSize,
  TestIds,
  useForeground,
} from "react-native-google-mobile-ads";
import React, { useRef } from "react";
import { Platform, View } from "react-native";
import { useConsentStore } from "@/stores/consent";

const adUnitId = __DEV__
  ? TestIds.ADAPTIVE_BANNER
  : Platform.OS === "ios"
    ? "ca-app-pub-7007354971618918/3005971080"
    : "ca-app-pub-7007354971618918/3882663398";

export const Banner = () => {
  const bannerRef = useRef<BannerAd>(null);
  const { isInitialized, canRequestAds, isMobileAdsInitialized } =
    useConsentStore();

  useForeground(() => {
    Platform.OS === "ios" && bannerRef.current?.load();
  });

  // Don't render ads until consent is initialized and we can request ads
  if (!isInitialized || !canRequestAds || !isMobileAdsInitialized) {
    return <View />;
  }

  return (
    <BannerAd
      ref={bannerRef}
      unitId={adUnitId}
      size={BannerAdSize.ANCHORED_ADAPTIVE_BANNER}
    />
  );
};
