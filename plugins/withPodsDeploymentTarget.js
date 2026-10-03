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
 * The target is taken from CocoaPods itself: the MINIMUM deployment target of
 * all aggregate (app / extension) targets. Pods are shared by every consumer,
 * so the floor must be what the lowest consumer supports; the maximum would
 * raise pods above the main app target whenever an extension (e.g. the widget
 * extension) declares a higher one. Values that are not plain versions (such
 * as "$(inherited)") are skipped, and settings are only ever raised, so the
 * step is idempotent.
 */
const TAG = "pods-deployment-target-fix";

const FIX_CODE = `
    # Raise Pods deployment targets below the lowest app/extension target (Xcode 27 rejects < 15.0)
    consumer_targets = installer.aggregate_targets.map { |t| t.platform&.deployment_target }.compact
    unless consumer_targets.empty?
      # Pod::Version is not comparable with Gem::Version, so normalise via a string
      app_deployment_target = Gem::Version.new(consumer_targets.min.to_s)
      raise_deployment_target = lambda do |build_configurations|
        build_configurations.each do |build_config|
          current = build_config.build_settings['IPHONEOS_DEPLOYMENT_TARGET']
          next unless current.nil? || Gem::Version.correct?(current.to_s)
          if current.nil? || Gem::Version.new(current.to_s) < app_deployment_target
            build_config.build_settings['IPHONEOS_DEPLOYMENT_TARGET'] = app_deployment_target.to_s
          end
        end
      end
      raise_deployment_target.call(installer.pods_project.build_configurations)
      installer.pods_project.targets.each do |pods_target|
        raise_deployment_target.call(pods_target.build_configurations)
      end
    end`;

function setPodsDeploymentTargetFix(src) {
  try {
    return mergeContents({
      tag: TAG,
      src,
      newSrc: FIX_CODE,
      anchor: /post_install do \|installer\|/,
      offset: 1,
      comment: "#",
    }).contents;
  } catch (e) {
    throw new Error(
      `[withPodsDeploymentTarget] Could not find "post_install do |installer|" in the Podfile ` +
        `(${e.message}). The Pods deployment-target fix was not applied, and Xcode 27 would ` +
        `later fail on Pods targets below iOS 15.0.`,
    );
  }
}

function withPodsDeploymentTarget(config) {
  return withPodfile(config, (config) => {
    config.modResults.contents = setPodsDeploymentTargetFix(
      config.modResults.contents,
    );
    return config;
  });
}

module.exports = withPodsDeploymentTarget;
module.exports.setPodsDeploymentTargetFix = setPodsDeploymentTargetFix;
