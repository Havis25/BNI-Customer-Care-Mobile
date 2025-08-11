import { ThemedText } from "@/components/ThemedText";
import React from "react";
import { StyleSheet, View } from "react-native";
import ComplaintCard from "./ComplaintCard";
import FAQCard from "./FAQCard";

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
    marginBottom: 20,
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 15,
  },
});
