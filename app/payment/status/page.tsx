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
  const [message, setMessage] = useState('Completing transaction...');
  const [amount, setAmount] = useState<number | null>(null);
  const [retries, setRetries] = useState(0);

  useEffect(() => {
    const paymentStatus = searchParams.get('status');
    const transactionId = searchParams.get('transaction_id');
    const storedAmount = localStorage.getItem('topupAmount');

    if (!storedAmount) {
      setStatus('failed');
      setMessage('Missing payment details. Please check your wallet balance.');
      return;
    }

    const amountValue = Number(storedAmount);
    setAmount(amountValue);

    if (paymentStatus === 'successful') {
      processTopUp(amountValue, transactionId);
    } else {
      setStatus('failed');
      setMessage(
        paymentStatus === 'cancelled' 
          ? 'Payment was cancelled' 
          : 'Payment not completed'
      );
    }
  }, [searchParams]);

  const processTopUp = async (amount: number, transactionId: string | null) => {
    try {
      const response = await fetch('/api/user/top-up', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ 
          amount,
          transaction_id: transactionId,
          source: 'frontend_verification'
        })
      });

      if (response.ok) {
        localStorage.removeItem('topupAmount');
        setStatus('success');
        setMessage(`Success! ₦${amount.toLocaleString()} added to your wallet`);
      } else {
        throw new Error(await response.text());
      }
    } catch (error) {
      console.error('Top-up error:', error);
      
      if (retries < 2) {
        setRetries(prev => prev + 1);
        setMessage(`Retrying... (Attempt ${retries + 1}/3)`);
        setTimeout(() => processTopUp(amount, transactionId), 2000 * (retries + 1));
      } else {
        setStatus('failed');
        setMessage('Payment received but wallet update failed. Your balance will update soon.');
        localStorage.removeItem('topupAmount');
      }
    }
  };

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
            <h1 className="text-2xl font-bold text-gray-800 mb-2">All Set!</h1>
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
            <h1 className="text-2xl font-bold text-gray-800 mb-2">Oops!</h1>
            <p className="text-gray-600 mb-6">
              {message}
            </p>
          </>
        )}

        <div className="space-y-3">
          <motion.div
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <Button
              onClick={() => router.push('/wallet')}
              className={`w-full py-6 rounded-xl text-lg font-semibold ${
                status === 'success' ? 'bg-green-600 hover:bg-green-700' 
                : 'bg-purple-600 hover:bg-purple-700'
              }`}
            >
              {status === 'success' ? 'View Wallet' : 'Back to Wallet'}
            </Button>
          </motion.div>

          {status === 'failed' && retries >= 2 && (
            <Button
              onClick={() => window.location.reload()}
              className="w-full py-6 rounded-xl text-lg font-semibold bg-amber-600 hover:bg-amber-700"
            >
              Try Again
            </Button>
          )}
        </div>

        {(status === 'success' || status === 'failed') && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="text-sm text-gray-500 mt-4"
          >
            {searchParams.get('transaction_id') && 
              `Reference: ${searchParams.get('transaction_id')}`}
          </motion.p>
        )}
      </motion.div>
    </div>
  );
}