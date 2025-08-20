import { api } from "@/lib/api";
import { useCallback, useEffect, useState } from "react";

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

// Mapping category codes untuk setiap channel
const CHANNEL_CATEGORY_MAPPING: Record<string, string[]> = {
  ATM: [
    'PEMBAYARAN_KARTU_KREDIT_BNI',
    'PEMBAYARAN_KARTU_KREDIT_BANK_LAIN', 
    'PEMBAYARAN_PLN_VIA_ATM_BANK_LAIN',
    'PEMBAYARAN_SAMSAT',
    'PEMBAYARAN_TELKOM_TELKOMSEL_INDOSAT_PROVIDER_LAINNYA',
    'TOP_UP_DANA',
    'TOP_UP_GOPAY',
    'TOP_UP_OVO',
    'TOP_UP_PULSA',
    'TOP_UP_PULSA_VIA_ATM_BANK_LAIN',
    'TOP_UP_SHOPEE_PAY',
    'TOP_UP_LINKAJA',
    'TRANSFER_ATM_ALTO_DANA_TDK_MASUK',
    'TRANSFER_ATM_BERSAMA_DANA_TDK_MASUK',
    'TRANSFER_ATM_LINK_DANA_TDK_MASUK',
    'TRANSFER_ATM_PRIMA_DANA_TDK_MASUK',
    'TOP_UP_E_MONEY',
    'TARIK_TUNAI_DI_MESIN_ATM_BNI',
    'TRANSFER_ATM_ALTO_BILATERAL',
    'TRANSFER_ATM_PRIMA_BILATERAL',
    'TARIK_TUNAI_DI_ATM_LINK',
    'TARIK_TUNAI_DI_JARINGAN_ALTO',
    'TARIK_TUNAI_DI_JARINGAN_BERSAMA',
    'PEMBAYARAN_MPNG2',
    'PERMINTAAN_CCTV_ATM_BNI',
    'TARIK_TUNAI_DI_ATM_CIRRUS'
  ],
  CRM: [
    'SETOR_TUNAI_DI_MESIN_ATM_CRM'
  ],
  DISPUTE_DEBIT: [
    '2ND_CHARGEBACK',
    'DISPUTE'
  ],
  IBANK: [
    'PEMBAYARAN_KARTU_KREDIT_BNI',
    'TRANSFER_ANTAR_REKENING_BNI',
    'PEMBAYARAN_KARTU_KREDIT_BANK_LAIN',
    'PEMBAYARAN_SAMSAT',
    'PEMBAYARAN_TELKOM_TELKOMSEL_INDOSAT_PROVIDER_LAINNYA',
    'TOP_UP_DANA',
    'TOP_UP_GOPAY',
    'TOP_UP_OVO',
    'TOP_UP_PULSA',
    'TOP_UP_SHOPEE_PAY',
    'TOP_UP_LINKAJA',
    'TRANSFER_ATM_ALTO_DANA_TDK_MASUK',
    'TRANSFER_ATM_BERSAMA_DANA_TDK_MASUK',
    'TRANSFER_ATM_LINK_DANA_TDK_MASUK',
    'TRANSFER_ATM_PRIMA_DANA_TDK_MASUK',
    'TRANSFER_ATM_ALTO_BILATERAL',
    'TRANSFER_ATM_BERSAMA_BILATERAL',
    'TRANSFER_ATM_ALTO_LINK_BILATERAL',
    'TRANSFER_ATM_PRIMA_BILATERAL',
    'PEMBAYARAN_MPNG3'
  ],
  MBANK: [
    'BI_FAST_GAGAL_HAPUS_AKUN',
    'BI_FAST_GAGAL_MIGRASI_AKUN',
    'BI_FAST_GAGAL_SUSPEND_AKUN',
    'BI_FAST_GAGAL_UPDATE_AKUN',
    'PEMBAYARAN_KARTU_KREDIT_BNI',
    'TRANSFER_ANTAR_REKENING_BNI',
    'BI_FAST_DANA_TIDAK_MASUK',
    'PEMBAYARAN_KARTU_KREDIT_BANK_LAIN',
    'PEMBAYARAN_SAMSAT',
    'PEMBAYARAN_TELKOM_TELKOMSEL_INDOSAT_PROVIDER_LAINNYA',
    'TOP_UP_DANA',
    'TOP_UP_GOPAY',
    'TOP_UP_OVO',
    'TOP_UP_PULSA',
    'TOP_UP_SHOPEE_PAY',
    'TOP_UP_LINKAJA',
    'TRANSFER_ATM_ALTO_DANA_TDK_MASUK',
    'TRANSFER_ATM_BERSAMA_DANA_TDK_MASUK',
    'TRANSFER_ATM_LINK_DANA_TDK_MASUK',
    'TRANSFER_ATM_PRIMA_DANA_TDK_MASUK',
    'BI_FAST_BILATERAL',
    'MOBILE_TUNAI_ALFAMIDI',
    'MOBILE_TUNAI_INDOMARET',
    'TRANSFER_ATM_ALTO_BILATERAL',
    'TRANSFER_ATM_BERSAMA_BILATERAL',
    'TRANSFER_ATM_ALTO_LINK_BILATERAL',
    'TRANSFER_ATM_PRIMA_BILATERAL',
    'PEMBAYARAN_MPNG4',
    'MOBILE_TUNAI'
  ],
  MTUNAI_ALFAMART: [
    'MOBILE_TUNAI_ALFAMART'
  ],
  QRIS_DEBIT: [
    'DISPUTE_QRIS_KARTU_DEBIT',
    '2ND_CHARGEBACK_QRIS_DEBIT'
  ]
};

export function useChannelsAndCategories() {
  const [channels, setChannels] = useState<Channel[]>([]);
  const [categories, setCategories] = useState<ComplaintCategory[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Function to filter categories based on selected channel
  const getFilteredCategories = useCallback((selectedChannel: Channel | null) => {
    if (!selectedChannel || !categories.length) return categories;
    
    const allowedCodes = CHANNEL_CATEGORY_MAPPING[selectedChannel.channel_code];
    if (!allowedCodes) return categories; // If no mapping, show all
    
    return categories.filter(category => 
      allowedCodes.includes(category.complaint_code)
    );
  }, [categories]);

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const [channelsResponse, categoriesResponse] = await Promise.all([
        api<Channel[]>("/v1/channel"),
        api<ComplaintCategory[]>("/v1/complaint_category")
      ]);

      if (Array.isArray(channelsResponse)) {
        setChannels(channelsResponse);
      }

      if (Array.isArray(categoriesResponse)) {
        setCategories(categoriesResponse);
      }
    } catch (error: any) {
      setError(error?.message || "Failed to fetch data");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return {
    channels,
    categories,
    getFilteredCategories,
    isLoading,
    error,
    refetch: fetchData,
  };
}