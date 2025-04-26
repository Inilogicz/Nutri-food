"use client";

import { useState, useEffect } from "react";
import { Loader2 } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import WalletSummary from "@/components/dietician/wallet/WalletSummary";
import TransactionList from "@/components/dietician/wallet/TransactionList";
import WalletChart from "@/components/dietician/wallet/WalletChart";
import { mockTransactions } from "@/lib/mock-data";
import Navbar from "@/components/ui/Navbar";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/AuthContext";

interface Transaction {
  id: string;
  date: string;
  description: string;
  amount: number;
  type: 'credit' | 'debit';
  status: string;
}

interface ProfileData {
  balance: string;
  // Add other fields if needed
}

export default function WalletPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [walletBalance, setWalletBalance] = useState(0);
  const { token } = useAuth();

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch profile data to get balance
        const profileResponse = await fetch("https://devsammy.online/api/profile/", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!profileResponse.ok) {
          throw new Error("Failed to fetch profile data");
        }

        const profileData: { data: ProfileData } = await profileResponse.json();
        const balance = parseFloat(profileData.data.balance) || 0;
        setWalletBalance(balance);

        // Load mock transactions (replace with actual API call if needed)
        setTransactions(mockTransactions);
        
      } catch (error) {
        console.error("Error fetching data:", error);
        // Fallback to mock data if API fails
        const balance = mockTransactions.reduce((sum, transaction) => {
          return transaction.type === 'credit' 
            ? sum + transaction.amount 
            : sum - transaction.amount;
        }, 0);
        setWalletBalance(balance);
        setTransactions(mockTransactions);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [token]);

  const handleTopUp = () => {
    // Top-up functionality would go here
    console.log("Top-up initiated");
  };

  if (isLoading) {
    return (
      <div className="flex h-[calc(100vh-5rem)] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-purple-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <div className="container mx-auto px-4 sm:px-6 py-6">
        {/* Header Section */}
        <div className="mb-6">
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Wallet</h1>
          <p className="text-muted-foreground text-sm sm:text-base">
            View your balance and transaction history
          </p>
        </div>

        {/* Wallet Summary and Top-up Button */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <WalletSummary balance={walletBalance} />
        </div>

        {/* Main Content - Stack on mobile, side-by-side on desktop */}
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Chart Section - Full width on mobile */}
          <div className="w-full lg:w-1/2 bg-white p-4 rounded-lg shadow-sm">
            <h2 className="text-lg font-semibold mb-4">Balance History</h2>
            <div className="h-64 sm:h-80">
              <WalletChart transactions={transactions} />
            </div>
          </div>

          {/* Transactions Section - Full width on mobile */}
          <div className="w-full lg:w-1/2 bg-white p-4 rounded-lg shadow-sm">
            <h2 className="text-lg font-semibold mb-4">Transaction History</h2>
            <Tabs defaultValue="all">
              <TabsList className="grid grid-cols-2 w-full mb-4">
                <TabsTrigger value="all">All</TabsTrigger>
                <TabsTrigger value="credits">Credits</TabsTrigger>
              </TabsList>
              
              <TabsContent value="all">
                <TransactionList transactions={transactions} />
              </TabsContent>
              <TabsContent value="credits">
                <TransactionList 
                  transactions={transactions.filter(t => t.type === 'credit')} 
                />
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </div>
  );
}