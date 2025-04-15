'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import { useAuth } from '@/context/AuthContext';

// Animation variants
const fadeIn = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.6 } }
};

const slideUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } }
};

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
  image_url?: string;
};

export default function Home() {
  const [timeOfDay, setTimeOfDay] = useState<'morning' | 'afternoon' | 'night'>('morning');
  const [recommendedMeal, setRecommendedMeal] = useState<MealSuggestion | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'ai' | 'dietician'>('ai');
  const [mealTab, setMealTab] = useState<'ingredients' | 'instructions' | 'nutrition'>('ingredients');
  const [error, setError] = useState<string | null>(null);
  
  const router = useRouter();
  const { isAuthenticated, user, loading: authLoading, logout } = useAuth();

  const handleAI = () => {
    router.push('/AI');
  };
  const handleDietician = () => {
    router.push('/consultation');
  };

  // Redirect if not authenticated
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, authLoading, router]);

  // Determine time of day
  useEffect(() => {
    const hour = new Date().getHours();
    if (hour >= 5 && hour < 12) setTimeOfDay('morning');
    else if (hour >= 12 && hour < 18) setTimeOfDay('afternoon');
    else setTimeOfDay('night');
  }, []);

  // Fetch recommended meal with authentication
  useEffect(() => {
    if (authLoading) return; // Wait until auth state is determined

    const fetchMeal = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        const token = localStorage.getItem('token');
        if (!token) {
          throw new Error('Authentication required. Please login.');
        }

        const response = await fetch('/api/proxy/meal-suggestions', {
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          }
        });
        
        if (!response.ok) {
          if (response.status === 401) {
            logout(); // Clear invalid auth state
            throw new Error('Session expired. Please login again.');
          }
          throw new Error(`Failed to fetch meal: ${response.status} ${response.statusText}`);
        }
        
        const data = await response.json();
        
        // Validate the response structure
        if (!data?.name || !data?.ingredients || !data?.instructions) {
          throw new Error('Invalid meal data structure received from API');
        }
        
        setRecommendedMeal(data);
      } catch (err) {
        console.error('Error fetching meal:', err);
        setError(err instanceof Error ? err.message : 'Failed to load meal recommendation');
        setRecommendedMeal(null);
      } finally {
        setIsLoading(false);
      }
    };

    fetchMeal();
  }, [authLoading, logout]);

  // Get appropriate meal image
  const getMealImage = (meal: MealSuggestion | null) => {
    if (meal?.image_url) return meal.image_url;
    
    if (meal?.name.toLowerCase().includes('quinoa')) {
      return 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80';
    }
    
    return 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80';
  };

  // Extract dietary tags
  const getDietaryTags = (notes: string) => {
    if (!notes) return [];
    
    const tags = [];
    if (notes.toLowerCase().includes('vegan')) tags.push('Vegan');
    if (notes.toLowerCase().includes('gluten-free')) tags.push('Gluten-Free');
    if (notes.toLowerCase().includes('high in fiber')) tags.push('High Fiber');
    if (notes.toLowerCase().includes('weight management')) tags.push('Weight Management');
    return tags;
  };

  // Render error state
  const renderErrorState = () => (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-xl shadow-lg p-8 text-center border border-red-100"
    >
      <div className="flex flex-col items-center">
        <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center mb-4">
          <svg className="w-10 h-10 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
          </svg>
        </div>
        <h3 className="text-xl font-medium text-gray-900 mb-2">Couldn&apos;t Load Recommendation</h3>
        <p className="text-gray-600 mb-4 max-w-md">
          {error || 'We encountered an issue fetching your meal suggestion.'}
        </p>
        <div className="flex gap-3">
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors text-sm font-medium"
          >
            Try Again
          </button>
          <button
            onClick={() => setError(null)}
            className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors text-sm font-medium"
          >
            Dismiss
          </button>
        </div>
      </div>
    </motion.div>
  );

  // Render loading state
  const renderLoadingState = () => (
    <motion.div 
      variants={slideUp}
      className="bg-white rounded-xl shadow-lg p-8 flex justify-center items-center h-96"
    >
      <div className="animate-pulse flex flex-col items-center">
        <div className="h-12 w-12 bg-indigo-200 rounded-full mb-4 animate-bounce"></div>
        <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
        <div className="h-4 bg-gray-200 rounded w-1/2"></div>
      </div>
    </motion.div>
  );

  // Render meal recommendation
  const renderMealRecommendation = () => (
    <>
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300"
      >
        <div className="md:flex">
          <div className="md:flex-shrink-0 md:w-1/3 relative overflow-hidden">
            <Image
              className="h-64 w-full object-cover md:h-full transition-transform duration-500 hover:scale-105"
              src={getMealImage(recommendedMeal)}
              alt={recommendedMeal?.name || 'Recommended meal'}
              width={400}
              height={400}
              priority={true}
            />
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-4">
              <div className="flex items-center gap-4 text-white/90">
                <span className="flex items-center text-sm">
                  <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  {recommendedMeal?.preparation_time || 'N/A'} mins
                </span>
                <span className="flex items-center text-sm">
                  <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                  {recommendedMeal?.calories || 'N/A'} kcal
                </span>
              </div>
            </div>
          </div>
          <div className="p-6 md:p-8">
            {/* Meal Tabs */}
            <div className="border-b border-gray-200 mb-6">
              <nav className="flex -mb-px">
                <button
                  onClick={() => setMealTab('ingredients')}
                  className={`py-3 px-4 text-center border-b-2 font-medium text-sm ${mealTab === 'ingredients' ? 'border-indigo-500 text-indigo-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}
                >
                  Ingredients
                </button>
                <button
                  onClick={() => setMealTab('instructions')}
                  className={`py-3 px-4 text-center border-b-2 font-medium text-sm ${mealTab === 'instructions' ? 'border-indigo-500 text-indigo-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}
                >
                  Instructions
                </button>
                <button
                  onClick={() => setMealTab('nutrition')}
                  className={`py-3 px-4 text-center border-b-2 font-medium text-sm ${mealTab === 'nutrition' ? 'border-indigo-500 text-indigo-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}
                >
                  Nutrition
                </button>
              </nav>
            </div>

            <AnimatePresence mode="wait">
              <motion.div
                key={mealTab}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
              >
                {mealTab === 'ingredients' && (
                  <div>
                    <h3 className="text-xl font-bold text-gray-900 mb-4">{recommendedMeal?.name || 'Recommended Meal'}</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {recommendedMeal?.ingredients?.map((ingredient, index) => (
                        <div key={index} className="flex items-start p-2 bg-gray-50 rounded-lg">
                          <div className="flex items-center justify-center h-6 w-6 rounded-full bg-indigo-100 text-indigo-800 text-xs font-medium mr-3 mt-0.5">
                            {index + 1}
                          </div>
                          <div>
                            <p className="font-medium text-gray-900">{ingredient.name}</p>
                            <p className="text-sm text-gray-500">{ingredient.quantity}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {mealTab === 'instructions' && (
                  <div>
                    <h3 className="text-xl font-bold text-gray-900 mb-4">Preparation</h3>
                    <ol className="space-y-3">
                      {recommendedMeal?.instructions?.map((step, index) => (
                        <li key={index} className="flex">
                          <span className="flex items-center justify-center h-6 w-6 rounded-full bg-indigo-100 text-indigo-800 text-xs font-medium mr-3 mt-0.5">
                            {index + 1}
                          </span>
                          <p className="text-gray-700">{step}</p>
                        </li>
                      ))}
                    </ol>
                  </div>
                )}

                {mealTab === 'nutrition' && (
                  <div>
                    <h3 className="text-xl font-bold text-gray-900 mb-4">Nutritional Information</h3>
                    <div className="grid grid-cols-2 gap-4 mb-6">
                      <div className="bg-indigo-50 p-4 rounded-lg">
                        <p className="text-sm text-indigo-600 font-medium">Calories</p>
                        <p className="text-xl font-bold text-gray-900">{recommendedMeal?.calories || 'N/A'} kcal</p>
                      </div>
                      <div className="bg-purple-50 p-4 rounded-lg">
                        <p className="text-sm text-purple-600 font-medium">Prep Time</p>
                        <p className="text-xl font-bold text-gray-900">{recommendedMeal?.preparation_time || 'N/A'} mins</p>
                      </div>
                    </div>
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <h4 className="font-bold text-gray-900 mb-2">Dietary Notes</h4>
                      <p className="text-gray-700">{recommendedMeal?.dietary_notes || 'No dietary notes available.'}</p>
                    </div>
                  </div>
                )}
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </motion.div>

      {/* Dietary Tags */}
      {recommendedMeal?.dietary_notes && (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="mt-6 flex flex-wrap gap-2"
        >
          {getDietaryTags(recommendedMeal.dietary_notes).map((tag, index) => (
            <span 
              key={index} 
              className={`px-3 py-1 rounded-full text-xs font-medium ${
                tag === 'Vegan' ? 'bg-green-100 text-green-800' :
                tag === 'Gluten-Free' ? 'bg-blue-100 text-blue-800' :
                tag === 'High Fiber' ? 'bg-purple-100 text-purple-800' :
                'bg-yellow-100 text-yellow-800'
              }`}
            >
              {tag}
            </span>
          ))}
        </motion.div>
      )}
    </>
  );

  if (authLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-indigo-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-indigo-50">
      {/* Animated background elements */}
      <div className="fixed inset-0 overflow-hidden -z-10">
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.1 }}
          transition={{ duration: 1 }}
          className="absolute top-1/4 left-1/4 w-64 h-64 bg-indigo-200 rounded-full filter blur-3xl"
        />
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.1 }}
          transition={{ duration: 1, delay: 0.3 }}
          className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-purple-200 rounded-full filter blur-3xl"
        />
      </div>

      <main className="container mx-auto px-4 py-8">
        {/* Hero Section */}
        <motion.section 
          initial="hidden"
          animate="visible"
          variants={fadeIn}
          className="mb-16 md:mb-24 text-center"
        >
          <motion.h1 
            variants={slideUp}
            className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 mb-4 leading-tight"
          >
            Welcome back, <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600">{user?.name || 'User'}</span>
          </motion.h1>
          <motion.p 
            variants={slideUp}
            className="text-xl text-gray-600 max-w-2xl mx-auto"
          >
            AI-powered meal plans, expert consultations, and smart tracking for your health journey
          </motion.p>
        </motion.section>

        {/* Recommended Meal Section */}
        <motion.section 
          initial="hidden"
          animate="visible"
          variants={fadeIn}
          className="mb-16 md:mb-24"
        >
          <motion.div 
            variants={slideUp}
            className="flex justify-between items-center mb-6"
          >
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900">
              Your {timeOfDay} Recommendation
            </h2>
            {!isLoading && recommendedMeal && (
              <span className="px-3 py-1 bg-indigo-100 text-indigo-800 rounded-full text-sm font-medium">
                {timeOfDay.charAt(0).toUpperCase() + timeOfDay.slice(1)}
              </span>
            )}
          </motion.div>

          {isLoading ? renderLoadingState() : 
           error ? renderErrorState() : 
           recommendedMeal ? renderMealRecommendation() : 
           renderErrorState()}
        </motion.section>

        {/* Services Section */}
        <motion.section 
          initial="hidden"
          animate="visible"
          variants={fadeIn}
          className="mb-16 md:mb-24"
        >
          <motion.h2 
            variants={slideUp}
            className="text-2xl md:text-3xl font-bold text-gray-900 mb-6"
          >
            Get Personalized Advice
          </motion.h2>
          
          <motion.div 
            variants={slideUp}
            className="bg-white rounded-xl shadow-lg overflow-hidden"
          >
            {/* Tabs */}
            <div className="flex border-b border-gray-200">
              <button
                onClick={() => setActiveTab('ai')}
                className={`flex-1 py-4 px-6 text-center font-medium ${activeTab === 'ai' ? 'text-indigo-600 border-b-2 border-indigo-600' : 'text-gray-500 hover:text-gray-700'}`}
              >
                <div className="flex items-center justify-center gap-2">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                  </svg>
                  AI Nutrition Assistant
                </div>
              </button>
              <button
                onClick={() => setActiveTab('dietician')}
                className={`flex-1 py-4 px-6 text-center font-medium ${activeTab === 'dietician' ? 'text-indigo-600 border-b-2 border-indigo-600' : 'text-gray-500 hover:text-gray-700'}`}
              >
                <div className="flex items-center justify-center gap-2">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                  Live Dietician Chat
                </div>
              </button>
            </div>
            
            {/* Tab Content */}
            <div className="p-6 md:p-8">
              {activeTab === 'ai' ? (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.3 }}
                  className="flex flex-col md:flex-row gap-8"
                >
                  <div className="md:w-1/2">
                    <h3 className="text-xl font-bold text-gray-900 mb-4">Instant AI Nutrition Advice</h3>
                    <p className="text-gray-600 mb-6">
                      Our AI assistant can answer your nutrition questions 24/7, analyze your meals, and provide personalized recommendations based on your health goals.
                    </p>
                    <ul className="space-y-3 mb-6">
                      {[
                        "Get instant meal analysis",
                        "Personalized supplement advice",
                        "Allergy-aware substitutions",
                        "Macro tracking assistance"
                      ].map((feature, index) => (
                        <li key={index} className="flex items-start">
                          <svg className="h-5 w-5 text-indigo-500 mr-2 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                          </svg>
                          <span className="text-gray-700">{feature}</span>
                        </li>
                      ))}
                    </ul>
                    <button 
                      onClick={handleAI}
                      className="px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg hover:opacity-90 transition-opacity font-medium shadow-md"
                    >
                      Chat with AI Assistant
                    </button>
                  </div>
                  <div className="md:w-1/2 bg-gray-50 rounded-lg p-6 flex items-center justify-center">
                    <div className="text-center">
                      <div className="mx-auto h-40 w-40 bg-indigo-100 rounded-full flex items-center justify-center mb-4">
                        <svg className="h-20 w-20 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                        </svg>
                      </div>
                      <p className="text-gray-500">Always available, always learning</p>
                    </div>
                  </div>
                </motion.div>
              ) : (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.3 }}
                  className="flex flex-col md:flex-row gap-8"
                >
                  <div className="md:w-1/2">
                    <h3 className="text-xl font-bold text-gray-900 mb-4">Connect with Certified Dieticians</h3>
                    <p className="text-gray-600 mb-6">
                      Schedule live consultations with our network of certified nutrition experts for personalized advice tailored to your specific needs and health conditions.
                    </p>
                    <ul className="space-y-3 mb-6">
                      {[
                        "One-on-one video consultations",
                        "Personalized meal planning",
                        "Health condition management",
                        "Ongoing progress tracking"
                      ].map((feature, index) => (
                        <li key={index} className="flex items-start">
                          <svg className="h-5 w-5 text-indigo-500 mr-2 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                          </svg>
                          <span className="text-gray-700">{feature}</span>
                        </li>
                      ))}
                    </ul>
                    <button 
                      onClick={handleDietician}
                      className="px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg hover:opacity-90 transition-opacity font-medium shadow-md"
                    >
                      Browse Dieticians
                    </button>
                  </div>
                  <div className="md:w-1/2 bg-gray-50 rounded-lg p-6 flex items-center justify-center">
                    <div className="text-center">
                      <div className="mx-auto h-40 w-40 bg-indigo-100 rounded-full flex items-center justify-center mb-4 overflow-hidden">
                        <Image 
                          src="https://images.unsplash.com/photo-1559839734-2b71ea197ec2?ixlib=rb-1.2.1&auto=format&fit=crop&w=400&q=80" 
                          alt="Dietician"
                          width={160}
                          height={160}
                          className="h-full w-full object-cover"
                        />
                      </div>
                      <p className="text-gray-500">Real experts, real results</p>
                    </div>
                  </div>
                </motion.div>
              )}
            </div>
          </motion.div>
        </motion.section>

        {/* Final CTA Section */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-xl shadow-xl p-8 md:p-12 text-center"
        >
          <h2 className="text-2xl md:text-3xl font-bold text-white mb-4">
            Start Your Health Journey Today
          </h2>
          <p className="text-indigo-100 max-w-2xl mx-auto mb-6">
            Join thousands who have transformed their nutrition with our AI and expert guidance.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleAI}
              className="px-8 py-3 bg-white text-indigo-600 font-bold rounded-lg hover:bg-gray-100 transition-all shadow-lg"
            >
              Try AI Assistant
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleDietician}
              className="px-8 py-3 bg-transparent border-2 border-white text-white font-bold rounded-lg hover:bg-white/10 transition-all"
            >
              Book Dietician
            </motion.button>
          </div>
        </motion.section>
      </main>
    </div>
  );
}