import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate, useLocation } from 'react-router-dom';
import ThemeToggle from '../common/ThemeToggle';
import NotificationCenter from './NotificationCenter';
import { User, BarChart3, UserPlus, Users, LogOut, Menu, X, Calendar, Bell } from 'lucide-react';

type TabType = 'profile' | 'statistics' | 'add-patient' | 'patients' | 'appointments';

interface DashboardLayoutProps {
  children: React.ReactNode;
  activeTab?: TabType;
  onTabChange?: (tab: TabType) => void;
}

const DashboardLayout: React.FC<DashboardLayoutProps> = ({ children, activeTab, onTabChange }) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/signin');
  };

  const tabs = [
    { id: 'profile' as TabType, label: 'Profile', icon: User, path: '/dashboard' },
    { id: 'statistics' as TabType, label: 'Statistics', icon: BarChart3, path: '/dashboard' },
    { id: 'add-patient' as TabType, label: 'Add Patient', icon: UserPlus, path: '/dashboard' },
    { id: 'patients' as TabType, label: 'Patients', icon: Users, path: '/dashboard' },
    { id: 'appointments' as TabType, label: 'Appointments', icon: Calendar, path: '/dashboard' },
  ];

  const handleTabClick = (tab: typeof tabs[0]) => {
    // If we're on patient profile page, navigate back to dashboard first
    if (location.pathname.startsWith('/patient/')) {
      navigate('/dashboard', { state: { activeTab: tab.id } });
    }
    // If we're already on dashboard, just change the tab
    if (onTabChange) {
      onTabChange(tab.id);
    }
    setIsMobileMenuOpen(false);
  };

  // Determine if we're on a patient profile page
  const isOnPatientProfile = location.pathname.startsWith('/patient/');

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-slate-100 dark:from-slate-900 dark:via-blue-900/20 dark:to-slate-800">
      {/* Persistent Header */}
      <header className="bg-gradient-to-r from-white via-blue-50/50 to-white dark:from-slate-800 dark:via-blue-900/30 dark:to-slate-800 shadow-2xl border-b border-slate-200/50 dark:border-slate-700/50 backdrop-blur-md relative overflow-hidden sticky top-0 z-50">
        {/* Background Pattern */}
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600/5 via-transparent to-emerald-600/5 dark:from-blue-400/10 dark:via-transparent dark:to-emerald-400/10"></div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="flex justify-between items-center h-24">
            {/* Logo and Title */}
            <div className="flex items-center gap-4">
              <div className="relative group cursor-pointer" onClick={() => navigate('/dashboard')}>
                <div className="h-12 w-12 bg-gradient-to-br from-blue-600 via-blue-700 to-blue-800 rounded-2xl flex items-center justify-center shadow-xl shadow-blue-500/30 group-hover:shadow-blue-500/50 transition-all duration-300 group-hover:scale-105">
                  {/* Modern Tooth Icon */}
                  <svg className="h-8 w-8 text-white" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                    <path d="M12 3C9.8 3 8 4.8 8 7v3c0 1.5-0.5 2.5-1 3.5C6.5 14.5 6 15.5 6 17c0 2.2 1.8 4 4 4 1.1 0 2-0.9 2-2v-3c0-0.6 0.4-1 1-1s1 0.4 1 1v3c0 1.1 0.9 2 2 2 2.2 0 4-1.8 4-4 0-1.5-0.5-2.5-1-3.5-0.5-1-1-2-1-3.5V7c0-2.2-1.8-4-4-4z"/>
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
                const isActive = !isOnPatientProfile && activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => handleTabClick(tab)}
                    className={`flex items-center gap-3 px-5 py-3 rounded-2xl text-sm font-semibold transition-all duration-300 relative overflow-hidden group ${
                      isActive
                        ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-xl shadow-blue-500/30 transform scale-105'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/80 dark:text-slate-400 dark:hover:text-slate-100 dark:hover:bg-slate-700/50 hover:shadow-lg'
                    }`}
                  >
                    <Icon className={`h-4 w-4 transition-transform duration-300 ${isActive ? 'scale-110' : 'group-hover:scale-110'}`} />
                    {tab.label}
                    {isActive && (
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

          {/* Mobile Navigation */}
          {isMobileMenuOpen && (
            <div className="lg:hidden pb-4 pt-2 space-y-2">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                const isActive = !isOnPatientProfile && activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => handleTabClick(tab)}
                    className={`w-full flex items-center gap-3 px-5 py-3 rounded-2xl text-sm font-semibold transition-all duration-300 ${
                      isActive
                        ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-lg'
                        : 'text-slate-600 hover:bg-slate-100/80 dark:text-slate-400 dark:hover:bg-slate-700/50'
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                    {tab.label}
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </header>

      {/* Content Area */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>

      {/* Notification Center */}
      {showNotifications && (
        <NotificationCenter
          isOpen={showNotifications}
          onClose={() => setShowNotifications(false)}
        />
      )}
    </div>
  );
};

export default DashboardLayout;
