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
  const [message, setMessage] = useState('Finalizing transaction...')
  const [amount, setAmount] = useState<number>(0)
  const [txRef, setTxRef] = useState<string>('')

  useEffect(() => {
    const processPayment = async () => {
      // 1. Get Flutterwave callback status
      const paymentStatus = searchParams.get('status')

      // 2. Retrieve stored payment data
      const storedData = localStorage.getItem('topupData')
      if (!storedData) {
        setStatus('failed')
        setMessage('Transaction data not found. Please check your wallet balance.')
        return
      }

      // 3. Parse stored data
      let paymentData: { amount: number; tx_ref: string; timestamp: number }
      try {
        paymentData = JSON.parse(storedData)
        setAmount(paymentData.amount)
        setTxRef(paymentData.tx_ref)
      } catch (e) {
        setStatus('failed')
        setMessage('Invalid transaction data. Contact support with transaction ID.')
        return
      }

      // 4. Verify payment status
      if (paymentStatus !== 'successful') {
        setStatus('failed')
        setMessage(paymentStatus === 'cancelled' ? 'Payment was cancelled' : 'Payment failed')
        localStorage.removeItem('topupData')
        return
      }

      // 5. Update wallet via API - ONLY SEND AMOUNT
      try {
        const response = await fetch('/api/proxy/user/top-up', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          },
          body: JSON.stringify({
            amount: paymentData.amount // Only sending amount to the endpoint
          })
        })

        if (!response.ok) {
          const errorData = await response.json()
          throw new Error(errorData.message || 'Wallet update failed')
        }

        // 6. Success case
        localStorage.removeItem('topupData')
        setStatus('success')
        setMessage(`₦${paymentData.amount.toLocaleString('en-NG')} added successfully!`)
      } catch (error) {
        console.error('Top-up error:', error)
        setStatus('failed')
        setMessage('Payment verified but wallet update pending. Refresh in 2 minutes.')
      }
    }

    processPayment()
  }, [searchParams])

  const handleRefresh = () => {
    window.location.reload()
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center p-4">
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center"
      >
        {/* UI remains the same */}
        {status === 'loading' && (
          <div className="flex flex-col items-center">
            <Loader2 className="h-12 w-12 text-blue-500 animate-spin mb-4" />
            <h2 className="text-xl font-semibold text-gray-800">{message}</h2>
          </div>
        )}

        {status === 'success' && (
          <>
            <CheckCircle2 className="h-16 w-16 text-green-500 mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-gray-800 mb-2">Top-Up Successful!</h1>
            <p className="text-gray-600 mb-6">{message}</p>
          </>
        )}

        {status === 'failed' && (
          <>
            <XCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-gray-800 mb-2">
              {message.includes('cancelled') ? 'Payment Cancelled' : 'Payment Issue'}
            </h1>
            <p className="text-gray-600 mb-6">{message}</p>
          </>
        )}

        <div className="mt-6 space-y-3">
          <Button
            onClick={() => router.push('/wallet')}
            className={`w-full py-6 text-lg font-semibold ${
              status === 'success' ? 'bg-green-600 hover:bg-green-700' 
              : 'bg-blue-600 hover:bg-blue-700'
            }`}
          >
            {status === 'success' ? 'View Wallet' : 'Back to Wallet'}
          </Button>

          {status === 'failed' && !message.includes('cancelled') && (
            <Button
              onClick={handleRefresh}
              className="w-full py-6 text-lg font-semibold bg-amber-500 hover:bg-amber-600"
            >
              Refresh Status
            </Button>
          )}
        </div>

        <div className="mt-6 text-sm text-gray-500 space-y-1">
          {txRef && <p>Reference: {txRef}</p>}
          {searchParams.get('transaction_id') && (
            <p>Transaction ID: {searchParams.get('transaction_id')}</p>
          )}
        </div>
      </motion.div>
    </div>
  )
}