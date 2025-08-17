import LayananKami from "@/components/home/LayananKami";
import ServicesCard from "@/components/home/ServicesCard";
import WelcomeCard from "@/components/home/WelcomeCard";
import React from "react";
import { FlatList, Platform, StyleSheet, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import TabTransition from "@/components/TabTransition";

export default function HomeScreen() {
  return (
    <TabTransition>
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

        <FlatList
          data={[{ key: "content" }]}
          renderItem={() => (
            <View>
              <LayananKami />
              <ServicesCard />
            </View>
          )}
          keyExtractor={(item) => item.key}
          contentContainerStyle={styles.container}
          showsVerticalScrollIndicator={false}
        />
      </SafeAreaView>
    </TabTransition>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    paddingBottom: -35,
  },
  backgroundSection: {
    paddingHorizontal: 24,
    paddingTop: 20,
    paddingBottom: 20,
  },
  container: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: Platform.OS === "ios" ? 50 : 0,
  },
});
