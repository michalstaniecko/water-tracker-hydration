import React from "react";
import { View, Text, Alert } from "react-native";
import { useBackupStore } from "@/stores/backup";
import { useTranslation } from "react-i18next";
import Button from "@/components/ui/Button";
import LoadingOverlay from "@/components/ui/LoadingOverlay";
import { useWaterStore } from "@/stores/water";
import { useSetupStore } from "@/stores/setup";
import { useGamificationStore } from "@/stores/gamification";

export default function BackupSection() {
  const { t } = useTranslation("setup");
  const backupStore = useBackupStore();
  const waterStore = useWaterStore();
  const setupStore = useSetupStore();
  const gamificationStore = useGamificationStore();

  const handleExportJSON = async () => {
    const success = await backupStore.exportDataAsJSON();

    if (success) {
      Alert.alert(t("exportSuccess"));
    } else {
      Alert.alert(t("exportError"));
    }
  };

  const handleExportCSV = async () => {
    const success = await backupStore.exportDataAsCSV();

    if (success) {
      Alert.alert(t("exportSuccess"));
    } else {
      Alert.alert(t("exportError"));
    }
  };

  const handleImportJSON = async () => {
    const success = await backupStore.importDataFromJSON();

    if (success) {
      // Reload all stores
      await waterStore.fetchOrInitData();
      await setupStore.fetchOrInitData();
      await gamificationStore.fetchOrInitData();

      Alert.alert(t("importSuccess"));
    } else {
      Alert.alert(t("importError"));
    }
  };

  const handleImportCSV = async () => {
    const success = await backupStore.importDataFromCSV();

    if (success) {
      // Reload water store
      await waterStore.fetchOrInitData();

      Alert.alert(t("importSuccess"));
    } else {
      Alert.alert(t("importError"));
    }
  };

  return (
    <>
      <View className="gap-4 pt-4 border-t border-gray-200 dark:border-gray-700">
        <View className="gap-2">
          <Text className="text-lg font-semibold text-gray-900 dark:text-white">
            {t("backupAndSync")}
          </Text>
          <Text className="text-sm text-gray-600 dark:text-gray-400">
            {t("backupDescription")}
          </Text>
        </View>

        <View className="gap-3">
          <Button
            text={t("exportDataJSON")}
            onPress={handleExportJSON}
            disabled={backupStore.isLoading}
          />
          <Button
            text={t("exportDataCSV")}
            onPress={handleExportCSV}
            disabled={backupStore.isLoading}
          />
          <Button
            text={t("importDataJSON")}
            onPress={handleImportJSON}
            disabled={backupStore.isLoading}
          />
          <Button
            text={t("importDataCSV")}
            onPress={handleImportCSV}
            disabled={backupStore.isLoading}
          />
        </View>
      </View>
      <LoadingOverlay
        visible={backupStore.isLoading}
        message={t("processingBackup")}
        testID="backup-loading-overlay"
      />
    </>
  );
}
