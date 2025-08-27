// components/TabTransition.tsx
import { useUserActivity } from "@/hooks/useUserActivity";
import { useIsFocused } from "@react-navigation/native";
import React, { useEffect, useRef } from "react";
import { Animated } from "react-native";

export default function TabTransition({
  children,
}: {
  children: React.ReactNode;
}) {
  const isFocused = useIsFocused();
  const opacity = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(8)).current;
  const { trackActivity } = useUserActivity();

  useEffect(() => {
    if (isFocused) {
      trackActivity(); // Track user activity saat tab difokuskan
    }

    Animated.parallel([
      Animated.timing(opacity, {
        toValue: isFocused ? 1 : 0,
        duration: 220,
        useNativeDriver: true,
      }),
      Animated.timing(translateY, {
        toValue: isFocused ? 0 : 8,
        duration: 220,
        useNativeDriver: true,
      }),
    ]).start();
  }, [isFocused, opacity, translateY, trackActivity]);

  return (
    <Animated.View
      style={{ flex: 1, opacity, transform: [{ translateY }] }}
      onTouchStart={() => trackActivity()}
      onTouchMove={() => trackActivity()}
    >
      {children}
    </Animated.View>
  );
}
