"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/app/new/dietician/ui/card";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";
import { ArrowUp, ArrowDown } from "lucide-react";
import { format, subDays, startOfDay, endOfDay } from "date-fns";

interface Transaction {
  id: string;
  date: string;
  description: string;
  amount: number;
  type: "credit" | "debit";
  status: string;
}

interface WalletChartProps {
  transactions: Transaction[];
}

export default function WalletChart({ transactions }: WalletChartProps) {
  // Calculate total earnings and expenses
  const totalEarnings = transactions
    .filter(t => t.type === "credit")
    .reduce((sum, t) => sum + t.amount, 0);
  
  const totalExpenses = transactions
    .filter(t => t.type === "debit")
    .reduce((sum, t) => sum + t.amount, 0);

  // Prepare data for the chart - last 7 days
  const chartData = Array.from({ length: 7 }, (_, i) => {
    const date = subDays(new Date(), 6 - i);
    const start = startOfDay(date);
    const end = endOfDay(date);
    
    const dayTransactions = transactions.filter(t => {
      const txDate = new Date(t.date);
      return txDate >= start && txDate <= end;
    });
    
    const earnings = dayTransactions
      .filter(t => t.type === "credit")
      .reduce((sum, t) => sum + t.amount, 0);
    
    const expenses = dayTransactions
      .filter(t => t.type === "debit")
      .reduce((sum, t) => sum + t.amount, 0);
    
    return {
      name: format(date, "EEE"),
      earnings,
      expenses
    };
  });

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle>Revenue Overview</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="space-y-1">
            <div className="flex items-center text-sm">
              <ArrowDown className="mr-1 h-4 w-4 text-green-500" />
              <span className="text-muted-foreground">Income</span>
            </div>
            <p className="text-xl font-bold">₦{totalEarnings.toFixed(2)}</p>
          </div>
          <div className="space-y-1">
            <div className="flex items-center text-sm">
              <ArrowUp className="mr-1 h-4 w-4 text-red-500" />
              <span className="text-muted-foreground">Expenses</span>
            </div>
            <p className="text-xl font-bold">₦{totalExpenses.toFixed(2)}</p>
          </div>
        </div>

        <div className="h-[200px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={chartData}
              margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
            >
              <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.2} />
              <XAxis 
                dataKey="name" 
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 12 }}
              />
              <YAxis 
                hide={true}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip 
                formatter={(value) => [`$₦{Number(value).toFixed(2)}`, '']}
                labelStyle={{ color: '#888' }}
                contentStyle={{ 
                  backgroundColor: 'white', 
                  border: '1px solid #e2e8f0',
                  borderRadius: '0.5rem',
                  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)'
                }}
              />
              <Bar 
                dataKey="earnings" 
                fill="hsl(var(--chart-1))" 
                radius={[4, 4, 0, 0]} 
                barSize={20} 
              />
              <Bar 
                dataKey="expenses" 
                fill="hsl(var(--chart-2))" 
                radius={[4, 4, 0, 0]} 
                barSize={20} 
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}