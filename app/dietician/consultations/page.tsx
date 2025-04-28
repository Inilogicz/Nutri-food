"use client";

import { useState, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2, CalendarPlus } from "lucide-react";
import { Button } from "@/app/new/dietician/ui/button";
import ConsultationList from "@/components/dietician/consultations/ConsultationList";
import type { Consultation } from "@/components/dietician/consultations/ConsultationList";

export default function ConsultationsPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [consultations, setConsultations] = useState<Consultation[]>([]);

  useEffect(() => {
    const fetchConsultations = async () => {
      try {
        setIsLoading(true);
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
      } catch (error) {
        setError(error instanceof Error ? error.message : "An error occurred");
      } finally {
        setIsLoading(false);
      }
    };

    fetchConsultations();
  }, []);

  // Categorize consultations based on status
  const ongoingConsultations = consultations.filter(
    (c) => c.status === "scheduled" || c.status === "ongoing"
  );
  
  const pastConsultations = consultations.filter(
    (c) => c.status === "completed" || c.status === "cancelled"
  );

  if (isLoading) {
    return (
      <div className="flex h-[calc(100vh-5rem)] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-purple-600" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-[calc(100vh-5rem)] items-center justify-center">
        <div className="text-center p-6 bg-red-50 rounded-lg max-w-md">
          <h2 className="text-xl font-semibold text-red-600 mb-2">Error</h2>
          <p className="text-gray-700 mb-4">{error}</p>
          <Button 
            variant="outline"
            onClick={() => window.location.reload()}
          >
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-4 md:p-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight">
          Consultations
        </h1>
        <Button 
          className="bg-purple-600 hover:bg-purple-700 w-full md:w-auto"
          onClick={() => {
            // Add your new consultation logic here
          }}
        >
          <CalendarPlus className="mr-2 h-4 w-4" />
          New Consultation
        </Button>
      </div>

      <Tabs defaultValue="ongoing" className="w-full">
        <TabsList className="grid w-full grid-cols-3 mb-4">
          <TabsTrigger value="ongoing">ongoing</TabsTrigger>
          <TabsTrigger value="past">Past</TabsTrigger>
          <TabsTrigger value="all">All</TabsTrigger>
        </TabsList>

        <TabsContent value="ongoing" className="mt-4">
          <ConsultationList consultations={ongoingConsultations} />
        </TabsContent>

        <TabsContent value="past" className="mt-4">
          <ConsultationList consultations={pastConsultations} />
        </TabsContent>

        <TabsContent value="all" className="mt-4">
          <ConsultationList consultations={consultations} />
        </TabsContent>
      </Tabs>
    </div>
  );
}