import React from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Platform,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useLocalSearchParams, router } from "expo-router";
import { Fonts } from "@/constants/Fonts";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";

const riwayatData = [
  {
    id: "LP-202508061234",
    status: "Diterima",
    judul: "Masalah ATM tidak bisa tarik tunai",
    tanggal: "15 Des 2024",
    jam: "14:30",
    deskripsi:
      "ATM di cabang Sudirman tidak dapat mengeluarkan uang tunai meskipun saldo mencukupi. Layar menampilkan pesan error.",
    progressData: [
      {
        status: "Diterima",
        tanggal: "15 Desember 2024, 10:15",
        penjelasan: "Laporan telah diterima mohon menunggu",
      },
      { status: "Validasi", tanggal: " ", penjelasan: " " },
      { status: "Diproses", tanggal: " ", penjelasan: " " },
      { status: "Selesai", tanggal: " ", penjelasan: " " },
    ],
  },
  {
    id: "LP-202508061235",
    status: "Validasi",
    judul: "Kartu kredit terblokir",
    tanggal: "14 Des 2024",
    jam: "09:15",
    deskripsi:
      "Kartu kredit tiba-tiba terblokir tanpa pemberitahuan sebelumnya. Tidak dapat melakukan transaksi.",
    progressData: [
      {
        status: "Diterima",
        tanggal: "14 Desember 2024, 09:15",
        penjelasan: "Laporan telah diterima mohon menunggu",
      },
      {
        status: "Validasi",
        tanggal: "14 Desember 2024, 10:30",
        penjelasan: "Sedang dalam proses validasi data",
      },
      { status: "Diproses", tanggal: " ", penjelasan: " " },
      { status: "Selesai", tanggal: " ", penjelasan: " " },
    ],
  },
  {
    id: "LP-202508061236",
    status: "Diproses",
    judul: "Transfer gagal tapi saldo terpotong",
    tanggal: "13 Des 2024",
    jam: "16:45",
    deskripsi:
      "Transfer ke rekening lain gagal namun saldo sudah terpotong dari rekening saya.",
    progressData: [
      {
        status: "Diterima",
        tanggal: "13 Desember 2024, 16:45",
        penjelasan: "Laporan telah diterima mohon menunggu",
      },
      {
        status: "Validasi",
        tanggal: "13 Desember 2024, 17:20",
        penjelasan: "Sedang dalam proses validasi data",
      },
      {
        status: "Diproses",
        tanggal: "14 Desember 2024, 09:00",
        penjelasan: "Tim teknis sedang menangani masalah",
      },
      { status: "Selesai", tanggal: " ", penjelasan: " " },
    ],
  },
  {
    id: "LP-202508061237",
    status: "Selesai",
    judul: "Aplikasi mobile banking error",
    tanggal: "12 Des 2024",
    jam: "11:20",
    deskripsi:
      "Aplikasi mobile banking sering mengalami error dan tidak dapat login.",
    progressData: [
      {
        status: "Diterima",
        tanggal: "12 Desember 2024, 11:20",
        penjelasan: "Laporan telah diterima mohon menunggu",
      },
      {
        status: "Validasi",
        tanggal: "12 Desember 2024, 14:15",
        penjelasan: "Sedang dalam proses validasi data",
      },
      {
        status: "Diproses",
        tanggal: "13 Desember 2024, 08:30",
        penjelasan: "Tim teknis sedang menangani masalah",
      },
      {
        status: "Selesai",
        tanggal: "15 Desember 2024, 16:45",
        penjelasan: "Masalah telah diselesaikan",
      },
    ],
  },
];

