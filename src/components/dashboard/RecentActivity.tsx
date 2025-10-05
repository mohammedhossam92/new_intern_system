import React from 'react';
import { Clock, User, FileText, Calendar, CheckCircle, AlertTriangle } from 'lucide-react';

interface Activity {
  id: string;
  type: 'treatment' | 'patient' | 'appointment' | 'note';
  title: string;
  description: string;
  timestamp: string;
  status?: 'completed' | 'pending' | 'cancelled';
}

const RecentActivity: React.FC = () => {
  const activities: Activity[] = [
    {
      id: '1',
      type: 'treatment',
      title: 'Root Canal Treatment',
      description: 'Completed RCT for Sarah Johnson (Tooth #16)',
      timestamp: '2024-01-28T14:30:00Z',
      status: 'completed'
    },
    {
      id: '2',
      type: 'patient',
      title: 'New Patient Added',
      description: 'Emma Davis registered and pending approval',
      timestamp: '2024-01-28T11:15:00Z',
      status: 'pending'
    },
    {
      id: '3',
      type: 'appointment',
      title: 'Appointment Scheduled',
      description: 'Crown cementation for Michael Chen tomorrow at 10:30 AM',
      timestamp: '2024-01-28T09:45:00Z'
    },
    {
      id: '4',
      type: 'note',
      title: 'Treatment Note Added',
      description: 'Updated progress notes for James Wilson',
      timestamp: '2024-01-27T16:20:00Z'
    },
    {
      id: '5',
      type: 'treatment',
      title: 'Scaling Completed',
      description: 'Routine scaling for Lisa Brown',
      timestamp: '2024-01-27T13:00:00Z',
      status: 'completed'
    }
  ];

  const getIcon = (type: Activity['type']) => {
    switch (type) {
      case 'treatment':
        return <FileText className="h-5 w-5 text-blue-600 dark:text-blue-400" />;
      case 'patient':
        return <User className="h-5 w-5 text-green-600 dark:text-green-400" />;
      case 'appointment':
        return <Calendar className="h-5 w-5 text-purple-600 dark:text-purple-400" />;
      case 'note':
        return <FileText className="h-5 w-5 text-orange-600 dark:text-orange-400" />;
    }
  };

  const getStatusIcon = (status?: Activity['status']) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'pending':
        return <Clock className="h-4 w-4 text-amber-500" />;
      case 'cancelled':
        return <AlertTriangle className="h-4 w-4 text-red-500" />;
      default:
        return null;
    }
  };

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));

    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${diffInHours}h ago`;
    if (diffInHours < 48) return 'Yesterday';
    return date.toLocaleDateString();
  };

  return (
    <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">Recent Activity</h3>
        <button className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium">
          View All
        </button>
      </div>

      <div className="space-y-4">
        {activities.map((activity) => (
          <div key={activity.id} className="flex items-start gap-4 p-3 hover:bg-slate-50 dark:hover:bg-slate-700/60 rounded-lg transition-colors">
            <div className="flex-shrink-0 mt-0.5">
              {getIcon(activity.type)}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between mb-1">
                <h4 className="text-sm font-medium text-slate-900 dark:text-slate-100 truncate">
                  {activity.title}
                </h4>
                <div className="flex items-center gap-2">
                  {getStatusIcon(activity.status)}
                  <span className="text-xs text-slate-500 dark:text-slate-400 flex-shrink-0">
                    {formatTime(activity.timestamp)}
                  </span>
                </div>
              </div>
              <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                {activity.description}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default RecentActivity;
