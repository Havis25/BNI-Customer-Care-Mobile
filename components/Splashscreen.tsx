import React from "react";
import { Image, StyleSheet, View, StatusBar } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function Splashscreen() {
  return (
    <View style={styles.container}>
      <StatusBar backgroundColor="#E0EE59" barStyle="dark-content" />
      <View style={styles.content}>
        <Image
          source={require("../assets/images/log-bcare-copy.png")}
          style={styles.logo}
          resizeMode="contain"
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#E0EE59",
  },
  content: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  logo: {
    width: 200,
    height: 200,
  },
});