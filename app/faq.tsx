import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { Fonts } from "@/constants/Fonts";
import { Ionicons } from "@expo/vector-icons";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { router } from "expo-router";
import { useFaq } from "@/hooks/useFaq";



export default function FAQScreen() {
  const [expandedItems, setExpandedItems] = useState<number[]>([]);
  const [searchText, setSearchText] = useState("");
  const { faqs, isLoading, error, fetchFaqs } = useFaq();

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
              value={searchText}
              onChangeText={setSearchText}
            />
          </View>
        </View>

        {/* Card FAQ menyatu */}
        <View style={styles.card}>
          {isLoading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#FF8636" />
              <Text style={styles.loadingText}>Memuat FAQ...</Text>
            </View>
          ) : error ? (
            <Text style={styles.errorText}>{error}</Text>
          ) : filteredData.length === 0 ? (
            <Text style={styles.noResult}>Tidak ada hasil ditemukan</Text>
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
});
