import { api } from "@/lib/api";

// Chatbot to Database mapping
export const CHATBOT_CHANNEL_MAPPING: Record<string, string> = {
  ATM: "ATM",
  IBANK: "IBANK",
  MBANK: "MBANK",
  CRM: "CRM",
  "MTUNAI ALFAMART": "MTUNAI_ALFAMART",
  "DISPUTE DEBIT": "DISPUTE_DEBIT",
  "QRIS DEBIT": "QRIS_DEBIT",
  MTUNAI: "MTUNAI",
};

// Terminal mapping for ATM channel
export const CHATBOT_TERMINAL_MAPPING: Record<string, string> = {
  // Add terminal mappings here when backend provides terminal data
  // Example: "TERMINAL_NAME": "TERMINAL_CODE"
};

export const CHATBOT_CATEGORY_MAPPING: Record<string, string[]> = {
  PEMBAYARAN: [
    "PEMBAYARAN_KARTU_KREDIT_BNI",
    "PEMBAYARAN_KARTU_KREDIT_BANK_LAIN",
    "PEMBAYARAN_PLN_VIA_ATM_BANK_LAIN",
    "PEMBAYARAN_SAMSAT",
    "PEMBAYARAN_TELKOM_TELKOMSEL_INDOSAT_PROVIDER_LAINNYA",
  ],
  "TOP UP": [
    "TOP_UP_DANA",
    "TOP_UP_GOPAY",
    "TOP_UP_OVO",
    "TOP_UP_PULSA",
    "TOP_UP_PULSA_VIA_ATM_BANK_LAIN",
    "TOP_UP_SHOPEE_PAY",
    "TOP_UP_LINKAJA",
    "TOP_UP_E_MONEY",
    "TOP_UP_PRA_MIGRASI_DANA_GAGAL_TERKOREKSI",
  ],
  TRANSFER: [
    "TRANSFER_ATM_ALTO_DANA_TDK_MASUK",
    "TRANSFER_ATM_BERSAMA_DANA_TDK_MASUK",
    "TRANSFER_ATM_LINK_DANA_TDK_MASUK",
    "TRANSFER_ATM_PRIMA_DANA_TDK_MASUK",
    "TRANSFER_ANTAR_REKENING_BNI",
    "TRANSFER_ATM_ALTO_BILATERAL",
    "TRANSFER_ATM_BERSAMA_BILATERAL",
    "TRANSFER_ATM_ALTO_LINK_BILATERAL",
    "TRANSFER_ATM_PRIMA_BILATERAL",
  ],
  "TARIK TUNAI": [
    "TARIK_TUNAI_DI_MESIN_ATM_BNI",
    "TARIK_TUNAI_DI_ATM_LINK",
    "TARIK_TUNAI_DI_JARINGAN_ALTO",
    "TARIK_TUNAI_DI_JARINGAN_BERSAMA",
    "TARIK_TUNAI_DI_ATM_CIRRUS",
  ],
  "SETOR TUNAI": ["SETOR_TUNAI_DI_MESIN_ATM_CRM"],
  "MOBILE TUNAI": [
    "MOBILE_TUNAI_ALFAMIDI",
    "MOBILE_TUNAI_INDOMARET",
    "MOBILE_TUNAI",
    "MOBILE_TUNAI_ALFAMART",
  ],
  "BI FAST": ["BI_FAST_DANA_TIDAK_MASUK", "BI_FAST_BILATERAL"],
  DISPUTE: ["DISPUTE_KARTU_DEBIT_BNI", "DISPUTE_KARTU_KREDIT_BNI"],
};

// Categories that require amount input
export const AMOUNT_REQUIRED_CATEGORIES = [
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
  "TOP_UP_PRA_MIGRASI_DANA_GAGAL_TERKOREKSI",
  "TRANSFER_ATM_ALTO_DANA_TDK_MASUK",
  "TRANSFER_ATM_BERSAMA_DANA_TDK_MASUK",
  "TRANSFER_ATM_LINK_DANA_TDK_MASUK",
  "TRANSFER_ATM_PRIMA_DANA_TDK_MASUK",
  "TRANSFER_ANTAR_REKENING_BNI",
  "TRANSFER_ATM_ALTO_BILATERAL",
  "TRANSFER_ATM_BERSAMA_BILATERAL",
  "TRANSFER_ATM_ALTO_LINK_BILATERAL",
  "TRANSFER_ATM_PRIMA_BILATERAL",
  "BI_FAST_DANA_TIDAK_MASUK",
  "BI_FAST_BILATERAL",
  "MOBILE_TUNAI_ALFAMIDI",
  "MOBILE_TUNAI_INDOMARET",
  "MOBILE_TUNAI",
  "MOBILE_TUNAI_ALFAMART",
  "SETOR_TUNAI_DI_MESIN_ATM_CRM",
  "TARIK_TUNAI_DI_MESIN_ATM_BNI",
  "TARIK_TUNAI_DI_ATM_LINK",
  "TARIK_TUNAI_DI_JARINGAN_ALTO",
  "TARIK_TUNAI_DI_JARINGAN_BERSAMA",
  "TARIK_TUNAI_DI_ATM_CIRRUS",
];

