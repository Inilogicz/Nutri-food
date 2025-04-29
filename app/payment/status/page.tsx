'use client';
import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { motion } from "framer-motion";
import { CheckCircle2, XCircle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function PaymentStatusPage() {
  const searchParams = useSearchParams();
  const { token } = useAuth();
  const router = useRouter();
  const [status, setStatus] = useState<'loading' | 'success' | 'failed'>('loading');
  const [message, setMessage] = useState('Processing your payment...');
  const [amount, setAmount] = useState<number | null>(null);

  useEffect(() => {
    const paymentStatus = searchParams.get('status');
    const storedAmount = localStorage.getItem('topupAmount');

    // Clear the amount from localStorage regardless of status
    if (storedAmount) {
      setAmount(Number(storedAmount));
      localStorage.removeItem('topupAmount');
    }

    const handlePayment = async () => {
      try {
        // If Flutterwave says successful, we trust that and proceed to topup
        if (paymentStatus === 'successful' && amount) {
          const response = await fetch('/api/proxy/user/top-up', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ amount })
          });

          if (!response.ok) {
            console.error('Top-up failed:', await response.text());
            // Even if top-up API fails, we consider payment successful (money was taken)
            // But we'll show a note that wallet update is pending
            setStatus('success');
            setMessage(`Payment received but wallet update pending. Contact support if balance doesn't update soon.`);
            return;
          }

          setStatus('success');
          setMessage(`You've successfully topped up your account with ₦${amount.toLocaleString()}`);
        } else {
          // Handle cancelled or failed payments
          setStatus('failed');
          setMessage(
            paymentStatus === 'cancelled' 
              ? 'Payment was cancelled' 
              : 'Unfortunately, we were unable to top up your account'
          );
        }
      } catch (error) {
        console.error('Payment processing error:', error);
        setStatus('failed');
        setMessage('Payment processing error. Please check your wallet balance.');
      }
    };

    handlePayment();
  }, [searchParams, token, amount]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center p-4">
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center"
      >
        {status === 'loading' ? (
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
            className="flex flex-col items-center"
          >
            <Loader2 className="h-12 w-12 text-purple-600 mb-4" />
            <h2 className="text-xl font-semibold text-gray-800">{message}</h2>
          </motion.div>
        ) : status === 'success' ? (
          <>
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', stiffness: 200 }}
            >
              <CheckCircle2 className="h-16 w-16 text-green-500 mx-auto mb-4" />
            </motion.div>
            <h1 className="text-2xl font-bold text-gray-800 mb-2">Payment Received!</h1>
            <p className="text-gray-600 mb-6">
              {message}
            </p>
          </>
        ) : (
          <>
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', stiffness: 200 }}
            >
              <XCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
            </motion.div>
            <h1 className="text-2xl font-bold text-gray-800 mb-2">Payment Not Completed</h1>
            <p className="text-gray-600 mb-6">
              {message}
            </p>
          </>
        )}

        <motion.div
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <Button
            onClick={() => router.push('/wallet')}
            className={`w-full py-6 rounded-xl text-lg font-semibold ${
              status === 'success'
                ? 'bg-purple-600 hover:bg-purple-700'
                : 'bg-red-600 hover:bg-red-700'
            }`}
          >
            Back to Wallet
          </Button>
        </motion.div>

        {status === 'success' && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="text-sm text-gray-500 mt-4"
          >
            Transaction ID: {searchParams.get('transaction_id') || 'N/A'}
          </motion.p>
        )}
      </motion.div>
    </div>
  );
}