"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Button } from "@/app/new/dietician/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader, CardTitle } from "@/app/new/dietician/ui/card";
import { CalendarPlus, Clock, Video } from "lucide-react";
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

export default function OngoingConsultations() {
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

  // Filter for ongoing consultations
  const ongoingConsultations = consultations
    .filter(consultation => consultation.status === "ongoing")
    .sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Ongoing Consultations</CardTitle>
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
          <CardTitle>Ongoing Consultations</CardTitle>
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
        <CardTitle>Ongoing Consultations</CardTitle>
        <Link href="/dietician/consultations">
          <Button variant="outline" size="sm">View All</Button>
        </Link>
      </CardHeader>
      <CardContent>
        {ongoingConsultations.length > 0 ? (
          <div className="space-y-4">
            {ongoingConsultations.map((consultation) => (
              <div
                key={consultation.id}
                className="flex items-start justify-between rounded-lg border p-4 transition-all hover:bg-muted/50"
              >
                <div className="flex items-start space-x-4">
                  <Avatar className="h-10 w-10 border">
                    <AvatarImage 
                      src={consultation.user.avatar || undefined} 
                      alt={consultation.user.name} 
                    />
                    <AvatarFallback>
                      {consultation.user.name.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <h4 className="text-sm font-medium leading-none">
                      {consultation.user.name}
                    </h4>
                    <div className="mt-1 flex items-center text-xs text-muted-foreground">
                      <Clock className="mr-1 h-3 w-3" />
                      <span>
                        {format(new Date(consultation.created_at), "MMM dd, h:mm a")} 
                        {" • "} 
                        {consultation.duration_minutes} mins
                      </span>
                    </div>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {consultation.name || "Nutrition Consultation"}
                    </p>
                  </div>
                </div>
                <Link href={`/consultation/${consultation.id}`}>
                  <Button
                    variant="outline"
                    size="sm"
                    className="ml-2 h-8 text-xs bg-purple-50 border-purple-100 text-purple-600 hover:bg-purple-100 hover:text-purple-700"
                  >
                    <Video className="mr-1 h-3 w-3" />
                    Join
                  </Button>
                </Link>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <CalendarPlus className="h-10 w-10 text-muted-foreground/50 mb-3" />
            <h3 className="text-sm font-medium">No ongoing consultations</h3>
            <p className="text-xs text-muted-foreground mt-1 mb-4">
              You have no active consultations right now
            </p>
            <Link href="/dietician/consultations">
              <Button size="sm" className="bg-purple-600 hover:bg-purple-700">
                <CalendarPlus className="mr-2 h-3.5 w-3.5" />
                Schedule Consultation
              </Button>
            </Link>
          </div>
        )}
      </CardContent>
    </Card>
  );
}