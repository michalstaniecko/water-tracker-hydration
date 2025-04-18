import { Tabs } from "expo-router";
import React from "react";
import { getToday } from "@/utils/date";
import FontAwesome from "@expo/vector-icons/FontAwesome";

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
  );
}
