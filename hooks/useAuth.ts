import { api } from "@/lib/api";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { router } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import { Alert } from "react-native";
import { useTokenManager } from "./useTokenManager";

type Customer = {
  id: number;
  customer_id?: number;
  full_name: string;
  email: string;
  role: string;
  address?: string;
  phone_number?: string;
  accounts?: any[];
};

type LoginResponse = {
  success: boolean;
  message: string;
  access_token: string;
  refresh_token: string;
  token_type: string;
  expires_in: number;
  data: Customer;
};

const LOGIN_PATH = "/v1/auth/login/customer";

export function useAuth() {
  const [isLoading, setIsLoading] = useState(false);
  const [user, setUser] = useState<Customer | null>(null);
  const [isLoginInProgress, setIsLoginInProgress] = useState(false);
  const { token, saveTokens, clearTokens, getValidToken } = useTokenManager();
  const isAuthenticated = !!token;

  useEffect(() => {
    (async () => {
      try {
        const u = await AsyncStorage.getItem("customer");
        if (u) {
          try {
            const userData = JSON.parse(u);
            setUser(userData);
          } catch {
            setUser(null);
          }
        }
      } catch {}
    })();
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    if (!email || !password) {
      Alert.alert("Error", "Email dan password harus diisi");
      return;
    }

    if (isLoginInProgress) {
      return;
    }

    setIsLoginInProgress(true);
    setIsLoading(true);

    try {
      const res = await api<LoginResponse>(LOGIN_PATH, {
        method: "POST",
        body: JSON.stringify({ email, password }),
      });

      if (!res?.success || !res?.access_token || !res?.data) {
        throw new Error(res?.message || "Login gagal");
      }

      await saveTokens(res.access_token, res.refresh_token);

      const userDetail = await api("/v1/auth/me", {
        headers: { Authorization: res.access_token },
      });

      const fullUserData = { ...userDetail.data, customer_id: userDetail.data.id };

      // Clear any existing session data before setting new user data
      const allKeys = await AsyncStorage.getAllKeys();
      const sessionKeys = allKeys.filter(key => 
        key.includes('currentTicketId') || 
        key.includes('msgs:') ||
        key.includes('shouldRefresh')
      );
      if (sessionKeys.length > 0) {
        await AsyncStorage.multiRemove(sessionKeys);
      }

      await AsyncStorage.multiSet([
        ["customer", JSON.stringify(fullUserData)],
        ["isLoggedIn", "true"],
      ]);

      setUser(fullUserData);
      router.replace("/(tabs)");
    } catch (error: any) {
      const msg =
        typeof error?.message === "string" &&
        (error.message.includes("401") || /unauthorized|invalid/i.test(error.message))
          ? "Email atau password salah"
          : "Gagal login. Periksa koneksi atau coba lagi.";
      Alert.alert("Error", msg);
    } finally {
      setIsLoading(false);
      setIsLoginInProgress(false);
    }
  }, [isLoginInProgress]);

  const logout = useCallback(async () => {
    try {
      await clearTokens();
      // Clear all user-related storage
      const allKeys = await AsyncStorage.getAllKeys();
      const userKeys = allKeys.filter(key => 
        key.includes('customer') || 
        key.includes('ticket') || 
        key.includes('msgs:') ||
        key.includes('currentTicketId') ||
        key.includes('shouldRefresh')
      );
      if (userKeys.length > 0) {
        await AsyncStorage.multiRemove(userKeys);
      }
      await AsyncStorage.multiRemove(["customer", "isLoggedIn"]);
      setUser(null);
      router.replace("/login");
    } catch (error) {
      console.error("Error during logout:", error);
    }
  }, [clearTokens]);

  return { login, logout, isLoading, isAuthenticated, user, token, getValidToken };
}
