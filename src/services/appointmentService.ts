import { supabase } from '../lib/supabase';
import { Database } from '../types/supabase';

export interface Appointment {
  id: string;
  patientId: string;
  studentId: string;
  supervisorId?: string;
  title: string;
  description?: string;
  startTime: string;
  endTime: string;
  status: 'scheduled' | 'confirmed' | 'completed' | 'cancelled' | 'no_show';
  createdAt: string;
  updatedAt: string;
}

// Convert from database model to frontend model
const mapDbAppointmentToAppointment = (dbAppointment: any): Appointment => ({
  id: dbAppointment.id,
  patientId: dbAppointment.patient_id,
  studentId: dbAppointment.student_id,
  supervisorId: dbAppointment.supervisor_id,
  title: dbAppointment.title,
  description: dbAppointment.description,
  startTime: dbAppointment.start_time,
  endTime: dbAppointment.end_time,
  status: dbAppointment.status,
  createdAt: dbAppointment.created_at,
  updatedAt: dbAppointment.updated_at
});

export const appointmentService = {
  // Get appointment by ID
  getAppointmentById: async (appointmentId: string): Promise<Appointment | null> => {
    try {
      const { data, error } = await supabase
        .from('appointments')
        .select('*')
        .eq('id', appointmentId)
        .single();

      if (error) throw error;
      return data ? mapDbAppointmentToAppointment(data) : null;
    } catch (error) {
      console.error('Error fetching appointment:', error);
      return null;
    }
  },

  // Get appointments by patient ID
  getAppointmentsByPatientId: async (patientId: string): Promise<Appointment[]> => {
    try {
      const { data, error } = await supabase
        .from('appointments')
        .select('*')
        .eq('patient_id', patientId)
        .order('start_time', { ascending: true });

      if (error) throw error;
      return data ? data.map(mapDbAppointmentToAppointment) : [];
    } catch (error) {
      console.error('Error fetching appointments by patient ID:', error);
      return [];
    }
  },

  // Get appointments by student ID
  getAppointmentsByStudentId: async (studentId: string): Promise<Appointment[]> => {
    try {
      const { data, error } = await supabase
        .from('appointments')
        .select('*')
        .eq('student_id', studentId)
        .order('start_time', { ascending: true });

      if (error) throw error;
      return data ? data.map(mapDbAppointmentToAppointment) : [];
    } catch (error) {
      console.error('Error fetching appointments by student ID:', error);
      return [];
    }
  },

  // Get appointments by supervisor ID
  getAppointmentsBySupervisorId: async (supervisorId: string): Promise<Appointment[]> => {
    try {
      const { data, error } = await supabase
        .from('appointments')
        .select('*')
        .eq('supervisor_id', supervisorId)
        .order('start_time', { ascending: true });

      if (error) throw error;
      return data ? data.map(mapDbAppointmentToAppointment) : [];
    } catch (error) {
      console.error('Error fetching appointments by supervisor ID:', error);
      return [];
    }
  },

  // Get appointments by date range
  getAppointmentsByDateRange: async (startDate: string, endDate: string, userId?: string): Promise<Appointment[]> => {
    try {
      let query = supabase
        .from('appointments')
        .select('*')
        .gte('start_time', startDate)
        .lte('start_time', endDate);
      
      if (userId) {
        query = query.or(`student_id.eq.${userId},supervisor_id.eq.${userId}`);
      }
      
      const { data, error } = await query.order('start_time', { ascending: true });

      if (error) throw error;
      return data ? data.map(mapDbAppointmentToAppointment) : [];
    } catch (error) {
      console.error('Error fetching appointments by date range:', error);
      return [];
    }
  },

  // Create a new appointment
  createAppointment: async (appointmentData: Omit<Appointment, 'id' | 'createdAt' | 'updatedAt'>): Promise<Appointment | null> => {
    try {
      const { data, error } = await supabase
        .from('appointments')
        .insert({
          patient_id: appointmentData.patientId,
          student_id: appointmentData.studentId,
          supervisor_id: appointmentData.supervisorId,
          title: appointmentData.title,
          description: appointmentData.description,
          start_time: appointmentData.startTime,
          end_time: appointmentData.endTime,
          status: appointmentData.status || 'scheduled'
        })
        .select()
        .single();

      if (error) throw error;
      return data ? mapDbAppointmentToAppointment(data) : null;
    } catch (error) {
      console.error('Error creating appointment:', error);
      return null;
    }
  },

  // Update appointment
  updateAppointment: async (appointmentId: string, appointmentData: Partial<Appointment>): Promise<boolean> => {
    try {
      const dbData: any = {};
      if (appointmentData.patientId) dbData.patient_id = appointmentData.patientId;
      if (appointmentData.studentId) dbData.student_id = appointmentData.studentId;
      if (appointmentData.supervisorId !== undefined) dbData.supervisor_id = appointmentData.supervisorId;
      if (appointmentData.title) dbData.title = appointmentData.title;
      if (appointmentData.description !== undefined) dbData.description = appointmentData.description;
      if (appointmentData.startTime) dbData.start_time = appointmentData.startTime;
      if (appointmentData.endTime) dbData.end_time = appointmentData.endTime;
      if (appointmentData.status) dbData.status = appointmentData.status;

      const { error } = await supabase
        .from('appointments')
        .update(dbData)
        .eq('id', appointmentId);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error updating appointment:', error);
      return false;
    }
  },

  // Update appointment status
  updateAppointmentStatus: async (appointmentId: string, status: Appointment['status']): Promise<boolean> => {
    try {
      const { error } = await supabase
        .from('appointments')
        .update({ status })
        .eq('id', appointmentId);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error updating appointment status:', error);
      return false;
    }
  },

  // Delete appointment
  deleteAppointment: async (appointmentId: string): Promise<boolean> => {
    try {
      const { error } = await supabase
        .from('appointments')
        .delete()
        .eq('id', appointmentId);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error deleting appointment:', error);
      return false;
    }
  },

  // Assign supervisor to appointment
  assignSupervisor: async (appointmentId: string, supervisorId: string): Promise<boolean> => {
    try {
      const { error } = await supabase
        .from('appointments')
        .update({ supervisor_id: supervisorId })
        .eq('id', appointmentId);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error assigning supervisor to appointment:', error);
      return false;
    }
  },

  // Check for appointment conflicts
  checkForConflicts: async (startTime: string, endTime: string, userId: string): Promise<boolean> => {
    try {
      const { data, error } = await supabase
        .from('appointments')
        .select('id')
        .or(`student_id.eq.${userId},supervisor_id.eq.${userId}`)
        .or(`start_time.lt.${endTime},end_time.gt.${startTime}`)
        .not('status', 'eq', 'cancelled');

      if (error) throw error;
      return data && data.length > 0;
    } catch (error) {
      console.error('Error checking for appointment conflicts:', error);
      return false;
    }
  }
};