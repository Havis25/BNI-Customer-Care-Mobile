// app/(tabs)/_layout.tsx
import { Fonts } from "@/constants/Fonts";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import type { BottomTabBarProps } from "@react-navigation/bottom-tabs";
import { Tabs } from "expo-router";
import React, { useRef } from "react";
import {
  Animated,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const ACTIVE_COLOR = "#FF6600";
const INACTIVE_COLOR = "#999999";
const ACTIVE_BG = "#FFF1E8";

// Tinggi bar kustom (sinkron dengan style di CustomTabBar)
const BAR_HEIGHT = Platform.OS === "ios" ? 95 : 70;

// Warna “backdrop” yang mengisi sudut membulat tabbar agar tidak hitam di dark-mode OS
const TABBAR_BACKDROP = "#FFFFFF";

function CustomTabBar({ state, descriptors, navigation }: BottomTabBarProps) {
  const insets = useSafeAreaInsets();

  return (
    <View style={styles.tabBarWrapper} pointerEvents="box-none">
      {/* Backdrop penuh di bawah tabbar: menghilangkan warna hitam di belakang sudut membulat */}
      <View
        pointerEvents="none"
        style={[
          styles.backdropFill,
          {
            // height: BAR_HEIGHT + insets.bottom,
            backgroundColor: TABBAR_BACKDROP,
          },
        ]}
      />

      {/* Kartu tabbar */}
      <View
        style={[
          styles.tabBar,
          {
            paddingBottom: Math.max(
              insets.bottom * 0.6,
              Platform.OS === "ios" ? 16 : 12
            ),
            height: BAR_HEIGHT,
          },
        ]}
      >
        <View style={styles.itemsRow}>
          {state.routes.map((route, index) => {
            const { options } = descriptors[route.key];
            const rawLabel = options.tabBarLabel ?? options.title ?? route.name;
            const label = typeof rawLabel === "string" ? rawLabel : route.name;
            const isFocused = state.index === index;

            const onPress = () => {
              const event = navigation.emit({
                type: "tabPress",
                target: route.key,
                canPreventDefault: true,
              });
              if (!isFocused && !event.defaultPrevented) {
                navigation.navigate(route.name as never);
              }
            };

            const onLongPress = () => {
              navigation.emit({ type: "tabLongPress", target: route.key });
            };

            const color = isFocused ? ACTIVE_COLOR : INACTIVE_COLOR;
            const size = isFocused ? 30 : 26;

            const icon =
              typeof options.tabBarIcon === "function"
                ? options.tabBarIcon({ focused: isFocused, color, size })
                : null;

            // Animasi kecil saat tap icon
            const scaleAnim = useRef(new Animated.Value(1)).current;
            const handlePressIn = () => {
              Animated.spring(scaleAnim, {
                toValue: 0.95,
                useNativeDriver: true,
              }).start();
            };
            const handlePressOut = () => {
              Animated.spring(scaleAnim, {
                toValue: 1,
                useNativeDriver: true,
              }).start();
            };

            return (
              <Animated.View
                key={route.key}
                style={[styles.itemTouchable, { transform: [{ scale: scaleAnim }] }]}
              >
                <TouchableOpacity
                  accessibilityRole="button"
                  accessibilityState={isFocused ? { selected: true } : {}}
                  accessibilityLabel={(options.tabBarAccessibilityLabel as string) ?? label}
                  testID={`tab-${route.name}`}
                  onPress={onPress}
                  onLongPress={onLongPress}
                  onPressIn={handlePressIn}
                  onPressOut={handlePressOut}
                  style={styles.itemInnerTouchable}
                  activeOpacity={0.8}
                  hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                >
                  <View
                    style={[
                      styles.itemInner,
                      isFocused && {
                        backgroundColor: ACTIVE_BG,
                        paddingHorizontal: 14,
                        paddingVertical: 8,
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
              </Animated.View>
            );
          })}
        </View>
      </View>
    </View>
  );
}

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: { display: "none" },
        tabBarHideOnKeyboard: true,
        // bikin konten scene transparan supaya nggak “ngecat” hitam saat OS dark-mode
        // @ts-expect-error expo-router belum expose typing ini
        sceneContainerStyle: { paddingBottom: BAR_HEIGHT, backgroundColor: "transparent" },
      }}
      tabBar={(props) => <CustomTabBar {...props} />}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Beranda",
          tabBarIcon: ({ color, size }) => (
            <MaterialIcons name="home" size={24} color={color} />
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
              size={24}
              color={color}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="notification"
        options={{
          title: "Notifikasi",
          tabBarIcon: ({ color, size, focused }) => (
            <MaterialIcons
              name={focused ? "notifications" : "notifications-none"}
              size={24}
              color={color}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: "Profil",
          tabBarIcon: ({ color, size, focused }) => (
            <MaterialIcons
              name={focused ? "person" : "person-outline"}
              size={24}
              color={color}
            />
          ),
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  // bikin tabbar absolut di bawah layar
  tabBarWrapper: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
  },
  // pengisi area di belakang sudut tabbar (menghapus hitam)
  backdropFill: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
  },
  tabBar: {
    backgroundColor: "#FFFFFF",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    borderTopWidth: 0,
    paddingTop: 14,
    elevation: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  itemsRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-around",
    paddingHorizontal: 13,
  },
  itemTouchable: {
    flex: 1,
    alignItems: "center",
  },
  itemInnerTouchable: {
    alignItems: "center",
  },
  itemInner: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 999,
  },
  iconOnly: {
    marginHorizontal: 0,
  },
  activeLabel: {
    fontSize: 12,
    // fontWeight: "600",
    marginLeft: 6,
    fontFamily: Fonts.semiBold,
  },
});
