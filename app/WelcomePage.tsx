import React from 'react';
import {
    Image,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Colors } from '../constants/Colors';
import { router } from 'expo-router';

export default function WelcomePage() {

  return (
    <SafeAreaView style={styles.container}>

        <View style={styles.logoWrapper}>
            <Image
                source={require('../assets/images/Logo.png')}
                style={styles.logo}
                resizeMode="contain"
            />
        </View>

        <View style={styles.headerContainer}>
            <Image
                source={require('../assets/images/welcome_pic.png')}
                style={styles.illustration}
                resizeMode="contain"
            />
        </View>

        <View style={styles.textSection}>
            <Text style={styles.title}>
                Your Customer Care & Support App
            </Text>
            <Text style={styles.subtitle}>
                Get help anytime, track your reports, and connect with our support team easily.
                </Text>
        </View>

        <TouchableOpacity
          style={styles.startButton}
          onPress={() => router.push('/login')} 
        >
          <Text style={styles.startButtonText}>Start Now</Text>
        </TouchableOpacity>

    </SafeAreaView>
  )
}


const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Colors.light.background,
        paddingTop: 20,
        paddingHorizontal: 20,
    },

    logoWrapper: {
        width: '100%',
        alignItems: 'flex-start', 
        marginBottom: 10,
        zIndex: 10,           
        position: 'relative',
    },
    
    logo: {
        width: 100,
        height: 100,
        marginTop: -30,
    },
    
    headerContainer: {
        width: '100%',
        height: 300,               
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: -100,
        zIndex: 1,           
        position: 'relative',
    },

    illustration: {
      width: "180%",
      height: "180%",
    },

    textSection: {
      marginHorizontal: 24,
      marginTop: 171,
      alignItems: "center",
    },

    title: {
      fontSize: 26,
      fontWeight: "700",
      color: Colors.light.darkGreen,
      textAlign: "center",
      marginBottom: 10,
    },

    subtitle: {
      fontSize: 14,
      color: Colors.light.mediumGreen,
      textAlign: "center",
      lineHeight: 22
    },

    startButton: {
        backgroundColor: Colors.light.primaryGreen,
        paddingVertical: 12,
        marginTop: 100,
        marginHorizontal: 24,
        alignItems: 'center',
        justifyContent: 'center',
    },

    startButtonText: {
      color: Colors.light.white,
      fontSize: 14,
      fontWeight: "600",
      textAlign: "center",
    }
});