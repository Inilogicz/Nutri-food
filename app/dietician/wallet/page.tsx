"use client";

import { useState, useEffect } from "react";
import { Loader2 } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import WalletSummary from "@/components/dietician/wallet/WalletSummary";
import TransactionList from "@/components/dietician/wallet/TransactionList";
import WalletChart from "@/components/dietician/wallet/WalletChart";
import { mockTransactions } from "@/lib/mock-data";

// Single interface definition at the top level
interface Transaction {
  id: string;
  date: string;
  description: string;
  amount: number;
  type: 'credit' | 'debit'; // More specific type for better type safety
  status: string;
}

export default function WalletPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [walletBalance, setWalletBalance] = useState(0);

  useEffect(() => {
    // Simulate loading wallet data
    const timer = setTimeout(() => {
      // Type assertion if needed (only if mock data structure differs)
      setTransactions(mockTransactions as Transaction[]);
      
      // Calculate total balance from transactions
      const balance = mockTransactions.reduce((sum, transaction) => {
        return sum + (transaction.type === 'credit' ? transaction.amount : -transaction.amount);
      }, 0);
      setWalletBalance(balance);
      setIsLoading(false);
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  if (isLoading) {
    return (
      <div className="flex h-[calc(100vh-5rem)] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-purple-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Wallet</h1>
        <p className="text-muted-foreground">
          Manage your earnings and track your transactions
        </p>
      </div>

      <WalletSummary balance={walletBalance} />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div>
          <WalletChart transactions={transactions} />
        </div>
        <div>
          <Tabs defaultValue="all">
            <TabsList className="mb-4">
              <TabsTrigger value="all">All Transactions</TabsTrigger>
              <TabsTrigger value="credits">Credits</TabsTrigger>
              <TabsTrigger value="debits">Debits</TabsTrigger>
            </TabsList>
            <TabsContent value="all">
              <TransactionList transactions={transactions} />
            </TabsContent>
            <TabsContent value="credits">
              <TransactionList 
                transactions={transactions.filter(t => t.type === 'credit')} 
              />
            </TabsContent>
            <TabsContent value="debits">
              <TransactionList 
                transactions={transactions.filter(t => t.type === 'debit')} 
              />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}