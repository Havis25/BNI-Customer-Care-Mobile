import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import React, { useEffect } from "react";
import {
  ActivityIndicator,
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useTicketDetail } from "@/hooks/useTicketDetail";

type TicketSummaryModalProps = {
  visible: boolean;
  onClose: () => void;
  ticketId?: string | number;
};

export default function TicketSummaryModal({ visible, onClose, ticketId }: TicketSummaryModalProps) {
  const { ticketDetail, isLoading, error, fetchTicketDetail } = useTicketDetail();
  
  useEffect(() => {
    if (visible && ticketId) {
      fetchTicketDetail(ticketId);
    }
  }, [visible, ticketId, fetchTicketDetail]);
  
  const formatAmount = (amount?: number) => {
    if (!amount) return null;
    return `Rp ${amount.toLocaleString('id-ID')}`;
  };
  
  const formatDate = (dateString?: string) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('id-ID', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };
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
          
          {isLoading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#52B5AB" />
              <Text style={styles.loadingText}>Memuat data tiket...</Text>
            </View>
          ) : error ? (
            <View style={styles.errorContainer}>
              <MaterialIcons name="error-outline" size={40} color="#FF5252" />
              <Text style={styles.errorText}>Gagal memuat data tiket</Text>
            </View>
          ) : ticketDetail ? (
            <View style={styles.ticketSummary}>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Nomor Tiket:</Text>
                <Text style={styles.summaryValue}>{ticketDetail.ticket_number}</Text>
              </View>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>No Rekening:</Text>
                <Text style={styles.summaryValue} numberOfLines={1}>{ticketDetail.related_account?.account_number || '-'}</Text>
              </View>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Channel:</Text>
                <Text style={styles.summaryValue} numberOfLines={1}>{ticketDetail.issue_channel?.channel_name || '-'}</Text>
              </View>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Category:</Text>
                <Text style={[styles.summaryValue, styles.categoryValue]} numberOfLines={2}>{ticketDetail.complaint?.complaint_name || '-'}</Text>
              </View>
              {ticketDetail.amount && (
                <View style={styles.summaryRow}>
                  <Text style={styles.summaryLabel}>Nominal:</Text>
                  <Text style={styles.summaryValue} numberOfLines={1}>{formatAmount(ticketDetail.amount)}</Text>
                </View>
              )}
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Status:</Text>
                <Text style={[styles.summaryValue, styles.statusPending]} numberOfLines={1}>{ticketDetail.customer_status?.customer_status_name || 'Menunggu Validasi'}</Text>
              </View>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Tanggal:</Text>
                <Text style={styles.summaryValue} numberOfLines={1}>{formatDate(ticketDetail.created_time)}</Text>
              </View>
              {ticketDetail.description && (
                <View style={styles.descriptionContainer}>
                  <Text style={styles.summaryLabel}>Deskripsi:</Text>
                  <Text style={styles.descriptionText}>{ticketDetail.description}</Text>
                </View>
              )}
            </View>
          ) : (
            <View style={styles.errorContainer}>
              <MaterialIcons name="info-outline" size={40} color="#FFC107" />
              <Text style={styles.errorText}>Data tiket tidak ditemukan</Text>
            </View>
          )}

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
    alignItems: "flex-start",
    marginBottom: 8,
    minHeight: 20,
  },
  summaryLabel: {
    fontSize: 14,
    color: "#666",
    fontFamily: "Poppins",
    minWidth: "35%",
    maxWidth: "40%",
  },
  summaryValue: {
    fontSize: 14,
    fontWeight: "600",
    color: "#333",
    fontFamily: "Poppins",
    flex: 1,
    textAlign: "right",
  },
  categoryValue: {
    textAlign: "right",
    flexWrap: "wrap",
    maxWidth: "60%",
    lineHeight: 18,
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
  loadingContainer: {
    alignItems: "center",
    paddingVertical: 40,
  },
  loadingText: {
    fontSize: 14,
    color: "#666",
    fontFamily: "Poppins",
    marginTop: 12,
  },
  errorContainer: {
    alignItems: "center",
    paddingVertical: 40,
  },
  errorText: {
    fontSize: 14,
    color: "#666",
    fontFamily: "Poppins",
    marginTop: 12,
    textAlign: "center",
  },
});