import TabTransition from "@/components/TabTransition";
import { Fonts } from "@/constants/Fonts";
import { useTickets } from "@/hooks/useTickets"; // <-- pakai hook tiket
import { deviceType, hp, rf, wp } from "@/utils/responsive";
import { Ionicons } from "@expo/vector-icons";
import dayjs from "dayjs";
import "dayjs/locale/id"; // supaya "5 menit lalu" pakai bahasa Indonesia
import relativeTime from "dayjs/plugin/relativeTime";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import React, { useMemo, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
dayjs.extend(relativeTime);
dayjs.locale("id");

interface Notification {
  id: string;
  title: string;
  description: string;
  timeAgo: string;
  iconName: string;
  iconColor: string;
  read: boolean;
  category: string;
  ticketNumber: string;
  status: string;
}

export default function NotificationScreen() {
  const { tickets, isLoading, error, refetch } = useTickets();
  const [readIds, setReadIds] = useState<string[]>([]);

  // Transform tickets into notifications
  const notifications: Notification[] = useMemo(() => {
    return tickets
      .sort(
        (a, b) =>
          new Date(b.created_time).getTime() -
          new Date(a.created_time).getTime()
      )
      .map((ticket) => {
        let title = "";
        let iconName = "mail";
        let iconColor = "#2196F3";
        let description = "";

        // Debug logging
        console.log("Ticket data:", {
          ticket_number: ticket.ticket_number,
          status_code: ticket.customer_status?.customer_status_code,
          status_name: ticket.customer_status?.customer_status_name,
          complaint_name: ticket.complaint?.complaint_name,
          description: ticket.description,
        });

        // Concise notification mapping
        const statusCode =
          ticket.customer_status?.customer_status_code || "UNKNOWN";
        const statusName =
          ticket.customer_status?.customer_status_name ||
          "Status Tidak Diketahui";
        const channelName = ticket.issue_channel?.channel_name || "Laporan";
        const ticketNum = ticket.ticket_number || "N/A";

        // Map status codes to specific icons
        switch (statusCode.toUpperCase()) {
          case "RECEIVED":
          case "OPEN":
          case "NEW":
            title = "Laporan Diterima";
            description = channelName;
            iconName = "mail";
            iconColor = "#2196F3";
            break;
          case "VALIDATING":
          case "VALIDATION":
          case "REVIEW":
            title = "Sedang Divalidasi";
            description = channelName;
            iconName = "document-text";
            iconColor = "#FF9800";
            break;
          case "PROCESSING":
          case "IN_PROGRESS":
          case "PROGRESS":
            title = "Sedang Diproses";
            description = channelName;
            iconName = "time";
            iconColor = "#FF6600";
            break;
          case "DONE":
          case "COMPLETED":
          case "RESOLVED":
          case "CLOSED":
            title = "Selesai";
            description = channelName;
            iconName = "checkmark-circle";
            iconColor = "#4CAF50";
            break;
          default:
            title = statusName;
            description = channelName;
            iconName = "mail";
            iconColor = "#2196F3";
            break;
        }

        return {
          id: `notif_${
            ticket.ticket_id || ticket.ticket_number
          }_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          title,
          description,
          timeAgo: dayjs(ticket.created_time).fromNow(),
          iconName,
          iconColor,
          read: readIds.includes(
            String(ticket.ticket_id || ticket.ticket_number)
          ),
          category:
            ticket.issue_channel?.channel_name?.toLowerCase() || "general",
          ticketNumber: ticket.ticket_number,
          status: statusCode,
        };
      });
  }, [tickets, readIds]);

  const markAsRead = (id: string) => {
    setReadIds((prev) => [...prev, id]);
  };

  const handleNotificationPress = (notification: Notification) => {
    // Mark as read
    markAsRead(notification.id);

    // Navigate to ticket detail page
    if (notification.ticketNumber) {
      router.push({
        pathname: "/riwayat/[id]",
        params: { id: notification.ticketNumber },
      });
    }
  };

  const markAllAsRead = () => {
    setReadIds(notifications.map((n) => n.id));
  };

  const renderItem = ({
    item,
    index,
  }: {
    item: Notification;
    index: number;
  }) => (
    <TouchableOpacity
      style={[
        styles.notificationCard,
        !item.read && styles.unreadNotification,
        index === notifications.length - 1 && styles.lastNotification,
      ]}
      onPress={() => handleNotificationPress(item)}
      activeOpacity={0.7}
    >
      <View style={styles.notificationContent}>
        <View style={styles.leftSection}>
          <View
            style={[styles.statusIcon, { backgroundColor: item.iconColor }]}
          >
            <Ionicons name={item.iconName as any} size={16} color="white" />
          </View>
          <View style={styles.notificationText}>
            <Text
              style={[
                styles.notificationTitle,
                !item.read && styles.unreadNotificationTitle,
              ]}
            >
              {item.title}
            </Text>
            <Text style={styles.notificationDesc}>
              {item.description} • #{item.ticketNumber}
            </Text>
          </View>
        </View>
        <View style={styles.rightSection}>
          <Text style={styles.notificationTime}>{item.timeAgo}</Text>
          {!item.read && <View style={styles.unreadIndicator} />}
        </View>
      </View>
    </TouchableOpacity>
  );

  if (isLoading) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <LinearGradient
          colors={["#DEEF5A", "#FCFDEE"]}
          locations={[0.23, 0.37]}
          style={StyleSheet.absoluteFill}
        />
        <View style={styles.loaderContainer}>
          <ActivityIndicator size="large" color="#FF6600" />
          <Text style={styles.loadingText}>Memuat notifikasi...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <LinearGradient
          colors={["#DEEF5A", "#FCFDEE"]}
          locations={[0.23, 0.37]}
          style={StyleSheet.absoluteFill}
        />
        <View style={styles.loaderContainer}>
          <Ionicons name="alert-circle" size={48} color="#FF6600" />
          <Text style={styles.errorTitle}>Gagal Memuat Notifikasi</Text>
          <Text style={styles.errorMessage}>Periksa koneksi internet Anda</Text>
          <TouchableOpacity onPress={refetch} style={styles.retryButton}>
            <Ionicons name="refresh" size={16} color="white" />
            <Text style={styles.retryText}>Coba Lagi</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <TabTransition>
      <SafeAreaView style={styles.safeArea}>
        <LinearGradient
          colors={["#DEEF5A", "#FCFDEE"]}
          locations={[0.23, 0.37]}
          style={StyleSheet.absoluteFill}
        />

        <View style={styles.headerSection}>
          <View style={styles.headerRow}>
            <Text style={styles.header}>Notifikasi</Text>
            {notifications.some((n) => !n.read) && (
              <TouchableOpacity
                onPress={markAllAsRead}
                style={styles.markAllButton}
              >
                <Text style={styles.markAllText}>Tandai Semua</Text>
              </TouchableOpacity>
            )}
          </View>
          {notifications.length > 0 && (
            <View style={styles.headerStats}>
              <Text style={styles.headerStatsText}>
                {notifications.filter((n) => !n.read).length} belum dibaca
              </Text>
            </View>
          )}
        </View>

        <View style={styles.container}>
          {notifications.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Ionicons name="notifications-off" size={64} color="#CCC" />
              <Text style={styles.emptyTitle}>Belum Ada Notifikasi</Text>
              <Text style={styles.emptyMessage}>
                Notifikasi akan muncul ketika ada update pada laporan Anda
              </Text>
            </View>
          ) : (
            <View style={styles.listWrapper}>
              <FlatList
                data={notifications}
                keyExtractor={(item) => item.id}
                renderItem={({ item, index }) => renderItem({ item, index })}
                contentContainerStyle={styles.listContainer}
                showsVerticalScrollIndicator={false}
                refreshing={isLoading}
                onRefresh={refetch}
              />
            </View>
          )}
        </View>
      </SafeAreaView>
    </TabTransition>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1 },
  headerSection: {
    paddingHorizontal: wp(6),
    paddingTop: hp(2.5),
    paddingBottom: hp(1.2),
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  markAllButton: {
    backgroundColor: "#FF6600",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  markAllText: {
    fontSize: 12,
    fontFamily: Fonts.semiBold,
    color: "white",
  },
  header: {
    fontSize: rf(24),
    fontFamily: Fonts.bold,
    color: "black",
    marginBottom: hp(1),
  },
  headerStats: {
    backgroundColor: "rgba(255, 102, 0, 0.1)",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    alignSelf: "flex-start",
  },
  headerStatsText: {
    fontSize: 12,
    fontFamily: Fonts.medium,
    color: "#FF6600",
  },
  container: {
    flex: 1,
    paddingHorizontal: wp(4),
    paddingBottom: hp(8.5),
  },
  listWrapper: {
    flex: 1,
    backgroundColor: "white",
    borderRadius: 16,
    overflow: "hidden",
  },
  listContainer: {
    flexGrow: 1,
  },
  notificationCard: {
    backgroundColor: "white",
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderLeftWidth: 3,
    borderLeftColor: "transparent",
    borderBottomWidth: 1,
    borderBottomColor: "#F5F5F5",
  },
  unreadNotification: {
    backgroundColor: "#FFF9F5",
  },
  notificationContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  leftSection: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  statusIcon: {
    width: deviceType.isTablet ? wp(6) : wp(7.5),
    height: deviceType.isTablet ? wp(6) : wp(7.5),
    borderRadius: deviceType.isTablet ? wp(3) : wp(3.75),
    justifyContent: "center",
    alignItems: "center",
    marginRight: wp(3),
  },
  notificationText: {
    flex: 1,
  },
  notificationTitle: {
    fontSize: rf(15),
    fontFamily: Fonts.semiBold,
    color: "#1A1A1A",
    marginBottom: hp(0.25),
  },
  unreadNotificationTitle: {
    fontFamily: Fonts.bold,
    color: "#000",
  },
  notificationDesc: {
    fontSize: 13,
    fontFamily: Fonts.regular,
    color: "#666",
    lineHeight: 18,
  },
  rightSection: {
    alignItems: "flex-end",
    justifyContent: "center",
  },
  notificationTime: {
    fontSize: 11,
    fontFamily: Fonts.medium,
    color: "#999",
    marginBottom: 4,
  },
  unreadIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#FF6600",
  },
  lastNotification: {
    borderBottomWidth: 0,
  },
  loaderContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    fontSize: 14,
    fontFamily: Fonts.medium,
    color: "#666",
    marginTop: 12,
  },
  errorTitle: {
    fontSize: 18,
    fontFamily: Fonts.bold,
    color: "#333",
    marginTop: 16,
    textAlign: "center",
  },
  errorMessage: {
    fontSize: 14,
    fontFamily: Fonts.regular,
    color: "#666",
    marginTop: 8,
    textAlign: "center",
    paddingHorizontal: 32,
  },
  retryButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FF6600",
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 24,
    marginTop: 20,
  },
  retryText: {
    fontSize: 14,
    fontFamily: Fonts.semiBold,
    color: "white",
    marginLeft: 8,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 32,
  },
  emptyTitle: {
    fontSize: 20,
    fontFamily: Fonts.bold,
    color: "#333",
    marginTop: 24,
    textAlign: "center",
  },
  emptyMessage: {
    fontSize: 14,
    fontFamily: Fonts.regular,
    color: "#666",
    marginTop: 12,
    textAlign: "center",
    lineHeight: 20,
  },
});
