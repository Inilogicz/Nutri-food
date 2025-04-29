'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/ui/Navbar';
import { useAuth } from '@/context/AuthContext';
import { use } from 'react';
import * as React from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

interface UserDetails {
  id: number;
  name: string;
  email: string;
  profile_picture?: string;
  online: string;
  last_seen: string;
  type?: 'user' | 'dietitian';
}

interface Message {
  id: number;
  consultation_id: string;
  sender_id: string;
  receiver_id: string;
  sender_type: 'user' | 'dietitian';
  receiver_type: 'user' | 'dietitian';
  message_type: 'text' | 'file';
  message: string;
  file_url?: string;
  file_name?: string;
  created_at: string;
  updated_at: string;
  sender_details: UserDetails;
  receiver_details: UserDetails;
}

interface DietitianInfo {
  id: string;
  name: string;
  profile_picture?: string;
  specialty?: string;
}

interface UserInfo {
  id: string;
  name: string;
  profile_picture?: string;
}

interface ConsultationDetails {
  id: string;
  user_id: string;
  dietitian_id: string;
  status: string;
  duration_minutes: number;
  rate_per_minute: string;
  total_cost: string;
  created_at: string;
  updated_at: string;
  dietitian: DietitianInfo;
  user: UserInfo;
}

interface PageParams {
  id: string;
}

interface PageProps {
  params: Promise<PageParams>;
}

