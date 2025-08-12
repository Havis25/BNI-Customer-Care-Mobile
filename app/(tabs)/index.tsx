import LayananKami from "@/components/home/LayananKami";
import ServicesCard from "@/components/home/ServicesCard";
import WelcomeCard from "@/components/home/WelcomeCard";
import Header from "@/components/shared/Header";
import React from "react";
import { ScrollView, StyleSheet, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";

export default function HomeScreen() {
  return (
    <SafeAreaView style={styles.safeArea}>
      <LinearGradient
        colors={["#DEEF5A", "#FCFDEE"]}
        locations={[0.23, 0.37]}
        style={StyleSheet.absoluteFill}
      />
      {/* <Header showLogo={true} showLogout={true} /> */}

      <View style={styles.backgroundSection}>
        <WelcomeCard />
      </View>

      <ScrollView style={styles.container}>
        <LayananKami />
        <ServicesCard />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  backgroundSection: {
    paddingHorizontal: 24,
    paddingTop: 20,
    paddingBottom: 20,
  },
  container: {
    flex: 1,
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
});
