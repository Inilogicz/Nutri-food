"use client";

import { useState, useEffect } from "react";
import ProfileForm from "@/components/dietician/profile/ProfileForm";
import { Loader2 } from "lucide-react";
import { Card, CardContent } from "@/app/new/dietician/ui/card";
import { toast } from "sonner";

export default function ProfilePage() {
  const [isLoading, setIsLoading] = useState(true);
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
  
  const [profile, setProfile] = useState<Profile | null>(null);

  const fetchProfile = async () => {
    const token = localStorage.getItem("dietician_token");
    if (!token) {
      window.location.href = "/dietician/login";
      return;
    }

    try {
      const response = await fetch("/api/proxy/dietitian/profile", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch profile data");
      }

      const responseData = await response.json();
      const dietitianData = responseData.data?.dietitian;
      
      if (!dietitianData) {
        throw new Error("No dietitian data found in response");
      }

      const transformedData = {
        name: dietitianData.name,
        email: dietitianData.email,
        bio: dietitianData.bio,
        specialty: dietitianData.specialty,
        rate_per_minute: dietitianData.rate_per_minute,
        avatar: dietitianData.profile_picture 
          ? `https://devsammy.online/storage/${dietitianData.profile_picture.replace('storage/', '')}`
          : '',
        is_verified: dietitianData.is_verified,
        balance: dietitianData.balance
      };
    
      setProfile(transformedData);
    } catch (error: unknown) {
      console.error("Error fetching profile:", error);
      if (error instanceof Error) {
        toast.error(error.message || "Failed to load profile data");
      } else {
        toast.error("Failed to load profile data");
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Update the error handling in your handleProfileUpdate function
const handleProfileUpdate = async (updatedData: any) => {
  const token = localStorage.getItem("dietician_token");
  if (!token) {
    window.location.href = "/dietician/login";
    return false;
  }

  try {
    const formData = new FormData();
    
    formData.append("name", updatedData.name.trim());
    formData.append("bio", updatedData.bio);
    formData.append("specialty", updatedData.specialty);
    formData.append("rate_per_minute", updatedData.rate_per_minute.toString());

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
};
  
  useEffect(() => {
    fetchProfile();
  }, []);

  if (isLoading) {
    return (
      <div className="flex h-[calc(100vh-5rem)] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-purple-600" />
      </div>
    );
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