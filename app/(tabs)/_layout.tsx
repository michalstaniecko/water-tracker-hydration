import { Tabs } from "expo-router";
import React, { useRef } from "react";
import { getToday } from "@/utils/date";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import {
  BannerAd,
  BannerAdSize,
  TestIds,
  useForeground,
} from "react-native-google-mobile-ads";
import { Platform } from "react-native";

const adUnitId = __DEV__
  ? TestIds.ADAPTIVE_BANNER
  : "ca-app-pub-7007354971618918/3882663398";

export default function TabLayout() {
  const bannerRef = useRef<BannerAd>(null);

  useForeground(() => {
    Platform.OS === "ios" && bannerRef.current?.load();
  });

  return (
    <>
      <Tabs
        screenOptions={{
          tabBarHideOnKeyboard: true,
        }}
        screenLayout={({ children }) => {
          return (
            <>
              {children}
              {Platform.OS === "android" && (
                <BannerAd
                  ref={bannerRef}
                  unitId={adUnitId}
                  size={BannerAdSize.ANCHORED_ADAPTIVE_BANNER}
                />
              )}
            </>
          );
        }}
      >
        <Tabs.Screen
          name={"index"}
          options={{
            title: `Today: ${getToday()}`,
            tabBarLabel: "Today",
            tabBarIcon: ({ color }) => (
              <FontAwesome size={28} name={"home"} color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name={"history"}
          options={{
            title: "History",
            tabBarIcon: ({ color }) => (
              <FontAwesome size={24} name={"calendar"} color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name={"setup"}
          options={{
            title: "Setup",
            tabBarIcon: ({ color }) => (
              <FontAwesome size={28} name={"cog"} color={color} />
            ),
          }}
        />
      </Tabs>
    </>
  );
}
