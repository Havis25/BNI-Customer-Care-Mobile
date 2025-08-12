import { ThemedText } from "@/components/ThemedText";
import { Fonts } from "@/constants/Fonts";
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
        <ThemedText style={styles.cardArrow}>
          <MaterialIcons name="arrow-forward-ios" size={18} color="black" />
        </ThemedText>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  complaintCard: {
    backgroundColor: "white",
    borderRadius: 12,
    padding: 25,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#D9D9D9",
  },

  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
  },

  iconContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: "#2196F3",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 24,
  },

  cardTextContainer: {
    flex: 1,
  },

  cardTitle: {
    color: "black",
    fontSize: 16,
    fontFamily: Fonts.semiBold,
  },
  cardSubtitle: {
    color: "black",
    fontSize: 12,
    opacity: 0.7,
    lineHeight: 17,
    marginRight: 24,
  },
  cardArrow: {
    fontSize: 20,
    color: "black",
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
