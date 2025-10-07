import React, { useState } from 'react';
import { User, Mail, Phone, Calendar, MapPin, FileText, CheckCircle, AlertCircle, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import { notificationService } from '../../services/notificationService';

const AddPatient: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    dateOfBirth: '',
    address: '',
    emergencyContact: '',
    emergencyPhone: '',
    medicalHistory: '',
    allergies: '',
    notes: ''
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));

    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.firstName.trim()) newErrors.firstName = 'First name is required';
    if (!formData.lastName.trim()) newErrors.lastName = 'Last name is required';
    if (!formData.email.trim()) newErrors.email = 'Email is required';
    if (!formData.phone.trim()) newErrors.phone = 'Phone number is required';
    if (!formData.dateOfBirth) newErrors.dateOfBirth = 'Date of birth is required';
    if (!formData.address.trim()) newErrors.address = 'Address is required';

    if (formData.email && !/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    setIsSubmitting(true);

    try {
      if (!user) throw new Error('You must be signed in');

  const { data, error } = await supabase
        .from('patients')
        .insert({
          first_name: formData.firstName.trim(),
          last_name: formData.lastName.trim(),
          email: formData.email.trim(),
          phone: formData.phone.trim(),
          date_of_birth: formData.dateOfBirth,
          address: formData.address.trim(),
          emergency_contact: formData.emergencyContact.trim() || null,
          emergency_phone: formData.emergencyPhone.trim() || null,
          medical_history: formData.medicalHistory.trim() || null,
          allergies: formData.allergies.trim() || null,
          notes: formData.notes.trim() || null,
          status: 'pending',
          added_by: user.id,  // Fixed: changed from created_by to added_by to match DB column
        })
        .select()
        .single();

      if (error) throw error;

      console.log('Patient created:', data);

      // Notify all supervisors and admins about the new patient pending approval
      if (data) {
        const patientName = `${formData.firstName} ${formData.lastName}`;
        const studentName = user.fullName || `${user.firstName} ${user.lastName}`;

        await notificationService.notifyPatientPendingApproval(
          data.id,
          patientName,
          studentName
        );
      }

      setIsSuccess(true);

      // Reset form after success
      setTimeout(() => {
        setFormData({
          firstName: '',
          lastName: '',
          email: '',
          phone: '',
          dateOfBirth: '',
          address: '',
          emergencyContact: '',
          emergencyPhone: '',
          medicalHistory: '',
          allergies: '',
          notes: ''
        });
        setIsSuccess(false);
      }, 3000);
    } catch (error) {
      console.error('Error submitting patient data:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSuccess) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="text-center max-w-md mx-auto">
          <div className="mx-auto h-20 w-20 bg-gradient-to-br from-green-100 to-green-200 dark:from-green-900/40 dark:to-green-800/40 rounded-full flex items-center justify-center mb-6 shadow-lg">
            <CheckCircle className="h-10 w-10 text-green-600 dark:text-green-400" />
          </div>
          <h3 className="text-2xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 dark:from-white dark:to-slate-200 bg-clip-text text-transparent mb-3">
            Patient Added Successfully!
          </h3>
          <p className="text-slate-600 dark:text-slate-400 mb-4 text-lg">
            The patient has been added and is pending approval from the admin.
          </p>
          <p className="text-sm text-slate-500 dark:text-slate-500 mb-6">
            You'll be able to access the patient profile once approved.
          </p>
          <button
            onClick={() => navigate('/dashboard')}
            className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105 font-semibold"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      {/* Header */}
      <div className="bg-gradient-to-br from-white to-slate-50 dark:from-slate-800 dark:to-slate-900 rounded-3xl shadow-xl border border-slate-200/50 dark:border-slate-700/50 p-8 backdrop-blur-sm">
        <div className="flex items-center gap-4 mb-6">
          <button
            onClick={() => navigate('/dashboard')}
            className="flex items-center gap-2 px-4 py-2 text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </button>
          <div className="h-6 w-px bg-slate-300 dark:bg-slate-600" />
          <div>
            <h2 className="text-3xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 dark:from-white dark:to-slate-200 bg-clip-text text-transparent">
              Add New Patient
            </h2>
            <p className="text-slate-600 dark:text-slate-400 mt-1">
              Fill in the patient details below. All patients require admin approval before treatment can begin.
            </p>
          </div>
        </div>
      </div>

      {/* Form */}
      <div className="bg-gradient-to-br from-white to-slate-50 dark:from-slate-800 dark:to-slate-900 rounded-3xl shadow-xl border border-slate-200/50 dark:border-slate-700/50 p-8 backdrop-blur-sm">
        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Personal Information */}
          <div className="group">
            <h3 className="text-xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 dark:from-white dark:to-slate-200 bg-clip-text text-transparent mb-6">
              Personal Information
            </h3>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* First Name */}
              <div className="group">
                <label htmlFor="firstName" className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-3 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                  First Name <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <User className="h-5 w-5 text-slate-400 group-hover:text-blue-500 transition-colors" />
                  </div>
                  <input
                    type="text"
                    id="firstName"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleChange}
                    className={`block w-full pl-12 pr-4 py-4 border-2 rounded-xl focus:outline-none focus:ring-4 transition-all duration-200 ${
                      errors.firstName
                        ? 'border-red-300 focus:border-red-500 focus:ring-red-500/20 dark:border-red-500'
                        : 'border-slate-200 dark:border-slate-600 focus:border-blue-500 focus:ring-blue-500/20 hover:border-slate-300 dark:hover:border-slate-500'
                    } bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500`}
                    placeholder="Enter first name"
                  />
                </div>
                {errors.firstName && (
                  <p className="mt-2 text-sm text-red-600 dark:text-red-400 flex items-center gap-2">
                    <AlertCircle className="h-4 w-4" />
                    {errors.firstName}
                  </p>
                )}
              </div>

              {/* Last Name */}
              <div className="group">
                <label htmlFor="lastName" className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-3 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                  Last Name <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <User className="h-5 w-5 text-slate-400 group-hover:text-blue-500 transition-colors" />
                  </div>
                  <input
                    type="text"
                    id="lastName"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleChange}
                    className={`block w-full pl-12 pr-4 py-4 border-2 rounded-xl focus:outline-none focus:ring-4 transition-all duration-200 ${
                      errors.lastName
                        ? 'border-red-300 focus:border-red-500 focus:ring-red-500/20 dark:border-red-500'
                        : 'border-slate-200 dark:border-slate-600 focus:border-blue-500 focus:ring-blue-500/20 hover:border-slate-300 dark:hover:border-slate-500'
                    } bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500`}
                    placeholder="Enter last name"
                  />
                </div>
                {errors.lastName && (
                  <p className="mt-2 text-sm text-red-600 dark:text-red-400 flex items-center gap-2">
                    <AlertCircle className="h-4 w-4" />
                    {errors.lastName}
                  </p>
                )}
              </div>

              {/* Email */}
              <div className="group">
                <label htmlFor="email" className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-3 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                  Email Address <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Mail className="h-5 w-5 text-slate-400 group-hover:text-blue-500 transition-colors" />
                  </div>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className={`block w-full pl-12 pr-4 py-4 border-2 rounded-xl focus:outline-none focus:ring-4 transition-all duration-200 ${
                      errors.email
                        ? 'border-red-300 focus:border-red-500 focus:ring-red-500/20 dark:border-red-500'
                        : 'border-slate-200 dark:border-slate-600 focus:border-blue-500 focus:ring-blue-500/20 hover:border-slate-300 dark:hover:border-slate-500'
                    } bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500`}
                    placeholder="Enter email address"
                  />
                </div>
                {errors.email && (
                  <p className="mt-2 text-sm text-red-600 dark:text-red-400 flex items-center gap-2">
                    <AlertCircle className="h-4 w-4" />
                    {errors.email}
                  </p>
                )}
              </div>

              {/* Phone */}
              <div className="group">
                <label htmlFor="phone" className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-3 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                  Phone Number <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Phone className="h-5 w-5 text-slate-400 group-hover:text-blue-500 transition-colors" />
                  </div>
                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    className={`block w-full pl-12 pr-4 py-4 border-2 rounded-xl focus:outline-none focus:ring-4 transition-all duration-200 ${
                      errors.phone
                        ? 'border-red-300 focus:border-red-500 focus:ring-red-500/20 dark:border-red-500'
                        : 'border-slate-200 dark:border-slate-600 focus:border-blue-500 focus:ring-blue-500/20 hover:border-slate-300 dark:hover:border-slate-500'
                    } bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500`}
                    placeholder="Enter phone number"
                  />
                </div>
                {errors.phone && (
                  <p className="mt-2 text-sm text-red-600 dark:text-red-400 flex items-center gap-2">
                    <AlertCircle className="h-4 w-4" />
                    {errors.phone}
                  </p>
                )}
              </div>

              {/* DOB */}
              <div className="group">
                <label htmlFor="dateOfBirth" className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-3 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                  Date of Birth <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Calendar className="h-5 w-5 text-slate-400 group-hover:text-blue-500 transition-colors" />
                  </div>
                  <input
                    type="date"
                    id="dateOfBirth"
                    name="dateOfBirth"
                    value={formData.dateOfBirth}
                    onChange={handleChange}
                    className={`block w-full pl-12 pr-4 py-4 border-2 rounded-xl focus:outline-none focus:ring-4 transition-all duration-200 ${
                      errors.dateOfBirth
                        ? 'border-red-300 focus:border-red-500 focus:ring-red-500/20 dark:border-red-500'
                        : 'border-slate-200 dark:border-slate-600 focus:border-blue-500 focus:ring-blue-500/20 hover:border-slate-300 dark:hover:border-slate-500'
                    } bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100`}
                  />
                </div>
                {errors.dateOfBirth && (
                  <p className="mt-2 text-sm text-red-600 dark:text-red-400 flex items-center gap-2">
                    <AlertCircle className="h-4 w-4" />
                    {errors.dateOfBirth}
                  </p>
                )}
              </div>

              {/* Address */}
              <div className="lg:col-span-2 group">
                <label htmlFor="address" className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-3 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                  Address <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <MapPin className="h-5 w-5 text-slate-400 group-hover:text-blue-500 transition-colors" />
                  </div>
                  <input
                    type="text"
                    id="address"
                    name="address"
                    value={formData.address}
                    onChange={handleChange}
                    className={`block w-full pl-12 pr-4 py-4 border-2 rounded-xl focus:outline-none focus:ring-4 transition-all duration-200 ${
                      errors.address
                        ? 'border-red-300 focus:border-red-500 focus:ring-red-500/20 dark:border-red-500'
                        : 'border-slate-200 dark:border-slate-600 focus:border-blue-500 focus:ring-blue-500/20 hover:border-slate-300 dark:hover:border-slate-500'
                    } bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500`}
                    placeholder="Enter full address"
                  />
                </div>
                {errors.address && (
                  <p className="mt-2 text-sm text-red-600 dark:text-red-400 flex items-center gap-2">
                    <AlertCircle className="h-4 w-4" />
                    {errors.address}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Emergency Contact */}
          <div className="group">
            <h3 className="text-xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 dark:from-white dark:to-slate-200 bg-clip-text text-transparent mb-6">
              Emergency Contact
            </h3>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="group">
                <label htmlFor="emergencyContact" className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-3 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                  Emergency Contact Name
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <User className="h-5 w-5 text-slate-400 group-hover:text-blue-500 transition-colors" />
                  </div>
                  <input
                    type="text"
                    id="emergencyContact"
                    name="emergencyContact"
                    value={formData.emergencyContact}
                    onChange={handleChange}
                    className="block w-full pl-12 pr-4 py-4 border-2 border-slate-200 dark:border-slate-600 rounded-xl focus:outline-none focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-200 hover:border-slate-300 dark:hover:border-slate-500 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500"
                    placeholder="Enter emergency contact name"
                  />
                </div>
              </div>

              <div className="group">
                <label htmlFor="emergencyPhone" className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-3 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                  Emergency Contact Phone
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Phone className="h-5 w-5 text-slate-400 group-hover:text-blue-500 transition-colors" />
                  </div>
                  <input
                    type="tel"
                    id="emergencyPhone"
                    name="emergencyPhone"
                    value={formData.emergencyPhone}
                    onChange={handleChange}
                    className="block w-full pl-12 pr-4 py-4 border-2 border-slate-200 dark:border-slate-600 rounded-xl focus:outline-none focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-200 hover:border-slate-300 dark:hover:border-slate-500 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500"
                    placeholder="Enter emergency contact phone"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Medical Information */}
          <div className="group">
            <h3 className="text-xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 dark:from-white dark:to-slate-200 bg-clip-text text-transparent mb-6">
              Medical Information
            </h3>
            <div className="space-y-6">
              <div className="group">
                <label htmlFor="medicalHistory" className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-3 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                  Medical History
                </label>
                <div className="relative">
                  <div className="absolute top-4 left-4 pointer-events-none">
                    <FileText className="h-5 w-5 text-slate-400 group-hover:text-blue-500 transition-colors" />
                  </div>
                  <textarea
                    id="medicalHistory"
                    name="medicalHistory"
                    rows={4}
                    value={formData.medicalHistory}
                    onChange={handleChange}
                    className="block w-full pl-12 pr-4 py-4 border-2 border-slate-200 dark:border-slate-600 rounded-xl focus:outline-none focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-200 hover:border-slate-300 dark:hover:border-slate-500 resize-none bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500"
                    placeholder="Enter any relevant medical history, conditions, medications, etc."
                  />
                </div>
              </div>

              <div className="group">
                <label htmlFor="allergies" className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-3 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                  Allergies
                </label>
                <div className="relative">
                  <div className="absolute top-4 left-4 pointer-events-none">
                    <AlertCircle className="h-5 w-5 text-slate-400 group-hover:text-blue-500 transition-colors" />
                  </div>
                  <textarea
                    id="allergies"
                    name="allergies"
                    rows={3}
                    value={formData.allergies}
                    onChange={handleChange}
                    className="block w-full pl-12 pr-4 py-4 border-2 border-slate-200 dark:border-slate-600 rounded-xl focus:outline-none focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-200 hover:border-slate-300 dark:hover:border-slate-500 resize-none bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500"
                    placeholder="List any known allergies (medications, latex, etc.)"
                  />
                </div>
              </div>

              <div className="group">
                <label htmlFor="notes" className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-3 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                  Additional Notes
                </label>
                <div className="relative">
                  <div className="absolute top-4 left-4 pointer-events-none">
                    <FileText className="h-5 w-5 text-slate-400 group-hover:text-blue-500 transition-colors" />
                  </div>
                  <textarea
                    id="notes"
                    name="notes"
                    rows={3}
                    value={formData.notes}
                    onChange={handleChange}
                    className="block w-full pl-12 pr-4 py-4 border-2 border-slate-200 dark:border-slate-600 rounded-xl focus:outline-none focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-200 hover:border-slate-300 dark:hover:border-slate-500 resize-none bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500"
                    placeholder="Any additional notes or special considerations"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Admin Approval Notice */}
          <div className="bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 border-2 border-amber-200 dark:border-amber-800 rounded-2xl p-6 backdrop-blur-sm">
            <div className="flex items-start gap-4">
              <div className="flex items-center justify-center w-12 h-12 bg-gradient-to-br from-amber-100 to-amber-200 dark:from-amber-900/40 dark:to-amber-800/40 rounded-xl shadow-sm flex-shrink-0">
                <AlertCircle className="h-6 w-6 text-amber-600 dark:text-amber-400" />
              </div>
              <div>
                <h4 className="text-lg font-semibold text-amber-800 dark:text-amber-300 mb-2">Admin Approval Required</h4>
                <p className="text-amber-700 dark:text-amber-400 leading-relaxed">
                  This patient will be added with a "Pending" status and requires admin approval before you can begin treatment or access their full profile.
                </p>
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex justify-end pt-4">
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white rounded-xl focus:outline-none focus:ring-4 focus:ring-blue-500/20 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105 font-semibold text-lg"
            >
              {isSubmitting ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  Adding Patient...
                </>
              ) : (
                <>
                  <User className="h-5 w-5" />
                  Add Patient
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddPatient;
