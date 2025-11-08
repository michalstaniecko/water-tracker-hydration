import { Stack } from "expo-router";
import { useTranslation } from "react-i18next";

export default function SetupLayout() {
  const { t } = useTranslation("setup");

  return (
    <Stack>
      <Stack.Screen
        name="index"
        options={{
          title: t("setup"),
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="general"
        options={{
          title: t("general"),
          headerBackTitle: t("back"),
        }}
      />
      <Stack.Screen
        name="backup"
        options={{
          title: t("backup"),
          headerBackTitle: t("back"),
        }}
      />
    </Stack>
  );
}
