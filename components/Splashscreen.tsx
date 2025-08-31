import { Roboto_700Bold, useFonts } from "@expo-google-fonts/roboto";
import React, { useEffect, useRef } from "react";
import { Animated, Easing, StyleSheet, View } from "react-native";

type Props = { onFinish?: () => void };

export default function Splashscreen({ onFinish }: Props) {
  const [fontsLoaded] = useFonts({ Roboto_700Bold });

  const slideY = useRef(new Animated.Value(80)).current;
  const logoShiftX = useRef(new Animated.Value(0)).current;
  const logoScale = useRef(new Animated.Value(1)).current;
  const textOpacity = useRef(new Animated.Value(0)).current;
  const textShiftX = useRef(new Animated.Value(12)).current;
  const splashOpacity = useRef(new Animated.Value(1)).current;

  // Panggil onFinish di frame berikutnya agar tidak kena warning useInsertionEffect
  const safeFinish = () => {
    requestAnimationFrame(() => {
      setTimeout(() => onFinish?.(), 0);
    });
  };

  useEffect(() => {
    Animated.sequence([
      Animated.timing(slideY, {
        toValue: 0,
        duration: 700,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.parallel([
        Animated.timing(logoShiftX, {
          toValue: -24,
          duration: 500,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
        Animated.timing(textOpacity, {
          toValue: 1,
          duration: 500,
          useNativeDriver: true,
        }),
        Animated.timing(textShiftX, {
          toValue: 0,
          duration: 500,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
      ]),
      Animated.delay(900),
      Animated.parallel([
        Animated.timing(splashOpacity, {
          toValue: 0,
          duration: 450,
          useNativeDriver: true,
        }),
        Animated.timing(logoScale, {
          toValue: 0.92,
          duration: 450,
          useNativeDriver: true,
        }),
      ]),
    ]).start(safeFinish);
  }, []);

  if (!fontsLoaded) return null;

  return (
    <View style={styles.container}>
      <Animated.View
        style={[
          styles.row,
          {
            opacity: splashOpacity,
            transform: [{ translateY: slideY }, { scale: logoScale }],
          },
        ]}
      >
        <Animated.Image
          source={require("../assets/images/logo_only_dark.png")}
          style={[styles.logo, { transform: [{ translateX: logoShiftX }] }]}
          resizeMode="contain"
        />
        <Animated.Text
          style={[
            styles.brand,
            {
              opacity: textOpacity,
              transform: [{ translateX: textShiftX }],
              fontFamily: "Roboto_700Bold",
            },
          ]}
        >
          B-Care
        </Animated.Text>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#E0EE59",
    alignItems: "center",
    justifyContent: "center",
  },
  row: { flexDirection: "row", alignItems: "center" },
  logo: { width: 94, height: 94 },
  brand: { fontSize: 44, marginLeft: 0, color: "#494949", letterSpacing: 0.5 },
});
