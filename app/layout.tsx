import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { AuthProvider } from '@/context/AuthContext';
import Script from "next/script";
import { Suspense } from "react";
import { Loader2 } from 'lucide-react';
import { Toaster } from "sonner";

const inter = Inter({ subsets: ['latin'] });

export const viewport = {
  themeColor: '#9218f9',
  // other viewport settings
}
export const metadata = {
  title: "Diet Talk",
  description: "Your nutrition companion",
  icons: {
    icon: "/dietlogo.png", // Default icon (32x32 recommended)
    shortcut: "/dietlogo.png", // For older browsers
    apple: "/dietlogo.png", // Apple touch icon (180x180 recommended)
  },
  // Optional: Add these if you want to support PWA
  manifest: "/manifest.json",
  themeColor: "#9218f9", // Your brand purple color
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