/*
  # Enable Realtime for All Tables

  This migration enables Supabase Realtime functionality for all tables in the dental system.
  This allows the frontend to subscribe to real-time changes (inserts, updates, deletes) on:
  
  1. users - Real-time profile updates
  2. internship_periods - Real-time internship tracking
  3. patients - Real-time patient additions and updates
  4. treatments - Real-time treatment changes and approvals
  5. notifications - Real-time notification delivery
  6. appointments - Real-time appointment scheduling and updates
*/

-- Enable realtime on users table
ALTER PUBLICATION supabase_realtime ADD TABLE users;

-- Enable realtime on internship_periods table
ALTER PUBLICATION supabase_realtime ADD TABLE internship_periods;

-- Enable realtime on patients table
ALTER PUBLICATION supabase_realtime ADD TABLE patients;

-- Enable realtime on treatments table
ALTER PUBLICATION supabase_realtime ADD TABLE treatments;

-- Enable realtime on notifications table
ALTER PUBLICATION supabase_realtime ADD TABLE notifications;

-- Enable realtime on appointments table
ALTER PUBLICATION supabase_realtime ADD TABLE appointments;