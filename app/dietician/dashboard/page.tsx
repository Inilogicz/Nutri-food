"use client";

import DashboardStats from "@/components/dietician/dashboard/DashboardStats";
import RecentConsultations from "@/components/dietician/dashboard/RecentConsultations";
import UpcomingConsultations from "@/components/dietician/dashboard/UpcomingConsultations";
import RecentMessages from "@/components/dietician/dashboard/RecentMessages";
import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";

export default function DashboardPage() {
  const [isLoading, setIsLoading] = useState(true);
  const { isAuthenticated, loading: authLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push("/dietician/login");
    }
  }, [isAuthenticated, authLoading, router]);

  useEffect(() => {
    // Simulate loading data only if authenticated
    if (isAuthenticated) {
      const timer = setTimeout(() => {
        setIsLoading(false);
      }, 1000);

      return () => clearTimeout(timer);
    }
  }, [isAuthenticated]);

  if (authLoading || !isAuthenticated) {
    return (
      <div className="flex h-[calc(100vh-5rem)] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-purple-600" />
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex h-[calc(100vh-5rem)] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-purple-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
      </div>
      
      <DashboardStats />
      
      <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
        <UpcomingConsultations />
        <RecentMessages />
      </div>
      
      <RecentConsultations />
    </div>
  );
}