import React, { useState } from 'react';
import { X, Calendar, FileText, AlertCircle, Save } from 'lucide-react';

interface TreatmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  toothNumber?: number;
  patientName: string;
  onSave: (treatment: any) => void;
}

const TreatmentModal: React.FC<TreatmentModalProps> = ({
  isOpen,
  onClose,
  toothNumber,
  patientName,
  onSave
}) => {
  const [formData, setFormData] = useState({
    type: '',
    startDate: new Date().toISOString().split('T')[0],
    endDate: '',
    status: 'planned' as 'planned' | 'in_progress' | 'completed',
    notes: '',
    priority: 'medium' as 'low' | 'medium' | 'high'
  });

  const treatmentTypes = [
    'Scaling',
    'Root Canal Treatment (RCT)',
    'Composite Filling',
    'Amalgam Filling',
    'Crown Preparation',
    'Crown Cementation',
    'Extraction',
    'Whitening',
    'Orthodontic Treatment',
    'Periodontal Treatment',
    'Implant Placement',
    'Bridge Work'
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const treatment = {
      id: Date.now().toString(),
      toothNumber: toothNumber || 0,
      ...formData
    };
    onSave(treatment);
    onClose();
    // Reset form
    setFormData({
      type: '',
      startDate: new Date().toISOString().split('T')[0],
      endDate: '',
      status: 'planned',
      notes: '',
      priority: 'medium'
    });
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 dark:bg-opacity-70 flex items-center justify-center p-4 z-50">
      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-200 dark:border-slate-700">
          <div>
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Add Treatment</h3>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              {patientName} {toothNumber ? `• Tooth #${toothNumber}` : ''}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
          >
            <X className="h-5 w-5 text-slate-500 dark:text-slate-400" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Treatment Type */}
          <div>
            <label htmlFor="type" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              Treatment Type *
            </label>
            <select
              id="type"
              name="type"
              value={formData.type}
              onChange={handleChange}
              required
              className="block w-full px-3 py-3 border border-slate-300 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors dark:bg-slate-800 dark:text-slate-200"
            >
              <option value="">Select treatment type</option>
              {treatmentTypes.map(type => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>
          </div>

          {/* Priority */}
          <div>
            <label htmlFor="priority" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              Priority
            </label>
            <select
              id="priority"
              name="priority"
              value={formData.priority}
              onChange={handleChange}
              className="block w-full px-3 py-3 border border-slate-300 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors dark:bg-slate-800 dark:text-slate-200"
            >
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
            </select>
          </div>

          {/* Status */}
          <div>
            <label htmlFor="status" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              Status
            </label>
            <select
              id="status"
              name="status"
              value={formData.status}
              onChange={handleChange}
              className="block w-full px-3 py-3 border border-slate-300 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors dark:bg-slate-800 dark:text-slate-200"
            >
              <option value="planned">Planned</option>
              <option value="in_progress">In Progress</option>
              <option value="completed">Completed</option>
            </select>
          </div>

          {/* Start Date */}
          <div>
            <label htmlFor="startDate" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              Start Date *
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Calendar className="h-5 w-5 text-slate-400 dark:text-slate-500" />
              </div>
              <input
                type="date"
                id="startDate"
                name="startDate"
                value={formData.startDate}
                onChange={handleChange}
                required
                className="block w-full pl-10 pr-3 py-3 border border-slate-300 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors dark:bg-slate-800 dark:text-slate-200"
              />
            </div>
          </div>

          {/* End Date */}
          <div>
            <label htmlFor="endDate" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              End Date
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Calendar className="h-5 w-5 text-slate-400 dark:text-slate-500" />
              </div>
              <input
                type="date"
                id="endDate"
                name="endDate"
                value={formData.endDate}
                onChange={handleChange}
                className="block w-full pl-10 pr-3 py-3 border border-slate-300 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors dark:bg-slate-800 dark:text-slate-200"
              />
            </div>
          </div>

          {/* Notes */}
          <div>
            <label htmlFor="notes" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              Treatment Notes
            </label>
            <div className="relative">
              <div className="absolute top-3 left-3 pointer-events-none">
                <FileText className="h-5 w-5 text-slate-400 dark:text-slate-500" />
              </div>
              <textarea
                id="notes"
                name="notes"
                rows={4}
                value={formData.notes}
                onChange={handleChange}
                className="block w-full pl-10 pr-3 py-3 border border-slate-300 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors resize-none dark:bg-slate-800 dark:text-slate-200"
                placeholder="Add any relevant notes about the treatment..."
              />
            </div>
          </div>

          {/* Admin Approval Notice */}
          <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-700 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-amber-600 dark:text-amber-500 flex-shrink-0 mt-0.5" />
              <div>
                <h4 className="text-sm font-medium text-amber-800 dark:text-amber-400">Approval Required</h4>
                <p className="text-sm text-amber-700 dark:text-amber-500 mt-1">
                  This treatment plan will require admin approval before you can begin the procedure.
                </p>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-3 border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-200 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors font-medium"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
            >
              <Save className="h-4 w-4" />
              Save Treatment
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TreatmentModal;
