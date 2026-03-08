const appJson = require("./app.json");

const DEFAULT_ANDROID_APP_ID = "ca-app-pub-3940256099942544~3347511713";
const DEFAULT_IOS_APP_ID = "ca-app-pub-3940256099942544~1458002511";

function readEnv(name, fallback) {
  const value = process.env[name];
  if (typeof value !== "string" || value.trim().length === 0) {
    return fallback;
  }

  return value.trim();
}

module.exports = () => {
  const expoConfig = appJson.expo;
  const existingPlugins = Array.isArray(expoConfig.plugins) ? expoConfig.plugins : [];
  const pluginsWithoutAds = existingPlugins.filter((plugin) => {
    const pluginName = Array.isArray(plugin) ? plugin[0] : plugin;
    return pluginName !== "react-native-google-mobile-ads";
  });

  return {
    ...expoConfig,
    plugins: [
      ...pluginsWithoutAds,
      [
        "react-native-google-mobile-ads",
        {
          androidAppId: readEnv("EXPO_PUBLIC_ADMOB_ANDROID_APP_ID", DEFAULT_ANDROID_APP_ID),
          iosAppId: readEnv("EXPO_PUBLIC_ADMOB_IOS_APP_ID", DEFAULT_IOS_APP_ID)
        }
      ]
    ]
  };
};
