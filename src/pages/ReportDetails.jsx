import React, { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Download, Share2, Sparkles, Calendar, Building2, User, FileText, CheckCircle2, AlertTriangle, Printer, HelpCircle, Filter } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import Button from '../components/Button';
import Card from '../components/Card';
import ParameterCard from '../components/ParameterCard';
import StatusBadge from '../components/StatusBadge';
import Disclaimer from '../components/Disclaimer';
import Modal from '../components/Modal';
import { MOCK_REPORTS } from '../data/mockData';

export default function ReportDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { t } = useLanguage();
  const [shareModalOpen, setShareModalOpen] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [paramFilter, setParamFilter] = useState('all'); // 'all', 'attention', 'normal'

  // Find report by ID or default to CBC
  const report = MOCK_REPORTS.find(r => r.id === id) || MOCK_REPORTS[0];

  const handleDownload = () => {
    window.print();
  };

  const handleCopyLink = () => {
    navigator.clipboard?.writeText(window.location.href);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const filteredParameters = (report.parameters || []).filter(param => {
    if (paramFilter === 'attention') {
      return param.severity === 'warning' || (param.status && !param.status.toLowerCase().includes('normal'));
    }
    if (paramFilter === 'normal') {
      return param.severity === 'normal' || (param.status && param.status.toLowerCase().includes('normal'));
    }
    return true;
  });

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-8 print:p-0">
      
      {/* Top Back & Print/Download Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200/80 pb-6 print:hidden">
        <Link 
          to="/reports"
          className="inline-flex items-center gap-2 text-xs sm:text-sm font-semibold text-slate-600 hover:text-teal-700 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>{t('reportDetails.backButton', 'Back to My Reports')}</span>
        </Link>

        <div className="flex items-center gap-2.5">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShareModalOpen(true)}
            icon={Share2}
          >
            {t('reportDetails.share', 'Share')}
          </Button>
          <Button
            variant="primary"
            size="sm"
            onClick={handleDownload}
            icon={Download}
            className="shadow-sm shadow-teal-600/20"
          >
            {t('reportDetails.download', 'Download / Print')}
          </Button>
        </div>
      </div>

      {/* Main Report Header Card */}
      <div className="bg-white rounded-3xl border border-slate-200/90 p-6 sm:p-8 shadow-xs space-y-6">
        
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="text-2xs font-extrabold uppercase tracking-wider text-teal-700 bg-teal-50 px-2.5 py-1 rounded-md border border-teal-200/70">
                {report.type}
              </span>
              <StatusBadge status={report.status} size="sm" />
            </div>
            <h1 className="text-2xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
              {report.title}
            </h1>
          </div>

          <div className="text-left sm:text-right text-xs text-slate-500 space-y-1">
            <p className="flex items-center sm:justify-end gap-1.5 font-medium text-slate-700">
              <Calendar className="w-3.5 h-3.5 text-teal-600" />
              <span>{t('reportDetails.reportDate', 'Report Date:')} <strong>{report.date}</strong></span>
            </p>
            <p className="flex items-center sm:justify-end gap-1.5">
              <Building2 className="w-3.5 h-3.5 text-slate-400" />
              <span>{t('reportDetails.lab', 'Lab:')} {report.labName}</span>
            </p>
          </div>
        </div>

        {/* Patient-Friendly Report Summary */}
        <div className="p-4 sm:p-5 rounded-2xl bg-teal-50/60 border border-teal-200/80 space-y-2">
          <h3 className="text-xs font-bold text-teal-900 uppercase tracking-wider flex items-center gap-1.5">
            <Sparkles className="w-4 h-4 text-teal-600" /> {t('reportDetails.summaryHeading', 'Executive Patient Summary')}
          </h3>
          <p className="text-xs sm:text-sm text-slate-700 leading-relaxed font-normal">
            {report.summary}
          </p>
        </div>

      </div>

      {/* IMPORTANT PARAMETERS SECTION WITH FILTERING */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-lg sm:text-2xl font-bold text-slate-900">
              {t('reportDetails.parametersSectionTitle', 'Analyzed Laboratory Parameters')}
            </h2>
            <span className="text-xs text-slate-500">
              {filteredParameters.length} of {report.parameters.length} markers shown
            </span>
          </div>

          {/* Filter Pills */}
          <div className="inline-flex items-center bg-slate-100 p-1 rounded-xl text-xs font-semibold border border-slate-200">
            <button
              type="button"
              onClick={() => setParamFilter('all')}
              className={`px-3 py-1.5 rounded-lg transition-colors ${
                paramFilter === 'all' ? 'bg-white text-teal-700 shadow-2xs font-bold' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {t('reportDetails.filterAll', 'All Tests')}
            </button>
            <button
              type="button"
              onClick={() => setParamFilter('attention')}
              className={`px-3 py-1.5 rounded-lg transition-colors ${
                paramFilter === 'attention' ? 'bg-white text-amber-700 shadow-2xs font-bold' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {t('reportDetails.filterAttention', 'Needs Attention')}
            </button>
            <button
              type="button"
              onClick={() => setParamFilter('normal')}
              className={`px-3 py-1.5 rounded-lg transition-colors ${
                paramFilter === 'normal' ? 'bg-white text-emerald-700 shadow-2xs font-bold' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {t('reportDetails.filterNormal', 'Normal Range')}
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredParameters.map((param, idx) => (
            <ParameterCard key={idx} parameter={param} />
          ))}
        </div>
      </div>

      {/* AI EXPLANATION SECTION: "Understanding Your Results" */}
      <div className="bg-white rounded-3xl border-2 border-teal-500/80 p-6 sm:p-8 shadow-md space-y-6">
        
        <div className="flex items-center gap-3 pb-4 border-b border-slate-100">
          <div className="p-2.5 rounded-2xl bg-teal-100 text-teal-700">
            <Sparkles className="w-6 h-6" />
          </div>
          <div>
            <span className="text-2xs font-extrabold uppercase tracking-widest text-teal-700">
              CareFlow AI Insights
            </span>
            <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900">
              {t('reportDetails.aiHeadline', 'Understanding Your Results & Overview')}
            </h2>
          </div>
        </div>

        {/* Headline */}
        <h3 className="text-base sm:text-lg font-bold text-teal-950">
          {report.aiExplanation.headline}
        </h3>

        {/* Overview */}
        <p className="text-xs sm:text-sm text-slate-700 leading-relaxed">
          {report.aiExplanation.overview}
        </p>

        {/* Key Takeaways */}
        <div className="space-y-2">
          <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
            {t('reportDetails.keyTakeawaysTitle', 'Key Takeaways')}
          </h4>
          <ul className="space-y-2">
            {report.aiExplanation.keyTakeaways.map((takeaway, i) => (
              <li key={i} className="flex items-start gap-2.5 text-xs sm:text-sm text-slate-700">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <span>{takeaway}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Practical Advice */}
        {report.aiExplanation.practicalAdvice && (
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2">
            <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
              {t('reportDetails.practicalAdviceTitle', 'Practical Lifestyle & Diet Advice')}
            </h4>
            <ul className="space-y-1.5">
              {report.aiExplanation.practicalAdvice.map((adv, i) => (
                <li key={i} className="text-xs sm:text-sm text-slate-600 flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-teal-600"></span>
                  <span>{adv}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Questions for Doctor */}
        {report.aiExplanation.questionsForDoctor && (
          <div className="p-4 rounded-2xl bg-amber-50/70 border border-amber-200/80 space-y-2">
            <h4 className="text-xs font-bold text-amber-950 uppercase tracking-wider flex items-center gap-1.5">
              <HelpCircle className="w-4 h-4 text-amber-700" /> {t('reportDetails.questionsTitle', 'Questions to Ask Your Doctor')}
            </h4>
            <ul className="space-y-1.5 text-xs sm:text-sm text-amber-900">
              {report.aiExplanation.questionsForDoctor.map((q, i) => (
                <li key={i} className="flex items-start gap-2">
                  <span className="font-bold text-amber-700">•</span>
                  <span>"{q}"</span>
                </li>
              ))}
            </ul>
          </div>
        )}

      </div>

      {/* REPORT INFORMATION METADATA BOX */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-2xs space-y-4">
        <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
          Report Metadata & Processing Log
        </h3>
        
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
          <div className="p-3 bg-slate-50 rounded-xl">
            <span className="text-slate-400 block mb-1">Report Category</span>
            <strong className="text-slate-800 font-semibold">{report.type}</strong>
          </div>
          <div className="p-3 bg-slate-50 rounded-xl">
            <span className="text-slate-400 block mb-1">Upload Date</span>
            <strong className="text-slate-800 font-semibold">{report.date}</strong>
          </div>
          <div className="p-3 bg-slate-50 rounded-xl">
            <span className="text-slate-400 block mb-1">Total Pages</span>
            <strong className="text-slate-800 font-semibold">{report.pageCount} Page(s)</strong>
          </div>
          <div className="p-3 bg-slate-50 rounded-xl">
            <span className="text-slate-400 block mb-1">Status</span>
            <strong className="text-emerald-700 font-semibold">{report.status}</strong>
          </div>
        </div>
      </div>

      {/* Bottom Actions Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 print:hidden">
        <Button
          variant="outline"
          onClick={() => navigate('/reports')}
          icon={ArrowLeft}
        >
          {t('reportDetails.backButton', 'Back to My Reports')}
        </Button>

        <Button
          variant="primary"
          onClick={handleDownload}
          icon={Printer}
          className="shadow-sm shadow-teal-600/20"
        >
          {t('reportDetails.download', 'Download / Print')}
        </Button>
      </div>

      {/* Medical Disclaimer */}
      <Disclaimer />

      {/* Share Modal */}
      <Modal
        isOpen={shareModalOpen}
        onClose={() => setShareModalOpen(false)}
        title={t('reportDetails.share', 'Share Medical Report Explanation')}
      >
        <div className="space-y-4">
          <p className="text-xs sm:text-sm text-slate-600">
            Share this simplified report summary with your family member or doctor.
          </p>

          <div className="flex items-center gap-2">
            <input
              type="text"
              readOnly
              value={window.location.href}
              className="flex-1 px-3 py-2 text-xs bg-slate-100 rounded-xl border border-slate-300 font-mono"
            />
            <Button
              variant="primary"
              size="sm"
              onClick={handleCopyLink}
            >
              {copiedLink ? t('reportDetails.linkCopied', 'Link Copied!') : t('reportDetails.share', 'Copy Link')}
            </Button>
          </div>
        </div>
      </Modal>

    </div>
  );
}
