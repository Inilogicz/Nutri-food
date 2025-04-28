"use client";

import { Activity, UserCheck, DollarSign, Calendar } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/app/new/dietician/ui/card";
import { useEffect, useState } from "react";
import { Skeleton } from "@/components/ui/skeleton";

interface StatsData {
  total_consultations: number;
  unique_users_messaging: number;
  monthly_earnings?: number;
  consultation_time?: number;
  previous_month?: {
    total_consultations: number;
    unique_users_messaging: number;
    monthly_earnings: number;
    consultation_time: number;
  };
}

export default function DashboardStats() {
  const [stats, setStats] = useState<StatsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await fetch('/api/proxy/dietitian/statistics');
        const data = await response.json();
        
        if (data.status && data.data) {
          // Simulate previous month's data (in a real app, this would come from your API)
          const previousMonthData = {
            total_consultations: Math.max(0, data.data.total_consultations - 2),
            unique_users_messaging: Math.max(0, data.data.unique_users_messaging - 1),
            monthly_earnings: 1000, // Base amount
            consultation_time: 8.5 // Base hours
          };

          setStats({
            ...data.data,
            monthly_earnings: 1240,
            consultation_time: 12.5,
            previous_month: previousMonthData
          });
        }
      } catch (error) {
        console.error("Error fetching stats:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  // Calculate percentage change helper function
  const calculateChange = (current: number, previous: number) => {
    if (previous === 0) return current > 0 ? 100 : 0;
    return ((current - previous) / previous) * 100;
  };

  // Calculate absolute change helper function
  const calculateAbsoluteChange = (current: number, previous: number) => {
    return current - previous;
  };

  if (loading) {
    return (
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[...Array(4)].map((_, i) => (
          <Card key={i} className="bg-white shadow-sm border-0">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-4 w-4 rounded-full" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-8 w-16 mt-2" />
              <Skeleton className="h-3 w-32 mt-2" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {/* Total Consultations */}
      <Card className="bg-white shadow-sm border-0 hover:shadow-md transition-all duration-300 group">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium text-gray-500">
            Total Consultations
          </CardTitle>
          <div className="p-2 rounded-lg bg-blue-50 group-hover:bg-blue-100 transition-colors">
            <Calendar className="h-4 w-4 text-blue-600" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-gray-800">
            {stats?.total_consultations || 0}
          </div>
          {stats?.previous_month && (
            <p className="text-xs text-gray-500 mt-1">
              <span className={
                stats.total_consultations >= (stats.previous_month.total_consultations || 0) 
                  ? "text-green-500 font-medium" 
                  : "text-red-500 font-medium"
              }>
                {Math.abs(calculateChange(
                  stats.total_consultations,
                  stats.previous_month.total_consultations
                )).toFixed(0)}%
                {stats.total_consultations >= (stats.previous_month.total_consultations || 0) ? '↑' : '↓'}
              </span> from last month
            </p>
          )}
        </CardContent>
      </Card>
      
      {/* Active Clients */}
      <Card className="bg-white shadow-sm border-0 hover:shadow-md transition-all duration-300 group">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium text-gray-500">
            Active Clients
          </CardTitle>
          <div className="p-2 rounded-lg bg-purple-50 group-hover:bg-purple-100 transition-colors">
            <UserCheck className="h-4 w-4 text-purple-600" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-gray-800">
            {stats?.unique_users_messaging || 0}
          </div>
          {stats?.previous_month && (
            <p className="text-xs text-gray-500 mt-1">
              <span className={
                stats.unique_users_messaging >= (stats.previous_month.unique_users_messaging || 0)
                  ? "text-green-500 font-medium"
                  : "text-red-500 font-medium"
              }>
                {calculateAbsoluteChange(
                  stats.unique_users_messaging,
                  stats.previous_month.unique_users_messaging
                ) > 0 ? '+' : ''}
                {calculateAbsoluteChange(
                  stats.unique_users_messaging,
                  stats.previous_month.unique_users_messaging
                )}
              </span> from last month
            </p>
          )}
        </CardContent>
      </Card>
      
      {/* Monthly Earnings */}
      <Card className="bg-white shadow-sm border-0 hover:shadow-md transition-all duration-300 group">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium text-gray-500">
            Monthly Earnings
          </CardTitle>
          <div className="p-2 rounded-lg bg-green-50 group-hover:bg-green-100 transition-colors">
            <DollarSign className="h-4 w-4 text-green-600" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-gray-800">
            ${stats?.monthly_earnings?.toLocaleString() || '0'}
          </div>
          {stats?.previous_month?.monthly_earnings && (
            <p className="text-xs text-gray-500 mt-1">
              <span className={
                (stats.monthly_earnings || 0) >= (stats.previous_month.monthly_earnings || 0)
                  ? "text-green-500 font-medium"
                  : "text-red-500 font-medium"
              }>
                {Math.abs(calculateChange(
                  stats.monthly_earnings || 0,
                  stats.previous_month.monthly_earnings || 0
                )).toFixed(0)}%
                {(stats.monthly_earnings || 0) >= (stats.previous_month.monthly_earnings || 0) ? '↑' : '↓'}
              </span> from last month
            </p>
          )}
        </CardContent>
      </Card>
      
      {/* Consultation Time */}
      <Card className="bg-white shadow-sm border-0 hover:shadow-md transition-all duration-300 group">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium text-gray-500">
            Consultation Time
          </CardTitle>
          <div className="p-2 rounded-lg bg-orange-50 group-hover:bg-orange-100 transition-colors">
            <Activity className="h-4 w-4 text-orange-600" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-gray-800">
            {stats?.consultation_time?.toFixed(1) || '0'} hrs
          </div>
          {stats?.previous_month?.consultation_time && (
            <p className="text-xs text-gray-500 mt-1">
              <span className={
                (stats.consultation_time || 0) >= (stats.previous_month.consultation_time || 0)
                  ? "text-green-500 font-medium"
                  : "text-red-500 font-medium"
              }>
                {calculateAbsoluteChange(
                  stats.consultation_time || 0,
                  stats.previous_month.consultation_time || 0
                ).toFixed(1)} hrs
                {(stats.consultation_time || 0) >= (stats.previous_month.consultation_time || 0) ? '↑' : '↓'}
              </span> from last month
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}