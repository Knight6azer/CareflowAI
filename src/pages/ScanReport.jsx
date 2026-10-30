import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Camera, Upload, FileText, Trash2, CheckCircle2, Sparkles, TestTube2 } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import Button from '../components/Button';
import Card from '../components/Card';
import UploadArea from '../components/UploadArea';
import CameraScanner from '../components/CameraScanner';
import ProgressIndicator from '../components/ProgressIndicator';
import Disclaimer from '../components/Disclaimer';

export default function ScanReport() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { t } = useLanguage();

  const [activeTab, setActiveTab] = useState(searchParams.get('tab') === 'upload' ? 'upload' : 'camera');
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [cameraModalOpen, setCameraModalOpen] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  // Sync tab with query param if present
  useEffect(() => {
    if (searchParams.get('tab') === 'upload') {
      setActiveTab('upload');
    }
  }, [searchParams]);

  const handleFileSelected = (file) => {
    setSelectedFile(file);
    if (file.type && file.type.startsWith('image/')) {
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
    } else {
      setPreviewUrl(null);
    }
  };

  const handleCameraCapture = (file, dataUrl) => {
    setSelectedFile(file);
    setPreviewUrl(dataUrl);
    setCameraModalOpen(false);
  };

  const handleRemoveFile = () => {
    setSelectedFile(null);
    setPreviewUrl(null);
  };

  const handleStartAnalysis = () => {
    if (!selectedFile) return;
    setIsAnalyzing(true);
  };

  const handleTrySample = () => {
    // Generate a mock sample CBC lab file
    const sampleBlob = new Blob([
      "METROHEALTH DIAGNOSTICS LAB\nComplete Blood Count (CBC)\nPatient: Alex Morgan\nHemoglobin: 11.2 g/dL (Ref: 12.0 - 16.0)\nWBC: 6.8 x10^3/uL (Ref: 4.5 - 11.0)\nPlatelets: 240 x10^3/uL (Ref: 150 - 450)"
    ], { type: 'application/pdf' });
    const sampleFile = new File([sampleBlob], "sample_cbc_lab_report.pdf", { type: "application/pdf" });
    setSelectedFile(sampleFile);
    setPreviewUrl(null);
  };

  const handleAnalysisComplete = () => {
    // Navigate to the primary analyzed report detail view
    navigate('/reports/rpt-cbc-001');
  };

  const formatFileSize = (bytes) => {
    if (!bytes) return '1.2 MB';
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      
      {/* Header Section */}
      <div className="text-center max-w-2xl mx-auto mb-8 sm:mb-10 space-y-2">
        <h1 className="text-2xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
          {t('scan.title', 'Scan Your Medical Report')}
        </h1>
        <p className="text-sm sm:text-base text-slate-500">
          {t('scan.subtitle', 'Capture a clear image of your report or upload an existing file.')}
        </p>
      </div>

      {/* Analysis Progress Screen Overlay State */}
      {isAnalyzing ? (
        <div className="py-6">
          <ProgressIndicator onComplete={handleAnalysisComplete} />
        </div>
      ) : (
        <div className="space-y-8">
          
          {/* Dual Selection Tabs / Large Option Cards */}
          {!selectedFile && (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                {/* Option 1: Scan with Camera */}
                <div 
                  onClick={() => setCameraModalOpen(true)}
                  className="bg-white rounded-2xl border-2 border-slate-200 hover:border-teal-500 p-6 sm:p-8 text-center cursor-pointer transition-all duration-200 shadow-2xs hover:shadow-md group flex flex-col justify-between"
                >
                  <div>
                    <div className="w-16 h-16 rounded-2xl bg-teal-50 text-teal-600 group-hover:bg-teal-600 group-hover:text-white flex items-center justify-center mx-auto mb-4 transition-colors">
                      <Camera className="w-8 h-8" />
                    </div>
                    <h3 className="text-lg font-bold text-slate-900 mb-2">
                      {t('scan.cameraOptionTitle', 'Take a Photo with Camera')}
                    </h3>
                    <p className="text-xs sm:text-sm text-slate-500 mb-6 leading-relaxed">
                      {t('scan.cameraOptionDesc', 'Use your device camera to scan a paper lab report with automated alignment.')}
                    </p>
                  </div>
                  <Button
                    variant="primary"
                    size="md"
                    fullWidth
                    onClick={(e) => {
                      e.stopPropagation();
                      setCameraModalOpen(true);
                    }}
                    icon={Camera}
                  >
                    {t('scan.cameraButton', 'Open Camera Scanner')}
                  </Button>
                </div>

                {/* Option 2: Upload Report File */}
                <div 
                  onClick={() => setActiveTab('upload')}
                  className="bg-white rounded-2xl border-2 border-slate-200 hover:border-teal-500 p-6 sm:p-8 text-center cursor-pointer transition-all duration-200 shadow-2xs hover:shadow-md group flex flex-col justify-between"
                >
                  <div>
                    <div className="w-16 h-16 rounded-2xl bg-sky-50 text-sky-600 group-hover:bg-teal-600 group-hover:text-white flex items-center justify-center mx-auto mb-4 transition-colors">
                      <Upload className="w-8 h-8" />
                    </div>
                    <h3 className="text-lg font-bold text-slate-900 mb-2">
                      {t('scan.uploadOptionTitle', 'Upload Report Document')}
                    </h3>
                    <p className="text-xs sm:text-sm text-slate-500 mb-6 leading-relaxed">
                      {t('scan.uploadOptionDesc', 'Upload an existing PDF or image document from your computer or phone.')}
                    </p>
                  </div>
                  <Button
                    variant="secondary"
                    size="md"
                    fullWidth
                    onClick={(e) => {
                      e.stopPropagation();
                      setActiveTab('upload');
                    }}
                    icon={Upload}
                  >
                    {t('scan.uploadButton', 'Choose File to Upload')}
                  </Button>
                </div>

              </div>

              {/* Sample Report Loader Pill */}
              <div className="text-center pt-2">
                <button
                  type="button"
                  onClick={handleTrySample}
                  className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-teal-50/80 hover:bg-teal-100/80 text-teal-800 text-xs sm:text-sm font-semibold border border-teal-200/80 transition-all shadow-2xs group"
                >
                  <TestTube2 className="w-4 h-4 text-teal-600 group-hover:rotate-12 transition-transform" />
                  <span>{t('scan.trySampleButton', 'Or Try with Sample CBC Report')}</span>
                </button>
                <p className="text-2xs text-slate-400 mt-1">
                  {t('scan.trySampleHint', 'No report on hand? Test the system instantly with a sample blood test.')}
                </p>
              </div>
            </>
          )}

          {/* Interactive Upload Area when Upload tab selected or file choosing */}
          {!selectedFile && activeTab === 'upload' && (
            <Card className="border-teal-200/80">
              <UploadArea onFileSelected={handleFileSelected} selectedFile={selectedFile} />
            </Card>
          )}

          {/* AFTER IMAGE SELECTION PREVIEW CARD */}
          {selectedFile && (
            <div className="bg-white rounded-2xl border-2 border-teal-500 p-6 sm:p-8 shadow-md space-y-6 animate-in fade-in zoom-in-95 duration-200">
              <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                  <h3 className="font-bold text-slate-900 text-base">
                    {t('scan.previewTitle', 'Selected Document Ready')}
                  </h3>
                </div>
                <button
                  onClick={handleRemoveFile}
                  className="text-xs font-semibold text-red-600 hover:text-red-700 flex items-center gap-1 p-1.5 rounded-lg hover:bg-red-50 transition-colors"
                >
                  <Trash2 className="w-4 h-4" /> {t('scan.removeFile', 'Remove Document')}
                </button>
              </div>

              {/* Preview Content Container */}
              <div className="grid grid-cols-1 sm:grid-cols-12 gap-6 items-center">
                
                {/* Thumbnail / Document Graphic */}
                <div className="sm:col-span-4 flex justify-center">
                  {previewUrl ? (
                    <div className="relative rounded-xl overflow-hidden border border-slate-200 max-h-48 shadow-sm">
                      <img 
                        src={previewUrl} 
                        alt="Selected Report Preview" 
                        className="w-full h-full object-cover"
                      />
                    </div>
                  ) : (
                    <div className="w-32 h-40 bg-teal-50 rounded-xl border border-teal-200 flex flex-col items-center justify-center text-teal-700 p-4 text-center">
                      <FileText className="w-10 h-10 mb-2" />
                      <span className="text-xs font-bold uppercase">PDF Doc</span>
                    </div>
                  )}
                </div>

                {/* File Details */}
                <div className="sm:col-span-8 space-y-3">
                  <div>
                    <span className="text-2xs font-bold text-teal-700 uppercase tracking-wider bg-teal-50 px-2 py-0.5 rounded">
                      Document
                    </span>
                    <h4 className="font-bold text-slate-900 text-lg sm:text-xl truncate mt-1">
                      {selectedFile.name}
                    </h4>
                  </div>

                  <div className="grid grid-cols-2 gap-4 text-xs text-slate-500 bg-slate-50 p-3 rounded-xl border border-slate-200/60">
                    <div>
                      <span className="block text-slate-400">File Type</span>
                      <strong className="text-slate-800 uppercase">
                        {(selectedFile.type && selectedFile.type.split('/')[1]) || 'PDF'}
                      </strong>
                    </div>
                    <div>
                      <span className="block text-slate-400">File Size</span>
                      <strong className="text-slate-800">{formatFileSize(selectedFile.size)}</strong>
                    </div>
                  </div>

                  <div className="pt-2 flex flex-col sm:flex-row gap-3">
                    <Button
                      variant="primary"
                      size="lg"
                      fullWidth
                      onClick={handleStartAnalysis}
                      icon={Sparkles}
                      className="shadow-md shadow-teal-600/20"
                    >
                      {t('scan.startAnalysis', 'Analyze Report Now')}
                    </Button>
                    <Button
                      variant="outline"
                      size="lg"
                      onClick={handleRemoveFile}
                      icon={Trash2}
                    >
                      {t('scan.removeFile', 'Remove Document')}
                    </Button>
                  </div>
                </div>

              </div>
            </div>
          )}

          {/* Compact Disclaimer */}
          <Disclaimer compact />

        </div>
      )}

      {/* Camera Scanning Modal */}
      {cameraModalOpen && (
        <CameraScanner
          onCapture={handleCameraCapture}
          onClose={() => setCameraModalOpen(false)}
        />
      )}

    </div>
  );
}
