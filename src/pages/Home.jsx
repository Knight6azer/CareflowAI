import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Camera, FileText, Brain, ShieldCheck, ArrowRight, Sparkles, Activity } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import Button from '../components/Button';
import Card from '../components/Card';
import Disclaimer from '../components/Disclaimer';

export default function Home() {
  const navigate = useNavigate();
  const { t } = useLanguage();

  return (
    <div className="space-y-16 sm:space-y-24 py-6 sm:py-10">
      
      {/* HERO SECTION */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          {/* Left Column: Heading & CTAs */}
          <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
            
            {/* Trust Badge Pill */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-teal-50 border border-teal-200/80 text-teal-800 text-xs sm:text-sm font-semibold shadow-2xs">
              <Sparkles className="w-4 h-4 text-teal-600 animate-pulse" />
              <span>{t('home.hero.badge', 'Smart Medical Text Analysis')}</span>
              <span className="w-1.5 h-1.5 rounded-full bg-teal-500"></span>
              <span className="text-teal-700/80 font-normal">{t('home.hero.badgeSub', 'Patient Friendly')}</span>
            </div>

            {/* Main Heading */}
            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold text-slate-900 tracking-tight leading-[1.15]">
              {t('home.hero.titlePrefix', 'Understand Your Medical Reports.')}{' '}
              <span className="text-teal-600 block lg:inline">
                {t('home.hero.titleHighlight', 'With Clarity.')}
              </span>
            </h1>

            {/* Supporting text */}
            <p className="text-base sm:text-lg text-slate-600 max-w-2xl mx-auto lg:mx-0 leading-relaxed">
              {t('home.hero.description', 'CareFlow AI helps you scan and understand medical reports using AI-powered text extraction, reference-interval comparison, and patient-friendly explanations.')}
            </p>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-3.5 pt-2">
              <Button
                variant="primary"
                size="lg"
                onClick={() => navigate('/scan')}
                icon={Camera}
                className="w-full sm:w-auto shadow-md shadow-teal-600/20"
              >
                {t('home.hero.scanButton', 'Scan Your Report')}
              </Button>
              <Button
                variant="outline"
                size="lg"
                onClick={() => navigate('/scan?tab=upload')}
                icon={FileText}
                className="w-full sm:w-auto"
              >
                {t('home.hero.uploadButton', 'Upload Report')}
              </Button>
            </div>

            {/* Feature Highlights beneath Hero */}
            <div className="pt-6 grid grid-cols-3 gap-4 border-t border-slate-200/80 text-left">
              <div>
                <span className="block font-bold text-slate-900 text-base sm:text-lg">
                  {t('home.hero.stat1Value', '100%')}
                </span>
                <span className="text-xs text-slate-500">
                  {t('home.hero.stat1Label', 'Plain Language')}
                </span>
              </div>
              <div>
                <span className="block font-bold text-slate-900 text-base sm:text-lg">
                  {t('home.hero.stat2Value', 'Instant')}
                </span>
                <span className="text-xs text-slate-500">
                  {t('home.hero.stat2Label', 'OCR Extraction')}
                </span>
              </div>
              <div>
                <span className="block font-bold text-slate-900 text-base sm:text-lg">
                  {t('home.hero.stat3Value', 'Private')}
                </span>
                <span className="text-xs text-slate-500">
                  {t('home.hero.stat3Label', 'No Patient Storage')}
                </span>
              </div>
            </div>

          </div>

          {/* Right Column: Professional Healthcare Visual Preview */}
          <div className="lg:col-span-5">
            <div className="relative mx-auto max-w-md lg:max-w-none">
              
              {/* Decorative background glow */}
              <div className="absolute -inset-2 bg-gradient-to-r from-teal-500/20 to-sky-500/20 rounded-3xl blur-xl opacity-75"></div>

              {/* Interactive Mock Medical Report Hero Card */}
              <div className="relative bg-white rounded-3xl border border-slate-200/90 shadow-xl p-6 sm:p-7 space-y-5">
                
                {/* Header of Mock Visual */}
                <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-teal-100 text-teal-700 flex items-center justify-center font-bold">
                      <Activity className="w-6 h-6" />
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-900 text-sm">
                        {t('home.previewCard.title', 'Complete Blood Count (CBC)')}
                      </h4>
                      <p className="text-xs text-slate-400">
                        {t('home.previewCard.lab', 'MetroHealth Diagnostics')} • {t('status.analyzed', 'Analyzed')}
                      </p>
                    </div>
                  </div>
                  <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                    {t('status.normal', 'Ready')}
                  </span>
                </div>

                {/* Simulated Scanned Parameter 1 */}
                <div className="p-3.5 rounded-xl bg-amber-50/70 border border-amber-200/80 flex items-center justify-between">
                  <div>
                    <span className="text-xs font-semibold text-slate-700 block">
                      {t('home.previewCard.sampleParameter', 'Hemoglobin')}
                    </span>
                    <span className="text-xs text-slate-400">
                      {t('home.previewCard.sampleRef', 'Ref: 12.0 – 16.0')}
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="text-sm font-bold text-amber-800">
                      {t('home.previewCard.sampleValue', '11.2 g/dL')}
                    </span>
                    <span className="block text-[10px] font-semibold text-amber-700">
                      {t('home.previewCard.sampleStatus', 'Slightly Low')}
                    </span>
                  </div>
                </div>

                {/* Simulated Scanned Parameter 2 */}
                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 flex items-center justify-between">
                  <div>
                    <span className="text-xs font-semibold text-slate-700 block">White Blood Cells (WBC)</span>
                    <span className="text-xs text-slate-400">Ref: 4.5 – 11.0 x10³/µL</span>
                  </div>
                  <div className="text-right">
                    <span className="text-sm font-bold text-slate-900">6.8 x10³/µL</span>
                    <span className="block text-[10px] font-semibold text-emerald-600">
                      {t('status.normal', 'Normal')}
                    </span>
                  </div>
                </div>

                {/* Plain-Language AI Explanation Box Preview */}
                <div className="p-4 rounded-2xl bg-teal-50/80 border border-teal-200/80 text-xs text-teal-950 space-y-1.5">
                  <div className="flex items-center gap-1.5 font-bold text-teal-900 text-xs">
                    <Sparkles className="w-4 h-4 text-teal-600" />
                    <span>{t('home.previewCard.summaryHeading', 'Executive Patient Summary')}</span>
                  </div>
                  <p className="text-slate-600 leading-relaxed">
                    "{t('home.previewCard.summaryText', 'Your test results are overall reassuring. Hemoglobin is slightly lower than typical baseline, which can cause mild fatigue. Other primary markers are normal.')}"
                  </p>
                </div>

                {/* Action Link */}
                <button
                  type="button"
                  onClick={() => navigate('/reports/rpt-cbc-001')}
                  className="w-full py-2.5 px-3 rounded-xl bg-slate-100 hover:bg-teal-50 text-slate-700 hover:text-teal-700 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
                >
                  <span>{t('home.previewCard.actionView', 'View Sample Full Breakdown')}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>

                {/* Floating Badge overlay */}
                <div className="absolute -bottom-4 -left-4 bg-slate-900 text-white rounded-2xl p-3 shadow-lg flex items-center gap-2.5 text-xs font-medium border border-slate-800">
                  <ShieldCheck className="w-5 h-5 text-teal-400 shrink-0" />
                  <span>HIPAA-Ready Architecture</span>
                </div>

              </div>

            </div>
          </div>

        </div>
      </section>

      {/* QUICK FEATURE CARDS */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-12 space-y-2">
          <h2 className="text-2xl sm:text-3xl font-bold text-slate-900">
            {t('home.features.title', 'Designed for Patients, Built with Clinical Rigor')}
          </h2>
          <p className="text-sm text-slate-500">
            {t('home.features.subtitle', 'Healthcare intelligence that translates complex diagnostics without replacing your doctor.')}
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Card 1 */}
          <Card hoverEffect className="flex flex-col justify-between">
            <div>
              <div className="w-12 h-12 rounded-xl bg-teal-50 text-teal-700 flex items-center justify-center mb-4">
                <Camera className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-slate-900 mb-2">
                {t('home.features.f1Title', 'Optical Character Recognition')}
              </h3>
              <p className="text-xs sm:text-sm text-slate-500 leading-relaxed">
                {t('home.features.f1Desc', 'Digitizes laboratory sheets, handling split decimals and complex medical abbreviations with precision.')}
              </p>
            </div>
          </Card>

          {/* Card 2 */}
          <Card hoverEffect className="flex flex-col justify-between">
            <div>
              <div className="w-12 h-12 rounded-xl bg-sky-50 text-sky-700 flex items-center justify-center mb-4">
                <Activity className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-slate-900 mb-2">
                {t('home.features.f2Title', 'Reference Interval Checking')}
              </h3>
              <p className="text-xs sm:text-sm text-slate-500 leading-relaxed">
                {t('home.features.f2Desc', 'Evaluates every parameter against normal physiological boundaries to identify deviations clearly.')}
              </p>
            </div>
          </Card>

          {/* Card 3 */}
          <Card hoverEffect className="flex flex-col justify-between">
            <div>
              <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center mb-4">
                <Brain className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-slate-900 mb-2">
                {t('home.features.f3Title', 'Plain-Language Insights')}
              </h3>
              <p className="text-xs sm:text-sm text-slate-500 leading-relaxed">
                {t('home.features.f3Desc', 'Replaces overwhelming medical jargon with clear, empathetic summaries everyone can understand.')}
              </p>
            </div>
          </Card>

          {/* Card 4 */}
          <Card hoverEffect className="flex flex-col justify-between">
            <div>
              <div className="w-12 h-12 rounded-xl bg-purple-50 text-purple-700 flex items-center justify-center mb-4">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-slate-900 mb-2">
                {t('home.features.f4Title', 'Doctor Discussion Prompts')}
              </h3>
              <p className="text-xs sm:text-sm text-slate-500 leading-relaxed">
                {t('home.features.f4Desc', 'Generates tailored questions to ask your physician during your next clinical appointment.')}
              </p>
            </div>
          </Card>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="bg-white py-14 sm:py-20 border-y border-slate-200/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="text-center max-w-2xl mx-auto mb-12 sm:mb-16 space-y-2">
            <span className="text-xs font-bold text-teal-700 uppercase tracking-widest bg-teal-50 px-3 py-1 rounded-full border border-teal-200">
              {t('home.howItWorks.subtitle', 'From lab paper to clear understanding in four transparent steps.')}
            </span>
            <h2 className="text-2xl sm:text-4xl font-bold text-slate-900 pt-2">
              {t('home.howItWorks.title', 'How CareFlow AI Works')}
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 relative">
            <div className="relative bg-slate-50/70 rounded-2xl p-6 border border-slate-200/80 flex flex-col justify-between group hover:bg-white hover:shadow-md transition-all">
              <div>
                <span className="text-3xl font-black text-teal-600/30 group-hover:text-teal-600 transition-colors block mb-4">01</span>
                <h3 className="text-base font-bold text-slate-900 mb-2">
                  {t('home.howItWorks.step1Title', '1. Capture or Upload')}
                </h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  {t('home.howItWorks.step1Desc', 'Take a photo with your phone camera or upload a PDF/image of your lab report sheet.')}
                </p>
              </div>
            </div>

            <div className="relative bg-slate-50/70 rounded-2xl p-6 border border-slate-200/80 flex flex-col justify-between group hover:bg-white hover:shadow-md transition-all">
              <div>
                <span className="text-3xl font-black text-teal-600/30 group-hover:text-teal-600 transition-colors block mb-4">02</span>
                <h3 className="text-base font-bold text-slate-900 mb-2">
                  {t('home.howItWorks.step2Title', '2. Optical Character Recognition')}
                </h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  {t('home.howItWorks.step2Desc', 'Smart OCR extracts test parameters, numeric values, and units while filtering out visual noise.')}
                </p>
              </div>
            </div>

            <div className="relative bg-slate-50/70 rounded-2xl p-6 border border-slate-200/80 flex flex-col justify-between group hover:bg-white hover:shadow-md transition-all">
              <div>
                <span className="text-3xl font-black text-teal-600/30 group-hover:text-teal-600 transition-colors block mb-4">03</span>
                <h3 className="text-base font-bold text-slate-900 mb-2">
                  {t('home.howItWorks.step3Title', '3. Reference Interval Comparison')}
                </h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  {t('home.howItWorks.step3Desc', 'Values are evaluated against laboratory reference intervals printed directly on your report.')}
                </p>
              </div>
            </div>

            <div className="relative bg-slate-50/70 rounded-2xl p-6 border border-slate-200/80 flex flex-col justify-between group hover:bg-white hover:shadow-md transition-all">
              <div>
                <span className="text-3xl font-black text-teal-600/30 group-hover:text-teal-600 transition-colors block mb-4">04</span>
                <h3 className="text-base font-bold text-slate-900 mb-2">
                  {t('home.howItWorks.step4Title', '4. Plain-Language Guidance')}
                </h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  {t('home.howItWorks.step4Desc', 'Receive intuitive explanations, dietary questions, and talking points for your doctor.')}
                </p>
              </div>
            </div>
          </div>

          <div className="mt-12 text-center">
            <Button
              variant="primary"
              size="lg"
              onClick={() => navigate('/scan')}
              icon={ArrowRight}
              iconPosition="right"
            >
              {t('home.ctaBanner.button', 'Start Scanning Now')}
            </Button>
          </div>

        </div>
      </section>

      {/* MEDICAL DISCLAIMER SECTION */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <Disclaimer />
      </section>

    </div>
  );
}
