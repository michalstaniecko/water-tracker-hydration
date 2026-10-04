import { ExpoConfig, ConfigContext } from "expo/config";

// `config` is the static app.json (`expo` key). It is the single source of
// truth; this file only layers environment-specific overrides on top of it.
export default ({ config }: ConfigContext): ExpoConfig => {
  const appConfig = { ...config } as ExpoConfig;

  // Override devTeamId from environment variable if available
  const appleTeamId = process.env.APPLE_TEAM_ID;

  if (appleTeamId) {
    const plugins = (appConfig.plugins ?? []).map((plugin) => {
      if (!Array.isArray(plugin)) return plugin;
      const [name, options] = plugin;
      if (name === "@bittingz/expo-widgets" && options?.ios) {
        return [
          name,
          {
            ...options,
            ios: {
              ...options.ios,
              devTeamId: appleTeamId,
            },
          },
        ] as [string, any];
      }
      return plugin;
    });

    return {
      ...appConfig,
      plugins,
    };
  }

  return appConfig;
};
