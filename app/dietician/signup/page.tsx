"use client";

import Image from "next/image";
import Link from "next/link";
import SignupForm from "@/components/dietician/auth/SignupForm";

export default function SignupPage() {
  return (
    <div className="grid min-h-screen grid-cols-1 md:grid-cols-2">
      <div className="relative hidden overflow-hidden md:block">
        <div className="absolute inset-0 bg-gradient-to-br from-purple-500 to-purple-600"></div>
        <div className="absolute inset-0 opacity-60">
          <Image
            src="https://images.pexels.com/photos/6551618/pexels-photo-6551618.jpeg" 
            alt="Nutritionist with healthy food"
            fill
            style={{ objectFit: "cover" }}
          />
        </div>
        <div className="absolute inset-0 flex flex-col items-center justify-center p-12 text-white">
          <h1 className="mb-6 text-4xl font-bold">Diet-Talk</h1>
          <p className="mb-8 max-w-md text-center text-xl">
            Join our platform of professional dieticians providing exceptional nutrition guidance
          </p>
          <div className="space-y-4 text-center">
            <p className="text-sm opacity-80">
              Expand your reach and help more clients achieve their nutrition goals
            </p>
          </div>
        </div>
      </div>
      <div className="flex flex-col justify-center overflow-y-auto p-8 md:p-12">
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
            <h1 className="text-3xl font-bold tracking-tight">
              Create your account
            </h1>
            <p className="mt-2 text-sm text-muted-foreground">
              Fill in your details to join as a dietician
            </p>
          </div>
          <SignupForm />
          <div className="mt-8 text-center text-sm">
            <p className="text-muted-foreground">
              Already have an account?{" "}
              <Link
                href="/dietician/login"
                className="font-medium text-purple-600 hover:text-purple-500"
              >
                Log in
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}