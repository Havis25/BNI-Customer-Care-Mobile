import AsyncStorage from "@react-native-async-storage/async-storage";
import { router } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import { Alert } from "react-native";
import { api } from "@/lib/api";

type Ticket = {
  ticket_number: string;
  description: string;
  customer_status: string;
  issue_channel: string;
  created_time: string;
};

type Customer = {
  customer_id: number;
  full_name: string;
  email: string;
  address: string;
  phone_number: string;
  tickets: Ticket[];
};

type LoginResponse = {
  message?: string;
  access_token: string;
  data: Customer;
};

const LOGIN_PATH = "/v1/auth/login/customer";

export function useAuth() {
  const [isLoading, setIsLoading] = useState(false);
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<Customer | null>(null);
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const isAuthenticated = !!token;

  // load sesi awal
  useEffect(() => {
    (async () => {
      try {
        const [t, u] = await Promise.all([
          AsyncStorage.getItem("access_token"),
          AsyncStorage.getItem("customer"),
        ]);
        if (t) setToken(t);
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

      if (!res?.access_token || !res?.data) {
        throw new Error("Respon login tidak lengkap");
      }

      await AsyncStorage.multiSet([
        ["access_token", res.access_token],
        ["customer", JSON.stringify(res.data)],
        ["isLoggedIn", "true"],
      ]);

      setToken(res.access_token);
      setUser(res.data);
      setTickets(res.data.tickets || []);

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
      await AsyncStorage.multiRemove(["access_token", "customer", "isLoggedIn"]);
      setToken(null);
      setUser(null);
      setTickets([]);
      router.replace("/login");
    } catch (error) {
      console.error("Error during logout:", error);
    }
  }, []);

  return { login, logout, isLoading, isAuthenticated, user, token, tickets };
}