import { ThemedText } from "@/components/ThemedText";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { router } from "expo-router";
import React from "react";
import { StyleSheet, TouchableOpacity, View } from "react-native";

export default function ComplaintCard() {
  return (
    <TouchableOpacity
      style={styles.complaintCard}
      onPress={() => router.push("/complaint/chat" as any)}
    >
      <View style={styles.cardHeader}>
        <View style={styles.iconContainer}>
          <MaterialIcons name="edit-document" size={24} color="white" />
        </View>
        <View style={styles.cardTextContainer}>
          <ThemedText type="subtitle" style={styles.cardTitle}>
            Ajukan Laporan
          </ThemedText>
          <ThemedText style={styles.cardSubtitle}>
            Ajukan laporan kendala yang anda alami disini
          </ThemedText>
        </View>
        <ThemedText style={styles.cardArrow}>›</ThemedText>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  complaintCard: {
    backgroundColor: "white",
    borderRadius: 20,
    padding: 25,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: "#FFE4D6",
    shadowColor: "#E0EE59",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },
  iconContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: "#2196F3",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 15,
  },
  cardTextContainer: {
    flex: 1,
  },
  cardTitle: {
    color: "black",
    fontSize: 16,
    fontWeight: "bold",
  },
  cardSubtitle: {
    color: "black",
    fontSize: 12,
    opacity: 0.6,
    marginTop: 2,
  },
  cardArrow: {
    fontSize: 20,
    color: "#8E8E93",
  },
  chatbotIndicator: {
    backgroundColor: "#34C759",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 15,
    alignSelf: "flex-start",
  },
  chatbotText: {
    color: "white",
    fontSize: 12,
    fontWeight: "bold",
  },
});
