'use client';
import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { motion } from "framer-motion";
import { CheckCircle2, XCircle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
// Ensure the correct path to the use-toast module
// import toast  from "@/components/ui/usetoast"; // Update the path if necessary

export default function PaymentStatusPage() {
  const searchParams = useSearchParams();
  const { token } = useAuth();
  const router = useRouter();
  const [status, setStatus] = useState<'loading' | 'success' | 'failed'>('loading');
  const [message, setMessage] = useState('Verifying payment...');
  const [amount, setAmount] = useState<number | null>(null);
  const [retryCount, setRetryCount] = useState(0);

  useEffect(() => {
    const paymentStatus = searchParams.get('status');
    const txRef = searchParams.get('tx_ref');
    const transactionId = searchParams.get('transaction_id');
    const storedAmount = localStorage.getItem('topupAmount');

    // Clear the amount from localStorage immediately
    if (storedAmount) {
      setAmount(Number(storedAmount));
      localStorage.removeItem('topupAmount');
    }

    const processPayment = async () => {
      try {
        // Step 1: Verify with Flutterwave
        const verificationResponse = await fetch('/api/payments/verify', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({
            transaction_id: transactionId,
            tx_ref: txRef
          })
        });

        if (!verificationResponse.ok) {
          throw new Error('Payment verification failed');
        }

        const verificationData = await verificationResponse.json();

        if (verificationData.status !== 'success') {
          throw new Error(verificationData.message || 'Payment not confirmed');
        }

        // Step 2: Process top-up (with retry logic)
        const topupResponse = await fetch('/api/user/top-up', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({ 
            amount: amount,
            transaction_id: transactionId,
            tx_ref: txRef
          })
        });

        if (!topupResponse.ok) {
          const errorData = await topupResponse.json();
          throw new Error(errorData.message || 'Top-up failed');
        }

        // Success case
        setStatus('success');
        setMessage(`Success! ₦${amount?.toLocaleString()} added to your wallet`);
        
      } catch (error) {
        console.error('Payment processing error:', error);
        
        // Retry logic (max 3 times)
        if (retryCount < 3) {
          setRetryCount(prev => prev + 1);
          setMessage(`Retrying... (${retryCount + 1}/3)`);
          setTimeout(processPayment, 2000 * (retryCount + 1)); // Exponential backoff
          return;
        }

        // Final failure
        setStatus('failed');
        setMessage('Payment verified but wallet update failed. Contact support with your transaction ID.');

        // Send error to backend for investigation
        await fetch('/api/payments/log-error', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({
            transaction_id: transactionId,
            tx_ref: txRef,
            error: error instanceof Error ? error.message : 'Unknown error',
            amount: amount
          })
        });
      }
    };

    if (paymentStatus === 'successful' && transactionId) {
      processPayment();
    } else {
      setStatus('failed');
      setMessage(
        paymentStatus === 'cancelled' 
          ? 'Payment was cancelled' 
          : paymentStatus === 'failed'
          ? 'Payment failed'
          : 'Invalid payment status'
      );
    }
  }, [searchParams, token, amount, retryCount]);

  const handleContactSupport = () => {
    const transactionId = searchParams.get('transaction_id');
    const subject = `Payment Issue - TXN: ${transactionId}`;
    const body = `I'm having issues with my payment (Transaction ID: ${transactionId}). The amount was ${amount}.`;
    
    window.open(`mailto:support@diet-talk.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`);
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
            {retryCount > 0 && (
              <p className="text-sm text-gray-500 mt-2">
                Taking longer than expected...
              </p>
            )}
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
            <h1 className="text-2xl font-bold text-gray-800 mb-2">Payment Successful!</h1>
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
            <h1 className="text-2xl font-bold text-gray-800 mb-2">Payment Issue</h1>
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
                status === 'success'
                  ? 'bg-purple-600 hover:bg-purple-700'
                  : 'bg-gray-600 hover:bg-gray-700'
              }`}
            >
              Back to Wallet
            </Button>
          </motion.div>

          {status === 'failed' && (
            <motion.div
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <Button
                onClick={handleContactSupport}
                className="w-full py-6 rounded-xl text-lg font-semibold bg-red-600 hover:bg-red-700"
              >
                Contact Support
              </Button>
            </motion.div>
          )}
        </div>

        {(status === 'success' || status === 'failed') && (
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