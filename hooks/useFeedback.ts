import { useState } from "react";
import { api } from "@/lib/api";
import { useTokenManager } from "./useTokenManager";

type FeedbackData = {
  score: number;
  comment?: string;
};

type FeedbackResponse = {
  success: boolean;
  message: string;
};

export function useFeedback() {
  const [isLoading, setIsLoading] = useState(false);
  const { getValidToken } = useTokenManager();

  const submitFeedback = async (
    ticketId: string,
    feedbackData: FeedbackData
  ): Promise<boolean> => {
    setIsLoading(true);

    try {
      const token = await getValidToken();

      if (!token) {
        throw new Error("No access token found");
      }

      const response = await api<FeedbackResponse>(
        `/v1/tickets/${ticketId}/feedback`,
        {
          method: "POST",
          headers: {
            Authorization: token.startsWith('Bearer ') ? token : `Bearer ${token}`,
          },
          body: JSON.stringify({
            score: feedbackData.score,
            comment: feedbackData.comment || "",
          }),
        }
      );

      return response.success;
    } catch (error) {
      console.error("Error submitting feedback:", error);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    submitFeedback,
    isLoading,
  };
}

