import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Database } from '../types/supabase';

type UserRole = 'Intern/Student' | 'Doctor' | 'Admin';

interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string | null;
  university: string | null;
  role: UserRole;
  profileImage?: string | null;
  graduationYear?: number | null;
  specialization?: string | null;
  bio?: string | null;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => Promise<void>;
  signup: (userData: Omit<User, 'id'> & { password: string }) => Promise<boolean>;
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
            .maybeSingle();

          if (error) throw error;

          if (userData) {
            setUser({
              id: userData.id,
              firstName: userData.first_name,
              lastName: userData.last_name,
              email: userData.email,
              phone: userData.phone,
              university: userData.university,
              role: userData.role,
              profileImage: userData.profile_image,
              graduationYear: userData.graduation_year,
              specialization: userData.specialization,
              bio: userData.bio
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
      (event, session) => {
        (async () => {
          if (event === 'SIGNED_IN' && session) {
            const { data: userData, error } = await supabase
              .from('users')
              .select('*')
              .eq('id', session.user.id)
              .maybeSingle();

            if (!error && userData) {
              setUser({
                id: userData.id,
                firstName: userData.first_name,
                lastName: userData.last_name,
                email: userData.email,
                phone: userData.phone,
                university: userData.university,
                role: userData.role,
                profileImage: userData.profile_image,
                graduationYear: userData.graduation_year,
                specialization: userData.specialization,
                bio: userData.bio
              });
            }
          } else if (event === 'SIGNED_OUT') {
            setUser(null);
          }
        })();
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
          .maybeSingle();

        if (userError) throw userError;

        if (userData) {
          setUser({
            id: userData.id,
            firstName: userData.first_name,
            lastName: userData.last_name,
            email: userData.email,
            phone: userData.phone,
            university: userData.university,
            role: userData.role,
            profileImage: userData.profile_image,
            graduationYear: userData.graduation_year,
            specialization: userData.specialization,
            bio: userData.bio
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

  const signup = async (userData: Omit<User, 'id'> & { password: string }): Promise<boolean> => {
    try {
      setLoading(true);

      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: userData.email,
        password: userData.password
      });

      if (authError) throw authError;

      if (authData.user) {
        const { error: profileError } = await supabase
          .from('users')
          .insert({
            id: authData.user.id,
            email: userData.email,
            first_name: userData.firstName,
            last_name: userData.lastName,
            phone: userData.phone,
            university: userData.university,
            role: userData.role
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

      const dbData: any = {};
      if (userData.firstName !== undefined) dbData.first_name = userData.firstName;
      if (userData.lastName !== undefined) dbData.last_name = userData.lastName;
      if (userData.phone !== undefined) dbData.phone = userData.phone;
      if (userData.university !== undefined) dbData.university = userData.university;
      if (userData.profileImage !== undefined) dbData.profile_image = userData.profileImage;
      if (userData.graduationYear !== undefined) dbData.graduation_year = userData.graduationYear;
      if (userData.specialization !== undefined) dbData.specialization = userData.specialization;
      if (userData.bio !== undefined) dbData.bio = userData.bio;

      const { error } = await supabase
        .from('users')
        .update(dbData)
        .eq('id', user.id);

      if (error) throw error;

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
