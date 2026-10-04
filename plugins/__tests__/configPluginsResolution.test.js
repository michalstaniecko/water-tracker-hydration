const path = require("path");
const semver = require("semver");

/**
 * These packages require "@expo/config-plugins" in their config plugins
 * without declaring it, so they only work while a single copy compatible with
 * expo is hoisted to the project root. Guard against it being un-hoisted.
 */
const PACKAGES = [
  "@react-native-firebase/app",
  "@react-native-firebase/analytics",
  "@react-native-firebase/crashlytics",
  "react-native-google-mobile-ads",
  "@bittingz/expo-widgets",
];

const expoRange =
  require("expo/package.json").dependencies["@expo/config-plugins"];

function resolveFrom(packageName) {
  const packageDir = path.dirname(
    require.resolve(`${packageName}/package.json`),
  );
  const manifest = require.resolve("@expo/config-plugins/package.json", {
    paths: [packageDir],
  });
  return require(manifest).version;
}

describe("@expo/config-plugins resolution for config plugins", () => {
  it("expo declares a range for @expo/config-plugins", () => {
    expect(semver.validRange(expoRange)).not.toBeNull();
  });

  it.each(PACKAGES)(
    "%s resolves a copy that satisfies expo's range",
    (name) => {
      const version = resolveFrom(name);
      expect(semver.satisfies(version, expoRange)).toBe(true);
    },
  );
});
