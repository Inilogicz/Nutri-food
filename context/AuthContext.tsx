// context/AuthContext.tsx
"use client";

import { createContext, useContext, useState, useEffect } from "react";
import { useRouter } from "next/navigation";

interface BaseUser {
  id: number;
  name: string;
  email: string;
  image?: string;
  phone_number?: string;
}

interface User extends BaseUser {
  dob?: string;
  gender?: string;
  type: "user";
}

interface Dietician extends BaseUser {
  bio?: string;
  profile_picture?: string;
  balance?: string;
  type: "dietician";
}

type AuthUser = User | Dietician;

interface AuthContextType {
  isAuthenticated: boolean;
  user: AuthUser | null;
  token: string | null;
  login: (token: string, userData: AuthUser) => void;
  logout: () => void;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType>(null!);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<{
    isAuthenticated: boolean;
    user: AuthUser | null;
    token: string | null;
    loading: boolean;
  }>({
    isAuthenticated: false,
    user: null,
    token: null,
    loading: true,
  });

  const router = useRouter();

  useEffect(() => {
    const initializeAuth = () => {
      const token = localStorage.getItem("token");
      const userData = localStorage.getItem("user");

      if (token && userData) {
        try {
          const parsedUser: AuthUser = JSON.parse(userData);
          if (parsedUser?.id) {
            setState({
              isAuthenticated: true,
              user: parsedUser,
              token,
              loading: false,
            });
            return;
          }
        } catch (e) {
          console.error("Failed to parse user data", e);
        }
      }

      setState((prev) => ({ ...prev, loading: false }));
    };

    initializeAuth();
  }, []);

  const login = (token: string, userData: AuthUser) => {
    if (!userData?.id) {
      console.error("Invalid user data - missing id");
      return;
    }

    const minimalUserData: AuthUser = {
      id: userData.id,
      name: userData.name,
      email: userData.email,
      phone_number: userData.phone_number,
      image: userData.image,
      type: userData.type,
      ...(userData.type === "user"
        ? {
            dob: (userData as User).dob,
            gender: (userData as User).gender,
          }
        : {
            bio: (userData as Dietician).bio,
            profile_picture: (userData as Dietician).profile_picture,
            balance: (userData as Dietician).balance,
          }),
    };

    localStorage.setItem("token", token);
    localStorage.setItem("user", JSON.stringify(minimalUserData));
    setState({
      isAuthenticated: true,
      user: minimalUserData,
      token,
      loading: false,
    });
  };

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setState({
      isAuthenticated: false,
      user: null,
      token: null,
      loading: false,
    });
    router.push("/login");
  };

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated: state.isAuthenticated,
        user: state.user,
        token: state.token,
        login,
        logout,
        loading: state.loading,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}