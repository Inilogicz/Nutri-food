"use client";

import React, { useState, useEffect } from "react";
import ConsultationConfirmationModal from "@/components/ConsultationConfirmationModal";
import Navbar from "@/components/ui/Navbar";

interface Dietitian {
  id: number;
  name: string;
  bio: string | null;
  specialty: string | null;
  rate_per_minute: string;
  profile_picture: string | null;
  is_verified: string;
  online: boolean;
  last_seen: string | null;
  balance: string;
}

function App() {
  const [showModal, setShowModal] = useState(false);
  const [selectedDietitian, setSelectedDietitian] = useState<Dietitian | null>(null);
  const [dietitians, setDietitians] = useState<Dietitian[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDietitians = async () => {
      try {
        setLoading(true);
        const response = await fetch("/api/proxy/dietitians", {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
            "Content-Type": "application/json",
          },
        });

        if (!response.ok) {
          throw new Error("Failed to fetch dietitians");
        }

        const data = await response.json();
        const processedDietitians = data.data.dietitian.map((d: any) => ({
          ...d,
          online: d.online === "1", // Convert "1"/"0" to boolean
        }));
        setDietitians(processedDietitians);
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred");
      } finally {
        setLoading(false);
      }
    };

    fetchDietitians();
  }, []);

  const handleStartConsultation = (dietitian: Dietitian) => {
    setSelectedDietitian(dietitian);
    setShowModal(true);
  };

  const handleConfirmConsultation = async (duration: number) => {
    if (!selectedDietitian) return;
  
    try {
      // Save to localStorage before making the API call
      localStorage.setItem('selectedDietitian', JSON.stringify({
        id: selectedDietitian.id,
        duration: duration
      }));
  
      const response = await fetch("/api/proxy/consultations/start", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          dietitian_id: selectedDietitian.id,
          duration: duration,
        }),
      });
  
      if (!response.ok) {
        throw new Error("Failed to start consultation");
      }
  
      const data = await response.json();
      window.location.href = `/consultation/${data.data[0].id}`;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to start consultation");
    } finally {
      setShowModal(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center p-6 bg-white rounded-lg shadow-md max-w-md">
          <h2 className="text-xl font-semibold text-red-600 mb-2">Error</h2>
          <p className="text-gray-700 mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div>
      <Navbar />

      <div className="min-h-screen bg-gray-100 flex flex-col items-center p-6">
        <div className="max-w-7xl w-full">
          <div className="p-6 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-xl shadow-lg mb-8">
            <h2 className="text-2xl font-bold">Dietitian Profiles</h2>
            <p className="text-purple-100 mt-2">Find and connect with top nutrition experts</p>
          </div>

          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {dietitians.map((dietitian) => (
              <div
                key={dietitian.id}
                className="bg-white p-6 rounded-xl shadow-md flex flex-col items-center text-center transition transform hover:-translate-y-2 hover:shadow-xl"
              >
                {dietitian.profile_picture ? (
                  <img
                    src={`https://devsammy.online/${dietitian.profile_picture}`}
                    alt={dietitian.name}
                    className="h-20 w-20 rounded-full object-cover mb-4"
                  />
                ) : (
                  <div className="h-20 w-20 rounded-full bg-purple-100 flex items-center justify-center text-purple-600 font-bold text-2xl mb-4">
                    {dietitian.name.split(" ").map((n) => n[0]).join("").slice(0, 2)}
                  </div>
                )}

                <h3 className="text-lg font-semibold text-gray-900">{dietitian.name}</h3>
                <p className="text-purple-600 text-sm mt-1 mb-4">
                  {dietitian.specialty || "General Nutrition"}
                </p>

                {dietitian.bio ? (
                  <p className="text-sm text-gray-700 mb-4">{dietitian.bio}</p>
                ) : (
                  <p className="text-sm text-gray-500 mb-4">No bio available</p>
                )}

                <span
                  className={`inline-block py-1 px-3 rounded-full text-white text-xs mb-4 ${
                    dietitian.online ? "bg-green-500" : "bg-red-500"
                  }`}
                >
                  {dietitian.online ? "Online" : `Offline${dietitian.last_seen ? ` - Last seen ${new Date(dietitian.last_seen).toLocaleString()}` : ''}`}
                </span>

                <div className="bg-purple-50 w-full p-3 rounded-lg mb-4">
                  <p className="text-xs text-purple-700">Consultation Rate</p>
                  <p className="font-bold text-purple-900">
                    ₦{parseFloat(dietitian.rate_per_minute).toFixed(2)}/min
                  </p>
                </div>

                <button
                  onClick={() => handleStartConsultation(dietitian)}
                  disabled={!dietitian.online}
                  className={`w-full bg-purple-600 text-white rounded-lg py-2 font-medium transition ${
                    dietitian.online
                      ? "hover:bg-purple-700 focus:ring-2 focus:ring-purple-500 focus:ring-offset-2"
                      : "opacity-50 cursor-not-allowed"
                  }`}
                >
                  {dietitian.online ? "Start Consultation" : "Not Available"}
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>

      {showModal && selectedDietitian && (
        <ConsultationConfirmationModal
          dietitian={selectedDietitian}
          onConfirm={handleConfirmConsultation}
          onCancel={() => setShowModal(false)}
        />
      )}
    </div>
  );
}

export default App;