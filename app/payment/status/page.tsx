'use client'
import { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { motion } from 'framer-motion'
import { CheckCircle2, XCircle, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'

type PaymentStatus = 'loading' | 'success' | 'failed'
type PaymentData = {
  amount: number
  tx_ref: string
  timestamp: number
}

export default function PaymentStatusPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [status, setStatus] = useState<PaymentStatus>('loading')
  const [message, setMessage] = useState('Finalizing transaction...')
  const [amount, setAmount] = useState<number>(0)
  const [txRef, setTxRef] = useState<string>('')

  useEffect(() => {
    const processPayment = async () => {
      try {
        const paymentStatus = searchParams.get('status')
        const transactionId = searchParams.get('transaction_id')
        const storedData = localStorage.getItem('topupData')

        if (!storedData) {
          throw new Error('Transaction data not found')
        }

        const paymentData: PaymentData = JSON.parse(storedData)
        setAmount(paymentData.amount)
        setTxRef(paymentData.tx_ref)

        if (paymentStatus !== 'successful') {
          throw new Error(paymentStatus === 'cancelled' ? 'Payment cancelled' : 'Payment failed')
        }

        const response = await fetch('/api/proxy/user/top-up', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token') || ''}`
          },
          body: JSON.stringify({ amount: paymentData.amount })
        })

        if (!response.ok) {
          const errorData = await response.json()
          throw new Error(errorData.message || 'Wallet update failed')
        }

        localStorage.removeItem('topupData')
        setStatus('success')
        setMessage(`₦${paymentData.amount.toLocaleString('en-NG')} added successfully!`)
      } catch (error) {
        console.error('Payment processing error:', error)
        setStatus('failed')
        setMessage(
          error instanceof Error 
            ? error.message.includes('cancelled') 
              ? 'Payment was cancelled' 
              : error.message
            : 'Payment processing failed'
        )
      }
    }

    processPayment()
  }, [searchParams])

  const handleRefresh = () => window.location.reload()
  const handleWalletRedirect = () => router.push('/wallet')

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100  flex items-center justify-center p-4">
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.3 }}
        className="bg-white rounded-2xl shadow-xl p-6 sm:p-8 w-full max-w-md text-center"
      >
        {status === 'loading' ? (
          <div className="flex flex-col items-center py-4">
            <Loader2 className="h-12 w-12 text-blue-500 animate-spin mb-4" />
            <h2 className="text-xl font-semibold text-gray-800">{message}</h2>
          </div>
        ) : status === 'success' ? (
          <>
            <CheckCircle2 className="h-16 w-16 text-green-500 mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-gray-800 mb-2">Top-Up Successful!</h1>
            <p className="text-gray-600 mb-6">{message}</p>
          </>
        ) : (
          <>
            <XCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-gray-800 mb-2">
              {message.includes('cancelled') ? 'Payment Cancelled' : 'Payment Failed'}
            </h1>
            <p className="text-gray-600 mb-6">{message}</p>
          </>
        )}

        <div className="mt-6 space-y-3">
          <Button
            onClick={handleWalletRedirect}
            size="lg"
            className={`w-full ${
              status === 'success' 
                ? 'bg-green-600 hover:bg-green-700' 
                : 'bg-blue-600 hover:bg-blue-700'
            }`}
          >
            {status === 'success' ? 'View Wallet' : 'Back to Wallet'}
          </Button>

          {status === 'failed' && !message.includes('cancelled') && (
            <Button
              onClick={handleRefresh}
              size="lg"
              variant="outline"
              className="w-full bg-amber-500 hover:bg-amber-600 text-white"
            >
              Refresh Status
            </Button>
          )}
        </div>

        {(txRef || searchParams.get('transaction_id')) && (
          <div className="mt-6 text-sm text-gray-500 space-y-1">
            {txRef && <p>Reference: {txRef}</p>}
            {searchParams.get('transaction_id') && (
              <p>Transaction ID: {searchParams.get('transaction_id')}</p>
            )}
          </div>
        )}
      </motion.div>
    </div>
  )
}