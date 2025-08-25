import React, { useEffect, useRef } from "react";
import {
  Animated,
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Platform,
  StatusBar,
  SafeAreaView,
} from "react-native";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { Fonts } from "@/constants/Fonts";
import { wp, hp, rf, deviceType, getScreenDimensions } from "@/utils/responsive";

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
      prev.includes(status) ? prev.filter((s) => s !== status) : [...prev, status]
    );
  };

  const screenDimensions = getScreenDimensions();
  const statusBarHeight = Platform.OS === 'android' ? StatusBar.currentHeight || 0 : 0;

  return (
    <Modal 
      visible={visible} 
      transparent 
      animationType="none"
      statusBarTranslucent={Platform.OS === 'android'}
    >
      <SafeAreaView style={styles.safeArea}>
        <Animated.View 
          style={[styles.modalOverlay, { opacity: opacityAnim }]}
        >
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
                maxHeight: screenDimensions.isTablet ? '60%' : '75%',
                paddingBottom: Platform.OS === 'android' ? hp(3) : hp(4),
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
                sortBy === "tanggal-terbaru" && styles.selectedOption
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
                sortBy === "tanggal-terlama" && styles.selectedOption
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
              { status: "Diterima", icon: "edit-document", color: "#FF8636" },
              { status: "Verfikasi", icon: "verified", color: "#FFB600" },
              { status: "Diproses", icon: "history", color: "#B3BE47" },
              { status: "Selesai", icon: "check-circle-outline", color: "#66C4BE" },
              { status: "Ditolak", icon: "block", color: "#E24646" },
            ].map(({ status, icon, color }) => (
              <TouchableOpacity
                key={status}
                style={[
                  styles.statusOption,
                  selectedStatus.includes(status) && styles.selectedOption
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
    minHeight: deviceType.isSmall ? hp(50) : hp(45),
    ...Platform.select({
      android: {
        elevation: 10,
      },
      ios: {
        shadowColor: '#000',
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
    backgroundColor: '#E0E0E0',
    borderRadius: wp(1),
    alignSelf: 'center',
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
  section: {
    marginBottom: hp(3),
  },
  sectionTitle: {
    fontSize: rf(16),
    fontFamily: Fonts.medium,
    color: "#333",
    marginBottom: hp(1.5),
  },
  sortOption: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: hp(1.5),
    paddingHorizontal: wp(3),
    borderRadius: wp(2),
    marginVertical: hp(0.5),
    minHeight: hp(6),
  },
  statusOption: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: hp(1.5),
    paddingHorizontal: wp(3),
    borderRadius: wp(2),
    marginVertical: hp(0.5),
    minHeight: hp(6),
  },
  selectedOption: {
    backgroundColor: '#F0F8FF',
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
    paddingTop: hp(2),
    paddingBottom: Platform.OS === 'android' ? hp(3) : hp(4),
  },
  clearButton: {
    flex: 1,
    backgroundColor: "#E3F8F6",
    paddingVertical: hp(1.8),
    borderRadius: wp(2),
    alignItems: "center",
    minHeight: hp(6),
    justifyContent: 'center',
  },
  clearText: {
    color: "#52B5AB",
    fontSize: rf(14),
    fontFamily: Fonts.medium,
  },
  applyButton: {
    flex: 1,
    backgroundColor: "#52B5AB",
    paddingVertical: hp(1.8),
    borderRadius: wp(2),
    alignItems: "center",
    minHeight: hp(6),
    justifyContent: 'center',
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