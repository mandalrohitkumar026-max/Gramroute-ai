import React from 'react';
import { ShieldCheck, Clock, AlertTriangle, XCircle } from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';

export type VerificationStatusType = 'VERIFIED' | 'PENDING_REVIEW' | 'UNVERIFIED' | 'REJECTED';

interface VerificationBadgeProps {
  status: VerificationStatusType;
  showText?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

export const VerificationBadge: React.FC<VerificationBadgeProps> = ({
  status,
  showText = true,
  size = 'md'
}) => {
  const { t } = useLanguage();

  const sizeClasses = {
    sm: 'text-[10px] px-1.5 py-0.5 gap-1',
    md: 'text-xs px-2.5 py-1 gap-1.5',
    lg: 'text-sm px-3 py-1.5 gap-2'
  };

  const iconSizes = {
    sm: 'w-3 h-3',
    md: 'w-3.5 h-3.5',
    lg: 'w-4 h-4'
  };

  switch (status) {
    case 'VERIFIED':
      return (
        <span
          className={`inline-flex items-center font-bold rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300 ${sizeClasses[size]}`}
          title="Identity & Credentials Verified by GramRoute Field Officers"
        >
          <ShieldCheck className={`${iconSizes[size]} text-emerald-600`} />
          {showText && <span>{t.common.verified}</span>}
        </span>
      );

    case 'PENDING_REVIEW':
      return (
        <span
          className={`inline-flex items-center font-semibold rounded-full bg-amber-100 text-amber-800 border border-amber-300 ${sizeClasses[size]}`}
          title="Document submitted and awaiting field verification"
        >
          <Clock className={`${iconSizes[size]} text-amber-600`} />
          {showText && <span>{t.common.pendingReview}</span>}
        </span>
      );

    case 'REJECTED':
      return (
        <span
          className={`inline-flex items-center font-semibold rounded-full bg-rose-100 text-rose-800 border border-rose-300 ${sizeClasses[size]}`}
          title="Document rejected due to legibility or mismatch"
        >
          <XCircle className={`${iconSizes[size]} text-rose-600`} />
          {showText && <span>{t.common.rejected}</span>}
        </span>
      );

    case 'UNVERIFIED':
    default:
      return (
        <span
          className={`inline-flex items-center font-medium rounded-full bg-neutral-100 text-neutral-600 border border-neutral-300 ${sizeClasses[size]}`}
          title="Unverified Account. Certain high-value bookings require KYC."
        >
          <AlertTriangle className={`${iconSizes[size]} text-neutral-500`} />
          {showText && <span>{t.common.unverified}</span>}
        </span>
      );
  }
};
