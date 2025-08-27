import { api } from "@/lib/api";
import { useCallback, useEffect, useState } from "react";
import { useAuth } from "./useAuth";

export type Channel = {
  channel_id: number;
  channel_name: string;
  channel_code: string;
};

export type ComplaintCategory = {
  complaint_id: number;
  complaint_name: string;
  complaint_code: string;
};

export type ChannelsResponse = {
  success: boolean;
  message: string;
  data: Channel[];
};

export type CategoriesResponse = {
  success: boolean;
  message: string;
  data: ComplaintCategory[];
};
// Mapping subcategories for each general category (mempertahankan subcategories yang ada)
const CATEGORY_SUBCATEGORY_MAPPING: Record<string, string[]> = {
  TOP_UP: [
    "TOP_UP_DANA",
    "TOP_UP_GOPAY",
    "TOP_UP_OVO",
    "TOP_UP_SHOPEE_PAY",
    "TOP_UP_LINKAJA",
    "TOP_UP_E_MONEY",
    "TOP_UP_PULSA",
    "TOP_UP_PULSA_VIA_ATM_BANK_LAIN",
    "TOP_UP_PRA_MIGRASI_DANA_GAGAL_TERKOREKSI",
  ],
  PEMBAYARAN: [
    "PEMBAYARAN_KARTU_KREDIT_BNI",
    "PEMBAYARAN_KARTU_KREDIT_BANK_LAIN",
    "PEMBAYARAN_PLN_VIA_ATM_BANK_LAIN",
    "PEMBAYARAN_SAMSAT",
    "PEMBAYARAN_TELKOM_TELKOMSEL_INDOSAT_PROVIDER_LAINNYA",
    "PEMBAYARAN_MPNG2",
    "PEMBAYARAN_MPNG3",
    "PEMBAYARAN_MPNG4",
  ],
  TRANSFER: [
    "TRANSFER_ANTAR_REKENING_BNI",
    "TRANSFER_ATM_ALTO_DANA_TDK_MASUK",
    "TRANSFER_ATM_BERSAMA_DANA_TDK_MASUK",
    "TRANSFER_ATM_LINK_DANA_TDK_MASUK",
    "TRANSFER_ATM_PRIMA_DANA_TDK_MASUK",
    "TRANSFER_ATM_ALTO_BILATERAL",
    "TRANSFER_ATM_BERSAMA_BILATERAL",
    "TRANSFER_ATM_PRIMA_BILATERAL",
    "TRANSFER_ATM_ALTO_LINK_BILATERAL",
  ],
  TARIK_TUNAI: [
    "TARIK_TUNAI_DI_MESIN_ATM_BNI",
    "TARIK_TUNAI_DI_ATM_LINK",
    "TARIK_TUNAI_DI_JARINGAN_ALTO",
    "TARIK_TUNAI_DI_JARINGAN_BERSAMA",
    "TARIK_TUNAI_DI_ATM_CIRRUS",
  ],
  SETOR_TUNAI: ["SETOR_TUNAI_DI_MESIN_ATM_CRM"],
  MOBILE_TUNAI: [
    "MOBILE_TUNAI",
    "MOBILE_TUNAI_ALFAMART",
    "MOBILE_TUNAI_ALFAMIDI",
    "MOBILE_TUNAI_INDOMARET",
  ],
  BI_FAST: [
    "BI_FAST_BILATERAL",
    "BI_FAST_DANA_TIDAK_MASUK",
    "BI_FAST_GAGAL_HAPUS_AKUN",
    "BI_FAST_GAGAL_MIGRASI_AKUN",
    "BI_FAST_GAGAL_SUSPEND_AKUN",
    "BI_FAST_GAGAL_UPDATE_AKUN",
  ],
  DISPUTE: [
    "2ND_CHARGEBACK",
    "2ND_CHARGEBACK_QRIS_DEBIT",
    "DISPUTE",
    "DISPUTE_QRIS_KARTU_DEBIT",
    "DISPUTE_KARTU_DEBIT_BNI",
    "DISPUTE_KARTU_KREDIT_BNI",
  ],
  LAINNYA: ["PERMINTAAN_CCTV_ATM_BNI"],
};
// Mapping category codes untuk setiap channel berdasarkan API data
const CHANNEL_CATEGORY_MAPPING: Record<string, string[]> = {
  ATM: [
    "PEMBAYARAN_KARTU_KREDIT_BNI",
    "PEMBAYARAN_KARTU_KREDIT_BANK_LAIN",
    "PEMBAYARAN_PLN_VIA_ATM_BANK_LAIN",
    "PEMBAYARAN_SAMSAT",
    "PEMBAYARAN_TELKOM_TELKOMSEL_INDOSAT_PROVIDER_LAINNYA",
    "TOP_UP_DANA",
    "TOP_UP_GOPAY",
    "TOP_UP_OVO",
    "TOP_UP_PULSA",
    "TOP_UP_PULSA_VIA_ATM_BANK_LAIN",
    "TOP_UP_SHOPEE_PAY",
    "TOP_UP_LINKAJA",
    "TOP_UP_E_MONEY",
    "TRANSFER_ATM_ALTO_DANA_TDK_MASUK",
    "TRANSFER_ATM_BERSAMA_DANA_TDK_MASUK",
    "TRANSFER_ATM_LINK_DANA_TDK_MASUK",
    "TRANSFER_ATM_PRIMA_DANA_TDK_MASUK",
    "TRANSFER_ATM_ALTO_BILATERAL",
    "TRANSFER_ATM_BERSAMA_BILATERAL",
    "TRANSFER_ATM_PRIMA_BILATERAL",
    "TARIK_TUNAI_DI_MESIN_ATM_BNI",
    "TARIK_TUNAI_DI_ATM_LINK",
    "TARIK_TUNAI_DI_JARINGAN_ALTO",
    "TARIK_TUNAI_DI_JARINGAN_BERSAMA",
    "TARIK_TUNAI_DI_ATM_CIRRUS",
    "PEMBAYARAN_MPNG2",
    "PERMINTAAN_CCTV_ATM_BNI",
  ],
  TAPCASH: ["TOP_UP_PRA_MIGRASI_DANA_GAGAL_TERKOREKSI"],
  CRM: ["SETOR_TUNAI_DI_MESIN_ATM_CRM"],
  DISPUTE_DEBIT: ["2ND_CHARGEBACK", "DISPUTE", "DISPUTE_KARTU_DEBIT_BNI"],
  IBANK: [
    "PEMBAYARAN_KARTU_KREDIT_BNI",
    "PEMBAYARAN_KARTU_KREDIT_BANK_LAIN",
    "PEMBAYARAN_SAMSAT",
    "PEMBAYARAN_TELKOM_TELKOMSEL_INDOSAT_PROVIDER_LAINNYA",
    "PEMBAYARAN_MPNG3",
    "TOP_UP_DANA",
    "TOP_UP_GOPAY",
    "TOP_UP_OVO",
    "TOP_UP_PULSA",
    "TOP_UP_SHOPEE_PAY",
    "TOP_UP_LINKAJA",
    "TOP_UP_E_MONEY",
    "TRANSFER_ANTAR_REKENING_BNI",
    "TRANSFER_ATM_ALTO_DANA_TDK_MASUK",
    "TRANSFER_ATM_BERSAMA_DANA_TDK_MASUK",
    "TRANSFER_ATM_LINK_DANA_TDK_MASUK",
    "TRANSFER_ATM_PRIMA_DANA_TDK_MASUK",
    "TRANSFER_ATM_ALTO_BILATERAL",
    "TRANSFER_ATM_BERSAMA_BILATERAL",
    "TRANSFER_ATM_ALTO_LINK_BILATERAL",
    "TRANSFER_ATM_PRIMA_BILATERAL",
  ],
  MBANK: [
    "BI_FAST_BILATERAL",
    "BI_FAST_DANA_TIDAK_MASUK",
    "BI_FAST_GAGAL_HAPUS_AKUN",
    "BI_FAST_GAGAL_MIGRASI_AKUN",
    "BI_FAST_GAGAL_SUSPEND_AKUN",
    "BI_FAST_GAGAL_UPDATE_AKUN",
    "PEMBAYARAN_KARTU_KREDIT_BNI",
    "PEMBAYARAN_KARTU_KREDIT_BANK_LAIN",
    "PEMBAYARAN_SAMSAT",
    "PEMBAYARAN_TELKOM_TELKOMSEL_INDOSAT_PROVIDER_LAINNYA",
    "PEMBAYARAN_MPNG4",
    "TOP_UP_DANA",
    "TOP_UP_GOPAY",
    "TOP_UP_OVO",
    "TOP_UP_PULSA",
    "TOP_UP_SHOPEE_PAY",
    "TOP_UP_LINKAJA",
    "TOP_UP_E_MONEY",
    "TRANSFER_ANTAR_REKENING_BNI",
    "TRANSFER_ATM_ALTO_DANA_TDK_MASUK",
    "TRANSFER_ATM_BERSAMA_DANA_TDK_MASUK",
    "TRANSFER_ATM_LINK_DANA_TDK_MASUK",
    "TRANSFER_ATM_PRIMA_DANA_TDK_MASUK",
    "TRANSFER_ATM_ALTO_BILATERAL",
    "TRANSFER_ATM_BERSAMA_BILATERAL",
    "TRANSFER_ATM_ALTO_LINK_BILATERAL",
    "TRANSFER_ATM_PRIMA_BILATERAL",
    "MOBILE_TUNAI",
    "MOBILE_TUNAI_ALFAMIDI",
    "MOBILE_TUNAI_INDOMARET",
    "MOBILE_TUNAI_ALFAMART",
  ],
  MTUNAI: [
    "MOBILE_TUNAI",
    "MOBILE_TUNAI_ALFAMIDI",
    "MOBILE_TUNAI_INDOMARET",
    "MOBILE_TUNAI_ALFAMART",
  ],
  MTUNAI_ALFAMART: ["MOBILE_TUNAI_ALFAMART"],
  QRIS_DEBIT: ["DISPUTE_QRIS_KARTU_DEBIT", "2ND_CHARGEBACK_QRIS_DEBIT"],
};

