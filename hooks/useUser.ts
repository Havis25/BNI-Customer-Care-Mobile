import AsyncStorage from "@react-native-async-storage/async-storage";
import { useEffect, useState } from "react";

interface Customer {
  customer_id: number;
  full_name: string;
  email: string;
  password_hash: string;
  address: string;
  phone_number: string;
  created_at: string;
}

interface Account {
  account_id: number;
  customer_id: number;
  account_number: string;
  account_type: string;
  is_primary: boolean;
}

interface UserWithAccounts extends Customer {
  accounts: Account[];
  selectedAccount?: Account;
}

export const useUser = () => {
  const [user, setUser] = useState<UserWithAccounts | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadUserWithAccounts = async () => {
      try {
        const customerData = await AsyncStorage.getItem("customer");
        if (customerData) {
          const customer: Customer = JSON.parse(customerData);
          
          // Fetch account data
          const response = await fetch("http://34.121.13.94:3000/accounts");
          if (response.ok) {
            const allAccounts: Account[] = await response.json();
            const userAccounts = allAccounts.filter(
              (acc) => acc.customer_id === customer.customer_id
            );
            
            // Set primary account as selected, or first account if no primary
            const primaryAccount = userAccounts.find(acc => acc.is_primary) || userAccounts[0];
            
            setUser({
              ...customer,
              accounts: userAccounts,
              selectedAccount: primaryAccount
            });
          } else {
            setUser({
              ...customer,
              accounts: [],
              selectedAccount: undefined
            });
          }
        }
      } catch (error) {
        console.error("Error loading user data:", error);
      } finally {
        setLoading(false);
      }
    };

    loadUserWithAccounts();
  }, []);

  const selectAccount = (account: Account) => {
    if (user) {
      setUser({
        ...user,
        selectedAccount: account
      });
    }
  };

  return { 
    user, 
    loading, 
    selectAccount,
    // Helper properties for backward compatibility
    account_number: user?.selectedAccount?.account_number || "N/A",
    accounts: user?.accounts || []
  };
};