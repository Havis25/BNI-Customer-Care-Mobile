import { useAuth } from "@/hooks/useAuth";
import { api } from "@/lib/api";
import { useCallback, useState } from "react";

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

    // FAQ should be accessible to all users, remove authentication check
    // if (!isAuthenticated) {
    //   
    //   setError("User not authenticated");
    //   return;
    // }

    setIsLoading(true);
    setError(null);

    try {
      
      const response = await api<FAQ[]>("/v1/faqs?limit=25");

      // Handle FAQ response - check if it's wrapped in a data property
      if (response && typeof response === "object") {
        let faqData: FAQ[] = [];

        if (Array.isArray(response)) {
          
          faqData = response.map((item) => ({
            faq_id: item.faq_id,
            question: item.question,
            answer: item.answer,
          }));
        } else if (
          (response as any).data &&
          Array.isArray((response as any).data)
        ) {
          
          faqData = (response as any).data.map((item: FAQ) => ({
            faq_id: item.faq_id,
            question: item.question,
            answer: item.answer,
          }));
        } else if ((response as any).success && (response as any).data) {
          
          faqData = (response as any).data.map((item: FAQ) => ({
            faq_id: item.faq_id,
            question: item.question,
            answer: item.answer,
          }));
        } else {

          // Mock data for testing when endpoint doesn't return proper FAQ data
          const mockFaqData: FAQ[] = [
            {
              faq_id: 1,
              question: "Bagaimana cara melakukan transfer melalui ATM BNI?",
              answer:
                "Untuk melakukan transfer melalui ATM BNI: 1. Masukkan kartu ATM dan PIN, 2. Pilih menu Transfer, 3. Pilih jenis transfer (antar rekening BNI, ke bank lain, dll), 4. Masukkan nomor rekening tujuan, 5. Masukkan jumlah yang akan ditransfer, 6. Konfirmasi transaksi, 7. Simpan struk sebagai bukti.",
            },
            {
              faq_id: 2,
              question: "Apa yang harus dilakukan jika kartu ATM tertelan?",
              answer:
                "Jika kartu ATM tertelan: 1. Jangan tinggalkan mesin ATM, 2. Hubungi customer service BNI di 1500046, 3. Laporkan kejadian dengan detail lokasi ATM, 4. Bawa identitas diri saat pengambilan kartu, 5. Kartu dapat diambil pada hari kerja berikutnya di kantor cabang terdekat.",
            },
            {
              faq_id: 3,
              question: "Bagaimana cara mengaktifkan mobile banking BNI?",
              answer:
                "Untuk mengaktifkan BNI Mobile Banking: 1. Download aplikasi BNI Mobile Banking, 2. Pilih 'Aktivasi', 3. Masukkan nomor kartu ATM/Debit dan PIN ATM, 4. Buat User ID dan Password baru, 5. Verifikasi dengan SMS OTP, 6. Mobile Banking siap digunakan.",
            },
            {
              faq_id: 4,
              question: "Berapa limit transfer harian melalui mobile banking?",
              answer:
                "Limit transfer harian BNI Mobile Banking: - Transfer antar rekening BNI: Rp 100.000.000, - Transfer ke bank lain (online): Rp 25.000.000, - Transfer ke bank lain (SKN): Rp 500.000.000, - Limit dapat disesuaikan sesuai kebutuhan melalui fitur pengaturan limit.",
            },
            {
              faq_id: 5,
              question:
                "Bagaimana cara mengatasi lupa password mobile banking?",
              answer:
                "Jika lupa password mobile banking: 1. Buka aplikasi BNI Mobile Banking, 2. Pilih 'Lupa Password', 3. Masukkan User ID, 4. Verifikasi dengan PIN ATM, 5. Buat password baru, 6. Konfirmasi dengan SMS OTP yang diterima.",
            },
          ];
          setFaqs(mockFaqData);
          return;
        }

        setFaqs(faqData);
      } else {
        
        setFaqs([]);
      }
    } catch (err) {
      console.error("Error fetching FAQs:", err);
      const errorMessage =
        err instanceof Error ? err.message : "Gagal memuat FAQ";
      setError(errorMessage);

      // Fallback to mock data when API fails
      
      const mockFaqData: FAQ[] = [
        {
          faq_id: 1,
          question: "Bagaimana cara melakukan transfer melalui ATM BNI?",
          answer:
            "Untuk melakukan transfer melalui ATM BNI: 1. Masukkan kartu ATM dan PIN, 2. Pilih menu Transfer, 3. Pilih jenis transfer (antar rekening BNI, ke bank lain, dll), 4. Masukkan nomor rekening tujuan, 5. Masukkan jumlah yang akan ditransfer, 6. Konfirmasi transaksi, 7. Simpan struk sebagai bukti.",
        },
        {
          faq_id: 2,
          question: "Apa yang harus dilakukan jika kartu ATM tertelan?",
          answer:
            "Jika kartu ATM tertelan: 1. Jangan tinggalkan mesin ATM, 2. Hubungi customer service BNI di 1500046, 3. Laporkan kejadian dengan detail lokasi ATM, 4. Bawa identitas diri saat pengambilan kartu, 5. Kartu dapat diambil pada hari kerja berikutnya di kantor cabang terdekat.",
        },
        {
          faq_id: 3,
          question: "Bagaimana cara mengaktifkan mobile banking BNI?",
          answer:
            "Untuk mengaktifkan BNI Mobile Banking: 1. Download aplikasi BNI Mobile Banking, 2. Pilih 'Aktivasi', 3. Masukkan nomor kartu ATM/Debit dan PIN ATM, 4. Buat User ID dan Password baru, 5. Verifikasi dengan SMS OTP, 6. Mobile Banking siap digunakan.",
        },
        {
          faq_id: 4,
          question: "Berapa limit transfer harian melalui mobile banking?",
          answer:
            "Limit transfer harian BNI Mobile Banking: - Transfer antar rekening BNI: Rp 100.000.000, - Transfer ke bank lain (online): Rp 25.000.000, - Transfer ke bank lain (SKN): Rp 500.000.000, - Limit dapat disesuaikan sesuai kebutuhan melalui fitur pengaturan limit.",
        },
        {
          faq_id: 5,
          question: "Bagaimana cara mengatasi lupa password mobile banking?",
          answer:
            "Jika lupa password mobile banking: 1. Buka aplikasi BNI Mobile Banking, 2. Pilih 'Lupa Password', 3. Masukkan User ID, 4. Verifikasi dengan PIN ATM, 5. Buat password baru, 6. Konfirmasi dengan SMS OTP yang diterima.",
        },
      ];
      setFaqs(mockFaqData);
    } finally {
      setIsLoading(false);
    }
  }, []); // Remove isAuthenticated dependency since FAQ should be accessible to all

  return {
    faqs,
    isLoading,
    error,
    fetchFaqs,
    refetch: fetchFaqs,
  };
}

