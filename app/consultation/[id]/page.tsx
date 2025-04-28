'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import ErrorModal from '@/components/ui/ErrorModal';
import * as React from 'react';
import Link from 'next/link';

interface Message {
  id: number;
  message: string;
  who: 'user' | 'dietitian';
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
        console.error('HTTP error:', messagesRes.status, text);
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
        console.error('Non-JSON response:', text);
        throw new Error('Invalid response: Expected JSON');
      }

      const messagesData = await messagesRes.json();
      setMessages(messagesData.data || []);
    } catch (err) {
      console.error('Load messages error:', err);
      setError({
        title: 'Messages Error',
        message: err instanceof Error ? err.message : 'Failed to load messages',
      });
    }
  };

  useEffect(() => {
    const initializeChat = async () => {
      try {
        setLoading(true);
        const consultationRes = await fetch(`${BASE_URL}/api/consultations/start`, {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            dietitian_id: parseInt(params.id),
            name: 'health consultation',
            duration: 5,
          }),
        });

        if (!consultationRes.ok) {
          const text = await consultationRes.text();
          console.error('HTTP error:', consultationRes.status, text);
          throw new Error(`HTTP ${consultationRes.status}: ${text}`);
        }

        const contentType = consultationRes.headers.get('content-type');
        if (!contentType?.includes('application/json')) {
          const text = await consultationRes.text();
          console.error('Non-JSON response:', text);
          throw new Error('Invalid response: Expected JSON');
        }

        const consultationData = await consultationRes.json();
        if (consultationData.message?.includes('Insufficient balance')) {
          setError({
            title: 'Payment Required',
            message: 'You don\'t have enough balance to start this consultation. Please add funds to your account.',
            isBalanceError: true,
          });
          return;
        }

        setConsultation(consultationData.data[0]);
        await loadMessages(consultationData.data[0].id);
      } catch (err) {
        console.error('Initialize chat error:', err);
        setError({
          title: 'Connection Error',
          message: err instanceof Error ? err.message : 'Failed to initialize chat',
        });
      } finally {
        setLoading(false);
      }
    };

    initializeChat();
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
    if ((!newMessage.trim() && !file) || !consultation || isConsultationEnded) return;

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
        console.error('Non-JSON response:', text);
        throw new Error('Invalid response: Expected JSON');
      }

      data = await response.json();

      if (!response.ok || data.status === false) {
        if (data.message?.includes('consultation has ended')) {
          setIsConsultationEnded(true);
          setError({
            title: 'Consultation Ended',
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
      console.error('Send message error:', err);
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
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (error?.isBalanceError) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center p-4">
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
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-6">
      <ErrorModal
        isOpen={!!error && !error.isBalanceError}
        onClose={() => setError(null)}
        title={error?.title || 'Error'}
        message={error?.message || 'An unknown error occurred'}
      />

      <div className="max-w-3xl mx-auto px-4">
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
          <div className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white p-6">
            <div className="flex justify-between items-center">
              <div className="flex items-center space-x-4">
                {consultation?.dietitian_avatar && (
                  <img
                    src={consultation.dietitian_avatar}
                    alt="Dietitian"
                    className="w-12 h-12 rounded-full object-cover ring-2 ring-white"
                  />
                )}
                <div>
                  <h2 className="text-xl font-semibold">
                    {consultation?.dietitian_name || 'Dietitian'}
                  </h2>
                  <p className="text-indigo-100 text-sm">
                    {consultation?.status === 'ongoing' ? 'Online' : 'Offline'}
                  </p>
                </div>
              </div>
              {consultation && (
                <div className="text-right text-sm">
                  <p className="text-indigo-100">
                    Rate: ${parseFloat(consultation.rate_per_minute).toFixed(2)}/min
                  </p>
                  <p className="text-indigo-100">Total: ${consultation.total_cost.toFixed(2)}</p>
                  <p className="text-indigo-100 capitalize">Status: {consultation.status}</p>
                </div>
              )}
            </div>
          </div>

          <div className="h-[65vh] overflow-y-auto p-6 bg-gray-50">
            {messages.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-gray-500">
                <svg className="h-16 w-16 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                  />
                </svg>
                <p className="text-lg">No messages yet. Start the conversation!</p>
              </div>
            ) : (
              messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex mb-4 ${message.who === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-xs md:max-w-md rounded-2xl p-4 transition-all duration-200 ${
                      message.who === 'user'
                        ? 'bg-indigo-600 text-white'
                        : 'bg-white text-gray-800 shadow-sm'
                    }`}
                  >
                    {renderMessageContent(message)}
                    <p
                      className={`text-xs mt-2 ${
                        message.who === 'user' ? 'text-indigo-200' : 'text-gray-500'
                      }`}
                    >
                      {new Date(message.created_at).toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </p>
                  </div>
                </div>
              ))
            )}
            <div ref={messagesEndRef} />
          </div>

          <div className="border-t border-gray-200 p-4 bg-white">
            {isConsultationEnded && (
              <div className="bg-red-50 text-red-800 p-3 rounded-lg mb-4 text-center">
                This consultation has ended. You cannot send more messages.
              </div>
            )}
            {file && (
              <div className="flex items-center justify-between bg-indigo-50 rounded-lg p-3 mb-3">
                <div className="flex items-center space-x-2">
                  <svg className="h-5 w-5 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
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
            <div className="flex items-center gap-3">
              <button
                onClick={triggerFileInput}
                className="bg-gray-100 text-gray-600 rounded-full p-3 hover:bg-gray-200 transition-colors"
                disabled={isConsultationEnded}
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
                className="flex-1 border border-gray-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 resize-none transition-all"
                rows={2}
                disabled={isConsultationEnded}
              />
              <button
                onClick={sendMessage}
                disabled={(!newMessage.trim() && !file) || isSending || isConsultationEnded}
                className="bg-indigo-600 text-white rounded-full p-3 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
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
      </div>
    </div>
  );
}