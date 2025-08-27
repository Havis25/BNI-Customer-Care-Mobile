import AsyncStorage from "@react-native-async-storage/async-storage";
import * as SecureStore from "expo-secure-store";

export const debugAuthState = async () => {

  try {
    // Check SecureStore tokens
    const accessToken = await SecureStore.getItemAsync("access_token");
    const refreshToken = await SecureStore.getItemAsync("refresh_token");

    // Check AsyncStorage user data
    const customerData = await AsyncStorage.getItem("customer");

    if (customerData) {
      try {
        const parsedCustomer = JSON.parse(customerData);
        
      } catch (e) {
        
      }
    }
  } catch (error) {
    console.error("❌ Error debugging auth state:", error);
  }

};

