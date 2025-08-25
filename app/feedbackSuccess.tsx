import React from "react";
import { StyleSheet, Text, View, Pressable } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import SuccessCheck from "@/components/SuccessCheck";
import { wp, hp, rf, deviceType } from "@/utils/responsive";

const COLORS = {
  primary: "#52B5AB",
  textDark: "#22413F",
  textMuted: "#396D6A",
  white: "#FFFFFF",
};

export default function FeedbackSuccess() {
  return (
    <SafeAreaView style={styles.container} edges={["top", "bottom"]}>
      <View style={styles.content}>
        <SuccessCheck size={116} bgColor={COLORS.primary} />

        <Text style={styles.title}>Feedback Terkirim</Text>
        <Text style={styles.subtitle}>
          Terima kasih atas feedback yang telah Anda berikan. Kami akan segera
          memprosesnya.
        </Text>
      </View>

      <View style={styles.footer}>
        <Pressable
          onPress={() => router.replace("/(tabs)")} // balik ke homepage (tabs)
          style={({ pressed }) => [
            styles.button,
            pressed && { opacity: 0.9, transform: [{ scale: 0.99 }] },
          ]}
          android_ripple={{ color: "rgba(0,0,0,0.06)" }}
          accessibilityRole="button"
          accessibilityLabel="Kembali"
        >
          <Text style={styles.buttonText}>Kembali</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.white },
  content: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: wp(7),
  },
  title: {
    fontSize: rf(26),
    fontWeight: "800",
    color: COLORS.textDark,
    marginTop: hp(3.5),
    marginBottom: hp(1),
    textAlign: "center",
  },
  subtitle: {
    fontSize: rf(14),
    lineHeight: rf(20),
    textAlign: "center",
    color: COLORS.textMuted,
    maxWidth: deviceType.isTablet ? wp(60) : wp(80),
  },
  footer: { paddingHorizontal: wp(5), paddingBottom: hp(2) },
  button: {
    height: hp(6.5),
    borderRadius: 5,
    backgroundColor: COLORS.primary,
    alignItems: "center",
    justifyContent: "center",
  },
  buttonText: { color: COLORS.white, fontSize: rf(16), fontWeight: "700" },
});
