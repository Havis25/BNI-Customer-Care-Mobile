import React from 'react';
import { Modal, View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { router } from 'expo-router';

interface CallModalProps {
  visible: boolean;
  callStatus: string;
  onStatusChange: (status: string) => void;
  onClose: () => void;
}

export default function CallModal({ visible, callStatus, onStatusChange, onClose }: CallModalProps) {
  return (
    <Modal visible={visible} transparent={true} animationType="fade">
      <View style={styles.modalOverlay}>
        <View style={styles.callModal}>
          <MaterialIcons name="account-circle" size={80} color="#666" />
          <Text style={styles.callerName}>BNI Agent</Text>
          <Text style={styles.callStatus}>
            {callStatus === "incoming"
              ? "Panggilan Masuk..."
              : callStatus === "active"
              ? "Sedang Terhubung"
              : "Panggilan Berakhir"}
          </Text>

          {callStatus === "incoming" && (
            <View style={styles.callButtons}>
              <TouchableOpacity
                style={styles.declineButton}
                onPress={() => {
                  onStatusChange("ended");
                  setTimeout(() => {
                    onClose();
                    router.push("/complaint/chat?callDeclined=true");
                  }, 1500);
                }}
              >
                <MaterialIcons name="call-end" size={30} color="#FFF" />
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.acceptButton}
                onPress={() => {
                  onClose();
                  router.push("/complaint/call");
                }}
              >
                <MaterialIcons name="call" size={30} color="#FFF" />
              </TouchableOpacity>
            </View>
          )}
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.8)",
    justifyContent: "center",
    alignItems: "center",
  },
  callModal: {
    backgroundColor: "#FFF",
    padding: 40,
    borderRadius: 20,
    alignItems: "center",
    width: 300,
  },
  callerName: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#333",
    marginTop: 16,
    fontFamily: "Poppins",
  },
  callStatus: {
    fontSize: 16,
    color: "#666",
    marginTop: 8,
    marginBottom: 30,
    fontFamily: "Poppins",
  },
  callButtons: {
    flexDirection: "row",
    gap: 40,
  },
  acceptButton: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "#4CAF50",
    justifyContent: "center",
    alignItems: "center",
  },
  declineButton: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "#F44336",
    justifyContent: "center",
    alignItems: "center",
  },
});