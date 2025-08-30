import { useAuth } from "@/hooks/useAuth";
import { useAutoLogout } from "@/hooks/useAutoLogout";
import React, { createContext, useCallback, useEffect, useRef } from "react";
import { DeviceEventEmitter, Keyboard, PanResponder, View } from "react-native";

export const AutoLogoutContext = createContext<{
  resetInactivityTimer: () => void;
} | null>(null);

export function AutoLogoutProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isAuthenticated } = useAuth();
  const { resetInactivityTimer } = useAutoLogout();
  const lastActivityRef = useRef<number>(Date.now());

  // Throttle function to prevent too frequent timer resets
  const throttledReset = useCallback(() => {
    const now = Date.now();
    if (now - lastActivityRef.current > 1000) {
      // Only reset once per second
      lastActivityRef.current = now;
      resetInactivityTimer();
    }
  }, [resetInactivityTimer]);

  // Pan responder untuk menangkap semua touch events
  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponderCapture: () => {
        throttledReset();
        return false; // Don't capture, let child components handle
      },
      onMoveShouldSetPanResponderCapture: () => {
        throttledReset();
        return false;
      },
      onPanResponderGrant: () => {
        throttledReset();
      },
      onPanResponderMove: () => {
        throttledReset();
      },
      onPanResponderRelease: () => {
        throttledReset();
      },
    })
  ).current;

  useEffect(() => {
    if (!isAuthenticated) return;

    // Keyboard events
    const keyboardDidShowListener = Keyboard.addListener(
      "keyboardDidShow",
      throttledReset
    );

    const keyboardDidHideListener = Keyboard.addListener(
      "keyboardDidHide",
      throttledReset
    );

    // Navigation events (if using React Navigation)
    const unsubscribeNavigation = DeviceEventEmitter.addListener(
      "navigationStateChange",
      throttledReset
    );

    // Custom app events
    const unsubscribeCustom = DeviceEventEmitter.addListener(
      "userActivity",
      throttledReset
    );

    // Reset timer saat component pertama kali mount dan user authenticated
    throttledReset();

    return () => {
      keyboardDidShowListener?.remove();
      keyboardDidHideListener?.remove();
      unsubscribeNavigation?.remove();
      unsubscribeCustom?.remove();
    };
  }, [isAuthenticated, throttledReset]);

  // Function untuk trigger manual user activity dari komponen lain
  useEffect(() => {
    // Global function untuk trigger user activity dari mana saja
    (global as any).triggerUserActivity = throttledReset;

    return () => {
      delete (global as any).triggerUserActivity;
    };
  }, [throttledReset]);

  return (
    <AutoLogoutContext.Provider
      value={{ resetInactivityTimer: throttledReset }}
    >
      <View
        style={{ flex: 1 }}
        {...panResponder.panHandlers}
        onTouchStart={throttledReset}
        onTouchMove={throttledReset}
        onTouchEnd={throttledReset}
        onLayout={throttledReset}
      >
        {children}
      </View>
    </AutoLogoutContext.Provider>
  );
}
