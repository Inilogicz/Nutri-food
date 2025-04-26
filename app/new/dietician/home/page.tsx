'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { FiCalendar, FiUsers, FiMessageSquare, FiPieChart, FiSettings, FiLogOut, FiBell, FiDollarSign } from 'react-icons/fi';
import { RiNotionLine as RiNutritionLine } from 'react-icons/ri';
import { BsGraphUp, BsChatLeftText } from 'react-icons/bs';

// Type definitions
type Appointment = {
  id: string;
  clientName: string;
  date: string;
  time: string;
  status: 'upcoming' | 'completed' | 'cancelled';
};

type Client = {
  id: string;
  name: string;
  email: string;
  lastSession: string;
};

type Message = {
  id: string;
  clientName: string;
  preview: string;
  time: string;
  unread: boolean;
};

type Consultation = {
  id: string;
  clientName: string;
  date: string;
  status: string;
};

type DashboardViewProps = {
  appointments: Appointment[];
  clients: Client[];
  messages: Message[];
};

type AppointmentsViewProps = {
  appointments: Appointment[];
};

type ClientsViewProps = {
  clients: Client[];
};

type MessagesViewProps = {
  messages: Message[];
  onMarkAsRead: (id: string) => void;
};

type ConsultationsViewProps = {
  consultations: Consultation[];
};

type SettingsViewProps = {
  user: {
    name: string;
    email: string;
  };
};

type ComingSoonProps = {
  feature: string;
};

type CardProps = {
  title: string;
  children: React.ReactNode;
};

type StatCardProps = {
  icon: React.ReactNode;
  title: string;
  value: number;
};

