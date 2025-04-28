import React, { useState, useEffect } from 'react';
import { Clock, Wallet, X } from 'lucide-react';

interface DietitianProps {
  id: number;
  name: string;
  specialty?: string | null;
  rate_per_minute: string;
  profile_picture: string | null;
  online: boolean;
  last_seen?: string | null;
  is_verified: string;
}

interface ConfirmationModalProps {
  dietitian: DietitianProps;
  onConfirm: (duration: number) => void;
  onCancel: () => void;
}

const DURATION_OPTIONS = [15, 30, 45, 60];

const ConsultationConfirmationModal: React.FC<ConfirmationModalProps> = ({
  dietitian,
  onConfirm,
  onCancel
}) => {
  const [selectedDuration, setSelectedDuration] = useState<number>(30);
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const rate = parseFloat(dietitian.rate_per_minute);
  const totalCost = rate * selectedDuration;

  // Animation effect - show modal with a slight delay
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsOpen(true);
    }, 50);
    
    return () => clearTimeout(timer);
  }, []);

  // Close animation before unmounting
  const handleClose = () => {
    setIsOpen(false);
    setTimeout(onCancel, 300); // Wait for animation to finish
  };

  const handleConfirm = () => {
    setIsOpen(false);
    setTimeout(() => onConfirm(selectedDuration), 300);
  };

  // Format the last_seen time if available
  const formatLastSeen = (lastSeen: string | undefined) => {
    if (!lastSeen) return 'N/A';
    const date = new Date(lastSeen);
    return `${date.toLocaleDateString()} at ${date.toLocaleTimeString()}`;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className={`absolute inset-0 bg-black transition-opacity duration-300 ${
          isOpen ? 'opacity-50' : 'opacity-0'
        }`} 
        onClick={handleClose}
      />
      
      {/* Modal */}
      <div 
        className={`bg-white rounded-xl shadow-xl w-full max-w-md transform transition-all duration-300 ${
          isOpen ? 'scale-100 opacity-100' : 'scale-95 opacity-0'
        }`}
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white p-6 rounded-t-xl relative">
          <button 
            onClick={handleClose}
            className="absolute right-4 top-4 text-white hover:text-purple-200 focus:outline-none"
          >
            <X size={20} />
          </button>
          <h3 className="text-xl font-bold">Confirm Consultation</h3>
          <p className="text-purple-100 mt-1">Review your booking details</p>
        </div>
        
        {/* Content */}
        <div className="p-6">
          <div className="flex items-center space-x-4 mb-6 pb-6 border-b border-gray-100">
          {dietitian.profile_picture ? (
                  <img
                    src={`https://devsammy.online/${dietitian.profile_picture}`}
                    alt={dietitian.name}
                    className="h-20 w-20 rounded-full object-cover mb-4"
                  />
                ) : (
                  <div className="h-20 w-20 rounded-full bg-purple-100 flex items-center justify-center text-purple-600 font-bold text-2xl mb-4">
                    {dietitian.name.split(" ").map((n) => n[0]).join("").slice(0, 2)}
                  </div>
                )}
            <div>
              <h4 className="font-medium text-gray-900">{dietitian.name}</h4>
              {dietitian.specialty && (
                <p className="text-sm text-purple-600">{dietitian.specialty}</p>
              )}
              {/* Online Status */}
              <p className={`text-sm ${dietitian.online ? 'text-green-500' : 'text-gray-500'}`}>
                {dietitian.online ? 'Online' : 'Offline'}
              </p>
            </div>
          </div>
          
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Select Consultation Duration
            </label>
            <div className="grid grid-cols-4 gap-2">
              {DURATION_OPTIONS.map(duration => (
                <button
                  key={duration}
                  onClick={() => setSelectedDuration(duration)}
                  className={`py-2 px-3 rounded-lg text-sm font-medium transition-colors ${
                    selectedDuration === duration
                      ? 'bg-purple-600 text-white shadow-md'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {duration} min
                </button>
              ))}
            </div>
          </div>
          
          <div className="bg-purple-50 rounded-lg p-4 mb-6">
            <div className="flex justify-between items-center mb-2">
              <div className="flex items-center text-purple-800">
                <Clock size={18} className="mr-2" />
                <span>Duration:</span>
              </div>
              <span className="font-medium">{selectedDuration} minutes</span>
            </div>
            <div className="flex justify-between items-center mb-2">
              <div className="flex items-center text-purple-800">
                <Wallet size={18} className="mr-2" />
                <span>Rate:</span>
              </div>
              <span className="font-medium">₦{rate.toFixed(2)}/min</span>
            </div>
            <div className="border-t border-purple-200 mt-3 pt-3 flex justify-between items-center">
              <span className="font-medium text-purple-900">Total Cost:</span>
              <span className="font-bold text-xl text-purple-900">₦{totalCost.toFixed(2)}</span>
            </div>
          </div>
          
          <div className="flex space-x-3">
            <button
              onClick={handleClose}
              className="flex-1 py-3 px-4 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 transition-colors focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-1"
            >
              Cancel
            </button>
            <button
              onClick={handleConfirm}
              className="flex-1 py-3 px-4 bg-purple-600 text-white rounded-lg font-medium hover:bg-purple-700 transition-colors focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-1"
            >
              Confirm (₦{totalCost.toFixed(2)})
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConsultationConfirmationModal;
