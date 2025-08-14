import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Platform,
  Modal,
  Animated,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Fonts } from "@/constants/Fonts";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { router } from "expo-router";
import FeedbackModal from "@/components/FeedbackModal";
import AsyncStorage from "@react-native-async-storage/async-storage";

const riwayatData = [
  {
    id: "LP-202412151234",
    status: "Diterima",
    judul: "ATM tidak mengeluarkan uang tunai",
    tanggal: "15 Des 2024",
    jam: "14:30",
  },
  {
    id: "LP-202412141235",
    status: "Validasi",
    judul: "Kartu debit terblokir mendadak",
    tanggal: "14 Des 2024",
    jam: "09:15",
  },
  {
    id: "LP-202412131236",
    status: "Diproses",
    judul: "Transfer online gagal saldo terpotong",
    tanggal: "13 Des 2024",
    jam: "16:45",
  },
  {
    id: "LP-202412121237",
    status: "Selesai",
    judul: "Mobile banking tidak bisa login",
    tanggal: "12 Des 2024",
    jam: "11:20",
  },
  {
    id: "LP-202412111238",
    status: "Validasi",
    judul: "Saldo rekening tidak sesuai",
    tanggal: "11 Des 2024",
    jam: "13:45",
  },
  {
    id: "LP-202412101239",
    status: "Selesai",
    judul: "Biaya admin tidak wajar",
    tanggal: "10 Des 2024",
    jam: "08:30",
  },
  {
    id: "LP-202412091240",
    status: "Diterima",
    judul: "Kartu kredit limit berkurang",
    tanggal: "09 Des 2024",
    jam: "15:20",
  },
  {
    id: "LP-202412081241",
    status: "Diproses",
    judul: "Internet banking error 500",
    tanggal: "08 Des 2024",
    jam: "10:15",
  },
  {
    id: "LP-202412071242",
    status: "Selesai",
    judul: "PIN ATM tidak bisa diganti",
    tanggal: "07 Des 2024",
    jam: "12:00",
  },
  {
    id: "LP-202412061243",
    status: "Validasi",
    judul: "Transaksi ditolak tanpa alasan",
    tanggal: "06 Des 2024",
    jam: "17:30",
  },
  {
    id: "LP-202412051244",
    status: "Diproses",
    judul: "Notifikasi SMS tidak masuk",
    tanggal: "05 Des 2024",
    jam: "14:45",
  },
  {
    id: "LP-202412041245",
    status: "Selesai",
    judul: "Buku tabungan tidak ter-update",
    tanggal: "04 Des 2024",
    jam: "09:30",
  },
  {
    id: "LP-202412031246",
    status: "Diterima",
    judul: "Layanan customer service lambat",
    tanggal: "03 Des 2024",
    jam: "16:15",
  },
  {
    id: "LP-202412021247",
    status: "Selesai",
    judul: "Aplikasi sering force close",
    tanggal: "02 Des 2024",
    jam: "11:45",
  },
];

const getStatusColorBackground = (status: string) => {
  switch (status) {
    case "Diterima":
      return "#FFF3EB";
    case "Validasi":
      return "#FFF9EB";
    case "Diproses":
      return "#FCFDEE";
    default:
      return "#F1FBFB";
  }
};
const getStatusColorBadge = (status: string) => {
  switch (status) {
    case "Diterima":
      return "#FFDBC3";
    case "Validasi":
      return "#FFEEC2";
    case "Diproses":
      return "#F3F8BD";
    default:
      return "#D4F4F2";
  }
};

const getStatusColorText = (status: string) => {
  switch (status) {
    case "Diterima":
      return "#FF8636";
    case "Validasi":
      return "#FFB600";
    case "Diproses":
      return "#B3BE47";
    default:
      return "#66C4BE";
  }
};

const getShadowColor = (status: string) => {
  switch (status) {
    case "Diterima":
      return "#FF8636";
    case "Validasi":
      return "#FFC533";
    case "Diproses":
      return "#E0EE59";
    default:
      return "#71DAD3";
  }
};

