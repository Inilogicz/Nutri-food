"use client";

import { format } from "date-fns";
import { ArrowUpRight, ArrowDownLeft, Loader2, Wallet, CreditCard, Clock } from "lucide-react";
import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";

interface Transaction {
  id: number;
  user_id: string | number;
  for: string;
  dietitian_id: string | null;
  consultation_id: string | null;
  amount: string;
  platform_cut: string | null;
  dietitian_earnings: string | null;
  type: "credit" | "debit";
  description: string;
  created_at: string;
  updated_at: string;
  status?: string;
}

interface ApiResponse {
  status: boolean;
  message: string;
  data: {
    current_page: number;
    data: Transaction[];
    total: number;
    first_page_url: string;
    from: number;
    last_page: number;
    last_page_url: string;
    links: Array<{
      url: string | null;
      label: string;
      active: boolean;
    }>;
    next_page_url: string | null;
    path: string;
    per_page: number;
    prev_page_url: string | null;
    to: number;
  };
}

export default function TransactionList() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { token, user } = useAuth();

  useEffect(() => {
    const fetchUserTransactions = async () => {
      if (!token || !user?.id) {
        setError("Authentication required");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);
        
        const response = await fetch("https://devsammy.online/api/transactions", {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });

        if (!response.ok) {
          throw new Error(`Failed to fetch transactions: ${response.status}`);
        }

        const contentType = response.headers.get('content-type');
        if (!contentType?.includes('application/json')) {
          throw new Error('Invalid response format');
        }

        const data: ApiResponse = await response.json();
        
        if (data.status && data.data?.data) {
          // Convert user_id to number for consistent comparison
          const userTransactions = data.data.data.map(tx => ({
            ...tx,
            user_id: typeof tx.user_id === 'string' ? parseInt(tx.user_id) : tx.user_id
          })).filter(tx => tx.user_id === user.id);
          
          setTransactions(userTransactions);
        } else {
          throw new Error(data.message || "No transaction data received");
        }
      } catch (err) {
        console.error("Transaction fetch error:", err);
        setError(err instanceof Error ? err.message : "Unknown error occurred");
        setTransactions([]);
      } finally {
        setLoading(false);
      }
    };

    fetchUserTransactions();
  }, [token, user?.id]);

  const getTransactionIcon = (transaction: Transaction) => {
    if (transaction.type === "credit") {
      return <ArrowDownLeft className="h-4 w-4" />;
    }
    
    if (transaction.consultation_id) {
      return <Clock className="h-4 w-4" />;
    }
    
    return <ArrowUpRight className="h-4 w-4" />;
  };

  const getTransactionBadge = (transaction: Transaction) => {
    if (transaction.type === "credit") {
      return <Badge variant="default">Credit</Badge>;
    }
    
    if (transaction.consultation_id) {
      return <Badge variant="secondary">Consultation</Badge>;
    }
    
    return <Badge variant="destructive">Debit</Badge>;
  };

  const renderTransactionItem = (transaction: Transaction) => {
    const amount = parseFloat(transaction.amount);
    const type = transaction.type;
    const status = transaction.status || "completed";
    const isCredit = type === "credit";

    return (
      <div
        key={transaction.id}
        className="flex items-center justify-between rounded-lg p-3 transition-colors hover:bg-muted/50"
      >
        <div className="flex items-start space-x-4">
          <div className={`rounded-full p-2 ${
            isCredit
              ? "bg-green-100 text-green-600 dark:bg-green-900 dark:text-green-400" 
              : "bg-red-100 text-red-600 dark:bg-red-900 dark:text-red-400"
          }`}>
            {getTransactionIcon(transaction)}
          </div>
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <p className="text-sm font-medium">
                {transaction.description}
              </p>
              {getTransactionBadge(transaction)}
            </div>
            <div className="flex items-center text-xs text-muted-foreground">
              <span className="capitalize">{status}</span>
              <span className="mx-1">•</span>
              <span>{format(new Date(transaction.created_at), "MMM dd, yyyy 'at' h:mm a")}</span>
            </div>
            {transaction.consultation_id && (
              <div className="text-xs text-muted-foreground">
                Consultation ID: {transaction.consultation_id}
              </div>
            )}
          </div>
        </div>
        <div className={`text-sm font-medium ${
          isCredit ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"
        }`}>
          {isCredit ? "+" : "-"}₦{Math.abs(amount).toFixed(2)}
        </div>
      </div>
    );
  };

  const renderContent = (filteredTransactions: Transaction[]) => {
    if (loading) {
      return (
        <div className="p-4 flex justify-center">
          <Loader2 className="h-5 w-5 animate-spin" />
          <span className="sr-only">Loading transactions...</span>
        </div>
      );
    }

    if (error) {
      return (
        <div className="p-4">
          <p className="py-6 text-center text-sm text-muted-foreground">
            Error: {error}
          </p>
        </div>
      );
    }

    if (filteredTransactions.length === 0) {
      return (
        <div className="p-4">
          <p className="py-6 text-center text-sm text-muted-foreground">
            {transactions.length === 0 
              ? "No transactions found for your account" 
              : "No transactions match this filter"}
          </p>
        </div>
      );
    }

    return (
      <div className="space-y-4 p-4">
        {filteredTransactions.map(renderTransactionItem)}
      </div>
    );
  };

  return (
    <div className="rounded-md border">
      <Tabs defaultValue="all">
        <TabsList className="grid grid-cols-3 w-full rounded-b-none border-b">
          <TabsTrigger value="all">All</TabsTrigger>
          <TabsTrigger value="credits">Credits</TabsTrigger>
          <TabsTrigger value="debits">Debits</TabsTrigger>
        </TabsList>
        
        <TabsContent value="all">
          {renderContent(transactions)}
        </TabsContent>
        
        <TabsContent value="credits">
          {renderContent(transactions.filter(t => t.type === "credit"))}
        </TabsContent>
        
        <TabsContent value="debits">
          {renderContent(transactions.filter(t => t.type === "debit"))}
        </TabsContent>
      </Tabs>
    </div>
  );
}