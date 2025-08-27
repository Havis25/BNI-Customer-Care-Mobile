import { useCallback, useEffect, useRef } from "react";
import { AppState, AppStateStatus } from "react-native";
import { useAuth } from "./useAuth";

export function useAutoLogout() {
  const { logout, isAuthenticated } = useAuth();
  const inactivityTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const appStateRef = useRef<AppStateStatus>(AppState.currentState);

  const resetInactivityTimer = useCallback(() => {
    if (inactivityTimerRef.current) {
      clearTimeout(inactivityTimerRef.current);
    }

    if (isAuthenticated) {
      inactivityTimerRef.current = setTimeout(() => {
        logout(false); // Logout tanpa warning
      }, 2 * 60 * 1000); // 2 menit
    }
  }, [isAuthenticated, logout]);

  const clearInactivityTimer = useCallback(() => {
    if (inactivityTimerRef.current) {
      clearTimeout(inactivityTimerRef.current);
      inactivityTimerRef.current = null;
    }
  }, []);

  useEffect(() => {
    if (!isAuthenticated) {
      clearInactivityTimer();
      return;
    }

    // Start timer saat pertama kali authenticated
    resetInactivityTimer();

    const handleAppStateChange = (nextAppState: AppStateStatus) => {
      if (
        appStateRef.current.match(/inactive|background/) &&
        nextAppState === "active"
      ) {
        // App kembali ke foreground, reset timer
        resetInactivityTimer();
      } else if (nextAppState.match(/inactive|background/)) {
        // App ke background, clear timer
        clearInactivityTimer();
      }
      appStateRef.current = nextAppState;
    };

    const subscription = AppState.addEventListener(
      "change",
      handleAppStateChange
    );

    return () => {
      clearInactivityTimer();
      subscription?.remove();
    };
  }, [isAuthenticated, resetInactivityTimer, clearInactivityTimer]);

  return {
    resetInactivityTimer,
    clearInactivityTimer,
  };
}
