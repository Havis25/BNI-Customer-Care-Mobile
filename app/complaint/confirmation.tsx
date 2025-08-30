import BottomSheet from "@/components/modals/BottomSheet";
import { useAuth } from "@/hooks/useAuth";
import { useChannelsAndCategories } from "@/hooks/useChannelsAndCategories";
import { useTerminals } from "@/hooks/useTerminals";
import { useUser } from "@/hooks/useUser";
import { useUserProfile } from "@/hooks/useUserProfile";
import { api } from "@/lib/api";
import {
  formatAmountForDisplay,
  validateAmount,
  validateTransactionDate,
} from "@/utils/chatValidation";
import { deviceType, hp, rf, wp } from "@/utils/responsive";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Picker } from "@react-native-picker/picker";
import { router, useLocalSearchParams } from "expo-router";
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
  related_account_id?: number;
  related_card_id?: number;
  amount?: string;
  terminal_id?: number;
  transaction_date?: string;
  // Customer data from auth/me
  customer_id?: number;
  full_name?: string;
  email?: string;
  phone_number?: string;
  address?: string;
  birth_place?: string;
  gender?: string;
  person_id?: string;
  cif?: string;
  billing_address?: string;
  postal_code?: string;
  home_phone?: string;
  handphone?: string;
  office_phone?: string;
  fax_phone?: string;
  // Account and card data
  primary_account_id?: number;
  primary_account_number?: number;
  primary_account_type?: string;
  primary_card_id?: number;
  primary_card_number?: number;
  primary_card_type?: string;
  debit_card_numbers?: number[];
};
/** SelectField: iOS pakai ActionSheet, Android/Web pakai Picker dropdown */
function SelectField({
  label,
  value,
  options,
  onChange,
  disabled = false,
}: {
  label: string;
  value: string;
  options: string[];
  onChange: (v: string) => void;
  disabled?: boolean;
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
          style={[
            styles.textInput,
            styles.selectInput,
            disabled && styles.disabledInput,
          ]}
          onPress={disabled ? undefined : openSheet}
          disabled={disabled}
        >
          <Text
            style={[styles.selectText, disabled && styles.disabledSelectText]}
          >
            {value}
          </Text>
          <MaterialIcons
            name="arrow-drop-down"
            size={24}
            color={disabled ? "#999" : "#666"}
          />
        </Pressable>
        {disabled && (
          <Text style={styles.lockedHelper}>
            ✓ Dipilih otomatis dari chatbot
          </Text>
        )}
      </View>
    );
  }
  return (
    <View style={styles.fieldContainer}>
      <Text style={styles.label}>{label}</Text>
      <View style={[styles.pickerWrapper, disabled && styles.disabledInput]}>
        <Picker
          selectedValue={value}
          onValueChange={(v) => !disabled && onChange(String(v))}
          dropdownIconColor={disabled ? "#999" : "#666"}
          mode="dropdown"
          enabled={!disabled}
          style={{ color: disabled ? "#666" : "#333" }}
        >
          {options.map((opt) => (
            <Picker.Item key={opt} label={opt} value={opt} color="#FFF" />
          ))}
        </Picker>
      </View>
      {disabled && (
        <Text style={styles.lockedHelper}>✓ Dipilih otomatis dari chatbot</Text>
      )}
    </View>
  );
}
export default function ConfirmationScreen() {
  const insets = useSafeAreaInsets();
  const { user, selectAccount, account_number, accounts } = useUser();
  const { token, isAuthenticated } = useAuth();
  const { getUserDataForTicket } = useUserProfile();
  const {
    channels,
    categories,
    getFilteredCategories,
    isLoading: dataLoading,
    error: dataError,
  } = useChannelsAndCategories();
  const { terminals } = useTerminals();
  // Get parameters from chatbot if available
  const {
    presetChannel,
    presetCategory,
    presetDescription,
    presetAmount,
    presetTransactionDate,
    mode,
  } = useLocalSearchParams();
  const full_nameauto = (user?.full_name || "").trim() || "User Complain";
  // Editable
  const [channel, setChannel] = useState<any>(null);
  const [category, setCategory] = useState<any>(null);
  const [terminal, setTerminal] = useState<any>(null);
  const [description, setdescription] = useState<string>("");
  const [amount, setAmount] = useState<string>("");
  const [transactionDate, setTransactionDate] = useState<string>("");
  // UI
  const [isChecked, setIsChecked] = useState(false);
  const [showBottomSheet, setShowBottomSheet] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  // Control field states from preset data
  const [fieldStates, setFieldStates] = useState({
    channelLocked: false,
    categoryLocked: false,
    descriptionLocked: false,
    amountLocked: false,
    transactionDateLocked: false,
  });

  // Error states for form validation
  const [formErrors, setFormErrors] = useState({
    amount: "",
    transactionDate: "",
  });
  // ====== PENTING: tinggi footer aktual agar ScrollView bisa scroll di atas keyboard ======
  const [footerHeight, setFooterHeight] = useState(120); // perkiraan awal; nanti diganti oleh onLayout
  // Get filtered categories based on selected channel
  const filteredCategories = getFilteredCategories(channel);
  // Get filtered terminals based on selected channel
  const filteredTerminals = terminals.filter((terminal) => {
    if (!channel) return false;
    // Check if channel supports terminals and matches terminal's channel
    return (
      channel.channel_code === terminal.channel.channel_code &&
      terminal.channel.supports_terminal
    );
  });
  // Check if current channel requires terminal selection
  const requiresTerminal = channel && filteredTerminals.length > 0;
  // Categories that require amount field (transaction-related)
  const transactionCategories = [
    "PEMBAYARAN_KARTU_KREDIT_BNI",
    "PEMBAYARAN_KARTU_KREDIT_BANK_LAIN",
    "PEMBAYARAN_PLN_VIA_ATM_BANK_LAIN",
    "PEMBAYARAN_SAMSAT",
    "PEMBAYARAN_TELKOM_TELKOMSEL_INDOSAT_PROVIDER_LAINNYA",
    "TOP_UP_DANA",
    "TOP_UP_GOPAY",
    "TOP_UP_OVO",
    "TOP_UP_PULSA",
    "TOP_UP_PULSA_VIA_ATM_BANK_LAIN",
    "TOP_UP_SHOPEE_PAY",
    "TOP_UP_LINKAJA",
    "TOP_UP_E_MONEY",
    "TRANSFER_ATM_ALTO_DANA_TDK_MASUK",
    "TRANSFER_ATM_BERSAMA_DANA_TDK_MASUK",
    "TRANSFER_ATM_LINK_DANA_TDK_MASUK",
    "TRANSFER_ATM_PRIMA_DANA_TDK_MASUK",
    "TRANSFER_ANTAR_REKENING_BNI",
    "TRANSFER_ATM_ALTO_BILATERAL",
    "TRANSFER_ATM_BERSAMA_BILATERAL",
    "TRANSFER_ATM_ALTO_LINK_BILATERAL",
    "TRANSFER_ATM_PRIMA_BILATERAL",
    "BI_FAST_DANA_TIDAK_MASUK",
    "BI_FAST_BILATERAL",
    "MOBILE_TUNAI_ALFAMIDI",
    "MOBILE_TUNAI_INDOMARET",
    "MOBILE_TUNAI",
    "MOBILE_TUNAI_ALFAMART",
    "SETOR_TUNAI_DI_MESIN_ATM_CRM",
    "TARIK_TUNAI_DI_MESIN_ATM_BNI",
    "TARIK_TUNAI_DI_ATM_LINK",
    "TARIK_TUNAI_DI_JARINGAN_ALTO",
    "TARIK_TUNAI_DI_JARINGAN_BERSAMA",
    "TARIK_TUNAI_DI_ATM_CIRRUS",
  ];
  // Check if current category requires amount
  const requiresAmount =
    category && transactionCategories.includes(category.complaint_code);
  // Check if current category requires transaction date
  const requiresTransactionDate =
    category && transactionCategories.includes(category.complaint_code);
  // Update state when API data loads
  useEffect(() => {
    if (channels.length > 0 && !channel) {
      setChannel(channels[0]);
    }
  }, [channels]);
  useEffect(() => {
    if (categories.length > 0 && !category) {
      setCategory(categories[0]);
      setAmount(""); // Reset amount when initial category is set
      setTransactionDate(""); // Reset transaction date when initial category is set
    }
  }, [categories]);
  // Update category when channel changes
  useEffect(() => {
    if (channel && filteredCategories.length > 0) {
      // If current category is not in filtered list, select first filtered category
      if (
        !filteredCategories.find(
          (c) => c.complaint_id === category?.complaint_id
        )
      ) {
        setCategory(filteredCategories[0]);
        setAmount(""); // Reset amount when category changes
        setTransactionDate(""); // Reset transaction date when category changes
      }
    }
    // Reset terminal when channel changes
    if (requiresTerminal && filteredTerminals.length > 0) {
      setTerminal(filteredTerminals[0]);
    } else {
      setTerminal(null);
    }
  }, [
    channel,
    filteredCategories,
    category?.complaint_id,
    requiresTerminal,
    filteredTerminals,
  ]);
  // Reset amount and transaction date when category changes
  useEffect(() => {
    setAmount("");
    setTransactionDate("");
  }, [category?.complaint_id]);
  // Handle preset data from chatbot
  useEffect(() => {
    if (mode === "create" && channels.length > 0 && categories.length > 0) {
      const newFieldStates = { ...fieldStates };
      // Set preset channel
      if (presetChannel && typeof presetChannel === "string") {
        const foundChannel = channels.find(
          (c) => c.channel_name.toLowerCase() === presetChannel.toLowerCase()
        );
        if (foundChannel) {
          setChannel(foundChannel);
          newFieldStates.channelLocked = true;
        }
      }
      // Set preset category
      if (presetCategory && typeof presetCategory === "string") {
        const foundCategory = categories.find(
          (c) =>
            c.complaint_name
              .toLowerCase()
              .includes(presetCategory.toLowerCase()) ||
            presetCategory
              .toLowerCase()
              .includes(c.complaint_name.toLowerCase())
        );
        if (foundCategory) {
          setCategory(foundCategory);
          newFieldStates.categoryLocked = true;
        }
      }
      // Set preset description
      if (presetDescription && typeof presetDescription === "string") {
        setdescription(presetDescription);
        newFieldStates.descriptionLocked = true;
      }
      // Set preset amount
      if (presetAmount && typeof presetAmount === "string") {
        const amountValidation = validateAmount(presetAmount);
        if (amountValidation.isValid && amountValidation.cleanedAmount) {
          setAmount(amountValidation.cleanedAmount);
          newFieldStates.amountLocked = true;
        }
      }
      // Set preset transaction date
      if (presetTransactionDate && typeof presetTransactionDate === "string") {
        const dateValidation = validateTransactionDate(presetTransactionDate);
        if (dateValidation.isValid) {
          setTransactionDate(presetTransactionDate);
          newFieldStates.transactionDateLocked = true;
        }
      }
      setFieldStates(newFieldStates);
    }
  }, [
    mode,
    channels,
    categories,
    presetChannel,
    presetCategory,
    presetDescription,
    presetAmount,
    presetTransactionDate,
  ]);
  const isValid =
    isChecked &&
    !!channel &&
    !!category &&
    description.trim().length >= 8 &&
    !dataLoading &&
    channels.length > 0 &&
    filteredCategories.length > 0 &&
    channel?.channel_id &&
    category?.complaint_id &&
    // Amount validation using validateAmount function
    (!requiresAmount ||
      (requiresAmount &&
        amount.trim() &&
        !formErrors.amount &&
        (() => {
          const amountValidation = validateAmount(amount.trim());
          return amountValidation.isValid;
        })())) &&
    (!requiresTerminal || (requiresTerminal && !!terminal)) &&
    // Transaction date validation using validateTransactionDate function
    (!requiresTransactionDate ||
      (requiresTransactionDate &&
        transactionDate.trim() &&
        !formErrors.transactionDate &&
        (() => {
          const dateValidation = validateTransactionDate(
            transactionDate.trim()
          );
          return dateValidation.isValid;
        })()));
  // Get account and card IDs from user data
  const getRelatedIds = () => {
    const userAccounts = user?.accounts || [];
    if (userAccounts.length >= 1) {
      const account = userAccounts[0];
      let cardId = null;
      // Check if account has cards property and extract card_id
      const accountWithCards = account as any;
      if (
        accountWithCards.cards &&
        Array.isArray(accountWithCards.cards) &&
        accountWithCards.cards.length > 0
      ) {
        cardId = accountWithCards.cards[0].card_id;
      }
      return {
        related_account_id: account.account_id,
        related_card_id: cardId,
      };
    }
    return { related_account_id: null, related_card_id: null };
  };
  const { related_account_id, related_card_id } = getRelatedIds();
  // Format transaction date from DD/MM/YYYY to YYYY-MM-DD for API
  const formatTransactionDate = (dateString: string): string => {
    if (!dateString || !dateString.trim()) return "";
    // Handle both DD/MM/YYYY and DD-MM-YYYY formats
    const cleanDate = dateString.trim().replace(/-/g, "/");
    const parts = cleanDate.split("/");
    if (parts.length === 3) {
      const day = parts[0].padStart(2, "0");
      const month = parts[1].padStart(2, "0");
      const year = parts[2];
      const formatted = `${year}-${month}-${day}`;
      return formatted;
    }
    return dateString.trim(); // Return as-is if format is unexpected
  };
  const payload: TicketPayload = {
    description: description.trim(),
    issue_channel_id: channel?.channel_id || 0,
    complaint_id: category?.complaint_id || 0,
    // Always include related IDs (even if null)
    related_account_id,
    related_card_id,
    ...(requiresAmount &&
      amount.trim() && {
        amount: amount.trim().replace(/[^0-9]/g, ""),
      }),
    ...(requiresTerminal && terminal && { terminal_id: terminal.terminal_id }),
    ...(requiresTransactionDate &&
      transactionDate.trim() && {
        transaction_date: formatTransactionDate(transactionDate),
      }),
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
      // Get user data from auth/me endpoint
      const userData = await getUserDataForTicket();
      // Create enhanced payload with user data from auth/me
      const enhancedPayload: TicketPayload = {
        ...payload,
        // Merge user data from auth/me
        ...(userData && {
          customer_id: userData.customer_id,
          full_name: userData.full_name,
          email: userData.email,
          phone_number: userData.phone_number,
          address: userData.address,
          birth_place: userData.birth_place,
          gender: userData.gender,
          person_id: userData.person_id,
          cif: userData.cif,
          billing_address: userData.billing_address,
          postal_code: userData.postal_code,
          home_phone: userData.home_phone,
          handphone: userData.handphone,
          office_phone: userData.office_phone,
          fax_phone: userData.fax_phone,
          primary_account_id: userData.primary_account_id,
          primary_account_number: userData.primary_account_number,
          primary_account_type: userData.primary_account_type,
          primary_card_id: userData.primary_card_id,
          primary_card_number: userData.primary_card_number,
          primary_card_type: userData.primary_card_type,
          debit_card_numbers: userData.debit_card_numbers,
        }),
      };
      // API call akan otomatis menambahkan Authorization header
      const response = await api(API_URL, {
        method: "POST",
        body: JSON.stringify(enhancedPayload),
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
        await AsyncStorage.setItem("currentTicketId", String(ticketId));
        // Trigger refresh for riwayat screen
        await AsyncStorage.setItem("shouldRefreshRiwayat", "true");
        router.push(
          `/complaint/chat?fromConfirmation=true&ticketId=${ticketId}`
        );
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
        behavior={Platform.OS === "ios" ? "padding" : "height"}
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
                  value={`${account_number} (${
                    user?.selectedAccount?.account_type || ""
                  })`}
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
                    <Text style={styles.errorText}>
                      Gagal memuat data channel
                    </Text>
                  </View>
                </View>
              ) : (
                <SelectField
                  label="Channel"
                  value={
                    channel?.channel_name ||
                    (channels.length > 0 ? channels[0].channel_name : "")
                  }
                  options={channels.map((c) => c.channel_name)}
                  onChange={(v) => {
                    if (!fieldStates.channelLocked) {
                      const selectedChannel = channels.find(
                        (c) => c.channel_name === v
                      );
                      if (selectedChannel) setChannel(selectedChannel);
                    }
                  }}
                  disabled={fieldStates.channelLocked}
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
                    <Text style={styles.errorText}>
                      Gagal memuat data kategori
                    </Text>
                  </View>
                </View>
              ) : (
                <SelectField
                  label="Category"
                  value={
                    category?.complaint_name ||
                    (filteredCategories.length > 0
                      ? filteredCategories[0].complaint_name
                      : "")
                  }
                  options={filteredCategories.map((c) => c.complaint_name)}
                  onChange={(v) => {
                    if (!fieldStates.categoryLocked) {
                      const selectedCategory = filteredCategories.find(
                        (c) => c.complaint_name === v
                      );
                      if (selectedCategory) setCategory(selectedCategory);
                    }
                  }}
                  disabled={fieldStates.categoryLocked}
                />
              )}
              {/* Terminal - only show for channels that support terminals */}
              {requiresTerminal && (
                <SelectField
                  label="Terminal"
                  value={
                    terminal
                      ? `${terminal.terminal_code} - ${terminal.location}`
                      : filteredTerminals.length > 0
                      ? `${filteredTerminals[0].terminal_code} - ${filteredTerminals[0].location}`
                      : ""
                  }
                  options={filteredTerminals.map(
                    (t) => `${t.terminal_code} - ${t.location}`
                  )}
                  onChange={(v) => {
                    const selectedTerminal = filteredTerminals.find(
                      (t) => `${t.terminal_code} - ${t.location}` === v
                    );
                    if (selectedTerminal) setTerminal(selectedTerminal);
                  }}
                />
              )}
              {/* Amount - only show for transaction categories */}
              {requiresAmount && (
                <View style={styles.fieldContainer}>
                  <Text style={styles.label}>Nominal Transaksi</Text>
                  <TextInput
                    style={[
                      styles.textInput,
                      fieldStates.amountLocked && styles.disabledInput,
                      formErrors.amount && styles.errorInput,
                    ]}
                    value={amount}
                    onChangeText={(text) => {
                      if (!fieldStates.amountLocked) {
                        // Only allow numbers
                        const numericText = text.replace(/[^0-9]/g, "");
                        setAmount(numericText);

                        // Clear error on typing
                        if (formErrors.amount) {
                          setFormErrors((prev) => ({ ...prev, amount: "" }));
                        }
                      }
                    }}
                    onBlur={() => {
                      // Validate amount when user leaves the field
                      if (requiresAmount && amount.trim()) {
                        const amountValidation = validateAmount(amount.trim());
                        if (!amountValidation.isValid) {
                          setFormErrors((prev) => ({
                            ...prev,
                            amount:
                              amountValidation.errorMessage ||
                              "Nominal tidak valid",
                          }));
                        }
                      }
                    }}
                    placeholder="Masukkan nominal transaksi"
                    placeholderTextColor="#999"
                    keyboardType="numeric"
                    returnKeyType="done"
                    editable={!fieldStates.amountLocked}
                  />
                  {formErrors.amount ? (
                    <Text style={styles.errorText}>{formErrors.amount}</Text>
                  ) : (
                    <Text style={styles.helper}>
                      {amount && formatAmountForDisplay(amount)}
                      {!amount &&
                        !fieldStates.amountLocked &&
                        "Masukkan nominal dalam Rupiah (contoh: 100000)"}
                    </Text>
                  )}
                  {fieldStates.amountLocked && (
                    <Text style={styles.lockedHelper}>
                      ✓ Dipilih otomatis dari chatbot
                    </Text>
                  )}
                </View>
              )}
              {/* Transaction Date - only show for transaction categories that require date */}
              {requiresTransactionDate && (
                <View style={styles.fieldContainer}>
                  <Text style={styles.label}>Tanggal Transaksi</Text>
                  <TextInput
                    style={[
                      styles.textInput,
                      fieldStates.transactionDateLocked && styles.disabledInput,
                      formErrors.transactionDate && styles.errorInput,
                    ]}
                    value={transactionDate}
                    onChangeText={(text) => {
                      if (!fieldStates.transactionDateLocked) {
                        // Format date input with auto-formatting
                        let formattedText = text.replace(/[^\d\/\-]/g, "");
                        // Auto-format with slashes
                        if (
                          formattedText.length === 2 &&
                          !formattedText.includes("/") &&
                          !formattedText.includes("-")
                        ) {
                          formattedText += "/";
                        } else if (
                          formattedText.length === 5 &&
                          formattedText.split(/[\/\-]/).length === 2
                        ) {
                          formattedText += "/";
                        }
                        setTransactionDate(formattedText);

                        // Clear error on typing
                        if (formErrors.transactionDate) {
                          setFormErrors((prev) => ({
                            ...prev,
                            transactionDate: "",
                          }));
                        }
                      }
                    }}
                    onBlur={() => {
                      // Validate transaction date when user leaves the field
                      if (requiresTransactionDate && transactionDate.trim()) {
                        const dateValidation = validateTransactionDate(
                          transactionDate.trim()
                        );
                        if (!dateValidation.isValid) {
                          setFormErrors((prev) => ({
                            ...prev,
                            transactionDate:
                              dateValidation.errorMessage ||
                              "Tanggal tidak valid",
                          }));
                        }
                      }
                    }}
                    placeholder="DD/MM/YYYY"
                    placeholderTextColor="#999"
                    keyboardType="numeric"
                    returnKeyType="done"
                    maxLength={10}
                    editable={!fieldStates.transactionDateLocked}
                  />
                  {formErrors.transactionDate ? (
                    <Text style={styles.errorText}>
                      {formErrors.transactionDate}
                    </Text>
                  ) : (
                    <Text style={styles.helper}>
                      {transactionDate &&
                      /^\d{1,2}[\/\-]\d{1,2}[\/\-]\d{4}$/.test(transactionDate)
                        ? "Format tanggal valid ✓"
                        : !fieldStates.transactionDateLocked
                        ? "Masukkan tanggal dalam format DD/MM/YYYY (contoh: 15/08/2024)"
                        : ""}
                    </Text>
                  )}
                  {fieldStates.transactionDateLocked && (
                    <Text style={styles.lockedHelper}>
                      ✓ Dipilih otomatis dari chatbot
                    </Text>
                  )}
                </View>
              )}
              {/* Deskripsi */}
              <View style={styles.fieldContainer}>
                <Text style={styles.label}>Description</Text>
                <TextInput
                  style={[
                    styles.textInput,
                    styles.textArea,
                    fieldStates.descriptionLocked && styles.disabledInput,
                  ]}
                  value={description}
                  onChangeText={(text) => {
                    if (!fieldStates.descriptionLocked) {
                      setdescription(text);
                    }
                  }}
                  multiline
                  placeholder="Tulis kronologi keluhan (min. 8 karakter)…"
                  placeholderTextColor="#999"
                  maxLength={1000}
                  textAlignVertical="top"
                  returnKeyType="done"
                  onSubmitEditing={Keyboard.dismiss}
                  editable={!fieldStates.descriptionLocked}
                />
                <Text style={styles.helper}>
                  {description.trim().length}/1000
                </Text>
                {fieldStates.descriptionLocked && (
                  <Text style={styles.lockedHelper}>
                    ✓ Dipilih otomatis dari chatbot
                  </Text>
                )}
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
                  { 
                    paddingBottom: Platform.OS === 'ios' ? 16 + insets.bottom : 16,
                    backgroundColor: '#fff' // Ensure white background for Android
                  }
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
    fontSize: rf(18),
    fontWeight: "600",
    color: "#000",
    fontFamily: "Poppins",
  },
  content: { flex: 1 },
  scrollContent: { padding: wp(4) },
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
    color: "#333",
    fontFamily: "Poppins",
  },
  textInput: {
    backgroundColor: "#F0F0F0",
    padding: wp(3),
    borderRadius: 8,
    fontSize: rf(14),
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
  textArea: { minHeight: deviceType.isTablet ? hp(12) : hp(12.5) },
  helper: { marginTop: 6, fontSize: 12, color: "#888" },
  pickerWrapper: {
    backgroundColor: "#F0F0F0",
    borderRadius: 8,
    overflow: "hidden",
    color: "#333",
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
    marginBottom: -32,
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0, // tetap di bawah, tidak ikut keyboard
  },
  footerCard: {
    backgroundColor: "#fff",
    paddingVertical: hp(3),
    paddingTop: hp(2),
    paddingBottom: Platform.OS === 'ios' ? hp(5.2) : hp(3),
    paddingHorizontal: wp(4),
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 5,
  },
  buttonContainer: { flexDirection: "row", gap: 12, paddingHorizontal: 0 },
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
  disabledInput: {
    backgroundColor: "#F8F8F8",
    borderWidth: 1,
    borderColor: "#52B5AB",
    color: "#666",
  },
  errorInput: {
    borderWidth: 1,
    borderColor: "#D32F2F",
    backgroundColor: "#FFEBEE",
  },
  disabledSelectText: {
    color: "#666",
  },
  lockedHelper: {
    marginTop: 6,
    fontSize: 12,
    color: "#52B5AB",
    fontWeight: "500",
    fontFamily: "Poppins",
  },
});
