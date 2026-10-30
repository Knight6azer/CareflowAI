import React from 'react';
import { CheckCircle2, AlertTriangle, Clock, Info } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

export default function StatusBadge({ status, size = 'md', className = '' }) {
  const { t } = useLanguage();
  const rawStatus = (status || '').trim();
  const normalized = rawStatus.toLowerCase();

  let style = {
    bg: 'bg-slate-100 text-slate-700 border-slate-200',
    icon: Info,
    labelKey: 'status.normal',
    fallback: rawStatus
  };

  if (normalized.includes('analyzed')) {
    style = {
      bg: 'bg-emerald-50 text-emerald-700 border-emerald-200/75 ring-emerald-500/10',
      icon: CheckCircle2,
      labelKey: 'status.analyzed',
      fallback: 'Analyzed'
    };
  } else if (normalized.includes('slightly low')) {
    style = {
      bg: 'bg-amber-50 text-amber-800 border-amber-200/80 ring-amber-500/10',
      icon: AlertTriangle,
      labelKey: 'status.slightlyLow',
      fallback: 'Slightly Low'
    };
  } else if (normalized.includes('slightly high') || normalized.includes('elevated')) {
    style = {
      bg: 'bg-amber-50 text-amber-800 border-amber-200/80 ring-amber-500/10',
      icon: AlertTriangle,
      labelKey: 'status.slightlyHigh',
      fallback: 'Slightly High'
    };
  } else if (normalized === 'low') {
    style = {
      bg: 'bg-amber-100/70 text-amber-900 border-amber-300 ring-amber-500/10',
      icon: AlertTriangle,
      labelKey: 'status.low',
      fallback: 'Low'
    };
  } else if (normalized === 'high') {
    style = {
      bg: 'bg-amber-100/70 text-amber-900 border-amber-300 ring-amber-500/10',
      icon: AlertTriangle,
      labelKey: 'status.high',
      fallback: 'High'
    };
  } else if (normalized.includes('critical') || normalized.includes('outlier')) {
    style = {
      bg: 'bg-rose-50 text-rose-800 border-rose-200 ring-rose-500/10',
      icon: AlertTriangle,
      labelKey: 'status.critical',
      fallback: 'Outlier Review'
    };
  } else if (normalized.includes('normal') || normalized.includes('optimal') || normalized.includes('success')) {
    style = {
      bg: 'bg-emerald-50 text-emerald-700 border-emerald-200/75 ring-emerald-500/10',
      icon: CheckCircle2,
      labelKey: 'status.normal',
      fallback: 'Normal'
    };
  } else if (normalized.includes('processing') || normalized.includes('pending')) {
    style = {
      bg: 'bg-blue-50 text-blue-700 border-blue-200 ring-blue-500/10',
      icon: Clock,
      labelKey: 'status.processing',
      fallback: 'Processing'
    };
  }

  const IconComp = style.icon;
  const displayLabel = t(style.labelKey, style.fallback);

  const sizeClasses = size === 'sm' 
    ? 'px-2 py-0.5 text-xs gap-1 font-medium' 
    : 'px-2.5 py-1 text-xs sm:text-sm gap-1.5 font-medium';

  return (
    <span className={`inline-flex items-center rounded-full border shadow-2xs ${style.bg} ${sizeClasses} ${className}`}>
      <IconComp className={size === 'sm' ? "w-3 h-3 shrink-0" : "w-3.5 h-3.5 shrink-0"} />
      <span className="whitespace-nowrap">{displayLabel}</span>
    </span>
  );
}
