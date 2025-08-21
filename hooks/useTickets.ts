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
  const [lastFetch, setLastFetch] = useState<number>(0);
  const [isFetching, setIsFetching] = useState(false);
  const { user, isAuthenticated } = useAuth();

  const fetchTickets = useCallback(async (force = false) => {
    if (!isAuthenticated) {
      setError("User not authenticated");
      return;
    }

    // Prevent concurrent requests
    if (isFetching) {
      return;
    }

    // Debounce: prevent multiple calls within 5 seconds
    const now = Date.now();
    if (!force && now - lastFetch < 5000) {
      return;
    }

    setIsFetching(true);
    setIsLoading(true);
    setError(null);
    setLastFetch(now);
    const startTime = Date.now();

    try {
      // Single request with reasonable limit instead of pagination loop
      const response = await api<TicketsResponse>(
        `${TICKETS_PATH}?limit=50&offset=0`
      );

      if (response.success && response.data) {
        setTickets(response.data);
        setLastFetch(Date.now());
      } else {
        setTickets([]);
      }
    } catch (error: any) {
      const errorMessage = error?.message || "Failed to fetch tickets";
      setError(errorMessage);
      setTickets([]);
    } finally {
      // Ensure minimum 1.5 seconds skeleton display
      const elapsed = Date.now() - startTime;
      const minDelay = 1500;
      
      if (elapsed < minDelay) {
        setTimeout(() => {
          setIsLoading(false);
          setIsFetching(false);
        }, minDelay - elapsed);
      } else {
        setIsLoading(false);
        setIsFetching(false);
      }
    }
  }, [isAuthenticated]);

  useEffect(() => {
    fetchTickets();
  }, [fetchTickets]);

  // Remove auto-refresh on focus and interval to prevent excessive requests

  return {
    tickets,
    isLoading,
    error,
    refetch: () => fetchTickets(true),
  };
}
