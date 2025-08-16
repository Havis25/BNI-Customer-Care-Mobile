// app/(tabs)/_layout.tsx
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import type { BottomTabBarProps } from "@react-navigation/bottom-tabs";
import { Tabs } from "expo-router";
import React from "react";
import {
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import {
  SafeAreaView,
  useSafeAreaInsets,
} from "react-native-safe-area-context";

const ACTIVE_COLOR = "#FF6600";
const INACTIVE_COLOR = "#999999";
const ACTIVE_BG = "#FFF1E8"; // pill aktif
const APP_BG = "#FFFFFF"; // latar app

function CustomTabBar({ state, descriptors, navigation }: BottomTabBarProps) {
  const insets = useSafeAreaInsets();

  return (
    // SafeArea bottom + background putih agar sudut bawah tidak gelap
    <SafeAreaView edges={["bottom"]} style={{ backgroundColor: APP_BG }}>
      <View style={[StyleSheet.absoluteFill, { backgroundColor: APP_BG }]} />

      <View
        style={[
          styles.tabBar,
          {
            paddingBottom: Math.max(
              insets.bottom * 0.5,
              Platform.OS === "ios" ? 10 : 8
            ),
            height: Platform.OS === "ios" ? 80 : 64, // sedikit lebih ramping
            backgroundColor: APP_BG,
          },
        ]}
      >
        <View style={styles.itemsRow}>
          {state.routes.map((route, index) => {
            const { options } = descriptors[route.key];

            const label =
              (options.tabBarLabel as string) ??
              (options.title as string) ??
              route.name;

            const isFocused = state.index === index;

            const onPress = () => {
              const event = navigation.emit({
                type: "tabPress",
                target: route.key,
                canPreventDefault: true,
              });
              if (!isFocused && !event.defaultPrevented) {
                navigation.navigate(route.name, route.params);
              }
            };

            const color = isFocused ? ACTIVE_COLOR : INACTIVE_COLOR;
            const size = isFocused ? 28 : 24;

            const icon =
              typeof options.tabBarIcon === "function"
                ? options.tabBarIcon({ focused: isFocused, color, size })
                : null;

            return (
              <TouchableOpacity
                key={route.key}
                accessibilityRole="button"
                accessibilityState={isFocused ? { selected: true } : {}}
                accessibilityLabel={
                  (options.tabBarAccessibilityLabel as string) ?? label
                }
                testID={`tab-${route.name}`}
                onPress={onPress}
                style={styles.itemTouchable}
                activeOpacity={0.8}
              >
                <View
                  style={[
                    styles.itemInner,
                    isFocused && {
                      backgroundColor: ACTIVE_BG,
                      paddingHorizontal: 12,
                      paddingVertical: 6,
                    },
                  ]}
                >
                  <View style={styles.iconOnly}>{icon}</View>
                  {isFocused && (
                    <Text style={[styles.activeLabel, { color: ACTIVE_COLOR }]}>
                      {label}
                    </Text>
                  )}
                </View>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>
    </SafeAreaView>
  );
}

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: { display: "none" }, // pakai custom tab bar
      }}
      tabBar={(props) => <CustomTabBar {...props} />}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Home",
          tabBarIcon: ({ color, size }) => (
            <MaterialIcons name="home" size={size ?? 24} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="riwayat"
        options={{
          title: "Riwayat",
          tabBarIcon: ({ color, size, focused }) => (
            <MaterialIcons
              name="history"
              size={size ?? (focused ? 28 : 24)}
              color={color}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="notification"
        options={{
          title: "Notification",
          tabBarIcon: ({ color, size, focused }) => (
            <MaterialIcons
              name={focused ? "notifications" : "notifications-none"}
              size={size ?? (focused ? 28 : 24)}
              color={color}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: "Profile",
          tabBarIcon: ({ color, size, focused }) => (
            <MaterialIcons
              name={focused ? "person" : "person-outline"}
              size={size ?? (focused ? 28 : 24)}
              color={color}
            />
          ),
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    // FLAT: tanpa bayangan supaya tidak “ngambang”
    shadowOpacity: 0,
    shadowRadius: 0,
    shadowOffset: { width: 0, height: 0 },
    elevation: 0,
    // rapat ke konten, beri garis pemisah tipis di atas
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: "#E6E6E6",
    paddingTop: 6,
  },
  itemsRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-around",
    paddingHorizontal: 12,
  },
  itemTouchable: {
    flex: 1,
    alignItems: "center",
  },
  itemInner: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 999,
  },
  iconOnly: {
    marginHorizontal: 4,
  },
  activeLabel: {
    fontSize: 12,
    fontWeight: "600",
    marginLeft: 6,
  },
});
