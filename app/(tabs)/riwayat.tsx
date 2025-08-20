import axios from "axios";
import React, { useCallback, useEffect, useState } from "react";
import { ActivityIndicator, FlatList, RefreshControl, StyleSheet, Text, View } from "react-native";

interface RiwayatItem {
  id: string;
  title: string;
  description: string;
  date: string;
}

const Riwayat = () => {
  const [data, setData] = useState<RiwayatItem[]>([]);
  const [page, setPage] = useState(1);
  const [limit] = useState(10); // jumlah data per halaman
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [hasMore, setHasMore] = useState(true);

  const fetchRiwayat = async (currentPage = 1, isRefresh = false) => {
    try {
      setLoading(true);
      const response = await axios.get(`https://api.example.com/v1/riwayat?page=${currentPage}&limit=${limit}`);
      const fetchedData = response.data.data;

      if (isRefresh) {
        setData(fetchedData);
      } else {
        setData(prev => [...prev, ...fetchedData]);
      }

      // Cek apakah masih ada data berikutnya
      if (fetchedData.length < limit) {
        setHasMore(false);
      } else {
        setHasMore(true);
      }
    } catch (error) {
      console.error("Gagal mengambil data riwayat:", error);
    } finally {
      setLoading(false);
      if (isRefresh) setRefreshing(false);
    }
  };

  // Load more saat scroll ke bawah
  const handleLoadMore = () => {
    if (!loading && hasMore) {
      setPage(prev => prev + 1);
    }
  };

  // Refresh data (pull-to-refresh)
  const handleRefresh = () => {
    setRefreshing(true);
    setPage(1);
    fetchRiwayat(1, true);
  };

  // Fetch data saat page berubah
  useEffect(() => {
    fetchRiwayat(page);
  }, [page]);

  const renderItem = useCallback(({ item }: { item: RiwayatItem }) => (
    <View style={styles.card}>
      <Text style={styles.title}>{item.title}</Text>
      <Text style={styles.description}>{item.description}</Text>
      <Text style={styles.date}>{item.date}</Text>
    </View>
  ), []);

  const renderFooter = () => {
    if (!loading) return null;
    return <ActivityIndicator size="small" color="#007AFF" style={{ marginVertical: 10 }} />;
  };

  return (
    <View style={styles.container}>
      <FlatList
        data={data}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderItem}
        onEndReached={handleLoadMore}
        onEndReachedThreshold={0.5}
        ListFooterComponent={renderFooter}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
      />
    </View>
  );
};

export default Riwayat;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    paddingHorizontal: 16,
    paddingTop: 10,
  },
  card: {
    backgroundColor: "#f9f9f9",
    padding: 14,
    borderRadius: 12,
    marginBottom: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  title: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 6,
  },
  description: {
    fontSize: 14,
    color: "#555",
    marginBottom: 6,
  },
  date: {
    fontSize: 12,
    color: "#999",
  },
});
