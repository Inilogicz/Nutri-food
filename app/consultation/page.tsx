'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar, Clock, User, Wallet } from 'lucide-react';
import Navbar from '@/components/ui/Navbar';

interface Dietitian {
  id: number;
  name: string;
  email: string;
}

interface Consultation {
  id: number;
  name: string | null;
  user_id: string;
  dietitian_id: string;
  rate_per_minute: string;
  duration_minutes: string;
  total_cost: string;
  status: string;
  created_at: string;
  updated_at: string;
  dietitian: Dietitian;
}

export default function ConsultationList() {
  const [consultations, setConsultations] = useState<Consultation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    const fetchConsultations = async () => {
      try {
        setLoading(true);
        const response = await fetch('/api/proxy/consultations/my', {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
            'Content-Type': 'application/json',
          },
        });

        if (!response.ok) {
          throw new Error('Failed to fetch consultations');
        }

        const data = await response.json();
        setConsultations(data.data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchConsultations();
  }, []);

  const handleViewConsultation = (consultationId: number) => {
    router.push(`/consultation/${consultationId}`);
  };

  const getStatusBadgeVariant = (status: string) => {
    switch (status.toLowerCase()) {
      case 'ongoing':
        return 'default';
      case 'completed':
        return 'default';
      case 'cancelled':
        return 'destructive';
      default:
        return 'secondary';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
       
        <Card className="text-center p-6 bg-white rounded-lg shadow-md max-w-md">
          <CardHeader>
            <CardTitle className="text-xl font-semibold text-red-600">Error</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-700 mb-4">{error}</p>
            <Button
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
            >
              Try Again
            </Button>
            <Button
              onClick={() => window.location.href = '/'}
              className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
            >
              Home
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div>
      <Navbar/>
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Your Consultations</h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            View and manage your past and ongoing consultations with our expert dietitians
          </p>
        </div>

        {consultations.length === 0 ? (
          <Card className="text-center py-12 bg-white rounded-xl shadow-md">
            <CardContent>
              <div className="mx-auto h-24 w-24 text-gray-400 mb-4">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1}
                    d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-1">No consultations found</h3>
              <p className="text-gray-500">You haven't booked any consultations yet.</p>
              <Button
                onClick={() => router.push('/browse-dietitians')}
                className="mt-4 bg-purple-600 text-white hover:bg-purple-700"
              >
                Find a Dietitian
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {consultations.map((consultation) => (
              <Card
                key={consultation.id}
                className="bg-white rounded-xl shadow-md hover:shadow-lg transition-shadow duration-300"
              >
                <CardHeader className="bg-gradient-to-r from-purple-100 to-indigo-100 rounded-t-xl">
                  <div className="flex justify-between items-center">
                    <CardTitle className="text-xl font-bold text-gray-900">
                      Consultation with {consultation.dietitian.name}
                    </CardTitle>
                    <Badge
                      variant={getStatusBadgeVariant(consultation.status)}
                      className="capitalize"
                    >
                      {consultation.status}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="pt-6">
                  <div className="space-y-4">
                    <div className="flex items-center text-gray-600">
                      <User className="h-5 w-5 mr-2 text-purple-600" />
                      <span>Dietitian: {consultation.dietitian.name}</span>
                    </div>
                    <div className="flex items-center text-gray-600">
                      <Calendar className="h-5 w-5 mr-2 text-purple-600" />
                      <span>Booked: {formatDate(consultation.created_at)}</span>
                    </div>
                    <div className="flex items-center text-gray-600">
                      <Clock className="h-5 w-5 mr-2 text-purple-600" />
                      <span>Duration: {consultation.duration_minutes} minutes</span>
                    </div>
                    <div className="flex items-center text-gray-600">
                      <Wallet className="h-5 w-5 mr-2 text-purple-600" />
                      <span>Total Cost: ₦{parseFloat(consultation.total_cost).toFixed(2)}</span>
                    </div>
                  </div>
                  <Button
                    onClick={() => handleViewConsultation(consultation.id)}
                    className="w-full mt-6 bg-purple-600 text-white hover:bg-purple-700 transition-colors"
                  >
                    View Details
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
    </div>
  );
}