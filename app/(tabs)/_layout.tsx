import { Tabs } from "expo-router";
import React from "react";
import { getToday } from "@/utils/date";

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarHideOnKeyboard: true,
      }}
    >
      <Tabs.Screen
        name={"index"}
        options={{
          title: `Today: ${getToday()}`,
          tabBarLabel: "Today",
        }}
      />
      <Tabs.Screen
        name={"history"}
        options={{
          title: "History",
        }}
      />
      <Tabs.Screen
        name={"setup"}
        options={{
          title: "Setup",
        }}
      />
    </Tabs>
  );
}
