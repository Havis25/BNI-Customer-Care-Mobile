import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView, Platform, Modal } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Fonts } from '@/constants/Fonts';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { router } from 'expo-router';

const riwayatData = [
  { id: 'LP-202508061234', status: 'Diterima', judul: 'Masalah ATM tidak bisa tarik tunai', tanggal: '15 Des 2024', jam: '14:30' },
  { id: 'LP-202508061235', status: 'Validasi', judul: 'Kartu kredit terblokir', tanggal: '14 Des 2024', jam: '09:15' },
  { id: 'LP-202508061236', status: 'Diproses', judul: 'Transfer gagal tapi saldo terpotong', tanggal: '13 Des 2024', jam: '16:45' },
  { id: 'LP-202508061237', status: 'Selesai', judul: 'Aplikasi mobile banking error', tanggal: '12 Des 2024', jam: '11:20' },
  { id: 'LP-202508061238', status: 'Validasi', judul: 'Kartu kredit terblokir', tanggal: '14 Des 2024', jam: '09:15' },
  { id: 'LP-202508061239', status: 'Selesai', judul: 'Aplikasi mobile banking error', tanggal: '12 Des 2024', jam: '11:20' },
  { id: 'LP-202508061240', status: 'Validasi', judul: 'Kartu kredit terblokir', tanggal: '14 Des 2024', jam: '09:15' },
  { id: 'LP-202508061241', status: 'Diproses', judul: 'Transfer gagal tapi saldo terpotong', tanggal: '13 Des 2024', jam: '16:45' },
  { id: 'LP-202508061242', status: 'Diterima', judul: 'Masalah ATM tidak bisa tarik tunai', tanggal: '15 Des 2024', jam: '14:30' },
  { id: 'LP-202508061243', status: 'Selesai', judul: 'Aplikasi mobile banking error', tanggal: '12 Des 2024', jam: '11:20' },
  { id: 'LP-202508061244', status: 'Diterima', judul: 'Masalah ATM tidak bisa tarik tunai', tanggal: '15 Des 2024', jam: '14:30' },
  { id: 'LP-202508061245', status: 'Diproses', judul: 'Transfer gagal tapi saldo terpotong', tanggal: '13 Des 2024', jam: '16:45' },
  { id: 'LP-202508061246', status: 'Selesai', judul: 'Aplikasi mobile banking error', tanggal: '12 Des 2024', jam: '11:20' },
  { id: 'LP-202508061247', status: 'Diproses', judul: 'Transfer gagal tapi saldo terpotong', tanggal: '13 Des 2024', jam: '16:45' },
];

const getStatusColorBackground = (status: string) => {
  switch (status) {
    case 'Diterima': return '#FFF3EB';
    case 'Validasi': return '#FFF9EB';
    case 'Diproses': return '#FCFDEE';
    default: return '#F1FBFB';
  }
};
const getStatusColorBadge = (status: string) => {
  switch (status) {
    case 'Diterima': return '#FFDBC3';
    case 'Validasi': return '#FFEEC2';
    case 'Diproses': return '#F3F8BD';
    default: return '#D4F4F2';
  }
};

const getStatusColorText = (status: string) => {
  switch (status) {
    case 'Diterima': return '#FF8636';
    case 'Validasi': return '#FFB600';
    case 'Diproses': return '#B3BE47';
    default: return '#66C4BE';
  }
};

