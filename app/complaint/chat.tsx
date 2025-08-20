import BottomSheet from "@/components/modals/BottomSheet";
import CallModal from "@/components/modals/CallModal";
import TicketSummaryModal from "@/components/modals/TicketSummaryModal";
import UploadModal from "@/components/modals/UploadModal";
import { useAuth } from "@/hooks/useAuth";
import { useTicketAttachments } from "@/hooks/useTicketAttachments";
import { useUser } from "@/hooks/useUser";
import { getSocket } from "@/src/realtime/socket";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { CameraView, useCameraPermissions } from "expo-camera";
import { router, useLocalSearchParams } from "expo-router";
import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  Alert,
  Image,
  KeyboardAvoidingView,
  Linking,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

type MessageType = {
  id: string | number;
  text: string;
  isBot: boolean;
  timestamp: string;
  hasButtons?: boolean;
  hasValidationButtons?: boolean;
  hasVerificationButtons?: boolean;
  hasLiveChatButtons?: boolean;
  hasCallConfirmButtons?: boolean;
  hasTicketButton?: boolean;
  isCallLog?: boolean;
  isFile?: boolean;
  isImage?: boolean;
  fileName?: string;
  downloadUrl?: string;
  author?: { id: string; firstName?: string };
  createdAt?: number;
  type?: string;
  room?: string;
};

type Peer = { sid: string; userId: string };
type CallStatus = "idle" | "ringing" | "in-call";

const MAX_MSG = 200;

const chatMessages: MessageType[] = [
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
];

