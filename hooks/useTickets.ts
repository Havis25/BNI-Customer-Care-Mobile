import AsyncStorage from "@react-native-async-storage/async-storage";
import { useCallback, useEffect, useState } from "react";
import { api } from "@/lib/api";

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

const TICKETS_PATH = "/v1/ticket";

export function useTickets() {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchTickets = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const token = await AsyncStorage.getItem("access_token");
      
      if (!token) {
        throw new Error("No access token found");
      }

      const response = await api<TicketsResponse>(TICKETS_PATH, {
        method: "GET",
        headers: {
          Authorization: token,
        },
      });

      if (!response?.success || !response?.data) {
        throw new Error(response?.message || "Failed to fetch tickets");
      }

      setTickets(response.data);
    } catch (error: any) {
      const errorMessage = error?.message || "Failed to fetch tickets";
      setError(errorMessage);
      console.error("Error fetching tickets:", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

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