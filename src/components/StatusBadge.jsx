import React from 'react';

const StatusBadge = ({ status, type = 'application', className = '' }) => {
  if (!status) return null;

  const normalized = status.toUpperCase();

  const appStyles = {
    NEW: 'bg-orange-100 text-orange-900 border-orange-200',
    REVIEWING: 'bg-amber-100 text-amber-800 border-amber-200',
    SHORTLISTED: 'bg-purple-100 text-purple-800 border-purple-200',
    INTERVIEW: 'bg-teal-100 text-teal-800 border-teal-200',
    SELECTED: 'bg-emerald-100 text-emerald-800 border-emerald-200',
    REJECTED: 'bg-rose-100 text-rose-800 border-rose-200'
  };

  const jobStyles = {
    OPEN: 'bg-emerald-100 text-emerald-800 border-emerald-200',
    CLOSED: 'bg-slate-200 text-slate-700 border-slate-300'
  };

  const colorClass =
    type === 'job'
      ? jobStyles[normalized] || 'bg-slate-100 text-slate-700 border-slate-200'
      : appStyles[normalized] || 'bg-slate-100 text-slate-700 border-slate-200';

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${colorClass} ${className}`}
    >
      <span className="w-1.5 h-1.5 rounded-full mr-1.5 bg-current opacity-70"></span>
      {normalized}
    </span>
  );
};

export default StatusBadge;
