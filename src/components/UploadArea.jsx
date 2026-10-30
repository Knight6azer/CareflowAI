import React, { useState, useRef } from 'react';
import { Upload, FileText, Image as ImageIcon, CheckCircle2, AlertCircle } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import Button from './Button';

export default function UploadArea({ onFileSelected, selectedFile }) {
  const { t } = useLanguage();
  const [isDragOver, setIsDragOver] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const fileInputRef = useRef(null);

  const acceptedTypes = ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png'];

  const validateAndSelect = (file) => {
    if (!file) return;
    setErrorMessage('');

    if (!acceptedTypes.includes(file.type) && !file.name.match(/\.(pdf|jpg|jpeg|png)$/i)) {
      setErrorMessage(t('uploadArea.invalidTypeError', 'Please upload a valid document (PDF, JPG, JPEG, or PNG).'));
      return;
    }

    if (file.size > 15 * 1024 * 1024) {
      setErrorMessage(t('uploadArea.sizeLimitError', 'File size exceeds maximum limit of 15MB.'));
      return;
    }

    onFileSelected(file);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      validateAndSelect(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      validateAndSelect(e.target.files[0]);
    }
  };

  const triggerFileInput = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  return (
    <div className="w-full">
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept=".pdf,.jpg,.jpeg,.png,image/jpeg,image/png,application/pdf"
        className="hidden"
        id="file-upload-input"
        aria-label="Upload medical report file"
      />

      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={triggerFileInput}
        className={`relative border-2 border-dashed rounded-2xl p-6 sm:p-10 text-center cursor-pointer transition-all duration-200 ${
          isDragOver
            ? 'border-teal-500 bg-teal-50/60 scale-[1.01]'
            : selectedFile
            ? 'border-teal-500/60 bg-teal-50/30'
            : 'border-slate-300 hover:border-teal-400 bg-white hover:bg-slate-50/80'
        }`}
      >
        <div className="flex flex-col items-center justify-center max-w-md mx-auto">
          <div className={`w-14 h-14 sm:w-16 sm:h-16 rounded-2xl flex items-center justify-center mb-4 transition-colors ${
            selectedFile ? 'bg-teal-100 text-teal-700' : 'bg-slate-100 text-slate-600'
          }`}>
            <Upload className="w-7 h-7 sm:w-8 sm:h-8" />
          </div>

          <h3 className="text-base sm:text-lg font-semibold text-slate-800 mb-1">
            {selectedFile ? t('uploadArea.changeFile', 'Change Selected File') : t('uploadArea.clickToUpload', 'Click to Upload or Drag & Drop')}
          </h3>

          <p className="text-xs sm:text-sm text-slate-500 mb-4 max-w-xs leading-relaxed">
            {t('uploadArea.supportedText', 'Supports medical lab reports in PDF, JPG, JPEG, or PNG format (Up to 15MB)')}
          </p>

          <Button
            type="button"
            variant={selectedFile ? "outline" : "primary"}
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              triggerFileInput();
            }}
          >
            {selectedFile ? t('uploadArea.chooseDifferent', 'Choose Different File') : t('uploadArea.browseFiles', 'Browse Files')}
          </Button>

          <div className="flex items-center gap-3 mt-6 text-2xs sm:text-xs text-slate-400 font-medium">
            <span className="flex items-center gap-1">
              <FileText className="w-3.5 h-3.5" /> PDF
            </span>
            <span>•</span>
            <span className="flex items-center gap-1">
              <ImageIcon className="w-3.5 h-3.5" /> JPG / PNG
            </span>
            <span>•</span>
            <span className="flex items-center gap-1 text-emerald-600 font-semibold">
              <CheckCircle2 className="w-3.5 h-3.5" /> {t('uploadArea.encryptedBadge', '256-Bit Encrypted')}
            </span>
          </div>
        </div>
      </div>

      {errorMessage && (
        <div className="mt-3 flex items-center gap-2 text-xs sm:text-sm text-red-600 bg-red-50 border border-red-200 rounded-xl p-3">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}
    </div>
  );
}
