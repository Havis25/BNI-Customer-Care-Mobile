import { ThemedText } from "@/components/ThemedText";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import React from "react";
import { StyleSheet, View } from "react-native";

export default function WelcomeCard() {
  return (
    <View style={styles.welcomeContainer}>
      <View style={styles.textContainer}>
        <ThemedText style={styles.greeting}>Halo Admin</ThemedText>
        <ThemedText style={styles.question}>
          Ada yang bisa kami bantu?
        </ThemedText>
      </View>
      <View style={styles.profileContainer}>
        <MaterialIcons name="account-circle" size={50} color="#333" />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  welcomeContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 25,
    paddingHorizontal: 5,
  },
  textContainer: {
    flex: 1,
  },
  greeting: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 4,
  },
  question: {
    fontSize: 16,
    color: "#666",
  },
  profileContainer: {
    marginLeft: 15,
  },
});
