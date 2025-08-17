// components/TabTransition.tsx
import React, { useEffect, useRef } from "react";
import { Animated } from "react-native";
import { useIsFocused } from "@react-navigation/native";

export default function TabTransition({ children }: { children: React.ReactNode }) {
  const isFocused = useIsFocused();
  const opacity = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(8)).current;

  useEffect(() => {
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
  }, [isFocused, opacity, translateY]);

  return (
    <Animated.View style={{ flex: 1, opacity, transform: [{ translateY }] }}>
      {children}
    </Animated.View>
  );
}
