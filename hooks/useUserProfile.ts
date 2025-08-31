import { api } from "@/lib/api";
import { useCallback, useState } from "react";
import { useAuth } from "./useAuth";

type UserProfile = {
  id: number;
  customer_id?: number;
  full_name: string;
  email: string;
  role: string;
  address?: string;
  phone_number?: string;
  birth_place?: string;
  gender?: string;
  person_id?: string;
  cif?: string;
  billing_address?: string;
  postal_code?: string;
  home_phone?: string;
  handphone?: string;
  office_phone?: string;
  fax_phone?: string;
  accounts?: {
    account_id: number;
    customer_id: number;
    account_number: number;
    account_type_id: number;
    is_primary: boolean;
    id: number;
    account_type: {
      account_type_id: number;
      account_type_code: string;
      account_type_name: string;
      id: number;
    };
    cards: {
      card_id: number;
      account_id: number;
      card_number: number;
      card_status_id: number;
      card_type: string;
      exp_date: string;
      id: number;
      card_status: {
        card_status_id: number;
        card_status_code: string;
        card_status_name: string;
        id: number;
      };
    }[];
  }[];
};

type TicketUserData = {
  // Customer basic info
  customer_id: number;
  full_name: string;
  email: string;
  phone_number?: string;
  address?: string;
  birth_place?: string;
  gender?: string;
  person_id?: string;
  cif?: string;
  billing_address?: string;
  postal_code?: string;
  home_phone?: string;
  handphone?: string;
  office_phone?: string;
  fax_phone?: string;

  // Primary account info
  primary_account_id?: number;
  primary_account_number?: number;
  primary_account_type?: string;

  // Primary card info (first card from primary account)
  primary_card_id?: number;
  primary_card_number?: number;
  primary_card_type?: string;

  // All debit card numbers (for list_debit_card_number field)
  debit_card_numbers?: number[];
};

export function useUserProfile() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { isAuthenticated, getValidToken } = useAuth();

  const fetchUserProfile =
    useCallback(async (): Promise<UserProfile | null> => {
      if (!isAuthenticated) {
        
        return null;
      }

      try {
        setIsLoading(true);
        setError(null);

        const response = await api<{ success: boolean; data: UserProfile }>(
          "/v1/auth/me"
        );

        if (!response) {
          
          return null;
        }

        if (!response?.success || !response?.data) {
          
          throw new Error("Failed to fetch user profile");
        }

        return response.data;
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Failed to fetch user profile";
        setError(errorMessage);
        console.error("❌ useUserProfile: Error fetching user profile:", err);
        return null;
      } finally {
        setIsLoading(false);
      }
    }, [isAuthenticated]);

  const getUserDataForTicket =
    useCallback(async (): Promise<TicketUserData | null> => {
      const userProfile = await fetchUserProfile();
      if (!userProfile) return null;

      try {
        // Find primary account
        const primaryAccount =
          userProfile.accounts?.find((acc) => acc.is_primary) ||
          userProfile.accounts?.[0];

        // Find primary card (first card from primary account)
        const primaryCard = primaryAccount?.cards?.[0];

        // Collect all debit card numbers from all accounts
        const debitCardNumbers =
          userProfile.accounts
            ?.flatMap((acc) =>
              acc.cards
                ?.filter(
                  (card) =>
                    card.card_type?.toLowerCase().includes("debit") ||
                    card.card_type?.toLowerCase().includes("atm")
                )
                ?.map((card) => card.card_number)
            )
            ?.filter(Boolean) || [];

        const ticketUserData: TicketUserData = {
          // Customer basic info
          customer_id: userProfile.customer_id || userProfile.id,
          full_name: userProfile.full_name,
          email: userProfile.email,
          phone_number: userProfile.phone_number,
          address: userProfile.address,
          birth_place: userProfile.birth_place,
          gender: userProfile.gender,
          person_id: userProfile.person_id,
          cif: userProfile.cif,
          billing_address: userProfile.billing_address,
          postal_code: userProfile.postal_code,
          home_phone: userProfile.home_phone,
          handphone: userProfile.handphone,
          office_phone: userProfile.office_phone,
          fax_phone: userProfile.fax_phone,

          // Primary account info
          primary_account_id: primaryAccount?.account_id,
          primary_account_number: primaryAccount?.account_number,
          primary_account_type: primaryAccount?.account_type?.account_type_name,

          // Primary card info
          primary_card_id: primaryCard?.card_id,
          primary_card_number: primaryCard?.card_number,
          primary_card_type: primaryCard?.card_type,

          // All debit card numbers
          debit_card_numbers: debitCardNumbers,
        };

        return ticketUserData;
      } catch (err) {
        console.error("Error processing user data for ticket:", err);
        return null;
      }
    }, [fetchUserProfile]);

  return {
    fetchUserProfile,
    getUserDataForTicket,
    isLoading,
    error,
  };
}

