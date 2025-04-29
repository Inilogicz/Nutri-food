"use client";

import { useState, useEffect, useCallback } from "react";
import ProfileForm from "@/components/dietician/profile/ProfileForm";
import { Loader2 } from "lucide-react";
import { Card, CardContent } from "@/app/new/dietician/ui/card";
import { toast } from "sonner";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";

interface Profile {
  name: string;
  email: string;
  bio: string;
  specialty: string;
  rate_per_minute: number;
  avatar: string;
  is_verified: boolean;
  balance: number;
}

export default function ProfilePage() {
  const { isAuthenticated, user, logout, token } = useAuth();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [profile, setProfile] = useState<Profile | null>(null);

  const fetchProfile = useCallback(async () => {
    if (!isAuthenticated || user?.type !== "dietitian" || !token) {
      logout();
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch("/api/proxy/dietitian/profile", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        let errorDetails = '';
        try {
          const errorResponse = await response.json();
          errorDetails = JSON.stringify(errorResponse);
        } catch (e) {
          errorDetails = await response.text();
        }
        throw new Error(`Failed to fetch profile data: ${response.status} ${response.statusText}. ${errorDetails}`);
      }

      const responseData = await response.json();
      const dietitianData = responseData.data?.dietitian;
      
      if (!dietitianData) {
        throw new Error("No dietitian data found in response");
      }

      const transformedData: Profile = {
        name: dietitianData.name,
        email: dietitianData.email,
        bio: dietitianData.bio || "",
        specialty: dietitianData.specialty || "",
        rate_per_minute: dietitianData.rate_per_minute || 0,
        avatar: dietitianData.profile_picture 
          ? `https://devsammy.online/storage/${dietitianData.profile_picture.replace('storage/', '')}`
          : '',
        is_verified: dietitianData.is_verified || false,
        balance: dietitianData.balance || 0
      };
    
      setProfile(transformedData);
    } catch (error: unknown) {
      console.error("Error fetching profile:", error);
      if (error instanceof Error) {
        toast.error(error.message || "Failed to load profile data");
      } else {
        toast.error("Failed to load profile data");
      }
      logout();
    } finally {
      setIsLoading(false);
    }
  }, [isAuthenticated, user, logout, token]);

  const handleProfileUpdate = useCallback(async (updatedData: Partial<Profile>) => {
    if (!isAuthenticated || user?.type !== "dietitian" || !token) {
      logout();
      return false;
    }

    try {
      const formData = new FormData();
      
      if (updatedData.name) formData.append("name", updatedData.name.trim());
      if (updatedData.bio) formData.append("bio", updatedData.bio);
      if (updatedData.specialty) formData.append("specialty", updatedData.specialty);
      if (updatedData.rate_per_minute) formData.append("rate_per_minute", updatedData.rate_per_minute.toString());

      if (updatedData.avatar && typeof updatedData.avatar !== "string") {
        formData.append("profile_picture", updatedData.avatar);
      }

      const response = await fetch("/api/proxy/dietitian/profile", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      const result = await response.json();
      
      if (!response.ok) {
        throw new Error(result.message || "Update failed");
      }

      toast.success("Profile updated successfully");
      await fetchProfile();
      return true;
    } catch (error: unknown) {
      console.error("Update error:", error);
      if (error instanceof Error) {
        toast.error(error.message || "Update failed");
      } else {
        toast.error("An unknown error occurred");
      }
      return false;
    }
  }, [isAuthenticated, user, logout, token, fetchProfile]);

  useEffect(() => {
    if (user?.type === "dietitian") {
      fetchProfile();
    } else if (!isAuthenticated) {
      router.push("/login");
    }
  }, [user, isAuthenticated, fetchProfile, router]);

  if (isLoading) {
    return (
      <div className="flex h-[calc(100vh-5rem)] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-purple-600" />
      </div>
    );
  }

  if (!isAuthenticated || user?.type !== "dietitian") {
    return null;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Profile</h1>
        <p className="text-muted-foreground">
          Manage your profile information and account settings
        </p>
      </div>

      <Card>
        <CardContent className="p-6">
          <ProfileForm 
            initialData={profile} 
            onUpdate={handleProfileUpdate}
          />
        </CardContent>
      </Card>
    </div>
  );
}