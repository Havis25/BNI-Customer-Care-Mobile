import { ThemedText } from "@/components/ThemedText";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import React, { useState, useEffect } from "react";
import { StyleSheet, View } from "react-native";
import { Fonts } from "@/constants/Fonts";
import AsyncStorage from "@react-native-async-storage/async-storage";

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
      <View style={styles.profileContainer}>
        <MaterialIcons name="account-circle" size={55} color="#333" />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  welcomeContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    // marginBottom: 25,
    paddingHorizontal: 5,
  },
  textContainer: {
    flex: 1,
  },
  greeting: {
    fontSize: 16,
    fontFamily: Fonts.bold,
    color: "black",
    // marginBottom: 4,
  },
  question: {
    fontSize: 14,
    color: "black",
    fontFamily: Fonts.medium,
  },
  profileContainer: {
    marginLeft: 15,
  },
});
