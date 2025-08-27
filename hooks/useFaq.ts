import { useState, useCallback } from "react";
import { api } from "@/lib/api";
import { useAuth } from "@/hooks/useAuth";

type FAQ = {
  faq_id: number;
  question: string;
  answer: string;
};

type FAQResponse = {
  success: boolean;
  message: string;
  data: FAQ[];
};

export function useFaq() {
  const [faqs, setFaqs] = useState<FAQ[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { isAuthenticated } = useAuth();

  const fetchFaqs = useCallback(async () => {
    if (!isAuthenticated) {
      setError('User not authenticated');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const [response] = await Promise.all([
        api<FAQ[]>("/v1/faqs"),
        new Promise(resolve => setTimeout(resolve, 1500))
      ]);
      
      if (response && Array.isArray(response)) {
        const faqData = response.map((item) => ({
          faq_id: item.faq_id,
          question: item.question,
          answer: item.answer,
        }));
        setFaqs(faqData);
      } else {
        setFaqs([]);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Gagal memuat FAQ';
      setError(errorMessage);
      setFaqs([]);
    } finally {
      setIsLoading(false);
    }
  }, [isAuthenticated]);

  return {
    faqs,
    isLoading,
    error,
    fetchFaqs,
    refetch: fetchFaqs,
  };
}