export default function DieticianDashboard() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // State for API data with proper typing
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [consultations, setConsultations] = useState<Consultation[]>([]);

  // Fetch data based on active tab
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem('token');
        
        let endpoint = '';
        switch (activeTab) {
          case 'appointments':
            endpoint = '/api/dietitian/appointments';
            break;
          case 'clients':
            endpoint = '/api/dietitian/clients';
            break;
          case 'messages':
            endpoint = '/api/dietitian/messages';
            break;
          case 'consultations':
            endpoint = '/api/dietitian/consultations';
            break;
          default:
            endpoint = '/api/dietitian/dashboard';
        }

        const response = await fetch(endpoint, {
          headers: {
            'Authorization': `Bearer ${token}`
          }   
        });

        if (!response.ok) throw new Error('Failed to fetch data');

        const data = await response.json();
        
        switch (activeTab) {
          case 'appointments':
            setAppointments(data);
            break;
          case 'clients':
            setClients(data);
            break;
          case 'messages':
            setMessages(data);
            break;
          case 'consultations':
            setConsultations(data);
            break;
          default:
            // Set all dashboard data
            setAppointments(data.appointments || []);
            setClients(data.clients || []);
            setMessages(data.messages || []);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An unknown error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [activeTab]);

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  // Mark message as read
  const markAsRead = async (messageId: string) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/dietitian/messages/${messageId}/read`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (!response.ok) throw new Error('Failed to mark as read');
      
      setMessages(messages.map(msg => 
        msg.id === messageId ? {...msg, unread: false} : msg
      ));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred');
    }
  };

  // ... rest of your component code remains the same ...

  // View Components with proper typing
  function DashboardView({ appointments, clients, messages }: DashboardViewProps) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <StatCard 
            icon={<FiCalendar className="text-xl" />} 
            title="Upcoming Appointments" 
            value={appointments.length} 
          />
          <StatCard 
            icon={<FiUsers className="text-xl" />} 
            title="Active Clients" 
            value={clients.length} 
          />
          <StatCard 
            icon={<FiMessageSquare className="text-xl" />} 
            title="Unread Messages" 
            value={messages.length} 
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card title="Recent Appointments">
            {appointments.map(app => (
              <div key={app.id} className="border-b py-3">
                <p className="font-medium">{app.clientName}</p>
                <p className="text-sm text-gray-500">{app.date} at {app.time}</p>
              </div>
            ))}
          </Card>
          
          <Card title="Recent Clients">
            {clients.map(client => (
              <div key={client.id} className="border-b py-3">
                <p className="font-medium">{client.name}</p>
                <p className="text-sm text-gray-500">Last session: {client.lastSession}</p>
              </div>
            ))}
          </Card>
        </div>
      </div>
    );
  }

  function AppointmentsView({ appointments }: AppointmentsViewProps) {
    return (
      <Card title="All Appointments">
        {appointments.map(app => (
          <div key={app.id} className="border-b py-4">
            <div className="flex justify-between">
              <div>
                <p className="font-medium">{app.clientName}</p>
                <p className="text-sm text-gray-500">{app.date} at {app.time}</p>
              </div>
              <button className="text-indigo-600 hover:text-indigo-800 text-sm font-medium">
                View Details
              </button>
            </div>
          </div>
        ))}
      </Card>
    );
  }

  function ClientsView({ clients }: ClientsViewProps) {
    return (
      <Card title="All Clients">
        {clients.map(client => (
          <div key={client.id} className="border-b py-4">
            <div className="flex justify-between items-center">
              <div>
                <p className="font-medium">{client.name}</p>
                <p className="text-sm text-gray-500">{client.email}</p>
              </div>
              <button className="px-3 py-1 bg-indigo-600 text-white rounded-md text-sm hover:bg-indigo-700">
                Message
              </button>
            </div>
          </div>
        ))}
      </Card>
    );
  }

  function MessagesView({ messages, onMarkAsRead }: MessagesViewProps) {
    return (
      <Card title="Messages">
        {messages.map(msg => (
          <div key={msg.id} className={`border-b py-4 ${msg.unread ? 'bg-blue-50' : ''}`}>
            <div className="flex justify-between">
              <div>
                <p className="font-medium">{msg.clientName}</p>
                <p className="text-sm text-gray-500">{msg.preview}</p>
              </div>
              <div className="flex flex-col items-end">
                <p className="text-xs text-gray-400">{msg.time}</p>
                {msg.unread && (
                  <button 
                    onClick={() => onMarkAsRead(msg.id)}
                    className="mt-1 text-xs text-indigo-600 hover:text-indigo-800"
                  >
                    Mark as read
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
      </Card>
    );
  }

  function ConsultationsView({ consultations }: ConsultationsViewProps) {
    return (
      <Card title="Consultations">
        {consultations.map(consult => (
          <div key={consult.id} className="border-b py-4">
            <div className="flex justify-between">
              <div>
                <p className="font-medium">{consult.clientName}</p>
                <p className="text-sm text-gray-500">{consult.date} • {consult.status}</p>
              </div>
              <button className="text-indigo-600 hover:text-indigo-800 text-sm font-medium">
                {consult.status === 'pending' ? 'Respond' : 'View Details'}
              </button>
            </div>
          </div>
        ))}
      </Card>
    );
  }

  function SettingsView({ user }: SettingsViewProps) {
    return (
      <Card title="Account Settings">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Name</label>
            <input 
              type="text" 
              defaultValue={user.name} 
              className="mt-1 block w-full border border-gray-300 rounded-md p-2"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Email</label>
            <input 
              type="email" 
              defaultValue={user.email} 
              className="mt-1 block w-full border border-gray-300 rounded-md p-2"
            />
          </div>
          <button className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700">
            Save Changes
          </button>
        </div>
      </Card>
    );
  }

  function ComingSoon({ feature }: ComingSoonProps) {
    return (
      <div className="flex flex-col items-center justify-center h-64 bg-gray-50 rounded-xl">
        <div className="text-5xl mb-4">🚧</div>
        <h3 className="text-xl font-medium text-gray-700">{feature}</h3>
        <p className="text-gray-500 mt-2">This feature is coming soon!</p>
      </div>
    );
  }

  function Card({ title, children }: CardProps) {
    return (
      <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <h2 className="font-semibold text-lg">{title}</h2>
        </div>
        <div className="divide-y divide-gray-200">
          {children}
        </div>
      </div>
    );
  }

  function StatCard({ icon, title, value }: StatCardProps) {
    return (
      <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-500">{title}</p>
            <h3 className="text-2xl font-bold text-gray-900 mt-1">{value}</h3>
          </div>
          <div className="p-3 rounded-lg bg-indigo-50 text-indigo-600">
            {icon}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="px-6 py-4 flex justify-between items-center">
          <h1 className="text-xl font-semibold">Dietician Dashboard</h1>
          <div className="flex items-center space-x-4">
            <button className="relative p-2 text-gray-600 hover:text-gray-900">
              <FiBell className="text-xl" />
              <span className="absolute top-0 right-0 h-3 w-3 bg-red-500 rounded-full"></span>
            </button>
            <div className="h-8 w-8 rounded-full bg-indigo-100 flex items-center justify-center">
              {user?.name?.charAt(0).toUpperCase()}
            </div>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar */}
        <div className="w-64 bg-white shadow-sm h-screen p-4">
          <nav className="space-y-1">
            <button
              onClick={() => setActiveTab('dashboard')}
              className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg ${activeTab === 'dashboard' ? 'bg-indigo-50 text-indigo-600' : 'text-gray-700 hover:bg-gray-100'}`}
            >
              <FiPieChart className="text-lg" />
              <span>Dashboard</span>
            </button>
            
            <button
              onClick={() => setActiveTab('appointments')}
              className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg ${activeTab === 'appointments' ? 'bg-indigo-50 text-indigo-600' : 'text-gray-700 hover:bg-gray-100'}`}
            >
              <FiCalendar className="text-lg" />
              <span>Appointments</span>
            </button>
            
            <button
              onClick={() => setActiveTab('clients')}
              className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg ${activeTab === 'clients' ? 'bg-indigo-50 text-indigo-600' : 'text-gray-700 hover:bg-gray-100'}`}
            >
              <FiUsers className="text-lg" />
              <span>Clients</span>
            </button>
            
            <button
              onClick={() => setActiveTab('messages')}
              className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg ${activeTab === 'messages' ? 'bg-indigo-50 text-indigo-600' : 'text-gray-700 hover:bg-gray-100'}`}
            >
              <FiMessageSquare className="text-lg" />
              <span>Messages</span>
              {messages.filter(m => m.unread).length > 0 && (
                <span className="ml-auto bg-indigo-600 text-white text-xs px-2 py-1 rounded-full">
                  {messages.filter(m => m.unread).length}
                </span>
              )}
            </button>
            
            <button
              onClick={() => setActiveTab('consultations')}
              className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg ${activeTab === 'consultations' ? 'bg-indigo-50 text-indigo-600' : 'text-gray-700 hover:bg-gray-100'}`}
            >
              <BsChatLeftText className="text-lg" />
              <span>Consultations</span>
            </button>
            
            <button
              onClick={() => setActiveTab('nutrition-plans')}
              className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg ${activeTab === 'nutrition-plans' ? 'bg-indigo-50 text-indigo-600' : 'text-gray-700 hover:bg-gray-100'}`}
            >
              <RiNutritionLine className="text-lg" />
              <span>Nutrition Plans</span>
              <span className="ml-auto text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full">Soon</span>
            </button>
            
            <button
              onClick={() => setActiveTab('earnings')}
              className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg ${activeTab === 'earnings' ? 'bg-indigo-50 text-indigo-600' : 'text-gray-700 hover:bg-gray-100'}`}
            >
              <FiDollarSign className="text-lg" />
              <span>Earnings</span>
              <span className="ml-auto text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full">Soon</span>
            </button>
            
            <button
              onClick={() => setActiveTab('settings')}
              className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg ${activeTab === 'settings' ? 'bg-indigo-50 text-indigo-600' : 'text-gray-700 hover:bg-gray-100'}`}
            >
              <FiSettings className="text-lg" />
              <span>Settings</span>
            </button>
          </nav>
          
          <button
            onClick={handleLogout}
            className="w-full mt-4 flex items-center space-x-3 px-4 py-3 rounded-lg text-gray-700 hover:bg-gray-100"
          >
            <FiLogOut className="text-lg" />
            <span>Logout</span>
          </button>
        </div>

        {/* Main Content */}
        <main className="flex-1 p-6">
          {loading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
            </div>
          ) : error ? (
            <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-lg">
              {error}
            </div>
          ) : (
            <>
              {activeTab === 'dashboard' && (
                <DashboardView 
                  appointments={appointments.slice(0, 3)} 
                  clients={clients.slice(0, 3)} 
                  messages={messages.filter(m => m.unread).slice(0, 3)} 
                />
              )}
              
              {activeTab === 'appointments' && (
                <AppointmentsView appointments={appointments} />
              )}
              
              {activeTab === 'clients' && (
                <ClientsView clients={clients} />
              )}
              
              {activeTab === 'messages' && (
                <MessagesView messages={messages} onMarkAsRead={markAsRead} />
              )}
              
              {activeTab === 'consultations' && (
                <ConsultationsView consultations={consultations} />
              )}
              
              {activeTab === 'nutrition-plans' && (
                <ComingSoon feature="Nutrition Plans Management" />
              )}
              
              {activeTab === 'earnings' && (
                <ComingSoon feature="Earnings Reports" />
              )}
              
            </>
          )}
        </main>
      </div>
    </div>
  );
}