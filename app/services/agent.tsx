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

  const filteredAgens = agenData.filter(agen => 
    agen.nama.toLowerCase().includes(searchQuery.toLowerCase()) ||
    agen.alamat.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const renderStat = (stat: any, index: number) => (
    <View key={index} style={styles.statCard}>
      <MaterialCommunityIcons name={stat.icon} size={24} color="#FF6600" />
      <Text style={styles.statValue}>{stat.value}</Text>
      <Text style={styles.statLabel}>{stat.label}</Text>
    </View>
  );

  const renderService = ({ item }: { item: any }) => (
    <View style={styles.serviceCard}>
      <View style={styles.serviceHeader}>
        <View style={[styles.serviceIcon, { backgroundColor: item.color }]}>
          <MaterialCommunityIcons name={item.icon} size={20} color="white" />
        </View>
        <View style={styles.serviceInfo}>
          <Text style={styles.serviceTitle}>{item.title}</Text>
          <Text style={styles.serviceDescription}>{item.description}</Text>
          <Text style={styles.serviceLimit}>{item.limit}</Text>
        </View>
      </View>
    </View>
  );

  const renderAgen = ({ item }: { item: AgenItem }) => (
    <TouchableOpacity style={styles.card}>
      <View style={styles.cardHeader}>
        <View style={styles.nameContainer}>
          <Text style={styles.cardTitle}>{item.nama}</Text>
          <View style={styles.metaContainer}>
            <View style={styles.ratingContainer}>
              <Ionicons name="star" size={14} color="#FFD700" />
              <Text style={styles.ratingText}>{item.rating}</Text>
            </View>
            <View style={styles.distanceContainer}>
              <Ionicons name="location-outline" size={14} color="#666" />
              <Text style={styles.distanceText}>{item.jarak}</Text>
            </View>
          </View>
        </View>

      </View>
      
      <View style={styles.cardContent}>
        <View style={styles.infoRow}>
          <Ionicons name="location" size={16} color="#FF6600" />
          <Text style={styles.infoText}>{item.alamat}</Text>
        </View>
        
        <View style={styles.infoRow}>
          <Ionicons name="call" size={16} color="#FF6600" />
          <Text style={styles.infoText}>{item.telepon}</Text>
        </View>
        
        <View style={styles.infoRow}>
          <Ionicons name="time" size={16} color="#FF6600" />
          <Text style={styles.infoText}>{item.jamBuka}</Text>
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
          <Text style={styles.header}>Agen BNI Terdekat</Text>
        </View>
      </View>

      <ScrollView style={styles.container}>
        {/* Hook Card */}
        <View style={styles.hookCard}>
          <LinearGradient
            colors={['#FFF5E6', '#FFFFFF']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.hookGradient}
          >
            <View style={styles.hookHeader}>
              <Image 
                source={require('@/assets/images/logo_agen46.png')} 
                style={styles.agen46Logo}
                resizeMode="contain"
              />
            </View>
            
            <View style={styles.hookContent}>
              <Text style={styles.hookTitle}>Agen46 Dekat dengan Kamu!</Text>
              <Text style={styles.hookSubtitle}>
                Butuh bantuan perbankan? Agen46 siap membantu dengan layanan lengkap di sekitar kamu.
              </Text>
              
              <View style={styles.hookFeatures}>
                <View style={styles.hookFeature}>
                  <View style={styles.checkIcon}>
                    <Ionicons name="checkmark" size={12} color="white" />
                  </View>
                  <Text style={styles.hookFeatureText}>Buka rekening mudah</Text>
                </View>
                <View style={styles.hookFeature}>
                  <View style={styles.checkIcon}>
                    <Ionicons name="checkmark" size={12} color="white" />
                  </View>
                  <Text style={styles.hookFeatureText}>Bayar tagihan lengkap</Text>
                </View>
                <View style={styles.hookFeature}>
                  <View style={styles.checkIcon}>
                    <Ionicons name="checkmark" size={12} color="white" />
                  </View>
                  <Text style={styles.hookFeatureText}>Setor tarik tunai</Text>
                </View>
              </View>
              

            </View>
          </LinearGradient>
        </View>

        {/* Layanan yang Tersedia */}
        <View style={styles.section}>
          <Text style={styles.subHeader}>Layanan yang Tersedia di Agen46</Text>
          <FlatList
            data={agen46Services}
            renderItem={renderService}
            keyExtractor={(item) => item.id}
            showsVerticalScrollIndicator={false}
            scrollEnabled={false}
          />
        </View>

        {/* Search & Agen Terdekat */}
        <View style={styles.section}>
          <Text style={styles.subHeader}>Cari Agen46 Terdekat</Text>
          <Text style={styles.sectionDesc}>
            Temukan lokasi Agen46 terdekat untuk melakukan transaksi perbankan dan pembayaran
          </Text>
          <View style={styles.searchContainer}>
            <Ionicons name="search" size={20} color="#666" />
            <TextInput
              style={styles.searchInput}
              placeholder="Cari agen BNI terdekat..."
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.subHeader}>
            {filteredAgens.length} Agen BNI Ditemukan
          </Text>
          <FlatList
            data={filteredAgens}
            renderItem={renderAgen}
            keyExtractor={(item) => item.id}
            showsVerticalScrollIndicator={false}
            scrollEnabled={false}
          />
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
  section: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
  },
  subHeader: {
    fontSize: 16,
    fontFamily: Fonts.semiBold,
    color: 'black',
    marginBottom: 8,
  },
  sectionDesc: {
    fontSize: 12,
    fontFamily: Fonts.medium,
    color: '#666',
    lineHeight: 16,
    marginBottom: 16,
  },
  hookCard: {
    marginBottom: 16,
    borderRadius: 20,
    overflow: 'hidden',
    ...Platform.select({
      ios: {
        shadowColor: '#FF6600',
        shadowOpacity: 0.15,
        shadowOffset: { width: 0, height: 4 },
        shadowRadius: 12,
      },
      android: {
        elevation: 6,
      },
    }),
  },
  hookGradient: {
    padding: 20,
  },
  hookHeader: {
    marginBottom: 16,
  },
  agen46Logo: {
    width: 120,
    height: 60,
  },
  hookContent: {
    gap: 12,
  },
  hookTitle: {
    fontSize: 20,
    fontFamily: Fonts.bold,
    color: '#1a1a1a',
  },
  hookSubtitle: {
    fontSize: 14,
    fontFamily: Fonts.medium,
    color: '#666',
    lineHeight: 20,
  },
  hookFeatures: {
    gap: 10,
  },
  hookFeature: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  checkIcon: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#4CAF50',
    justifyContent: 'center',
    alignItems: 'center',
  },
  hookFeatureText: {
    fontSize: 13,
    fontFamily: Fonts.medium,
    color: '#333',
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
    marginBottom: 12,
  },
  statValue: {
    fontSize: 18,
    fontFamily: Fonts.bold,
    color: 'black',
    marginTop: 8,
  },
  statLabel: {
    fontSize: 11,
    fontFamily: Fonts.medium,
    color: '#666',
    textAlign: 'center',
    marginTop: 4,
  },
  serviceCard: {
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    padding: 12,
    marginBottom: 8,
  },
  serviceHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  serviceIcon: {
    width: 36,
    height: 36,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  serviceInfo: {
    flex: 1,
  },
  serviceTitle: {
    fontSize: 14,
    fontFamily: Fonts.semiBold,
    color: 'black',
    marginBottom: 2,
  },
  serviceDescription: {
    fontSize: 11,
    fontFamily: Fonts.medium,
    color: '#666',
    marginBottom: 2,
  },
  serviceLimit: {
    fontSize: 10,
    fontFamily: Fonts.medium,
    color: '#FF6600',
    fontStyle: 'italic',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  searchInput: {
    flex: 1,
    marginLeft: 8,
    fontSize: 14,
    fontFamily: Fonts.medium,
    color: 'black',
  },
  card: {
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#e9ecef',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  nameContainer: {
    flex: 1,
  },
  cardTitle: {
    fontSize: 16,
    fontFamily: Fonts.semiBold,
    color: 'black',
    marginBottom: 4,
  },
  metaContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ratingText: {
    fontSize: 12,
    fontFamily: Fonts.medium,
    color: '#666',
    marginLeft: 4,
  },
  distanceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  distanceText: {
    fontSize: 12,
    fontFamily: Fonts.medium,
    color: '#666',
    marginLeft: 4,
  },
  categoryBadge: {
    backgroundColor: '#e3f2fd',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  categoryText: {
    fontSize: 10,
    fontFamily: Fonts.medium,
    color: '#1976d2',
  },
  cardContent: {
    gap: 8,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  infoText: {
    fontSize: 12,
    fontFamily: Fonts.medium,
    color: '#333',
    marginLeft: 8,
    flex: 1,
  },
  layananContainer: {
    marginTop: 8,
  },
  layananLabel: {
    fontSize: 12,
    fontFamily: Fonts.semiBold,
    color: '#333',
    marginBottom: 6,
  },
  layananList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  layananBadge: {
    backgroundColor: '#fff3e0',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  layananText: {
    fontSize: 10,
    fontFamily: Fonts.medium,
    color: '#f57c00',
  },

});