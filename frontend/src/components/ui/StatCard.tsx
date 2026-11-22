import React from 'react';
import { ArrowUpRight, ArrowDownRight } from 'lucide-react';

export interface StatCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  trend?: {
    value: string;
    isPositive?: boolean;
    label?: string;
  };
  subtitle?: string;
  className?: string;
}

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  icon,
  trend,
  subtitle,
  className = ''
}) => {
  return (
    <div className={`bg-white rounded-xl border border-neutral-border p-5 shadow-sm hover:shadow transition-shadow ${className}`}>
      <div className="flex justify-between items-start">
        <span className="text-xs font-semibold uppercase tracking-wider text-navy-500">
          {title}
        </span>
        <div className="p-2.5 rounded-lg bg-forest-50 text-forest-primary">
          {icon}
        </div>
      </div>

      <div className="mt-3">
        <div className="text-2xl font-extrabold text-navy-900 tracking-tight">
          {value}
        </div>

        {trend && (
          <div className="flex items-center gap-1.5 mt-1.5 text-xs">
            <span
              className={`inline-flex items-center font-bold ${
                trend.isPositive ? 'text-emerald-700' : 'text-rose-700'
              }`}
            >
              {trend.isPositive ? (
                <ArrowUpRight className="w-3.5 h-3.5 mr-0.5" />
              ) : (
                <ArrowDownRight className="w-3.5 h-3.5 mr-0.5" />
              )}
              {trend.value}
            </span>
            <span className="text-navy-400">{trend.label || 'vs last month'}</span>
          </div>
        )}

        {subtitle && <p className="text-xs text-navy-400 mt-1">{subtitle}</p>}
      </div>
    </div>
  );
};
