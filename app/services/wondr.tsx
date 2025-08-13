import { Fonts } from '@/constants/Fonts';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import React, { useState } from 'react';
import {
  Image,
  Platform,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';

const wondrFeatures = [
  {
    id: '1',
    title: 'Bayar & Transfer',
    description: 'Bayar tagihan dan transfer uang dengan mudah',
    icon: 'credit-card-outline',
    color: '#6C5CE7',
    benefits: ['QRIS Payment', 'Transfer Bank', 'Bayar Tagihan'],
  },
  {
    id: '2',
    title: 'Investasi',
    description: 'Mulai investasi dari Rp 10.000',
    icon: 'trending-up',
    color: '#00B894',
    benefits: ['Reksadana', 'Emas Digital', 'SBN'],
  },
  {
    id: '3',
    title: 'Lifestyle',
    description: 'Belanja kebutuhan sehari-hari',
    icon: 'shopping-outline',
    color: '#E17055',
    benefits: ['E-commerce', 'Voucher Game', 'Pulsa & Data'],
  },
  {
    id: '4',
    title: 'Tabungan',
    description: 'Tabungan digital dengan bunga kompetitif',
    icon: 'wallet-outline',
    color: '#FDCB6E',
    benefits: ['Bunga Tinggi', 'Tanpa Biaya Admin', 'Bebas Transfer'],
  },
];

const wondrStats = [
  { label: 'Total Users', value: '2.5M+', icon: 'account-group' },
  { label: 'Transactions', value: '50M+', icon: 'swap-horizontal' },
  { label: 'Merchant Partners', value: '100K+', icon: 'store' },
  { label: 'Cities Available', value: '50+', icon: 'map-marker' },
];

const wondrNews = [
  {
    id: '1',
    title: 'Wondr Luncurkan Fitur Investment Terbaru',
    summary: 'Kini investasi emas digital dan SBN retail tersedia di Wondr',
    date: '15 Des 2024',
    image: 'https://picsum.photos/id/300/120/80',
  },
  {
    id: '2',
    title: 'Cashback 50% untuk Transaksi Pertama',
    summary: 'Dapatkan cashback hingga Rp 50.000 untuk pengguna baru',
    date: '10 Des 2024',
    image: 'https://picsum.photos/id/301/120/80',
  },
  {
    id: '3',
    title: 'Wondr Ekspansi ke 10 Kota Baru',
    summary: 'Layanan Wondr kini hadir di lebih banyak kota di Indonesia',
    date: '5 Des 2024',
    image: 'https://picsum.photos/id/302/120/80',
  },
];

interface WondrFeature {
  id: string;
  title: string;
  description: string;
  icon: string;
  color: string;
  benefits: string[];
}

interface WondrNews {
  id: string;
  title: string;
  summary: string;
  date: string;
  image: string;
}

export default function WondrScreen() {
  const [activeSection, setActiveSection] = useState('features');

  const renderFeature = ({ item }: { item: WondrFeature }) => (
    <TouchableOpacity style={styles.featureCard}>
      <View style={styles.featureHeader}>
        <View style={[styles.featureIcon, { backgroundColor: item.color }]}>
          <MaterialCommunityIcons name={item.icon as any} size={32} color="white" />
        </View>
        <View style={styles.featureInfo}>
          <Text style={styles.featureTitle}>{item.title}</Text>
          <Text style={styles.featureDescription}>{item.description}</Text>
        </View>
      </View>
      
      <View style={styles.benefitsContainer}>
        {item.benefits.map((benefit, index) => (
          <View key={index} style={styles.benefitItem}>
            <Ionicons name="checkmark-circle" size={16} color="#4CAF50" />
            <Text style={styles.benefitText}>{benefit}</Text>
          </View>
        ))}
      </View>
    </TouchableOpacity>
  );

  const renderStat = (stat: any, index: number) => (
    <View key={index} style={styles.statCard}>
      <MaterialCommunityIcons name={stat.icon} size={24} color="#E0EE59" />
      <Text style={styles.statValue}>{stat.value}</Text>
      <Text style={styles.statLabel}>{stat.label}</Text>
    </View>
  );

  const renderNews = ({ item }: { item: WondrNews }) => (
    <TouchableOpacity style={styles.newsCard}>
      <Image source={{ uri: item.image }} style={styles.newsImage} />
      <View style={styles.newsContent}>
        <Text style={styles.newsTitle}>{item.title}</Text>
        <Text style={styles.newsSummary}>{item.summary}</Text>
        <Text style={styles.newsDate}>{item.date}</Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <LinearGradient
        colors={['#E0EE59', '#F0F8FF']}
        locations={[0.3, 0.8]}
        style={StyleSheet.absoluteFill}
      />
      
      <View style={styles.headerSection}>
        <View style={styles.headerRow}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color="black" />
          </TouchableOpacity>
          <Text style={styles.header}>Wondr by BNI</Text>
        </View>
      </View>

      <ScrollView style={styles.container}>
        {/* Hero Section */}
        <View style={styles.heroSection}>
          <LinearGradient
            colors={['rgba(255, 102, 0, 0.8)', 'rgba(255, 133, 51, 0.6)']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.heroGradient}
          >
            <View style={styles.heroContent}>
              <Image 
                source={require('@/assets/images/logo_wondr.png')} 
                style={styles.wondrLogo}
                resizeMode="contain"
              />
              <Text style={styles.heroSlogan}>Jadiin Maumu</Text>
              <Text style={styles.heroSubtext}>Super app untuk semua kebutuhan finansial dan lifestyle</Text>
              <TouchableOpacity style={styles.ctaButton}>
                <Text style={styles.ctaButtonText}>Download Sekarang</Text>
                <Ionicons name="download-outline" size={16} color="#FF6600" />
              </TouchableOpacity>
            </View>
          </LinearGradient>
        </View>

        {/* Stats Section */}
        <View style={styles.statsSection}>
          <Text style={styles.sectionTitle}>Wondr dalam Angka</Text>
          <View style={styles.statsGrid}>
            {wondrStats.map((stat, index) => renderStat(stat, index))}
          </View>
        </View>

        {/* Features Section */}
        <View style={styles.featuresSection}>
          <Text style={styles.sectionTitle}>Fitur Unggulan</Text>
          <View style={styles.featuresGrid}>
            {wondrFeatures.map((feature, index) => (
              <TouchableOpacity key={feature.id} style={styles.featureCard}>
                <View style={[styles.featureIconContainer, { backgroundColor: feature.color }]}>
                  <Ionicons name={feature.icon as any} size={24} color="white" />
                </View>
                <Text style={styles.featureTitle}>{feature.title}</Text>
                <Text style={styles.featureDescription}>{feature.description}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Benefits Section */}
        <View style={styles.benefitsSection}>
          <Text style={styles.sectionTitle}>Kenapa Pilih Wondr?</Text>
          <View style={styles.benefitsList}>
            <View style={styles.benefitItem}>
              <View style={styles.benefitIcon}>
                <Ionicons name="shield-checkmark" size={20} color="#00B894" />
              </View>
              <Text style={styles.benefitText}>Aman & Terpercaya</Text>
            </View>
            <View style={styles.benefitItem}>
              <View style={styles.benefitIcon}>
                <Ionicons name="flash" size={20} color="#FDCB6E" />
              </View>
              <Text style={styles.benefitText}>Transaksi Cepat</Text>
            </View>
            <View style={styles.benefitItem}>
              <View style={styles.benefitIcon}>
                <Ionicons name="gift" size={20} color="#E17055" />
              </View>
              <Text style={styles.benefitText}>Cashback & Reward</Text>
            </View>
            <View style={styles.benefitItem}>
              <View style={styles.benefitIcon}>
                <Ionicons name="people" size={20} color="#FF6600" />
              </View>
              <Text style={styles.benefitText}>Customer Service 24/7</Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  headerSection: {
    paddingHorizontal: 24,
    paddingTop: 20,
    paddingBottom: 10,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  backButton: {
    marginRight: 16,
    padding: 4,
  },
  container: {
    flex: 1,
    paddingHorizontal: 16,
  },
  header: {
    fontSize: 24,
    fontFamily: Fonts.bold,
    color: 'black',
    flex: 1,
  },
  heroSection: {
    borderRadius: 20,
    marginBottom: 16,
    overflow: 'hidden',
    ...Platform.select({
      ios: {
        shadowColor: '#FF6600',
        shadowOpacity: 0.1,
        shadowOffset: { width: 0, height: 4 },
        shadowRadius: 12,
      },
      android: {
        elevation: 8,
      },
    }),
  },
  heroGradient: {
    padding: 24,
    alignItems: 'center',
  },
  heroContent: {
    alignItems: 'center',
  },
  wondrLogo: {
    width: 80,
    height: 80,
    marginBottom: 16,
    borderRadius: 40,
    backgroundColor: 'rgba(255,255,255,0.2)',
  },
  heroSlogan: {
    fontSize: 28,
    fontFamily: Fonts.bold,
    color: 'white',
    textAlign: 'center',
    marginBottom: 8,
  },
  heroSubtext: {
    fontSize: 14,
    fontFamily: Fonts.medium,
    color: 'rgba(255,255,255,0.9)',
    textAlign: 'center',
    marginBottom: 20,
  },
  ctaButton: {
    backgroundColor: 'white',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 25,
    gap: 8,
  },
  ctaButtonText: {
    fontSize: 14,
    fontFamily: Fonts.semiBold,
    color: '#FF6600',
  },
  statsSection: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontFamily: Fonts.semiBold,
    color: 'black',
    marginBottom: 16,
    textAlign: 'center',
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  statCard: {
    width: '48%',
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginBottom: 8,
  },
  statValue: {
    fontSize: 18,
    fontFamily: Fonts.bold,
    color: 'black',
    marginTop: 8,
  },
  statLabel: {
    fontSize: 12,
    fontFamily: Fonts.medium,
    color: '#666',
    textAlign: 'center',
    marginTop: 4,
  },
  featuresSection: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
  },
  featuresGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  benefitsSection: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
  },
  benefitsList: {
    gap: 16,
  },
  benefitItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  benefitIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f8f9fa',
    justifyContent: 'center',
    alignItems: 'center',
  },
  benefitText: {
    fontSize: 14,
    fontFamily: Fonts.medium,
    color: '#333',
  },
  featureCard: {
    width: '48%',
    backgroundColor: '#f8f9fa',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    alignItems: 'center',
  },
  featureIconContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  featureTitle: {
    fontSize: 14,
    fontFamily: Fonts.semiBold,
    color: '#333',
    textAlign: 'center',
    marginBottom: 4,
  },
  featureDescription: {
    fontSize: 11,
    fontFamily: Fonts.medium,
    color: '#666',
    textAlign: 'center',
    lineHeight: 14,
  },

  newsCard: {
    flexDirection: 'row',
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
  },
  newsImage: {
    width: 80,
    height: 60,
    borderRadius: 8,
    marginRight: 12,
  },
  newsContent: {
    flex: 1,
  },
  newsTitle: {
    fontSize: 14,
    fontFamily: Fonts.semiBold,
    color: 'black',
    marginBottom: 4,
  },
  newsSummary: {
    fontSize: 11,
    fontFamily: Fonts.medium,
    color: '#666',
    lineHeight: 14,
    marginBottom: 6,
  },
  newsDate: {
    fontSize: 10,
    fontFamily: Fonts.medium,
    color: '#999',
  },
  featureHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  featureIcon: {
    width: 60,
    height: 60,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  featureInfo: {
    flex: 1,
  },
  benefitsContainer: {
    gap: 8,
  },
});