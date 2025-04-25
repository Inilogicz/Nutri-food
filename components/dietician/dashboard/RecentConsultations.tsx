"use client";

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
import { mockConsultations } from "@/lib/mock-data";

export default function RecentConsultations() {
  // Get the most recent 5 past consultations
  const pastConsultations = mockConsultations
    .filter(consultation => new Date(consultation.date) <= new Date())
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 5);

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
            {pastConsultations.map((consultation) => (
              <TableRow key={consultation.id}>
                <TableCell>
                  <div className="flex items-center gap-3">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={consultation.client.avatar} alt={consultation.client.name} />
                      <AvatarFallback>{consultation.client.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium">{consultation.client.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {consultation.topic}
                      </p>
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  {format(new Date(consultation.date), "MMM dd, yyyy")}
                </TableCell>
                <TableCell>{consultation.duration} mins</TableCell>
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
            {pastConsultations.length === 0 && (
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