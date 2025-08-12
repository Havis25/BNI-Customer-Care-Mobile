import { Fonts } from "@/constants/Fonts";
import { MaterialIcons } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useState } from "react";
import {
  Alert,
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";


export default function LoginScreen() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const handleLogin = () => {
    if (username === "admin" && password === "password") {
      router.replace("/(tabs)");
    } else {
      Alert.alert("Error", "Username atau password salah");
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView 
        style={styles.keyboardView}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <ScrollView 
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.content}>
        {/* Logo Section */}
        <View style={styles.logoSection}>
          <View style={styles.logoContainer}>
            <Image
              source={require("@/assets/images/logo_only.png")}
              style={styles.logo}
              resizeMode="contain"
            />
          </View>
          <Text style={styles.title}>Welcome to B-Care</Text>
          <Text style={styles.subtitle}>
            Please enter your email and password to access your account.
          </Text>
        </View>

        {/* Form Section */}
        <View style={styles.formSection}>
          {/* Username Field */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Email</Text>
            <View style={styles.inputWrapper}>
              <MaterialIcons
                name="email"
                size={20}
                color="#6b7280"
                style={styles.inputIcon}
              />
              <TextInput
                style={styles.input}
                placeholder="Masukkan email kamu"
                placeholderTextColor="#9ca3af"
                value={username}
                onChangeText={setUsername}
                keyboardType="email-address"
                autoCapitalize="none"
              />
            </View>
          </View>

          {/* Password Field */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Password</Text>
            <View style={styles.inputWrapper}>
              <MaterialIcons
                name="lock"
                size={20}
                color="#6b7280"
                style={styles.inputIcon}
              />
              <TextInput
                style={styles.input}
                placeholder="Masukkan password kamu"
                placeholderTextColor="#9ca3af"
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPassword}
              />
              <TouchableOpacity
                onPress={() => setShowPassword(!showPassword)}
                style={styles.toggleIcon}
              >
                <MaterialIcons
                  name={showPassword ? "visibility" : "visibility-off"}
                  size={20}
                  color="#6b7280"
                />
              </TouchableOpacity>
            </View>
          </View>

          {/* Login Button */}
          <TouchableOpacity style={styles.loginButton} onPress={handleLogin}>
            <Text style={styles.loginText}>Login</Text>
          </TouchableOpacity>
        </View>
        <Text style={styles.disclaimer}>
          By using this service, you agree to{" "}
          <Text style={styles.linkTextBold}>B-Care Terms of Service</Text> and{" "}
          <Text style={styles.linkTextBold}>Privacy Policy</Text>.
        </Text>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8f9fa",
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    justifyContent: "center",
    minHeight: "100%",
  },
  logoSection: {
    alignItems: "center",
    marginBottom: 24,
  },
  logoContainer: {
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 12,
  },
  logo: {
    width: 70,
    height: 70,
  },
  title: {
    fontSize: 24,
    fontFamily: Fonts.bold,
    color: "#1f2937",
    marginBottom: 4,
    textAlign: "center",
  },
  subtitle: {
    fontSize: 14,
    fontFamily: Fonts.regular,
    color: "#6b7280",
    textAlign: "center",
  },
  formSection: {
    paddingBottom: 40,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontFamily: Fonts.medium,
    color: "#374151",
    marginBottom: 8,
  },
  inputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#d1d5db",
    borderRadius: 5,
    backgroundColor: "white",
    paddingHorizontal: 12,
  },
  inputIcon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    fontSize: 14,
    fontFamily: Fonts.regular,
    paddingVertical: 14,
    color: "#374151",
  },
  toggleIcon: {
    padding: 4,
  },
  loginButton: {
    backgroundColor: "#52B5AB",
    paddingVertical: 14,
    borderRadius: 5,
    alignItems: "center",
  },
  loginText: {
    color: "white",
    fontSize: 14,
    fontFamily: Fonts.semiBold,
  },
  disclaimer: {
    position: "absolute",
    paddingHorizontal: 24,
    bottom: 0,
    left: 0,
    right: 0,
    textAlign: "center",
    fontSize: 12,
    fontFamily: Fonts.regular,
    color: "#6b7280",
  },
  linkTextBold: {
    color: "#3b82f6",
    fontFamily: Fonts.semiBold,
  },
});
