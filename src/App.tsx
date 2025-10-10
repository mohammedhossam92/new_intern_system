import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { ThemeProvider } from './contexts/ThemeContext';
import SignIn from './components/auth/SignIn';
import SignUp from './components/auth/SignUp';
import Dashboard from './components/dashboard/Dashboard';
import PatientProfile from './components/dashboard/PatientProfile';
import DoctorDashboard from './components/dashboard/DoctorDashboard';
import AdminDashboard from './components/dashboard/AdminDashboard';

// Component to handle 404/unknown routes based on auth status
const NotFoundRedirect: React.FC = () => {
  const { user, loading } = useAuth();

  // Show loading state while checking authentication
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/signin" replace />;
  }

  // Redirect authenticated users to their appropriate dashboard
  if (user.role === 'Doctor') {
    return <Navigate to="/doctor-dashboard" replace />;
  } else if (user.role === 'Admin') {
    return <Navigate to="/admin-dashboard" replace />;
  } else {
    return <Navigate to="/dashboard" replace />;
  }
};

// Protected route component that redirects to signin if not authenticated
const ProtectedRoute: React.FC<{ element: React.ReactElement, requiredRole?: string }> = ({ element, requiredRole }) => {
  const { user, loading } = useAuth();

  // Show loading state while checking authentication
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-slate-600 dark:text-slate-400">Loading...</p>
        </div>
      </div>
    );
  }  if (!user) {
    return <Navigate to="/signin" replace />;
  }

  if (requiredRole && user.role !== requiredRole) {
    // Redirect based on role
    if (user.role === 'Doctor') {
      return <Navigate to="/doctor-dashboard" replace />;
    } else if (user.role === 'Admin') {
      return <Navigate to="/admin-dashboard" replace />;
    } else {
      return <Navigate to="/dashboard" replace />;
    }
  }

  return element;
};

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <Router>
          <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
            <Routes>
              <Route path="/signin" element={<SignIn />} />
              <Route path="/signup" element={<SignUp />} />

              {/* Student routes */}
              <Route
                path="/dashboard"
                element={
                  <ProtectedRoute
                    element={<Dashboard />}
                    requiredRole="Intern/Student"
                  />
                }
              />
              <Route
                path="/patient/:patientId"
                element={
                  <ProtectedRoute
                    element={<PatientProfile />}
                  />
                }
              />

              {/* Doctor routes */}
              <Route
                path="/doctor-dashboard"
                element={
                  <ProtectedRoute
                    element={<DoctorDashboard />}
                    requiredRole="Doctor"
                  />
                }
              />

              {/* Admin routes */}
              <Route
                path="/admin-dashboard"
                element={
                  <ProtectedRoute
                    element={<AdminDashboard />}
                    requiredRole="Admin"
                  />
                }
              />

              {/* Default route */}
              <Route path="/" element={<Navigate to="/signin" replace />} />

              {/* Catch-all route for 404 - redirect based on auth status */}
              <Route path="*" element={<NotFoundRedirect />} />
            </Routes>
          </div>
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
