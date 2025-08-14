import { Fonts } from '@/constants/Fonts';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';

interface Notification {
  id: string;
  title: string;
  description: string;
  timeAgo: string;
  iconName: string;
  iconColor: string;
  read: boolean;
  category: string;
}

const dummyNotifications: Notification[] = [
  {
    id: "1",
    title: "Laporan Diterima",
    description: "Laporan keluhan ATM tidak berfungsi telah diterima sistem.",
    timeAgo: "5 menit lalu",
    iconName: "mail",
    iconColor: "#2196F3",
    read: false,
    category: "laporan",
  },
  {
    id: "2",
    title: "Laporan Divalidasi",
    description: "Tim customer service sedang memvalidasi laporan Anda.",
    timeAgo: "15 menit lalu",
    iconName: "document-text",
    iconColor: "#FF9800",
    read: false,
    category: "laporan",
  },
  {
    id: "3",
    title: "Laporan Diterima",
    description: "Laporan masalah mobile banking telah kami terima.",
    timeAgo: "1 jam lalu",
    iconName: "mail",
    iconColor: "#2196F3",
    read: false,
    category: "laporan",
  },
  {
    id: "4",
    title: "Laporan Diproses",
    description: "Laporan kartu kredit bermasalah sedang diproses tim teknis.",
    timeAgo: "2 jam lalu",
    iconName: "time",
    iconColor: "#FF6600",
    read: true,
    category: "laporan",
  },
  {
    id: "5",
    title: "Laporan Divalidasi",
    description: "Validasi data untuk laporan transaksi gagal sedang berlangsung.",
    timeAgo: "4 jam lalu",
    iconName: "document-text",
    iconColor: "#FF9800",
    read: false,
    category: "laporan",
  },
  {
    id: "6",
    title: "Laporan Selesai",
    description: "Masalah internet banking telah berhasil diperbaiki.",
    timeAgo: "6 jam lalu",
    iconName: "checkmark-circle",
    iconColor: "#4CAF50",
    read: true,
    category: "laporan",
  },
  {
    id: "7",
    title: "Laporan Diproses",
    description: "Tim IT sedang menangani laporan error aplikasi mobile.",
    timeAgo: "8 jam lalu",
    iconName: "time",
    iconColor: "#FF6600",
    read: true,
    category: "laporan",
  },
  {
    id: "8",
    title: "Laporan Diterima",
    description: "Laporan keluhan biaya admin tidak sesuai telah diterima.",
    timeAgo: "12 jam lalu",
    iconName: "mail",
    iconColor: "#2196F3",
    read: false,
    category: "laporan",
  },
  {
    id: "9",
    title: "Laporan Selesai",
    description: "Pengembalian saldo yang terpotong salah telah selesai diproses.",
    timeAgo: "1 hari lalu",
    iconName: "checkmark-circle",
    iconColor: "#4CAF50",
    read: true,
    category: "laporan",
  },
  {
    id: "10",
    title: "Laporan Divalidasi",
    description: "Validasi laporan kartu hilang sedang dalam proses verifikasi.",
    timeAgo: "1 hari lalu",
    iconName: "document-text",
    iconColor: "#FF9800",
    read: true,
    category: "laporan",
  },
  {
    id: "11",
    title: "Laporan Selesai",
    description: "Pemblokiran kartu yang hilang telah berhasil dilakukan.",
    timeAgo: "2 hari lalu",
    iconName: "checkmark-circle",
    iconColor: "#4CAF50",
    read: true,
    category: "laporan",
  },
  {
    id: "12",
    title: "Laporan Diproses",
    description: "Pengajuan buku tabungan baru sedang dalam tahap pencetakan.",
    timeAgo: "3 hari lalu",
    iconName: "time",
    iconColor: "#FF6600",
    read: true,
    category: "laporan",
  },
];

