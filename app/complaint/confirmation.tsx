import BottomSheet from "@/components/modals/BottomSheet";
import { useAuth } from "@/hooks/useAuth";
import { useChannelsAndCategories } from "@/hooks/useChannelsAndCategories";
import { useUser } from "@/hooks/useUser";
import { api } from "@/lib/api";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Picker } from "@react-native-picker/picker";
import { router } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  ActionSheetIOS,
  Alert,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from "react-native";
import {
  SafeAreaView,
  useSafeAreaInsets,
} from "react-native-safe-area-context";

const API_URL = "/v1/tickets";
const HEADER_HEIGHT = 56;

type TicketPayload = {
  description: string;
  issue_channel_id: number;
  complaint_id: number;
};



/** SelectField: iOS pakai ActionSheet, Android/Web pakai Picker dropdown */
function SelectField({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: string;
  options: string[];
  onChange: (v: string) => void;
}) {
  if (Platform.OS === "ios") {
    const openSheet = () => {
      ActionSheetIOS.showActionSheetWithOptions(
        {
          title: label,
          options: [...options, "Batal"],
          cancelButtonIndex: options.length,
        },
        (idx) => {
          if (idx != null && idx >= 0 && idx < options.length)
            onChange(options[idx]);
        }
      );
    };
    return (
      <View style={styles.fieldContainer}>
        <Text style={styles.label}>{label}</Text>
        <Pressable
          style={[styles.textInput, styles.selectInput]}
          onPress={openSheet}
        >
          <Text style={styles.selectText}>{value}</Text>
          <MaterialIcons name="arrow-drop-down" size={24} color="#666" />
        </Pressable>
      </View>
    );
  }

  return (
    <View style={styles.fieldContainer}>
      <Text style={styles.label}>{label}</Text>
      <View style={styles.pickerWrapper}>
        <Picker
          selectedValue={value}
          onValueChange={(v) => onChange(String(v))}
          dropdownIconColor="#666"
          mode="dropdown"
        >
          {options.map((opt) => (
            <Picker.Item key={opt} label={opt} value={opt} />
          ))}
        </Picker>
      </View>
    </View>
  );
}

