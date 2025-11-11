// Mock AsyncStorage
jest.mock('@react-native-async-storage/async-storage', () =>
  require('@react-native-async-storage/async-storage/jest/async-storage-mock')
);

// Mock expo-localization
jest.mock('expo-localization', () => ({
  getLocales: jest.fn(() => [{ languageCode: 'en' }]),
}));

// Suppress console warnings during tests
global.console = {
  ...console,
  warn: jest.fn(),
};
