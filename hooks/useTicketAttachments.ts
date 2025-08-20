import { useState, useCallback } from 'react';
import { api } from '@/lib/api';
import { useAuth } from './useAuth';
import { Alert } from 'react-native';

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
  const { isAuthenticated } = useAuth();

  const fetchAttachments = useCallback(async (ticketId: string | number) => {
    if (!isAuthenticated || !ticketId) {
      setAttachments([]);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await api<AttachmentsResponse>(`/v1/tickets/${ticketId}/attachments`);
      
      if (response.success) {
        setAttachments(response.data || []);
      } else {
        setAttachments([]);
        setError(response.message || 'Failed to fetch attachments');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An error occurred';
      setAttachments([]);
      
      // Don't show error for 404 ticket not found - it's expected for new tickets
      if (!errorMessage.includes('404') && !errorMessage.includes('Ticket not found')) {
        setError(errorMessage);
        console.error('Error fetching attachments:', err);
      }
    } finally {
      setIsLoading(false);
    }
  }, [isAuthenticated]);

  const deleteAttachment = useCallback(async (ticketId: string | number, attachmentId: number) => {
    if (!isAuthenticated) {
      Alert.alert('Error', 'User not authenticated');
      return false;
    }

    try {
      await api(`/v1/tickets/${ticketId}/attachments/${attachmentId}`, {
        method: 'DELETE',
      });

      // Remove from local state
      setAttachments(prev => prev.filter(att => att.attachment_id !== attachmentId));
      Alert.alert('Berhasil', 'File berhasil dihapus');
      return true;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Gagal menghapus file';
      Alert.alert('Error', errorMessage);
      console.error('Error deleting attachment:', err);
      return false;
    }
  }, [isAuthenticated]);

  return {
    attachments,
    isLoading,
    error,
    fetchAttachments,
    deleteAttachment,
    refetch: (ticketId: string | number) => fetchAttachments(ticketId),
  };
}