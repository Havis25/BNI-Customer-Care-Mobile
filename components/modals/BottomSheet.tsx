import React from 'react';
import { Modal, View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';

interface BottomSheetProps {
  visible: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

export default function BottomSheet({ visible, onClose, onConfirm }: BottomSheetProps) {
  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.bottomSheetOverlay}>
        <TouchableOpacity 
          style={styles.bottomSheetBackdrop}
          onPress={onClose}
        />
        <View style={styles.bottomSheetContainer}>
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
        </View>
      </View>
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
    padding: 24,
    alignItems: "center",
    minHeight: 280,
  },
  bottomSheetTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
    marginTop: 16,
    marginBottom: 8,
    fontFamily: "Poppins",
  },
  bottomSheetSubtitle: {
    fontSize: 14,
    color: "#666",
    textAlign: "center",
    marginBottom: 32,
    fontFamily: "Poppins",
  },
  confirmBackButton: {
    backgroundColor: "#52B5AB",
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 8,
    width: "100%",
    alignItems: "center",
    marginBottom: 12,
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