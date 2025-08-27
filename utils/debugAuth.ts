import AsyncStorage from "@react-native-async-storage/async-storage";
import * as SecureStore from "expo-secure-store";

export const debugAuthState = async () => {
  console.log("=== DEBUG AUTH STATE ===");

  try {
    // Check SecureStore tokens
    const accessToken = await SecureStore.getItemAsync("access_token");
    const refreshToken = await SecureStore.getItemAsync("refresh_token");

    console.log(
      "🔑 Access Token:",
      accessToken ? `${accessToken.slice(0, 20)}...` : "null"
    );
    console.log(
      "🔄 Refresh Token:",
      refreshToken ? `${refreshToken.slice(0, 20)}...` : "null"
    );

    // Check AsyncStorage user data
    const customerData = await AsyncStorage.getItem("customer");
    console.log("👤 Customer Data:", customerData ? "exists" : "null");

    if (customerData) {
      try {
        const parsedCustomer = JSON.parse(customerData);
        console.log("👤 Customer:", {
          id: parsedCustomer.id || parsedCustomer.customer_id,
          name: parsedCustomer.full_name,
          email: parsedCustomer.email,
        });
      } catch (e) {
        console.log("👤 Customer Data parsing error:", e);
      }
    }
  } catch (error) {
    console.error("❌ Error debugging auth state:", error);
  }

  console.log("=== END DEBUG AUTH STATE ===");
};
