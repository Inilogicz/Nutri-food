"use client";

import { Card, CardContent } from "@/app/new/dietician/ui/card";
import { Button } from "@/app/new/dietician/ui/button";
import { ArrowUpRight, ArrowDownLeft, Wallet, CreditCard } from "lucide-react";

interface WalletSummaryProps {
  balance: number;
}

export default function WalletSummary({ balance }: WalletSummaryProps) {
  return (
    <div className="grid gap-4 md:grid-cols-2">
      <Card className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-purple-600 to-purple-800" />
        <CardContent className="relative flex flex-col justify-between p-6 text-white">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium text-purple-100">Available Balance</p>
              <Wallet className="h-5 w-5 text-purple-100" />
            </div>
            <h2 className="text-3xl font-bold">₦{balance.toFixed(2)}</h2>
          </div>
          <div className="mt-6">
            <p className="mb-2 text-xs text-purple-100">Nutrifood Wallet</p>
            <div className="flex justify-between">
              <p className="text-xs text-purple-100">****-****-****-3456</p>
              <CreditCard className="h-4 w-4 text-purple-100" />
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 gap-4 md:grid-rows-2">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Add Funds</p>
                <h3 className="mt-1 text-2xl font-semibold">Deposit</h3>
              </div>
              <div className="rounded-full bg-green-100 p-2 dark:bg-green-900">
                <ArrowDownLeft className="h-5 w-5 text-green-600 dark:text-green-400" />
              </div>
            </div>
            <Button className="mt-4 w-full bg-purple-600 hover:bg-purple-700">
              Add Money
            </Button>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Transfer to Bank</p>
                <h3 className="mt-1 text-2xl font-semibold">Withdraw</h3>
              </div>
              <div className="rounded-full bg-blue-100 p-2 dark:bg-blue-900">
                <ArrowUpRight className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              </div>
            </div>
            <Button className="mt-4 w-full" variant="outline">
              Withdraw Funds
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}