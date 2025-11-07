import AsyncStorage from "@react-native-async-storage/async-storage";
import { logError, logWarning } from "./errorLogging";
import { sanitizeNonNegativeNumber } from "./validation";
import { HistoryRows } from "@/stores/water";

export type BackupData = {
  waterData: HistoryRows;
  setupData: any;
  gamificationData: any;
  onboardingData: any;
  statisticsData?: any;
  exportDate: string;
  version: string;
};

const BACKUP_VERSION = "1.0.0";

/**
 * Creates a complete backup of all app data
 */
export async function createBackup(): Promise<BackupData | null> {
  try {
    const waterData = await AsyncStorage.getItem("waterData");
    const setupData = await AsyncStorage.getItem("setupData");
    const gamificationData = await AsyncStorage.getItem("gamificationData");
    const onboardingData = await AsyncStorage.getItem("onboardingData");

    const backup: BackupData = {
      waterData: waterData ? JSON.parse(waterData) : null,
      setupData: setupData ? JSON.parse(setupData) : null,
      gamificationData: gamificationData ? JSON.parse(gamificationData) : null,
      onboardingData: onboardingData ? JSON.parse(onboardingData) : null,
      exportDate: new Date().toISOString(),
      version: BACKUP_VERSION,
    };

    return backup;
  } catch (error) {
    logError(error, {
      operation: "createBackup",
      component: "BackupUtility",
    });
    return null;
  }
}

/**
 * Restores app data from a backup
 */
export async function restoreBackup(backup: BackupData): Promise<boolean> {
  try {
    // Validate backup data
    if (!backup || !backup.version) {
      logWarning("Invalid backup data structure", {
        operation: "restoreBackup",
        component: "BackupUtility",
      });
      return false;
    }

    // Restore each data store
    if (backup.waterData) {
      await AsyncStorage.setItem("waterData", JSON.stringify(backup.waterData));
    }
    if (backup.setupData) {
      await AsyncStorage.setItem("setupData", JSON.stringify(backup.setupData));
    }
    if (backup.gamificationData) {
      await AsyncStorage.setItem(
        "gamificationData",
        JSON.stringify(backup.gamificationData)
      );
    }
    if (backup.onboardingData) {
      await AsyncStorage.setItem(
        "onboardingData",
        JSON.stringify(backup.onboardingData)
      );
    }

    return true;
  } catch (error) {
    logError(error, {
      operation: "restoreBackup",
      component: "BackupUtility",
    });
    return false;
  }
}

/**
 * Exports data to JSON format
 */
export async function exportToJSON(): Promise<string | null> {
  try {
    const backup = await createBackup();
    if (!backup) return null;

    return JSON.stringify(backup, null, 2);
  } catch (error) {
    logError(error, {
      operation: "exportToJSON",
      component: "BackupUtility",
    });
    return null;
  }
}

/**
 * Converts water history data to CSV format
 */
export function waterHistoryToCSV(waterData: HistoryRows): string {
  if (!waterData || typeof waterData !== "object") {
    return "Date,Water (ml)\n";
  }

  const headers = "Date,Water (ml)\n";
  const rows = Object.entries(waterData)
    .map(([date, data]) => {
      const amount = data?.water || "0";
      return `${date},${amount}`;
    })
    .join("\n");

  return headers + rows;
}

/**
 * Exports water history to CSV format
 */
export async function exportToCSV(): Promise<string | null> {
  try {
    const waterData = await AsyncStorage.getItem("waterData");
    if (!waterData) {
      return "Date,Water (ml)\n";
    }

    const parsed = JSON.parse(waterData);
    return waterHistoryToCSV(parsed);
  } catch (error) {
    logError(error, {
      operation: "exportToCSV",
      component: "BackupUtility",
    });
    return null;
  }
}

/**
 * Parses CSV data and returns water history object
 */
