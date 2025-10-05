import React, { useState, useEffect } from 'react';
import { userService } from '../../services/userService';
import { CheckCircle, XCircle, User } from 'lucide-react';

interface PendingStudent {
  id: string;
  fullName: string;
  email: string;
  university: string;
  mobile: string;
  role: string;
  isApproved: boolean;
}

const StudentApprovalManagement: React.FC = () => {
  const [pendingStudents, setPendingStudents] = useState<PendingStudent[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [successMessage, setSuccessMessage] = useState<string>('');
  const [errorMessage, setErrorMessage] = useState<string>('');

  // Fetch all unapproved students with role 'Intern/Student'
  useEffect(() => {
    const fetchPendingStudents = async () => {
      try {
        setLoading(true);
        const allUsers = await userService.getAllUsers('Intern/Student');
        const unapprovedStudents = allUsers.filter(user => !user.isApproved);
        setPendingStudents(unapprovedStudents);
      } catch (error) {
        console.error('Error fetching pending students:', error);
        setErrorMessage('Failed to load pending student approvals');
      } finally {
        setLoading(false);
      }
    };

    fetchPendingStudents();
  }, []);

  const handleApproveStudent = async (studentId: string) => {
    try {
      const success = await userService.approveUser(studentId);
      
      if (success) {
        // Update the local state to remove the approved student
        setPendingStudents(prevStudents => 
          prevStudents.filter(student => student.id !== studentId)
        );
        setSuccessMessage('Student approved successfully');
        
        // Clear success message after 3 seconds
        setTimeout(() => setSuccessMessage(''), 3000);
      } else {
        setErrorMessage('Failed to approve student');
        
        // Clear error message after 3 seconds
        setTimeout(() => setErrorMessage(''), 3000);
      }
    } catch (error) {
      console.error('Error approving student:', error);
      setErrorMessage('An error occurred while approving the student');
      
      // Clear error message after 3 seconds
      setTimeout(() => setErrorMessage(''), 3000);
    }
  };

  return (
    <div className="max-w-6xl mx-auto">
      <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Student Approval Management</h2>
      
      {/* Success/Error Messages */}
      {successMessage && (
        <div className="mb-4 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
          <div className="flex items-center">
            <CheckCircle className="h-5 w-5 text-green-500 dark:text-green-400 mr-2" />
            <span className="text-green-700 dark:text-green-300">{successMessage}</span>
          </div>
        </div>
      )}
      
      {errorMessage && (
        <div className="mb-4 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
          <div className="flex items-center">
            <XCircle className="h-5 w-5 text-red-500 dark:text-red-400 mr-2" />
            <span className="text-red-700 dark:text-red-300">{errorMessage}</span>
          </div>
        </div>
      )}

      {/* Pending Students List */}
      <div className="bg-white dark:bg-slate-800 shadow overflow-hidden rounded-lg">
        <div className="px-4 py-5 sm:px-6 border-b border-gray-200 dark:border-gray-700">
          <h3 className="text-lg leading-6 font-medium text-gray-900 dark:text-white">Pending Student Approvals</h3>
          <p className="mt-1 max-w-2xl text-sm text-gray-500 dark:text-gray-400">
            Review and approve new student sign-up requests
          </p>
        </div>
        
        {loading ? (
          <div className="px-4 py-12 text-center text-gray-500 dark:text-gray-400">
            Loading pending approvals...
          </div>
        ) : pendingStudents.length === 0 ? (
          <div className="px-4 py-12 text-center text-gray-500 dark:text-gray-400">
            No pending student approvals at this time.
          </div>
        ) : (
          <ul className="divide-y divide-gray-200 dark:divide-gray-700">
            {pendingStudents.map((student) => (
              <li key={student.id} className="px-4 py-4 sm:px-6 hover:bg-gray-50 dark:hover:bg-slate-700">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <div className="h-10 w-10 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center">
                        <User className="h-5 w-5 text-blue-600 dark:text-blue-200" />
                      </div>
                    </div>
                    <div className="ml-4">
                      <div className="text-sm font-medium text-gray-900 dark:text-white">{student.fullName}</div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">
                        <span>{student.email}</span>
                        <span className="mx-2">•</span>
                        <span>{student.university}</span>
                      </div>
                      <div className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                        <span>Phone: {student.mobile}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    <button 
                      onClick={() => handleApproveStudent(student.id)}
                      className="inline-flex items-center px-3 py-1 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                    >
                      Approve
                    </button>
                    <button className="inline-flex items-center px-3 py-1 border border-gray-300 dark:border-gray-600 text-sm font-medium rounded-md text-gray-700 dark:text-gray-300 bg-white dark:bg-slate-700 hover:bg-gray-50 dark:hover:bg-slate-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
                      View Details
                    </button>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default StudentApprovalManagement;