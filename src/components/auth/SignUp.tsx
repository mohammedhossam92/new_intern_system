import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { User, Mail, Phone, GraduationCap, Lock, Eye, EyeOff, CheckCircle, AlertCircle } from 'lucide-react';

type UserRole = 'Intern/Student' | 'Doctor' | 'Admin';

const SignUp: React.FC = () => {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    mobile: '',
    university: '',
    password: '',
    role: 'Intern/Student'
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState('');
  const [validationErrors, setValidationErrors] = useState<{
    fullName?: string;
    mobile?: string;
  }>({});

  const { signup } = useAuth();
  const navigate = useNavigate();

  // Validation functions
  const validateFullName = (name: string): string | undefined => {
    const nameParts = name.trim().split(/\s+/);
    if (nameParts.length < 4) {
      return 'Full name must contain at least 4 names (e.g., First Middle Third Last)';
    }
    return undefined;
  };

  const validateMobile = (mobile: string): string | undefined => {
    const cleanedMobile = mobile.replace(/\s+/g, '');
    if (!/^01\d{9}$/.test(cleanedMobile)) {
      return 'Mobile number must be 11 digits and start with 01';
    }
    return undefined;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    setValidationErrors({});

    // Validate full name
    const fullNameError = validateFullName(formData.fullName);
    if (fullNameError) {
      setValidationErrors(prev => ({ ...prev, fullName: fullNameError }));
      setIsLoading(false);
      return;
    }

    // Validate mobile
    const mobileError = validateMobile(formData.mobile);
    if (mobileError) {
      setValidationErrors(prev => ({ ...prev, mobile: mobileError }));
      setIsLoading(false);
      return;
    }

    try {
      // Split full name into parts
      const nameParts = formData.fullName.trim().split(/\s+/);
      const firstName = nameParts[0];
      const lastName = nameParts.slice(1).join(' '); // Everything after first name

      // Transform form data to match User interface
      const userDataForSignup = {
        firstName,
        lastName,
        fullName: formData.fullName,
        email: formData.email || '', // Use empty string if email is not provided
        phone: formData.mobile, // Map mobile to phone
        mobile: formData.mobile,
        university: formData.university,
        role: formData.role as UserRole,
        password: formData.password,
      };

      const success = await signup(userDataForSignup);
      if (success) {
        setIsSuccess(true);
        setTimeout(() => {
          navigate('/signin');
        }, 3000);
      }
    } catch {
      setError('Registration failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;

    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    // Clear validation error for the field being edited
    if (validationErrors[name as keyof typeof validationErrors]) {
      setValidationErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name as keyof typeof validationErrors];
        return newErrors;
      });
    }
  };

  if (isSuccess) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-blue-50 dark:bg-gradient-to-br dark:from-slate-900 dark:via-slate-950 dark:to-slate-900 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full">
          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl p-8 border border-slate-200 dark:border-slate-700 text-center">
            <div className="mx-auto h-16 w-16 bg-gradient-to-br from-green-100 to-green-200 dark:from-green-900/40 dark:to-green-800/40 rounded-2xl flex items-center justify-center mb-6 shadow-lg">
              <CheckCircle className="h-8 w-8 text-green-600 dark:text-green-400" />
            </div>
            <h2 className="text-2xl font-bold bg-gradient-to-r from-slate-900 via-green-800 to-slate-700 dark:from-white dark:via-green-200 dark:to-slate-200 bg-clip-text text-transparent mb-4">
              Registration Successful!
            </h2>
            <p className="text-slate-600 dark:text-slate-400 mb-6">
              Your account has been created successfully. Your request will be reviewed by the admin before you can log in.
            </p>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Redirecting to sign in...
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-blue-50 dark:bg-gradient-to-br dark:from-slate-900 dark:via-slate-950 dark:to-slate-900 px-4 sm:px-6 lg:px-8 py-12">
      <div className="max-w-md w-full space-y-8">
        {/* Header */}
        <div className="text-center">
          <div className="relative group mx-auto mb-6">
            <div className="h-16 w-16 bg-gradient-to-br from-blue-600 via-blue-700 to-blue-800 rounded-2xl flex items-center justify-center shadow-xl shadow-blue-500/30 group-hover:shadow-blue-500/50 transition-all duration-300 group-hover:scale-105">
              {/* Modern Tooth Icon */}
              <svg className="h-10 w-10 text-white" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 3C9.8 3 8 4.8 8 7v3c0 1.5-0.5 2.5-1 3.5C6.5 14.5 6 15.5 6 17c0 2.2 1.8 4 4 4 1.1 0 2-0.9 2-2v-3c0-0.6 0.4-1 1-1s1 0.4 1 1v3c0 1.1 0.9 2 2 2 2.2 0 4-1.8 4-4 0-1.5-0.5-2.5-1-3.5-0.5-1-1-2-1-3.5V7c0-2.2-1.8-4-4-4z"/>
              </svg>
            </div>
            <div className="absolute -top-1 -right-1 h-4 w-4 bg-gradient-to-br from-emerald-400 to-emerald-500 rounded-full border-2 border-white dark:border-slate-800 shadow-lg flex items-center justify-center">
              <div className="h-1.5 w-1.5 bg-white rounded-full animate-pulse"></div>
            </div>
            <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-blue-400/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
          </div>
          <h2 className="text-3xl font-bold bg-gradient-to-r from-slate-900 via-blue-800 to-slate-700 dark:from-white dark:via-blue-200 dark:to-slate-200 bg-clip-text text-transparent mb-2">
            Join Our Platform
          </h2>
          <p className="text-slate-600 dark:text-slate-400 font-medium">Create your dental management account</p>
        </div>

        {/* Form */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl p-8 border border-slate-200 dark:border-slate-700">
          {error && (
            <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-lg flex items-center gap-3">
              <AlertCircle className="h-5 w-5 text-red-500 dark:text-red-400 flex-shrink-0" />
              <p className="text-sm text-red-700 dark:text-red-300">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Full Name Field */}
            <div>
              <label htmlFor="fullName" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                Full Name <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <User className="h-5 w-5 text-slate-400 dark:text-slate-500" />
                </div>
                <input
                  id="fullName"
                  name="fullName"
                  type="text"
                  required
                  value={formData.fullName}
                  onChange={handleChange}
                  className={`block w-full pl-10 pr-3 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors dark:bg-slate-900 dark:text-slate-200 placeholder:text-slate-400 dark:placeholder:text-slate-500 ${
                    validationErrors.fullName
                      ? 'border-red-500 dark:border-red-500 focus:border-red-500'
                      : 'border-slate-300 dark:border-slate-700 focus:border-blue-500'
                  }`}
                  placeholder="Enter at least 4 names (e.g., First Middle Third Last)"
                />
              </div>
              {validationErrors.fullName && (
                <p className="mt-2 text-sm text-red-600 dark:text-red-400 flex items-center gap-1">
                  <AlertCircle className="h-4 w-4 flex-shrink-0" />
                  {validationErrors.fullName}
                </p>
              )}
              <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                Must contain at least 4 names separated by spaces
              </p>
            </div>

            {/* Email Field */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                Email Address <span className="text-slate-400 text-xs">(Optional)</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-slate-400 dark:text-slate-500" />
                </div>
                <input
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="block w-full pl-10 pr-3 py-3 border border-slate-300 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors dark:bg-slate-900 dark:text-slate-200 placeholder:text-slate-400 dark:placeholder:text-slate-500"
                  placeholder="Enter your email (optional)"
                />
              </div>
            </div>

            {/* Mobile Number Field */}
            <div>
              <label htmlFor="mobile" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                Mobile Number <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Phone className="h-5 w-5 text-slate-400 dark:text-slate-500" />
                </div>
                <input
                  id="mobile"
                  name="mobile"
                  type="tel"
                  required
                  value={formData.mobile}
                  onChange={handleChange}
                  maxLength={11}
                  className={`block w-full pl-10 pr-3 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors dark:bg-slate-900 dark:text-slate-200 placeholder:text-slate-400 dark:placeholder:text-slate-500 ${
                    validationErrors.mobile
                      ? 'border-red-500 dark:border-red-500 focus:border-red-500'
                      : 'border-slate-300 dark:border-slate-700 focus:border-blue-500'
                  }`}
                  placeholder="01XXXXXXXXX"
                />
              </div>
              {validationErrors.mobile && (
                <p className="mt-2 text-sm text-red-600 dark:text-red-400 flex items-center gap-1">
                  <AlertCircle className="h-4 w-4 flex-shrink-0" />
                  {validationErrors.mobile}
                </p>
              )}
              <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                Must be 11 digits and start with 01 (e.g., 01012345678)
              </p>
            </div>

            {/* University Field */}
            <div>
              <label htmlFor="university" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                University
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <GraduationCap className="h-5 w-5 text-slate-400 dark:text-slate-500" />
                </div>
                <input
                  id="university"
                  name="university"
                  type="text"
                  required
                  value={formData.university}
                  onChange={handleChange}
                  className="block w-full pl-10 pr-3 py-3 border border-slate-300 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors dark:bg-slate-900 dark:text-slate-200 placeholder:text-slate-400 dark:placeholder:text-slate-500"
                  placeholder="Enter your university name"
                />
              </div>
            </div>

            {/* Role Field */}
            <div>
              <label htmlFor="role" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                Role
              </label>
              <select
                id="role"
                name="role"
                value={formData.role}
                onChange={handleChange}
                className="block w-full px-3 py-3 border border-slate-300 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors bg-white dark:bg-slate-900 dark:text-slate-200"
              >
                <option value="Intern/Student">Intern/Student</option>
                <option value="Resident" disabled className="text-slate-400 dark:text-slate-500">
                  Resident (Requires Admin Review)
                </option>
                <option value="Faculty" disabled className="text-slate-400 dark:text-slate-500">
                  Faculty (Requires Admin Review)
                </option>
              </select>
              <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                Other roles require additional verification
              </p>
            </div>

            {/* Password Field */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-slate-400 dark:text-slate-500" />
                </div>
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={formData.password}
                  onChange={handleChange}
                  className="block w-full pl-10 pr-12 py-3 border border-slate-300 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors dark:bg-slate-900 dark:text-slate-200 placeholder:text-slate-400 dark:placeholder:text-slate-500"
                  placeholder="Create a strong password"
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5 text-slate-400 hover:text-slate-600 dark:text-slate-500 dark:hover:text-slate-300" />
                  ) : (
                    <Eye className="h-5 w-5 text-slate-400 hover:text-slate-600 dark:text-slate-500 dark:hover:text-slate-300" />
                  )}
                </button>
              </div>
            </div>

            {/* Sign Up Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 focus:outline-none focus:ring-2 focus:ring-offset-2 dark:focus:ring-offset-slate-800 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105"
            >
              {isLoading ? 'Creating Account...' : 'Sign Up'}
            </button>
          </form>

          {/* Admin Review Notice */}
          <div className="mt-6 p-4 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg">
            <p className="text-sm text-amber-800 dark:text-amber-400 font-medium flex items-center gap-2">
              <AlertCircle className="h-4 w-4 flex-shrink-0" />
              Your request will be reviewed by the admin before you can log in.
            </p>
          </div>

          {/* Sign In Link */}
          <div className="mt-6 text-center">
            <p className="text-sm text-slate-600 dark:text-slate-400">
              Already have an account?{' '}
              <Link
                to="/signin"
                className="font-medium text-blue-600 hover:text-blue-500 dark:text-blue-400 dark:hover:text-blue-300 transition-colors"
              >
                Sign in here
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SignUp;
