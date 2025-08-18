import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import React from "react";
import {
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

type TicketSummaryModalProps = {
  visible: boolean;
  onClose: () => void;
};

export default function TicketSummaryModal({ visible, onClose }: TicketSummaryModalProps) {
  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
    >
      <View style={styles.modalOverlay}>
        <View style={styles.ticketModal}>
          <MaterialIcons name="check-circle" size={60} color="#4CAF50" />
          <Text style={styles.modalTitle}>Tiket Berhasil Dibuat!</Text>
          
          <View style={styles.ticketSummary}>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Nomor Tiket:</Text>
              <Text style={styles.summaryValue}>#TKT{Date.now().toString().slice(-6)}</Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Status:</Text>
              <Text style={[styles.summaryValue, styles.statusPending]}>Menunggu Validasi</Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Tanggal:</Text>
              <Text style={styles.summaryValue}>{new Date().toLocaleDateString('id-ID')}</Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Waktu:</Text>
              <Text style={styles.summaryValue}>{new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}</Text>
            </View>
          </View>

          <TouchableOpacity
            style={styles.closeTicketButton}
            onPress={onClose}
          >
            <Text style={styles.closeTicketButtonText}>Tutup</Text>
          </TouchableOpacity>
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
  ticketModal: {
    backgroundColor: "#FFF",
    padding: 30,
    borderRadius: 20,
    alignItems: "center",
    width: 320,
    maxWidth: "90%",
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
    marginTop: 16,
    textAlign: "center",
    fontFamily: "Poppins",
  },
  ticketSummary: {
    width: "100%",
    marginVertical: 20,
    padding: 16,
    backgroundColor: "#F8F9FA",
    borderRadius: 12,
  },
  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  summaryLabel: {
    fontSize: 14,
    color: "#666",
    fontFamily: "Poppins",
  },
  summaryValue: {
    fontSize: 14,
    fontWeight: "600",
    color: "#333",
    fontFamily: "Poppins",
  },
  statusPending: {
    color: "#FF8636",
  },
  closeTicketButton: {
    backgroundColor: "#52B5AB",
    paddingHorizontal: 30,
    paddingVertical: 12,
    borderRadius: 25,
    width: "100%",
    alignItems: "center",
  },
  closeTicketButtonText: {
    color: "#FFF",
    fontSize: 16,
    fontWeight: "bold",
    fontFamily: "Poppins",
  },
});