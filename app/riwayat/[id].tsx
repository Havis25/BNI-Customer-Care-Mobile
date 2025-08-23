import FeedbackModal from "@/components/FeedbackModal";
import { Fonts } from "@/constants/Fonts";
import { useTicketDetail } from "@/hooks/useTicketDetail";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { router, useLocalSearchParams } from "expo-router";
import React, { useCallback, useEffect, useState } from "react";
import {
  Platform,
  RefreshControl,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import {
  SafeAreaView,
  useSafeAreaInsets,
} from "react-native-safe-area-context";

export default function RiwayatDetailScreen() {
  const insets = useSafeAreaInsets(); // <<-- untuk spacer status bar
  const { id } = useLocalSearchParams();

  const [showFeedback, setShowFeedback] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const { ticketDetail, isLoading, error, fetchTicketDetail, progressData } =
    useTicketDetail();

  const onRefresh = useCallback(async () => {
    if (id) {
      setRefreshing(true);
      try {
        await fetchTicketDetail(id as string);
      } finally {
        setRefreshing(false);
      }
    }
  }, [id, fetchTicketDetail]);

  useEffect(() => {
    if (id) fetchTicketDetail(id as string);
  }, [id, fetchTicketDetail]);

  useEffect(() => {
    if (ticketDetail?.customer_status?.customer_status_code) {
      const isCompleted =
        ticketDetail.customer_status.customer_status_code === "CLOSED";
      const hasFeedback = !!ticketDetail.feedback;
      if (isCompleted && !hasFeedback) setShowFeedback(true);
    }
  }, [ticketDetail]);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("id-ID", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString("id-ID", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // Komponen header + spacer supaya menyatu dengan status bar
  const Header = () => (
    <View style={[styles.headerContainer, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <MaterialIcons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Detail Laporan</Text>
        <View style={{ width: 24 }} />
      </View>
    </View>
  );

  if (isLoading) {
    return (
      <>
        <StatusBar
          translucent
          backgroundColor="transparent"
          barStyle="dark-content"
        />
        <SafeAreaView
          style={styles.container}
          edges={["left", "right", "bottom"]}
        >
          <Header />
          <DetailSkeleton />
        </SafeAreaView>
      </>
    );
  }

  if (error) {
    return (
      <>
        <StatusBar
          translucent
          backgroundColor="transparent"
          barStyle="dark-content"
        />
        <SafeAreaView
          style={styles.container}
          edges={["left", "right", "bottom"]}
        >
          <Header />
          <View
            style={{ flex: 1, justifyContent: "center", alignItems: "center" }}
          >
            <Text style={styles.loadingText}>Error: {error}</Text>
            <TouchableOpacity
              style={{
                marginTop: 16,
                padding: 12,
                backgroundColor: "#FF6600",
                borderRadius: 8,
              }}
              onPress={() => id && fetchTicketDetail(id as string)}
            >
              <Text style={{ color: "#FFF" }}>Coba Lagi</Text>
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </>
    );
  }

  if (!ticketDetail) {
    return (
      <>
        <StatusBar
          translucent
          backgroundColor="transparent"
          barStyle="dark-content"
        />
        <SafeAreaView
          style={styles.container}
          edges={["left", "right", "bottom"]}
        >
          <Header />
          <View
            style={{ flex: 1, justifyContent: "center", alignItems: "center" }}
          >
            <Text style={styles.loadingText}>Data tidak ditemukan</Text>
          </View>
        </SafeAreaView>
      </>
    );
  }

  return (
    <>
      <StatusBar
        translucent
        backgroundColor="transparent"
        barStyle="dark-content"
      />
      <SafeAreaView
        style={styles.container}
        edges={["left", "right", "bottom"]}
      >
        <Header />

        <ScrollView
          style={styles.content}
          showsVerticalScrollIndicator={false}
          nestedScrollEnabled
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={["#52B5AB"]}
              tintColor="#52B5AB"
            />
          }
        >
          {ticketDetail.customer_status?.customer_status_code ===
            "DECLINED" && (
            <View style={styles.warningContainer}>
              <MaterialIcons name="error-outline" size={24} color="#E24646" />
              <Text style={styles.warningText}>
                Mohon maaf, laporan Anda ditolak karena tidak sesuai ketentuan.
              </Text>
            </View>
          )}

          <View
            style={[
              styles.complaintContainer,
              ticketDetail.customer_status?.customer_status_code ===
                "DECLINED" && styles.complaintContainerDeclined,
            ]}
          >
            <View style={styles.detailHeader}>
              <Text style={styles.detailId}>{ticketDetail.ticket_number}</Text>
              <Text style={styles.detailDateTime}>
                {formatDate(ticketDetail.created_time)},{" "}
                {formatTime(ticketDetail.created_time)}
              </Text>
            </View>

            <Text style={styles.detailTitle}>
              {ticketDetail.issue_channel?.channel_name ||
                "Channel tidak tersedia"}
            </Text>

            <View style={styles.descriptionSection}>
              <Text style={styles.sectionTitle}>Deskripsi</Text>
              <Text style={styles.descriptionText}>
                {ticketDetail.description}
              </Text>
            </View>
          </View>

          <View style={styles.progressSection}>
            <Text style={styles.progressTitle}>Status Progress</Text>
            <View
              style={[
                styles.progressCard,
                ticketDetail.customer_status?.customer_status_code ===
                  "DECLINED" && styles.progressCardDeclined,
              ]}
            >
              {progressData?.map((step: any, index: number) => {
                const isLast = index === progressData.length - 1;
                return (
                  <View key={step.status} style={styles.progressStep}>
                    <View style={styles.progressStepLeft}>
                      <View
                        style={[
                          styles.progressDot,
                          step.completed &&
                            (ticketDetail.customer_status
                              ?.customer_status_code === "DECLINED"
                              ? styles.progressDotDeclined
                              : styles.progressDotCompleted),
                        ]}
                      />
                      {!isLast && (
                        <View
                          style={[
                            styles.progressLine,
                            step.completed &&
                              (ticketDetail.customer_status
                                ?.customer_status_code === "DECLINED"
                                ? styles.progressLineDeclined
                                : styles.progressLineCompleted),
                          ]}
                        />
                      )}
                    </View>
                    <View style={styles.progressStepContent}>
                      <Text
                        style={[
                          styles.progressStepTitle,
                          step.completed && styles.progressStepTitleCompleted,
                        ]}
                      >
                        {step.status}
                      </Text>
                      {step.penjelasan && step.penjelasan.trim() !== "" && (
                        <Text style={styles.progressStepDescription}>
                          {step.penjelasan}
                        </Text>
                      )}
                      {step.tanggal && step.tanggal.trim() !== "" && (
                        <Text style={styles.progressStepDate}>
                          {step.tanggal}
                        </Text>
                      )}
                    </View>
                  </View>
                );
              })}
            </View>
          </View>

          {ticketDetail.feedback &&
            ticketDetail.customer_status?.customer_status_code === "CLOSED" && (
              <View style={styles.feedbackContainer}>
                <View style={styles.feedbackSection}>
                  <Text style={styles.feedbackTitle}>Feedback Anda</Text>
                  <View style={styles.feedbackCard}>
                    <View style={styles.feedbackComment}>
                      <Text style={styles.feedbackCommentLabel}>Komentar:</Text>
                      <Text style={styles.feedbackCommentText}>
                        {ticketDetail.feedback.comment}
                      </Text>
                    </View>
                  </View>
                </View>
              </View>
            )}
        </ScrollView>

        {ticketDetail.customer_status?.customer_status_code !== "DECLINED" && (
          <View style={styles.liveChatCard}>
            <TouchableOpacity
              style={styles.liveChatButton}
              onPress={() => {
                router.push({
                  pathname: "/complaint/chat",
                  params: {
                    fromConfirmation: "true",
                    ticketId: id,
                    room: `ticket-${id}`,
                  },
                });
              }}
            >
              <MaterialIcons
                name="message"
                size={20}
                color="#fff"
                style={styles.chatIcon}
              />
              <Text style={styles.liveChatText}>Live Chat</Text>
            </TouchableOpacity>
          </View>
        )}

        <FeedbackModal
          visible={showFeedback}
          onClose={() => {}}
          ticketId={id as string}
          onSuccess={() => {
            fetchTicketDetail(id as string);
            setShowFeedback(false);
          }}
        />
      </SafeAreaView>
    </>
  );
}

function DetailSkeleton() {
  return (
    <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
      {/* Complaint Container Skeleton */}
      <View style={styles.complaintContainer}>
        <View style={styles.detailHeader}>
          <View style={styles.skeletonTicketId} />
          <View style={styles.skeletonDateTime} />
        </View>
        <View style={styles.skeletonTitle} />
        <View style={styles.descriptionSection}>
          <View style={styles.skeletonSectionTitle} />
          <View style={styles.skeletonDescription} />
          <View style={[styles.skeletonDescription, { width: "60%" }]} />
        </View>
      </View>

      {/* Progress Section Skeleton */}
      <View style={styles.progressSection}>
        <View style={styles.skeletonProgressTitle} />
        <View style={styles.skeletonProgressCard}>
          {[1, 2, 3, 4].map((item) => (
            <View key={item} style={styles.progressStep}>
              <View style={styles.progressStepLeft}>
                <View style={styles.skeletonProgressDot} />
                {item < 4 && <View style={styles.skeletonProgressLine} />}
              </View>
              <View style={styles.progressStepContent}>
                <View style={styles.skeletonProgressStatus} />
                <View style={styles.skeletonProgressDesc} />
                <View style={styles.skeletonProgressDate} />
              </View>
            </View>
          ))}
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },

  headerContainer: {
    backgroundColor: "#fff",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 8,
    zIndex: 1000,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 16,
    backgroundColor: "#fff",
  },
  headerTitle: {
    fontSize: 18,
    fontFamily: Fonts.medium,
    color: "black",
  },

  content: {
    flex: 1,
    paddingTop: 24,
    paddingHorizontal: 24,
  },

  detailHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  detailId: {
    fontSize: 16,
    fontFamily: Fonts.medium,
    color: "#555555",
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 16,
  },
  statusText: {
    fontSize: 12,
    fontFamily: Fonts.medium,
  },
  detailTitle: {
    fontSize: 18,
    fontFamily: Fonts.bold,
    color: "black",
    marginBottom: 8,
  },
  detailDateTime: {
    fontSize: 14,
    fontFamily: Fonts.regular,
    color: "#555555",
  },
  descriptionSection: {
    marginBottom: 0,
  },
  sectionTitle: {
    fontSize: 16,
    fontFamily: Fonts.medium,
    color: "black",
    marginBottom: 2,
  },
  descriptionText: {
    fontSize: 14,
    fontFamily: Fonts.regular,
    color: "black",
    lineHeight: 20,
    textAlign: "justify",
  },
  complaintContainer: {
    padding: 16,
    borderWidth: 1,
    borderColor: "#71DAD3",
    borderRadius: 12,
    marginBottom: 20,
  },
  warningContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFF1F1",
    padding: 16,
    borderRadius: 8,
    marginBottom: 20,
    gap: 12,
  },
  warningText: {
    flex: 1,
    fontSize: 14,
    fontFamily: Fonts.regular,
    color: "#E24646",
  },
  complaintContainerDeclined: {
    borderColor: "#E24646",
  },

  progressSection: {
    marginBottom: 20,
  },
  progressTitle: {
    fontSize: 18,
    fontFamily: Fonts.medium,
    color: "#333",
    marginBottom: 16,
  },
  progressCard: {
    backgroundColor: "#F1FBFB",
    borderLeftWidth: 4,
    borderLeftColor: "#71DAD3",
    borderRadius: 12,
    paddingHorizontal: 24,
    paddingTop: 24,
  },
  progressCardDeclined: {
    backgroundColor: "#FFF1F1",
    borderLeftColor: "#E24646",
  },
  progressStep: {
    flexDirection: "row",
    marginBottom: 20,
  },

  liveChatCard: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "#fff",
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: Platform.OS === "ios" ? 42 : 24, // ruang untuk home indicator
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 12,
  },
  liveChatButton: {
    backgroundColor: "#52B5AB",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    borderRadius: 8,
    gap: 8,
  },
  chatIcon: {
    marginRight: 4,
  },
  liveChatText: {
    color: "#fff",
    fontSize: 14,
    fontFamily: Fonts.medium,
  },

  progressStepLeft: {
    alignItems: "center",
    marginRight: 16,
    position: "relative",
  },
  progressDot: {
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: "#E5E5E5",
  },
  progressDotCompleted: {
    backgroundColor: "#71DAD3",
  },
  progressDotDeclined: {
    backgroundColor: "#E24646",
  },
  progressLine: {
    width: 2,
    height: "100%",
    backgroundColor: "#E5E5E5",
    position: "absolute",
    top: 18,
  },
  progressLineCompleted: {
    backgroundColor: "#71DAD3",
  },
  progressLineDeclined: {
    backgroundColor: "#E24646",
  },

  progressStepContent: {
    flex: 1,
  },
  progressStepTitle: {
    fontSize: 16,
    fontFamily: Fonts.medium,
    color: "#999",
    marginBottom: 4,
  },
  progressStepTitleCompleted: {
    color: "black",
  },
  progressStepDate: {
    fontSize: 12,
    fontFamily: Fonts.medium,
    color: "#8b8b8bff",
  },
  progressStepDescription: {
    fontSize: 13,
    fontFamily: Fonts.regular,
    color: "black",
    lineHeight: 16,
    marginBottom: 4,
  },

  loadingText: {
    textAlign: "center",
    fontSize: 16,
    fontFamily: Fonts.medium,
    color: "#666",
    marginTop: 50,
  },

  feedbackContainer: {
    marginBottom: 80,
  },

  feedbackSection: {
    marginBottom: 20,
  },
  feedbackTitle: {
    fontSize: 18,
    fontFamily: Fonts.medium,
    color: "#333",
    marginBottom: 16,
  },
  feedbackCard: {
    backgroundColor: "#F8F9FA",
    borderRadius: 12,
    padding: 16,
    borderLeftWidth: 4,
    borderLeftColor: "#52B5AB",
  },
  feedbackRating: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  feedbackRatingLabel: {
    fontSize: 14,
    fontFamily: Fonts.medium,
    color: "#333",
    marginRight: 8,
  },
  feedbackStars: {
    flexDirection: "row",
    alignItems: "center",
  },
  feedbackScore: {
    fontSize: 12,
    fontFamily: Fonts.regular,
    color: "#666",
    marginLeft: 8,
  },
  feedbackComment: {
    marginBottom: 12,
  },
  feedbackCommentLabel: {
    fontSize: 14,
    fontFamily: Fonts.medium,
    color: "#333",
    marginBottom: 4,
  },
  feedbackCommentText: {
    fontSize: 14,
    fontFamily: Fonts.regular,
    color: "#666",
    lineHeight: 20,
  },
  feedbackDate: {
    fontSize: 12,
    fontFamily: Fonts.regular,
    color: "#999",
  },

  // Skeleton styles
  skeletonTicketId: {
    width: 120,
    height: 16,
    backgroundColor: "#E5E5E5",
    borderRadius: 8,
  },
  skeletonDateTime: {
    width: 100,
    height: 14,
    backgroundColor: "#E5E5E5",
    borderRadius: 6,
  },
  skeletonTitle: {
    width: "70%",
    height: 18,
    backgroundColor: "#E5E5E5",
    borderRadius: 8,
    marginBottom: 8,
  },
  skeletonSectionTitle: {
    width: 80,
    height: 16,
    backgroundColor: "#E5E5E5",
    borderRadius: 6,
    marginBottom: 2,
  },
  skeletonDescription: {
    width: "100%",
    height: 14,
    backgroundColor: "#E5E5E5",
    borderRadius: 6,
    marginBottom: 4,
  },
  skeletonProgressTitle: {
    width: 120,
    height: 18,
    backgroundColor: "#E5E5E5",
    borderRadius: 8,
    marginBottom: 16,
  },
  skeletonProgressDot: {
    width: 16,
    height: 16,
    backgroundColor: "#E5E5E5",
    borderRadius: 8,
  },
  skeletonProgressStatus: {
    width: 100,
    height: 16,
    backgroundColor: "#E5E5E5",
    borderRadius: 6,
    marginBottom: 4,
  },
  skeletonProgressDesc: {
    width: "80%",
    height: 13,
    backgroundColor: "#E5E5E5",
    borderRadius: 6,
    marginBottom: 4,
  },
  skeletonProgressDate: {
    width: 80,
    height: 12,
    backgroundColor: "#E5E5E5",
    borderRadius: 6,
  },
  skeletonProgressCard: {
    backgroundColor: "#F5F5F5",
    borderLeftWidth: 4,
    borderLeftColor: "#E5E5E5",
    borderRadius: 12,
    paddingHorizontal: 24,
    paddingTop: 24,
  },
  skeletonProgressLine: {
    width: 2,
    height: "100%",
    backgroundColor: "#E5E5E5",
    position: "absolute",
    top: 18,
  },
});
