import FilterModal from "@/components/FilterModal";
import TabTransition from "@/components/TabTransition";
import { Fonts } from "@/constants/Fonts";
import { useTickets } from "@/hooks/useTickets";
import { hp, rf, wp } from "@/utils/responsive";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { router, useFocusEffect } from "expo-router";
import React, { useCallback, useMemo, useState } from "react";
import {
  FlatList,
  Platform,
  RefreshControl,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const getStatusColorBackground = (status: string) => {
  switch (status) {
    case "Diterima":
      return "#FFF3EB";
    case "Verifikasi":
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
    case "Verifikasi":
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
    case "Verifikasi":
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
    case "Verifikasi":
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

export default function RiwayatScreen() {
  const [showFilter, setShowFilter] = useState(false);
  const [sortBy, setSortBy] = useState("");
  const [selectedStatus, setSelectedStatus] = useState<string[]>([]);
  const [appliedSortBy, setAppliedSortBy] = useState("");
  const [appliedStatus, setAppliedStatus] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [refreshing, setRefreshing] = useState(false);
  const [showNewTicketNotification, setShowNewTicketNotification] =
    useState(false);

  const { tickets, isLoading: loading, error, refetch } = useTickets();
  const toIndoStatus = useCallback((statusCode?: string) => {
    switch ((statusCode || "").toUpperCase()) {
      case "ACC":
        return "Diterima";
      case "VERIF":
        return "Verifikasi";
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
    if (!tickets) {
      return [];
    }

    const mappedData = tickets.map((t) => ({
      ticket_id: t.ticket_id || t.ticket_number, // Use ticket_id if available, fallback to ticket_number
      ticket_number: t.ticket_number,
      customer_status: toIndoStatus(t.customer_status?.customer_status_code),
      channel: t.issue_channel?.channel_name || "Tidak tersedia",
      created_time: t.created_time,
      description: t.description,
    }));

    return mappedData;
  }, [tickets, toIndoStatus]);

  const hasFilters = sortBy !== "" || selectedStatus.length > 0;

  const filteredData = useMemo(() => {
    let result = [...ticketData];

    // search
    if (searchQuery.trim() !== "") {
      result = result.filter((item) =>
        String(item.channel || "")
          .toLowerCase()
          .includes(searchQuery.toLowerCase())
      );
    }

    // filter status
    if (appliedStatus.length > 0) {
      result = result.filter((item) =>
        appliedStatus.includes(item.customer_status)
      );
    }

    // sort tanggal
    if (appliedSortBy === "tanggal-terbaru") {
      result.sort(
        (a, b) =>
          new Date(b.created_time).getTime() -
          new Date(a.created_time).getTime()
      );
    } else if (appliedSortBy === "tanggal-terlama") {
      result.sort(
        (a, b) =>
          new Date(a.created_time).getTime() -
          new Date(b.created_time).getTime()
      );
    }

    return result;
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

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await refetch();
    } finally {
      setRefreshing(false);
    }
  }, [refetch]);

  useFocusEffect(
    useCallback(() => {
      const checkRefreshFlag = async () => {
        try {
          const shouldRefresh = await AsyncStorage.getItem(
            "shouldRefreshRiwayat"
          );
          if (shouldRefresh === "true") {
            await AsyncStorage.removeItem("shouldRefreshRiwayat");
            setShowNewTicketNotification(true);
            setTimeout(() => setShowNewTicketNotification(false), 3000);
            await refetch();
          }
        } catch {}
      };

      checkRefreshFlag();
    }, [refetch])
  );

  // =============== UI ===============
  return (
    <TabTransition>
      <SafeAreaView style={styles.container}>
        <Text style={styles.title}>Riwayat Laporan</Text>

        {/* New Ticket Notification */}
        {showNewTicketNotification && (
          <View style={styles.notificationContainer}>
            <MaterialIcons name="check-circle" size={20} color="#4CAF50" />
            <Text style={styles.notificationText}>
              Tiket baru berhasil dibuat!
            </Text>
          </View>
        )}

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
          <FlatList
            data={[1, 2, 3, 4, 5]}
            keyExtractor={(item) => item.toString()}
            renderItem={() => <SkeletonCard />}
            contentContainerStyle={styles.listContainer}
            showsVerticalScrollIndicator={false}
          />
        ) : error ? (
          <View style={styles.errorContainer}>
            <MaterialIcons name="error-outline" size={48} color="#E24646" />
            <Text style={styles.errorTitle}>Gagal Memuat Data</Text>
            <Text style={styles.errorText}>
              Terjadi kesalahan saat mengambil data riwayat. Periksa koneksi
              internet Anda.
            </Text>
            <TouchableOpacity style={styles.retryButton} onPress={refetchAll}>
              <Text style={styles.retryText}>Coba Lagi</Text>
            </TouchableOpacity>
          </View>
        ) : filteredData.length === 0 ? (
          <View style={styles.emptyContainer}>
            <MaterialIcons name="inbox" size={48} color="#999" />
            <Text style={styles.emptyTitle}>Belum Ada Riwayat</Text>
            <Text style={styles.emptyText}>
              Anda belum memiliki riwayat laporan. Buat laporan pertama Anda
              sekarang.
            </Text>
          </View>
        ) : (
          <>
            <FlatList
              data={filteredData}
              keyExtractor={(item, index) =>
                `${item.ticket_number}_${item.ticket_id}_${index}`
              }
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
                    router.push(`/riwayat/${item.ticket_id}` as any);
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
              refreshControl={
                <RefreshControl
                  refreshing={refreshing}
                  onRefresh={onRefresh}
                  colors={["#52B5AB"]}
                  tintColor="#52B5AB"
                />
              }
            />
          </>
        )}

        <FilterModal
          visible={showFilter}
          onClose={() => setShowFilter(false)}
          sortBy={sortBy}
          setSortBy={setSortBy}
          selectedStatus={selectedStatus}
          setSelectedStatus={setSelectedStatus}
          onApply={() => {
            setAppliedSortBy(sortBy);
            setAppliedStatus(selectedStatus);
            setShowFilter(false);
          }}
          onClear={() => {
            setSelectedStatus([]);
            setSortBy("");
            setAppliedStatus([]);
            setAppliedSortBy("");
          }}
          hasFilters={hasFilters}
        />
      </SafeAreaView>
    </TabTransition>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fffefeff",
    paddingHorizontal: wp(4),
    marginBottom: Platform.OS === "ios" ? hp(6) : 0,
  },
  title: {
    fontSize: rf(18),
    fontFamily: Fonts.semiBold,
    color: "black",
    marginBottom: hp(2),
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
    paddingBottom: Platform.OS === "ios" ? 20 : 80,
  },
  card: {
    marginTop: hp(1.5),
    marginBottom: hp(2.2),
    padding: wp(4.5),
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

  loadingText: {
    textAlign: "center",
    fontSize: 16,
    fontFamily: Fonts.medium,
    color: "#666",
    marginTop: 50,
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
  },
  errorTitle: {
    fontSize: 18,
    fontFamily: Fonts.semiBold,
    color: "#E24646",
    marginTop: 16,
    marginBottom: 8,
  },
  errorText: {
    textAlign: "center",
    fontSize: 14,
    fontFamily: Fonts.regular,
    color: "#666",
    marginBottom: 24,
    lineHeight: 20,
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
  notificationContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#E8F5E8",
    borderColor: "#4CAF50",
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
    gap: 8,
  },
  notificationText: {
    fontSize: 14,
    fontFamily: Fonts.medium,
    color: "#2E7D32",
    flex: 1,
  },
  skeletonCard: {
    marginTop: 12,
    marginBottom: 18,
    padding: 18,
    borderRadius: 14,
    borderLeftWidth: 5,
    borderLeftColor: "#E5E5E5",
    backgroundColor: "#F8F9FA",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 2,
  },
  skeletonHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  skeletonId: {
    width: 80,
    height: 12,
    backgroundColor: "#E5E5E5",
    borderRadius: 6,
  },
  skeletonBadge: {
    width: 60,
    height: 20,
    backgroundColor: "#E5E5E5",
    borderRadius: 6,
  },
  skeletonTitle: {
    width: "70%",
    height: 14,
    backgroundColor: "#E5E5E5",
    borderRadius: 6,
    marginBottom: 4,
  },
  skeletonDateTime: {
    width: "50%",
    height: 12,
    backgroundColor: "#E5E5E5",
    borderRadius: 6,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
  },
  emptyTitle: {
    fontSize: 18,
    fontFamily: Fonts.semiBold,
    color: "#333",
    marginTop: 16,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 14,
    fontFamily: Fonts.regular,
    color: "#666",
    textAlign: "center",
    lineHeight: 20,
  },
});

function SkeletonCard() {
  return (
    <View style={styles.skeletonCard}>
      <View style={styles.skeletonHeader}>
        <View style={styles.skeletonId} />
        <View style={styles.skeletonBadge} />
      </View>
      <View style={styles.skeletonTitle} />
      <View style={styles.skeletonDateTime} />
    </View>
  );
}
