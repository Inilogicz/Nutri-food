"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/app/new/dietician/ui/button";
import { Loader2, Eye, EyeOff } from "lucide-react";
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
import { toast, Toaster } from 'sonner';
import type { ToastT } from 'sonner';
import { CheckCircle2, AlertCircle, Info } from "lucide-react";
import { useAuth } from "@/context/AuthContext"; // adjust path as needed


const formSchema = z.object({
  email: z.string().email("Please enter a valid email"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

type FormValues = z.infer<typeof formSchema>;

export default function LoginForm() {
  const { login } = useAuth();

  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const router = useRouter();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const showCustomToast = (type: "success" | "error" | "info", message: string, description?: string) => {
    const icons = {
      success: <CheckCircle2 className="w-5 h-5 text-emerald-500" />,
      error: <AlertCircle className="w-5 h-5 text-rose-500" />,
      info: <Info className="w-5 h-5 text-blue-500" />
    };
  
    toast.custom((id) => (
      <div className={`p-4 rounded-lg shadow-lg border bg-background`}>
        <div className="flex items-start gap-3">
          <div className="mt-0.5">
            {icons[type]}
          </div>
          <div className="grid gap-1">
            <h3 className="font-medium text-sm">{message}</h3>
            {description && (
              <p className="text-muted-foreground text-xs">{description}</p>
            )}
          </div>
        </div>
      </div>
    ), {
      duration: 5000,
      position: "top-center",
    });
  };

  const onSubmit = async (values: FormValues) => {
    setIsLoading(true);
    
    try {
      const response = await fetch('/api/proxy/dietitian/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify(values),
      });

      const data = await response.json();

      if (!response.ok) {
        // Handle API error responses
        const errorMessage = data.message || 
                           data.error?.message || 
                           (data.errors ? Object.values(data.errors).join(', ') : 'Login failed');
        throw new Error(errorMessage);
      }
      
      const dietitian = data.data?.dietitian;
      const token = data.data?.token;
      
      if (!token) {
        throw new Error('Authentication token not received');
      }
      
      login(token, {
        id: dietitian.id,
        name: dietitian.name,
        email: dietitian.email,
        phone_number: dietitian.phone_number,
        image: dietitian.image,
        type: "dietitian",
        bio: dietitian.bio,
        profile_picture: dietitian.profile_picture,
        balance: dietitian.balance,
      });
      
      
      
      // Show success toast with user details
      showCustomToast(
        "success", 
        "Welcome back!",
        `You've successfully logged in as ${values.email}`
      );
      
      // Delay navigation to allow toast to be seen
      setTimeout(() => router.push("/dietician/dashboard"), 1500);
    } catch (error) {
      console.error("Login failed:", error);
      
      // Show error toast with API response details
      showCustomToast(
        "error", 
        "Login failed",
        error instanceof Error ? error.message : "An unexpected error occurred"
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input 
                  placeholder="you@example.com" 
                  type="email" 
                  autoComplete="email"
                  disabled={isLoading}
                  {...field} 
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Password</FormLabel>
              <FormControl>
                <div className="relative">
                  <Input 
                    placeholder="••••••••" 
                    type={showPassword ? "text" : "password"} 
                    autoComplete="current-password"
                    disabled={isLoading}
                    {...field} 
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 py-2 text-muted-foreground hover:bg-transparent"
                    onClick={() => setShowPassword(!showPassword)}
                    disabled={isLoading}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                    <span className="sr-only">
                      {showPassword ? "Hide password" : "Show password"}
                    </span>
                  </Button>
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <input
              id="remember-me"
              name="remember-me"
              type="checkbox"
              className="h-4 w-4 rounded border-gray-300 text-purple-600 focus:ring-purple-500"
            />
            <label htmlFor="remember-me" className="ml-2 block text-sm text-muted-foreground">
              Remember me
            </label>
          </div>

          <div className="text-sm">
            <a href="/forgot-password" className="font-medium text-purple-600 hover:text-purple-500">
              Forgot your password?
            </a>
          </div>
        </div>

        <Button
          type="submit"
          className="w-full bg-purple-600 hover:bg-purple-700 transition-colors duration-200"
          disabled={isLoading}
        >
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Logging in...
            </>
          ) : (
            "Log in"
          )}
        </Button>

      
      </form>
    </Form>
  );
}