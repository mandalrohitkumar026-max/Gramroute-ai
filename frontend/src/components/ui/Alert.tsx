import React from 'react';
import { AlertCircle, CheckCircle2, Info, AlertTriangle, X } from 'lucide-react';

export interface AlertProps {
  type?: 'success' | 'warning' | 'error' | 'info';
  variant?: 'success' | 'warning' | 'error' | 'info';
  title?: string;
  message?: string;
  children?: React.ReactNode;
  onDismiss?: () => void;
  className?: string;
}

export const Alert: React.FC<AlertProps> = ({
  type = 'info',
  variant,
  title,
  message,
  children,
  onDismiss,
  className = ''
}) => {
  const effectiveType = variant || type;

  const configs = {
    success: {
      bg: 'bg-emerald-50 border-emerald-200 text-emerald-900',
      icon: <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
    },
    warning: {
      bg: 'bg-amber-50 border-amber-200 text-amber-900',
      icon: <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0" />
    },
    error: {
      bg: 'bg-rose-50 border-rose-200 text-rose-900',
      icon: <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
    },
    info: {
      bg: 'bg-blue-50 border-blue-200 text-blue-900',
      icon: <Info className="w-5 h-5 text-blue-600 shrink-0" />
    }
  };

  const { bg, icon } = configs[effectiveType];

  return (
    <div className={`rounded-xl border p-4 ${bg} flex items-start gap-3 text-xs leading-relaxed ${className}`}>
      {icon}
      <div className="flex-1">
        {title && <h5 className="font-bold text-sm mb-0.5">{title}</h5>}
        {message && <p>{message}</p>}
        {children}
      </div>
      {onDismiss && (
        <button
          onClick={onDismiss}
          className="p-1 rounded-md hover:bg-black/5 transition-colors shrink-0"
        >
          <X className="w-4 h-4" />
        </button>
      )}
    </div>
  );
};
