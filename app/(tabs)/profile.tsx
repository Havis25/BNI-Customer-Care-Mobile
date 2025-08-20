import LogoutModal from "@/components/modals/LogOut";
import TabTransition from "@/components/TabTransition";
import { useTickets } from "@/hooks/useTickets";
import { useUser } from "@/hooks/useUser";
import { MaterialIcons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { router, useFocusEffect } from "expo-router";
import React, { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  Linking,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import {
  SafeAreaView,
  useSafeAreaInsets,
} from "react-native-safe-area-context";
import { Fonts } from "@/constants/Fonts";

export default function ProfileScreen() {
  const insets = useSafeAreaInsets();
  const { user, loading: userLoading, accounts } = useUser();
  const { tickets, refetch } = useTickets();
  const [totalReports, setTotalReports] = useState(0);
  const [completedReports, setCompletedReports] = useState(0);
  const [statsLoading, setStatsLoading] = useState(true);
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  useEffect(() => {
    if (tickets) {
      fetchTicketStats();
    }
  }, [tickets]);

  // Auto-refresh saat halaman di-focus
  useFocusEffect(
    useCallback(() => {
      refetch();
    }, [refetch])
  );

  const fetchTicketStats = async () => {
    setStatsLoading(true);
    try {
      // Gunakan data fresh dari useTickets
      const ticketList = tickets || [];

      setTotalReports(ticketList.length);
      const selesaiCount = ticketList.filter(
        (t: any) => t.customer_status?.customer_status_code?.toUpperCase() === "CLOSED"
      ).length;
      setCompletedReports(selesaiCount);
    } catch (error) {
      console.error("Error processing ticket stats:", error);
      setTotalReports(0);
      setCompletedReports(0);
    } finally {
      setStatsLoading(false);
    }
  };

  const handlePress = async (url: string) => {
    try {
      const supported = await Linking.canOpenURL(url);
      if (supported) {
        await Linking.openURL(url);
      } else {
        Alert.alert("Error", `Tidak bisa membuka link: ${url}`);
      }
    } catch (error) {
      Alert.alert("Error", "Terjadi kesalahan saat membuka link");
    }
  };

  const handleLogout = () => {
    setShowLogoutModal(true);
  };

  const confirmLogout = async () => {
    await AsyncStorage.removeItem("customer");
    await AsyncStorage.removeItem("isLoggedIn");
    router.replace("/login");
  };

  if (userLoading) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View
          style={{ flex: 1, justifyContent: "center", alignItems: "center" }}
        >
          <ActivityIndicator size="large" color="#FF6600" />
          <Text style={{ marginTop: 12, fontFamily: Fonts.regular }}>
            Memuat data...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <TabTransition>
      <SafeAreaView style={styles.safeArea}>
        <Text style={styles.headerTitle}>Profil</Text>
        <ScrollView
          contentContainerStyle={{ paddingBottom: insets.bottom + 100 }}
        >
          {/* Judul */}

          {/* Foto Profil Bulat */}
          <View style={styles.avatarContainer}>
            <MaterialIcons name="person" size={40} color="#FF6600" />
          </View>

          {/* Nama & Email */}
          <Text style={styles.userName}>{user?.full_name || "User"}</Text>
          <Text style={styles.userEmail}>
            {user?.email || "user@gmail.com"}
          </Text>

          {/* Statistik Akun */}
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionHeaderText}>STATISTIK AKUN</Text>
          </View>
          <View style={styles.statsRow}>
            <View style={styles.statBox}>
              <Text style={styles.statNumber}>{totalReports}</Text>
              <Text style={styles.statLabel}>Total Laporan</Text>
            </View>
            <View style={styles.divider} />
            <View style={styles.statBox}>
              <Text style={styles.statNumber}>{completedReports}</Text>
              <Text style={styles.statLabel}>Laporan Selesai</Text>
            </View>
          </View>

          {/* Informasi Pengguna */}
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionHeaderText}>INFORMASI PENGGUNA</Text>
          </View>
          <View style={styles.infoContainer}>
            <Text style={styles.infoLabel}>Nomor Rekening</Text>
            {accounts.length > 0 ? (
              accounts.map((account, index) => (
                <Text key={index} style={styles.infoValue}>
                  {account.account_number} ({account.account_type})
                </Text>
              ))
            ) : (
              <Text style={styles.infoValue}>Memuat data rekening...</Text>
            )}

            <Text style={styles.infoLabel}>No Handphone</Text>
            <Text style={styles.infoValue}>{user?.phone_number || "N/A"}</Text>

            <Text style={styles.infoLabel}>Alamat</Text>
            <Text style={styles.infoValue}>{user?.address || "N/A"}</Text>
          </View>

          {/* Media Sosial */}
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionHeaderText}>MEDIA SOSIAL</Text>
          </View>

          <TouchableOpacity
            style={styles.socialRow}
            onPress={() =>
              handlePress("https://api.whatsapp.com/send?phone=628118611946")
            }
          >
            <View style={styles.socialLeft}>
              <Text style={styles.socialTitle}>Whatsapp</Text>
              <View style={styles.socialIconSubtitleRow}>
                <Image
                  source={require("../../assets/images/icon_whatsapp.png")}
                  style={styles.socialIcon}
                />
                <Text style={styles.socialSubtitle}>WhatsApp BNI</Text>
              </View>
            </View>
            <MaterialIcons name="chevron-right" size={24} color="#000" />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.socialRow}
            onPress={() => handlePress("mailto:bnicall@bni.co.id")}
          >
            <View style={styles.socialLeft}>
              <Text style={styles.socialTitle}>Email</Text>
              <View style={styles.socialIconSubtitleRow}>
                <Image
                  source={require("../../assets/images/icon_email.png")}
                  style={styles.socialIcon}
                />
                <Text style={styles.socialSubtitle}>bnicall@bni.co.id</Text>
              </View>
            </View>
            <MaterialIcons name="chevron-right" size={24} color="#000" />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.socialRow}
            onPress={() => handlePress("https://www.instagram.com/bni46")}
          >
            <View style={styles.socialLeft}>
              <Text style={styles.socialTitle}>Instagram</Text>
              <View style={styles.socialIconSubtitleRow}>
                <Image
                  source={require("../../assets/images/icon_instagram.png")}
                  style={styles.socialIcon}
                />
                <Text style={styles.socialSubtitle}>bni46</Text>
              </View>
            </View>
            <MaterialIcons name="chevron-right" size={24} color="#000" />
          </TouchableOpacity>

          {/* Tombol Keluar */}
          <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
            <MaterialIcons name="logout" size={24} color="red" />
            <Text style={styles.logoutText}>Keluar</Text>
          </TouchableOpacity>
        </ScrollView>

        <LogoutModal
          visible={showLogoutModal}
          onCancel={() => setShowLogoutModal(false)}
          onConfirm={() => {
            setShowLogoutModal(false);
            confirmLogout();
          }}
          message="Yakin ingin keluar dari akun?"
          cancelText="Batal"
          confirmText="Keluar"
        />
      </SafeAreaView>
    </TabTransition>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    paddingBottom: -35,
  },
  headerTitle: {
    fontSize: 18,
    textAlign: "center",
    paddingTop: 10,
    paddingBottom: 16,
    fontFamily: Fonts.bold,
  },
  avatarContainer: {
    alignSelf: "center",
    width: 92,
    height: 92,
    borderRadius: 46,
    backgroundColor: "#FFF4EC",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 20,
  },
  userName: {
    fontSize: 16,
    textAlign: "center",
    marginTop: 10,
    fontFamily: Fonts.semiBold,
  },
  userEmail: {
    fontSize: 14,
    color: "black",
    textAlign: "center",
    marginBottom: 20,
    fontFamily: Fonts.regular,
  },
  sectionHeader: {
    fontSize: 14,
    color: "#939393",
    backgroundColor: "#F3F3F3",
    paddingVertical: 8,
    paddingHorizontal: 16,
    fontFamily: Fonts.regular,
  },
  sectionHeaderText: {
    fontSize: 14,
    color: "#999",
    fontFamily: Fonts.semiBold,
  },
  statsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  statBox: {
    flex: 1,
    alignItems: "center",
  },
  statNumber: {
    fontSize: 18,
    fontFamily: Fonts.semiBold,
  },
  statLabel: {
    fontSize: 12,
    fontFamily: Fonts.medium,
  },
  divider: {
    width: 1,
    backgroundColor: "#DDD",
    height: "100%",
  },
  infoContainer: {
    paddingBottom: 16,
    paddingHorizontal: 16,
  },
  infoLabel: {
    marginTop: 12,
    fontSize: 14,
    fontFamily: Fonts.bold,
  },
  infoValue: {
    fontSize: 14,
    marginTop: 2,
    fontFamily: Fonts.medium,
  },
  socialRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 10,
    paddingHorizontal: 16,
  },
  socialLeft: {
    flexDirection: "column",
    alignItems: "flex-start",
    flexShrink: 1,
    flexGrow: 1,
    paddingLeft: 4,
  },
  socialTitle: {
    fontSize: 14,
    marginBottom: 12,
    fontFamily: Fonts.semiBold,
  },
  socialIconSubtitleRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  socialIcon: {
    width: 45,
    height: 45,
    resizeMode: "contain",
    marginRight: 12,
  },
  socialSubtitle: {
    fontSize: 13,
    color: "#555",
    fontFamily: Fonts.semiBold,
  },
  logoutButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginHorizontal: 16,
    marginTop: 16,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: "#D32F2F",
    borderRadius: 8,
    gap: 12,
    backgroundColor: "rgba(211,47,47,0.1)",
  },
  logoutText: {
    fontSize: 14,
    color: "red",
    fontFamily: Fonts.semiBold,
  },
});