const parseIndonesianDate = (tanggal: string, jam: string) => {
  const monthMap: { [key: string]: number } = {
    'Jan': 0, 'Feb': 1, 'Mar': 2, 'Apr': 3, 'Mei': 4, 'Jun': 5,
    'Jul': 6, 'Agu': 7, 'Sep': 8, 'Okt': 9, 'Nov': 10, 'Des': 11
  };
  
  const [day, month, year] = tanggal.split(' ');
  const [hour, minute] = jam.split(':');
  
  return new Date(
    parseInt(year),
    monthMap[month],
    parseInt(day),
    parseInt(hour),
    parseInt(minute)
  );
};

export default function RiwayatScreen() {
  const [showFilter, setShowFilter] = useState(false);
  const [sortBy, setSortBy] = useState("");
  const [selectedStatus, setSelectedStatus] = useState<string[]>([]);
  const [appliedSortBy, setAppliedSortBy] = useState("");
  const [appliedStatus, setAppliedStatus] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [showFeedback, setShowFeedback] = useState(false);
  const [tickets, setTickets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const slideAnim = new Animated.Value(300);

  useEffect(() => {
    fetchTickets();
  }, []);

  const fetchTickets = async () => {
    try {
      const customerData = await AsyncStorage.getItem("customer");
      if (customerData) {
        const customer = JSON.parse(customerData);
        const response = await fetch(`http://34.121.13.94:3000/tickets/`);
        
        if (response.ok) {
          const data = await response.json();
          setTickets(data);
        }
      }
    } catch (error) {
      console.error('Error fetching tickets:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('id-ID', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('id-ID', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  useEffect(() => {
    if (showFilter) {
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }).start();
    } else {
      Animated.timing(slideAnim, {
        toValue: 300,
        duration: 300,
        useNativeDriver: true,
      }).start();
    }
  }, [showFilter]);

  const hasFilters = sortBy !== "" || selectedStatus.length > 0;

  const getFilteredData = () => {
    let filteredData = [...tickets];

    // Filter by search query
    if (searchQuery.trim() !== "") {
      filteredData = filteredData.filter((item) =>
        item.title.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Filter by status if any status is applied
    if (appliedStatus.length > 0) {
      filteredData = filteredData.filter((item) =>
        appliedStatus.includes(item.customer_status)
      );
    }

    // Sort by date if applied
    if (appliedSortBy === "tanggal-terbaru") {
      filteredData.sort((a, b) => {
        return new Date(b.created_time).getTime() - new Date(a.created_time).getTime();
      });
    } else if (appliedSortBy === "tanggal-terlama") {
      filteredData.sort((a, b) => {
        return new Date(a.created_time).getTime() - new Date(b.created_time).getTime();
      });
    }

    return filteredData;
  };

  const toggleStatus = (status: string) => {
    setSelectedStatus((prev) =>
      prev.includes(status)
        ? prev.filter((s) => s !== status)
        : [...prev, status]
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>Riwayat Laporan</Text>

      <View style={styles.searchFilterContainer}>
        <View style={styles.searchContainer}>
          <MaterialIcons
            name="search"
            size={20}
            color="#666"
            style={styles.searchIcon}
          />
          <TextInput
            style={styles.searchInput}
            placeholder="Cari laporan..."
            placeholderTextColor="#999"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>

        <TouchableOpacity
          style={styles.filterButton}
          onPress={() => setShowFilter(true)}
        >
          <MaterialIcons name="tune" size={20} color="white" />
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.listContainer}
        showsVerticalScrollIndicator={false}
      >
        {loading ? (
          <Text style={styles.loadingText}>Loading...</Text>
        ) : (
          getFilteredData().map((item) => (
            <TouchableOpacity
              key={item.ticket_number}
              style={[
                styles.card,
                {
                  borderLeftColor: getStatusColorText(item.customer_status),
                  backgroundColor: getStatusColorBackground(item.customer_status),
                  shadowColor: getShadowColor(item.customer_status),
                },
              ]}
              onPress={() => {
                if (item.customer_status === "Selesai") {
                  setShowFeedback(true);
                } else {
                  router.push(`/riwayat/${item.ticket_id}` as any);
                }
              }}
            >
              <View style={styles.cardHeader}>
                <Text style={styles.cardId}>{item.ticket_number}</Text>
                <View
                  style={[
                    styles.statusBadge,
                    { backgroundColor: getStatusColorBadge(item.customer_status) },
                  ]}
                >
                  <Text
                    style={[
                      styles.statusText,
                      { color: getStatusColorText(item.customer_status) },
                    ]}
                  >
                    {item.customer_status}
                  </Text>
                </View>
              </View>
              <Text style={styles.cardTitle}>{item.title}</Text>
              <Text style={styles.cardDateTime}>
                {formatDate(item.created_time)}, {formatTime(item.created_time)}
              </Text>
            </TouchableOpacity>
          ))
        )}
      </ScrollView>

      <Modal visible={showFilter} transparent animationType="fade">
        <TouchableOpacity 
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setShowFilter(false)}
        >
          <Animated.View 
            style={[styles.bottomSheet, { transform: [{ translateY: slideAnim }] }]}
            onStartShouldSetResponder={() => true}
          >
            <View style={styles.sheetHeader}>
              <Text style={styles.sheetTitle}>Filter & Sort</Text>
              <TouchableOpacity onPress={() => setShowFilter(false)}>
                <MaterialIcons name="close" size={24} color="#333" />
              </TouchableOpacity>
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Sort By</Text>
              <TouchableOpacity
                style={styles.sortOption}
                onPress={() => setSortBy(sortBy === "tanggal-terbaru" ? "" : "tanggal-terbaru")}
              >
                <MaterialIcons
                  name="calendar-today"
                  size={20}
                  color="#1F72F1"
                />
                <Text style={styles.optionText}>Tanggal Terbaru</Text>
                <MaterialIcons
                  name={
                    sortBy === "tanggal-terbaru"
                      ? "radio-button-checked"
                      : "radio-button-unchecked"
                  }
                  size={20}
                  color={sortBy === "tanggal-terbaru" ? "#1F72F1" : "#8E8E93"}
                />
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.sortOption}
                onPress={() => setSortBy(sortBy === "tanggal-terlama" ? "" : "tanggal-terlama")}
              >
                <MaterialIcons
                  name="calendar-today"
                  size={20}
                  color="#1F72F1"
                />
                <Text style={styles.optionText}>Tanggal Terlama</Text>
                <MaterialIcons
                  name={
                    sortBy === "tanggal-terlama"
                      ? "radio-button-checked"
                      : "radio-button-unchecked"
                  }
                  size={20}
                  color={sortBy === "tanggal-terlama" ? "#1F72F1" : "#8E8E93"}
                />
              </TouchableOpacity>
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Status Ticket</Text>

              <TouchableOpacity
                style={styles.statusOption}
                onPress={() => toggleStatus("Diterima")}
              >
                <MaterialIcons name="edit-document" size={20} color="#FF8636" />
                <Text style={styles.optionText}>Diterima</Text>
                <MaterialIcons
                  name={
                    selectedStatus.includes("Diterima")
                      ? "check-box"
                      : "check-box-outline-blank"
                  }
                  size={20}
                  color={
                    selectedStatus.includes("Diterima") ? "#1F72F1" : "#8E8E93"
                  }
                />
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.statusOption}
                onPress={() => toggleStatus("Validasi")}
              >
                <MaterialIcons name="verified" size={20} color="#FFB600" />
                <Text style={styles.optionText}>Validasi</Text>
                <MaterialIcons
                  name={
                    selectedStatus.includes("Validasi")
                      ? "check-box"
                      : "check-box-outline-blank"
                  }
                  size={20}
                  color={
                    selectedStatus.includes("Validasi") ? "#1F72F1" : "#8E8E93"
                  }
                />
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.statusOption}
                onPress={() => toggleStatus("Diproses")}
              >
                <MaterialIcons name="history" size={20} color="#B3BE47" />
                <Text style={styles.optionText}>Diproses</Text>
                <MaterialIcons
                  name={
                    selectedStatus.includes("Diproses")
                      ? "check-box"
                      : "check-box-outline-blank"
                  }
                  size={20}
                  color={
                    selectedStatus.includes("Diproses") ? "#1F72F1" : "#8E8E93"
                  }
                />
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.statusOption}
                onPress={() => toggleStatus("Selesai")}
              >
                <MaterialIcons
                  name="check-circle-outline"
                  size={20}
                  color="#66C4BE"
                />
                <Text style={styles.optionText}>Selesai</Text>
                <MaterialIcons
                  name={
                    selectedStatus.includes("Selesai")
                      ? "check-box"
                      : "check-box-outline-blank"
                  }
                  size={20}
                  color={
                    selectedStatus.includes("Selesai") ? "#1F72F1" : "#8E8E93"
                  }
                />
              </TouchableOpacity>
            </View>

            <View style={styles.buttonContainer}>
              <TouchableOpacity
                style={styles.clearButton}
                onPress={() => {
                  setSelectedStatus([]);
                  setSortBy("");
                  setAppliedStatus([]);
                  setAppliedSortBy("");
                }}
              >
                <Text style={styles.clearText}>Hapus</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.applyButton,
                  !hasFilters && styles.disabledButton,
                ]}
                onPress={() => {
                  setAppliedSortBy(sortBy);
                  setAppliedStatus(selectedStatus);
                  setShowFilter(false);
                }}
                disabled={!hasFilters}
              >
                <Text
                  style={[styles.applyText, !hasFilters && styles.disabledText]}
                >
                  Terapkan
                </Text>
              </TouchableOpacity>
            </View>
          </Animated.View>
        </TouchableOpacity>
      </Modal>

      <FeedbackModal 
        visible={showFeedback} 
        onClose={() => setShowFeedback(false)} 
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fffefeff",
    paddingHorizontal: 16,
  },
  title: {
    fontSize: 18,
    fontFamily: Fonts.medium,
    color: "black",
    marginBottom: 16,
    textAlign: "center",
  },
  searchFilterContainer: {
    flexDirection: "row",
    gap: 12,
    alignItems: "center",
  },
  searchContainer: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f5f5f5",
    borderRadius: 6,
    paddingHorizontal: 12,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    paddingVertical: 10,
    fontFamily: Fonts.regular,
    fontSize: 14,
  },
  filterButton: {
    backgroundColor: "#1F72F1",
    borderRadius: 6,
    padding: 10,
  },
  listContainer: {
    flex: 1,
    marginTop: 16,
    marginBottom: Platform.OS === "ios" ? 50 : 0,
  },
  card: {
    // backgroundColor: '#fff',
    marginTop: 12,
    marginBottom: 18,
    padding: 18,
    borderRadius: 14,
    borderLeftWidth: 5,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 3,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  cardId: {
    fontFamily: Fonts.semiBold,
    fontSize: 12,
    color: "#555555",
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  statusText: {
    fontFamily: Fonts.semiBold,
    fontSize: 12,
    color: "#333",
  },
  cardTitle: {
    fontFamily: Fonts.semiBold,
    fontSize: 14,
    color: "black",
    marginBottom: 4,
  },
  cardDateTime: {
    fontFamily: Fonts.regular,
    fontSize: 12,
    color: "#666",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "flex-end",
  },
  bottomSheet: {
    backgroundColor: "#fff",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 0,
    maxHeight: "70%",
  },
  sheetHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  sheetTitle: {
    fontSize: 18,
    fontFamily: Fonts.semiBold,
    color: "#333",
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontFamily: Fonts.medium,
    color: "#333",
    marginBottom: 12,
  },
  sortOption: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    gap: 12,
  },
  statusOption: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    gap: 12,
  },
  optionText: {
    flex: 1,
    fontSize: 14,
    fontFamily: Fonts.regular,
    color: "#333",
  },
  buttonContainer: {
    flexDirection: "row",
    gap: 12,
    // paddingHorizontal: 24,
    paddingBottom: 42,
  },
  clearButton: {
    flex: 1,
    backgroundColor: "#E3F8F6",
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: "center",
  },
  clearText: {
    color: "#52B5AB",
    fontSize: 14,
    fontFamily: Fonts.medium,
  },
  applyButton: {
    flex: 1,
    backgroundColor: "#52B5AB",
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: "center",
  },
  applyText: {
    color: "#fff",
    fontSize: 14,
    fontFamily: Fonts.medium,
  },
  disabledButton: {
    backgroundColor: "#E5E5E5",
  },
  disabledText: {
    color: "#999",
  },
  loadingText: {
    textAlign: "center",
    fontSize: 16,
    fontFamily: Fonts.medium,
    color: "#666",
    marginTop: 50,
  },
});
