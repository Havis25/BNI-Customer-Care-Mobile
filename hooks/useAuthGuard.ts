import { useEffect, useState } from 'react';
import { router, useSegments } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useTokenManager } from '@/hooks/useTokenManager';

export function useAuthGuard() {
  const [isInitialized, setIsInitialized] = useState(false);
  const segments = useSegments();
  const { getValidToken, clearTokens } = useTokenManager();

  useEffect(() => {
    const initializeAuth = async () => {
      if (isInitialized) return;
      
      try {
        const customer = await AsyncStorage.getItem('customer');
        const loginStatus = await AsyncStorage.getItem('isLoggedIn');
        const logoutFlag = await AsyncStorage.getItem('isFromLogout');
        
        let isAuthenticated = !!(customer && loginStatus === 'true');
        
        // Check if token is valid when user appears to be authenticated
        if (isAuthenticated) {
          const token = await getValidToken();
          if (!token) {
            // Token is missing or invalid, clear auth data
            await clearTokens();
            await AsyncStorage.multiRemove(['customer', 'isLoggedIn']);
            await AsyncStorage.setItem('isFromLogout', 'true');
            isAuthenticated = false;
          }
        }
        
        const fromLogout = logoutFlag === 'true';
        
        const currentRoute = segments[0] || '';
        const inAuthGroup = segments[0] === '(tabs)';
        const isPublicRoute = ['WelcomePage', 'onboarding', 'login'].includes(currentRoute);
        const isProtectedRoute = ['riwayat', 'complaint', 'services', 'faq', 'feedbackSuccess'].includes(currentRoute);

        if (isAuthenticated) {
          // User is logged in
          if (isPublicRoute) {
            router.replace('/(tabs)');
          }
        } else {
          // User is not logged in
          if (inAuthGroup || isProtectedRoute) {
            if (fromLogout) {
              router.replace('/login');
            } else {
              router.replace('/WelcomePage');
            }
          }
        }
        
        setIsInitialized(true);
      } catch {
        setIsInitialized(true);
      }
    };

    initializeAuth();
  }, [segments, isInitialized, getValidToken, clearTokens]);

  return { isInitialized };
}

