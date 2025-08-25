import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  Animated,
  RefreshControl,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { Fonts } from "@/constants/Fonts";
import { Ionicons } from "@expo/vector-icons";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { router } from "expo-router";
import { useFaq } from "@/hooks/useFaq";
import { wp, hp, rf, deviceType } from "@/utils/responsive";



export default function FAQScreen() {
  const [expandedItems, setExpandedItems] = useState<number[]>([]);
  const [searchText, setSearchText] = useState("");
  const [refreshing, setRefreshing] = useState(false);
  const { faqs, isLoading, error, fetchFaqs } = useFaq();

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await Promise.all([
        fetchFaqs(),
        new Promise(resolve => setTimeout(resolve, 1000))
      ]);
    } finally {
      setRefreshing(false);
    }
  }, [fetchFaqs]);

  useEffect(() => {
    fetchFaqs();
  }, [fetchFaqs]);

  const toggleExpand = (id: number) => {
    setExpandedItems((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const filteredData = faqs.filter((item) =>
    item.question.toLowerCase().includes(searchText.toLowerCase())
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <LinearGradient
        colors={["#DEEF5A", "#FCFDEE"]}
        locations={[0.23, 0.37]}
        style={StyleSheet.absoluteFill}
      />

      <View style={styles.headerSection}>
        <View style={styles.headerRow}>
          <TouchableOpacity
            onPress={() => router.back()}
            style={styles.backButton}
          >
            <Ionicons name="arrow-back" size={24} color="black" />
          </TouchableOpacity>
          <Text style={styles.header}>FAQ</Text>
        </View>
      </View>

      <ScrollView 
        style={styles.container} 
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={['#52B5AB']}
            tintColor="#52B5AB"
          />
        }
      >
        {/* Teks di luar card */}
        <Text style={styles.helpText}>Bagaimana kami dapat membantu?</Text>

        {/* Search bar */}
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
              placeholder="Cari pertanyaan..."
              placeholderTextColor="#999"
              value={searchText}
              onChangeText={setSearchText}
            />
          </View>
        </View>

        {/* Card FAQ menyatu */}
        <View style={styles.card}>
          {isLoading ? (
            <>
              {[1, 2, 3, 4, 5].map((item) => (
                <SkeletonFaqItem key={item} />
              ))}
            </>
          ) : error ? (
            <View style={styles.errorContainer}>
              <MaterialIcons name="error-outline" size={48} color="#E24646" />
              <Text style={styles.errorTitle}>Gagal Memuat FAQ</Text>
              <Text style={styles.errorDescription}>Terjadi kesalahan saat mengambil data FAQ. Periksa koneksi internet Anda dan coba lagi.</Text>
              <TouchableOpacity style={styles.retryButton} onPress={fetchFaqs}>
                <Text style={styles.retryText}>Coba Lagi</Text>
              </TouchableOpacity>
            </View>
          ) : filteredData.length === 0 ? (
            <View style={styles.emptyContainer}>
              <MaterialIcons name="help-outline" size={48} color="#999" />
              <Text style={styles.emptyTitle}>Tidak Ada Hasil</Text>
              <Text style={styles.emptyDescription}>Tidak ditemukan FAQ yang sesuai dengan pencarian Anda.</Text>
            </View>
          ) : (
            filteredData.map((item, index) => {
              const isExpanded = expandedItems.includes(item.faq_id);
              return (
                <View key={item.faq_id}>
                  <TouchableOpacity
                    style={[
                      styles.faqItem,
                      index === 0 && styles.firstItem,
                      index === filteredData.length - 1 && styles.lastItem,
                    ]}
                    onPress={() => toggleExpand(item.faq_id)}
                    activeOpacity={0.8}
                  >
                    <View style={styles.questionContainer}>
                      <Text style={styles.question}>{item.question}</Text>
                      <MaterialIcons
                        name={
                          isExpanded
                            ? "keyboard-arrow-up"
                            : "keyboard-arrow-down"
                        }
                        size={24}
                        color="#FF8636"
                      />
                    </View>
                  </TouchableOpacity>
                  {isExpanded && (
                    <View
                      style={[
                        styles.answerContainer,
                        index === filteredData.length - 1 && styles.lastItem,
                      ]}
                    >
                      <Text
                        style={styles.answer}
                        numberOfLines={undefined}
                        ellipsizeMode={undefined}
                      >
                        {item.answer}
                      </Text>
                    </View>
                  )}
                </View>
              );
            })
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1 },
  headerSection: {
    paddingHorizontal: wp(6),
    paddingTop: hp(2.5),
    paddingBottom: hp(1.2),
  },
  headerRow: { flexDirection: "row", alignItems: "center" },
  backButton: { marginRight: 16, padding: 4 },
  header: {
    fontSize: rf(24),
    fontFamily: Fonts.bold,
    color: "black",
    flex: 1,
  },
  container: { flex: 1, paddingHorizontal: wp(4) },
  helpText: {
    textAlign: "center",
    fontSize: rf(24),
    fontFamily: Fonts.bold,
    color: "black",
    marginBottom: hp(1.5),
    marginTop: hp(1),
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
    backgroundColor: "white",
    borderRadius: 100,
    paddingHorizontal: wp(3.5),
    marginBottom: hp(2),
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    paddingVertical: hp(1.75),
    fontFamily: Fonts.regular,
    fontSize: rf(14),
  },
  card: {
    backgroundColor: "white",
    borderRadius: 12,
    overflow: "hidden",
    paddingHorizontal: wp(4),
    paddingVertical: 0,
    marginBottom: hp(2),
  },
  errorContainer: {
    alignItems: "center",
    paddingVertical: 40,
    paddingHorizontal: 20,
  },
  errorTitle: {
    fontSize: 18,
    fontFamily: Fonts.semiBold,
    color: "#E24646",
    marginTop: 16,
    marginBottom: 8,
  },
  errorDescription: {
    textAlign: "center",
    fontSize: 14,
    fontFamily: Fonts.regular,
    color: "#666",
    marginBottom: 24,
    lineHeight: 20,
  },
  retryButton: {
    backgroundColor: "#52B5AB",
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryText: {
    color: "#fff",
    fontSize: 14,
    fontFamily: Fonts.semiBold,
  },
  emptyContainer: {
    alignItems: "center",
    paddingVertical: 40,
    paddingHorizontal: 20,
  },
  emptyTitle: {
    fontSize: 18,
    fontFamily: Fonts.semiBold,
    color: "#333",
    marginTop: 16,
    marginBottom: 8,
  },
  emptyDescription: {
    textAlign: "center",
    fontSize: 14,
    fontFamily: Fonts.regular,
    color: "#666",
    lineHeight: 20,
  },
  faqItem: {
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: "#e9ecef",
  },
  firstItem: { borderTopLeftRadius: 12, borderTopRightRadius: 12 },
  lastItem: {
    borderBottomLeftRadius: 12,
    borderBottomRightRadius: 12,
    borderBottomWidth: 0,
  },
  questionContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  question: {
    flex: 1,
    fontSize: 14,
    fontFamily: Fonts.semiBold,
    color: "black",
    marginRight: 12,
  },
  answerContainer: {
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: "#e9ecef",
  },
  answer: {
    fontSize: 14,
    fontFamily: Fonts.regular,
    color: "#333",
  },
  loadingContainer: {
    alignItems: "center",
    padding: 32,
  },
  loadingText: {
    fontSize: 14,
    fontFamily: Fonts.regular,
    color: "#666",
    marginTop: 8,
  },
  errorText: {
    textAlign: "center",
    fontSize: 14,
    fontFamily: Fonts.regular,
    color: "#FF6B6B",
    padding: 16,
  },
  skeletonItem: {
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: "#e9ecef",
  },
  skeletonQuestion: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  skeletonText: {
    height: 16,
    backgroundColor: "#E5E5E5",
    borderRadius: 8,
  },
  skeletonIcon: {
    width: 24,
    height: 24,
    backgroundColor: "#E5E5E5",
    borderRadius: 12,
  },
});

function SkeletonFaqItem() {
  const shimmerAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const shimmer = Animated.loop(
      Animated.sequence([
        Animated.timing(shimmerAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: false,
        }),
        Animated.timing(shimmerAnim, {
          toValue: 0,
          duration: 1000,
          useNativeDriver: false,
        }),
      ])
    );
    shimmer.start();
    return () => shimmer.stop();
  }, [shimmerAnim]);

  const animatedStyle = {
    opacity: shimmerAnim.interpolate({
      inputRange: [0, 1],
      outputRange: [0.3, 1],
    }),
  };

  return (
    <View style={styles.skeletonItem}>
      <View style={styles.skeletonQuestion}>
        <Animated.View style={[styles.skeletonText, { flex: 1, marginRight: 12 }, animatedStyle]} />
        <Animated.View style={[styles.skeletonIcon, animatedStyle]} />
      </View>
    </View>
  );
}
