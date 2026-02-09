/**
 * Application-wide constants for Water Tracker Hydration app.
 * Centralizes magic numbers used across multiple components and stores.
 */

// Glass capacity settings (in ml)
export const MIN_GLASS_CAPACITY = 50;
export const MAX_GLASS_CAPACITY = 475;
export const GLASS_STEP = 25;
export const DEFAULT_GLASS_CAPACITY = 250;

// Daily hydration goal (in ml)
export const DEFAULT_DAILY_GOAL = 2000;

// Safety cap for daily water intake (in ml)
export const MAX_DAILY_WATER = 10000;

// TypeScript type for picker options
export type PickerOption = {
  key: string;
  value: string;
  label: string;
};

// Backup settings
export const AUTO_BACKUP_RETENTION_DAYS = 7;

// Quick Actions settings
export const MAX_QUICK_ACTIONS = 6;
export const MAX_QUICK_ACTION_AMOUNT = 5000;
export const DEFAULT_QUICK_ACTION_AMOUNT = 200;

/**
 * Generates an array of glass capacity options for the picker.
 * Options range from MIN_GLASS_CAPACITY to MAX_GLASS_CAPACITY with GLASS_STEP increments.
 */
export const generateGlassCapacityOptions = (): PickerOption[] => {
  const count = Math.floor((MAX_GLASS_CAPACITY - MIN_GLASS_CAPACITY) / GLASS_STEP) + 1;
  return Array.from({ length: count }, (_, i) => {
    const value = MIN_GLASS_CAPACITY + i * GLASS_STEP;
    return {
      key: `item-${i}`,
      value: `${value}`,
      label: `${value} ml`,
    };
  });
};

/**
 * Pre-computed glass capacity options for use in picker components.
 * This avoids recalculating options on each render.
 */
export const GLASS_CAPACITY_OPTIONS = generateGlassCapacityOptions();
