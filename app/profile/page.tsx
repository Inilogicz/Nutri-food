'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Navbar from '../../components/ui/Navbar';
import { toast } from 'react-hot-toast';

interface ProfileData {
  name: string;
  email: string;
  dob: string;
  height: number;
  weight: number;
  healthConditions: string[];
  surgicalHistory: {
    type: string;
    date: string;
    details: string;
  }[];
  foodAllergies: string[];
}

export default function ProfilePage() {
  const [profile, setProfile] = useState<ProfileData>({
    name: '',
    email: '',
    dob: '',
    height: 0,
    weight: 0,
    healthConditions: [],
    surgicalHistory: [],
    foodAllergies: [],
  });
  const [isEditing, setIsEditing] = useState(false);
  const [newCondition, setNewCondition] = useState('');
  const [newSurgery, setNewSurgery] = useState({
    type: '',
    date: '',
    details: ''
  });
  const [newAllergy, setNewAllergy] = useState('');
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  // Calculate age from DOB
  const calculateAge = (dob: string) => {
    if (!dob) return 0;
    const birthDate = new Date(dob);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  };

  // Fetch profile data
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await fetch('/api/profile');
        if (!response.ok) throw new Error('Failed to fetch profile');
        const data = await response.json();
        setProfile(data);
      } catch (error) {
        toast.error(error instanceof Error ? error.message : 'Failed to load profile');
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  // Save profile data
  const saveProfile = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(profile),
      });
      
      if (!response.ok) throw new Error('Failed to save profile');
      
      toast.success('Profile updated successfully');
      setIsEditing(false);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to save profile');
    } finally {
      setLoading(false);
    }
  };

  // Handlers for adding/removing items
  const addHealthCondition = () => {
    if (newCondition.trim()) {
      setProfile({
        ...profile,
        healthConditions: [...profile.healthConditions, newCondition.trim()]
      });
      setNewCondition('');
    }
  };

  const removeHealthCondition = (index: number) => {
    const updated = [...profile.healthConditions];
    updated.splice(index, 1);
    setProfile({ ...profile, healthConditions: updated });
  };

  const addSurgicalHistory = () => {
    if (newSurgery.type.trim() && newSurgery.date) {
      setProfile({
        ...profile,
        surgicalHistory: [...profile.surgicalHistory, { ...newSurgery }]
      });
      setNewSurgery({ type: '', date: '', details: '' });
    }
  };

  const removeSurgicalHistory = (index: number) => {
    const updated = [...profile.surgicalHistory];
    updated.splice(index, 1);
    setProfile({ ...profile, surgicalHistory: updated });
  };

  const addFoodAllergy = () => {
    if (newAllergy.trim()) {
      setProfile({
        ...profile,
        foodAllergies: [...profile.foodAllergies, newAllergy.trim()]
      });
      setNewAllergy('');
    }
  };

  const removeFoodAllergy = (index: number) => {
    const updated = [...profile.foodAllergies];
    updated.splice(index, 1);
    setProfile({ ...profile, foodAllergies: updated });
  };

  if (loading && !isEditing) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-12">
        <Navbar/>   
      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="max-w-4xl mx-auto px-4 py-6 sm:px-6 lg:px-8 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900">My Profile</h1>
          {isEditing ? (
            <div className="flex space-x-2">
              <button
                onClick={() => setIsEditing(false)}
                className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={saveProfile}
                disabled={loading}
                className="px-4 py-2 bg-indigo-600 rounded-lg text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-70 flex items-center"
              >
                {loading ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Saving...
                  </>
                ) : 'Save Changes'}
              </button>
            </div>
          ) : (
            <button
              onClick={() => setIsEditing(true)}
              className="px-4 py-2 bg-indigo-600 rounded-lg text-sm font-medium text-white hover:bg-indigo-700"
            >
              Edit Profile
            </button>
          )}
        </div>
      </div>

      {/* Profile Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white shadow rounded-lg overflow-hidden">
          {/* Basic Info Section */}
          <div className="px-6 py-5 border-b border-gray-200">
            <h2 className="text-lg font-medium text-gray-900">Personal Information</h2>
            <div className="mt-4 grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
              <div className="sm:col-span-3">
                <label className="block text-sm font-medium text-gray-700">Full name</label>
                {isEditing ? (
                  <input
                    type="text"
                    value={profile.name}
                    onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  />
                ) : (
                  <p className="mt-1 text-sm text-gray-900">{profile.name}</p>
                )}
              </div>

              <div className="sm:col-span-3">
                <label className="block text-sm font-medium text-gray-700">Email address</label>
                <p className="mt-1 text-sm text-gray-900">{profile.email}</p>
              </div>

              <div className="sm:col-span-2">
                <label className="block text-sm font-medium text-gray-700">Date of Birth</label>
                {isEditing ? (
                  <input
                    type="date"
                    value={profile.dob}
                    onChange={(e) => setProfile({ ...profile, dob: e.target.value })}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  />
                ) : (
                  <p className="mt-1 text-sm text-gray-900">
                    {profile.dob ? new Date(profile.dob).toLocaleDateString() : 'Not specified'} ({calculateAge(profile.dob)} years)
                  </p>
                )}
              </div>

              <div className="sm:col-span-2">
                <label className="block text-sm font-medium text-gray-700">Height (cm)</label>
                {isEditing ? (
                  <input
                    type="number"
                    value={profile.height}
                    onChange={(e) => setProfile({ ...profile, height: Number(e.target.value) })}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  />
                ) : (
                  <p className="mt-1 text-sm text-gray-900">{profile.height || 'Not specified'}</p>
                )}
              </div>

              <div className="sm:col-span-2">
                <label className="block text-sm font-medium text-gray-700">Weight (kg)</label>
                {isEditing ? (
                  <input
                    type="number"
                    value={profile.weight}
                    onChange={(e) => setProfile({ ...profile, weight: Number(e.target.value) })}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  />
                ) : (
                  <p className="mt-1 text-sm text-gray-900">{profile.weight || 'Not specified'}</p>
                )}
              </div>
            </div>
          </div>

          {/* Health Conditions Section */}
          <div className="px-6 py-5 border-b border-gray-200">
            <h2 className="text-lg font-medium text-gray-900">Health Conditions</h2>
            {profile.healthConditions.length > 0 ? (
              <div className="mt-4 flex flex-wrap gap-2">
                {profile.healthConditions.map((condition, index) => (
                  <div key={index} className="flex items-center bg-gray-100 rounded-full px-3 py-1 text-sm">
                    <span>{condition}</span>
                    {isEditing && (
                      <button
                        type="button"
                        onClick={() => removeHealthCondition(index)}
                        className="ml-1 text-gray-500 hover:text-red-500"
                      >
                        &times;
                      </button>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <p className="mt-2 text-sm text-gray-500">No health conditions recorded</p>
            )}

            {isEditing && (
              <div className="mt-4 flex">
                <input
                  type="text"
                  value={newCondition}
                  onChange={(e) => setNewCondition(e.target.value)}
                  placeholder="Add a health condition"
                  className="flex-1 min-w-0 block w-full px-3 py-2 rounded-md border border-gray-300 shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                />
                <button
                  type="button"
                  onClick={addHealthCondition}
                  className="ml-2 inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  Add
                </button>
              </div>
            )}
          </div>

          {/* Surgical History Section */}
          <div className="px-6 py-5 border-b border-gray-200">
            <h2 className="text-lg font-medium text-gray-900">Surgical History</h2>
            {profile.surgicalHistory.length > 0 ? (
              <div className="mt-4 space-y-4">
                {profile.surgicalHistory.map((surgery, index) => (
                  <div key={index} className="border-l-4 border-indigo-200 pl-4 py-2">
                    <div className="flex justify-between">
                      <h3 className="text-sm font-medium text-gray-900">{surgery.type}</h3>
                      {isEditing && (
                        <button
                          type="button"
                          onClick={() => removeSurgicalHistory(index)}
                          className="text-gray-500 hover:text-red-500 text-sm"
                        >
                          Remove
                        </button>
                      )}
                    </div>
                    <p className="text-sm text-gray-500 mt-1">
                      {surgery.date && new Date(surgery.date).toLocaleDateString()}
                    </p>
                    {surgery.details && (
                      <p className="text-sm text-gray-700 mt-1">{surgery.details}</p>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <p className="mt-2 text-sm text-gray-500">No surgical history recorded</p>
            )}

            {isEditing && (
              <div className="mt-6 space-y-4">
                <h3 className="text-sm font-medium text-gray-900">Add New Surgery</h3>
                <div className="grid grid-cols-1 gap-y-4 gap-x-4 sm:grid-cols-6">
                  <div className="sm:col-span-2">
                    <label className="block text-sm font-medium text-gray-700">Type of surgery</label>
                    <input
                      type="text"
                      value={newSurgery.type}
                      onChange={(e) => setNewSurgery({ ...newSurgery, type: e.target.value })}
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-sm font-medium text-gray-700">Date</label>
                    <input
                      type="date"
                      value={newSurgery.date}
                      onChange={(e) => setNewSurgery({ ...newSurgery, date: e.target.value })}
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    />
                  </div>

                  <div className="sm:col-span-6">
                    <label className="block text-sm font-medium text-gray-700">Details (optional)</label>
                    <textarea
                      rows={2}
                      value={newSurgery.details}
                      onChange={(e) => setNewSurgery({ ...newSurgery, details: e.target.value })}
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    />
                  </div>

                  <div className="sm:col-span-6">
                    <button
                      type="button"
                      onClick={addSurgicalHistory}
                      disabled={!newSurgery.type || !newSurgery.date}
                      className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Add Surgery
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Food Allergies Section */}
          <div className="px-6 py-5">
            <h2 className="text-lg font-medium text-gray-900">Food Allergies</h2>
            {profile.foodAllergies.length > 0 ? (
              <div className="mt-4 flex flex-wrap gap-2">
                {profile.foodAllergies.map((allergy, index) => (
                  <div key={index} className="flex items-center bg-red-50 rounded-full px-3 py-1 text-sm text-red-800">
                    <span>{allergy}</span>
                    {isEditing && (
                      <button
                        type="button"
                        onClick={() => removeFoodAllergy(index)}
                        className="ml-1 text-red-500 hover:text-red-700"
                      >
                        &times;
                      </button>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <p className="mt-2 text-sm text-gray-500">No food allergies recorded</p>
            )}

            {isEditing && (
              <div className="mt-4 flex">
                <input
                  type="text"
                  value={newAllergy}
                  onChange={(e) => setNewAllergy(e.target.value)}
                  placeholder="Add a food allergy"
                  className="flex-1 min-w-0 block w-full px-3 py-2 rounded-md border border-gray-300 shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                />
                <button
                  type="button"
                  onClick={addFoodAllergy}
                  className="ml-2 inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  Add
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}