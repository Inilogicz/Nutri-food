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
  const [message, setMessage] = useState('Updating wallet...')
  const [amount, setAmount] = useState<number>(0)

  useEffect(() => {
    const processTopUp = async () => {
      const paymentStatus = searchParams.get('status')
      const transactionId = searchParams.get('transaction_id')
      const storedAmount = localStorage.getItem('topupAmount')

      if (paymentStatus !== 'successful') {
        setStatus('failed')
        setMessage(paymentStatus === 'cancelled' ? 'Payment cancelled' : 'Payment failed')
        return
      }

      if (!storedAmount) {
        setStatus('failed')
        setMessage('Payment verification failed. Contact support with your transaction ID.')
        return
      }

      const amountValue = Number(storedAmount)
      setAmount(amountValue)

      try {
        // Immediately update wallet via API
        const response = await fetch('/api/proxy/user/top-up', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          },
          body: JSON.stringify({
            amount: amountValue,
            transaction_id: transactionId,
            source: 'flutterwave_callback'
          })
        })

        if (response.ok) {
          localStorage.removeItem('topupAmount')
          setStatus('success')
          setMessage(`₦${amountValue.toLocaleString()} added to your wallet!`)
        } else {
          const errorData = await response.json()
          throw new Error(errorData.message || 'Wallet update failed')
        }
      } catch (error) {
        console.error('Top-up error:', error)
        setStatus('failed')
        setMessage('Wallet update failed. Your balance will update shortly.')
        localStorage.removeItem('topupAmount')
      }
    }

    processTopUp()
  }, [searchParams])

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center p-4">
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center"
      >
        {status === 'loading' && (
          <div className="flex flex-col items-center">
            <Loader2 className="h-12 w-12 text-purple-600 mb-4 animate-spin" />
            <h2 className="text-xl font-semibold text-gray-800">{message}</h2>
          </div>
        )}

        {status === 'success' && (
          <>
            <CheckCircle2 className="h-16 w-16 text-green-500 mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-gray-800 mb-2">Payment Successful!</h1>
            <p className="text-gray-600 mb-6">{message}</p>
          </>
        )}

        {status === 'failed' && (
          <>
            <XCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-gray-800 mb-2">Payment Issue</h1>
            <p className="text-gray-600 mb-6">{message}</p>
          </>
        )}

        <Button
          onClick={() => router.push('/wallet')}
          className={`w-full py-6 text-lg font-semibold mt-6 ${
            status === 'success' ? 'bg-green-600' : 'bg-purple-600'
          }`}
        >
          {status === 'success' ? 'View Wallet' : 'Back to Wallet'}
        </Button>

        {(status === 'success' || status === 'failed') && (
          <p className="text-sm text-gray-500 mt-4">
            Transaction ID: {searchParams.get('transaction_id') || 'N/A'}
          </p>
        )}
      </motion.div>
    </div>
  )
}