"use client";

import { useState, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2, CalendarPlus } from "lucide-react";
import { Button } from "@/app/new/dietician/ui/button";
import ConsultationList from "@/components/dietician/consultations/ConsultationList";
import type { Consultation } from "@/components/dietician/consultations/ConsultationList";

export default function ConsultationsPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [consultations, setConsultations] = useState<Consultation[]>([]);

  useEffect(() => {
    const fetchConsultations = async () => {
      try {
        // Replace with actual API call
        const mockData: Consultation[] = [
          {
            id: "1",
            client: {
              id: "c1",
              name: "John Doe",
              avatar: "https://randomuser.me/api/portraits/men/32.jpg",
            },
            date: "2025-05-01T10:00:00",
            duration: 30,
            topic: "Nutrition Counseling",
            status: "scheduled",
            notes: "Discuss meal plans",
          },
          {
            id: "2",
            client: {
              id: "c2",
              name: "Jane Smith",
              avatar: "https://randomuser.me/api/portraits/women/44.jpg",
            },
            date: "2025-04-01T14:00:00",
            duration: 45,
            topic: "Diet Review",
            status: "completed",
            notes: "Reviewed previous diet progress",
          },
        ];
        setConsultations(mockData);
      } catch (error) {
        console.error("Failed to fetch consultations:", error);
      } finally {
        setIsLoading(false);
      }
    };

    const timer = setTimeout(fetchConsultations, 1000);
    return () => clearTimeout(timer);
  }, []);

  const upcomingConsultations = consultations.filter(
    (c) => new Date(c.date) > new Date()
  );
  const pastConsultations = consultations.filter(
    (c) => new Date(c.date) <= new Date()
  );

  if (isLoading) {
    return (
      <div className="flex h-[calc(100vh-5rem)] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-purple-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6 p-4 md:p-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight">
          Consultations
        </h1>
        <Button className="bg-purple-600 hover:bg-purple-700 w-full md:w-auto">
          <CalendarPlus className="mr-2 h-4 w-4" />
          New Consultation
        </Button>
      </div>

      <Tabs defaultValue="upcoming" className="w-full">
        <TabsList className="grid w-full grid-cols-3 mb-4">
          <TabsTrigger value="upcoming">Upcoming</TabsTrigger>
          <TabsTrigger value="past">Past</TabsTrigger>
          <TabsTrigger value="all">All</TabsTrigger>
        </TabsList>

        <TabsContent value="upcoming" className="mt-4">
          <ConsultationList consultations={upcomingConsultations} />
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