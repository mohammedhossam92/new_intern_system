import { createClient, SupabaseClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string;

const realClient: SupabaseClient = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true
  },
  realtime: {
    params: {
      eventsPerSecond: 10
    }
  }
});

type UserRole = 'Intern/Student' | 'Doctor' | 'Supervisor' | 'Admin';

type MockUser = {
  id: string;
  full_name: string;
  email: string;
  mobile: string;
  university: string;
  role: UserRole;
  is_approved: boolean;
  city?: string;
  registration_status?: string;
  class_year?: string | null;
  working_days?: string | null;
  current_period_start_date?: string | null;
  current_period_end_date?: string | null;
};

type MockPatient = {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  date_of_birth: string;
  address: string;
  emergency_contact?: string;
  emergency_phone?: string;
  medical_history?: string;
  allergies?: string;
  notes?: string;
  status: 'pending' | 'approved' | 'rejected';
  created_by: string; // user id
  created_at: string;
};

type MockTreatment = {
  id: string;
  patient_id: string;
  tooth_number: number;
  type: string;
  start_date: string;
  end_date?: string;
  status: 'completed' | 'in_progress' | 'planned';
  notes?: string;
  priority?: 'low' | 'medium' | 'high';
  created_by: string; // user id
  approval_status: 'pending' | 'approved' | 'rejected';
  approved_by?: string;
  approved_at?: string;
  created_at: string;
};

type MockNotification = {
  id: string;
  user_id: string;
  title: string;
  message: string;
  type: 'approval' | 'info' | 'warning';
  is_read: boolean;
  related_entity_id?: string;
  related_entity_type?: 'treatment' | 'patient' | 'user';
  created_at: string;
};

// In-memory stores
const mockUsers: MockUser[] = [
  {
    id: '1',
    full_name: 'Dr. John Smith',
    email: 'doctor@dental.com',
    mobile: '+1234567890',
    university: 'Dental University',
    role: 'Doctor',
    is_approved: true,
    city: 'New York',
    registration_status: 'Active',
    class_year: null,
    working_days: 'Monday-Friday',
    current_period_start_date: null,
    current_period_end_date: null
  },
  {
    id: '2',
    full_name: 'Jane Doe',
    email: 'student@dental.com',
    mobile: '+1234567891',
    university: 'Dental University',
    role: 'Intern/Student',
    is_approved: true,
    city: 'Boston',
    registration_status: 'Active',
    class_year: '4th Year',
    working_days: 'Monday-Friday',
    current_period_start_date: '2023-09-01',
    current_period_end_date: '2023-12-15'
  },
  {
    id: '4',
    full_name: 'Admin User',
    email: 'admin@dental.com',
    mobile: '+1234567892',
    university: 'System Admin',
    role: 'Admin',
    is_approved: true,
    city: 'System',
    registration_status: 'Active',
    class_year: null,
    working_days: null,
    current_period_start_date: null,
    current_period_end_date: null
  }
];

const mockPatients: MockPatient[] = [];
const mockTreatments: MockTreatment[] = [];
const mockNotifications: MockNotification[] = [];

let patientSeq = 1000;
let treatmentSeq = 5000;
let notificationSeq = 8000;

// Simple query builder
function createQuery<T>(_table: string, source: T[]) {
  const records = source;
  const filters: Array<(row: any) => boolean> = [];

  const api: any = {
  select: (_columns: string) => api,
    eq: (column: string, value: any) => {
      filters.push((row) => row[column] === value);
      return api;
    },
    single: async () => {
      const data = records.filter(r => filters.every(f => f(r)))[0] ?? null;
      return { data, error: null };
    },
    execute: async () => {
      const data = records.filter(r => filters.every(f => f(r)));
      return { data, error: null };
    }
  };
  return api;
}

