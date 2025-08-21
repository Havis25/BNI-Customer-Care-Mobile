import * as SecureStore from "expo-secure-store";
import { useCallback, useEffect, useState } from "react";

const TOKEN_KEY = "access_token";
const REFRESH_TOKEN_KEY = "refresh_token";
const REFRESH_PATH = "/v1/auth/refresh-token"; // <-- endpoint refresh token baru
const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || "https://your-api-url.com";

export const useTokenManager = () => {
  const [token, setToken] = useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // ✅ Load token dari SecureStore saat startup
  useEffect(() => {
    loadToken();
  }, []);

  const loadToken = async () => {
    try {
      const storedToken = await SecureStore.getItemAsync(TOKEN_KEY);
      if (storedToken) setToken(storedToken);
    } catch (error) {
      console.error("Error loading token:", error);
    }
  };

  // ✅ Simpan access token + refresh token
  const saveTokens = async (accessToken: string, refreshToken: string) => {
    try {
      await SecureStore.setItemAsync(TOKEN_KEY, accessToken);
      await SecureStore.setItemAsync(REFRESH_TOKEN_KEY, refreshToken);
      setToken(accessToken);
    } catch (error) {
      console.error("Error saving tokens:", error);
    }
  };

  // ✅ Ambil access token terbaru
  const getAccessToken = useCallback(async (): Promise<string | null> => {
    try {
      const storedToken = await SecureStore.getItemAsync(TOKEN_KEY);
      return storedToken;
    } catch (error) {
      console.error("Error getting access token:", error);
      return null;
    }
  }, []);

  // ✅ Ambil refresh token terbaru
  const getRefreshToken = useCallback(async (): Promise<string | null> => {
    try {
      const storedRefreshToken = await SecureStore.getItemAsync(REFRESH_TOKEN_KEY);
      return storedRefreshToken;
    } catch (error) {
      console.error("Error getting refresh token:", error);
      return null;
    }
  }, []);

  // ✅ Refresh token otomatis
  const refreshToken = useCallback(async (): Promise<string | null> => {
    if (isRefreshing) return token; // kalau lagi refresh, pakai token lama

    setIsRefreshing(true);
    try {
      const storedRefreshToken = await getRefreshToken();
      if (!storedRefreshToken) {
        throw new Error("No refresh token available");
      }

      const response = await fetch(`${API_BASE_URL}${REFRESH_PATH}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${storedRefreshToken}`,
        },
      });

      const data = await response.json();

      // ✅ Sesuaikan sesuai response backend baru
      if (response.ok && data.access_token) {
        await saveTokens(data.access_token, data.refresh_token || storedRefreshToken);
        return data.access_token;
      }

      throw new Error(data.message || "Token refresh failed");
    } catch (error) {
      console.error("Token refresh error:", error);
      await clearTokens();
      return null;
    } finally {
      setIsRefreshing(false);
    }
  }, [token, isRefreshing]);

  // ✅ Hapus semua token
  const clearTokens = async () => {
    try {
      await SecureStore.deleteItemAsync(TOKEN_KEY);
      await SecureStore.deleteItemAsync(REFRESH_TOKEN_KEY);
      setToken(null);
    } catch (error) {
      console.error("Error clearing tokens:", error);
    }
  };

  // ✅ Ambil token valid tanpa refresh otomatis
  const getValidToken = useCallback(async (): Promise<string | null> => {
    if (!token) return null;
    return token;
  }, [token]);

  return {
    token,
    saveTokens,
    clearTokens,
    getValidToken,
    getAccessToken,
    getRefreshToken,
    refreshToken,
    isRefreshing,
  };
};
