import AsyncStorage from "@react-native-async-storage/async-storage";

const KEYS = {
  ACCESS_TOKEN: "@sanskar_access_token",
  REFRESH_TOKEN: "@sanskar_refresh_token",
  USER_DATA: "@sanskar_user_data",
  THEME_PREF: "@sanskar_theme_pref",
  LANG_PREF: "@sanskar_lang_pref",
};

export async function storeTokens(accessToken, refreshToken) {
  await AsyncStorage.multiSet([
    [KEYS.ACCESS_TOKEN, accessToken],
    [KEYS.REFRESH_TOKEN, refreshToken],
  ]);
}

export async function getAccessToken() {
  return AsyncStorage.getItem(KEYS.ACCESS_TOKEN);
}

export async function getRefreshToken() {
  return AsyncStorage.getItem(KEYS.REFRESH_TOKEN);
}

export async function storeUser(user) {
  await AsyncStorage.setItem(KEYS.USER_DATA, JSON.stringify(user));
}

export async function getUser() {
  const raw = await AsyncStorage.getItem(KEYS.USER_DATA);
  return raw ? JSON.parse(raw) : null;
}

export async function storeThemePref(themeName) {
  await AsyncStorage.setItem(KEYS.THEME_PREF, themeName);
}

export async function getThemePref() {
  return AsyncStorage.getItem(KEYS.THEME_PREF);
}

export async function storeLanguagePref(lang) {
  await AsyncStorage.setItem(KEYS.LANG_PREF, lang);
}

export async function getLanguagePref() {
  return AsyncStorage.getItem(KEYS.LANG_PREF);
}

export async function clearAll() {
  await AsyncStorage.multiRemove([
    KEYS.ACCESS_TOKEN,
    KEYS.REFRESH_TOKEN,
    KEYS.USER_DATA,
    KEYS.THEME_PREF,
    KEYS.LANG_PREF,
  ]);
}