export default function ConfirmationScreen() {
  const insets = useSafeAreaInsets();
  const { user, selectAccount, account_number, accounts } = useUser();
  const { token, isAuthenticated } = useAuth();
  const { channels, categories, getFilteredCategories, isLoading: dataLoading, error: dataError } = useChannelsAndCategories();

  const full_nameauto = (user?.full_name || "").trim() || "User Complain";

  // Editable
  const [channel, setChannel] = useState<any>(null);
  const [category, setCategory] = useState<any>(null);
  const [description, setdescription] = useState<string>("");

  // UI
  const [isChecked, setIsChecked] = useState(false);
  const [showBottomSheet, setShowBottomSheet] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // ====== PENTING: tinggi footer aktual agar ScrollView bisa scroll di atas keyboard ======
  const [footerHeight, setFooterHeight] = useState(120); // perkiraan awal; nanti diganti oleh onLayout

  // Get filtered categories based on selected channel
  const filteredCategories = getFilteredCategories(channel);

  // Update state when API data loads
  useEffect(() => {
    if (channels.length > 0 && !channel) {
      setChannel(channels[0]);
    }
  }, [channels]);

  useEffect(() => {
    if (categories.length > 0 && !category) {
      setCategory(categories[0]);
    }
  }, [categories]);

  // Update category when channel changes
  useEffect(() => {
    if (channel && filteredCategories.length > 0) {
      // If current category is not in filtered list, select first filtered category
      if (!filteredCategories.find(c => c.complaint_id === category?.complaint_id)) {
        setCategory(filteredCategories[0]);
      }
    }
  }, [channel, filteredCategories, category?.complaint_id]);

  const isValid =
    isChecked && 
    !!channel && 
    !!category && 
    description.trim().length >= 8 && 
    !dataLoading && 
    channels.length > 0 && 
    filteredCategories.length > 0 &&
    channel?.channel_id &&
    category?.complaint_id;

  const payload: TicketPayload = {
    description: description.trim(),
    issue_channel_id: channel?.channel_id || 0,
    complaint_id: category?.complaint_id || 0,
  };

  const handleSubmit = async () => {
    if (!isValid || submitting) return;
    try {
      setSubmitting(true);
      
      // Cek autentikasi
      if (!isAuthenticated || !token) {
        Alert.alert("Error", "Sesi telah berakhir. Silakan login kembali.");
        router.replace("/login");
        return;
      }

      // API call akan otomatis menambahkan Authorization header
      const response = await api(API_URL, {
        method: "POST",
        body: JSON.stringify(payload),
      });
      
      // Extract ticket ID from response - check all possible paths
      let ticketId = null;
      if (response?.success && response?.data) {
        ticketId = response.data.id || response.data.ticket_id;
      } else if (response?.id) {
        ticketId = response.id;
      } else if (response?.ticket_id) {
        ticketId = response.ticket_id;
      }
      
      if (ticketId) {
        // Store ticket ID in AsyncStorage for persistence
        await AsyncStorage.setItem('currentTicketId', String(ticketId));
        
        // Trigger refresh for riwayat screen
        await AsyncStorage.setItem('shouldRefreshRiwayat', 'true');
        
        router.push(`/complaint/chat?fromConfirmation=true&ticketId=${ticketId}`);
      } else {
        router.push("/complaint/chat?fromConfirmation=true");
      }
    } catch (error: any) {
      Alert.alert(
        "Gagal",
        "Terjadi kesalahan saat mengirim data. Coba lagi ya."
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <SafeAreaView
      style={styles.container}
      edges={["top", "left", "right", "bottom"]}
    >
      {/* Jangan pakai behavior 'padding/height' agar layout TIDAK terdorong saat keyboard muncul */}
      <KeyboardAvoidingView
        style={styles.keyboardView}
        behavior={undefined}
        keyboardVerticalOffset={0}
      >
        <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
          <View style={{ flex: 1 }}>
            {/* Header */}
            <View style={styles.header}>
              <Text style={styles.headerTitle}>Form Complain</Text>
            </View>

            <ScrollView
              style={styles.content}
              contentInsetAdjustmentBehavior="automatic"
              contentContainerStyle={[
                styles.scrollContent,
                // Tambahkan padding sesuai tinggi footer aktual supaya konten bisa discroll di atas footer & keyboard
                { paddingBottom: footerHeight + 12 },
              ]}
              keyboardShouldPersistTaps="handled"
              keyboardDismissMode="interactive"
              showsVerticalScrollIndicator={false}
            >
              {/* Warning */}
              <View style={styles.warningBox}>
                <MaterialIcons name="error-outline" size={20} color="#FFC107" />
                <Text style={styles.warningText}>
                  Mohon periksa kembali data sebelum melanjutkan.
                </Text>
              </View>

              {/* Nama */}
              <View style={styles.fieldContainer}>
                <Text style={styles.label}>Nama</Text>
                <TextInput
                  value={full_nameauto}
                  editable={false}
                  style={styles.textInput}
                />
              </View>

              {/* No Rekening */}
              {accounts.length > 1 ? (
                <SelectField
                  label="No Rekening"
                  value={`${account_number} (${user?.selectedAccount?.account_type || ""})`}
                  options={accounts.map(
                    (acc) => `${acc.account_number} (${acc.account_type})`
                  )}
                  onChange={(selectedValue) => {
                    const selectedAccount = accounts.find((acc) =>
                      selectedValue.includes(acc.account_number.toString())
                    );
                    if (selectedAccount) {
                      selectAccount(selectedAccount);
                    }
                  }}
                />
              ) : (
                <View style={styles.fieldContainer}>
                  <Text style={styles.label}>No Rekening</Text>
                  <TextInput
                    value={account_number}
                    editable={false}
                    style={styles.textInput}
                  />
                </View>
              )}

              {/* Channel */}
              {dataLoading ? (
                <View style={styles.fieldContainer}>
                  <Text style={styles.label}>Channel</Text>
                  <View style={[styles.textInput, styles.loadingField]}>
                    <Text style={styles.loadingText}>Memuat data...</Text>
                  </View>
                </View>
              ) : dataError ? (
                <View style={styles.fieldContainer}>
                  <Text style={styles.label}>Channel</Text>
                  <View style={[styles.textInput, styles.errorField]}>
                    <Text style={styles.errorText}>Gagal memuat data channel</Text>
                  </View>
                </View>
              ) : (
                <SelectField
                  label="Channel"
                  value={channel?.channel_name || (channels.length > 0 ? channels[0].channel_name : "")}
                  options={channels.map(c => c.channel_name)}
                  onChange={(v) => {
                    const selectedChannel = channels.find(c => c.channel_name === v);
                    if (selectedChannel) setChannel(selectedChannel);
                  }}
                />
              )}

              {/* Category */}
              {dataLoading ? (
                <View style={styles.fieldContainer}>
                  <Text style={styles.label}>Category</Text>
                  <View style={[styles.textInput, styles.loadingField]}>
                    <Text style={styles.loadingText}>Memuat data...</Text>
                  </View>
                </View>
              ) : dataError ? (
                <View style={styles.fieldContainer}>
                  <Text style={styles.label}>Category</Text>
                  <View style={[styles.textInput, styles.errorField]}>
                    <Text style={styles.errorText}>Gagal memuat data kategori</Text>
                  </View>
                </View>
              ) : (
                <SelectField
                  label="Category"
                  value={category?.complaint_name || (filteredCategories.length > 0 ? filteredCategories[0].complaint_name : "")}
                  options={filteredCategories.map(c => c.complaint_name)}
                  onChange={(v) => {
                    const selectedCategory = filteredCategories.find(c => c.complaint_name === v);
                    if (selectedCategory) setCategory(selectedCategory);
                  }}
                />
              )}

              {/* Deskripsi */}
              <View style={styles.fieldContainer}>
                <Text style={styles.label}>Description</Text>
                <TextInput
                  style={[styles.textInput, styles.textArea]}
                  value={description}
                  onChangeText={setdescription}
                  multiline
                  placeholder="Tulis kronologi keluhan (min. 8 karakter)…"
                  maxLength={1000}
                  textAlignVertical="top"
                  returnKeyType="done"
                  onSubmitEditing={Keyboard.dismiss}
                />
                <Text style={styles.helper}>
                  {description.trim().length}/1000
                </Text>
              </View>

              {/* Checkbox */}
              <TouchableOpacity
                style={styles.checkboxContainer}
                onPress={() => setIsChecked((v) => !v)}
                accessibilityRole="checkbox"
                accessibilityState={{ checked: isChecked }}
              >
                <View
                  style={[styles.checkbox, isChecked && styles.checkboxChecked]}
                >
                  {isChecked && (
                    <MaterialIcons name="check" size={16} color="#FFF" />
                  )}
                </View>
                <Text style={styles.checkboxText}>
                  Saya telah memeriksa dan memastikan semua data yang diisi
                  sudah benar.
                </Text>
              </TouchableOpacity>
            </ScrollView>

            {/* Footer: FIXED di bawah (tidak ikut keyboard), padding menyesuaikan safe area */}
            <View style={styles.footerWrapper} pointerEvents="box-none">
              <View
                style={[
                  styles.footerCard,
                  { paddingBottom: 16 + insets.bottom }, // safe-area iPhone
                ]}
                onLayout={(e) => setFooterHeight(e.nativeEvent.layout.height)}
              >
                <View style={styles.buttonContainer}>
                  <TouchableOpacity
                    style={styles.backButton}
                    onPress={() => setShowBottomSheet(true)}
                  >
                    <Text style={styles.backButtonText}>Kembali</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[
                      styles.submitButton,
                      isValid ? styles.enabledButton : styles.disabledButton,
                    ]}
                    disabled={!isValid || submitting}
                    onPress={handleSubmit}
                  >
                    <Text
                      style={[
                        styles.submitText,
                        isValid ? styles.enabledText : styles.disabledText,
                      ]}
                    >
                      {submitting ? "Mengirim..." : "Selesai"}
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>

            <BottomSheet
              visible={showBottomSheet}
              onClose={() => setShowBottomSheet(false)}
              onConfirm={() => {
                setShowBottomSheet(false);
                router.back();
              }}
            />
          </View>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
  keyboardView: { flex: 1 },

  header: {
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "#E0E0E0",
    height: HEADER_HEIGHT,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#000",
    fontFamily: "Poppins",
  },

  content: { flex: 1 },
  scrollContent: { padding: 16 },

  warningBox: {
    flexDirection: "row",
    backgroundColor: "#FFF8E1",
    padding: 16,
    borderRadius: 8,
    marginBottom: 20,
    alignItems: "center",
    gap: 8,
  },
  warningText: { flex: 1, fontSize: 14, color: "#333", fontFamily: "Poppins" },

  fieldContainer: { marginBottom: 16 },
  label: {
    fontSize: 14,
    fontWeight: "500",
    marginBottom: 8,
    fontFamily: "Poppins",
  },
  textInput: {
    backgroundColor: "#F0F0F0",
    padding: 12,
    borderRadius: 8,
    fontSize: 14,
    color: "#333",
    fontFamily: "Poppins",
  },

  // "dropdown" iOS
  selectInput: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  selectText: { fontSize: 14, color: "#333", fontFamily: "Poppins" },

  textArea: { minHeight: 100 },
  helper: { marginTop: 6, fontSize: 12, color: "#888" },

  pickerWrapper: {
    backgroundColor: "#F0F0F0",
    borderRadius: 8,
    overflow: "hidden",
  },

  checkboxContainer: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginTop: 6,
    marginBottom: 20,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderWidth: 2,
    borderColor: "#999",
    borderRadius: 4,
    marginRight: 12,
    justifyContent: "center",
    alignItems: "center",
  },
  checkboxChecked: { backgroundColor: "#2196F3", borderColor: "#2196F3" },
  checkboxText: { flex: 1, fontSize: 14, color: "#333", fontFamily: "Poppins" },

  // Footer fixed
  footerWrapper: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0, // tetap di bawah, tidak ikut keyboard
  },
  footerCard: {
    backgroundColor: "white",
    marginHorizontal: 16,
    marginBottom: 8,
    borderRadius: 12,
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
    paddingTop: 16,
  },

  buttonContainer: { flexDirection: "row", gap: 12, paddingHorizontal: 16 },
  backButton: {
    flex: 1,
    padding: 16,
    borderRadius: 8,
    alignItems: "center",
    backgroundColor: "#E0E0E0",
  },
  backButtonText: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#666",
    fontFamily: "Poppins",
  },
  submitButton: { flex: 1, padding: 16, borderRadius: 8, alignItems: "center" },
  enabledButton: { backgroundColor: "#52B5AB" },
  disabledButton: { backgroundColor: "#E0E0E0" },
  submitText: { fontSize: 16, fontWeight: "bold", fontFamily: "Poppins" },
  enabledText: { color: "#FFF" },
  disabledText: { color: "#999" },
  
  loadingField: {
    justifyContent: "center",
    alignItems: "center",
    minHeight: 44,
  },
  loadingText: {
    fontSize: 14,
    color: "#666",
    fontFamily: "Poppins",
  },
  errorField: {
    justifyContent: "center",
    alignItems: "center",
    minHeight: 44,
    backgroundColor: "#FFE5E5",
  },
  errorText: {
    fontSize: 14,
    color: "#D32F2F",
    fontFamily: "Poppins",
  },
});