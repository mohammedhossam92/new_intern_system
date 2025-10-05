import React from 'react';
import { UserPlus, Calendar, BarChart3, Users } from 'lucide-react';

interface QuickActionsProps {
  onActionClick: (action: string) => void;
}

const QuickActions: React.FC<QuickActionsProps> = ({ onActionClick }) => {
  const actions = [
    {
      id: 'add-patient',
      label: 'Add Patient',
      icon: UserPlus,
      color: 'bg-blue-500 hover:bg-blue-600',
      description: 'Register a new patient'
    },
    {
      id: 'schedule-appointment',
      label: 'Schedule',
      icon: Calendar,
      color: 'bg-green-500 hover:bg-green-600',
      description: 'Book an appointment'
    },
    {
      id: 'view-statistics',
      label: 'Statistics',
      icon: BarChart3,
      color: 'bg-purple-500 hover:bg-purple-600',
      description: 'View treatment stats'
    },
    {
      id: 'recent-patients',
      label: 'Patients',
      icon: Users,
      color: 'bg-orange-500 hover:bg-orange-600',
      description: 'View patient list'
    }
  ];

  return (
    <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 p-6">
      <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-4">Quick Actions</h3>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {actions.map((action) => {
          const Icon = action.icon;
          return (
            <button
              key={action.id}
              onClick={() => onActionClick(action.id)}
              className={`${action.color} text-white p-4 rounded-xl transition-all duration-200 hover:scale-105 hover:shadow-lg group`}
            >
              <div className="flex flex-col items-center text-center">
                <Icon className="h-8 w-8 mb-2 group-hover:scale-110 transition-transform" />
                <span className="font-medium text-sm">{action.label}</span>
                <span className="text-xs opacity-90 mt-1">{action.description}</span>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default QuickActions;
