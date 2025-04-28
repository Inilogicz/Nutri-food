'use client';

import { Card, CardContent } from "@/app/new/dietician/ui/card";
import { Button } from "@/app/new/dietician/ui/button";
import { Wallet, ArrowUpRight, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from 'next/navigation';
import { useState } from "react";

interface WalletSummaryProps {
  balance: number;
}

export default function WalletSummary({ balance }: WalletSummaryProps) {
  const [showComingSoon, setShowComingSoon] = useState(false);
  const router = useRouter();

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
      minimumFractionDigits: 2
    }).format(amount);
  };

  return (
    <div className="w-full max-w-4xl mx-auto px-4">
      <div className="flex flex-col lg:flex-row gap-4 lg:gap-6 py-4">
        <Card className="flex-1 rounded-2xl overflow-hidden shadow-sm bg-gradient-to-br from-purple-600 to-purple-800 border-0">
          <CardContent className="p-6 text-white">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm text-purple-100/90 mb-1">Available Balance</p>
                <h2 className="text-4xl font-bold tracking-tighter">
                  {formatCurrency(balance)}
                </h2>
                <p className="text-xs text-purple-100/80 mt-2">
                  Updated in real-time
                </p>
              </div>
              <div className="bg-white/10 p-3 rounded-xl">
                <Wallet className="h-6 w-6 text-purple-100" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Button
          onClick={() => setShowComingSoon(true)}
          className="flex-1 h-auto py-4 bg-white hover:bg-gray-50 text-purple-700 border border-purple-200 rounded-2xl text-lg font-semibold shadow-sm flex items-center justify-center gap-2"
        >
          <ArrowUpRight className="h-5 w-5" />
          <span>Withdraw Funds</span>
        </Button>
      </div>

      <AnimatePresence>
        {showComingSoon && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 backdrop-blur-sm bg-black/30 flex justify-center items-center z-50 p-4"
            onClick={() => setShowComingSoon(false)}
          >
            <motion.div 
              initial={{ scale: 0.9, y: 20, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              exit={{ scale: 0.9, y: 20, opacity: 0 }}
              transition={{ type: 'spring', stiffness: 400, damping: 25 }}
              className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-md relative overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="absolute -top-20 -right-20 w-40 h-40 rounded-full bg-purple-100/30"></div>
              <div className="absolute -bottom-20 -left-20 w-40 h-40 rounded-full bg-purple-100/30"></div>
              
              <button 
                onClick={() => setShowComingSoon(false)}
                className="absolute top-4 right-4 p-1 rounded-full hover:bg-gray-100 transition-colors"
              >
                <X className="h-5 w-5 text-gray-500" />
              </button>
              
              <div className="relative z-10 text-center">
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-purple-100 mb-4">
                  <Wallet className="h-8 w-8 text-purple-600" />
                </div>
                
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Coming Soon!</h2>
                <p className="text-gray-500 mb-6">
                  We're working hard to bring you the ability to withdraw your earnings directly to your bank account.
                </p>
                
                <div className="bg-purple-50/50 border border-purple-100 rounded-xl p-4 mb-6">
                  <p className="text-sm text-purple-800 font-medium">
                    In the meantime, your funds are safe with us and will be available as soon as withdrawals are enabled.
                  </p>
                </div>
                
                <Button
                  onClick={() => setShowComingSoon(false)}
                  className="w-full py-3 rounded-xl bg-purple-600 hover:bg-purple-700"
                >
                  Got it!
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}