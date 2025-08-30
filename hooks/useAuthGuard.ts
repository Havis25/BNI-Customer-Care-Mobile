import { useEffect, useState } from 'react';
import { router, useSegments } from 'expo-router';
import { BackHandler } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useTokenManager } from '@/hooks/useTokenManager';

export function useAuthGuard() {
  const [isInitialized, setIsInitialized] = useState(false);
  const segments = useSegments();
  const { getValidToken, clearTokens } = useTokenManager();

  // Handle back button prevention for authenticated users on home screen
  useEffect(() => {
    const handleBackPress = () => {
      const currentRoute = segments[0] || '';
      const inTabsGroup = segments[0] === '(tabs)';
      
      // Prevent back navigation if user is authenticated and on home screen
      if (inTabsGroup) {
        return true; // Prevent default back behavior
      }
      return false; // Allow default back behavior
    };

    const backHandler = BackHandler.addEventListener('hardwareBackPress', handleBackPress);
    return () => backHandler.remove();
  }, [segments]);

  useEffect(() => {
    const initializeAuth = async () => {
      if (isInitialized) return;
      
      try {
        const customer = await AsyncStorage.getItem('customer');
        const loginStatus = await AsyncStorage.getItem('isLoggedIn');
        const logoutFlag = await AsyncStorage.getItem('isFromLogout');
        
        let isAuthenticated = !!(customer && loginStatus === 'true');
        
        // Only check token validity if user appears authenticated and not from logout
        if (isAuthenticated && logoutFlag !== 'true') {
          const token = await getValidToken();
          if (!token) {
            // Token is missing or invalid, but don't auto-logout
            // Keep user logged in until they manually logout
            console.log('Token invalid but keeping user logged in');
          }
        }
        
        const fromLogout = logoutFlag === 'true';
        
        const currentRoute = segments[0] || '';
        const inAuthGroup = segments[0] === '(tabs)';
        const isPublicRoute = ['WelcomePage', 'onboarding', 'login'].includes(currentRoute);
        const isProtectedRoute = ['riwayat', 'complaint', 'services', 'faq', 'feedbackSuccess'].includes(currentRoute);

        if (isAuthenticated && !fromLogout) {
          // User is logged in and hasn't manually logged out
          if (isPublicRoute) {
            router.replace('/(tabs)');
          }
        } else {
          // User is not logged in or has manually logged out
          if (inAuthGroup || isProtectedRoute) {
            if (fromLogout) {
              // Clear logout flag and redirect to welcome page
              await AsyncStorage.removeItem('isFromLogout');
              router.replace('/WelcomePage');
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

  // Logout function to be used by profile/logout button
  const logout = async () => {
    try {
      // Clear all auth data
      await clearTokens();
      await AsyncStorage.multiRemove(['customer', 'isLoggedIn']);
      await AsyncStorage.setItem('isFromLogout', 'true');
      
      // Redirect to login page
      router.replace('/login');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  return { isInitialized, logout };
}

