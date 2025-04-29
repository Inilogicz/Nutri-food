"use client";

import { useState, useEffect } from "react";
import { Loader2 } from "lucide-react";
import WalletSummary from "@/components/dietician/wallet/WalletSummary";
import TransactionList from "@/components/dietician/wallet/TransactionList";
import Navbar from "@/components/ui/Navbar";
import { useAuth } from "@/context/AuthContext";

export default function WalletPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [walletBalance, setWalletBalance] = useState(0);
  const { token } = useAuth();

  const fetchWalletBalance = async () => {
    try {
      setIsLoading(true);
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

  useEffect(() => {
    fetchWalletBalance();
  }, [token]);

  const handleTopupSuccess = () => {
    // Refresh balance after successful top-up
    fetchWalletBalance();
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
        <div className="mb-6">
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Wallet</h1>
          <p className="text-muted-foreground text-sm sm:text-base">
            View your balance and transaction history
          </p>
        </div>

        <div className="w-full flex flex-col sm:flex-row gap-4 mb-6">
          <WalletSummary 
            balance={walletBalance} 
            onTopupSuccess={handleTopupSuccess}
          />
        </div>

        <div className="w-full bg-white p-4 rounded-lg shadow-sm">
          <h2 className="text-lg font-semibold mb-4">Transaction History</h2>
          <TransactionList />
        </div>
      </div>
    </div>
  );
}