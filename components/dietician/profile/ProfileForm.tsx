"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Loader2, Save, Upload, Edit, X } from "lucide-react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { 
  Form, 
  FormControl, 
  FormField, 
  FormItem, 
  FormLabel, 
  FormMessage
} from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";

const formSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Please enter a valid email"),
  bio: z.string().min(10, "Bio must be at least 10 characters"),
  specialty: z.string().optional(),
  rate_per_minute: z.string().refine(value => !isNaN(Number(value)) && Number(value) >= 0, {
    message: "Rate must be a valid number",
  }),
});

type FormValues = z.infer<typeof formSchema>;

interface ProfileFormProps {
  initialData: any;
  onUpdate: (data: any) => Promise<boolean>;
}

export default function ProfileForm({ initialData, onUpdate }: ProfileFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [avatarPreview, setAvatarPreview] = useState(initialData?.avatar || "");
  const [isEditing, setIsEditing] = useState(false);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: initialData?.name || "",
      email: initialData?.email || "",
      bio: initialData?.bio || "",
      specialty: initialData?.specialty || "",
      rate_per_minute: initialData?.rate_per_minute?.toString() || "",
    },
  });
  

  // Add this state to track the selected file
const [avatarFile, setAvatarFile] = useState<File | null>(null);

// Modify the handleAvatarChange function
const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
  const file = e.target.files?.[0];
  if (file) {
    const reader = new FileReader();
    reader.onload = () => {
      setAvatarPreview(reader.result as string);
    };
    reader.readAsDataURL(file);
    setAvatarFile(file); // Store the File object
  }
};

// Update the onSubmit function
const onSubmit = async (values: FormValues) => {
  setIsLoading(true);
  
  try {
    const success = await onUpdate({
      ...values,
      rate_per_minute: Number(values.rate_per_minute),
      avatar: avatarFile, // Include the File object
    });
    
    if (success) {
      setIsEditing(false);
    }
  } finally {
    setIsLoading(false);
  }
};


  const specialties = [
    "Weight Management",
    "Sports Nutrition",
    "Clinical Nutrition",
    "Pediatric Nutrition",
    "Eating Disorders",
    "Diabetes Management",
    "Plant-based Nutrition",
    "Digestive Health"
  ];

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 md:space-y-8">
        <div className="flex flex-col md:flex-row gap-6 md:gap-8 items-start">
          {/* Avatar Section */}
          <div className="w-full md:w-auto flex flex-col items-center gap-4">
            <Avatar className="h-20 w-20 md:h-24 md:w-24 border">
              <AvatarImage src={avatarPreview} alt={initialData?.name || "Avatar"} />
              <AvatarFallback>{initialData?.name?.charAt(0) || "D"}</AvatarFallback>
            </Avatar>
            {isEditing && (
              <div className="w-full flex justify-center">
                <div className="flex items-center gap-2">
                  <input
                    id="avatar"
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleAvatarChange}
                  />
                  <Label
                    htmlFor="avatar"
                    className="flex cursor-pointer items-center gap-2 rounded-md bg-muted px-3 py-2 text-sm font-medium hover:bg-muted/80"
                  >
                    <Upload className="h-4 w-4" />
                    <span className="hidden sm:inline">Change Profile Picture</span>
                    <span className="sm:hidden">Change Photo</span>
                  </Label>
                </div>
              </div>
            )}
          </div>
          
          {/* Profile Content */}
          <div className="flex-1 w-full space-y-4 md:space-y-6">
            {/* Header with Edit Button */}
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4">
              <div>
                <h2 className="text-lg md:text-xl font-semibold">{initialData?.name}</h2>
                <p className="text-sm md:text-base text-muted-foreground">{initialData?.email}</p>
              </div>
              {!isEditing ? (
                <Button
                  type="button"
                  variant="outline"
                  className="w-full sm:w-auto"
                  onClick={() => setIsEditing(true)}
                >
                  <Edit className="mr-2 h-4 w-4" />
                  Edit Profile
                </Button>
              ) : (
                <Button
                  type="button"
                  variant="outline"
                  className="w-full sm:w-auto"
                  onClick={() => {
                    setIsEditing(false);
                    form.reset();
                  }}
                >
                  <X className="mr-2 h-4 w-4" />
                  Cancel
                </Button>
              )}
            </div>

            {/* View Mode */}
            {!isEditing ? (
              <div className="space-y-4">
                <div>
                  <h3 className="font-medium text-sm md:text-base">Bio</h3>
                  <p className="text-muted-foreground text-sm md:text-base">
                    {initialData?.bio || "No bio provided"}
                  </p>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <h3 className="font-medium text-sm md:text-base">Specialty</h3>
                    <p className="text-muted-foreground text-sm md:text-base">
                      {initialData?.specialty || "Not specified"}
                    </p>
                  </div>
                  <div>
                    <h3 className="font-medium text-sm md:text-base">Rate (per minute)</h3>
                    <p className="text-muted-foreground text-sm md:text-base">
                    ₦{initialData?.rate_per_minute || "0"}
                    </p>
                  </div>
                </div>
              </div>
            ) : (
              /* Edit Mode */
              <>
                
                
                <FormField
                  control={form.control}
                  name="bio"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm md:text-base">Bio</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Tell clients about your experience and expertise" 
                          disabled={isLoading}
                          className="min-h-32 text-sm md:text-base"
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage className="text-xs md:text-sm" />
                    </FormItem>
                  )}
                />
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="specialty"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm md:text-base">Specialty</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                          disabled={isLoading}
                        >
                          <FormControl>
                            <SelectTrigger className="text-sm md:text-base">
                              <SelectValue placeholder="Select your specialty" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent className="text-sm md:text-base">
                            {specialties.map((specialty) => (
                              <SelectItem key={specialty} value={specialty} className="text-sm md:text-base">
                                {specialty}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage className="text-xs md:text-sm" />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="rate_per_minute"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm md:text-base">Rate (per minute)</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-muted-foreground">
                             ₦
                            </span>
                            <Input 
                              placeholder="0.00" 
                              type="number"
                              min="0"
                              step="0.01" 
                              disabled={isLoading}
                              className="pl-7 text-sm md:text-base"
                              {...field} 
                            />
                          </div>
                        </FormControl>
                        <FormMessage className="text-xs md:text-sm" />
                      </FormItem>
                    )}
                  />
                </div>
              </>
            )}
          </div>
        </div>
        
        {isEditing && (
          <>
            <Separator className="my-4 md:my-6" />
            <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setIsEditing(false);
                  form.reset();
                }}
                disabled={isLoading}
                className="w-full sm:w-auto"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="bg-purple-600 hover:bg-purple-700 w-full sm:w-auto"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" />
                    Save Changes
                  </>
                )}
              </Button>
            </div>
          </>
        )}
      </form>
    </Form>
  );
}