export default function ConsultationChat({ params }: PageProps) {
  const { id: consultationId } = use(params);
  const { user } = useAuth();
  const router = useRouter();

  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState<{ message: string; isCritical?: boolean } | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [isConsultationEnded, setIsConsultationEnded] = useState(false);
  const [consultationDetails, setConsultationDetails] = useState<ConsultationDetails | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const BASE_URL = 'https://devsammy.online';

  const getUserType = (): 'user' | 'dietitian' => {
    if (!user) return 'user';
    return user.type === 'dietitian' ? 'dietitian' : 'user';
  };

  const userType = getUserType();

  useEffect(() => {
    if (!consultationId) {
      console.error('No consultation ID in URL');
      router.push('/consultations');
      return;
    }
  }, [consultationId, router]);

  const loadConsultationDetails = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        router.push('/login');
        return;
      }

      const response = await fetch(`${BASE_URL}/api/consultations/${consultationId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        if (response.status === 404) {
          console.warn('Consultation details not found, but continuing with messages');
          return;
        }
        throw new Error('Failed to fetch consultation details');
      }

      const data = await response.json();
      setConsultationDetails(data.data);
      setIsConsultationEnded(data.data.status === 'ended');
    } catch (err) {
      console.error("Error loading consultation details:", err);
    }
  };

  const loadMessages = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        router.push('/login');
        return;
      }

      const response = await fetch(`${BASE_URL}/api/consultations/${consultationId}/messages`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch messages: ${response.status}`);
      }

      const data = await response.json();
      setMessages(data.data || []);
      setError(null);
    } catch (err) {
      console.error("Error loading messages:", err);
      if (messages.length === 0) {
        setError({
          message: 'Failed to load messages. Please try again later.',
          isCritical: true
        });
      }
    }
  };

  const sendMessage = async () => {
    if ((!newMessage.trim() && !file) || isConsultationEnded) return;
  
    try {
      setIsSending(true);
      const token = localStorage.getItem('token');
      if (!token) {
        router.push('/login');
        return;
      }
  
      const formData = new FormData();
      
      formData.append('consultation_id', consultationId.toString());
      
      const receiverId = consultationDetails
        ? userType === 'dietitian'
          ? consultationDetails.user_id
          : consultationDetails.dietitian_id
        : messages[0]?.receiver_id || user?.id || '';
      
      formData.append('receiver_id', receiverId.toString());
      formData.append('message_type', file ? 'file' : 'text');
      formData.append('who', userType);
  
      if (file) {
        formData.append('file', file);
        if (newMessage.trim()) {
          formData.append('message', newMessage);
        }
      } else {
        formData.append('message', newMessage);
      }
  
      const response = await fetch(`${BASE_URL}/api/messages/send`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });
  
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to send message');
      }
  
      const data = await response.json();
      setMessages((prev) => [...prev, data.data[0]]);
      setNewMessage('');
      setFile(null);
      if (fileInputRef.current) fileInputRef.current.value = '';
    } catch (err) {
      console.error("Error sending message:", err);
      setError({
        message: err instanceof Error ? err.message : 'Could not send message',
        isCritical: true
      });
    } finally {
      setIsSending(false);
    }
  };

  useEffect(() => {
    if (!consultationId) {
      setError({
        message: 'Consultation ID is missing',
        isCritical: true
      });
      return;
    }

    loadConsultationDetails();
    loadMessages();

    const interval = setInterval(() => {
      if (consultationId && !isConsultationEnded) {
        loadMessages();
      }
    }, 5000);

    return () => clearInterval(interval);
  }, [consultationId, isConsultationEnded]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  const renderMessageContent = (message: Message) => {
    if (message.message_type === 'file') {
      return (
        <div className="mt-1">
          <a
            href={message.file_url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center text-blue-600 hover:underline"
          >
            <svg className="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z"
              />
            </svg>
            {message.file_name || 'Download file'}
          </a>
          {message.message && <p className="mt-2">{message.message}</p>}
        </div>
      );
    }
    return <p>{message.message}</p>;
  };

  if (!consultationId) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center p-4 bg-red-100 text-red-800 rounded-lg">
          Consultation ID is missing. Please check the URL.
        </div>
      </div>
    );
  }

  const otherUser = consultationDetails
    ? userType === 'dietitian'
      ? consultationDetails.user
      : consultationDetails.dietitian
    : {
        id: messages[0]?.receiver_id || '',
        name: messages[0]?.receiver_details?.name || 'Unknown',
        profile_picture: messages[0]?.receiver_details?.profile_picture,
        specialty: 'Dietitian',
      };

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').slice(0, 2);
  };

  return (
    <div className="flex flex-col h-screen bg-gray-50">
      <Navbar />
      
      {/* Header */}
      <div className="bg-white border-b p-4 shadow-sm">
        <div className="flex items-center space-x-3">
          <Avatar className="h-10 w-10">
            <AvatarImage 
              src={otherUser.profile_picture} 
              alt={otherUser.name}
              onError={(e) => {
                (e.target as HTMLImageElement).style.display = 'none';
              }}
            />
            <AvatarFallback className="bg-gray-200">
              {getInitials(otherUser.name)}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <div className="flex justify-between items-center">
              <h2 className="font-semibold text-gray-900">{otherUser.name}</h2>
              <span
                className={`text-xs px-2 py-1 rounded-full ${
                  isConsultationEnded ? 'bg-gray-100 text-gray-600' : 'bg-green-100 text-green-800'
                }`}
              >
                {isConsultationEnded ? 'Ended' : 'Active'}
              </span>
            </div>
            <p className="text-sm text-gray-500">
              {('specialty' in otherUser && otherUser.specialty) || 'Dietitian'}
            </p>
            {consultationDetails && (
              <div className="flex flex-wrap gap-x-4 text-xs text-gray-500 mt-1">
                <span>Rate: ₦{parseFloat(consultationDetails.rate_per_minute).toFixed(2)}/min</span>
                <span>Duration: {consultationDetails.duration_minutes} mins</span>
                <span>Total: ₦{parseFloat(consultationDetails.total_cost).toFixed(2)}</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {error?.isCritical && (
        <div className="bg-red-100 text-red-800 p-2 text-center text-sm">
          {error.message}
        </div>
      )}

      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {isConsultationEnded && (
          <div className="bg-yellow-100 text-yellow-800 p-3 rounded-lg text-center mb-4 text-sm">
            This consultation has ended. You can view messages but cannot send new ones.
          </div>
        )}

        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-gray-500">
            <svg className="h-12 w-12 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
              />
            </svg>
            <p>No messages yet. Start the conversation!</p>
          </div>
        ) : (
          messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.sender_type === userType ? 'justify-end' : 'justify-start'}`}
            >
              <div className="flex max-w-xs md:max-w-md lg:max-w-lg">
                {message.sender_type !== userType && (
                  <Avatar className="h-8 w-8 rounded-full mt-1 mr-2">
                    <AvatarImage 
                      src={otherUser.profile_picture} 
                      alt={otherUser.name}
                      onError={(e) => {
                        (e.target as HTMLImageElement).style.display = 'none';
                      }}
                    />
                    <AvatarFallback className="bg-gray-200">
                      {getInitials(otherUser.name)}
                    </AvatarFallback>
                  </Avatar>
                )}
                <div
                  className={`rounded-lg p-3 ${
                    message.sender_type === userType
                      ? 'bg-indigo-600 text-white rounded-br-none'
                      : 'bg-white text-gray-800 shadow-sm rounded-bl-none'
                  }`}
                >
                  {renderMessageContent(message)}
                  <p
                    className={`text-xs mt-1 ${
                      message.sender_type === userType ? 'text-indigo-200' : 'text-gray-500'
                    }`}
                  >
                    {new Date(message.created_at).toLocaleTimeString([], {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </p>
                </div>
              </div>
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="border-t border-gray-200 p-4 bg-white">
        {isConsultationEnded ? (
          <div className="text-center text-sm text-gray-500 py-2">
            Consultation has ended. No new messages can be sent.
          </div>
        ) : (
          <>
            {file && (
              <div className="flex items-center justify-between bg-indigo-50 rounded-lg p-2 mb-3">
                <div className="flex items-center space-x-2">
                  <svg
                    className="h-4 w-4 text-indigo-600"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z"
                    />
                  </svg>
                  <span className="text-sm text-indigo-800 truncate max-w-xs">{file.name}</span>
                </div>
                <button
                  onClick={() => setFile(null)}
                  className="text-red-500 hover:text-red-700"
                >
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>
            )}
            <div className="flex items-end gap-2">
              <button
                onClick={triggerFileInput}
                className="bg-gray-100 text-gray-600 rounded-full p-2 hover:bg-gray-200 transition-colors"
                title="Attach file"
              >
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13"
                  />
                </svg>
              </button>
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                className="hidden"
                accept="image/*, .pdf, .doc, .docx, .txt"
              />
              <div className="flex-1 bg-gray-100 rounded-lg px-3 py-2 focus-within:ring-2 focus-within:ring-indigo-500 transition-all">
                <textarea
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Type your message..."
                  className="w-full bg-transparent border-none focus:ring-0 resize-none text-sm"
                  rows={1}
                  style={{ minHeight: '40px', maxHeight: '120px' }}
                />
              </div>
              <button
                onClick={sendMessage}
                disabled={(!newMessage.trim() && !file) || isSending}
                className="bg-indigo-600 text-white rounded-full p-2 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                title="Send message"
              >
                {isSending ? (
                  <svg
                    className="animate-spin h-5 w-5"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    />
                  </svg>
                ) : (
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
                    />
                  </svg>
                )}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}