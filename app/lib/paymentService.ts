// import axios from 'axios';

// // Add to your .env.local:
// // NEXT_PUBLIC_FLUTTERWAVE_PUBLIC_KEY=FLWPUBK_TEST-4390d7ef63ee62f006e9c7e71dddf124-X
// // FLUTTERWAVE_SECRET_KEY=YOUR_TEST_SECRET_KEY

// interface PaymentVerificationResult {
//   success: boolean;
//   message?: string;
//   data?: {
//     amount: number;
//     transactionId: string;
//     currency: string;
//     paymentStatus: string;
//   };
// }

// interface WalletUpdateResult {
//   success: boolean;
//   message?: string;
//   newBalance?: number;
// }

// export const initiatePayment = async (
//   amount: number,
//   email: string,
//   name: string
// ): Promise<void> => {
//   try {
//     await loadFlutterwaveScript();

//     const paymentData = {
//       public_key: process.env.NEXT_PUBLIC_FLUTTERWAVE_PUBLIC_KEY,
//       tx_ref: `wallet-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
//       amount,
//       currency: 'NGN',
//       payment_options: 'card,ussd,banktransfer',
//       customer: {
//         email,
//         name,
//       },
//       customizations: {
//         title: 'Wallet Top-up',
//         description: `Funding wallet with ₦${amount}`,
//         logo: `${window.location.origin}/logo.png`,
//       },
//       callback_url: `${window.location.origin}/payment/callback`,
//     };

//     if (window.FlutterwaveCheckout) {
//       window.FlutterwaveCheckout(paymentData);
//     } else {
//       throw new Error('Flutterwave checkout not loaded');
//     }
//   } catch (error) {
//     console.error('Payment initiation failed:', error);
//     throw error;
//   }
// };

// const loadFlutterwaveScript = (): Promise<void> => {
//   return new Promise((resolve, reject) => {
//     if (typeof window !== 'undefined' && !window.FlutterwaveCheckout) {
//       const script = document.createElement('script');
//       script.src = 'https://checkout.flutterwave.com/v3.js';
//       script.async = true;
//       script.onload = () => resolve();
//       script.onerror = () => reject(new Error('Failed to load Flutterwave script'));
//       document.body.appendChild(script);
//     } else {
//       resolve();
//     }
//   });
// };

// export const verifyFlutterwavePayment = async (
//   transactionId: string
// ): Promise<PaymentVerificationResult> => {
//   try {
//     const response = await axios.get(
//       `https://api.flutterwave.com/v3/transactions/${transactionId}/verify`,
//       {
//         headers: {
//           Authorization: `Bearer ${process.env.FLUTTERWAVE_SECRET_KEY}`,
//         },
//       }
//     );

//     const { status, currency, amount, id } = response.data.data;
//     return {
//       success: status === "successful",
//       message: status !== "successful" ? `Payment status: ${status}` : undefined,
//       data: {
//         amount,
//         transactionId: id.toString(),
//         currency,
//         paymentStatus: status,
//       },
//     };
//   } catch (error) {
//     console.error('Verification error:', error);
//     return {
//       success: false,
//       message: error.response?.data?.message || 'Payment verification failed',
//     };
//   }
// };

// export const updateWalletBalance = async (amount: number): Promise<WalletUpdateResult> => {
//   try {
//     const response = await axios.post(
//       `${process.env.API_BASE_URL}/user/top-up`,
//       { amount },
//       {
//         headers: {
//           'Content-Type': 'application/json',
//           'Authorization': `Bearer ${localStorage.getItem('token')}`,
//         },
//       }
//     );

//     return {
//       success: true,
//       newBalance: response.data.newBalance,
//     };
//   } catch (error) {
//     console.error('Balance update error:', error);
//     return {
//       success: false,
//       message: error.response?.data?.message || 'Failed to update balance',
//     };
//   }
// };