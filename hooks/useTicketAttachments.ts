import { api } from "@/lib/api";
import { useCallback, useState } from "react";
import { Alert } from "react-native";
import { useAuth } from "./useAuth";

export interface TicketAttachment {
  attachment_id: number;
  ticket_activity_id: number;
  file_name: string;
  file_path: string;
  file_size: number;
  file_type: string;
  upload_time: string;
}

export interface AttachmentsResponse {
  success: boolean;
  message: string;
  data: TicketAttachment[];
}

export function useTicketAttachments() {
  const [attachments, setAttachments] = useState<TicketAttachment[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastFetch, setLastFetch] = useState<number>(0);
  const [isFetching, setIsFetching] = useState(false);
  const { isAuthenticated } = useAuth();

  const fetchAttachments = useCallback(
    async (ticketId: string | number, force = false) => {
      if (!isAuthenticated || !ticketId || String(ticketId).trim() === "") {
        
        setAttachments([]);
        return;
      }

      // Prevent concurrent requests
      if (isFetching) {
        
        return;
      }

      // Debounce: prevent multiple calls within 3 seconds
      const now = Date.now();
      if (!force && now - lastFetch < 3000) {
        
        return;
      }

      setIsFetching(true);
      setIsLoading(true);
      setError(null);
      setLastFetch(now);

      try {
        const response = await api<AttachmentsResponse>(
          `/v1/tickets/${ticketId}/attachments`
        );

        if (response.success) {
          setAttachments(response.data || []);
          setLastFetch(Date.now());
        } else {
          setAttachments([]);
          // Don't set error for access denied - it's expected for some tickets
          if (!response.message?.includes("Access denied")) {
            setError(response.message || "Failed to fetch attachments");
          }
        }
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "An error occurred";
        setAttachments([]);

        // Don't show error for 404, 403, or ticket not found - it's expected for some tickets
        if (
          !errorMessage.includes("404") &&
          !errorMessage.includes("403") &&
          !errorMessage.includes("Ticket not found") &&
          !errorMessage.includes("Access denied")
        ) {
          setError(errorMessage);
          console.error("Error fetching attachments:", err);
        }
      } finally {
        setIsLoading(false);
        setIsFetching(false);
      }
    },
    [isAuthenticated]
  );

  const deleteAttachment = useCallback(
    async (ticketId: string | number, attachmentId: number) => {
      if (!isAuthenticated) {
        Alert.alert("Error", "User not authenticated");
        return false;
      }

      try {
        await api(`/v1/tickets/${ticketId}/attachments/${attachmentId}`, {
          method: "DELETE",
        });

        // Remove from local state
        setAttachments((prev) =>
          prev.filter((att) => att.attachment_id !== attachmentId)
        );
        Alert.alert("Berhasil", "File berhasil dihapus");
        return true;
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Gagal menghapus file";
        Alert.alert("Error", errorMessage);
        console.error("Error deleting attachment:", err);
        return false;
      }
    },
    [isAuthenticated]
  );

  return {
    attachments,
    isLoading,
    error,
    fetchAttachments,
    deleteAttachment,
    refetch: (ticketId: string | number) => fetchAttachments(ticketId, true),
  };
}

