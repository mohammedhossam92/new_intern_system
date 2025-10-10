import React, { useState } from 'react';
import { User, Phone, Calendar, MapPin, FileText, CheckCircle, AlertCircle, ArrowLeft, Activity } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import { notificationService } from '../../services/notificationService';

// Common medical conditions for dental patients
const MEDICAL_CONDITIONS = [
  'Diabetes',
  'Hypertension (High Blood Pressure)',
  'Heart Disease',
  'Asthma',
  'Bleeding Disorders',
  'Hepatitis',
  'HIV/AIDS',
  'Kidney Disease',
  'Liver Disease',
  'Epilepsy',
  'Thyroid Disorders',
  'Pregnancy',
  'Recent Surgery',
  'Allergies to Anesthesia',
  'Taking Blood Thinners',
  'Other'
];

const AddPatient: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    fullName: '',
    phone: '',
    dateOfBirth: '',
    address: '',
    medicalConditions: [] as string[],
    otherConditions: '',
    allergies: '',
    notes: ''
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [validationErrors, setValidationErrors] = useState<{
    fullName?: string;
    phone?: string;
  }>({});

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));

    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }

    // Clear validation errors
    if (name === 'fullName' && validationErrors.fullName) {
      setValidationErrors(prev => ({ ...prev, fullName: undefined }));
    }
    if (name === 'phone' && validationErrors.phone) {
      setValidationErrors(prev => ({ ...prev, phone: undefined }));
    }
  };

  const handleCheckboxChange = (condition: string) => {
    setFormData(prev => ({
      ...prev,
      medicalConditions: prev.medicalConditions.includes(condition)
        ? prev.medicalConditions.filter(c => c !== condition)
        : [...prev.medicalConditions, condition]
    }));
  };

  // Validation functions
  const validateFullName = (name: string): string | undefined => {
    const nameParts = name.trim().split(/\s+/);
    if (nameParts.length < 4) {
      return 'Full name must contain at least 4 names (e.g., First Middle Third Last)';
    }
    return undefined;
  };

  const validatePhone = (phone: string): string | undefined => {
    const cleanedPhone = phone.replace(/\s+/g, '');
    if (!/^01\d{9}$/.test(cleanedPhone)) {
      return 'Phone number must be 11 digits and start with 01';
    }
    return undefined;
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    const newValidationErrors: { fullName?: string; phone?: string } = {};

    // Validate full name
    if (!formData.fullName.trim()) {
      newErrors.fullName = 'Full name is required';
    } else {
      const fullNameError = validateFullName(formData.fullName);
      if (fullNameError) {
        newValidationErrors.fullName = fullNameError;
      }
    }

    // Validate phone
    if (!formData.phone.trim()) {
      newErrors.phone = 'Phone number is required';
    } else {
      const phoneError = validatePhone(formData.phone);
      if (phoneError) {
        newValidationErrors.phone = phoneError;
      }
    }

    setErrors(newErrors);
    setValidationErrors(newValidationErrors);
    return Object.keys(newErrors).length === 0 && Object.keys(newValidationErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    setIsSubmitting(true);

    try {
      if (!user) throw new Error('You must be signed in');

      // Prepare medical conditions array
      const conditions = [...formData.medicalConditions];
      if (formData.otherConditions.trim()) {
        conditions.push(formData.otherConditions.trim());
      }

      const { data, error } = await supabase
        .from('patients')
        .insert({
          full_name: formData.fullName.trim(),
          phone: formData.phone.replace(/\s+/g, '').trim(),
          date_of_birth: formData.dateOfBirth || null,
          address: formData.address.trim() || null,
          medical_conditions: conditions,
          allergies: formData.allergies.trim() || null,
          notes: formData.notes.trim() || null,
          status: 'pending',
          added_by: user.id,
        })
        .select()
        .single();

      if (error) throw error;

      console.log('Patient created:', data);

      // Notify all supervisors and admins about the new patient pending approval
      if (data) {
        const patientName = formData.fullName;
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
          fullName: '',
          phone: '',
          dateOfBirth: '',
          address: '',
          medicalConditions: [],
          otherConditions: '',
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
      {/* Form */}
      <div className="bg-gradient-to-br from-white to-slate-50 dark:from-slate-800 dark:to-slate-900 rounded-3xl shadow-xl border border-slate-200/50 dark:border-slate-700/50 p-8 backdrop-blur-sm">
        <div className="mb-8">
          <h2 className="text-3xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 dark:from-white dark:to-slate-200 bg-clip-text text-transparent">
            Add New Patient
          </h2>
          <p className="text-slate-600 dark:text-slate-400 mt-2">
            Fill in the patient details below. All patients require admin approval before treatment can begin.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Personal Information */}
          <div className="group">
            <h3 className="text-xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 dark:from-white dark:to-slate-200 bg-clip-text text-transparent mb-6">
              Personal Information
            </h3>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Full Name */}
              <div className="lg:col-span-2 group">
                <label htmlFor="fullName" className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-3 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                  Full Name <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <User className="h-5 w-5 text-slate-400 group-hover:text-blue-500 transition-colors" />
                  </div>
                  <input
                    type="text"
                    id="fullName"
                    name="fullName"
                    value={formData.fullName}
                    onChange={handleChange}
                    className={`block w-full pl-12 pr-4 py-4 border-2 rounded-xl focus:outline-none focus:ring-4 transition-all duration-200 ${
                      errors.fullName || validationErrors.fullName
                        ? 'border-red-300 focus:border-red-500 focus:ring-red-500/20 dark:border-red-500'
                        : 'border-slate-200 dark:border-slate-600 focus:border-blue-500 focus:ring-blue-500/20 hover:border-slate-300 dark:hover:border-slate-500'
                    } bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500`}
                    placeholder="Enter at least 4 names (e.g., Mohamed Ahmed Ali Hassan)"
                  />
                </div>
                {(errors.fullName || validationErrors.fullName) && (
                  <p className="mt-2 text-sm text-red-600 dark:text-red-400 flex items-center gap-2">
                    <AlertCircle className="h-4 w-4" />
                    {errors.fullName || validationErrors.fullName}
                  </p>
                )}
                <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
                  Must contain at least 4 names separated by spaces
                </p>
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
                    maxLength={11}
                    className={`block w-full pl-12 pr-4 py-4 border-2 rounded-xl focus:outline-none focus:ring-4 transition-all duration-200 ${
                      errors.phone || validationErrors.phone
                        ? 'border-red-300 focus:border-red-500 focus:ring-red-500/20 dark:border-red-500'
                        : 'border-slate-200 dark:border-slate-600 focus:border-blue-500 focus:ring-blue-500/20 hover:border-slate-300 dark:hover:border-slate-500'
                    } bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500`}
                    placeholder="01XXXXXXXXX"
                  />
                </div>
                {(errors.phone || validationErrors.phone) && (
                  <p className="mt-2 text-sm text-red-600 dark:text-red-400 flex items-center gap-2">
                    <AlertCircle className="h-4 w-4" />
                    {errors.phone || validationErrors.phone}
                  </p>
                )}
                <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
                  Must be 11 digits and start with 01 (e.g., 01234567890)
                </p>
              </div>

              {/* DOB */}
              <div className="group">
                <label htmlFor="dateOfBirth" className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-3 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                  Date of Birth (Optional)
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
                    className="block w-full pl-12 pr-4 py-4 border-2 border-slate-200 dark:border-slate-600 rounded-xl focus:outline-none focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-200 hover:border-slate-300 dark:hover:border-slate-500 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
                  />
                </div>
              </div>

              {/* Address */}
              <div className="lg:col-span-2 group">
                <label htmlFor="address" className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-3 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                  Address (Optional)
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
                    className="block w-full pl-12 pr-4 py-4 border-2 border-slate-200 dark:border-slate-600 rounded-xl focus:outline-none focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-200 hover:border-slate-300 dark:hover:border-slate-500 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500"
                    placeholder="Enter full address"
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
              {/* Medical Conditions Checkboxes */}
              <div className="group">
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-4 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                  <Activity className="inline h-5 w-5 mr-2" />
                  Medical Conditions
                </label>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  {MEDICAL_CONDITIONS.map((condition) => {
                    const isSelected = formData.medicalConditions.includes(condition);
                    return (
                      <label
                        key={condition}
                        className={`flex items-start p-4 border-2 rounded-lg transition-all duration-200 cursor-pointer group/checkbox ${
                          isSelected
                            ? 'border-yellow-500 bg-yellow-50 dark:bg-yellow-900/20 dark:border-yellow-400 shadow-md'
                            : 'border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 hover:border-yellow-300 dark:hover:border-yellow-500'
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => handleCheckboxChange(condition)}
                          className="mt-1 h-5 w-5 text-yellow-600 border-slate-300 rounded focus:ring-2 focus:ring-yellow-500 focus:ring-offset-0 cursor-pointer accent-yellow-600"
                        />
                        <span className={`ml-3 text-sm font-semibold transition-colors ${
                          isSelected
                            ? 'text-yellow-900 dark:text-yellow-100'
                            : 'text-slate-700 dark:text-slate-300 group-hover/checkbox:text-yellow-600 dark:group-hover/checkbox:text-yellow-400'
                        }`}>
                          {condition}
                        </span>
                      </label>
                    );
                  })}
                </div>
                <p className="mt-3 text-xs text-slate-500 dark:text-slate-400">
                  Select all applicable medical conditions
                </p>
              </div>

              {/* Other Conditions */}
              {formData.medicalConditions.includes('Other') && (
                <div className="group">
                  <label htmlFor="otherConditions" className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-3 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                    Specify Other Conditions
                  </label>
                  <div className="relative">
                    <div className="absolute top-4 left-4 pointer-events-none">
                      <FileText className="h-5 w-5 text-slate-400 group-hover:text-blue-500 transition-colors" />
                    </div>
                    <textarea
                      id="otherConditions"
                      name="otherConditions"
                      rows={3}
                      value={formData.otherConditions}
                      onChange={handleChange}
                      className="block w-full pl-12 pr-4 py-4 border-2 border-slate-200 dark:border-slate-600 rounded-xl focus:outline-none focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-200 hover:border-slate-300 dark:hover:border-slate-500 resize-none bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500"
                      placeholder="Please specify any other medical conditions"
                    />
                  </div>
                </div>
              )}

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
