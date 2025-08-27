import { useAuth } from "@/hooks/useAuth";
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
  const { isAuthenticated } = useAuth();

  const fetchTerminals = useCallback(async () => {
    console.log("=== TERMINALS FETCH START ===");
    console.log("isAuthenticated:", isAuthenticated);

    // Terminals might require authentication, check if user is authenticated
    if (!isAuthenticated) {
      console.log("User not authenticated, using mock terminals data");
      // Use mock data when not authenticated
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
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      console.log("=== FETCHING TERMINALS ===");
      const response = await api<Terminal[]>("/v1/terminals");
      console.log("Terminals Response:", response);

      // Handle terminals response - check if it's wrapped in a data property
      if (response && typeof response === "object") {
        if (Array.isArray(response)) {
          console.log("Terminals is direct array:", response.length);
          setTerminals(response);
        } else if (
          (response as any).data &&
          Array.isArray((response as any).data)
        ) {
          console.log(
            "Terminals in data property:",
            (response as any).data.length
          );
          setTerminals((response as any).data);
        } else if ((response as any).success && (response as any).data) {
          console.log(
            "Terminals in success response:",
            (response as any).data.length
          );
          setTerminals((response as any).data);
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
      }
    } catch (error: any) {
      console.error("Error fetching terminals:", error);
      setError(error?.message || "Failed to fetch terminals");

      // Fallback to mock data when API fails
      console.log("Using mock terminals due to API error");
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
    } finally {
      setIsLoading(false);
    }
  }, [isAuthenticated]);

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
