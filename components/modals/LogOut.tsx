import { Fonts } from "@/constants/Fonts";
import React from "react";
import {
  Modal,
  View,
  Text,
  Pressable,
  StyleSheet,
  Platform,
} from "react-native";

type Props = {
  visible: boolean;
  onCancel: () => void;
  onConfirm: () => void;
  message?: string;
  confirmText?: string;
  cancelText?: string;
};

const COLORS = {
  primary: "#55B6AC", // hijau tosca
  white: "#FFFFFF",
  text: "#1A1A1A",
  overlay: "rgba(0,0,0,0.6)",
  border: "#55B6AC",
};

export default function LogoutModal({
  visible,
  onCancel,
  onConfirm,
  message = "Are you sure want to log out?",
  confirmText = "Log out",
  cancelText = "Cancel",
}: Props) {
  return (
    <Modal
      transparent
      animationType="fade"
      visible={visible}
      statusBarTranslucent
      onRequestClose={onCancel}
    >
      <View style={styles.backdrop}>
        <View style={styles.card} accessibilityRole="alert">
          <View style={styles.messageBox}>
            <Text style={styles.message}>{message}</Text>
          </View>
          <View style={styles.actions}>
            <Pressable
              onPress={onCancel}
              style={({ pressed }) => [
                styles.btn,
                styles.btnOutline,
                styles.btnLeftSpacing,
                pressed && styles.pressed,
              ]}
              android_ripple={{ color: "rgba(0,0,0,0.06)" }}
              accessibilityRole="button"
              accessibilityLabel={cancelText}
            >
              <Text style={styles.btnOutlineText}>{cancelText}</Text>
            </Pressable>

            <Pressable
              onPress={onConfirm}
              style={({ pressed }) => [
                styles.btn,
                styles.btnSolid,
                pressed && styles.pressed,
              ]}
              android_ripple={{ color: "rgba(255,255,255,0.15)" }}
              accessibilityRole="button"
              accessibilityLabel={confirmText}
            >
              <Text style={styles.btnSolidText}>{confirmText}</Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: COLORS.overlay,
    padding: 18,
    justifyContent: "center",
  },
  card: {
    backgroundColor: COLORS.white,
    borderRadius: 5,
    paddingVertical: 22,
    paddingHorizontal: 20,
    shadowColor: "#000",
    shadowOpacity: 0.15,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 6,
  },
  messageBox: {
    height: 70,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 18,
    paddingHorizontal: 4,
  },
  message: {
    fontSize: 18,
    lineHeight: 27,
    color: COLORS.text,
    textAlign: "center",
    
    fontFamily: Fonts.medium,
    // fontWeight: "600",
  },
  actions: {
    flexDirection: "row",
  },
  btn: {
    flex: 1,
    height: 45,
    borderRadius: 5,
    alignItems: "center",
    justifyContent: "center",
  },
  btnLeftSpacing: { marginRight: 12 },
  btnOutline: {
    borderWidth: 1.5,
    borderColor: COLORS.border,
    backgroundColor: "transparent",
  },
  btnSolid: {
    backgroundColor: COLORS.primary,
  },
  btnOutlineText: {
    color: COLORS.primary,
    fontSize: 16,
    fontFamily: Fonts.semiBold,
    // fontWeight: "700",
  },
  btnSolidText: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: "700",
  },
  pressed: {
    transform: [{ scale: 0.99 }],
    opacity: Platform.OS === "ios" ? 0.9 : 1,
  },
});
