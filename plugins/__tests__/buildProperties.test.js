const fs = require("fs");
const path = require("path");
const appJson = require("../../app.json");

/**
 * Guards the expo-build-properties config. The Android SDK pin from #102 was
 * dropped in #107 because React Native's own version catalog is now the source
 * of truth (36/36/36.0.0); the catalog test keeps that assumption honest.
 */
describe("expo-build-properties config", () => {
  const plugin = appJson.expo.plugins.find(
    (entry) => Array.isArray(entry) && entry[0] === "expo-build-properties",
  );

  it("is configured as a plugin tuple", () => {
    expect(plugin).toBeDefined();
  });

  it("relies on React Native's Android SDK defaults (36/36/36.0.0)", () => {
    const android = plugin[1].android ?? {};
    expect(android.compileSdkVersion).toBeUndefined();
    expect(android.targetSdkVersion).toBeUndefined();
    expect(android.buildToolsVersion).toBeUndefined();
    const catalog = fs.readFileSync(
      path.join(
        path.dirname(require.resolve("react-native/package.json")),
        "gradle/libs.versions.toml",
      ),
      "utf8",
    );
    const read = (key) =>
      new RegExp(`^${key}\\s*=\\s*"([^"]+)"`, "m").exec(catalog)[1];
    // Exact values on purpose: an SDK bump that moves them should fail here
    // and be reviewed (Play target API requirement, widget code).
    expect(read("compileSdk")).toBe("36");
    expect(read("targetSdk")).toBe("36");
    expect(read("buildTools")).toBe("36.0.0");
  });

  it("opts in to the UIScene lifecycle (required on iOS 27, default from SDK 58)", () => {
    expect(plugin[1].ios.enableSceneSupport).toBe(true);
  });

  it("keeps the iOS build settings intact", () => {
    expect(plugin[1].ios.useFrameworks).toBe("static");
    expect(plugin[1].ios.buildReactNativeFromSource).toBe(true);
  });
});
