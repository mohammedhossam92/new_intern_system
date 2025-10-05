import React, { useEffect, useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import QuickActions from './QuickActions';
import RecentActivity from './RecentActivity';
import { User, Mail, Phone, GraduationCap, Calendar, MapPin, Edit2, Save, X, Building, Clock, CheckCircle, Plus } from 'lucide-react';

interface InternshipPeriod {
  id: number;
  location: string;
  round?: string;
  startDate: string; // YYYY-MM-DD
  endDate: string;   // YYYY-MM-DD
}

const StudentProfile: React.FC = () => {
  const { user } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [hasBeenSaved, setHasBeenSaved] = useState(false); // Track if profile has been saved before
  const [formData, setFormData] = useState({
    fullName: user?.fullName || '',
    email: user?.email || '',
    mobile: user?.mobile || '',
    university: user?.university || '',
    city: user?.city || '',
    registrationStatus: user?.registrationStatus || 'Active',
    classYear: user?.classYear || '',
    workingDays: user?.workingDays || '',
    currentPeriodStartDate: user?.currentPeriodStartDate || '',
    currentPeriodEndDate: user?.currentPeriodEndDate || '',
  });

  // Mock admin role check - in real app this would come from auth context
  const isAdmin = user?.role === 'admin' || false;

  // Internship periods state (status derived from dates)
  const [internshipPeriods, setInternshipPeriods] = useState<InternshipPeriod[]>([
    {
      id: 1,
      location: 'City General Hospital',
      round: '1st Round',
      startDate: '2024-01-15',
      endDate: '2024-03-15',
    },
    {
      id: 2,
      location: 'Metropolitan Dental Center',
      round: '2nd Round',
      startDate: '2024-03-16',
      endDate: '2024-05-15',
    },
    {
      id: 3,
      location: 'University Dental Clinic',
      round: '3rd Round',
      startDate: '2024-05-16',
      endDate: '2024-07-15',
    }
  ]);

  const computeStatus = (period: Pick<InternshipPeriod, 'startDate' | 'endDate'>) => {
    const today = new Date();
    const end = new Date(period.endDate);
    return today > end ? 'Completed' : 'In Progress';
  };

  // Admin-only: show add internship inline form
  const [showAddPeriod, setShowAddPeriod] = useState(false);
  const [newPeriod, setNewPeriod] = useState<{ location: string; round?: string; startDate: string; endDate: string }>({
    location: '',
    round: '',
    startDate: '',
    endDate: '',
  });

  const resetNewPeriod = () => setNewPeriod({ location: '', round: '', startDate: '', endDate: '' });

  const handleAddPeriod = () => {
    if (!isAdmin) return;
    if (!newPeriod.location || !newPeriod.startDate || !newPeriod.endDate) return;

    const periodToAdd: InternshipPeriod = {
      id: Date.now(),
      location: newPeriod.location,
      round: newPeriod.round || undefined,
      startDate: newPeriod.startDate,
      endDate: newPeriod.endDate,
    };

    setInternshipPeriods(prev => [periodToAdd, ...prev]);
    // Also update current period on profile
    setFormData(prev => ({
      ...prev,
      currentPeriodStartDate: newPeriod.startDate,
      currentPeriodEndDate: newPeriod.endDate,
    }));

    resetNewPeriod();
    setShowAddPeriod(false);
  };

  // Auto-sync: when profile current period dates change, ensure a matching history item exists
  useEffect(() => {
    const { currentPeriodStartDate, currentPeriodEndDate } = formData;
    if (!currentPeriodStartDate || !currentPeriodEndDate) return;

    const exists = internshipPeriods.some(p => p.startDate === currentPeriodStartDate && p.endDate === currentPeriodEndDate);
    if (!exists) {
      // Insert a placeholder entry if none exists yet (admin can refine via Add form)
      const placeholder: InternshipPeriod = {
        id: Date.now(),
        location: 'Not specified',
        startDate: currentPeriodStartDate,
        endDate: currentPeriodEndDate,
      };
      setInternshipPeriods(prev => [placeholder, ...prev]);
    }
  }, [formData.currentPeriodStartDate, formData.currentPeriodEndDate]);

  const handleSave = () => {
    // In a real app, this would update the user data via API
    console.log('Saving profile data:', formData);
    setHasBeenSaved(true);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setFormData({
      fullName: user?.fullName || '',
      email: user?.email || '',
      mobile: user?.mobile || '',
      university: user?.university || '',
      city: user?.city || '',
      registrationStatus: user?.registrationStatus || 'Active',
      classYear: user?.classYear || '',
      workingDays: user?.workingDays || '',
      currentPeriodStartDate: user?.currentPeriodStartDate || '',
      currentPeriodEndDate: user?.currentPeriodEndDate || '',
    });
    setIsEditing(false);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const handleQuickAction = (action: string) => {
    // In a real app, this would navigate to the appropriate section
    console.log('Quick action clicked:', action);
  };

  // Check if a field should be disabled
  const isFieldDisabled = (fieldName: string) => {
    if (fieldName === 'registrationStatus') return true; // Always disabled
    if (fieldName === 'classYear' && hasBeenSaved && !isAdmin) return true; // Disabled after first save unless admin
    if (fieldName === 'currentPeriodStartDate' && hasBeenSaved && !isAdmin) return true; // Disabled after first save unless admin
    if (fieldName === 'currentPeriodEndDate' && hasBeenSaved && !isAdmin) return true; // Disabled after first save unless admin
    return false;
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Quick Actions */}
      <QuickActions onActionClick={handleQuickAction} />

      {/* Profile Header */}
      <div className="bg-gradient-to-br from-white to-slate-50 dark:from-slate-800 dark:to-slate-900 rounded-3xl shadow-xl border border-slate-200/50 dark:border-slate-700/50 p-8 backdrop-blur-sm">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <div>
            <h2 className="text-3xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 dark:from-white dark:to-slate-200 bg-clip-text text-transparent">
              Student Profile
            </h2>
            <p className="text-slate-600 dark:text-slate-400 mt-1">Manage your academic and internship information</p>
          </div>
          {!isEditing ? (
            <button
              onClick={() => setIsEditing(true)}
              className="flex items-center gap-2 px-6 py-3 text-sm font-semibold text-blue-600 hover:text-blue-700 bg-blue-50 hover:bg-blue-100 dark:bg-blue-900/20 dark:hover:bg-blue-900/30 dark:text-blue-400 dark:hover:text-blue-300 rounded-xl transition-all duration-200 shadow-sm hover:shadow-md"
            >
              <Edit2 className="h-4 w-4" />
              Edit Profile
            </button>
          ) : (
            <div className="flex items-center gap-3">
              <button
                onClick={handleSave}
                className="flex items-center gap-2 px-6 py-3 text-sm font-semibold text-white bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105"
              >
                <Save className="h-4 w-4" />
                Save Changes
              </button>
              <button
                onClick={handleCancel}
                className="flex items-center gap-2 px-6 py-3 text-sm font-semibold text-slate-600 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200 bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 dark:hover:bg-slate-600 rounded-xl transition-all duration-200"
              >
                <X className="h-4 w-4" />
                Cancel
              </button>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Full Name */}
          <div className="group">
            <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-3 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
              Full Name
            </label>
            {isEditing ? (
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <User className="h-5 w-5 text-slate-400 group-hover:text-blue-500 transition-colors" />
                </div>
                <input
                  type="text"
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleChange}
                  className="block w-full pl-12 pr-4 py-4 border-2 border-slate-200 dark:border-slate-600 rounded-xl focus:outline-none focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 transition-all duration-200 hover:border-slate-300 dark:hover:border-slate-500"
                />
              </div>
            ) : (
              <div className="flex items-center gap-4 p-4 bg-gradient-to-r from-slate-50 to-slate-100 dark:from-slate-700 dark:to-slate-800 rounded-xl border border-slate-200/50 dark:border-slate-600/50 shadow-sm">
                <div className="flex items-center justify-center w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                  <User className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                </div>
                <span className="font-medium text-slate-900 dark:text-slate-100">{user?.fullName}</span>
              </div>
            )}
          </div>

          {/* Email */}
          <div className="group">
            <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-3 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
              Email Address
            </label>
            {isEditing ? (
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-slate-400 group-hover:text-blue-500 transition-colors" />
                </div>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="block w-full pl-12 pr-4 py-4 border-2 border-slate-200 dark:border-slate-600 rounded-xl focus:outline-none focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 transition-all duration-200 hover:border-slate-300 dark:hover:border-slate-500"
                />
              </div>
            ) : (
              <div className="flex items-center gap-4 p-4 bg-gradient-to-r from-slate-50 to-slate-100 dark:from-slate-700 dark:to-slate-800 rounded-xl border border-slate-200/50 dark:border-slate-600/50 shadow-sm">
                <div className="flex items-center justify-center w-10 h-10 bg-green-100 dark:bg-green-900/30 rounded-lg">
                  <Mail className="h-5 w-5 text-green-600 dark:text-green-400" />
                </div>
                <span className="font-medium text-slate-900 dark:text-slate-100">{user?.email}</span>
              </div>
            )}
          </div>

          {/* Mobile */}
          <div className="group">
            <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-3 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
              Mobile Number
            </label>
            {isEditing ? (
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Phone className="h-5 w-5 text-slate-400 group-hover:text-blue-500 transition-colors" />
                </div>
                <input
                  type="tel"
                  name="mobile"
                  value={formData.mobile}
                  onChange={handleChange}
                  className="block w-full pl-12 pr-4 py-4 border-2 border-slate-200 dark:border-slate-600 rounded-xl focus:outline-none focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 transition-all duration-200 hover:border-slate-300 dark:hover:border-slate-500"
                />
              </div>
            ) : (
              <div className="flex items-center gap-4 p-4 bg-gradient-to-r from-slate-50 to-slate-100 dark:from-slate-700 dark:to-slate-800 rounded-xl border border-slate-200/50 dark:border-slate-600/50 shadow-sm">
                <div className="flex items-center justify-center w-10 h-10 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                  <Phone className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                </div>
                <span className="font-medium text-slate-900 dark:text-slate-100">{user?.mobile}</span>
              </div>
            )}
          </div>

          {/* University */}
          <div className="group">
            <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-3 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
              University
            </label>
            {isEditing ? (
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <GraduationCap className="h-5 w-5 text-slate-400 group-hover:text-blue-500 transition-colors" />
                </div>
                <input
                  type="text"
                  name="university"
                  value={formData.university}
                  onChange={handleChange}
                  className="block w-full pl-12 pr-4 py-4 border-2 border-slate-200 dark:border-slate-600 rounded-xl focus:outline-none focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 transition-all duration-200 hover:border-slate-300 dark:hover:border-slate-500"
                />
              </div>
            ) : (
              <div className="flex items-center gap-4 p-4 bg-gradient-to-r from-slate-50 to-slate-100 dark:from-slate-700 dark:to-slate-800 rounded-xl border border-slate-200/50 dark:border-slate-600/50 shadow-sm">
                <div className="flex items-center justify-center w-10 h-10 bg-amber-100 dark:bg-amber-900/30 rounded-lg">
                  <GraduationCap className="h-5 w-5 text-amber-600 dark:text-amber-400" />
                </div>
                <span className="font-medium text-slate-900 dark:text-slate-100">{user?.university}</span>
              </div>
            )}
          </div>

          {/* City */}
          <div className="group">
            <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-3 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
              City
            </label>
            {isEditing ? (
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Building className="h-5 w-5 text-slate-400 group-hover:text-blue-500 transition-colors" />
                </div>
                <input
                  type="text"
                  name="city"
                  value={formData.city}
                  onChange={handleChange}
                  className="block w-full pl-12 pr-4 py-4 border-2 border-slate-200 dark:border-slate-600 rounded-xl focus:outline-none focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 transition-all duration-200 hover:border-slate-300 dark:hover:border-slate-500"
                />
              </div>
            ) : (
              <div className="flex items-center gap-4 p-4 bg-gradient-to-r from-slate-50 to-slate-100 dark:from-slate-700 dark:to-slate-800 rounded-xl border border-slate-200/50 dark:border-slate-600/50 shadow-sm">
                <div className="flex items-center justify-center w-10 h-10 bg-indigo-100 dark:bg-indigo-900/30 rounded-lg">
                  <Building className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
                </div>
                <span className="font-medium text-slate-900 dark:text-slate-100">{formData.city || 'Not specified'}</span>
              </div>
            )}
          </div>

          {/* Registration Status */}
          <div className="group">
            <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-3 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
              Registration Status
            </label>
            {isEditing ? (
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <CheckCircle className="h-5 w-5 text-slate-400 group-hover:text-blue-500 transition-colors" />
                </div>
                <select
                  name="registrationStatus"
                  value={formData.registrationStatus}
                  onChange={handleChange}
                  disabled={isFieldDisabled('registrationStatus')}
                  className={`block w-full pl-12 pr-4 py-4 border-2 border-slate-200 dark:border-slate-600 rounded-xl focus:outline-none focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 transition-all duration-200 hover:border-slate-300 dark:hover:border-slate-500 ${
                    isFieldDisabled('registrationStatus') ? 'opacity-50 cursor-not-allowed bg-slate-100 dark:bg-slate-800' : ''
                  }`}
                >
                  <option value="Active">Active</option>
                  <option value="Inactive">Inactive</option>
                  <option value="Suspended">Suspended</option>
                  <option value="Graduated">Graduated</option>
                </select>
              </div>
            ) : (
              <div className="flex items-center gap-4 p-4 bg-gradient-to-r from-slate-50 to-slate-100 dark:from-slate-700 dark:to-slate-800 rounded-xl border border-slate-200/50 dark:border-slate-600/50 shadow-sm">
                <div className="flex items-center justify-center w-10 h-10 bg-emerald-100 dark:bg-emerald-900/30 rounded-lg">
                  <CheckCircle className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                </div>
                <span className="font-medium text-slate-900 dark:text-slate-100">{formData.registrationStatus}</span>
              </div>
            )}
          </div>

          {/* Class Year */}
          <div className="group">
            <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-3 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
              Class Year
              {hasBeenSaved && !isAdmin && (
                <span className="text-xs text-slate-500 ml-2">(Admin only)</span>
              )}
            </label>
            {isEditing ? (
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <GraduationCap className="h-5 w-5 text-slate-400 group-hover:text-blue-500 transition-colors" />
                </div>
                <input
                  type="text"
                  name="classYear"
                  value={formData.classYear}
                  onChange={handleChange}
                  disabled={isFieldDisabled('classYear')}
                  className={`block w-full pl-12 pr-4 py-4 border-2 border-slate-200 dark:border-slate-600 rounded-xl focus:outline-none focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 transition-all duration-200 hover:border-slate-300 dark:hover:border-slate-500 ${
                    isFieldDisabled('classYear') ? 'opacity-50 cursor-not-allowed bg-slate-100 dark:bg-slate-800' : ''
                  }`}
                  placeholder="e.g., 2024, 5th Year"
                />
              </div>
            ) : (
              <div className="flex items-center gap-4 p-4 bg-gradient-to-r from-slate-50 to-slate-100 dark:from-slate-700 dark:to-slate-800 rounded-xl border border-slate-200/50 dark:border-slate-600/50 shadow-sm">
                <div className="flex items-center justify-center w-10 h-10 bg-amber-100 dark:bg-amber-900/30 rounded-lg">
                  <GraduationCap className="h-5 w-5 text-amber-600 dark:text-amber-400" />
                </div>
                <span className="font-medium text-slate-900 dark:text-slate-100">{formData.classYear || 'Not specified'}</span>
              </div>
            )}
          </div>

          {/* Working Days */}
          <div className="group">
            <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-3 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
              Working Days
            </label>
            {isEditing ? (
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Clock className="h-5 w-5 text-slate-400 group-hover:text-blue-500 transition-colors" />
                </div>
                <input
                  type="text"
                  name="workingDays"
                  value={formData.workingDays}
                  onChange={handleChange}
                  className="block w-full pl-12 pr-4 py-4 border-2 border-slate-200 dark:border-slate-600 rounded-xl focus:outline-none focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 transition-all duration-200 hover:border-slate-300 dark:hover:border-slate-500"
                  placeholder="e.g., Monday-Friday, 9 AM-5 PM"
                />
              </div>
            ) : (
              <div className="flex items-center gap-4 p-4 bg-gradient-to-r from-slate-50 to-slate-100 dark:from-slate-700 dark:to-slate-800 rounded-xl border border-slate-200/50 dark:border-slate-600/50 shadow-sm">
                <div className="flex items-center justify-center w-10 h-10 bg-cyan-100 dark:bg-cyan-900/30 rounded-lg">
                  <Clock className="h-5 w-5 text-cyan-600 dark:text-cyan-400" />
                </div>
                <span className="font-medium text-slate-900 dark:text-slate-100">{formData.workingDays || 'Not specified'}</span>
              </div>
            )}
          </div>

          {/* Current Period Start Date */}
          <div className="group">
            <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-3 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
              Current Period Start Date
              {hasBeenSaved && !isAdmin && (
                <span className="text-xs text-slate-500 ml-2">(Admin only)</span>
              )}
            </label>
            {isEditing ? (
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Calendar className="h-5 w-5 text-slate-400 group-hover:text-blue-500 transition-colors" />
                </div>
                <input
                  type="date"
                  name="currentPeriodStartDate"
                  value={formData.currentPeriodStartDate}
                  onChange={handleChange}
                  disabled={isFieldDisabled('currentPeriodStartDate')}
                  className={`block w-full pl-12 pr-4 py-4 border-2 border-slate-200 dark:border-slate-600 rounded-xl focus:outline-none focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 transition-all duration-200 hover:border-slate-300 dark:hover:border-slate-500 ${
                    isFieldDisabled('currentPeriodStartDate') ? 'opacity-50 cursor-not-allowed bg-slate-100 dark:bg-slate-800' : ''
                  }`}
                />
              </div>
            ) : (
              <div className="flex items-center gap-4 p-4 bg-gradient-to-r from-slate-50 to-slate-100 dark:from-slate-700 dark:to-slate-800 rounded-xl border border-slate-200/50 dark:border-slate-600/50 shadow-sm">
                <div className="flex items-center justify-center w-10 h-10 bg-rose-100 dark:bg-rose-900/30 rounded-lg">
                  <Calendar className="h-5 w-5 text-rose-600 dark:text-rose-400" />
                </div>
                <span className="font-medium text-slate-900 dark:text-slate-100">
                  {formData.currentPeriodStartDate ? new Date(formData.currentPeriodStartDate).toLocaleDateString() : 'Not specified'}
                </span>
              </div>
            )}
          </div>

          {/* Current Period End Date */}
          <div className="group">
            <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-3 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
              Current Period End Date
              {hasBeenSaved && !isAdmin && (
                <span className="text-xs text-slate-500 ml-2">(Admin only)</span>
              )}
            </label>
            {isEditing ? (
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Calendar className="h-5 w-5 text-slate-400 group-hover:text-blue-500 transition-colors" />
                </div>
                <input
                  type="date"
                  name="currentPeriodEndDate"
                  value={formData.currentPeriodEndDate}
                  onChange={handleChange}
                  disabled={isFieldDisabled('currentPeriodEndDate')}
                  className={`block w-full pl-12 pr-4 py-4 border-2 border-slate-200 dark:border-slate-600 rounded-xl focus:outline-none focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 transition-all duration-200 hover:border-slate-300 dark:hover:border-slate-500 ${
                    isFieldDisabled('currentPeriodEndDate') ? 'opacity-50 cursor-not-allowed bg-slate-100 dark:bg-slate-800' : ''
                  }`}
                />
              </div>
            ) : (
              <div className="flex items-center gap-4 p-4 bg-gradient-to-r from-slate-50 to-slate-100 dark:from-slate-700 dark:to-slate-800 rounded-xl border border-slate-200/50 dark:border-slate-600/50 shadow-sm">
                <div className="flex items-center justify-center w-10 h-10 bg-rose-100 dark:bg-rose-900/30 rounded-lg">
                  <Calendar className="h-5 w-5 text-rose-600 dark:text-rose-400" />
                </div>
                <span className="font-medium text-slate-900 dark:text-slate-100">
                  {formData.currentPeriodEndDate ? new Date(formData.currentPeriodEndDate).toLocaleDateString() : 'Not specified'}
                </span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Internship Periods */}
      <div className="bg-gradient-to-br from-white to-slate-50 dark:from-slate-800 dark:to-slate-900 rounded-3xl shadow-xl border border-slate-200/50 dark:border-slate-700/50 p-8 backdrop-blur-sm">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <div>
            <h3 className="text-2xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 dark:from-white dark:to-slate-200 bg-clip-text text-transparent">
              Internship History
            </h3>
            <p className="text-slate-600 dark:text-slate-400 mt-1">Track your clinical rotations and training periods</p>
          </div>
          {isAdmin && (
            <button
              onClick={() => setShowAddPeriod(v => !v)}
              className="flex items-center gap-2 px-6 py-3 text-sm font-semibold text-white bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105"
            >
              <Plus className="h-4 w-4" />
              {showAddPeriod ? 'Close Form' : 'Add Internship'}
            </button>
          )}
        </div>

        {isAdmin && showAddPeriod && (
          <div className="border-2 border-slate-200 dark:border-slate-600 rounded-2xl p-6 mb-8 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 backdrop-blur-sm">
            <h4 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-4">Add New Internship Period</h4>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Location<span className="text-red-500 ml-1">*</span></label>
                <input
                  type="text"
                  value={newPeriod.location}
                  onChange={e => setNewPeriod(p => ({ ...p, location: e.target.value }))}
                  className="block w-full px-4 py-3 border-2 border-slate-200 dark:border-slate-600 rounded-xl bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-200"
                  placeholder="Clinic or Hospital"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Round (optional)</label>
                <input
                  type="text"
                  value={newPeriod.round}
                  onChange={e => setNewPeriod(p => ({ ...p, round: e.target.value }))}
                  className="block w-full px-4 py-3 border-2 border-slate-200 dark:border-slate-600 rounded-xl bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-200"
                  placeholder="e.g., 4th Round"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Start Date<span className="text-red-500 ml-1">*</span></label>
                <input
                  type="date"
                  value={newPeriod.startDate}
                  onChange={e => setNewPeriod(p => ({ ...p, startDate: e.target.value }))}
                  className="block w-full px-4 py-3 border-2 border-slate-200 dark:border-slate-600 rounded-xl bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-200"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">End Date<span className="text-red-500 ml-1">*</span></label>
                <input
                  type="date"
                  value={newPeriod.endDate}
                  onChange={e => setNewPeriod(p => ({ ...p, endDate: e.target.value }))}
                  className="block w-full px-4 py-3 border-2 border-slate-200 dark:border-slate-600 rounded-xl bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-200"
                />
              </div>
            </div>
            <div className="mt-6 flex items-center gap-3">
              <button
                onClick={handleAddPeriod}
                disabled={!newPeriod.location || !newPeriod.startDate || !newPeriod.endDate}
                className={`px-6 py-3 rounded-xl text-sm font-semibold text-white transition-all duration-200 ${
                  (!newPeriod.location || !newPeriod.startDate || !newPeriod.endDate)
                    ? 'bg-slate-400 cursor-not-allowed'
                    : 'bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 shadow-lg hover:shadow-xl transform hover:scale-105'
                }`}
              >
                Save Period
              </button>
              <button
                onClick={() => { resetNewPeriod(); setShowAddPeriod(false); }}
                className="px-6 py-3 rounded-xl text-sm font-semibold text-slate-600 hover:text-slate-800 dark:text-slate-300 dark:hover:text-slate-200 bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 dark:hover:bg-slate-600 transition-all duration-200"
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        <div className="space-y-4">
          {internshipPeriods.map((period) => (
            <div
              key={period.id}
              className="border-2 border-slate-200/50 dark:border-slate-600/50 rounded-2xl p-6 hover:shadow-lg transition-all duration-300 bg-gradient-to-r from-slate-50 to-slate-100 dark:from-slate-700 dark:to-slate-800 hover:from-slate-100 hover:to-slate-200 dark:hover:from-slate-600 dark:hover:to-slate-700 transform hover:scale-[1.02]"
            >
              <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6">
                <div className="flex-1">
                  <div className="flex items-center gap-4 mb-3">
                    <div className="flex items-center justify-center w-12 h-12 bg-gradient-to-br from-blue-100 to-blue-200 dark:from-blue-900/40 dark:to-blue-800/40 rounded-xl shadow-sm">
                      <MapPin className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                    </div>
                    <h4 className="text-lg font-semibold text-slate-900 dark:text-slate-100">{period.location}</h4>
                  </div>
                  {period.round && (
                    <p className="text-slate-600 dark:text-slate-400 ml-16 mb-3">
                      <span className="font-semibold text-slate-700 dark:text-slate-300">Round:</span> {period.round}
                    </p>
                  )}
                  <div className="flex items-center gap-3 text-slate-600 dark:text-slate-400 ml-16">
                    <div className="flex items-center justify-center w-8 h-8 bg-gradient-to-br from-amber-100 to-amber-200 dark:from-amber-900/40 dark:to-amber-800/40 rounded-lg">
                      <Calendar className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                    </div>
                    <span>
                      <span className="font-semibold text-slate-700 dark:text-slate-300">Period:</span> {period.startDate} - {period.endDate}
                    </span>
                  </div>
                </div>

                <div className="flex flex-col lg:items-end gap-3">
                  <span
                    className={`inline-flex items-center px-4 py-2 rounded-full text-sm font-semibold shadow-sm ${
                      computeStatus(period) === 'Completed'
                        ? 'bg-gradient-to-r from-green-100 to-green-200 text-green-800 dark:from-green-900/40 dark:to-green-800/40 dark:text-green-300'
                        : 'bg-gradient-to-r from-blue-100 to-blue-200 text-blue-800 dark:from-blue-900/40 dark:to-blue-800/40 dark:text-blue-300'
                    }`}
                  >
                    {computeStatus(period)}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Recent Activity */}
      <RecentActivity />
    </div>
  );
};

export default StudentProfile;
