import { useAuth } from "@/hooks/useAuth";
import { useAutoLogout } from "@/hooks/useAutoLogout";
import React, { createContext, useEffect } from "react";
import { View } from "react-native";

const AutoLogoutContext = createContext<{
  resetInactivityTimer: () => void;
} | null>(null);

export function AutoLogoutProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isAuthenticated } = useAuth();
  const { resetInactivityTimer } = useAutoLogout();

  useEffect(() => {
    if (!isAuthenticated) return;

    // Set up event listeners untuk berbagai jenis user interaction
    const handleUserActivity = () => {
      resetInactivityTimer();
    };

    // Reset timer saat component pertama kali mount dan user authenticated
    handleUserActivity();

    return () => {
      // Cleanup akan dilakukan oleh useAutoLogout hook
    };
  }, [isAuthenticated, resetInactivityTimer]);

  return (
    <AutoLogoutContext.Provider value={{ resetInactivityTimer }}>
      <View
        style={{ flex: 1 }}
        onTouchStart={() => resetInactivityTimer()}
        onTouchMove={() => resetInactivityTimer()}
        onTouchEnd={() => resetInactivityTimer()}
      >
        {children}
      </View>
    </AutoLogoutContext.Provider>
  );
}
