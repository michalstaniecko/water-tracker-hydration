jest.mock("expo/config-plugins", () => ({
  withPodfile: jest.fn((config, callback) => callback(config)),
}));

const withPodsDeploymentTarget = require("../withPodsDeploymentTarget");
const { setPodsDeploymentTargetFix } = withPodsDeploymentTarget;

const PODFILE = `target 'App' do
  post_install do |installer|
    react_native_post_install(installer)
  end
end
`;

describe("withPodsDeploymentTarget", () => {
  it("inserts the fix at the start of post_install", () => {
    const out = setPodsDeploymentTargetFix(PODFILE);
    expect(out).toContain("IPHONEOS_DEPLOYMENT_TARGET");
    expect(out).toContain("installer.pods_project.targets.each");
    expect(out.indexOf("pods-deployment-target-fix")).toBeLessThan(
      out.indexOf("react_native_post_install"),
    );
  });

  it("is idempotent", () => {
    const once = setPodsDeploymentTargetFix(PODFILE);
    expect(setPodsDeploymentTargetFix(once)).toBe(once);
  });

  it("works as a Podfile mod", () => {
    const config = { modResults: { contents: PODFILE } };
    const result = withPodsDeploymentTarget(config);
    expect(result.modResults.contents).toContain("raise_deployment_target");
  });

  it("only raises targets, comparing versions numerically", () => {
    expect(setPodsDeploymentTargetFix(PODFILE)).toContain(
      "Gem::Version.new(current.to_s) < app_deployment_target",
    );
  });
});
