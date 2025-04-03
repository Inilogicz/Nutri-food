'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import Navbar from '../components/ui/Navbar';

// Animation variants
const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 }
};

const fadeIn = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { duration: 0.8 } }
};

const slideUp = {
  hidden: { opacity: 0, y: 50 },
  show: { opacity: 1, y: 0, transition: { duration: 0.6 } }
};

export default function LandingPage() {
  const [email, setEmail] = useState('');
  const [isHovered, setIsHovered] = useState<number | null>(null);
  const router = useRouter();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    router.push(`/signup?email=${encodeURIComponent(email)}`);
  };

  const features = [
    {
      name: 'AI Meal Planning',
      description: 'Our algorithm creates perfect meal plans based on your goals and preferences',
      icon: '🤖'
    },
    {
      name: 'Live Dietician Chats',
      description: 'Instant access to certified nutrition experts 24/7',
      icon: '💬'
    },
    {
      name: 'Smart Grocery Lists',
      description: 'Automatically generated shopping lists based on your meal plan',
      icon: '🛒'
    },
    {
      name: 'Progress Analytics',
      description: 'Track your nutrition journey with beautiful data visualizations',
      icon: '📈'
    }
  ];

  const testimonials = [
    {
      quote: "Lost 25lbs in 3 months without feeling deprived. The meal plans are incredible!",
      name: "Sarah J.",
      title: "Verified User"
    },
    {
      quote: "My dietician helped me manage my diabetes better than my doctor. Life-changing!",
      name: "Michael T.",
      title: "Pro Member"
    },
    {
      quote: "Finally an app that understands food allergies. The customization is unmatched.",
      name: "Emma R.",
      title: "Premium User"
    }
  ];

  return (
    <div className="min-h-screen bg-white overflow-x-hidden">
      {/* Animated Background Elements */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="fixed inset-0 -z-10 overflow-hidden"
      >
        <div className="absolute top-0 left-1/4 w-72 h-72 bg-indigo-100 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
        <div className="absolute top-0 right-1/4 w-72 h-72 bg-blue-100 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
        <div className="absolute bottom-0 left-1/2 w-72 h-72 bg-purple-100 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-4000"></div>
      </motion.div>

      {/* Navbar */}
      {/* <Navbar /> */}

      {/* Hero Section */}
      <section className="relative pt-24 pb-12 md:pt-32 md:pb-20 lg:pt-40 lg:pb-28">
        <div className="container mx-auto px-4">
          <div className="flex flex-col lg:flex-row items-center">
            <motion.div 
              initial="hidden"
              animate="show"
              variants={container}
              className="lg:w-1/2 mb-12 lg:mb-0"
            >
              <motion.h1 variants={item} className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 leading-tight mb-6">
                <span className="block">Nutrition</span>
                <span className="block bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-purple-600">
                  Reimagined
                </span>
              </motion.h1>
              
              <motion.p variants={item} className="text-lg md:text-xl text-gray-600 mb-8 max-w-lg">
                AI-powered meal planning meets expert dietician guidance for your healthiest life.
              </motion.p>
              
              <motion.div variants={item} className="flex flex-col sm:flex-row gap-4">
                <button
                  onClick={() => router.push('/signup')}
                  className="px-8 py-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl font-medium shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
                >
                  Start Free Trial
                </button>
                <button
                  onClick={() => {
                    const element = document.getElementById('features');
                    element?.scrollIntoView({ behavior: 'smooth' });
                  }}
                  className="px-8 py-4 border-2 border-gray-200 text-gray-700 rounded-xl font-medium hover:border-indigo-300 transition-colors duration-300"
                >
                  How It Works
                </button>
              </motion.div>
            </motion.div>
            
            <motion.div 
              initial={{ opacity: 0, x: 100 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              className="lg:w-1/2 relative"
            >
              <div className="relative w-full max-w-lg lg:max-w-none mx-auto">
                <div className="absolute top-0 left-0 w-full h-full bg-indigo-100 rounded-3xl -rotate-6"></div>
                <div className="absolute top-0 left-0 w-full h-full bg-purple-100 rounded-3xl -rotate-3"></div>
                <img
                  src="/images/app-screenshot.png"
                  alt="App preview"
                  className="relative rounded-3xl shadow-2xl w-full h-0.5 "
                />
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 bg-gradient-to-b from-white to-gray-50">
        <div className="container mx-auto px-4">
          <motion.div
            initial="hidden"
            whileInView="show"
            viewport={{ once: true }}
            variants={container}
            className="text-center mb-16"
          >
            <motion.h2 variants={item} className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Why Choose NutriAI?
            </motion.h2>
            <motion.p variants={item} className="text-lg text-gray-600 max-w-2xl mx-auto">
              We combine cutting-edge technology with nutritional expertise to deliver results.
            </motion.p>
          </motion.div>
          
          <motion.div
            initial="hidden"
            whileInView="show"
            viewport={{ once: true }}
            variants={container}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8"
          >
            {features.map((feature, index) => (
              <motion.div 
                key={feature.name}
                variants={item}
                whileHover={{ y: -10 }}
                onHoverStart={() => setIsHovered(index)}
                onHoverEnd={() => setIsHovered(null)}
                className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100"
              >
                <div className="text-4xl mb-6">
                  <span className="relative inline-block">
                    <span className="relative z-10">{feature.icon}</span>
                    <AnimatePresence>
                      {isHovered === index && (
                        <motion.span
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          exit={{ scale: 0 }}
                          className="absolute inset-0 bg-indigo-100 rounded-full z-0"
                        />
                      )}
                    </AnimatePresence>
                  </span>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">{feature.name}</h3>
                <p className="text-gray-600">{feature.description}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* App Showcase */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="flex flex-col lg:flex-row items-center gap-12">
            <motion.div
              initial="hidden"
              whileInView="show"
              viewport={{ once: true }}
              variants={slideUp}
              className="lg:w-1/2"
            >
              <div className="space-y-6">
                <h2 className="text-3xl md:text-4xl font-bold text-gray-900">
                  <span className="block">Your Personalized</span>
                  <span className="block text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600">
                    Nutrition Companion
                  </span>
                </h2>
                <p className="text-lg text-gray-600">
                  Our app learns your preferences and adapts to your lifestyle, making healthy eating effortless.
                </p>
                <ul className="space-y-4">
                  {[
                    "Time-based meal suggestions",
                    "Allergy-aware recipes",
                    "Macro-nutrient tracking",
                    "Grocery delivery integration"
                  ].map((item, index) => (
                    <motion.li
                      key={item}
                      initial={{ opacity: 0, x: -20 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      viewport={{ once: true }}
                      className="flex items-center"
                    >
                      <span className="flex items-center justify-center w-6 h-6 bg-indigo-100 text-indigo-600 rounded-full mr-3">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                        </svg>
                      </span>
                      <span className="text-gray-700">{item}</span>
                    </motion.li>
                  ))}
                </ul>
              </div>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="lg:w-1/2 relative"
            >
              <div className="relative">
                <div className="absolute -inset-4 bg-gradient-to-r from-indigo-200 to-purple-200 rounded-3xl blur-lg opacity-30"></div>
                <img
                  src="/images/app-features.png"
                  alt="App features"
                  className="relative rounded-3xl w-full shadow-2xl"
                />
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 bg-indigo-50">
        <div className="container mx-auto px-4">
          <motion.div
            initial="hidden"
            whileInView="show"
            viewport={{ once: true }}
            variants={container}
            className="text-center mb-16"
          >
            <motion.h2 variants={item} className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Trusted by Thousands
            </motion.h2>
            <motion.p variants={item} className="text-lg text-gray-600 max-w-2xl mx-auto">
              Join our community of health-conscious individuals transforming their lives.
            </motion.p>
          </motion.div>
          
          <motion.div
            initial="hidden"
            whileInView="show"
            viewport={{ once: true }}
            variants={container}
            className="grid grid-cols-1 md:grid-cols-3 gap-8"
          >
            {testimonials.map((testimonial, index) => (
              <motion.div
                key={index}
                variants={item}
                className="bg-white p-8 rounded-2xl shadow-md"
              >
                <div className="text-indigo-500 text-4xl mb-4">"</div>
                <p className="text-gray-700 italic mb-6">{testimonial.quote}</p>
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-600 font-bold mr-4">
                    {testimonial.name.charAt(0)}
                  </div>
                  <div>
                    <h4 className="font-bold text-gray-900">{testimonial.name}</h4>
                    <p className="text-gray-500 text-sm">{testimonial.title}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-indigo-600 to-purple-600">
        <div className="container mx-auto px-4 text-center">
          <motion.div
            initial="hidden"
            whileInView="show"
            viewport={{ once: true }}
            variants={container}
          >
            <motion.h2 variants={item} className="text-3xl md:text-4xl font-bold text-white mb-6">
              Ready to Transform Your Health?
            </motion.h2>
            <motion.p variants={item} className="text-xl text-indigo-100 mb-8 max-w-2xl mx-auto">
              Join thousands of users who've achieved their health goals with NutriAI.
            </motion.p>
            <motion.div variants={item}>
              <button
                onClick={() => router.push('/signup')}
                className="px-8 py-4 bg-white text-indigo-600 rounded-xl font-bold shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
              >
                Start Your 14-Day Free Trial
              </button>
            </motion.div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}