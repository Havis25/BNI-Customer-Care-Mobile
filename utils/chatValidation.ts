/**
 * Utility functions for validating transaction date and amount in chat
 */

/**
 * Validates transaction date input
 * Rules:
 * 1. Must be in DD/MM/YYYY or DD-MM-YYYY format
 * 2. Must not be in the future (cannot exceed today)
 * 3. Must not be older than 1 month from today
 *
 * @param dateString - Date string to validate
 * @returns Object with isValid boolean and error message if invalid
 */
export function validateTransactionDate(dateString: string): {
  isValid: boolean;
  errorMessage?: string;
  parsedDate?: Date;
} {
  // Check format first
  const datePattern = /^\d{1,2}[\/\-]\d{1,2}[\/\-]\d{4}$/;
  if (!datePattern.test(dateString.trim())) {
    return {
      isValid: false,
      errorMessage:
        "Format tanggal tidak sesuai. Mohon gunakan format DD/MM/YYYY atau DD-MM-YYYY.\n\nContoh yang benar:\n• 15/01/2024\n• 15-01-2024\n• 01/12/2024",
    };
  }

  // Parse the date
  const cleanDate = dateString.trim().replace(/\-/g, "/");
  const parts = cleanDate.split("/");

  if (parts.length !== 3) {
    return {
      isValid: false,
      errorMessage: "Format tanggal tidak valid.",
    };
  }

  const day = parseInt(parts[0], 10);
  const month = parseInt(parts[1], 10);
  const year = parseInt(parts[2], 10);

  // Validate date components
  if (
    day < 1 ||
    day > 31 ||
    month < 1 ||
    month > 12 ||
    year < 1900 ||
    year > 2100
  ) {
    return {
      isValid: false,
      errorMessage:
        "Tanggal tidak valid. Pastikan format DD/MM/YYYY dengan nilai yang benar.",
    };
  }

  // Create date object (month is 0-indexed in JavaScript)
  const inputDate = new Date(year, month - 1, day);

  // Check if the date is actually valid (handles invalid dates like 31/02/2024)
  if (
    inputDate.getDate() !== day ||
    inputDate.getMonth() !== month - 1 ||
    inputDate.getFullYear() !== year
  ) {
    return {
      isValid: false,
      errorMessage:
        "Tanggal tidak valid. Pastikan tanggal yang dimasukkan benar.",
    };
  }

  const today = new Date();
  today.setHours(23, 59, 59, 999); // Set to end of today for comparison

  const oneMonthAgo = new Date();
  oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);
  oneMonthAgo.setHours(0, 0, 0, 0); // Set to start of day for comparison

  // Check if date is in the future
  if (inputDate > today) {
    return {
      isValid: false,
      errorMessage: "Tanggal transaksi tidak boleh melebihi hari ini.",
    };
  }

  // Check if date is older than 1 month
  if (inputDate < oneMonthAgo) {
    const oneMonthAgoFormatted = oneMonthAgo.toLocaleDateString("id-ID", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
    return {
      isValid: false,
      errorMessage: `Tanggal transaksi tidak boleh lebih dari 1 bulan yang lalu. Tanggal paling lama yang dapat diterima: ${oneMonthAgoFormatted}`,
    };
  }

  return {
    isValid: true,
    parsedDate: inputDate,
  };
}

/**
 * Validates amount input
 * Rules:
 * 1. Must be numeric (can contain currency symbols that will be cleaned)
 * 2. Must be positive
 * 3. Must be within reasonable range
 * 4. Should not be a date pattern
 *
 * @param amountString - Amount string to validate
 * @returns Object with isValid boolean, cleaned numeric value, and error message if invalid
 */
export function validateAmount(amountString: string): {
  isValid: boolean;
  cleanedAmount?: string;
  numericValue?: number;
  errorMessage?: string;
} {
  const cleanInput = amountString.trim();

  // Check if input contains date pattern (should not be amount)
  const datePattern = /\d{1,2}[\/-]\d{1,2}[\/-]\d{4}/;
  if (datePattern.test(cleanInput)) {
    return {
      isValid: false,
      errorMessage:
        "Format tidak sesuai. Mohon masukkan nominal dalam angka saja (tanpa format tanggal).\n\nContoh:\n• 250000\n• Rp 250.000\n• 1.500.000",
    };
  }

  // Remove common currency symbols and separators
  const numericAmount = cleanInput.replace(/[Rp\s.,]/g, "");

  // Check if result is purely numeric
  const isNumeric = /^[0-9]+$/.test(numericAmount);

  if (!isNumeric || numericAmount.length === 0) {
    return {
      isValid: false,
      errorMessage:
        "Format nominal tidak valid. Mohon masukkan angka yang benar.\n\nContoh:\n• 250000\n• Rp 250.000\n• 1.500.000",
    };
  }

  const amount = parseInt(numericAmount, 10);

  // Check if within reasonable range
  if (amount <= 0) {
    return {
      isValid: false,
      errorMessage: "Nominal harus lebih dari 0.",
    };
  }

  if (amount > 999999999999) {
    // 999 billion limit
    return {
      isValid: false,
      errorMessage: "Nominal terlalu besar. Mohon periksa kembali.",
    };
  }

  return {
    isValid: true,
    cleanedAmount: numericAmount,
    numericValue: amount,
  };
}

/**
 * Formats amount for display in summary
 * @param amount - Amount to format (string or number)
 * @returns Formatted amount string
 */
export function formatAmountForDisplay(amount: string | number): string {
  if (!amount) return "Tidak tersedia";

  const numericAmount =
    typeof amount === "string"
      ? parseInt(amount.replace(/[^0-9]/g, ""), 10)
      : amount;

  if (isNaN(numericAmount) || numericAmount <= 0) {
    return "Tidak tersedia";
  }

  return `Rp ${numericAmount.toLocaleString("id-ID")}`;
}
