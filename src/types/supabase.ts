export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          created_at: string
          email: string
          full_name: string
          mobile: string
          university: string
          role: 'Intern/Student' | 'Doctor' | 'Supervisor' | 'Admin'
          is_approved: boolean
          city?: string
          registration_status?: string
          class_year?: string
          working_days?: string
          current_period_start_date?: string
          current_period_end_date?: string
        }
        Insert: {
          id?: string
          created_at?: string
          email: string
          full_name: string
          mobile: string
          university: string
          role: 'Intern/Student' | 'Doctor' | 'Supervisor' | 'Admin'
          is_approved?: boolean
          city?: string
          registration_status?: string
          class_year?: string
          working_days?: string
          current_period_start_date?: string
          current_period_end_date?: string
        }
        Update: {
          id?: string
          created_at?: string
          email?: string
          full_name?: string
          mobile?: string
          university?: string
          role?: 'Intern/Student' | 'Doctor' | 'Supervisor' | 'Admin'
          is_approved?: boolean
          city?: string
          registration_status?: string
          class_year?: string
          working_days?: string
          current_period_start_date?: string
          current_period_end_date?: string
        }
      }
      internship_periods: {
        Row: {
          id: string
          created_at: string
          user_id: string
          location: string
          round?: string
          start_date: string
          end_date: string
        }
        Insert: {
          id?: string
          created_at?: string
          user_id: string
          location: string
          round?: string
          start_date: string
          end_date: string
        }
        Update: {
          id?: string
          created_at?: string
          user_id?: string
          location?: string
          round?: string
          start_date?: string
          end_date?: string
        }
      }
      patients: {
        Row: {
          id: string
            created_at: string
            first_name: string
            last_name: string
            email: string
            phone: string
            date_of_birth: string
            address?: string
            emergency_contact?: string
            emergency_phone?: string
            medical_history?: string
            allergies?: string
            notes?: string
            status: 'pending' | 'approved' | 'rejected'
            created_by: string
            last_visit?: string
        }
        Insert: {
          id?: string
            created_at?: string
            first_name: string
            last_name: string
            email: string
            phone: string
            date_of_birth: string
            address?: string
            emergency_contact?: string
            emergency_phone?: string
            medical_history?: string
            allergies?: string
            notes?: string
            status?: 'pending' | 'approved' | 'rejected'
            created_by: string
            last_visit?: string
        }
        Update: {
          id?: string
            created_at?: string
            first_name?: string
            last_name?: string
            email?: string
            phone?: string
            date_of_birth?: string
            address?: string
            emergency_contact?: string
            emergency_phone?: string
            medical_history?: string
            allergies?: string
            notes?: string
            status?: 'pending' | 'approved' | 'rejected'
            created_by?: string
            last_visit?: string
        }
      }
      treatments: {
        Row: {
          id: string
          created_at: string
          patient_id: string
          tooth_number: number
          type: string
          start_date: string
          end_date?: string
          status: 'completed' | 'in_progress' | 'planned'
          notes: string
          priority?: 'low' | 'medium' | 'high'
          created_by: string
          supervisor_id?: string
          is_approved?: boolean
        }
        Insert: {
          id?: string
          created_at?: string
          patient_id: string
          tooth_number: number
          type: string
          start_date: string
          end_date?: string
          status: 'completed' | 'in_progress' | 'planned'
          notes: string
          priority?: 'low' | 'medium' | 'high'
          created_by: string
          supervisor_id?: string
          is_approved?: boolean
        }
        Update: {
          id?: string
          created_at?: string
          patient_id?: string
          tooth_number?: number
          type?: string
          start_date?: string
          end_date?: string
          status?: 'completed' | 'in_progress' | 'planned'
          notes?: string
          priority?: 'low' | 'medium' | 'high'
          created_by?: string
          supervisor_id?: string
          is_approved?: boolean
        }
      }
      notifications: {
        Row: {
          id: string
          created_at: string
          user_id: string
          title: string
          message: string
          type: 'approval' | 'info' | 'warning'
          is_read: boolean
          related_entity_id?: string
          related_entity_type?: 'treatment' | 'patient' | 'user'
        }
        Insert: {
          id?: string
          created_at?: string
          user_id: string
          title: string
          message: string
          type: 'approval' | 'info' | 'warning'
          is_read?: boolean
          related_entity_id?: string
          related_entity_type?: 'treatment' | 'patient' | 'user'
        }
        Update: {
          id?: string
          created_at?: string
          user_id?: string
          title?: string
          message?: string
          type?: 'approval' | 'info' | 'warning'
          is_read?: boolean
          related_entity_id?: string
          related_entity_type?: 'treatment' | 'patient' | 'user'
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
  }
}
