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
  ActivityIndicator,
  TouchableWithoutFeedback,
  Keyboard,
} from "react-native";
import { Fonts } from "@/constants/Fonts";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { useFeedback } from "@/hooks/useFeedback";

interface FeedbackModalProps {
  visible: boolean;
  onClose: () => void;
  ticketId: string;
  onSuccess?: () => void;
}

export default function FeedbackModal({ visible, onClose, ticketId, onSuccess }: FeedbackModalProps) {
  const [score, setScore] = useState(0);
  const [comment, setComment] = useState("");
  const { submitFeedback, isLoading } = useFeedback();

  const handleClose = () => {
    Alert.alert("Peringatan", "Anda harus memberikan feedback terlebih dahulu untuk melanjutkan");
  };

  const handleSubmitFeedback = async () => {
    if (score === 0) {
      Alert.alert("Error", "Mohon berikan rating terlebih dahulu");
      return;
    }
    
    const success = await submitFeedback(ticketId, { score, comment });
    
    if (success) {
      Alert.alert("Terima Kasih", "Feedback Anda telah terkirim", [
        { text: "OK", onPress: () => {
          setScore(0);
          setComment("");
          onSuccess?.();
          onClose();
        }}
      ]);
    } else {
      Alert.alert("Error", "Gagal mengirim feedback. Silakan coba lagi.");
    }
  };

  const renderStars = () => {
    return (
      <View style={styles.starsContainer}>
        {[1, 2, 3, 4, 5].map((star) => (
          <TouchableOpacity
            key={star}
            onPress={() => setScore(star)}
            style={styles.starButton}
          >
            <MaterialIcons
              name={star <= score ? "star" : "star-border"}
              size={28}
              color={star <= score ? "#FFD700" : "#E0E0E0"}
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
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
      >
        <View style={styles.modalOverlay}>
          <TouchableOpacity 
            style={styles.modalBackdrop}
            onPress={handleClose}
          />
          <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
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
            style={[styles.submitButton, (score === 0 || isLoading) && styles.disabledButton]}
            onPress={handleSubmitFeedback}
            disabled={score === 0 || isLoading}
          >
            {isLoading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={[styles.submitText, (score === 0 || isLoading) && styles.disabledText]}>
                Kirim
              </Text>
            )}
          </TouchableOpacity>
            </View>
          </TouchableWithoutFeedback>
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