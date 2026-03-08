import Constants from "expo-constants";
import { Platform } from "react-native";

function normalizeEnvValue(value) {
  if (typeof value !== "string") {
    return "";
  }

  return value.trim();
}

function loadAdsModule() {
  const isExpoGo =
    Constants.executionEnvironment === "storeClient" || Constants.appOwnership === "expo";

  // Expo Go and web do not include the native AdMob SDK module.
  if (isExpoGo || Platform.OS === "web") {
    return null;
  }

  try {
    return require("react-native-google-mobile-ads");
  } catch (error) {
    return null;
  }
}

const adsModule = loadAdsModule();
const testBannerUnitId = adsModule?.TestIds?.BANNER ?? "";

const topBannerUnitId = normalizeEnvValue(process.env.EXPO_PUBLIC_ADMOB_TOP_BANNER_UNIT_ID);
const bottomBannerUnitId = normalizeEnvValue(process.env.EXPO_PUBLIC_ADMOB_BOTTOM_BANNER_UNIT_ID);

export const ADS_CONFIG = {
  enabled: Boolean(adsModule),
  topBannerUnitId: __DEV__ ? testBannerUnitId : topBannerUnitId,
  bottomBannerUnitId: __DEV__ ? testBannerUnitId : bottomBannerUnitId,
  requestOptions: {
    requestNonPersonalizedAdsOnly: true
  }
};

export const ADS_MODULE = {
  BannerAd: adsModule?.BannerAd ?? null,
  BannerAdSize: adsModule?.BannerAdSize ?? null
};
