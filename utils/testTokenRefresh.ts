import * as SecureStore from "expo-secure-store";

const API_BASE = "https://bcare.my.id";

export const testTokenRefreshEndpoint = async () => {
  try {
    console.log("🧪 Testing token refresh endpoint...");
    
    const refreshToken = await SecureStore.getItemAsync("refresh_token");
    if (!refreshToken) {
      console.log("❌ No refresh token found");
      return false;
    }

    console.log("📤 Sending request to:", `${API_BASE}/v1/auth/refresh-token`);
    console.log("🔑 Using refresh token:", refreshToken.substring(0, 20) + "...");

    const response = await fetch(`${API_BASE}/v1/auth/refresh-token`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${refreshToken}`,
      },
    });

    console.log("📥 Response status:", response.status);
    console.log("📥 Response headers:", Object.fromEntries(response.headers.entries()));

    const responseText = await response.text();
    console.log("📥 Response body:", responseText);

    if (response.ok) {
      try {
        const data = JSON.parse(responseText);
        console.log("✅ Refresh endpoint working correctly");
        console.log("🔑 New access token received:", !!data.access_token);
        return true;
      } catch (e) {
        console.log("❌ Invalid JSON response");
        return false;
      }
    } else {
      console.log("❌ Refresh endpoint failed");
      return false;
    }
  } catch (error) {
    console.log("❌ Network error:", error);
    return false;
  }
};

export const testCurrentTokenStatus = async () => {
  try {
    const accessToken = await SecureStore.getItemAsync("access_token");
    const refreshToken = await SecureStore.getItemAsync("refresh_token");
    
    console.log("🔍 Current token status:");
    console.log("  Access token:", accessToken ? "Present" : "Missing");
    console.log("  Refresh token:", refreshToken ? "Present" : "Missing");
    
    if (accessToken) {
      // Test with current access token
      const response = await fetch(`${API_BASE}/v1/auth/me`, {
        headers: {
          "Authorization": `Bearer ${accessToken}`,
        },
      });
      
      console.log("  Access token valid:", response.ok);
      if (!response.ok) {
        console.log("  Error:", response.status, response.statusText);
      }
    }
  } catch (error) {
    console.log("❌ Error checking token status:", error);
  }
};