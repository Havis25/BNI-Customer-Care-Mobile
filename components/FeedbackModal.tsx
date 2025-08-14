import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  TextInput,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { Fonts } from "@/constants/Fonts";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";

interface FeedbackModalProps {
  visible: boolean;
  onClose: () => void;
}

export default function FeedbackModal({ visible, onClose }: FeedbackModalProps) {
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");

  const handleClose = () => {
    if (rating === 0) {
      Alert.alert("Peringatan", "Mohon berikan rating terlebih dahulu sebelum menutup");
      return;
    }
    onClose();
  };

  const handleSubmitFeedback = () => {
    if (rating === 0) {
      Alert.alert("Error", "Mohon berikan rating terlebih dahulu");
      return;
    }
    
    Alert.alert("Terima Kasih", "Feedback Anda telah terkirim", [
      { text: "OK", onPress: () => {
        setRating(0);
        setComment("");
        onClose();
      }}
    ]);
  };

  const renderStars = () => {
    return (
      <View style={styles.starsContainer}>
        {[1, 2, 3, 4, 5].map((star) => (
          <TouchableOpacity
            key={star}
            onPress={() => setRating(star)}
            style={styles.starButton}
          >
            <MaterialIcons
              name={star <= rating ? "star" : "star-border"}
              size={28}
              color={star <= rating ? "#FFD700" : "#E0E0E0"}
            />
          </TouchableOpacity>
        ))}
      </View>
    );
  };

  return (
    <Modal 
      visible={visible} 
      transparent 
      animationType="slide"
      onRequestClose={handleClose}
    >
      <KeyboardAvoidingView 
        style={styles.keyboardView}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <View style={styles.modalOverlay}>
          <TouchableOpacity 
            style={styles.modalBackdrop}
            onPress={handleClose}
          />
          <View style={styles.feedbackSheet}>
          <View style={styles.sheetHeader}>
            <Text style={styles.sheetTitle}>Berikan Feedback</Text>
            {/* <TouchableOpacity onPress={handleClose}>
              <MaterialIcons name="close" size={24} color="#333" />
            </TouchableOpacity> */}
          </View>

          <Text style={styles.feedbackQuestion}>
            Bagaimana pengalaman Anda dengan layanan kami?
          </Text>

          <Text style={styles.ratingLabel}>Rating</Text>
          {renderStars()}

          <Text style={styles.commentLabel}>Komentar (Opsional)</Text>
          <TextInput
            style={styles.commentInput}
            placeholder="Tulis komentar Anda..."
            placeholderTextColor="#999"
            value={comment}
            onChangeText={setComment}
            multiline
            numberOfLines={3}
            textAlignVertical="top"
          />

          <TouchableOpacity
            style={[styles.submitButton, rating === 0 && styles.disabledButton]}
            onPress={handleSubmitFeedback}
            disabled={rating === 0}
          >
            <Text style={[styles.submitText, rating === 0 && styles.disabledText]}>
              Kirim
            </Text>
          </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  keyboardView: {
    flex: 1,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "flex-end",
  },
  modalBackdrop: {
    flex: 1,
  },
  feedbackSheet: {
    backgroundColor: "#fff",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 42,
    maxHeight: "70%",
  },
  sheetHeader: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 20,
  },
  sheetTitle: {
    fontSize: 18,
    fontFamily: Fonts.semiBold,
    color: "#333",
  },
  feedbackQuestion: {
    fontSize: 16,
    fontFamily: Fonts.medium,
    color: "#333",
    textAlign: "center",
    marginBottom: 24,
  },
  ratingLabel: {
    fontSize: 14,
    fontFamily: Fonts.medium,
    color: "#333",
    marginBottom: 8,
  },
  starsContainer: {
    flexDirection: "row",
    justifyContent: "center",
    marginBottom: 24,
  },
  starButton: {
    padding: 4,
  },
  commentLabel: {
    fontSize: 14,
    fontFamily: Fonts.medium,
    color: "#333",
    marginBottom: 8,
  },
  commentInput: {
    borderWidth: 1,
    borderColor: "#E0E0E0",
    borderRadius: 8,
    padding: 12,
    fontFamily: Fonts.regular,
    fontSize: 14,
    minHeight: 80,
    marginBottom: 24,
  },
  submitButton: {
    backgroundColor: "#52B5AB",
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: "center",
  },
  submitText: {
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