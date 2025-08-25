import { Fonts } from '@/constants/Fonts';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import React from 'react';
import {
  FlatList,
  Image,
  Linking,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const wondrServices = [
  {
    id: '1',
    title: 'Transfer & Payment',
    subtitle: 'Kirim uang & bayar tagihan',
    description: 'Transfer ke sesama WONDR gratis, ke bank lain mulai Rp 2.500',
    icon: 'send',
    gradient: ['#FF6B6B', '#FF8E53'],
    features: ['Transfer Gratis', 'QRIS Payment', 'Bayar Tagihan']
  },
  {
    id: '2',
    title: 'Investment',
    subtitle: 'Investasi mudah & aman',
    description: 'Mulai investasi reksadana dari Rp 10.000 dengan return optimal',
    icon: 'trending-up',
    gradient: ['#4ECDC4', '#44A08D'],
    features: ['Reksadana', 'Emas Digital', 'SBN Retail']
  },
  {
    id: '3',
    title: 'Lifestyle',
    subtitle: 'Belanja & hiburan',
    description: 'Beli pulsa, token listrik, voucher game, dan kebutuhan lainnya',
    icon: 'storefront',
    gradient: ['#A8E6CF', '#7FCDCD'],
    features: ['Pulsa & Data', 'Token PLN', 'Voucher Game']
  },
  {
    id: '4',
    title: 'Savings',
    subtitle: 'Tabungan digital',
    description: 'Tabungan dengan bunga hingga 6% p.a tanpa biaya admin bulanan',
    icon: 'wallet',
    gradient: ['#FFD93D', '#FF6B6B'],
    features: ['Bunga 6% p.a', 'Tanpa Admin', 'Bebas Tarik']
  }
];

const wondrBenefits = [
  {
    icon: 'shield-checkmark',
    title: 'Aman & Terpercaya',
    description: 'Diawasi OJK & dijamin LPS',
    color: '#4CAF50'
  },
  {
    icon: 'flash',
    title: 'Transaksi Instan',
    description: 'Proses dalam hitungan detik',
    color: '#FF9800'
  },
  {
    icon: 'gift',
    title: 'Cashback & Reward',
    description: 'Dapatkan cashback setiap transaksi',
    color: '#E91E63'
  },
  {
    icon: 'people',
    title: 'Customer Support',
    description: 'Bantuan 24/7 melalui chat',
    color: '#2196F3'
  }
];

const wondrPromos = [
  {
    id: '1',
    title: 'Cashback 100%',
    subtitle: 'Transfer Pertama Gratis',
    description: 'Dapatkan cashback 100% untuk transfer pertama hingga Rp 25.000',
    validUntil: '31 Des 2024',
    image: require('../../assets/images/promo-bni.png')
  },
  {
    id: '2', 
    title: 'Investasi Mulai 10rb',
    subtitle: 'Bonus Saldo Rp 50.000',
    description: 'Mulai investasi pertama dan dapatkan bonus saldo untuk transaksi',
    validUntil: '15 Jan 2025',
    image: require('../../assets/images/promo-bni2.png')
  }
];

interface WondrService {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  icon: string;
  gradient: string[];
  features: string[];
}

interface WondrPromo {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  validUntil: string;
  image: any;
}

export default function WondrScreen() {
  const handleDownload = () => {
    Linking.openURL('https://wondr.bni.co.id');
  };

  const renderService = (service: WondrService, index: number) => (
    <TouchableOpacity key={service.id} style={styles.serviceCard}>
      <LinearGradient
        colors={service.gradient as [string, string]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.serviceGradient}
      >
        <View style={styles.serviceHeader}>
          <View style={styles.serviceIconContainer}>
            <Ionicons name={service.icon as any} size={28} color="white" />
          </View>
          <View style={styles.serviceInfo}>
            <Text style={styles.serviceTitle}>{service.title}</Text>
            <Text style={styles.serviceSubtitle}>{service.subtitle}</Text>
          </View>
        </View>
        <Text style={styles.serviceDescription}>{service.description}</Text>
        <View style={styles.serviceFeatures}>
          {service.features.map((feature, idx) => (
            <View key={idx} style={styles.featureTag}>
              <Text style={styles.featureTagText}>{feature}</Text>
            </View>
          ))}
        </View>
      </LinearGradient>
    </TouchableOpacity>
  );

  const renderBenefit = (benefit: any, index: number) => (
    <View key={index} style={styles.benefitCard}>
      <View style={[styles.benefitIconContainer, { backgroundColor: benefit.color }]}>
        <Ionicons name={benefit.icon} size={24} color="white" />
      </View>
      <View style={styles.benefitContent}>
        <Text style={styles.benefitTitle}>{benefit.title}</Text>
        <Text style={styles.benefitDescription}>{benefit.description}</Text>
      </View>
    </View>
  );

  const renderPromo = (promo: WondrPromo, index: number) => (
    <TouchableOpacity key={promo.id} style={styles.promoCard}>
      <Image source={promo.image} style={styles.promoImage} />
      <View style={styles.promoContent}>
        <View style={styles.promoHeader}>
          <Text style={styles.promoTitle}>{promo.title}</Text>
          <Text style={styles.promoSubtitle}>{promo.subtitle}</Text>
        </View>
        <Text style={styles.promoDescription}>{promo.description}</Text>
        <View style={styles.promoFooter}>
          <Text style={styles.promoValid}>Berlaku hingga {promo.validUntil}</Text>
          <TouchableOpacity style={styles.promoButton}>
            <Text style={styles.promoButtonText}>Ambil Promo</Text>
          </TouchableOpacity>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <LinearGradient
        colors={['#DEEF5A', '#FCFDEE']}
        locations={[0.23, 0.37]}
        style={StyleSheet.absoluteFill}
      />
      
      <View style={styles.headerSection}>
        <View style={styles.headerRow}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color="black" />
          </TouchableOpacity>
          <Text style={styles.header}>WONDR</Text>
        </View>
      </View>

      <FlatList
        style={styles.container}
        showsVerticalScrollIndicator={false}
        data={[1]}
        renderItem={() => (
          <View>
            {/* Hero Section */}
            <View style={styles.heroSection}>
              <View style={styles.heroContent}>
                <View style={styles.wondrLogoContainer}>
                  <Image 
                    source={require('../../assets/images/logo_wondr.png')} 
                    style={styles.wondrLogo}
                    resizeMode="contain"
                  />
                </View>
                <Text style={styles.heroTitle}>WONDR by BNI</Text>
                <Text style={styles.heroSlogan}>Jadiin Maumu Jadi Nyata</Text>
                <Text style={styles.heroDescription}>
                  Super app yang memudahkan semua kebutuhan finansial dan lifestyle kamu dalam satu aplikasi
                </Text>
                <TouchableOpacity style={styles.downloadButton} onPress={handleDownload}>
                  <Ionicons name="download" size={20} color="#FF6600" />
                  <Text style={styles.downloadButtonText}>Download WONDR</Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Promo Section */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Promo Spesial</Text>
              <View style={styles.promoContainer}>
                {wondrPromos.map((promo, index) => renderPromo(promo, index))}
              </View>
            </View>

            {/* Services Section */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Layanan Unggulan</Text>
              <View style={styles.servicesContainer}>
                {wondrServices.map((service, index) => renderService(service, index))}
              </View>
            </View>

            {/* Benefits Section */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Kenapa Pilih WONDR?</Text>
              <View style={styles.benefitsContainer}>
                {wondrBenefits.map((benefit, index) => renderBenefit(benefit, index))}
              </View>
            </View>

            {/* CTA Section */}
            <View style={styles.ctaSection}>
              <LinearGradient
                colors={['#FF6B6B', '#FF8E53']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.ctaGradient}
              >
                <Text style={styles.ctaTitle}>Siap Mulai dengan WONDR?</Text>
                <Text style={styles.ctaDescription}>
                  Download sekarang dan rasakan kemudahan bertransaksi di ujung jari
                </Text>
                <TouchableOpacity style={styles.ctaButton} onPress={handleDownload}>
                  <Text style={styles.ctaButtonText}>Download Gratis</Text>
                  <Ionicons name="arrow-forward" size={16} color="#FF6B6B" />
                </TouchableOpacity>
              </LinearGradient>
            </View>
          </View>
        )}
        keyExtractor={() => 'wondr'}
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
    backgroundColor: 'rgba(255,255,255,0.95)',
    borderRadius: 24,
    marginBottom: 24,
    overflow: 'hidden',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOpacity: 0.1,
        shadowOffset: { width: 0, height: 8 },
        shadowRadius: 16,
      },
      android: {
        elevation: 8,
      },
    }),
  },
  heroContent: {
    padding: 32,
    alignItems: 'center',
  },
  wondrLogoContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'white',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  wondrLogo: {
    width: 90,
    height: 90,
    borderRadius: 45,
  },
  heroTitle: {
    fontSize: 28,
    fontFamily: Fonts.bold,
    color: '#2c3e50',
    marginBottom: 8,
  },
  heroSlogan: {
    fontSize: 18,
    fontFamily: Fonts.semiBold,
    color: '#FF6600',
    marginBottom: 16,
  },
  heroDescription: {
    fontSize: 14,
    fontFamily: Fonts.medium,
    color: '#7f8c8d',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 24,
  },
  downloadButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 25,
    borderWidth: 2,
    borderColor: '#FF6600',
    gap: 8,
  },
  downloadButtonText: {
    fontSize: 16,
    fontFamily: Fonts.semiBold,
    color: '#FF6600',
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontFamily: Fonts.bold,
    color: 'black',
    marginBottom: 16,
    textAlign: 'center',
  },
  promoCard: {
    backgroundColor: 'white',
    borderRadius: 16,
    marginRight: 16,
    width: 300,
    overflow: 'hidden',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOpacity: 0.1,
        shadowOffset: { width: 0, height: 4 },
        shadowRadius: 8,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  promoImage: {
    width: '100%',
    height: 120,
    resizeMode: 'cover',
  },
  promoContent: {
    padding: 16,
  },
  promoHeader: {
    marginBottom: 8,
  },
  promoTitle: {
    fontSize: 16,
    fontFamily: Fonts.bold,
    color: '#2c3e50',
  },
  promoSubtitle: {
    fontSize: 12,
    fontFamily: Fonts.medium,
    color: '#FF6600',
  },
  promoDescription: {
    fontSize: 12,
    fontFamily: Fonts.medium,
    color: '#7f8c8d',
    lineHeight: 16,
    marginBottom: 12,
  },
  promoFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  promoValid: {
    fontSize: 10,
    fontFamily: Fonts.medium,
    color: '#95a5a6',
  },
  promoButton: {
    backgroundColor: '#FF6600',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  promoButtonText: {
    fontSize: 10,
    fontFamily: Fonts.semiBold,
    color: 'white',
  },
  servicesContainer: {
    gap: 16,
  },
  serviceCard: {
    borderRadius: 16,
    overflow: 'hidden',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOpacity: 0.1,
        shadowOffset: { width: 0, height: 4 },
        shadowRadius: 8,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  serviceGradient: {
    padding: 20,
  },
  serviceHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  serviceIconContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  serviceInfo: {
    flex: 1,
  },
  serviceTitle: {
    fontSize: 18,
    fontFamily: Fonts.bold,
    color: 'white',
  },
  serviceSubtitle: {
    fontSize: 12,
    fontFamily: Fonts.medium,
    color: 'rgba(255,255,255,0.8)',
  },
  serviceDescription: {
    fontSize: 14,
    fontFamily: Fonts.medium,
    color: 'rgba(255,255,255,0.9)',
    lineHeight: 18,
    marginBottom: 16,
  },
  serviceFeatures: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  featureTag: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  featureTagText: {
    fontSize: 10,
    fontFamily: Fonts.medium,
    color: 'white',
  },
  benefitsContainer: {
    gap: 12,
  },
  benefitCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.8)',
    padding: 16,
    borderRadius: 12,
    gap: 16,
  },
  benefitIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  benefitContent: {
    flex: 1,
  },
  benefitTitle: {
    fontSize: 14,
    fontFamily: Fonts.semiBold,
    color: 'black',
    marginBottom: 4,
  },
  benefitDescription: {
    fontSize: 12,
    fontFamily: Fonts.medium,
    color: '#666',
  },
  ctaSection: {
    borderRadius: 20,
    overflow: 'hidden',
    marginBottom: 24,
  },
  ctaGradient: {
    padding: 24,
    alignItems: 'center',
  },
  ctaTitle: {
    fontSize: 20,
    fontFamily: Fonts.bold,
    color: 'white',
    textAlign: 'center',
    marginBottom: 8,
  },
  ctaDescription: {
    fontSize: 14,
    fontFamily: Fonts.medium,
    color: 'rgba(255,255,255,0.9)',
    textAlign: 'center',
    marginBottom: 20,
  },
  ctaButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 25,
    gap: 8,
  },
  ctaButtonText: {
    fontSize: 16,
    fontFamily: Fonts.semiBold,
    color: '#FF6B6B',
  },
  promoContainer: {
    flexDirection: 'row',
    gap: 16,
  },
});