export function useChannelsAndCategories() {
  const [channels, setChannels] = useState<Channel[]>([]);
  const [categories, setCategories] = useState<ComplaintCategory[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { isAuthenticated } = useAuth();

  // Function to filter categories based on selected channel
  const getFilteredCategories = useCallback(
    (selectedChannel: Channel | null) => {
      if (!selectedChannel || !categories.length) return categories;

      const allowedCodes =
        CHANNEL_CATEGORY_MAPPING[selectedChannel.channel_code];
      if (!allowedCodes) return categories; // If no mapping, show all

      return categories.filter((category) =>
        allowedCodes.includes(category.complaint_code)
      );
    },
    [categories]
  );

  // Function to get subcategories for a general category code
  const getSubcategories = useCallback((categoryCode: string) => {
    return CATEGORY_SUBCATEGORY_MAPPING[categoryCode] || [];
  }, []);

  const fetchData = useCallback(async () => {
    if (!isAuthenticated) {
      console.log(
        "🔍 useChannelsAndCategories: User not authenticated, skipping fetch"
      );
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      console.log("=== FETCHING CHANNELS AND CATEGORIES ===");
      console.log("🔍 Debug: About to call API endpoints");

      const [channelsResponse, categoriesResponse] = await Promise.all([
        api<Channel[]>("/v1/channels"),
        api<ComplaintCategory[]>("/v1/complaint-categories"),
      ]);

      console.log("Channels Response:", channelsResponse);
      console.log("Categories Response:", categoriesResponse);

      // Handle channels response - check if it's wrapped in a data property
      if (channelsResponse && typeof channelsResponse === "object") {
        if (Array.isArray(channelsResponse)) {
          console.log("Channels is direct array:", channelsResponse.length);
          setChannels(channelsResponse);
        } else if (
          (channelsResponse as any).data &&
          Array.isArray((channelsResponse as any).data)
        ) {
          console.log(
            "Channels in data property:",
            (channelsResponse as any).data.length
          );
          setChannels((channelsResponse as any).data);
        } else {
          console.log(
            "Unexpected channels response structure:",
            channelsResponse
          );
        }
      }

      // Handle categories response - check if it's wrapped in a data property
      if (categoriesResponse && typeof categoriesResponse === "object") {
        if (Array.isArray(categoriesResponse)) {
          console.log("Categories is direct array:", categoriesResponse.length);
          setCategories(categoriesResponse);
        } else if (
          (categoriesResponse as any).data &&
          Array.isArray((categoriesResponse as any).data)
        ) {
          console.log(
            "Categories in data property:",
            (categoriesResponse as any).data.length
          );
          setCategories((categoriesResponse as any).data);
        } else {
          console.log(
            "Unexpected categories response structure:",
            categoriesResponse
          );
        }
      }
    } catch (error: any) {
      console.error("Error fetching channels and categories:", error);
      setError(error?.message || "Failed to fetch data");
    } finally {
      setIsLoading(false);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return {
    channels,
    categories,
    getFilteredCategories,
    getSubcategories,
    isLoading,
    error,
    refetch: fetchData,
  };
}
