// https://docs.expo.dev/guides/using-eslint/
const { defineConfig } = require("eslint/config");
const expoConfig = require("eslint-config-expo/flat");
const prettierConfig = require("eslint-config-prettier/flat");
const prettierPlugin = require("eslint-plugin-prettier");
const globals = require("globals");

module.exports = defineConfig([
  {
    // `.expo` and `coverage` are generated; the legacy config skipped dot-folders by default.
    ignores: ["dist/*", ".expo/*", "coverage/*"],
  },
  expoConfig,
  prettierConfig,
  {
    plugins: { prettier: prettierPlugin },
    rules: {
      "prettier/prettier": "warn",
      // Newly enabled by the flat preset (import/recommended); `ErrorBoundary` is deliberately exported both ways.
      "import/no-named-as-default": "off",
      // Newly enabled by the flat preset; flags the canonical `i18n.use(...)` i18next setup.
      "import/no-named-as-default-member": "off",
      // New in react-hooks 7: flags the prop-to-state sync effects in Input/Picker/LoadingOverlay, which are intentional.
      "react-hooks/set-state-in-effect": "off",
    },
  },
  {
    // Plain-JS tooling that runs in Node: config files and Expo config plugins.
    files: ["*.config.js", "jest.setup.js", "plugins/**/*.js"],
    languageOptions: { globals: globals.node },
  },
  {
    // Plain-JS Jest files (TypeScript files have `no-undef` off).
    files: ["jest.setup.js", "**/__tests__/**/*.js", "**/*.{test,spec}.js"],
    languageOptions: { globals: globals.jest },
  },
]);
