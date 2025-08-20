import { api } from "@/lib/api";
import { useFocusEffect } from "@react-navigation/native";
import { useCallback, useEffect, useState } from "react";
import { useAuth } from "./useAuth";

export type CustomerStatus = {
  customer_status_id: number;
  customer_status_name: string;
  customer_status_code: string;
};

export type IssueChannel = {
  channel_id: number;
  channel_name: string;
  channel_code: string;
};

export type Customer = {
  customer_id: number;
  full_name: string;
  email: string;
};

export type RelatedAccount = {
  account_id: number;
  account_number: number;
};

export type RelatedCard = {
  card_id: number;
  card_number: number;
  card_type: string;
};

export type Complaint = {
  complaint_id: number;
  complaint_name: string;
  complaint_code: string;
};

export type Ticket = {
  ticket_id?: number;
  ticket_number: string;
  description: string;
  transaction_date: string;
  amount: number;
  created_time: string;
  closed_time: string | null;
  customer_status: CustomerStatus;
  issue_channel: IssueChannel;
  customer: Customer;
  related_account: RelatedAccount;
  related_card: RelatedCard;
  complaint: Complaint;
};

export type TicketsResponse = {
  success: boolean;
  message: string;
  data: Ticket[];
  pagination: {
    total: number;
    limit: number;
    offset: number;
    pages: number;
  };
};

const TICKETS_PATH = "/v1/tickets";

export function useTickets() {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { user, isAuthenticated } = useAuth();

  const fetchTickets = useCallback(async () => {
    if (!isAuthenticated) {
      setError("User not authenticated");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      let allTickets: Ticket[] = [];
      let offset = 0;
      const limit = 10; // Default limit from API
      let hasMore = true;

      // Fetch all pages
      while (hasMore) {
        const cacheBuster = `?_t=${Date.now()}`;
        const queryParams = `limit=${limit}&offset=${offset}`;
        const response = await api<TicketsResponse>(
          `${TICKETS_PATH}${cacheBuster}&${queryParams}`
        );

        if (response.success && response.data) {
          allTickets = [...allTickets, ...response.data];
          
          // Check if there are more pages
          const totalFetched = offset + response.data.length;
          hasMore = totalFetched < response.pagination.total;
          offset += limit;
        } else {
          hasMore = false;
        }
      }

      setTickets(allTickets);
    } catch (error: any) {
      const errorMessage = error?.message || "Failed to fetch tickets";
      setError(errorMessage);
      setTickets([]);
    } finally {
      setIsLoading(false);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    fetchTickets();
  }, [fetchTickets]);

  // Auto-refresh when screen comes into focus
  useFocusEffect(
    useCallback(() => {
      fetchTickets();
    }, [fetchTickets])
  );

  // Auto-refresh every 30 seconds when authenticated
  useEffect(() => {
    if (!isAuthenticated) return;

    const interval = setInterval(() => {
      fetchTickets();
    }, 30000); // 30 seconds

    return () => clearInterval(interval);
  }, [isAuthenticated, fetchTickets]);

  return {
    tickets,
    isLoading,
    error,
    refetch: fetchTickets,
  };
}
