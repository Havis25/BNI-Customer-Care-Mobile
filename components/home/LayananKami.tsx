import { ThemedText } from "@/components/ThemedText";
import React from "react";
import { StyleSheet, View } from "react-native";
import ComplaintCard from "./ComplaintCard";
import FAQCard from "./FAQCard";
import { Fonts } from "@/constants/Fonts";

export default function LayananKami() {
  return (
    <View style={styles.container}>
      <ThemedText style={styles.title}>Layanan Kami</ThemedText>
      <ComplaintCard />
      <FAQCard />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 14,
    backgroundColor: "white",
    padding: 16,
    borderRadius: 16
  },

  title: {
    fontSize: 16,
    fontFamily: Fonts.semiBold,
    color: "black",
    marginBottom: 16,
  },
});
