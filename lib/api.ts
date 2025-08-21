// lib/api.ts
import * as SecureStore from "expo-secure-store";

export const API_BASE = (
  process.env.EXPO_PUBLIC_API_URL || "https://bcare.my.id"
).replace(/\/+$/, "");

type JSONValue = any;

// Refresh token function using new endpoint
const refreshToken = async (): Promise<string | null> => {
  try {
    const storedRefreshToken = await SecureStore.getItemAsync("refresh_token");
    if (!storedRefreshToken) {
      throw new Error("No refresh token available");
    }

    const response = await fetch(`${API_BASE}/v1/auth/refresh-token`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${storedRefreshToken}`,
      },
    });

    const data = await response.json();

    if (response.ok && data.access_token) {
      await SecureStore.setItemAsync("access_token", data.access_token);
      if (data.refresh_token) {
        await SecureStore.setItemAsync("refresh_token", data.refresh_token);
      }
      console.log('✅ Token refreshed successfully');
      return data.access_token;
    }
    
    throw new Error(data.message || "Token refresh failed");
  } catch (error) {
    console.error("Token refresh error:", error);
    return null;
  }
};

export async function api<T = JSONValue>(
  path: string,
  init: RequestInit = {},
  signal?: AbortSignal
): Promise<T> {
  const url = `${API_BASE}${path.startsWith("/") ? "" : "/"}${path}`;

  const headers = {
    Accept: "application/json",
    "Content-Type": "application/json",
    ...(init.headers || {}),
  } as Record<string, string>;

  // Auto-add token jika tidak ada Authorization header dan bukan endpoint auth
  if (
    !headers.Authorization &&
    !path.includes("/auth/login") &&
    !path.includes("/auth/refresh")
  ) {
    try {
      const token = await SecureStore.getItemAsync("access_token");
      if (token) {
        // Pastikan token tidak double Bearer
        const cleanToken = token.startsWith("Bearer ") ? token.slice(7) : token;
        headers.Authorization = `Bearer ${cleanToken}`;
      }
    } catch (error) {
      // Error getting token
    }
  }

  let res = await fetch(url, {
    ...init,
    headers,
    signal,
  });

  // Handle 419 expired token
  if (res.status === 419 && !path.includes("/auth/")) {
    console.log('🔄 Token expired (419), attempting refresh...');
    const newToken = await refreshToken();
    if (newToken) {
      // Retry with new token
      headers.Authorization = `Bearer ${newToken}`;
      res = await fetch(url, {
        ...init,
        headers,
        signal,
      });
    } else {
      console.log('❌ Token refresh failed');
    }
  }

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`API ${res.status} — ${text || res.statusText}`);
  }

  return (await res.json()) as T;
}
