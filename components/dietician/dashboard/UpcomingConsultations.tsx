"use client";

import Link from "next/link";
import { Button } from "@/app/new/dietician/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader, CardTitle } from "@/app/new/dietician/ui/card";
import { CalendarPlus, Clock, Video } from "lucide-react";
import { format } from "date-fns";
import { mockConsultations } from "@/lib/mock-data";

export default function UpcomingConsultations() {
  // Get upcoming consultations and sort by date (nearest first)
  const upcomingConsultations = mockConsultations
    .filter(consultation => new Date(consultation.date) > new Date())
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    .slice(0, 3);

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Upcoming Consultations</CardTitle>
        <Link href="/dietician/consultations">
          <Button variant="outline" size="sm">View All</Button>
        </Link>
      </CardHeader>
      <CardContent>
        {upcomingConsultations.length > 0 ? (
          <div className="space-y-4">
            {upcomingConsultations.map((consultation) => (
              <div
                key={consultation.id}
                className="flex items-start justify-between rounded-lg border p-4 transition-all hover:bg-muted/50"
              >
                <div className="flex items-start space-x-4">
                  <Avatar className="h-10 w-10 border">
                    <AvatarImage src={consultation.client.avatar} alt={consultation.client.name} />
                    <AvatarFallback>{consultation.client.name.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <div>
                    <h4 className="text-sm font-medium leading-none">
                      {consultation.client.name}
                    </h4>
                    <div className="mt-1 flex items-center text-xs text-muted-foreground">
                      <Clock className="mr-1 h-3 w-3" />
                      <span>
                        {format(new Date(consultation.date), "MMM dd, h:mm a")} 
                        {" • "} 
                        {consultation.duration} mins
                      </span>
                    </div>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {consultation.topic}
                    </p>
                  </div>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  className="ml-2 h-8 text-xs bg-purple-50 border-purple-100 text-purple-600 hover:bg-purple-100 hover:text-purple-700"
                >
                  <Video className="mr-1 h-3 w-3" />
                  Join
                </Button>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <CalendarPlus className="h-10 w-10 text-muted-foreground/50 mb-3" />
            <h3 className="text-sm font-medium">No upcoming consultations</h3>
            <p className="text-xs text-muted-foreground mt-1 mb-4">
              You have no scheduled consultations coming up
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