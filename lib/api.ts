// lib/api.ts
import * as SecureStore from "expo-secure-store";

export const API_BASE = (
  process.env.EXPO_PUBLIC_API_URL || "https://bcare.my.id"
).replace(/\/+$/, "");

type JSONValue = any;

let isRefreshing = false;
let refreshPromise: Promise<string | null> | null = null;
let refreshFailCount = 0;
const MAX_REFRESH_ATTEMPTS = 3;

// Refresh token function with better error handling
const refreshToken = async (): Promise<string | null> => {
  if (isRefreshing && refreshPromise) {
    return refreshPromise;
  }

  isRefreshing = true;
  refreshPromise = performTokenRefresh();

  try {
    const result = await refreshPromise;
    return result;
  } finally {
    isRefreshing = false;
    refreshPromise = null;
  }
};

const performTokenRefresh = async (): Promise<string | null> => {
  let attempts = 0;

  while (attempts < MAX_REFRESH_ATTEMPTS) {
    try {
      const storedRefreshToken = await SecureStore.getItemAsync(
        "refresh_token"
      );
      if (!storedRefreshToken) {
        throw new Error("No refresh token available");
      }

      const response = await fetch(`${API_BASE}/v1/auth/refresh`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          refresh_token: storedRefreshToken,
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();

      if (data.access_token) {
        await SecureStore.setItemAsync("access_token", data.access_token);
        if (data.refresh_token) {
          await SecureStore.setItemAsync("refresh_token", data.refresh_token);
        }
        
        return data.access_token;
      }

      throw new Error(data.message || "Invalid response format");
    } catch (error) {
      attempts++;
      console.error(
        `Token refresh error (${attempts}/${MAX_REFRESH_ATTEMPTS}):`,
        error
      );

      if (attempts >= MAX_REFRESH_ATTEMPTS) {
        
        return null;
      }

      // Wait before retry
      await new Promise((resolve) => setTimeout(resolve, 1000 * attempts));
    }
  }

  return null;
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
        
      } else {
        
      }
    } catch (error) {
      console.error(`❌ Error getting token for ${path}:`, error);
    }
  }

  let res = await fetch(url, {
    ...init,
    headers,
    signal,
  });

  // Handle 401/419 expired token
  if ((res.status === 401 || res.status === 419) && !path.includes("/auth/")) {
    
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
      
      // For debugging - let's see the response
      const text = await res.text().catch(() => "");

      // Don't throw error immediately, return undefined for graceful handling
      return undefined as T;
    }
  }

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    console.error(`❌ API Error ${res.status}:`, {
      url,
      status: res.status,
      statusText: res.statusText,
      responseBody: text,
      path,
      timestamp: new Date().toISOString(),
    });
    throw new Error(`API ${res.status} — ${text || res.statusText}`);
  }

  const jsonResponse = await res.json();

  return jsonResponse as T;
}