export function parseCSVToWaterHistory(csvContent: string): HistoryRows {
  try {
    const lines = csvContent.trim().split("\n");
    if (lines.length < 2) {
      return {};
    }

    // Skip header row
    const dataLines = lines.slice(1);
    const waterHistory: HistoryRows = {};

    dataLines.forEach((line) => {
      const [date, amount] = line.split(",").map((s) => s.trim());
      if (date && amount) {
        // Validate date format (YYYY-MM-DD)
        if (/^\d{4}-\d{2}-\d{2}$/.test(date)) {
          // Sanitize the amount to ensure it's a valid non-negative number
          const sanitizedAmount = sanitizeNonNegativeNumber(amount);
          waterHistory[date] = {
            water: sanitizedAmount,
          };
        }
      }
    });

    return waterHistory;
  } catch (error) {
    logError(error, {
      operation: "parseCSVToWaterHistory",
      component: "BackupUtility",
    });
    return {};
  }
}

/**
 * Imports data from JSON format
 */
export async function importFromJSON(jsonContent: string): Promise<boolean> {
  try {
    const backup: BackupData = JSON.parse(jsonContent);
    return await restoreBackup(backup);
  } catch (error) {
    logError(error, {
      operation: "importFromJSON",
      component: "BackupUtility",
    });
    return false;
  }
}

/**
 * Imports water history from CSV format
 */
export async function importFromCSV(csvContent: string): Promise<boolean> {
  try {
    const waterHistory = parseCSVToWaterHistory(csvContent);
    if (!waterHistory || Object.keys(waterHistory).length === 0) {
      logWarning("No valid data found in CSV", {
        operation: "importFromCSV",
        component: "BackupUtility",
      });
      return false;
    }

    // Merge with existing data
    const existingData = await AsyncStorage.getItem("waterData");
    const existing = existingData ? JSON.parse(existingData) : {};
    const merged = { ...existing, ...waterHistory };

    await AsyncStorage.setItem("waterData", JSON.stringify(merged));
    return true;
  } catch (error) {
    logError(error, {
      operation: "importFromCSV",
      component: "BackupUtility",
    });
    return false;
  }
}

/**
 * Creates an automatic backup and stores it locally
 */
export async function createAutoBackup(): Promise<boolean> {
  try {
    const backup = await createBackup();
    if (!backup) return false;

    const backupKey = `autoBackup_${new Date().toISOString().split("T")[0]}`;
    await AsyncStorage.setItem(backupKey, JSON.stringify(backup));

    // Keep only last 7 auto backups
    await cleanOldAutoBackups();

    return true;
  } catch (error) {
    logError(error, {
      operation: "createAutoBackup",
      component: "BackupUtility",
    });
    return false;
  }
}

/**
 * Removes old automatic backups, keeping only the last 7
 */
async function cleanOldAutoBackups(): Promise<void> {
  try {
    const allKeys = await AsyncStorage.getAllKeys();
    const backupKeys = allKeys
      .filter((key) => key.startsWith("autoBackup_"))
      .sort()
      .reverse();

    // Remove all but the last 7 backups
    if (backupKeys.length > 7) {
      const keysToRemove = backupKeys.slice(7);
      await AsyncStorage.multiRemove(keysToRemove);
    }
  } catch (error) {
    logError(error, {
      operation: "cleanOldAutoBackups",
      component: "BackupUtility",
    });
  }
}

/**
 * Gets list of available automatic backups
 */
export async function getAutoBackups(): Promise<string[]> {
  try {
    const allKeys = await AsyncStorage.getAllKeys();
    return allKeys
      .filter((key) => key.startsWith("autoBackup_"))
      .sort()
      .reverse();
  } catch (error) {
    logError(error, {
      operation: "getAutoBackups",
      component: "BackupUtility",
    });
    return [];
  }
}

/**
 * Restores from a specific automatic backup
 */
export async function restoreAutoBackup(backupKey: string): Promise<boolean> {
  try {
    const backupData = await AsyncStorage.getItem(backupKey);
    if (!backupData) return false;

    const backup: BackupData = JSON.parse(backupData);
    return await restoreBackup(backup);
  } catch (error) {
    logError(error, {
      operation: "restoreAutoBackup",
      component: "BackupUtility",
    });
    return false;
  }
}
