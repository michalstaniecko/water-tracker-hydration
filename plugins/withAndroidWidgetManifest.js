const { withAndroidManifest } = require("expo/config-plugins");

/**
 * Expo config plugin to add missing Android manifest entries for widget support:
 * 1. ACTION_REFRESH intent filter on HydrationWidget receiver (for programmatic refresh)
 * 2. android:exported="true" on receiver (required for broadcast reception)
 * 3. Deep link intent filter on MainActivity (for widget tap-to-open and quick-add)
 *
 * IMPORTANT: This plugin must be listed BEFORE @bittingz/expo-widgets in app.json plugins
 * because withAndroidManifest modifiers execute in LIFO (last-in, first-out) order.
 * Being listed first means this modifier executes last, ensuring the widget receiver
 * created by expo-widgets already exists when we modify it.
 */
function withAndroidWidgetManifest(config) {
  return withAndroidManifest(config, (config) => {
    const manifest = config.modResults;
    const application = manifest.manifest.application?.[0];
    if (!application) return config;

    // --- Fix HydrationWidget receiver ---
    const receivers = application.receiver || [];
    for (const receiver of receivers) {
      const name = receiver.$?.["android:name"];
      if (name && name.includes("HydrationWidget")) {
        // Set exported to true so it can receive broadcasts
        receiver.$["android:exported"] = "true";

        // Add ACTION_REFRESH intent filter if not present
        const intentFilters = receiver["intent-filter"] || [];
        const hasRefresh = intentFilters.some((filter) =>
          filter.action?.some(
            (a) =>
              a.$?.["android:name"] ===
              "website.ihumbak.hydration.ACTION_REFRESH"
          )
        );

        if (!hasRefresh) {
          intentFilters.push({
            action: [
              {
                $: {
                  "android:name":
                    "website.ihumbak.hydration.ACTION_REFRESH",
                },
              },
            ],
          });
          receiver["intent-filter"] = intentFilters;
        }
      }
    }

    // --- Add deep link intent filter to MainActivity ---
    const activities = application.activity || [];
    for (const activity of activities) {
      const name = activity.$?.["android:name"];
      if (name === ".MainActivity") {
        const intentFilters = activity["intent-filter"] || [];
        const hasDeepLink = intentFilters.some((filter) =>
          filter.data?.some(
            (d) => d.$?.["android:scheme"] === "hydration"
          )
        );

        if (!hasDeepLink) {
          intentFilters.push({
            action: [
              { $: { "android:name": "android.intent.action.VIEW" } },
            ],
            category: [
              { $: { "android:name": "android.intent.category.DEFAULT" } },
              {
                $: {
                  "android:name": "android.intent.category.BROWSABLE",
                },
              },
            ],
            data: [{ $: { "android:scheme": "hydration" } }],
          });
          activity["intent-filter"] = intentFilters;
        }
      }
    }

    return config;
  });
}

module.exports = withAndroidWidgetManifest;
