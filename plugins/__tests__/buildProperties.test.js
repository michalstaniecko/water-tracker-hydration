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

  it("relies on React Native's Android SDK defaults, which must stay >= 36", () => {
    expect(plugin[1].android).toBeUndefined();
    const catalog = fs.readFileSync(
      path.join(
        __dirname,
        "../../node_modules/react-native/gradle/libs.versions.toml",
      ),
      "utf8",
    );
    const read = (key) =>
      Number(new RegExp(`^${key}\\s*=\\s*"(\\d+)`, "m").exec(catalog)[1]);
    expect(read("compileSdk")).toBeGreaterThanOrEqual(36);
    expect(read("targetSdk")).toBeGreaterThanOrEqual(36);
  });

  it("opts in to the UIScene lifecycle (required on iOS 27, default from SDK 58)", () => {
    expect(plugin[1].ios.enableSceneSupport).toBe(true);
  });

  it("keeps the iOS build settings intact", () => {
    expect(plugin[1].ios.useFrameworks).toBe("static");
    expect(plugin[1].ios.buildReactNativeFromSource).toBe(true);
  });
});
