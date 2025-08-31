import { Fonts } from "@/constants/Fonts";
import {
  deviceType,
  getScreenDimensions,
  hp,
  rf,
  wp,
} from "@/utils/responsive";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import React, { useEffect, useRef } from "react";
import {
  Animated,
  Modal,
  Platform,
  SafeAreaView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

interface FilterModalProps {
  visible: boolean;
  onClose: () => void;
  sortBy: string;
  setSortBy: (value: string) => void;
  selectedStatus: string[];
  setSelectedStatus: React.Dispatch<React.SetStateAction<string[]>>;
  onApply: () => void;
  onClear: () => void;
  hasFilters: boolean;
}

export default function FilterModal({
  visible,
  onClose,
  sortBy,
  setSortBy,
  selectedStatus,
  setSelectedStatus,
  onApply,
  onClear,
  hasFilters,
}: FilterModalProps) {
  const slideAnim = useRef(new Animated.Value(300)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      Animated.timing(opacityAnim, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }).start();
      
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }).start();
    } else {
      Animated.timing(slideAnim, {
        toValue: 300,
        duration: 250,
        useNativeDriver: true,
      }).start(() => {
        Animated.timing(opacityAnim, {
          toValue: 0,
          duration: 100,
          useNativeDriver: true,
        }).start();
      });
    }
  }, [visible, slideAnim, opacityAnim]);

  const toggleStatus = (status: string) => {
    setSelectedStatus((prev) =>
      prev.includes(status)
        ? prev.filter((s) => s !== status)
        : [...prev, status]
    );
  };

  const screenDimensions = getScreenDimensions();

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      statusBarTranslucent={Platform.OS === "android"}
    >
      {Platform.OS === "android" ? (
        <SafeAreaView style={styles.safeArea}>
          <Animated.View style={[styles.modalOverlay, { opacity: opacityAnim }]}>
            <TouchableOpacity
              style={styles.touchableOverlay}
              activeOpacity={1}
              onPress={onClose}
            />
            <Animated.View
              style={[
                styles.bottomSheet,
                {
                  transform: [{ translateY: slideAnim }],
                  maxHeight: screenDimensions.isTablet ? "75%" : "90%",
                },
              ]}
              onStartShouldSetResponder={() => true}
            >
              <View style={styles.sheetHeader}>
                <View style={styles.dragIndicator} />
                <Text style={styles.sheetTitle}>Filter & Urutkan</Text>
              </View>

              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Urutkan Berdasarkan</Text>

                <TouchableOpacity
                  style={[
                    styles.sortOption,
                    sortBy === "tanggal-terbaru" && styles.selectedOption,
                  ]}
                  onPress={() => setSortBy("tanggal-terbaru")}
                  activeOpacity={0.7}
                >
                  <MaterialIcons
                    name="calendar-today"
                    size={rf(20)}
                    color="#1F72F1"
                  />
                  <Text style={styles.optionText}>Terbaru</Text>
                  <MaterialIcons
                    name={
                      sortBy === "tanggal-terbaru"
                        ? "radio-button-checked"
                        : "radio-button-unchecked"
                    }
                    size={rf(20)}
                    color={sortBy === "tanggal-terbaru" ? "#1F72F1" : "#8E8E93"}
                  />
                </TouchableOpacity>

                <TouchableOpacity
                  style={[
                    styles.sortOption,
                    sortBy === "tanggal-terlama" && styles.selectedOption,
                  ]}
                  onPress={() => setSortBy("tanggal-terlama")}
                  activeOpacity={0.7}
                >
                  <MaterialIcons
                    name="calendar-today"
                    size={rf(20)}
                    color="#1F72F1"
                  />
                  <Text style={styles.optionText}>Terlama</Text>
                  <MaterialIcons
                    name={
                      sortBy === "tanggal-terlama"
                        ? "radio-button-checked"
                        : "radio-button-unchecked"
                    }
                    size={rf(20)}
                    color={sortBy === "tanggal-terlama" ? "#1F72F1" : "#8E8E93"}
                  />
                </TouchableOpacity>
              </View>

              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Status Tiket</Text>

                {[
                  { status: "Diterima", icon: "description", color: "#FF8636" },
                  { status: "Verifikasi", icon: "verified", color: "#FFB600" },
                  { status: "Diproses", icon: "history", color: "#B3BE47" },
                  { status: "Selesai", icon: "check-circle", color: "#66C4BE" },
                  { status: "Ditolak", icon: "cancel", color: "#E24646" },
                ].map(({ status, icon, color }) => (
                  <TouchableOpacity
                    key={status}
                    style={[
                      styles.statusOption,
                      selectedStatus.includes(status) && styles.selectedOption,
                    ]}
                    onPress={() => toggleStatus(status)}
                    activeOpacity={0.7}
                  >
                    <MaterialIcons name={icon as any} size={rf(20)} color={color} />
                    <Text style={styles.optionText}>{status}</Text>
                    <MaterialIcons
                      name={
                        selectedStatus.includes(status)
                          ? "check-box"
                          : "check-box-outline-blank"
                      }
                      size={rf(20)}
                      color={
                        selectedStatus.includes(status) ? "#1F72F1" : "#8E8E93"
                      }
                    />
                  </TouchableOpacity>
                ))}
              </View>

              <View style={styles.buttonContainer}>
                <TouchableOpacity style={styles.clearButton} onPress={onClear}>
                  <Text style={styles.clearText}>Hapus</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[
                    styles.applyButton,
                    !hasFilters && styles.disabledButton,
                  ]}
                  onPress={onApply}
                  disabled={!hasFilters}
                >
                  <Text
                    style={[styles.applyText, !hasFilters && styles.disabledText]}
                  >
                    Terapkan
                  </Text>
                </TouchableOpacity>
              </View>
            </Animated.View>
          </Animated.View>
        </SafeAreaView>
      ) : (
        <Animated.View style={[styles.modalOverlay, { opacity: opacityAnim }]}>
          <TouchableOpacity
            style={styles.touchableOverlay}
            activeOpacity={1}
            onPress={onClose}
          />
          <Animated.View
            style={[
              styles.bottomSheet,
              { transform: [{ translateY: slideAnim }] },
            ]}
            onStartShouldSetResponder={() => true}
          >
            <View style={styles.sheetHeader}>
              <Text style={styles.sheetTitle}>Filter & Urutkan</Text>
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Urutkan Berdasarkan</Text>

              <TouchableOpacity
                style={styles.sortOption}
                onPress={() => setSortBy("tanggal-terbaru")}
              >
                <MaterialIcons
                  name="calendar-today"
                  size={20}
                  color="#1F72F1"
                />
                <Text style={styles.optionText}>Terbaru</Text>
                <MaterialIcons
                  name={
                    sortBy === "tanggal-terbaru"
                      ? "radio-button-checked"
                      : "radio-button-unchecked"
                  }
                  size={20}
                  color={sortBy === "tanggal-terbaru" ? "#1F72F1" : "#8E8E93"}
                />
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.sortOption}
                onPress={() => setSortBy("tanggal-terlama")}
              >
                <MaterialIcons
                  name="calendar-today"
                  size={20}
                  color="#1F72F1"
                />
                <Text style={styles.optionText}>Terlama</Text>
                <MaterialIcons
                  name={
                    sortBy === "tanggal-terlama"
                      ? "radio-button-checked"
                      : "radio-button-unchecked"
                  }
                  size={20}
                  color={sortBy === "tanggal-terlama" ? "#1F72F1" : "#8E8E93"}
                />
              </TouchableOpacity>
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Status Tiket</Text>

              {[
                { status: "Diterima", icon: "edit-document", color: "#FF8636" },
                { status: "Verifikasi", icon: "verified", color: "#FFB600" },
                { status: "Diproses", icon: "history", color: "#B3BE47" },
                { status: "Selesai", icon: "check-circle-outline", color: "#66C4BE" },
                { status: "Ditolak", icon: "block", color: "#E24646" },
              ].map(({ status, icon, color }) => (
                <TouchableOpacity
                  key={status}
                  style={styles.statusOption}
                  onPress={() => toggleStatus(status)}
                >
                  <MaterialIcons name={icon as any} size={20} color={color} />
                  <Text style={styles.optionText}>{status}</Text>
                  <MaterialIcons
                    name={
                      selectedStatus.includes(status)
                        ? "check-box"
                        : "check-box-outline-blank"
                    }
                    size={20}
                    color={
                      selectedStatus.includes(status) ? "#1F72F1" : "#8E8E93"
                    }
                  />
                </TouchableOpacity>
              ))}
            </View>

            <View style={styles.buttonContainer}>
              <TouchableOpacity style={styles.clearButton} onPress={onClear}>
                <Text style={styles.clearText}>Hapus</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.applyButton,
                  !hasFilters && styles.disabledButton,
                ]}
                onPress={onApply}
                disabled={!hasFilters}
              >
                <Text
                  style={[
                    styles.applyText,
                    !hasFilters && styles.disabledText,
                  ]}
                >
                  Terapkan
                </Text>
              </TouchableOpacity>
            </View>
          </Animated.View>
        </Animated.View>
      )}
    </Modal>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "flex-end",
  },
  touchableOverlay: {
    flex: 1,
  },
  bottomSheet: {
    backgroundColor: "#fff",
    borderTopLeftRadius: Platform.OS === "android" ? wp(5) : 20,
    borderTopRightRadius: Platform.OS === "android" ? wp(5) : 20,
    paddingHorizontal: wp(5),
    paddingTop: Platform.OS === "android" ? hp(1) : hp(2.5),
    paddingBottom: Platform.OS === "android" ? hp(1) : 0,
    ...Platform.select({
      android: {
        minHeight: deviceType.isSmall ? hp(75) : hp(72),
        elevation: 10,
      },
      ios: {
        maxHeight: deviceType.isTablet ? "60%" : "70%",
        shadowColor: "#000",
        shadowOffset: { width: 0, height: -2 },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
      },
    }),
  },
  dragIndicator: {
    width: wp(12),
    height: hp(0.5),
    backgroundColor: "#E0E0E0",
    borderRadius: wp(1),
    alignSelf: "center",
    marginBottom: hp(2),
    display: Platform.OS === "android" ? "flex" : "none",
  },
  sheetHeader: {
    alignItems: "center",
    marginBottom: Platform.OS === "android" ? hp(2.5) : 20,
  },
  sheetTitle: {
    fontSize: rf(18),
    fontFamily: Fonts.semiBold,
    color: "#333",
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: rf(16),
    fontFamily: Fonts.medium,
    color: "#333",
    marginBottom: Platform.OS === "android" ? hp(1.2) : hp(1.5),
  },
  sortOption: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    gap: 12,
  },
  statusOption: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    gap: 12,
  },
  selectedOption: {
    backgroundColor: "#FFFFFF",
    display: Platform.OS === "android" ? "flex" : "none",
  },
  optionText: {
    flex: 1,
    fontSize: rf(14),
    fontFamily: Fonts.regular,
    color: "#333",
  },
  buttonContainer: {
    flexDirection: "row",
    gap: Platform.OS === "android" ? wp(3) : 12,
    paddingTop: Platform.OS === "android" ? hp(1.5) : 0,
    paddingBottom: Platform.OS === "android" ? hp(4) : 42,
    backgroundColor: "#fff",
    ...Platform.select({
      android: {
        borderTopWidth: 1,
        borderTopColor: "#F0F0F0",
        marginTop: hp(1),
      },
    }),
  },
  clearButton: {
    flex: 1,
    backgroundColor: "#E3F8F6",
    paddingVertical: Platform.OS === "android" ? hp(1.6) : 14,
    borderRadius: Platform.OS === "android" ? wp(2) : 8,
    alignItems: "center",
    ...Platform.select({
      android: {
        minHeight: hp(5.5),
        justifyContent: "center",
      },
    }),
  },
  clearText: {
    color: "#52B5AB",
    fontSize: Platform.OS === "android" ? rf(14) : 14,
    fontFamily: Fonts.medium,
  },
  applyButton: {
    flex: 1,
    backgroundColor: "#52B5AB",
    paddingVertical: Platform.OS === "android" ? hp(1.6) : 14,
    borderRadius: Platform.OS === "android" ? wp(2) : 8,
    alignItems: "center",
    ...Platform.select({
      android: {
        minHeight: hp(5.5),
        justifyContent: "center",
      },
    }),
  },
  applyText: {
    color: "#fff",
    fontSize: Platform.OS === "android" ? rf(14) : 14,
    fontFamily: Fonts.medium,
  },
  disabledButton: {
    backgroundColor: "#E5E5E5",
  },
  disabledText: {
    color: "#999",
  },
});
