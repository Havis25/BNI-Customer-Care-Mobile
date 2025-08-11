import { ThemedText } from "@/components/ThemedText";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { router } from "expo-router";
import React from "react";
import { Image, StyleSheet, TouchableOpacity, View } from "react-native";

interface HeaderProps {
  title?: string;
  showLogout?: boolean;
  showLogo?: boolean;
}

export default function Header({
  title,
  showLogout = false,
  showLogo = false,
}: HeaderProps) {
  return (
    <View style={styles.header}>
      {showLogo ? (
        <Image
          source={require("@/assets/images/log-bcare.png")}
          style={styles.logo}
          resizeMode="contain"
        />
      ) : (
        <ThemedText style={styles.headerTitle}>{title}</ThemedText>
      )}

      {showLogout && (
        <View style={styles.rightIcons}>
          <TouchableOpacity style={styles.notificationIcon}>
            <MaterialIcons name="notifications" size={22} color="#333" />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.logoutButton}
            onPress={() => router.replace("/login")}
          >
            <MaterialIcons
              name="logout"
              size={16}
              color="white"
              style={styles.logoutIcon}
            />
            <ThemedText style={styles.logoutText}>Keluar</ThemedText>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: "#E0EE59",
  },
  logo: {
    width: 120,
    height: 40,
  },
  headerTitle: {
    color: "#333",
    fontSize: 20,
    fontWeight: "bold",
  },
  rightIcons: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  notificationIcon: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: "transparent",
    justifyContent: "center",
    alignItems: "center",
  },

  logoutButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#52B5AB",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  logoutIcon: {
    marginRight: 6,
  },
  logoutText: {
    fontSize: 12,
    color: "white",
    fontWeight: "600",
  },
});
