import { supabase } from '../lib/supabase';
import { Database } from '../types/supabase';

export interface Treatment {
  id: string;
  patientId: string;
  studentId: string;
  supervisorId?: string;
  treatmentType: string;
  description: string;
  teethNumbers: number[];
  status: 'pending' | 'in_progress' | 'completed' | 'approved' | 'rejected';
  startDate: string;
  endDate?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

// Convert from database model to frontend model
const mapDbTreatmentToTreatment = (dbTreatment: any): Treatment => ({
  id: dbTreatment.id,
  patientId: dbTreatment.patient_id,
  studentId: dbTreatment.student_id,
  supervisorId: dbTreatment.supervisor_id,
  treatmentType: dbTreatment.treatment_type,
  description: dbTreatment.description,
  teethNumbers: dbTreatment.teeth_numbers,
  status: dbTreatment.status,
  startDate: dbTreatment.start_date,
  endDate: dbTreatment.end_date,
  notes: dbTreatment.notes,
  createdAt: dbTreatment.created_at,
  updatedAt: dbTreatment.updated_at
});

export const treatmentService = {
  // Get treatment by ID
  getTreatmentById: async (treatmentId: string): Promise<Treatment | null> => {
    try {
      const { data, error } = await supabase
        .from('treatments')
        .select('*')
        .eq('id', treatmentId)
        .single();

      if (error) throw error;
      return data ? mapDbTreatmentToTreatment(data) : null;
    } catch (error) {
      console.error('Error fetching treatment:', error);
      return null;
    }
  },

  // Get treatments by patient ID
  getTreatmentsByPatientId: async (patientId: string): Promise<Treatment[]> => {
    try {
      const { data, error } = await supabase
        .from('treatments')
        .select('*')
        .eq('patient_id', patientId);

      if (error) throw error;
      return data ? data.map(mapDbTreatmentToTreatment) : [];
    } catch (error) {
      console.error('Error fetching treatments by patient ID:', error);
      return [];
    }
  },

  // Get treatments by student ID
  getTreatmentsByStudentId: async (studentId: string): Promise<Treatment[]> => {
    try {
      const { data, error } = await supabase
        .from('treatments')
        .select('*')
        .eq('student_id', studentId);

      if (error) throw error;
      return data ? data.map(mapDbTreatmentToTreatment) : [];
    } catch (error) {
      console.error('Error fetching treatments by student ID:', error);
      return [];
    }
  },

  // Get treatments by supervisor ID
  getTreatmentsBySupervisorId: async (supervisorId: string): Promise<Treatment[]> => {
    try {
      const { data, error } = await supabase
        .from('treatments')
        .select('*')
        .eq('supervisor_id', supervisorId);

      if (error) throw error;
      return data ? data.map(mapDbTreatmentToTreatment) : [];
    } catch (error) {
      console.error('Error fetching treatments by supervisor ID:', error);
      return [];
    }
  },

  // Get treatments by status
  getTreatmentsByStatus: async (status: Treatment['status']): Promise<Treatment[]> => {
    try {
      const { data, error } = await supabase
        .from('treatments')
        .select('*')
        .eq('status', status);

      if (error) throw error;
      return data ? data.map(mapDbTreatmentToTreatment) : [];
    } catch (error) {
      console.error('Error fetching treatments by status:', error);
      return [];
    }
  },

  // Add a new treatment
  addTreatment: async (treatmentData: Omit<Treatment, 'id' | 'createdAt' | 'updatedAt'>): Promise<Treatment | null> => {
    try {
      const { data, error } = await supabase
        .from('treatments')
        .insert({
          patient_id: treatmentData.patientId,
          student_id: treatmentData.studentId,
          supervisor_id: treatmentData.supervisorId,
          treatment_type: treatmentData.treatmentType,
          description: treatmentData.description,
          teeth_numbers: treatmentData.teethNumbers,
          status: treatmentData.status,
          start_date: treatmentData.startDate,
          end_date: treatmentData.endDate,
          notes: treatmentData.notes
        })
        .select()
        .single();

      if (error) throw error;
      return data ? mapDbTreatmentToTreatment(data) : null;
    } catch (error) {
      console.error('Error adding treatment:', error);
      return null;
    }
  },

  // Update treatment information
  updateTreatment: async (treatmentId: string, treatmentData: Partial<Treatment>): Promise<boolean> => {
    try {
      const dbData: any = {};
      if (treatmentData.patientId) dbData.patient_id = treatmentData.patientId;
      if (treatmentData.studentId) dbData.student_id = treatmentData.studentId;
      if (treatmentData.supervisorId !== undefined) dbData.supervisor_id = treatmentData.supervisorId;
      if (treatmentData.treatmentType) dbData.treatment_type = treatmentData.treatmentType;
      if (treatmentData.description) dbData.description = treatmentData.description;
      if (treatmentData.teethNumbers) dbData.teeth_numbers = treatmentData.teethNumbers;
      if (treatmentData.status) dbData.status = treatmentData.status;
      if (treatmentData.startDate) dbData.start_date = treatmentData.startDate;
      if (treatmentData.endDate !== undefined) dbData.end_date = treatmentData.endDate;
      if (treatmentData.notes !== undefined) dbData.notes = treatmentData.notes;

      const { error } = await supabase
        .from('treatments')
        .update(dbData)
        .eq('id', treatmentId);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error updating treatment:', error);
      return false;
    }
  },

  // Update treatment status
  updateTreatmentStatus: async (treatmentId: string, status: Treatment['status']): Promise<boolean> => {
    try {
      const { error } = await supabase
        .from('treatments')
        .update({ status })
        .eq('id', treatmentId);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error updating treatment status:', error);
      return false;
    }
  },

  // Assign supervisor to treatment
  assignSupervisor: async (treatmentId: string, supervisorId: string): Promise<boolean> => {
    try {
      const { error } = await supabase
        .from('treatments')
        .update({ supervisor_id: supervisorId })
        .eq('id', treatmentId);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error assigning supervisor to treatment:', error);
      return false;
    }
  },

  // Complete treatment
  completeTreatment: async (treatmentId: string, endDate: string, notes?: string): Promise<boolean> => {
    try {
      const { error } = await supabase
        .from('treatments')
        .update({ 
          status: 'completed', 
          end_date: endDate,
          notes: notes
        })
        .eq('id', treatmentId);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error completing treatment:', error);
      return false;
    }
  },

  // Approve or reject treatment
  reviewTreatment: async (treatmentId: string, status: 'approved' | 'rejected', notes?: string): Promise<boolean> => {
    try {
      const { error } = await supabase
        .from('treatments')
        .update({ 
          status, 
          notes: notes
        })
        .eq('id', treatmentId);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error reviewing treatment:', error);
      return false;
    }
  }
};