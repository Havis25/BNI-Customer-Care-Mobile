import FeedbackModal from "@/components/FeedbackModal";
import { Fonts } from "@/constants/Fonts";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { router, useFocusEffect } from "expo-router";
import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  Animated,
  FlatList,
  Modal,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { useAuth } from "@/hooks/useAuth";
import { useTickets } from "@/hooks/useTickets";
import TabTransition from "@/components/TabTransition";

// ==================== Helpers Warna Status ====================
const getStatusColorBackground = (status: string) => {
  switch (status) {
    case "Diterima":
      return "#FFF3EB";
    case "Validasi":
      return "#FFF9EB";
    case "Diproses":
      return "#FCFDEE";
    case "Selesai":
      return "#F1FBFB";
    case "Ditolak":
      return "#FFF1F1";
    default:
      return "#F5F7FA";
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
    case "Selesai":
      return "#D4F4F2";
    case "Ditolak":
      return "#FFD6D6";
    default:
      return "#E9EEF5";
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
    case "Selesai":
      return "#66C4BE";
    case "Ditolak":
      return "#E24646";
    default:
      return "#5A6B8C";
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
    case "Selesai":
      return "#71DAD3";
    case "Ditolak":
      return "#F37070";
    default:
      return "#9BB0D3";
  }
};

// (opsional) parser tanggal versi ID
const parseIndonesianDate = (tanggal: string, jam: string) => {
  const monthMap: { [key: string]: number } = {
    Jan: 0,
    Feb: 1,
    Mar: 2,
    Apr: 3,
    Mei: 4,
    Jun: 5,
    Jul: 6,
    Agu: 7,
    Sep: 8,
    Okt: 9,
    Nov: 10,
    Des: 11,
  };
  const [day, month, year] = tanggal.split(" ");
  const [hour, minute] = jam.split(":");
  return new Date(
    parseInt(year),
    monthMap[month],
    parseInt(day),
    parseInt(hour),
    parseInt(minute)
  );
};

