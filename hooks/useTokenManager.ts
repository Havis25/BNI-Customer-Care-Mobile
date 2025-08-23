import { API_BASE } from "@/lib/api";
import * as SecureStore from "expo-secure-store";
import { useCallback, useEffect, useState } from "react";

const TOKEN_KEY = "access_token";
const REFRESH_TOKEN_KEY = "refresh_token";
const REFRESH_PATH = "/v1/auth/refresh";

export const useTokenManager = () => {
  const [token, setToken] = useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [refreshFailCount, setRefreshFailCount] = useState(0);
  const MAX_REFRESH_ATTEMPTS = 3;

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

  // ✅ Refresh token otomatis
  const refreshToken = useCallback(async (): Promise<string | null> => {
    if (isRefreshing) {
      // Wait for current refresh to complete
      while (isRefreshing) {
        await new Promise(resolve => setTimeout(resolve, 100));
      }
      return await getAccessToken();
    }

    // Circuit breaker - stop trying after max attempts
    if (refreshFailCount >= MAX_REFRESH_ATTEMPTS) {
      console.log(`❌ Refresh attempts exceeded (${refreshFailCount}/${MAX_REFRESH_ATTEMPTS}) - returning current token`);
      const currentToken = await getAccessToken();
      return currentToken;
    }

    setIsRefreshing(true);
    try {
      const storedRefreshToken = await getRefreshToken();
      if (!storedRefreshToken) {
        throw new Error("No refresh token available");
      }

      const response = await fetch(`${API_BASE}${REFRESH_PATH}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${storedRefreshToken}`,
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();

      if (data.access_token) {
        await saveTokens(data.access_token, data.refresh_token || storedRefreshToken);
        setRefreshFailCount(0); // Reset fail count on success
        console.log("✅ Token refreshed via useTokenManager");
        return data.access_token;
      }

      throw new Error(data.message || "Invalid response format");
    } catch (error) {
      console.error("Token refresh error:", error);
      setRefreshFailCount(prev => prev + 1);
      // Don't logout user, return current token so they stay in app
      const currentToken = await getAccessToken();
      return currentToken;
    } finally {
      setIsRefreshing(false);
    }
  }, [isRefreshing, getRefreshToken, getAccessToken, saveTokens, clearTokens]);

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
