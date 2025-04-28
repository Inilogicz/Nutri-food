
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { AuthProvider } from '@/context/AuthContext';
import Script from "next/script";
import { Suspense } from "react";
import { Loader2 } from 'lucide-react'; // 🔥 You forgot this import
import { Toaster } from "sonner";

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Diet Talk',
  description: 'Your nutrition companion',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <head>
        {/* Load Flutterwave Script */}
        <Script src="https://checkout.flutterwave.com/v3.js" strategy="beforeInteractive" />
      </head>
      <body className={inter.className}>
        <AuthProvider>
          <Suspense fallback={
            <div className="flex items-center justify-center h-screen">
              <Loader2 className="h-8 w-8 animate-spin text-purple-600" />
            </div>
          }>
            {/* <Navbar /> */}
            <main className="min-h-[calc(100vh-64px)]">
              {children}
              <Toaster position="top-center" />
            </main>
          </Suspense>
        </AuthProvider>

        {/* Flutterwave Event Listener */}
        <Script
          id="flutterwave-listener"
          dangerouslySetInnerHTML={{
            __html: `
              window.addEventListener('message', (e) => {
                if (e.data.type === 'flutterwavePayment') {
                  localStorage.setItem('flutterwaveTransaction', JSON.stringify(e.data.data));
                }
              });
            `,
          }}
        />
      </body>
    </html>
  );
}
