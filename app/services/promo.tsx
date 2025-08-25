import { Fonts } from "@/constants/Fonts";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import React from "react";
import {
  FlatList,
  Image,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const promoData = {
  featured: [
    {
      id: "1",
      title: "Cashback 50% Belanja Online",
      description:
        "Dapatkan cashback hingga Rp 100.000 untuk transaksi e-commerce",
      image: require ('../../assets/images/promo-bni.png'),
      validUntil: "31 Des 2024",
      category: "E-Commerce",
    },
  ],
  lifestyle: [
    {
      id: "3",
      title: "Diskon 25% Restoran Partner",
      description: "Nikmati diskon di 500+ restoran favorit Anda",
      image: require ('../../assets/images/promo-bni2.png'),
      validUntil: "28 Feb 2025",
      category: "F&B",
    },
    {
      id: "4",
      title: "Cashback 20% Transportasi",
      description: "Hemat perjalanan dengan cashback ojek online dan taksi",
      image: require ('../../assets/images/promo-bni2.png'),
      validUntil: "31 Mar 2025",
      category: "Transport",
    },
    {
      id: "5",
      title: "Diskon Hotel hingga 40%",
      description: "Liburan lebih hemat dengan promo hotel eksklusif",
      image: require ('../../assets/images/promo-bni2.png'),
      validUntil: "30 Apr 2025",
      category: "Travel",
    },
  ],
};

interface PromoItem {
  id: string;
  title: string;
  description: string;
  image: string | any;
  validUntil: string;
  category: string;
}

export default function PromoScreen() {
  const renderFeaturedPromo = ({ item }: { item: PromoItem }) => (
    <TouchableOpacity style={styles.featuredCard}>
      <Image source={typeof item.image === 'string' ? { uri: item.image } : item.image} style={styles.featuredImage} />
      <View style={styles.featuredContent}>
        <View style={styles.categoryBadge}>
          <Text style={styles.categoryText}>{item.category}</Text>
        </View>
        <Text style={styles.featuredTitle}>{item.title}</Text>
        <Text style={styles.featuredDesc}>{item.description}</Text>
        <View style={styles.validUntilContainer}>
          <Ionicons name="time-outline" size={14} color="#666" />
          <Text style={styles.validUntilText}>
            Berlaku hingga {item.validUntil}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  const renderLifestylePromo = ({ item }: { item: PromoItem }) => (
    <TouchableOpacity style={styles.lifestyleCard}>
      <Image source={typeof item.image === 'string' ? { uri: item.image } : item.image} style={styles.lifestyleImage} />
      <View style={styles.lifestyleContent}>
        <View style={styles.categoryBadge}>
          <Text style={styles.categoryText}>{item.category}</Text>
        </View>
        <Text style={styles.lifestyleTitle}>{item.title}</Text>
        <Text style={styles.lifestyleDesc}>{item.description}</Text>
        <Text style={styles.validUntilText}>Hingga {item.validUntil}</Text>
      </View>
    </TouchableOpacity>
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
          <Text style={styles.header}>Promo BNI</Text>
        </View>
      </View>

      <FlatList
        style={styles.container}
        data={promoData.lifestyle}
        keyExtractor={(item) => String(item.id)}
        showsVerticalScrollIndicator={false}
        numColumns={1}
        ListHeaderComponent={
          <View style={styles.section}>
            <Text style={styles.subHeader}>Promo Unggulan</Text>
            <FlatList
              data={promoData.featured}
              renderItem={renderFeaturedPromo}
              keyExtractor={(item) => String(item.id)}
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.horizontalList}
            />
            <View style={{ height: 20 }}>
              <Text style={styles.subHeader}>Lifestyle & Entertainment</Text>
            </View>
          </View>
        }
        renderItem={renderLifestylePromo}
      />
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
    paddingHorizontal: 16,
  },
  section: {
    backgroundColor: "white",
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
  },
  header: {
    fontSize: 24,
    fontFamily: Fonts.bold,
    color: "black",
    flex: 1,
  },
  subHeader: {
    fontSize: 16,
    fontFamily: Fonts.semiBold,
    color: "black",
    marginBottom: 16,
  },
  horizontalList: {
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
  },
  featuredCard: {
    backgroundColor: "white",
    borderRadius: 12,
    width: 280,
    overflow: "hidden",
    alignSelf: 'center',
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOpacity: 0.1,
        shadowOffset: { width: 0, height: 2 },
        shadowRadius: 4,
      },
      android: {
        elevation: 3,
      },
    }),
  },
  featuredImage: {
    width: "100%",
    height: 160,
    resizeMode: "cover",
  },
  featuredContent: {
    padding: 16,
  },
  categoryBadge: {
    backgroundColor: "#FF6600",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: "flex-start",
    marginBottom: 8,
  },
  categoryText: {
    fontSize: 10,
    fontFamily: Fonts.medium,
    color: "white",
  },
  featuredTitle: {
    fontSize: 16,
    fontFamily: Fonts.semiBold,
    color: "black",
    marginBottom: 6,
  },
  featuredDesc: {
    fontSize: 12,
    fontFamily: Fonts.medium,
    color: "#666",
    lineHeight: 16,
    marginBottom: 12,
  },
  validUntilContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  validUntilText: {
    fontSize: 11,
    fontFamily: Fonts.medium,
    color: "#666",
    marginLeft: 4,
  },
  lifestyleCard: {
    backgroundColor: "#f8f9fa",
    borderRadius: 12,
    marginBottom: 12,
    overflow: "hidden",
    flexDirection: "row",
  },
  lifestyleImage: {
    width: 100,
    height: 100,
    resizeMode: "cover",
  },
  lifestyleContent: {
    flex: 1,
    padding: 12,
  },
  lifestyleTitle: {
    fontSize: 14,
    fontFamily: Fonts.semiBold,
    color: "black",
    marginBottom: 4,
  },
  lifestyleDesc: {
    fontSize: 11,
    fontFamily: Fonts.medium,
    color: "#666",
    lineHeight: 14,
    marginBottom: 8,
  },
});
