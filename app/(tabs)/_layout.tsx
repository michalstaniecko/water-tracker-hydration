import { Tabs } from "expo-router";
import React from "react";
import { getToday } from "@/utils/date";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import { Banner } from "@/components/ads/Banner";
import { useSetupStore } from "@/stores/setup";
import { useTranslation } from "react-i18next";
import { colors } from "@/constants/colors";
import HeaderAchievementBadge from "@/components/HeaderAchievementBadge";
import { useColorScheme } from "nativewind";

export default function TabLayout() {
  const { t } = useTranslation("tabs");
  const { dateFormat } = useSetupStore();
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === "dark";

  return (
    <>
      <Tabs
        screenOptions={{
          tabBarHideOnKeyboard: true,
          tabBarActiveTintColor: isDark ? colors.blue[400] : colors.blue[600],
          tabBarInactiveTintColor: isDark ? colors.gray[400] : colors.gray[500],
          tabBarStyle: {
            backgroundColor: isDark ? colors.gray[950] : colors.white,
            borderTopColor: isDark ? colors.gray[800] : colors.gray[200],
          },
          headerStyle: {
            backgroundColor: isDark ? colors.gray[950] : colors.white,
          },
          headerTintColor: isDark ? colors.gray[100] : colors.gray[900],
          sceneStyle: {
            backgroundColor: isDark ? colors.gray[950] : colors.white,
          },
          animation: "shift",
          headerRight: () => <HeaderAchievementBadge />,
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
          name={"history"}
          options={{
            href: null,
          }}
        />
      </Tabs>
    </>
  );
}