export default function RiwayatDetailScreen() {
  const { id } = useLocalSearchParams();
  const item = riwayatData.find((data) => data.id === id);

  if (!item) {
    return (
      <SafeAreaView style={styles.container}>
        <Text>Data tidak ditemukan</Text>
      </SafeAreaView>
    );
  }

  const getProgressStepStatus = (currentStatus: string, stepStatus: string) => {
    const statusOrder = ["Diterima", "Validasi", "Diproses", "Selesai"];
    const currentIndex = statusOrder.indexOf(currentStatus);
    const stepIndex = statusOrder.indexOf(stepStatus);
    return stepIndex <= currentIndex ? "completed" : "pending";
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <MaterialIcons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Detail Laporan</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {item.status === "Diterima" && (
          <View style={styles.warningContainer}>
            <MaterialIcons name="warning" size={20} color="#D32F2F" />
            <Text style={styles.warningText}>
              Mohon kirimkan berkas anda sesuai ketentuan
            </Text>
          </View>
        )}
        <View style={styles.complaintContainer}>
          <View style={styles.detailHeader}>
            <Text style={styles.detailId}>{item.id}</Text>
            <Text style={styles.detailDateTime}>
              {item.tanggal}, {item.jam}
            </Text>
          </View>

          <Text style={styles.detailTitle}>{item.judul}</Text>

          <View style={styles.descriptionSection}>
            <Text style={styles.sectionTitle}>Deskripsi</Text>
            <Text style={styles.descriptionText}>{item.deskripsi}</Text>
          </View>
        </View>

        <View style={styles.progressSection}>
          <Text style={styles.progressTitle}>Status Progress</Text>
          <View style={styles.progressCard}>
            {item.progressData?.map((step: any, index: number) => {
              const stepStatus = getProgressStepStatus(
                item.status,
                step.status
              );
              const isLast = index === item.progressData.length - 1;

              return (
                <View key={step.status} style={styles.progressStep}>
                  <View style={styles.progressStepLeft}>
                    <View
                      style={[
                        styles.progressDot,
                        stepStatus === "completed" &&
                          styles.progressDotCompleted,
                      ]}
                    />

                    {!isLast && (
                      <View
                        style={[
                          styles.progressLine,
                          stepStatus === "completed" &&
                            styles.progressLineCompleted,
                        ]}
                      />
                    )}
                  </View>
                  <View style={styles.progressStepContent}>
                    <Text
                      style={[
                        styles.progressStepTitle,
                        stepStatus === "completed" &&
                          styles.progressStepTitleCompleted,
                      ]}
                    >
                      {step.status}
                    </Text>
                    {step.tanggal && step.tanggal.trim() !== "" && (
                      <Text style={styles.progressStepDate}>
                        {step.tanggal}
                      </Text>
                    )}
                    {step.penjelasan && step.penjelasan.trim() !== "" && (
                      <Text style={styles.progressStepDescription}>
                        {step.penjelasan}
                      </Text>
                    )}
                  </View>
                </View>
              );
            })}
          </View>
        </View>
      </ScrollView>

      <View style={styles.liveChatCard}>
        <TouchableOpacity style={styles.liveChatButton}>
          <MaterialIcons
            name="message"
            size={20}
            color="#fff"
            style={styles.chatIcon}
          />
          <Text style={styles.liveChatText}>Live Chat</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  header: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingTop: 44,
    paddingBottom: 16,
    backgroundColor: "#fff",

    // Shadow untuk iOS
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 }, // sedikit turun biar ada depth
    shadowOpacity: 0.1,
    shadowRadius: 5,

    // Shadow untuk Android
    elevation: 4,
    zIndex: 10,
  },
  headerTitle: {
    fontSize: 18,
    fontFamily: Fonts.medium,
    color: "black",
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: Platform.OS === "ios" ? 55 : 85, // padding atas untuk header
  },
  detailHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  detailId: {
    fontSize: 16,
    fontFamily: Fonts.medium,
    color: "#555555",
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 16,
  },
  statusText: {
    fontSize: 12,
    fontFamily: Fonts.medium,
  },
  detailTitle: {
    fontSize: 18,
    fontFamily: Fonts.bold,
    color: "black",
    marginBottom: 8,
    textAlign: "justify",
  },
  detailDateTime: {
    fontSize: 14,
    fontFamily: Fonts.regular,
    color: "#555555",
  },
  descriptionSection: {
    marginBottom: 0,
  },
  sectionTitle: {
    fontSize: 16,
    fontFamily: Fonts.medium,
    color: "#333",
    marginBottom: 2,
  },
  descriptionText: {
    fontSize: 14,
    fontFamily: Fonts.regular,
    color: "black",
    lineHeight: 20,
    textAlign: "justify",
  },
  complaintContainer: {
    padding: 16,
    borderWidth: 1,
    borderColor: "#71DAD3",
    borderRadius: 12,
    marginBottom: 20,
  },
  warningContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fbeaea",
    padding: 16,
    borderRadius: 8,
    marginBottom: 20,
    gap: 12,
  },
  warningText: {
    flex: 1,
    fontSize: 14,
    fontFamily: Fonts.regular,
    color: "black",
  },
  progressSection: {
    marginBottom: 20,
  },
  progressTitle: {
    fontSize: 18,
    fontFamily: Fonts.medium,
    color: "#333",
    marginBottom: 16,
  },
  progressCard: {
    backgroundColor: "#F1FBFB",
    borderLeftWidth: 4,
    borderLeftColor: "#71DAD3",
    borderRadius: 12,
    padding: 24,
    marginBottom: Platform.OS === "ios" ? 80 : 0,
  },
  progressStep: {
    flexDirection: "row",
    marginBottom: 20,
  },
  liveChatCard: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "#fff",
    paddingVertical: 24,
    paddingTop: 16,
    paddingBottom: 42,
    paddingHorizontal: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 5,
  },
  liveChatButton: {
    backgroundColor: "#52B5AB",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    borderRadius: 8,
    gap: 8,
  },
  chatIcon: {
    marginRight: 4,
  },
  liveChatText: {
    color: "#fff",
    fontSize: 14,
    fontFamily: Fonts.medium,
  },
  progressStepLeft: {
    alignItems: "center",
    marginRight: 16,
    position: "relative",
  },
  progressDot: {
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: "#E5E5E5",
    // borderWidth: 2,
    // borderColor: "#fff",
  },
  progressDotCompleted: {
    backgroundColor: "#71DAD3",
  },
  progressLine: {
    width: 2,
    height: "100%",
    backgroundColor: "#E5E5E5",
    position: "absolute",
    top: 18,
    // left: 7,
  },
  progressLineCompleted: {
    backgroundColor: "#71DAD3",
  },
  progressStepContent: {
    flex: 1,
  },
  progressStepTitle: {
    fontSize: 16,
    fontFamily: Fonts.medium,
    color: "#999",
    marginBottom: 4,
  },
  progressStepTitleCompleted: {
    color: "black",
  },
  progressStepDate: {
    fontSize: 12,
    fontFamily: Fonts.regular,
    color: "black",
    marginBottom: 4,
  },
  progressStepDescription: {
    fontSize: 12,
    fontFamily: Fonts.regular,
    color: "black",
    lineHeight: 16,
  },
});
