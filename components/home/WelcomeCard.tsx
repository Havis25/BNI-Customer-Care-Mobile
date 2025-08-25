import { ThemedText } from "@/components/ThemedText";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import React, { useState, useEffect } from "react";
import { StyleSheet, View, TouchableOpacity } from "react-native";
import { Fonts } from "@/constants/Fonts";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { router } from "expo-router";
import { wp, hp, rf, deviceType } from "@/utils/responsive";

export default function WelcomeCard() {
  const [userName, setUserName] = useState("User");

  useEffect(() => {
    const getUserName = async () => {
      try {
        const customerData = await AsyncStorage.getItem("customer");
        if (customerData) {
          const customer = JSON.parse(customerData);
          const fullName = customer.full_name || "User";
          const firstName = fullName.split(" ")[0];
          setUserName(firstName);
        }
      } catch (error) {
        console.error("Error getting user name:", error);
      }
    };

    getUserName();
  }, []);

  return (
    <View style={styles.welcomeContainer}>
      <View style={styles.textContainer}>
        <ThemedText style={styles.greeting}>Halo {userName}!</ThemedText>
        <ThemedText style={styles.question}>
          Ada yang bisa kami bantu?
        </ThemedText>
      </View>
      <TouchableOpacity 
        style={styles.profileContainer}
        onPress={() => router.push('/(tabs)/profile')}
      >
        <MaterialIcons 
          name="account-circle" 
          size={deviceType.isSmall ? 45 : deviceType.isTablet ? 65 : 55} 
          color="#333" 
        />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  welcomeContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: wp(1.3), // Responsive padding
  },
  textContainer: {
    flex: 1,
  },
  greeting: {
    fontSize: rf(16), // Responsive font size
    fontFamily: Fonts.bold,
    color: "black",
  },
  question: {
    fontSize: rf(14), // Responsive font size
    color: "black",
    fontFamily: Fonts.medium,
  },
  profileContainer: {
    marginLeft: wp(4), // Responsive margin
  },
});
