const { withPodfile } = require("expo/config-plugins");
const { mergeContents } = require("@expo/config-plugins/build/utils/generateCode");

/**
 * Raise IPHONEOS_DEPLOYMENT_TARGET of every Pods target (and the Pods project
 * itself) to the app's deployment target when it is lower.
 *
 * Xcode 27 rejects iOS deployment targets below 15.0 as a hard error. Several
 * third-party pods (and the resource-bundle targets CocoaPods generates for
 * them, e.g. RNSVG-RNSVGFilters, RNCAsyncStorage-RNCAsyncStorage_resources,
 * Google-Mobile-ads and GoogleUtilities privacy bundles) still declare 9.0-13.4.
 *
 * The app target is read from Podfile.properties.json, exactly like the
 * `platform :ios` line of the Expo Podfile template. Comparison is numeric
 * (Gem::Version) and only ever raises, so the step is idempotent.
 */
const TAG = "pods-deployment-target-fix";

const FIX_CODE = `
    # Raise Pods deployment targets below the app's (Xcode 27 rejects < 15.0)
    app_deployment_target = Gem::Version.new(podfile_properties['ios.deploymentTarget'] || '15.1')
    raise_deployment_target = lambda do |build_configurations|
      build_configurations.each do |build_config|
        current = build_config.build_settings['IPHONEOS_DEPLOYMENT_TARGET']
        if current.nil? || Gem::Version.new(current.to_s) < app_deployment_target
          build_config.build_settings['IPHONEOS_DEPLOYMENT_TARGET'] = app_deployment_target.to_s
        end
      end
    end
    raise_deployment_target.call(installer.pods_project.build_configurations)
    installer.pods_project.targets.each do |pods_target|
      raise_deployment_target.call(pods_target.build_configurations)
    end`;

function setPodsDeploymentTargetFix(src) {
  return mergeContents({
    tag: TAG,
    src,
    newSrc: FIX_CODE,
    anchor: /post_install do \|installer\|/,
    offset: 1,
    comment: "#",
  }).contents;
}

function withPodsDeploymentTarget(config) {
  return withPodfile(config, (config) => {
    try {
      config.modResults.contents = setPodsDeploymentTargetFix(
        config.modResults.contents,
      );
    } catch (e) {
      console.warn("[withPodsDeploymentTarget] Could not apply fix:", e.message);
    }
    return config;
  });
}

module.exports = withPodsDeploymentTarget;
module.exports.setPodsDeploymentTargetFix = setPodsDeploymentTargetFix;
