import { ExpoConfig, ConfigContext } from "expo/config";
import appJson from "./app.json";

export default ({ config }: ConfigContext): ExpoConfig => {
  const appConfig = appJson.expo as unknown as ExpoConfig;

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
        ];
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
