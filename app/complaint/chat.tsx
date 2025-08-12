import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { router, useLocalSearchParams } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  Image,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import CallModal from "@/components/modals/CallModal";

const chatMessages = [
  {
    id: 1,
    text: "Halo! Saya BNI Assistant. Saya siap membantu Anda dengan keluhan atau masalah perbankan. Bisa ceritakan masalah yang Anda alami?",
    isBot: true,
    timestamp: "10:30",
  },
  {
    id: 2,
    text: "Halo, saya mengalami masalah dengan kartu ATM saya",
    isBot: false,
    timestamp: "10:31",
  },
  {
    id: 3,
    text: "Baik, saya akan membantu Anda dengan masalah kartu ATM. Bisa dijelaskan lebih detail masalah apa yang Anda alami?",
    isBot: true,
    timestamp: "10:31",
  },
  {
    id: 4,
    text: "Kartu ATM saya tertelan di mesin ATM BNI Thamrin",
    isBot: false,
    timestamp: "10:32",
  },
  {
    id: 5,
    text: "Saya mengerti situasinya. Apakah Anda ingin saya buatkan tiket complaint untuk masalah ini?",
    isBot: true,
    timestamp: "10:32",
    hasButtons: true,
  },
  {
    id: 6,
    text: "📞 Panggilan dari BNI Agent diangkat",
    isBot: true,
    timestamp: "10:35",
    isCallLog: true,
  },
  {
    id: 7,
    text: "📞 Panggilan berakhir - Durasi: 3 menit",
    isBot: true,
    timestamp: "10:38",
    isCallLog: true,
  },
];

