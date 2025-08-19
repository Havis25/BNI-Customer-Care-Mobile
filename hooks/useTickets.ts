import { useCallback, useEffect, useState } from "react";
import { api } from "@/lib/api";
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
      // Fetch fresh data dari API
      const response = await api<TicketsResponse>(TICKETS_PATH);
      
      if (response.success && response.data) {
        setTickets(response.data);
      } else {
        setTickets([]);
      }
    } catch (error: any) {
      const errorMessage = error?.message || "Failed to fetch tickets";
      setError(errorMessage);
      console.error("Error fetching tickets:", error);
      setTickets([]);
    } finally {
      setIsLoading(false);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    fetchTickets();
  }, [fetchTickets]);



  return {
    tickets,
    isLoading,
    error,
    refetch: fetchTickets,
  };
}
