jest.mock("expo/config-plugins", () => ({
  withAndroidManifest: jest.fn((config, callback) => callback(config)),
}));

const withAndroidWidgetManifest = require("../withAndroidWidgetManifest");

/**
 * Factory that builds a minimal Android manifest config object
 * matching the XML-as-JSON structure used by expo/config-plugins.
 *
 * @param {object} overrides
 * @param {Array}  overrides.receivers  - receiver entries for <application>
 * @param {Array}  overrides.activities - activity entries for <application>
 * @returns {object} mock Expo config with modResults
 */
function createMockConfig(overrides = {}) {
  return {
    modResults: {
      manifest: {
        application: [
          {
            receiver: overrides.receivers || [],
            activity: overrides.activities || [],
          },
        ],
      },
    },
  };
}

describe("withAndroidWidgetManifest", () => {
  // ---------------------------------------------------------------
  // HydrationWidget receiver tests
  // ---------------------------------------------------------------
  describe("HydrationWidget receiver", () => {
    it("sets android:exported to true on HydrationWidget receiver", () => {
      const config = createMockConfig({
        receivers: [
          {
            $: { "android:name": ".HydrationWidget" },
          },
        ],
      });

      const result = withAndroidWidgetManifest(config);
      const receiver =
        result.modResults.manifest.application[0].receiver[0];

      expect(receiver.$["android:exported"]).toBe("true");
    });

    it("adds ACTION_REFRESH intent-filter to HydrationWidget receiver", () => {
      const config = createMockConfig({
        receivers: [
          {
            $: { "android:name": ".HydrationWidget" },
          },
        ],
      });

      const result = withAndroidWidgetManifest(config);
      const receiver =
        result.modResults.manifest.application[0].receiver[0];
      const intentFilters = receiver["intent-filter"];

      expect(intentFilters).toHaveLength(1);
      expect(intentFilters[0].action).toEqual([
        {
          $: {
            "android:name": "website.ihumbak.hydration.ACTION_REFRESH",
          },
        },
      ]);
    });

    it("does not add ACTION_REFRESH if it already exists", () => {
      const config = createMockConfig({
        receivers: [
          {
            $: { "android:name": ".HydrationWidget" },
            "intent-filter": [
              {
                action: [
                  {
                    $: {
                      "android:name":
                        "website.ihumbak.hydration.ACTION_REFRESH",
                    },
                  },
                ],
              },
            ],
          },
        ],
      });

      const result = withAndroidWidgetManifest(config);
      const receiver =
        result.modResults.manifest.application[0].receiver[0];
      const intentFilters = receiver["intent-filter"];

      expect(intentFilters).toHaveLength(1);
    });

    it("matches receiver names that contain HydrationWidget (substring)", () => {
      const config = createMockConfig({
        receivers: [
          {
            $: {
              "android:name":
                "com.example.app.HydrationWidgetProvider",
            },
          },
        ],
      });

      const result = withAndroidWidgetManifest(config);
      const receiver =
        result.modResults.manifest.application[0].receiver[0];

      expect(receiver.$["android:exported"]).toBe("true");
      expect(receiver["intent-filter"]).toHaveLength(1);
    });

    it("skips receivers that are not HydrationWidget", () => {
      const otherReceiver = {
        $: { "android:name": ".OtherReceiver" },
      };
      const hydrationReceiver = {
        $: { "android:name": ".HydrationWidget" },
      };

      const config = createMockConfig({
        receivers: [otherReceiver, hydrationReceiver],
      });

      const result = withAndroidWidgetManifest(config);
      const receivers =
        result.modResults.manifest.application[0].receiver;

      // OtherReceiver should be untouched
      expect(receivers[0].$["android:exported"]).toBeUndefined();
      expect(receivers[0]["intent-filter"]).toBeUndefined();

      // HydrationWidget should be modified
      expect(receivers[1].$["android:exported"]).toBe("true");
      expect(receivers[1]["intent-filter"]).toHaveLength(1);
    });
  });

  // ---------------------------------------------------------------
  // MainActivity deep link tests
  // ---------------------------------------------------------------
  describe("MainActivity deep link", () => {
    it("adds deep link intent-filter to MainActivity", () => {
      const config = createMockConfig({
        activities: [
          {
            $: { "android:name": ".MainActivity" },
          },
        ],
      });

      const result = withAndroidWidgetManifest(config);
      const activity =
        result.modResults.manifest.application[0].activity[0];
      const intentFilters = activity["intent-filter"];

      expect(intentFilters).toHaveLength(1);

      const deepLinkFilter = intentFilters[0];
      expect(deepLinkFilter.action).toEqual([
        { $: { "android:name": "android.intent.action.VIEW" } },
      ]);
      expect(deepLinkFilter.category).toEqual([
        { $: { "android:name": "android.intent.category.DEFAULT" } },
        { $: { "android:name": "android.intent.category.BROWSABLE" } },
      ]);
      expect(deepLinkFilter.data).toEqual([
        { $: { "android:scheme": "hydration" } },
      ]);
    });

    it("does not add deep link if it already exists", () => {
      const config = createMockConfig({
        activities: [
          {
            $: { "android:name": ".MainActivity" },
            "intent-filter": [
              {
                data: [{ $: { "android:scheme": "hydration" } }],
              },
            ],
          },
        ],
      });

      const result = withAndroidWidgetManifest(config);
      const activity =
        result.modResults.manifest.application[0].activity[0];

      expect(activity["intent-filter"]).toHaveLength(1);
    });

    it("skips activities that are not MainActivity", () => {
      const config = createMockConfig({
        activities: [
          {
            $: { "android:name": ".OtherActivity" },
          },
        ],
      });

      const result = withAndroidWidgetManifest(config);
      const activity =
        result.modResults.manifest.application[0].activity[0];

      expect(activity["intent-filter"]).toBeUndefined();
    });

    it("requires exact match for .MainActivity name", () => {
      const config = createMockConfig({
        activities: [
          {
            $: { "android:name": ".MainActivityExtra" },
          },
        ],
      });

      const result = withAndroidWidgetManifest(config);
      const activity =
        result.modResults.manifest.application[0].activity[0];

      expect(activity["intent-filter"]).toBeUndefined();
    });
  });

  // ---------------------------------------------------------------
  // Idempotency
  // ---------------------------------------------------------------
  describe("idempotency", () => {
    it("running the plugin twice does not duplicate intent-filters", () => {
      const config = createMockConfig({
        receivers: [
          {
            $: { "android:name": ".HydrationWidget" },
          },
        ],
        activities: [
          {
            $: { "android:name": ".MainActivity" },
          },
        ],
      });

      // First pass
      withAndroidWidgetManifest(config);
      // Second pass on the same mutated config
      const result = withAndroidWidgetManifest(config);

      const receiver =
        result.modResults.manifest.application[0].receiver[0];
      const activity =
        result.modResults.manifest.application[0].activity[0];

      // Exactly one ACTION_REFRESH intent-filter
      const refreshFilters = receiver["intent-filter"].filter((f) =>
        f.action?.some(
          (a) =>
            a.$?.["android:name"] ===
            "website.ihumbak.hydration.ACTION_REFRESH"
        )
      );
      expect(refreshFilters).toHaveLength(1);

      // Exactly one deep link intent-filter
      const deepLinkFilters = activity["intent-filter"].filter((f) =>
        f.data?.some((d) => d.$?.["android:scheme"] === "hydration")
      );
      expect(deepLinkFilters).toHaveLength(1);
    });
  });

  // ---------------------------------------------------------------
  // Edge cases / graceful handling
  // ---------------------------------------------------------------
  describe("edge cases", () => {
    it("handles missing application gracefully (application undefined)", () => {
      const config = {
        modResults: {
          manifest: {
            application: undefined,
          },
        },
      };

      expect(() => withAndroidWidgetManifest(config)).not.toThrow();

      const result = withAndroidWidgetManifest(config);
      expect(result).toBe(config);
    });

    it("handles missing application gracefully (empty array)", () => {
      const config = {
        modResults: {
          manifest: {
            application: [],
          },
        },
      };

      expect(() => withAndroidWidgetManifest(config)).not.toThrow();
    });

    it("handles empty receivers and activities arrays", () => {
      const config = createMockConfig({
        receivers: [],
        activities: [],
      });

      expect(() => withAndroidWidgetManifest(config)).not.toThrow();

      const result = withAndroidWidgetManifest(config);
      const app = result.modResults.manifest.application[0];

      expect(app.receiver).toEqual([]);
      expect(app.activity).toEqual([]);
    });

    it("handles receiver without $ property", () => {
      const config = createMockConfig({
        receivers: [{}],
      });

      expect(() => withAndroidWidgetManifest(config)).not.toThrow();
    });

    it("handles activity without $ property", () => {
      const config = createMockConfig({
        activities: [{}],
      });

      expect(() => withAndroidWidgetManifest(config)).not.toThrow();
    });

    it("handles receiver with undefined receiver array (falls back to [])", () => {
      const config = {
        modResults: {
          manifest: {
            application: [
              {
                activity: [],
              },
            ],
          },
        },
      };

      expect(() => withAndroidWidgetManifest(config)).not.toThrow();
    });

    it("handles activity with undefined activity array (falls back to [])", () => {
      const config = {
        modResults: {
          manifest: {
            application: [
              {
                receiver: [],
              },
            ],
          },
        },
      };

      expect(() => withAndroidWidgetManifest(config)).not.toThrow();
    });
  });

  // ---------------------------------------------------------------
  // Return value
  // ---------------------------------------------------------------
  describe("return value", () => {
    it("returns the config object", () => {
      const config = createMockConfig();
      const result = withAndroidWidgetManifest(config);

      expect(result).toBe(config);
    });

    it("calls withAndroidManifest from expo/config-plugins", () => {
      const { withAndroidManifest } = require("expo/config-plugins");
      const config = createMockConfig();

      withAndroidWidgetManifest(config);

      expect(withAndroidManifest).toHaveBeenCalledWith(
        config,
        expect.any(Function)
      );
    });
  });
});
