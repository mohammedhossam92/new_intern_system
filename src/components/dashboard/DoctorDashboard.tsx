import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';
import SupervisorProfile from './SupervisorProfile';
import StudentApprovalManagement from './StudentApprovalManagement';
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
  UserCog
} from 'lucide-react';

interface Tab {
  name: string;
  icon: React.ReactNode;
}

const DoctorDashboard: React.FC = () => {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [activeTab, setActiveTab] = useState<string>('Notifications');
  const [isUserMenuOpen, setIsUserMenuOpen] = useState<boolean>(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState<boolean>(false);
  const [notificationCount, setNotificationCount] = useState<number>(5); // Mock notification count

  const tabs: Tab[] = [
    { name: 'Notifications', icon: <Bell className="h-5 w-5" /> },
    { name: 'Students', icon: <Users className="h-5 w-5" /> },
    { name: 'Patients', icon: <FileText className="h-5 w-5" /> },
    { name: 'Approvals', icon: <UserCheck className="h-5 w-5" /> },
    { name: 'Reports', icon: <ClipboardList className="h-5 w-5" /> },
    { name: 'Supervisor', icon: <UserCog className="h-5 w-5" /> },
  ];

  const handleLogout = () => {
    logout();
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'Notifications':
        return <NotificationCenter />;
      case 'Students':
        return <StudentManagement />;
      case 'Patients':
        return <PatientManagement />;
      case 'Approvals':
        return <ApprovalsCenter />;
      case 'Reports':
        return <ReportsCenter />;
      case 'Supervisor':
        return <SupervisorProfile />;
      default:
        return <NotificationCenter />;
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
              <p className="text-sm text-gray-500 dark:text-gray-400">Doctor Dashboard</p>
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

          {/* User menu (desktop) */}
          <div className="hidden md:flex items-center">
            {/* Notification bell */}
            <div className="relative mr-4">
              <Bell className="h-6 w-6 text-gray-400 hover:text-gray-500 cursor-pointer" />
              {notificationCount > 0 && (
                <span className="absolute top-0 right-0 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white transform translate-x-1/2 -translate-y-1/2 bg-red-600 rounded-full">
                  {notificationCount}
                </span>
              )}
            </div>

            {/* Theme toggle */}
            <button
              onClick={toggleTheme}
              className="p-2 mr-4 text-gray-400 hover:text-gray-500 focus:outline-none"
            >
              {theme === 'dark' ? (
                <Sun className="h-6 w-6" />
              ) : (
                <Moon className="h-6 w-6" />
              )}
            </button>

            {/* User dropdown */}
            <div className="relative">
              <button
                onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                className="flex items-center max-w-xs text-sm rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                <span className="sr-only">Open user menu</span>
                <div className="h-8 w-8 rounded-full bg-blue-600 flex items-center justify-center text-white">
                  {user?.fullName.charAt(0)}
                </div>
                <span className="ml-2 text-gray-700 dark:text-gray-300">{user?.fullName}</span>
              </button>

              {isUserMenuOpen && (
                <div className="origin-top-right absolute right-0 mt-2 w-48 rounded-md shadow-lg py-1 bg-white dark:bg-slate-800 ring-1 ring-black ring-opacity-5 focus:outline-none z-10">
                  <div className="px-4 py-2">
                    <p className="text-sm font-medium text-gray-900 dark:text-white">{user?.fullName}</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400 truncate">{user?.email}</p>
                  </div>
                  <hr className="dark:border-gray-700" />
                  <button
                    onClick={handleLogout}
                    className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center"
                  >
                    <LogOut className="mr-2 h-4 w-4" />
                    Sign out
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Mobile menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden bg-white dark:bg-slate-800 shadow-sm">
          <div className="px-2 pt-2 pb-3 space-y-1">
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
                  } group flex items-center w-full px-2 py-2 text-base font-medium rounded-md`}
              >
                <div className="mr-3">{tab.icon}</div>
                {tab.name}
              </button>
            ))}
          </div>
          <div className="pt-4 pb-3 border-t border-gray-200 dark:border-gray-700">
            <div className="flex items-center px-4">
              <div className="flex-shrink-0">
                <div className="h-10 w-10 rounded-full bg-blue-600 flex items-center justify-center text-white">
                  {user?.fullName.charAt(0)}
                </div>
              </div>
              <div className="ml-3">
                <div className="text-base font-medium text-gray-800 dark:text-white">{user?.fullName}</div>
                <div className="text-sm font-medium text-gray-500 dark:text-gray-400">{user?.email}</div>
              </div>
              <button
                onClick={toggleTheme}
                className="ml-auto p-1 text-gray-400 hover:text-gray-500 focus:outline-none"
              >
                {theme === 'dark' ? (
                  <Sun className="h-6 w-6" />
                ) : (
                  <Moon className="h-6 w-6" />
                )}
              </button>
            </div>
            <div className="mt-3 px-2">
              <button
                onClick={handleLogout}
                className="w-full flex items-center px-3 py-2 text-base font-medium rounded-md text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
              >
                <LogOut className="mr-3 h-5 w-5" />
                Sign out
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar */}
        <nav className="hidden md:flex md:flex-shrink-0 bg-white dark:bg-slate-800 border-r dark:border-gray-700">
          <div className="w-64 flex flex-col">
            <div className="flex-1 flex flex-col pt-5 pb-4 overflow-y-auto">
              <div className="flex-1 px-2 space-y-1">
                {tabs.map((tab) => (
                  <button
                    key={tab.name}
                    onClick={() => setActiveTab(tab.name)}
                    className={`${activeTab === tab.name
                      ? 'bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-200'
                      : 'text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
                      } group flex items-center w-full px-2 py-2 text-sm font-medium rounded-md`}
                  >
                    <div className="mr-3">{tab.icon}</div>
                    {tab.name}
                    {tab.name === 'Notifications' && notificationCount > 0 && (
                      <span className="ml-auto inline-block py-0.5 px-2 text-xs font-medium rounded-full bg-red-100 text-red-800 dark:bg-red-800 dark:text-red-100">
                        {notificationCount}
                      </span>
                    )}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </nav>

        {/* Content area */}
        <main className="flex-1 overflow-y-auto bg-gray-50 dark:bg-slate-900 p-6">
          {renderContent()}
        </main>
      </div>
    </div>
  );
};

// Placeholder components for the different tabs
const NotificationCenter: React.FC = () => {
  const notifications = [
    { id: 1, title: 'New case submission', message: 'Student John Smith submitted a new case for review', time: '10 minutes ago', isRead: false },
    { id: 2, title: 'Treatment plan approval', message: 'Treatment plan for patient #1234 requires your approval', time: '1 hour ago', isRead: false },
    { id: 3, title: 'Student evaluation reminder', message: 'Monthly student evaluations are due by Friday', time: '3 hours ago', isRead: false },
    { id: 4, title: 'System update', message: 'The system will undergo maintenance tonight at 2 AM', time: '1 day ago', isRead: true },
    { id: 5, title: 'New research publication', message: 'New dental research paper has been published in the library', time: '2 days ago', isRead: true },
  ];

  return (
    <div className="max-w-4xl mx-auto">
      <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Notifications</h2>
      <div className="bg-white dark:bg-slate-800 shadow overflow-hidden rounded-lg">
        <ul className="divide-y divide-gray-200 dark:divide-gray-700">
          {notifications.map((notification) => (
            <li key={notification.id} className={`p-4 hover:bg-gray-50 dark:hover:bg-slate-700 ${!notification.isRead ? 'bg-blue-50 dark:bg-blue-900/20' : ''}`}>
              <div className="flex items-start">
                <div className="flex-shrink-0 pt-0.5">
                  <div className={`h-3 w-3 rounded-full ${!notification.isRead ? 'bg-blue-600' : 'bg-gray-300 dark:bg-gray-600'}`}></div>
                </div>
                <div className="ml-3 flex-1">
                  <p className="text-sm font-medium text-gray-900 dark:text-white">{notification.title}</p>
                  <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">{notification.message}</p>
                  <p className="mt-1 text-xs text-gray-400 dark:text-gray-500">{notification.time}</p>
                </div>
                <button className="ml-2 text-sm text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300">
                  {notification.isRead ? 'Mark unread' : 'Mark read'}
                </button>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

const StudentManagement: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterYear, setFilterYear] = useState('All');
  
  // Mock student data
  const students = [
    { id: 1, name: 'John Smith', year: '3rd Year', university: 'University of Dental Sciences', cases: 12, lastActive: '2 hours ago' },
    { id: 2, name: 'Emily Johnson', year: '4th Year', university: 'University of Dental Sciences', cases: 8, lastActive: '1 day ago' },
    { id: 3, name: 'Michael Brown', year: '3rd Year', university: 'University of Dental Sciences', cases: 15, lastActive: '3 hours ago' },
    { id: 4, name: 'Sarah Davis', year: '5th Year', university: 'University of Dental Sciences', cases: 20, lastActive: 'Just now' },
    { id: 5, name: 'David Wilson', year: '4th Year', university: 'University of Dental Sciences', cases: 10, lastActive: '5 hours ago' },
  ];

  const filteredStudents = students.filter(student => {
    const matchesSearch = student.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterYear === 'All' || student.year === filterYear;
    return matchesSearch && matchesFilter;
  });

  return (
    <div className="max-w-6xl mx-auto">
      <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Student Management</h2>
      
      {/* Search and filters */}
      <div className="mb-6 flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <label htmlFor="search" className="sr-only">Search students</label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg className="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
              </svg>
            </div>
            <input
              id="search"
              name="search"
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md leading-5 bg-white dark:bg-slate-800 placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              placeholder="Search students"
              type="search"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
        <div className="sm:w-48">
          <label htmlFor="year-filter" className="sr-only">Filter by year</label>
          <select
            id="year-filter"
            name="year-filter"
            className="block w-full pl-3 pr-10 py-2 text-base border border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md bg-white dark:bg-slate-800 text-gray-900 dark:text-white"
            value={filterYear}
            onChange={(e) => setFilterYear(e.target.value)}
          >
            <option>All</option>
            <option>3rd Year</option>
            <option>4th Year</option>
            <option>5th Year</option>
          </select>
        </div>
      </div>
      
      {/* Students table */}
      <div className="bg-white dark:bg-slate-800 shadow overflow-hidden rounded-lg">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead className="bg-gray-50 dark:bg-slate-700">
            <tr>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Name</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Year</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Cases</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Last Active</th>
              <th scope="col" className="relative px-6 py-3">
                <span className="sr-only">View</span>
              </th>
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-slate-800 divide-y divide-gray-200 dark:divide-gray-700">
            {filteredStudents.map((student) => (
              <tr key={student.id} className="hover:bg-gray-50 dark:hover:bg-slate-700">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div className="h-10 w-10 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center">
                      <span className="text-blue-600 dark:text-blue-200 font-medium">{student.name.charAt(0)}</span>
                    </div>
                    <div className="ml-4">
                      <div className="text-sm font-medium text-gray-900 dark:text-white">{student.name}</div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">{student.university}</div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900 dark:text-white">{student.year}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900 dark:text-white">{student.cases}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                  {student.lastActive}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <a href="#" className="text-blue-600 dark:text-blue-400 hover:text-blue-900 dark:hover:text-blue-300">View Profile</a>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

const PatientManagement: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('All');
  
  // Mock patient data
  const patients = [
    { id: 'P-1001', name: 'Robert Johnson', age: 45, assignedTo: 'John Smith', status: 'Active', lastVisit: '2023-06-15' },
    { id: 'P-1002', name: 'Maria Garcia', age: 32, assignedTo: 'Emily Johnson', status: 'Completed', lastVisit: '2023-05-22' },
    { id: 'P-1003', name: 'James Wilson', age: 28, assignedTo: 'Michael Brown', status: 'Active', lastVisit: '2023-06-10' },
    { id: 'P-1004', name: 'Patricia Lee', age: 56, assignedTo: 'Sarah Davis', status: 'On Hold', lastVisit: '2023-04-30' },
    { id: 'P-1005', name: 'Thomas Martinez', age: 41, assignedTo: 'David Wilson', status: 'Active', lastVisit: '2023-06-18' },
  ];

  const filteredPatients = patients.filter(patient => {
    const matchesSearch = patient.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          patient.id.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterStatus === 'All' || patient.status === filterStatus;
    return matchesSearch && matchesFilter;
  });

  return (
    <div className="max-w-6xl mx-auto">
      <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Patient Management</h2>
      
      {/* Search and filters */}
      <div className="mb-6 flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <label htmlFor="search" className="sr-only">Search patients</label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg className="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
              </svg>
            </div>
            <input
              id="search"
              name="search"
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md leading-5 bg-white dark:bg-slate-800 placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              placeholder="Search patients by name or ID"
              type="search"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
        <div className="sm:w-48">
          <label htmlFor="status-filter" className="sr-only">Filter by status</label>
          <select
            id="status-filter"
            name="status-filter"
            className="block w-full pl-3 pr-10 py-2 text-base border border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md bg-white dark:bg-slate-800 text-gray-900 dark:text-white"
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
          >
            <option>All</option>
            <option>Active</option>
            <option>Completed</option>
            <option>On Hold</option>
          </select>
        </div>
      </div>
      
      {/* Patients table */}
      <div className="bg-white dark:bg-slate-800 shadow overflow-hidden rounded-lg">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead className="bg-gray-50 dark:bg-slate-700">
            <tr>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Patient ID</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Name</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Age</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Assigned To</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Status</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Last Visit</th>
              <th scope="col" className="relative px-6 py-3">
                <span className="sr-only">View</span>
              </th>
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-slate-800 divide-y divide-gray-200 dark:divide-gray-700">
            {filteredPatients.map((patient) => (
              <tr key={patient.id} className="hover:bg-gray-50 dark:hover:bg-slate-700">
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                  {patient.id}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900 dark:text-white">{patient.name}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900 dark:text-white">{patient.age}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900 dark:text-white">{patient.assignedTo}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                    ${patient.status === 'Active' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' : ''}
                    ${patient.status === 'Completed' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200' : ''}
                    ${patient.status === 'On Hold' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200' : ''}
                  `}>
                    {patient.status}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                  {patient.lastVisit}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <a href="#" className="text-blue-600 dark:text-blue-400 hover:text-blue-900 dark:hover:text-blue-300">View Details</a>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

const ApprovalsCenter: React.FC = () => {
  const [activeApprovalTab, setActiveApprovalTab] = useState<string>('Students');

  const renderApprovalContent = () => {
    switch (activeApprovalTab) {
      case 'Students':
        return <StudentApprovalManagement />;
      case 'Treatments':
        return <TreatmentApprovals />;
      default:
        return <StudentApprovalManagement />;
    }
  };

  return (
    <div className="max-w-6xl mx-auto">
      <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Approvals Center</h2>
      
      <div className="mb-6 border-b border-gray-200 dark:border-gray-700">
        <nav className="-mb-px flex space-x-8" aria-label="Tabs">
          <button
            onClick={() => setActiveApprovalTab('Students')}
            className={`${
              activeApprovalTab === 'Students'
                ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
            } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
          >
            Student Approvals
          </button>
          <button
            onClick={() => setActiveApprovalTab('Treatments')}
            className={`${
              activeApprovalTab === 'Treatments'
                ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
            } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
          >
            Treatment Approvals
          </button>
        </nav>
      </div>
      
      {renderApprovalContent()}
    </div>
  );
};

const ReportsCenter: React.FC = () => {
  // Mock reports data
  const reports = [
    { id: 1, name: 'Student Performance Report', description: 'Overview of student clinical performance metrics', lastGenerated: '2023-06-15' },
    { id: 2, name: 'Patient Treatment Summary', description: 'Summary of all patient treatments and outcomes', lastGenerated: '2023-06-10' },
    { id: 3, name: 'Clinical Procedures Report', description: 'Analysis of clinical procedures performed by students', lastGenerated: '2023-06-05' },
    { id: 4, name: 'Supervisor Evaluation Report', description: 'Feedback and evaluations from supervisors', lastGenerated: '2023-05-28' },
  ];

  return (
    <div className="max-w-6xl mx-auto">
      <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Reports Center</h2>
      
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-2">
        {reports.map((report) => (
          <div key={report.id} className="bg-white dark:bg-slate-800 overflow-hidden shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <h3 className="text-lg leading-6 font-medium text-gray-900 dark:text-white">{report.name}</h3>
              <div className="mt-2 max-w-xl text-sm text-gray-500 dark:text-gray-400">
                <p>{report.description}</p>
              </div>
              <div className="mt-3 text-sm">
                <span className="text-gray-500 dark:text-gray-400">Last generated: {report.lastGenerated}</span>
              </div>
              <div className="mt-5">
                <button type="button" className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
                  Generate Report
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// Treatment Approvals Component
const TreatmentApprovals: React.FC = () => {
  // Mock approval requests
  const approvalRequests = [
    { id: 1, type: 'Treatment Plan', student: 'John Smith', patient: 'Robert Johnson', submittedDate: '2023-06-18', status: 'Pending' },
    { id: 2, type: 'Case Completion', student: 'Emily Johnson', patient: 'Maria Garcia', submittedDate: '2023-06-17', status: 'Pending' },
    { id: 3, type: 'Procedure Request', student: 'Michael Brown', patient: 'James Wilson', submittedDate: '2023-06-16', status: 'Pending' },
    { id: 4, type: 'Treatment Plan', student: 'Sarah Davis', patient: 'Patricia Lee', submittedDate: '2023-06-15', status: 'Pending' },
  ];

  return (
    <div className="bg-white dark:bg-slate-800 shadow overflow-hidden rounded-lg">
      <div className="px-4 py-5 sm:px-6 border-b border-gray-200 dark:border-gray-700">
        <h3 className="text-lg leading-6 font-medium text-gray-900 dark:text-white">Pending Treatment Approvals</h3>
        <p className="mt-1 max-w-2xl text-sm text-gray-500 dark:text-gray-400">Review and approve student treatment submissions</p>
      </div>
      
      <ul className="divide-y divide-gray-200 dark:divide-gray-700">
        {approvalRequests.map((request) => (
          <li key={request.id} className="px-4 py-4 sm:px-6 hover:bg-gray-50 dark:hover:bg-slate-700">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="h-10 w-10 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center">
                    <span className="text-blue-600 dark:text-blue-200 font-medium">{request.type.charAt(0)}</span>
                  </div>
                </div>
                <div className="ml-4">
                  <div className="text-sm font-medium text-gray-900 dark:text-white">{request.type}</div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">
                    <span>Student: {request.student}</span>
                    <span className="mx-2">•</span>
                    <span>Patient: {request.patient}</span>
                  </div>
                  <div className="text-xs text-gray-400 dark:text-gray-500 mt-1">Submitted on {request.submittedDate}</div>
                </div>
              </div>
              <div className="flex space-x-2">
                <button className="inline-flex items-center px-3 py-1 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
                  Review
                </button>
                <button className="inline-flex items-center px-3 py-1 border border-gray-300 dark:border-gray-600 text-sm font-medium rounded-md text-gray-700 dark:text-gray-300 bg-white dark:bg-slate-700 hover:bg-gray-50 dark:hover:bg-slate-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
                  Approve
                </button>
              </div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default DoctorDashboard;