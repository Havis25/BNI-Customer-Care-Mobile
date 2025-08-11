import { ThemedText } from '@/components/ThemedText';
import React from 'react';
import { Alert, Image, Linking, StyleSheet, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function ProfileScreen() {
  const handlePress = async (url: any) => {
    try {
      const supported = await Linking.canOpenURL(url);
      if (supported) {
        await Linking.openURL(url);
      } else {
        Alert.alert("Error", `Tidak bisa membuka link: ${url}`);
      }
    } catch (error) {
      Alert.alert("Error", "Terjadi kesalahan saat membuka link");
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>

        <View style={styles.userCard}>

          <View style={styles.avatarContainer}>
            <Image
              source={require('../../assets/images/icon_profile.png')}
              style={styles.avatar}
              resizeMode="cover"
            />
          </View>

          <View style={styles.userInfo}>
            <ThemedText style={styles.userName}>Havis Aprinaldi</ThemedText>
            <ThemedText style={styles.userEmail}>user@gmail.com</ThemedText>
          </View>

        </View>

        <View style={styles.detailCard}>
          <ThemedText style={styles.cardTitle}>Informasi Pengguna</ThemedText>
          
          <View style={styles.detailItem}>
            <View style={styles.detailContent}>
              <ThemedText style={styles.detailLabel}>Nomor Rekening</ThemedText>
              <ThemedText style={styles.detailValue}>512372891238</ThemedText>
            </View>
          </View>
          
          <View style={styles.detailItem}>
            <View style={styles.detailContent}>
              <ThemedText style={styles.detailLabel}>No. Handphone</ThemedText>
              <ThemedText style={styles.detailValue}>082137987456</ThemedText>
            </View>
          </View>
          
          <View style={styles.detailItem}>
            <View style={styles.detailContent}>
              <ThemedText style={styles.detailLabel}>Alamat</ThemedText>
              <ThemedText style={styles.detailValue}>Jalan Melati Raya No. 12, Kel. Sukamaju, Kec. Setiabudi, Jakarta Selatan, DKI Jakarta 12930</ThemedText>
            </View>
          </View>
        </View>
          
          <View style={styles.socialGrid}>
            <TouchableOpacity 
            onPress={() => handlePress('https://api.whatsapp.com/send?phone=628118611946')}>
              <Image
                source={require('../../assets/images/icon_whatsapp.png')}
                style={styles.socialIcon}
                resizeMode="contain"
                
              />
            </TouchableOpacity>
            
            <TouchableOpacity 
            onPress={() => handlePress('mailto:bnicall@bni.co.id')}>
              <Image
                source={require('../../assets/images/icon_email.png')}
                style={styles.socialIcon}
                resizeMode="contain"
                
              />
            </TouchableOpacity>
            
            <TouchableOpacity 
            onPress={() => handlePress('https://www.instagram.com/bni46')}>

              <Image
                source={require('../../assets/images/icon_instagram.png')}
                style={styles.socialIcon}
                resizeMode="contain"
              />
            </TouchableOpacity>
          </View>
      

    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  container: {
    flex: 1,
    backgroundColor: '#FFF8F0',
  },
  header: {
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#FF6B35',
  },
  headerTitle: {
    color: 'white',
    fontSize: 20,
    fontWeight: 'bold',
  },
  // Card 1: User Info
  userCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    margin: 16,
    padding: 20,
    borderRadius: 10,
    shadowOpacity: 0.1,
    shadowRadius: 8,
    columnGap: 30,
    marginBottom: 24,
    marginTop: 40,
  },
  avatarContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    overflow: 'hidden',
  },
  avatar: {
    width: '100%',
    height: '100%',
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 14,
    color: '#666',
  },
  // Card 2: Profile Details
  detailCard: {
    backgroundColor: 'white',
    margin: 16,
    marginTop: 0,
    padding: 20,
    borderRadius: 15,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 15,
  },
  detailIcon: {
    fontSize: 20,
    marginRight: 12,
    marginTop: 2,
  },
  detailContent: {
    flex: 1,
  },
  detailLabel: {
    fontSize: 14,
    color: '#black',
    marginBottom: 2,
    fontWeight: 'bold',
  },
  detailValue: {
    fontSize: 14,
    color: '#black',
    fontWeight: 'normal',
  },
  // Card 3: Social Media
  socialGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
  },
  socialIcon: {
    width: 50,
    height: 50,
    marginBottom: 5,
    margin: 10,
  },
});