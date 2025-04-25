// app/layout.tsx
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { AuthProvider } from '@/context/AuthContext';
// import Navbar from '@/components/ui/Navbar';
import { Toaster } from "sonner";

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Nutri-Food',
  description: 'Your nutrition companion',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <AuthProvider>
          {/* <Navbar /> */}
          <main className="min-h-[calc(100vh-64px)]">
            {children}
            <Toaster position="top-center" />
          </main>
        </AuthProvider>
      </body>
    </html>
  );
}