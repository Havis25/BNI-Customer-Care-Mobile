// lib/api.ts
import * as SecureStore from "expo-secure-store";

// Get API base URL from environment or fallback
const getApiBase = () => {
  const envUrl = process.env.EXPO_PUBLIC_API_URL;
  const fallbackUrl = "https://bcare.my.id";
  const baseUrl = envUrl || fallbackUrl;
  const cleanUrl = baseUrl.replace(/\/+$/, "");
  
  console.log('Environment EXPO_PUBLIC_API_URL:', envUrl);
  console.log('Using API_BASE:', cleanUrl);
  
  return cleanUrl;
};

export const API_BASE = getApiBase();

type JSONValue = any;

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

  const res = await fetch(url, {
    ...init,
    headers,
    signal,
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`API ${res.status} — ${text || res.statusText}`);
  }

  return (await res.json()) as T;
}
