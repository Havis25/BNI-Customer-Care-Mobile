import { MaterialIcons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import { router } from "expo-router";
import React, { useEffect, useState } from "react";
import { useUser } from "@/hooks/useUser";
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
import { Fonts } from "../../constants/Fonts";

export default function ProfileScreen() {
  const insets = useSafeAreaInsets();
  const { user, loading: userLoading, accounts } = useUser();
  const [totalReports, setTotalReports] = useState(0);
  const [completedReports, setCompletedReports] = useState(0);
  const [statsLoading, setStatsLoading] = useState(true);

  useEffect(() => {
    if (user?.customer_id) {
      fetchTicketStats();
    }
  }, [user?.customer_id]);

  const fetchTicketStats = async () => {
    setStatsLoading(true);
    try {
      const response = await axios.get(
        `http://34.121.13.94:3000/ticket?customer_id=${user?.customer_id}`
      );
      const tickets = response.data;

      if (Array.isArray(tickets)) {
        setTotalReports(tickets.length);
        const selesaiCount = tickets.filter(
          (t) => t.agent_status?.toLowerCase() === "selesai"
        ).length;
        setCompletedReports(selesaiCount);
      } else {
        setTotalReports(0);
        setCompletedReports(0);
      }
    } catch (error) {
      console.error("Error fetching ticket stats:", error);
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
    Alert.alert("Logout", "Kamu yakin ingin keluar?", [
      { text: "Batal", style: "cancel" },
      {
        text: "Ya",
        onPress: async () => {
          await AsyncStorage.removeItem("customer");
          await AsyncStorage.removeItem("isLoggedIn");
          router.replace("/login");
        },
      },
    ]);
  };

  if (userLoading) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
          <ActivityIndicator size="large" color="#FF6600" />
          <Text style={{ marginTop: 12, fontFamily: Fonts.regular }}>
            Memuat data...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={{ paddingBottom: insets.bottom + 40 }}>
        {/* Judul */}
        <Text style={styles.headerTitle}>Profile</Text>

        {/* Foto Profil Bulat */}
        <View style={styles.avatarContainer}>
          <MaterialIcons name="person" size={40} color="#FF6600" />
        </View>

        {/* Nama & Email */}
        <Text style={styles.userName}>{user?.full_name || "User"}</Text>
        <Text style={styles.userEmail}>{user?.email || "user@gmail.com"}</Text>

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
            <Text style={styles.infoValue}>Nomor rekening tidak tersedia</Text>
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
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  headerTitle: {
    fontSize: 18,
    textAlign: "center",
    marginTop: 12,
    fontFamily: Fonts.regular,
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
    fontFamily: Fonts.bold,
  },
  userEmail: {
    fontSize: 12,
    color: "#555",
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
    fontFamily: Fonts.regular,
  },
  divider: {
    width: 1,
    backgroundColor: "#DDD",
    height: "100%",
  },
  infoContainer: {
    padding: 16,
  },
  infoLabel: {
    marginTop: 12,
    fontSize: 14,
    fontFamily: Fonts.bold,
  },
  infoValue: {
    fontSize: 14,
    marginTop: 2,
    fontFamily: Fonts.regular,
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
