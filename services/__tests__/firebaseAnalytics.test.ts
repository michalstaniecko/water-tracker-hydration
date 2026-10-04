/**
 * The service keeps module-level consent state, so every test loads a fresh
 * copy of it (and of the mocked Firebase module) via jest.isolateModules.
 */
const analyticsInstance = { name: 'analytics-instance' };

function load() {
  let service!: typeof import('../firebaseAnalytics');
  let firebase!: Record<string, jest.Mock>;
  jest.isolateModules(() => {
    jest.doMock('@react-native-firebase/analytics', () => ({
      getAnalytics: jest.fn(() => analyticsInstance),
      logEvent: jest.fn(),
      logScreenView: jest.fn().mockResolvedValue(undefined),
      setUserProperty: jest.fn().mockResolvedValue(undefined),
      setAnalyticsCollectionEnabled: jest.fn().mockResolvedValue(undefined),
    }));
    firebase = require('@react-native-firebase/analytics');
    service = require('../firebaseAnalytics');
  });
  return { service, firebase };
}

describe('firebaseAnalytics service', () => {
  let errorSpy: jest.SpyInstance;
  let logSpy: jest.SpyInstance;

  beforeEach(() => {
    errorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    logSpy = jest.spyOn(console, 'log').mockImplementation(() => {});
  });

  afterEach(() => {
    errorSpy.mockRestore();
    logSpy.mockRestore();
  });

  describe('initializeFirebaseAnalytics (consent gate)', () => {
    it('enables collection when ads/analytics can be requested', async () => {
      const { service, firebase } = load();
      await service.initializeFirebaseAnalytics(true);
      expect(firebase.setAnalyticsCollectionEnabled).toHaveBeenCalledWith(
        analyticsInstance,
        true,
      );
    });

    it('disables collection when consent is missing', async () => {
      const { service, firebase } = load();
      await service.initializeFirebaseAnalytics(false);
      expect(firebase.setAnalyticsCollectionEnabled).toHaveBeenCalledWith(
        analyticsInstance,
        false,
      );
    });

    it('swallows native errors', async () => {
      const { service, firebase } = load();
      firebase.setAnalyticsCollectionEnabled.mockRejectedValueOnce(new Error('boom'));
      await expect(service.initializeFirebaseAnalytics(true)).resolves.toBeUndefined();
      expect(errorSpy).toHaveBeenCalled();
    });
  });

  describe('without consent', () => {
    it('does not log events, screen views or user properties', async () => {
      const { service, firebase } = load();
      await service.initializeFirebaseAnalytics(false);
      await service.logFirebaseEvent({ category: 'c', action: 'a' });
      await service.logScreenView('Home');
      await service.setUserProperties({ lang: 'en' });
      expect(firebase.logEvent).not.toHaveBeenCalled();
      expect(firebase.logScreenView).not.toHaveBeenCalled();
      expect(firebase.setUserProperty).not.toHaveBeenCalled();
    });
  });

  describe('with consent', () => {
    it('logs an event with category, label, value and primitive metadata only', async () => {
      const { service, firebase } = load();
      await service.initializeFirebaseAnalytics(true);
      await service.logFirebaseEvent({
        category: 'water',
        action: 'add',
        label: 'glass',
        value: 250,
        metadata: { source: 'widget', count: 2, nested: { a: 1 } as never },
      });
      expect(firebase.logEvent).toHaveBeenCalledWith(analyticsInstance, 'add', {
        category: 'water',
        label: 'glass',
        value: 250,
        source: 'widget',
        count: 2,
      });
    });

    it('logs a screen view, defaulting screen_class to the name', async () => {
      const { service, firebase } = load();
      await service.initializeFirebaseAnalytics(true);
      await service.logScreenView('Home');
      await service.logScreenView('Stats', 'StatsScreen');
      expect(firebase.logScreenView).toHaveBeenNthCalledWith(1, analyticsInstance, {
        screen_name: 'Home',
        screen_class: 'Home',
      });
      expect(firebase.logScreenView).toHaveBeenNthCalledWith(2, analyticsInstance, {
        screen_name: 'Stats',
        screen_class: 'StatsScreen',
      });
    });

    it('sets each user property', async () => {
      const { service, firebase } = load();
      await service.initializeFirebaseAnalytics(true);
      await service.setUserProperties({ lang: 'en', theme: null });
      expect(firebase.setUserProperty).toHaveBeenCalledWith(analyticsInstance, 'lang', 'en');
      expect(firebase.setUserProperty).toHaveBeenCalledWith(analyticsInstance, 'theme', null);
    });

    it('swallows native errors when logging', async () => {
      const { service, firebase } = load();
      await service.initializeFirebaseAnalytics(true);
      firebase.logEvent.mockImplementationOnce(() => {
        throw new Error('boom');
      });
      await expect(
        service.logFirebaseEvent({ category: 'c', action: 'a' }),
      ).resolves.toBeUndefined();
      expect(errorSpy).toHaveBeenCalled();
    });
  });

  it('does not throw when getAnalytics() itself throws', async () => {
    const { service, firebase } = load();
    await service.initializeFirebaseAnalytics(true);
    firebase.getAnalytics.mockImplementation(() => {
      throw new Error('no app');
    });
    await expect(service.logFirebaseEvent({ category: 'c', action: 'a' })).resolves.toBeUndefined();
    await expect(service.initializeFirebaseAnalytics(true)).resolves.toBeUndefined();
    expect(errorSpy).toHaveBeenCalled();
  });
});
