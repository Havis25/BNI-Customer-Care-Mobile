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
    if (!isAuthenticated || !user) {
      setError("User not authenticated");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // Gunakan data tickets dari user (sudah ada dari /v1/auth/me)
      if (user.tickets && user.tickets.length > 0) {
        // Transform data dari useAuth ke format yang diharapkan useTickets
        const transformedTickets = user.tickets.map((ticket: any) => {
          // Mapping status dari API ke status Indonesia
          const getStatusCode = (status: string) => {
            switch (status?.toLowerCase()) {
              case "accepted": return "ACC";
              case "verification": return "VERIF";
              case "processing": return "PROCESS";
              case "closed": return "CLOSED";
              case "declined": return "DECLINED";
              default: return "UNKNOWN";
            }
          };

          return {
            ticket_number: ticket.ticket_number,
            description: ticket.complaint || "No description",
            transaction_date: ticket.created_time,
            amount: 0,
            created_time: ticket.created_time,
            closed_time: null,
            customer_status: {
              customer_status_code: getStatusCode(ticket.customer_status),
              customer_status_name: ticket.customer_status || "Unknown",
              customer_status_id: 1
            },
            issue_channel: {
              channel_name: ticket.issue_channel || "Unknown Channel",
              channel_code: ticket.issue_channel?.toUpperCase() || "UNKNOWN",
              channel_id: 1
            },
            customer: {
              customer_id: user.id || 0,
              full_name: user.full_name || "",
              email: user.email || ""
            },
            related_account: ticket.related_account || { account_id: 0, account_number: 0 },
            related_card: ticket.related_card || { card_id: 0, card_number: 0, card_type: "" },
            complaint: {
              complaint_id: 1,
              complaint_name: ticket.complaint || "Unknown",
              complaint_code: "UNKNOWN"
            }
          };
        });
        
        setTickets(transformedTickets);
      } else {
        setTickets([]);
      }
    } catch (error: any) {
      const errorMessage = error?.message || "Failed to process tickets";
      setError(errorMessage);
      console.error("Error processing tickets:", error);
    } finally {
      setIsLoading(false);
    }
  }, [user, isAuthenticated]);

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
