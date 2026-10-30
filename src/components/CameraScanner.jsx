import React, { useState, useEffect, useRef } from 'react';
import { Camera, RefreshCw, Check, X, SwitchCamera } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import Button from './Button';

export default function CameraScanner({ onCapture, onClose }) {
  const { t } = useLanguage();
  const [capturedImage, setCapturedImage] = useState(null);
  const [cameraActive, setCameraActive] = useState(false);
  const [facingMode, setFacingMode] = useState('environment'); // 'user' or 'environment'
  const [permissionError, setPermissionError] = useState(false);
  const videoRef = useRef(null);
  const streamRef = useRef(null);

  // Initialize browser camera or fallback simulator
  useEffect(() => {
    let active = true;

    async function startCamera() {
      try {
        if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
          const constraints = {
            video: {
              facingMode: facingMode,
              width: { ideal: 1280 },
              height: { ideal: 720 }
            }
          };
          const stream = await navigator.mediaDevices.getUserMedia(constraints);
          if (active && videoRef.current) {
            videoRef.current.srcObject = stream;
            streamRef.current = stream;
            setCameraActive(true);
          }
        } else {
          setPermissionError(true);
        }
      } catch (err) {
        console.log("Webcam access note:", err.message);
        setPermissionError(true);
      }
    }

    startCamera();

    return () => {
      active = false;
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
    };
  }, [facingMode]);

  const toggleCameraFacing = () => {
    setFacingMode(prev => prev === 'environment' ? 'user' : 'environment');
  };

  const handleCapture = () => {
    // If live video is working, draw to canvas
    if (videoRef.current && cameraActive && videoRef.current.videoWidth > 0) {
      const canvas = document.createElement('canvas');
      canvas.width = videoRef.current.videoWidth;
      canvas.height = videoRef.current.videoHeight;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(videoRef.current, 0, 0);
      const dataUrl = canvas.toDataURL('image/jpeg');
      setCapturedImage(dataUrl);
    } else {
      // Realistic simulated mock captured document image URL
      const mockCanvas = document.createElement('canvas');
      mockCanvas.width = 800;
      mockCanvas.height = 1000;
      const ctx = mockCanvas.getContext('2d');
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, 800, 1000);
      
      // Draw document mock text lines
      ctx.fillStyle = '#0f172a';
      ctx.font = 'bold 28px sans-serif';
      ctx.fillText('METROHEALTH DIAGNOSTICS LAB', 50, 80);
      
      ctx.fillStyle = '#64748b';
      ctx.font = '18px sans-serif';
      ctx.fillText('Patient: Alex Morgan  |  Date: 24 Sept 2026', 50, 120);
      ctx.fillRect(50, 140, 700, 2);
      
      ctx.fillStyle = '#0f172a';
      ctx.font = 'bold 22px sans-serif';
      ctx.fillText('COMPLETE BLOOD COUNT (CBC)', 50, 190);
      
      ctx.font = '16px sans-serif';
      const tests = [
        ['Hemoglobin', '11.2 g/dL', 'Ref: 12.0 - 16.0'],
        ['White Blood Cells (WBC)', '6.8 x10^3/uL', 'Ref: 4.5 - 11.0'],
        ['Platelets', '240 x10^3/uL', 'Ref: 150 - 450'],
        ['Red Blood Cells (RBC)', '4.2 x10^6/uL', 'Ref: 4.0 - 5.4'],
        ['Fasting Glucose', '95 mg/dL', 'Ref: 70 - 99']
      ];

      tests.forEach((t, i) => {
        const y = 250 + i * 45;
        ctx.fillStyle = '#1e293b';
        ctx.fillText(t[0], 50, y);
        ctx.fillStyle = i === 0 ? '#b45309' : '#047857';
        ctx.fillText(t[1], 380, y);
        ctx.fillStyle = '#64748b';
        ctx.fillText(t[2], 550, y);
      });

      const mockDataUrl = mockCanvas.toDataURL('image/jpeg');
      setCapturedImage(mockDataUrl);
    }
  };

  const handleRetake = () => {
    setCapturedImage(null);
  };

  const handleUsePhoto = () => {
    if (capturedImage) {
      // Create a mock File object
      const blobBin = atob(capturedImage.split(',')[1]);
      const array = [];
      for (let i = 0; i < blobBin.length; i++) {
        array.push(blobBin.charCodeAt(i));
      }
      const file = new File([new Uint8Array(array)], "camera_scanned_report.jpg", { type: "image/jpeg" });
      onCapture(file, capturedImage);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/90 backdrop-blur-sm flex flex-col justify-between p-4 sm:p-6 overflow-hidden">
      {/* Top Bar */}
      <div className="flex items-center justify-between z-10">
        <div className="flex items-center gap-2 text-white">
          <Camera className="w-5 h-5 text-teal-400" />
          <span className="font-semibold text-sm sm:text-base">{t('camera.title', 'Camera Scan')}</span>
        </div>
        <button
          onClick={onClose}
          className="p-2.5 rounded-full bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-700 transition-colors"
          aria-label="Close scanner"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Main Viewport Container */}
      <div className="relative my-auto flex-1 max-w-xl w-full mx-auto flex items-center justify-center overflow-hidden rounded-2xl border border-slate-700/80 bg-slate-900 shadow-2xl min-h-[350px] max-h-[600px]">
        {capturedImage ? (
          /* Captured Image Preview */
          <div className="relative w-full h-full flex flex-col items-center justify-center bg-black">
            <img 
              src={capturedImage} 
              alt="Scanned Report Preview" 
              className="max-h-full max-w-full object-contain"
            />
            <div className="absolute top-4 left-4 bg-teal-500/90 text-white text-xs font-semibold px-3 py-1 rounded-full backdrop-blur-md flex items-center gap-1.5 shadow-md">
              <Check className="w-3.5 h-3.5" /> {t('camera.photoCaptured', 'Photo Captured')}
            </div>
          </div>
        ) : (
          /* Live Camera Stream / Fallback Simulation View */
          <div className="relative w-full h-full flex items-center justify-center bg-slate-900 overflow-hidden">
            {/* Real Video element */}
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className={`absolute inset-0 w-full h-full object-cover ${cameraActive ? 'block' : 'hidden'}`}
            />

            {/* Fallback Simulation document view if video permission denied or pending */}
            {!cameraActive && (
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-900 p-6 text-center">
                <div className="w-full max-w-xs p-5 bg-white text-slate-900 rounded-xl shadow-lg border border-slate-200 opacity-90 scale-90">
                  <div className="h-4 bg-teal-700 rounded w-3/4 mb-3"></div>
                  <div className="h-2.5 bg-slate-200 rounded w-1/2 mb-4"></div>
                  <div className="space-y-2 mb-4">
                    <div className="h-2 bg-slate-200 rounded w-full"></div>
                    <div className="h-2 bg-slate-200 rounded w-5/6"></div>
                    <div className="h-2 bg-slate-200 rounded w-4/6"></div>
                  </div>
                  <div className="border-t pt-3 flex justify-between">
                    <div className="h-3 bg-slate-300 rounded w-1/3"></div>
                    <div className="h-3 bg-teal-600 rounded w-1/4"></div>
                  </div>
                </div>
                <p className="text-xs text-slate-400 mt-4 max-w-xs">
                  {permissionError 
                    ? t('camera.permissionHint', 'Camera simulation ready. Align your report inside the grid and press capture.') 
                    : t('camera.accessing', 'Accessing device camera...')}
                </p>
              </div>
            )}

            {/* Scanning Overlay Frame & Laser Beam */}
            <div className="absolute inset-4 sm:inset-8 border-2 border-teal-400/80 rounded-xl pointer-events-none flex flex-col justify-between p-3 shadow-[0_0_15px_rgba(20,184,166,0.3)]">
              <div className="flex justify-between">
                <div className="w-6 h-6 border-t-4 border-l-4 border-teal-400 rounded-tl-sm"></div>
                <div className="w-6 h-6 border-t-4 border-r-4 border-teal-400 rounded-tr-sm"></div>
              </div>
              
              {/* Scanning laser beam line */}
              <div className="relative w-full h-0.5 bg-gradient-to-r from-transparent via-teal-400 to-transparent shadow-[0_0_10px_#2dd4bf] animate-scan-line"></div>

              <div className="flex justify-between">
                <div className="w-6 h-6 border-b-4 border-l-4 border-teal-400 rounded-bl-sm"></div>
                <div className="w-6 h-6 border-b-4 border-r-4 border-teal-400 rounded-br-sm"></div>
              </div>
            </div>

            {/* Helper Guidance Text */}
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-slate-900/80 text-white text-xs px-4 py-1.5 rounded-full backdrop-blur-md border border-slate-700/80 pointer-events-none whitespace-nowrap">
              {t('camera.centerGuidance', 'Center medical report within frame')}
            </div>
          </div>
        )}
      </div>

      {/* Bottom Controls */}
      <div className="z-10 pt-4 pb-2 flex items-center justify-center gap-4 max-w-xl mx-auto w-full">
        {!capturedImage ? (
          <div className="flex items-center justify-between w-full px-6">
            <button
              onClick={toggleCameraFacing}
              className="p-3 rounded-full bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-700 transition-colors"
              title={t('camera.switchCamera', 'Switch Camera')}
              aria-label="Switch camera"
            >
              <SwitchCamera className="w-5 h-5" />
            </button>

            {/* Main Shutter Capture Button */}
            <button
              onClick={handleCapture}
              className="w-16 h-16 rounded-full bg-white p-1 shadow-lg hover:scale-105 active:scale-95 transition-all flex items-center justify-center group"
              aria-label="Capture report photo"
            >
              <div className="w-full h-full rounded-full border-4 border-teal-600 bg-teal-50 group-hover:bg-teal-100 flex items-center justify-center">
                <div className="w-6 h-6 rounded-full bg-teal-600"></div>
              </div>
            </button>

            <button
              onClick={onClose}
              className="p-3 rounded-full bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-700 transition-colors"
              title="Cancel"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        ) : (
          <div className="flex items-center gap-3 w-full sm:w-auto">
            <Button
              variant="outline"
              onClick={handleRetake}
              icon={RefreshCw}
              className="flex-1 sm:flex-initial border-slate-700 text-slate-200 hover:bg-slate-800 hover:text-white"
            >
              {t('camera.retake', 'Retake Photo')}
            </Button>
            <Button
              variant="primary"
              onClick={handleUsePhoto}
              icon={Check}
              className="flex-1 sm:flex-initial"
            >
              {t('camera.usePhoto', 'Use This Photo')}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
