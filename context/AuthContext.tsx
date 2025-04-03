// context/AuthContext.tsx
'use client';

import { createContext, useContext, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface User {
  id: number;
  name: string;
  email: string;
  phone_number?: string;
  dob?: string;
  gender?: string;
}

interface AuthContextType {
  isAuthenticated: boolean;
  user: User | null;
  login: (token: string, userData: User) => void;
  logout: () => void;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType>(null!);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState({
    isAuthenticated: false,
    user: null as User | null,
    loading: true
  });

  const router = useRouter();

  useEffect(() => {
    const initializeAuth = () => {
      const token = localStorage.getItem('token');
      const userData = localStorage.getItem('user');

      if (token && userData) {
        try {
          const parsedUser = JSON.parse(userData);
          if (parsedUser?.id) {
            setState({
              isAuthenticated: true,
              user: parsedUser,
              loading: false
            });
            return;
          }
        } catch (e) {
          console.error('Failed to parse user data', e);
        }
      }
      setState(prev => ({ ...prev, loading: false }));
    };

    initializeAuth();
  }, []);

  const login = (token: string, userData: User) => {
    if (!userData?.id) {
      console.error('Invalid user data - missing id');
      return;
    }

    const minimalUserData = {
      id: userData.id,
      name: userData.name,
      email: userData.email,
      phone_number: userData.phone_number,
      dob: userData.dob,
      gender: userData.gender
    };

    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(minimalUserData));
    setState({
      isAuthenticated: true,
      user: minimalUserData,
      loading: false
    });
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setState({
      isAuthenticated: false,
      user: null,
      loading: false
    });
    router.push('/login');
  };

  return (
    <AuthContext.Provider value={{
      isAuthenticated: state.isAuthenticated,
      user: state.user,
      login,
      logout,
      loading: state.loading
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}