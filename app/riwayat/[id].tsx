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
    id: "LP-202412151234",
    status: "Diterima",
    judul: "ATM tidak mengeluarkan uang tunai",
    tanggal: "15 Des 2024",
    jam: "14:30",
    deskripsi:
      "ATM di cabang Sudirman tidak dapat mengeluarkan uang tunai meskipun saldo mencukupi. Layar menampilkan pesan error dan kartu tidak keluar.",
    progressData: [
      {
        status: "Diterima",
        tanggal: "15 Desember 2024, 14:30",
        penjelasan: "Laporan telah diterima dan akan segera ditindaklanjuti",
      },
      { status: "Validasi", tanggal: " ", penjelasan: " " },
      { status: "Diproses", tanggal: " ", penjelasan: " " },
      { status: "Selesai", tanggal: " ", penjelasan: " " },
    ],
  },
  {
    id: "LP-202412141235",
    status: "Validasi",
    judul: "Kartu debit terblokir mendadak",
    tanggal: "14 Des 2024",
    jam: "09:15",
    deskripsi:
      "Kartu debit tiba-tiba terblokir tanpa pemberitahuan sebelumnya. Tidak dapat melakukan transaksi di ATM maupun merchant.",
    progressData: [
      {
        status: "Diterima",
        tanggal: "14 Desember 2024, 09:15",
        penjelasan: "Laporan telah diterima dan akan segera ditindaklanjuti",
      },
      {
        status: "Validasi",
        tanggal: "14 Desember 2024, 10:30",
        penjelasan: "Tim sedang memvalidasi data dan riwayat transaksi",
      },
      { status: "Diproses", tanggal: " ", penjelasan: " " },
      { status: "Selesai", tanggal: " ", penjelasan: " " },
    ],
  },
  {
    id: "LP-202412131236",
    status: "Diproses",
    judul: "Transfer online gagal saldo terpotong",
    tanggal: "13 Des 2024",
    jam: "16:45",
    deskripsi:
      "Transfer online ke rekening lain gagal namun saldo sudah terpotong dari rekening saya. Mohon segera dikembalikan.",
    progressData: [
      {
        status: "Diterima",
        tanggal: "13 Desember 2024, 16:45",
        penjelasan: "Laporan telah diterima dan akan segera ditindaklanjuti",
      },
      {
        status: "Validasi",
        tanggal: "13 Desember 2024, 17:20",
        penjelasan: "Tim sedang memvalidasi data dan riwayat transaksi",
      },
      {
        status: "Diproses",
        tanggal: "14 Desember 2024, 09:00",
        penjelasan:
          "Tim teknis sedang menangani dan melakukan pengembalian saldo",
      },
      { status: "Selesai", tanggal: " ", penjelasan: " " },
    ],
  },
  {
    id: "LP-202412121237",
    status: "Selesai",
    judul: "Mobile banking tidak bisa login",
    tanggal: "12 Des 2024",
    jam: "11:20",
    deskripsi:
      "Aplikasi mobile banking tidak dapat login meskipun username dan password sudah benar. Selalu muncul pesan error.",
    progressData: [
      {
        status: "Diterima",
        tanggal: "12 Desember 2024, 11:20",
        penjelasan: "Laporan telah diterima dan akan segera ditindaklanjuti",
      },
      {
        status: "Validasi",
        tanggal: "12 Desember 2024, 14:15",
        penjelasan: "Tim sedang memvalidasi data dan riwayat transaksi",
      },
      {
        status: "Diproses",
        tanggal: "13 Desember 2024, 08:30",
        penjelasan: "Tim teknis sedang memperbaiki sistem mobile banking",
      },
      {
        status: "Selesai",
        tanggal: "13 Desember 2024, 16:45",
        penjelasan: "Masalah telah diselesaikan, silakan coba login kembali",
      },
    ],
  },
  {
    id: "LP-202412111238",
    status: "Validasi",
    judul: "Saldo rekening tidak sesuai",
    tanggal: "11 Des 2024",
    jam: "13:45",
    deskripsi:
      "Saldo yang tertera di buku tabungan tidak sesuai dengan saldo di ATM dan mobile banking. Terdapat selisih yang cukup besar.",
    progressData: [
      {
        status: "Diterima",
        tanggal: "11 Desember 2024, 13:45",
        penjelasan: "Laporan telah diterima dan akan segera ditindaklanjuti",
      },
      {
        status: "Validasi",
        tanggal: "11 Desember 2024, 15:20",
        penjelasan: "Tim sedang memvalidasi riwayat transaksi dan saldo",
      },
      { status: "Diproses", tanggal: " ", penjelasan: " " },
      { status: "Selesai", tanggal: " ", penjelasan: " " },
    ],
  },
  {
    id: "LP-202412101239",
    status: "Selesai",
    judul: "Biaya admin tidak wajar",
    tanggal: "10 Des 2024",
    jam: "08:30",
    deskripsi:
      "Biaya administrasi bulanan yang dikenakan tidak sesuai dengan ketentuan yang berlaku. Biaya lebih tinggi dari seharusnya.",
    progressData: [
      {
        status: "Diterima",
        tanggal: "10 Desember 2024, 08:30",
        penjelasan: "Laporan telah diterima dan akan segera ditindaklanjuti",
      },
      {
        status: "Validasi",
        tanggal: "10 Desember 2024, 10:15",
        penjelasan: "Tim sedang memvalidasi struktur biaya administrasi",
      },
      {
        status: "Diproses",
        tanggal: "10 Desember 2024, 14:30",
        penjelasan: "Tim sedang melakukan penyesuaian biaya administrasi",
      },
      {
        status: "Selesai",
        tanggal: "11 Desember 2024, 09:00",
        penjelasan: "Biaya telah disesuaikan dan kelebihan dikembalikan",
      },
    ],
  },
  {
    id: "LP-202412091240",
    status: "Diterima",
    judul: "Kartu kredit limit berkurang",
    tanggal: "09 Des 2024",
    jam: "15:20",
    deskripsi:
      "Limit kartu kredit tiba-tiba berkurang tanpa pemberitahuan sebelumnya. Sebelumnya limit 10 juta sekarang menjadi 5 juta.",
    progressData: [
      {
        status: "Diterima",
        tanggal: "09 Desember 2024, 15:20",
        penjelasan: "Laporan telah diterima dan akan segera ditindaklanjuti",
      },
      { status: "Validasi", tanggal: " ", penjelasan: " " },
      { status: "Diproses", tanggal: " ", penjelasan: " " },
      { status: "Selesai", tanggal: " ", penjelasan: " " },
    ],
  },
  {
    id: "LP-202412081241",
    status: "Diproses",
    judul: "Internet banking error 500",
    tanggal: "08 Des 2024",
    jam: "10:15",
    deskripsi:
      "Internet banking menampilkan error 500 saat melakukan transfer. Transaksi tidak dapat dilakukan sama sekali.",
    progressData: [
      {
        status: "Diterima",
        tanggal: "08 Desember 2024, 10:15",
        penjelasan: "Laporan telah diterima dan akan segera ditindaklanjuti",
      },
      {
        status: "Validasi",
        tanggal: "08 Desember 2024, 11:30",
        penjelasan: "Tim sedang memvalidasi sistem internet banking",
      },
      {
        status: "Diproses",
        tanggal: "08 Desember 2024, 14:45",
        penjelasan: "Tim teknis sedang memperbaiki server internet banking",
      },
      { status: "Selesai", tanggal: " ", penjelasan: " " },
    ],
  },
  {
    id: "LP-202412071242",
    status: "Selesai",
    judul: "PIN ATM tidak bisa diganti",
    tanggal: "07 Des 2024",
    jam: "12:00",
    deskripsi:
      "Fitur ganti PIN di ATM tidak berfungsi. Sudah mencoba di beberapa ATM yang berbeda tetapi tetap tidak bisa.",
    progressData: [
      {
        status: "Diterima",
        tanggal: "07 Desember 2024, 12:00",
        penjelasan: "Laporan telah diterima dan akan segera ditindaklanjuti",
      },
      {
        status: "Validasi",
        tanggal: "07 Desember 2024, 13:15",
        penjelasan: "Tim sedang memvalidasi sistem ganti PIN ATM",
      },
      {
        status: "Diproses",
        tanggal: "07 Desember 2024, 15:30",
        penjelasan: "Tim teknis sedang memperbaiki fitur ganti PIN",
      },
      {
        status: "Selesai",
        tanggal: "08 Desember 2024, 09:00",
        penjelasan: "Fitur ganti PIN telah diperbaiki dan dapat digunakan",
      },
    ],
  },
  {
    id: "LP-202412061243",
    status: "Validasi",
    judul: "Transaksi ditolak tanpa alasan",
    tanggal: "06 Des 2024",
    jam: "17:30",
    deskripsi:
      "Transaksi pembelian di merchant selalu ditolak tanpa alasan yang jelas. Saldo mencukupi dan kartu dalam kondisi baik.",
    progressData: [
      {
        status: "Diterima",
        tanggal: "06 Desember 2024, 17:30",
        penjelasan: "Laporan telah diterima dan akan segera ditindaklanjuti",
      },
      {
        status: "Validasi",
        tanggal: "07 Desember 2024, 09:15",
        penjelasan: "Tim sedang memvalidasi riwayat transaksi dan status kartu",
      },
      { status: "Diproses", tanggal: " ", penjelasan: " " },
      { status: "Selesai", tanggal: " ", penjelasan: " " },
    ],
  },
  {
    id: "LP-202412051244",
    status: "Diproses",
    judul: "Notifikasi SMS tidak masuk",
    tanggal: "05 Des 2024",
    jam: "14:45",
    deskripsi:
      "Notifikasi SMS untuk transaksi tidak masuk ke nomor handphone yang terdaftar. Sudah beberapa hari tidak ada SMS masuk.",
    progressData: [
      {
        status: "Diterima",
        tanggal: "05 Desember 2024, 14:45",
        penjelasan: "Laporan telah diterima dan akan segera ditindaklanjuti",
      },
      {
        status: "Validasi",
        tanggal: "05 Desember 2024, 16:20",
        penjelasan: "Tim sedang memvalidasi layanan SMS banking",
      },
      {
        status: "Diproses",
        tanggal: "06 Desember 2024, 08:30",
        penjelasan: "Tim teknis sedang memperbaiki sistem notifikasi SMS",
      },
      { status: "Selesai", tanggal: " ", penjelasan: " " },
    ],
  },
  {
    id: "LP-202412041245",
    status: "Selesai",
    judul: "Buku tabungan tidak ter-update",
    tanggal: "04 Des 2024",
    jam: "09:30",
    deskripsi:
      "Buku tabungan tidak ter-update dengan transaksi terbaru. Transaksi sudah dilakukan 3 hari yang lalu tetapi belum tercatat.",
    progressData: [
      {
        status: "Diterima",
        tanggal: "04 Desember 2024, 09:30",
        penjelasan: "Laporan telah diterima dan akan segera ditindaklanjuti",
      },
      {
        status: "Validasi",
        tanggal: "04 Desember 2024, 11:15",
        penjelasan: "Tim sedang memvalidasi riwayat transaksi",
      },
      {
        status: "Diproses",
        tanggal: "04 Desember 2024, 14:30",
        penjelasan: "Tim sedang melakukan update buku tabungan",
      },
      {
        status: "Selesai",
        tanggal: "05 Desember 2024, 10:00",
        penjelasan: "Buku tabungan telah di-update, silakan cetak ulang",
      },
    ],
  },
  {
    id: "LP-202412031246",
    status: "Diterima",
    judul: "Layanan customer service lambat",
    tanggal: "03 Des 2024",
    jam: "16:15",
    deskripsi:
      "Layanan customer service sangat lambat dalam merespon keluhan. Sudah menunggu lebih dari 2 jam di call center.",
    progressData: [
      {
        status: "Diterima",
        tanggal: "03 Desember 2024, 16:15",
        penjelasan: "Laporan telah diterima dan akan segera ditindaklanjuti",
      },
      { status: "Validasi", tanggal: " ", penjelasan: " " },
      { status: "Diproses", tanggal: " ", penjelasan: " " },
      { status: "Selesai", tanggal: " ", penjelasan: " " },
    ],
  },
  {
    id: "LP-202412021247",
    status: "Selesai",
    judul: "Aplikasi sering force close",
    tanggal: "02 Des 2024",
    jam: "11:45",
    deskripsi:
      "Aplikasi mobile banking sering force close saat digunakan. Terutama saat melakukan transfer atau cek saldo.",
    progressData: [
      {
        status: "Diterima",
        tanggal: "02 Desember 2024, 11:45",
        penjelasan: "Laporan telah diterima dan akan segera ditindaklanjuti",
      },
      {
        status: "Validasi",
        tanggal: "02 Desember 2024, 14:20",
        penjelasan: "Tim sedang memvalidasi performa aplikasi mobile banking",
      },
      {
        status: "Diproses",
        tanggal: "03 Desember 2024, 09:00",
        penjelasan: "Tim teknis sedang memperbaiki stabilitas aplikasi",
      },
      {
        status: "Selesai",
        tanggal: "04 Desember 2024, 15:30",
        penjelasan:
          "Aplikasi telah diperbaiki, silakan update ke versi terbaru",
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

      <ScrollView
        style={styles.content}
        showsVerticalScrollIndicator={false}
        nestedScrollEnabled={true}
      >
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
                    {step.penjelasan && step.penjelasan.trim() !== "" && (
                      <Text style={styles.progressStepDescription}>
                        {step.penjelasan}
                      </Text>
                    )}
                    {step.tanggal && step.tanggal.trim() !== "" && (
                      <Text style={styles.progressStepDate}>
                        {step.tanggal}
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
    fontFamily: Fonts.medium,
    color: "#8b8b8bff",
  },
  progressStepDescription: {
    fontSize: 13,
    fontFamily: Fonts.regular,
    color: "black",
    lineHeight: 16,
    marginBottom: 4,
  },
});
