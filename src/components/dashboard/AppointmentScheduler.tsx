import React, { useState } from 'react';
import { Calendar, Clock, User, Plus, ChevronLeft, ChevronRight } from 'lucide-react';

interface Appointment {
  id: string;
  patientName: string;
  patientId: string;
  date: string;
  time: string;
  duration: number;
  type: string;
  status: 'scheduled' | 'completed' | 'cancelled' | 'no_show';
  notes?: string;
}

const AppointmentScheduler: React.FC = () => {
  const [currentDate, setCurrentDate] = useState(new Date());

  // Mock appointments data
  const appointments: Appointment[] = [
    {
      id: '1',
      patientName: 'Sarah Johnson',
      patientId: '1',
      date: '2024-01-29',
      time: '09:00',
      duration: 60,
      type: 'Crown Cementation',
      status: 'scheduled'
    },
    {
      id: '2',
      patientName: 'Michael Chen',
      patientId: '2',
      date: '2024-01-29',
      time: '10:30',
      duration: 90,
      type: 'Root Canal Treatment',
      status: 'scheduled'
    },
    {
      id: '3',
      patientName: 'Emma Davis',
      patientId: '3',
      date: '2024-01-30',
      time: '14:00',
      duration: 45,
      type: 'Consultation',
      status: 'scheduled'
    }
  ];

  const timeSlots = [
    '08:00', '08:30', '09:00', '09:30', '10:00', '10:30',
    '11:00', '11:30', '12:00', '12:30', '13:00', '13:30',
    '14:00', '14:30', '15:00', '15:30', '16:00', '16:30',
    '17:00', '17:30'
  ];

  const getWeekDays = (date: Date) => {
    const week = [];
    const startOfWeek = new Date(date);
    startOfWeek.setDate(date.getDate() - date.getDay());

    for (let i = 0; i < 7; i++) {
      const day = new Date(startOfWeek);
      day.setDate(startOfWeek.getDate() + i);
      week.push(day);
    }
    return week;
  };

  const formatDate = (date: Date) => {
    return date.toISOString().split('T')[0];
  };

  const getAppointmentsForDate = (date: string) => {
    return appointments.filter(apt => apt.date === date);
  };

  const getStatusColor = (status: Appointment['status']) => {
    switch (status) {
      case 'scheduled':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'completed':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'cancelled':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'no_show':
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const navigateWeek = (direction: 'prev' | 'next') => {
    const newDate = new Date(currentDate);
    newDate.setDate(currentDate.getDate() + (direction === 'next' ? 7 : -7));
    setCurrentDate(newDate);
  };

  const weekDays = getWeekDays(currentDate);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100">Appointments</h2>
          <p className="text-slate-600 dark:text-slate-400 mt-1">Manage your patient appointments</p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => {/* placeholder for future modal */}}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
          >
            <Plus className="h-4 w-4" />
            New Appointment
          </button>
        </div>
      </div>

      {/* Calendar Controls */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigateWeek('prev')}
              className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
            >
              <ChevronLeft className="h-5 w-5 text-slate-600 dark:text-slate-300" />
            </button>
            <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
              {currentDate.toLocaleDateString('en-US', {
                month: 'long',
                year: 'numeric'
              })}
            </h3>
            <button
              onClick={() => navigateWeek('next')}
              className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
            >
              <ChevronRight className="h-5 w-5 text-slate-600 dark:text-slate-300" />
            </button>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentDate(new Date())}
              className="px-3 py-2 text-sm font-medium text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-slate-100 transition-colors"
            >
              Today
            </button>
          </div>
        </div>

        {/* Week View */}
        <div className="overflow-x-auto">
          <div className="min-w-full">
            {/* Day Headers */}
            <div className="grid grid-cols-8 gap-px bg-slate-200 dark:bg-slate-700 rounded-lg overflow-hidden mb-4">
              <div className="bg-white dark:bg-slate-700 p-3">
                <span className="text-sm font-medium text-slate-600 dark:text-slate-300">Time</span>
              </div>
              {weekDays.map((day, index) => (
                <div key={index} className="bg-white dark:bg-slate-700 p-3 text-center">
                  <div className="text-sm font-medium text-slate-900 dark:text-slate-100">
                    {day.toLocaleDateString('en-US', { weekday: 'short' })}
                  </div>
                  <div className={`text-lg font-bold mt-1 ${
                    formatDate(day) === formatDate(new Date())
                      ? 'text-blue-600 dark:text-blue-400'
                      : 'text-slate-700 dark:text-slate-300'
                  }`}>
                    {day.getDate()}
                  </div>
                </div>
              ))}
            </div>

            {/* Time Slots */}
            <div className="space-y-px">
              {timeSlots.map((time) => (
                <div key={time} className="grid grid-cols-8 gap-px">
                  <div className="bg-slate-50 dark:bg-slate-700 p-3 text-sm text-slate-600 dark:text-slate-300 font-medium">
                    {time}
                  </div>
                  {weekDays.map((day, dayIndex) => {
                    const dateStr = formatDate(day);
                    const dayAppointments = getAppointmentsForDate(dateStr);
                    const timeAppointment = dayAppointments.find(apt => apt.time === time);

                    return (
                      <div key={dayIndex} className="bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 p-2 min-h-[60px]">
                        {timeAppointment && (
                          <div className={`p-2 rounded-lg border text-xs ${getStatusColor(timeAppointment.status)}`}>
                            <div className="font-medium truncate">
                              {timeAppointment.patientName}
                            </div>
                            <div className="truncate mt-1">
                              {timeAppointment.type}
                            </div>
                            <div className="flex items-center gap-1 mt-1">
                              <Clock className="h-3 w-3" />
                              {timeAppointment.duration}min
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Upcoming Appointments */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 p-6">
        <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-4">Upcoming Appointments</h3>
        <div className="space-y-3">
          {appointments
            .filter(apt => new Date(apt.date + 'T' + apt.time) >= new Date())
            .slice(0, 5)
            .map((appointment) => (
              <div key={appointment.id} className="flex items-center justify-between p-4 border border-slate-200 dark:border-slate-600 rounded-xl hover:shadow-sm transition-shadow bg-white dark:bg-slate-700/60">
                <div className="flex items-center gap-4">
                  <div className="h-10 w-10 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
                    <User className="h-5 w-5 text-blue-600 dark:text-blue-300" />
                  </div>
                  <div>
                    <h4 className="font-medium text-slate-900 dark:text-slate-100">{appointment.patientName}</h4>
                    <p className="text-sm text-slate-600 dark:text-slate-400">{appointment.type}</p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400 mb-1">
                    <Calendar className="h-4 w-4" />
                    {new Date(appointment.date).toLocaleDateString()}
                  </div>
                  <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                    <Clock className="h-4 w-4" />
                    {appointment.time} ({appointment.duration}min)
                  </div>
                </div>
              </div>
            ))}
        </div>
      </div>
    </div>
  );
};

export default AppointmentScheduler;
