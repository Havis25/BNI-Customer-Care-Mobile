import React, { useEffect, useRef } from "react";
import {
  Animated,
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { Fonts } from "@/constants/Fonts";
import { wp, hp, rf, deviceType } from "@/utils/responsive";

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

  return (
    <Modal visible={visible} transparent animationType="none">
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
              { status: "Verfikasi", icon: "verified", color: "#FFB600" },
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
    </Modal>
  );
}

const styles = StyleSheet.create({
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
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingHorizontal: wp(5),
    paddingTop: hp(2.5),
    paddingBottom: 0,
    maxHeight: deviceType.isTablet ? "60%" : "70%",
  },
  sheetHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 20,
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
    marginBottom: hp(1.5),
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
  optionText: {
    flex: 1,
    fontSize: rf(14),
    fontFamily: Fonts.regular,
    color: "#333",
  },
  buttonContainer: {
    flexDirection: "row",
    gap: 12,
    paddingBottom: 42,
  },
  clearButton: {
    flex: 1,
    backgroundColor: "#E3F8F6",
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: "center",
  },
  clearText: {
    color: "#52B5AB",
    fontSize: 14,
    fontFamily: Fonts.medium,
  },
  applyButton: {
    flex: 1,
    backgroundColor: "#52B5AB",
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: "center",
  },
  applyText: {
    color: "#fff",
    fontSize: 14,
    fontFamily: Fonts.medium,
  },
  disabledButton: {
    backgroundColor: "#E5E5E5",
  },
  disabledText: {
    color: "#999",
  },
});