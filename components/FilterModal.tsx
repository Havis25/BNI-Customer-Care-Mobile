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
  ScrollView,
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
      // Background appears immediately
      Animated.timing(opacityAnim, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }).start();

      // Filter slides up from bottom
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }).start();
    } else {
      // Filter slides down first, then background fades
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
  const statusBarHeight =
    Platform.OS === "android" ? StatusBar.currentHeight || 0 : 0;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      statusBarTranslucent={Platform.OS === "android"}
    >
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
                maxHeight: screenDimensions.isTablet ? "75%" : "90%", // Increased for all content visibility
              },
            ]}
            onStartShouldSetResponder={() => true}
          >
            <View style={styles.sheetHeader}>
              <View style={styles.dragIndicator} />
              <Text style={styles.sheetTitle}>Filter & Urutkan</Text>
            </View>

            <ScrollView
              style={styles.content}
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.scrollContent}
            >
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

                <TouchableOpacity
                  key="Diterima"
                  style={[
                    styles.statusOption,
                    selectedStatus.includes("Diterima") &&
                      styles.selectedOption,
                  ]}
                  onPress={() => toggleStatus("Diterima")}
                  activeOpacity={0.7}
                >
                  <MaterialIcons
                    name="description"
                    size={rf(20)}
                    color="#FF8636"
                  />
                  <Text style={styles.optionText}>Diterima</Text>
                  <MaterialIcons
                    name={
                      selectedStatus.includes("Diterima")
                        ? "check-box"
                        : "check-box-outline-blank"
                    }
                    size={rf(20)}
                    color={
                      selectedStatus.includes("Diterima")
                        ? "#1F72F1"
                        : "#8E8E93"
                    }
                  />
                </TouchableOpacity>

                <TouchableOpacity
                  key="Verifikasi"
                  style={[
                    styles.statusOption,
                    selectedStatus.includes("Verifikasi") &&
                      styles.selectedOption,
                  ]}
                  onPress={() => toggleStatus("Verifikasi")}
                  activeOpacity={0.7}
                >
                  <MaterialIcons
                    name="verified"
                    size={rf(20)}
                    color="#FFB600"
                  />
                  <Text style={styles.optionText}>Verifikasi</Text>
                  <MaterialIcons
                    name={
                      selectedStatus.includes("Verifikasi")
                        ? "check-box"
                        : "check-box-outline-blank"
                    }
                    size={rf(20)}
                    color={
                      selectedStatus.includes("Verifikasi")
                        ? "#1F72F1"
                        : "#8E8E93"
                    }
                  />
                </TouchableOpacity>

                <TouchableOpacity
                  key="Diproses"
                  style={[
                    styles.statusOption,
                    selectedStatus.includes("Diproses") &&
                      styles.selectedOption,
                  ]}
                  onPress={() => toggleStatus("Diproses")}
                  activeOpacity={0.7}
                >
                  <MaterialIcons name="history" size={rf(20)} color="#B3BE47" />
                  <Text style={styles.optionText}>Diproses</Text>
                  <MaterialIcons
                    name={
                      selectedStatus.includes("Diproses")
                        ? "check-box"
                        : "check-box-outline-blank"
                    }
                    size={rf(20)}
                    color={
                      selectedStatus.includes("Diproses")
                        ? "#1F72F1"
                        : "#8E8E93"
                    }
                  />
                </TouchableOpacity>

                <TouchableOpacity
                  key="Selesai"
                  style={[
                    styles.statusOption,
                    selectedStatus.includes("Selesai") && styles.selectedOption,
                  ]}
                  onPress={() => toggleStatus("Selesai")}
                  activeOpacity={0.7}
                >
                  <MaterialIcons
                    name="check-circle"
                    size={rf(20)}
                    color="#66C4BE"
                  />
                  <Text style={styles.optionText}>Selesai</Text>
                  <MaterialIcons
                    name={
                      selectedStatus.includes("Selesai")
                        ? "check-box"
                        : "check-box-outline-blank"
                    }
                    size={rf(20)}
                    color={
                      selectedStatus.includes("Selesai") ? "#1F72F1" : "#8E8E93"
                    }
                  />
                </TouchableOpacity>

                <TouchableOpacity
                  key="Ditolak"
                  style={[
                    styles.statusOption,
                    selectedStatus.includes("Ditolak") && styles.selectedOption,
                  ]}
                  onPress={() => toggleStatus("Ditolak")}
                  activeOpacity={0.7}
                >
                  <MaterialIcons name="cancel" size={rf(20)} color="#E24646" />
                  <Text style={styles.optionText}>Ditolak</Text>
                  <MaterialIcons
                    name={
                      selectedStatus.includes("Ditolak")
                        ? "check-box"
                        : "check-box-outline-blank"
                    }
                    size={rf(20)}
                    color={
                      selectedStatus.includes("Ditolak") ? "#1F72F1" : "#8E8E93"
                    }
                  />
                </TouchableOpacity>
              </View>
            </ScrollView>

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
    borderTopLeftRadius: wp(5),
    borderTopRightRadius: wp(5),
    paddingHorizontal: wp(5),
    paddingTop: hp(1),
    paddingBottom: hp(1),
    minHeight: deviceType.isSmall ? hp(75) : hp(72), // Increased significantly more for all 5 status options
    ...Platform.select({
      android: {
        elevation: 10,
      },
      ios: {
        shadowColor: "#000",
        shadowOffset: {
          width: 0,
          height: -2,
        },
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
  },
  sheetHeader: {
    alignItems: "center",
    marginBottom: hp(2.5),
  },
  sheetTitle: {
    fontSize: rf(18),
    fontFamily: Fonts.semiBold,
    color: "#333",
  },
  content: {
    flex: 1,
    paddingBottom: hp(1), // Add some padding at bottom
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: hp(2),
  },
  section: {
    marginBottom: hp(2.5), // Reduced margin for better spacing
  },
  sectionTitle: {
    fontSize: rf(16),
    fontFamily: Fonts.medium,
    color: "#333",
    marginBottom: hp(1.2), // Reduced for more compact layout
  },
  sortOption: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: hp(1.2), // Slightly reduced padding
    paddingHorizontal: wp(3),
    borderRadius: wp(2),
    marginVertical: hp(0.3), // Reduced margin
    minHeight: hp(5.5), // Slightly smaller height
  },
  statusOption: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: hp(1.5), // Increased padding
    paddingHorizontal: wp(3),
    borderRadius: wp(2),
    marginVertical: hp(0.5), // Increased margin
    minHeight: hp(6), // Increased height
  },
  selectedOption: {
    backgroundColor: "#F0F8FF",
  },
  optionText: {
    flex: 1,
    fontSize: rf(14),
    fontFamily: Fonts.regular,
    color: "#333",
    marginLeft: wp(3),
  },
  buttonContainer: {
    flexDirection: "row",
    gap: wp(3),
    paddingTop: hp(1.5),
    paddingBottom: Platform.OS === "android" ? hp(4) : hp(3), // Reduced padding for better fit
    backgroundColor: "#fff", // Ensure background is white
    borderTopWidth: Platform.OS === "android" ? 1 : 0, // Add subtle separator on Android
    borderTopColor: "#F0F0F0",
    marginTop: hp(1), // Small margin to separate from content
  },
  clearButton: {
    flex: 1,
    backgroundColor: "#E3F8F6",
    paddingVertical: hp(1.6), // Slightly reduced
    borderRadius: wp(2),
    alignItems: "center",
    minHeight: hp(5.5), // Reduced height
    justifyContent: "center",
  },
  clearText: {
    color: "#52B5AB",
    fontSize: rf(14),
    fontFamily: Fonts.medium,
  },
  applyButton: {
    flex: 1,
    backgroundColor: "#52B5AB",
    paddingVertical: hp(1.6), // Slightly reduced
    borderRadius: wp(2),
    alignItems: "center",
    minHeight: hp(5.5), // Reduced height
    justifyContent: "center",
  },
  applyText: {
    color: "#fff",
    fontSize: rf(14),
    fontFamily: Fonts.medium,
  },
  disabledButton: {
    backgroundColor: "#E5E5E5",
  },
  disabledText: {
    color: "#999",
  },
});
