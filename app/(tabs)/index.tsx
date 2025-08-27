import LayananKami from "@/components/home/LayananKami";
import ServicesCard from "@/components/home/ServicesCard";
import WelcomeCard from "@/components/home/WelcomeCard";
import TabTransition from "@/components/TabTransition";
import { useUserActivity } from "@/hooks/useUserActivity";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { LinearGradient } from "expo-linear-gradient";
import React, { useCallback, useEffect, useState } from "react";
import {
  FlatList,
  Platform,
  RefreshControl,
  StyleSheet,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function HomeScreen() {
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const { trackActivity } = useUserActivity();

  const initializeHome = useCallback(async () => {
    const startTime = Date.now();

    try {
      // Check if user data exists
      await AsyncStorage.getItem("customer");

      // Minimum 1 second skeleton display
      const elapsed = Date.now() - startTime;
      const minDelay = 1000;

      if (elapsed < minDelay) {
        setTimeout(() => setIsLoading(false), minDelay - elapsed);
      } else {
        setIsLoading(false);
      }
    } catch {
      setIsLoading(false);
    }
  }, []);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    setIsLoading(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 1000));
    } finally {
      setRefreshing(false);
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    initializeHome();
  }, [initializeHome]);

  if (isLoading) {
    return (
      <TabTransition>
        <SafeAreaView style={styles.safeArea}>
          <LinearGradient
            colors={["#DEEF5A", "#FCFDEE"]}
            locations={[0.23, 0.37]}
            style={StyleSheet.absoluteFill}
          />
          <View style={styles.backgroundSection}>
            <HomeSkeleton />
          </View>
        </SafeAreaView>
      </TabTransition>
    );
  }

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
          onScroll={() => trackActivity()} // Track activity saat scroll
          scrollEventThrottle={1000} // Throttle untuk performa
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={() => {
                trackActivity(); // Track activity saat pull to refresh
                onRefresh();
              }}
              colors={["#52B5AB"]}
              tintColor="#52B5AB"
            />
          }
        />
      </SafeAreaView>
    </TabTransition>
  );
}

function HomeSkeleton() {
  return (
    <View>
      {/* Welcome Card Skeleton */}
      <View style={styles.welcomeSkeleton}>
        <View style={styles.welcomeTextSkeleton}>
          <View style={styles.skeletonGreeting} />
          <View style={styles.skeletonQuestion} />
        </View>
        <View style={styles.skeletonProfile} />
      </View>

      {/* Layanan Kami Skeleton */}
      <View style={styles.layananKamiSkeleton}>
        <View style={styles.skeletonTitle} />
        <View style={styles.layananItemSkeleton}>
          <View style={styles.skeletonLayananIcon} />
          <View style={styles.skeletonLayananText} />
        </View>
        <View style={styles.layananItemSkeleton}>
          <View style={styles.skeletonLayananIcon} />
          <View style={styles.skeletonLayananText} />
        </View>
      </View>

      {/* Layanan BNI Skeleton */}
      <View style={styles.servicesSkeleton}>
        <View style={styles.skeletonTitle} />
        <View style={styles.servicesGridSkeleton}>
          {[1, 2, 3, 4, 5, 6].map((item) => (
            <View key={item} style={styles.serviceItemSkeleton}>
              <View style={styles.skeletonServiceIcon} />
              <View style={styles.skeletonServiceName} />
            </View>
          ))}
        </View>
      </View>
    </View>
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
  welcomeSkeleton: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 5,
    marginBottom: 20,
  },
  welcomeTextSkeleton: {
    flex: 1,
  },
  skeletonGreeting: {
    width: "60%",
    height: 16,
    backgroundColor: "#E5E5E5",
    borderRadius: 8,
    marginBottom: 8,
  },
  skeletonQuestion: {
    width: "80%",
    height: 14,
    backgroundColor: "#E5E5E5",
    borderRadius: 8,
  },
  skeletonProfile: {
    width: 55,
    height: 55,
    backgroundColor: "#E5E5E5",
    borderRadius: 27.5,
    marginLeft: 15,
  },
  layananKamiSkeleton: {
    backgroundColor: "white",
    borderRadius: 16,
    padding: 16,
    marginHorizontal: -8,
    marginBottom: 14,
  },
  layananItemSkeleton: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  skeletonLayananIcon: {
    width: 40,
    height: 40,
    backgroundColor: "#E5E5E5",
    borderRadius: 8,
    marginRight: 12,
  },
  skeletonLayananText: {
    flex: 1,
    height: 14,
    backgroundColor: "#E5E5E5",
    borderRadius: 6,
  },
  servicesSkeleton: {
    backgroundColor: "white",
    borderRadius: 16,
    padding: 16,
    marginHorizontal: -8,
  },
  skeletonTitle: {
    width: "40%",
    height: 16,
    backgroundColor: "#E5E5E5",
    borderRadius: 8,
    marginBottom: 20,
  },
  servicesGridSkeleton: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  serviceItemSkeleton: {
    width: "30%",
    alignItems: "center",
    marginBottom: 24,
  },
  skeletonServiceIcon: {
    width: 50,
    height: 50,
    backgroundColor: "#E5E5E5",
    borderRadius: 12,
    marginBottom: 8,
  },
  skeletonServiceName: {
    width: "80%",
    height: 12,
    backgroundColor: "#E5E5E5",
    borderRadius: 6,
  },
});
