"use client";

import Image from "next/image";
import Link from "next/link";
import LoginForm from "@/components/dietician/auth/LoginForm";
import { motion } from "framer-motion";
import { Toaster } from "sonner";

export default function LoginPage() {
  return (
    <>
      <Toaster position="top-center" richColors />
      <div className="grid min-h-screen grid-cols-1 md:grid-cols-2">
        {/* Hero Section */}
        <motion.div 
          className="relative hidden overflow-hidden md:block"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8 }}
        >
          <div className="absolute inset-0 bg-gradient-to-br from-purple-600 to-purple-800"></div>
          <div className="absolute inset-0 opacity-70">
            <Image
              src="/images/login-background.jpg"
              alt="Nutritionist with healthy food"
              fill
              priority
              quality={100}
              style={{ objectFit: "cover" }}
              className="scale-105"
            />
          </div>
          <div className="absolute inset-0 flex flex-col items-center justify-center p-12 text-white">
            <motion.h1 
              className="mb-6 text-5xl font-bold"
              initial={{ y: -20 }}
              animate={{ y: 0 }}
              transition={{ delay: 0.2 }}
            >
              Diet-Talk<span className="text-purple-300">Pro</span>
            </motion.h1>
            <motion.p 
              className="mb-8 max-w-md text-center text-xl leading-relaxed"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
            >
              <span className="bg-gradient-to-r from-purple-200 to-white bg-clip-text text-transparent">
                Empowering dietitians with intelligent nutrition solutions
              </span>
            </motion.p>
            <motion.div 
              className="space-y-4 text-center"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 }}
            >
              <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 text-sm backdrop-blur-sm">
                <span className="h-2 w-2 rounded-full bg-purple-300"></span>
                <span>Trusted by professionals</span>
              </div>
            </motion.div>
          </div>
        </motion.div>

        {/* Login Form Section */}
        <motion.div 
          className="flex flex-col justify-center p-8 md:p-12"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2, duration: 0.8 }}
        >
          <div className="mx-auto w-full max-w-md">
            <div className="mb-6 flex items-center justify-center">
              <Link href="/" className="flex items-center gap-2">
                <Image
                  src="/fulllogo.png"
                  alt="Diettalk logo"
                  width={100}
                  height={50}
                  className="h-8 w-auto object-contain"
                />
              </Link>
            </div>
            <div className="mb-8 text-center md:text-left">
              <motion.h1 
                className="text-3xl font-bold tracking-tight md:text-left"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4 }}
              >
                Welcome back
              </motion.h1>
              <motion.p 
                className="mt-2 text-sm text-muted-foreground"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
              >
                Sign in to your professional dashboard
              </motion.p>
            </div>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 }}
            >
              <LoginForm />
            </motion.div>

            <motion.div 
              className="mt-8 text-center text-sm"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.7 }}
            >
              <p className="text-muted-foreground">
                New to NutrifoodPro?{" "}
                <Link
                  href="/dietician/signup"
                  className="font-medium text-purple-600 hover:text-purple-500 transition-colors"
                >
                  Create an account
                </Link>
              </p>
              
            </motion.div>
          </div>
        </motion.div>
      </div>
    </>
  );
}


