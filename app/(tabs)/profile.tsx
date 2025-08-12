import { MaterialIcons } from "@expo/vector-icons";
import { router } from "expo-router";
import React from "react";
import {
  Alert,
  Image,
  Linking,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Fonts } from "../../constants/Fonts";

export default function ProfileScreen() {
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
        onPress: () => {
          router.replace("/login"); // ganti dengan path login kamu
        },
      },
    ]);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={{ paddingBottom: 40 }}>
        {/* Judul */}
        <Text style={styles.headerTitle}>Profile</Text>

        {/* Foto Profil Bulat */}
        <View style={styles.avatarContainer}>
          <MaterialIcons name="person" size={40} color="#FF6600" />
        </View>

        {/* Nama & Email */}
        <Text style={styles.userName}>Havis Aprinaldi</Text>
        <Text style={styles.userEmail}>user@gmail.com</Text>

        {/* Statistik Akun */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionHeaderText}>STATISTIK AKUN</Text>
        </View>
        <View style={styles.statsRow}>
          <View style={styles.statBox}>
            <Text style={styles.statNumber}>40</Text>
            <Text style={styles.statLabel}>Total Laporan</Text>
          </View>
          <View style={styles.divider} />
          <View style={styles.statBox}>
            <Text style={styles.statNumber}>30</Text>
            <Text style={styles.statLabel}>Laporan selesai</Text>
          </View>
        </View>

        {/* Informasi Pengguna */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionHeaderText}>INFORMASI PENGGUNA</Text>
        </View>
        <View style={styles.infoContainer}>
          <Text style={styles.infoLabel}>Nomor Rekening</Text>
          <Text style={styles.infoValue}>512372891238</Text>

          <Text style={styles.infoLabel}>No Handphone</Text>
          <Text style={styles.infoValue}>082137987456</Text>

          <Text style={styles.infoLabel}>Alamat</Text>
          <Text style={styles.infoValue}>
            Jalan Melati Raya No. 12, Kel. Sukamaju, Kec. Setiabudi, Jakarta
            Selatan, DKI Jakarta 12930
          </Text>
        </View>

        {/* Media Sosial */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionHeaderText}>MEDIA SOSIAL</Text>
        </View>

        {/* Container tiap item */}
        <TouchableOpacity
          style={styles.socialRow}
          onPress={() =>
            handlePress("https://api.whatsapp.com/send?phone=6281237812391")
          }
        >
          <View style={styles.socialLeft}>
            <Text style={styles.socialTitle}>Whatsapp</Text>
            <View style={styles.socialIconSubtitleRow}>
              <Image
                source={require("../../assets/images/icon_whatsapp.png")}
                style={styles.socialIcon}
              />
              <Text style={styles.socialSubtitle}>081237812391</Text>
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

        {/* Tombol Keluar dengan MaterialIcons */}
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
    fontWeight: "bold",
    textAlign: "center",
    marginTop: 10,
    fontFamily: Fonts.regular,
  },

  avatarContainer: {
    alignSelf: "center",
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "#FFF4EC",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 20,
  },

  userName: {
    fontSize: 16,
    fontWeight: "bold",
    textAlign: "center",
    marginTop: 10,
    fontFamily: Fonts.regular,
  },

  userEmail: {
    fontSize: 12,
    color: "#555",
    textAlign: "center",
    marginBottom: 20,
    fontFamily: Fonts.regular,
  },

  sectionHeader: {
    backgroundColor: "#F3F3F3",
    paddingVertical: 6,
    paddingHorizontal: 16,
  },

  sectionHeaderText: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#999",
    fontFamily: Fonts.bold,
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
    fontSize: 20,
    fontWeight: "bold",
    fontFamily: Fonts.regular,
  },
  statLabel: {
    fontSize: 12,
    color: "#555",
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
    fontSize: 14,
    fontWeight: "bold",
    marginTop: 10,
    fontFamily: Fonts.bold,
  },

  infoValue: {
    fontSize: 14,
    color: "#333",
    marginTop: 2,
    fontFamily: Fonts.regular,
  },

  socialRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#EEE",
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
    fontWeight: "bold",
    marginBottom: 6,
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
    marginRight: 8,
  },
  socialSubtitle: {
    fontSize: 13,
    color: "#555",
    fontFamily: Fonts.regular,
  },

  logoutButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginHorizontal: 16,
    marginTop: 40,
    paddingVertical: 12,
    borderWidth: 1.5,
    borderColor: "#D32F2F",
    borderRadius: 8,
    gap: 8,
    backgroundColor: "rgba(211,47,47,0.1)",
  },

  logoutText: {
    fontSize: 14,
    fontWeight: "bold",
    color: "red",
    fontFamily: Fonts.semiBold,
  },
});
