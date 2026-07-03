import React from "react";
import { act, create } from "react-test-renderer";
import {
  useThemeColors,
  LIGHT_COLORS,
  DARK_COLORS,
} from "../useThemeColors";

jest.mock("nativewind", () => ({
  useColorScheme: jest.fn(),
}));

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const { useColorScheme } = jest.requireMock("nativewind") as any;

function renderHookSync(hookFn: () => ReturnType<typeof useThemeColors>) {
  let result!: ReturnType<typeof useThemeColors>;
  function TestComponent() {
    result = hookFn();
    return null;
  }
  act(() => {
    create(React.createElement(TestComponent));
  });
  return { result };
}

describe("useThemeColors", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("returns LIGHT_COLORS when colorScheme is 'light'", () => {
    useColorScheme.mockReturnValue({ colorScheme: "light" });
    const { result } = renderHookSync(() => useThemeColors());
    expect(result).toEqual(LIGHT_COLORS);
  });

  it("returns DARK_COLORS when colorScheme is 'dark'", () => {
    useColorScheme.mockReturnValue({ colorScheme: "dark" });
    const { result } = renderHookSync(() => useThemeColors());
    expect(result).toEqual(DARK_COLORS);
  });

  it("falls back to LIGHT_COLORS when colorScheme is undefined", () => {
    useColorScheme.mockReturnValue({ colorScheme: undefined });
    const { result } = renderHookSync(() => useThemeColors());
    expect(result).toEqual(LIGHT_COLORS);
  });
});

describe("LIGHT_COLORS / DARK_COLORS constants", () => {
  it("expose the same set of keys", () => {
    expect(Object.keys(LIGHT_COLORS).sort()).toEqual(
      Object.keys(DARK_COLORS).sort(),
    );
  });

  it("are distinct palettes", () => {
    expect(LIGHT_COLORS).not.toEqual(DARK_COLORS);
  });
});
