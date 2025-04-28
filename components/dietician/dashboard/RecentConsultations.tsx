"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Button } from "@/app/new/dietician/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/app/new/dietician/ui/card";
import { format } from "date-fns";
import { Loader2 } from "lucide-react";

interface User {
  id: number;
  name: string;
  email: string;
  avatar?: string;
}

interface Consultation {
  id: number;
  name: string | null;
  user_id: string;
  dietitian_id: string;
  rate_per_minute: string;
  duration_minutes: string;
  total_cost: string;
  status: "scheduled" | "ongoing" | "completed" | "cancelled";
  created_at: string;
  updated_at: string;
  user: User;
}

export default function RecentConsultations() {
  const [consultations, setConsultations] = useState<Consultation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchConsultations = async () => {
      try {
        setLoading(true);
        const response = await fetch("/api/proxy/consultations/my", {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        });

        if (!response.ok) {
          throw new Error("Failed to fetch consultations");
        }

        const data = await response.json();
        setConsultations(data.data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred");
      } finally {
        setLoading(false);
      }
    };

    fetchConsultations();
  }, []);

  // Get the most recent 5 completed consultations
  const recentConsultations = consultations
    .filter(consultation => consultation.status === "completed")
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    .slice(0, 5);

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Recent Consultations</CardTitle>
        </CardHeader>
        <CardContent className="flex justify-center items-center h-32">
          <Loader2 className="h-6 w-6 animate-spin text-purple-600" />
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Recent Consultations</CardTitle>
        </CardHeader>
        <CardContent className="text-center py-8">
          <p className="text-red-500 mb-2">Error loading consultations</p>
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => window.location.reload()}
          >
            Retry
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Recent Consultations</CardTitle>
        <Link href="/dietician/consultations">
          <Button variant="outline" size="sm">View All</Button>
        </Link>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Client</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Duration</TableHead>
              <TableHead className="text-right">Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {recentConsultations.map((consultation) => (
              <TableRow key={consultation.id}>
                <TableCell>
                  <div className="flex items-center gap-3">
                    <Avatar className="h-8 w-8">
                      <AvatarImage 
                        src={consultation.user.avatar || undefined} 
                        alt={consultation.user.name} 
                      />
                      <AvatarFallback>
                        {consultation.user.name.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium">{consultation.user.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {consultation.name || "Nutrition Consultation"}
                      </p>
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  {format(new Date(consultation.created_at), "MMM dd, yyyy")}
                </TableCell>
                <TableCell>{consultation.duration_minutes} mins</TableCell>
                <TableCell className="text-right">
                  <div className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                    consultation.status === "completed"
                      ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300"
                      : consultation.status === "cancelled"
                      ? "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300"
                      : "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300"
                  }`}>
                    {consultation.status.charAt(0).toUpperCase() + consultation.status.slice(1)}
                  </div>
                </TableCell>
              </TableRow>
            ))}
            {recentConsultations.length === 0 && (
              <TableRow>
                <TableCell colSpan={4} className="h-24 text-center">
                  No recent consultations
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}