export default function ChatScreen() {
  const { callDeclined, fromConfirmation, callEnded } = useLocalSearchParams();
  const [messages, setMessages] = useState(chatMessages);
  const [showLiveChatModal, setShowLiveChatModal] = useState(false);
  const [showCallModal, setShowCallModal] = useState(false);
  const [callStatus, setCallStatus] = useState("incoming");
  const [isLiveChat, setIsLiveChat] = useState(false);
  const [inputText, setInputText] = useState("");

  useEffect(() => {
    if (fromConfirmation === "true") {
      const verificationMessage = {
        id: messages.length + 1,
        text: "Terima kasih telah mengisi formulir complaint. Selanjutnya adalah tahapan verifikasi. Agent kami akan melakukan panggilan untuk verifikasi data Anda. Apakah Anda siap menerima panggilan?",
        isBot: true,
        timestamp: new Date().toLocaleTimeString("id-ID", {
          hour: "2-digit",
          minute: "2-digit",
        }),
        hasVerificationButtons: true,
      };
      setMessages((prev) => [...prev, verificationMessage]);
    }
    
    if (callDeclined === "true") {
      const newMessage = {
        id: messages.length + 1,
        text: "Panggilan tidak dapat terhubung. Apakah Anda ingin melakukan live chat dengan agent kami?",
        isBot: true,
        timestamp: new Date().toLocaleTimeString("id-ID", {
          hour: "2-digit",
          minute: "2-digit",
        }),
        hasLiveChatButtons: true,
      };
      setMessages((prev) => [...prev, newMessage]);
    }
    
    if (callEnded === "true") {
      const endMessage = {
        id: messages.length + 1,
        text: "Panggilan dengan agent telah berakhir. Terima kasih atas waktu Anda. Apakah ada yang bisa kami bantu lagi?",
        isBot: true,
        timestamp: new Date().toLocaleTimeString("id-ID", {
          hour: "2-digit",
          minute: "2-digit",
        }),
      };
      setMessages((prev) => [...prev, endMessage]);
    }
  }, [callDeclined, fromConfirmation, callEnded]);

  const handleSendMessage = () => {
    if (inputText.trim() && isLiveChat) {
      const newMessage = {
        id: messages.length + 1,
        text: inputText,
        isBot: false,
        timestamp: new Date().toLocaleTimeString("id-ID", {
          hour: "2-digit",
          minute: "2-digit",
        }),
      };
      setMessages((prev) => [...prev, newMessage]);
      setInputText("");
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <MaterialIcons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>

        <View style={styles.avatarContainer}>
          <Image
            source={require("@/assets/images/log-bcare.png")}
            style={styles.avatarImage}
            resizeMode="contain"
          />
        </View>

        <View style={styles.headerInfo}>
          <Text style={styles.headerTitle}>Chat Agent</Text>
          <View style={styles.statusContainer}>
            <MaterialIcons name="circle" size={8} color="#4CAF50" />
            <Text style={styles.statusText}>Online</Text>
          </View>
        </View>

        <View style={{ width: 24 }} />
      </View>

      {/* Chat Messages */}
      <ScrollView style={styles.chatContainer}>
        {messages.map((message) => (
          <View
            key={message.id}
            style={[
              styles.messageContainer,
              message.isBot ? styles.botMessage : styles.userMessage,
            ]}
          >
            <View
              style={[
                styles.messageBubble,
                message.isBot ? styles.botBubble : styles.userBubble,
              ]}
            >
              <Text
                style={[
                  styles.messageText,
                  message.isBot ? styles.botText : styles.userText,
                ]}
              >
                {message.text}
              </Text>
              <Text style={styles.timestamp}>{message.timestamp}</Text>
            </View>
            {message.hasButtons && (
              <View style={styles.buttonContainer}>
                <TouchableOpacity
                  style={styles.yesButton}
                  onPress={() => router.push("/complaint/confirmation")}
                >
                  <Text style={styles.buttonText}>Iya</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.noButton}>
                  <Text style={styles.buttonText}>Tidak</Text>
                </TouchableOpacity>
              </View>
            )}
            {(message as any).hasVerificationButtons && (
              <View style={styles.buttonContainer}>
                <TouchableOpacity
                  style={styles.yesButton}
                  onPress={() => setShowCallModal(true)}
                >
                  <Text style={styles.buttonText}>Iya</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  style={styles.noButton}
                  onPress={() => {
                    const liveChatQuestion = {
                      id: messages.length + 1,
                      text: "Apakah Anda ingin melakukan live chat dengan agent kami?",
                      isBot: true,
                      timestamp: new Date().toLocaleTimeString("id-ID", {
                        hour: "2-digit",
                        minute: "2-digit",
                      }),
                      hasLiveChatButtons: true,
                    };
                    setMessages((prev) => [...prev, liveChatQuestion]);
                  }}
                >
                  <Text style={styles.buttonText}>Tidak</Text>
                </TouchableOpacity>
              </View>
            )}
            {(message as any).hasLiveChatButtons && (
              <View style={styles.buttonContainer}>
                <TouchableOpacity
                  style={styles.yesButton}
                  onPress={() => {
                    const liveChatConnected = {
                      id: messages.length + 1,
                      text: "Sekarang Anda terhubung ke live chat. Apakah Anda ingin melakukan konfirmasi by call?",
                      isBot: true,
                      timestamp: new Date().toLocaleTimeString("id-ID", {
                        hour: "2-digit",
                        minute: "2-digit",
                      }),
                      hasCallConfirmButtons: true,
                    };
                    setMessages((prev) => [...prev, liveChatConnected]);
                    setIsLiveChat(true);
                  }}
                >
                  <Text style={styles.buttonText}>Ya</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.noButton}>
                  <Text style={styles.buttonText}>Tidak</Text>
                </TouchableOpacity>
              </View>
            )}
            {(message as any).hasCallConfirmButtons && (
              <View style={styles.buttonContainer}>
                <TouchableOpacity
                  style={styles.yesButton}
                  onPress={() => setShowCallModal(true)}
                >
                  <Text style={styles.buttonText}>Iya</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  style={styles.noButton}
                  onPress={() => {
                    const repeatQuestion = {
                      id: messages.length + 1,
                      text: "Baik, Anda tetap terhubung dengan live chat. Apakah Anda ingin melakukan konfirmasi by call?",
                      isBot: true,
                      timestamp: new Date().toLocaleTimeString("id-ID", {
                        hour: "2-digit",
                        minute: "2-digit",
                      }),
                      hasCallConfirmButtons: true,
                    };
                    setMessages((prev) => [...prev, repeatQuestion]);
                  }}
                >
                  <Text style={styles.buttonText}>Tidak</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        ))}
      </ScrollView>

      {/* Input Area */}
      <View style={styles.inputContainer}>
        <TouchableOpacity style={styles.addFileButton}>
          <MaterialIcons name="add" size={24} color="#FFF" />
        </TouchableOpacity>
        <TextInput
          style={styles.textInput}
          placeholder={
            isLiveChat ? "Ketik pesan Anda..." : "Live chat tidak aktif"
          }
          value={inputText}
          onChangeText={setInputText}
          editable={isLiveChat}
          multiline
        />
        <TouchableOpacity onPress={handleSendMessage} disabled={!isLiveChat}>
          <MaterialIcons name="send" size={20} color="#FF8636" />
        </TouchableOpacity>
      </View>

      {/* Live Chat Modal */}
      <Modal
        visible={showLiveChatModal}
        transparent={true}
        animationType="fade"
      >
        <View style={styles.modalOverlay}>
          <View style={styles.liveChatModal}>
            <MaterialIcons name="support-agent" size={60} color="#52B5AB" />
            <Text style={styles.modalTitle}>Menghubungkan ke Live Chat</Text>
            <Text style={styles.modalSubtitle}>
              Sedang mencari agent yang tersedia...
            </Text>

            <TouchableOpacity
              style={styles.connectButton}
              onPress={() => {
                setShowLiveChatModal(false);
                setIsLiveChat(true);
                const connectMessage = {
                  id: messages.length + 1,
                  text: "Anda telah terhubung dengan live chat. Silakan mulai percakapan.",
                  isBot: true,
                  timestamp: new Date().toLocaleTimeString("id-ID", {
                    hour: "2-digit",
                    minute: "2-digit",
                  }),
                };
                setMessages((prev) => [...prev, connectMessage]);
              }}
            >
              <Text style={styles.connectButtonText}>Terhubung</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
      
      {/* Call Modal */}
      <CallModal
        visible={showCallModal}
        callStatus={callStatus}
        onStatusChange={setCallStatus}
        onClose={() => setShowCallModal(false)}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 24,
    backgroundColor: "#FFFFFF",
    borderBottomWidth: 1,
    borderBottomColor: "#E0E0E0",
  },
  backButton: {
    padding: 8,
  },
  avatarContainer: {
    marginLeft: 8,
    width: 40,
    height: 40,
    borderRadius: 20,
    overflow: "hidden",
  },
  avatarImage: {
    width: 40,
    height: 40,
  },
  headerInfo: {
    flex: 1,
    marginLeft: 12,
    alignItems: "flex-start",
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
    fontFamily: "Poppins",
  },
  statusContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 2,
  },
  statusText: {
    fontSize: 12,
    color: "#4CAF50",
    marginLeft: 4,
    fontFamily: "Poppins",
  },
  chatContainer: {
    flex: 1,
    padding: 16,
    backgroundColor: "#FFFFFF",
  },
  messageContainer: {
    marginBottom: 16,
  },
  botMessage: {
    alignItems: "flex-start",
  },
  userMessage: {
    alignItems: "flex-end",
  },
  messageBubble: {
    maxWidth: "80%",
    padding: 12,
    borderRadius: 18,
  },
  botBubble: {
    backgroundColor: "#FFF3EB",
    borderBottomLeftRadius: 4,
  },
  userBubble: {
    backgroundColor: "#FF8636",
    borderBottomRightRadius: 4,
  },
  messageText: {
    fontSize: 14,
    lineHeight: 20,
    fontFamily: "Poppins",
  },
  botText: {
    color: "#000",
  },
  userText: {
    color: "#FFF",
  },
  timestamp: {
    fontSize: 10,
    opacity: 0.6,
    marginTop: 4,
    alignSelf: "flex-end",
    fontFamily: "Poppins",
  },
  inputContainer: {
    flexDirection: "row",
    padding: 16,
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    borderTopWidth: 1,
    borderTopColor: "#E0E0E0",
  },
  textInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#E0E0E0",
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
    marginRight: 12,
    backgroundColor: "#F5F5F5",
    fontSize: 14,
    maxHeight: 100,
    fontFamily: "Poppins",
  },
  addFileButton: {
    width: 40,
    height: 40,
    backgroundColor: "#FF8636",
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 8,
  },
  sendButton: {
    width: 40,
    height: 40,
    backgroundColor: "#FF8636",
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  disabledSendButton: {
    backgroundColor: "#E0E0E0",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.8)",
    justifyContent: "center",
    alignItems: "center",
  },
  liveChatModal: {
    backgroundColor: "#FFF",
    padding: 30,
    borderRadius: 20,
    alignItems: "center",
    width: 280,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
    marginTop: 16,
    textAlign: "center",
    fontFamily: "Poppins",
  },
  modalSubtitle: {
    fontSize: 14,
    color: "#666",
    marginTop: 8,
    marginBottom: 20,
    textAlign: "center",
    fontFamily: "Poppins",
  },
  connectButton: {
    backgroundColor: "#52B5AB",
    paddingHorizontal: 30,
    paddingVertical: 12,
    borderRadius: 25,
  },
  connectButtonText: {
    color: "#FFF",
    fontSize: 16,
    fontWeight: "bold",
    fontFamily: "Poppins",
  },
  buttonContainer: {
    flexDirection: "row",
    marginTop: 8,
    gap: 8,
  },
  yesButton: {
    backgroundColor: "#FFF3EB",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 16,
  },
  noButton: {
    backgroundColor: "#FFF3EB",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 16,
  },
  buttonText: {
    fontSize: 12,
    fontWeight: "500",
    color: "#000",
    fontFamily: "Poppins",
  },
});
