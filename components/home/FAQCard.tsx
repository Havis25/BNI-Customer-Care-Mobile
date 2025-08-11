import { ThemedText } from "@/components/ThemedText";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { router } from "expo-router";
import React from "react";
import { StyleSheet, TouchableOpacity, View } from "react-native";

export default function FAQCard() {
  return (
    <TouchableOpacity
      style={styles.faqCard}
      onPress={() => router.push("/faq")}
    >
      <View style={styles.cardHeader}>
        <View style={styles.iconContainer}>
          <MaterialIcons name="question-answer" size={24} color="white" />
        </View>
        <View style={styles.cardTextContainer}>
          <ThemedText type="subtitle" style={styles.cardTitle}>
            Pertanyaan Umum
          </ThemedText>
          <ThemedText style={styles.cardSubtitle}>
            Lihat pertanyaan yang sering ditanyakan
          </ThemedText>
        </View>
        <ThemedText style={styles.cardArrow}>›</ThemedText>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  faqCard: {
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
    backgroundColor: "#D32F2F",
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
  faqPreview: {
    backgroundColor: "#FFF3E0",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 15,
    alignSelf: "flex-start",
    marginTop: 10,
  },
  faqPreviewText: {
    color: "#E65100",
    fontSize: 12,
    fontWeight: "bold",
  },
});
