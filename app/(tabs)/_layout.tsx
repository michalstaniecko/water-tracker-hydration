import { Tabs } from "expo-router";
import React from "react";

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarHideOnKeyboard: true,
      }}
    >
      <Tabs.Screen name={"index"} />
      <Tabs.Screen name={"history"} />
      <Tabs.Screen name={"setup"} />
    </Tabs>
  );
}