// ---------------- MOCK IMPLEMENTATION ----------------
const mock = {
  auth: {
    getSession: async () => ({ data: { session: null }, error: null }),
  onAuthStateChange: (_callback: any) => {
      // Return an unsubscribe function
      return { data: { subscription: { unsubscribe: () => {} } } };
    },
    signInWithPassword: async ({ email, password }: { email: string, password: string }) => {
      // Mock authentication logic
      if (email === 'doctor@dental.com' && password === 'password') {
        return { data: { user: { id: '1', email, role: 'Doctor' } }, error: null };
      } else if (email === 'student@dental.com' && password === 'password') {
        return { data: { user: { id: '2', email, role: 'Intern/Student' } }, error: null };
      } else if (email === 'admin@dental.com' && password === 'password') {
        return { data: { user: { id: '4', email, role: 'Admin' } }, error: null };
      } else {
        return { data: { user: null }, error: { message: 'Invalid login credentials' } };
      }
    },
  signUp: async ({ email, password: _password }: { email: string, password: string }) => {
      return { data: { user: { id: '3', email, role: 'Intern/Student' } }, error: null };
    },
    signOut: async () => {
      return { error: null };
    }
  },
  from: (table: string) => {
    return {
      // SELECT
      select: (_columns: string) => {
        if (table === 'users') return createQuery('users', mockUsers as any);
        if (table === 'patients') return createQuery('patients', mockPatients as any);
  if (table === 'treatments') return createQuery('treatments', mockTreatments as any);
  if (table === 'notifications') return createQuery('notifications', mockNotifications as any);
        return createQuery(table, []);
      },
      // INSERT
      insert: (data: any) => ({
        select: () => ({
          single: async () => {
            if (table === 'patients') {
              const newPatient: MockPatient = {
                id: String(++patientSeq),
                first_name: data.first_name,
                last_name: data.last_name,
                email: data.email,
                phone: data.phone,
                date_of_birth: data.date_of_birth,
                address: data.address,
                emergency_contact: data.emergency_contact,
                emergency_phone: data.emergency_phone,
                medical_history: data.medical_history,
                allergies: data.allergies,
                notes: data.notes,
                status: data.status ?? 'pending',
                created_by: data.created_by,
                created_at: new Date().toISOString()
              };
              mockPatients.push(newPatient);
              return { data: newPatient as any, error: null };
            }
            if (table === 'treatments') {
              const newTreatment: MockTreatment = {
                id: String(++treatmentSeq),
                patient_id: data.patient_id,
                tooth_number: data.tooth_number,
                type: data.type,
                start_date: data.start_date,
                end_date: data.end_date,
                status: data.status,
                notes: data.notes,
                priority: data.priority,
                created_by: data.created_by,
                approval_status: data.approval_status ?? 'pending',
                approved_by: data.approved_by,
                approved_at: data.approved_at,
                created_at: new Date().toISOString()
              };
              mockTreatments.push(newTreatment);
              return { data: newTreatment as any, error: null };
            }
            if (table === 'notifications') {
              const newNotification: MockNotification = {
                id: String(++notificationSeq),
                user_id: data.user_id,
                title: data.title,
                message: data.message,
                type: data.type,
                is_read: data.is_read ?? false,
                related_entity_id: data.related_entity_id,
                related_entity_type: data.related_entity_type,
                created_at: new Date().toISOString()
              };
              mockNotifications.push(newNotification);
              return { data: newNotification as any, error: null };
            }
            return { data, error: null };
          }
        })
      }),
      // UPDATE (simple eq on id)
      update: (changes: any) => ({
        eq: (column: string, value: any) => ({
          execute: async () => {
            if (table === 'patients' && column === 'id') {
              const idx = mockPatients.findIndex(p => p.id === String(value));
              if (idx >= 0) mockPatients[idx] = { ...mockPatients[idx], ...changes };
              return { data: mockPatients[idx] as any, error: null };
            }
            if (table === 'treatments' && column === 'id') {
              const idx = mockTreatments.findIndex(t => t.id === String(value));
              if (idx >= 0) mockTreatments[idx] = { ...mockTreatments[idx], ...changes };
              return { data: mockTreatments[idx] as any, error: null };
            }
            if (table === 'notifications' && column === 'id') {
              const idx = mockNotifications.findIndex(n => n.id === String(value));
              if (idx >= 0) mockNotifications[idx] = { ...mockNotifications[idx], ...changes };
              return { data: mockNotifications[idx] as any, error: null };
            }
            return { data: null, error: null };
          }
        })
      }),
      // DELETE (not used currently)
      delete: () => ({
        eq: (_column: string, _value: any) => ({
          execute: async () => ({ error: null })
        })
      })
    };
  }
};

export const supabase = realClient;
export const isMockSupabase = false;

console.log('[Supabase] Using REAL Supabase backend with Realtime enabled');
