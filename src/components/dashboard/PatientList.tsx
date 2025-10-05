import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Filter, User, Phone, Mail, Calendar, ChevronRight, Clock, CheckCircle, AlertCircle } from 'lucide-react';
import { supabase, isMockSupabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';

interface Patient {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  dateOfBirth: string;
  status: 'pending' | 'approved' | 'rejected';
  addedDate: string;
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
  created_by: string;
}

const PatientList: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all');
  const [patients, setPatients] = useState<Patient[]>([]);
  const canApprove = user && (user.role === 'Supervisor' || user.role === 'Admin' || user.role === 'Doctor');

  useEffect(() => {
    const loadPatients = async () => {
      if (!user) return;
      let response;
      if (isMockSupabase) {
        response = await supabase.from('patients').select('*').execute();
      } else {
        response = await supabase.from('patients').select('*');
      }
  const data = (response?.data as unknown as PatientRow[]) || [];
      const mapped: Patient[] = data
        .filter(p => {
          if (user.role === 'Intern/Student') return p.created_by === user.id;
          return true; // approvers see all
        })
        .map(p => ({
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
    };
    loadPatients();
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
    if (patient.status === 'approved' || canApprove) {
      navigate(`/patient/${patient.id}`);
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
                className={`p-6 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors ${
                  patient.status === 'approved' ? 'cursor-pointer' : 'cursor-default'
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
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                (async () => {
                                  if (isMockSupabase) {
                                    await supabase.from('patients').update({ status: 'approved' }).eq('id', patient.id).execute();
                                  } else {
                                    await supabase.from('patients').update({ status: 'approved' }).eq('id', patient.id);
                                  }
                                  setPatients(prev => prev.map(p => p.id === patient.id ? { ...p, status: 'approved' } : p));
                                })();
                              }}
                              className="px-2 py-0.5 text-xs rounded-md bg-emerald-600 text-white hover:bg-emerald-700"
                            >
                              Approve
                            </button>
                          )}
                        </div>
                        <p className="text-sm text-slate-600 dark:text-slate-400">
                          Age {calculateAge(patient.dateOfBirth)} • {patient.treatmentCount} treatments
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

                    {patient.status === 'pending' && (
                      <div className="mt-3 p-3 bg-amber-50 dark:bg-amber-900/30 border border-amber-200 dark:border-amber-800 rounded-lg">
                        <p className="text-sm text-amber-800 dark:text-amber-300">
                          This patient is awaiting admin approval before treatment can begin.
                        </p>
                      </div>
                    )}
                  </div>

                  {(patient.status === 'approved' || canApprove) && (
                    <div className="ml-4 flex-shrink-0">
                      <ChevronRight className="h-5 w-5 text-slate-400 dark:text-slate-500" />
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
