import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { supabase } from '../lib/supabase';

type UserRole = 'Intern/Student' | 'Doctor' | 'Admin';

interface User {
  id: string;
  firstName: string;            // Given name from DB (first_name)
  lastName: string;             // Surname from DB (last_name)
  fullName: string;             // Convenience (first + last) for UI components
  email: string;
  phone: string | null;         // Raw phone field from DB
  mobile?: string | null;       // Alias expected by some components (StudentProfile uses mobile)
  university: string | null;
  role: UserRole;
  profileImage?: string | null;
  graduationYear?: number | null;
  specialization?: string | null;
  bio?: string | null;
  // Extra optional fields that some dashboard components assume may exist
  city?: string | null;
  registrationStatus?: string | null;
  classYear?: string | null;
  workingDays?: string | null;
  currentPeriodStartDate?: string | null;
  currentPeriodEndDate?: string | null;
  isApproved?: boolean | null;
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
              fullName: [userData.first_name, userData.last_name].filter(Boolean).join(' ').trim(),
              email: userData.email,
              phone: userData.phone,
              mobile: userData.phone, // alias for components using mobile
              university: userData.university,
              role: userData.role as UserRole,
              profileImage: userData.profile_image,
              graduationYear: userData.graduation_year,
              specialization: userData.specialization,
              bio: userData.bio,
              // Optional fields (will exist if added later to schema)
              city: userData.city ?? null,
              registrationStatus: userData.registration_status ?? null,
              classYear: userData.class_year ?? null,
              workingDays: userData.working_days ?? null,
              currentPeriodStartDate: userData.current_period_start_date ?? null,
              currentPeriodEndDate: userData.current_period_end_date ?? null,
              isApproved: userData.is_approved ?? null
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
                fullName: [userData.first_name, userData.last_name].filter(Boolean).join(' ').trim(),
                email: userData.email,
                phone: userData.phone,
                mobile: userData.phone,
                university: userData.university,
                role: userData.role as UserRole,
                profileImage: userData.profile_image,
                graduationYear: userData.graduation_year,
                specialization: userData.specialization,
                bio: userData.bio,
                city: userData.city ?? null,
                registrationStatus: userData.registration_status ?? null,
                classYear: userData.class_year ?? null,
                workingDays: userData.working_days ?? null,
                currentPeriodStartDate: userData.current_period_start_date ?? null,
                currentPeriodEndDate: userData.current_period_end_date ?? null,
                isApproved: userData.is_approved ?? null
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
            fullName: [userData.first_name, userData.last_name].filter(Boolean).join(' ').trim(),
            email: userData.email,
            phone: userData.phone,
            mobile: userData.phone,
            university: userData.university,
            role: userData.role as UserRole,
            profileImage: userData.profile_image,
            graduationYear: userData.graduation_year,
            specialization: userData.specialization,
            bio: userData.bio,
            city: userData.city ?? null,
            registrationStatus: userData.registration_status ?? null,
            classYear: userData.class_year ?? null,
            workingDays: userData.working_days ?? null,
            currentPeriodStartDate: userData.current_period_start_date ?? null,
            currentPeriodEndDate: userData.current_period_end_date ?? null,
            isApproved: userData.is_approved ?? null
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
        const insertData: Record<string, unknown> = {
          id: authData.user.id,
          email: userData.email,
          first_name: userData.firstName,
          last_name: userData.lastName,
          phone: userData.phone,
          university: userData.university,
          role: userData.role
        };

        // Add optional fields if provided
        if (userData.city) insertData.city = userData.city;
        if (userData.classYear) insertData.class_year = userData.classYear;
        if (userData.workingDays) insertData.working_days = userData.workingDays;
        if (userData.registrationStatus) insertData.registration_status = userData.registrationStatus;
        if (userData.currentPeriodStartDate) insertData.current_period_start_date = userData.currentPeriodStartDate;
        if (userData.currentPeriodEndDate) insertData.current_period_end_date = userData.currentPeriodEndDate;

        const { error: profileError } = await supabase
          .from('users')
          .insert(insertData);

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

      const dbData: Record<string, unknown> = {};

      // Handle fullName: if only fullName is provided, split it into firstName and lastName
      if (userData.fullName && !userData.firstName && !userData.lastName) {
        const parts = userData.fullName.trim().split(/\s+/);
        dbData.first_name = parts[0] || '';
        dbData.last_name = parts.slice(1).join(' ') || '';
      } else {
        // Otherwise use firstName and lastName directly if provided
        if (userData.firstName !== undefined) dbData.first_name = userData.firstName;
        if (userData.lastName !== undefined) dbData.last_name = userData.lastName;
      }

      if (userData.phone !== undefined) dbData.phone = userData.phone;
      if (userData.university !== undefined) dbData.university = userData.university;
      if (userData.profileImage !== undefined) dbData.profile_image = userData.profileImage;
      if (userData.graduationYear !== undefined) dbData.graduation_year = userData.graduationYear;
      if (userData.specialization !== undefined) dbData.specialization = userData.specialization;
      if (userData.bio !== undefined) dbData.bio = userData.bio;
      // Add new student profile fields
      if (userData.city !== undefined) dbData.city = userData.city;
      if (userData.classYear !== undefined) dbData.class_year = userData.classYear;
      if (userData.workingDays !== undefined) dbData.working_days = userData.workingDays;
      if (userData.registrationStatus !== undefined) dbData.registration_status = userData.registrationStatus;
      if (userData.currentPeriodStartDate !== undefined) dbData.current_period_start_date = userData.currentPeriodStartDate;
      if (userData.currentPeriodEndDate !== undefined) dbData.current_period_end_date = userData.currentPeriodEndDate;

      const { error } = await supabase
        .from('users')
        .update(dbData)
        .eq('id', user.id);

      if (error) throw error;

      setUser(prev => {
        if (!prev) return null;
        const updated = { ...prev, ...userData } as User;
        // Recompute fullName if parts changed OR if only fullName passed (split assumption: first token -> firstName, rest -> lastName)
        if (userData.fullName && !userData.firstName && !userData.lastName) {
          const parts = userData.fullName.trim().split(/\s+/);
          updated.firstName = parts[0] || '';
          updated.lastName = parts.slice(1).join(' ') || '';
        }
        if (userData.firstName !== undefined || userData.lastName !== undefined || userData.fullName !== undefined) {
          updated.fullName = [updated.firstName, updated.lastName].filter(Boolean).join(' ').trim();
        }
        // Keep mobile alias in sync with phone
        if (userData.phone !== undefined) {
          updated.mobile = userData.phone;
        }
        return updated;
      });

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
