import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { router } from "expo-router";
import React, { useState } from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import BottomSheet from "@/components/modals/BottomSheet";

export default function ConfirmationScreen() {
  const [isChecked, setIsChecked] = useState(false);
  const [showBottomSheet, setShowBottomSheet] = useState(false);

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Form Complain</Text>
      </View>

      <ScrollView style={styles.content}>
        {/* Warning Box */}
        <View style={styles.warningBox}>
          <MaterialIcons name="error-outline" size={20} color="#FFC107" />
          <Text style={styles.warningText}>
            Mohon periksa kembali semua data yang Anda isi pada formulir ini
            sebelum melanjutkan.
          </Text>
        </View>

        {/* Nama */}
        <View style={styles.fieldContainer}>
          <Text style={styles.label}>Nama</Text>
          <TextInput
            style={styles.textInput}
            value="User Complain"
            editable={false}
          />
        </View>

        {/* No Rekening */}
        <View style={styles.fieldContainer}>
          <Text style={styles.label}>No Rekening</Text>
          <TextInput
            style={styles.textInput}
            value="512372891238"
            editable={false}
          />
        </View>

        {/* Channel */}
        <View style={styles.fieldContainer}>
          <Text style={styles.label}>Channel</Text>
          <TextInput
            style={styles.textInput}
            value="Mobile Banking"
            editable={false}
          />
        </View>

        {/* Category */}
        <View style={styles.fieldContainer}>
          <Text style={styles.label}>Category</Text>
          <TextInput
            style={styles.textInput}
            value="Top Up Gopay"
            editable={false}
          />
        </View>

        {/* Deskripsi */}
        <View style={styles.fieldContainer}>
          <Text style={styles.label}>Deskripsi</Text>
          <TextInput
            style={[styles.textInput, styles.textArea]}
            value="Saya mencoba melakukan top up GoPay melalui Mobile Banking, tetapi transaksi gagal. Saldo rekening saya sudah terpotong, namun saldo GoPay tidak bertambah."
            multiline
            editable={false}
          />
        </View>

        {/* Checkbox */}
        <TouchableOpacity
          style={styles.checkboxContainer}
          onPress={() => setIsChecked(!isChecked)}
        >
          <View style={[styles.checkbox, isChecked && styles.checkboxChecked]}>
            {isChecked && <MaterialIcons name="check" size={16} color="#FFF" />}
          </View>
          <Text style={styles.checkboxText}>
            Saya telah memeriksa dan memastikan semua data yang diisi sudah
            benar.
          </Text>
        </TouchableOpacity>
      </ScrollView>

      {/* Buttons */}
      <View style={styles.buttonWrapper}>
        <View style={styles.buttonCard}>
          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={styles.backButton}
              onPress={() => setShowBottomSheet(true)}
            >
              <Text style={styles.backButtonText}>Kembali</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.submitButton,
                isChecked ? styles.enabledButton : styles.disabledButton,
              ]}
              disabled={!isChecked}
              onPress={() => {
                if (isChecked) {
                  router.push("/complaint/chat?fromConfirmation=true");
                }
              }}
            >
              <Text
                style={[
                  styles.submitText,
                  isChecked ? styles.enabledText : styles.disabledText,
                ]}
              >
                Selesai
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>

      <BottomSheet
        visible={showBottomSheet}
        onClose={() => setShowBottomSheet(false)}
        onConfirm={() => {
          setShowBottomSheet(false);
          router.back();
        }}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
  header: {
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#E0E0E0",
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#000",
    fontFamily: "Poppins",
  },
  content: { flex: 1, padding: 16 },

  warningBox: {
    flexDirection: "row",
    backgroundColor: "#FFF8E1",
    padding: 16,
    borderRadius: 8,
    marginBottom: 20,
    alignItems: "center",
    gap: 8,
  },
  warningText: {
    flex: 1,
    fontSize: 14,
    color: "#333",
    fontFamily: "Poppins",
  },

  fieldContainer: { marginBottom: 16 },
  label: {
    fontSize: 14,
    fontWeight: "500",
    marginBottom: 8,
    fontFamily: "Poppins",
  },
  textInput: {
    backgroundColor: "#F0F0F0",
    padding: 12,
    borderRadius: 8,
    fontSize: 14,
    color: "#333",
    fontFamily: "Poppins",
  },
  textArea: { minHeight: 80, textAlignVertical: "top" },

  checkboxContainer: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 20,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderWidth: 2,
    borderColor: "#999",
    borderRadius: 4,
    marginRight: 12,
    justifyContent: "center",
    alignItems: "center",
  },
  checkboxChecked: { backgroundColor: "#2196F3", borderColor: "#2196F3" },
  checkboxText: { flex: 1, fontSize: 14, color: "#333", fontFamily: "Poppins" },

  buttonWrapper: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    paddingVertical: 24,
  },
  buttonCard: {
    backgroundColor: "white",
    marginHorizontal: 16,
    borderRadius: 12,
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
    paddingTop: 16,
    paddingBottom: 42,
  },
  buttonContainer: {
    flexDirection: "row",
    gap: 12,
    paddingHorizontal: 16,
  },
  backButton: {
    flex: 1,
    padding: 16,
    borderRadius: 8,
    alignItems: "center",
    backgroundColor: "#E0E0E0",
  },
  backButtonText: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#666",
    fontFamily: "Poppins",
  },
  submitButton: {
    flex: 1,
    padding: 16,
    borderRadius: 8,
    alignItems: "center",
  },
  enabledButton: { backgroundColor: "#52B5AB" },
  disabledButton: { backgroundColor: "#E0E0E0" },
  submitText: { fontSize: 16, fontWeight: "bold", fontFamily: "Poppins" },
  enabledText: { color: "#FFF" },
  disabledText: { color: "#999" },
});
