import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Database } from '../types/supabase';

type UserRole = 'Intern/Student' | 'Doctor' | 'Supervisor' | 'Admin';

interface User {
  id: string;
  fullName: string;
  email: string;
  mobile: string;
  university: string;
  role: UserRole;
  isApproved: boolean;
  city?: string;
  registrationStatus?: string;
  classYear?: string;
  workingDays?: string;
  currentPeriodStartDate?: string;
  currentPeriodEndDate?: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => Promise<void>;
  signup: (userData: Omit<User, 'id' | 'isApproved'>) => Promise<boolean>;
  updateProfile: (userData: Partial<User>) => Promise<boolean>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  
  // Check for existing session on mount
  useEffect(() => {
    const checkSession = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        
        if (session) {
          const { data: userData, error } = await supabase
            .from('users')
            .select('*')
            .eq('id', session.user.id)
            .single();
            
          if (error) throw error;
          
          if (userData) {
            setUser({
              id: userData.id,
              fullName: userData.full_name,
              email: userData.email,
              mobile: userData.mobile,
              university: userData.university,
              role: userData.role,
              isApproved: userData.is_approved,
              city: userData.city,
              registrationStatus: userData.registration_status,
              classYear: userData.class_year,
              workingDays: userData.working_days,
              currentPeriodStartDate: userData.current_period_start_date,
              currentPeriodEndDate: userData.current_period_end_date
            });
          }
        }
      } catch (error) {
        console.error('Error checking session:', error);
      } finally {
        setLoading(false);
      }
    };
    
    checkSession();
    
    // Set up auth state change listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (event === 'SIGNED_IN' && session) {
          const { data: userData, error } = await supabase
            .from('users')
            .select('*')
            .eq('id', session.user.id)
            .single();
            
          if (!error && userData) {
            setUser({
              id: userData.id,
              fullName: userData.full_name,
              email: userData.email,
              mobile: userData.mobile,
              university: userData.university,
              role: userData.role,
              isApproved: userData.is_approved,
              city: userData.city,
              registrationStatus: userData.registration_status,
              classYear: userData.class_year,
              workingDays: userData.working_days,
              currentPeriodStartDate: userData.current_period_start_date,
              currentPeriodEndDate: userData.current_period_end_date
            });
          }
        } else if (event === 'SIGNED_OUT') {
          setUser(null);
        }
      }
    );
    
    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      setLoading(true);
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password
      });
      
      if (authError) throw authError;
      
      if (authData.user) {
        const { data: userData, error: userError } = await supabase
          .from('users')
          .select('*')
          .eq('id', authData.user.id)
          .single();
          
        if (userError) throw userError;
        
        if (userData) {
          setUser({
            id: userData.id,
            fullName: userData.full_name,
            email: userData.email,
            mobile: userData.mobile,
            university: userData.university,
            role: userData.role,
            isApproved: userData.is_approved,
            city: userData.city,
            registrationStatus: userData.registration_status,
            classYear: userData.class_year,
            workingDays: userData.working_days,
            currentPeriodStartDate: userData.current_period_start_date,
            currentPeriodEndDate: userData.current_period_end_date
          });
          return true;
        }
      }
      return false;
    } catch (error) {
      console.error('Login error:', error);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      setLoading(true);
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      setUser(null);
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setLoading(false);
    }
  };

  const signup = async (userData: Omit<User, 'id' | 'isApproved'>): Promise<boolean> => {
    try {
      setLoading(true);
      
      // Create auth user
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: userData.email,
        password: 'password', // In a real app, this would be provided by the user
        options: {
          data: {
            full_name: userData.fullName
          }
        }
      });
      
      if (authError) throw authError;
      
      if (authData.user) {
        // Create user profile in the users table
        const { error: profileError } = await supabase
          .from('users')
          .insert({
            id: authData.user.id,
            email: userData.email,
            full_name: userData.fullName,
            mobile: userData.mobile,
            university: userData.university,
            role: userData.role,
            is_approved: false // New users need approval
          });
          
        if (profileError) throw profileError;
        
        return true;
      }
      return false;
    } catch (error) {
      console.error('Signup error:', error);
      return false;
    } finally {
      setLoading(false);
    }
  };
  
  const updateProfile = async (userData: Partial<User>): Promise<boolean> => {
    try {
      if (!user) return false;
      
      setLoading(true);
      
      // Convert from camelCase to snake_case for database
      const dbData: any = {};
      if (userData.fullName) dbData.full_name = userData.fullName;
      if (userData.mobile) dbData.mobile = userData.mobile;
      if (userData.university) dbData.university = userData.university;
      if (userData.city) dbData.city = userData.city;
      if (userData.registrationStatus) dbData.registration_status = userData.registrationStatus;
      if (userData.classYear) dbData.class_year = userData.classYear;
      if (userData.workingDays) dbData.working_days = userData.workingDays;
      if (userData.currentPeriodStartDate) dbData.current_period_start_date = userData.currentPeriodStartDate;
      if (userData.currentPeriodEndDate) dbData.current_period_end_date = userData.currentPeriodEndDate;
      
      const { error } = await supabase
        .from('users')
        .update(dbData)
        .eq('id', user.id);
        
      if (error) throw error;
      
      // Update local user state
      setUser(prev => prev ? { ...prev, ...userData } : null);
      
      return true;
    } catch (error) {
      console.error('Profile update error:', error);
      return false;
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, signup, updateProfile }}>
      {children}
    </AuthContext.Provider>
  );
};
