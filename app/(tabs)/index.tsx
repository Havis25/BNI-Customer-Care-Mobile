import LayananKami from "@/components/home/LayananKami";
import ServicesCard from "@/components/home/ServicesCard";
import WelcomeCard from "@/components/home/WelcomeCard";
import Header from "@/components/shared/Header";
import React from "react";
import { ScrollView, StyleSheet, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function HomeScreen() {
  return (
    <SafeAreaView style={styles.safeArea}>
      <Header showLogo={true} showLogout={true} />

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
    backgroundColor: "#E0EE59",
  },
  backgroundSection: {
    backgroundColor: "#E0EE59",
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 20,
  },
  container: {
    flex: 1,
    backgroundColor: "#FFF8F0",
    padding: 20,
  },
});