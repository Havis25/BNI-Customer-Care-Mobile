import { Fonts } from '@/constants/Fonts';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import React, { useState } from 'react';
import {
  Alert,
  Dimensions,
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

const { width: screenWidth } = Dimensions.get('window');
const cardWidth = screenWidth * 0.75;
const scaleFactor = screenWidth / 375;

const produkData = {
  individual: [
    {
      id: '1',
      nama: 'BNI Taplus',
      deskripsi: 'Tabungan untuk kebutuhan sehari-hari.',
      gambar: require('../../assets/images/bni-taplus.jpg'),
    },
    {
      id: '2',
      nama: 'BNI Fleksi',
      deskripsi: 'Kredit tanpa agunan khusus pegawai bergaji.',
      gambar: require('../../assets/images/bni-fleksi.jpg'),
    },
    {
      id: '3',
      nama: 'BNI Griya',
      deskripsi: 'Kredit kepemilikan rumah dengan bunga kompetitif.',
      gambar: require('../../assets/images/bni-griya.jpg'),
    },
  ],
  korporasi: [
    {
      id: '4',
      nama: 'BNI Giro',
      deskripsi: 'Layanan rekening giro untuk transaksi bisnis.',
      gambar: require('../../assets/images/bni-giro.jpg'),
    },
    {
      id: '5',
      nama: 'BNI Cash Management',
      deskripsi: 'Solusi pengelolaan keuangan perusahaan.',
      gambar: require('../../assets/images/bni-giro.jpg'),
    },
    {
      id: '6',
      nama: 'BNI Trade Finance',
      deskripsi: 'Layanan perdagangan internasional.',
      gambar: require('../../assets/images/bni-giro.jpg'),
    },
  ],
  umkm: [
    {
      id: '7',
      nama: 'BNI Xpora',
      deskripsi: 'Layanan untuk UMKM mengembangkan bisnis ke pasar...',
      deskripsiLengkap: 'Layanan untuk UMKM mengembangkan bisnis ke pasar internasional dengan dukungan ekspor impor',
      gambar: require('../../assets/images/bni-xpora.png'),
    },
  ],
};

interface ProdukItem {
  id: string;
  nama: string;
  deskripsi: string;
  deskripsiLengkap?: string;
  gambar: any;
}

export default function ProdukScreen() {
  const [scrollPositions, setScrollPositions] = useState({
    individual: 0,
    korporasi: 0,
    umkm: 0,
  });
  const [expandedItems, setExpandedItems] = useState<string[]>([]);

  const handleScroll = (event: any, section: string) => {
    const { contentOffset, contentSize, layoutMeasurement } = event.nativeEvent;
    const scrollPercentage = contentOffset.x / (contentSize.width - layoutMeasurement.width);
    setScrollPositions(prev => ({ ...prev, [section]: Math.max(0, Math.min(1, scrollPercentage)) }));
  };

  const renderScrollIndicator = (section: string) => {
    const position = scrollPositions[section as keyof typeof scrollPositions] || 0;
    return (
      <View style={styles.scrollIndicatorContainer}>
        <View style={styles.scrollIndicatorTrack}>
          <View style={[styles.scrollIndicatorThumb, { left: `${position * 70}%` }]} />
        </View>
      </View>
    );
  };

  const toggleExpanded = (itemId: string) => {
    setExpandedItems(prev => 
      prev.includes(itemId) 
        ? prev.filter(id => id !== itemId)
        : [...prev, itemId]
    );
  };

  const handleLearnMore = async () => {
    try {
      const url = 'https://www.bni.co.id/id-id/individu';
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

  const renderProduk = ({ item }: { item: ProdukItem }) => {
    const isExpanded = expandedItems.includes(item.id);
    const hasExpandableText = item.deskripsi.includes('...');
    const displayText = isExpanded && item.deskripsiLengkap ? item.deskripsiLengkap : item.deskripsi;
    
    return (
      <TouchableOpacity style={styles.card} activeOpacity={0.9}>
        <Image source={item.gambar} style={styles.cardImage} />
        <LinearGradient
          colors={['rgba(0,0,0,0)', 'rgba(0,0,0,0.6)']}
          style={styles.cardOverlay}
        />
        <View style={styles.cardContent}>
          <View style={styles.cardBadge}>
            <MaterialCommunityIcons name="star" size={12} color="#FF6600" />
            <Text style={styles.cardBadgeText}>Populer</Text>
          </View>
          <View style={styles.cardText}>
            <Text style={styles.cardTitle}>{item.nama}</Text>
            <TouchableOpacity 
              onPress={() => hasExpandableText ? toggleExpanded(item.id) : null}
              disabled={!hasExpandableText}
            >
              <Text style={styles.cardDesc}>{displayText}</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.cardButton} onPress={handleLearnMore}>
              <Text style={styles.cardButtonText}>Pelajari</Text>
              <Ionicons name="arrow-forward" size={14} color="white" />
            </TouchableOpacity>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

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
          <Text style={styles.header}>Produk BNI</Text>
        </View>
      </View>

      <FlatList
        style={styles.container}
        data={[1]}
        renderItem={() => (
          <View>
            {/* Individual Section */}
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <MaterialCommunityIcons name="account" size={24} color="#FF6600" />
                <Text style={styles.subHeader}>Individual</Text>
              </View>
              <Text style={styles.sectionDesc}>Produk perbankan untuk kebutuhan pribadi dan keluarga</Text>
              <FlatList
                data={produkData.individual}
                renderItem={renderProduk}
                keyExtractor={(item) => item.id}
                horizontal
                showsHorizontalScrollIndicator={false}
                onScroll={(event) => handleScroll(event, 'individual')}
                scrollEventThrottle={16}
                contentContainerStyle={styles.listContainer}
              />
              {renderScrollIndicator('individual')}
            </View>

            {/* Korporasi Section */}
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <MaterialCommunityIcons name="office-building" size={24} color="#FF6600" />
                <Text style={styles.subHeader}>Korporasi</Text>
              </View>
              <Text style={styles.sectionDesc}>Solusi perbankan untuk kebutuhan perusahaan dan institusi</Text>
              <FlatList
                data={produkData.korporasi}
                renderItem={renderProduk}
                keyExtractor={(item) => item.id}
                horizontal
                showsHorizontalScrollIndicator={false}
                onScroll={(event) => handleScroll(event, 'korporasi')}
                scrollEventThrottle={16}
                contentContainerStyle={styles.listContainer}
              />
              {renderScrollIndicator('korporasi')}
            </View>

            {/* UMKM Section */}
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <MaterialCommunityIcons name="store" size={24} color="#FF6600" />
                <Text style={styles.subHeader}>UMKM</Text>
              </View>
              <Text style={styles.sectionDesc}>Dukungan finansial untuk usaha mikro, kecil, dan menengah</Text>
              <FlatList
                data={produkData.umkm}
                renderItem={renderProduk}
                keyExtractor={(item) => item.id}
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={[styles.listContainer, { justifyContent: 'center' }]}
              />
            </View>
          </View>
        )}
        keyExtractor={() => 'produk'}
        showsVerticalScrollIndicator={false}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1 },
  headerSection: {
    paddingHorizontal: 24,
    paddingTop: 20,
    paddingBottom: 16,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  backButton: {
    marginRight: 16,
    padding: 8,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  header: {
    fontSize: Math.max(20, 24 * scaleFactor),
    fontFamily: Fonts.bold,
    color: '#1A1A1A',
    flex: 1,
  },
  container: {
    flex: 1,
    paddingHorizontal: 16,
  },
  section: {
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 20,
    marginBottom: 20,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOpacity: 0.08,
        shadowOffset: { width: 0, height: 4 },
        shadowRadius: 12,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  subHeader: {
    fontSize: Math.max(16, 20 * scaleFactor),
    fontFamily: Fonts.bold,
    color: '#1A1A1A',
    marginLeft: 12,
  },
  sectionDesc: {
    fontSize: Math.max(12, 14 * scaleFactor),
    fontFamily: Fonts.regular,
    color: '#666',
    marginBottom: 20,
    lineHeight: Math.max(16, 20 * scaleFactor),
  },
  listContainer: {
    paddingHorizontal: 4,
  },
  card: {
    width: cardWidth,
    height: 220,
    marginHorizontal: 8,
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: 'white',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOpacity: 0.12,
        shadowOffset: { width: 0, height: 6 },
        shadowRadius: 16,
      },
      android: {
        elevation: 6,
      },
    }),
  },
  cardImage: {
    width: '100%',
    height: '100%',
    position: 'absolute',
    resizeMode: 'cover',
  },
  cardOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: '65%',
  },
  cardContent: {
    flex: 1,
    justifyContent: 'space-between',
    padding: 16,
  },
  cardBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 16,
    alignSelf: 'flex-start',
  },
  cardBadgeText: {
    fontSize: Math.max(9, 11 * scaleFactor),
    fontFamily: Fonts.medium,
    color: '#FF6600',
    marginLeft: 4,
  },
  cardText: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  cardTitle: {
    fontSize: Math.max(14, 18 * scaleFactor),
    fontFamily: Fonts.bold,
    color: 'white',
    marginBottom: 8,
  },
  cardDesc: {
    fontSize: Math.max(11, 13 * scaleFactor),
    fontFamily: Fonts.regular,
    color: 'white',
    marginBottom: 16,
    opacity: 0.95,
    lineHeight: Math.max(14, 18 * scaleFactor),
  },
  cardButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 102, 0, 0.95)',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    alignSelf: 'flex-start',
  },
  cardButtonText: {
    fontSize: Math.max(11, 13 * scaleFactor),
    fontFamily: Fonts.medium,
    color: 'white',
    marginRight: 6,
  },
  scrollIndicatorContainer: {
    alignItems: 'center',
    marginTop: 16,
  },
  scrollIndicatorTrack: {
    width: 80,
    height: 4,
    backgroundColor: '#E8E8E8',
    borderRadius: 2,
    position: 'relative',
  },
  scrollIndicatorThumb: {
    position: 'absolute',
    width: 20,
    height: 4,
    backgroundColor: '#FF6600',
    borderRadius: 2,
  },
});