import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { Fonts } from "@/constants/Fonts";
import { Ionicons } from "@expo/vector-icons";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { router } from "expo-router";

const faqData = [
  {
    id: 1,
    question: "Bagaimana cara membuka rekening BNI?",
    answer:
      "Anda dapat membuka rekening BNI dengan datang langsung ke kantor cabang terdekat dengan membawa KTP, NPWP, dan setoran awal minimal sesuai jenis rekening yang dipilih.",
  },
  {
    id: 2,
    question: "Berapa biaya administrasi bulanan rekening tabungan?",
    answer:
      "Biaya administrasi bulanan bervariasi tergantung jenis rekening. BNI Taplus Rp 12.000/bulan, BNI Taplus Muda Rp 5.000/bulan, dan BNI Emerald bebas biaya admin.",
  },
  {
    id: 3,
    question: "Bagaimana cara mengaktifkan mobile banking BNI?",
    answer:
      "Kunjungi ATM BNI, pilih menu Registrasi, pilih Mobile Banking, masukkan nomor HP, buat PIN 6 digit, lalu download aplikasi BNI Mobile Banking dan login dengan user ID dan PIN yang telah dibuat.",
  },
  {
    id: 4,
    question: "Apa yang harus dilakukan jika kartu ATM tertelan?",
    answer:
      "Segera hubungi BNI Call 1500046 atau datang ke kantor cabang terdekat dengan membawa identitas diri untuk proses pemblokiran dan penggantian kartu.",
  },
  {
    id: 5,
    question: "Bagaimana cara mengajukan kartu kredit BNI?",
    answer:
      "Anda dapat mengajukan melalui website BNI, datang ke kantor cabang, atau melalui sales BNI. Syarat: WNI berusia 21-65 tahun, penghasilan minimal Rp 3 juta/bulan, dan dokumen pendukung.",
  },
  {
    id: 6,
    question: "Berapa limit transfer harian BNI?",
    answer:
      "Limit transfer bervariasi: ATM Rp 20 juta/hari, Mobile Banking Rp 25 juta/hari, Internet Banking Rp 100 juta/hari. Limit dapat disesuaikan sesuai kebutuhan nasabah.",
  },
  {
    id: 7,
    question: "Bagaimana cara mengganti PIN ATM yang lupa?",
    answer:
      "Datang ke kantor cabang BNI dengan membawa kartu ATM dan identitas diri, atau hubungi BNI Call 1500046 untuk bantuan reset PIN.",
  },
  {
    id: 8,
    question: "Apa itu BNI Reward dan bagaimana cara menggunakannya?",
    answer:
      "BNI Reward adalah program loyalitas untuk nasabah kartu kredit BNI. Poin dapat ditukar dengan berbagai hadiah melalui website BNI Reward atau aplikasi mobile banking.",
  },
];

export default function FAQScreen() {
  const [expandedItems, setExpandedItems] = useState<number[]>([]);
  const [searchText, setSearchText] = useState("");

  const toggleExpand = (id: number) => {
    setExpandedItems((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const filteredData = faqData.filter((item) =>
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

      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
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
              // value={searchQuery}
              // onChangeText={setSearchQuery}
            />
          </View>
        </View>

        {/* Card FAQ menyatu */}
        <View style={styles.card}>
          {filteredData.length === 0 ? (
            <Text style={styles.noResult}>Tidak ada hasil ditemukan</Text>
          ) : (
            filteredData.map((item, index) => {
              const isExpanded = expandedItems.includes(item.id);
              return (
                <View key={item.id}>
                  <TouchableOpacity
                    style={[
                      styles.faqItem,
                      index === 0 && styles.firstItem,
                      index === filteredData.length - 1 && styles.lastItem,
                    ]}
                    onPress={() => toggleExpand(item.id)}
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
    paddingHorizontal: 24,
    paddingTop: 20,
    paddingBottom: 10,
  },
  headerRow: { flexDirection: "row", alignItems: "center" },
  backButton: { marginRight: 16, padding: 4 },
  header: {
    fontSize: 24,
    fontFamily: Fonts.bold,
    color: "black",
    flex: 1,
  },
  container: { flex: 1, paddingHorizontal: 16 },
  helpText: {
    textAlign: "center",
    fontSize: 24,
    fontFamily: Fonts.bold,
    color: "black",
    marginBottom: 12,
    marginTop: 8,
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
    paddingHorizontal: 14,
    marginBottom: 16,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    paddingVertical: 14,
    fontFamily: Fonts.regular,
    fontSize: 14,
  },
  card: {
    backgroundColor: "white",
    borderRadius: 12,
    overflow: "hidden",
    paddingHorizontal: 16,
    paddingVertical: 0,
    marginBottom: 16,
  },
  noResult: {
    textAlign: "center",
    fontSize: 14,
    fontFamily: Fonts.regular,
    color: "#999",
    padding: 16,
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
    paddingBottom: 14,
    borderBottomWidth: 1,
    borderBottomColor: "#e9ecef",
  },
  answer: {
    fontSize: 14,
    fontFamily: Fonts.regular,
    color: "#333",
    // lineHeight: 20,
  },
});
