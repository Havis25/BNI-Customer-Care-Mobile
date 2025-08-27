import React, { useCallback, useContext } from "react";

// Create context inline to avoid circular import
const AutoLogoutContext = React.createContext<{
  resetInactivityTimer: () => void;
} | null>(null);

/**
 * Hook untuk mengintegrasikan auto-logout ke dalam komponen
 * Digunakan pada komponen yang memiliki user interaction
 */
export function useUserActivity() {
  const context = useContext(AutoLogoutContext);

  const trackActivity = useCallback(() => {
    context?.resetInactivityTimer();
  }, [context]);

  // Wrapper untuk onPress events
  const withActivityTracking = useCallback(
    (originalHandler?: () => void) => {
      return () => {
        trackActivity();
        originalHandler?.();
      };
    },
    [trackActivity]
  );

  return {
    trackActivity,
    withActivityTracking,
  };
}
