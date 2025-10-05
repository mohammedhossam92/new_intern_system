import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import ThemeToggle from '../common/ThemeToggle';
import StudentProfile from './StudentProfile';
import Statistics from './Statistics';
import AddPatient from './AddPatient';
import PatientList from './PatientList';
import AppointmentScheduler from './AppointmentScheduler';
import NotificationCenter from './NotificationCenter';
import { User, BarChart3, UserPlus, Users, LogOut, Menu, X, Calendar, Bell, Activity } from 'lucide-react';

type TabType = 'profile' | 'statistics' | 'add-patient' | 'patients' | 'appointments';

const Dashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabType>('profile');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/signin');
  };

  const tabs = [
    { id: 'profile' as TabType, label: 'Profile', icon: User },
    { id: 'statistics' as TabType, label: 'Statistics', icon: BarChart3 },
    { id: 'add-patient' as TabType, label: 'Add Patient', icon: UserPlus },
    { id: 'patients' as TabType, label: 'Patients', icon: Users },
    { id: 'appointments' as TabType, label: 'Appointments', icon: Calendar },
  ];

  const renderContent = () => {
    switch (activeTab) {
      case 'profile':
        return <StudentProfile />;
      case 'statistics':
        return <Statistics />;
      case 'add-patient':
        return <AddPatient />;
      case 'patients':
        return <PatientList />;
      case 'appointments':
        return <AppointmentScheduler />;
      default:
        return <StudentProfile />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-slate-100 dark:from-slate-900 dark:via-blue-900/20 dark:to-slate-800">
      {/* Header */}
      <header className="bg-gradient-to-r from-white via-blue-50/50 to-white dark:from-slate-800 dark:via-blue-900/30 dark:to-slate-800 shadow-2xl border-b border-slate-200/50 dark:border-slate-700/50 backdrop-blur-md relative overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600/5 via-transparent to-emerald-600/5 dark:from-blue-400/10 dark:via-transparent dark:to-emerald-400/10"></div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="flex justify-between items-center h-24">
            {/* Logo and Title */}
            <div className="flex items-center gap-4">
              <div className="relative group">
                <div className="h-12 w-12 bg-gradient-to-br from-blue-600 via-blue-700 to-blue-800 rounded-2xl flex items-center justify-center shadow-xl shadow-blue-500/30 group-hover:shadow-blue-500/50 transition-all duration-300 group-hover:scale-105">
                  {/* Proper Tooth Icon */}
                  <svg className="h-6 w-6 text-white" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M12 2C10.5 2 9 3.5 9 5C9 6.5 10.5 8 12 8C13.5 8 15 6.5 15 5C15 3.5 13.5 2 12 2Z" fill="currentColor"/>
                    <path d="M8 6C6.5 6 5 7.5 5 9C5 10.5 6.5 12 8 12C9.5 12 11 10.5 11 9C11 7.5 9.5 6 8 6Z" fill="currentColor"/>
                    <path d="M16 6C14.5 6 13 7.5 13 9C13 10.5 14.5 12 16 12C17.5 12 19 10.5 19 9C19 7.5 17.5 6 16 6Z" fill="currentColor"/>
                    <path d="M12 10C10.5 10 9 11.5 9 13C9 14.5 10.5 16 12 16C13.5 16 15 14.5 15 13C15 11.5 13.5 10 12 10Z" fill="currentColor"/>
                    <path d="M8 14C6.5 14 5 15.5 5 17C5 18.5 6.5 20 8 20C9.5 20 11 18.5 11 17C11 15.5 9.5 14 8 14Z" fill="currentColor"/>
                    <path d="M16 14C14.5 14 13 15.5 13 17C13 18.5 14.5 20 16 20C17.5 20 19 18.5 19 17C19 15.5 17.5 14 16 14Z" fill="currentColor"/>
                  </svg>
                </div>
                <div className="absolute -top-1 -right-1 h-4 w-4 bg-gradient-to-br from-emerald-400 to-emerald-500 rounded-full border-2 border-white dark:border-slate-800 shadow-lg flex items-center justify-center">
                  <div className="h-1.5 w-1.5 bg-white rounded-full animate-pulse"></div>
                </div>
                <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-blue-400/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              </div>
              <div className="mr-8">
                <h1 className="text-xl font-bold bg-gradient-to-r from-slate-900 via-blue-800 to-slate-700 dark:from-white dark:via-blue-200 dark:to-slate-200 bg-clip-text text-transparent">
                  Dental Management
                </h1>
                <p className="text-xs text-slate-600 dark:text-slate-400 hidden sm:block font-medium">
                  Student Clinical Dashboard
                </p>
              </div>
            </div>

            {/* Desktop Navigation */}
            <nav className="hidden lg:flex items-center space-x-1">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center gap-3 px-5 py-3 rounded-2xl text-sm font-semibold transition-all duration-300 relative overflow-hidden group ${
                      activeTab === tab.id
                        ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-xl shadow-blue-500/30 transform scale-105'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/80 dark:text-slate-400 dark:hover:text-slate-100 dark:hover:bg-slate-700/50 hover:shadow-lg'
                    }`}
                  >
                    <Icon className={`h-4 w-4 transition-transform duration-300 ${activeTab === tab.id ? 'scale-110' : 'group-hover:scale-110'}`} />
                    {tab.label}
                    {activeTab === tab.id && (
                      <div className="absolute inset-0 bg-gradient-to-r from-blue-400/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    )}
                  </button>
                );
              })}
            </nav>

            {/* User Menu */}
            <div className="flex items-center gap-4">
              {/* Notifications */}
              <button
                onClick={() => setShowNotifications(true)}
                className="relative p-3 text-slate-600 hover:text-slate-900 hover:bg-slate-100/80 dark:text-slate-400 dark:hover:text-slate-100 dark:hover:bg-slate-700/50 rounded-2xl transition-all duration-300 group hover:shadow-lg"
              >
                <Bell className="h-5 w-5 group-hover:scale-110 transition-transform duration-300" />
                <span className="absolute -top-2 -right-2 h-6 w-6 bg-gradient-to-r from-red-500 to-red-600 text-white text-xs font-bold rounded-full flex items-center justify-center shadow-lg animate-pulse">
                  2
                </span>
              </button>

              {/* Theme Toggle */}
              <ThemeToggle />

              <div className="hidden sm:block text-right">
                <p className="text-sm font-bold text-slate-900 dark:text-slate-100">{user?.fullName}</p>
                <p className="text-xs text-slate-600 dark:text-slate-400 font-semibold tracking-wide">{user?.role}</p>
              </div>
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-slate-600 hover:text-red-600 dark:text-slate-400 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-2xl transition-all duration-300 hover:shadow-lg group"
              >
                <LogOut className="h-4 w-4 group-hover:scale-110 transition-transform duration-300" />
                <span className="hidden sm:inline">Logout</span>
              </button>

              {/* Mobile menu button */}
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="lg:hidden p-3 rounded-2xl text-slate-600 hover:text-slate-900 hover:bg-slate-100/80 dark:text-slate-400 dark:hover:text-slate-100 dark:hover:bg-slate-700/50 transition-all duration-300 hover:shadow-lg"
              >
                {isMobileMenuOpen ? (
                  <X className="h-5 w-5" />
                ) : (
                  <Menu className="h-5 w-5" />
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMobileMenuOpen && (
          <div className="lg:hidden border-t border-slate-200/50 dark:border-slate-700/50 bg-white/90 dark:bg-slate-800/90 backdrop-blur-md">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4">
              <div className="space-y-2">
                {tabs.map((tab) => {
                  const Icon = tab.icon;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => {
                        setActiveTab(tab.id);
                        setIsMobileMenuOpen(false);
                      }}
                      className={`flex items-center gap-3 w-full px-4 py-3 rounded-2xl text-sm font-semibold transition-all duration-300 ${
                        activeTab === tab.id
                          ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-xl shadow-blue-500/30'
                          : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/80 dark:text-slate-400 dark:hover:text-slate-100 dark:hover:bg-slate-700/50'
                      }`}
                    >
                      <Icon className="h-5 w-5" />
                      {tab.label}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {renderContent()}
      </main>

      {/* Notification Center */}
      <NotificationCenter
        isOpen={showNotifications}
        onClose={() => setShowNotifications(false)}
      />
    </div>
  );
};

export default Dashboard;
