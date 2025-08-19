import { Fonts } from '@/constants/Fonts';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import React, { useState } from 'react';
import {
  FlatList,
  Image,
  Platform,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';

const produkData = {
  individual: [
    {
      id: '1',
      nama: 'BNI Taplus',
      deskripsi: 'Tabungan untuk kebutuhan sehari-hari.',
      gambar: require ('../../assets/images/bni-taplus.jpg'),
    },
    {
      id: '2',
      nama: 'BNI Fleksi',
      deskripsi: 'Kredit tanpa agunan khusus pegawai bergaji.',
      gambar: require ('../../assets/images/bni-fleksi.jpg'),
    },
    {
      id: '3',
      nama: 'BNI Griya',
      deskripsi: 'Kredit kepemilikan rumah dengan bunga kompetitif.',
      gambar: require ('../../assets/images/bni-griya.jpg'),
    },
  ],
  korporasi: [
    {
      id: '4',
      nama: 'BNI Giro',
      deskripsi: 'Layanan rekening giro untuk transaksi bisnis.',
      gambar: require ('../../assets/images/bni-giro.jpg'),
    },
    {
      id: '5',
      nama: 'BNI Cash Management',
      deskripsi: 'Solusi pengelolaan keuangan perusahaan.',
      gambar: require ('../../assets/images/bni-giro.jpg'),
    },
    {
      id: '6',
      nama: 'BNI Trade Finance',
      deskripsi: 'Layanan perdagangan internasional.',
      gambar: require ('../../assets/images/bni-giro.jpg'),
    },
  ],
  umkm: [
    {
      id: '7',
      nama: 'BNI Xpora',
      deskripsi: 'Kredit modal kerja untuk usaha mikro kecil menengah.',
      gambar: require ('../../assets/images/bni-xpora.png'),
    },
  ],
};

interface ProdukItem {
  id: string;
  nama: string;
  deskripsi: string;
  gambar: string | any;
}

export default function ProdukScreen() {
  const [scrollPositions, setScrollPositions] = useState({
    individual: 0,
    korporasi: 0,
    umkm: 0,
  });

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

  const renderProduk = ({ item }: { item: ProdukItem }) => (
    <TouchableOpacity style={styles.card}>
      <Image source={typeof item.gambar === 'string' ? { uri: item.gambar } : item.gambar} style={styles.cardImage} />
      <LinearGradient
        colors={['rgba(0,0,0,0)', 'rgba(0,0,0,0.3)']}
        style={styles.cardOverlay}
      />
      <View style={styles.cardContent}>
        <View style={styles.cardBadge}>
          <MaterialCommunityIcons name="star" size={12} color="#FF6600" />
          <Text style={styles.cardBadgeText}>Populer</Text>
        </View>
        <View style={styles.cardText}>
          <Text style={styles.cardTitle}>{item.nama}</Text>
          <Text style={styles.cardDesc}>{item.deskripsi}</Text>
          <TouchableOpacity style={styles.cardButton}>
            <Text style={styles.cardButtonText}>Pelajari</Text>
            <Ionicons name="arrow-forward" size={14} color="white" />
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
                onScroll={(event) => handleScroll(event, 'umkm')}
                scrollEventThrottle={16}
                contentContainerStyle={styles.listContainer}
              />
              {renderScrollIndicator('umkm')}
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
  section: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOpacity: 0.05,
        shadowOffset: { width: 0, height: 2 },
        shadowRadius: 8,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  header: {
    fontSize: 24,
    fontFamily: Fonts.bold,
    color: 'black',
    flex: 1,
  },
  heroSection: {
    marginBottom: 16,
    borderRadius: 20,
    overflow: 'hidden',
    ...Platform.select({
      ios: {
        shadowColor: '#FF6600',
        shadowOpacity: 0.2,
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
  },
  heroContent: {
    alignItems: 'center',
  },
  heroTitle: {
    fontSize: 24,
    fontFamily: Fonts.bold,
    color: 'white',
    textAlign: 'center',
    marginBottom: 8,
  },
  heroSubtitle: {
    fontSize: 14,
    fontFamily: Fonts.medium,
    color: 'rgba(255,255,255,0.9)',
    textAlign: 'center',
    marginBottom: 20,
  },
  heroStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
  },
  heroStat: {
    alignItems: 'center',
  },
  heroStatNumber: {
    fontSize: 20,
    fontFamily: Fonts.bold,
    color: 'white',
  },
  heroStatLabel: {
    fontSize: 12,
    fontFamily: Fonts.medium,
    color: 'rgba(255,255,255,0.8)',
    marginTop: 2,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    gap: 8,
  },
  subHeader: {
    fontSize: 18,
    fontFamily: Fonts.semiBold,
    color: '#333',
  },
  sectionDesc: {
    fontSize: 12,
    fontFamily: Fonts.medium,
    color: '#666',
    marginBottom: 16,
    lineHeight: 16,
  },
  listContainer: {
    paddingRight: 16,
  },
  scrollIndicatorContainer: {
    marginTop: 12,
    marginBottom: 8,
    alignItems: 'center',
  },
  scrollIndicatorTrack: {
    width: '30%',
    height: 3,
    backgroundColor: '#e0e0e0',
    borderRadius: 2,
    position: 'relative',
  },
  scrollIndicatorThumb: {
    position: 'absolute',
    width: '30%',
    height: 3,
    backgroundColor: '#FF6600',
    borderRadius: 2,
  },
  card: {
    backgroundColor: 'white',
    borderRadius: 16,
    marginRight: 16,
    width: 280,
    height: 320,
    overflow: 'hidden',
    position: 'relative',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOpacity: 0.15,
        shadowOffset: { width: 0, height: 4 },
        shadowRadius: 12,
      },
      android: {
        elevation: 6,
      },
    }),
  },
  cardImage: {
    width: '100%',
    height: 160,
    resizeMode: 'cover',
    backgroundColor: '#f5f5f5',
  },
  cardOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 160,
  },
  cardContent: {
    position: 'relative',
    flex: 1,
  },
  cardBadge: {
    position: 'absolute',
    top: -148,
    right: 12,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.9)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
  },
  cardBadgeText: {
    fontSize: 10,
    fontFamily: Fonts.semiBold,
    color: '#FF6600',
  },
  cardText: {
    padding: 16,
    flex: 1,
    justifyContent: 'space-between',
  },
  cardTitle: {
    fontSize: 16,
    fontFamily: Fonts.bold,
    color: '#222',
    marginBottom: 6,
  },
  cardDesc: {
    fontSize: 13,
    fontFamily: Fonts.medium,
    color: '#666',
    lineHeight: 18,
    marginBottom: 12,
  },
  cardButton: {
    backgroundColor: '#FF6600',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    gap: 6,
  },
  cardButtonText: {
    fontSize: 12,
    fontFamily: Fonts.semiBold,
    color: 'white',
  },
});