export default function ChatScreen() {
  const { callDeclined, fromConfirmation, callEnded, room, ticketId } =
    useLocalSearchParams();
  const { user } = useUser();
  const { user: authUser } = useAuth();
  const urlRoom = typeof room === "string" && room.trim() ? room : "general";
  const fallbackCallRoom = `call:${urlRoom}`;

  const socket = getSocket();
  const temp_uid = String(
    authUser?.customer_id ||
      authUser?.id ||
      user?.customer_id ||
      user?.id ||
      "guest"
  );
  const uid = `CUS-${temp_uid}`;
  const chatUser = useMemo(
    () => ({ id: String(uid), firstName: "You" }),
    [uid]
  );

  const [messages, setMessages] = useState<MessageType[]>([]);
  const [connected, setConnected] = useState(false);
  const [authed, setAuthed] = useState(false);
  const [socketId, setSocketId] = useState<string>("");

  // DM / pairing
  const [dmRoom, setDmRoom] = useState<string | null>(null);
  const dmRoomRef = useRef<string | null>(null);
  useEffect(() => {
    dmRoomRef.current = dmRoom;
  }, [dmRoom]);

  // Room aktif untuk call & fallback chat
  const ACTIVE_ROOM = useMemo(
    () => dmRoom ?? fallbackCallRoom,
    [dmRoom, fallbackCallRoom]
  );
  const storageKey = `msgs:${ACTIVE_ROOM}`;

  // Presence & call
  const [activePeers, setActivePeers] = useState<Peer[]>([]);
  const [peerCount, setPeerCount] = useState(1);
  const [showLiveChatModal, setShowLiveChatModal] = useState(false);
  const [showCallModal, setShowCallModal] = useState(false);
  const [callStatus, setCallStatus] = useState<CallStatus>("idle");
  const [isLiveChat, setIsLiveChat] = useState(false);
  const [remoteFrame, setRemoteFrame] = useState<string | null>(null);
  const [permission, requestPermission] = useCameraPermissions();
  const camRef = useRef<React.ElementRef<typeof CameraView> | null>(null);
  const frameTimer = useRef<ReturnType<typeof setInterval> | null>(null);
  const FPS = 1.5;
  const [inputText, setInputText] = useState("");
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [showBottomSheet, setShowBottomSheet] = useState(false);
  const [showTicketModal, setShowTicketModal] = useState(false);
  const [currentTicketId, setCurrentTicketId] = useState<string | null>(null);
  const [timeoutId, setTimeoutId] = useState<number | null>(null);
  const [callStartTime, setCallStartTime] = useState<number | null>(null);
  const scrollViewRef = useRef<ScrollView>(null);
  const messageIdRef = useRef(1000);

  // Attachment management
  const {
    attachments,
    isLoading: attachmentsLoading,
    fetchAttachments,
    deleteAttachment,
  } = useTicketAttachments();

  const getUniqueId = () => {
    return `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  };

  const showAgentChatQuestion = () => {
    const agentChatQuestion = {
      id: getUniqueId(),
      text: "Apakah Anda ingin melakukan chat dengan agent kami?",
      isBot: true,
      timestamp: new Date().toLocaleTimeString("id-ID", {
        hour: "2-digit",
        minute: "2-digit",
      }),
      hasLiveChatButtons: true,
    };
    setMessages((prev) => [...prev, agentChatQuestion]);
  };

  const startTimeout = () => {
    if (timeoutId) clearTimeout(timeoutId);
    const id = setTimeout(() => {
      showAgentChatQuestion();
    }, 10000);
    setTimeoutId(id);
  };

  const clearCurrentTimeout = () => {
    if (timeoutId) {
      clearTimeout(timeoutId);
      setTimeoutId(null);
    }
  };

  const handleUploadSuccess = (
    fileName: string,
    type: "image" | "document",
    downloadUrl?: string
  ) => {
    const message = {
      id: getUniqueId(),
      text: `File berhasil dikirim ke tiket #${
        currentTicketId?.slice(-6) || "unknown"
      }`,
      isBot: false,
      timestamp: new Date().toLocaleTimeString("id-ID", {
        hour: "2-digit",
        minute: "2-digit",
      }),
      isFile: type === "document",
      isImage: type === "image",
      fileName,
      downloadUrl,
    };
    setMessages((prev) => [...prev, message]);

    // Refresh attachments after successful upload
    if (currentTicketId) {
      setTimeout(() => {
        fetchAttachments(currentTicketId);
      }, 1500); // Give server time to process
    }
  };

  const handleDeleteFile = async (attachmentId: number) => {
    if (!currentTicketId) return;

    const success = await deleteAttachment(currentTicketId, attachmentId);
    if (success) {
      // Add message to chat about file deletion
      const deleteMessage = {
        id: getUniqueId(),
        text: `File berhasil dihapus dari tiket #${currentTicketId.slice(-6)}`,
        isBot: false,
        timestamp: new Date().toLocaleTimeString("id-ID", {
          hour: "2-digit",
          minute: "2-digit",
        }),
      };
      setMessages((prev) => [...prev, deleteMessage]);
    }
  };

  useEffect(() => {
    const initializeTicket = async () => {
      // Always try to get ticket ID from storage first
      try {
        const storedTicketId = await AsyncStorage.getItem("currentTicketId");
        if (storedTicketId) {
          setCurrentTicketId(storedTicketId);
        }
      } catch (error) {
        // Error reading from storage
      }
      
      if (fromConfirmation === "true") {
        // Try to get ticket ID from URL params
        if (ticketId && typeof ticketId === "string") {
          setCurrentTicketId(ticketId);
          await AsyncStorage.setItem("currentTicketId", ticketId);
        }

        const ticketCreatedMessage = {
          id: getUniqueId(),
          text: "Terima kasih, tiket Anda telah berhasil dibuat!",
          isBot: true,
          timestamp: new Date().toLocaleTimeString("id-ID", {
            hour: "2-digit",
            minute: "2-digit",
          }),
          hasTicketButton: true,
        };
        setMessages((prev) => {
          // Avoid duplicate messages
          const exists = prev.find(
            (m) => m.hasTicketButton && m.text.includes("berhasil dibuat")
          );
          if (exists) return prev;
          const newMessages = [...prev, ticketCreatedMessage];
          // Save to AsyncStorage
          AsyncStorage.setItem(
            storageKey,
            JSON.stringify(
              newMessages.filter((m) => !chatMessages.find((cm) => cm.id === m.id))
            )
          );
          console.log('[DEBUG] Saved ticket created message to storage');
          return newMessages;
        });

        // Show validation message after 3 seconds
        const timeoutId = setTimeout(() => {
          const validationMessage = {
            id: getUniqueId(),
            text: "Selanjutnya mari lakukan validasi dengan agent. Pilih metode validasi:",
            isBot: true,
            timestamp: new Date().toLocaleTimeString("id-ID", {
              hour: "2-digit",
              minute: "2-digit",
            }),
            hasValidationButtons: true,
          };
          setMessages((prev) => {
            // Avoid duplicate validation messages
            const exists = prev.find((m) => m.hasValidationButtons);
            if (exists) return prev;
            const newMessages = [...prev, validationMessage];
            // Save to AsyncStorage
            AsyncStorage.setItem(
              storageKey,
              JSON.stringify(
                newMessages.filter((m) => !chatMessages.find((cm) => cm.id === m.id))
              )
            );
            console.log('[DEBUG] Saved validation message to storage');
            return newMessages;
          });
        }, 3000);

        return () => clearTimeout(timeoutId);
      }
    };

    initializeTicket();
  }, [fromConfirmation, ticketId]);

  // Fetch attachments when ticket ID is available
  useEffect(() => {
    if (currentTicketId) {
      fetchAttachments(currentTicketId);
    }
  }, [currentTicketId, fetchAttachments]);

  // Socket connection and auth
  useEffect(() => {
    const s = socket;
    const onConnect = () => {
      setConnected(true);
      setSocketId(s.id ?? "");
      if (uid) {
        s.emit("auth:register", { userId: uid });
        s.emit("join", { room: ACTIVE_ROOM, userId: uid });
        s.emit("presence:get", { room: ACTIVE_ROOM });
      }
    };
    const onDisconnect = () => {
      setConnected(false);
      setAuthed(false);
    };
    const onAuthOk = () => setAuthed(true);

    s.on("connect", onConnect);
    s.on("disconnect", onDisconnect);
    s.on("auth:ok", onAuthOk);

    if (s.connected) onConnect();
    return () => {
      s.off("connect", onConnect);
      s.off("disconnect", onDisconnect);
      s.off("auth:ok", onAuthOk);
    };
  }, [socket, uid, ACTIVE_ROOM]);

  // Load local messages per room
  useEffect(() => {
    (async () => {
      const raw = await AsyncStorage.getItem(storageKey);
      if (raw) {
        try {
          const parsed = JSON.parse(raw) as MessageType[];
          const uniq = Array.from(new Map(parsed.map((m) => [m.id, m])).values());
          // Merge with initial chatMessages
          const merged = [
            ...chatMessages,
            ...uniq.filter((m) => !chatMessages.find((cm) => cm.id === m.id)),
          ];
          setMessages(merged);
        } catch (error) {
          setMessages(chatMessages);
        }
      } else {
        setMessages(chatMessages);
      }
    })();
  }, [storageKey]);

  // DM and chat handlers
  useEffect(() => {
    const s = socket;

    const onDMPending = ({ room }: { room: string }) => {
      setDmRoom(room);
      s.emit("presence:get", { room });
    };

    const onDMRequest = ({
      room,
      fromUserId,
    }: {
      room: string;
      fromUserId: string;
    }) => {
      setDmRoom(room);
      s.emit("dm:join", { room });
      s.emit("presence:get", { room });
      setIsLiveChat(true);
      Alert.alert("Live Chat", `User ${fromUserId} ingin chat dengan Anda`);
    };

    const onDMReady = ({ room }: { room: string }) => {
      s.emit("presence:get", { room });
      setIsLiveChat(true);
    };

    const onPresence = (payload: { room: string; peers: Peer[] }) => {
      if (payload.room === ACTIVE_ROOM) {
        setActivePeers(payload.peers);
        setPeerCount(payload.peers.length);
      }
    };

    const onNew = (msg: any) => {
      if (msg?.room !== ACTIVE_ROOM) return;
      if (typeof msg?.text !== "string" || !msg.text.trim()) return;

      const incoming: MessageType = {
        id: String(msg._id ?? msg.id ?? Date.now()),
        text: msg.text,
        isBot: msg.author?.id !== uid,
        timestamp: new Date(
          Number(msg.createdAt) || Date.now()
        ).toLocaleTimeString("id-ID", {
          hour: "2-digit",
          minute: "2-digit",
        }),
      };

      setMessages((prev) => {
        const idx = prev.findIndex((m) => m.id === incoming.id);
        const next =
          idx !== -1
            ? (() => {
                const cp = prev.slice();
                cp[idx] = { ...prev[idx], ...incoming };
                return cp;
              })()
            : [...prev, incoming].slice(-MAX_MSG);
        AsyncStorage.setItem(
          storageKey,
          JSON.stringify(
            next.filter((m) => !chatMessages.find((cm) => cm.id === m.id))
          )
        );
        return next;
      });
    };

    // Call handlers
    const onRinging = () => {
      setCallStatus("ringing");
      setShowCallModal(true);
    };
    const onAccepted = () => {
      setCallStatus("in-call");
      setShowCallModal(true);
      setCallStartTime(Date.now());
      startStreaming();
    };
    const onDeclined = () => {
      setCallStatus("idle");
      setShowCallModal(false);
      setRemoteFrame(null);
    };
    const onEnded = () => {
      if (callStartTime) {
        const duration = Math.floor((Date.now() - callStartTime) / 1000);
        const minutes = Math.floor(duration / 60);
        const seconds = duration % 60;
        const durationText = `${minutes.toString().padStart(2, "0")}:${seconds
          .toString()
          .padStart(2, "0")}`;

        const callEndMessage = {
          id: getUniqueId(),
          text: `📞 Panggilan selesai • Durasi: ${durationText}`,
          isBot: true,
          timestamp: new Date().toLocaleTimeString("id-ID", {
            hour: "2-digit",
            minute: "2-digit",
          }),
          isCallLog: true,
        };
        setMessages((prev) => [...prev, callEndMessage]);
        setCallStartTime(null);
      }
      stopStreaming();
      setCallStatus("idle");
      setRemoteFrame(null);
      setShowCallModal(false);
    };
    const onFrame = ({ data }: { data: string }) => setRemoteFrame(data);

    s.on("dm:pending", onDMPending);
    s.on("dm:request", onDMRequest);
    s.on("dm:ready", onDMReady);
    s.on("presence:list", onPresence);
    s.on("chat:new", onNew);
    s.on("call:ringing", onRinging);
    s.on("call:accepted", onAccepted);
    s.on("call:declined", onDeclined);
    s.on("call:ended", onEnded);
    s.on("call:frame", onFrame);

    if (uid) {
      s.emit("join", { room: ACTIVE_ROOM, userId: uid });
      s.emit("presence:get", { room: ACTIVE_ROOM });
    }

    return () => {
      s.off("dm:pending", onDMPending);
      s.off("dm:request", onDMRequest);
      s.off("dm:ready", onDMReady);
      s.off("presence:list", onPresence);
      s.off("chat:new", onNew);
      s.off("call:ringing", onRinging);
      s.off("call:accepted", onAccepted);
      s.off("call:declined", onDeclined);
      s.off("call:ended", onEnded);
      s.off("call:frame", onFrame);
      if (uid) s.emit("leave", { room: ACTIVE_ROOM, userId: uid });
    };
  }, [socket, uid, ACTIVE_ROOM, storageKey]);

  const clearChatHistory = useCallback(async () => {
    try {
      // Clear ALL storage keys that might contain chat messages
      const allKeys = await AsyncStorage.getAllKeys();
      const chatKeys = allKeys.filter((key) => key.startsWith("msgs:"));
      if (chatKeys.length > 0) {
        await AsyncStorage.multiRemove(chatKeys);
      }

      // Reset to initial chat messages only (hard reset)
      setMessages([...chatMessages]);

      // Reset ALL live chat related state
      setIsLiveChat(false);
      setDmRoom(null);
      setActivePeers([]);
      setPeerCount(1);
      setCallStatus("idle");
      setRemoteFrame(null);
      setShowCallModal(false);
      setCallStartTime(null);

      // Disconnect from socket properly
      if (socket.connected) {
        socket.emit("leave", { room: ACTIVE_ROOM, userId: uid });
        socket.disconnect();
      }

      // Force reconnect with fresh state
      setTimeout(() => {
        const newSocket = getSocket();
        if (newSocket && !newSocket.connected) {
          newSocket.connect();
        }
      }, 500);
    } catch (error) {
      // Error clearing chat history
    }
  }, [ACTIVE_ROOM, uid, socket]);

  const handleSendMessage = useCallback(() => {
    if (inputText.trim() && isLiveChat) {
      const now = Date.now();
      const outgoing: MessageType = {
        id: `m_${now}`,
        text: inputText.trim(),
        isBot: false,
        timestamp: new Date().toLocaleTimeString("id-ID", {
          hour: "2-digit",
          minute: "2-digit",
        }),
        author: chatUser,
        createdAt: now,
        type: "text",
        room: ACTIVE_ROOM,
      };
      setMessages((prev) => {
        const next = [...prev, outgoing].slice(-MAX_MSG);
        AsyncStorage.setItem(
          storageKey,
          JSON.stringify(
            next.filter((m) => !chatMessages.find((cm) => cm.id === m.id))
          )
        );
        return next;
      });
      socket.emit("chat:send", outgoing);
      setInputText("");
    }
  }, [inputText, isLiveChat, chatUser, ACTIVE_ROOM, storageKey, socket]);

  const quickDM = useCallback(() => {
    const target = activePeers.find(
      (p) => p.userId && p.userId.startsWith("EMP-")
    );
    if (!target) {
      Alert.alert(
        "Agent tidak tersedia",
        "Tidak ada agent yang online saat ini."
      );
      return;
    }
    socket.emit("dm:open", { toUserId: target.userId });
  }, [activePeers, socket]);

  const startStreaming = useCallback(async () => {
    if (frameTimer.current) return;
    if (!permission?.granted) {
      const r = await requestPermission();
      if (!r.granted) return Alert.alert("Izin kamera ditolak");
    }
    frameTimer.current = setInterval(async () => {
      try {
        const cam: any = camRef.current;
        if (!cam?.takePictureAsync) return;
        const photo = await cam.takePictureAsync({
          quality: Platform.OS === "ios" ? 0.2 : 0.15,
          base64: true,
          skipProcessing: true,
        });
        if (photo?.base64)
          socket.emit("call:frame", { room: ACTIVE_ROOM, data: photo.base64 });
      } catch {}
    }, 1000 / FPS);
  }, [permission?.granted, requestPermission, ACTIVE_ROOM, socket]);

  const stopStreaming = useCallback(() => {
    if (frameTimer.current) clearInterval(frameTimer.current);
    frameTimer.current = null;
  }, []);

  const placeCall = () => {
    if (peerCount < 2) {
      Alert.alert(
        "Peer tidak tersedia",
        "Pastikan ada 2 user yang login untuk call."
      );
      return;
    }
    socket.emit("call:invite", { room: ACTIVE_ROOM });
    setCallStatus("ringing");
  };

  const acceptCall = () => {
    socket.emit("call:accept", { room: ACTIVE_ROOM });
    setCallStatus("in-call");
    setShowCallModal(true);
    setCallStartTime(Date.now());
    startStreaming();
  };

  const declineCall = () => {
    socket.emit("call:decline", { room: ACTIVE_ROOM });
    setCallStatus("idle");
    setShowCallModal(false);
  };

  const hangupCall = () => {
    if (callStartTime) {
      const duration = Math.floor((Date.now() - callStartTime) / 1000);
      const minutes = Math.floor(duration / 60);
      const seconds = duration % 60;
      const durationText = `${minutes.toString().padStart(2, "0")}:${seconds
        .toString()
        .padStart(2, "0")}`;

      const callEndMessage = {
        id: getUniqueId(),
        text: `📞 Panggilan selesai • Durasi: ${durationText}`,
        isBot: true,
        timestamp: new Date().toLocaleTimeString("id-ID", {
          hour: "2-digit",
          minute: "2-digit",
        }),
        isCallLog: true,
      };
      setMessages((prev) => [...prev, callEndMessage]);
      setCallStartTime(null);
    }
    socket.emit("call:hangup", { room: ACTIVE_ROOM });
    stopStreaming();
    setCallStatus("idle");
    setRemoteFrame(null);
  };

  useEffect(() => {
    setTimeout(() => {
      scrollViewRef.current?.scrollToEnd({ animated: true });
    }, 100);
  }, [messages]);

  useEffect(() => {
    return () => {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
    };
  }, [timeoutId]);

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        style={styles.keyboardView}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 20}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.replace("/(tabs)")}
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
            {isLiveChat && (
              <View style={styles.statusContainer}>
                <MaterialIcons name="circle" size={8} color="#4CAF50" />
                <Text style={styles.liveChatStatusText}>Online</Text>
              </View>
            )}
          </View>

          {isLiveChat && (
            <TouchableOpacity
              style={styles.endChatButton}
              onPress={() => {
                Alert.alert(
                  "Akhiri Chat",
                  "Apakah Anda yakin ingin mengakhiri chat? Semua riwayat chat akan hilang.",
                  [
                    {
                      text: "Batal",
                      style: "cancel",
                    },
                    {
                      text: "Akhiri",
                      style: "destructive",
                      onPress: clearChatHistory,
                    },
                  ]
                );
              }}
            >
              <MaterialIcons name="close" size={24} color="#FF4444" />
            </TouchableOpacity>
          )}

          {!isLiveChat && <View style={{ width: 24 }} />}
        </View>

        {/* Chat Messages */}
        <ScrollView
          ref={scrollViewRef}
          style={styles.chatContainer}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {messages.map((message) => (
            <View
              key={message.id}
              style={[
                styles.messageContainer,
                message.isBot ? styles.botMessage : styles.userMessage,
              ]}
            >
              <View style={styles.messageRow}>
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

                  {/* Show download button if it's a file message */}
                  {(message.isFile || message.isImage) && message.fileName && (
                    <TouchableOpacity
                      style={styles.downloadButton}
                      onPress={async () => {
                        if (message.downloadUrl) {
                          try {
                            await Linking.openURL(message.downloadUrl);
                          } catch (error) {
                            Alert.alert("Error", "Gagal membuka download link");
                          }
                        } else {
                          Alert.alert("Info", "Download link tidak tersedia");
                        }
                      }}
                    >
                      <MaterialIcons
                        name="download"
                        size={16}
                        color={message.isBot ? "#52B5AB" : "#FFF"}
                      />
                      <Text
                        style={[
                          styles.downloadButtonText,
                          message.isBot ? styles.botText : styles.userText,
                        ]}
                      >
                        Download {message.fileName}
                      </Text>
                    </TouchableOpacity>
                  )}

                  <Text style={styles.timestamp}>{message.timestamp}</Text>
                </View>
                {/* Call icon only for bot messages when live chat is active */}
                {isLiveChat &&
                  message.isBot &&
                  !message.hasButtons &&
                  !message.hasValidationButtons &&
                  !message.hasLiveChatButtons &&
                  !message.isCallLog && (
                    <TouchableOpacity
                      style={styles.callIcon}
                      onPress={() => {
                        if (peerCount >= 2) {
                          placeCall();
                        } else {
                          Alert.alert(
                            "Agent tidak tersedia",
                            "Sedang mencari agent untuk panggilan..."
                          );
                        }
                      }}
                    >
                      <MaterialIcons name="call" size={20} color="#4CAF50" />
                    </TouchableOpacity>
                  )}
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
              {(message as any).hasTicketButton && (
                <View style={styles.buttonContainer}>
                  <TouchableOpacity
                    style={styles.ticketButton}
                    onPress={() => setShowTicketModal(true)}
                  >
                    <MaterialIcons name="receipt" size={16} color="#FFF" />
                    <Text style={styles.buttonText}>Lihat Tiket Anda</Text>
                  </TouchableOpacity>
                </View>
              )}
              {(message as any).hasValidationButtons && (
                <View style={styles.buttonContainer}>
                  <TouchableOpacity
                    style={styles.callButton}
                    onPress={() => {
                      placeCall();
                    }}
                  >
                    <MaterialIcons name="call" size={16} color="#FFF" />
                    <Text style={styles.buttonText}>Call</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.chatButton}
                    onPress={() => {
                      setIsLiveChat(true);
                      quickDM();
                    }}
                  >
                    <MaterialIcons name="chat" size={16} color="#FFF" />
                    <Text style={styles.buttonText}>Chat</Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>
          ))}
        </ScrollView>

        {/* Live Chat Status */}
        {isLiveChat && (
          <View style={styles.liveChatStatus}>
            <View style={styles.statusIndicator}>
              <MaterialIcons name="circle" size={8} color="#4CAF50" />
              <Text style={styles.liveChatStatusText}>
                Live Chat Aktif • Peers: {peerCount} • Tap icon call untuk
                panggilan
              </Text>
            </View>
          </View>
        )}

        {/* Input Area */}
        <View style={styles.inputContainer}>
          <TouchableOpacity
            style={styles.addFileButton}
            onPress={() => {
              if (!currentTicketId) {
                Alert.alert(
                  "Tidak ada tiket aktif",
                  "Silakan buat tiket terlebih dahulu untuk mengirim attachment."
                );
                return;
              }
              setShowUploadModal(true);
            }}
          >
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
            <MaterialIcons
              name="send"
              size={20}
              color={isLiveChat ? "#FF8636" : "#CCC"}
            />
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

        <UploadModal
          visible={showUploadModal}
          onClose={() => setShowUploadModal(false)}
          onUploadSuccess={handleUploadSuccess}
          ticketId={currentTicketId || undefined}
          existingFiles={attachments || []}
          onDeleteFile={handleDeleteFile}
        />

        {/* Call Modal */}
        <CallModal
          visible={showCallModal}
          callStatus={callStatus}
          onStatusChange={(status: string) =>
            setCallStatus(status as CallStatus)
          }
          onClose={() => {
            setShowCallModal(false);
            hangupCall();
          }}
          onAccept={acceptCall}
          onDecline={declineCall}
          remoteFrame={remoteFrame}
          onHangup={hangupCall}
          camRef={camRef as any}
          permission={permission}
        />

        <TicketSummaryModal
          visible={showTicketModal}
          onClose={() => setShowTicketModal(false)}
          ticketId={currentTicketId || undefined}
        />

        <BottomSheet
          visible={showBottomSheet}
          onClose={() => setShowBottomSheet(false)}
          onConfirm={() => {
            setShowBottomSheet(false);
            router.replace("/(tabs)");
          }}
        />
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  keyboardView: {
    flex: 1,
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
  messageRow: {
    flexDirection: "row",
    alignItems: "flex-end",
    gap: 8,
  },
  callIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#F0F8F0",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 4,
  },
  callButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#4CAF50",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 16,
    gap: 4,
  },
  chatButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#2196F3",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 16,
    gap: 4,
  },
  liveChatStatus: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: "#F0F8F0",
    borderTopWidth: 1,
    borderTopColor: "#E0E0E0",
  },
  statusIndicator: {
    flexDirection: "row",
    alignItems: "center",
  },
  liveChatStatusText: {
    fontSize: 12,
    color: "#4CAF50",
    marginLeft: 4,
    fontFamily: "Poppins",
  },
  acceptCallButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#4CAF50",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    gap: 4,
  },
  acceptCallText: {
    fontSize: 12,
    color: "#FFF",
    fontFamily: "Poppins",
  },
  endChatButton: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: "#FFE5E5",
  },
  ticketButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FF8636",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 16,
    gap: 4,
  },
  filePreviewContainer: {
    marginTop: 8,
    borderRadius: 12,
    overflow: "hidden",
  },
  imagePreviewContainer: {
    position: "relative",
    width: 200,
    height: 150,
  },
  chatImagePreview: {
    width: "100%",
    height: "100%",
    borderRadius: 12,
  },
  imageOverlay: {
    position: "absolute",
    top: 8,
    right: 8,
    backgroundColor: "rgba(0,0,0,0.5)",
    borderRadius: 16,
    padding: 6,
  },
  documentPreview: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    backgroundColor: "rgba(255,255,255,0.1)",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.2)",
    minWidth: 180,
    gap: 10,
  },
  documentFileName: {
    fontSize: 12,
    fontFamily: "Poppins",
    flex: 1,
    fontWeight: "500",
  },
  documentFileSize: {
    fontSize: 10,
    fontFamily: "Poppins",
    opacity: 0.8,
  },
  downloadButton: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 8,
    padding: 8,
    backgroundColor: "rgba(255,255,255,0.1)",
    borderRadius: 8,
    gap: 6,
  },
  downloadButtonText: {
    fontSize: 12,
    fontFamily: "Poppins",
  },
});
