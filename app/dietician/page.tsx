"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";

export default function DieticianRedirect() {
  const router = useRouter();
  

  useEffect(() => {
    // Simulating auth check - replace with actual auth check logic
    const isAuthenticated = localStorage.getItem("dietician_token");
    
    if (isAuthenticated) {
      router.push("/dietician/dashboard");
    } else {
      router.push("/dietician/login");
    }
  }, [router]);

  return (
    <div className="flex h-screen items-center justify-center">
      <div className="text-center">
        <Loader2 className="mx-auto h-8 w-8 animate-spin text-purple-600" />
        <p className="mt-4 text-sm text-muted-foreground">Redirecting...</p>
      </div>
    </div>
  );
}