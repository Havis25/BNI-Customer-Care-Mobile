import { Fonts } from '@/constants/Fonts';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import React, { useState } from 'react';
import {
  FlatList,
  SafeAreaView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';

const agen46Stats = [
  { label: 'Total Agen', value: '25.000+', icon: 'store' },
  { label: 'Kota/Kabupaten', value: '500+', icon: 'map-marker' },
  { label: 'Provinsi', value: '34', icon: 'flag' },
  { label: 'Transaksi/Bulan', value: '2.5M+', icon: 'swap-horizontal' },
];

const agen46Services = [
  {
    id: '1',
    title: 'Buka Rekening BNI Pandai',
    description: 'Pembukaan rekening tabungan dengan syarat mudah',
    icon: 'account-plus',
    color: '#4CAF50',
    limit: 'Bawa KTP & NPWP',
  },
  {
    id: '2',
    title: 'Setor & Tarik Tunai',
    description: 'Layanan setor dan tarik tunai tanpa ke cabang',
    icon: 'cash-multiple',
    color: '#2196F3',
    limit: 'Sesuai limit harian',
  },
  {
    id: '3',
    title: 'Transfer & E-Payment',
    description: 'Transfer antar bank dan pembayaran digital',
    icon: 'bank-transfer',
    color: '#FF9800',
    limit: 'Biaya admin berlaku',
  },
  {
    id: '4',
    title: 'Bayar Tagihan',
    description: 'Listrik, PDAM, telepon, BPJS, asuransi, dll',
    icon: 'receipt',
    color: '#9C27B0',
    limit: 'Sesuai nominal tagihan',
  },
  {
    id: '5',
    title: 'Top Up & Token',
    description: 'Pulsa, paket data, dan token listrik',
    icon: 'cellphone',
    color: '#FF5722',
    limit: 'Tersedia berbagai nominal',
  },
  {
    id: '6',
    title: 'Uang Elektronik',
    description: 'Daftar, isi saldo, dan tarik dana e-money',
    icon: 'credit-card-wireless',
    color: '#607D8B',
    limit: 'Sesuai ketentuan',
  },
];

const agenData = [
  {
    id: '1',
    nama: 'Indomaret Sudirman',
    alamat: 'Jl. Jend. Sudirman Kav. 45-46, Jakarta Pusat 10210',
    telepon: '(021) 5140046',
    jamBuka: '24 Jam',
    layanan: ['Laku Pandai', 'Setor Tunai', 'Tarik Tunai', 'Transfer', 'Bayar Tagihan'],
    jarak: '0.5 km',
    rating: 4.6,
  },
  {
    id: '2',
    nama: 'Alfamart Thamrin Plaza',
    alamat: 'Jl. M.H. Thamrin No. 28-30, Jakarta Pusat 10350',
    telepon: '(021) 3983046',
    jamBuka: '24 Jam',
    layanan: ['Laku Pandai', 'E-Payment', 'Top Up Pulsa', 'Token Listrik', 'BPJS'],
    jarak: '0.8 km',
    rating: 4.4,
  },
  {
    id: '3',
    nama: 'Apotek Kimia Farma Menteng',
    alamat: 'Jl. Menteng Raya No. 25, Jakarta Pusat 10340',
    telepon: '(021) 3190046',
    jamBuka: '08:00 - 22:00',
    layanan: ['Laku Pandai', 'Bayar Tagihan', 'BPJS Kesehatan', 'Asuransi'],
    jarak: '1.2 km',
    rating: 4.5,
  },
  {
    id: '4',
    nama: 'Toko Serba Ada Cikini',
    alamat: 'Jl. Cikini Raya No. 15, Jakarta Pusat 10330',
    telepon: '(021) 3154046',
    jamBuka: '07:00 - 21:00',
    layanan: ['Setor Tunai', 'Tarik Tunai', 'Transfer', 'Top Up Pulsa'],
    jarak: '1.5 km',
    rating: 4.2,
  },
  {
    id: '5',
    nama: 'Warung Berkah Kebon Sirih',
    alamat: 'Jl. Kebon Sirih Timur No. 8, Jakarta Pusat 10340',
    telepon: '(021) 3901046',
    jamBuka: '06:00 - 22:00',
    layanan: ['Laku Pandai', 'Bayar Tagihan', 'Token Listrik', 'Multifinance'],
    jarak: '1.8 km',
    rating: 4.3,
  },
  {
    id: '6',
    nama: 'Indomaret Sarinah',
    alamat: 'Jl. M.H. Thamrin No. 11, Jakarta Pusat 10350',
    telepon: '(021) 3142046',
    jamBuka: '24 Jam',
    layanan: ['Laku Pandai', 'E-Payment', 'Uang Elektronik', 'Transfer'],
    jarak: '2.1 km',
    rating: 4.7,
  },
  {
    id: '7',
    nama: 'Alfamidi Gondangdia',
    alamat: 'Jl. Gondangdia Lama No. 2, Jakarta Pusat 10350',
    telepon: '(021) 3904046',
    jamBuka: '06:00 - 24:00',
    layanan: ['Setor Tunai', 'Bayar Tagihan', 'Top Up Pulsa', 'BPJS'],
    jarak: '2.3 km',
    rating: 4.1,
  },
  {
    id: '8',
    nama: 'Toko Elektronik Mega',
    alamat: 'Jl. Sabang No. 45, Jakarta Pusat 10160',
    telepon: '(021) 3157046',
    jamBuka: '09:00 - 20:00',
    layanan: ['Transfer', 'Token Listrik', 'Top Up Pulsa', 'Bayar Tagihan'],
    jarak: '2.5 km',
    rating: 4.0,
  },
];

interface AgenItem {
  id: string;
  nama: string;
  alamat: string;
  telepon: string;
  jamBuka: string;
  layanan: string[];
  jarak: string;
  rating: number;
}

export default function AgentScreen() {
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedAgents, setExpandedAgents] = useState<string[]>([]);

  const filteredAgens = agenData.filter(agen => 
    agen.nama.toLowerCase().includes(searchQuery.toLowerCase()) ||
    agen.alamat.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const toggleExpand = (id: string) => {
    setExpandedAgents(prev => 
      prev.includes(id) 
        ? prev.filter(agentId => agentId !== id)
        : [...prev, id]
    );
  };

  const renderService = ({ item }: { item: any }) => (
    <View style={[styles.serviceCard, { borderLeftColor: item.color }]}>
      <View style={styles.serviceContent}>
        <View style={styles.serviceTop}>
          <View style={styles.serviceHeader}>
            <View style={[styles.iconContainer, { backgroundColor: item.color }]}>
              <MaterialCommunityIcons name={item.icon} size={20} color="white" />
            </View>
            <Text style={styles.serviceName}>{item.title}</Text>
          </View>
        </View>
        <Text style={styles.serviceDescription}>{item.description}</Text>
        <View style={[styles.limitBadge, { backgroundColor: `${item.color}15` }]}>
          <Text style={[styles.limitText, { color: item.color }]}>{item.limit}</Text>
        </View>
      </View>
    </View>
  );

  const renderAgen = ({ item }: { item: AgenItem }) => {
    const isExpanded = expandedAgents.includes(item.id);
    const visibleServices = isExpanded ? item.layanan : item.layanan.slice(0, 3);
    
    return (
      <View style={styles.agenCard}>
        <View style={styles.agenHeader}>
          <View style={styles.agenInfo}>
            <Text style={styles.agenName}>{item.nama}</Text>
            <View style={styles.agenMeta}>
              <View style={styles.ratingContainer}>
                <Ionicons name="star" size={12} color="#FFD700" />
                <Text style={styles.ratingText}>{item.rating}</Text>
              </View>
              <View style={styles.distanceContainer}>
                <Ionicons name="location-outline" size={12} color="#666" />
                <Text style={styles.distanceText}>{item.jarak}</Text>
              </View>
            </View>
          </View>
        </View>
        
        <View style={styles.agenDetails}>
          <View style={styles.detailRow}>
            <Ionicons name="location" size={14} color="#FF6600" />
            <Text style={styles.detailText}>{item.alamat}</Text>
          </View>
          
          <View style={styles.detailRow}>
            <Ionicons name="call" size={14} color="#FF6600" />
            <Text style={styles.detailText}>{item.telepon}</Text>
          </View>
          
          <View style={styles.detailRow}>
            <Ionicons name="time" size={14} color="#FF6600" />
            <Text style={styles.detailText}>{item.jamBuka}</Text>
          </View>

          <View style={styles.servicesContainer}>
            {visibleServices.map((layanan, index) => (
              <View key={index} style={styles.serviceBadge}>
                <Text style={styles.serviceText}>{layanan}</Text>
              </View>
            ))}
            {item.layanan.length > 3 && (
              <TouchableOpacity 
                style={[styles.moreButton, { backgroundColor: isExpanded ? '#FF660015' : '#f0f0f0' }]}
                onPress={() => toggleExpand(item.id)}
              >
                <Text style={[styles.moreText, { color: isExpanded ? '#FF6600' : '#666' }]}>
                  {isExpanded ? 'Tutup' : `+${item.layanan.length - 3}`}
                </Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      </View>
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
          <Text style={styles.header}>Agen46</Text>
        </View>
      </View>

      <FlatList
        data={agen46Services}
        renderItem={renderService}
        keyExtractor={(item) => item.id}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={() => (
          <View>
            <View style={styles.headerContent}>
              <View style={styles.heroSection}>
                <Text style={styles.heroSubtitle}>
                  Temukan agen BNI terdekat untuk layanan perbankan lengkap kapan saja, dimana saja
                </Text>
                <View style={styles.heroFeatures}>
                  <View style={styles.heroFeature}>
                    <MaterialCommunityIcons name="store" size={16} color="#4CAF50" />
                    <Text style={styles.heroFeatureText}>25.000+ Agen</Text>
                  </View>
                  <View style={styles.heroFeature}>
                    <MaterialCommunityIcons name="clock-outline" size={16} color="#4CAF50" />
                    <Text style={styles.heroFeatureText}>Buka 24/7</Text>
                  </View>
                </View>
              </View>
            </View>
            
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Layanan Tersedia</Text>
            </View>
          </View>
        )}
        ListFooterComponent={() => (
          <View>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Cari Agen Terdekat</Text>
              <View style={styles.searchContainer}>
                <Ionicons name="search" size={18} color="#666" />
                <TextInput
                  style={styles.searchInput}
                  placeholder="Cari agen BNI terdekat..."
                  value={searchQuery}
                  onChangeText={setSearchQuery}
                />
              </View>
            </View>
            
            <View style={styles.resultsHeader}>
              <Text style={styles.resultsCount}>
                {filteredAgens.length} Agen Ditemukan
              </Text>
            </View>
            
            {filteredAgens.map((item) => (
              <View key={item.id}>
                {renderAgen({ item })}
              </View>
            ))}
          </View>
        )}
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
  heroTitle: {
    fontSize: 20,
    fontFamily: Fonts.bold,
    color: '#1a1a1a',
    marginBottom: 8,
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
  sectionHeader: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontFamily: Fonts.semiBold,
    color: '#1a1a1a',
    marginBottom: 12,
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
  serviceContent: {
    padding: 16,
  },
  serviceTop: {
    marginBottom: 8,
  },
  serviceHeader: {
    flexDirection: 'row',
    alignItems: 'center',
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
    marginBottom: 8,
  },
  limitBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: 'flex-start',
  },
  limitText: {
    fontSize: 11,
    fontFamily: Fonts.medium,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginTop: 8,
  },
  searchInput: {
    flex: 1,
    marginLeft: 8,
    fontSize: 14,
    fontFamily: Fonts.regular,
    color: 'black',
  },
  resultsHeader: {
    marginBottom: 12,
  },
  resultsCount: {
    fontSize: 16,
    fontFamily: Fonts.semiBold,
    color: '#1a1a1a',
  },
  agenCard: {
    backgroundColor: 'white',
    borderRadius: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },
  agenHeader: {
    padding: 16,
    paddingBottom: 8,
  },
  agenInfo: {
    flex: 1,
  },
  agenName: {
    fontSize: 15,
    fontFamily: Fonts.semiBold,
    color: '#1a1a1a',
    marginBottom: 4,
  },
  agenMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ratingText: {
    fontSize: 11,
    fontFamily: Fonts.medium,
    color: '#666',
    marginLeft: 2,
  },
  distanceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  distanceText: {
    fontSize: 11,
    fontFamily: Fonts.medium,
    color: '#666',
    marginLeft: 2,
  },
  agenDetails: {
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  detailText: {
    fontSize: 12,
    fontFamily: Fonts.regular,
    color: '#666',
    marginLeft: 8,
    flex: 1,
  },
  servicesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginTop: 8,
  },
  serviceBadge: {
    backgroundColor: '#FF660015',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  serviceText: {
    fontSize: 10,
    fontFamily: Fonts.medium,
    color: '#FF6600',
  },
  moreButton: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  moreText: {
    fontSize: 10,
    fontFamily: Fonts.medium,
  },
});