export default function RiwayatScreen() {
  const [showFilter, setShowFilter] = useState(false);
  const [sortBy, setSortBy] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string[]>([]);
  
  const hasFilters = sortBy !== '' || selectedStatus.length > 0;

  const toggleStatus = (status: string) => {
    setSelectedStatus(prev => 
      prev.includes(status) 
        ? prev.filter(s => s !== status)
        : [...prev, status]
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>Riwayat Laporan</Text>
      
      <View style={styles.searchFilterContainer}>
        <View style={styles.searchContainer}>
          <MaterialIcons name="search" size={20} color="#666" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Cari laporan..."
            placeholderTextColor="#999"
          />
        </View>
        
        <TouchableOpacity style={styles.filterButton} onPress={() => setShowFilter(true)}>
          <MaterialIcons name="tune" size={20} color="white" />
        </TouchableOpacity>
      </View>
      
      <ScrollView style={styles.listContainer} showsVerticalScrollIndicator={false}>
        {riwayatData.map((item) => (
          <TouchableOpacity 
            key={item.id} 
            style={[styles.card, { borderLeftColor: getStatusColorText(item.status), backgroundColor: getStatusColorBackground(item.status) }]}
            onPress={() => router.push(`/complaint/ticket?id=${item.id}` as any)}
          >
            <View style={styles.cardHeader}>
              <Text style={styles.cardId}>{item.id}</Text>
              <View style={[styles.statusBadge, { backgroundColor: getStatusColorBadge(item.status) }]}>
                <Text style={[styles.statusText, { color: getStatusColorText(item.status) }]}>{item.status}</Text>
              </View>
            </View>
            <Text style={styles.cardTitle}>{item.judul}</Text>
            <Text style={styles.cardDateTime}>{item.tanggal}, {item.jam}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
      
      <Modal visible={showFilter} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.bottomSheet}>
            <View style={styles.sheetHeader}>
              <Text style={styles.sheetTitle}>Filter & Sort</Text>
              <TouchableOpacity onPress={() => setShowFilter(false)}>
                <MaterialIcons name="close" size={24} color="#333" />
              </TouchableOpacity>
            </View>
            
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Sort By</Text>
              <TouchableOpacity 
                style={styles.sortOption} 
                onPress={() => setSortBy('tanggal')}
              >
                <MaterialIcons name="calendar-today" size={20} color="#1F72F1" />
                <Text style={styles.optionText}>Tanggal</Text>
                <MaterialIcons 
                  name={sortBy === 'tanggal' ? 'radio-button-checked' : 'radio-button-unchecked'} 
                  size={20} 
                  color={sortBy === 'tanggal' ? '#1F72F1' : '#8E8E93'} 
                />
              </TouchableOpacity>
            </View>
            
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Status Ticket</Text>
              
              <TouchableOpacity 
                style={styles.statusOption} 
                onPress={() => toggleStatus('Diterima')}
              >
                <MaterialIcons name="edit-document" size={20} color="#FF8636" />
                <Text style={styles.optionText}>Diterima</Text>
                <MaterialIcons 
                  name={selectedStatus.includes('Diterima') ? 'check-box' : 'check-box-outline-blank'} 
                  size={20} 
                  color={selectedStatus.includes('Diterima') ? '#1F72F1' : '#8E8E93'} 
                />
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={styles.statusOption} 
                onPress={() => toggleStatus('Validasi')}
              >
                <MaterialIcons name="verified" size={20} color="#FFB600" />
                <Text style={styles.optionText}>Validasi</Text>
                <MaterialIcons 
                  name={selectedStatus.includes('Validasi') ? 'check-box' : 'check-box-outline-blank'} 
                  size={20} 
                  color={selectedStatus.includes('Validasi') ? '#1F72F1' : '#8E8E93'} 
                />
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={styles.statusOption} 
                onPress={() => toggleStatus('Diproses')}
              >
                <MaterialIcons name="history" size={20} color="#B3BE47" />
                <Text style={styles.optionText}>Diproses</Text>
                <MaterialIcons 
                  name={selectedStatus.includes('Diproses') ? 'check-box' : 'check-box-outline-blank'} 
                  size={20} 
                  color={selectedStatus.includes('Diproses') ? '#1F72F1' : '#8E8E93'} 
                />
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={styles.statusOption} 
                onPress={() => toggleStatus('Selesai')}
              >
                <MaterialIcons name="check-circle-outline" size={20} color="#66C4BE" />
                <Text style={styles.optionText}>Selesai</Text>
                <MaterialIcons 
                  name={selectedStatus.includes('Selesai') ? 'check-box' : 'check-box-outline-blank'} 
                  size={20} 
                  color={selectedStatus.includes('Selesai') ? '#1F72F1' : '#8E8E93'} 
                />
              </TouchableOpacity>
            </View>
            
            <View style={styles.buttonContainer}>
              <TouchableOpacity 
                style={styles.clearButton} 
                onPress={() => {
                  setSelectedStatus([]);
                  setSortBy('');
                }}
              >
                <Text style={styles.clearText}>Hapus</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={[styles.applyButton, !hasFilters && styles.disabledButton]} 
                onPress={() => setShowFilter(false)}
                disabled={!hasFilters}
              >
                <Text style={[styles.applyText, !hasFilters && styles.disabledText]}>Terapkan</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    paddingHorizontal: 16,
  },
  title: {
    fontSize: 18,
    fontFamily: Fonts.medium,
    color: 'black',
    marginBottom: 16,
    textAlign: 'center',
  },
  searchFilterContainer: {
    flexDirection: 'row',
    gap: 12,
    alignItems: 'center',
  },
  searchContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    borderRadius: 6,
    paddingHorizontal: 12,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    paddingVertical: 10,
    fontFamily: Fonts.regular,
    fontSize: 14,
  },
  filterButton: {
    backgroundColor: '#1F72F1',
    borderRadius: 6,
    padding: 10,
  },
  listContainer: {
    flex: 1,
    marginTop: 16,
    marginBottom: Platform.OS === 'ios' ? 50 : 0,
  },
  card: {
    // backgroundColor: '#fff',
    padding: 18,
    marginBottom: 18,
    borderRadius: 14,
    borderLeftWidth: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  cardId: {
    fontFamily: Fonts.semiBold,
    fontSize: 12,
    color: '#555555',
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  statusText: {
    fontFamily: Fonts.semiBold,
    fontSize: 12,
    color: '#333',
  },
  cardTitle: {
    fontFamily: Fonts.semiBold,
    fontSize: 14,
    color: 'black',
    marginBottom: 4,
  },
  cardDateTime: {
    fontFamily: Fonts.regular,
    fontSize: 12,
    color: '#666',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  bottomSheet: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 0,
    maxHeight: '70%',
  },
  sheetHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  sheetTitle: {
    fontSize: 18,
    fontFamily: Fonts.semiBold,
    color: '#333',
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontFamily: Fonts.medium,
    color: '#333',
    marginBottom: 12,
  },
  sortOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    gap: 12,
  },
  statusOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    gap: 12,
  },
  optionText: {
    flex: 1,
    fontSize: 14,
    fontFamily: Fonts.regular,
    color: '#333',
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: 12,
    // paddingHorizontal: 24,
    paddingBottom: 42,
  },
  clearButton: {
    flex: 1,
    backgroundColor: '#E3F8F6',
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
  },
  clearText: {
    color: '#52B5AB',
    fontSize: 14,
    fontFamily: Fonts.medium,
  },
  applyButton: {
    flex: 1,
    backgroundColor: '#52B5AB',
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
  },
  applyText: {
    color: '#fff',
    fontSize: 14,
    fontFamily: Fonts.medium,
  },
  disabledButton: {
    backgroundColor: '#E5E5E5',
  },
  disabledText: {
    color: '#999',
  },
});