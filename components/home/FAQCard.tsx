import { ThemedText } from "@/components/ThemedText";
import { Fonts } from "@/constants/Fonts";
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
        <MaterialIcons name="arrow-forward-ios" size={18} color="black" />
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  faqCard: {
    backgroundColor: "white",
    borderRadius: 12,
    padding: 24,
    // marginBottom: 16,
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
    backgroundColor: "#D32F2F",
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
