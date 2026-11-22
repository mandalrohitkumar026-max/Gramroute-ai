import React from 'react';
import { PackageOpen } from 'lucide-react';
import { Button } from './Button';

export interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description: string;
  actionText?: string;
  onAction?: () => void;
  className?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon,
  title,
  description,
  actionText,
  onAction,
  className = ''
}) => {
  return (
    <div className={`p-8 sm:p-12 text-center rounded-xl border border-dashed border-slate-300 bg-neutral-surface ${className}`}>
      <div className="w-14 h-14 mx-auto mb-4 rounded-full bg-forest-50 text-forest-primary flex items-center justify-center">
        {icon || <PackageOpen className="w-7 h-7" />}
      </div>
      <h4 className="text-base font-bold text-navy-900">{title}</h4>
      <p className="text-xs text-navy-500 max-w-sm mx-auto mt-1 leading-relaxed">
        {description}
      </p>
      {actionText && onAction && (
        <div className="mt-5">
          <Button variant="primary" size="sm" onClick={onAction}>
            {actionText}
          </Button>
        </div>
      )}
    </div>
  );
};
