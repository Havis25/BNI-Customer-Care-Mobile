import AsyncStorage from "@react-native-async-storage/async-storage";
import { useCallback, useEffect, useRef, useState } from "react";
import { AppState, AppStateStatus, Platform } from "react-native";
import { useAuth } from "./useAuth";

const INACTIVITY_TIMEOUT = 2 * 60 * 1000; // 2 menit
const BACKGROUND_TIMEOUT_KEY = "background_timeout";

export function useAutoLogout() {
  const { logout, isAuthenticated } = useAuth();
  const inactivityTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const backgroundTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const appStateRef = useRef<AppStateStatus>(AppState.currentState);
  const [isActive, setIsActive] = useState(true);

  const clearAllTimers = useCallback(() => {
    if (inactivityTimerRef.current) {
      clearTimeout(inactivityTimerRef.current);
      inactivityTimerRef.current = null;
    }
    if (backgroundTimerRef.current) {
      clearTimeout(backgroundTimerRef.current);
      backgroundTimerRef.current = null;
    }
  }, []);

  const resetInactivityTimer = useCallback(() => {
    if (!isAuthenticated || !isActive) return;

    clearAllTimers();

    inactivityTimerRef.current = setTimeout(() => {
      console.log("Auto logout: Inactivity timeout reached");
      logout(false); // Logout tanpa warning
    }, INACTIVITY_TIMEOUT);
  }, [isAuthenticated, isActive, logout, clearAllTimers]);

  const handleBackgroundTimeout = useCallback(async () => {
    try {
      const backgroundTime = await AsyncStorage.getItem(BACKGROUND_TIMEOUT_KEY);
      if (backgroundTime) {
        const timeInBackground = Date.now() - parseInt(backgroundTime);
        if (timeInBackground >= INACTIVITY_TIMEOUT) {
          console.log("Auto logout: Background timeout exceeded");
          logout(false);
          return;
        }
      }
    } catch (error) {
      console.error("Error checking background timeout:", error);
    }
  }, [logout]);

  const clearInactivityTimer = useCallback(() => {
    clearAllTimers();
  }, [clearAllTimers]);

  useEffect(() => {
    if (!isAuthenticated) {
      clearInactivityTimer();
      setIsActive(true);
      return;
    }

    // Start timer saat pertama kali authenticated
    resetInactivityTimer();

    const handleAppStateChange = async (nextAppState: AppStateStatus) => {
      const previousState = appStateRef.current;

      if (
        nextAppState === "active" &&
        previousState.match(/inactive|background/)
      ) {
        // App kembali ke foreground
        console.log("App resumed from background");
        setIsActive(true);

        // Check jika sudah terlalu lama di background
        await handleBackgroundTimeout();

        // Reset timer jika masih authenticated
        if (isAuthenticated) {
          resetInactivityTimer();
        }

        // Clear background time
        try {
          await AsyncStorage.removeItem(BACKGROUND_TIMEOUT_KEY);
        } catch (error) {
          console.error("Error clearing background time:", error);
        }
      } else if (
        nextAppState.match(/inactive|background/) &&
        previousState === "active"
      ) {
        // App ke background
        console.log("App going to background");
        setIsActive(false);
        clearInactivityTimer();

        // Store background time
        try {
          await AsyncStorage.setItem(
            BACKGROUND_TIMEOUT_KEY,
            Date.now().toString()
          );
        } catch (error) {
          console.error("Error storing background time:", error);
        }

        // Untuk iOS, set timer untuk logout saat background
        if (Platform.OS === "ios") {
          backgroundTimerRef.current = setTimeout(() => {
            console.log("Auto logout: iOS background timeout");
            logout(false);
          }, INACTIVITY_TIMEOUT);
        }
      }

      appStateRef.current = nextAppState;
    };

    const subscription = AppState.addEventListener(
      "change",
      handleAppStateChange
    );

    // Check background timeout saat pertama kali mount
    handleBackgroundTimeout();

    return () => {
      clearInactivityTimer();
      subscription?.remove();
    };
  }, [
    isAuthenticated,
    resetInactivityTimer,
    clearInactivityTimer,
    handleBackgroundTimeout,
    logout,
  ]);

  return {
    resetInactivityTimer,
    clearInactivityTimer,
  };
}
