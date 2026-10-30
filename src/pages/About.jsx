import React from 'react';
import { Link } from 'react-router-dom';
import { Activity, ShieldCheck, Cpu, Heart, Lock, FileText, ArrowRight } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import Button from '../components/Button';
import Card from '../components/Card';
import Disclaimer from '../components/Disclaimer';

export default function About() {
  const { t } = useLanguage();

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-16 space-y-12">
      
      {/* Title Header */}
      <div className="text-center max-w-2xl mx-auto space-y-3">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-50 text-teal-700 text-xs font-semibold border border-teal-200">
          <Activity className="w-3.5 h-3.5 text-teal-600" />
          <span>{t('about.badge', 'Patient-Centric Health Tech')}</span>
        </div>
        <h1 className="text-3xl sm:text-5xl font-extrabold text-slate-900 tracking-tight">
          {t('about.title', 'What is CareFlow AI?')}
        </h1>
        <p className="text-base sm:text-lg text-slate-600 leading-relaxed font-medium">
          {t('about.subtitle', 'CareFlow AI is designed to make medical reports easier to understand by organizing information and presenting explanations in simple, patient-friendly language.')}
        </p>
      </div>

      {/* Main Purpose Card */}
      <Card className="border-teal-200/80 bg-gradient-to-br from-white to-teal-50/30 p-6 sm:p-8 space-y-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-teal-100 text-teal-700 flex items-center justify-center font-bold">
            <Heart className="w-5 h-5" />
          </div>
          <h2 className="text-xl font-bold text-slate-900">
            {t('about.purposeTitle', 'Our Purpose')}
          </h2>
        </div>
        <p className="text-sm text-slate-700 leading-relaxed">
          {t('about.purposeText', 'Medical laboratory reports are written for physicians, filled with abbreviations, technical units, and statistical ranges that can cause undue anxiety for patients. CareFlow AI serves as an educational translation bridge—empowering you with knowledge while strictly adhering to non-diagnostic safety guidelines.')}
        </p>
      </Card>

      {/* Grid of Core Pillars */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Pillar 1: How It Works */}
        <Card hoverEffect className="space-y-3">
          <div className="w-10 h-10 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center font-bold">
            <FileText className="w-5 h-5" />
          </div>
          <h3 className="text-lg font-bold text-slate-900">
            {t('about.howItWorksTitle', 'How It Works')}
          </h3>
          <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
            {t('about.howItWorksText', 'CareFlow AI uses optical character recognition to read laboratory test results from photos or documents, maps them into structured clinical parameters, validates them against physical bounds, and provides plain-language explanations with actionable doctor questions.')}
          </p>
        </Card>

        {/* Pillar 2: Technology Stack */}
        <Card hoverEffect className="space-y-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
            <Cpu className="w-5 h-5" />
          </div>
          <h3 className="text-lg font-bold text-slate-900">
            {t('about.techTitle', 'Technology Architecture')}
          </h3>
          <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
            {t('about.techText', 'Built with high-speed modern web technologies, strict data validation algorithms, optical character recognition pipelines, and responsive multilingual design ensuring universal accessibility.')}
          </p>
        </Card>

        {/* Pillar 3: Privacy & Security */}
        <Card hoverEffect className="space-y-3">
          <div className="w-10 h-10 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center font-bold">
            <Lock className="w-5 h-5" />
          </div>
          <h3 className="text-lg font-bold text-slate-900">
            {t('about.privacyTitle', 'Privacy & Confidentiality')}
          </h3>
          <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
            {t('about.privacyText', 'Your medical files are processed strictly for real-time presentation without permanent tracking or personal record monetization.')}
          </p>
        </Card>

        {/* Pillar 4: Clinical Safety */}
        <Card hoverEffect className="space-y-3">
          <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <h3 className="text-lg font-bold text-slate-900">
            {t('about.safetyTitle', 'Clinical Safety Firewall')}
          </h3>
          <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
            {t('about.safetyText', 'CareFlow AI never diagnoses illnesses or claims a blood test can detect viral infections (such as dengue) without dedicated serological tests. Extreme laboratory values are preserved for urgent clinical review rather than arbitrarily hidden.')}
          </p>
        </Card>

      </div>

      {/* CTA Box */}
      <div className="bg-slate-900 text-white rounded-3xl p-8 sm:p-10 text-center space-y-4 shadow-xl">
        <h2 className="text-xl sm:text-3xl font-bold tracking-tight">
          {t('home.ctaBanner.title', 'Ready to make sense of your lab tests?')}
        </h2>
        <p className="text-xs sm:text-sm text-slate-400 max-w-md mx-auto">
          {t('home.ctaBanner.subtitle', 'Scan your report now for immediate, confidential, and clear guidance.')}
        </p>
        <div className="pt-2">
          <Link to="/scan">
            <Button variant="primary" size="lg" icon={ArrowRight} iconPosition="right">
              {t('home.ctaBanner.button', 'Start Scanning Now')}
            </Button>
          </Link>
        </div>
      </div>

      {/* Medical Disclaimer */}
      <Disclaimer />

    </div>
  );
}
