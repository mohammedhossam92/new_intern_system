import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Filter, User, Phone, Mail, Calendar, ChevronRight, Clock, CheckCircle, AlertCircle } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import { notificationService } from '../../services/notificationService';

interface Patient {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  dateOfBirth: string;
  status: 'pending' | 'approved' | 'rejected';
  addedDate: string;
  addedByName?: string; // NEW: Name of student who added
  approvedByName?: string; // NEW: Name of supervisor who approved
  approvedAt?: string; // NEW: When it was approved
  lastVisit?: string;
  treatmentCount: number;
}

interface PatientRow {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  date_of_birth: string;
  status: 'pending' | 'approved' | 'rejected';
  created_at?: string;
  added_by: string;  // Fixed: matches DB column name
}

const PatientList: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all');
  const [patients, setPatients] = useState<Patient[]>([]);
  const canApprove = user && (user.role === 'Admin' || user.role === 'Doctor');

  useEffect(() => {
    const loadPatients = async () => {
      if (!user) return;

      try {
        const response = await supabase
          .from('patients')
          .select(`
            *,
            added_by_user:users!patients_added_by_fkey(first_name, last_name),
            approved_by_user:users!patients_approved_by_fkey(first_name, last_name)
          `);

        if (response.error) {
          console.error('Error loading patients:', response.error);
          // Fallback: try loading without joins if there's an error
          const fallbackResponse = await supabase.from('patients').select('*');
          const fallbackData = (fallbackResponse?.data as unknown as any[]) || [];
          const mapped: Patient[] = fallbackData
            .filter((p: any) => {
              if (user.role === 'Intern/Student') {
                return p.added_by === user.id;
              }
              return true;
            })
            .map((p: any) => ({
              id: p.id,
              firstName: p.first_name,
              lastName: p.last_name,
              email: p.email,
              phone: p.phone,
              dateOfBirth: p.date_of_birth,
              status: p.status,
              addedDate: p.created_at || new Date().toISOString(),
              treatmentCount: 0
            }));
          setPatients(mapped);
          return;
        }

        const data = (response?.data as unknown as any[]) || [];
        const mapped: Patient[] = data
          .filter((p: any) => {
            // Students see their OWN patients (all statuses: pending, approved, rejected)
            if (user.role === 'Intern/Student') {
              return p.added_by === user.id;
            }
            // Approvers (Doctors/Admins) see ALL patients from ALL students
            return true;
          })
          .map((p: any) => ({
            id: p.id,
            firstName: p.first_name,
            lastName: p.last_name,
            email: p.email,
            phone: p.phone,
            dateOfBirth: p.date_of_birth,
            status: p.status,
            addedByName: p.added_by_user ? `${p.added_by_user.first_name} ${p.added_by_user.last_name}` : undefined,
            approvedByName: p.approved_by_user ? `${p.approved_by_user.first_name} ${p.approved_by_user.last_name}` : undefined,
            approvedAt: p.approved_at,
            addedDate: p.created_at || new Date().toISOString(),
            treatmentCount: 0
          }));
        setPatients(mapped);
      } catch (error) {
        console.error('Error in loadPatients:', error);
      }
    };
    loadPatients();

    // Set up real-time subscription for patients table
    const channel = supabase
      .channel('patients-changes')
      .on(
        'postgres_changes',
        {
          event: '*', // Listen to all events (INSERT, UPDATE, DELETE)
          schema: 'public',
          table: 'patients'
        },
        (payload) => {
          console.log('Patient change detected:', payload);

          if (payload.eventType === 'INSERT') {
            const newPatient = payload.new as PatientRow;
            // Check if this patient should be visible to current user
            if (user?.role === 'Intern/Student' && newPatient.added_by !== user.id) {
              return; // Don't show other students' patients
            }

            const mapped: Patient = {
              id: newPatient.id,
              firstName: newPatient.first_name,
              lastName: newPatient.last_name,
              email: newPatient.email,
              phone: newPatient.phone,
              dateOfBirth: newPatient.date_of_birth,
              status: newPatient.status,
              addedDate: newPatient.created_at || new Date().toISOString(),
              treatmentCount: 0
            };
            setPatients(prev => [mapped, ...prev]);
          } else if (payload.eventType === 'UPDATE') {
            const updatedPatient = payload.new as PatientRow;
            setPatients(prev =>
              prev.map(p =>
                p.id === updatedPatient.id
                  ? {
                      ...p,
                      firstName: updatedPatient.first_name,
                      lastName: updatedPatient.last_name,
                      email: updatedPatient.email,
                      phone: updatedPatient.phone,
                      dateOfBirth: updatedPatient.date_of_birth,
                      status: updatedPatient.status
                    }
                  : p
              )
            );
          } else if (payload.eventType === 'DELETE') {
            const deletedPatient = payload.old as PatientRow;
            setPatients(prev => prev.filter(p => p.id !== deletedPatient.id));
          }
        }
      )
      .subscribe();

    // Cleanup subscription on unmount
    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  const filteredPatients = patients.filter(patient => {
    const term = searchTerm.toLowerCase();
    const matchesSearch =
      patient.firstName.toLowerCase().includes(term) ||
      patient.lastName.toLowerCase().includes(term) ||
      patient.email.toLowerCase().includes(term) ||
      patient.phone.includes(searchTerm);
    const matchesStatus = statusFilter === 'all' || patient.status === statusFilter;
    return matchesSearch && matchesStatus;
  });
  const getStatusBadge = (status: Patient['status']) => {
    switch (status) {
      case 'approved':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-300">
            <CheckCircle className="h-3 w-3" />
            Approved
          </span>
        );
      case 'pending':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-100 dark:bg-amber-900 text-amber-800 dark:text-amber-300">
            <Clock className="h-3 w-3" />
            Pending
          </span>
        );
      case 'rejected':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-300">
            <AlertCircle className="h-3 w-3" />
            Rejected
          </span>
        );
    }
  };

  const handlePatientClick = (patient: Patient) => {
    // Students can only view approved patients
    // Supervisors can view all patients
    if (patient.status === 'approved' || canApprove) {
      navigate(`/patient/${patient.id}`);
    } else {
      // Patient is pending/rejected and user is student - don't navigate
      console.log('Patient not approved yet - cannot view');
    }
  };

  const calculateAge = (dateOfBirth: string) => {
    const today = new Date();
    const birth = new Date(dateOfBirth);
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();

    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--;
    }
    return age;
  };

  const handleApprovePatient = async (patientId: string, patientName: string) => {
    try {
      // Get patient details to find the student who added it
      const { data: patientData } = await supabase
        .from('patients')
        .select('added_by')
        .eq('id', patientId)
        .single();

      if (!patientData) {
        console.error('Patient not found');
        return;
      }

      // Update patient status to approved
      const { error } = await supabase
        .from('patients')
        .update({
          status: 'approved',
          approved_by: user?.id,
          approved_at: new Date().toISOString()
        })
        .eq('id', patientId);

      if (error) throw error;

      // Update local state
      setPatients(prev => prev.map(p =>
        p.id === patientId ? { ...p, status: 'approved' as const } : p
      ));

      // Notify the student who added the patient
      const approverName = user?.fullName || `${user?.firstName} ${user?.lastName}`;
      await notificationService.notifyPatientApprovalStatus(
        patientData.added_by,
        patientId,
        patientName,
        true,
        approverName
      );

      console.log('Patient approved and notification sent');
    } catch (error) {
      console.error('Error approving patient:', error);
    }
  };

  const handleRejectPatient = async (patientId: string, patientName: string) => {
    try {
      // Get patient details to find the student who added it
      const { data: patientData } = await supabase
        .from('patients')
        .select('added_by')
        .eq('id', patientId)
        .single();

      if (!patientData) {
        console.error('Patient not found');
        return;
      }

      // Update patient status to rejected
      const { error } = await supabase
        .from('patients')
        .update({ status: 'rejected' })
        .eq('id', patientId);

      if (error) throw error;

      // Update local state
      setPatients(prev => prev.map(p =>
        p.id === patientId ? { ...p, status: 'rejected' as const } : p
      ));

      // Notify the student who added the patient
      const approverName = user?.fullName || `${user?.firstName} ${user?.lastName}`;
      await notificationService.notifyPatientApprovalStatus(
        patientData.added_by,
        patientId,
        patientName,
        false,
        approverName
      );

      console.log('Patient rejected and notification sent');
    } catch (error) {
      console.error('Error rejecting patient:', error);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100">Patients</h2>
          <p className="text-slate-600 dark:text-slate-400 mt-1">
            Manage and view your patient list
          </p>
        </div>

        <div className="flex items-center gap-3">
          <span className="text-sm text-slate-600 dark:text-slate-400">
            {filteredPatients.length} of {patients.length} patients
          </span>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 p-6">
        <div className="flex flex-col sm:flex-row gap-4">
          {/* Search */}
          <div className="flex-1">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-slate-400 dark:text-slate-500" />
              </div>
              <input
                type="text"
                placeholder="Search patients by name, email, or phone..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="block w-full pl-10 pr-3 py-3 border border-slate-300 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500"
              />
            </div>
          </div>
          {/* Status Filter */}
          <div className="sm:w-48">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Filter className="h-5 w-5 text-slate-400 dark:text-slate-500" />
              </div>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as typeof statusFilter)}
                className="block w-full pl-10 pr-3 py-3 border border-slate-300 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100"
              >
                <option value="all">All Status</option>
                <option value="approved">Approved</option>
                <option value="pending">Pending</option>
                <option value="rejected">Rejected</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Patient List */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden">
        {filteredPatients.length === 0 ? (
          <div className="p-12 text-center">
            <User className="h-12 w-12 text-slate-300 dark:text-slate-600 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-slate-900 dark:text-slate-100 mb-2">No patients found</h3>
            <p className="text-slate-600 dark:text-slate-400">
              {searchTerm || statusFilter !== 'all'
                ? 'Try adjusting your search or filter criteria'
                : 'Start by adding your first patient'
              }
            </p>
          </div>
        ) : (
          <div className="divide-y divide-slate-200 dark:divide-slate-700">
            {filteredPatients.map((patient) => (
              <div
                key={patient.id}
                className={`p-6 transition-colors ${
                  patient.status === 'approved' || canApprove
                    ? 'hover:bg-slate-50 dark:hover:bg-slate-700/50 cursor-pointer'
                    : 'cursor-not-allowed opacity-75'
                }`}
                onClick={() => handlePatientClick(patient)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-4 mb-3">
                      <div className="h-12 w-12 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center flex-shrink-0">
                        <User className="h-6 w-6 text-blue-600 dark:text-blue-300" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-3 mb-1">
                          <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 truncate">
                            {patient.firstName} {patient.lastName}
                          </h3>
                          {getStatusBadge(patient.status)}
                          {canApprove && patient.status === 'pending' && (
                            <div className="flex gap-2">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleApprovePatient(patient.id, patient.firstName + ' ' + patient.lastName);
                                }}
                                className="px-3 py-1 text-xs font-medium rounded-md bg-emerald-600 text-white hover:bg-emerald-700 transition-colors"
                              >
                                Approve
                              </button>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleRejectPatient(patient.id, patient.firstName + ' ' + patient.lastName);
                                }}
                                className="px-3 py-1 text-xs font-medium rounded-md bg-red-600 text-white hover:bg-red-700 transition-colors"
                              >
                                Reject
                              </button>
                            </div>
                          )}
                        </div>
                        <p className="text-sm text-slate-600 dark:text-slate-400">
                          Age {calculateAge(patient.dateOfBirth)} • {patient.treatmentCount} treatments
                          {patient.addedByName && ` • Added by: ${patient.addedByName}`}
                          {patient.approvedByName && patient.status === 'approved' && ` • Approved by: ${patient.approvedByName}`}
                        </p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
                      <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
                        <Mail className="h-4 w-4 flex-shrink-0" />
                        <span className="truncate">{patient.email}</span>
                      </div>
                      <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
                        <Phone className="h-4 w-4 flex-shrink-0" />
                        <span>{patient.phone}</span>
                      </div>
                      <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
                        <Calendar className="h-4 w-4 flex-shrink-0" />
                        <span>
                          {patient.lastVisit
                            ? `Last visit: ${new Date(patient.lastVisit).toLocaleDateString()}`
                            : `Added: ${new Date(patient.addedDate).toLocaleDateString()}`
                          }
                        </span>
                      </div>
                    </div>

                    {patient.status === 'pending' && !canApprove && (
                      <div className="mt-3 p-3 bg-amber-50 dark:bg-amber-900/30 border border-amber-200 dark:border-amber-800 rounded-lg">
                        <p className="text-sm text-amber-800 dark:text-amber-300">
                          ⏳ <strong>Awaiting Approval:</strong> This patient is pending supervisor approval. You cannot view details or add treatments until approved. You'll be notified once the decision is made.
                        </p>
                      </div>
                    )}
                    {patient.status === 'pending' && canApprove && (
                      <div className="mt-3 p-3 bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-800 rounded-lg">
                        <p className="text-sm text-blue-800 dark:text-blue-300">
                          📋 Review patient information and approve or reject to notify the student.
                        </p>
                      </div>
                    )}
                    {patient.status === 'rejected' && !canApprove && (
                      <div className="mt-3 p-3 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-lg">
                        <p className="text-sm text-red-800 dark:text-red-300">
                          ❌ <strong>Rejected:</strong> This patient was not approved. Please contact your supervisor for details and guidance on next steps.
                        </p>
                      </div>
                    )}
                  </div>

                  {(patient.status === 'approved' || canApprove) && (
                    <div className="ml-4 flex-shrink-0">
                      <ChevronRight className="h-5 w-5 text-slate-400 dark:text-slate-500" />
                    </div>
                  )}
                  {patient.status !== 'approved' && !canApprove && (
                    <div className="ml-4 flex-shrink-0">
                      <div className="h-8 w-8 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center">
                        <span className="text-slate-400 dark:text-slate-500 text-xs">🔒</span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default PatientList;