export default function NotificationScreen() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timeout = setTimeout(() => {
      setNotifications(dummyNotifications);
      setLoading(false);
    }, 1500);

    return () => clearTimeout(timeout);
  }, []);

  const markAsRead = (id: string) => {
    setNotifications(prev => 
      prev.map(notif => 
        notif.id === id ? { ...notif, read: true } : notif
      )
    );
  };

  const markAllAsRead = () => {
    setNotifications(prev => 
      prev.map(notif => ({ ...notif, read: true }))
    );
  };

  const renderItem = ({ item, index }: { item: Notification, index: number }) => (
    <TouchableOpacity 
      style={[
        styles.card, 
        !item.read && styles.unreadCard,
        index === 0 && styles.firstCard
      ]}
      onPress={() => markAsRead(item.id)}
    >
      <View style={styles.cardContent}>
        <View style={[styles.iconContainer, { backgroundColor: `${item.iconColor}20` }]}>
          <Ionicons
            name={item.iconName as any}
            size={20}
            color={item.iconColor}
          />
        </View>
        <View style={styles.textContainer}>
          <View style={styles.titleRow}>
            <Text style={[styles.title, !item.read && styles.unreadTitle]}>
              {item.title}
            </Text>
            {!item.read && <View style={styles.unreadDot} />}
          </View>
          <Text style={styles.description}>{item.description}</Text>
          <Text style={styles.time}>{item.timeAgo}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <LinearGradient
          colors={['#DEEF5A', '#FCFDEE']}
          locations={[0.23, 0.37]}
          style={StyleSheet.absoluteFill}
        />
        <View style={styles.loaderContainer}>
          <ActivityIndicator size="large" color="#FF6600" />
          <Text style={styles.loadingText}>Memuat notifikasi...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <LinearGradient
        colors={['#DEEF5A', '#FCFDEE']}
        locations={[0.23, 0.37]}
        style={StyleSheet.absoluteFill}
      />
      
      <View style={styles.headerSection}>
        <View style={styles.headerRow}>
          <Text style={styles.header}>Notifikasi</Text>
          {notifications.some(n => !n.read) && (
            <TouchableOpacity onPress={markAllAsRead} style={styles.markAllButton}>
              <Text style={styles.markAllText}>Tandai Semua</Text>
            </TouchableOpacity>
          )}
        </View>
        <View style={styles.headerStats}>
          <Text style={styles.headerStatsText}>
            {notifications.filter(n => !n.read).length} belum dibaca
          </Text>
        </View>
      </View>

      <View style={styles.container}>
        <View style={styles.listWrapper}>
          <FlatList
            data={notifications}
            keyExtractor={(item) => item.id}
            renderItem={({ item, index }) => renderItem({ item, index })}
            contentContainerStyle={styles.listContainer}
            showsVerticalScrollIndicator={false}
          />
        </View>
      </View>
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
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  markAllButton: {
    backgroundColor: '#FF6600',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  markAllText: {
    fontSize: 12,
    fontFamily: Fonts.semiBold,
    color: 'white',
  },
  header: {
    fontSize: 24,
    fontFamily: Fonts.bold,
    color: 'black',
    marginBottom: 8,
  },
  headerStats: {
    backgroundColor: 'rgba(255, 102, 0, 0.1)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    alignSelf: 'flex-start',
  },
  headerStatsText: {
    fontSize: 12,
    fontFamily: Fonts.medium,
    color: '#FF6600',
  },
  container: {
    flex: 1,
    paddingHorizontal: 16,
  },
  listWrapper: {
    backgroundColor: 'white',
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    overflow: 'hidden',
  },
  listContainer: {
    paddingBottom: 20,
  },
  card: {
    backgroundColor: 'white',
    marginBottom: 1,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  unreadCard: {
    backgroundColor: '#fff8f0',
  },
  firstCard: {
    // Radius handled by wrapper
  },
  cardContent: {
    flexDirection: 'row',
    padding: 12,
    alignItems: 'center',
  },
  iconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  textContainer: {
    flex: 1,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 2,
  },
  title: {
    fontSize: 14,
    fontFamily: Fonts.semiBold,
    color: '#333',
    flex: 1,
  },
  unreadTitle: {
    color: '#000',
    fontFamily: Fonts.bold,
  },
  unreadDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#FF6600',
    marginLeft: 8,
  },
  description: {
    fontSize: 12,
    fontFamily: Fonts.medium,
    color: '#666',
    lineHeight: 16,
    marginBottom: 4,
  },
  time: {
    fontSize: 11,
    fontFamily: Fonts.medium,
    color: '#999',
  },
  loaderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 14,
    fontFamily: Fonts.medium,
    color: '#666',
    marginTop: 12,
  },
});
