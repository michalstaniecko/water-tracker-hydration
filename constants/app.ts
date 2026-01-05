/**
 * Application-wide constants for Water Tracker Hydration app.
 * Centralizes magic numbers used across multiple components and stores.
 */

// Glass capacity settings (in ml)
export const MIN_GLASS_CAPACITY = 50;
export const MAX_GLASS_CAPACITY = 475;
export const GLASS_STEP = 25;

// Daily hydration goal (in ml)
export const DEFAULT_DAILY_GOAL = 2000;

// Backup settings
export const AUTO_BACKUP_RETENTION_DAYS = 7;

/**
 * Generates an array of glass capacity options for the picker.
 * Options range from MIN_GLASS_CAPACITY to MAX_GLASS_CAPACITY with GLASS_STEP increments.
 */
export const generateGlassCapacityOptions = () => {
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
