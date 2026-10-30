import React from 'react';
import StatusBadge from './StatusBadge';
import { useLanguage } from '../context/LanguageContext';

export default function ParameterCard({ parameter }) {
  const { t } = useLanguage();
  const { name, value, unit, refRange, status, severity, description, minRef, maxRef } = parameter;

  // Calculate percentage indicator position if minRef & maxRef exist
  let percent = 50;
  if (minRef !== undefined && maxRef !== undefined) {
    const rangeSpan = maxRef - minRef;
    const padding = rangeSpan * 0.4;
    const totalMin = Math.max(0, minRef - padding);
    const totalMax = maxRef + padding;
    percent = Math.min(100, Math.max(5, ((value - totalMin) / (totalMax - totalMin)) * 100));
  }

  const isWarning = severity === 'warning' || status.toLowerCase().includes('low') || status.toLowerCase().includes('elevated');

  return (
    <div className={`p-4 sm:p-5 rounded-2xl border transition-all duration-200 ${
      isWarning 
        ? 'bg-amber-50/30 border-amber-200/90 shadow-2xs' 
        : 'bg-white border-slate-200/80 shadow-2xs hover:border-teal-200'
    }`}>
      {/* Header */}
      <div className="flex items-start justify-between gap-3 mb-2">
        <div>
          <h4 className="font-semibold text-slate-900 text-sm sm:text-base">{name}</h4>
          {description && (
            <p className="text-xs text-slate-500 mt-0.5 leading-snug">{description}</p>
          )}
        </div>
        <StatusBadge status={status} size="sm" />
      </div>

      {/* Main Value Display */}
      <div className="mt-3 flex items-baseline justify-between">
        <div className="flex items-baseline gap-1.5">
          <span className={`text-2xl sm:text-3xl font-bold tracking-tight ${isWarning ? 'text-amber-800' : 'text-slate-900'}`}>
            {value}
          </span>
          <span className="text-xs sm:text-sm font-medium text-slate-500">{unit}</span>
        </div>
        <div className="text-right">
          <span className="text-2xs sm:text-xs text-slate-400 block font-medium uppercase tracking-wider">
            {t('reportDetails.reference', 'Reference')}
          </span>
          <span className="text-xs sm:text-sm font-semibold text-slate-700">{refRange}</span>
        </div>
      </div>

      {/* Visual Range Indicator Bar */}
      {minRef !== undefined && maxRef !== undefined && (
        <div className="mt-4 pt-2 border-t border-slate-100">
          <div className="relative h-2 bg-slate-100 rounded-full overflow-hidden flex">
            <div className="w-[25%] bg-slate-200 h-full"></div>
            <div className="w-[50%] bg-emerald-200/90 h-full"></div>
            <div className="w-[25%] bg-slate-200 h-full"></div>
            
            {/* Value Pointer Indicator */}
            <div 
              className="absolute top-0 bottom-0 w-2.5 bg-slate-900 rounded-full -ml-1 border border-white shadow-xs transition-all duration-500"
              style={{ left: `${percent}%` }}
              title={`Value: ${value} ${unit}`}
            />
          </div>
          <div className="flex justify-between text-[11px] text-slate-400 mt-1 font-medium">
            <span>{t('reportDetails.low', 'Low')}</span>
            <span className="text-emerald-700 font-semibold">{t('reportDetails.normalTarget', 'Normal Target')}</span>
            <span>{t('reportDetails.high', 'High')}</span>
          </div>
        </div>
      )}
    </div>
  );
}
