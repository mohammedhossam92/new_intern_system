import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

export interface PatientData {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  dateOfBirth: string;
  address?: string;
  emergencyContact?: string;
  emergencyPhone?: string;
  medicalHistory?: string;
  allergies?: string;
  notes?: string;
  status: 'pending' | 'approved' | 'rejected';
  addedBy: string;
  createdAt: string;
}

interface UseRealtimePatientsOptions {
  status?: 'pending' | 'approved' | 'rejected';
  addedBy?: string; // Filter by student who added
  enabled?: boolean;
}

/**
 * Hook for real-time patient data with automatic updates
 * Perfect for doctor/admin dashboards to see patient approvals in real-time
 */
export function useRealtimePatients(options: UseRealtimePatientsOptions = {}) {
  const { status, addedBy, enabled = true } = options;
  const [patients, setPatients] = useState<PatientData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  // Count patients by status
  const pendingCount = patients.filter(p => p.status === 'pending').length;
  const approvedCount = patients.filter(p => p.status === 'approved').length;
  const rejectedCount = patients.filter(p => p.status === 'rejected').length;

  useEffect(() => {
    if (!enabled) {
      setLoading(false);
      return;
    }

    // Initial load
    const loadPatients = async () => {
      try {
        setLoading(true);
        let query = supabase.from('patients').select('*');

        if (status) {
          query = query.eq('status', status);
        }
        if (addedBy) {
          query = query.eq('added_by', addedBy);
        }

        const { data, error: loadError } = await query.order('created_at', { ascending: false });

        if (loadError) throw loadError;

        const mapped: PatientData[] = (data || []).map((p: any) => ({
          id: p.id,
          firstName: p.first_name,
          lastName: p.last_name,
          email: p.email,
          phone: p.phone,
          dateOfBirth: p.date_of_birth,
          address: p.address,
          emergencyContact: p.emergency_contact,
          emergencyPhone: p.emergency_phone,
          medicalHistory: p.medical_history,
          allergies: p.allergies,
          notes: p.notes,
          status: p.status,
          addedBy: p.added_by,
          createdAt: p.created_at
        }));

        setPatients(mapped);
        setError(null);
      } catch (err) {
        console.error('Error loading patients:', err);
        setError(err as Error);
      } finally {
        setLoading(false);
      }
    };

    loadPatients();

    // Set up real-time subscription
    const channel = supabase
      .channel('patients-realtime')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'patients'
        },
        (payload) => {
          console.log('Patient change detected:', payload);

          if (payload.eventType === 'INSERT') {
            const newPatient = payload.new as any;

            // Apply filters
            if (status && newPatient.status !== status) return;
            if (addedBy && newPatient.added_by !== addedBy) return;

            const mapped: PatientData = {
              id: newPatient.id,
              firstName: newPatient.first_name,
              lastName: newPatient.last_name,
              email: newPatient.email,
              phone: newPatient.phone,
              dateOfBirth: newPatient.date_of_birth,
              address: newPatient.address,
              emergencyContact: newPatient.emergency_contact,
              emergencyPhone: newPatient.emergency_phone,
              medicalHistory: newPatient.medical_history,
              allergies: newPatient.allergies,
              notes: newPatient.notes,
              status: newPatient.status,
              addedBy: newPatient.added_by,
              createdAt: newPatient.created_at
            };
            setPatients(prev => [mapped, ...prev]);
          } else if (payload.eventType === 'UPDATE') {
            const updatedPatient = payload.new as any;

            setPatients(prev => {
              const updated = prev.map(p =>
                p.id === updatedPatient.id
                  ? {
                      ...p,
                      firstName: updatedPatient.first_name,
                      lastName: updatedPatient.last_name,
                      email: updatedPatient.email,
                      phone: updatedPatient.phone,
                      dateOfBirth: updatedPatient.date_of_birth,
                      address: updatedPatient.address,
                      emergencyContact: updatedPatient.emergency_contact,
                      emergencyPhone: updatedPatient.emergency_phone,
                      medicalHistory: updatedPatient.medical_history,
                      allergies: updatedPatient.allergies,
                      notes: updatedPatient.notes,
                      status: updatedPatient.status,
                      addedBy: updatedPatient.added_by
                    }
                  : p
              );

              // If status filter is active, remove patients that don't match
              if (status) {
                return updated.filter(p => p.status === status);
              }
              if (addedBy) {
                return updated.filter(p => p.addedBy === addedBy);
              }

              return updated;
            });
          } else if (payload.eventType === 'DELETE') {
            const deletedPatient = payload.old as any;
            setPatients(prev => prev.filter(p => p.id !== deletedPatient.id));
          }
        }
      )
      .subscribe();

    // Cleanup
    return () => {
      supabase.removeChannel(channel);
    };
  }, [status, addedBy, enabled]);

  return {
    patients,
    loading,
    error,
    counts: {
      pending: pendingCount,
      approved: approvedCount,
      rejected: rejectedCount,
      total: patients.length
    }
  };
}
