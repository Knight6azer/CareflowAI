import React from 'react';
import { Link } from 'react-router-dom';
import StatusBadge from './StatusBadge';
import { FileText, Calendar, Building2, ChevronRight } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

export default function ReportCard({ report }) {
  const { t } = useLanguage();
  const { id, title, type, date, status, labName, summary } = report;

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 shadow-2xs hover:shadow-md hover:border-teal-200/80 transition-all duration-200 p-5 flex flex-col justify-between group">
      <div>
        {/* Top Header */}
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-teal-50 text-teal-700 group-hover:bg-teal-600 group-hover:text-white transition-colors duration-200 shrink-0">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <span className="text-xs font-semibold text-teal-700 bg-teal-50 px-2 py-0.5 rounded-md uppercase tracking-wider inline-block mb-1">
                {type}
              </span>
              <h3 className="font-semibold text-slate-900 text-base leading-snug group-hover:text-teal-700 transition-colors">
                {title}
              </h3>
            </div>
          </div>
          <StatusBadge status={status} size="sm" />
        </div>

        {/* Short Summary */}
        <p className="text-xs sm:text-sm text-slate-600 line-clamp-2 mb-4 leading-relaxed">
          {summary}
        </p>

        {/* Metadata items */}
        <div className="grid grid-cols-2 gap-2 text-xs text-slate-500 pt-3 border-t border-slate-100 mb-4">
          <div className="flex items-center gap-1.5 truncate">
            <Calendar className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <span className="truncate">{date}</span>
          </div>
          <div className="flex items-center gap-1.5 truncate">
            <Building2 className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <span className="truncate">{labName || 'Standard Lab'}</span>
          </div>
        </div>
      </div>

      {/* Button Action */}
      <Link
        to={`/reports/${id}`}
        className="w-full inline-flex items-center justify-center gap-1.5 py-2.5 px-4 rounded-xl bg-slate-50 hover:bg-teal-600 text-slate-700 hover:text-white text-xs sm:text-sm font-semibold transition-all duration-200 border border-slate-200 group-hover:border-teal-600 shadow-2xs"
      >
        <span>{t('myReports.viewDetails', 'View Report Details')}</span>
        <ChevronRight className="w-4 h-4" />
      </Link>
    </div>
  );
}
