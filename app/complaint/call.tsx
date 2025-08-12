import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { router, Stack } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
export default function CallScreen() {
  const [callDuration, setCallDuration] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCallDuration((prev) => prev + 1);
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const handleEndCall = () => {
    router.push("/complaint/chat?callEnded=true");
  };

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <View style={styles.container}>
      <View style={styles.callInterface}>
        <Text style={styles.callerName}>BNI Agent</Text>
        <Text style={styles.callStatus}>Sedang Terhubung</Text>
        <Text style={styles.callDuration}>{formatDuration(callDuration)}</Text>
        
        <MaterialIcons name="account-circle" size={120} color="#666" />

        <View style={styles.callControls}>
          <TouchableOpacity style={styles.muteButton}>
            <MaterialIcons name="mic" size={30} color="#FFF" />
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.endCallButton} onPress={handleEndCall}>
            <MaterialIcons name="call-end" size={30} color="#FFF" />
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.speakerButton}>
            <MaterialIcons name="volume-up" size={30} color="#FFF" />
          </TouchableOpacity>
        </View>
      </View>
    </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  callInterface: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 40,
  },
  callerName: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#333",
    marginTop: 20,
    fontFamily: "Poppins",
  },
  callStatus: {
    fontSize: 16,
    color: "#666",
    marginTop: 8,
    fontFamily: "Poppins",
  },
  callDuration: {
    fontSize: 18,
    color: "#333",
    marginTop: 20,
    fontFamily: "Poppins",
  },
  callControls: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 60,
    gap: 40,
  },
  muteButton: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "#555",
    justifyContent: "center",
    alignItems: "center",
  },
  endCallButton: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: "#F44336",
    justifyContent: "center",
    alignItems: "center",
  },
  speakerButton: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "#555",
    justifyContent: "center",
    alignItems: "center",
  },
});