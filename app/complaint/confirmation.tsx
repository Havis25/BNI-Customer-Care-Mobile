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
  Modal,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function ConfirmationScreen() {
  const [isChecked, setIsChecked] = useState(false);
  const [showCallModal, setShowCallModal] = useState(false);
  const [callStatus, setCallStatus] = useState('incoming');

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <MaterialIcons name="arrow-back" size={24} color="#000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Form Complain</Text>
        <View style={{ width: 40 }} />
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

        {/* Button */}
        <TouchableOpacity
          style={[
            styles.submitButton,
            isChecked ? styles.enabledButton : styles.disabledButton,
          ]}
          disabled={!isChecked}
          onPress={() => {
            if (isChecked) {
              setShowCallModal(true);
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
      </ScrollView>

      {/* Call Modal */}
      <Modal
        visible={showCallModal}
        transparent={true}
        animationType="fade"
      >
        <View style={styles.modalOverlay}>
          <View style={styles.callModal}>
            <MaterialIcons name="account-circle" size={80} color="#666" />
            <Text style={styles.callerName}>BNI Agent</Text>
            <Text style={styles.callStatus}>
              {callStatus === 'incoming' ? 'Panggilan Masuk...' : 
               callStatus === 'active' ? 'Sedang Terhubung' : 'Panggilan Berakhir'}
            </Text>
            
            {callStatus === 'incoming' && (
              <View style={styles.callButtons}>
                <TouchableOpacity 
                  style={styles.declineButton}
                  onPress={() => {
                    setCallStatus('ended');
                    setTimeout(() => {
                      setShowCallModal(false);
                      router.push('/complaint/chat?callDeclined=true');
                    }, 1500);
                  }}
                >
                  <MaterialIcons name="call-end" size={30} color="#FFF" />
                </TouchableOpacity>
                
                <TouchableOpacity 
                  style={styles.acceptButton}
                  onPress={() => {
                    setCallStatus('active');
                    setTimeout(() => {
                      setCallStatus('ended');
                      setTimeout(() => {
                        setShowCallModal(false);
                        router.push('/complaint/chat');
                      }, 1500);
                    }, 3000);
                  }}
                >
                  <MaterialIcons name="call" size={30} color="#FFF" />
                </TouchableOpacity>
              </View>
            )}
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#E0E0E0",
  },
  backButton: { padding: 8 },
  headerTitle: { fontSize: 18, fontWeight: "600", color: "#000" },
  content: { flex: 1, padding: 16 },

  warningBox: {
    flexDirection: "row",
    backgroundColor: "#FFF8E1",
    padding: 12,
    borderRadius: 8,
    marginBottom: 20,
    alignItems: "center",
  },
  warningText: {
    flex: 1,
    marginLeft: 8,
    fontSize: 14,
    color: "#333",
  },

  fieldContainer: { marginBottom: 16 },
  label: { fontSize: 14, fontWeight: "500", marginBottom: 8 },
  textInput: {
    backgroundColor: "#F0F0F0",
    padding: 12,
    borderRadius: 8,
    fontSize: 14,
    color: "#333",
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
  checkboxText: { flex: 1, fontSize: 14, color: "#333" },

  submitButton: { padding: 16, borderRadius: 8, alignItems: "center" },
  enabledButton: { backgroundColor: "#52B5AB" },
  disabledButton: { backgroundColor: "#E0E0E0" },
  submitText: { fontSize: 16, fontWeight: "bold" },
  enabledText: { color: "#FFF" },
  disabledText: { color: "#999" },
  
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.8)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  callModal: {
    backgroundColor: '#FFF',
    padding: 40,
    borderRadius: 20,
    alignItems: 'center',
    width: 300,
  },
  callerName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 16,
  },
  callStatus: {
    fontSize: 16,
    color: '#666',
    marginTop: 8,
    marginBottom: 30,
  },
  callButtons: {
    flexDirection: 'row',
    gap: 40,
  },
  acceptButton: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#4CAF50',
    justifyContent: 'center',
    alignItems: 'center',
  },
  declineButton: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#F44336',
    justifyContent: 'center',
    alignItems: 'center',
  },
});
