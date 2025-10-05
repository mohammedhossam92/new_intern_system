import { supabase } from '../lib/supabase';
import { Database } from '../types/supabase';

export interface Patient {
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
  addedDate: string;
  lastVisit?: string;
}

// Convert from database model to frontend model
const mapDbPatientToPatient = (dbPatient: any): Patient => ({
  id: dbPatient.id,
  firstName: dbPatient.first_name,
  lastName: dbPatient.last_name,
  email: dbPatient.email,
  phone: dbPatient.phone,
  dateOfBirth: dbPatient.date_of_birth,
  address: dbPatient.address,
  emergencyContact: dbPatient.emergency_contact,
  emergencyPhone: dbPatient.emergency_phone,
  medicalHistory: dbPatient.medical_history,
  allergies: dbPatient.allergies,
  notes: dbPatient.notes,
  status: dbPatient.status,
  addedBy: dbPatient.added_by,
  addedDate: dbPatient.created_at,
  lastVisit: dbPatient.last_visit
});

export const patientService = {
  // Get patient by ID
  getPatientById: async (patientId: string): Promise<Patient | null> => {
    try {
      const { data, error } = await supabase
        .from('patients')
        .select('*')
        .eq('id', patientId)
        .single();

      if (error) throw error;
      return data ? mapDbPatientToPatient(data) : null;
    } catch (error) {
      console.error('Error fetching patient:', error);
      return null;
    }
  },

  // Get all patients (with optional filters)
  getAllPatients: async (filters?: { status?: 'pending' | 'approved' | 'rejected', addedBy?: string }): Promise<Patient[]> => {
    try {
      let query = supabase.from('patients').select('*');
      
      if (filters?.status) {
        query = query.eq('status', filters.status);
      }
      
      if (filters?.addedBy) {
        query = query.eq('added_by', filters.addedBy);
      }

      const { data, error } = await query;

      if (error) throw error;
      return data ? data.map(mapDbPatientToPatient) : [];
    } catch (error) {
      console.error('Error fetching patients:', error);
      return [];
    }
  },

  // Add a new patient
  addPatient: async (patientData: Omit<Patient, 'id' | 'addedDate'>): Promise<Patient | null> => {
    try {
      const { data, error } = await supabase
        .from('patients')
        .insert({
          first_name: patientData.firstName,
          last_name: patientData.lastName,
          email: patientData.email,
          phone: patientData.phone,
          date_of_birth: patientData.dateOfBirth,
          address: patientData.address,
          emergency_contact: patientData.emergencyContact,
          emergency_phone: patientData.emergencyPhone,
          medical_history: patientData.medicalHistory,
          allergies: patientData.allergies,
          notes: patientData.notes,
          status: patientData.status || 'pending',
          added_by: patientData.addedBy
        })
        .select()
        .single();

      if (error) throw error;
      return data ? mapDbPatientToPatient(data) : null;
    } catch (error) {
      console.error('Error adding patient:', error);
      return null;
    }
  },

  // Update patient information
  updatePatient: async (patientId: string, patientData: Partial<Patient>): Promise<boolean> => {
    try {
      const dbData: any = {};
      if (patientData.firstName) dbData.first_name = patientData.firstName;
      if (patientData.lastName) dbData.last_name = patientData.lastName;
      if (patientData.email) dbData.email = patientData.email;
      if (patientData.phone) dbData.phone = patientData.phone;
      if (patientData.dateOfBirth) dbData.date_of_birth = patientData.dateOfBirth;
      if (patientData.address !== undefined) dbData.address = patientData.address;
      if (patientData.emergencyContact !== undefined) dbData.emergency_contact = patientData.emergencyContact;
      if (patientData.emergencyPhone !== undefined) dbData.emergency_phone = patientData.emergencyPhone;
      if (patientData.medicalHistory !== undefined) dbData.medical_history = patientData.medicalHistory;
      if (patientData.allergies !== undefined) dbData.allergies = patientData.allergies;
      if (patientData.notes !== undefined) dbData.notes = patientData.notes;
      if (patientData.status) dbData.status = patientData.status;
      if (patientData.lastVisit) dbData.last_visit = patientData.lastVisit;

      const { error } = await supabase
        .from('patients')
        .update(dbData)
        .eq('id', patientId);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error updating patient:', error);
      return false;
    }
  },

  // Update patient status (approve/reject)
  updatePatientStatus: async (patientId: string, status: 'pending' | 'approved' | 'rejected'): Promise<boolean> => {
    try {
      const { error } = await supabase
        .from('patients')
        .update({ status })
        .eq('id', patientId);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error updating patient status:', error);
      return false;
    }
  },

  // Search patients by name or email
  searchPatients: async (searchTerm: string): Promise<Patient[]> => {
    try {
      const { data, error } = await supabase
        .from('patients')
        .select('*')
        .or(`first_name.ilike.%${searchTerm}%,last_name.ilike.%${searchTerm}%,email.ilike.%${searchTerm}%,phone.ilike.%${searchTerm}%`);

      if (error) throw error;
      return data ? data.map(mapDbPatientToPatient) : [];
    } catch (error) {
      console.error('Error searching patients:', error);
      return [];
    }
  },

  // Update patient's last visit date
  updateLastVisit: async (patientId: string, lastVisitDate: string): Promise<boolean> => {
    try {
      const { error } = await supabase
        .from('patients')
        .update({ last_visit: lastVisitDate })
        .eq('id', patientId);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error updating last visit date:', error);
      return false;
    }
  }
};