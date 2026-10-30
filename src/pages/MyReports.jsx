import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Search, Filter, ArrowUpDown, Plus, FileText } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import Button from '../components/Button';
import ReportCard from '../components/ReportCard';
import { MOCK_REPORTS } from '../data/mockData';

export default function MyReports() {
  const { t } = useLanguage();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState('All');
  const [sortBy, setSortBy] = useState('latest');

  // Extract unique types for filter dropdown
  const types = ['All', ...new Set(MOCK_REPORTS.map(r => r.type))];

  // Filter & Sort Logic
  const filteredReports = MOCK_REPORTS.filter((report) => {
    const matchesSearch = report.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          report.labName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          report.type.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = selectedType === 'All' || report.type === selectedType;
    return matchesSearch && matchesType;
  }).sort((a, b) => {
    if (sortBy === 'latest') {
      return new Date(b.isoDate) - new Date(a.isoDate);
    } else if (sortBy === 'oldest') {
      return new Date(a.isoDate) - new Date(b.isoDate);
    } else if (sortBy === 'title') {
      return a.title.localeCompare(b.title);
    }
    return 0;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-8">
      
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            {t('myReports.title', 'My Reports')}
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            {t('myReports.subtitle', 'View, search, and manage your scanned medical report history.')}
          </p>
        </div>

        <Link to="/scan">
          <Button variant="primary" size="md" icon={Plus} className="w-full sm:w-auto shadow-sm shadow-teal-600/20">
            {t('myReports.scanNew', 'Scan New Report')}
          </Button>
        </Link>
      </div>

      {/* Controls: Search, Filter, Sort */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-4 sm:p-5 shadow-2xs space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-12 gap-3.5">
          
          {/* Search Input */}
          <div className="sm:col-span-6 relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder={t('myReports.searchPlaceholder', 'Search by report name, lab, or test type...')}
              className="w-full pl-10 pr-4 py-2.5 text-xs sm:text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-500 bg-slate-50/50"
            />
          </div>

          {/* Type Filter */}
          <div className="sm:col-span-3 relative">
            <Filter className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 text-xs sm:text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-500 bg-slate-50/50 appearance-none font-medium text-slate-700"
            >
              {types.map((typeOption) => (
                <option key={typeOption} value={typeOption}>
                  {typeOption === 'All' ? t('myReports.allTypes', 'All Report Types') : typeOption}
                </option>
              ))}
            </select>
          </div>

          {/* Sort Dropdown */}
          <div className="sm:col-span-3 relative">
            <ArrowUpDown className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 text-xs sm:text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-500 bg-slate-50/50 appearance-none font-medium text-slate-700"
            >
              <option value="latest">{t('myReports.latest', 'Latest Date')}</option>
              <option value="oldest">{t('myReports.oldest', 'Oldest Date')}</option>
              <option value="title">{t('myReports.name', 'Report Name')}</option>
            </select>
          </div>

        </div>
      </div>

      {/* Results Count */}
      <div className="flex items-center justify-between text-xs sm:text-sm text-slate-500">
        <span>
          Showing <strong className="text-slate-900 font-semibold">{filteredReports.length}</strong> {filteredReports.length === 1 ? 'report' : 'reports'}
        </span>
      </div>

      {/* Reports Display: Responsive Grid of Cards */}
      {filteredReports.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredReports.map((report) => (
            <ReportCard key={report.id} report={report} />
          ))}
        </div>
      ) : (
        /* Empty State */
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center max-w-md mx-auto my-8">
          <div className="w-12 h-12 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto mb-3">
            <FileText className="w-6 h-6" />
          </div>
          <h3 className="font-bold text-slate-800 text-base mb-1">
            {t('myReports.noReportsFound', 'No Reports Found')}
          </h3>
          <p className="text-xs text-slate-500 mb-6">
            We couldn't find any medical reports matching your current search or filter criteria.
          </p>
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              setSearchTerm('');
              setSelectedType('All');
            }}
          >
            {t('myReports.clearSearch', 'Clear Filters')}
          </Button>
        </div>
      )}

    </div>
  );
}
