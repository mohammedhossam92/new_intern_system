import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import DashboardLayout from './DashboardLayout';
import StudentProfile from './StudentProfile';
import Statistics from './Statistics';
import AddPatient from './AddPatient';
import PatientList from './PatientList';
import AppointmentScheduler from './AppointmentScheduler';

type TabType = 'profile' | 'statistics' | 'add-patient' | 'patients' | 'appointments';

const Dashboard: React.FC = () => {
  const location = useLocation();
  const [activeTab, setActiveTab] = useState<TabType>(
    location.state?.activeTab || 'profile'
  );

  // Update active tab if navigated from patient profile with state
  useEffect(() => {
    if (location.state?.activeTab) {
      setActiveTab(location.state.activeTab);
    }
  }, [location.state]);

  const renderContent = () => {
    switch (activeTab) {
      case 'profile':
        return <StudentProfile onNavigate={setActiveTab} />;
      case 'statistics':
        return <Statistics />;
      case 'add-patient':
        return <AddPatient />;
      case 'patients':
        return <PatientList />;
      case 'appointments':
        return <AppointmentScheduler />;
      default:
        return <StudentProfile onNavigate={setActiveTab} />;
    }
  };

  return (
    <DashboardLayout activeTab={activeTab} onTabChange={setActiveTab}>
      {renderContent()}
    </DashboardLayout>
  );
};

export default Dashboard;
