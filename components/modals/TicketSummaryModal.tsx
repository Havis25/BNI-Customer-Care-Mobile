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
  ticketData?: {
    ticketNumber?: string;
    accountNumber?: string;
    channelName?: string;
    categoryName?: string;
    description?: string;
    status?: string;
    createdDate?: string;
  };
};

export default function TicketSummaryModal({ visible, onClose, ticketData }: TicketSummaryModalProps) {
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
              <Text style={styles.summaryValue}>{ticketData?.ticketNumber || `#TKT${Date.now().toString().slice(-6)}`}</Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>No Rekening:</Text>
              <Text style={styles.summaryValue}>{ticketData?.accountNumber || '-'}</Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Channel:</Text>
              <Text style={styles.summaryValue}>{ticketData?.channelName || '-'}</Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Category:</Text>
              <Text style={styles.summaryValue}>{ticketData?.categoryName || '-'}</Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Status:</Text>
              <Text style={[styles.summaryValue, styles.statusPending]}>{ticketData?.status || 'Menunggu Validasi'}</Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Tanggal:</Text>
              <Text style={styles.summaryValue}>{ticketData?.createdDate || new Date().toLocaleDateString('id-ID')}</Text>
            </View>
            {ticketData?.description && (
              <View style={styles.descriptionContainer}>
                <Text style={styles.summaryLabel}>Deskripsi:</Text>
                <Text style={styles.descriptionText}>{ticketData.description}</Text>
              </View>
            )}
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
  descriptionContainer: {
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: "#E0E0E0",
  },
  descriptionText: {
    fontSize: 14,
    color: "#333",
    fontFamily: "Poppins",
    marginTop: 4,
    lineHeight: 20,
  },
});