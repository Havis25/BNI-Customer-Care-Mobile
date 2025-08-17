// lib/api.ts
import * as SecureStore from 'expo-secure-store';

export const API_BASE =
  (process.env.EXPO_PUBLIC_API_URL || "https://4af813bf189d.ngrok-free.app").replace(/\/+$/, "");

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
  if (!headers.Authorization && !path.includes('/auth/')) {
    try {
      const token = await SecureStore.getItemAsync('access_token');
      if (token) {
        headers.Authorization = `Bearer ${token}`;
      }
    } catch (error) {
      console.error('Error getting token:', error);
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
