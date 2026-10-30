import React from 'react';
import { ShieldAlert } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

export default function Disclaimer({ compact = false, className = '' }) {
  const { t } = useLanguage();

  if (compact) {
    return (
      <div className={`flex items-start gap-2.5 p-3 rounded-xl bg-amber-50/80 border border-amber-200/70 text-xs text-amber-900 ${className}`}>
        <ShieldAlert className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
        <p className="leading-relaxed">
          <strong className="font-semibold text-amber-950">{t('disclaimer.title', 'Important Medical Disclaimer')}:</strong>{' '}
          {t('disclaimer.compact', 'CareFlow AI provides informational explanations only. It is not a diagnostic tool and does not replace professional medical advice.')}
        </p>
      </div>
    );
  }

  return (
    <div className={`p-4 sm:p-5 rounded-2xl bg-amber-50/70 border border-amber-200/90 shadow-2xs ${className}`}>
      <div className="flex items-start gap-3.5">
        <div className="p-2 bg-amber-100/80 rounded-xl text-amber-700 shrink-0">
          <ShieldAlert className="w-5 h-5 sm:w-6 sm:h-6" />
        </div>
        <div className="space-y-1">
          <h4 className="text-sm font-semibold text-amber-950 flex items-center gap-1.5">
            {t('disclaimer.title', 'Important Medical Disclaimer')}
          </h4>
          <p className="text-xs sm:text-sm text-amber-900/90 leading-relaxed">
            {t('disclaimer.full', 'CareFlow AI is designed to provide educational and informational explanations of medical reports. It is not a diagnostic tool and does not replace a qualified healthcare professional. Always consult your physician or doctor regarding any medical concerns or lab interpretations.')}
          </p>
        </div>
      </div>
    </div>
  );
}
