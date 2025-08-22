import * as SecureStore from "expo-secure-store";

// Utility untuk decode JWT dan cek expiry
export const decodeJWT = (token: string) => {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    return JSON.parse(jsonPayload);
  } catch (error) {
    console.error('Error decoding JWT:', error);
    return null;
  }
};

export const getTokenExpiry = (token: string): Date | null => {
  const decoded = decodeJWT(token);
  if (decoded && decoded.exp) {
    return new Date(decoded.exp * 1000); // exp dalam seconds, convert ke milliseconds
  }
  return null;
};

export const isTokenExpired = (token: string): boolean => {
  const expiry = getTokenExpiry(token);
  if (!expiry) return true;
  return new Date() >= expiry;
};

// Test function untuk cek token expiry
export const checkCurrentTokenExpiry = async () => {
  const token = await SecureStore.getItemAsync('access_token');
  if (token) {
    const expiry = getTokenExpiry(token);
    const isExpired = isTokenExpired(token);
    
    console.log('🕐 Token expiry:', expiry?.toLocaleString());
    console.log('⏰ Is expired:', isExpired);
    console.log('⏳ Time until expiry:', expiry ? Math.round((expiry.getTime() - Date.now()) / 1000 / 60) + ' minutes' : 'Unknown');
  }
};