import AsyncStorage from "@react-native-async-storage/async-storage";
import { useEffect, useState } from "react";
import { api } from "@/lib/api";

interface Customer {
  customer_id?: number;
  full_name: string;
  email: string;
  password_hash?: string;
  address: string;
  phone_number: string;
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
}

interface AccountWithType extends Account {
  account_type?: string;
}

// Manual mapping untuk account types
const ACCOUNT_TYPE_MAP: Record<number, string> = {
  1: "Tabungan",
  2: "Giro", 
  3: "Deposito",
  4: "Kartu Kredit",
  5: "Pinjaman"
};

interface UserWithAccounts extends Customer {
  accounts: AccountWithType[];
  selectedAccount?: AccountWithType;
}

export const useUser = () => {
  const [user, setUser] = useState<UserWithAccounts | null>(null);
  const [loading, setLoading] = useState(true);
  const [accounts, setAccounts] = useState<AccountWithType[]>([]);

  useEffect(() => {
    const loadUserWithAccounts = async () => {
      try {
        const customerData = await AsyncStorage.getItem("customer");
        if (!customerData) {
          setLoading(false);
          return;
        }

        const customer: Customer = JSON.parse(customerData);

        // Use accounts from customer data if available
        if (customer.accounts && customer.accounts.length > 0) {
          const userAccounts = customer.accounts.map((acc) => ({
            ...acc,
            account_type: ACCOUNT_TYPE_MAP[acc.account_type_id] || "Unknown"
          }));
          setAccounts(userAccounts);

          const primaryAccount = userAccounts.find((acc) => acc.is_primary) || userAccounts[0];
          
          setUser({
            ...customer,
            accounts: userAccounts,
            selectedAccount: primaryAccount,
          });
        } else {
          // Fallback to API if no accounts in customer data
          try {
            const allAccounts: Account[] = await api<Account[]>("/v1/account");
            const userAccounts = allAccounts
              .filter((acc) => acc.customer_id === customer.customer_id)
              .map((acc) => ({
                ...acc,
                account_type: ACCOUNT_TYPE_MAP[acc.account_type_id] || "Unknown"
              }));

            setAccounts(userAccounts);
            const primaryAccount = userAccounts.find((acc) => acc.is_primary) || userAccounts[0];
            
            setUser({
              ...customer,
              accounts: userAccounts,
              selectedAccount: primaryAccount,
            });
          } catch (accountError) {
            setAccounts([]);
            setUser({
              ...customer,
              accounts: [],
              selectedAccount: undefined,
            });
          }
        }
      } catch (error) {
      } finally {
        setLoading(false);
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
