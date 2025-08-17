import * as SecureStore from 'expo-secure-store';
import { useCallback, useEffect, useState } from 'react';
import { api } from '@/lib/api';

const TOKEN_KEY = 'access_token';
const REFRESH_TOKEN_KEY = 'refresh_token';

export const useTokenManager = () => {
  const [token, setToken] = useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Load token saat startup
  useEffect(() => {
    loadToken();
  }, []);

  const loadToken = async () => {
    try {
      const storedToken = await SecureStore.getItemAsync(TOKEN_KEY);
      if (storedToken) {
        setToken(storedToken);
      }
    } catch (error) {
      console.error('Error loading token:', error);
    }
  };

  const saveTokens = async (accessToken: string, refreshToken: string) => {
    try {
      await SecureStore.setItemAsync(TOKEN_KEY, accessToken);
      await SecureStore.setItemAsync(REFRESH_TOKEN_KEY, refreshToken);
      setToken(accessToken);
    } catch (error) {
      console.error('Error saving tokens:', error);
    }
  };

  const refreshToken = useCallback(async (): Promise<string | null> => {
    if (isRefreshing) return token;
    
    setIsRefreshing(true);
    try {
      const storedRefreshToken = await SecureStore.getItemAsync(REFRESH_TOKEN_KEY);
      if (!storedRefreshToken) {
        throw new Error('No refresh token available');
      }

      const response = await fetch(`${process.env.EXPO_PUBLIC_API_URL || 'https://4af813bf189d.ngrok-free.app'}/v1/auth/refresh`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${storedRefreshToken}`,
        },
      });

      const data = await response.json();

      if (data.success && data.access_token) {
        await saveTokens(data.access_token, data.refresh_token || storedRefreshToken);
        return data.access_token;
      }
      
      throw new Error('Token refresh failed');
    } catch (error) {
      console.error('Token refresh error:', error);
      await clearTokens();
      return null;
    } finally {
      setIsRefreshing(false);
    }
  }, [token, isRefreshing]);

  const clearTokens = async () => {
    try {
      await SecureStore.deleteItemAsync(TOKEN_KEY);
      await SecureStore.deleteItemAsync(REFRESH_TOKEN_KEY);
      setToken(null);
    } catch (error) {
      console.error('Error clearing tokens:', error);
    }
  };

  const getValidToken = useCallback(async (): Promise<string | null> => {
    if (!token) return null;
    
    // Auto refresh token setiap kali dipanggil
    return await refreshToken();
  }, [token, refreshToken]);

  return {
    token,
    saveTokens,
    clearTokens,
    getValidToken,
    isRefreshing,
  };
};