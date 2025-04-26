'use client';

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/context/AuthContext';
import Navbar from '@/components/ui/Navbar';

type Ingredient = {
  name: string;
  quantity: string;
};

type MealSuggestion = {
  name: string;
  ingredients: Ingredient[];
  instructions: string[];
  calories: number;
  preparation_time: number;
  dietary_notes: string;
};

type Message = {
  id: string;
  sender: 'user' | 'ai';
  content: string | MealSuggestion;
  timestamp: Date;
  type: 'text' | 'meal';
};

export default function AIChatPage() {
  const { isAuthenticated,  loading: authLoading } = useAuth();
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      sender: 'ai',
      content: isAuthenticated 
        ? 'Hello! I can suggest meals based on ingredients you have. List what you have (e.g., "chicken, rice, tomatoes")'
        : 'Please sign in to access meal suggestions',
      timestamp: new Date(),
      type: 'text'
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    if (!authLoading) {
      setMessages([
        {
          id: '1',
          sender: 'ai',
          content: isAuthenticated
            ? 'Hello! I can suggest meals based on ingredients you have. List what you have (e.g., "chicken, rice, tomatoes")'
            : 'Please sign in to access meal suggestions',
          timestamp: new Date(),
          type: 'text',
        }
      ]);
    }
  }, [isAuthenticated, authLoading]);
  

  const handleSendMessage = async () => {
    if (!inputValue.trim() || !isAuthenticated) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      sender: 'user',
      content: inputValue,
      timestamp: new Date(),
      type: 'text'
    };
    
    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsLoading(true);

    try {
      const ingredients = extractIngredients(inputValue);
      if (ingredients.length > 0) {
        const token = localStorage.getItem('token');
        if (!token) throw new Error('Authentication required');
        
        const mealSuggestion = await getMealSuggestion(ingredients, token);
        addAiMessage(mealSuggestion, 'meal');
      } else {
        addAiMessage('Please list ingredients (e.g., "chicken, rice, tomatoes") to get meal suggestions.', 'text');
      }
    } catch (error) {
      handleError(error);
    } finally {
      setIsLoading(false);
    }
  };

  const extractIngredients = (text: string): string[] => {
    return text
      .split(/[,;/\n]/)
      .map(item => item.trim().toLowerCase())
      .filter(item => item.length > 0 && !['and', 'with', 'plus'].includes(item));
  };

  const getMealSuggestion = async (ingredients: string[], token: string): Promise<MealSuggestion> => {
    const response = await fetch('https://devsammy.online/api/meal-suggestions/ingredients', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ ingredients })
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || 'Failed to fetch meal suggestion');
    }

    return await response.json();
  };

  const addAiMessage = (content: string | MealSuggestion, type: 'text' | 'meal') => {
    const aiMessage: Message = {
      id: (Date.now() + 1).toString(),
      sender: 'ai',
      content,
      timestamp: new Date(),
      type
    };
    setMessages(prev => [...prev, aiMessage]);
  };

  const handleError = (error: unknown) => {
    let errorMessage = 'Sorry, I encountered an error. Please try again.';
    
    if (error instanceof Error) {
      if (error.message === 'Authentication required') {
        errorMessage = 'Please sign in to use the meal suggestion feature.';
      } else if (error.message.includes('Failed to fetch')) {
        errorMessage = 'Unable to connect to the service. Please check your connection.';
      }
    }

    addAiMessage(errorMessage, 'text');
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const formatMealSuggestion = (meal: MealSuggestion) => {
    return (
      <div className="space-y-3">
        <Navbar/>
        <h3 className="font-bold text-lg">{meal.name}</h3>
        
        <div className="bg-indigo-50 p-3 rounded-lg">
          <h4 className="font-semibold text-indigo-800">Ingredients:</h4>
          <ul className="list-disc pl-5 space-y-1 mt-2">
            {meal.ingredients.map((ingredient, index) => (
              <li key={index} className="text-gray-700">
                <span className="font-medium">{ingredient.quantity}</span> {ingredient.name}
              </li>
            ))}
          </ul>
        </div>
        
        <div className="bg-green-50 p-3 rounded-lg">
          <h4 className="font-semibold text-green-800">Instructions:</h4>
          <ol className="list-decimal pl-5 space-y-2 mt-2">
            {meal.instructions.map((instruction, index) => (
              <li key={index} className="text-gray-700">{instruction}</li>
            ))}
          </ol>
        </div>
        
        <div className="flex flex-wrap gap-4 text-sm">
          <span className="flex items-center gap-1">
            <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            {meal.preparation_time} mins
          </span>
          <span className="flex items-center gap-1">
            <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
            {meal.calories} calories
          </span>
        </div>
        
        {meal.dietary_notes && (
          <div className="bg-yellow-50 p-3 rounded-lg text-sm text-yellow-800">
            <p className="font-medium">Dietary Notes:</p>
            <p>{meal.dietary_notes}</p>
          </div>
        )}
      </div>
    );
  };

  if (authLoading) {
    return (
      <div className="flex flex-col h-screen bg-gray-50 items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-600"></div>
        <p className="mt-4 text-gray-600">Loading...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen bg-gray-50">
      {/* Chat Container */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message) => (
          <AnimatePresence key={message.id}>
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2 }}
              className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-xs md:max-w-md lg:max-w-lg rounded-lg px-4 py-3 ${
                  message.sender === 'user'
                    ? 'bg-indigo-600 text-white rounded-br-none'
                    : 'bg-white border border-gray-200 rounded-bl-none shadow-sm'
                }`}
              >
                {message.type === 'text' ? (
                  <p>{message.content as string}</p>
                ) : (
                  formatMealSuggestion(message.content as MealSuggestion)
                )}
                <p className={`text-xs mt-1 ${message.sender === 'user' ? 'text-indigo-200' : 'text-gray-400'}`}>
                  {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </p>
              </div>
            </motion.div>
          </AnimatePresence>
        ))}
        
        {isLoading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex justify-start"
          >
            <div className="bg-white border border-gray-200 rounded-lg rounded-bl-none px-4 py-3 shadow-sm">
              <div className="flex space-x-2">
                <div className="w-2 h-2 bg-gray-300 rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-gray-300 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                <div className="w-2 h-2 bg-gray-300 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
              </div>
            </div>
          </motion.div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="bg-white border-t p-4">
        <div className="flex items-end space-x-2">
          <div className="flex-1 bg-gray-100 rounded-lg">
            <textarea
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={isAuthenticated 
                ? "List ingredients you have (e.g., chicken, rice, tomatoes)..." 
                : "Sign in to get meal suggestions..."}
              className="w-full bg-transparent border-none focus:ring-0 resize-none py-3 px-4 max-h-32"
              rows={1}
              disabled={!isAuthenticated}
            />
          </div>
          <button
            onClick={handleSendMessage}
            disabled={!inputValue.trim() || isLoading || !isAuthenticated}
            className="p-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
            </svg>
          </button>
        </div>
        <p className="text-xs text-gray-500 mt-2 text-center">
          {isAuthenticated 
            ? "Get personalized meal suggestions based on your ingredients" 
            : "Sign in to access meal suggestions"}
        </p>
      </div>

      {/* Quick Suggestions */}
      {isAuthenticated && (
        <div className="bg-gray-50 border-t p-4">
          <h3 className="text-xs font-semibold text-gray-500 uppercase mb-2">Try these combinations</h3>
          <div className="grid grid-cols-2 gap-2">
            {[
              "chicken, rice, tomatoes",
              "eggs, spinach, cheese",
              "beef, potatoes, carrots",
              "salmon, broccoli, rice"
            ].map((question) => (
              <button
                key={question}
                onClick={() => setInputValue(question)}
                className="text-xs bg-white border border-gray-200 rounded-full px-3 py-1.5 hover:bg-gray-50 transition-colors text-gray-700 truncate"
              >
                {question}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}