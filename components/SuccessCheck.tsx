// components/animations/SuccessCheck.tsx
import React, { useEffect, useRef } from "react";
import { Animated, Easing, StyleSheet, View } from "react-native";
import Svg, { Circle, Path } from "react-native-svg";

type Props = {
  size?: number;
  bgColor?: string;
  checkColor?: string;
  strokeWidth?: number;
  duration?: number;
  delay?: number;
  onDone?: () => void;
};

const AnimatedPath = Animated.createAnimatedComponent(Path);

export default function SuccessCheck({
  size = 120,
  bgColor = "#55B6AC",
  checkColor = "#FFFFFF",
  strokeWidth = 8,
  duration = 700,
  delay = 0,
  onDone,
}: Props) {
  // anim values
  const pop = useRef(new Animated.Value(0.85)).current;     // circle pop-in
  const checkProg = useRef(new Animated.Value(0)).current;  // 0..1 draw check

  useEffect(() => {
    Animated.sequence([
      Animated.delay(delay),
      Animated.spring(pop, { toValue: 1, friction: 6, useNativeDriver: true }),
      Animated.timing(checkProg, {
        toValue: 1,
        duration,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
    ]).start(onDone || undefined);
  }, [delay, duration]);

  // Check path (viewBox 100x100)
  const A = { x: 30, y: 54 };
  const B = { x: 45, y: 68 };
  const C = { x: 74, y: 38 };
  const d1 = Math.hypot(B.x - A.x, B.y - A.y);
  const d2 = Math.hypot(C.x - B.x, C.y - B.y);
  const CHECK_LEN = d1 + d2;

  const dashOffset = checkProg.interpolate({
    inputRange: [0, 1],
    outputRange: [CHECK_LEN, 0],
  });

  return (
    <Animated.View style={[styles.wrap, { transform: [{ scale: pop }] }]}>
      <Svg width={size} height={size} viewBox="0 0 100 100">
        {/* Lingkaran penuh (sesuai desain) */}
        <Circle cx="50" cy="50" r="48" fill={bgColor} />
        {/* Gambar centang */}
        <AnimatedPath
          d={`M${A.x} ${A.y} L${B.x} ${B.y} L${C.x} ${C.y}`}
          stroke={checkColor}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
          strokeDasharray={CHECK_LEN}
          strokeDashoffset={dashOffset as any}
        />
      </Svg>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  wrap: { alignItems: "center", justifyContent: "center" },
});
