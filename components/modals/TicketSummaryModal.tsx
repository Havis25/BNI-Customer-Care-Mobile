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
import { useUser } from "@/hooks/useUser";
import { wp, hp, rf, deviceType } from "@/utils/responsive";

type TicketSummaryModalProps = {
  visible: boolean;
  onClose: () => void;
  ticketId?: string | number;
};

export default function TicketSummaryModal({ visible, onClose, ticketId }: TicketSummaryModalProps) {
  const { ticketDetail, isLoading, error, fetchTicketDetail } = useTicketDetail();
  const { user } = useUser();
  
  useEffect(() => {
    if (visible && ticketId) {
      console.log('Fetching ticket detail for ID:', ticketId);
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
                <Text style={[styles.summaryValue, styles.ticketNumberValue]}>
                  {ticketDetail.ticket_number || ticketDetail.ticket_id || 'Tidak tersedia'}
                </Text>
              </View>
              {ticketDetail.customer?.full_name && (
                <View style={styles.summaryRow}>
                  <Text style={styles.summaryLabel}>Nama:</Text>
                  <Text style={[styles.summaryValue, styles.nameValue]}>
                    {ticketDetail.customer.full_name}
                  </Text>
                </View>
              )}
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>No Rekening:</Text>
                <Text style={[styles.summaryValue, styles.accountValue]}>
                  {user?.selectedAccount?.account_number ? 
                   String(user.selectedAccount.account_number) : 
                   (ticketDetail.related_account?.account_number ? 
                    String(ticketDetail.related_account.account_number) : 
                    'Tidak tersedia')}
                </Text>
              </View>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Channel:</Text>
                <Text style={[styles.summaryValue, styles.channelValue]}>
                  {ticketDetail.issue_channel?.channel_name || 'Tidak tersedia'}
                </Text>
              </View>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Category:</Text>
                <Text style={[styles.summaryValue, styles.categoryValue]}>
                  {ticketDetail.complaint?.complaint_name || 'Tidak tersedia'}
                </Text>
              </View>
              {ticketDetail.amount && (
                <View style={styles.summaryRow}>
                  <Text style={styles.summaryLabel}>Nominal:</Text>
                  <Text style={[styles.summaryValue, styles.amountValue]}>{formatAmount(ticketDetail.amount)}</Text>
                </View>
              )}
              {ticketDetail.transaction_date && (
                <View style={styles.summaryRow}>
                  <Text style={styles.summaryLabel}>Tgl Transaksi:</Text>
                  <Text style={[styles.summaryValue, styles.transactionDateValue]}>
                    {new Date(ticketDetail.transaction_date).toLocaleDateString('id-ID', {
                      day: '2-digit',
                      month: 'short',
                      year: 'numeric'
                    })}
                  </Text>
                </View>
              )}
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Status:</Text>
                <Text style={[styles.summaryValue, styles.statusPending]}>
                  {ticketDetail.customer_status?.customer_status_name || 'Menunggu Validasi'}
                </Text>
              </View>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Tanggal:</Text>
                <Text style={styles.summaryValue}>{formatDate(ticketDetail.created_time)}</Text>
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
    padding: wp(7.5),
    borderRadius: 20,
    alignItems: "center",
    width: deviceType.isTablet ? wp(60) : wp(85),
    maxWidth: "90%",
  },
  modalTitle: {
    fontSize: rf(18),
    fontWeight: "bold",
    color: "#333",
    marginTop: hp(2),
    textAlign: "center",
    fontFamily: "Poppins",
  },
  ticketSummary: {
    width: "100%",
    marginVertical: hp(2.5),
    padding: wp(4),
    backgroundColor: "#F8F9FA",
    borderRadius: 12,
  },
  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: hp(1.5),
    minHeight: hp(2.5),
  },
  summaryLabel: {
    fontSize: 14,
    color: "#666",
    fontFamily: "Poppins",
    minWidth: "35%",
    maxWidth: "35%",
    flexShrink: 0,
  },
  summaryValue: {
    fontSize: 14,
    fontWeight: "600",
    color: "#333",
    fontFamily: "Poppins",
    flex: 1,
    textAlign: "right",
    flexWrap: "wrap",
  },
  accountValue: {
    textAlign: "right",
    flexWrap: "wrap",
    maxWidth: "65%",
    lineHeight: 18,
    fontSize: 13,
  },
  channelValue: {
    textAlign: "right",
    flexWrap: "wrap",
    maxWidth: "65%",
    lineHeight: 18,
    fontSize: 13,
  },
  categoryValue: {
    textAlign: "right",
    flexWrap: "wrap",
    maxWidth: "65%",
    lineHeight: 18,
    fontSize: 13,
  },
  ticketNumberValue: {
    fontSize: 14,
    fontWeight: "700",
    color: "#FF8636",
  },
  nameValue: {
    textAlign: "right",
    flexWrap: "wrap",
    maxWidth: "65%",
    lineHeight: 18,
    fontSize: 13,
    textTransform: "capitalize",
  },
  statusPending: {
    color: "#FF8636",
  },
  amountValue: {
    fontWeight: "700",
    color: "#4CAF50",
    fontSize: 14,
  },
  transactionDateValue: {
    fontWeight: "600",
    color: "#2196F3",
    fontSize: 14,
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