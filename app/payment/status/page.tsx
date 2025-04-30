'use client'
import { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { motion } from 'framer-motion'
import { CheckCircle2, XCircle, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'

export default function PaymentStatusPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [status, setStatus] = useState<'loading' | 'success' | 'failed'>('loading')
  const [message, setMessage] = useState('Processing payment...')
  const [amount, setAmount] = useState<number>(0)
  const [retryCount, setRetryCount] = useState(0)

  // Process payment on page load
  useEffect(() => {
    const processPayment = async () => {
      const paymentStatus = searchParams.get('status')
      const transactionId = searchParams.get('transaction_id')
      const storedAmount = localStorage.getItem('topupAmount')

      if (!storedAmount) {
        setStatus('failed')
        setMessage('Payment session expired. Check your wallet balance.')
        return
      }

      const amountValue = Number(storedAmount)
      setAmount(amountValue)

      if (paymentStatus === 'successful') {
        try {
          // Send to backend API
          const response = await fetch('/api/user/top-up', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${localStorage.getItem('token')}`
            },
            body: JSON.stringify({
              amount: amountValue,
              transaction_id: transactionId
            })
          })

          if (response.ok) {
            localStorage.removeItem('topupAmount')
            setStatus('success')
            setMessage(`Success! ₦${amountValue.toLocaleString()} added to your wallet`)
          } else {
            throw new Error('Wallet update failed')
          }
        } catch (error) {
          console.error('Payment processing error:', error)
          
          if (retryCount < 2) {
            setRetryCount(c => c + 1)
            setMessage(`Retrying... (${retryCount + 1}/3)`)
            setTimeout(processPayment, 2000 * (retryCount + 1))
          } else {
            setStatus('failed')
            setMessage('Payment received but wallet update failed. Contact support.')
            localStorage.removeItem('topupAmount')
          }
        }
      } else {
        setStatus('failed')
        setMessage(
          paymentStatus === 'cancelled' 
            ? 'Payment cancelled' 
            : 'Payment failed'
        )
      }
    }

    processPayment()
  }, [searchParams, retryCount])

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center p-4">
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center"
      >
        {/* Loading State */}
        {status === 'loading' && (
          <div className="flex flex-col items-center">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
            >
              <Loader2 className="h-12 w-12 text-purple-600 mb-4" />
            </motion.div>
            <h2 className="text-xl font-semibold text-gray-800">{message}</h2>
            {retryCount > 0 && (
              <p className="text-sm text-gray-500 mt-2">
                Please wait while we complete your transaction...
              </p>
            )}
          </div>
        )}

        {/* Success State */}
        {status === 'success' && (
          <>
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', stiffness: 200 }}
            >
              <CheckCircle2 className="h-16 w-16 text-green-500 mx-auto mb-4" />
            </motion.div>
            <h1 className="text-2xl font-bold text-gray-800 mb-2">Top-Up Successful!</h1>
            <p className="text-gray-600 mb-6">{message}</p>
          </>
        )}

        {/* Failed State */}
        {status === 'failed' && (
          <>
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', stiffness: 200 }}
            >
              <XCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
            </motion.div>
            <h1 className="text-2xl font-bold text-gray-800 mb-2">
              {message.includes('cancelled') ? 'Payment Cancelled' : 'Payment Failed'}
            </h1>
            <p className="text-gray-600 mb-6">{message}</p>
          </>
        )}

        {/* Action Buttons */}
        <div className="space-y-3 mt-6">
          <Button
            onClick={() => router.push('/wallet')}
            className={`w-full py-6 text-lg font-semibold ${
              status === 'success' 
                ? 'bg-green-600 hover:bg-green-700' 
                : 'bg-purple-600 hover:bg-purple-700'
            }`}
          >
            {status === 'success' ? 'View Updated Wallet' : 'Back to Wallet'}
          </Button>

          {status === 'failed' && !message.includes('cancelled') && (
            <Button
              onClick={() => window.location.reload()}
              className="w-full py-6 text-lg font-semibold bg-amber-500 hover:bg-amber-600"
            >
              Try Again
            </Button>
          )}
        </div>

        {/* Transaction Reference */}
        {(status === 'success' || status === 'failed') && (
          <p className="text-sm text-gray-500 mt-6">
            Transaction ID: {searchParams.get('transaction_id') || 'N/A'}
          </p>
        )}
      </motion.div>
    </div>
  )
}