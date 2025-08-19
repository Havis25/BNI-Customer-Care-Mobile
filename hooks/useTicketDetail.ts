import { useState, useCallback } from 'react';
import { api } from '@/lib/api';
import { useAuth } from './useAuth';

export interface TicketDetail {
  ticket_id?: number;
  ticket_number: string;
  description: string;
  transaction_date: string;
  amount: number;
  created_time: string;
  closed_time: string | null;
  customer: {
    customer_id: number;
    full_name: string;
    email: string;
    phone_number: number;
  };
  customer_status: {
    customer_status_id: number;
    customer_status_name: string;
    customer_status_code: string;
  };
  issue_channel: {
    channel_id: number;
    channel_name: string;
    channel_code: string;
  };
  complaint: {
    complaint_id: number;
    complaint_name: string;
    complaint_code: string;
  };
  related_account: {
    account_id: number;
    account_number: number;
  };
  related_card: {
    card_id: number;
    card_number: number;
    card_type: string;
  };
  activities: Array<{
    ticket_activity_id: number;
    activity_type: {
      ticket_activity_type_id: number;
      ticket_activity_code: string;
      ticket_activity_name: string;
    };
    sender_type: {
      sender_type_id: number;
      sender_type_code: string;
      sender_type_name: string;
    };
    sender_id: number;
    content: string;
    ticket_activity_time: string;
  }>;
  attachments: Array<{
    attachment_id: number;
    ticket_activity_id: number;
    file_name: string;
    file_path: string;
    file_size: number;
    file_type: string;
    upload_time: string;
  }>;
  status_history: {
    customer_status_history: Array<{
      status_code: string;
      status_name: string;
      changed_by: string;
      changed_at: string;
      activity_id: number;
      is_initial?: boolean;
    }>;
    employee_status_history: Array<{
      status_code: string;
      status_name: string;
      changed_by: string;
      changed_at: string;
      activity_id: number;
      is_initial?: boolean;
    }>;
  };
  feedback?: {
    feedback_id: number;
    comment: string;
  };
}

export interface TicketDetailResponse {
  success: boolean;
  message: string;
  data: TicketDetail;
}

export function useTicketDetail() {
  const [ticketDetail, setTicketDetail] = useState<TicketDetail | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { isAuthenticated, token, getValidToken } = useAuth();



  const fetchTicketDetail = useCallback(async (ticketId: string | number) => {
    if (!isAuthenticated) {
      setError('User not authenticated');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await api<TicketDetailResponse>(`/v1/tickets/${ticketId}`);
      
      if (response.success) {
        setTicketDetail(response.data);
      } else {
        setError(response.message || 'Failed to fetch ticket detail');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An error occurred';
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, [isAuthenticated]);

  const buildProgressData = useCallback(() => {
    if (!ticketDetail) return [];

    const statusHistory = ticketDetail.status_history.customer_status_history;
    const currentStatus = ticketDetail.customer_status.customer_status_code;
    const progressSteps = [
      { key: 'ACC', label: 'Diterima', description: 'Laporan telah diterima dan akan segera ditindaklanjuti' },
      { key: 'VERIF', label: 'Verifikasi', description: 'Laporan sedang diverifikasi oleh tim kami' },
      { key: 'PROCESS', label: 'Diproses', description: 'Laporan sedang dalam proses penanganan' },
      { key: 'CLOSED', label: currentStatus === 'DECLINED' ? 'Ditolak' : 'Selesai', description: currentStatus === 'DECLINED' ? 'Laporan ditolak karena tidak sesuai ketentuan' : 'Laporan telah selesai ditangani' }
    ];

    // Define status order for progression
    const statusOrder = ['ACC', 'VERIF', 'PROCESS', 'CLOSED', 'DECLINED'];
    const currentStatusIndex = statusOrder.indexOf(currentStatus);

    return progressSteps.map((step, index) => {
      let completed = false;
      let tanggal = '';
      let penjelasan = '';

      // Determine if this step is completed based on current status
      if (currentStatus === 'DECLINED') {
        // For declined status, show all steps as completed up to the final step
        completed = index <= 3;
        if (index === 3) {
          // Last step shows as "Ditolak"
          tanggal = formatDateTime(ticketDetail.created_time); // Use created time as fallback
          penjelasan = step.description;
        } else if (index === 0) {
          tanggal = formatDateTime(ticketDetail.created_time);
          penjelasan = step.description;
        } else {
          penjelasan = step.description;
        }
      } else {
        // Normal flow
        if (index === 0) {
          // First step is always completed
          completed = true;
          tanggal = formatDateTime(ticketDetail.created_time);
          penjelasan = step.description;
        } else {
          // Check if current status has reached this step
          const stepStatusIndex = statusOrder.indexOf(step.key);
          completed = currentStatusIndex >= stepStatusIndex;
          
          if (completed) {
            // Find the actual date from status history
            const historyItem = statusHistory.find(h => h.status_code === step.key);
            if (historyItem) {
              tanggal = formatDateTime(historyItem.changed_at);
            }
            penjelasan = step.description;
          }
        }
      }

      return {
        status: step.label,
        tanggal,
        penjelasan,
        completed
      };
    });
  }, [ticketDetail]);

  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('id-ID', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return {
    ticketDetail,
    isLoading,
    error,
    fetchTicketDetail,
    progressData: buildProgressData(),
    refetch: () => ticketDetail && fetchTicketDetail(ticketDetail.ticket_number),
  };
}