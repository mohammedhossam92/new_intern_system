import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';

const SupervisorProfile: React.FC = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<string>('Overview');

  // Mock supervisor data
  const supervisorData = {
    id: user?.id || '3',
    name: user?.fullName || 'Dr. Michael Chen',
    title: 'Senior Dental Supervisor',
    department: 'Restorative Dentistry',
    email: user?.email || 'supervisor@dental.com',
    phone: user?.mobile || '+1567891234',
    university: user?.university || 'University of Dental Sciences',
    specialization: 'Prosthodontics',
    yearsOfExperience: 15,
    bio: 'Dr. Michael Chen is a senior dental supervisor with over 15 years of experience in prosthodontics. He specializes in complex restorative cases and has mentored numerous dental students throughout his career.',
    assignedStudents: 12,
    activeCases: 28,
    pendingApprovals: 5,
    completedCases: 143,
    education: [
      { degree: 'Doctor of Dental Surgery (DDS)', institution: 'Harvard School of Dental Medicine', year: '2005' },
      { degree: 'Prosthodontics Residency', institution: 'University of California, San Francisco', year: '2008' },
      { degree: 'Bachelor of Science in Biology', institution: 'Stanford University', year: '2001' },
    ],
    certifications: [
      { name: 'Board Certified Prosthodontist', issuer: 'American Board of Prosthodontics', year: '2010' },
      { name: 'Advanced Implant Dentistry', issuer: 'International Congress of Oral Implantologists', year: '2012' },
      { name: 'Digital Dentistry Certification', issuer: 'American College of Prosthodontists', year: '2015' },
    ],
    publications: [
      { title: 'Advances in Digital Prosthodontics: A Review', journal: 'Journal of Prosthetic Dentistry', year: '2020' },
      { title: 'Clinical Outcomes of CAD/CAM Restorations: A 5-Year Study', journal: 'International Journal of Dentistry', year: '2018' },
      { title: 'Student Mentorship in Dental Education', journal: 'Journal of Dental Education', year: '2016' },
    ],
  };

  const tabs = ['Overview', 'Education & Certifications', 'Publications', 'Students'];

  // Mock assigned students data
  const assignedStudents = [
    { id: 1, name: 'John Smith', year: '3rd Year', cases: 5, lastActive: '2 hours ago' },
    { id: 2, name: 'Emily Johnson', year: '4th Year', cases: 8, lastActive: '1 day ago' },
    { id: 3, name: 'Michael Brown', year: '3rd Year', cases: 3, lastActive: '3 hours ago' },
    { id: 4, name: 'Sarah Davis', year: '5th Year', cases: 7, lastActive: 'Just now' },
    { id: 5, name: 'David Wilson', year: '4th Year', cases: 5, lastActive: '5 hours ago' },
  ];

  const renderTabContent = () => {
    switch (activeTab) {
      case 'Overview':
        return (
          <div className="space-y-6">
            <div className="bg-white dark:bg-slate-800 shadow overflow-hidden rounded-lg">
              <div className="px-4 py-5 sm:px-6 border-b border-gray-200 dark:border-gray-700">
                <h3 className="text-lg leading-6 font-medium text-gray-900 dark:text-white">Supervisor Information</h3>
                <p className="mt-1 max-w-2xl text-sm text-gray-500 dark:text-gray-400">Personal details and application.</p>
              </div>
              <div className="px-4 py-5 sm:p-6">
                <dl className="grid grid-cols-1 gap-x-4 gap-y-6 sm:grid-cols-2">
                  <div>
                    <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Full name</dt>
                    <dd className="mt-1 text-sm text-gray-900 dark:text-white">{supervisorData.name}</dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Title</dt>
                    <dd className="mt-1 text-sm text-gray-900 dark:text-white">{supervisorData.title}</dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Department</dt>
                    <dd className="mt-1 text-sm text-gray-900 dark:text-white">{supervisorData.department}</dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Specialization</dt>
                    <dd className="mt-1 text-sm text-gray-900 dark:text-white">{supervisorData.specialization}</dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Email address</dt>
                    <dd className="mt-1 text-sm text-gray-900 dark:text-white">{supervisorData.email}</dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Phone number</dt>
                    <dd className="mt-1 text-sm text-gray-900 dark:text-white">{supervisorData.phone}</dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">University</dt>
                    <dd className="mt-1 text-sm text-gray-900 dark:text-white">{supervisorData.university}</dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Years of experience</dt>
                    <dd className="mt-1 text-sm text-gray-900 dark:text-white">{supervisorData.yearsOfExperience}</dd>
                  </div>
                </dl>
              </div>
            </div>

            <div className="bg-white dark:bg-slate-800 shadow overflow-hidden rounded-lg">
              <div className="px-4 py-5 sm:px-6 border-b border-gray-200 dark:border-gray-700">
                <h3 className="text-lg leading-6 font-medium text-gray-900 dark:text-white">Biography</h3>
              </div>
              <div className="px-4 py-5 sm:p-6">
                <p className="text-sm text-gray-900 dark:text-white">{supervisorData.bio}</p>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
              <div className="bg-white dark:bg-slate-800 overflow-hidden shadow rounded-lg">
                <div className="px-4 py-5 sm:p-6">
                  <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">Assigned Students</dt>
                  <dd className="mt-1 text-3xl font-semibold text-gray-900 dark:text-white">{supervisorData.assignedStudents}</dd>
                </div>
              </div>
              <div className="bg-white dark:bg-slate-800 overflow-hidden shadow rounded-lg">
                <div className="px-4 py-5 sm:p-6">
                  <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">Active Cases</dt>
                  <dd className="mt-1 text-3xl font-semibold text-gray-900 dark:text-white">{supervisorData.activeCases}</dd>
                </div>
              </div>
              <div className="bg-white dark:bg-slate-800 overflow-hidden shadow rounded-lg">
                <div className="px-4 py-5 sm:p-6">
                  <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">Pending Approvals</dt>
                  <dd className="mt-1 text-3xl font-semibold text-gray-900 dark:text-white">{supervisorData.pendingApprovals}</dd>
                </div>
              </div>
              <div className="bg-white dark:bg-slate-800 overflow-hidden shadow rounded-lg">
                <div className="px-4 py-5 sm:p-6">
                  <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">Completed Cases</dt>
                  <dd className="mt-1 text-3xl font-semibold text-gray-900 dark:text-white">{supervisorData.completedCases}</dd>
                </div>
              </div>
            </div>
          </div>
        );
      case 'Education & Certifications':
        return (
          <div className="space-y-6">
            <div className="bg-white dark:bg-slate-800 shadow overflow-hidden rounded-lg">
              <div className="px-4 py-5 sm:px-6 border-b border-gray-200 dark:border-gray-700">
                <h3 className="text-lg leading-6 font-medium text-gray-900 dark:text-white">Education</h3>
              </div>
              <div className="px-4 py-5 sm:p-6">
                <ul className="divide-y divide-gray-200 dark:divide-gray-700">
                  {supervisorData.education.map((edu, index) => (
                    <li key={index} className="py-4">
                      <div className="flex flex-col space-y-1">
                        <div className="text-sm font-medium text-gray-900 dark:text-white">{edu.degree}</div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">{edu.institution}</div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">{edu.year}</div>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="bg-white dark:bg-slate-800 shadow overflow-hidden rounded-lg">
              <div className="px-4 py-5 sm:px-6 border-b border-gray-200 dark:border-gray-700">
                <h3 className="text-lg leading-6 font-medium text-gray-900 dark:text-white">Certifications</h3>
              </div>
              <div className="px-4 py-5 sm:p-6">
                <ul className="divide-y divide-gray-200 dark:divide-gray-700">
                  {supervisorData.certifications.map((cert, index) => (
                    <li key={index} className="py-4">
                      <div className="flex flex-col space-y-1">
                        <div className="text-sm font-medium text-gray-900 dark:text-white">{cert.name}</div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">{cert.issuer}</div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">{cert.year}</div>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        );
      case 'Publications':
        return (
          <div className="bg-white dark:bg-slate-800 shadow overflow-hidden rounded-lg">
            <div className="px-4 py-5 sm:px-6 border-b border-gray-200 dark:border-gray-700">
              <h3 className="text-lg leading-6 font-medium text-gray-900 dark:text-white">Publications</h3>
            </div>
            <div className="px-4 py-5 sm:p-6">
              <ul className="divide-y divide-gray-200 dark:divide-gray-700">
                {supervisorData.publications.map((pub, index) => (
                  <li key={index} className="py-4">
                    <div className="flex flex-col space-y-1">
                      <div className="text-sm font-medium text-gray-900 dark:text-white">{pub.title}</div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">{pub.journal}</div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">{pub.year}</div>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        );
      case 'Students':
        return (
          <div className="bg-white dark:bg-slate-800 shadow overflow-hidden rounded-lg">
            <div className="px-4 py-5 sm:px-6 border-b border-gray-200 dark:border-gray-700">
              <h3 className="text-lg leading-6 font-medium text-gray-900 dark:text-white">Assigned Students</h3>
              <p className="mt-1 max-w-2xl text-sm text-gray-500 dark:text-gray-400">Students currently under supervision</p>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead className="bg-gray-50 dark:bg-slate-700">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Name</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Year</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Active Cases</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Last Active</th>
                    <th scope="col" className="relative px-6 py-3">
                      <span className="sr-only">View</span>
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-slate-800 divide-y divide-gray-200 dark:divide-gray-700">
                  {assignedStudents.map((student) => (
                    <tr key={student.id} className="hover:bg-gray-50 dark:hover:bg-slate-700">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="h-10 w-10 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center">
                            <span className="text-blue-600 dark:text-blue-200 font-medium">{student.name.charAt(0)}</span>
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900 dark:text-white">{student.name}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900 dark:text-white">{student.year}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900 dark:text-white">{student.cases}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                        {student.lastActive}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <a href="#" className="text-blue-600 dark:text-blue-400 hover:text-blue-900 dark:hover:text-blue-300">View Profile</a>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
        <div className="flex items-center">
          <div className="h-16 w-16 rounded-full bg-blue-600 flex items-center justify-center text-white text-2xl font-bold">
            {supervisorData.name.charAt(0)}
          </div>
          <div className="ml-4">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{supervisorData.name}</h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">{supervisorData.title} • {supervisorData.department}</p>
          </div>
        </div>
        <div className="mt-4 md:mt-0 flex space-x-3">
          <button className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
            Edit Profile
          </button>
          <button className="inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 text-sm font-medium rounded-md text-gray-700 dark:text-gray-300 bg-white dark:bg-slate-700 hover:bg-gray-50 dark:hover:bg-slate-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
            Message
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200 dark:border-gray-700">
        <nav className="-mb-px flex space-x-8">
          {tabs.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`${activeTab === tab
                ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300 dark:hover:border-gray-600'
                } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
            >
              {tab}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab content */}
      <div className="mt-6">
        {renderTabContent()}
      </div>
    </div>
  );
};

export default SupervisorProfile;