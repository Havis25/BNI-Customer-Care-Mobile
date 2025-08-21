import { Fonts } from '@/constants/Fonts';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import React from 'react';
import {
  Alert,
  FlatList,
  Linking,
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';

const eBankingServices = [
  {
    id: '1',
    name: 'BNIdirect',
    description: 'Layanan internet banking untuk nasabah korporat dan komersial',
    icon: 'laptop',
    color: '#FF6600',
    url: 'https://www.bni.co.id/id-id/korporasi/cash-management/bnidirect',
    features: ['Cash Management', 'Trade Finance', 'Payroll', 'Treasury'],
  },
  {
    id: '2',
    name: 'wondr by BNI',
    description: 'Super app yang memudahkan segala kebutuhan finansial Anda',
    icon: 'cellphone',
    color: '#4CAF50',
    url: 'https://www.bni.co.id/id-id/personal/layanandigital/bnimobilebanking',
    features: ['Transfer', 'Investasi', 'Lifestyle', 'Cashback'],
  },
  {
    id: '3',
    name: 'BNI DigiCS & DigiCS LITE',
    description: 'Layanan customer service digital untuk kemudahan nasabah',
    icon: 'headset',
    color: '#2196F3',
    url: 'https://www.bni.co.id/id-id/personal/layanandigital/digics',
    features: ['Chat Bot', 'Video Call', 'Digital Assistant', '24/7 Support'],
  },
  {
    id: '4',
    name: 'BNI DPLK SURE',
    description: 'Dana Pensiun Lembaga Keuangan untuk masa depan yang terjamin',
    icon: 'shield-account',
    color: '#9C27B0',
    url: 'https://www.bni.co.id/id-id/personal/investasi/dplk',
    features: ['Dana Pensiun', 'Investasi', 'Proteksi', 'Tax Benefit'],
  },
  {
    id: '5',
    name: 'BNI MERCHANT (EDC DAN QRIS)',
    description: 'Solusi pembayaran digital untuk merchant dengan EDC dan QRIS',
    icon: 'credit-card-multiple',
    color: '#FF5722',
    url: 'https://www.bni.co.id/id-id/korporasi/merchant-services',
    features: ['EDC Terminal', 'QRIS Payment', 'Settlement', 'Reporting'],
  },
  {
    id: '6',
    name: 'TapcashGO',
    description: 'Aplikasi mobile untuk mengelola kartu Tapcash BNI',
    icon: 'contactless-payment',
    color: '#607D8B',
    url: 'https://www.bni.co.id/id-id/personal/kartu/tapcash',
    features: ['Top Up', 'Cek Saldo', 'Riwayat Transaksi', 'Merchant Finder'],
  },
];

interface EBankingService {
  id: string;
  name: string;
  description: string;
  icon: string;
  color: string;
  url: string;
  features: string[];
}

export default function DigitalScreen() {
  const [expandedCards, setExpandedCards] = React.useState<string[]>([]);

  const handlePress = async (url: string) => {
    try {
      const supported = await Linking.canOpenURL(url);
      if (supported) {
        await Linking.openURL(url);
      } else {
        Alert.alert('Error', 'Tidak dapat membuka link');
      }
    } catch (error) {
      Alert.alert('Error', 'Terjadi kesalahan saat membuka link');
    }
  };

  const toggleExpand = (id: string) => {
    setExpandedCards(prev => 
      prev.includes(id) 
        ? prev.filter(cardId => cardId !== id)
        : [...prev, id]
    );
  };

  const renderService = ({ item }: { item: EBankingService }) => {
    const isExpanded = expandedCards.includes(item.id);
    const visibleFeatures = isExpanded ? item.features : item.features.slice(0, 3);
    
    return (
      <View style={[styles.serviceCard, { borderLeftColor: item.color }]}>
        <View style={styles.cardContent}>
          <View style={styles.cardTop}>
            <View style={styles.serviceHeader}>
              <View style={[styles.iconContainer, { backgroundColor: item.color }]}>
                <MaterialCommunityIcons name={item.icon as any} size={20} color="white" />
              </View>
              <Text style={styles.serviceName}>{item.name}</Text>
            </View>
            <TouchableOpacity 
              style={styles.arrowButton}
              onPress={() => handlePress(item.url)}
            >
              <Ionicons name="arrow-forward" size={18} color={item.color} />
            </TouchableOpacity>
          </View>
          
          <Text style={styles.serviceDescription}>{item.description}</Text>
        </View>
        
        <View style={styles.featuresSection}>
          <View style={styles.featuresContainer}>
            {visibleFeatures.map((feature, index) => (
              <View key={index} style={[styles.featureBadge, { backgroundColor: `${item.color}15` }]}>
                <Text style={[styles.featureText, { color: item.color }]}>{feature}</Text>
              </View>
            ))}
            {item.features.length > 3 && (
              <TouchableOpacity 
                style={[styles.moreFeatures, { backgroundColor: isExpanded ? `${item.color}15` : '#f0f0f0' }]}
                onPress={() => toggleExpand(item.id)}
              >
                <Text style={[styles.moreText, { color: isExpanded ? item.color : '#666' }]}>
                  {isExpanded ? 'Tutup' : `+${item.features.length - 3}`}
                </Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      </View>
    );
  };

  const renderHeader = () => (
    <View style={styles.headerContent}>
      <View style={styles.heroSection}>
        <Text style={styles.heroSubtitle}>
          Akses mudah layanan perbankan BNI kapan saja, dimana saja dengan teknologi terdepan dan keamanan terjamin
        </Text>
        <View style={styles.heroFeatures}>
          <View style={styles.heroFeature}>
            <MaterialCommunityIcons name="clock-outline" size={16} color="#4CAF50" />
            <Text style={styles.heroFeatureText}>24/7 Tersedia</Text>
          </View>
          <View style={styles.heroFeature}>
            <MaterialCommunityIcons name="shield-check" size={16} color="#4CAF50" />
            <Text style={styles.heroFeatureText}>Aman Terjamin</Text>
          </View>
        </View>
      </View>
    </View>
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
          <Text style={styles.header}>Layanan Digital</Text>
        </View>
      </View>

      <FlatList
        data={eBankingServices}
        renderItem={renderService}
        keyExtractor={(item) => item.id}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={renderHeader}
        contentContainerStyle={styles.container}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  headerSection: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 8,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  backButton: {
    marginRight: 16,
    padding: 4,
  },
  header: {
    fontSize: 24,
    fontFamily: Fonts.bold,
    color: 'black',
    flex: 1,
  },
  container: {
    paddingHorizontal: 16,
    paddingBottom: 20,
  },
  headerContent: {
    backgroundColor: 'white',
    borderRadius: 20,
    marginBottom: 16,
    overflow: 'hidden',
  },
  heroSection: {
    padding: 24,
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
  },
  heroSubtitle: {
    fontSize: 14,
    fontFamily: Fonts.regular,
    color: '#666',
    lineHeight: 20,
    textAlign: 'center',
    marginBottom: 20,
  },
  heroFeatures: {
    flexDirection: 'row',
    gap: 24,
  },
  heroFeature: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  heroFeatureText: {
    fontSize: 12,
    fontFamily: Fonts.medium,
    color: '#4CAF50',
  },
  serviceCard: {
    backgroundColor: 'white',
    borderRadius: 16,
    marginBottom: 12,
    borderLeftWidth: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },
  cardContent: {
    padding: 16,
  },
  cardTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  serviceHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  iconContainer: {
    width: 32,
    height: 32,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  serviceName: {
    fontSize: 15,
    fontFamily: Fonts.semiBold,
    color: '#1a1a1a',
    flex: 1,
  },
  serviceDescription: {
    fontSize: 12,
    fontFamily: Fonts.regular,
    color: '#666',
    lineHeight: 16,
    marginBottom: 0,
  },
  featuresSection: {
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  featuresContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  featureBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  featureText: {
    fontSize: 11,
    fontFamily: Fonts.medium,
  },
  moreFeatures: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  moreText: {
    fontSize: 11,
    fontFamily: Fonts.medium,
  },
  arrowButton: {
    padding: 8,
    borderRadius: 8,
  },
});
