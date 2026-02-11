
import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  LayoutDashboard,
  Users,
  UserPlus,
  Activity as ActivityIcon,
  FileText,
  ClipboardList,
  Utensils,
  BrainCircuit,
  Calendar,
  Bell,
  Settings,
  ChevronLeft,
  ChevronRight,
  Sun,
  Moon,
  Search,
  LogOut,
  User,
  Plus,
  ArrowRight,
  CheckCircle2,
  XCircle,
  AlertCircle,
  X,
  Clock,
  Trash2
} from 'lucide-react';
import { View, Patient, HistoryEvent } from './types';
import { MOCK_PATIENT_HISTORY, MOCK_PATIENTS } from './constants';
import Dashboard from './pages/Dashboard';
import Patients from './pages/Patients';
import PatientDetail from './pages/PatientDetail';
import Requests from './pages/Requests';
import Prescriptions from './pages/Prescriptions';
import Reports from './pages/Reports';
import Schedule from './pages/Schedule';
import DietApprovals from './pages/DietApprovals';
import Wellness from './pages/Wellness';
import Login from './pages/Login';
import * as api from './api';

interface NotificationToast {
  id: string;
  type: 'success' | 'error' | 'info';
  message: string;
}

interface AlertNotification {
  id: string;
  title: string;
  description: string;
  time: string;
  type: 'urgent' | 'info' | 'success';
  isRead: boolean;
}

