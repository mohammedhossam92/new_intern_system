import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';
import CreateDoctorAccount from '../admin/CreateDoctorAccount';
import { 
  User, 
  Bell, 
  FileText, 
  Users, 
  UserCheck, 
  ClipboardList, 
  LogOut,
  Menu,
  X,
  Sun,
  Moon,
  UserPlus,
  Settings
} from 'lucide-react';

interface Tab {
  name: string;
  icon: React.ReactNode;
}

const AdminDashboard: React.FC = () => {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [activeTab, setActiveTab] = useState<string>('Doctors');
  const [isUserMenuOpen, setIsUserMenuOpen] = useState<boolean>(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState<boolean>(false);

  const tabs: Tab[] = [
    { name: 'Doctors', icon: <UserPlus className="h-5 w-5" /> },
    { name: 'Students', icon: <Users className="h-5 w-5" /> },
    { name: 'System', icon: <Settings className="h-5 w-5" /> },
  ];

  const handleLogout = () => {
    logout();
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'Doctors':
        return <DoctorManagement />;
      case 'Students':
        return <StudentManagement />;
      case 'System':
        return <SystemSettings />;
      default:
        return <DoctorManagement />;
    }
  };

  return (
    <div className="flex flex-col h-screen">
      {/* Header */}
      <header className="bg-white dark:bg-slate-800 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <div className="flex items-center">
            {/* Logo */}
            <div className="flex-shrink-0">
              <svg
                className="h-10 w-10 text-blue-600 dark:text-blue-400"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M12 2.04c-.8-.01-1.61.13-2.38.4A6.97 6.97 0 0 0 6.1 4.99c-.4.4-.75.86-1.03 1.36-.32.6-.5 1.26-.5 1.93 0 .71.23 1.4.64 1.98.38.52.9.93 1.5 1.18-.04.09-.07.18-.09.27-.08.35-.12.71-.12 1.07 0 .9.25 1.78.7 2.55.48.8 1.15 1.45 1.95 1.86.8.42 1.7.63 2.6.63.92 0 1.83-.22 2.63-.64.8-.42 1.47-1.06 1.95-1.85.45-.77.7-1.65.7-2.55 0-.36-.04-.72-.12-1.07-.02-.09-.05-.18-.09-.27.6-.25 1.12-.66 1.5-1.18.41-.58.64-1.27.64-1.98 0-.67-.18-1.33-.5-1.93-.28-.5-.63-.96-1.03-1.36a6.97 6.97 0 0 0-3.52-2.55A7.1 7.1 0 0 0 12 2.04z" />
                <path d="M8.5 10.53v-1.5c0-.83.67-1.5 1.5-1.5h4c.83 0 1.5.67 1.5 1.5v1.5" />
              </svg>
            </div>
            <div className="ml-4">
              <h1 className="text-xl font-bold text-gray-900 dark:text-white">Dental Management</h1>
              <p className="text-sm text-gray-500 dark:text-gray-400">Admin Dashboard</p>
            </div>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500"
            >
              <span className="sr-only">Open main menu</span>
              {isMobileMenuOpen ? (
                <X className="block h-6 w-6" aria-hidden="true" />
              ) : (
                <Menu className="block h-6 w-6" aria-hidden="true" />
              )}
            </button>
          </div>

          {/* Desktop menu */}
          <div className="hidden md:flex md:items-center md:space-x-4">
            <button
              onClick={toggleTheme}
              className="p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500"
            >
              {theme === 'dark' ? (
                <Sun className="h-5 w-5" aria-hidden="true" />
              ) : (
                <Moon className="h-5 w-5" aria-hidden="true" />
              )}
            </button>

            {/* User menu */}
            <div className="relative">
              <button
                onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                className="flex items-center space-x-2 p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500"
              >
                <div className="h-8 w-8 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center">
                  <User className="h-5 w-5 text-blue-600 dark:text-blue-200" aria-hidden="true" />
                </div>
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  {user?.fullName || 'Admin'}
                </span>
              </button>

              {isUserMenuOpen && (
                <div className="origin-top-right absolute right-0 mt-2 w-48 rounded-md shadow-lg py-1 bg-white dark:bg-slate-800 ring-1 ring-black ring-opacity-5 focus:outline-none">
                  <button
                    onClick={handleLogout}
                    className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center"
                  >
                    <LogOut className="mr-3 h-4 w-4" aria-hidden="true" />
                    Sign out
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Mobile menu, show/hide based on menu state */}
      {isMobileMenuOpen && (
        <div className="md:hidden bg-white dark:bg-slate-800 shadow-md">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            {tabs.map((tab) => (
              <button
                key={tab.name}
                onClick={() => {
                  setActiveTab(tab.name);
                  setIsMobileMenuOpen(false);
                }}
                className={`${activeTab === tab.name
                  ? 'bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-200'
                  : 'text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
                  } block px-3 py-2 rounded-md text-base font-medium w-full text-left flex items-center`}
              >
                <span className="mr-3">{tab.icon}</span>
                {tab.name}
              </button>
            ))}

            <button
              onClick={toggleTheme}
              className="text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 block px-3 py-2 rounded-md text-base font-medium w-full text-left flex items-center"
            >
              <span className="mr-3">
                {theme === 'dark' ? (
                  <Sun className="h-5 w-5" aria-hidden="true" />
                ) : (
                  <Moon className="h-5 w-5" aria-hidden="true" />
                )}
              </span>
              {theme === 'dark' ? 'Light Mode' : 'Dark Mode'}
            </button>

            <button
              onClick={handleLogout}
              className="text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 block px-3 py-2 rounded-md text-base font-medium w-full text-left flex items-center"
            >
              <LogOut className="mr-3 h-5 w-5" aria-hidden="true" />
              Sign out
            </button>
          </div>
        </div>
      )}

      {/* Main content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar */}
        <div className="hidden md:flex md:flex-shrink-0">
          <div className="flex flex-col w-64 border-r border-gray-200 dark:border-gray-700 bg-white dark:bg-slate-800">
            <div className="h-0 flex-1 flex flex-col pt-5 pb-4 overflow-y-auto">
              <nav className="mt-5 flex-1 px-2 space-y-1">
                {tabs.map((tab) => (
                  <button
                    key={tab.name}
                    onClick={() => setActiveTab(tab.name)}
                    className={`${activeTab === tab.name
                      ? 'bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-200'
                      : 'text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
                      } group flex items-center px-2 py-2 text-sm font-medium rounded-md w-full`}
                  >
                    <span className="mr-3">{tab.icon}</span>
                    {tab.name}
                  </button>
                ))}
              </nav>
            </div>
          </div>
        </div>

        {/* Content area */}
        <div className="flex-1 overflow-auto p-4 bg-gray-50 dark:bg-slate-900">
          {renderContent()}
        </div>
      </div>
    </div>
  );
};

const DoctorManagement: React.FC = () => {
  return (
    <div className="max-w-6xl mx-auto">
      <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Doctor Management</h2>
      
      <div className="grid grid-cols-1 gap-6">
        <div className="bg-white dark:bg-slate-800 shadow overflow-hidden rounded-lg">
          <div className="px-4 py-5 sm:px-6 border-b border-gray-200 dark:border-gray-700">
            <h3 className="text-lg leading-6 font-medium text-gray-900 dark:text-white">Create New Doctor Account</h3>
            <p className="mt-1 max-w-2xl text-sm text-gray-500 dark:text-gray-400">
              Add a new doctor who can approve student sign-ups and manage the system
            </p>
          </div>
          <div className="px-4 py-5 sm:p-6">
            <CreateDoctorAccount />
          </div>
        </div>
      </div>
    </div>
  );
};

const StudentManagement: React.FC = () => {
  // Mock student data
  const students = [
    { id: 1, name: 'John Smith', email: 'john.smith@example.com', university: 'University A', status: 'Active' },
    { id: 2, name: 'Emily Johnson', email: 'emily.johnson@example.com', university: 'University B', status: 'Active' },
    { id: 3, name: 'Michael Brown', email: 'michael.brown@example.com', university: 'University A', status: 'Inactive' },
    { id: 4, name: 'Sarah Davis', email: 'sarah.davis@example.com', university: 'University C', status: 'Active' },
  ];

  return (
    <div className="max-w-6xl mx-auto">
      <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Student Management</h2>
      
      <div className="bg-white dark:bg-slate-800 shadow overflow-hidden rounded-lg">
        <div className="px-4 py-5 sm:px-6 border-b border-gray-200 dark:border-gray-700">
          <h3 className="text-lg leading-6 font-medium text-gray-900 dark:text-white">All Students</h3>
          <p className="mt-1 max-w-2xl text-sm text-gray-500 dark:text-gray-400">View and manage all student accounts</p>
        </div>
        
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-slate-700">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Name</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Email</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">University</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Status</th>
                <th scope="col" className="relative px-6 py-3">
                  <span className="sr-only">Actions</span>
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-slate-800 divide-y divide-gray-200 dark:divide-gray-700">
              {students.map((student) => (
                <tr key={student.id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10">
                        <div className="h-10 w-10 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center">
                          <span className="text-blue-600 dark:text-blue-200 font-medium">{student.name.charAt(0)}</span>
                        </div>
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900 dark:text-white">{student.name}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                    {student.email}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                    {student.university}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                      ${student.status === 'Active' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' : ''}
                      ${student.status === 'Inactive' ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200' : ''}
                    `}>
                      {student.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <a href="#" className="text-blue-600 dark:text-blue-400 hover:text-blue-900 dark:hover:text-blue-300">View</a>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

const SystemSettings: React.FC = () => {
  return (
    <div className="max-w-6xl mx-auto">
      <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">System Settings</h2>
      
      <div className="bg-white dark:bg-slate-800 shadow overflow-hidden rounded-lg">
        <div className="px-4 py-5 sm:px-6 border-b border-gray-200 dark:border-gray-700">
          <h3 className="text-lg leading-6 font-medium text-gray-900 dark:text-white">General Settings</h3>
          <p className="mt-1 max-w-2xl text-sm text-gray-500 dark:text-gray-400">Configure system-wide settings</p>
        </div>
        <div className="px-4 py-5 sm:p-6">
          <p className="text-gray-500 dark:text-gray-400">System settings will be implemented here.</p>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;