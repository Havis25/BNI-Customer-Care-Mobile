import BottomSheet from "@/components/modals/BottomSheet";
// CallModal removed - using simple modal for audio calls
import TicketSummaryModal from "@/components/modals/TicketSummaryModal";
import UploadModal from "@/components/modals/UploadModal";
import { useAuth } from "@/hooks/useAuth";
import { useChannelsAndCategories } from "@/hooks/useChannelsAndCategories";
import { useTerminals } from "@/hooks/useTerminals";
import { useTicketAttachments } from "@/hooks/useTicketAttachments";
import { useTicketDetail } from "@/hooks/useTicketDetail";
import { useUser } from "@/hooks/useUser";
import { useUserProfile } from "@/hooks/useUserProfile";
import { api } from "@/lib/api";
import {
  checkIfCategoryNeedsAmount,
  checkIfCategoryNeedsTransactionDate,
  mapChatbotCategoryToDatabase,
  mapChatbotChannelToDatabase,
} from "@/utils/chatbotMapping";
import { debugAuthState } from "@/utils/debugAuth";

import { getSocket } from "@/src/realtime/socket";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import AsyncStorage from "@react-native-async-storage/async-storage";
// Camera removed - audio only implementation
import WebRTCService from "@/src/services/webrtc";
import { deviceType, hp, rf, wp } from "@/utils/responsive";
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
  hasEditButtons?: boolean;
  hasChannelButtons?: boolean;
  hasCategoryButtons?: boolean;
  hasTerminalButtons?: boolean;
  isCallLog?: boolean;
  isFile?: boolean;
  isImage?: boolean;
  isTicketInfo?: boolean;
  ticketId?: string;
  fileName?: string;
  downloadUrl?: string;
  author?: { id: string; firstName?: string };
  createdAt?: number;
  type?: string;
  room?: string;
  buttonSelected?: "edit" | "create";
  validationSelected?: "call" | "chat";
};

type Peer = { sid: string; userId: string };
type CallStatus = "idle" | "ringing" | "in-call" | "audio-call";

const MAX_MSG = 200;

// Initial welcome message from bot
const initialBotMessage: MessageType = {
  id: 1,
  text: "Halo saya BNI Assistant siap membantu Anda.",
  isBot: true,
  timestamp: new Date().toLocaleTimeString("id-ID", {
    hour: "2-digit",
    minute: "2-digit",
  }),
};

export default function ChatScreen() {
  const { fromConfirmation, room, ticketId } = useLocalSearchParams();
  const { user } = useUser();
  const { user: authUser } = useAuth();
  const { getUserDataForTicket } = useUserProfile();
  const urlRoom = typeof room === "string" && room.trim() ? room : "general";
  const fallbackCallRoom = `call:${urlRoom}`;
  const isFromTicketDetail = useMemo(() => {
    // Check if room starts with "ticket-" or if we have ticketId without fromConfirmation
    return (
      (room && typeof room === "string" && room.startsWith("ticket-")) ||
      (ticketId && typeof ticketId === "string" && fromConfirmation !== "true")
    );
  }, [room, ticketId, fromConfirmation]);

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
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [isTyping, setIsTyping] = useState(false);

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

  // Session persistence keys
  const COMPLAINT_SESSION_KEY = "complaint_chat_session";
  const LIVE_CHAT_SESSION_KEY = `live_chat_session_${ticketId || "general"}`;

  // Use ticket-specific storage key to maintain chat history per ticket
  const storageKey = useMemo(() => {
    if (isFromTicketDetail && ticketId) {
      return `msgs:ticket-${ticketId}`;
    }
    return `msgs:${ACTIVE_ROOM}`;
  }, [ACTIVE_ROOM, isFromTicketDetail, ticketId]);

  // Session storage key for chat state
  const sessionStorageKey = useMemo(() => {
    if (isFromTicketDetail && ticketId) {
      return LIVE_CHAT_SESSION_KEY;
    }
    return COMPLAINT_SESSION_KEY;
  }, [
    isFromTicketDetail,
    ticketId,
    LIVE_CHAT_SESSION_KEY,
    COMPLAINT_SESSION_KEY,
  ]);

  // Presence & call
  const [activePeers, setActivePeers] = useState<Peer[]>([]);
  const [peerCount, setPeerCount] = useState(1);
  const [showLiveChatModal, setShowLiveChatModal] = useState(false);
  const [callStatus, setCallStatus] = useState<CallStatus>("idle");
  const [isLiveChat, setIsLiveChat] = useState(false);

  // Audio call states only
  const [isAudioCall, setIsAudioCall] = useState(false);
  const [localStream, setLocalStream] = useState<any>(null);
  const [inputText, setInputText] = useState("");
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [showBottomSheet, setShowBottomSheet] = useState(false);
  const [showTicketModal, setShowTicketModal] = useState(false);
  const [currentTicketId, setCurrentTicketId] = useState<string | null>(null);
  const [summaryShown, setSummaryShown] = useState(false);
  const [ticketCreatedInSession, setTicketCreatedInSession] = useState(false);
  const [amountRequested, setAmountRequested] = useState(false);
  const [transactionDateRequested, setTransactionDateRequested] =
    useState(false);
  const [confirmedAmount, setConfirmedAmount] = useState<string | null>(null);
  const [selectedChannel, setSelectedChannel] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedTerminal, setSelectedTerminal] = useState<string | null>(null);
  const [editFormSelected, setEditFormSelected] = useState(false);
  const [uploadStepReached, setUploadStepReached] = useState(false); // Track if user reached upload step

  // DEBUG: Monitor state changes for upload button
  useEffect(() => {
    console.log("🔄 UPLOAD BUTTON STATE DEBUG:", {
      isFromTicketDetail,
      ticketCreatedInSession,
      room,
      ticketId,
      fromConfirmation,
      currentTicketId,
      uploadStepReached,
      isLiveChat,
    });
  }, [
    isFromTicketDetail,
    ticketCreatedInSession,
    room,
    ticketId,
    fromConfirmation,
    currentTicketId,
    uploadStepReached,
    isLiveChat,
  ]);

  // Ensure currentTicketId is set when coming from ticket detail
  useEffect(() => {
    if (isFromTicketDetail && ticketId && !currentTicketId) {
      const ticketIdStr =
        typeof ticketId === "string" ? ticketId : String(ticketId);
      console.log(
        "🎫 FALLBACK: Setting currentTicketId from ticket detail params:",
        ticketIdStr
      );
      setCurrentTicketId(ticketIdStr);
      setTicketCreatedInSession(true);
      AsyncStorage.setItem("currentTicketId", ticketIdStr);
    }
  }, [isFromTicketDetail, ticketId, currentTicketId]);

  // Check if input should be disabled when buttons are active
  const isInputDisabled = useMemo(() => {
    if (isLiveChat) return false; // Always allow input in live chat
    if (ticketCreatedInSession) return false; // Allow input after ticket created

    // Check if there are active button selections that haven't been completed
    const hasActiveChannelButtons = messages.some(
      (msg) => msg.hasChannelButtons && !selectedChannel
    );
    const hasActiveCategoryButtons = messages.some(
      (msg) => msg.hasCategoryButtons && !selectedCategory
    );
    const hasActiveTerminalButtons = messages.some(
      (msg) => msg.hasTerminalButtons && !selectedTerminal
    );

    return (
      hasActiveChannelButtons ||
      hasActiveCategoryButtons ||
      hasActiveTerminalButtons
    );
  }, [
    messages,
    selectedChannel,
    selectedCategory,
    selectedTerminal,
    isLiveChat,
    ticketCreatedInSession,
  ]);

  // Store collected info from chatbot for form preset
  const [collectedInfo, setCollectedInfo] = useState<{
    channel?: string;
    category?: string;
    amount?: string | number;
    description?: string;
    ai_generated_description?: string;
  } | null>(null);

  // Track which button groups have been selected to disable other options
  const [buttonGroupStates, setButtonGroupStates] = useState<{
    [messageId: string]: {
      type: "channel" | "category" | "terminal" | "validation" | "edit";
      selectedValue: string;
    };
  }>({});

  const [timeoutId, setTimeoutId] = useState<number | null>(null);
  const [callStartTime, setCallStartTime] = useState<number | null>(null);
  const scrollViewRef = useRef<ScrollView>(null);

  // Attachment management - initialize without auto-fetch
  const { attachments, fetchAttachments, deleteAttachment } =
    useTicketAttachments();

  // Ticket detail for showing ticket info
  const { ticketDetail, fetchTicketDetail } = useTicketDetail();

  // Channels and categories data
  const { channels, categories, getFilteredCategories } =
    useChannelsAndCategories();

  // Terminals data
  const { terminals } = useTerminals();

  const getUniqueId = () => {
    return `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  };

  // Function to check API health
  const checkApiHealth = useCallback(async () => {
    try {
      const response = await api<{
        status: string;
        model?: string;
        time?: string;
      }>("/healthz", {
        method: "GET",
      });

      return response.status === "ok";
    } catch (error) {
      return false;
    }
  }, []);

  // Save session state
  const saveSessionState = useCallback(async () => {
    try {
      const sessionState = {
        messages,
        sessionId,
        collectedInfo,
        selectedChannel,
        selectedCategory,
        selectedTerminal,
        confirmedAmount,
        amountRequested,
        transactionDateRequested,
        editFormSelected,
        ticketCreatedInSession,
        buttonGroupStates,
        timestamp: Date.now(),
        currentTicketId, // Add ticket ID to session
        attachments, // Add attachments to session storage
        uploadStepReached, // Add upload step flag
      };
      await AsyncStorage.setItem(
        sessionStorageKey,
        JSON.stringify(sessionState)
      );
    } catch (error) {
      console.log("Failed to save session state:", error);
    }
  }, [
    messages,
    sessionId,
    collectedInfo,
    selectedChannel,
    selectedCategory,
    selectedTerminal,
    confirmedAmount,
    amountRequested,
    transactionDateRequested,
    editFormSelected,
    ticketCreatedInSession,
    buttonGroupStates,
    sessionStorageKey,
    currentTicketId,
    attachments,
    uploadStepReached,
  ]);

  // Load session state
  const loadSessionState = useCallback(async () => {
    try {
      const savedState = await AsyncStorage.getItem(sessionStorageKey);
      if (savedState) {
        const parsedState = JSON.parse(savedState);
        // Check if session is not too old (24 hours)
        const isValidSession =
          Date.now() - parsedState.timestamp < 24 * 60 * 60 * 1000;

        if (isValidSession && parsedState.messages?.length > 0) {
          console.log("🔄 RESTORING SESSION STATE");
          console.log(
            "Restored ticketCreatedInSession:",
            parsedState.ticketCreatedInSession
          );
          console.log("Restored currentTicketId:", parsedState.currentTicketId);
          console.log(
            "Restored attachments:",
            parsedState.attachments?.length || 0
          );
          console.log(
            "Restored uploadStepReached:",
            parsedState.uploadStepReached
          );

          setMessages(parsedState.messages || []);
          setSessionId(parsedState.sessionId || null);
          setCollectedInfo(parsedState.collectedInfo || null);
          setSelectedChannel(parsedState.selectedChannel || null);
          setSelectedCategory(parsedState.selectedCategory || null);
          setSelectedTerminal(parsedState.selectedTerminal || null);
          setConfirmedAmount(parsedState.confirmedAmount || null);
          setAmountRequested(parsedState.amountRequested || false);
          setTransactionDateRequested(
            parsedState.transactionDateRequested || false
          );
          setEditFormSelected(parsedState.editFormSelected || false);
          setTicketCreatedInSession(
            parsedState.ticketCreatedInSession || false
          );
          setButtonGroupStates(parsedState.buttonGroupStates || {});
          setUploadStepReached(parsedState.uploadStepReached || false);

          // Restore ticket ID and attachments if available
          if (parsedState.currentTicketId) {
            setCurrentTicketId(parsedState.currentTicketId);
          }

          // If user had reached upload step and has a ticket, show appropriate welcome back message
          if (
            parsedState.uploadStepReached &&
            parsedState.currentTicketId &&
            parsedState.ticketCreatedInSession
          ) {
            console.log(
              "🔄 User returning to upload step - adding welcome back message"
            );
            setTimeout(() => {
              const welcomeBackMessage = {
                id: getUniqueId(),
                text: `Selamat datang kembali! Anda dapat melanjutkan upload file untuk tiket #${
                  parsedState.currentTicketId.slice(-6) || "N/A"
                }.`,
                isBot: true,
                timestamp: new Date().toLocaleTimeString("id-ID", {
                  hour: "2-digit",
                  minute: "2-digit",
                }),
                hasTicketButton: true,
              };

              setMessages((prev) => {
                // Check if welcome back message already exists
                const hasWelcomeBack = prev.some((m) =>
                  m.text.includes("Selamat datang kembali")
                );
                if (hasWelcomeBack) return prev;

                const newMessages = [...prev, welcomeBackMessage];
                AsyncStorage.setItem(
                  sessionStorageKey.replace("session", "msgs"),
                  JSON.stringify(newMessages)
                );
                return newMessages;
              });
            }, 1000);
          }

          return true; // Session restored
        }
      }
    } catch (error) {
      console.log("Failed to load session state:", error);
    }
    return false; // No session or failed to restore
  }, [sessionStorageKey]);

  // Clear session state
  const clearSessionState = useCallback(async () => {
    try {
      await AsyncStorage.removeItem(sessionStorageKey);
      // Reset all states to initial values
      setMessages([]);
      setSessionId(null);
      setCollectedInfo(null);
      setSelectedChannel(null);
      setSelectedCategory(null);
      setSelectedTerminal(null);
      setConfirmedAmount(null);
      setAmountRequested(false);
      setTransactionDateRequested(false);
      setEditFormSelected(false);
      setTicketCreatedInSession(false);
      setButtonGroupStates({});
      setSummaryShown(false); // Add this to ensure clean state
      setUploadStepReached(false); // Reset upload step flag
    } catch (error) {
      console.log("Failed to clear session state:", error);
    }
  }, [sessionStorageKey]);

  // Initialize chat with health check
  const initializeChat = useCallback(async () => {
    // Debug auth state first
    await debugAuthState();

    // Try to restore session first
    const sessionRestored = await loadSessionState();

    if (sessionRestored) {
      return; // Skip initialization if session was restored
    }

    const isHealthy = await checkApiHealth();

    if (!isHealthy) {
      const errorMessage: MessageType = {
        id: getUniqueId(),
        text: "Sistem sedang bermasalah. Silakan coba lagi nanti.",
        isBot: true,
        timestamp: new Date().toLocaleTimeString("id-ID", {
          hour: "2-digit",
          minute: "2-digit",
        }),
      };
      setMessages([errorMessage]);
      return;
    }

    // Start with initial bot message
    setMessages([initialBotMessage]);
  }, [checkApiHealth, loadSessionState]);

  // Function to send message to chatbot API
  const sendToChatbot = useCallback(
    async (userMessage: string) => {
      try {
        setIsTyping(true);

        const response = await api<{
          success: boolean;
          message: string;
          session_id: string;
          collected_info?: {
            full_name?: string;
            account_number?: string;
            channel?: string;
            category?: string;
            description?: string;
            ai_generated_description?: string;
            amount?: string | number;
          };
          next_step?: string;
          action?: string;
          confidence?: number;
          is_complete?: boolean;
          suggestions?: string[];
        }>("/chat", {
          method: "POST",
          body: JSON.stringify({
            message: userMessage,
            session_id: sessionId,
            user_context: {
              full_name: user?.full_name || authUser?.full_name || "User",
              account_number:
                (user?.accounts || authUser?.accounts || [])[0]
                  ?.account_number || "N/A",
            },
          }),
        });

        // Check if API response is successful
        if (response.success === false) {
          throw new Error("API returned unsuccessful response");
        }

        // Handle case where response doesn't have success field (older API format)
        const isSuccess =
          response.success === undefined ? true : response.success;
        const botResponseText =
          response.message || "Tidak ada response dari server";

        if (!isSuccess) {
          throw new Error("API returned unsuccessful response");
        }

        // Save session ID if new one is provided
        if (response.session_id && response.session_id !== sessionId) {
          setSessionId(response.session_id);
          // Save session state
          await AsyncStorage.setItem(
            "chatSession",
            JSON.stringify({
              sessionId: response.session_id,
              summaryShown,
              ticketCreatedInSession,
            })
          );
        }

        // Update collected info from chatbot response
        if (response.collected_info) {
          console.log("=== COLLECTED INFO UPDATE ===");
          console.log("Previous collectedInfo:", collectedInfo);
          console.log("New collected_info:", response.collected_info);

          // Update selectedChannel and selectedCategory based on collected_info if not already set
          const shouldSetChannel =
            response.collected_info.channel &&
            (!selectedChannel ||
              selectedChannel !== response.collected_info.channel);
          console.log("=== CHANNEL SETTING DEBUG ===");
          console.log(
            "response.collected_info.channel:",
            response.collected_info.channel
          );
          console.log("current selectedChannel:", selectedChannel);
          console.log("shouldSetChannel:", shouldSetChannel);

          if (shouldSetChannel) {
            console.log(
              "Setting selectedChannel from collected_info:",
              response.collected_info.channel
            );
            setSelectedChannel(response.collected_info.channel || null);

            // After setting channel, check if we need to show category buttons
            setTimeout(() => {
              const shouldShowCategories =
                !response.collected_info?.category && !selectedCategory;
              console.log("=== CATEGORY SHOW DEBUG ===");
              console.log(
                "response.collected_info?.category:",
                response.collected_info?.category
              );
              console.log("selectedCategory:", selectedCategory);
              console.log("shouldShowCategories:", shouldShowCategories);

              if (shouldShowCategories) {
                console.log("Channel set, now showing category buttons");
                setMessages((prev) => {
                  const hasCategoryButtons = prev.some(
                    (msg) => msg.hasCategoryButtons
                  );
                  console.log(
                    "Already has category buttons:",
                    hasCategoryButtons
                  );
                  if (hasCategoryButtons) return prev;

                  const categoryButtonMessage: MessageType = {
                    id: getUniqueId(),
                    text: "Silakan pilih kategori masalah Anda:",
                    isBot: true,
                    timestamp: new Date().toLocaleTimeString("id-ID", {
                      hour: "2-digit",
                      minute: "2-digit",
                    }),
                    hasCategoryButtons: true,
                  };
                  const newMessages = [...prev, categoryButtonMessage];
                  AsyncStorage.setItem(storageKey, JSON.stringify(newMessages));
                  console.log("Added category button message");
                  return newMessages;
                });
              }
            }, 500); // Reduced timeout
          }

          const shouldSetCategory =
            response.collected_info.category &&
            (!selectedCategory ||
              selectedCategory !== response.collected_info.category);
          if (shouldSetCategory) {
            console.log(
              "Setting selectedCategory from collected_info:",
              response.collected_info.category
            );
            setSelectedCategory(response.collected_info.category || null);
          }

          // AGGRESSIVE FALLBACK: If we have channel but no category buttons are showing
          if (
            response.collected_info.channel &&
            !response.collected_info.category
          ) {
            console.log("=== AGGRESSIVE FALLBACK CHECK ===");
            setTimeout(() => {
              setMessages((prev) => {
                const hasCategoryButtons = prev.some(
                  (msg) => msg.hasCategoryButtons
                );
                console.log(
                  "Has category buttons in messages:",
                  hasCategoryButtons
                );
                console.log("Current selectedCategory:", selectedCategory);

                if (!hasCategoryButtons && !selectedCategory) {
                  console.log(
                    "AGGRESSIVE FALLBACK: Adding category buttons now!"
                  );
                  const categoryButtonMessage: MessageType = {
                    id: getUniqueId(),
                    text: "Silakan pilih kategori masalah Anda:",
                    isBot: true,
                    timestamp: new Date().toLocaleTimeString("id-ID", {
                      hour: "2-digit",
                      minute: "2-digit",
                    }),
                    hasCategoryButtons: true,
                  };
                  const newMessages = [...prev, categoryButtonMessage];
                  AsyncStorage.setItem(storageKey, JSON.stringify(newMessages));
                  return newMessages;
                }
                return prev;
              });
            }, 200); // Very short timeout
          }

          // If we have channel and category but no description, and user provided meaningful input, add it
          let updatedCollectedInfo = response.collected_info;
          if (
            response.collected_info.channel &&
            response.collected_info.category &&
            !response.collected_info.description &&
            !response.collected_info.ai_generated_description &&
            userMessage.length > 10 &&
            !summaryShown
          ) {
            console.log(
              "Adding user description to collected_info:",
              userMessage
            );
            updatedCollectedInfo = {
              ...response.collected_info,
              description: userMessage,
            };
          }

          // Additional check: if we have selectedChannel and selectedCategory but collected_info has no description
          else if (
            selectedChannel &&
            selectedCategory &&
            response.collected_info.channel &&
            response.collected_info.category &&
            !response.collected_info.description &&
            !response.collected_info.ai_generated_description &&
            userMessage.length > 10 &&
            !summaryShown
          ) {
            console.log(
              "Adding user description based on selectedChannel/selectedCategory:",
              userMessage
            );
            updatedCollectedInfo = {
              ...response.collected_info,
              description: userMessage,
            };
          }

          setCollectedInfo(updatedCollectedInfo);
        }

        // Skip amount confirmation logic here - will be handled in handleSendMessage
        // This prevents duplicate processing of amount confirmation

        // Handle transaction date confirmation - create summary with all info
        if (
          transactionDateRequested &&
          (response.message.toLowerCase().includes("mohon konfirmasi") ||
            response.message.toLowerCase().includes("apakah data") ||
            response.message.toLowerCase().includes("sudah benar"))
        ) {
          setMessages((currentMessages) => {
            const dateMessages = currentMessages.filter(
              (msg) =>
                !msg.isBot &&
                msg.text &&
                /\d{1,2}[\/-]\d{1,2}[\/-]\d{4}/.test(msg.text)
            );

            console.log(
              "Transaction date summary - Using confirmed amount:",
              confirmedAmount
            );
            console.log(
              "Transaction date summary - Date messages found:",
              dateMessages.map((m) => m.text)
            );

            let displayAmount = "Tidak tersedia";
            // Use the confirmed amount first (priority), then fallback to filtering
            if (confirmedAmount) {
              console.log("Using confirmed amount:", confirmedAmount);
              displayAmount = parseInt(confirmedAmount).toLocaleString("id-ID");
            } else if (response.collected_info?.amount) {
              console.log(
                "Using amount from collected_info:",
                response.collected_info.amount
              );
              displayAmount = parseInt(
                response.collected_info.amount.toString().replace(/[^0-9]/g, "")
              ).toLocaleString("id-ID");
            } else {
              // Fallback to message filtering (should not happen if confirmedAmount is set)
              const amountMessages = currentMessages.filter(
                (msg) =>
                  !msg.isBot &&
                  msg.text &&
                  // Exclude date patterns (DD/MM/YYYY or DD-MM-YYYY)
                  !/\d{1,2}[\/-]\d{1,2}[\/-]\d{4}/.test(msg.text) &&
                  // Only include pure numbers or currency-like patterns
                  /^[0-9.,\s]+$/.test(msg.text.replace(/[Rp\s]/g, "")) &&
                  // Ensure it's not just date digits
                  msg.text.replace(/[^0-9]/g, "").length <= 10 &&
                  // Must have reasonable amount value
                  parseInt(msg.text.replace(/[^0-9]/g, "")) < 999999999
              );

              if (amountMessages.length > 0) {
                const lastAmountMsg = amountMessages[amountMessages.length - 1];
                const numericAmount = lastAmountMsg.text.replace(/[^0-9]/g, "");
                console.log(
                  "Fallback: Using amount from message:",
                  lastAmountMsg.text,
                  "->",
                  numericAmount
                );
                displayAmount = parseInt(numericAmount).toLocaleString("id-ID");
              }
            }

            let displayTransactionDate = "Tidak tersedia";
            if (dateMessages.length > 0) {
              displayTransactionDate =
                dateMessages[dateMessages.length - 1].text;
            }

            const summaryText = `📋 RINGKASAN KELUHAN ANDA

