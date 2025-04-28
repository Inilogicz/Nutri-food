'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent } from "@/app/new/dietician/ui/card";
import { Button } from "@/app/new/dietician/ui/button";
import { Wallet, Plus, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from 'next/navigation';

export default function WalletSummary({ balance }: { balance: number }) {
  const [amount, setAmount] = useState('');
  const [showModal, setShowModal] = useState(false);
  const { user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    const script = document.createElement('script');
    script.src = "https://checkout.flutterwave.com/v3.js";
    script.async = true;
    document.body.appendChild(script);

    return () => {
      document.body.removeChild(script);
    };
  }, []);

  const handlePayment = async (amount: number) => {
    if (amount < 100) {
      alert('Minimum top-up is ₦100');
      return;
    }

    localStorage.setItem('topupAmount', amount.toString());

    const paymentData = {
      public_key: process.env.NEXT_PUBLIC_FLUTTERWAVE_PUBLIC_KEY,
      tx_ref: Date.now().toString(),
      amount: amount,
      currency: 'NGN',
      payment_options: 'card,ussd',
      customer: {
        email: user?.email,
        name: user?.name,
      },
      customizations: {
        title: 'Wallet Top-up',
        description: 'Top up your wallet',
        logo: '/logo.png',
      },
      redirect_url: `${window.location.origin}/payment/status`,
      callback: function(response: any) {
        console.log('Payment callback:', response);
      },
      onclose: function() {
        console.log('Payment closed');
      }
    };

    //@ts-ignore
    window.FlutterwaveCheckout(paymentData);
  };

  const quickAmounts = [500, 1000, 2000, 5000];

  return (
    <div className="w-full max-w-4xl mx-auto">
      <div className="flex flex-col lg:flex-row gap-4 lg:gap-6 p-4">
        {/* Wallet Card - More compact design */}
        <Card className="flex-1 rounded-xl lg:rounded-2xl overflow-hidden shadow-sm lg:shadow-md bg-gradient-to-br from-purple-600 to-purple-800 border-0">
          <CardContent className="p-4 lg:p-6 text-white">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-xs lg:text-sm text-purple-100/90 mb-1">Available Balance</p>
                <h2 className="text-2xl lg:text-4xl font-bold tracking-tight">₦{balance.toLocaleString('en-NG')}</h2>
              </div>
              <div className="bg-white/10 p-2 rounded-lg">
                <Wallet className="h-5 w-5 lg:h-6 lg:w-6 text-purple-100" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Top Up Button - Better sizing */}
        <Button
          onClick={() => setShowModal(true)}
          className="flex-1 h-auto py-3 lg:py-4 bg-gradient-to-r from-purple-700 to-purple-900 hover:from-purple-800 hover:to-purple-950 text-white rounded-xl lg:rounded-2xl text-base lg:text-lg font-semibold shadow-sm lg:shadow-md flex items-center justify-center gap-2"
        >
          <Plus className="h-4 w-4 lg:h-5 lg:w-5" />
          <span>Top Up Wallet</span>
        </Button>
      </div>

      {/* Enhanced Modal */}
      <AnimatePresence>
        {showModal && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 backdrop-blur-sm bg-black/30 flex justify-center items-center z-50 p-4"
            onClick={() => setShowModal(false)}
          >
            <motion.div 
              initial={{ scale: 0.9, y: 20, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              exit={{ scale: 0.9, y: 20, opacity: 0 }}
              transition={{ type: 'spring', stiffness: 400, damping: 25 }}
              className="bg-white p-6 rounded-xl shadow-xl w-full max-w-md relative"
              onClick={(e) => e.stopPropagation()}
            >
              <button 
                onClick={() => setShowModal(false)}
                className="absolute top-4 right-4 p-1 rounded-full hover:bg-gray-100 transition-colors"
              >
                <X className="h-5 w-5 text-gray-500" />
              </button>
              
              <div className="text-center mb-6">
                <h2 className="text-xl lg:text-2xl font-bold text-gray-800">Top Up Your Wallet</h2>
                <p className="text-gray-500 text-sm mt-1">Enter amount to continue</p>
              </div>
              
              <div className="mb-6">
                <input
                  type="number"
                  placeholder="₦0.00"
                  min="100"
                  className="w-full border-2 border-purple-200 focus:border-purple-500 rounded-xl p-4 text-center text-lg font-medium mb-4 outline-none transition-colors"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                />
                
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-4">
                  {quickAmounts.map((amt) => (
                    <button
                      key={amt}
                      onClick={() => setAmount(amt.toString())}
                      className={`py-2 px-3 rounded-lg border text-sm font-medium transition-colors ${
                        amount === amt.toString() 
                          ? 'bg-purple-100 border-purple-500 text-purple-700' 
                          : 'border-gray-300 hover:border-purple-300 text-gray-700'
                      }`}
                    >
                      ₦{amt.toLocaleString()}
                    </button>
                  ))}
                </div>
                
                <p className="text-xs text-gray-400 text-center">Minimum amount: ₦100</p>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-3">
                <Button
                  variant="outline"
                  onClick={() => setShowModal(false)}
                  className="flex-1 py-3 rounded-xl border-gray-300 text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </Button>
                <Button
                  onClick={() => handlePayment(Number(amount))}
                  disabled={!amount || Number(amount) < 100}
                  className="flex-1 py-3 rounded-xl bg-purple-600 hover:bg-purple-700 disabled:opacity-70 disabled:cursor-not-allowed"
                >
                  Continue to Payment
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}