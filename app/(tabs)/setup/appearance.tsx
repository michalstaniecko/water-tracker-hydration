import { View } from "react-native";
import { useTranslation } from "react-i18next";
import { ModalPicker } from "@/components/ui/ModalPicker";
import ErrorBoundary from "@/components/ErrorBoundary";
import { ThemePreference, useThemeStore } from "@/stores/theme";

export default function AppearanceSettings() {
  const { t } = useTranslation("setup");
  const { preference, setPreference } = useThemeStore();

  const handleChangeTheme = (value: string) => {
    setPreference(value as ThemePreference);
  };

  return (
    <ErrorBoundary componentName="Appearance Settings">
      <View className="flex-1 bg-white dark:bg-gray-950 p-5 gap-5">
        <View>
          <ModalPicker
            label={t("theme")}
            options={[
              { label: t("themeAuto"), value: "auto" },
              { label: t("themeLight"), value: "light" },
              { label: t("themeDark"), value: "dark" },
            ]}
            onSelect={handleChangeTheme}
            value={preference}
          />
        </View>
      </View>
    </ErrorBoundary>
  );
}
