import { Tabs } from "expo-router";
import React from "react";
import { getToday } from "@/utils/date";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import { Banner } from "@/components/ads/Banner";
import { useSetupStore } from "@/stores/setup";
import { useTranslation } from "react-i18next";
import { colors } from "@/constants/colors";
import NotificationBellIcon from "@/components/NotificationBellIcon";

export default function TabLayout() {
  const { t } = useTranslation("tabs");
  const { dateFormat } = useSetupStore();
  return (
    <>
      <Tabs
        screenOptions={{
          tabBarHideOnKeyboard: true,
          tabBarActiveTintColor: colors.blue[600],
          animation: "shift",
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
            headerRight: () => <NotificationBellIcon />,
          }}
        />
        <Tabs.Screen
          name={"statistics"}
          options={{
            title: t("statistics"),
            tabBarIcon: ({ color }) => (
              <FontAwesome size={24} name={"bar-chart"} color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name={"achievements"}
          options={{
            title: t("achievements"),
            tabBarIcon: ({ color }) => (
              <FontAwesome size={24} name={"trophy"} color={color} />
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
        <Tabs.Screen
          name={"notifications"}
          options={{
            href: null,
            title: t("notifications"),
          }}
        />
        <Tabs.Screen
          name={"history"}
          options={{
            href: null,
          }}
        />
      </Tabs>
    </>
  );
}
