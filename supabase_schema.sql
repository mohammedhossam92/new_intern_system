-- PostgreSQL schema for Dental System with Supabase

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table (extends Supabase auth.users)
CREATE TABLE users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100) NOT NULL,
  email VARCHAR(255) NOT NULL UNIQUE,
  phone VARCHAR(20),
  role VARCHAR(20) NOT NULL CHECK (role IN ('Intern/Student', 'Doctor', 'Admin')),
  profile_image TEXT,
  university VARCHAR(100),
  graduation_year INTEGER,
  specialization VARCHAR(100),
  bio TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Internship periods table
CREATE TABLE internship_periods (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  supervisor_id UUID REFERENCES users(id) ON DELETE SET NULL,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  status VARCHAR(20) NOT NULL CHECK (status IN ('pending', 'in_progress', 'completed', 'approved')),
  hours_completed INTEGER DEFAULT 0,
  total_required_hours INTEGER NOT NULL,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  CONSTRAINT start_before_end CHECK (start_date <= end_date)
);

-- Patients table
CREATE TABLE patients (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100) NOT NULL,
  email VARCHAR(255),
  phone VARCHAR(20) NOT NULL,
  date_of_birth DATE NOT NULL,
  address TEXT,
  emergency_contact VARCHAR(100),
  emergency_phone VARCHAR(20),
  medical_history TEXT,
  allergies TEXT,
  notes TEXT,
  status VARCHAR(20) NOT NULL CHECK (status IN ('pending', 'approved', 'rejected')),
  added_by UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
  last_visit TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Treatments table
CREATE TABLE treatments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  patient_id UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
  student_id UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
  supervisor_id UUID REFERENCES users(id) ON DELETE SET NULL,
  treatment_type VARCHAR(100) NOT NULL,
  description TEXT NOT NULL,
  teeth_numbers INTEGER[] NOT NULL,
  status VARCHAR(20) NOT NULL CHECK (status IN ('pending', 'in_progress', 'completed', 'approved', 'rejected')),
  start_date TIMESTAMP WITH TIME ZONE NOT NULL,
  end_date TIMESTAMP WITH TIME ZONE,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  CONSTRAINT end_after_start CHECK (end_date IS NULL OR start_date <= end_date)
);

-- Notifications table
CREATE TABLE notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  message TEXT NOT NULL,
  type VARCHAR(20) NOT NULL CHECK (type IN ('info', 'warning', 'success', 'error')),
  is_read BOOLEAN NOT NULL DEFAULT FALSE,
  related_entity_id UUID,
  related_entity_type VARCHAR(20) CHECK (related_entity_type IN ('patient', 'treatment', 'user', 'internship')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Appointments table
CREATE TABLE appointments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  patient_id UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
  student_id UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
  supervisor_id UUID REFERENCES users(id) ON DELETE SET NULL,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  start_time TIMESTAMP WITH TIME ZONE NOT NULL,
  end_time TIMESTAMP WITH TIME ZONE NOT NULL,
  status VARCHAR(20) NOT NULL CHECK (status IN ('scheduled', 'confirmed', 'completed', 'cancelled', 'no_show')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  CONSTRAINT end_after_start CHECK (start_time <= end_time)
);

-- Create indexes for performance
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_internship_periods_user_id ON internship_periods(user_id);
CREATE INDEX idx_internship_periods_supervisor_id ON internship_periods(supervisor_id);
CREATE INDEX idx_patients_added_by ON patients(added_by);
CREATE INDEX idx_patients_status ON patients(status);
CREATE INDEX idx_treatments_patient_id ON treatments(patient_id);
CREATE INDEX idx_treatments_student_id ON treatments(student_id);
CREATE INDEX idx_treatments_supervisor_id ON treatments(supervisor_id);
CREATE INDEX idx_treatments_status ON treatments(status);
CREATE INDEX idx_notifications_user_id ON notifications(user_id);
CREATE INDEX idx_notifications_is_read ON notifications(is_read);
CREATE INDEX idx_appointments_patient_id ON appointments(patient_id);
CREATE INDEX idx_appointments_student_id ON appointments(student_id);
CREATE INDEX idx_appointments_start_time ON appointments(start_time);

-- Create Row Level Security (RLS) policies

-- Users table policies
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

CREATE POLICY users_select_policy ON users
  FOR SELECT USING (true); -- Everyone can view user profiles

CREATE POLICY users_insert_policy ON users
  FOR INSERT WITH CHECK (auth.uid() = id); -- Users can only insert their own profile

CREATE POLICY users_update_policy ON users
  FOR UPDATE USING (auth.uid() = id OR 
                   EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'Admin')); -- Users can update their own profile or admins can update any

