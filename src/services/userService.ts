import { supabase } from '../lib/supabase';
import { Database } from '../types/supabase';

type UserRole = 'Intern/Student' | 'Doctor' | 'Supervisor' | 'Admin';

export interface User {
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

export interface InternshipPeriod {
  id: string;
  userId: string;
  location: string;
  round?: string;
  startDate: string;
  endDate: string;
}

// Convert from database model to frontend model
const mapDbUserToUser = (dbUser: any): User => ({
  id: dbUser.id,
  fullName: dbUser.full_name,
  email: dbUser.email,
  mobile: dbUser.mobile,
  university: dbUser.university,
  role: dbUser.role,
  isApproved: dbUser.is_approved,
  city: dbUser.city,
  registrationStatus: dbUser.registration_status,
  classYear: dbUser.class_year,
  workingDays: dbUser.working_days,
  currentPeriodStartDate: dbUser.current_period_start_date,
  currentPeriodEndDate: dbUser.current_period_end_date
});

// Convert from database model to frontend model for internship periods
const mapDbInternshipToInternship = (dbInternship: any): InternshipPeriod => ({
  id: dbInternship.id,
  userId: dbInternship.user_id,
  location: dbInternship.location,
  round: dbInternship.round,
  startDate: dbInternship.start_date,
  endDate: dbInternship.end_date
});

export const userService = {
  // Get user by ID
  getUserById: async (userId: string): Promise<User | null> => {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) throw error;
      return data ? mapDbUserToUser(data) : null;
    } catch (error) {
      console.error('Error fetching user:', error);
      return null;
    }
  },

  // Update user profile
  updateUserProfile: async (userId: string, userData: Partial<User>): Promise<boolean> => {
    try {
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
        .eq('id', userId);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error updating user profile:', error);
      return false;
    }
  },

  // Get all users (with optional role filter)
  getAllUsers: async (role?: UserRole): Promise<User[]> => {
    try {
      let query = supabase.from('users').select('*');
      
      if (role) {
        query = query.eq('role', role);
      }

      const { data, error } = await query;

      if (error) throw error;
      return data ? data.map(mapDbUserToUser) : [];
    } catch (error) {
      console.error('Error fetching users:', error);
      return [];
    }
  },

  // Get internship periods for a user
  getUserInternshipPeriods: async (userId: string): Promise<InternshipPeriod[]> => {
    try {
      const { data, error } = await supabase
        .from('internship_periods')
        .select('*')
        .eq('user_id', userId)
        .order('start_date', { ascending: false });

      if (error) throw error;
      return data ? data.map(mapDbInternshipToInternship) : [];
    } catch (error) {
      console.error('Error fetching internship periods:', error);
      return [];
    }
  },

  // Add a new internship period
  addInternshipPeriod: async (period: Omit<InternshipPeriod, 'id'>): Promise<InternshipPeriod | null> => {
    try {
      const { data, error } = await supabase
        .from('internship_periods')
        .insert({
          user_id: period.userId,
          location: period.location,
          round: period.round,
          start_date: period.startDate,
          end_date: period.endDate
        })
        .select()
        .single();

      if (error) throw error;
      return data ? mapDbInternshipToInternship(data) : null;
    } catch (error) {
      console.error('Error adding internship period:', error);
      return null;
    }
  },

  // Update an internship period
  updateInternshipPeriod: async (periodId: string, periodData: Partial<InternshipPeriod>): Promise<boolean> => {
    try {
      const dbData: any = {};
      if (periodData.location) dbData.location = periodData.location;
      if (periodData.round) dbData.round = periodData.round;
      if (periodData.startDate) dbData.start_date = periodData.startDate;
      if (periodData.endDate) dbData.end_date = periodData.endDate;

      const { error } = await supabase
        .from('internship_periods')
        .update(dbData)
        .eq('id', periodId);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error updating internship period:', error);
      return false;
    }
  },

  // Delete an internship period
  deleteInternshipPeriod: async (periodId: string): Promise<boolean> => {
    try {
      const { error } = await supabase
        .from('internship_periods')
        .delete()
        .eq('id', periodId);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error deleting internship period:', error);
      return false;
    }
  },

  // Approve a user (admin only)
  approveUser: async (userId: string): Promise<boolean> => {
    try {
      const { error } = await supabase
        .from('users')
        .update({ is_approved: true })
        .eq('id', userId);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error approving user:', error);
      return false;
    }
  },

  // Create a doctor account (pre-approved)
  createDoctorAccount: async (doctorData: {
    email: string;
    password: string;
    fullName: string;
    mobile: string;
    university?: string;
    city?: string;
  }): Promise<{ user: User | null; error: string | null }> => {
    try {
      // 1. Create auth account
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: doctorData.email,
        password: doctorData.password
      });

      if (authError) throw authError;
      if (!authData.user) throw new Error('Failed to create authentication account');

      // 2. Create user profile with Doctor role and pre-approved status
      const { data: userData, error: userError } = await supabase
        .from('users')
        .insert({
          id: authData.user.id,
          email: doctorData.email,
          full_name: doctorData.fullName,
          mobile: doctorData.mobile,
          university: doctorData.university || '',
          city: doctorData.city || '',
          role: 'Doctor',
          is_approved: true // Doctors are pre-approved
        })
        .select()
        .single();

      if (userError) {
        // If user profile creation fails, we should ideally delete the auth account
        // but Supabase doesn't provide a direct API for this
        throw userError;
      }

      return { 
        user: userData ? mapDbUserToUser(userData) : null, 
        error: null 
      };
    } catch (error: any) {
      console.error('Error creating doctor account:', error);
      return { 
        user: null, 
        error: error.message || 'Failed to create doctor account' 
      };
    }
  }
};