import { AutoLogoutContext } from "@/components/AutoLogoutProvider";
import { useCallback, useContext } from "react";

/**
 * Hook untuk mengintegrasikan auto-logout ke dalam komponen
 * Satu-satunya implementasi yang diperlukan untuk user activity tracking
 */
export function useUserActivity() {
  const context = useContext(AutoLogoutContext);

  const trackActivity = useCallback(() => {
    // Direct call ke context untuk performance optimal
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

  // Enhanced wrapper untuk berbagai event handlers
  const withActivity = useCallback(
    <T extends (...args: any[]) => any>(handler?: T) => {
      if (!handler) return trackActivity as T;

      return ((...args: Parameters<T>) => {
        trackActivity();
        return handler(...args);
      }) as T;
    },
    [trackActivity]
  );

  return {
    trackActivity,
    withActivityTracking, // Legacy support
    withActivity, // Enhanced version
  };
}

/**
 * Direct utility function untuk trigger dari mana saja
 * Gunakan ini jika tidak dalam React context
 */
export const triggerUserActivity = () => {
  // Direct call ke global function yang di-set oleh AutoLogoutProvider
  if ((global as any).triggerUserActivity) {
    (global as any).triggerUserActivity();
  }
};
