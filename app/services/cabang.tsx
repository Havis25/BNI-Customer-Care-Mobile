import { Fonts } from "@/constants/Fonts";
import { hp, rf, wp } from "@/utils/responsive";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import React, { useState } from "react";
import {
  FlatList,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const cabangData = [
  {
    id: "1",
    nama: "BNI Kantor Pusat",
    alamat: "Jl. Jend. Sudirman Kav. 1, Jakarta Pusat 10220",
    telepon: "(021) 251-1946",
    jamBuka: "08:00 - 15:00",
    layanan: [
      "Teller",
      "Customer Service",
      "ATM",
      "Priority Banking",
      "Safe Deposit Box",
    ],
    jarak: "1.2 km",
  },
  {
    id: "2",
    nama: "BNI Cabang Thamrin",
    alamat: "Jl. M.H. Thamrin No. 46, Jakarta Pusat 10350",
    telepon: "(021) 390-4946",
    jamBuka: "08:00 - 15:00",
    layanan: ["Teller", "Customer Service", "ATM", "Safe Deposit Box"],
    jarak: "1.8 km",
  },
  {
    id: "3",
    nama: "BNI Cabang Harmoni",
    alamat: "Jl. Gajah Mada No. 1, Jakarta Pusat 10130",
    telepon: "(021) 626-4946",
    jamBuka: "08:00 - 15:00",
    layanan: ["Teller", "Customer Service", "ATM", "Kredit"],
    jarak: "2.3 km",
  },
  {
    id: "4",
    nama: "BNI Cabang Senayan",
    alamat: "Jl. Asia Afrika No. 8, Gelora Bung Karno, Jakarta Selatan 10270",
    telepon: "(021) 572-1946",
    jamBuka: "08:00 - 15:00",
    layanan: ["Teller", "Customer Service", "ATM", "Priority Banking"],
    jarak: "3.5 km",
  },
  {
    id: "5",
    nama: "BNI Cabang Blok M",
    alamat: "Jl. Bulungan No. 76, Blok M, Jakarta Selatan 12130",
    telepon: "(021) 739-1946",
    jamBuka: "08:00 - 15:00",
    layanan: ["Teller", "Customer Service", "ATM", "Kredit"],
    jarak: "4.2 km",
  },
  {
    id: "6",
    nama: "BNI Cabang Kelapa Gading",
    alamat:
      "Mall of Indonesia Lt. 1, Jl. Boulevard Barat Raya, Jakarta Utara 14240",
    telepon: "(021) 452-1946",
    jamBuka: "10:00 - 22:00",
    layanan: ["Teller", "Customer Service", "ATM"],
    jarak: "8.7 km",
  },
  {
    id: "7",
    nama: "BNI Cabang Menteng",
    alamat: "Jl. Menteng Raya No. 29, Jakarta Pusat 10340",
    telepon: "(021) 314-1946",
    jamBuka: "08:00 - 15:00",
    layanan: ["Teller", "Customer Service", "ATM", "Safe Deposit Box"],
    jarak: "2.1 km",
  },
  {
    id: "8",
    nama: "BNI Cabang Cikini",
    alamat: "Jl. Cikini Raya No. 58, Jakarta Pusat 10330",
    telepon: "(021) 315-1946",
    jamBuka: "08:00 - 15:00",
    layanan: ["Teller", "Customer Service", "ATM"],
    jarak: "2.8 km",
  },
];

const atmData = [
  {
    id: "1",
    nama: "ATM BNI Plaza Indonesia",
    alamat:
      "Plaza Indonesia Shopping Center Lt. B1, Jl. M.H. Thamrin Kav. 28-30, Jakarta Pusat",
    status: "Aktif",
    jarak: "1.5 km",
  },
  {
    id: "2",
    nama: "ATM BNI Grand Indonesia",
    alamat:
      "Grand Indonesia Shopping Town Lt. 1, Jl. M.H. Thamrin No. 1, Jakarta Pusat",
    status: "Aktif",
    jarak: "1.8 km",
  },
  {
    id: "3",
    nama: "ATM BNI Sarinah",
    alamat: "Gedung Sarinah Lt. 1, Jl. M.H. Thamrin No. 11, Jakarta Pusat",
    status: "Aktif",
    jarak: "2.1 km",
  },
  {
    id: "4",
    nama: "ATM BNI Sudirman",
    alamat: "Wisma BNI Lt. 1, Jl. Jend. Sudirman Kav. 1, Jakarta Pusat",
    status: "Aktif",
    jarak: "1.2 km",
  },
  {
    id: "5",
    nama: "ATM BNI Senayan City",
    alamat: "Senayan City Lt. 1, Jl. Asia Afrika No. 19, Jakarta Selatan",
    status: "Aktif",
    jarak: "3.2 km",
  },
  {
    id: "6",
    nama: "ATM BNI FX Sudirman",
    alamat:
      "fX Sudirman Lt. 1, Jl. Jend. Sudirman Pintu Satu Senayan, Jakarta Pusat",
    status: "Aktif",
    jarak: "2.8 km",
  },
  {
    id: "7",
    nama: "ATM BNI Menteng",
    alamat: "Jl. Menteng Raya No. 25, Jakarta Pusat",
    status: "Maintenance",
    jarak: "2.0 km",
  },
  {
    id: "8",
    nama: "ATM BNI Blok M Plaza",
    alamat: "Blok M Plaza Lt. 1, Jl. Bulungan No. 76, Jakarta Selatan",
    status: "Aktif",
    jarak: "4.5 km",
  },
  {
    id: "9",
    nama: "ATM BNI Kelapa Gading Mall",
    alamat: "Kelapa Gading Mall Lt. 1, Jl. Boulevard Barat Raya, Jakarta Utara",
    status: "Aktif",
    jarak: "8.9 km",
  },
  {
    id: "10",
    nama: "ATM BNI Cikini",
    alamat: "Jl. Cikini Raya No. 15, Jakarta Pusat",
    status: "Aktif",
    jarak: "2.5 km",
  },
];

interface CabangItem {
  id: string;
  nama: string;
  alamat: string;
  telepon: string;
  jamBuka: string;
  layanan: string[];
  jarak: string;
}

interface ATMItem {
  id: string;
  nama: string;
  alamat: string;
  status: string;
  jarak: string;
}

export default function CabangScreen() {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("cabang");

  const filteredCabangData = cabangData.filter(
    (item) =>
      item.nama.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.alamat.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredAtmData = atmData.filter(
    (item) =>
      item.nama.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.alamat.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const renderCabang = ({ item }: { item: CabangItem }) => (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <View style={styles.nameContainer}>
          <Text style={styles.cardTitle}>{item.nama}</Text>
          <View style={styles.distanceContainer}>
            <Ionicons name="location-outline" size={14} color="#666" />
            <Text style={styles.distanceText}>{item.jarak}</Text>
          </View>
        </View>
      </View>

      <View style={styles.cardContent}>
        <View style={styles.infoRow}>
          <Ionicons name="location" size={16} color="#FF6600" />
          <Text style={styles.infoText}>{item.alamat}</Text>
        </View>

        <View style={styles.infoRow}>
          <Ionicons name="call" size={16} color="#FF6600" />
          <Text style={styles.infoText}>{item.telepon}</Text>
        </View>

        <View style={styles.infoRow}>
          <Ionicons name="time" size={16} color="#FF6600" />
          <Text style={styles.infoText}>{item.jamBuka}</Text>
        </View>

        <View style={styles.layananContainer}>
          {item.layanan.map((layanan, index) => (
            <View key={index} style={styles.layananBadge}>
              <Text style={styles.layananText}>{layanan}</Text>
            </View>
          ))}
        </View>
      </View>
    </View>
  );

  const renderATM = ({ item }: { item: ATMItem }) => (
    <View style={styles.atmCard}>
      <View style={styles.cardHeader}>
        <View style={styles.nameContainer}>
          <Text style={styles.atmTitle}>{item.nama}</Text>
          <View style={styles.distanceContainer}>
            <Ionicons name="location-outline" size={14} color="#666" />
            <Text style={styles.distanceText}>{item.jarak}</Text>
          </View>
        </View>
        <View
          style={[
            styles.statusBadge,
            {
              backgroundColor: item.status === "Aktif" ? "#4CAF50" : "#FF9800",
            },
          ]}
        >
          <Text style={styles.statusText}>{item.status}</Text>
        </View>
      </View>

      <View style={styles.atmContent}>
        <View style={styles.infoRow}>
          <Ionicons name="location" size={16} color="#FF6600" />
          <Text style={styles.infoText}>{item.alamat}</Text>
        </View>
      </View>
    </View>
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
          <Text style={styles.header}>Cabang & ATM</Text>
        </View>
      </View>

      <FlatList
        style={styles.container}
        data={activeTab === "cabang" ? filteredCabangData : (filteredAtmData as any)}
        renderItem={activeTab === "cabang" ? renderCabang : (renderATM as any)}
        keyExtractor={(item) => item.id}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        ListHeaderComponent={
          <>
            <View style={styles.searchFilterContainer}>
              <View style={styles.searchContainer}>
                <Ionicons
                  name="search"
                  size={20}
                  color="#666"
                  style={styles.searchIcon}
                />
                <TextInput
                  style={styles.searchInput}
                  placeholder="Cari cabang atau ATM BNI terdekat..."
                  placeholderTextColor="#999"
                  value={searchQuery}
                  onChangeText={setSearchQuery}
                />
              </View>
            </View>
            <View style={styles.combinedSectionHeader}>
              <View style={styles.underlineTabs}>
                <TouchableOpacity
                  style={styles.underlineTab}
                  onPress={() => setActiveTab("cabang")}
                >
                  <Text
                    style={[
                      styles.underlineText,
                      activeTab === "cabang" && styles.activeUnderlineText,
                    ]}
                  >
                    Cabang
                  </Text>
                  {activeTab === "cabang" && <View style={styles.underline} />}
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.underlineTab}
                  onPress={() => setActiveTab("atm")}
                >
                  <Text
                    style={[
                      styles.underlineText,
                      activeTab === "atm" && styles.activeUnderlineText,
                    ]}
                  >
                    ATM
                  </Text>
                  {activeTab === "atm" && <View style={styles.underline} />}
                </TouchableOpacity>
              </View>
            </View>
          </>
        }
      />
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
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  backButton: {
    marginRight: 16,
    padding: 4,
  },
  container: {
    flex: 1,
    paddingHorizontal: wp(4),
  },
  header: {
    fontSize: rf(24),
    fontFamily: Fonts.bold,
    color: "black",
    flex: 1,
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
  combinedSection: {
    backgroundColor: "white",
    borderRadius: 16,
    marginBottom: 16,
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  combinedSectionHeader: {
    backgroundColor: "white",
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    marginBottom: 0,
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
        elevation: 2,
      },
    }),
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
  section: {
    padding: 16,
  },
  card: {
    backgroundColor: "white",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#e9ecef",
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 12,
  },
  nameContainer: {
    flex: 1,
  },
  cardTitle: {
    fontSize: 16,
    fontFamily: Fonts.semiBold,
    color: "black",
    marginBottom: 4,
  },
  distanceContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  distanceText: {
    fontSize: 12,
    fontFamily: Fonts.medium,
    color: "#666",
    marginLeft: 4,
  },
  cardContent: {
    gap: 8,
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  infoText: {
    fontSize: 12,
    fontFamily: Fonts.medium,
    color: "#333",
    marginLeft: 8,
    flex: 1,
  },
  layananContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginTop: 8,
    gap: 6,
  },
  layananBadge: {
    backgroundColor: "#e3f2fd",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  layananText: {
    fontSize: 10,
    fontFamily: Fonts.medium,
    color: "#1976d2",
  },
  atmCard: {
    backgroundColor: "white",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#e9ecef",
  },
  atmTitle: {
    fontSize: 14,
    fontFamily: Fonts.semiBold,
    color: "black",
    marginBottom: 4,
  },
  atmContent: {
    marginTop: 8,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  statusText: {
    fontSize: 10,
    fontFamily: Fonts.medium,
    color: "white",
  },
});
