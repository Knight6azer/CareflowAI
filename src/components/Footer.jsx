import React from 'react';
import { Link } from 'react-router-dom';
import { Activity, ShieldCheck, Lock } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import Disclaimer from './Disclaimer';

export default function Footer() {
  const { t } = useLanguage();

  return (
    <footer className="bg-white border-t border-slate-200 mt-16 text-slate-600 text-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          
          {/* Col 1: Brand */}
          <div className="md:col-span-1 space-y-4">
            <Link to="/" className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-teal-600 flex items-center justify-center text-white">
                <Activity className="w-5 h-5" />
              </div>
              <span className="font-bold text-slate-900 text-lg">
                {t('nav.brand', 'CareFlow')} <span className="text-teal-600">{t('nav.brandSuffix', 'AI')}</span>
              </span>
            </Link>
            <p className="text-xs text-slate-500 leading-relaxed">
              {t('footer.tagline', 'Empowering patients with clear, accessible, plain-language insights into their medical lab reports.')}
            </p>
            <div className="flex items-center gap-3 text-xs text-slate-400 font-medium">
              <span className="flex items-center gap-1">
                <Lock className="w-3.5 h-3.5 text-teal-600" /> {t('footer.privateSecure', 'Private & Secure')}
              </span>
              <span>•</span>
              <span className="flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-teal-600" /> {t('footer.noStorage', 'No Retained Diagnostics')}
              </span>
            </div>
          </div>

          {/* Col 2: Navigation */}
          <div>
            <h4 className="font-semibold text-slate-900 text-sm mb-3">
              {t('footer.quickNav', 'Quick Navigation')}
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <Link to="/" className="hover:text-teal-700 transition-colors">
                  {t('nav.home', 'Home')}
                </Link>
              </li>
              <li>
                <Link to="/scan" className="hover:text-teal-700 transition-colors">
                  {t('nav.scan', 'Scan Report')}
                </Link>
              </li>
              <li>
                <Link to="/reports" className="hover:text-teal-700 transition-colors">
                  {t('nav.reports', 'My Reports')}
                </Link>
              </li>
              <li>
                <Link to="/about" className="hover:text-teal-700 transition-colors">
                  {t('nav.about', 'About')}
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 3: Report Types */}
          <div>
            <h4 className="font-semibold text-slate-900 text-sm mb-3">
              {t('footer.supported', 'Supported Reports')}
            </h4>
            <ul className="space-y-2 text-xs text-slate-500">
              <li>Complete Blood Count (CBC)</li>
              <li>Liver Function Tests (LFT)</li>
              <li>Lipid & Cholesterol Profile</li>
              <li>Metabolic & Thyroid Panels</li>
              <li>Urinalysis & Diagnostic Labs</li>
            </ul>
          </div>

          {/* Col 4: Trust & Compliance */}
          <div>
            <h4 className="font-semibold text-slate-900 text-sm mb-3">
              {t('footer.privacyTrust', 'Privacy & Trust')}
            </h4>
            <p className="text-xs text-slate-500 leading-relaxed mb-3">
              {t('footer.privacyDesc', 'CareFlow AI processes medical data on-demand without storing patient personal identification details.')}
            </p>
          </div>

        </div>

        {/* Disclaimer Banner */}
        <Disclaimer compact className="mb-8" />

        {/* Bottom bar */}
        <div className="pt-6 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-400">
          <p>© 2026 {t('footer.rights', 'CareFlow AI. All rights reserved. Built for patient empowerment.')}</p>
          <div className="flex items-center gap-4">
            <Link to="/about" className="hover:text-slate-600">{t('footer.privacyPolicy', 'Privacy Policy')}</Link>
            <Link to="/about" className="hover:text-slate-600">{t('footer.terms', 'Terms of Service')}</Link>
            <Link to="/about" className="hover:text-slate-600">{t('footer.medicalDisclaimer', 'Medical Disclaimer')}</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
