import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  SafeAreaView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';

const dummyNotifications = [
  {
    id: '1',
    title: 'Pengaduan Diterima',
    description: 'Pengaduan Anda telah diterima oleh sistem dan akan segera diproses.',
    timeAgo: '2 menit lalu',
    iconName: 'email-receive',
    iconColor: '#007bff',
    read: false,
    category: 'proses',
  },
  {
    id: '2',
    title: 'Validasi Data Pengaduan',
    description: 'Tim kami sedang melakukan validasi data pengaduan Anda.',
    timeAgo: '10 menit lalu',
    iconName: 'clipboard-check',
    iconColor: '#f0ad4e',
    read: false,
    category: 'proses',
  },
  {
    id: '3',
    title: 'Pengaduan Diproses',
    description: 'Pengaduan Anda sedang dalam tahap pemrosesan oleh tim terkait.',
    timeAgo: '1 jam lalu',
    iconName: 'progress-clock',
    iconColor: '#17a2b8',
    read: true,
    category: 'proses',
  },
  {
    id: '4',
    title: 'Pengaduan Selesai',
    description: 'Pengaduan Anda telah selesai diproses. Terima kasih atas kesabaran Anda.',
    timeAgo: '1 hari lalu',
    iconName: 'check-circle',
    iconColor: '#28a745',
    read: true,
    category: 'proses',
  },
  {
    id: '5',
    title: 'Update Informasi',
    description: 'Ada update terbaru mengenai kebijakan layanan kami.',
    timeAgo: '2 hari lalu',
    iconName: 'information',
    iconColor: '#007bff',
    read: true,
    category: 'terbaru',
  },
  {
    id: '6',
    title: 'Pemberitahuan Umum',
    description: 'Jangan lupa cek fitur baru di aplikasi kami.',
    timeAgo: '3 hari lalu',
    iconName: 'bell',
    iconColor: '#6c757d',
    read: true,
    category: 'terbaru',
  },
];

export default function NotificationScreen() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timeout = setTimeout(() => {
      setNotifications(dummyNotifications);
      setLoading(false);
    }, 1500);

    return () => clearTimeout(timeout);
  }, []);

  const renderItem = ({ item }) => (
    <View style={styles.card}>
      <View style={styles.cardLeft}>
        <MaterialCommunityIcons
          name={item.iconName}
          size={30}
          color={item.iconColor}
          style={{ marginRight: 12 }}
        />
        <View style={{ flex: 1 }}>
          <Text style={[styles.title, !item.read && { fontWeight: 'bold' }]}>
            {item.title}
          </Text>
          {item.description ? (
            <Text style={styles.description}>{item.description}</Text>
          ) : null}
        </View>
      </View>
      <Text style={styles.time}>{item.timeAgo}</Text>
    </View>
  );

  if (loading) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.loaderContainer}>
          <ActivityIndicator size="large" color="#FF6B35" />
          <Text>Memuat notifikasi...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Notifications</Text>
      </View>

      <FlatList
        data={notifications}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={{ paddingVertical: 12 }}
        showsVerticalScrollIndicator={false}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#f9f9f9',
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
    paddingHorizontal: 8,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#111',
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 1 },
    shadowRadius: 4,
    elevation: 2,
  },
  cardLeft: {
    flexDirection: 'row',
    flex: 1,
  },
  title: {
    fontWeight: 'normal',
    fontSize: 16,
    marginBottom: 4,
    color: '#111',
  },
  description: {
    fontSize: 14,
    color: '#555',
    lineHeight: 20,
  },
  time: {
    fontSize: 12,
    color: '#999',
    marginLeft: 8,
    alignSelf: 'flex-start',
  },
  loaderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