📍 Channel: ${response.collected_info?.channel || "Tidak tersedia"}

📂 Kategori: ${response.collected_info?.category || "Tidak tersedia"}

💰 Nominal: Rp ${displayAmount}

📅 Tanggal Transaksi: ${displayTransactionDate}

📝 Deskripsi: ${
              response.collected_info?.ai_generated_description ||
              response.collected_info?.description ||
              "Tidak tersedia"
            }

Sekarang Anda dapat melanjutkan:`;

            const summaryMessage: MessageType = {
              id: getUniqueId(),
              text: summaryText,
              isBot: true,
              timestamp: new Date().toLocaleTimeString("id-ID", {
                hour: "2-digit",
                minute: "2-digit",
              }),
              hasButtons: true,
              buttonSelected: undefined,
            };

            const newMessages = [...currentMessages, summaryMessage];
            AsyncStorage.setItem(storageKey, JSON.stringify(newMessages));
            return newMessages;
          });
          return;
        }

        // Add bot response to messages
        const botMessage: MessageType = {
          id: getUniqueId(),
          text: response.message,
          isBot: true,
          timestamp: new Date().toLocaleTimeString("id-ID", {
            hour: "2-digit",
            minute: "2-digit",
          }),
          hasButtons: false, // Will be set later based on conditions
          hasValidationButtons: response.is_complete === true,
          // Remove automatic button detection here to avoid duplicates
          hasChannelButtons: false,
          hasCategoryButtons: false,
          // Initialize button selection states
          buttonSelected: undefined,
          validationSelected: undefined,
        };

        // Handle direct channel/category detection from bot response
        const messageText = response.message?.toLowerCase() || "";

        setMessages((prev) => {
          const newMessages = [...prev, botMessage];
          // Save messages to storage
          AsyncStorage.setItem(storageKey, JSON.stringify(newMessages));
          return newMessages;
        });

        // Handle summary detection and amount flow
        const isSummaryMessage =
          response.next_step === "summary_complete" ||
          response.action === "summary_complete" ||
          response.action === "ready_for_confirmation" ||
          response.message.toLowerCase().includes("summary") ||
          response.message.toLowerCase().includes("ringkasan") ||
          response.message.toLowerCase().includes("kategori:") ||
          response.message.toLowerCase().includes("deskripsi:");

        // Check if bot is asking for description after category selection
        const isDescriptionRequest =
          messageText.includes("deskripsi") ||
          messageText.includes("ceritakan") ||
          messageText.includes("jelaskan") ||
          messageText.includes("detail") ||
          (messageText.includes("masalah") && messageText.includes("anda"));

        // Check if we have complete info and category needs amount
        const hasCompleteInfo = Boolean(
          (selectedChannel && selectedCategory && response.collected_info) ||
            (response.collected_info?.channel &&
              response.collected_info?.category)
        );

        // Check if we have all required info for summary from collected_info
        const hasAllRequiredInfo = Boolean(
          response.collected_info?.channel &&
            response.collected_info?.category &&
            (response.collected_info?.description ||
              response.collected_info?.ai_generated_description ||
              // Alternative: if user provided meaningful input (description) and we have channel+category
              (!summaryShown && userMessage.length > 10) || // User gave meaningful description
              // Additional check: if selectedChannel/selectedCategory exists and user gave description
              (selectedChannel && selectedCategory && userMessage.length > 10))
        );

        const categoryNeedsAmount = Boolean(
          (selectedCategory && checkIfCategoryNeedsAmount(selectedCategory)) ||
            (response.collected_info?.category &&
              checkIfCategoryNeedsAmount(response.collected_info.category))
        );
        const collectedInfoNeedsAmount = Boolean(
          response.collected_info?.category &&
            checkIfCategoryNeedsAmount(response.collected_info.category)
        );
        const shouldRequestAmount = Boolean(
          (categoryNeedsAmount || collectedInfoNeedsAmount) && !amountRequested
        );

        console.log("=== DETAILED SUMMARY CONDITIONS ===");
        console.log(
          "response.collected_info?.channel:",
          response.collected_info?.channel
        );
        console.log(
          "response.collected_info?.category:",
          response.collected_info?.category
        );
        console.log(
          "response.collected_info?.description:",
          response.collected_info?.description
        );
        console.log(
          "response.collected_info?.ai_generated_description:",
          response.collected_info?.ai_generated_description
        );
        console.log("selectedChannel:", selectedChannel);
        console.log("selectedCategory:", selectedCategory);
        console.log("userMessage.length:", userMessage.length);
        console.log("!summaryShown:", !summaryShown);
        console.log(
          "response.collected_info exists:",
          !!response.collected_info
        );
        console.log(
          "New fallback condition (!summaryShown && userMessage.length > 10):",
          !summaryShown && userMessage.length > 10
        );
        console.log(
          "hasAllRequiredInfo breakdown - channel:",
          !!response.collected_info?.channel
        );
        console.log(
          "hasAllRequiredInfo breakdown - category:",
          !!response.collected_info?.category
        );
        console.log(
          "hasAllRequiredInfo breakdown - has description:",
          !!(
            response.collected_info?.description ||
            response.collected_info?.ai_generated_description
          )
        );
        console.log(
          "hasAllRequiredInfo breakdown - fallback condition:",
          !summaryShown && userMessage.length > 10
        );
        console.log(
          "hasAllRequiredInfo breakdown - additional check (selectedChannel && selectedCategory && userMessage.length > 10):",
          selectedChannel && selectedCategory && userMessage.length > 10
        );
        console.log("Final hasAllRequiredInfo value:", hasAllRequiredInfo);

        console.log("=== SUMMARY FLOW DEBUG ===");
        console.log("response.collected_info:", response.collected_info);
        console.log("hasCompleteInfo:", hasCompleteInfo);
        console.log("hasAllRequiredInfo:", hasAllRequiredInfo);
        console.log("selectedChannel:", selectedChannel);
        console.log("selectedCategory:", selectedCategory);
        console.log("categoryNeedsAmount:", categoryNeedsAmount);
        console.log("collectedInfoNeedsAmount:", collectedInfoNeedsAmount);
        console.log("shouldRequestAmount:", shouldRequestAmount);
        console.log("amountRequested:", amountRequested);
        console.log("summaryShown:", summaryShown);

        // Additional debugging for the collected_info channel/category
        console.log("=== COLLECTED INFO SPECIFIC DEBUG ===");
        console.log(
          "collected_info channel:",
          response.collected_info?.channel
        );
        console.log(
          "collected_info category:",
          response.collected_info?.category
        );
        console.log(
          "Check if collected_info category needs amount:",
          response.collected_info?.category
            ? checkIfCategoryNeedsAmount(response.collected_info.category)
            : "N/A"
        );
        console.log(
          "Check if selected category needs amount:",
          selectedCategory
            ? checkIfCategoryNeedsAmount(selectedCategory)
            : "N/A"
        );

        console.log("=== AMOUNT DETECTION DEBUG ===");
        console.log("hasCompleteInfo:", hasCompleteInfo);
        console.log("categoryNeedsAmount:", categoryNeedsAmount);
        console.log("collectedInfoNeedsAmount:", collectedInfoNeedsAmount);
        console.log("shouldRequestAmount:", shouldRequestAmount);
        console.log("amountRequested:", amountRequested);
        console.log("summaryShown:", summaryShown);

        // If this is a description request and we have complete info + need amount, ask for amount after user responds
        if (isDescriptionRequest && hasCompleteInfo && shouldRequestAmount) {
          console.log(
            "Bot is asking for description, but we'll need to ask for amount after user responds"
          );
          // Set a flag to request amount after user provides description
          return;
        }

        // If we have all required info (channel, category, description) and haven't shown summary yet, show summary first
        if (hasAllRequiredInfo && !summaryShown) {
          console.log(
            "Showing summary with all required info available from collected_info"
          );
          setSummaryShown(true);

          console.log(
            "Processing summary/complete info - checking amount requirements"
          );

          // First, show the summary
          setTimeout(() => {
            // Get description from collected_info or use user's current message as fallback
            const descriptionText =
              response.collected_info?.ai_generated_description ||
              response.collected_info?.description ||
              // If we have selected channel/category but no description in collected_info, use user message
              (selectedChannel && selectedCategory && userMessage.length > 10
                ? userMessage
                : response.collected_info?.channel &&
                  response.collected_info?.category &&
                  userMessage.length > 10
                ? userMessage
                : "Tidak tersedia");

            const summaryText = `📋 RINGKASAN KELUHAN ANDA\n\n📍 Channel: ${
              response.collected_info?.channel ||
              selectedChannel ||
              "Tidak tersedia"
            }\n\n📂 Kategori: ${
              response.collected_info?.category ||
              selectedCategory ||
              "Tidak tersedia"
            }\n\n📝 Deskripsi: ${descriptionText}`;

            const summaryMessage: MessageType = {
              id: getUniqueId(),
              text: summaryText,
              isBot: true,
              timestamp: new Date().toLocaleTimeString("id-ID", {
                hour: "2-digit",
                minute: "2-digit",
              }),
            };

            setMessages((prev) => {
              const newMessages = [...prev, summaryMessage];
              AsyncStorage.setItem(storageKey, JSON.stringify(newMessages));
              return newMessages;
            });

            // After showing summary, check if amount is needed
            if (shouldRequestAmount) {
              setTimeout(() => {
                const amountMessage: MessageType = {
                  id: getUniqueId(),
                  text: "Untuk melengkapi tiket, mohon masukkan nominal transaksi (dalam Rupiah):",
                  isBot: true,
                  timestamp: new Date().toLocaleTimeString("id-ID", {
                    hour: "2-digit",
                    minute: "2-digit",
                  }),
                };
                setMessages((prev) => {
                  const newMessages = [...prev, amountMessage];
                  AsyncStorage.setItem(storageKey, JSON.stringify(newMessages));
                  return newMessages;
                });
                setAmountRequested(true);
              }, 1500);
            } else {
              // Check if transaction date is needed when amount is not needed
              const shouldRequestTransactionDate =
                (selectedCategory &&
                  checkIfCategoryNeedsTransactionDate(selectedCategory)) ||
                (response.collected_info?.category &&
                  checkIfCategoryNeedsTransactionDate(
                    response.collected_info.category
                  ));

              if (shouldRequestTransactionDate && !transactionDateRequested) {
                setTimeout(() => {
                  const transactionDateMessage: MessageType = {
                    id: getUniqueId(),
                    text: "Untuk melengkapi tiket, mohon masukkan tanggal transaksi (DD/MM/YYYY):",
                    isBot: true,
                    timestamp: new Date().toLocaleTimeString("id-ID", {
                      hour: "2-digit",
                      minute: "2-digit",
                    }),
                  };
                  setMessages((prev) => {
                    const newMessages = [...prev, transactionDateMessage];
                    AsyncStorage.setItem(
                      storageKey,
                      JSON.stringify(newMessages)
                    );
                    return newMessages;
                  });
                  setTransactionDateRequested(true);
                }, 1500);
              } else {
                // No amount or transaction date needed, show buttons for create/edit ticket
                setTimeout(() => {
                  const proceedMessage: MessageType = {
                    id: getUniqueId(),
                    text: "Apakah Anda ingin membuat tiket keluhan baru atau mengedit tiket yang sudah ada?",
                    isBot: true,
                    timestamp: new Date().toLocaleTimeString("id-ID", {
                      hour: "2-digit",
                      minute: "2-digit",
                    }),
                    hasButtons: true,
                    buttonSelected: undefined,
                  };
                  setMessages((prev) => {
                    const newMessages = [...prev, proceedMessage];
                    AsyncStorage.setItem(
                      storageKey,
                      JSON.stringify(newMessages)
                    );
                    return newMessages;
                  });
                }, 1500);
              }
            }
          }, 1000);

          // Save updated session state
          await AsyncStorage.setItem(
            "chatSession",
            JSON.stringify({
              sessionId,
              summaryShown: true,
              ticketCreatedInSession,
              amountRequested: shouldRequestAmount ? true : amountRequested,
              transactionDateRequested,
              selectedTerminal,
              confirmedAmount,
            })
          );

          return; // Exit early
        }

        // If we have collected info and it indicates completion, check for amount requirement
        if ((isSummaryMessage || hasCompleteInfo) && !summaryShown) {
          setSummaryShown(true);

          console.log(
            "Processing summary/complete info - checking amount requirements"
          );

          if (shouldRequestAmount) {
            // Ask for amount first, don't show buttons yet
            setTimeout(() => {
              const amountMessage: MessageType = {
                id: getUniqueId(),
                text: "Untuk melengkapi tiket, mohon masukkan nominal transaksi (dalam Rupiah):",
                isBot: true,
                timestamp: new Date().toLocaleTimeString("id-ID", {
                  hour: "2-digit",
                  minute: "2-digit",
                }),
              };
              setMessages((prev) => {
                const newMessages = [...prev, amountMessage];
                AsyncStorage.setItem(storageKey, JSON.stringify(newMessages));
                return newMessages;
              });
              setAmountRequested(true);
            }, 1000);
            return; // Exit early to prevent showing buttons
          } else {
            // Only show buttons if no amount is needed
            setTimeout(() => {
              setMessages((prev) => {
                const updatedMessages = prev.map((msg) =>
                  msg.id === botMessage.id
                    ? { ...msg, hasButtons: true, buttonSelected: undefined }
                    : msg
                );
                AsyncStorage.setItem(
                  storageKey,
                  JSON.stringify(updatedMessages)
                );
                return updatedMessages;
              });
            }, 500);
          }

          // Save updated session state
          await AsyncStorage.setItem(
            "chatSession",
            JSON.stringify({
              sessionId,
              summaryShown: true,
              ticketCreatedInSession,
              amountRequested: shouldRequestAmount ? true : amountRequested,
              transactionDateRequested,
              selectedTerminal,
              confirmedAmount,
            })
          );
        }

        // Check if bot is asking for amount (only after summary is shown and we confirmed amount is needed)
        // This prevents premature amount requests before the summary
        if (
          summaryShown &&
          (messageText.includes("nominal transaksi") ||
            messageText.includes("masukkan nominal") ||
            (messageText.includes("melengkapi tiket") &&
              messageText.includes("nominal")))
        ) {
          console.log(
            "Bot is asking for amount after summary - setting amountRequested to true"
          );
          setAmountRequested(true);
          // Don't add any buttons for amount input - let user type freely
          return;
        }

        // Special handling for "Pilih salah satu:" - check context
        if (response.message?.trim() === "Pilih salah satu:") {
          setTimeout(() => {
            setMessages((prevMessages) => {
              // Look at recent messages for context
              const recentMessages = prevMessages.slice(-3);
              const recentText = recentMessages
                .map((m) => m.text?.toLowerCase() || "")
                .join(" ");

              const hasChannelContext =
                recentText.includes("channel") ||
                recentText.includes("platform");
              const hasCategoryContext =
                recentText.includes("kategori") ||
                recentText.includes("jenis masalah") ||
                recentText.includes("jenis keluhan") ||
                recentText.includes("keluhan");

              // Check if we have channel selected but no category - show category buttons
              const shouldShowCategory =
                selectedChannel && !selectedCategory && !hasCategoryContext;

              // Avoid duplicates
              const hasChannelButtons = prevMessages.some(
                (msg) => msg.hasChannelButtons
              );
              const hasCategoryButtons = prevMessages.some(
                (msg) => msg.hasCategoryButtons
              );

              if (hasChannelContext && !hasChannelButtons) {
                const channelButtonMessage: MessageType = {
                  id: getUniqueId(),
                  text: "Silakan pilih channel yang Anda gunakan:",
                  isBot: true,
                  timestamp: new Date().toLocaleTimeString("id-ID", {
                    hour: "2-digit",
                    minute: "2-digit",
                  }),
                  hasChannelButtons: true,
                };
                return [...prevMessages, channelButtonMessage];
              }

              if (
                (hasCategoryContext || shouldShowCategory) &&
                !hasCategoryButtons
              ) {
                const categoryButtonMessage: MessageType = {
                  id: getUniqueId(),
                  text: "Silakan pilih kategori masalah Anda:",
                  isBot: true,
                  timestamp: new Date().toLocaleTimeString("id-ID", {
                    hour: "2-digit",
                    minute: "2-digit",
                  }),
                  hasCategoryButtons: true,
                };
                return [...prevMessages, categoryButtonMessage];
              }

              return prevMessages;
            });
          }, 500);
        }

        // Direct detection for channel keywords (without "Pilih salah satu:")
        else if (
          messageText.includes("channel") ||
          messageText.includes("platform") ||
          messageText.includes("bisa anda beri tahu saya channel")
        ) {
          setTimeout(() => {
            setMessages((prev) => {
              const hasChannelButtons = prev.some(
                (msg) => msg.hasChannelButtons
              );
              if (hasChannelButtons) return prev;

              const channelButtonMessage: MessageType = {
                id: getUniqueId(),
                text: "Silakan pilih channel yang Anda gunakan:",
                isBot: true,
                timestamp: new Date().toLocaleTimeString("id-ID", {
                  hour: "2-digit",
                  minute: "2-digit",
                }),
                hasChannelButtons: true,
              };
              return [...prev, channelButtonMessage];
            });
          }, 500);
        }

        // Direct detection for category keywords (without "Pilih salah satu:")
        else if (
          messageText.includes("kategori") ||
          messageText.includes("jenis masalah") ||
          messageText.includes("jenis keluhan") ||
          messageText.includes("masalah apa") ||
          messageText.includes("keluhan apa") ||
          messageText.includes("bisa anda beri tahu saya jenis")
        ) {
          setTimeout(() => {
            setMessages((prev) => {
              const hasCategoryButtons = prev.some(
                (msg) => msg.hasCategoryButtons
              );
              if (hasCategoryButtons) return prev;

              const categoryButtonMessage: MessageType = {
                id: getUniqueId(),
                text: "Silakan pilih kategori masalah Anda:",
                isBot: true,
                timestamp: new Date().toLocaleTimeString("id-ID", {
                  hour: "2-digit",
                  minute: "2-digit",
                }),
                hasCategoryButtons: true,
              };
              return [...prev, categoryButtonMessage];
            });
          }, 500);
        }

        // Only add suggestions if they don't conflict with button logic
        if (
          response.suggestions &&
          response.suggestions.length > 0 &&
          response.message?.trim() !== "Pilih salah satu:" &&
          !messageText.includes("channel") &&
          !messageText.includes("kategori") &&
          !messageText.includes("jenis")
        ) {
          const suggestionMessage: MessageType = {
            id: getUniqueId(),
            text: "Pilihan lainnya:",
            isBot: true,
            timestamp: new Date().toLocaleTimeString("id-ID", {
              hour: "2-digit",
              minute: "2-digit",
            }),
            hasLiveChatButtons: true,
          };
          setMessages((prev) => {
            const newMessages = [...prev, suggestionMessage];
            AsyncStorage.setItem(storageKey, JSON.stringify(newMessages));
            return newMessages;
          });
        }
      } catch (error) {
        console.error("Chatbot API error:", error);
        // Add error message with retry option
        const errorMessage: MessageType = {
          id: getUniqueId(),
          text: "Maaf, terjadi kesalahan dalam sistem. Silakan coba lagi atau ketik 'help' untuk bantuan.",
          isBot: true,
          timestamp: new Date().toLocaleTimeString("id-ID", {
            hour: "2-digit",
            minute: "2-digit",
          }),
        };
        setMessages((prev) => {
          const newMessages = [...prev, errorMessage];
          AsyncStorage.setItem(storageKey, JSON.stringify(newMessages));
          return newMessages;
        });
      } finally {
        setIsTyping(false);
      }
    },
    [
      sessionId,
      summaryShown,
      user,
      authUser,
      ticketCreatedInSession,
      storageKey,
      amountRequested,
      transactionDateRequested,
      messages,
      confirmedAmount,
      selectedChannel,
      selectedCategory,
    ]
  );

  // Handler for channel selection
  const handleChannelSelect = useCallback(
    (channel: string, messageId?: string) => {
      if (selectedChannel) return; // Prevent multiple selections

      setSelectedChannel(channel);

      // Update button group states to disable other options
      if (messageId) {
        setButtonGroupStates((prev) => ({
          ...prev,
          [messageId]: {
            type: "channel",
            selectedValue: channel,
          },
        }));
      }

      // Add user message showing selected channel
      const userMessage: MessageType = {
        id: getUniqueId(),
        text: channel,
        isBot: false,
        timestamp: new Date().toLocaleTimeString("id-ID", {
          hour: "2-digit",
          minute: "2-digit",
        }),
      };

      setMessages((prev) => {
        const newMessages = [...prev, userMessage];
        AsyncStorage.setItem(storageKey, JSON.stringify(newMessages));
        return newMessages;
      });

      // If ATM or CRM channel is selected, ask for terminal first
      console.log("=== CHANNEL NEEDS TERMINAL CHECK ===");
      console.log("Selected channel:", channel);
      console.log("Terminals length:", terminals.length);
      console.log("Is ATM or CRM:", channel === "ATM" || channel === "CRM");

      const channelNeedsTerminal =
        (channel === "ATM" || channel === "CRM") && terminals.length > 0;

      console.log("channelNeedsTerminal:", channelNeedsTerminal);

      if (channelNeedsTerminal) {
        setTimeout(() => {
          const terminalMessage: MessageType = {
            id: getUniqueId(),
            text: `Silakan pilih terminal ${channel} yang Anda gunakan:`,
            isBot: true,
            timestamp: new Date().toLocaleTimeString("id-ID", {
              hour: "2-digit",
              minute: "2-digit",
            }),
            hasTerminalButtons: true,
          };
          setMessages((prev) => {
            const newMessages = [...prev, terminalMessage];
            AsyncStorage.setItem(storageKey, JSON.stringify(newMessages));
            return newMessages;
          });
        }, 500);
      } else {
        // Send to chatbot API for other channels
        sendToChatbot(channel);

        // Fallback: If chatbot doesn't respond with category request, show category buttons after delay
        setTimeout(() => {
          if (!selectedCategory) {
            setMessages((prev) => {
              const hasCategoryButtons = prev.some(
                (msg) => msg.hasCategoryButtons
              );
              if (hasCategoryButtons) return prev;

              console.log(
                "Fallback: Adding category buttons after channel selection"
              );
              const categoryButtonMessage: MessageType = {
                id: getUniqueId(),
                text: "Silakan pilih kategori masalah Anda:",
                isBot: true,
                timestamp: new Date().toLocaleTimeString("id-ID", {
                  hour: "2-digit",
                  minute: "2-digit",
                }),
                hasCategoryButtons: true,
              };
              const newMessages = [...prev, categoryButtonMessage];
              AsyncStorage.setItem(storageKey, JSON.stringify(newMessages));
              return newMessages;
            });
          }
        }, 2500); // Wait 2.5 seconds for chatbot response, then show fallback
      }
    },
    [sendToChatbot, storageKey, selectedChannel, terminals]
  );

  // Handler for terminal selection
  const handleTerminalSelect = useCallback(
    (terminalId: number, messageId?: string) => {
      console.log("handleTerminalSelect called with terminalId:", terminalId);

      if (selectedTerminal) {
        console.log("Terminal already selected, returning");
        return; // Prevent multiple selections
      }

      // Find terminal by ID
      const terminal = terminals.find((t) => t.terminal_id === terminalId);
      if (!terminal) {
        console.log("Terminal not found for ID:", terminalId);
        return;
      }

      console.log("Setting selected terminal to:", terminal);
      setSelectedTerminal(terminal.terminal_id.toString());

      // Update button group states to disable other options
      if (messageId) {
        setButtonGroupStates((prev) => ({
          ...prev,
          [messageId]: {
            type: "terminal",
            selectedValue: terminal.terminal_id.toString(),
          },
        }));
      }

      // Add user message showing selected terminal location
      const terminalDisplay = `${terminal.terminal_code} - ${terminal.location}`;
      const userMessage: MessageType = {
        id: getUniqueId(),
        text: terminalDisplay,
        isBot: false,
        timestamp: new Date().toLocaleTimeString("id-ID", {
          hour: "2-digit",
          minute: "2-digit",
        }),
      };

      console.log("Adding user message:", userMessage);
      setMessages((prev) => {
        console.log("Previous messages count:", prev.length);
        const newMessages = [...prev, userMessage];
        console.log("New messages count:", newMessages.length);
        AsyncStorage.setItem(storageKey, JSON.stringify(newMessages));
        return newMessages;
      });

      // Send channel with terminal info to chatbot API
      const channelWithTerminal = `${selectedChannel} - ${terminalDisplay}`;
      console.log("Sending to chatbot:", channelWithTerminal);
      sendToChatbot(channelWithTerminal);

      // Fallback: If chatbot doesn't respond with category request, show category buttons after delay
      setTimeout(() => {
        if (!selectedCategory) {
          setMessages((prev) => {
            const hasCategoryButtons = prev.some(
              (msg) => msg.hasCategoryButtons
            );
            if (hasCategoryButtons) return prev;

            console.log(
              "Fallback: Adding category buttons after terminal selection"
            );
            const categoryButtonMessage: MessageType = {
              id: getUniqueId(),
              text: "Silakan pilih kategori masalah Anda:",
              isBot: true,
              timestamp: new Date().toLocaleTimeString("id-ID", {
                hour: "2-digit",
                minute: "2-digit",
              }),
              hasCategoryButtons: true,
            };
            const newMessages = [...prev, categoryButtonMessage];
            AsyncStorage.setItem(storageKey, JSON.stringify(newMessages));
            return newMessages;
          });
        }
      }, 2500); // Wait 2.5 seconds for chatbot response, then show fallback
    },
    [sendToChatbot, storageKey, selectedTerminal, terminals, selectedChannel]
  );

  // Handler for category selection
  const handleCategorySelect = useCallback(
    (category: string, messageId?: string) => {
      if (selectedCategory) return; // Prevent multiple selections

      setSelectedCategory(category);

      // Update button group states to disable other options
      if (messageId) {
        setButtonGroupStates((prev) => ({
          ...prev,
          [messageId]: {
            type: "category",
            selectedValue: category,
          },
        }));
      }

      // Map display name back to general category for chatbot
      let generalCategory = category;
      if (category.includes("PEMBAYARAN")) {
        generalCategory = "PEMBAYARAN";
      } else if (category.includes("TAPCASH")) {
        generalCategory = "TAPCASH";
      } else if (category.includes("TOP UP")) {
        generalCategory = "TOP UP";
      } else if (category.includes("TRANSFER")) {
        generalCategory = "TRANSFER";
      } else if (category.includes("TARIK TUNAI")) {
        generalCategory = "TARIK TUNAI";
      } else if (category.includes("SETOR TUNAI")) {
        generalCategory = "SETOR TUNAI";
      } else if (category.includes("MOBILE TUNAI")) {
        generalCategory = "MOBILE TUNAI";
      } else if (category.includes("BI FAST")) {
        generalCategory = "BI FAST";
      } else if (
        category.includes("DISPUTE") ||
        category.includes("CHARGEBACK")
      ) {
        generalCategory = "DISPUTE";
      }

      // Add user message showing selected category
      const userMessage: MessageType = {
        id: getUniqueId(),
        text: generalCategory, // Use general category for display
        isBot: false,
        timestamp: new Date().toLocaleTimeString("id-ID", {
          hour: "2-digit",
          minute: "2-digit",
        }),
      };

      setMessages((prev) => {
        const newMessages = [...prev, userMessage];
        AsyncStorage.setItem(storageKey, JSON.stringify(newMessages));
        return newMessages;
      });

      // Check if the selected category requires amount input
      console.log("Category selected:", generalCategory);
      console.log(
        "Category requires amount:",
        checkIfCategoryNeedsAmount(generalCategory)
      );
      console.log(
        "Category requires transaction date:",
        checkIfCategoryNeedsTransactionDate(generalCategory)
      );

      // Send to chatbot API
      sendToChatbot(generalCategory);
    },
    [sendToChatbot, storageKey, selectedCategory]
  );

  // Handler for edit button selection
  const handleEditSelect = useCallback(
    (editType: "edit" | "create", messageId: string) => {
      // Update button group states to disable other options
      setButtonGroupStates((prev) => ({
        ...prev,
        [messageId]: {
          type: "edit",
          selectedValue: editType,
        },
      }));

      if (editType === "edit") {
        // For edit mode, include collected info from chatbot as preset data
        const params: any = {
          mode: "edit",
        };

        // Add collected info as parameters if available
        if (collectedInfo) {
          if (collectedInfo.channel) {
            params.presetChannel = collectedInfo.channel;
          }
          if (collectedInfo.category) {
            params.presetCategory = collectedInfo.category;
          }
          if (collectedInfo.amount) {
            params.presetAmount = collectedInfo.amount.toString();
          }
          if (collectedInfo.description) {
            params.presetDescription = collectedInfo.description;
          }
        }

        // Extract transaction date from user messages if transaction date was requested
        if (transactionDateRequested) {
          const dateMessages = messages.filter(
            (msg) =>
              !msg.isBot &&
              msg.text &&
              /\d{1,2}[\/-]\d{1,2}[\/-]\d{4}/.test(msg.text)
          );

          if (dateMessages.length > 0) {
            const latestDateMsg = dateMessages[dateMessages.length - 1];
            params.presetTransactionDate = latestDateMsg.text;
          }
        }

        // Extract amount from confirmed amount or messages if available
        if (confirmedAmount && parseInt(confirmedAmount) > 0) {
          params.presetAmount = confirmedAmount;
        }

        router.push({
          pathname: "/complaint/confirmation",
          params,
        });
      } else {
        // For create mode, include collected info from chatbot as preset data
        const params: any = {
          mode: "create",
        };

        // Add collected info as parameters if available
        if (collectedInfo) {
          if (collectedInfo.channel) {
            params.presetChannel = collectedInfo.channel;
          }
          if (collectedInfo.category) {
            params.presetCategory = collectedInfo.category;
          }
          if (collectedInfo.amount) {
            params.presetAmount = collectedInfo.amount.toString();
          }
          if (
            collectedInfo.description ||
            collectedInfo.ai_generated_description
          ) {
            params.presetDescription =
              collectedInfo.ai_generated_description ||
              collectedInfo.description;
          }
        }

        // Extract transaction date from user messages if transaction date was requested
        if (transactionDateRequested) {
          const dateMessages = messages.filter(
            (msg) =>
              !msg.isBot &&
              msg.text &&
              /\d{1,2}[\/-]\d{1,2}[\/-]\d{4}/.test(msg.text)
          );

          if (dateMessages.length > 0) {
            const latestDateMsg = dateMessages[dateMessages.length - 1];
            console.log("Setting presetTransactionDate:", latestDateMsg.text);
            params.presetTransactionDate = latestDateMsg.text;
          }
        }

        console.log("Chat params being sent to confirmation:", params);

        router.push({
          pathname: "/complaint/confirmation",
          params,
        });
      }
    },
    [currentTicketId, router, collectedInfo, transactionDateRequested, messages]
  );

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
        // Save session state after attachment upload to persist the upload state
        setTimeout(() => {
          saveSessionState();
        }, 500);
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
        if (
          storedTicketId &&
          storedTicketId.trim() !== "" &&
          storedTicketId !== "null" &&
          storedTicketId !== "undefined"
        ) {
          setCurrentTicketId(storedTicketId);
        } else {
          setCurrentTicketId(null);
        }
      } catch {
        setCurrentTicketId(null);
      }

      // Handle case when coming from ticket detail (isFromTicketDetail = true but fromConfirmation != "true")
      if (isFromTicketDetail && fromConfirmation !== "true") {
        console.log(
          "🎫 Coming from ticket detail, processing ticketId:",
          ticketId
        );
        if (
          ticketId &&
          typeof ticketId === "string" &&
          ticketId.trim() !== "" &&
          ticketId !== "null" &&
          ticketId !== "undefined"
        ) {
          console.log(
            "🎫 Setting currentTicketId from ticket detail navigation:",
            ticketId
          );
          setCurrentTicketId(ticketId);
          setTicketCreatedInSession(true); // Mark as having valid ticket
          await AsyncStorage.setItem("currentTicketId", ticketId);
        }

        // Skip initial messages and go straight to live chat
        setIsLiveChat(true);

        // Auto-connect to agent
        setTimeout(() => {
          quickDM();
        }, 500);

        return;
      }

      if (fromConfirmation === "true") {
        console.log(
          "📝 fromConfirmation is true, processing ticketId:",
          ticketId
        );
        // Try to get ticket ID from URL params
        if (
          ticketId &&
          typeof ticketId === "string" &&
          ticketId.trim() !== "" &&
          ticketId !== "null" &&
          ticketId !== "undefined"
        ) {
          console.log(
            "🎫 Setting currentTicketId from confirmation flow:",
            ticketId
          );
          setCurrentTicketId(ticketId);
          setTicketCreatedInSession(true);
          await AsyncStorage.setItem("currentTicketId", ticketId);

          // Skip bot messages and go directly to live chat
          setIsLiveChat(true);
          setMessages([]); // Start with empty messages

          // Auto-connect to agent after a short delay
          setTimeout(() => {
            quickDM();
          }, 500);

          return; // Exit early to skip bot messages
        } else {
          // If no URL param, check storage again
          const storedId = await AsyncStorage.getItem("currentTicketId");
          if (
            storedId &&
            storedId.trim() !== "" &&
            storedId !== "null" &&
            storedId !== "undefined"
          ) {
            setCurrentTicketId(storedId);
            setTicketCreatedInSession(true);
          }
        }

        // If coming from ticket detail, skip initial messages and go straight to live chat
        if (isFromTicketDetail) {
          setIsLiveChat(true);

          // Auto-connect to agent
          setTimeout(() => {
            quickDM();
          }, 500);

          return;
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
          AsyncStorage.setItem(storageKey, JSON.stringify(newMessages));
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
            validationSelected: undefined, // Initialize validation selection state
          };
          setMessages((prev) => {
            // Avoid duplicate validation messages
            const exists = prev.find((m) => m.hasValidationButtons);
            if (exists) return prev;
            const newMessages = [...prev, validationMessage];
            // Save to AsyncStorage
            AsyncStorage.setItem(storageKey, JSON.stringify(newMessages));
            return newMessages;
          });
        }, 3000);

        return () => clearTimeout(timeoutId);
      }
    };

    initializeTicket();
  }, [fromConfirmation, ticketId, isFromTicketDetail]);

  // Fetch attachments only when ticket ID is available and valid
  useEffect(() => {
    if (currentTicketId && currentTicketId.trim() !== "") {
      console.log("🔄 Chat: Fetching attachments for ticket:", currentTicketId);
      fetchAttachments(currentTicketId);
    }
  }, [currentTicketId, fetchAttachments]);

  // Send ticket info when from ticket detail - with duplicate prevention
  useEffect(() => {
    if (isFromTicketDetail && currentTicketId && isLiveChat) {
      const hasTicketInfo = messages.some(
        (m) => m.isTicketInfo && m.ticketId === currentTicketId
      );
      if (!hasTicketInfo) {
        console.log(
          "🔄 Chat: Fetching ticket detail for info display:",
          currentTicketId
        );
        // Fetch ticket detail to get the correct created time
        fetchTicketDetail(currentTicketId).then(() => {
          // Create ticket info message with proper timestamp from ticketDetail
          const actualCreatedTime = ticketDetail?.created_time
            ? new Date(ticketDetail.created_time).toLocaleTimeString("id-ID", {
                hour: "2-digit",
                minute: "2-digit",
              })
            : new Date().toLocaleTimeString("id-ID", {
                hour: "2-digit",
                minute: "2-digit",
              });

          const ticketInfoMessage = {
            id: getUniqueId(),
            text: `📋 Tiket #${currentTicketId.slice(-6)}`,
            isBot: false,
            timestamp: actualCreatedTime,
            isTicketInfo: true,
            ticketId: currentTicketId,
          };

          setMessages((prev) => {
            const newMessages = [...prev, ticketInfoMessage];
            AsyncStorage.setItem(storageKey, JSON.stringify(newMessages));
            return newMessages;
          });

          // Send ticket info to socket for agent to receive
          if (socket.connected) {
            socket.emit("chat:send", {
              ...ticketInfoMessage,
              author: chatUser,
              createdAt: ticketDetail?.created_time
                ? new Date(ticketDetail.created_time).getTime()
                : Date.now(),
              type: "ticket-info",
              room: ACTIVE_ROOM,
            });

            // Send additional ticket context for agent
            socket.emit("ticket:context", {
              room: ACTIVE_ROOM,
              ticketId: currentTicketId,
              fromUserId: uid,
              timestamp: ticketDetail?.created_time
                ? new Date(ticketDetail.created_time).getTime()
                : Date.now(),
            });
          }
        });
      }
    }
  }, [
    isFromTicketDetail,
    currentTicketId,
    isLiveChat,
    messages,
    storageKey,
    fetchTicketDetail,
  ]);

  // Socket connection and auth
  useEffect(() => {
    const s = socket;
    const onConnect = () => {
      if (uid) {
        s.emit("auth:register", { userId: uid });
        s.emit("join", { room: ACTIVE_ROOM, userId: uid });
        s.emit("presence:get", { room: ACTIVE_ROOM });
      }
    };
    const onDisconnect = () => {
      // Connection lost - could show offline indicator here
    };
    const onAuthOk = () => {
      // Authentication successful
    };

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

  // Auto-save session state when important state changes
  useEffect(() => {
    if (messages.length > 0) {
      saveSessionState();
    }
  }, [
    messages,
    sessionId,
    collectedInfo,
    selectedChannel,
    selectedCategory,
    selectedTerminal,
    confirmedAmount,
    attachments, // Add attachments to dependency array
    currentTicketId, // Add currentTicketId to dependency array
    ticketCreatedInSession, // Add ticketCreatedInSession to persist upload state
    uploadStepReached, // Add uploadStepReached to dependency array
    saveSessionState,
  ]);

  // Initialize chat on component mount
  useEffect(() => {
    initializeChat();
  }, [initializeChat]);

  // Load local messages per room
  useEffect(() => {
    (async () => {
      try {
        // Load session state first
        const [sessionData, ticketData, messagesData] = await Promise.all([
          AsyncStorage.getItem("chatSession"),
          AsyncStorage.getItem("currentTicketId"),
          AsyncStorage.getItem(storageKey),
        ]);

        // Restore session state if available
        if (sessionData) {
          try {
            const session = JSON.parse(sessionData);
            if (session.sessionId) {
              setSessionId(session.sessionId);
            }
            if (session.summaryShown !== undefined) {
              setSummaryShown(session.summaryShown);
            }
            // Only restore ticketCreatedInSession if not coming from ticket detail
            if (
              session.ticketCreatedInSession !== undefined &&
              !isFromTicketDetail
            ) {
              setTicketCreatedInSession(session.ticketCreatedInSession);
            }
            if (session.amountRequested !== undefined) {
              setAmountRequested(session.amountRequested);
            }
            if (session.transactionDateRequested !== undefined) {
              setTransactionDateRequested(session.transactionDateRequested);
            }
            if (session.editFormSelected !== undefined) {
              setEditFormSelected(session.editFormSelected);
            }
            if (session.selectedTerminal !== undefined) {
              setSelectedTerminal(session.selectedTerminal);
            }
            if (session.confirmedAmount !== undefined) {
              setConfirmedAmount(session.confirmedAmount);
            }
          } catch {
            console.log("Error parsing session data");
          }
        }

        // Check if coming back from confirmation (edit form)
        if (
          fromConfirmation === "true" &&
          ticketData &&
          ticketData !== "null"
        ) {
          setTicketCreatedInSession(true);
          setEditFormSelected(true);

          // Add ticket created message and show ticket button
          setTimeout(() => {
            const ticketCreatedMessage = {
              id: getUniqueId(),
              text: "Tiket berhasil dibuat dari edit form! Upload file sekarang tersedia.",
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
                (m) => m.hasTicketButton && m.text.includes("edit form")
              );
              if (exists) return prev;
              const newMessages = [...prev, ticketCreatedMessage];
              AsyncStorage.setItem(storageKey, JSON.stringify(newMessages));

              // Mark that user has reached upload step
              setUploadStepReached(true);

              return newMessages;
            });
          }, 500);

          // Update session to reflect ticket creation
          await AsyncStorage.setItem(
            "chatSession",
            JSON.stringify({
              sessionId: sessionData ? JSON.parse(sessionData).sessionId : null,
              summaryShown: sessionData
                ? JSON.parse(sessionData).summaryShown
                : false,
              ticketCreatedInSession: true,
              amountRequested: sessionData
                ? JSON.parse(sessionData).amountRequested
                : false,
              transactionDateRequested: sessionData
                ? JSON.parse(sessionData).transactionDateRequested
                : false,
              selectedTerminal: sessionData
                ? JSON.parse(sessionData).selectedTerminal
                : null,
              editFormSelected: true,
            })
          );
        }

        // Clear ticketCreatedInSession when coming from ticket detail
        if (isFromTicketDetail) {
          setTicketCreatedInSession(false);
          // Also clear from storage to prevent restoration
          await AsyncStorage.setItem(
            "chatSession",
            JSON.stringify({
              sessionId: sessionData ? JSON.parse(sessionData).sessionId : null,
              summaryShown: sessionData
                ? JSON.parse(sessionData).summaryShown
                : false,
              ticketCreatedInSession: false,
              amountRequested: false,
              transactionDateRequested: false,
              selectedTerminal: null,
              editFormSelected: false,
            })
          );
        }

        // Restore ticket ID
        if (ticketData && ticketData !== "null" && ticketData !== "undefined") {
          setCurrentTicketId(ticketData);
        }

        // Load messages
        if (messagesData) {
          try {
            const parsed = JSON.parse(messagesData) as MessageType[];
            const uniq = Array.from(
              new Map(parsed.map((m) => [m.id, m])).values()
            );

            if (isFromTicketDetail && uniq.length > 0) {
              setMessages(uniq);
            } else if (uniq.length > 0) {
              // Has existing messages - restore them
              setMessages(uniq);
            } else {
              // No messages - start fresh
              setMessages([initialBotMessage]);
            }
          } catch {
            setMessages([initialBotMessage]);
          }
        } else {
          if (isFromTicketDetail) {
            setMessages([]);
          } else {
            setMessages([initialBotMessage]);
          }
        }
      } catch (error) {
        console.log("Error loading chat data:", error);
        setMessages([initialBotMessage]);
      }
    })();
  }, [storageKey, isFromTicketDetail, fromConfirmation]);

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
        // Handle ticket info from socket
        isTicketInfo: msg.type === "ticket-info" || msg.isTicketInfo,
        ticketId: msg.ticketId,
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
        AsyncStorage.setItem(storageKey, JSON.stringify(next));
        return next;
      });
    };

    // Call handlers
    const onRinging = () => {
      setCallStatus("ringing");
    };
    const onAccepted = () => {
      setCallStatus("audio-call");
      setCallStartTime(Date.now());
    };

    const onAudioCallAccepted = () => {
      setCallStatus("audio-call");
      setIsAudioCall(true);
      setCallStartTime(Date.now());
      startAudioCall();
    };
    const onDeclined = () => {
      setCallStatus("idle");
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
      stopCall();
      setCallStatus("idle");
      setIsAudioCall(false);
    };
    // Frame handling removed - audio only

    const onTicketContext = ({
      ticketId,
      fromUserId,
    }: {
      ticketId: string;
      fromUserId: string;
    }) => {
      // Agent receives ticket context - could be used for notifications or UI updates
      console.log("Received ticket context:", { ticketId, fromUserId });
    };

    s.on("dm:pending", onDMPending);
    s.on("dm:request", onDMRequest);
    s.on("dm:ready", onDMReady);
    s.on("presence:list", onPresence);
    s.on("chat:new", onNew);
    s.on("call:ringing", onRinging);
    s.on("call:accepted", onAccepted);
    s.on("call:declined", onDeclined);
    s.on("call:ended", onEnded);
    // s.on("call:frame", onFrame); // Removed - audio only
    s.on("audio:accepted", onAudioCallAccepted);
    // s.on("audio:data", onAudioData); // Removed - WebRTC handles audio directly
    s.on("ticket:context", onTicketContext);

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
      // s.off("call:frame", onFrame); // Removed - audio only
      s.off("audio:accepted", onAudioCallAccepted);
      // s.off("audio:data", onAudioData); // Removed - WebRTC handles audio directly
      s.off("ticket:context", onTicketContext);
      if (uid) s.emit("leave", { room: ACTIVE_ROOM, userId: uid });
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [socket, uid, ACTIVE_ROOM, storageKey]);

  const clearChatHistory = useCallback(async () => {
    try {
      console.log("🧹 CLEARING CHAT HISTORY - START");
      console.log("Pre-clear state:", {
        selectedChannel,
        selectedCategory,
        amountRequested,
        transactionDateRequested,
        summaryShown,
        ticketCreatedInSession,
      });

      // Clear ALL storage keys that might contain chat messages
      const allKeys = await AsyncStorage.getAllKeys();
      const chatKeys = allKeys.filter((key) => key.startsWith("msgs:"));
      if (chatKeys.length > 0) {
        await AsyncStorage.multiRemove(chatKeys);
      }

      // Clear session and ticket data
      await AsyncStorage.multiRemove([
        "currentTicketId",
        "chatSession",
        COMPLAINT_SESSION_KEY,
        LIVE_CHAT_SESSION_KEY,
      ]);
      setCurrentTicketId(null);
      setSessionId(null);

      // Reset to initial message only (hard reset)
      setMessages([initialBotMessage]);

      // Reset ALL chat related state
      setIsLiveChat(false);
      setDmRoom(null);
      setActivePeers([]);
      setPeerCount(1);
      setCallStatus("idle");
      setCallStartTime(null);
      setSummaryShown(false);
      setTicketCreatedInSession(false);
      setAmountRequested(false);
      setTransactionDateRequested(false);
      setConfirmedAmount(null);
      setSelectedChannel(null);
      setSelectedCategory(null);
      setSelectedTerminal(null);
      setEditFormSelected(false);
      setButtonGroupStates({});
      setCollectedInfo(null);
      setUploadStepReached(false); // Reset upload step flag

      console.log("🧹 State reset complete. Post-clear state should be clean:");
      console.log("Post-clear state (immediately after reset):", {
        selectedChannel: null,
        selectedCategory: null,
        amountRequested: false,
        transactionDateRequested: false,
        summaryShown: false,
        ticketCreatedInSession: false,
        uploadStepReached: false,
      });

      // Clear session state completely
      await clearSessionState();

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

      console.log("🧹 CLEARING CHAT HISTORY - COMPLETE");
    } catch (error) {
      console.error("❌ Error clearing chat history:", error);
    }
  }, [
    ACTIVE_ROOM,
    uid,
    socket,
    clearSessionState,
    COMPLAINT_SESSION_KEY,
    LIVE_CHAT_SESSION_KEY,
    selectedChannel,
    selectedCategory,
    amountRequested,
    transactionDateRequested,
    summaryShown,
    ticketCreatedInSession,
    uploadStepReached,
  ]);

  const handleSendMessage = useCallback(() => {
    if (inputText.trim() && !isInputDisabled) {
      const userMessage = inputText.trim();
      const now = Date.now();

      console.log("=== HANDLE SEND MESSAGE ===");
      console.log("User message:", userMessage);
      console.log("Current state:", {
        amountRequested,
        transactionDateRequested,
        summaryShown,
        isLiveChat,
        selectedChannel,
        selectedCategory,
        collectedInfo,
      });

      // Add user message to chat immediately
      const outgoing: MessageType = {
        id: `m_${now}`,
        text: userMessage,
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
        AsyncStorage.setItem(storageKey, JSON.stringify(next));
        return next;
      });

      setInputText("");

      // Check if this is transaction date input
      if (transactionDateRequested && !isLiveChat) {
        // Validate transaction date input
        const datePattern = /^\d{1,2}[\/\-]\d{1,2}[\/\-]\d{4}$/;
        if (datePattern.test(userMessage.trim())) {
          // Show date confirmation and final summary
          setTimeout(() => {
            const dateConfirmMessage: MessageType = {
              id: getUniqueId(),
              text: `Baik, saya catat tanggal transaksi: ${userMessage.trim()}`,
              isBot: true,
              timestamp: new Date().toLocaleTimeString("id-ID", {
                hour: "2-digit",
                minute: "2-digit",
              }),
            };
            setMessages((prev) => {
              const newMessages = [...prev, dateConfirmMessage];
              AsyncStorage.setItem(storageKey, JSON.stringify(newMessages));
              return newMessages;
            });

            // Show final summary with both amount and transaction date
            setTimeout(() => {
              const displayAmount = confirmedAmount
                ? parseInt(confirmedAmount).toLocaleString("id-ID")
                : "Tidak tersedia";
              const summaryText = `📋 RINGKASAN KELUHAN ANDA\n\n📍 Channel: ${
                collectedInfo?.channel || "Tidak tersedia"
              }\n\n📂 Kategori: ${
                collectedInfo?.category || "Tidak tersedia"
              }\n\n💰 Nominal: Rp ${displayAmount}\n\n📅 Tanggal Transaksi: ${userMessage.trim()}\n\n📝 Deskripsi: ${
                collectedInfo?.ai_generated_description ||
                collectedInfo?.description ||
                "Tidak tersedia"
              }\n\nSekarang Anda dapat melanjutkan:`;

              const summaryMessage: MessageType = {
                id: getUniqueId(),
                text: summaryText,
                isBot: true,
                timestamp: new Date().toLocaleTimeString("id-ID", {
                  hour: "2-digit",
                  minute: "2-digit",
                }),
                hasButtons: true,
                buttonSelected: undefined,
              };

              setMessages((prev) => {
                const newMessages = [...prev, summaryMessage];
                AsyncStorage.setItem(storageKey, JSON.stringify(newMessages));
                return newMessages;
              });
            }, 1000);
          }, 500);
        } else {
          // Invalid date format, ask again with better guidance
          setTimeout(() => {
            const errorMessage: MessageType = {
              id: getUniqueId(),
              text: "Format tanggal tidak sesuai. Mohon gunakan format DD/MM/YYYY atau DD-MM-YYYY.\n\nContoh yang benar:\n• 15/01/2024\n• 15-01-2024\n• 01/12/2024",
              isBot: true,
              timestamp: new Date().toLocaleTimeString("id-ID", {
                hour: "2-digit",
                minute: "2-digit",
              }),
            };
            setMessages((prev) => {
              const newMessages = [...prev, errorMessage];
              AsyncStorage.setItem(storageKey, JSON.stringify(newMessages));
              return newMessages;
            });
          }, 500);
        }
      }
      // Check if user is providing description and we need to ask for amount
      else if (
        selectedChannel &&
        selectedCategory &&
        !amountRequested &&
        !isLiveChat &&
        collectedInfo &&
        !summaryShown
      ) {
        // Check if category needs amount
        const categoryNeedsAmount =
          checkIfCategoryNeedsAmount(selectedCategory);
        const collectedInfoNeedsAmount =
          collectedInfo.category &&
          checkIfCategoryNeedsAmount(collectedInfo.category);

        console.log("=== DESCRIPTION INPUT ANALYSIS ===");
        console.log("selectedCategory:", selectedCategory);
        console.log("categoryNeedsAmount:", categoryNeedsAmount);
        console.log("collectedInfoNeedsAmount:", collectedInfoNeedsAmount);
        console.log("User message length:", userMessage.length);

        if (
          (categoryNeedsAmount || collectedInfoNeedsAmount) &&
          userMessage.length > 10
        ) {
          // This looks like a description input, and category needs amount
          console.log("User provided description, now asking for amount");

          // Send to chatbot first to process the description
          sendToChatbot(userMessage);

          // Then ask for amount after a delay
          setTimeout(() => {
            const amountMessage: MessageType = {
              id: getUniqueId(),
              text: "Untuk melengkapi tiket, mohon masukkan nominal transaksi (dalam Rupiah):",
              isBot: true,
              timestamp: new Date().toLocaleTimeString("id-ID", {
                hour: "2-digit",
                minute: "2-digit",
              }),
            };
            setMessages((prev) => {
              const newMessages = [...prev, amountMessage];
              AsyncStorage.setItem(storageKey, JSON.stringify(newMessages));
              return newMessages;
            });
            setAmountRequested(true);
          }, 2000); // Give chatbot time to process first

          return; // Don't send to chatbot again below
        }
      }
      // Check if this is amount input after summary
      else if (amountRequested && !isLiveChat && !transactionDateRequested) {
        // Validate amount input with more comprehensive checks
        const cleanInput = userMessage.trim();

        // Check if input contains date pattern (should not be amount)
        const datePattern = /\d{1,2}[\/-]\d{1,2}[\/-]\d{4}/;
        if (datePattern.test(cleanInput)) {
          // Input looks like a date, show error
          setTimeout(() => {
            const errorMessage: MessageType = {
              id: getUniqueId(),
              text: "Format tidak sesuai. Mohon masukkan nominal dalam angka saja (tanpa format tanggal). Contoh: 250000 atau Rp 250.000",
              isBot: true,
              timestamp: new Date().toLocaleTimeString("id-ID", {
                hour: "2-digit",
                minute: "2-digit",
              }),
            };
            setMessages((prev) => {
              const newMessages = [...prev, errorMessage];
              AsyncStorage.setItem(storageKey, JSON.stringify(newMessages));
              return newMessages;
            });
          }, 500);
          return;
        }

        // Remove common currency symbols and separators
        const numericAmount = cleanInput.replace(/[Rp\s.,]/g, "");

        // Check if result is purely numeric and within reasonable range
        const isNumeric = /^[0-9]+$/.test(numericAmount);
        const amount = parseInt(numericAmount);

        if (
          isNumeric &&
          numericAmount.length > 0 &&
          amount > 0 &&
          amount < 999999999999
        ) {
          // Valid amount, save to confirmed amount
          setConfirmedAmount(numericAmount);

          // Show amount confirmation immediately
          const displayAmount = parseInt(numericAmount).toLocaleString("id-ID");
          setTimeout(() => {
            const confirmationMessage: MessageType = {
              id: getUniqueId(),
              text: `Baik, saya catat nominal transaksi Anda: Rp ${displayAmount}`,
              isBot: true,
              timestamp: new Date().toLocaleTimeString("id-ID", {
                hour: "2-digit",
                minute: "2-digit",
              }),
            };
            setMessages((prev) => {
              const newMessages = [...prev, confirmationMessage];
              AsyncStorage.setItem(storageKey, JSON.stringify(newMessages));
              return newMessages;
            });

            // Check if category also needs transaction date
            const needsTransactionDate =
              (collectedInfo?.category &&
                checkIfCategoryNeedsTransactionDate(collectedInfo.category)) ||
              (selectedCategory &&
                checkIfCategoryNeedsTransactionDate(selectedCategory));

            if (needsTransactionDate) {
              // Ask for transaction date next
              setTimeout(() => {
                const transactionDateMessage: MessageType = {
                  id: getUniqueId(),
                  text: "Sekarang mohon masukkan tanggal transaksi (DD/MM/YYYY):",
                  isBot: true,
                  timestamp: new Date().toLocaleTimeString("id-ID", {
                    hour: "2-digit",
                    minute: "2-digit",
                  }),
                };
                setMessages((prev) => {
                  const newMessages = [...prev, transactionDateMessage];
                  AsyncStorage.setItem(storageKey, JSON.stringify(newMessages));
                  return newMessages;
                });
                setTransactionDateRequested(true);
              }, 1000);
            } else {
              // No transaction date needed, show final summary
              setTimeout(() => {
                const summaryText = `📋 RINGKASAN KELUHAN ANDA\n\n📍 Channel: ${
                  collectedInfo?.channel || "Tidak tersedia"
                }\n\n📂 Kategori: ${
                  collectedInfo?.category || "Tidak tersedia"
                }\n\n💰 Nominal: Rp ${displayAmount}\n\n📝 Deskripsi: ${
                  collectedInfo?.ai_generated_description ||
                  collectedInfo?.description ||
                  "Tidak tersedia"
                }\n\nSekarang Anda dapat melanjutkan:`;

                const summaryMessage: MessageType = {
                  id: getUniqueId(),
                  text: summaryText,
                  isBot: true,
                  timestamp: new Date().toLocaleTimeString("id-ID", {
                    hour: "2-digit",
                    minute: "2-digit",
                  }),
                  hasButtons: true,
                  buttonSelected: undefined,
                };

                setMessages((prev) => {
                  const newMessages = [...prev, summaryMessage];
                  AsyncStorage.setItem(storageKey, JSON.stringify(newMessages));
                  return newMessages;
                });
              }, 1500);
            }
          }, 500);
        } else {
          // Invalid amount format, show detailed error message with better guidance
          let errorText = "Format nominal tidak sesuai. ";

          if (!isNumeric) {
            errorText += "Gunakan angka saja tanpa huruf atau simbol. ";
          } else if (amount <= 0) {
            errorText += "Nominal harus lebih dari 0. ";
          } else if (amount >= 999999999999) {
            errorText += "Nominal terlalu besar (maksimal 999 miliar). ";
          }

          errorText += "\n\nContoh yang benar:\n• 100000\n• 250000\n• 1500000";

          setTimeout(() => {
            const errorMessage: MessageType = {
              id: getUniqueId(),
              text: errorText,
              isBot: true,
              timestamp: new Date().toLocaleTimeString("id-ID", {
                hour: "2-digit",
                minute: "2-digit",
              }),
            };
            setMessages((prev) => {
              const newMessages = [...prev, errorMessage];
              AsyncStorage.setItem(storageKey, JSON.stringify(newMessages));
              return newMessages;
            });
          }, 500);
        }
      }
      // Handle description input after channel and category selection
      else if (
        selectedChannel &&
        selectedCategory &&
        !summaryShown &&
        !amountRequested &&
        !isLiveChat &&
        userMessage.length > 10
      ) {
        console.log(
          "Processing description input after channel and category selection - showing summary directly"
        );

        // Show summary immediately without waiting for chatbot API
        setSummaryShown(true);

        // Update collected info with user description
        setCollectedInfo((prev) => ({
          ...prev,
          channel: selectedChannel,
          category: selectedCategory,
          description: userMessage,
        }));

        setTimeout(() => {
          const summaryText = `📋 RINGKASAN KELUHAN ANDA\n\n📍 Channel: ${selectedChannel}\n\n📂 Kategori: ${selectedCategory}\n\n📝 Deskripsi: ${userMessage}`;

          const summaryMessage: MessageType = {
            id: getUniqueId(),
            text: summaryText,
            isBot: true,
            timestamp: new Date().toLocaleTimeString("id-ID", {
              hour: "2-digit",
              minute: "2-digit",
            }),
          };

          setMessages((prev) => {
            const newMessages = [...prev, summaryMessage];
            AsyncStorage.setItem(storageKey, JSON.stringify(newMessages));
            return newMessages;
          });

          // Check if amount is needed based on selected category
          const categoryNeedsAmountCheck =
            checkIfCategoryNeedsAmount(selectedCategory);
          const categoryNeedsTransactionDateCheck =
            checkIfCategoryNeedsTransactionDate(selectedCategory);

          if (categoryNeedsAmountCheck) {
            setTimeout(() => {
              const amountMessage: MessageType = {
                id: getUniqueId(),
                text: "Untuk melengkapi tiket, mohon masukkan nominal transaksi (dalam Rupiah):",
                isBot: true,
                timestamp: new Date().toLocaleTimeString("id-ID", {
                  hour: "2-digit",
                  minute: "2-digit",
                }),
              };

              setMessages((prev) => {
                const newMessages = [...prev, amountMessage];
                AsyncStorage.setItem(storageKey, JSON.stringify(newMessages));
                return newMessages;
              });
              setAmountRequested(true);
            }, 1500);
          } else if (
            categoryNeedsTransactionDateCheck &&
            !categoryNeedsAmountCheck
          ) {
            // If only transaction date is needed (no amount)
            setTimeout(() => {
              const transactionDateMessage: MessageType = {
                id: getUniqueId(),
                text: "Untuk melengkapi tiket, mohon masukkan tanggal transaksi (DD/MM/YYYY):",
                isBot: true,
                timestamp: new Date().toLocaleTimeString("id-ID", {
                  hour: "2-digit",
                  minute: "2-digit",
                }),
              };

              setMessages((prev) => {
                const newMessages = [...prev, transactionDateMessage];
                AsyncStorage.setItem(storageKey, JSON.stringify(newMessages));
                return newMessages;
              });
              setTransactionDateRequested(true);
            }, 1500);
          } else {
            // If neither amount nor transaction date needed, show edit/create options
            setTimeout(() => {
              const proceedMessage: MessageType = {
                id: getUniqueId(),
                text: "Silakan pilih opsi berikut:",
                isBot: true,
                timestamp: new Date().toLocaleTimeString("id-ID", {
                  hour: "2-digit",
                  minute: "2-digit",
                }),
                hasButtons: true,
                buttonSelected: undefined,
              };

              setMessages((prev) => {
                const newMessages = [...prev, proceedMessage];
                AsyncStorage.setItem(storageKey, JSON.stringify(newMessages));
                return newMessages;
              });
            }, 1500);
          }
        }, 1000);

        // Also send to chatbot but don't wait for response
        sendToChatbot(userMessage);
      } else if (!isLiveChat) {
        // Handle help command
        if (
          userMessage.toLowerCase() === "help" ||
          userMessage.toLowerCase() === "bantuan"
        ) {
          setTimeout(() => {
            const helpMessage: MessageType = {
              id: getUniqueId(),
              text: "Bantuan:\n\n• Untuk memulai keluhan baru, ceritakan masalah Anda\n• Pilih channel dan kategori sesuai petunjuk\n• Masukkan nominal dan tanggal jika diminta\n• Gunakan tombol yang tersedia saat diminta\n\nJika mengalami kesulitan, ketik 'reset' untuk memulai ulang.",
              isBot: true,
              timestamp: new Date().toLocaleTimeString("id-ID", {
                hour: "2-digit",
                minute: "2-digit",
              }),
            };
            setMessages((prev) => {
              const newMessages = [...prev, helpMessage];
              AsyncStorage.setItem(storageKey, JSON.stringify(newMessages));
              return newMessages;
            });
          }, 500);
          return;
        }

        // Handle reset command
        if (
          userMessage.toLowerCase() === "reset" ||
          userMessage.toLowerCase() === "mulai ulang"
        ) {
          clearChatHistory();
          return;
        }

        // Normal chatbot flow
        sendToChatbot(userMessage);
      } else {
        // Send to socket for live chat
        socket.emit("chat:send", outgoing);
      }
    }
  }, [
    inputText,
    isLiveChat,
    chatUser,
    ACTIVE_ROOM,
    storageKey,
    socket,
    amountRequested,
    transactionDateRequested,
    summaryShown,
    sendToChatbot,
    collectedInfo,
    confirmedAmount,
    selectedChannel,
    selectedCategory,
    clearChatHistory,
    isInputDisabled,
  ]);

  const quickDM = useCallback(() => {
    const target = activePeers.find(
      (p) => p.userId && p.userId.startsWith("EMP-")
    );
    if (!target) {
      // For ticket detail connections, try to connect anyway
      if (isFromTicketDetail) {
        socket.emit("dm:request", { room: ACTIVE_ROOM });
        return;
      }
      Alert.alert(
        "Agent tidak tersedia",
        "Tidak ada agent yang online saat ini."
      );
      return;
    }
    socket.emit("dm:open", { toUserId: target.userId });
  }, [activePeers, socket, isFromTicketDetail, ACTIVE_ROOM]);

  // Video streaming removed - audio only implementation

  // WebRTC audio call functions
  const initializeWebRTCAudioCall = useCallback(async () => {
    try {
      const stream = await WebRTCService.initializeCall();
      setLocalStream(stream);
      return stream;
    } catch (error) {
      console.error("Error initializing WebRTC audio call:", error);
      Alert.alert("Error", "Gagal menginisialisasi panggilan suara");
      return null;
    }
  }, []);

  const startAudioCall = useCallback(async () => {
    try {
      const stream = await initializeWebRTCAudioCall();
      if (stream) {
        setIsAudioCall(true);
        WebRTCService.setCurrentRoom(ACTIVE_ROOM);
        // Create offer for audio call
        await WebRTCService.createOffer(ACTIVE_ROOM);
      }
    } catch (error) {
      console.error("Error starting audio call:", error);
      Alert.alert("Error", "Gagal memulai panggilan suara");
    }
  }, [initializeWebRTCAudioCall, ACTIVE_ROOM]);

  // Video call functionality removed - audio only

  const stopCall = useCallback(() => {
    try {
      WebRTCService.endCall(ACTIVE_ROOM);
      setLocalStream(null);
      setIsAudioCall(false);
    } catch (error) {
      console.error("Error stopping call:", error);
    }
  }, [ACTIVE_ROOM]);

  // WebRTC event handlers
  useEffect(() => {
    const handleOffer = async ({ offer, room }: any) => {
      try {
        if (room === ACTIVE_ROOM) {
          WebRTCService.setCurrentRoom(room);
          await initializeWebRTCAudioCall();
          await WebRTCService.createAnswer(room, offer);
          setIsAudioCall(true);
        }
      } catch (error) {
        console.error("Error handling offer:", error);
      }
    };

    const handleAnswer = async ({ answer }: any) => {
      try {
        await WebRTCService.handleAnswer(answer);
      } catch (error) {
        console.error("Error handling answer:", error);
      }
    };

    const handleIceCandidate = async ({ candidate }: any) => {
      try {
        await WebRTCService.handleIceCandidate(candidate);
      } catch (error) {
        console.error("Error handling ICE candidate:", error);
      }
    };

    const handleEndCall = () => {
      stopCall();
    };

    socket.on("webrtc:offer", handleOffer);
    socket.on("webrtc:answer", handleAnswer);
    socket.on("webrtc:ice-candidate", handleIceCandidate);
    socket.on("webrtc:end-call", handleEndCall);

    return () => {
      socket.off("webrtc:offer", handleOffer);
      socket.off("webrtc:answer", handleAnswer);
      socket.off("webrtc:ice-candidate", handleIceCandidate);
      socket.off("webrtc:end-call", handleEndCall);
    };
  }, [socket, ACTIVE_ROOM, initializeWebRTCAudioCall, stopCall]);

  const placeCall = () => {
    if (peerCount < 2) {
      Alert.alert(
        "Peer tidak tersedia",
        "Pastikan ada 2 user yang login untuk call."
      );
      return;
    }
    socket.emit("audio:invite", { room: ACTIVE_ROOM });
    setCallStatus("ringing");
    setIsAudioCall(true);
    startAudioCall();
  };

  const placeAudioCall = () => {
    if (peerCount < 2) {
      Alert.alert(
        "Peer tidak tersedia",
        "Pastikan ada 2 user yang login untuk audio call."
      );
      return;
    }
    socket.emit("audio:invite", { room: ACTIVE_ROOM });
    setCallStatus("ringing");
    setIsAudioCall(true);
  };

  const acceptCall = () => {
    socket.emit("audio:accept", { room: ACTIVE_ROOM });
    setCallStatus("audio-call");
    setCallStartTime(Date.now());
    startAudioCall();
  };

  const declineCall = () => {
    socket.emit("audio:decline", { room: ACTIVE_ROOM });
    setCallStatus("idle");
    setIsAudioCall(false);
  };

  const hangupCall = () => {
    if (callStartTime) {
      const duration = Math.floor((Date.now() - callStartTime) / 1000);
      const minutes = Math.floor(duration / 60);
      const seconds = duration % 60;
      const durationText = `${minutes.toString().padStart(2, "0")}:${seconds
        .toString()
        .padStart(2, "0")}`;

      const callType = "🎤 Panggilan suara";
      const callEndMessage = {
        id: getUniqueId(),
        text: `${callType} selesai • Durasi: ${durationText}`,
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

    socket.emit("audio:hangup", { room: ACTIVE_ROOM });
    stopCall();

    setCallStatus("idle");
    setIsAudioCall(false);
  };

  // Handler for validation button selection
  const handleValidationSelect = useCallback(
    (validationType: "call" | "chat" | "audio", messageId: string) => {
      // Update button group states to disable other options
      setButtonGroupStates((prev) => ({
        ...prev,
        [messageId]: {
          type: "validation",
          selectedValue: validationType,
        },
      }));

      if (validationType === "call" || validationType === "audio") {
        placeAudioCall();
      } else {
        setIsLiveChat(true);

        // Send ticket info if we have a ticket ID
        if (currentTicketId) {
          setTimeout(() => {
            const ticketInfoMessage = {
              id: getUniqueId(),
              text: `📋 Tiket #${currentTicketId.slice(-6)}`,
              isBot: false,
              timestamp: new Date().toLocaleTimeString("id-ID", {
                hour: "2-digit",
                minute: "2-digit",
              }),
              isTicketInfo: true,
              ticketId: currentTicketId,
            };

            setMessages((prev) => {
              const newMessages = [...prev, ticketInfoMessage];
              AsyncStorage.setItem(storageKey, JSON.stringify(newMessages));
              return newMessages;
            });

            // Send ticket context to socket
            if (socket.connected) {
              socket.emit("chat:send", {
                ...ticketInfoMessage,
                author: chatUser,
                createdAt: Date.now(),
                type: "ticket-info",
                room: ACTIVE_ROOM,
              });

              socket.emit("ticket:context", {
                room: ACTIVE_ROOM,
                ticketId: currentTicketId,
                fromUserId: uid,
                timestamp: Date.now(),
              });
            }

            fetchTicketDetail(currentTicketId);
          }, 500);
        }

        // Auto-connect to available agent
        setTimeout(() => {
          quickDM();
        }, 1000);
      }
    },
    [
      placeAudioCall,
      currentTicketId,
      storageKey,
      chatUser,
      ACTIVE_ROOM,
      socket,
      uid,
      fetchTicketDetail,
      quickDM,
    ]
  );

  useEffect(() => {
    setTimeout(() => {
      scrollViewRef.current?.scrollToEnd({ animated: true });
    }, 100);
  }, [messages]);

  // Clear chat history when user changes (login/logout)
  useEffect(() => {
    const clearHistoryOnUserChange = async () => {
      if (!user && !authUser) {
        // User logged out, clear all chat data
        console.log("🧹 User logged out, clearing chat history");
        await clearChatHistory();
      }
    };

    clearHistoryOnUserChange();
  }, [user, authUser, clearChatHistory]);

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        style={styles.keyboardView}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 0}
        enabled={true}
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

          <TouchableOpacity
            style={styles.endChatButton}
            onPress={() => {
              Alert.alert(
                "Clear Chat",
                "Apakah Anda yakin ingin menghapus semua riwayat chat? Data ini tidak dapat dikembalikan.",
                [
                  {
                    text: "Batal",
                    style: "cancel",
                  },
                  {
                    text: "Hapus",
                    style: "destructive",
                    onPress: clearChatHistory,
                  },
                ]
              );
            }}
          >
            <MaterialIcons name="close" size={24} color="#FF4444" />
          </TouchableOpacity>
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
                          } catch {
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

                  {/* Show ticket info card */}
                  {message.isTicketInfo && (
                    <View style={styles.ticketInfoCard}>
                      <View style={styles.ticketInfoHeader}>
                        <MaterialIcons
                          name="receipt"
                          size={20}
                          color="#FF8636"
                        />
                        <Text style={styles.ticketInfoTitle}>Detail Tiket</Text>
                      </View>
                      <Text style={styles.ticketInfoId}>
                        #{message.ticketId?.slice(-6) || "N/A"}
                      </Text>
                      {ticketDetail &&
                      ticketDetail.ticket_number === message.ticketId ? (
                        <>
                          <Text style={styles.ticketInfoChannel}>
                            {ticketDetail.issue_channel?.channel_name ||
                              "Channel tidak tersedia"}
                          </Text>
                          <Text style={styles.ticketInfoStatus}>
                            Status:{" "}
                            {ticketDetail.customer_status
                              ?.customer_status_name || "Status tidak tersedia"}
                          </Text>
                        </>
                      ) : (
                        <Text style={styles.ticketInfoChannel}>
                          Tap untuk melihat detail
                        </Text>
                      )}
                      <TouchableOpacity
                        style={styles.ticketInfoFooter}
                        onPress={() => {
                          if (message.ticketId) {
                            router.push(`/riwayat/${message.ticketId}`);
                          }
                        }}
                      >
                        <Text style={styles.ticketInfoAction}>
                          Lihat Detail Tiket
                        </Text>
                        <MaterialIcons
                          name="arrow-forward"
                          size={16}
                          color="#FF8636"
                        />
                      </TouchableOpacity>
                    </View>
                  )}

                  <Text style={styles.timestamp}>{message.timestamp}</Text>
                </View>
                {/* Call icons only for bot messages when live chat is active */}
                {isLiveChat &&
                  message.isBot &&
                  !message.hasButtons &&
                  !message.hasValidationButtons &&
                  !message.hasLiveChatButtons &&
                  !message.isCallLog && (
                    <View style={styles.callIconsContainer}>
                      <TouchableOpacity
                        style={styles.callIcon}
                        onPress={() => {
                          if (peerCount >= 2) {
                            placeAudioCall();
                          } else {
                            Alert.alert(
                              "Agent tidak tersedia",
                              "Sedang mencari agent untuk panggilan suara..."
                            );
                          }
                        }}
                      >
                        <MaterialIcons name="phone" size={20} color="#4CAF50" />
                      </TouchableOpacity>
                    </View>
                  )}
              </View>
              {message.hasButtons && (
                <View style={styles.buttonContainer}>
                  <TouchableOpacity
                    style={[
                      styles.editButton,
                      (message.buttonSelected === "create" ||
                        ticketCreatedInSession ||
                        editFormSelected) &&
                        styles.disabledButton,
                    ]}
                    disabled={
                      message.buttonSelected === "create" ||
                      ticketCreatedInSession ||
                      editFormSelected
                    }
                    onPress={() => {
                      if (ticketCreatedInSession || editFormSelected) return;
                      // Mark this message as having edit selected
                      setMessages((prev) => {
                        const updatedMessages = prev.map((msg) =>
                          msg.id === message.id
                            ? { ...msg, buttonSelected: "edit" as const }
                            : msg
                        );
                        AsyncStorage.setItem(
                          storageKey,
                          JSON.stringify(updatedMessages)
                        );
                        return updatedMessages;
                      });
                      setEditFormSelected(true);
                      router.push("/complaint/confirmation");
                    }}
                  >
                    <MaterialIcons
                      name="edit"
                      size={16}
                      color={
                        message.buttonSelected === "create" ||
                        ticketCreatedInSession ||
                        editFormSelected
                          ? "#999"
                          : "#FFF"
                      }
                    />
                    <Text
                      style={[
                        styles.buttonText,
                        (message.buttonSelected === "create" ||
                          ticketCreatedInSession ||
                          editFormSelected) && { color: "#999" },
                      ]}
                    >
                      Edit Form
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[
                      styles.createButton,
                      (message.buttonSelected === "edit" ||
                        ticketCreatedInSession ||
                        editFormSelected) &&
                        styles.disabledButton,
                    ]}
                    disabled={
                      message.buttonSelected === "edit" ||
                      ticketCreatedInSession ||
                      editFormSelected
                    }
                    onPress={async () => {
                      if (ticketCreatedInSession || editFormSelected) return;
                      try {
                        // Mark this message as having create selected
                        setMessages((prev) => {
                          const updatedMessages = prev.map((msg) =>
                            msg.id === message.id
                              ? { ...msg, buttonSelected: "create" as const }
                              : msg
                          );
                          AsyncStorage.setItem(
                            storageKey,
                            JSON.stringify(updatedMessages)
                          );
                          return updatedMessages;
                        });

                        // Use the collectedInfo from state instead of making API call
                        const botCollectedInfo = collectedInfo || {};

                        console.log(
                          "Bot collected info from state:",
                          botCollectedInfo
                        );
                        console.log("Available channels from hook:", channels);
                        console.log(
                          "Available categories from hook:",
                          categories
                        );

                        // Map bot channel to actual channel ID using utility
                        const channelId = botCollectedInfo.channel
                          ? mapChatbotChannelToDatabase(
                              botCollectedInfo.channel,
                              channels
                            )
                          : channels[0]?.channel_id || 1;

                        console.log(
                          "Channel mapping - Input:",
                          botCollectedInfo.channel,
                          "Mapped ID:",
                          channelId
                        );

                        // Create ticket payload matching the confirmation endpoint structure
                        // Extract the actual user description - prioritize user input over AI description
                        let actualDescription = "Keluhan dari chat bot";

                        // First priority: use user's actual description if available
                        if (
                          botCollectedInfo.description &&
                          botCollectedInfo.description.trim() !== "" &&
                          !botCollectedInfo.description
                            .toLowerCase()
                            .includes("selamat siang") &&
                          !botCollectedInfo.description
                            .toLowerCase()
                            .includes("customer service") &&
                          !botCollectedInfo.description
                            .toLowerCase()
                            .includes("selamat sore")
                        ) {
                          actualDescription = botCollectedInfo.description;
                        } else {
                          // Fallback to conversation messages
                          const userMessages = messages.filter(
                            (msg) => !msg.isBot && msg.text && msg.text.trim()
                          );
                          const buttonSelections = [
                            "ATM",
                            "IBANK",
                            "MBANK",
                            "CRM",
                            "DISPUTE DEBIT",
                            "QRIS DEBIT",
                            "MTUNAI ALFAMART",
                            "PEMBAYARAN",
                            "TOP UP",
                            "TRANSFER",
                            "TARIK TUNAI",
                            "SETOR TUNAI",
                            "MOBILE TUNAI",
                            "BI FAST",
                            "DISPUTE",
                            "LAINNYA",
                          ];

                          const conversationMessages = userMessages.filter(
                            (msg) =>
                              !buttonSelections.some((selection) =>
                                msg.text.toUpperCase().includes(selection)
                              )
                          );

                          if (conversationMessages.length > 0) {
                            actualDescription = conversationMessages
                              .map((msg) => msg.text)
                              .join(". ");
                          }
                        }

                        // Map bot category to actual complaint ID using utility
                        const complaintId = botCollectedInfo.category
                          ? mapChatbotCategoryToDatabase(
                              botCollectedInfo.category,
                              actualDescription,
                              categories
                            )
                          : categories[0]?.complaint_id || 1;

                        console.log(
                          "Category mapping - Input:",
                          botCollectedInfo.category,
                          "Mapped ID:",
                          complaintId
                        );

                        console.log(
                          "Bot collected description:",
                          botCollectedInfo.description
                        );
                        console.log(
                          "Final selected description:",
                          actualDescription
                        );

                        // Check if we have amount - prioritize confirmedAmount first
                        let finalAmount = null;
                        if (confirmedAmount && parseInt(confirmedAmount) > 0) {
                          // Use confirmed amount from user input (highest priority)
                          finalAmount = parseInt(confirmedAmount);
                          console.log(
                            "Using confirmedAmount for ticket:",
                            finalAmount
                          );
                        } else if (botCollectedInfo.amount) {
                          finalAmount = parseInt(
                            botCollectedInfo.amount
                              .toString()
                              .replace(/[^0-9]/g, "")
                          );
                          console.log(
                            "Using botCollectedInfo.amount for ticket:",
                            finalAmount
                          );
                        } else {
                          // Fallback to message filtering
                          const amountMessages = messages.filter(
                            (msg) =>
                              !msg.isBot &&
                              msg.text &&
                              // Exclude date patterns (DD/MM/YYYY or DD-MM-YYYY)
                              !/\d{1,2}[\/-]\d{1,2}[\/-]\d{4}/.test(msg.text) &&
                              // Only include pure numbers or currency-like patterns
                              /^[0-9.,\s]+$/.test(
                                msg.text.replace(/[Rp\s]/g, "")
                              ) &&
                              // Ensure it's not just date digits
                              msg.text.replace(/[^0-9]/g, "").length <= 10 &&
                              // Must have reasonable amount value
                              parseInt(msg.text.replace(/[^0-9]/g, "")) <
                                999999999
                          );

                          console.log(
                            "Amount messages found:",
                            amountMessages.map((m) => m.text)
                          );

                          if (amountMessages.length > 0) {
                            const lastAmountMsg =
                              amountMessages[amountMessages.length - 1];
                            const numericAmount = lastAmountMsg.text.replace(
                              /[^0-9]/g,
                              ""
                            );
                            if (numericAmount && parseInt(numericAmount) > 0) {
                              finalAmount = parseInt(numericAmount);
                              console.log(
                                "Using fallback amount for ticket:",
                                finalAmount
                              );
                            }
                          }
                        }

                        // Check if we have transaction date from frontend flow
                        let finalTransactionDate = null;
                        const dateMessages = messages.filter(
                          (msg) =>
                            !msg.isBot &&
                            msg.text &&
                            /\d{1,2}[\/-]\d{1,2}[\/-]\d{4}/.test(msg.text)
                        );

                        console.log(
                          "Date messages found:",
                          dateMessages.map((m) => m.text)
                        );

                        if (dateMessages.length > 0) {
                          const lastDateMsg =
                            dateMessages[dateMessages.length - 1];
                          console.log(
                            "Processing date message:",
                            lastDateMsg.text
                          );

                          // Convert DD/MM/YYYY or DD-MM-YYYY to YYYY-MM-DD format
                          const dateStr = lastDateMsg.text.trim();
                          const dateParts = dateStr.split(/[\/\-]/);
                          if (dateParts.length === 3) {
                            const day = dateParts[0].padStart(2, "0");
                            const month = dateParts[1].padStart(2, "0");
                            const year = dateParts[2];
                            finalTransactionDate = `${year}-${month}-${day}`;
                            console.log(
                              "Formatted transaction date:",
                              finalTransactionDate
                            );
                          }
                        }

                        // Get account and card IDs from user data
                        const getRelatedIds = () => {
                          const userAccounts =
                            user?.accounts || authUser?.accounts || [];

                          if (userAccounts.length >= 1) {
                            const account = userAccounts[0];
                            let cardId = null;

                            // Check if account has cards property and extract card_id
                            if (
                              "cards" in account &&
                              Array.isArray((account as any).cards) &&
                              (account as any).cards.length > 0
                            ) {
                              cardId = (account as any).cards[0].card_id;
                            }

                            return {
                              related_account_id: account.account_id,
                              related_card_id: cardId,
                            };
                          }

                          return {
                            related_account_id: null,
                            related_card_id: null,
                          };
                        };

                        const { related_account_id, related_card_id } =
                          getRelatedIds();

                        // Get terminal ID if ATM or CRM channel is selected
                        let terminalId = null;
                        if (
                          (selectedChannel === "ATM" ||
                            selectedChannel === "CRM") &&
                          selectedTerminal
                        ) {
                          const terminal = terminals.find(
                            (t) => t.terminal_id.toString() === selectedTerminal
                          );
                          if (terminal) {
                            terminalId = terminal.terminal_id;
                          }
                        }

                        const ticketPayload = {
                          description: actualDescription,
                          issue_channel_id: channelId,
                          complaint_id: complaintId,
                          // Always include related IDs (even if null)
                          related_account_id,
                          related_card_id,
                          // Add amount if available
                          ...(finalAmount &&
                            finalAmount > 0 && { amount: finalAmount }),
                          // Add transaction date if available
                          ...(finalTransactionDate && {
                            transaction_date: finalTransactionDate,
                          }),
                          // Add terminal ID if ATM channel
                          ...(terminalId && { terminal_id: terminalId }),
                        };

                        console.log("User data:", user || authUser);
                        console.log(
                          "User accounts:",
                          user?.accounts || authUser?.accounts
                        );
                        console.log(
                          "Related IDs - Account:",
                          related_account_id,
                          "Card:",
                          related_card_id
                        );

                        // Get user data from auth/me endpoint
                        const userData = await getUserDataForTicket();
                        console.log("User data from auth/me:", userData);

                        // Create enhanced payload with user data from auth/me
                        const enhancedTicketPayload = {
                          ...ticketPayload,
                          // Merge user data from auth/me
                          ...(userData && {
                            customer_id: userData.customer_id,
                            full_name: userData.full_name,
                            email: userData.email,
                            phone_number: userData.phone_number,
                            address: userData.address,
                            birth_place: userData.birth_place,
                            gender: userData.gender,
                            person_id: userData.person_id,
                            cif: userData.cif,
                            billing_address: userData.billing_address,
                            postal_code: userData.postal_code,
                            home_phone: userData.home_phone,
                            handphone: userData.handphone,
                            office_phone: userData.office_phone,
                            fax_phone: userData.fax_phone,
                            primary_account_id: userData.primary_account_id,
                            primary_account_number:
                              userData.primary_account_number,
                            primary_account_type: userData.primary_account_type,
                            primary_card_id: userData.primary_card_id,
                            primary_card_number: userData.primary_card_number,
                            primary_card_type: userData.primary_card_type,
                            debit_card_numbers: userData.debit_card_numbers,
                          }),
                        };

                        console.log(
                          "Base ticket payload:",
                          JSON.stringify(ticketPayload, null, 2)
                        );
                        console.log(
                          "Enhanced ticket payload with user data:",
                          JSON.stringify(enhancedTicketPayload, null, 2)
                        );
                        console.log(
                          "Collected info from bot:",
                          botCollectedInfo
                        );
                        console.log(
                          "Channel mapping - Input:",
                          botCollectedInfo.channel,
                          "Mapped ID:",
                          channelId
                        );
                        console.log(
                          "Category mapping - Input:",
                          botCollectedInfo.category,
                          "Mapped ID:",
                          complaintId
                        );
                        console.log(
                          "Description mapping - Final:",
                          actualDescription
                        );
                        console.log(
                          "Transaction date - Final:",
                          finalTransactionDate
                        );
                        console.log("Amount - Final:", finalAmount);

                        const response = await api("/v1/tickets", {
                          method: "POST",
                          body: JSON.stringify(enhancedTicketPayload),
                        });

                        let ticketId = null;
                        if (response?.success && response?.data) {
                          ticketId =
                            response.data.id || response.data.ticket_id;
                        } else if (response?.id) {
                          ticketId = response.id;
                        } else if (response?.ticket_id) {
                          ticketId = response.ticket_id;
                        }

                        if (ticketId) {
                          await AsyncStorage.setItem(
                            "currentTicketId",
                            String(ticketId)
                          );
                          await AsyncStorage.setItem(
                            "shouldRefreshRiwayat",
                            "true"
                          );
                          setCurrentTicketId(String(ticketId));
                          setTicketCreatedInSession(true);

                          console.log("Ticket created - ID:", ticketId);
                          console.log("Setting ticketCreatedInSession to true");
                          console.log(
                            "Setting currentTicketId to:",
                            String(ticketId)
                          );

                          // Save session state with ticket creation
                          await AsyncStorage.setItem(
                            "chatSession",
                            JSON.stringify({
                              sessionId,
                              summaryShown,
                              ticketCreatedInSession: true,
                              amountRequested,
                              transactionDateRequested,
                              selectedTerminal,
                            })
                          );

                          // Use setTimeout to ensure state updates are processed
                          setTimeout(() => {
                            const ticketCreatedMessage = {
                              id: getUniqueId(),
                              text: "Tiket berhasil dibuat! Upload file sekarang tersedia.",
                              isBot: true,
                              timestamp: new Date().toLocaleTimeString(
                                "id-ID",
                                {
                                  hour: "2-digit",
                                  minute: "2-digit",
                                }
                              ),
                              hasTicketButton: true,
                            };
                            setMessages((prev) => {
                              const newMessages = [
                                ...prev,
                                ticketCreatedMessage,
                              ];
                              AsyncStorage.setItem(
                                storageKey,
                                JSON.stringify(newMessages)
                              );

                              // Mark that user has reached upload step
                              setUploadStepReached(true);

                              return newMessages;
                            });

                            // Add validation message after ticket creation
                            setTimeout(() => {
                              const validationMessage = {
                                id: getUniqueId(),
                                text: "Selanjutnya mari lakukan validasi dengan agent. Pilih metode validasi:",
                                isBot: true,
                                timestamp: new Date().toLocaleTimeString(
                                  "id-ID",
                                  {
                                    hour: "2-digit",
                                    minute: "2-digit",
                                  }
                                ),
                                hasValidationButtons: true,
                              };
                              setMessages((prev) => {
                                const newMessages = [
                                  ...prev,
                                  validationMessage,
                                ];
                                AsyncStorage.setItem(
                                  storageKey,
                                  JSON.stringify(newMessages)
                                );
                                return newMessages;
                              });
                            }, 1000);
                          }, 100);
                        } else {
                          Alert.alert(
                            "Error",
                            "Tiket berhasil dibuat tapi ID tidak ditemukan."
                          );
                        }
                      } catch (error) {
                        console.error("Error creating ticket:", error);

                        // Show error message in chat instead of alert
                        const errorMessage: MessageType = {
                          id: getUniqueId(),
                          text: "Maaf, gagal membuat tiket. Silakan coba lagi atau hubungi customer service jika masalah berlanjut.",
                          isBot: true,
                          timestamp: new Date().toLocaleTimeString("id-ID", {
                            hour: "2-digit",
                            minute: "2-digit",
                          }),
                        };
                        setMessages((prev) => {
                          const newMessages = [...prev, errorMessage];
                          AsyncStorage.setItem(
                            storageKey,
                            JSON.stringify(newMessages)
                          );
                          return newMessages;
                        });
                      }
                    }}
                  >
                    <MaterialIcons
                      name="check"
                      size={16}
                      color={
                        message.buttonSelected === "edit" ||
                        ticketCreatedInSession ||
                        editFormSelected
                          ? "#999"
                          : "#FFF"
                      }
                    />
                    <Text
                      style={[
                        styles.buttonText,
                        (message.buttonSelected === "edit" ||
                          ticketCreatedInSession ||
                          editFormSelected) && { color: "#999" },
                      ]}
                    >
                      Buat Tiket
                    </Text>
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
                    <Text style={[styles.buttonText, { fontSize: 12 }]}>
                      Lihat Tiket Anda
                    </Text>
                  </TouchableOpacity>
                </View>
              )}
              {(message as any).hasValidationButtons && (
                <View style={styles.buttonContainer}>
                  <TouchableOpacity
                    style={[
                      styles.audioButton,
                      buttonGroupStates[String(message.id)]?.selectedValue ===
                        "chat" && styles.disabledButton,
                    ]}
                    activeOpacity={
                      buttonGroupStates[String(message.id)]?.selectedValue ===
                      "chat"
                        ? 1
                        : 0.7
                    }
                    disabled={
                      buttonGroupStates[String(message.id)]?.selectedValue ===
                      "chat"
                    }
                    onPress={() => {
                      if (peerCount < 2) {
                        Alert.alert(
                          "Agent Tidak Tersedia",
                          "Tidak ada agent yang tersedia untuk panggilan suara saat ini."
                        );
                        return;
                      }
                      handleValidationSelect("audio", String(message.id));
                    }}
                  >
                    <MaterialIcons
                      name="phone"
                      size={16}
                      color={
                        buttonGroupStates[String(message.id)]?.selectedValue ===
                        "chat"
                          ? "#999"
                          : "#FFF"
                      }
                    />
                    <Text
                      style={[
                        styles.buttonText,
                        { fontSize: 12 },
                        buttonGroupStates[String(message.id)]?.selectedValue ===
                          "chat" && { color: "#999" },
                      ]}
                    >
                      Call
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[
                      styles.chatButton,
                      buttonGroupStates[String(message.id)]?.selectedValue ===
                        "call" && styles.disabledButton,
                    ]}
                    activeOpacity={
                      buttonGroupStates[String(message.id)]?.selectedValue ===
                      "call"
                        ? 1
                        : 0.7
                    }
                    disabled={
                      buttonGroupStates[String(message.id)]?.selectedValue ===
                      "call"
                    }
                    onPress={() => {
                      // Validate agent availability for chat
                      const availableAgent = activePeers.find(
                        (p) => p.userId && p.userId.startsWith("EMP-")
                      );

                      if (!availableAgent && !isFromTicketDetail) {
                        Alert.alert(
                          "Agent Tidak Tersedia",
                          "Tidak ada agent yang tersedia untuk chat saat ini. Silakan coba lagi nanti atau pilih opsi Call."
                        );
                        return;
                      }

                      handleValidationSelect("chat", String(message.id));
                    }}
                  >
                    <MaterialIcons
                      name="chat"
                      size={16}
                      color={
                        buttonGroupStates[String(message.id)]?.selectedValue ===
                        "call"
                          ? "#999"
                          : "#FFF"
                      }
                    />
                    <Text
                      style={[
                        styles.buttonText,
                        { fontSize: 12 },
                        buttonGroupStates[String(message.id)]?.selectedValue ===
                          "call" && { color: "#999" },
                      ]}
                    >
                      Chat
                    </Text>
                  </TouchableOpacity>
                </View>
              )}
              {(message as any).hasChannelButtons &&
                !ticketCreatedInSession &&
                !editFormSelected && (
                  <View style={styles.channelButtonContainer}>
                    {[
                      { name: "ATM", icon: "local-atm" },
                      { name: "IBANK", icon: "computer" },
                      { name: "MBANK", icon: "phone-android" },
                      { name: "CRM", icon: "support-agent" },
                      { name: "MTUNAI ALFAMART", icon: "store" },
                      { name: "DISPUTE DEBIT", icon: "report-problem" },
                      { name: "QRIS DEBIT", icon: "qr-code" },
                    ].map((channel) => {
                      const messageGroupState =
                        buttonGroupStates[String(message.id)];
                      const isThisSelected =
                        messageGroupState?.selectedValue === channel.name;
                      const isOtherSelected =
                        messageGroupState && !isThisSelected;
                      const globalChannelSelected =
                        selectedChannel && selectedChannel !== channel.name;

                      return (
                        <TouchableOpacity
                          key={channel.name}
                          style={[
                            styles.channelButton,
                            (isOtherSelected || globalChannelSelected) &&
                              styles.disabledChannelButton,
                          ]}
                          activeOpacity={
                            isOtherSelected || globalChannelSelected ? 1 : 0.7
                          }
                          onPress={() =>
                            handleChannelSelect(
                              channel.name,
                              String(message.id)
                            )
                          }
                          disabled={
                            !!(isOtherSelected || globalChannelSelected)
                          }
                        >
                          <MaterialIcons
                            name={channel.icon as any}
                            size={16}
                            color={
                              isOtherSelected || globalChannelSelected
                                ? "#999"
                                : "#FFF"
                            }
                          />
                          <Text
                            style={[
                              styles.buttonText,
                              { fontSize: rf(11) },
                              (isOtherSelected || globalChannelSelected) && {
                                color: "#999",
                              },
                            ]}
                          >
                            {channel.name}
                          </Text>
                        </TouchableOpacity>
                      );
                    })}
                  </View>
                )}
              {(message as any).hasCategoryButtons &&
                !ticketCreatedInSession &&
                !editFormSelected &&
                (() => {
                  console.log("=== CATEGORY BUTTONS RENDERING DEBUG ===");
                  console.log(
                    "message.hasCategoryButtons:",
                    (message as any).hasCategoryButtons
                  );
                  console.log(
                    "ticketCreatedInSession:",
                    ticketCreatedInSession
                  );
                  console.log("editFormSelected:", editFormSelected);
                  console.log("selectedChannel:", selectedChannel);
                  console.log("channels.length:", channels.length);
                  console.log("categories.length:", categories.length);
                  // Get filtered categories based on selected channel using the hook
                  const selectedChannelObj = channels.find((c) => {
                    if (!selectedChannel) return false;

                    const channelUpper = selectedChannel.toUpperCase();
                    const channelCode = channelUpper.replace(/\s+/g, "_");

                    return (
                      c.channel_name === selectedChannel ||
                      c.channel_code === selectedChannel ||
                      c.channel_code === channelUpper ||
                      c.channel_code === channelCode ||
                      c.channel_name?.toUpperCase() === channelUpper ||
                      // Handle specific mappings
                      (selectedChannel === "MTUNAI ALFAMART" &&
                        c.channel_code === "MTUNAI_ALFAMART") ||
                      (selectedChannel === "DISPUTE DEBIT" &&
                        c.channel_code === "DISPUTE_DEBIT") ||
                      (selectedChannel === "QRIS DEBIT" &&
                        c.channel_code === "QRIS_DEBIT")
                    );
                  });

                  // Use getFilteredCategories from hook to get categories based on selected channel
                  let availableCategories = getFilteredCategories(
                    selectedChannelObj || null
                  );

                  // If no categories available, show all categories as fallback
                  if (
                    !availableCategories ||
                    availableCategories.length === 0
                  ) {
                    availableCategories = categories;
                  }

                  // Map categories to display names
                  const categoryDisplayMap: Record<
                    string,
                    { name: string; icon: string }
                  > = {
                    PEMBAYARAN_KARTU_KREDIT_BNI: {
                      name: "PEMBAYARAN KK BNI",
                      icon: "payment",
                    },
                    PEMBAYARAN_KARTU_KREDIT_BANK_LAIN: {
                      name: "PEMBAYARAN KK LAIN",
                      icon: "payment",
                    },
                    PEMBAYARAN_PLN_VIA_ATM_BANK_LAIN: {
                      name: "PEMBAYARAN PLN",
                      icon: "flash-on",
                    },
                    PEMBAYARAN_SAMSAT: {
                      name: "PEMBAYARAN SAMSAT",
                      icon: "directions-car",
                    },
                    PEMBAYARAN_TELKOM_TELKOMSEL_INDOSAT_PROVIDER_LAINNYA: {
                      name: "PEMBAYARAN TELKOM",
                      icon: "phone",
                    },
                    PEMBAYARAN_MPNG2: {
                      name: "PEMBAYARAN MPNG2",
                      icon: "payment",
                    },
                    PEMBAYARAN_MPNG3: {
                      name: "PEMBAYARAN MPNG3",
                      icon: "payment",
                    },
                    PEMBAYARAN_MPNG4: {
                      name: "PEMBAYARAN MPNG4",
                      icon: "payment",
                    },
                    TOP_UP_DANA: {
                      name: "TOP UP DANA",
                      icon: "account-balance-wallet",
                    },
                    TOP_UP_GOPAY: {
                      name: "TOP UP GOPAY",
                      icon: "account-balance-wallet",
                    },
                    TOP_UP_OVO: {
                      name: "TOP UP OVO",
                      icon: "account-balance-wallet",
                    },
                    TOP_UP_SHOPEE_PAY: {
                      name: "TOP UP SHOPEE PAY",
                      icon: "account-balance-wallet",
                    },
                    TOP_UP_LINKAJA: {
                      name: "TOP UP LINKAJA",
                      icon: "account-balance-wallet",
                    },
                    TOP_UP_E_MONEY: {
                      name: "TOP UP E-MONEY",
                      icon: "account-balance-wallet",
                    },
                    TOP_UP_PULSA: {
                      name: "TOP UP PULSA",
                      icon: "phone-android",
                    },
                    TOP_UP_PULSA_VIA_ATM_BANK_LAIN: {
                      name: "TOP UP PULSA ATM",
                      icon: "phone-android",
                    },
                    TOP_UP_PRA_MIGRASI_DANA_GAGAL_TERKOREKSI: {
                      name: "TOP UP TAPCASH MIGRASI",
                      icon: "credit-card",
                    },
                    TRANSFER_ATM_ALTO_DANA_TDK_MASUK: {
                      name: "TRANSFER ALTO GAGAL",
                      icon: "swap-horiz",
                    },
                    TRANSFER_ATM_BERSAMA_DANA_TDK_MASUK: {
                      name: "TRANSFER BERSAMA GAGAL",
                      icon: "swap-horiz",
                    },
                    TRANSFER_ATM_LINK_DANA_TDK_MASUK: {
                      name: "TRANSFER LINK GAGAL",
                      icon: "swap-horiz",
                    },
                    TRANSFER_ATM_PRIMA_DANA_TDK_MASUK: {
                      name: "TRANSFER PRIMA GAGAL",
                      icon: "swap-horiz",
                    },
                    TRANSFER_ANTAR_REKENING_BNI: {
                      name: "TRANSFER BNI",
                      icon: "swap-horiz",
                    },
                    TRANSFER_ATM_ALTO_BILATERAL: {
                      name: "TRANSFER ALTO BILATERAL",
                      icon: "swap-horiz",
                    },
                    TRANSFER_ATM_BERSAMA_BILATERAL: {
                      name: "TRANSFER BERSAMA BILATERAL",
                      icon: "swap-horiz",
                    },
                    TRANSFER_ATM_ALTO_LINK_BILATERAL: {
                      name: "TRANSFER ALTO LINK BILATERAL",
                      icon: "swap-horiz",
                    },
                    TRANSFER_ATM_PRIMA_BILATERAL: {
                      name: "TRANSFER PRIMA BILATERAL",
                      icon: "swap-horiz",
                    },
                    TARIK_TUNAI_DI_MESIN_ATM_BNI: {
                      name: "TARIK TUNAI BNI",
                      icon: "local-atm",
                    },
                    TARIK_TUNAI_DI_ATM_LINK: {
                      name: "TARIK TUNAI LINK",
                      icon: "local-atm",
                    },
                    TARIK_TUNAI_DI_JARINGAN_ALTO: {
                      name: "TARIK TUNAI ALTO",
                      icon: "local-atm",
                    },
                    TARIK_TUNAI_DI_JARINGAN_BERSAMA: {
                      name: "TARIK TUNAI BERSAMA",
                      icon: "local-atm",
                    },
                    TARIK_TUNAI_DI_ATM_CIRRUS: {
                      name: "TARIK TUNAI CIRRUS",
                      icon: "local-atm",
                    },
                    SETOR_TUNAI_DI_MESIN_ATM_CRM: {
                      name: "SETOR TUNAI CRM",
                      icon: "account-balance-wallet",
                    },
                    MOBILE_TUNAI_ALFAMIDI: {
                      name: "MOBILE TUNAI ALFAMIDI",
                      icon: "store",
                    },
                    MOBILE_TUNAI_INDOMARET: {
                      name: "MOBILE TUNAI INDOMARET",
                      icon: "store",
                    },
                    MOBILE_TUNAI: {
                      name: "MOBILE TUNAI",
                      icon: "phone-android",
                    },
                    MOBILE_TUNAI_ALFAMART: {
                      name: "MOBILE TUNAI ALFAMART",
                      icon: "store",
                    },
                    BI_FAST_DANA_TIDAK_MASUK: {
                      name: "BI FAST GAGAL",
                      icon: "flash-on",
                    },
                    BI_FAST_BILATERAL: {
                      name: "BI FAST BILATERAL",
                      icon: "flash-on",
                    },
                    BI_FAST_GAGAL_HAPUS_AKUN: {
                      name: "BI FAST HAPUS AKUN",
                      icon: "flash-on",
                    },
                    BI_FAST_GAGAL_MIGRASI_AKUN: {
                      name: "BI FAST MIGRASI AKUN",
                      icon: "flash-on",
                    },
                    BI_FAST_GAGAL_SUSPEND_AKUN: {
                      name: "BI FAST SUSPEND AKUN",
                      icon: "flash-on",
                    },
                    BI_FAST_GAGAL_UPDATE_AKUN: {
                      name: "BI FAST UPDATE AKUN",
                      icon: "flash-on",
                    },
                    DISPUTE: { name: "DISPUTE", icon: "report-problem" },
                    "2ND_CHARGEBACK": {
                      name: "2ND CHARGEBACK",
                      icon: "report-problem",
                    },
                    DISPUTE_QRIS_KARTU_DEBIT: {
                      name: "DISPUTE QRIS DEBIT",
                      icon: "qr-code",
                    },
                    "2ND_CHARGEBACK_QRIS_DEBIT": {
                      name: "2ND CHARGEBACK QRIS",
                      icon: "qr-code",
                    },
                    PERMINTAAN_CCTV_ATM_BNI: {
                      name: "PERMINTAAN CCTV",
                      icon: "videocam",
                    },
                  };

                  return (
                    <View style={styles.categoryButtonContainer}>
                      {availableCategories.map((category) => {
                        const displayInfo = categoryDisplayMap[
                          category.complaint_code
                        ] || {
                          name: category.complaint_name.substring(0, 15),
                          icon: "help",
                        };

                        const messageGroupState =
                          buttonGroupStates[String(message.id)];
                        const isThisSelected =
                          messageGroupState?.selectedValue === displayInfo.name;
                        const isOtherSelected =
                          messageGroupState && !isThisSelected;
                        const globalCategorySelected =
                          selectedCategory &&
                          selectedCategory !== displayInfo.name;

                        // Determine button style based on selection state
                        const getButtonStyle = () => {
                          if (
                            isThisSelected ||
                            (selectedCategory &&
                              selectedCategory === displayInfo.name)
                          ) {
                            return [
                              styles.categoryButton,
                              styles.selectedCategoryButton,
                            ];
                          } else if (
                            isOtherSelected ||
                            globalCategorySelected
                          ) {
                            return [
                              styles.categoryButton,
                              styles.disabledCategoryButton,
                            ];
                          }
                          return styles.categoryButton;
                        };

                        return (
                          <TouchableOpacity
                            key={category.complaint_id}
                            style={getButtonStyle()}
                            activeOpacity={
                              isOtherSelected || globalCategorySelected
                                ? 1
                                : 0.7
                            }
                            onPress={() => {
                              handleCategorySelect(
                                displayInfo.name,
                                String(message.id)
                              );
                            }}
                            disabled={
                              !!(isOtherSelected || globalCategorySelected)
                            }
                          >
                            <MaterialIcons
                              name={displayInfo.icon as any}
                              size={14}
                              color={
                                isOtherSelected || globalCategorySelected
                                  ? "#999"
                                  : "#FFF"
                              }
                            />
                            <Text
                              style={[
                                styles.buttonText,
                                {
                                  fontSize: rf(7),
                                  textAlign: "center",
                                  lineHeight: rf(8),
                                  fontWeight: "600",
                                },
                                (isOtherSelected || globalCategorySelected) && {
                                  color: "#999",
                                },
                              ]}
                              numberOfLines={2}
                              adjustsFontSizeToFit
                            >
                              {displayInfo.name}
                            </Text>
                          </TouchableOpacity>
                        );
                      })}
                    </View>
                  );
                })()}
              {(message as any).hasTerminalButtons &&
                !ticketCreatedInSession &&
                !editFormSelected && (
                  <View style={styles.terminalButtonContainer}>
                    {(() => {
                      console.log("Terminals data:", terminals);
                      console.log("First terminal:", terminals[0]);

                      if (!terminals || terminals.length === 0) {
                        return (
                          <Text style={styles.buttonText}>
                            Tidak ada terminal tersedia
                          </Text>
                        );
                      }

                      return terminals
                        .slice(0, 6)
                        .map((terminal) => {
                          // Safety check for terminal properties
                          if (!terminal || !terminal.terminal_id) {
                            console.log("Invalid terminal object:", terminal);
                            return null;
                          }

                          const terminalDisplay = `${
                            terminal.terminal_code || "Unknown"
                          } - ${terminal.location || "Unknown Location"}`;
                          const messageGroupState =
                            buttonGroupStates[String(message.id)];
                          const isThisSelected =
                            messageGroupState?.selectedValue ===
                            terminal.terminal_id?.toString();
                          const isOtherSelected =
                            messageGroupState && !isThisSelected;
                          const globalTerminalSelected =
                            selectedTerminal &&
                            selectedTerminal !==
                              terminal.terminal_id?.toString();

                          return (
                            <TouchableOpacity
                              key={terminal.terminal_id || Math.random()}
                              style={[
                                styles.terminalButton,
                                (isOtherSelected || globalTerminalSelected) &&
                                  styles.disabledTerminalButton,
                              ]}
                              activeOpacity={
                                isOtherSelected || globalTerminalSelected
                                  ? 1
                                  : 0.7
                              }
                              onPress={() => {
                                console.log(
                                  "Terminal button pressed:",
                                  terminal.terminal_id
                                );
                                if (terminal.terminal_id) {
                                  handleTerminalSelect(
                                    terminal.terminal_id,
                                    String(message.id)
                                  );
                                }
                              }}
                              disabled={
                                !!(isOtherSelected || globalTerminalSelected)
                              }
                            >
                              <MaterialIcons
                                name="local-atm"
                                size={14}
                                color={
                                  isOtherSelected || globalTerminalSelected
                                    ? "#999"
                                    : "#FFF"
                                }
                              />
                              <Text
                                style={[
                                  styles.buttonText,
                                  {
                                    fontSize: rf(8),
                                    textAlign: "center",
                                    lineHeight: rf(10),
                                    fontWeight: "600",
                                    marginTop: hp(0.3),
                                  },
                                  (isOtherSelected ||
                                    globalTerminalSelected) && {
                                    color: "#999",
                                  },
                                ]}
                                numberOfLines={3}
                              >
                                {terminalDisplay}
                              </Text>
                            </TouchableOpacity>
                          );
                        })
                        .filter(Boolean); // Remove null entries
                    })()}
                  </View>
                )}
            </View>
          ))}

          {/* Typing indicator */}
          {isTyping && (
            <View style={[styles.messageContainer, styles.botMessage]}>
              <View style={[styles.messageBubble, styles.botBubble]}>
                <Text style={[styles.messageText, styles.botText]}>
                  Bot sedang mengetik...
                </Text>
              </View>
            </View>
          )}
        </ScrollView>

        {/* Live Chat Status */}
        {isLiveChat && (
          <View style={styles.liveChatStatus}>
            <View style={styles.statusIndicator}>
              <MaterialIcons name="circle" size={8} color="#4CAF50" />
              <Text style={styles.liveChatStatusText}>
                Live Chat Aktif • Peers: {peerCount} • Tap phone icon untuk
                panggilan suara
              </Text>
            </View>
          </View>
        )}

        {/* Input Area */}
        <View style={styles.inputContainer}>
          <TouchableOpacity
            style={[
              styles.addFileButton,
              (() => {
                const hasValidTicket =
                  currentTicketId &&
                  currentTicketId.trim() !== "" &&
                  currentTicketId !== "undefined" &&
                  currentTicketId !== "null";
                const canUpload =
                  (isFromTicketDetail ||
                    ticketCreatedInSession ||
                    fromConfirmation === "true") &&
                  hasValidTicket;
                return !canUpload ? styles.addFileButtonDisabled : null;
              })(),
            ]}
            disabled={(() => {
              const hasValidTicket =
                currentTicketId &&
                currentTicketId.trim() !== "" &&
                currentTicketId !== "undefined" &&
                currentTicketId !== "null";
              const canUpload =
                (isFromTicketDetail ||
                  ticketCreatedInSession ||
                  fromConfirmation === "true") &&
                hasValidTicket;
              return !canUpload;
            })()}
            onPress={() => {
              // Debug upload conditions
              console.log("🔍 Upload button pressed - Debug conditions:", {
                isFromTicketDetail,
                ticketCreatedInSession,
                fromConfirmation,
                currentTicketId,
                hasValidTicket:
                  currentTicketId &&
                  currentTicketId.trim() !== "" &&
                  currentTicketId !== "undefined" &&
                  currentTicketId !== "null",
              });

              if (
                !isFromTicketDetail &&
                !ticketCreatedInSession &&
                fromConfirmation !== "true"
              ) {
                Alert.alert(
                  "Upload Tidak Tersedia",
                  "Silakan buat tiket terlebih dahulu untuk mengirim attachment."
                );
                return;
              }
              if (
                !currentTicketId ||
                currentTicketId.trim() === "" ||
                currentTicketId === "undefined" ||
                currentTicketId === "null"
              ) {
                Alert.alert(
                  "Tiket Tidak Tersedia",
                  "Silakan buat tiket terlebih dahulu untuk mengirim attachment."
                );
                return;
              }
              setShowUploadModal(true);
            }}
          >
            <MaterialIcons
              name="add"
              size={24}
              color={(() => {
                const hasValidTicket =
                  currentTicketId &&
                  currentTicketId.trim() !== "" &&
                  currentTicketId !== "undefined" &&
                  currentTicketId !== "null";
                const canUpload =
                  (isFromTicketDetail ||
                    ticketCreatedInSession ||
                    fromConfirmation === "true") &&
                  hasValidTicket;
                return canUpload ? "#FFF" : "#999";
              })()}
            />
          </TouchableOpacity>
          <TextInput
            style={[
              styles.textInput,
              isInputDisabled && styles.disabledTextInput,
            ]}
            placeholder={
              isInputDisabled
                ? "Pilih dari tombol di atas..."
                : "Ketik pesan Anda..."
            }
            placeholderTextColor={isInputDisabled ? "#999" : "#AAA"}
            value={inputText}
            onChangeText={setInputText}
            editable={!isInputDisabled}
            multiline
            returnKeyType="send"
            onSubmitEditing={handleSendMessage}
            blurOnSubmit={false}
          />
          <TouchableOpacity
            onPress={handleSendMessage}
            disabled={!inputText.trim() || isInputDisabled}
          >
            <MaterialIcons
              name="send"
              size={20}
              color={inputText.trim() && !isInputDisabled ? "#FF8636" : "#CCC"}
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
        {/* Audio Call Modal - Simplified for audio only */}
        <Modal
          visible={callStatus === "ringing" || callStatus === "audio-call"}
          transparent={true}
          animationType="fade"
        >
          <View style={styles.modalOverlay}>
            <View style={styles.liveChatModal}>
              <MaterialIcons name="phone" size={60} color="#4CAF50" />
              <Text style={styles.modalTitle}>
                {callStatus === "ringing"
                  ? "Panggilan Masuk"
                  : "Panggilan Aktif"}
              </Text>
              <Text style={styles.modalSubtitle}>
                {callStatus === "ringing"
                  ? "Agent ingin melakukan panggilan suara"
                  : "Panggilan suara sedang berlangsung"}
              </Text>

              {callStatus === "ringing" && (
                <View style={styles.buttonContainer}>
                  <TouchableOpacity
                    style={styles.acceptCallButton}
                    onPress={acceptCall}
                  >
                    <MaterialIcons name="phone" size={20} color="#FFF" />
                    <Text style={styles.acceptCallText}>Terima</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.declineCallButton}
                    onPress={declineCall}
                  >
                    <MaterialIcons
                      name="phone-disabled"
                      size={20}
                      color="#FFF"
                    />
                    <Text style={styles.acceptCallText}>Tolak</Text>
                  </TouchableOpacity>
                </View>
              )}

              {callStatus === "audio-call" && (
                <TouchableOpacity
                  style={styles.hangupButton}
                  onPress={hangupCall}
                >
                  <MaterialIcons name="call-end" size={20} color="#FFF" />
                  <Text style={styles.acceptCallText}>Tutup</Text>
                </TouchableOpacity>
              )}
            </View>
          </View>
        </Modal>

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
    paddingHorizontal: wp(4),
    paddingVertical: hp(3),
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
    fontSize: rf(18),
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
    padding: wp(4),
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
    maxWidth: deviceType.isTablet ? "70%" : "80%",
    padding: wp(3),
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
    fontSize: rf(14),
    lineHeight: rf(20),
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
    padding: wp(4),
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
    paddingHorizontal: wp(4),
    paddingVertical: hp(1.2),
    marginRight: wp(3),
    backgroundColor: "#F5F5F5",
    fontSize: rf(14),
    maxHeight: hp(12.5),
    fontFamily: "Poppins",
    color: "#333", // Always dark text for readability
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
  addFileButtonDisabled: {
    backgroundColor: "#E0E0E0",
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
    backgroundColor: "#4CAF50",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 16,
  },
  noButton: {
    backgroundColor: "#FF9800",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 16,
  },
  buttonText: {
    fontSize: 10,
    fontWeight: "600",
    color: "#FFF",
    fontFamily: "Poppins",
    textAlign: "center",
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
  callIconsContainer: {
    flexDirection: "column",
    gap: 4,
  },
  audioButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FF8636",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 16,
    gap: 4,
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
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 25,
    gap: 4,
  },
  declineCallButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FF4444",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 25,
    gap: 4,
  },
  hangupButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FF4444",
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 25,
    gap: 4,
  },
  acceptCallText: {
    fontSize: 14,
    color: "#FFF",
    fontFamily: "Poppins",
    fontWeight: "600",
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
  ticketInfoCard: {
    marginTop: 8,
    padding: 16,
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    minWidth: 220,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    borderWidth: 1,
    borderColor: "#FF8636",
  },
  ticketInfoHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
    gap: 8,
  },
  ticketInfoTitle: {
    fontSize: 15,
    fontFamily: "Poppins",
    fontWeight: "600",
    color: "#FF8636",
  },
  ticketInfoId: {
    fontSize: 14,
    fontFamily: "Poppins",
    fontWeight: "700",
    color: "#FF8636",
    marginBottom: 6,
  },
  ticketInfoChannel: {
    fontSize: 12,
    fontFamily: "Poppins",
    color: "#FF8636",
    marginBottom: 3,
  },
  ticketInfoStatus: {
    fontSize: 11,
    fontFamily: "Poppins",
    color: "#FF8636",
    marginBottom: 10,
    fontWeight: "500",
  },
  ticketInfoFooter: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingTop: 4,
    borderTopWidth: 1,
    borderTopColor: "rgba(255, 134, 54, 0.2)",
  },
  ticketInfoAction: {
    fontSize: 12,
    fontFamily: "Poppins",
    color: "#FF8636",
    fontWeight: "500",
  },
  channelButtonContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginTop: 8,
    gap: 8,
    zIndex: 10,
    elevation: 10,
    position: "relative",
  },
  channelButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#52B5AB",
    paddingHorizontal: wp(2),
    paddingVertical: hp(1),
    borderRadius: wp(4),
    gap: wp(1),
    minWidth: deviceType.isTablet ? "22%" : "30%",
    maxWidth: deviceType.isTablet ? "32%" : "48%",
    justifyContent: "center",
    elevation: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    position: "relative",
    zIndex: 10,
  },
  categoryButtonContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginTop: 8,
    gap: 6,
    justifyContent: "space-between",
    zIndex: 10,
    elevation: 10,
    position: "relative",
  },
  categoryButton: {
    flexDirection: "column",
    alignItems: "center",
    backgroundColor: "#4CAF50",
    paddingHorizontal: wp(1),
    paddingVertical: hp(0.8),
    borderRadius: wp(3),
    gap: hp(0.3),
    minWidth: deviceType.isTablet ? "22%" : "30%",
    maxWidth: deviceType.isTablet ? "24%" : "32%",
    justifyContent: "center",
    elevation: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    minHeight: hp(5.5),
    position: "relative",
    zIndex: 10,
  },

  editButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FF8636",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 16,
    gap: 4,
  },
  createButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#52B5AB",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 16,
    gap: 4,
  },
  disabledButton: {
    backgroundColor: "#E0E0E0",
  },
  disabledChannelButton: {
    backgroundColor: "#E0E0E0",
  },
  disabledCategoryButton: {
    backgroundColor: "#E0E0E0",
  },
  selectedCategoryButton: {
    backgroundColor: "#2E7D32", // Darker green for selected state
  },
  terminalButtonContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginTop: 8,
    gap: 6,
    justifyContent: "space-between",
    zIndex: 10,
    elevation: 10,
    position: "relative",
  },
  terminalButton: {
    flexDirection: "column",
    alignItems: "center",
    backgroundColor: "#2196F3",
    paddingHorizontal: wp(1.5),
    paddingVertical: hp(1),
    borderRadius: wp(3),
    gap: hp(0.3),
    minWidth: deviceType.isTablet ? "22%" : "30%",
    maxWidth: deviceType.isTablet ? "24%" : "32%",
    justifyContent: "center",
    minHeight: hp(6.5),
    elevation: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    position: "relative",
    zIndex: 10,
  },
  disabledTerminalButton: {
    backgroundColor: "#E0E0E0",
  },
  disabledTextInput: {
    backgroundColor: "#F0F0F0",
    borderColor: "#D0D0D0",
    color: "#666", // Slightly darker for better readability
  },
});
