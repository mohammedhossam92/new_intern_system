import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

export interface UserData {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  phoneNumber?: string;
  city?: string;
  classYear?: string;
  workingDays?: string;
  registrationStatus?: string;
  currentPeriodStartDate?: string;
  currentPeriodEndDate?: string;
  createdAt: string;
}

interface UseRealtimeUsersOptions {
  role?: string; // Filter by role (e.g., 'Intern/Student')
  enabled?: boolean; // Enable/disable subscription
}

/**
 * Hook for real-time user data with automatic updates
 * Perfect for doctor/admin dashboards to see student updates in real-time
 */
export function useRealtimeUsers(options: UseRealtimeUsersOptions = {}) {
  const { role, enabled = true } = options;
  const [users, setUsers] = useState<UserData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!enabled) {
      setLoading(false);
      return;
    }

    // Initial load
    const loadUsers = async () => {
      try {
        setLoading(true);
        let query = supabase.from('users').select('*');

        if (role) {
          query = query.eq('role', role);
        }

        const { data, error: loadError } = await query;

        if (loadError) throw loadError;

        const mapped: UserData[] = (data || []).map((u: any) => ({
          id: u.id,
          email: u.email,
          firstName: u.first_name,
          lastName: u.last_name,
          role: u.role,
          phoneNumber: u.phone_number,
          city: u.city,
          classYear: u.class_year,
          workingDays: u.working_days,
          registrationStatus: u.registration_status,
          currentPeriodStartDate: u.current_period_start_date,
          currentPeriodEndDate: u.current_period_end_date,
          createdAt: u.created_at
        }));

        setUsers(mapped);
        setError(null);
      } catch (err) {
        console.error('Error loading users:', err);
        setError(err as Error);
      } finally {
        setLoading(false);
      }
    };

    loadUsers();

    // Set up real-time subscription
    const channel = supabase
      .channel('users-realtime')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'users',
          filter: role ? `role=eq.${role}` : undefined
        },
        (payload) => {
          console.log('User change detected:', payload);

          if (payload.eventType === 'INSERT') {
            const newUser = payload.new as any;
            const mapped: UserData = {
              id: newUser.id,
              email: newUser.email,
              firstName: newUser.first_name,
              lastName: newUser.last_name,
              role: newUser.role,
              phoneNumber: newUser.phone_number,
              city: newUser.city,
              classYear: newUser.class_year,
              workingDays: newUser.working_days,
              registrationStatus: newUser.registration_status,
              currentPeriodStartDate: newUser.current_period_start_date,
              currentPeriodEndDate: newUser.current_period_end_date,
              createdAt: newUser.created_at
            };
            setUsers(prev => [mapped, ...prev]);
          } else if (payload.eventType === 'UPDATE') {
            const updatedUser = payload.new as any;
            setUsers(prev =>
              prev.map(u =>
                u.id === updatedUser.id
                  ? {
                      ...u,
                      email: updatedUser.email,
                      firstName: updatedUser.first_name,
                      lastName: updatedUser.last_name,
                      role: updatedUser.role,
                      phoneNumber: updatedUser.phone_number,
                      city: updatedUser.city,
                      classYear: updatedUser.class_year,
                      workingDays: updatedUser.working_days,
                      registrationStatus: updatedUser.registration_status,
                      currentPeriodStartDate: updatedUser.current_period_start_date,
                      currentPeriodEndDate: updatedUser.current_period_end_date
                    }
                  : u
              )
            );
          } else if (payload.eventType === 'DELETE') {
            const deletedUser = payload.old as any;
            setUsers(prev => prev.filter(u => u.id !== deletedUser.id));
          }
        }
      )
      .subscribe();

    // Cleanup
    return () => {
      supabase.removeChannel(channel);
    };
  }, [role, enabled]);

  return { users, loading, error };
}
