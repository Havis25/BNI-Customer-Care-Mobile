import React, { useEffect, useRef } from 'react';
import { Modal, View, Text, TouchableOpacity, StyleSheet, Animated } from 'react-native';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { wp, hp, rf, deviceType } from '@/utils/responsive';

interface BottomSheetProps {
  visible: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

export default function BottomSheet({ visible, onClose, onConfirm }: BottomSheetProps) {
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

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="none"
      onRequestClose={onClose}
    >
      <Animated.View style={[styles.bottomSheetOverlay, { opacity: opacityAnim }]}>
        <TouchableOpacity 
          style={styles.bottomSheetBackdrop}
          onPress={onClose}
        />
        <Animated.View 
          style={[
            styles.bottomSheetContainer,
            { transform: [{ translateY: slideAnim }] }
          ]}
          onStartShouldSetResponder={() => true}
        >
          <MaterialIcons name="warning" size={64} color="#52B5AB" />
          <Text style={styles.bottomSheetTitle}>
            Yakin ingin membatalkan?
          </Text>
          <Text style={styles.bottomSheetSubtitle}>
            Data yang anda isi akan hilang
          </Text>
          
          <TouchableOpacity
            style={styles.confirmBackButton}
            onPress={onConfirm}
          >
            <Text style={styles.confirmBackText}>Kembali</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={styles.cancelButton}
            onPress={onClose}
          >
            <Text style={styles.cancelText}>Cancel</Text>
          </TouchableOpacity>
        </Animated.View>
      </Animated.View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  bottomSheetOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "flex-end",
  },
  bottomSheetBackdrop: {
    flex: 1,
  },
  bottomSheetContainer: {
    backgroundColor: "#FFF",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: wp(6),
    alignItems: "center",
    minHeight: deviceType.isTablet ? hp(30) : hp(35),
  },
  bottomSheetTitle: {
    fontSize: rf(18),
    fontWeight: "bold",
    color: "#333",
    marginTop: hp(2),
    marginBottom: hp(1),
    fontFamily: "Poppins",
  },
  bottomSheetSubtitle: {
    fontSize: rf(14),
    color: "#666",
    textAlign: "center",
    marginBottom: hp(4),
    fontFamily: "Poppins",
  },
  confirmBackButton: {
    backgroundColor: "#52B5AB",
    paddingVertical: hp(2),
    paddingHorizontal: wp(8),
    borderRadius: 8,
    width: "100%",
    alignItems: "center",
    marginBottom: hp(1.5),
  },
  confirmBackText: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#FFF",
    fontFamily: "Poppins",
  },
  cancelButton: {
    backgroundColor: "#FFF",
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 8,
    width: "100%",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#52B5AB",
  },
  cancelText: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#52B5AB",
    fontFamily: "Poppins",
  },
});