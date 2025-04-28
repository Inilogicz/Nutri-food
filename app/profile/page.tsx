'use client';

import { useState, useEffect } from 'react';
import Navbar from '../../components/ui/Navbar';
import { toast } from 'react-hot-toast';
import { useAuth } from '@/context/AuthContext';

interface HealthCondition {
  id: number;
  name: string;
  status: string;
  notes: string;
}

interface SurgicalHistory {
  id: number;
  type: string;
  health_condition: string;
  surgery_date: string;
  notes: string;
}

interface FoodAllergy {
  id: number;
  name: string;
}

interface ProfileData {
  name: string;
  email: string;
  country: string;
  age: number;
  height: number | null;
  weight: number | null;
  health_conditions: HealthCondition[];
  surgical_histories: SurgicalHistory[];
  food_allergies: FoodAllergy[];
}

export default function ProfilePage() {
  const { user } = useAuth();
  const [profile, setProfile] = useState<ProfileData>({
    name: '',
    email: '',
    country: '',
    age: 0,
    height: null,
    weight: null,
    health_conditions: [],
    surgical_histories: [],
    food_allergies: [],
  });
  const [isEditing, setIsEditing] = useState(false);
  const [newCondition, setNewCondition] = useState({
    name: '',
    status: 'current',
    notes: ''
  });
  const [newSurgery, setNewSurgery] = useState({
    type: '',
    health_condition: '',
    surgery_date: '',
    notes: ''
  });
  const [newAllergy, setNewAllergy] = useState('');
  const [loading, setLoading] = useState(true);
  const [editingConditionId, setEditingConditionId] = useState<number | null>(null);
  const [editingSurgeryId, setEditingSurgeryId] = useState<number | null>(null);
  const [editingAllergyId, setEditingAllergyId] = useState<number | null>(null);

  // Fetch profile data
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setLoading(true);
        
        const response = await fetch('/api/proxy/profile', {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
            'Content-Type': 'application/json'
          }
        });
        
        if (!response.ok) throw new Error('Failed to fetch profile');
        
        const data = await response.json();
        
        setProfile({
          name: data.data?.name || user?.name || '',
          email: data.data?.email || user?.email || '',
          country: data.data?.country || '',
          age: typeof data.data?.age === 'number' ? data.data.age : 0,
          height: data.data?.height ? Number(data.data.height) : null,
          weight: data.data?.weight ? Number(data.data.weight) : null,
          health_conditions: data.data?.health_conditions || [],
          surgical_histories: data.data?.surgical_histories || [],
          food_allergies: data.data?.food_allergies || [],
        });
        
      } catch (error) {
        toast.error(error instanceof Error ? error.message : 'Failed to load profile');
      } finally {
        setLoading(false);
      }
    };
    
    fetchProfile();
  }, [user]);

  // Save profile data (height and weight)
  const saveProfile = async () => {
    try {
      setLoading(true);
      
      const response = await fetch('/api/proxy/profile/height-weight', {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          height: profile.height,
          weight: profile.weight
        }),
      });
      
      if (!response.ok) throw new Error('Failed to save height and weight');
      
      toast.success('Profile updated successfully');
      setIsEditing(false);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to save profile');
    } finally {
      setLoading(false);
    }
  };

  // Health Conditions
  const addHealthCondition = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/proxy/health-conditions', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(newCondition),
      });
      
      if (!response.ok) throw new Error('Failed to add health condition');
      
      const data = await response.json();
      setProfile({
        ...profile,
        health_conditions: [...profile.health_conditions, data.data]
      });
      setNewCondition({ name: '', status: 'current', notes: '' });
      toast.success('Health condition added');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to add health condition');
    } finally {
      setLoading(false);
    }
  };

  const updateHealthCondition = async () => {
    if (!editingConditionId) return;
    
    try {
      setLoading(true);
      const response = await fetch(`/api/proxy/health-conditions/${editingConditionId}`, {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(newCondition),
      });
      
      if (!response.ok) throw new Error('Failed to update health condition');
      
      const data = await response.json();
      setProfile({
        ...profile,
        health_conditions: profile.health_conditions.map(hc => 
          hc.id === editingConditionId ? data.data : hc
        )
      });
      setNewCondition({ name: '', status: 'current', notes: '' });
      setEditingConditionId(null);
      toast.success('Health condition updated');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to update health condition');
    } finally {
      setLoading(false);
    }
  };

  const removeHealthCondition = async (id: number) => {
    try {
      setLoading(true);
      const response = await fetch(`/api/proxy/health-conditions/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) throw new Error('Failed to remove health condition');
      
      setProfile({
        ...profile,
        health_conditions: profile.health_conditions.filter(hc => hc.id !== id)
      });
      toast.success('Health condition removed');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to remove health condition');
    } finally {
      setLoading(false);
    }
  };

  const handleEditCondition = (condition: HealthCondition) => {
    setNewCondition({
      name: condition.name,
      status: condition.status,
      notes: condition.notes
    });
    setEditingConditionId(condition.id);
  };

  // Surgical Histories
  const addSurgicalHistory = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/proxy/surgical-histories', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(newSurgery),
      });
      
      if (!response.ok) throw new Error('Failed to add surgical history');
      
      const data = await response.json();
      setProfile({
        ...profile,
        surgical_histories: [...profile.surgical_histories, data.data]
      });
      setNewSurgery({ 
        type: '', 
        health_condition: '', 
        surgery_date: '', 
        notes: '' 
      });
      toast.success('Surgical history added');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to add surgical history');
    } finally {
      setLoading(false);
    }
  };

  const updateSurgicalHistory = async () => {
    if (!editingSurgeryId) return;
    
    try {
      setLoading(true);
      const response = await fetch(`/api/proxy/surgical-histories/${editingSurgeryId}`, {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(newSurgery),
      });
      
      if (!response.ok) throw new Error('Failed to update surgical history');
      
      const data = await response.json();
      setProfile({
        ...profile,
        surgical_histories: profile.surgical_histories.map(sh => 
          sh.id === editingSurgeryId ? data.data : sh
        )
      });
      setNewSurgery({ type: '', health_condition: '', surgery_date: '', notes: '' });
      setEditingSurgeryId(null);
      toast.success('Surgical history updated');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to update surgical history');
    } finally {
      setLoading(false);
    }
  };

  const removeSurgicalHistory = async (id: number) => {
    try {
      setLoading(true);
      const response = await fetch(`/api/proxy/surgical-histories/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) throw new Error('Failed to remove surgical history');
      
      setProfile({
        ...profile,
        surgical_histories: profile.surgical_histories.filter(sh => sh.id !== id)
      });
      toast.success('Surgical history removed');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to remove surgical history');
    } finally {
      setLoading(false);
    }
  };

  const handleEditSurgery = (surgery: SurgicalHistory) => {
    setNewSurgery({
      type: surgery.type,
      health_condition: surgery.health_condition,
      surgery_date: surgery.surgery_date,
      notes: surgery.notes
    });
    setEditingSurgeryId(surgery.id);
  };

  // Food Allergies
  const addFoodAllergy = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/proxy/food-allergies', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ name: newAllergy }),
      });
      
      if (!response.ok) throw new Error('Failed to add food allergy');
      
      const data = await response.json();
      setProfile({
        ...profile,
        food_allergies: [...profile.food_allergies, data.data]
      });
      setNewAllergy('');
      toast.success('Food allergy added');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to add food allergy');
    } finally {
      setLoading(false);
    }
  };

  const updateFoodAllergy = async () => {
    if (!editingAllergyId) return;
    
    try {
      setLoading(true);
      const response = await fetch(`/api/proxy/food-allergies/${editingAllergyId}`, {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ name: newAllergy }),
      });
      
      if (!response.ok) throw new Error('Failed to update food allergy');
      
      const data = await response.json();
      setProfile({
        ...profile,
        food_allergies: profile.food_allergies.map(fa => 
          fa.id === editingAllergyId ? data.data : fa
        )
      });
      setNewAllergy('');
      setEditingAllergyId(null);
      toast.success('Food allergy updated');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to update food allergy');
    } finally {
      setLoading(false);
    }
  };

  const removeFoodAllergy = async (id: number) => {
    try {
      setLoading(true);
      const response = await fetch(`/api/proxy/food-allergies/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) throw new Error('Failed to remove food allergy');
      
      setProfile({
        ...profile,
        food_allergies: profile.food_allergies.filter(fa => fa.id !== id)
      });
      toast.success('Food allergy removed');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to remove food allergy');
    } finally {
      setLoading(false);
    }
  };

  const handleEditAllergy = (allergy: FoodAllergy) => {
    setNewAllergy(allergy.name);
    setEditingAllergyId(allergy.id);
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
      <Navbar />
      
      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="max-w-4xl mx-auto px-4 py-6 sm:px-6 lg:px-8 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900">My Profile</h1>
          {isEditing ? (
            <div className="flex space-x-2">
              <button
                onClick={() => {
                  setIsEditing(false);
                  setEditingConditionId(null);
                  setEditingSurgeryId(null);
                  setEditingAllergyId(null);
                  setNewCondition({ name: '', status: 'current', notes: '' });
                  setNewSurgery({ type: '', health_condition: '', surgery_date: '', notes: '' });
                  setNewAllergy('');
                }}
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
                <p className="mt-1 text-sm text-gray-900">{profile.name || 'Not specified'}</p>
              </div>

              <div className="sm:col-span-3">
                <label className="block text-sm font-medium text-gray-700">Email address</label>
                <p className="mt-1 text-sm text-gray-900">{profile.email || 'Not specified'}</p>
              </div>
              <div className="sm:col-span-3">
                <label className="block text-sm font-medium text-gray-700"> Country</label>
                <p className="mt-1 text-sm text-gray-900">{profile.country || 'Not specified'}</p>
              </div>

              <div className="sm:col-span-2">
                <label className="block text-sm font-medium text-gray-700">Age</label>
                {isEditing ? (
                  <input
                    type="number"
                    value={profile.age || ''}
                    onChange={(e) => setProfile({ 
                      ...profile, 
                      age: e.target.value ? Number(e.target.value) : 0 
                    })}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  />
                ) : (
                  <p className="mt-1 text-sm text-gray-900">{profile.age || 'Not specified'}</p>
                )}
              </div>

              <div className="sm:col-span-2">
                <label className="block text-sm font-medium text-gray-700">Height (cm)</label>
                {isEditing ? (
                  <input
                    type="number"
                    value={profile.height || ''}
                    onChange={(e) => setProfile({ 
                      ...profile, 
                      height: e.target.value ? Number(e.target.value) : null 
                    })}
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
                    value={profile.weight || ''}
                    onChange={(e) => setProfile({ 
                      ...profile, 
                      weight: e.target.value ? Number(e.target.value) : null 
                    })}
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
            {profile.health_conditions.length > 0 ? (
              <div className="mt-4 space-y-3">
                {profile.health_conditions.map((condition) => (
                  <div key={`condition-${condition.id}`} className="border-l-4 border-blue-200 pl-4 py-2">
                    <div className="flex justify-between">
                      <h3 className="text-sm font-medium text-gray-900">{condition.name}</h3>
                      {isEditing && (
                        <div className="flex space-x-2">
                          <button
                            type="button"
                            onClick={() => handleEditCondition(condition)}
                            className="text-gray-500 hover:text-blue-500 text-sm"
                          >
                            Edit
                          </button>
                          <button
                            type="button"
                            onClick={() => removeHealthCondition(condition.id)}
                            className="text-gray-500 hover:text-red-500 text-sm"
                          >
                            Remove
                          </button>
                        </div>
                      )}
                    </div>
                    <p className="text-sm text-gray-500 mt-1">Status: {condition.status}</p>
                    {condition.notes && (
                      <p className="text-sm text-gray-700 mt-1">Notes: {condition.notes}</p>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <p className="mt-2 text-sm text-gray-500">No health conditions recorded</p>
            )}

            {isEditing && (
              <div className="mt-6 space-y-4">
                <h3 className="text-sm font-medium text-gray-900">
                  {editingConditionId ? 'Edit Health Condition' : 'Add New Health Condition'}
                </h3>
                <div className="grid grid-cols-1 gap-y-4 gap-x-4 sm:grid-cols-6">
                  <div className="sm:col-span-3">
                    <label className="block text-sm font-medium text-gray-700">Condition Name</label>
                    <input
                      type="text"
                      value={newCondition.name}
                      onChange={(e) => setNewCondition({ ...newCondition, name: e.target.value })}
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    />
                  </div>

                  <div className="sm:col-span-3">
                    <label className="block text-sm font-medium text-gray-700">Status</label>
                    <select
                      value={newCondition.status}
                      onChange={(e) => setNewCondition({ ...newCondition, status: e.target.value })}
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    >
                      <option value="current">Current</option>
                      <option value="past">Past</option>
                      <option value="chronic">Chronic</option>
                    </select>
                  </div>

                  <div className="sm:col-span-6">
                    <label className="block text-sm font-medium text-gray-700">Notes (optional)</label>
                    <textarea
                      rows={2}
                      value={newCondition.notes}
                      onChange={(e) => setNewCondition({ ...newCondition, notes: e.target.value })}
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    />
                  </div>

                  <div className="sm:col-span-6">
                    <button
                      type="button"
                      onClick={editingConditionId ? updateHealthCondition : addHealthCondition}
                      disabled={!newCondition.name}
                      className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {editingConditionId ? 'Update Condition' : 'Add Condition'}
                    </button>
                    {editingConditionId && (
                      <button
                        type="button"
                        onClick={() => {
                          setEditingConditionId(null);
                          setNewCondition({ name: '', status: 'current', notes: '' });
                        }}
                        className="ml-2 inline-flex justify-center py-2 px-4 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                      >
                        Cancel
                      </button>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Surgical History Section */}
          <div className="px-6 py-5 border-b border-gray-200">
            <h2 className="text-lg font-medium text-gray-900">Surgical History</h2>
            {profile.surgical_histories.length > 0 ? (
              <div className="mt-4 space-y-4">
                {profile.surgical_histories.map((surgery) => (
                  <div key={`surgery-${surgery.id}`} className="border-l-4 border-indigo-200 pl-4 py-2">
                    <div className="flex justify-between">
                      <h3 className="text-sm font-medium text-gray-900">{surgery.type}</h3>
                      {isEditing && (
                        <div className="flex space-x-2">
                          <button
                            type="button"
                            onClick={() => handleEditSurgery(surgery)}
                            className="text-gray-500 hover:text-blue-500 text-sm"
                          >
                            Edit
                          </button>
                          <button
                            type="button"
                            onClick={() => removeSurgicalHistory(surgery.id)}
                            className="text-gray-500 hover:text-red-500 text-sm"
                          >
                            Remove
                          </button>
                        </div>
                      )}
                    </div>
                    <p className="text-sm text-gray-500 mt-1">
                      Date: {surgery.surgery_date && new Date(surgery.surgery_date).toLocaleDateString()}
                    </p>
                    <p className="text-sm text-gray-500 mt-1">
                      Related condition: {surgery.health_condition || 'Not specified'}
                    </p>
                    {surgery.notes && (
                      <p className="text-sm text-gray-700 mt-1">Notes: {surgery.notes}</p>
                    )}
                  </div> 
                ))}
              </div>
            ) : (
              <p className="mt-2 text-sm text-gray-500">No surgical history recorded</p>
            )}

            {isEditing && (
              <div className="mt-6 space-y-4">
                <h3 className="text-sm font-medium text-gray-900">
                  {editingSurgeryId ? 'Edit Surgery' : 'Add New Surgery'}
                </h3>
                <div className="grid grid-cols-1 gap-y-4 gap-x-4 sm:grid-cols-6">
                  <div className="sm:col-span-3">
                    <label className="block text-sm font-medium text-gray-700">Type of surgery</label>
                    <input
                      type="text"
                      value={newSurgery.type}
                      onChange={(e) => setNewSurgery({ ...newSurgery, type: e.target.value })}
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    />
                  </div>

                  <div className="sm:col-span-3">
                    <label className="block text-sm font-medium text-gray-700">Date</label>
                    <input
                      type="date"
                      value={newSurgery.surgery_date}
                      onChange={(e) => setNewSurgery({ ...newSurgery, surgery_date: e.target.value })}
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    />
                  </div>

                  <div className="sm:col-span-6">
                    <label className="block text-sm font-medium text-gray-700">Related Health Condition</label>
                    <input
                      type="text"
                      value={newSurgery.health_condition}
                      onChange={(e) => setNewSurgery({ ...newSurgery, health_condition: e.target.value })}
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    />
                  </div>

                  <div className="sm:col-span-6">
                    <label className="block text-sm font-medium text-gray-700">Notes (optional)</label>
                    <textarea
                      rows={2}
                      value={newSurgery.notes}
                      onChange={(e) => setNewSurgery({ ...newSurgery, notes: e.target.value })}
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    />
                  </div>

                  <div className="sm:col-span-6">
                    <button
                      type="button"
                      onClick={editingSurgeryId ? updateSurgicalHistory : addSurgicalHistory}
                      disabled={!newSurgery.type || !newSurgery.surgery_date}
                      className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {editingSurgeryId ? 'Update Surgery' : 'Add Surgery'}
                    </button>
                    {editingSurgeryId && (
                      <button
                        type="button"
                        onClick={() => {
                          setEditingSurgeryId(null);
                          setNewSurgery({ type: '', health_condition: '', surgery_date: '', notes: '' });
                        }}
                        className="ml-2 inline-flex justify-center py-2 px-4 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                      >
                        Cancel
                      </button>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Food Allergies Section */}
          <div className="px-6 py-5">
            <h2 className="text-lg font-medium text-gray-900">Food Allergies</h2>
            {profile.food_allergies.length > 0 ? (
              <div className="mt-4 flex flex-wrap gap-2">
                {profile.food_allergies.map((allergy) => (
                  <div key={`allergy-${allergy.id}`} className="flex items-center bg-red-50 rounded-full px-3 py-1 text-sm text-red-800">
                    <span>{allergy.name}</span>
                    {isEditing && (
                      <>
                        <button
                          type="button"
                          onClick={() => handleEditAllergy(allergy)}
                          className="ml-1 text-blue-500 hover:text-blue-700"
                        >
                          Edit
                        </button>
                        <button
                          type="button"
                          onClick={() => removeFoodAllergy(allergy.id)}
                          className="ml-1 text-red-500 hover:text-red-700"
                        >
                          &times;
                        </button>
                      </>
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
                  placeholder={editingAllergyId ? 'Edit allergy name' : 'Add a food allergy'}
                  className="flex-1 min-w-0 block w-full px-3 py-2 rounded-md border border-gray-300 shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                />
                <button
                  type="button"
                  onClick={editingAllergyId ? updateFoodAllergy : addFoodAllergy}
                  disabled={!newAllergy.trim()}
                  className="ml-2 inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {editingAllergyId ? 'Update' : 'Add'}
                </button>
                {editingAllergyId && (
                  <button
                    type="button"
                    onClick={() => {
                      setEditingAllergyId(null);
                      setNewAllergy('');
                    }}
                    className="ml-2 inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                  >
                    Cancel
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}