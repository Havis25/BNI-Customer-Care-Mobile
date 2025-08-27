import * as SecureStore from "expo-secure-store";

const API_BASE = "https://bcare.my.id";

export const testTokenRefreshEndpoint = async () => {
  try {

    const refreshToken = await SecureStore.getItemAsync("refresh_token");
    if (!refreshToken) {
      
      return false;
    }

    const response = await fetch(`${API_BASE}/v1/auth/refresh-token`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${refreshToken}`,
      },
    });

    const responseText = await response.text();

    if (response.ok) {
      try {
        const data = JSON.parse(responseText);

        return true;
      } catch (e) {
        
        return false;
      }
    } else {
      
      return false;
    }
  } catch (error) {
    
    return false;
  }
};

export const testCurrentTokenStatus = async () => {
  try {
    const accessToken = await SecureStore.getItemAsync("access_token");
    const refreshToken = await SecureStore.getItemAsync("refresh_token");

    if (accessToken) {
      // Test with current access token
      const response = await fetch(`${API_BASE}/v1/auth/me`, {
        headers: {
          "Authorization": `Bearer ${accessToken}`,
        },
      });

      if (!response.ok) {
        
      }
    }
  } catch (error) {
    
  }
};
