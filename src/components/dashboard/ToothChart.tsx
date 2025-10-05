import React from 'react';

interface Treatment {
  id: string;
  toothNumber: number;
  type: string;
  status: 'completed' | 'in_progress' | 'planned';
}

interface ToothChartProps {
  treatments: Treatment[];
  onToothSelect: (toothNumber: number) => void;
}

const ToothChart: React.FC<ToothChartProps> = ({ treatments, onToothSelect }) => {
  // Adult teeth numbering (Universal system)
  const upperTeeth = [18, 17, 16, 15, 14, 13, 12, 11, 21, 22, 23, 24, 25, 26, 27, 28];
  const lowerTeeth = [48, 47, 46, 45, 44, 43, 42, 41, 31, 32, 33, 34, 35, 36, 37, 38];

  const getToothStatus = (toothNumber: number) => {
    const toothTreatments = treatments.filter(t => t.toothNumber === toothNumber);
    if (toothTreatments.length === 0) return 'healthy';

    const hasInProgress = toothTreatments.some(t => t.status === 'in_progress');
    const hasPlanned = toothTreatments.some(t => t.status === 'planned');
    const hasCompleted = toothTreatments.some(t => t.status === 'completed');

    if (hasInProgress) return 'in_progress';
    if (hasPlanned) return 'planned';
    if (hasCompleted) return 'treated';
    return 'healthy';
  };

  const getToothColor = (status: string) => {
    switch (status) {
      case 'healthy':
        return 'fill-white stroke-slate-300 hover:fill-blue-50 hover:stroke-blue-400 dark:fill-slate-800 dark:stroke-slate-600 dark:hover:fill-slate-700 dark:hover:stroke-blue-500';
      case 'treated':
        return 'fill-green-100 stroke-green-400 hover:fill-green-200 dark:fill-green-900/30 dark:stroke-green-500 dark:hover:fill-green-900/50';
      case 'in_progress':
        return 'fill-blue-100 stroke-blue-400 hover:fill-blue-200 dark:fill-blue-900/30 dark:stroke-blue-500 dark:hover:fill-blue-900/50';
      case 'planned':
        return 'fill-amber-100 stroke-amber-400 hover:fill-amber-200 dark:fill-amber-900/30 dark:stroke-amber-500 dark:hover:fill-amber-900/50';
      default:
        return 'fill-white stroke-slate-300 dark:fill-slate-800 dark:stroke-slate-600';
    }
  };

  const renderTooth = (toothNumber: number, index: number, isUpper: boolean) => {
    const status = getToothStatus(toothNumber);
    const colorClass = getToothColor(status);
    const x = index * 40 + 20;
    const y = isUpper ? 20 : 120;

    return (
      <g key={toothNumber}>
        <rect
          x={x}
          y={y}
          width={30}
          height={40}
          rx={8}
          className={`${colorClass} cursor-pointer transition-all duration-200`}
          onClick={() => onToothSelect(toothNumber)}
        />
        <text
          x={x + 15}
          y={y + 25}
          textAnchor="middle"
          className="text-xs font-medium fill-slate-700 dark:fill-slate-300 pointer-events-none"
        >
          {toothNumber}
        </text>
      </g>
    );
  };

  return (
    <div className="space-y-6">
      {/* Dental Chart - Made responsive with horizontal scroll for mobile */}
      <div className="overflow-x-auto">
        <div className="flex justify-center min-w-[680px]">
          <svg width="680" height="200" className="border border-slate-200 dark:border-slate-700 rounded-lg bg-slate-50 dark:bg-slate-900">
            {/* Upper teeth */}
            {upperTeeth.map((tooth, index) => renderTooth(tooth, index, true))}

            {/* Lower teeth */}
            {lowerTeeth.map((tooth, index) => renderTooth(tooth, index, false))}

            {/* Midline - Moved 1px to the right */}
            <line
              x1={321}
              y1={10}
              x2={321}
              y2={190}
              stroke="#e2e8f0"
              strokeWidth={2}
              strokeDasharray="5,5"
            />

            {/* Labels */}
            <text x={160} y={10} textAnchor="middle" className="text-xs fill-slate-600 dark:fill-slate-400 font-medium">
              Upper Right
            </text>
            <text x={480} y={10} textAnchor="middle" className="text-xs fill-slate-600 dark:fill-slate-400 font-medium">
              Upper Left
            </text>
            <text x={160} y={195} textAnchor="middle" className="text-xs fill-slate-600 dark:fill-slate-400 font-medium">
              Lower Right
            </text>
            <text x={480} y={195} textAnchor="middle" className="text-xs fill-slate-600 dark:fill-slate-400 font-medium">
              Lower Left
            </text>
          </svg>
        </div>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap items-center justify-center gap-6 text-sm">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-white dark:bg-slate-800 border-2 border-slate-300 dark:border-slate-600 rounded"></div>
          <span className="text-slate-600 dark:text-slate-300">Healthy</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-green-100 dark:bg-green-900/30 border-2 border-green-400 dark:border-green-500 rounded"></div>
          <span className="text-slate-600 dark:text-slate-300">Treated</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-blue-100 dark:bg-blue-900/30 border-2 border-blue-400 dark:border-blue-500 rounded"></div>
          <span className="text-slate-600 dark:text-slate-300">In Progress</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-amber-100 dark:bg-amber-900/30 border-2 border-amber-400 dark:border-amber-500 rounded"></div>
          <span className="text-slate-600 dark:text-slate-300">Planned</span>
        </div>
      </div>

      {/* Instructions */}
      <div className="text-center">
        <p className="text-sm text-slate-600 dark:text-slate-400">
          Click on any tooth to add a new treatment
        </p>
      </div>
    </div>
  );
};

export default ToothChart;
