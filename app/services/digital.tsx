import { Fonts } from '@/constants/Fonts';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import React, { useState } from 'react';
import {
  FlatList,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';

const digitalServices = {
  banking: [
    {
      id: '1',
      name: 'BNI Mobile Banking',
      description: 'Aplikasi mobile banking untuk transaksi perbankan',
      icon: 'cellphone',
      color: '#1F72F1',
      features: ['Transfer', 'Cek Saldo', 'Bayar Tagihan', 'Investasi'],
      status: 'Available',
    },
    {
      id: '2',
      name: 'BNI Internet Banking',
      description: 'Layanan perbankan online melalui website',
      icon: 'laptop',
      color: '#4CAF50',
      features: ['Transfer Antar Bank', 'Pembayaran', 'Mutasi Rekening'],
      status: 'Available',
    },
    {
      id: '3',
      name: 'BNI SMS Banking',
      description: 'Layanan perbankan melalui SMS',
      icon: 'message-text',
      color: '#FF9800',
      features: ['Cek Saldo', 'Transfer', 'Info Rekening'],
      status: 'Available',
    },
  ],
  payment: [
    {
      id: '4',
      name: 'QRIS BNI',
      description: 'Pembayaran digital menggunakan QR Code',
      icon: 'qrcode-scan',
      color: '#9C27B0',
      features: ['Scan & Pay', 'Terima Pembayaran', 'Cashback'],
      status: 'Available',
    },
    {
      id: '5',
      name: 'BNI Debit Online',
      description: 'Pembayaran online menggunakan kartu debit',
      icon: 'credit-card',
      color: '#FF5722',
      features: ['E-commerce', 'Subscription', 'Bill Payment'],
      status: 'Available',
    },
  ],
};

interface DigitalServiceItem {
  id: string;
  name: string;
  description: string;
  icon: string;
  color: string;
  features: string[];
  status: string;
}

export default function DigitalScreen() {
  const [activeTab, setActiveTab] = useState('banking');

  const renderService = ({ item }: { item: DigitalServiceItem }) => (
    <TouchableOpacity style={styles.serviceCard}>
      <View style={styles.serviceHeader}>
        <View style={[styles.iconContainer, { backgroundColor: item.color }]}>
          <MaterialCommunityIcons name={item.icon as any} size={24} color="white" />
        </View>
        <View style={styles.serviceInfo}>
          <Text style={styles.serviceName}>{item.name}</Text>
          <Text style={styles.serviceDescription}>{item.description}</Text>
        </View>
        <View style={[
          styles.statusBadge,
          { backgroundColor: item.status === 'Available' ? '#4CAF50' : '#FF9800' }
        ]}>
          <Text style={styles.statusText}>{item.status}</Text>
        </View>
      </View>
      
      <View style={styles.featuresContainer}>
        <Text style={styles.featuresLabel}>Fitur:</Text>
        <View style={styles.featuresList}>
          {item.features.map((feature, index) => (
            <View key={index} style={styles.featureBadge}>
              <Text style={styles.featureText}>{feature}</Text>
            </View>
          ))}
        </View>
      </View>
      
      <TouchableOpacity style={styles.actionButton}>
        <Text style={styles.actionButtonText}>
          {item.status === 'Available' ? 'Gunakan Sekarang' : 'Coming Soon'}
        </Text>
        <Ionicons name="arrow-forward" size={16} color="white" />
      </TouchableOpacity>
    </TouchableOpacity>
  );

  const getTabData = () => {
    switch (activeTab) {
      case 'banking':
        return digitalServices.banking;
      case 'payment':
        return digitalServices.payment;
      default:
        return digitalServices.banking;
    }
  };

  const getTabTitle = () => {
    switch (activeTab) {
      case 'banking':
        return 'Layanan Perbankan Digital';
      case 'payment':
        return 'Pembayaran Digital';
      default:
        return 'Layanan Perbankan Digital';
    }
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
          <Text style={styles.header}>Layanan Digital</Text>
        </View>
      </View>

      <FlatList
        style={styles.container}
        data={getTabData()}
        renderItem={renderService}
        keyExtractor={(item) => item.id}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={
          <>
            <View style={styles.tabContainer}>
              <TouchableOpacity
                style={[styles.tab, activeTab === 'banking' && styles.activeTab]}
                onPress={() => setActiveTab('banking')}
              >
                <MaterialCommunityIcons 
                  name="bank" 
                  size={20} 
                  color={activeTab === 'banking' ? 'white' : '#666'} 
                />
                <Text style={[styles.tabText, activeTab === 'banking' && styles.activeTabText]}>
                  Banking
                </Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[styles.tab, activeTab === 'payment' && styles.activeTab]}
                onPress={() => setActiveTab('payment')}
              >
                <MaterialCommunityIcons 
                  name="credit-card" 
                  size={20} 
                  color={activeTab === 'payment' ? 'white' : '#666'} 
                />
                <Text style={[styles.tabText, activeTab === 'payment' && styles.activeTabText]}>
                  Payment
                </Text>
              </TouchableOpacity>
            </View>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>{getTabTitle()}</Text>
            </View>
          </>
        }
        contentContainerStyle={styles.listContent}
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
  header: {
    fontSize: 24,
    fontFamily: Fonts.bold,
    color: 'black',
    flex: 1,
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 4,
    marginBottom: 16,
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderRadius: 12,
    gap: 6,
  },
  activeTab: {
    backgroundColor: '#FF6600',
  },
  tabText: {
    fontSize: 12,
    fontFamily: Fonts.medium,
    color: '#666',
  },
  activeTabText: {
    color: 'white',
    fontFamily: Fonts.semiBold,
  },
  section: {
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
  },
  serviceCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    marginHorizontal: 16,
    borderWidth: 1,
    borderColor: '#e9ecef',
  },
  serviceHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  serviceInfo: {
    flex: 1,
  },
  serviceName: {
    fontSize: 16,
    fontFamily: Fonts.semiBold,
    color: 'black',
    marginBottom: 4,
  },
  serviceDescription: {
    fontSize: 12,
    fontFamily: Fonts.medium,
    color: '#666',
    lineHeight: 16,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  statusText: {
    fontSize: 10,
    fontFamily: Fonts.medium,
    color: 'white',
  },
  featuresContainer: {
    marginBottom: 16,
  },
  featuresLabel: {
    fontSize: 12,
    fontFamily: Fonts.semiBold,
    color: '#333',
    marginBottom: 8,
  },
  featuresList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  featureBadge: {
    backgroundColor: '#e3f2fd',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  featureText: {
    fontSize: 10,
    fontFamily: Fonts.medium,
    color: '#1976d2',
  },
  actionButton: {
    backgroundColor: '#FF6600',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 8,
    gap: 8,
  },
  actionButtonText: {
    fontSize: 14,
    fontFamily: Fonts.semiBold,
    color: 'white',
  },
  sectionHeader: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
  },
  listContent: {
    paddingBottom: 16,
  },
});