-- Internship periods policies
ALTER TABLE internship_periods ENABLE ROW LEVEL SECURITY;

CREATE POLICY internship_periods_select_policy ON internship_periods
  FOR SELECT USING (user_id = auth.uid() OR 
                   supervisor_id = auth.uid() OR
                   EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role IN ('Doctor', 'Admin')));

CREATE POLICY internship_periods_insert_policy ON internship_periods
  FOR INSERT WITH CHECK (EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role IN ('Doctor', 'Admin')));

CREATE POLICY internship_periods_update_policy ON internship_periods
  FOR UPDATE USING (supervisor_id = auth.uid() OR
                   EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role IN ('Doctor', 'Admin')));

-- Patients policies
ALTER TABLE patients ENABLE ROW LEVEL SECURITY;

CREATE POLICY patients_select_policy ON patients
  FOR SELECT USING (added_by = auth.uid() OR
                   EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role IN ('Doctor', 'Admin')) OR
                   EXISTS (SELECT 1 FROM treatments WHERE patient_id = patients.id AND student_id = auth.uid()));

CREATE POLICY patients_insert_policy ON patients
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL); -- Any authenticated user can add patients

CREATE POLICY patients_update_policy ON patients
  FOR UPDATE USING (added_by = auth.uid() OR
                   EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role IN ('Doctor', 'Admin')));

-- Treatments policies
ALTER TABLE treatments ENABLE ROW LEVEL SECURITY;

CREATE POLICY treatments_select_policy ON treatments
  FOR SELECT USING (student_id = auth.uid() OR
                   supervisor_id = auth.uid() OR
                   EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role IN ('Doctor', 'Admin')));

CREATE POLICY treatments_insert_policy ON treatments
  FOR INSERT WITH CHECK (student_id = auth.uid() OR
                        EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role IN ('Doctor', 'Admin')));

CREATE POLICY treatments_update_policy ON treatments
  FOR UPDATE USING (student_id = auth.uid() OR
                   supervisor_id = auth.uid() OR
                   EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role IN ('Doctor', 'Admin')));

-- Notifications policies
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY notifications_select_policy ON notifications
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY notifications_insert_policy ON notifications
  FOR INSERT WITH CHECK (EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role IN ('Doctor', 'Admin')));

CREATE POLICY notifications_update_policy ON notifications
  FOR UPDATE USING (user_id = auth.uid());

-- Appointments policies
ALTER TABLE appointments ENABLE ROW LEVEL SECURITY;

CREATE POLICY appointments_select_policy ON appointments
  FOR SELECT USING (student_id = auth.uid() OR
                   supervisor_id = auth.uid() OR
                   EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role IN ('Doctor', 'Admin')));

CREATE POLICY appointments_insert_policy ON appointments
  FOR INSERT WITH CHECK (student_id = auth.uid() OR
                        EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role IN ('Doctor', 'Admin')));

CREATE POLICY appointments_update_policy ON appointments
  FOR UPDATE USING (student_id = auth.uid() OR
                   supervisor_id = auth.uid() OR
                   EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role IN ('Doctor', 'Admin')));

-- Create functions for common operations

-- Function to get all patients for a student
CREATE OR REPLACE FUNCTION get_student_patients(student_id UUID)
RETURNS SETOF patients
LANGUAGE SQL SECURITY DEFINER
AS $$
  SELECT DISTINCT p.*
  FROM patients p
  JOIN treatments t ON p.id = t.patient_id
  WHERE t.student_id = student_id;
$$;

-- Function to get all patients for a supervisor
CREATE OR REPLACE FUNCTION get_supervisor_patients(supervisor_id UUID)
RETURNS SETOF patients
LANGUAGE SQL SECURITY DEFINER
AS $$
  SELECT DISTINCT p.*
  FROM patients p
  JOIN treatments t ON p.id = t.patient_id
  WHERE t.supervisor_id = supervisor_id;
