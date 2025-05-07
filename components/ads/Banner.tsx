import {
  BannerAd,
  BannerAdSize,
  TestIds,
  useForeground,
} from "react-native-google-mobile-ads";
import React, { useRef } from "react";
import { Platform } from "react-native";

const adUnitId = __DEV__
  ? TestIds.ADAPTIVE_BANNER
  : "ca-app-pub-7007354971618918/3882663398";

export const Banner = () => {
  const bannerRef = useRef<BannerAd>(null);

  useForeground(() => {
    Platform.OS === "ios" && bannerRef.current?.load();
  });
  return (
    <BannerAd
      ref={bannerRef}
      unitId={adUnitId}
      size={BannerAdSize.ANCHORED_ADAPTIVE_BANNER}
    />
  );
};