// ==================== Komponen ====================
export default function RiwayatScreen() {
  const [showFilter, setShowFilter] = useState(false);
  const [sortBy, setSortBy] = useState("");
  const [selectedStatus, setSelectedStatus] = useState<string[]>([]);
  const [appliedSortBy, setAppliedSortBy] = useState("");
  const [appliedStatus, setAppliedStatus] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [showFeedback, setShowFeedback] = useState(false);

  // animasi bottom sheet
  const slideAnim = useRef(new Animated.Value(300)).current;

  const { tickets, isLoading: loading, error, refetch } = useTickets();

  const toIndoStatus = useCallback((statusCode?: string) => {
    switch ((statusCode || "").toUpperCase()) {
      case "ACC":
        return "Diterima";
      case "VERIF":
        return "Validasi";
      case "PROCESS":
        return "Diproses";
      case "CLOSED":
        return "Selesai";
      case "DECLINED":
        return "Ditolak";
      default:
        return statusCode || "-";
    }
  }, []);

  const ticketData = useMemo(() => {
    if (!tickets) return [];
    return tickets.map((t) => ({
      ticket_id: t.ticket_number,
      ticket_number: t.ticket_number,
      customer_status: toIndoStatus(t.customer_status.customer_status_code),
      channel: t.issue_channel.channel_name,
      created_time: t.created_time,
      description: t.description,
    }));
  }, [tickets, toIndoStatus]);



  // animasi open/close filter sheet
  useEffect(() => {
    Animated.timing(slideAnim, {
      toValue: showFilter ? 0 : 300,
      duration: 300,
      useNativeDriver: true,
    }).start();
  }, [showFilter, slideAnim]);

  const hasFilters = sortBy !== "" || selectedStatus.length > 0;

  const getFilteredData = useCallback(() => {
    let filteredData = [...ticketData];

    // search
    if (searchQuery.trim() !== "") {
      filteredData = filteredData.filter((item) =>
        String(item.channel || "")
          .toLowerCase()
          .includes(searchQuery.toLowerCase())
      );
    }

    // filter status
    if (appliedStatus.length > 0) {
      filteredData = filteredData.filter((item) =>
        appliedStatus.includes(item.customer_status)
      );
    }

    // sort tanggal
    if (appliedSortBy === "tanggal-terbaru") {
      filteredData.sort(
        (a, b) =>
          new Date(b.created_time).getTime() -
          new Date(a.created_time).getTime()
      );
    } else if (appliedSortBy === "tanggal-terlama") {
      filteredData.sort(
        (a, b) =>
          new Date(a.created_time).getTime() -
          new Date(b.created_time).getTime()
      );
    }

    return filteredData;
  }, [ticketData, searchQuery, appliedStatus, appliedSortBy]);

  const formatDate = (dateString: string) => {
    if (!dateString) return "-";
    const date = new Date(dateString);
    return date.toLocaleDateString("id-ID", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };
  const formatTime = (dateString: string) => {
    if (!dateString) return "-";
    const date = new Date(dateString);
    return date.toLocaleTimeString("id-ID", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const refetchAll = useCallback(() => {
    refetch();
  }, [refetch]);

  // Auto-refresh saat halaman di-focus (kembali dari complaint)
  useFocusEffect(
    useCallback(() => {
      refetch();
    }, [refetch])
  );

  // =============== UI ===============
  return (
    <TabTransition>
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

        {loading ? (
          <Text style={styles.loadingText}>Loading...</Text>
        ) : error ? (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>{error}</Text>
            <TouchableOpacity style={styles.retryButton} onPress={refetchAll}>
              <Text style={styles.retryText}>Coba Lagi</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <FlatList
            data={getFilteredData()}
            keyExtractor={(item) => item.ticket_number}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={[
                  styles.card,
                  {
                    borderLeftColor: getStatusColorText(item.customer_status),
                    backgroundColor: getStatusColorBackground(
                      item.customer_status
                    ),
                    shadowColor: getShadowColor(item.customer_status),
                  },
                ]}
                onPress={() => {
                  router.push(`/riwayat/${item.ticket_number}` as any);
                }}
              >
                <View style={styles.cardHeader}>
                  <Text style={styles.cardId}>{item.ticket_number}</Text>
                  <View
                    style={[
                      styles.statusBadge,
                      {
                        backgroundColor: getStatusColorBadge(
                          item.customer_status
                        ),
                      },
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

                <Text style={styles.cardTitle}>{item.channel}</Text>
                <Text style={styles.cardDateTime}>
                  {item.created_time
                    ? `${formatDate(item.created_time)}, ${formatTime(
                        item.created_time
                      )}`
                    : "-"}
                </Text>
              </TouchableOpacity>
            )}
            contentContainerStyle={styles.listContainer}
            showsVerticalScrollIndicator={false}
          />
        )}

        {/* Bottom Sheet Filter */}
        <Modal visible={showFilter} transparent animationType="fade">
          <TouchableOpacity
            style={styles.modalOverlay}
            activeOpacity={1}
            onPress={() => setShowFilter(false)}
          >
            <Animated.View
              style={[
                styles.bottomSheet,
                { transform: [{ translateY: slideAnim }] },
              ]}
              onStartShouldSetResponder={() => true}
            >
              <View style={styles.sheetHeader}>
                <Text style={styles.sheetTitle}>Filter & Sort</Text>
                <TouchableOpacity onPress={() => setShowFilter(false)}>
                  <MaterialIcons name="close" size={24} color="#333" />
                </TouchableOpacity>
              </View>

              <View className="section" style={styles.section}>
                <Text style={styles.sectionTitle}>Sort By</Text>

                <TouchableOpacity
                  style={styles.sortOption}
                  onPress={() =>
                    setSortBy(
                      sortBy === "tanggal-terbaru" ? "" : "tanggal-terbaru"
                    )
                  }
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
                  onPress={() =>
                    setSortBy(
                      sortBy === "tanggal-terlama" ? "" : "tanggal-terlama"
                    )
                  }
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
                  onPress={() =>
                    toggleStatus("Diterima", selectedStatus, setSelectedStatus)
                  }
                >
                  <MaterialIcons
                    name="edit-document"
                    size={20}
                    color="#FF8636"
                  />
                  <Text style={styles.optionText}>Diterima</Text>
                  <MaterialIcons
                    name={
                      selectedStatus.includes("Diterima")
                        ? "check-box"
                        : "check-box-outline-blank"
                    }
                    size={20}
                    color={
                      selectedStatus.includes("Diterima")
                        ? "#1F72F1"
                        : "#8E8E93"
                    }
                  />
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.statusOption}
                  onPress={() =>
                    toggleStatus("Validasi", selectedStatus, setSelectedStatus)
                  }
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
                      selectedStatus.includes("Validasi")
                        ? "#1F72F1"
                        : "#8E8E93"
                    }
                  />
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.statusOption}
                  onPress={() =>
                    toggleStatus("Diproses", selectedStatus, setSelectedStatus)
                  }
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
                      selectedStatus.includes("Diproses")
                        ? "#1F72F1"
                        : "#8E8E93"
                    }
                  />
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.statusOption}
                  onPress={() =>
                    toggleStatus("Selesai", selectedStatus, setSelectedStatus)
                  }
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

                <TouchableOpacity
                  style={styles.statusOption}
                  onPress={() =>
                    toggleStatus("Ditolak", selectedStatus, setSelectedStatus)
                  }
                >
                  <MaterialIcons name="block" size={20} color="#E24646" />
                  <Text style={styles.optionText}>Ditolak</Text>
                  <MaterialIcons
                    name={
                      selectedStatus.includes("Ditolak")
                        ? "check-box"
                        : "check-box-outline-blank"
                    }
                    size={20}
                    color={
                      selectedStatus.includes("Ditolak") ? "#1F72F1" : "#8E8E93"
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
                    style={[
                      styles.applyText,
                      !hasFilters && styles.disabledText,
                    ]}
                  >
                    Terapkan
                  </Text>
                </TouchableOpacity>
              </View>
            </Animated.View>
          </TouchableOpacity>
        </Modal>

        {/* TODO: FeedbackModal dipindahkan ke halaman detail */}
        <FeedbackModal
          visible={showFeedback}
          onClose={() => setShowFeedback(false)}
        />
      </SafeAreaView>
    </TabTransition>
  );
}

// helper kecil untuk toggle checkbox status
function toggleStatus(
  status: string,
  selected: string[],
  setSelected: React.Dispatch<React.SetStateAction<string[]>>
) {
  setSelected((prev) =>
    prev.includes(status) ? prev.filter((s) => s !== status) : [...prev, status]
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fffefeff",
    paddingHorizontal: 16,
    paddingBottom: -35,
  },
  title: {
    fontSize: 18,
    fontFamily: Fonts.semiBold,
    color: "black",
    marginBottom: 16,
    textAlign: "center",
  },
  searchFilterContainer: {
    flexDirection: "row",
    gap: 12,
    alignItems: "center",
    paddingBottom: 20,
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
    paddingBottom: Platform.OS === "ios" ? 20 : 0,
  },
  card: {
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
  errorContainer: {
    alignItems: "center",
    marginTop: 50,
    paddingHorizontal: 20,
  },
  errorText: {
    textAlign: "center",
    fontSize: 14,
    fontFamily: Fonts.regular,
    color: "#E24646",
    marginBottom: 16,
  },
  retryButton: {
    backgroundColor: "#52B5AB",
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 6,
  },
  retryText: {
    color: "#fff",
    fontSize: 14,
    fontFamily: Fonts.medium,
  },
});
