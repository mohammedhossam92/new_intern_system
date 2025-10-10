import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  User,
  Mail,
  Phone,
  Calendar,
  MapPin,
  FileText,
  Plus,
  Filter,
  Clock,
  CheckCircle,
  AlertTriangle
} from 'lucide-react';
import DashboardLayout from './DashboardLayout';
import ToothChart from './ToothChart';
import TreatmentModal from './TreatmentModal';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import { notificationService } from '../../services/notificationService';

interface Treatment {
  id: string;
  toothNumber: number;
  type: string;
  startDate: string;
  endDate?: string;
  status: 'completed' | 'in_progress' | 'planned';
  notes: string;
  priority?: 'low' | 'medium' | 'high';
  approvalStatus?: 'pending' | 'approved' | 'rejected';
}

interface Patient {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  dateOfBirth: string;
  address: string;
  emergencyContact: string;
  emergencyPhone: string;
  medicalHistory: string;
  allergies: string;
  notes: string;
  status?: 'pending' | 'approved' | 'rejected';
}

const PatientProfile: React.FC = () => {
  const { patientId } = useParams<{ patientId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'overview' | 'treatments' | 'notes'>('overview');
  const [selectedTooth, setSelectedTooth] = useState<number | null>(null);
  const [showAddTreatment, setShowAddTreatment] = useState(false);
  const [treatments, setTreatments] = useState<Treatment[]>([]);
  const [treatmentFilter, setTreatmentFilter] = useState<'all' | 'completed' | 'in_progress' | 'planned'>('all');

  const [patient, setPatient] = useState<Patient | null>(null);
  const isStudent = user?.role === 'Intern/Student';
  const canApprove = user?.role === 'Admin' || user?.role === 'Doctor';

  // Load patient and treatments
  useEffect(() => {
    const load = async () => {
      if (!patientId) return;
      const { data: p } = await supabase
        .from('patients')
        .select('*')
        .eq('id', patientId)
        .single();
      if (!p) {
        navigate('/dashboard');
        return;
      }
      setPatient({
        id: p.id,
        firstName: p.first_name,
        lastName: p.last_name,
        email: p.email,
        phone: p.phone,
        dateOfBirth: p.date_of_birth,
        address: (p.address as string) || '',
        emergencyContact: (p.emergency_contact as string) || '',
        emergencyPhone: (p.emergency_phone as string) || '',
        medicalHistory: (p.medical_history as string) || '',
        allergies: (p.allergies as string) || '',
        notes: (p.notes as string) || '',
        status: (p.status as 'pending' | 'approved' | 'rejected') || 'pending',
      });

      // Load treatments; students only see approved
      const { data: tData } = await supabase
        .from('treatments')
        .select('*')
        .eq('patient_id', patientId);
      const rows = (tData as unknown as Array<Record<string, unknown>>) || [];
      const mapped: Treatment[] = rows
        .filter(t => (isStudent ? (t.approval_status as string) === 'approved' : true))
        .map((t) => ({
          id: t.id as string,
          toothNumber: t.tooth_number as number,
          type: t.type as string,
          startDate: t.start_date as string,
          endDate: (t.end_date as string) || undefined,
          status: (t.status as 'completed' | 'in_progress' | 'planned'),
          notes: (t.notes as string) || '',
          approvalStatus: (t.approval_status as 'pending' | 'approved' | 'rejected') || 'pending',
        }));
      setTreatments(mapped);
    };
    load();
  }, [patientId, navigate, isStudent]);


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

  const getStatusBadge = (status: Treatment['status']) => {
    switch (status) {
      case 'completed':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400">
            <CheckCircle className="h-3 w-3" />
            Completed
          </span>
        );
      case 'in_progress':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400">
            <Clock className="h-3 w-3" />
            In Progress
          </span>
        );
      case 'planned':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400">
            <AlertTriangle className="h-3 w-3" />
            Planned
          </span>
        );
    }
  };

  const filteredTreatments = treatments.filter(treatment => {
    if (treatmentFilter === 'all') return true;
    return treatment.status === treatmentFilter;
  });

  const getApprovalBadge = (status?: 'pending' | 'approved' | 'rejected') => {
    if (status === 'approved') {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400">
          <CheckCircle className="h-3 w-3" />
          Approved
        </span>
      );
    }
    if (status === 'pending') {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400">
          <AlertTriangle className="h-3 w-3" />
          Pending Approval
        </span>
      );
    }
    if (status === 'rejected') {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-rose-100 text-rose-800 dark:bg-rose-900/30 dark:text-rose-400">
          Rejected
        </span>
      );
    }
    return null;
  };

  const handleToothSelect = (toothNumber: number) => {
    setSelectedTooth(toothNumber);
    setShowAddTreatment(true);
  };

  const handleSaveTreatment = async (treatment: Treatment) => {
    if (!patientId || !user) return;
    // Insert treatment as pending approval; do not add to visible list yet
    const { data: ins } = await supabase
      .from('treatments')
      .insert({
        patient_id: patientId,
        student_id: user.id,  // Fixed: use student_id instead of created_by
        treatment_type: treatment.type,  // Fixed: use treatment_type instead of type
        description: treatment.notes || 'Treatment',  // Fixed: added required description field
        teeth_numbers: [treatment.toothNumber],  // Fixed: use teeth_numbers array
        status: 'pending',  // Fixed: use valid status from CHECK constraint
        start_date: treatment.startDate,
        end_date: treatment.endDate,
        notes: treatment.notes,
      })
      .select()
      .single();
    // Optionally show a toast that treatment is pending approval
    if (ins && !isStudent) {
      const mapped: Treatment = {
        id: ins.id as string,
        toothNumber: ins.tooth_number as number,
        type: ins.type as string,
        startDate: ins.start_date as string,
        endDate: (ins.end_date as string) || undefined,
        status: ins.status as 'completed' | 'in_progress' | 'planned',
        notes: (ins.notes as string) || '',
        priority: ins.priority as 'low' | 'medium' | 'high',
        approvalStatus: ins.approval_status as 'pending' | 'approved' | 'rejected'
      };
      setTreatments(prev => [mapped, ...prev]);
    }
  };

  const approvePatient = async () => {
    if (!patientId || !patient) return;

    // Get patient data to find the student who added it
    const { data: patientData } = await supabase
      .from('patients')
      .select('added_by')
      .eq('id', patientId)
      .single();

    if (!patientData) return;

    // Update patient status
    const { error } = await supabase
      .from('patients')
      .update({
        status: 'approved',
        approved_by: user?.id,
        approved_at: new Date().toISOString()
      })
      .eq('id', patientId);

    if (error) {
      console.error('Error approving patient:', error);
      return;
    }

    // Update local state
    setPatient(prev => prev ? { ...prev, status: 'approved' as const } : prev);

    // Send notification to the student
    const approverName = user?.fullName || `${user?.firstName} ${user?.lastName}`;
    const patientName = `${patient.firstName} ${patient.lastName}`;

    await notificationService.notifyPatientApprovalStatus(
      patientData.added_by,
      patientId,
      patientName,
      true,
      approverName
    );

    console.log('Patient approved and notification sent to student');
  };

  const approveTreatment = async (treatmentId: string) => {
    await supabase
      .from('treatments')
      .update({ approval_status: 'approved' })
      .eq('id', treatmentId);
    setTreatments(prev => prev.map(t => t.id === treatmentId ? { ...t, approvalStatus: 'approved' } : t));
  };
  if (!patient) {
    return (
      <div className="p-6 text-slate-600 dark:text-slate-300">Loading patient...</div>
    );
  }

  const handleBack = () => {
    // Navigate back to dashboard with patients tab active
    navigate('/dashboard', { state: { activeTab: 'patients' } });
  };

  // If student and patient not approved, block access
  if (patient && isStudent && patient.status !== 'approved') {
    return (
      <DashboardLayout>
        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 p-8 text-center">
          <h2 className="text-xl font-semibold text-slate-900 dark:text-white mb-2">Access pending approval</h2>
          <p className="text-slate-600 dark:text-slate-300 mb-6">This patient profile is not yet approved by a supervisor or admin.</p>
          <button
            onClick={handleBack}
            className="px-4 py-2 rounded-lg bg-slate-900 text-white dark:bg-slate-200 dark:text-slate-900 hover:opacity-90"
          >
            Back
          </button>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <button
          onClick={handleBack}
          className="flex items-center gap-2 px-4 py-2 rounded-lg text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-700 transition-all"
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </button>
        <div className="h-6 w-px bg-slate-300 dark:bg-slate-600" />
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
            {patient.firstName} {patient.lastName}
          </h1>
          <div className="flex items-center gap-3">
            <p className="text-slate-600 dark:text-slate-400">Patient Profile</p>
            {getApprovalBadge(patient.status)}
            {canApprove && patient.status === 'pending' && (
              <button
                onClick={approvePatient}
                className="ml-2 px-2.5 py-1 text-xs rounded-md bg-emerald-600 text-white hover:bg-emerald-700"
              >
                Approve Patient
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Patient Status Banner for Approvers */}
      {canApprove && patient.status === 'pending' && (
        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <AlertTriangle className="h-5 w-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <h3 className="text-sm font-semibold text-blue-900 dark:text-blue-300 mb-1">
                Patient Pending Approval
              </h3>
              <p className="text-sm text-blue-800 dark:text-blue-400 mb-3">
                This patient was added by a student and requires approval before they can add treatments. Review the patient information below.
              </p>
              <button
                onClick={approvePatient}
                className="px-4 py-2 text-sm font-medium rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition-colors"
              >
                Approve Patient
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="border-b border-slate-200 dark:border-slate-700">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab('overview')}
            className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
              activeTab === 'overview'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300 dark:text-slate-400 dark:hover:text-slate-200 dark:hover:border-slate-600'
            }`}
          >
            Overview
          </button>
          <button
            onClick={() => setActiveTab('treatments')}
            className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
              activeTab === 'treatments'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300 dark:text-slate-400 dark:hover:text-slate-200 dark:hover:border-slate-600'
            }`}
          >
            Treatments
          </button>
          <button
            onClick={() => setActiveTab('notes')}
            className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
              activeTab === 'notes'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300 dark:text-slate-400 dark:hover:text-slate-200 dark:hover:border-slate-600'
            }`}
          >
            Notes
          </button>
        </nav>
      </div>

      {/* Tab Content */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Patient Information */}
          <div className="lg:col-span-2 space-y-6">
            {/* Basic Info */}
            <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 p-6">
              <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">Patient Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center gap-3">
                  <User className="h-5 w-5 text-slate-400 dark:text-slate-500" />
                  <div>
                    <p className="text-sm text-slate-600 dark:text-slate-300">Full Name</p>
                    <p className="font-medium text-slate-900 dark:text-slate-100">{patient.firstName} {patient.lastName}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Calendar className="h-5 w-5 text-slate-400 dark:text-slate-500" />
                  <div>
                    <p className="text-sm text-slate-600 dark:text-slate-300">Age</p>
                    <p className="font-medium text-slate-900 dark:text-slate-100">{calculateAge(patient.dateOfBirth)} years old</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Mail className="h-5 w-5 text-slate-400 dark:text-slate-500" />
                  <div>
                    <p className="text-sm text-slate-600 dark:text-slate-300">Email</p>
                    <p className="font-medium text-slate-900 dark:text-slate-100">{patient.email}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Phone className="h-5 w-5 text-slate-400 dark:text-slate-500" />
                  <div>
                    <p className="text-sm text-slate-600 dark:text-slate-300">Phone</p>
                    <p className="font-medium text-slate-900 dark:text-slate-100">{patient.phone}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3 md:col-span-2">
                  <MapPin className="h-5 w-5 text-slate-400 dark:text-slate-500 mt-0.5" />
                  <div>
                    <p className="text-sm text-slate-600 dark:text-slate-300">Address</p>
                    <p className="font-medium text-slate-900 dark:text-slate-100">{patient.address}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Medical Information */}
            <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 p-6">
              <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">Medical Information</h3>
              <div className="space-y-4">
                <div>
                  <p className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Medical History</p>
                  <p className="text-slate-600 dark:text-slate-300 text-sm leading-relaxed">
                    {patient.medicalHistory || 'No medical history recorded.'}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Allergies</p>
                  <p className="text-slate-600 dark:text-slate-300 text-sm">
                    {patient.allergies || 'No known allergies.'}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Notes</p>
                  <p className="text-slate-600 dark:text-slate-300 text-sm leading-relaxed">
                    {patient.notes || 'No additional notes.'}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Emergency Contact & Stats */}
          <div className="space-y-6">
            {/* Emergency Contact */}
            <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 p-6">
              <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">Emergency Contact</h3>
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <User className="h-5 w-5 text-slate-400 dark:text-slate-500" />
                  <div>
                    <p className="text-sm text-slate-600 dark:text-slate-300">Name</p>
                    <p className="font-medium text-slate-900 dark:text-slate-100">{patient.emergencyContact || 'Not provided'}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Phone className="h-5 w-5 text-slate-400 dark:text-slate-500" />
                  <div>
                    <p className="text-sm text-slate-600 dark:text-slate-300">Phone</p>
                    <p className="font-medium text-slate-900 dark:text-slate-100">{patient.emergencyPhone || 'Not provided'}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Treatment Stats */}
            <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 p-6">
              <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">Treatment Summary</h3>
              <div className="space-y-4">
                <div className="flex justify-between">
                  <span className="text-slate-600 dark:text-slate-300">Total Treatments</span>
                  <span className="font-semibold text-slate-900 dark:text-slate-100">{treatments.length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600 dark:text-slate-300">Completed</span>
                  <span className="font-semibold text-green-600 dark:text-green-400">
                    {treatments.filter(t => t.status === 'completed').length}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600 dark:text-slate-300">In Progress</span>
                  <span className="font-semibold text-blue-600 dark:text-blue-400">
                    {treatments.filter(t => t.status === 'in_progress').length}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600 dark:text-slate-300">Planned</span>
                  <span className="font-semibold text-amber-600 dark:text-amber-400">
                    {treatments.filter(t => t.status === 'planned').length}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'treatments' && (
        <div className="space-y-6">
          {/* Tooth Chart */}
          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Dental Chart</h3>
              <button
                onClick={() => setShowAddTreatment(true)}
                disabled={isStudent && patient.status !== 'approved'}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm font-medium"
              >
                <Plus className="h-4 w-4" />
                Add Treatment
              </button>
            </div>
            <ToothChart treatments={treatments} onToothSelect={handleToothSelect} />
            {isStudent && patient.status !== 'approved' && (
              <div className="mt-4 p-3 bg-amber-50 dark:bg-amber-900/30 border border-amber-200 dark:border-amber-800 rounded-lg">
                <p className="text-sm text-amber-800 dark:text-amber-300">
                  ⏳ <strong>Waiting for Approval:</strong> You cannot add treatments until this patient is approved by a supervisor. You'll receive a notification once approved.
                </p>
              </div>
            )}
          </div>

          {/* Treatment History */}
          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Treatment History</h3>
              <div className="flex items-center gap-2">
                <Filter className="h-4 w-4 text-slate-500 dark:text-slate-400" />
                <select
                  value={treatmentFilter}
                  onChange={(e) => setTreatmentFilter(e.target.value as typeof treatmentFilter)}
                  className="text-sm border border-slate-300 dark:border-slate-600 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-slate-900 dark:text-slate-200"
                >
                  <option value="all">All Treatments</option>
                  <option value="completed">Completed</option>
                  <option value="in_progress">In Progress</option>
                  <option value="planned">Planned</option>
                </select>
              </div>
            </div>

            <div className="space-y-4">
              {filteredTreatments.map((treatment) => (
                <div key={treatment.id} className="border border-slate-200 dark:border-slate-700 rounded-xl p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <div className="flex items-center gap-3 mb-2">
                        <h4 className="font-medium text-slate-900 dark:text-slate-100">
                          Tooth #{treatment.toothNumber} - {treatment.type}
                        </h4>
                        {getStatusBadge(treatment.status)}
                        {getApprovalBadge(treatment.approvalStatus)}
                      </div>
                      <div className="flex items-center gap-4 text-sm text-slate-600 dark:text-slate-300">
                        <span>Started: {new Date(treatment.startDate).toLocaleDateString()}</span>
                        {treatment.endDate && (
                          <span>Completed: {new Date(treatment.endDate).toLocaleDateString()}</span>
                        )}
                      </div>
                    </div>
                    {canApprove && treatment.approvalStatus === 'pending' && (
                      <button
                        onClick={() => approveTreatment(treatment.id)}
                        className="px-3 py-1.5 text-xs font-medium rounded-md bg-emerald-600 text-white hover:bg-emerald-700"
                      >
                        Approve
                      </button>
                    )}
                  </div>
                  {treatment.notes && (
                    <div className="mt-3 p-3 bg-slate-50 dark:bg-slate-700 rounded-lg">
                      <p className="text-sm text-slate-700 dark:text-slate-200">{treatment.notes}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {activeTab === 'notes' && (
        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Patient Notes</h3>
            <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium">
              <Plus className="h-4 w-4" />
              Add Note
            </button>
          </div>

          <div className="space-y-4">
            <div className="border border-slate-200 dark:border-slate-700 rounded-xl p-4">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-3">
                  <div className="h-8 w-8 bg-blue-100 dark:bg-blue-900/40 rounded-full flex items-center justify-center">
                    <FileText className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div>
                    <p className="font-medium text-slate-900 dark:text-slate-100">Initial Consultation</p>
                    <p className="text-sm text-slate-600 dark:text-slate-400">January 15, 2024</p>
                  </div>
                </div>
              </div>
              <p className="text-slate-700 dark:text-slate-200 text-sm leading-relaxed ml-11">
                Patient presented with pain in upper right molar. Clinical examination revealed deep caries in tooth #16.
                Root canal treatment recommended. Patient consented to treatment plan.
              </p>
            </div>

            <div className="border border-slate-200 dark:border-slate-700 rounded-xl p-4">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-3">
                  <div className="h-8 w-8 bg-green-100 dark:bg-green-900/40 rounded-full flex items-center justify-center">
                    <FileText className="h-4 w-4 text-green-600 dark:text-green-400" />
                  </div>
                  <div>
                    <p className="font-medium text-slate-900 dark:text-slate-100">Treatment Progress</p>
                    <p className="text-sm text-slate-600 dark:text-slate-400">January 20, 2024</p>
                  </div>
                </div>
              </div>
              <p className="text-slate-700 dark:text-slate-200 text-sm leading-relaxed ml-11">
                RCT completed successfully. Patient tolerated procedure well with minimal discomfort.
                Temporary restoration placed. Crown preparation scheduled for next week.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Treatment Modal */}
      <TreatmentModal
        isOpen={showAddTreatment}
        onClose={() => {
          setShowAddTreatment(false);
          setSelectedTooth(null);
        }}
        toothNumber={selectedTooth || undefined}
        patientName={`${patient.firstName} ${patient.lastName}`}
        onSave={handleSaveTreatment}
      />
      </div>
    </DashboardLayout>
  );
};

export default PatientProfile;
