"use client";

import { formatDistanceToNow, format } from "date-fns";
import { ArrowUpRight, ArrowDownLeft } from "lucide-react";

interface Transaction {
  id: string;
  date: string;
  description: string;
  amount: number;
  type: "credit" | "debit";
  status: string;
}

interface TransactionListProps {
  transactions?: Transaction[];
}

export default function TransactionList({ transactions = [] }: TransactionListProps) {
  // Early return if transactions is not an array
  if (!transactions || !Array.isArray(transactions)) {
    return (
      <div className="rounded-md border">
        <div className="p-4">
          <p className="py-6 text-center text-sm text-muted-foreground">
            No transactions to display
          </p>
        </div>
      </div>
    );
  }

  // Filter out any null or invalid transactions
  const validTransactions = transactions.filter((transaction): transaction is Transaction => {
    return Boolean(
      transaction &&
      typeof transaction === 'object' &&
      transaction.id &&
      transaction.type &&
      transaction.date &&
      transaction.description &&
      typeof transaction.amount === 'number' &&
      transaction.status &&
      (transaction.type === 'credit' || transaction.type === 'debit')
    );
  });

  // If no valid transactions after filtering, show empty state
  if (validTransactions.length === 0) {
    return (
      <div className="rounded-md border">
        <div className="p-4">
          <p className="py-6 text-center text-sm text-muted-foreground">
            No transactions to display
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-md border">
      <div className="space-y-4 p-4">
        {validTransactions.map((transaction) => (
          <div
            key={transaction.id}
            className="flex items-center justify-between rounded-lg p-3 transition-colors hover:bg-muted/50"
          >
            <div className="flex items-start space-x-4">
              <div className={`rounded-full p-2 ₦{
                transaction.type === "credit" 
                  ? "bg-green-100 text-green-600 dark:bg-green-900 dark:text-green-400" 
                  : "bg-red-100 text-red-600 dark:bg-red-900 dark:text-red-400"
              }`}>
                {transaction.type === "credit" ? (
                  <ArrowDownLeft className="h-4 w-4" />
                ) : (
                  <ArrowUpRight className="h-4 w-4" />
                )}
              </div>
              <div>
                <p className="text-sm font-medium">
                  {transaction.description}
                </p>
                <div className="flex items-center text-xs text-muted-foreground">
                  <span className="capitalize">{transaction.status}</span>
                  <span className="mx-1">•</span>
                  <span>{format(new Date(transaction.date), "MMM dd, yyyy")}</span>
                </div>
              </div>
            </div>
            <div className={`text-sm font-medium ₦{
              transaction.type === "credit" ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"
            }`}>
              {transaction.type === "credit" ? "+" : "-"}₦{transaction.amount.toFixed(2)}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}