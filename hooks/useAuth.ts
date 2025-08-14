import AsyncStorage from "@react-native-async-storage/async-storage";
import { router } from "expo-router";
import { useState } from "react";
import { Alert } from "react-native";

export const useAuth = () => {
  const [isLoading, setIsLoading] = useState(false);

  const login = async (email: string, password: string) => {
    if (!email || !password) {
      Alert.alert("Error", "Email dan password harus diisi");
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch("http://34.121.13.94:3000/customer", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (response.ok) {
        const customers = await response.json();
        const user = customers.find(
          (customer: any) =>
            customer.email === email && customer.password_hash === password
        );

        if (user) {
          await AsyncStorage.setItem("customer", JSON.stringify(user));
          await AsyncStorage.setItem("isLoggedIn", "true");
          router.replace("/(tabs)");
        } else {
          Alert.alert("Error", "Email atau password salah");
        }
      } else {
        Alert.alert("Error", "Gagal terhubung ke server");
      }
    } catch (error) {
      Alert.alert("Error", "Terjadi kesalahan jaringan");
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      await AsyncStorage.removeItem("customer");
      await AsyncStorage.removeItem("isLoggedIn");
      router.replace("/login");
    } catch (error) {
      console.error("Error during logout:", error);
    }
  };

  return {
    login,
    logout,
    isLoading,
  };
};
