"use client";

import { createContext, useContext, useState, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";

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

interface Dietitian extends BaseUser {
  bio?: string;
  profile_picture?: string;
  balance?: string;
  type: "dietitian";
}

type AuthUser = User | Dietitian;

interface AuthContextType {
  isAuthenticated: boolean;
  user: AuthUser | null;
  token: string | null;
  login: (token: string, userData: AuthUser) => void;
  logout: () => void;
  loading: boolean;
  userType: "user" | "dietitian" | null;
}

const AuthContext = createContext<AuthContextType>(null!);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<{
    isAuthenticated: boolean;
    user: AuthUser | null;
    token: string | null;
    loading: boolean;
    userType: "user" | "dietitian" | null;
  }>({
    isAuthenticated: false,
    user: null,
    token: null,
    loading: true,
    userType: null,
  });

  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const initializeAuth = () => {
      const token = localStorage.getItem("token");
      const userData = localStorage.getItem("user");

      console.log('Initializing auth:', { token, userData });

      if (token && userData) {
        try {
          const parsedUser: AuthUser = JSON.parse(userData);
          if (parsedUser?.id) {
            setState({
              isAuthenticated: true,
              user: parsedUser,
              token,
              loading: false,
              userType: parsedUser.type,
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

  // Route protection
  useEffect(() => {
    if (state.loading) return;

    // Define auth pages for both users and dieticians
    const isAuthPage =
      pathname === '/login' ||
      pathname === '/signup' ||
      pathname === '/dietician/login' ||
      pathname === '/dietician/signup';

    // Define public pages accessible without authentication
    const isPublicPage =
      pathname === '/' ||
      pathname === '/login' ||
      pathname === '/signup' ||
      pathname === '/dietician/login' ||
      pathname === '/dietician/signup';

    // Debugging to track routing decisions
    console.log({
      pathname,
      isAuthenticated: state.isAuthenticated,
      isAuthPage,
      isPublicPage,
      userType: state.userType,
    });

    // Redirect unauthenticated users trying to access protected routes
    if (!state.isAuthenticated && !isAuthPage && !isPublicPage) {
      console.log('Redirecting to /login: Unauthenticated access to protected route');
      router.push('/');
      return;
    }

    // Handle authenticated users
    if (state.isAuthenticated) {
      const isDietitianRoute =
        pathname?.startsWith('/dietician') &&
        !pathname.startsWith('/dietician/login') &&
        !pathname.startsWith('/dietician/signup');
      const isUserRoute = pathname === '/Homepage'; // Adjust based on actual user routes

      // Redirect dieticians away from user routes
      if (state.userType === 'dietitian' && isUserRoute) {
        console.log('Redirecting dietitian to /dietician/login');
        router.push('/dietician/login');
      }
      // Redirect users away from dietician routes
      else if (state.userType === 'user' && isDietitianRoute) {
        console.log('Redirecting user to /Homepage');
        router.push('/Homepage');
      }

      // Redirect authenticated users away from auth pages
     

      // Redirect authenticated users from root to their respective dashboard
      if (pathname === '/') {
        console.log('Redirecting authenticated user from root');
        router.push(state.userType === 'dietitian' ? '/dietician/dashboard' : '/Homepage');
      }
    }
  }, [state.isAuthenticated, state.loading, state.userType, pathname, router]);

  const login = (token: string, userData: AuthUser) => {
    if (!userData?.id) {
      console.error("Invalid user data - missing id");
      return;
    }

    // Clear any existing session
    localStorage.removeItem("token");
    localStorage.removeItem("user");

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
            bio: (userData as Dietitian).bio,
            profile_picture: (userData as Dietitian).profile_picture,
            balance: (userData as Dietitian).balance,
          }),
    };

    localStorage.setItem("token", token);
    localStorage.setItem("user", JSON.stringify(minimalUserData));
    setState({
      isAuthenticated: true,
      user: minimalUserData,
      token,
      loading: false,
      userType: userData.type,
    });

    // Redirect based on user type

  };

  const logout = () => {
    console.log('Logging out: Clearing localStorage and resetting state');
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setState({
      isAuthenticated: false,
      user: null,
      token: null,
      loading: false,
      userType: null,
    });
    router.push("/");
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
        userType: state.userType,
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