// Categories that require transaction date (same as amount required)
export const TRANSACTION_DATE_REQUIRED_CATEGORIES = AMOUNT_REQUIRED_CATEGORIES;

export function mapChatbotChannelToDatabase(
  chatbotChannel: string,
  channels: any[]
): number {
  const mappedCode = CHATBOT_CHANNEL_MAPPING[chatbotChannel.toUpperCase()];
  if (mappedCode) {
    const found = channels.find((c) => c.channel_code === mappedCode);
    if (found) return found.channel_id;
  }
  return channels[0]?.channel_id || 1;
}

export function mapChatbotCategoryToDatabase(
  chatbotCategory: string,
  description: string,
  categories: any[]
): number {
  const categoryKey = chatbotCategory.toUpperCase();
  const possibleCodes = CHATBOT_CATEGORY_MAPPING[categoryKey] || [];

  // Smart mapping based on description context
  const desc = description.toLowerCase();

  for (const code of possibleCodes) {
    const category = categories.find((c) => c.complaint_code === code);
    if (category) {
      // Context-based selection
      if (
        code.includes("DANA_TIDAK_MASUK") &&
        (desc.includes("tidak masuk") ||
          desc.includes("gagal") ||
          desc.includes("tidak terdeteksi"))
      ) {
        return category.complaint_id;
      }
      if (
        code.includes("BILATERAL") &&
        (desc.includes("salah") ||
          desc.includes("batal") ||
          desc.includes("refund"))
      ) {
        return category.complaint_id;
      }
      if (code.includes("BNI") && desc.includes("bni")) {
        return category.complaint_id;
      }
      if (
        code.includes("BANK_LAIN") &&
        (desc.includes("bank lain") || desc.includes("lain"))
      ) {
        return category.complaint_id;
      }
    }
  }

  // Fallback to first match
  if (possibleCodes.length > 0) {
    const firstMatch = categories.find(
      (c) => c.complaint_code === possibleCodes[0]
    );
    if (firstMatch) return firstMatch.complaint_id;
  }

  return categories[0]?.complaint_id || 1;
}

export function doesCategoryRequireAmount(complaintCode: string): boolean {
  return AMOUNT_REQUIRED_CATEGORIES.includes(complaintCode);
}

export function checkIfCategoryNeedsAmount(chatbotCategory: string): boolean {
  const categoryKey = chatbotCategory.toUpperCase();
  const possibleCodes = CHATBOT_CATEGORY_MAPPING[categoryKey] || [];
  return possibleCodes.some((code) =>
    AMOUNT_REQUIRED_CATEGORIES.includes(code)
  );
}

export function checkIfCategoryNeedsTransactionDate(
  chatbotCategory: string
): boolean {
  const categoryKey = chatbotCategory.toUpperCase();
  const possibleCodes = CHATBOT_CATEGORY_MAPPING[categoryKey] || [];
  return possibleCodes.some((code) =>
    TRANSACTION_DATE_REQUIRED_CATEGORIES.includes(code)
  );
}

export function mapChatbotTerminalToDatabase(
  chatbotTerminal: string,
  terminals: any[]
): number {
  const mappedCode = CHATBOT_TERMINAL_MAPPING[chatbotTerminal.toUpperCase()];
  if (mappedCode) {
    const found = terminals.find((t) => t.terminal_code === mappedCode);
    if (found) return found.terminal_id;
  }

  // Fallback: find by terminal_name
  const foundByName = terminals.find(
    (t) =>
      t.terminal_name === chatbotTerminal ||
      t.terminal_name?.toUpperCase() === chatbotTerminal.toUpperCase()
  );
  if (foundByName) return foundByName.terminal_id;

  return terminals[0]?.terminal_id || 1;
}
