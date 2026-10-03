/**
 * The service keeps module-level consent state, so every test loads a fresh
 * copy of it (and of the mocked Firebase module) via jest.isolateModules.
 */
const crashlyticsInstance = { name: 'crashlytics-instance' };

function load() {
  let service!: typeof import('../crashlytics');
  let firebase!: Record<string, jest.Mock>;
  jest.isolateModules(() => {
    jest.doMock('@react-native-firebase/crashlytics', () => ({
      getCrashlytics: jest.fn(() => crashlyticsInstance),
      recordError: jest.fn(),
      log: jest.fn(),
      setAttribute: jest.fn().mockResolvedValue(null),
      setAttributes: jest.fn().mockResolvedValue(null),
      setUserId: jest.fn().mockResolvedValue(null),
      setCrashlyticsCollectionEnabled: jest.fn().mockResolvedValue(null),
    }));
    firebase = require('@react-native-firebase/crashlytics');
    service = require('../crashlytics');
  });
  return { service, firebase };
}

describe('crashlytics service', () => {
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

  it('forwards the consent flag to setCrashlyticsCollectionEnabled', async () => {
    const { service, firebase } = load();
    await service.initializeCrashlytics(true);
    expect(firebase.setCrashlyticsCollectionEnabled).toHaveBeenCalledWith(
      crashlyticsInstance,
      true,
    );
  });

  it('swallows native errors during initialisation', async () => {
    const { service, firebase } = load();
    firebase.setCrashlyticsCollectionEnabled.mockRejectedValueOnce(new Error('boom'));
    await expect(service.initializeCrashlytics(true)).resolves.toBeUndefined();
    expect(errorSpy).toHaveBeenCalled();
  });

  it('does nothing while collection is disabled', async () => {
    const { service, firebase } = load();
    await service.initializeCrashlytics(false);
    service.recordError(new Error('x'), { a: 'b' });
    service.logMessage('hello');
    service.setAttribute('k', 'v');
    service.setAttributes({ k: 'v' });
    service.setUserId('u');
    expect(firebase.recordError).not.toHaveBeenCalled();
    expect(firebase.log).not.toHaveBeenCalled();
    expect(firebase.setAttribute).not.toHaveBeenCalled();
    expect(firebase.setAttributes).not.toHaveBeenCalled();
    expect(firebase.setUserId).not.toHaveBeenCalled();
  });

  describe('when enabled', () => {
    it('records an error and sets each context entry as an attribute', async () => {
      const { service, firebase } = load();
      await service.initializeCrashlytics(true);
      const error = new Error('x');
      service.recordError(error, { screen: 'home', action: 'add' });
      expect(firebase.setAttribute).toHaveBeenCalledWith(crashlyticsInstance, 'screen', 'home');
      expect(firebase.setAttribute).toHaveBeenCalledWith(crashlyticsInstance, 'action', 'add');
      expect(firebase.recordError).toHaveBeenCalledWith(crashlyticsInstance, error);
    });

    it('records an error without context', async () => {
      const { service, firebase } = load();
      await service.initializeCrashlytics(true);
      service.recordError(new Error('x'));
      expect(firebase.setAttribute).not.toHaveBeenCalled();
      expect(firebase.recordError).toHaveBeenCalledTimes(1);
    });

    it('logs messages, attributes and user id', async () => {
      const { service, firebase } = load();
      await service.initializeCrashlytics(true);
      service.logMessage('hello');
      service.setAttribute('k', 'v');
      service.setAttributes({ a: '1' });
      service.setUserId('u');
      expect(firebase.log).toHaveBeenCalledWith(crashlyticsInstance, 'hello');
      expect(firebase.setAttribute).toHaveBeenCalledWith(crashlyticsInstance, 'k', 'v');
      expect(firebase.setAttributes).toHaveBeenCalledWith(crashlyticsInstance, { a: '1' });
      expect(firebase.setUserId).toHaveBeenCalledWith(crashlyticsInstance, 'u');
    });

    it('does not throw when the native call throws synchronously', async () => {
      const { service, firebase } = load();
      await service.initializeCrashlytics(true);
      firebase.recordError.mockImplementationOnce(() => {
        throw new Error('native');
      });
      expect(() => service.recordError(new Error('x'))).not.toThrow();
      expect(errorSpy).toHaveBeenCalled();
    });
  });
});
