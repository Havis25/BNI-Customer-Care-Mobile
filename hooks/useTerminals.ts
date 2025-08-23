import { api } from "@/lib/api";
import { useCallback, useEffect, useState } from "react";

export type Terminal = {
  terminal_id: number;
  terminal_code: string;
  location: string;
  tickets_count: number;
  terminal_type: {
    terminal_type_id: number;
    terminal_type_code: string;
    terminal_type_name: string;
  };
  channel: {
    channel_id: number;
    channel_code: string;
    channel_name: string;
    supports_terminal: boolean;
  };
};

export type TerminalsResponse = {
  success: boolean;
  message: string;
  summary: {
    total_terminals: number;
    by_type: Array<{
      terminal_type_code: string;
      terminal_type_name: string;
      count: number;
    }>;
    by_channel: Array<{
      channel_code: string;
      channel_name: string;
      count: number;
    }>;
  };
  data: Terminal[];
};

export function useTerminals() {
  const [terminals, setTerminals] = useState<Terminal[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchTerminals = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      // Try both endpoints to see which one has terminal data
      let response;
      try {
        response = await api<TerminalsResponse>("/v1/terminals");
        console.log("Terminals API response from /v1/terminals:", response);
      } catch (terminalError) {
        console.log("Failed to fetch from /v1/terminals, trying /v1/channels");
        response = await api<TerminalsResponse>("/v1/channels");
        console.log("Terminals API response from /v1/channels:", response);
      }

      if (response && response.success && Array.isArray(response.data)) {
        console.log("Setting terminals:", response.data);
        setTerminals(response.data);
      } else {
        console.log("No terminals data found, using mock data for testing");
        // Mock data for testing when endpoint doesn't return proper terminal data
        const mockTerminals: Terminal[] = [
          {
            terminal_id: 1,
            terminal_code: "ATM001",
            location: "Jakarta Pusat",
            tickets_count: 35,
            terminal_type: {
              terminal_type_id: 1,
              terminal_type_code: "ATM",
              terminal_type_name: "ATM",
            },
            channel: {
              channel_id: 1,
              channel_code: "ATM",
              channel_name: "Automated Teller Machine",
              supports_terminal: true,
            },
          },
          {
            terminal_id: 2,
            terminal_code: "ATM002",
            location: "Bandung Dago",
            tickets_count: 5,
            terminal_type: {
              terminal_type_id: 1,
              terminal_type_code: "ATM",
              terminal_type_name: "ATM",
            },
            channel: {
              channel_id: 1,
              channel_code: "ATM",
              channel_name: "Automated Teller Machine",
              supports_terminal: true,
            },
          },
          {
            terminal_id: 3,
            terminal_code: "CRM101",
            location: "Surabaya Darmo",
            tickets_count: 0,
            terminal_type: {
              terminal_type_id: 2,
              terminal_type_code: "CRM",
              terminal_type_name: "CRM",
            },
            channel: {
              channel_id: 3,
              channel_code: "CRM",
              channel_name: "Cash Recycling Machine",
              supports_terminal: true,
            },
          },
        ];
        setTerminals(mockTerminals);
      }
    } catch (error: any) {
      console.log("Error fetching terminals:", error);
      setError(error?.message || "Failed to fetch terminals");
      setTerminals([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTerminals();
  }, [fetchTerminals]);

  return {
    terminals,
    isLoading,
    error,
    refetch: fetchTerminals,
  };
}
