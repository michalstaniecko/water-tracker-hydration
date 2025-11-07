import { create } from "zustand";
import * as FileSystem from "expo-file-system";
import * as Sharing from "expo-sharing";
import * as DocumentPicker from "expo-document-picker";
import { Platform } from "react-native";
import {
  createBackup,
  restoreBackup,
  exportToJSON,
  exportToCSV,
  importFromJSON,
  importFromCSV,
  createAutoBackup,
  getAutoBackups,
  restoreAutoBackup,
  BackupData,
} from "@/utils/backup";
import { logError } from "@/utils/errorLogging";

type BackupStore = {
  isLoading: boolean;
  lastBackupDate: string | null;
  autoBackups: string[];
  
  // Export operations
  exportDataAsJSON: () => Promise<boolean>;
  exportDataAsCSV: () => Promise<boolean>;
  
  // Import operations
  importDataFromJSON: () => Promise<boolean>;
  importDataFromCSV: () => Promise<boolean>;
  
  // Auto backup operations
  createAutomaticBackup: () => Promise<boolean>;
  loadAutoBackups: () => Promise<void>;
  restoreFromAutoBackup: (backupKey: string) => Promise<boolean>;
  
  // Manual backup/restore
  createManualBackup: () => Promise<BackupData | null>;
  restoreFromBackup: (backup: BackupData) => Promise<boolean>;
};

export const useBackupStore = create<BackupStore>((set, get) => ({
  isLoading: false,
  lastBackupDate: null,
  autoBackups: [],

  exportDataAsJSON: async () => {
    set({ isLoading: true });
    try {
      const jsonContent = await exportToJSON();
      if (!jsonContent) {
        set({ isLoading: false });
        return false;
      }

      // Create a file and share it
      const fileName = `hydration_backup_${new Date().toISOString().split("T")[0]}.json`;
      const fileUri = `${FileSystem.documentDirectory}${fileName}`;

      await FileSystem.writeAsStringAsync(fileUri, jsonContent);

      // Share the file
      const canShare = await Sharing.isAvailableAsync();
      if (canShare) {
        await Sharing.shareAsync(fileUri, {
          mimeType: "application/json",
          dialogTitle: "Export Backup",
          UTI: "public.json",
        });
      }

      set({ isLoading: false, lastBackupDate: new Date().toISOString() });
      return true;
    } catch (error) {
      logError(error, {
        operation: "exportDataAsJSON",
        component: "BackupStore",
      });
      set({ isLoading: false });
      return false;
    }
  },

  exportDataAsCSV: async () => {
    set({ isLoading: true });
    try {
      const csvContent = await exportToCSV();
      if (!csvContent) {
        set({ isLoading: false });
        return false;
      }

      // Create a file and share it
      const fileName = `hydration_data_${new Date().toISOString().split("T")[0]}.csv`;
      const fileUri = `${FileSystem.documentDirectory}${fileName}`;

      await FileSystem.writeAsStringAsync(fileUri, csvContent);

      // Share the file
      const canShare = await Sharing.isAvailableAsync();
      if (canShare) {
        await Sharing.shareAsync(fileUri, {
          mimeType: "text/csv",
          dialogTitle: "Export Data as CSV",
          UTI: "public.comma-separated-values-text",
        });
      }

      set({ isLoading: false });
      return true;
    } catch (error) {
      logError(error, {
        operation: "exportDataAsCSV",
        component: "BackupStore",
      });
      set({ isLoading: false });
      return false;
    }
  },

  importDataFromJSON: async () => {
    set({ isLoading: true });
    try {
      // Pick a document
      const result = await DocumentPicker.getDocumentAsync({
        type: "application/json",
        copyToCacheDirectory: true,
      });

      if (result.canceled) {
        set({ isLoading: false });
        return false;
      }

      // Read the file
      const fileContent = await FileSystem.readAsStringAsync(result.assets[0].uri);

      // Import the data
      const success = await importFromJSON(fileContent);

      set({ isLoading: false });
      return success;
    } catch (error) {
      logError(error, {
        operation: "importDataFromJSON",
        component: "BackupStore",
      });
      set({ isLoading: false });
      return false;
    }
  },

  importDataFromCSV: async () => {
    set({ isLoading: true });
    try {
      // Pick a document
      const result = await DocumentPicker.getDocumentAsync({
        type: "text/csv",
        copyToCacheDirectory: true,
      });

      if (result.canceled) {
        set({ isLoading: false });
        return false;
      }

      // Read the file
      const fileContent = await FileSystem.readAsStringAsync(result.assets[0].uri);

      // Import the data
      const success = await importFromCSV(fileContent);

      set({ isLoading: false });
      return success;
    } catch (error) {
      logError(error, {
        operation: "importDataFromCSV",
        component: "BackupStore",
      });
      set({ isLoading: false });
      return false;
    }
  },

  createAutomaticBackup: async () => {
    try {
      const success = await createAutoBackup();
      if (success) {
        set({ lastBackupDate: new Date().toISOString() });
        await get().loadAutoBackups();
      }
      return success;
    } catch (error) {
      logError(error, {
        operation: "createAutomaticBackup",
        component: "BackupStore",
      });
      return false;
    }
  },

  loadAutoBackups: async () => {
    try {
      const backups = await getAutoBackups();
      set({ autoBackups: backups });
    } catch (error) {
      logError(error, {
        operation: "loadAutoBackups",
        component: "BackupStore",
      });
    }
  },

  restoreFromAutoBackup: async (backupKey: string) => {
    set({ isLoading: true });
    try {
      const success = await restoreAutoBackup(backupKey);
      set({ isLoading: false });
      return success;
    } catch (error) {
      logError(error, {
        operation: "restoreFromAutoBackup",
        component: "BackupStore",
      });
      set({ isLoading: false });
      return false;
    }
  },

  createManualBackup: async () => {
    set({ isLoading: true });
    try {
      const backup = await createBackup();
      set({ isLoading: false, lastBackupDate: new Date().toISOString() });
      return backup;
    } catch (error) {
      logError(error, {
        operation: "createManualBackup",
        component: "BackupStore",
      });
      set({ isLoading: false });
      return null;
    }
  },

  restoreFromBackup: async (backup: BackupData) => {
    set({ isLoading: true });
    try {
      const success = await restoreBackup(backup);
      set({ isLoading: false });
      return success;
    } catch (error) {
      logError(error, {
        operation: "restoreFromBackup",
        component: "BackupStore",
      });
      set({ isLoading: false });
      return false;
    }
  },
}));
