import React from "react";
import { act, create } from "react-test-renderer";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useConsentStore } from "@/stores/consent";
import { useWaterInterstitial } from "../useWaterInterstitial";

// All mock state lives inside the jest.mock factory closure — no hoisting issues
jest.mock("react-native-google-mobile-ads", () => {
  const listeners: Record<string, (...args: unknown[]) => void> = {};
  const ad = {
    addAdEventListener: jest.fn(
      (event: string, cb: (...args: unknown[]) => void) => {
        listeners[event] = cb;
        return jest.fn();
      },
    ),
    load: jest.fn(),
    show: jest.fn().mockResolvedValue(undefined),
    _listeners: listeners,
  };
  return {
    InterstitialAd: {
      createForAdRequest: jest.fn().mockReturnValue(ad),
      _ad: ad,
    },
    AdEventType: { LOADED: "loaded", ERROR: "error", CLOSED: "closed" },
    TestIds: { INTERSTITIAL: "test-interstitial-id" },
  };
});

jest.mock("@react-native-async-storage/async-storage", () => ({
  __esModule: true,
  default: {
    getItem: jest.fn().mockResolvedValue(null),
    setItem: jest.fn().mockResolvedValue(undefined),
  },
}));

jest.mock("@/stores/consent", () => ({
  useConsentStore: jest.fn(),
}));

jest.mock("@/utils/errorLogging", () => ({
  logInfo: jest.fn(),
  logError: jest.fn(),
}));

const mockUseConsentStore = useConsentStore as jest.MockedFunction<
  typeof useConsentStore
>;

function consentReady() {
  mockUseConsentStore.mockReturnValue({
    canRequestAds: true,
    isMobileAdsInitialized: true,
  } as ReturnType<typeof useConsentStore>);
}

function consentBlocked() {
  mockUseConsentStore.mockReturnValue({
    canRequestAds: false,
    isMobileAdsInitialized: false,
  } as ReturnType<typeof useConsentStore>);
}

// Helper: render the hook in a minimal component and return its result
function renderHookSync(hookFn: () => ReturnType<typeof useWaterInterstitial>) {
  let result!: ReturnType<typeof useWaterInterstitial>;
  function TestComponent() {
    result = hookFn();
    return null;
  }
  act(() => {
    create(React.createElement(TestComponent));
  });
  return { result };
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const { InterstitialAd } = jest.requireMock(
  "react-native-google-mobile-ads",
) as any;
const mockAd = InterstitialAd._ad;

beforeEach(() => {
  jest.clearAllMocks();
  // Restore default AsyncStorage behavior
  (AsyncStorage.getItem as jest.Mock).mockResolvedValue(null);
  (AsyncStorage.setItem as jest.Mock).mockResolvedValue(undefined);
  mockAd.show.mockResolvedValue(undefined);
});

describe("useWaterInterstitial — consent gate", () => {
  it("does not create the ad when consent is blocked", () => {
    consentBlocked();
    renderHookSync(() => useWaterInterstitial());
    expect(InterstitialAd.createForAdRequest).not.toHaveBeenCalled();
  });

  it("creates and loads the ad when consent is ready", () => {
    consentReady();
    renderHookSync(() => useWaterInterstitial());
    expect(InterstitialAd.createForAdRequest).toHaveBeenCalledTimes(1);
    expect(mockAd.load).toHaveBeenCalledTimes(1);
  });

  it("uses TestIds.INTERSTITIAL in __DEV__ mode", () => {
    consentReady();
    renderHookSync(() => useWaterInterstitial());
    expect(InterstitialAd.createForAdRequest).toHaveBeenCalledWith(
      "test-interstitial-id",
      expect.any(Object),
    );
  });
});

describe("useWaterInterstitial — trackWaterAdd counter", () => {
  it("saves the updated count to AsyncStorage on each call", async () => {
    consentBlocked();
    const { result } = renderHookSync(() => useWaterInterstitial());
    await act(async () => {
      await result.trackWaterAdd();
      await result.trackWaterAdd();
      await result.trackWaterAdd();
    });
    expect(AsyncStorage.setItem).toHaveBeenCalledTimes(3);
    expect(AsyncStorage.setItem).toHaveBeenLastCalledWith("waterAddCount", "3");
  });

  it("does not show the ad on the 1st through 4th add", async () => {
    consentReady();
    const { result } = renderHookSync(() => useWaterInterstitial());
    // Simulate ad loaded
    act(() => {
      mockAd._listeners["loaded"]();
    });

    await act(async () => {
      await result.trackWaterAdd();
      await result.trackWaterAdd();
      await result.trackWaterAdd();
      await result.trackWaterAdd();
    });

    expect(mockAd.show).not.toHaveBeenCalled();
  });

  it("shows the ad on the 5th add after the countdown delay", async () => {
    jest.useFakeTimers();
    consentReady();
    const { result } = renderHookSync(() => useWaterInterstitial());
    act(() => {
      mockAd._listeners["loaded"]();
    });

    await act(async () => {
      for (let i = 0; i < 5; i++) {
        await result.trackWaterAdd();
      }
    });

    // Advance past the 5-second countdown
    act(() => {
      jest.advanceTimersByTime(5000);
    });

    expect(mockAd.show).toHaveBeenCalledTimes(1);
    jest.useRealTimers();
  });

  it("shows the ad again on the 10th add (continuing counter)", async () => {
    jest.useFakeTimers();
    consentReady();
    const { result } = renderHookSync(() => useWaterInterstitial());
    act(() => {
      mockAd._listeners["loaded"]();
    });

    await act(async () => {
      for (let i = 0; i < 5; i++) {
        await result.trackWaterAdd();
      }
    });
    act(() => {
      jest.advanceTimersByTime(5000);
    });
    expect(mockAd.show).toHaveBeenCalledTimes(1);

    // Simulate preload completing for the next ad
    act(() => {
      mockAd._listeners["loaded"]();
    });

    await act(async () => {
      for (let i = 0; i < 5; i++) {
        await result.trackWaterAdd();
      }
    });
    act(() => {
      jest.advanceTimersByTime(5000);
    });
    expect(mockAd.show).toHaveBeenCalledTimes(2);
    jest.useRealTimers();
  });

  it("does not show the ad when not loaded even on the 5th add", async () => {
    consentReady();
    const { result } = renderHookSync(() => useWaterInterstitial());
    // Do NOT trigger the LOADED listener

    await act(async () => {
      for (let i = 0; i < 5; i++) {
        await result.trackWaterAdd();
      }
    });

    expect(mockAd.show).not.toHaveBeenCalled();
  });
});

describe("useWaterInterstitial — persistent counter", () => {
  it("loads existing count from AsyncStorage on mount", async () => {
    consentBlocked();
    (AsyncStorage.getItem as jest.Mock).mockResolvedValue("7");

    const { result } = renderHookSync(() => useWaterInterstitial());
    // Wait for the async getItem effect to settle
    await act(async () => {
      await Promise.resolve();
    });

    // After adding 3 more (7+3=10), the count should be "10"
    await act(async () => {
      await result.trackWaterAdd();
      await result.trackWaterAdd();
      await result.trackWaterAdd();
    });

    expect(AsyncStorage.setItem).toHaveBeenLastCalledWith("waterAddCount", "10");
  });

  it("preloads the next ad after it is closed", () => {
    consentReady();
    renderHookSync(() => useWaterInterstitial());

    const loadCallsBefore = (mockAd.load as jest.Mock).mock.calls.length;
    act(() => {
      mockAd._listeners["closed"]();
    });

    expect(mockAd.load).toHaveBeenCalledTimes(loadCallsBefore + 1);
  });
});
