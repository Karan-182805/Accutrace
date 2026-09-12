import React from 'react';
import { CheckCircle2, XCircle, AlertTriangle } from 'lucide-react';
import { ComplianceStatus, Severity } from '../../types';

interface StatusBadgeProps {
  status: ComplianceStatus;
  size?: 'sm' | 'md' | 'lg';
  showIcon?: boolean;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, size = 'md', showIcon = true }) => {
  const sizeClasses = {
    sm: 'px-2 py-0.5 text-xs font-semibold',
    md: 'px-2.5 py-1 text-xs font-semibold',
    lg: 'px-3 py-1.5 text-sm font-bold',
  };

  const iconSizes = {
    sm: 12,
    md: 14,
    lg: 16,
  };

  switch (status) {
    case 'Compliant':
      return (
        <span className={`inline-flex items-center gap-1.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 ${sizeClasses[size]}`}>
          {showIcon && <CheckCircle2 size={iconSizes[size]} className="text-emerald-600" />}
          <span>Compliant</span>
        </span>
      );
    case 'Non-Compliant':
      return (
        <span className={`inline-flex items-center gap-1.5 rounded-full bg-rose-50 text-rose-700 border border-rose-200 ${sizeClasses[size]}`}>
          {showIcon && <XCircle size={iconSizes[size]} className="text-rose-600" />}
          <span>Non-Compliant</span>
        </span>
      );
    case 'Requires Review':
      return (
        <span className={`inline-flex items-center gap-1.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200 ${sizeClasses[size]}`}>
          {showIcon && <AlertTriangle size={iconSizes[size]} className="text-amber-600" />}
          <span>Requires Review</span>
        </span>
      );
    default:
      return null;
  }
};

export const SeverityBadge: React.FC<{ severity: Severity }> = ({ severity }) => {
  switch (severity) {
    case 'High':
      return (
        <span className="px-2 py-0.5 text-xs font-bold rounded bg-red-100 text-red-800 border border-red-200">
          HIGH SEVERITY
        </span>
      );
    case 'Medium':
      return (
        <span className="px-2 py-0.5 text-xs font-bold rounded bg-amber-100 text-amber-800 border border-amber-200">
          MEDIUM SEVERITY
        </span>
      );
    case 'Low':
      return (
        <span className="px-2 py-0.5 text-xs font-bold rounded bg-blue-100 text-blue-800 border border-blue-200">
          LOW SEVERITY
        </span>
      );
  }
};
