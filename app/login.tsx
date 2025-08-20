import { Fonts } from "@/constants/Fonts";
import { useAuth } from "@/hooks/useAuth";
import { MaterialIcons } from "@expo/vector-icons";
import React, { useMemo, useState } from "react";
import {
  ActivityIndicator,
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
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const { login, isLoading } = useAuth();

  const isValidEmail = (val: string) => /\S+@\S+\.\S+/.test(val);

  const canSubmit = useMemo(() => {
    return isValidEmail(email.trim()) && password.trim().length > 0 && !isLoading;
  }, [email, password, isLoading]);

  const handleLogin = () => {
    if (!canSubmit) return;
    login(email.trim(), password);
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
              <Image
                source={require("@/assets/images/logo_only.png")}
                style={styles.logo}
                resizeMode="contain"
              />
              <Text style={styles.title}>Welcome to B-Care</Text>
              <Text style={styles.subtitle}>
                Please enter your email and password to access your account.
              </Text>
            </View>

            {/* Form Section */}
            <View style={styles.formSection}>
              {/* Email Field */}
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
                    value={email}
                    onChangeText={setEmail}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    autoCorrect={false}
                    textContentType="emailAddress"
                    returnKeyType="next"
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
                    autoCapitalize="none"
                    autoCorrect={false}
                    textContentType="password"
                    returnKeyType="go"
                    onSubmitEditing={handleLogin}
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
              <TouchableOpacity
                style={[
                  styles.loginButton,
                  (!canSubmit || isLoading) && styles.loginButtonDisabled,
                ]}
                onPress={handleLogin}
                disabled={!canSubmit || isLoading}
              >
                {isLoading ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={styles.loginText}>Login</Text>
                )}
              </TouchableOpacity>
            </View>

            <Text style={styles.disclaimer}>
              By using this service, you agree to{" "}
              <Text style={styles.linkTextBold}>B-Care Terms of Service</Text>{" "}
              and <Text style={styles.linkTextBold}>Privacy Policy</Text>.
            </Text>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f8f9fa" },
  keyboardView: { flex: 1 },
  scrollContent: { flexGrow: 1 },
  content: { flex: 1, paddingHorizontal: 24, justifyContent: "center", minHeight: "100%" },
  logoSection: { alignItems: "center", marginBottom: 24 },
  logo: { width: 70, height: 70, marginBottom: 12 },
  title: { fontSize: 24, fontFamily: Fonts.bold, color: "#1f2937", marginBottom: 4, textAlign: "center" },
  subtitle: { fontSize: 14, fontFamily: Fonts.regular, color: "#6b7280", textAlign: "center" },
  formSection: { paddingBottom: 40 },
  inputGroup: { marginBottom: 20 },
  label: { fontSize: 14, fontFamily: Fonts.medium, color: "#374151", marginBottom: 8 },
  inputWrapper: { flexDirection: "row", alignItems: "center", borderWidth: 1, borderColor: "#d1d5db", borderRadius: 5, backgroundColor: "white", paddingHorizontal: 12 },
  inputIcon: { marginRight: 12 },
  input: { flex: 1, fontSize: 14, fontFamily: Fonts.regular, paddingVertical: 14, color: "#374151" },
  toggleIcon: { padding: 4 },
  loginButton: { backgroundColor: "#52B5AB", paddingVertical: 14, borderRadius: 5, alignItems: "center" },
  loginButtonDisabled: { backgroundColor: "#A0A0A0" },
  loginText: { color: "white", fontSize: 14, fontFamily: Fonts.semiBold },
  disclaimer: { position: "absolute", paddingHorizontal: 24, bottom: 0, left: 0, right: 0, textAlign: "center", fontSize: 12, fontFamily: Fonts.regular, color: "#6b7280" },
  linkTextBold: { color: "#3b82f6", fontFamily: Fonts.semiBold },
});
