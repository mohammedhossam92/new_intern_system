import { supabase } from '../lib/supabase';

export interface InternshipPeriod {
  id: string;
  userId: string;
  supervisorId?: string | null;
  location: string;
  round?: string;
  startDate: string; // YYYY-MM-DD
  endDate: string;   // YYYY-MM-DD
  status: 'pending' | 'in_progress' | 'completed' | 'approved';
  hoursCompleted: number;
  totalRequiredHours: number;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

// Convert from database model to frontend model
const mapDbPeriodToPeriod = (dbPeriod: Record<string, unknown>): InternshipPeriod => ({
  id: dbPeriod.id as string,
  userId: dbPeriod.user_id as string,
  supervisorId: dbPeriod.supervisor_id as string | null | undefined,
  location: dbPeriod.location as string,
  round: dbPeriod.round as string | undefined,
  startDate: dbPeriod.start_date as string,
  endDate: dbPeriod.end_date as string,
  status: dbPeriod.status as 'pending' | 'in_progress' | 'completed' | 'approved',
  hoursCompleted: dbPeriod.hours_completed as number,
  totalRequiredHours: dbPeriod.total_required_hours as number,
  notes: dbPeriod.notes as string | undefined,
  createdAt: dbPeriod.created_at as string,
  updatedAt: dbPeriod.updated_at as string
});

export const internshipService = {
  // Get all internship periods for a user
  getUserInternshipPeriods: async (userId: string): Promise<InternshipPeriod[]> => {
    try {
      const { data, error } = await supabase
        .from('internship_periods')
        .select('*')
        .eq('user_id', userId)
        .order('start_date', { ascending: false });

      if (error) throw error;
      return data ? data.map(mapDbPeriodToPeriod) : [];
    } catch (error) {
      console.error('Error fetching internship periods:', error);
      return [];
    }
  },

  // Add a new internship period
  addInternshipPeriod: async (period: {
    userId: string;
    location: string;
    round?: string;
    startDate: string;
    endDate: string;
    status?: 'pending' | 'in_progress' | 'completed' | 'approved';
    hoursCompleted?: number;
    totalRequiredHours?: number;
    notes?: string;
  }): Promise<InternshipPeriod | null> => {
    try {
      const { data, error } = await supabase
        .from('internship_periods')
        .insert({
          user_id: period.userId,
          location: period.location,
          round: period.round,
          start_date: period.startDate,
          end_date: period.endDate,
          status: period.status || 'pending',
          hours_completed: period.hoursCompleted || 0,
          total_required_hours: period.totalRequiredHours || 160,
          notes: period.notes
        })
        .select()
        .single();

      if (error) throw error;
      return data ? mapDbPeriodToPeriod(data) : null;
    } catch (error) {
      console.error('Error adding internship period:', error);
      return null;
    }
  },

  // Update an internship period
  updateInternshipPeriod: async (
    periodId: string,
    updates: Partial<{
      location: string;
      round: string;
      startDate: string;
      endDate: string;
      status: 'pending' | 'in_progress' | 'completed' | 'approved';
      hoursCompleted: number;
      totalRequiredHours: number;
      notes: string;
    }>
  ): Promise<boolean> => {
    try {
      const dbData: Record<string, unknown> = {};
      if (updates.location !== undefined) dbData.location = updates.location;
      if (updates.round !== undefined) dbData.round = updates.round;
      if (updates.startDate !== undefined) dbData.start_date = updates.startDate;
      if (updates.endDate !== undefined) dbData.end_date = updates.endDate;
      if (updates.status !== undefined) dbData.status = updates.status;
      if (updates.hoursCompleted !== undefined) dbData.hours_completed = updates.hoursCompleted;
      if (updates.totalRequiredHours !== undefined) dbData.total_required_hours = updates.totalRequiredHours;
      if (updates.notes !== undefined) dbData.notes = updates.notes;

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

  // Subscribe to real-time changes for a user's internship periods
  subscribeToInternshipPeriods: (
    userId: string,
    callback: (periods: InternshipPeriod[]) => void
  ) => {
    const channel = supabase
      .channel(`internship_periods:${userId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'internship_periods',
          filter: `user_id=eq.${userId}`
        },
        async () => {
          // Refetch all periods when any change occurs
          const periods = await internshipService.getUserInternshipPeriods(userId);
          callback(periods);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }
};
