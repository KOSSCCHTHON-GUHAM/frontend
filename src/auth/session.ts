import * as SecureStore from "expo-secure-store";
import { Platform } from "react-native";

const ACCESS_TOKEN_KEY = "guham.accessToken";
const REFRESH_TOKEN_KEY = "guham.refreshToken";

const getItem = async (key: string): Promise<string | null> => {
  if (Platform.OS === "web") {
    return typeof localStorage === "undefined" ? null : localStorage.getItem(key);
  }
  return SecureStore.getItemAsync(key);
};

const setItem = async (key: string, value: string): Promise<void> => {
  if (Platform.OS === "web") {
    localStorage.setItem(key, value);
    return;
  }
  await SecureStore.setItemAsync(key, value);
};

const deleteItem = async (key: string): Promise<void> => {
  if (Platform.OS === "web") {
    localStorage.removeItem(key);
    return;
  }
  await SecureStore.deleteItemAsync(key);
};

export const sessionStore = {
  getAccessToken: () => getItem(ACCESS_TOKEN_KEY),
  getRefreshToken: () => getItem(REFRESH_TOKEN_KEY),
  async save(accessToken: string, refreshToken: string) {
    await Promise.all([
      setItem(ACCESS_TOKEN_KEY, accessToken),
      setItem(REFRESH_TOKEN_KEY, refreshToken),
    ]);
  },
  async clear() {
    await Promise.all([deleteItem(ACCESS_TOKEN_KEY), deleteItem(REFRESH_TOKEN_KEY)]);
  },
};
