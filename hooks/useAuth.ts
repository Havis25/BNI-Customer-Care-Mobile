import AsyncStorage from "@react-native-async-storage/async-storage";
import { router } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import { Alert } from "react-native";
import { api } from "@/lib/api";
import { useTokenManager } from "./useTokenManager";

type Ticket = {
  ticket_number: string;
  description: string;
  customer_status: string;
  issue_channel: string;
  created_time: string;
};

type Customer = {
  id: number;
  customer_id?: number;
  full_name: string;
  email: string;
  role: string;
  address?: string;
  phone_number?: string;
  accounts?: any[];
  tickets?: Ticket[];
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
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const { token, saveTokens, clearTokens, getValidToken } = useTokenManager();
  const isAuthenticated = !!token;

  // load sesi awal
  useEffect(() => {
    (async () => {
      try {
        const u = await AsyncStorage.getItem("customer");
        if (u) {
          try {
            const userData = JSON.parse(u);
            setUser(userData);
            setTickets(userData.tickets || []);
          } catch {
            setUser(null);
            setTickets([]);
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

    setIsLoading(true);
    try {
      const res = await api<LoginResponse>(LOGIN_PATH, {
        method: "POST",
        body: JSON.stringify({ email, password }),
      });

      if (!res?.success || !res?.access_token || !res?.data) {
        throw new Error(res?.message || "Login gagal");
      }

      // Simpan tokens ke secure storage
      await saveTokens(res.access_token, res.refresh_token);
      
      // Fetch user data lengkap dengan /v1/auth/me
      const userDetail = await api("/v1/auth/me", {
        headers: {
          Authorization: res.access_token,
        },
      });

      const fullUserData = {
        ...userDetail.data,
        customer_id: userDetail.data.id,
      };

      await AsyncStorage.multiSet([
        ["customer", JSON.stringify(fullUserData)],
        ["isLoggedIn", "true"],
      ]);

      setUser(fullUserData);
      setTickets(fullUserData.tickets || []);

      router.replace("/(tabs)");
    } catch (error: any) {
      const msg =
        typeof error?.message === "string" &&
        (error.message.includes("401") ||
          /unauthorized|invalid/i.test(error.message))
          ? "Email atau password salah"
          : "Gagal login. Periksa koneksi atau coba lagi.";
      Alert.alert("Error", msg);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const logout = useCallback(async () => {
    try {
      await clearTokens();
      await AsyncStorage.multiRemove(["customer", "isLoggedIn"]);
      setUser(null);
      setTickets([]);
      router.replace("/login");
    } catch (error) {
      console.error("Error during logout:", error);
    }
  }, [clearTokens]);

  return { login, logout, isLoading, isAuthenticated, user, token, tickets, getValidToken };
}
