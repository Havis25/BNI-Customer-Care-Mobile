import AsyncStorage from "@react-native-async-storage/async-storage";
import { useEffect, useState } from "react";

interface Customer {
  id?: number;
  customer_id?: number;
  full_name: string;
  email: string;
  role?: string;
  password_hash?: string;
  address?: string;
  phone_number?: string;
  created_at?: string;
  accounts?: Account[];
}

interface Account {
  account_id: number;
  customer_id: number;
  account_number: number;
  account_type_id: number;
  is_primary: boolean;
  id: number;
  account_type?: {
    account_type_name: string;
  };
}

interface AccountWithType {
  account_id: number;
  customer_id: number;
  account_number: number;
  account_type_id: number;
  is_primary: boolean;
  id: number;
  account_type?: string;
}

// Manual mapping untuk account types
const ACCOUNT_TYPE_MAP: Record<number, string> = {
  1: "Tabungan",
  2: "Giro",
  3: "Deposito",
  4: "Kartu Kredit",
  5: "Pinjaman",
};

interface UserWithAccounts {
  id?: number;
  customer_id?: number;
  full_name: string;
  email: string;
  role?: string;
  password_hash?: string;
  address?: string;
  phone_number?: string;
  created_at?: string;
  accounts: AccountWithType[];
  selectedAccount?: AccountWithType;
  tickets?: any[];
}

export const useUser = () => {
  const [user, setUser] = useState<UserWithAccounts | null>(null);
  const [loading, setLoading] = useState(true);
  const [accounts, setAccounts] = useState<AccountWithType[]>([]);

  useEffect(() => {
    const loadUserWithAccounts = async () => {
      const startTime = Date.now();
      
      try {
        const customerData = await AsyncStorage.getItem("customer");
        if (!customerData) {
          // Ensure minimum 1.5 seconds skeleton display
          const elapsed = Date.now() - startTime;
          const minDelay = 1500;
          
          if (elapsed < minDelay) {
            setTimeout(() => setLoading(false), minDelay - elapsed);
          } else {
            setLoading(false);
          }
          return;
        }

        const customer: Customer = JSON.parse(customerData);

        // Use accounts from customer data (sudah lengkap dari /v1/auth/me)
        if (customer.accounts && customer.accounts.length > 0) {
          const userAccounts = customer.accounts.map((acc) => ({
            ...acc,
            account_type:
              acc.account_type?.account_type_name ||
              ACCOUNT_TYPE_MAP[acc.account_type_id] ||
              "Unknown",
          }));
          setAccounts(userAccounts);

          const primaryAccount =
            userAccounts.find((acc) => acc.is_primary) || userAccounts[0];

          setUser({
            ...customer,
            accounts: userAccounts,
            selectedAccount: primaryAccount,
          });
        } else {
          setAccounts([]);
          setUser({
            ...customer,
            accounts: [],
            selectedAccount: undefined,
          });
        }
      } catch (error) {
      } finally {
        // Ensure minimum 1.5 seconds skeleton display
        const elapsed = Date.now() - startTime;
        const minDelay = 1500;
        
        if (elapsed < minDelay) {
          setTimeout(() => setLoading(false), minDelay - elapsed);
        } else {
          setLoading(false);
        }
      }
    };

    loadUserWithAccounts();
  }, []);

  const selectAccount = (account: AccountWithType) => {
    if (user) {
      setUser({
        ...user,
        selectedAccount: account,
      });
    }
  };

  return {
    user,
    loading,
    selectAccount,
    accounts,
    account_number: user?.selectedAccount?.account_number?.toString() || "N/A",
  };
};

