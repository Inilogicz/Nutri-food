'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import ErrorModal from '@/components/ui/ErrorModal';
import Navbar from '@/components/ui/Navbar';
import * as React from 'react';
import Link from 'next/link';

interface Message {
  id: number;
  message: string;
  who: 'user' | 'dietitian' | 'system';
  created_at: string;
  message_type: 'text' | 'file';
  file_url?: string;
  file_name?: string;
  consultation_id: number;
}

interface Consultation {
  id: number;
  user_id: number;
  dietitian_id: number;
  rate_per_minute: string;
  status: string;
  duration_minutes: number;
  total_cost: number;
  dietitian_name: string;
  dietitian_avatar?: string;
  created_at: string;
  updated_at: string;
}

export default function ConsultationPage({ params: paramsPromise }: { params: Promise<{ id: string }> }) {
  const params = React.use(paramsPromise);
  const { user } = useAuth();
  const router = useRouter();
  const [consultation, setConsultation] = useState<Consultation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState<{ title: string; message: string; isBalanceError?: boolean } | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [isConsultationEnded, setIsConsultationEnded] = useState(false);
  const [showBookingMessage, setShowBookingMessage] = useState(true);
  const [showDetails, setShowDetails] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const BASE_URL = 'https://devsammy.online';

  const loadMessages = async (consultationId: number) => {
    try {
      const messagesRes = await fetch(`${BASE_URL}/api/consultations/${consultationId}/messages`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });

      if (!messagesRes.ok) {
        const text = await messagesRes.text();
        if (messagesRes.status === 401) {
          setError({
            title: 'Authentication Error',
            message: 'Your session has expired. Please log in again.',
          });
          router.push('/login');
          return;
        }
        throw new Error(`HTTP ${messagesRes.status}: ${text}`);
      }

      const contentType = messagesRes.headers.get('content-type');
      if (!contentType?.includes('application/json')) {
        const text = await messagesRes.text();
        console.error('Non-JSON response from loadMessages:', text);
        throw new Error('Invalid response: Expected JSON, received ' + contentType);
      }

      const messagesData = await messagesRes.json();
      setMessages(messagesData.data || []);
    } catch (err) {
      setError({
        title: 'Messages Error',
        message: err instanceof Error ? err.message : 'Failed to load messages',
      });
    }
  };

  const sendAutomatedMessage = async (consultation: Consultation) => {
    try {
      const automatedMessage = `Welcome to your ${consultation.duration_minutes}-minute consultation with ${consultation.dietitian_name}! Rate: $${parseFloat(consultation.rate_per_minute).toFixed(2)}/min. Total Cost: $${consultation.total_cost.toFixed(2)}. Feel free to start the conversation.`;
      const response = await fetch(`${BASE_URL}/api/messages/send`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          consultation_id: consultation.id,
          message: automatedMessage,
          receiver_id: consultation.dietitian_id,
          message_type: 'text',
          who: 'system',
        }),
      });

      const contentType = response.headers.get('content-type');
      if (!contentType?.includes('application/json')) {
        const text = await response.text();
        console.error('Non-JSON response from sendAutomatedMessage:', text);
        throw new Error('Invalid response: Expected JSON, received ' + contentType);
      }

      const data = await response.json();

      if (!response.ok || data.status === false) {
        throw new Error(data.message || 'Failed to send automated message');
      }

      setMessages((prev) => [...prev, data.data]);
    } catch (err) {
      setError({
        title: 'Automated Message Error',
        message: err instanceof Error ? err.message : 'Failed to send automated message',
      });
    }
  };

  useEffect(() => {
    const startConsultation = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem('token');
        if (!token) {
          throw new Error('Authentication required. Please log in.');
        }
    
        // Get saved dietitian info from localStorage
        const savedDietitian = localStorage.getItem('selectedDietitian');
        if (!savedDietitian) {
          throw new Error('Dietitian information not found. Please start a new consultation.');
        }
        
        const { id: dietitianId, duration } = JSON.parse(savedDietitian);
    
        console.log('Starting consultation with dietitian_id:', dietitianId);
        const response = await fetch(`${BASE_URL}/api/consultations/start`, {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            dietitian_id: dietitianId,
            duration: duration
          })
        });
    
        // Rest of the function remains the same...
        const contentType = response.headers.get('content-type');
        if (!contentType?.includes('application/json')) {
          const errorText = await response.text();
          console.error('Non-JSON response from startConsultation:', errorText);
          let errorMessage = 'Failed to start consultation due to a server error.';
          if (errorText.includes('Server Error')) {
            errorMessage = 'The server encountered an error. Please try again or contact support.';
          } else if (errorText.includes('Forbidden')) {
            errorMessage = 'You are not authorized to start this consultation. Please check your account or log in again.';
          }
          throw new Error(errorMessage);
        }
    
        const data = await response.json();
    
        if (!response.ok) {
          if (data.message?.toLowerCase().includes('balance')) {
            setError({
              title: 'Insufficient Balance',
              message: 'You do not have enough balance to start this consultation. Please add funds to your account.',
              isBalanceError: true,
            });
          } else if (data.message?.toLowerCase().includes('dietitian')) {
            setError({
              title: 'Invalid Dietitian',
              message: 'The selected dietitian is not available. Please choose another dietitian.',
              isBalanceError: false,
            });
          } else {
            throw new Error(data.message || 'Failed to start consultation');
          }
          return;
        }
    
        if (!data.data || !data.data[0]) {
          throw new Error('Invalid response structure from server');
        }
    
        const consultationResponse = await fetch(`${BASE_URL}/api/consultations/${data.data[0].id}`, {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });
    
        if (!consultationResponse.ok) {
          const errorText = await consultationResponse.text();
          console.error('Error fetching consultation details:', errorText);
          throw new Error(errorText || 'Failed to fetch consultation details');
        }
    
        const consultationData = await consultationResponse.json();
        console.log('Consultation data:', consultationData.data);
    
        setConsultation(consultationData.data);
        setIsConsultationEnded(consultationData.data.status === 'ended');
        if (consultationData.data.status !== 'ended') {
          await sendAutomatedMessage(consultationData.data);
          await loadMessages(data.data[0].id);
        }
        
        // Clear the saved dietitian info after successful consultation start
        localStorage.removeItem('selectedDietitian');
      } catch (err) {
        setError({
          title: 'Consultation Error',
          message: err instanceof Error ? err.message : 'Failed to start consultation. Please try again or contact support.',
        });
      } finally {
        setLoading(false);
      }
    };

    startConsultation();
  }, [params.id]);

  useEffect(() => {
    let pollingInterval: NodeJS.Timeout;

    if (consultation?.id && !isConsultationEnded) {
      pollingInterval = setInterval(() => {
        loadMessages(consultation.id);
      }, 5000);
    }

    return () => {
      if (pollingInterval) clearInterval(pollingInterval);
    };
  }, [consultation?.id, isConsultationEnded]);

  useEffect(() => {
    if (!loading && messages.length > 0) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, loading]);

  const sendMessage = async () => {
    if ((!newMessage.trim() && !file) || !consultation || isConsultationEnded) {
      console.log('Send button disabled:', {
        hasMessage: !!newMessage.trim(),
        hasFile: !!file,
        hasConsultation: !!consultation,
        isConsultationEnded,
      });
      if (isConsultationEnded) {
        setError({
          title: 'Conversation Ended',
          message: 'This consultation has ended. You cannot send more messages.',
        });
      }
      return;
    }

    try {
      setIsSending(true);

      let response;
      let data;

      if (file) {
        const formData = new FormData();
        formData.append('consultation_id', consultation.id.toString());
        formData.append('receiver_id', consultation.dietitian_id.toString());
        formData.append('message_type', 'file');
        formData.append('who', 'user');
        formData.append('file', file);
        if (newMessage.trim()) formData.append('message', newMessage);

        response = await fetch(`${BASE_URL}/api/messages/send`, {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
          body: formData,
        });
      } else {
        response = await fetch(`${BASE_URL}/api/messages/send`, {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            consultation_id: consultation.id,
            message: newMessage,
            receiver_id: consultation.dietitian_id,
            message_type: 'text',
            who: 'user',
          }),
        });
      }

      const contentType = response.headers.get('content-type');
      if (!contentType?.includes('application/json')) {
        const text = await response.text();
        console.error('Non-JSON response from sendMessage:', text);
        if (text.includes('ended') || response.status === 403 || response.status === 400) {
          setIsConsultationEnded(true);
          setError({
            title: 'Conversation Ended',
            message: 'This consultation has ended. You cannot send more messages.',
          });
          return;
        }
        throw new Error('Invalid response: Expected JSON, received ' + contentType);
      }

      data = await response.json();

      if (!response.ok || data.status === false) {
        if (data.message?.toLowerCase().includes('consultation has ended') || data.message?.toLowerCase().includes('ended')) {
          setIsConsultationEnded(true);
          setError({
            title: 'Conversation Ended',
            message: 'This consultation has ended. You cannot send more messages.',
          });
        } else {
          throw new Error(data.message || 'Failed to send message');
        }
        return;
      }

      setMessages((prev) => [...prev, data.data]);
      setNewMessage('');
      setFile(null);
      if (fileInputRef.current) fileInputRef.current.value = '';
    } catch (err) {
      setError({
        title: 'Message Failed',
        message: err instanceof Error ? err.message : 'Could not send message',
      });
    } finally {
      setIsSending(false);
    }
  };

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

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (error?.isBalanceError) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
        <div className="bg-white p-8 rounded-xl shadow-lg max-w-md w-full text-center">
          <div className="text-red-500 mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">{error.title}</h2>
          <p className="text-gray-600 mb-6">{error.message}</p>
          <Link
            href="/"
            className="inline-block bg-indigo-600 text-white px-6 py-3 rounded-lg hover:bg-indigo-700 transition-colors"
          >
            Go Back Home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <Navbar />
      <ErrorModal
        isOpen={!!error && !error.isBalanceError}
        onClose={() => setError(null)}
        title={error?.title || 'Error'}
        message={error?.message || 'An unknown error occurred'}
      />

      <div className="max-w-4xl mx-auto px-4 py-6">
        {showBookingMessage && consultation && (
          <div className="bg-green-50 text-green-800 p-4 rounded-lg mb-4 flex justify-between items-center">
            <p>
              You booked a {consultation.duration_minutes} minute consultation with {consultation.dietitian_name}
            </p>
            <button
              onClick={() => setShowBookingMessage(false)}
              className="text-green-600 hover:text-green-800"
            >
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
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

        {!consultation && (
          <div className="bg-red-50 text-red-800 p-4 rounded-lg mb-4 text-center">
            Failed to start consultation. Please try another dietitian or contact support.
            <div className="mt-2">
              <Link
                href="/browse-dieticians"
                className="inline-block bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors"
              >
                Choose Another Dietitian
              </Link>
            </div>
          </div>
        )}

        {consultation && (
          <div className="bg-white rounded-xl shadow-md overflow-hidden">
            {/* Chat Header */}
            <div className="bg-white border-b border-gray-200 p-4 sticky top-0 z-10">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  {consultation.dietitian_avatar && (
                    <img
                      src={consultation.dietitian_avatar}
                      alt="Dietitian"
                      className="w-10 h-10 rounded-full object-cover ring-2 ring-indigo-200"
                    />
                  )}
                  <div>
                    <h2 className="text-lg font-semibold text-gray-800">
                      {consultation.dietitian_name || 'Dietitian'}
                    </h2>
                    <p className="text-sm text-gray-500">
                      {consultation.status === 'ongoing' ? (
                        <span className="flex items-center">
                          <span className="h-2 w-2 bg-green-500 rounded-full mr-1"></span> Online
                        </span>
                      ) : (
                        'Offline'
                      )}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setShowDetails(!showDetails)}
                  className="text-indigo-600 hover:text-indigo-800"
                >
                  <svg
                    className={`h-6 w-6 transform ${showDetails ? 'rotate-180' : ''}`}
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                </button>
              </div>
              {showDetails && (
                <div className="mt-3 text-sm text-gray-600 bg-gray-50 p-3 rounded-lg">
                  <p>Rate: ${parseFloat(consultation.rate_per_minute).toFixed(2)}/min</p>
                  <p>Total: ${consultation.total_cost.toFixed(2)}</p>
                  <p>Status: {consultation.status}</p>
                  <p>Duration: {consultation.duration_minutes} minutes</p>
                </div>
              )}
            </div>

            {/* Chat Messages */}
            <div className="h-[70vh] overflow-y-auto p-4 bg-gray-50">
              {isConsultationEnded && (
                <div className="flex justify-center mb-3">
                  <div className="bg-red-100 text-red-800 rounded-lg p-3 text-center max-w-xs md:max-w-md">
                    Conversation ended
                  </div>
                </div>
              )}
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex mb-3 ${
                    message.who === 'user'
                      ? 'justify-end'
                      : message.who === 'system'
                      ? 'justify-center'
                      : 'justify-start'
                  }`}
                >
                  <div
                    className={`max-w-xs md:max-w-md rounded-lg p-3 transition-all duration-200 ${
                      message.who === 'user'
                        ? 'bg-indigo-600 text-white'
                        : message.who === 'system'
                        ? 'bg-gray-200 text-gray-800 text-center'
                        : 'bg-white text-gray-800 shadow-sm'
                    } hover:shadow-md`}
                  >
                    {renderMessageContent(message)}
                    <p
                      className={`text-xs mt-1 ${
                        message.who === 'user'
                          ? 'text-indigo-200'
                          : message.who === 'system'
                          ? 'text-gray-600'
                          : 'text-gray-500'
                      }`}
                    >
                      {new Date(message.created_at).toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </p>
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div className="border-t border-gray-200 p-4 bg-white">
              {isConsultationEnded && (
                <div className="bg-red-50 text-red-800 p-3 rounded-lg mb-3 text-center">
                  This consultation has ended. You cannot send more messages.
                </div>
              )}
              {file && (
                <div className="flex items-center justify-between bg-indigo-50 rounded-lg p-2 mb-3">
                  <div className="flex items-center space-x-2">
                    <svg className="h-4 w-4 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
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
              <div className="flex items-center gap-2">
                <button
                  onClick={triggerFileInput}
                  className="bg-gray-100 text-gray-600 rounded-full p-2 hover:bg-gray-200 transition-colors"
                  disabled={isConsultationEnded || !consultation}
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
                <textarea
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Type your message..."
                  className="flex-1 border border-gray-200 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 resize-none transition-all text-sm"
                  rows={1}
                  disabled={isConsultationEnded || !consultation}
                />
                <button
                  onClick={sendMessage}
                  disabled={(!newMessage.trim() && !file) || isSending || isConsultationEnded || !consultation}
                  className="bg-indigo-600 text-white rounded-full p-2 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
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
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
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
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
