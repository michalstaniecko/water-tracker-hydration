// Mock AsyncStorage
jest.mock('@react-native-async-storage/async-storage', () =>
  require('@react-native-async-storage/async-storage/jest/async-storage-mock')
);

// Mock expo-localization
jest.mock('expo-localization', () => ({
  getLocales: jest.fn(() => [{ languageCode: 'en' }]),
}));

// Mock Firebase Analytics (modular API)
jest.mock('@react-native-firebase/analytics', () => ({
  getAnalytics: jest.fn(() => ({})),
  logEvent: jest.fn(),
  logScreenView: jest.fn(),
  setUserProperty: jest.fn(),
  setAnalyticsCollectionEnabled: jest.fn(),
}));

// Mock Firebase Crashlytics (modular API)
jest.mock('@react-native-firebase/crashlytics', () => ({
  getCrashlytics: jest.fn(() => ({})),
  recordError: jest.fn(),
  log: jest.fn(),
  setAttribute: jest.fn(),
  setAttributes: jest.fn(),
  setUserId: jest.fn(),
  setCrashlyticsCollectionEnabled: jest.fn(),
}));

// Suppress console warnings during tests
global.console = {
  ...console,
  warn: jest.fn(),
};
