import { Tabs } from "expo-router";
import React from "react";
import { getToday } from "@/utils/date";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import { Banner } from "@/components/ads/Banner";
import { useSetupStore } from "@/stores/setup";
import { useTranslation } from "react-i18next";
import theme from "@/tailwind.config";

export default function TabLayout() {
  const { t } = useTranslation("tabs");
  const { dateFormat } = useSetupStore();
  return (
    <>
      <Tabs
        screenOptions={{
          tabBarHideOnKeyboard: true,
          // TODO: Fix this type error, blue[600] is not recognized
          // @ts-ignore
          tabBarActiveTintColor: theme?.theme?.extend?.colors?.blue[600],
        }}
        screenLayout={({ children }) => {
          return (
            <>
              {children}
              <Banner />
            </>
          );
        }}
      >
        <Tabs.Screen
          name={"index"}
          options={{
            title: `${t("today")}: ${getToday(dateFormat)}`,
            tabBarLabel: t("today"),
            tabBarIcon: ({ color }) => (
              <FontAwesome size={28} name={"home"} color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name={"history"}
          options={{
            title: t("history"),
            tabBarIcon: ({ color }) => (
              <FontAwesome size={24} name={"calendar"} color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name={"setup"}
          options={{
            title: t("setup"),
            tabBarIcon: ({ color }) => (
              <FontAwesome size={28} name={"cog"} color={color} />
            ),
          }}
        />
      </Tabs>
    </>
  );
}
