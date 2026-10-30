import React, { useState, useEffect } from 'react';
import { Sparkles, CheckCircle2, Loader2, FileSearch, Brain, Activity } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

export default function ProgressIndicator({ onComplete }) {
  const { t } = useLanguage();
  const [progress, setProgress] = useState(0);
  const [currentStep, setCurrentStep] = useState(0);

  const translatedSteps = t('scan.steps');
  const stepLabels = Array.isArray(translatedSteps) && translatedSteps.length === 4
    ? translatedSteps
    : [
        "Preprocessing report scan & sharpening image",
        "Running OCR to extract lab values & parameters",
        "Structuring reference ranges & flag indicators",
        "Generating patient-friendly medical explanation"
      ];

  const stepIcons = [FileSearch, Activity, Brain, Sparkles];

  useEffect(() => {
    const timer = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(timer);
          setTimeout(() => {
            if (onComplete) onComplete();
          }, 600);
          return 100;
        }
        const next = prev + 5;
        if (next >= 25 && currentStep < 1) setCurrentStep(1);
        if (next >= 55 && currentStep < 2) setCurrentStep(2);
        if (next >= 85 && currentStep < 3) setCurrentStep(3);
        return next;
      });
    }, 150);

    return () => clearInterval(timer);
  }, [currentStep, onComplete]);

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 max-w-lg mx-auto shadow-md">
      <div className="text-center mb-6">
        <div className="w-14 h-14 bg-teal-50 rounded-2xl flex items-center justify-center mx-auto mb-3 text-teal-600 animate-pulse-subtle">
          <Sparkles className="w-7 h-7" />
        </div>
        <h3 className="text-lg sm:text-xl font-bold text-slate-900">
          {t('scan.processingOverlay', 'Analyzing Your Medical Report')}
        </h3>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          {t('scan.processingSub', 'CareFlow AI is extracting and organizing relevant lab parameters.')}
        </p>
      </div>

      {/* Progress Bar */}
      <div className="mb-6">
        <div className="flex justify-between text-xs font-semibold text-slate-600 mb-2">
          <span>{t('scan.progressStatus', 'Processing Status')}</span>
          <span className="text-teal-700 font-bold">{progress}%</span>
        </div>
        <div className="h-3 w-full bg-slate-100 rounded-full overflow-hidden p-0.5">
          <div 
            className="h-full bg-teal-600 rounded-full transition-all duration-300 ease-out shadow-xs"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Steps List */}
      <div className="space-y-3">
        {stepLabels.map((label, idx) => {
          const isDone = idx < currentStep || progress === 100;
          const isCurrent = idx === currentStep && progress < 100;

          return (
            <div
              key={idx}
              className={`flex items-center gap-3 p-3 rounded-xl text-xs sm:text-sm transition-all ${
                isCurrent 
                  ? 'bg-teal-50/70 border border-teal-200/80 text-teal-900 font-medium'
                  : isDone
                  ? 'text-slate-700'
                  : 'text-slate-400 opacity-60'
              }`}
            >
              {isDone ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              ) : isCurrent ? (
                <Loader2 className="w-4 h-4 text-teal-600 animate-spin shrink-0" />
              ) : (
                <div className="w-4 h-4 rounded-full border border-slate-300 shrink-0" />
              )}
              <span className="flex-1 truncate">{label}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
