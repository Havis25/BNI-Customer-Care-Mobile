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

interface UserWithAccount extends Customer {
  account_number?: string;
}

export const useUser = () => {
  const [user, setUser] = useState<UserWithAccount | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadUserWithAccount = async () => {
      try {
        const customerData = await AsyncStorage.getItem("customer");
        if (customerData) {
          const customer: Customer = JSON.parse(customerData);
          
          // Fetch account data
          const response = await fetch("http://34.121.13.94:3000/accounts");
          if (response.ok) {
            const accounts: Account[] = await response.json();
            const primaryAccount = accounts.find(
              (acc) => acc.customer_id === customer.customer_id && acc.is_primary
            );
            
            setUser({
              ...customer,
              account_number: primaryAccount?.account_number || "N/A"
            });
          } else {
            setUser(customer);
          }
        }
      } catch (error) {
        console.error("Error loading user data:", error);
      } finally {
        setLoading(false);
      }
    };

    loadUserWithAccount();
  }, []);

  return { user, loading };
};