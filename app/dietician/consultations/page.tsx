"use client";

import { useState, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import ConsultationList from "@/components/dietician/consultations/ConsultationList";
import { Loader2, CalendarPlus } from "lucide-react";
import { Button } from "@/app/new/dietician/ui/button";
import { mockConsultations } from "@/lib/mock-data";

export default function ConsultationsPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [consultations, setConsultations] = useState([]);

  useEffect(() => {
    // Simulate fetching consultations
    const timer = setTimeout(() => {
      setConsultations(mockConsultations);
      setIsLoading(false);
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  if (isLoading) {
    return (
      <div className="flex h-[calc(100vh-5rem)] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-purple-600" />
      </div>
    );
  }

  const upcomingConsultations = consultations.filter(c => new Date(c.date) > new Date());
  const pastConsultations = consultations.filter(c => new Date(c.date) <= new Date());
  
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Consultations</h1>
        <Button className="bg-purple-600 hover:bg-purple-700">
          <CalendarPlus className="mr-2 h-4 w-4" />
          New Consultation
        </Button>
      </div>

      <Tabs defaultValue="upcoming" className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="upcoming">Upcoming</TabsTrigger>
          <TabsTrigger value="past">Past</TabsTrigger>
          <TabsTrigger value="all">All</TabsTrigger>
        </TabsList>
        
        <TabsContent value="upcoming">
          <ConsultationList consultations={upcomingConsultations} />
        </TabsContent>
        
        <TabsContent value="past">
          <ConsultationList consultations={pastConsultations} />
        </TabsContent>
        
        <TabsContent value="all">
          <ConsultationList consultations={consultations} />
        </TabsContent>
      </Tabs>
    </div>
  );
}