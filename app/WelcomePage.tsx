import Splashscreen from "@/components/Splashscreen";
import { Fonts } from "@/constants/Fonts";
import { router } from "expo-router";
import React, { useState } from "react";
import { Image, StyleSheet, Text, TouchableOpacity, View, Platform } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Colors } from "../constants/Colors";

export default function WelcomePage() {
  const [splashDone, setSplashDone] = useState(Platform.OS === 'ios');

  if (!splashDone) {
    return <Splashscreen onFinish={() => setSplashDone(true)} />;
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.logoWrapper}>
        <Image
          source={require("../assets/images/Logo.png")}
          style={styles.logo}
          resizeMode="contain"
        />
      </View>

      <View style={styles.headerContainer}>
        <Image
          source={require("../assets/images/welcome.png")}
          style={styles.illustration}
          resizeMode="contain"
        />
      </View>

      <View style={styles.textSection}>
        <Text style={styles.title}>Your Customer Care & Support App</Text>
        <Text style={styles.subtitle}>
          Get help anytime, track your reports, and connect with our support
          team easily.
        </Text>
      </View>

      <TouchableOpacity
        style={styles.startButton}
        onPress={() => router.push("/onboarding")}
      >
        <Text style={styles.startButtonText}>Mulai Sekarang</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.light.background,
    // paddingTop: 20,
    // paddingBottom: 26,
  },

  logoWrapper: {
    width: "100%",
    alignItems: "flex-start",
    // marginBottom: 10,
    zIndex: 10,
    position: "relative",
    paddingHorizontal: 24,
  },

  logo: {
    width: 100,
    height: 100,
    marginTop: -42,
  },

  headerContainer: {
    width: "100%",
    height: 300,
    justifyContent: "center",
    alignItems: "center",
  },

  illustration: {
    width: "170%",
    height: "170%",
  },

  textSection: {
    marginHorizontal: 24,
    marginTop: 151,
    alignItems: "center",
  },

  title: {
    fontSize: 28,
    fontFamily: Fonts.semiBold,
    color: Colors.light.darkGreen,
    textAlign: "center",
    marginBottom: 10,
  },

  subtitle: {
    fontSize: 14,
    color: Colors.light.mediumGreen,
    textAlign: "center",
    lineHeight: 22,
    fontFamily: Fonts.regular,
  },

  startButton: {
    backgroundColor: Colors.light.primaryGreen,
    paddingVertical: 12,
    borderRadius: 5,
    marginTop: 45,
    marginHorizontal: 24,
    alignItems: "center",
    justifyContent: "center",
  },

  startButtonText: {
    color: Colors.light.white,
    fontSize: 14,
    fontFamily: Fonts.semiBold,
    textAlign: "center",
  },
});
