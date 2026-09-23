const appJson = require("../../app.json");

/**
 * Pins the Android SDK levels declared for expo-build-properties so an
 * accidental removal cannot silently fall back to RN's version catalog.
 */
describe("expo-build-properties config", () => {
  const plugin = appJson.expo.plugins.find(
    (entry) => Array.isArray(entry) && entry[0] === "expo-build-properties",
  );

  it("is configured as a plugin tuple", () => {
    expect(plugin).toBeDefined();
  });

  it("pins Android compileSdk, targetSdk and build tools to 36", () => {
    expect(plugin[1].android).toEqual({
      compileSdkVersion: 36,
      targetSdkVersion: 36,
      buildToolsVersion: "36.0.0",
    });
  });

  it("keeps the iOS build settings intact", () => {
    expect(plugin[1].ios.useFrameworks).toBe("static");
    expect(plugin[1].ios.buildReactNativeFromSource).toBe(true);
  });
});
