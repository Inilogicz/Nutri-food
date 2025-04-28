'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import AlertModal from '@/components/ui/modal';

export default function Signup() {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        dob: '',
        gender: '',
        country: '',
        password: '',
        confirmPassword: ''
    });
    const [loading, setLoading] = useState(false);
    const [modal, setModal] = useState({
        isOpen: false,
        type: 'success' as 'success' | 'error' | 'warning' | 'info',
        message: '',
        duration: 4000
    });
    const router = useRouter();

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const showModal = (type: 'success' | 'error' | 'warning' | 'info', message: string, duration = 4000) => {
        setModal({
            isOpen: true,
            type,
            message,
            duration
        });
    };

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setLoading(true);

        if (formData.password !== formData.confirmPassword) {
            showModal('error', 'Passwords do not match');
            setLoading(false);
            return;
        }

        try {
            const payload = {
                name: formData.name,
                email: formData.email,
                password: formData.password,
                phone_number: formData.phone,
                dob: formData.dob,
                gender: formData.gender.toLowerCase(),
                country: formData.country
            };

            const response = await fetch('https://devsammy.online/api/user/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Signup failed');
            }

            showModal('success', 'Account created successfully! Redirecting to Login...');
            
            setTimeout(() => {
                router.push('/login');
            }, 2000);
        } catch (err) {
            showModal('error', err instanceof Error ? err.message : 'An unknown error occurred');
        } finally {
            setLoading(false);
        }
    };

    const countries = [
        { value: '', label: 'Select Country' },
        { value: 'US', label: 'United States' },
        { value: 'GB', label: 'United Kingdom' },
        { value: 'CA', label: 'Canada' },
        { value: 'AU', label: 'Australia' },
        { value: 'IN', label: 'India' },
        { value: 'DE', label: 'Germany' },
        { value: 'FR', label: 'France' },
        { value: 'BR', label: 'Brazil' },
        { value: 'JP', label: 'Japan' },
        { value: 'CN', label: 'China' },
        { value: 'NG', label: 'Nigeria' },
        { value: 'ZA', label: 'South Africa' },
        { value: 'KE', label: 'Kenya' },
        { value: 'EG', label: 'Egypt' },
        { value: 'MX', label: 'Mexico' },
        { value: 'IT', label: 'Italy' },
        { value: 'ES', label: 'Spain' },
        { value: 'RU', label: 'Russia' },
        { value: 'KR', label: 'South Korea' },
        { value: 'SA', label: 'Saudi Arabia' },
    ];

    return (
        <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-purple-100 flex items-center justify-center p-4">
            <div className="w-full max-w-4xl bg-white rounded-2xl shadow-xl overflow-hidden">
                <div className="md:flex">
                    {/* Left Side - Illustration */}
                    <div className="hidden md:block md:w-1/2 bg-gradient-to-br from-purple-600 to-purple-800 p-8 flex flex-col justify-center items-center text-white">
                        <div className="max-w-xs mx-auto">
                            <h2 className="text-3xl font-bold mb-4">Join Our Community</h2>
                            <p className="text-purple-100 mb-8">
                                Create your account and get access to exclusive features and content.
                            </p>
                            <div className="relative h-64">
                                {/* Illustration placeholder - you can replace with an actual image */}
                                <div className="absolute inset-0 bg-purple-500/10 rounded-xl flex items-center justify-center">
                                    <svg className="w-32 h-32 text-purple-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
                                    </svg>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Right Side - Form */}
                    <div className="w-full md:w-1/2 p-8 md:p-10">
                        <div className="text-center mb-8">
                            <h1 className="text-3xl font-bold text-gray-800">Create Account</h1>
                            <p className="text-gray-500 mt-2">Fill in your details to get started</p>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-5">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                <div className="space-y-2">
                                    <label htmlFor="name" className="block text-sm font-medium text-gray-700">Full Name</label>
                                    <input 
                                        type="text" 
                                        id="name"
                                        name="name" 
                                        placeholder="John Doe" 
                                        value={formData.name} 
                                        onChange={handleChange} 
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all" 
                                        required 
                                    />
                                </div>
                                
                                <div className="space-y-2">
                                    <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email</label>
                                    <input 
                                        type="email" 
                                        id="email"
                                        name="email" 
                                        placeholder="john@example.com" 
                                        value={formData.email} 
                                        onChange={handleChange} 
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all" 
                                        required 
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                <div className="space-y-2">
                                    <label htmlFor="phone" className="block text-sm font-medium text-gray-700">Phone Number</label>
                                    <input 
                                        type="tel" 
                                        id="phone"
                                        name="phone" 
                                        placeholder="+1 234 567 890" 
                                        value={formData.phone} 
                                        onChange={handleChange} 
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all" 
                                        required 
                                    />
                                </div>
                                
                                <div className="space-y-2">
                                    <label htmlFor="dob" className="block text-sm font-medium text-gray-700">Date of Birth</label>
                                    <input 
                                        type="date" 
                                        id="dob"
                                        name="dob" 
                                        value={formData.dob} 
                                        onChange={handleChange} 
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all" 
                                        required 
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                <div className="space-y-2">
                                    <label htmlFor="gender" className="block text-sm font-medium text-gray-700">Gender</label>
                                    <select 
                                        id="gender"
                                        name="gender" 
                                        value={formData.gender} 
                                        onChange={handleChange} 
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all appearance-none" 
                                        required
                                    >
                                        <option value="">Select Gender</option>
                                        <option value="male">Male</option>
                                        <option value="female">Female</option>
                                        <option value="other">Other</option>
                                        <option value="prefer-not-to-say">Prefer not to say</option>
                                    </select>
                                </div>
                                
                                <div className="space-y-2">
                                    <label htmlFor="country" className="block text-sm font-medium text-gray-700">Country</label>
                                    <select 
                                        id="country"
                                        name="country" 
                                        value={formData.country} 
                                        onChange={handleChange} 
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all appearance-none" 
                                        required
                                    >
                                        {countries.map((country) => (
                                            <option key={country.value} value={country.value}>
                                                {country.label}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                <div className="space-y-2">
                                    <label htmlFor="password" className="block text-sm font-medium text-gray-700">Password</label>
                                    <input 
                                        type="password" 
                                        id="password"
                                        name="password" 
                                        placeholder="••••••••" 
                                        value={formData.password} 
                                        onChange={handleChange} 
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all" 
                                        required 
                                    />
                                </div>
                                
                                <div className="space-y-2">
                                    <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">Confirm Password</label>
                                    <input 
                                        type="password" 
                                        id="confirmPassword"
                                        name="confirmPassword" 
                                        placeholder="••••••••" 
                                        value={formData.confirmPassword} 
                                        onChange={handleChange} 
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all" 
                                        required 
                                    />
                                </div>
                            </div>

                            <div className="flex items-center">
                                <input 
                                    type="checkbox" 
                                    id="terms"
                                    name="terms" 
                                    className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded" 
                                    required
                                />
                                <label htmlFor="terms" className="ml-2 block text-sm text-gray-700">
                                    I agree to the <a href="#" className="text-purple-600 hover:text-purple-800">Terms of Service</a> and <a href="#" className="text-purple-600 hover:text-purple-800">Privacy Policy</a>
                                </label>
                            </div>

                            <button 
                                type="submit" 
                                className="w-full bg-purple-600 text-white py-3 px-4 rounded-lg hover:bg-purple-700 transition-colors font-medium flex items-center justify-center shadow-md hover:shadow-purple-200 disabled:opacity-70 disabled:cursor-not-allowed" 
                                disabled={loading}
                            >
                                {loading ? (
                                    <>
                                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                        Creating Account...
                                    </>
                                ) : 'Sign Up'}
                            </button>
                        </form>

                        <div className="mt-6 text-center text-sm text-gray-500">
                            <p>Already have an account? <a href="/login" className="text-purple-600 hover:text-purple-800 font-medium transition-colors">Log in</a></p>
                        </div>
                    </div>
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