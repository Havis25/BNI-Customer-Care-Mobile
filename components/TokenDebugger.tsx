import React from "react";
import { View, Text, TouchableOpacity, StyleSheet, Alert } from "react-native";
import { testTokenRefreshEndpoint, testCurrentTokenStatus } from "@/utils/testTokenRefresh";
import { checkCurrentTokenExpiry } from "@/utils/tokenUtils";

export const TokenDebugger = () => {
  const runTests = async () => {
    console.log("🚀 Starting token diagnostics...");
    
    await testCurrentTokenStatus();
    await checkCurrentTokenExpiry();
    const refreshWorks = await testTokenRefreshEndpoint();
    
    Alert.alert(
      "Token Test Results", 
      `Refresh endpoint ${refreshWorks ? "✅ Working" : "❌ Failed"}\n\nCheck console for details`
    );
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.button} onPress={runTests}>
        <Text style={styles.buttonText}>🧪 Test Token Refresh</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 10,
    backgroundColor: "#f0f0f0",
    margin: 10,
    borderRadius: 8,
  },
  button: {
    backgroundColor: "#007AFF",
    padding: 12,
    borderRadius: 6,
    alignItems: "center",
  },
  buttonText: {
    color: "white",
    fontWeight: "bold",
  },
});