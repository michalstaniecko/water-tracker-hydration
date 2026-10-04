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

  describe("generated Ruby behaviour", () => {
    const { spawnSync } = require("child_process");
    const hasRuby = spawnSync("ruby", ["-v"]).status === 0;
    const run = hasRuby ? it : it.skip;

    // Runs the generated post_install snippet against fake installer objects.
    const execute = (aggregateTargets, podSettings) => {
      const out = setPodsDeploymentTargetFix(PODFILE);
      const start = out.indexOf("# @generated begin");
      const end = out.indexOf("# @generated end");
      const body = out.slice(start, end);
      const script = `
        require 'json'
        require 'rubygems'
        # Stand-in for Pod::Version, which is NOT comparable with Gem::Version
        class PodVersion
          include Comparable
          def initialize(v); @v = v; end
          def to_s; @v; end
          def <=>(other)
            raise ArgumentError, 'not comparable' unless other.is_a?(PodVersion)
            Gem::Version.new(@v) <=> Gem::Version.new(other.to_s)
          end
        end
        Cfg = Struct.new(:build_settings)
        Plat = Struct.new(:deployment_target)
        Agg = Struct.new(:platform)
        Tgt = Struct.new(:build_configurations)
        Proj = Struct.new(:build_configurations, :targets)
        Inst = Struct.new(:aggregate_targets, :pods_project)
        cfgs = JSON.parse(${JSON.stringify(JSON.stringify(podSettings))}).map { |v| Cfg.new(v.nil? ? {} : { 'IPHONEOS_DEPLOYMENT_TARGET' => v }) }
        aggs = JSON.parse(${JSON.stringify(JSON.stringify(aggregateTargets))}).map { |v| Agg.new(Plat.new(PodVersion.new(v))) }
        installer = Inst.new(aggs, Proj.new([Cfg.new({})], cfgs.map { |c| Tgt.new([c]) }))
        ${body}
        puts cfgs.map { |c| c.build_settings['IPHONEOS_DEPLOYMENT_TARGET'].inspect }.join(',')
      `;
      const r = spawnSync("ruby", ["-e", script], { encoding: "utf8" });
      if (r.status !== 0) throw new Error(r.stderr);
      return r.stdout.trim();
    };

    run("raises only below-target values, compares numerically, skips non-versions", () => {
      expect(
        execute(["15.1"], ["9.0", "13.4", "15.1", "16.2", "9.10", '$(inherited)', null]),
      ).toBe('"15.1","15.1","15.1","16.2","15.1","$(inherited)","15.1"');
    });

    run("uses the minimum of several aggregate targets (never raises above the lowest consumer)", () => {
      expect(execute(["16.2", "15.1"], ["12.0", "15.5"])).toBe('"15.1","15.5"');
    });

    run("does nothing without aggregate targets", () => {
      expect(execute([], ["12.0"])).toBe('"12.0"');
    });
  });

  it("throws a descriptive error when the post_install anchor is missing", () => {
    expect(() => setPodsDeploymentTargetFix("target 'App' do\nend\n")).toThrow(
      /Could not find "post_install do \|installer\|"/,
    );
    expect(() =>
      withPodsDeploymentTarget({ modResults: { contents: "target 'App' do\nend\n" } }),
    ).toThrow(/withPodsDeploymentTarget/);
  });
});
