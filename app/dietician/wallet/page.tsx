"use client";

import { useState, useEffect } from "react";
import { Loader2 } from "lucide-react";
import WalletSummary from "@/components/dietician/wallet/WalletSummary2"; // Ensure this path is correct
import TransactionList from "@/components/dietician/wallet/TransactionList"; // Ensure this path is correct
import { useAuth } from "@/context/AuthContext";

export default function WalletPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [walletBalance, setWalletBalance] = useState(0);
  const { token } = useAuth();

  useEffect(() => {
    const fetchWalletBalance = async () => {
      try {
        const profileResponse = await fetch("/api/proxy/profile/", {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!profileResponse.ok) throw new Error("Failed to fetch balance");
        const profileData = await profileResponse.json();
        setWalletBalance(parseFloat(profileData.data.balance) || 0);
      } catch (error) {
        console.error("Error fetching wallet balance:", error);
        setWalletBalance(0);
      } finally {
        setIsLoading(false);
      }
    };

    fetchWalletBalance();
  }, [token]);

  if (isLoading) {
    return (
      <div className="flex h-[calc(100vh-5rem)] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-purple-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
    
      
      <div className="container mx-auto px-4 sm:px-6 py-6">
        <div className="mb-6">
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Wallet</h1>
          <p className="text-muted-foreground text-sm sm:text-base">
            View your balance and transaction history
          </p>
        </div>

        <div className="w-full flex flex-col sm:flex-row gap-4 mb-6">
          <WalletSummary balance={walletBalance} />
        </div>

        <div className="w-full bg-white p-4 rounded-lg shadow-sm">
          <h2 className="text-lg font-semibold mb-4">Transaction History</h2>
          {/* TransactionList handles its own data */}
          <TransactionList />
        </div>
      </div>
    </div>
  );
}