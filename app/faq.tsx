import { Fonts } from "@/constants/Fonts";
import { useFaq } from "@/hooks/useFaq";
import { hp, rf, wp } from "@/utils/responsive";
import { Ionicons } from "@expo/vector-icons";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  Animated,
  Platform,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function FAQScreen() {
  const [expandedItems, setExpandedItems] = useState<number[]>([]);
  const [searchText, setSearchText] = useState("");
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState<"faq" | "guide">("faq");
  const { faqs, isLoading, error, fetchFaqs } = useFaq();

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await Promise.all([
        fetchFaqs(),
        new Promise((resolve) => setTimeout(resolve, 1000)),
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

  const guides = [
    {
      id: 1,
      title: "Cara Membuat Laporan Keluhan dengan Chat bot",
      content:
        "1. Buka aplikasi BNI Customer Care (B-Care)\n2. Pilih menu 'Ajukan Laporan'\n3. Mulai percakapan dengan chatbot\n4. Pilih channel\n5. Pilih kategori\n6. Jelaskan permasalahan dialami\n7. Masukkan nominal transaksi\n8. Masukkan tanggal kejadian yang valid\n9. Klik 'Buat Tiket' untuk membuat dan mencetak tiket\n10. Tunggu pesan dari Live Agent untuk proses validasi\n11. Upload bukti pendukung jika diminta\n12. Verifikasi laporan melalui panggilan telepon bersama agen\n13. Selesai — laporan berhasil diajukan",
    },

    {
      id: 2,
      title: "Cara Melacak Status Laporan",
      content:
        "1. Masuk ke menu 'Riwayat'\n2. Pilih laporan yang ingin dilihat\n3. Status progress akan ditampilkan\n4. Anda dapat melihat detail setiap tahap penanganan",
    },
    {
      id: 3,
      title: "Cara Menggunakan Live Chat",
      content:
        "1. Buka detail laporan Anda\n2. Klik tombol 'Live Chat'\n3. Pilih metode komunikasi (Chat/Call)\n4. Tunggu agent tersedia\n5. Mulai percakapan dengan agent",
    },
    {
      id: 4,
      title: "Cara Memberikan Feedback",
      content:
        "1. Setelah laporan selesai ditangani\n2. Modal feedback akan muncul otomatis\n3. Berikan rating 1-5 bintang\n4. Tulis komentar Anda\n5. Klik 'Kirim' untuk mengirim feedback",
    },
  ];

  const filteredData = activeTab === 'faq' 
    ? faqs.filter((item) =>
        item.question.toLowerCase().includes(searchText.toLowerCase()) ||
        item.answer.toLowerCase().includes(searchText.toLowerCase())
      )
    : guides.filter((guide) =>
        guide.title.toLowerCase().includes(searchText.toLowerCase()) ||
        guide.content.toLowerCase().includes(searchText.toLowerCase())
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
          <Text style={styles.header}>FaQ & Panduan</Text>
        </View>
      </View>

      <ScrollView
        style={styles.container}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={["#52B5AB"]}
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

        {/* Tab Navigation */}
        <View style={styles.tabContainer}>
          <View style={styles.underlineTabs}>
            <TouchableOpacity
              style={styles.underlineTab}
              onPress={() => setActiveTab("faq")}
            >
              <Text
                style={[
                  styles.underlineText,
                  activeTab === "faq" && styles.activeUnderlineText,
                ]}
              >
                FaQ
              </Text>
              {activeTab === "faq" && <View style={styles.underline} />}
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.underlineTab}
              onPress={() => setActiveTab("guide")}
            >
              <Text
                style={[
                  styles.underlineText,
                  activeTab === "guide" && styles.activeUnderlineText,
                ]}
              >
                Panduan
              </Text>
              {activeTab === "guide" && <View style={styles.underline} />}
            </TouchableOpacity>
          </View>
        </View>

        {/* Content based on active tab */}
        <View style={styles.card}>
          {activeTab === "faq" ? (
            // FAQ Content
            isLoading ? (
              <>
                {[1, 2, 3, 4, 5].map((item) => (
                  <SkeletonFaqItem key={item} />
                ))}
              </>
            ) : error ? (
              <View style={styles.errorContainer}>
                <MaterialIcons name="error-outline" size={48} color="#E24646" />
                <Text style={styles.errorTitle}>Gagal Memuat FAQ</Text>
                <Text style={styles.errorDescription}>
                  Terjadi kesalahan saat mengambil data FAQ. Periksa koneksi
                  internet Anda dan coba lagi.
                </Text>
                <TouchableOpacity
                  style={styles.retryButton}
                  onPress={fetchFaqs}
                >
                  <Text style={styles.retryText}>Coba Lagi</Text>
                </TouchableOpacity>
              </View>
            ) : filteredData.length === 0 ? (
              <View style={styles.emptyContainer}>
                <MaterialIcons name="help-outline" size={48} color="#999" />
                <Text style={styles.emptyTitle}>Tidak Ada Hasil</Text>
                <Text style={styles.emptyDescription}>
                  Tidak ditemukan FAQ yang sesuai dengan pencarian Anda.
                </Text>
              </View>
            ) : (
              filteredData.map((item: any, index) => {
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
            )
          ) : (
            // Guide Content
            filteredData.length === 0 ? (
              <View style={styles.emptyContainer}>
                <MaterialIcons name="help-outline" size={48} color="#999" />
                <Text style={styles.emptyTitle}>Tidak Ada Hasil</Text>
                <Text style={styles.emptyDescription}>
                  Tidak ditemukan panduan yang sesuai dengan pencarian Anda.
                </Text>
              </View>
            ) : (
              filteredData.map((guide: any, index: number) => {
                const isExpanded = expandedItems.includes(guide.id);
                return (
                  <View key={guide.id}>
                    <TouchableOpacity
                      style={[
                        styles.faqItem,
                        index === 0 && styles.firstItem,
                        index === filteredData.length - 1 && styles.lastItem,
                      ]}
                      onPress={() => toggleExpand(guide.id)}
                      activeOpacity={0.8}
                    >
                      <View style={styles.questionContainer}>
                        <Text style={styles.question}>{guide.title}</Text>
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
                        <Text style={styles.answer}>{guide.content}</Text>
                      </View>
                    )}
                  </View>
                );
              })
            )
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
    borderTopLeftRadius: 0,
    borderTopRightRadius: 0,
    borderBottomLeftRadius: 12,
    borderBottomRightRadius: 12,
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
  firstItem: { borderTopLeftRadius: 0, borderTopRightRadius: 0 },
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
  tabContainer: {
    backgroundColor: "white",
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    marginBottom: 0,
  },
  underlineTabs: {
    flexDirection: "row",
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#F0F0F0",
  },
  underlineTab: {
    flex: 1,
    alignItems: "center",
    paddingVertical: 16,
    position: "relative",
  },
  underlineText: {
    fontSize: 16,
    fontFamily: Fonts.medium,
    color: "#999",
  },
  activeUnderlineText: {
    color: "#FF6600",
    fontFamily: Fonts.bold,
  },
  underline: {
    position: "absolute",
    bottom: 0,
    left: "25%",
    right: "25%",
    height: 3,
    backgroundColor: "#FF6600",
    borderRadius: 2,
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
        <Animated.View
          style={[
            styles.skeletonText,
            { flex: 1, marginRight: 12 },
            animatedStyle,
          ]}
        />
        <Animated.View style={[styles.skeletonIcon, animatedStyle]} />
      </View>
    </View>
  );
}
