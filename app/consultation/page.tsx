'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'react-hot-toast';
import { calculateSessionCost } from '../../lib/billing';
import  Navbar from '../../components/ui/Navbar'; 

interface Message {
  id: string;
  sender: 'user' | 'dietician';
  content: string;
  timestamp: Date;
}

interface Session {
  id: string;
  dieticianId: string;
  dieticianName: string;
  ratePerMinute: number;
  startTime: Date;
  endTime: Date | null;
  status: 'active' | 'completed' | 'pending';
}

export default function ConsultationPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [activeSession, setActiveSession] = useState<Session | null>(null);
  const [sessionDuration, setSessionDuration] = useState(0);
  const [sessionCost, setSessionCost] = useState(0);
  const [userBalance, setUserBalance] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  // Fetch user balance and active session
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [balanceRes, sessionRes] = await Promise.all([
          fetch('/api/user/balance'),
          fetch('/api/sessions/active'),
        ]);

        if (!balanceRes.ok) throw new Error('Failed to fetch balance');
        if (!sessionRes.ok) throw new Error('Failed to fetch session');

        const balanceData = await balanceRes.json();
        const sessionData = await sessionRes.json();

        setUserBalance(balanceData.balance);
        setActiveSession(sessionData.session);
        
        if (sessionData.session) {
          fetchMessages(sessionData.session.id);
          startSessionTimer(sessionData.session);
        }
      } catch (error) {
        toast.error(error instanceof Error ? error.message : 'Failed to load data');
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  // Update session duration and cost
  useEffect(() => {
    if (!activeSession) return;

    const interval = setInterval(() => {
      const now = new Date();
      const start = new Date(activeSession.startTime);
      const minutes = Math.floor((now.getTime() - start.getTime()) / (1000 * 60));
      
      setSessionDuration(minutes);
      setSessionCost(calculateSessionCost(minutes, activeSession.ratePerMinute));
    }, 60000); // Update every minute

    return () => clearInterval(interval);
  }, [activeSession]);

  const fetchMessages = async (sessionId: string) => {
    try {
      const res = await fetch(`/api/sessions/${sessionId}/messages`);
      if (!res.ok) throw new Error('Failed to fetch messages');
      const data = await res.json();
      setMessages(data.messages);
    } catch (error) {
      toast.error('Failed to load messages');
    }
  };

  const startSessionTimer = (session: Session) => {
    // Already handled in the useEffect
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !activeSession) return;

    try {
      // First verify balance
      const balanceCheck = await fetch('/api/user/balance/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount: sessionCost }),
      });

      if (!balanceCheck.ok) {
        const errorData = await balanceCheck.json();
        if (errorData.code === 'INSUFFICIENT_BALANCE') {
          toast.error(
            <div className="flex flex-col">
              <span>Insufficient balance for this session</span>
              <button 
                onClick={() => router.push('/top-up')}
                className="mt-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
              >
                Top Up Now
              </button>
            </div>,
            { duration: 10000 }
          );
          return;
        }
        throw new Error('Failed to verify balance');
      }

      // Send message
      const res = await fetch('/api/sessions/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId: activeSession.id,
          content: newMessage,
        }),
      });

      if (!res.ok) throw new Error('Failed to send message');

      const sentMessage = await res.json();
      setMessages([...messages, sentMessage]);
      setNewMessage('');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to send message');
    }
  };

  const startNewSession = async (dieticianId: string) => {
    try {
      setIsLoading(true);
      const res = await fetch('/api/sessions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ dieticianId }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        if (errorData.code === 'INSUFFICIENT_BALANCE') {
          toast.error(
            <div className="flex flex-col">
              <span>Insufficient balance to start session</span>
              <button 
                onClick={() => router.push('/top-up')}
                className="mt-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
              >
                Top Up Now
              </button>
            </div>,
            { duration: 10000 }
          );
          return;
        }
        throw new Error(errorData.message || 'Failed to start session');
      }

      const session = await res.json();
      setActiveSession(session);
      startSessionTimer(session);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to start session');
    } finally {
      setIsLoading(false);
    }
  };

  const endSession = async () => {
    try {
      if (!activeSession) return;
      
      setIsLoading(true);
      const res = await fetch(`/api/sessions/${activeSession.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'completed' }),
      });

      if (!res.ok) throw new Error('Failed to end session');

      const updatedSession = await res.json();
      setActiveSession(updatedSession);
      toast.success('Session ended successfully');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to end session');
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
        <Navbar/>
      <div className="max-w-4xl mx-auto p-4">
        {!activeSession ? (
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-bold mb-4">Start a New Consultation</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Sample dieticians - in real app, fetch from API */}
              {[
                { id: '1', name: 'Dr. Sarah Johnson', rate: 100, specialty: 'Weight Management' },
                { id: '2', name: 'Dr. Michael Chen', rate: 120, specialty: 'Diabetes Care' },
                { id: '3', name: 'Dr. Emily Wilson', rate: 150, specialty: 'Pediatric Nutrition' },
              ].map((dietician) => (
                <div key={dietician.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                  <h3 className="font-semibold">{dietician.name}</h3>
                  <p className="text-sm text-gray-600">{dietician.specialty}</p>
                  <p className="mt-2 text-indigo-600">${dietician.rate}/min</p>
                  <button
                    onClick={() => startNewSession(dietician.id)}
                    className="mt-4 w-full bg-indigo-600 text-white py-2 rounded-lg hover:bg-indigo-700"
                  >
                    Consult Now
                  </button>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow overflow-hidden">
            {/* Session Header */}
            <div className="bg-indigo-50 p-4 border-b flex justify-between items-center">
              <div>
                <h2 className="font-bold">{activeSession.dieticianName}</h2>
                <p className="text-sm text-gray-600">
                  Session in progress - ${activeSession.ratePerMinute}/min
                </p>
              </div>
              <div className="text-right">
                <p className="font-medium">Duration: {sessionDuration} min</p>
                <p className="text-indigo-600 font-semibold">Cost: ${sessionCost}</p>
              </div>
            </div>

            {/* Messages */}
            <div className="h-96 overflow-y-auto p-4 space-y-4">
              {messages.length === 0 ? (
                <p className="text-center text-gray-500 py-8">
                  No messages yet. Start the conversation!
                </p>
              ) : (
                messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-xs md:max-w-md rounded-lg px-4 py-2 ${
                        message.sender === 'user'
                          ? 'bg-indigo-600 text-white'
                          : 'bg-gray-100 text-gray-800'
                      }`}
                    >
                      <p>{message.content}</p>
                      <p className="text-xs opacity-70 mt-1">
                        {new Date(message.timestamp).toLocaleTimeString()}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Message Input */}
            <div className="border-t p-4 bg-gray-50">
              <div className="flex space-x-2">
                <input
                  type="text"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                  placeholder="Type your message..."
                  className="flex-1 border rounded-lg px-4 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                />
                <button
                  onClick={handleSendMessage}
                  disabled={!newMessage.trim()}
                  className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 disabled:opacity-50"
                >
                  Send
                </button>
              </div>
              <div className="mt-2 flex justify-between items-center text-sm text-gray-500">
                <p>Balance: ${userBalance.toFixed(2)}</p>
                <button
                  onClick={endSession}
                  className="text-red-600 hover:text-red-800 font-medium"
                >
                  End Session
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}