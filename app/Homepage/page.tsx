'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import Navbar from '../../components/ui/Navbar';
import { Meal } from '@/types/meal';
import { Dietician } from '@/types/dietician';
import Image from 'next/image';

// Animation variants
const fadeIn = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.6 } }
};

const slideUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } }
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

export default function Home() {
  const [timeOfDay, setTimeOfDay] = useState<'morning' | 'afternoon' | 'night'>('morning');
  const [recommendedMeal, setRecommendedMeal] = useState<any | null>(null);
  const [dieticians, setDieticians] = useState<Dietician[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'ai' | 'dietician'>('ai');
  const [mealTab, setMealTab] = useState<'ingredients' | 'instructions' | 'nutrition'>('ingredients');
  
  const router = useRouter();

  const handleAI = () => {
    router.push('/AI');
  };
  const handleDietician = () => {
    router.push('/AI');
  };

  // Determine time of day
  useEffect(() => {
    const hour = new Date().getHours();
    if (hour >= 5 && hour < 12) setTimeOfDay('morning');
    else if (hour >= 12 && hour < 18) setTimeOfDay('afternoon');
    else setTimeOfDay('night');
  }, []);

  // Fetch recommended meal and dieticians
  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        
        // Using the provided API endpoint
        const mealRes = await fetch('/api/proxy/meal-suggestions/');
        const dieticiansRes = await fetch('/api/dieticians');
        
        if (!mealRes.ok || !dieticiansRes.ok) throw new Error('Failed to fetch data');
        
        const [mealData, dieticiansData] = await Promise.all([
          mealRes.json(),
          dieticiansRes.json()
        ]);
        
        setRecommendedMeal(mealData);
        setDieticians(dieticiansData.dieticians);
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [timeOfDay]);

  // Placeholder image based on meal name
  const getMealImage = (mealName: string) => {
    const mealImages: Record<string, string> = {
      'Quinoa': 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
      'Stir-Fry': 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
    };
    
    const matchedKey = Object.keys(mealImages).find(key => 
      mealName.toLowerCase().includes(key.toLowerCase())
    );
    
    return matchedKey ? mealImages[matchedKey] : 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80';
  };

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
        {/* Hero Section - Unchanged */}
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
            Your Personalized <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600">Nutrition Hub</span>
          </motion.h1>
          <motion.p 
            variants={slideUp}
            className="text-xl text-gray-600 max-w-2xl mx-auto"
          >
            AI-powered meal plans, expert consultations, and smart tracking for your health journey
          </motion.p>
        </motion.section>

        {/* Updated Recommended Meal Section */}
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
            <span className="px-3 py-1 bg-indigo-100 text-indigo-800 rounded-full text-sm font-medium">
              {timeOfDay.charAt(0).toUpperCase() + timeOfDay.slice(1)}
            </span>
          </motion.div>

          {isLoading ? (
            <motion.div 
              variants={slideUp}
              className="bg-white rounded-xl shadow-lg p-8 flex justify-center"
            >
              <div className="animate-pulse h-64 w-full bg-gray-200 rounded-lg"></div>
            </motion.div>
          ) : recommendedMeal ? (
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
                    src={getMealImage(recommendedMeal.name)}
                    alt={recommendedMeal.name}
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
                        {recommendedMeal.preparation_time} mins
                      </span>
                      <span className="flex items-center text-sm">
                        <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                        </svg>
                        {recommendedMeal.calories} kcal
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
                          <h3 className="text-xl font-bold text-gray-900 mb-4">{recommendedMeal.name}</h3>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            {recommendedMeal.ingredients.map((ingredient: any, index: number) => (
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
                            {recommendedMeal.instructions.map((step: string, index: number) => (
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
                              <p className="text-xl font-bold text-gray-900">{recommendedMeal.calories} kcal</p>
                            </div>
                            <div className="bg-purple-50 p-4 rounded-lg">
                              <p className="text-sm text-purple-600 font-medium">Prep Time</p>
                              <p className="text-xl font-bold text-gray-900">{recommendedMeal.preparation_time} mins</p>
                            </div>
                          </div>
                          <div className="bg-gray-50 p-4 rounded-lg">
                            <h4 className="font-bold text-gray-900 mb-2">Dietary Notes</h4>
                            <p className="text-gray-700">{recommendedMeal.dietary_notes}</p>
                          </div>
                        </div>
                      )}
                    </motion.div>
                  </AnimatePresence>
                </div>
              </div>
            </motion.div>
          ) : (
            <motion.div 
              variants={slideUp}
              className="bg-white rounded-xl shadow-lg p-8 text-center"
            >
              <p className="text-gray-500">No meal recommendation available</p>
            </motion.div>
          )}
        </motion.section>

        {/* Rest of the components remain unchanged */}
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
                    <button  onClick={handleAI}
                    className="px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg hover:opacity-90 transition-opacity font-medium shadow-md">
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
                    <button onClick={handleDietician}
                     className="px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg hover:opacity-90 transition-opacity font-medium shadow-md">
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
            Join thousands who've transformed their nutrition with our AI and expert guidance.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="px-8 py-3 bg-white text-indigo-600 font-bold rounded-lg hover:bg-gray-100 transition-all shadow-lg"
            >
              Try AI Assistant
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
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