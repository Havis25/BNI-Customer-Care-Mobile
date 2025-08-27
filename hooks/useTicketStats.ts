import { api } from "@/lib/api";
import { useCallback, useEffect, useState } from "react";
import { useAuth } from "./useAuth";

export type TicketStats = {
  total: number;
  completed: number;
};

export function useTicketStats() {
  const [stats, setStats] = useState<TicketStats>({ total: 0, completed: 0 });
  const [isLoading, setIsLoading] = useState(false);
  const { isAuthenticated } = useAuth();

  const fetchStats = useCallback(async () => {
    if (!isAuthenticated) return;

    setIsLoading(true);
    try {
      const response = await api(`/v1/tickets?limit=50&offset=0`);
      
      if (response.success) {
        const total = response.pagination?.total || 0;
        const completed = response.data?.filter(
          (t: any) => t.customer_status?.customer_status_code?.toUpperCase() === "CLOSED"
        ).length || 0;

        setStats({ total, completed });
      }
    } catch (error) {
      console.error("Error fetching ticket stats:", error);
      setStats({ total: 0, completed: 0 });
    } finally {
      setIsLoading(false);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  return {
    stats,
    isLoading,
    refetch: fetchStats,
  };
}