const App: React.FC = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [currentView, setCurrentView] = useState<View>(View.Dashboard);
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [notifications, setNotifications] = useState<NotificationToast[]>([]);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const notificationRef = useRef<HTMLDivElement>(null);

  // Current dynamic date string
  const [currentDateTime, setCurrentDateTime] = useState('');

  // Loading and error states
  const [isLoadingPatients, setIsLoadingPatients] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Doctor info
  const [doctorInfo, setDoctorInfo] = useState({
    name: 'Dr. Sujal Jadhav',
    specialty: 'General Physician',
    email: 'sujal.jadhav@vaidyasetu.com'
  });

  // Global App State
  const [patients, setPatients] = useState<Patient[]>([]);
  const [patientHistories, setPatientHistories] = useState<Record<string, HistoryEvent[]>>(MOCK_PATIENT_HISTORY);

  const [alerts, setAlerts] = useState<AlertNotification[]>([
    { id: '1', title: 'Critical Heart Rate', description: 'Vikram Deshmukh heart rate spiked to 118bpm.', time: '2m ago', type: 'urgent', isRead: false },
    { id: '2', title: 'New Report Uploaded', description: 'Ananya Sharma uploaded Comprehensive Metabolic Panel.', time: '15m ago', type: 'info', isRead: false },
    { id: '3', title: 'Mood Dip Alert', description: 'Rajesh Malhotra mood journal shows persistent low scores.', time: '1h ago', type: 'urgent', isRead: true },
    { id: '4', title: 'Diet Plan Submitted', description: 'Isha Patel submitted a new Anti-Inflammatory diet plan.', time: '3h ago', type: 'success', isRead: true },
  ]);

  useEffect(() => {
    // Initialize and update date
    const updateDateTime = () => {
      const now = new Date();
      setCurrentDateTime(now.toLocaleDateString('en-US', {
        weekday: 'long',
        month: 'long',
        day: 'numeric',
        year: 'numeric'
      }));
    };
    updateDateTime();
    const interval = setInterval(updateDateTime, 60000); // Update every minute
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  // Fetch patients from backend when authenticated
  useEffect(() => {
    const loadPatients = async () => {
      if (!isAuthenticated) return;

      setIsLoadingPatients(true);
      setError(null);

      try {
        const response = await api.fetchPatients();

        // Transform backend patient data to match frontend Patient type
        const transformedPatients: Patient[] = response.data.map((p: any) => ({
          id: p.patientId,
          name: p.personalInfo.name,
          age: p.personalInfo.age || 0,
          gender: p.personalInfo.gender || 'Other',
          risk: p.riskLevel,
          lastVisit: p.lastVisit ? new Date(p.lastVisit).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
          condition: p.medicalInfo?.chronicConditions?.[0] || 'General Checkup',
          vitals: {
            heartRate: 72,
            oxygen: 98,
            sleepScore: 85,
            stressLevel: 20
          },
          contact: p.personalInfo.phone || 'N/A',
          allergies: p.medicalInfo?.allergies || [],
          image: p.personalInfo.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(p.personalInfo.name)}&background=10b981&color=fff`
        }));

        setPatients(transformedPatients);
      } catch (err: any) {
        console.error('Error fetching patients:', err);
        setError(err.message || 'Failed to load patients');
        notify('Failed to load patients from server', 'error');
      } finally {
        setIsLoadingPatients(false);
      }
    };

    loadPatients();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (notificationRef.current && !notificationRef.current.contains(event.target as Node)) {
        setIsNotificationsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const notify = useCallback((message: string, type: 'success' | 'error' | 'info' = 'success') => {
    const id = Math.random().toString(36).substr(2, 9);
    setNotifications(prev => [...prev, { id, type, message }]);
    setTimeout(() => {
      setNotifications(prev => prev.filter(n => n.id !== id));
    }, 4000);
  }, []);

  const addHistoryEvent = useCallback((patientId: string, event: Omit<HistoryEvent, 'id' | 'date'>) => {
    const newEvent: HistoryEvent = {
      ...event,
      id: Math.random().toString(36).substr(2, 9),
      date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
    };

    setPatientHistories(prev => ({
      ...prev,
      [patientId]: [newEvent, ...(prev[patientId] || [])]
    }));
  }, []);

  const handleAddPatient = useCallback((newPatient: Patient) => {
    setPatients(prev => [...prev, newPatient]);
    notify(`Patient ${newPatient.name} added successfully.`, 'success');
  }, [notify]);

  const navigateToPatient = (patient: Patient) => {
    setSelectedPatient(patient);
    setCurrentView(View.PatientDetail);
  };

  const markAllAsRead = () => {
    setAlerts(prev => prev.map(a => ({ ...a, isRead: true })));
    notify('All notifications marked as read', 'info');
  };

  const clearNotifications = () => {
    setAlerts([]);
    notify('Notification center cleared', 'info');
  };

  const handleLogout = () => {
    api.logout();
    setIsAuthenticated(false);
    setCurrentView(View.Dashboard);
    setSelectedPatient(null);
    setPatients([]);
    setDoctorInfo({
      name: 'Dr. Sujal Jadhav',
      specialty: 'General Physician',
      email: 'sujal.jadhav@vaidyasetu.com'
    });
  };

  const handleLogin = (userData: any) => {
    setIsAuthenticated(true);
    if (userData.user) {
      setDoctorInfo({
        name: userData.user.name || 'Dr. Sujal Jadhav',
        specialty: userData.user.specialty || 'General Physician',
        email: userData.user.email || 'sujal.jadhav@vaidyasetu.com'
      });
    }
  };

  if (!isAuthenticated) {
    return <Login onLogin={handleLogin} />;
  }

  const renderContent = () => {
    const commonProps = { notify, onAddHistory: addHistoryEvent };
    switch (currentView) {
      case View.Dashboard:
        return <Dashboard patients={patients} onSelectPatient={navigateToPatient} onNavigate={setCurrentView} {...commonProps} />;
      case View.Patients:
        return <Patients patients={patients} onAddPatient={handleAddPatient} onSelectPatient={navigateToPatient} {...commonProps} />;
      case View.PatientDetail:
        return selectedPatient ? (
          <PatientDetail
            patient={selectedPatient}
            history={patientHistories[selectedPatient.id] || []}
            onBack={() => setCurrentView(View.Patients)}
            {...commonProps}
          />
        ) : <Dashboard patients={patients} onSelectPatient={navigateToPatient} onNavigate={setCurrentView} {...commonProps} />;
      case View.Requests:
        return <Requests onAddPatient={handleAddPatient} {...commonProps} />;
      case View.Prescriptions:
        return <Prescriptions patients={patients} notify={notify} onAddHistory={addHistoryEvent} />;
      case View.Reports:
        return <Reports {...commonProps} />;
      case View.DietApprovals:
        return <DietApprovals {...commonProps} />;
      case View.Wellness:
        return <Wellness patients={patients} {...commonProps} />;
      case View.Schedule:
        return <Schedule patients={patients} {...commonProps} />;
      default:
        return <Dashboard patients={patients} onSelectPatient={navigateToPatient} onNavigate={setCurrentView} {...commonProps} />;
    }
  };

  const menuItems = [
    { id: View.Dashboard, label: 'Dashboard', icon: LayoutDashboard },
    { id: View.Patients, label: 'Patients', icon: Users },
    { id: View.Requests, label: 'Connection Requests', icon: UserPlus },
    { id: View.Prescriptions, label: 'Prescriptions', icon: ClipboardList },
    { id: View.Reports, label: 'Reports', icon: FileText },
    { id: View.DietApprovals, label: 'Diet Approvals', icon: Utensils },
    { id: View.Wellness, label: 'Mental Wellness', icon: BrainCircuit },
    { id: View.Schedule, label: 'Schedule', icon: Calendar },
  ];

  const unreadCount = alerts.filter(a => !a.isRead).length;

  return (
    <div className={`min-h-screen flex transition-colors duration-300 ${isDarkMode ? 'bg-[#0a0f1d] text-white' : 'bg-gray-50 text-gray-900'}`}>
      <div className="fixed top-24 right-8 z-[100] space-y-3 pointer-events-none">
        {notifications.map((n) => (
          <div
            key={n.id}
            className={`pointer-events-auto flex items-center gap-3 px-5 py-4 rounded-2xl shadow-2xl border animate-in slide-in-from-right-10 duration-300 glass-morphism
              ${n.type === 'success' ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-500' :
                n.type === 'error' ? 'bg-red-500/10 border-red-500/20 text-red-500' : 'bg-blue-500/10 border-blue-500/20 text-blue-500'}`}
          >
            {n.type === 'success' && <CheckCircle2 size={20} />}
            {n.type === 'error' && <XCircle size={20} />}
            {n.type === 'info' && <AlertCircle size={20} />}
            <p className="text-sm font-bold">{n.message}</p>
            <button onClick={() => setNotifications(prev => prev.filter(item => item.id !== n.id))} className="ml-2 hover:opacity-70">
              <X size={16} />
            </button>
          </div>
        ))}
      </div>

      <aside className={`fixed left-0 top-0 h-full transition-all duration-300 z-50 border-r border-white/5 
        ${isSidebarCollapsed ? 'w-20' : 'w-64'} 
        ${isDarkMode ? 'bg-[#0f172a]' : 'bg-white shadow-lg'}`}>

        <div className="flex items-center justify-between p-6">
          {!isSidebarCollapsed && (
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-emerald-500 flex items-center justify-center text-white font-bold shadow-lg shadow-emerald-500/20 text-sm">V</div>
              <span className="text-xl font-bold tracking-tight">Vaidya<span className="text-emerald-500">Setu</span></span>
            </div>
          )}
          <button onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)} className={`p-1.5 rounded-lg hover:bg-emerald-500/10 text-gray-400 hover:text-emerald-500 transition-colors ${isSidebarCollapsed ? 'mx-auto' : ''}`}>
            {isSidebarCollapsed ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
          </button>
        </div>

        <nav className="mt-4 px-3 space-y-1">
          {menuItems.map((item) => (
            <button key={item.id} onClick={() => setCurrentView(item.id)} className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all group active:scale-[0.98] ${currentView === item.id ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/20' : 'text-gray-400 hover:bg-emerald-500/10 hover:text-emerald-500'}`}>
              <item.icon size={20} className={currentView === item.id ? 'text-white' : 'group-hover:text-emerald-500'} />
              {!isSidebarCollapsed && <span className="font-medium text-sm">{item.label}</span>}
            </button>
          ))}
        </nav>

        <div className="absolute bottom-6 w-full px-3">
          <button
            onClick={handleLogout}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-red-400 hover:bg-red-400/10 transition-colors active:scale-[0.98] ${isSidebarCollapsed ? 'justify-center' : ''}`}
          >
            <LogOut size={20} />
            {!isSidebarCollapsed && <span className="font-medium text-sm">Logout</span>}
          </button>
        </div>
      </aside>

      <main className={`flex-1 transition-all duration-300 ${isSidebarCollapsed ? 'ml-20' : 'ml-64'}`}>
        <header className={`sticky top-0 z-40 h-20 px-8 flex items-center justify-between border-b border-white/5 backdrop-blur-md ${isDarkMode ? 'bg-[#0a0f1d]/80 border-white/5' : 'bg-white/80 border-gray-100'}`}>
          <div className="flex flex-col">
            <h1 className="text-xl font-semibold">Welcome back, {doctorInfo.name.split(' ').slice(0, 2).join(' ')}</h1>
            <p className="text-sm text-gray-400">{currentDateTime}</p>
          </div>
          <div className="flex items-center gap-4">
            <div className="relative" ref={notificationRef}>
              <button
                onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
                className={`p-2.5 rounded-xl transition-all relative active:scale-95 ${isDarkMode ? 'bg-white/5 hover:bg-white/10' : 'bg-gray-100 hover:bg-gray-200'}`}
              >
                <Bell size={20} />
                {unreadCount > 0 && (
                  <span className="absolute top-2.5 right-2.5 w-2.5 h-2.5 rounded-full bg-red-500 border-2 border-[#0a0f1d] animate-pulse"></span>
                )}
              </button>

              {isNotificationsOpen && (
                <div className={`absolute right-0 mt-4 w-[400px] rounded-3xl border border-white/5 shadow-2xl animate-in zoom-in-95 duration-200 origin-top-right overflow-hidden glass-morphism ${isDarkMode ? 'bg-[#0f172a]' : 'bg-white text-gray-900 shadow-xl'}`}>
                  <div className="p-6 border-b border-white/5 flex items-center justify-between bg-white/5">
                    <div>
                      <h3 className="font-bold text-lg">Notifications</h3>
                      <p className="text-xs text-gray-400">{unreadCount} unread alerts</p>
                    </div>
                    <div className="flex gap-2">
                      <button onClick={markAllAsRead} className="text-[10px] font-bold text-emerald-500 uppercase hover:underline">Mark read</button>
                      <button onClick={clearNotifications} className="text-[10px] font-bold text-red-400 uppercase hover:underline">Clear all</button>
                    </div>
                  </div>
                  <div className="max-h-[400px] overflow-y-auto custom-scrollbar">
                    {alerts.length === 0 ? (
                      <div className="p-12 text-center text-gray-500">
                        <Bell className="mx-auto mb-3 opacity-20" size={40} />
                        <p className="font-bold">No new notifications</p>
                      </div>
                    ) : (
                      alerts.map((alert) => (
                        <div key={alert.id} className={`p-5 border-b border-white/5 hover:bg-emerald-500/5 transition-colors cursor-pointer group ${!alert.isRead ? 'bg-emerald-500/5' : ''}`}>
                          <div className="flex items-start gap-4">
                            <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 
                              ${alert.type === 'urgent' ? 'bg-red-500/10 text-red-500' :
                                alert.type === 'success' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-blue-500/10 text-blue-500'}`}>
                              {alert.type === 'urgent' ? <AlertCircle size={20} /> : alert.type === 'success' ? <CheckCircle2 size={20} /> : <FileText size={20} />}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between mb-1">
                                <h4 className={`text-sm font-bold truncate ${!alert.isRead ? 'text-white' : 'text-gray-400'}`}>{alert.title}</h4>
                                <span className="text-[10px] text-gray-500 font-medium whitespace-nowrap ml-2">{alert.time}</span>
                              </div>
                              <p className="text-xs text-gray-400 line-clamp-2 leading-relaxed">{alert.description}</p>
                            </div>
                            {!alert.isRead && (
                              <div className="w-2 h-2 rounded-full bg-emerald-500 mt-2"></div>
                            )}
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>

            <button onClick={() => setIsDarkMode(!isDarkMode)} className={`p-2.5 rounded-xl transition-all active:scale-95 ${isDarkMode ? 'bg-white/5 hover:bg-white/10 text-yellow-400' : 'bg-gray-100 hover:bg-gray-200 text-blue-500'}`}>
              {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
            </button>
            <div className={`flex items-center gap-3 pl-4 border-l border-white/10`}>
              <div className="text-right hidden sm:block">
                <p className="text-sm font-semibold">{doctorInfo.name}</p>
                <p className="text-xs text-emerald-500">{doctorInfo.specialty}</p>
              </div>
              <img src={`https://ui-avatars.com/api/?name=${encodeURIComponent(doctorInfo.name)}&background=10b981&color=fff`} alt="Profile" className="w-10 h-10 rounded-xl border-2 border-emerald-500/30 object-cover" />
            </div>
          </div>
        </header>
        <div className="p-8">
          {renderContent()}
        </div>
      </main>
    </div>
  );
};

export default App;
