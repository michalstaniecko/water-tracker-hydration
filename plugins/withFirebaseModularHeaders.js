const { withPodfile } = require("expo/config-plugins");
const { mergeContents } = require("@expo/config-plugins/build/utils/generateCode");

/**
 * Fix non-modular header errors with @react-native-firebase + useFrameworks: "static"
 * Reference: https://github.com/invertase/react-native-firebase/issues/8657
 */
function withFirebaseModularHeaders(config) {
  return withPodfile(config, (config) => {
    const podfileContent = config.modResults.contents;

    // Apply project-wide, not just to RNFB targets
    const fixCode = `
    # @generated begin firebase-modular-headers-fix - expo prebuild (DO NOT MODIFY)
    # Fix for react-native-firebase non-modular header errors with useFrameworks: static
    # Applied project-wide per https://github.com/invertase/react-native-firebase/issues/8657
    installer.pods_project.build_configurations.each do |config|
      config.build_settings['CLANG_ALLOW_NON_MODULAR_INCLUDES_IN_FRAMEWORK_MODULES'] = 'YES'
    end
    # @generated end firebase-modular-headers-fix`;

    try {
      const result = mergeContents({
        tag: "firebase-modular-headers-fix",
        src: podfileContent,
        newSrc: fixCode,
        anchor: /post_install do \|installer\|/,
        offset: 1,
        comment: "#",
      });
      config.modResults.contents = result.contents;
    } catch (e) {
      console.warn('[withFirebaseModularHeaders] Could not apply fix:', e.message);
    }

    return config;
  });
}

module.exports = withFirebaseModularHeaders;