$$;

-- Function to get all students for a supervisor
CREATE OR REPLACE FUNCTION get_supervisor_students(supervisor_id UUID)
RETURNS SETOF users
LANGUAGE SQL SECURITY DEFINER
AS $$
  SELECT DISTINCT u.*
  FROM users u
  JOIN internship_periods ip ON u.id = ip.user_id
  WHERE ip.supervisor_id = supervisor_id AND u.role = 'Intern/Student';
$$;

-- Function to automatically create a notification when a treatment status changes
CREATE OR REPLACE FUNCTION notify_treatment_status_change()
RETURNS TRIGGER
LANGUAGE PLPGSQL SECURITY DEFINER
AS $$
BEGIN
  IF OLD.status <> NEW.status THEN
    -- Notify student
    INSERT INTO notifications (user_id, title, message, type, related_entity_id, related_entity_type)
    VALUES (
      NEW.student_id,
      'Treatment Status Updated',
      'Your treatment has been updated to ' || NEW.status,
      CASE 
        WHEN NEW.status = 'approved' THEN 'success'
        WHEN NEW.status = 'rejected' THEN 'error'
        ELSE 'info'
      END,
      NEW.id,
      'treatment'
    );
    
    -- Notify supervisor if assigned
    IF NEW.supervisor_id IS NOT NULL THEN
      INSERT INTO notifications (user_id, title, message, type, related_entity_id, related_entity_type)
      VALUES (
        NEW.supervisor_id,
        'Treatment Status Updated',
        'A treatment you supervise has been updated to ' || NEW.status,
        'info',
        NEW.id,
        'treatment'
      );
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$;

CREATE TRIGGER treatment_status_change_trigger
AFTER UPDATE ON treatments
FOR EACH ROW
EXECUTE FUNCTION notify_treatment_status_change();

-- Function to automatically create a notification when a patient is added
CREATE OR REPLACE FUNCTION notify_patient_added()
RETURNS TRIGGER
LANGUAGE PLPGSQL SECURITY DEFINER
AS $$
DECLARE
  doctor_ids UUID[];
BEGIN
  -- Get all doctors
  SELECT array_agg(id) INTO doctor_ids FROM users WHERE role = 'Doctor';
  
  -- Notify each doctor
  IF doctor_ids IS NOT NULL THEN
    FOR i IN 1..array_length(doctor_ids, 1) LOOP
      INSERT INTO notifications (user_id, title, message, type, related_entity_id, related_entity_type)
      VALUES (
        doctor_ids[i],
        'New Patient Added',
        'A new patient ' || NEW.first_name || ' ' || NEW.last_name || ' has been added and needs approval',
        'info',
        NEW.id,
        'patient'
      );
    END LOOP;
  END IF;
  
  RETURN NEW;
END;
$$;

CREATE TRIGGER patient_added_trigger
AFTER INSERT ON patients
FOR EACH ROW
WHEN (NEW.status = 'pending')
EXECUTE FUNCTION notify_patient_added();

-- Function to automatically create a notification when an appointment is created
CREATE OR REPLACE FUNCTION notify_appointment_created()
RETURNS TRIGGER
LANGUAGE PLPGSQL SECURITY DEFINER
AS $$
BEGIN
  -- Notify student
  INSERT INTO notifications (user_id, title, message, type, related_entity_id, related_entity_type)
  VALUES (
    NEW.student_id,
    'New Appointment',
    'You have a new appointment scheduled for ' || to_char(NEW.start_time, 'YYYY-MM-DD HH24:MI'),
    'info',
    NEW.id,
    'appointment'
  );
  
  -- Notify supervisor if assigned
  IF NEW.supervisor_id IS NOT NULL THEN
    INSERT INTO notifications (user_id, title, message, type, related_entity_id, related_entity_type)
    VALUES (
      NEW.supervisor_id,
      'New Appointment to Supervise',
      'You have been assigned to supervise an appointment on ' || to_char(NEW.start_time, 'YYYY-MM-DD HH24:MI'),
      'info',
      NEW.id,
      'appointment'
    );
  END IF;
  
  RETURN NEW;
END;
$$;

CREATE TRIGGER appointment_created_trigger
AFTER INSERT ON appointments
FOR EACH ROW
EXECUTE FUNCTION notify_appointment_created();