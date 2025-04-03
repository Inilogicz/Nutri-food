// app/login/page.tsx
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import AlertModal from '@/components/ui/modal';
import Link from 'next/link';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [modal, setModal] = useState({
    isOpen: false,
    type: 'error' as 'success' | 'error',
    message: '',
    duration: 4000
  });
  const { login } = useAuth();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setModal(prev => ({ ...prev, isOpen: false }));

    try {
      const response = await fetch('https://devsammy.online/api/user/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok || !data.status) {
        throw new Error(data.message || 'Login failed');
      }

      // Validate response structure
      if (!data.data?.user?.id || !data.data?.token) {
        throw new Error('Invalid response format from server');
      }

      // Extract user data from response
      const { user, token } = data.data;

      login(token, {
        id: user.id,
        name: user.name,
        email: user.email,
        phone_number: user.phone_number,
        dob: user.dob,
        gender: user.gender
      });

      setModal({
        isOpen: true,
        type: 'success',
        message: 'Login successful! Redirecting...',
        duration: 2000
      });

      setTimeout(() => {
        router.push('/Homepage');
      }, 2000);

    } catch (err) {
      setModal({
        isOpen: true,
        type: 'error',
        message: err instanceof Error ? err.message : 'Login failed',
        duration: 4000
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-indigo-50 to-gray-100">
      <div className="w-full max-w-md bg-white p-8 rounded-2xl shadow-xl border border-gray-100">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-gray-800">Sign in to your account</h2>
          <p className="text-gray-500 mt-2">Welcome back!</p>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email address</label>
            <input 
              type="email" 
              id="email"
              value={email} 
              onChange={(e) => setEmail(e.target.value)} 
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all" 
              required 
            />
          </div>
          
          <div className="space-y-2">
            <label htmlFor="password" className="block text-sm font-medium text-gray-700">Password</label>
            <input 
              type="password" 
              id="password"
              value={password} 
              onChange={(e) => setPassword(e.target.value)} 
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all" 
              required 
            />
          </div>
          
          <button 
            type="submit" 
            className="w-full bg-indigo-600 text-white py-3 px-4 rounded-lg hover:bg-indigo-700 transition-colors font-medium flex items-center justify-center shadow-md hover:shadow-indigo-200 disabled:opacity-70 disabled:cursor-not-allowed" 
            disabled={loading}
          >
            {loading ? (
              <>
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Signing in...
              </>
            ) : 'Sign in'}
          </button>
        </form>
        
        <div className="mt-6 text-center text-sm text-gray-500">
          <p><div>Don&apos;t have an account?</div> <Link href="/signup" className="text-indigo-600 hover:text-indigo-800 font-medium transition-colors">Sign up</Link></p>
        </div>
      </div>

      <AlertModal
        isOpen={modal.isOpen}
        onClose={() => setModal({...modal, isOpen: false})}
        type={modal.type}
        message={modal.message}
        duration={modal.duration}
      />
    </div>
  );
}