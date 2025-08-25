import Splashscreen from "@/components/Splashscreen";
import { Fonts } from "@/constants/Fonts";
import { router } from "expo-router";
import React, { useState } from "react";
import { Image, StyleSheet, Text, TouchableOpacity, View, Platform } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Colors } from "../constants/Colors";

export default function WelcomePage() {
  const [splashDone, setSplashDone] = useState(true); // Disable custom splash - use native only

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
      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={styles.startButton}
          onPress={() => router.replace("/onboarding")}
        >
          <Text style={styles.startButtonText}>Mulai Sekarang</Text>
        </TouchableOpacity>
      </View>
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
    flexDirection: "row",
    justifyContent: "flex-start",
    alignItems: "center",
    zIndex: 10,
    paddingHorizontal: 24,
    paddingTop: 12,
  },

  logo: {
    width: 100,
    height: 40,
  },

  headerContainer: {
    width: "100%",
    height: 300,
    justifyContent: "center",
    alignItems: "center",
  },

  illustration: {
    width: Platform.OS === "ios" ? "180%" : "180%",
    height: Platform.OS === "ios" ? "180%" : "180%",
  },

  textSection: {
    marginHorizontal: 24,
    marginTop: 161,
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

  buttonContainer: { 
    flex: 1, 
    justifyContent: "flex-end", 
    marginBottom: Platform.OS === "ios" ? 0 : 32,
  },

  startButton: {
    backgroundColor: Colors.light.primaryGreen,
    paddingVertical: 12,
    borderRadius: 5,
    marginBottom: Platform.OS === "ios" ? 16 : 0,
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
