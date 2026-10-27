import React, { useState, useRef, useEffect } from 'react';
import {
  X,
  Camera,
  Upload,
  AlertCircle,
  QrCode,
  Sparkles,
  Zap,
  CheckCircle2,
  MapPin,
  HelpCircle,
  Film,
  Image as ImageIcon
} from 'lucide-react';
import jsQR from 'jsqr';
import confetti from 'canvas-confetti';
import { Question, FieldSpotInfo, Language } from '../types/game';
import { findQuestionByQrScan, getQuestionFieldSpot } from '../utils/qrMediaHelper';
import { sound } from '../services/sound';

interface Props {
  questions: Question[];
  lang: Language;
  onClose: () => void;
  onScanSuccess: (question: Question, fieldSpot: FieldSpotInfo) => void;
}

export const FieldQrScannerModal: React.FC<Props> = ({
  questions,
  lang,
  onClose,
  onScanSuccess
}) => {
  const isEl = lang === 'el';
  const [isCameraActive, setIsCameraActive] = useState<boolean>(false);
  const [manualCode, setManualCode] = useState<string>('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isScanning, setIsScanning] = useState<boolean>(false);

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const animationFrameRef = useRef<number | null>(null);

  // Available station presets for instant classroom testing
  const stationPresets = questions
    .map((q) => {
      const fs = getQuestionFieldSpot(q);
      if (!fs) return null;
      return { question: q, fieldSpot: fs };
    })
    .filter(Boolean) as { question: Question; fieldSpot: FieldSpotInfo }[];

  const stopCamera = () => {
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach((track) => track.stop());
      videoRef.current.srcObject = null;
    }
    setIsCameraActive(false);
  };

  useEffect(() => {
    // Start camera by default on open if supported
    startCamera();
    return () => {
      stopCamera();
    };
  }, []);

  const handleCodeFound = (code: string) => {
    const matched = findQuestionByQrScan(code, questions);
    if (matched) {
      sound.playSuccess();
      try {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 }
        });
      } catch {
        // Confetti fallback
      }
      stopCamera();
      onClose();
      onScanSuccess(matched.question, matched.fieldSpot);
    } else {
      sound.playError();
      setErrorMessage(
        isEl
          ? `Ο κωδικός «${code}» δεν αντιστοιχεί σε κάποιο σταθμό ή αποστολή του προγράμματος.`
          : `Code "${code}" was not found in active stations or quests.`
      );
    }
  };

  const scanFrame = () => {
    if (!videoRef.current || !canvasRef.current || !isCameraActive) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d', { willReadFrequently: true });

    if (video.readyState === video.HAVE_ENOUGH_DATA && ctx) {
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const code = jsQR(imageData.data, imageData.width, imageData.height, {
        inversionAttempts: 'dontInvert'
      });

      if (code && code.data) {
        handleCodeFound(code.data);
        return;
      }
    }

    animationFrameRef.current = requestAnimationFrame(scanFrame);
  };

  const startCamera = async () => {
    setErrorMessage(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' }
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.setAttribute('playsinline', 'true');
        await videoRef.current.play();
        setIsCameraActive(true);
        animationFrameRef.current = requestAnimationFrame(scanFrame);
      }
    } catch {
      setIsCameraActive(false);
      // Permission denied or camera not available, user can still use manual entry or file upload
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0);
          const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
          const code = jsQR(imageData.data, imageData.width, imageData.height);
          if (code && code.data) {
            handleCodeFound(code.data);
          } else {
            sound.playError();
            setErrorMessage(
              isEl
                ? 'Δεν εντοπίστηκε έγκυρο QR Code στην επιλεγμένη εικόνα.'
                : 'No valid QR Code was detected in the selected image.'
            );
          }
        }
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualCode.trim()) return;
    handleCodeFound(manualCode.trim());
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/85 backdrop-blur-md animate-fadeIn">
      <div
        className="w-full max-w-lg max-h-[92vh] flex flex-col rounded-3xl bg-slate-900 border-2 border-amber-500/50 shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-800 bg-slate-950 flex items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/20 border border-amber-500/50 flex items-center justify-center text-amber-300">
              <Camera className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-black text-white">
                {isEl ? 'Σάρωση QR Σταθμού Πεδίου' : 'Field Station QR Scanner'}
              </h3>
              <p className="text-[11px] text-slate-400">
                {isEl ? 'Σκανάρετε για άμεση προβολή βίντεο & φωτογραφίας' : 'Scan for instant video & photo playback'}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => {
              stopCamera();
              onClose();
            }}
            className="p-1.5 rounded-xl bg-slate-800 hover:bg-rose-950 hover:text-rose-300 text-slate-400 border border-slate-700 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
          {/* Live Viewfinder */}
          <div className="relative rounded-2xl overflow-hidden border-2 border-amber-400 bg-black aspect-video flex items-center justify-center shadow-xl">
            {isCameraActive ? (
              <>
                <video ref={videoRef} className="w-full h-full object-cover" />
                <canvas ref={canvasRef} className="hidden" />

                {/* Animated Scanner Reticle */}
                <div className="absolute inset-0 pointer-events-none flex flex-col items-center justify-center gap-2">
                  <div className="w-44 h-44 sm:w-52 sm:h-52 border-2 border-dashed border-amber-400 rounded-2xl animate-pulse bg-amber-500/10 flex items-center justify-center">
                    <div className="w-20 h-20 border border-amber-400/50 rounded-xl" />
                  </div>
                  <span className="px-3 py-1 rounded-full bg-black/80 text-amber-300 font-mono text-[10px] font-bold border border-amber-500/40">
                    {isEl ? 'Στρέψτε την κάμερα στο QR' : 'Align QR inside box'}
                  </span>
                </div>

                <button
                  type="button"
                  onClick={stopCamera}
                  className="absolute bottom-3 right-3 px-3 py-1.5 rounded-lg bg-rose-600/90 hover:bg-rose-600 text-white text-xs font-bold transition-colors shadow-lg cursor-pointer"
                >
                  {isEl ? 'Παύση Κάμερας' : 'Stop Camera'}
                </button>
              </>
            ) : (
              <div className="p-6 text-center space-y-3">
                <div className="w-12 h-12 rounded-2xl bg-slate-800 border border-slate-700 flex items-center justify-center mx-auto text-slate-400">
                  <Camera className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-300">
                    {isEl ? 'Η κάμερα δεν είναι ενεργή' : 'Camera is inactive'}
                  </p>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    {isEl ? 'Ενεργοποιήστε την κάμερα ή επιλέξτε αρχείο παρακάτω' : 'Start camera or choose an image file below'}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={startCamera}
                  className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-black shadow-md shadow-amber-500/20 cursor-pointer transition-all active:scale-95"
                >
                  {isEl ? 'Έναρξη Κάμερας' : 'Start Camera'}
                </button>
              </div>
            )}
          </div>

          {/* Upload QR Image Button */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="flex-1 py-2.5 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 text-xs font-bold flex items-center justify-center gap-2 transition-colors cursor-pointer"
            >
              <Upload className="w-4 h-4 text-cyan-400" />
              <span>{isEl ? 'Επιλογή Εικόνας QR από Συσκευή' : 'Upload QR Image from Device'}</span>
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleFileUpload}
            />
          </div>

          {/* Manual Passcode Entry Form */}
          <form onSubmit={handleManualSubmit} className="space-y-1.5 pt-1">
            <label className="block text-xs font-bold text-slate-400">
              {isEl ? 'Ή πληκτρολογήστε τον κωδικό σταθμού / URL:' : 'Or enter station code / trigger URL:'}
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={manualCode}
                onChange={(e) => setManualCode(e.target.value)}
                placeholder="π.χ. VULTURE-PARK-STATION-56"
                className="flex-1 px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white placeholder:text-slate-600 focus:outline-none focus:border-amber-400 uppercase font-mono"
              />
              <button
                type="submit"
                disabled={!manualCode.trim()}
                className="px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 disabled:opacity-40 text-slate-950 font-black text-xs transition-colors cursor-pointer"
              >
                {isEl ? 'Άνοιγμα' : 'Open'}
              </button>
            </div>
          </form>

          {/* Error Banner */}
          {errorMessage && (
            <div className="p-3 rounded-xl bg-rose-950/40 border border-rose-800 text-rose-300 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Quick Station Simulator (Ideal for Indoor Classroom / Testing) */}
          <div className="pt-2 border-t border-slate-800 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-black uppercase text-amber-400 flex items-center gap-1.5">
                <Zap className="w-3 h-3 text-amber-400" />
                <span>{isEl ? '⚡ Προσομοιωτής Σταθμών (Δοκιμή εντός Αίθουσας)' : '⚡ Station Simulator (Classroom Testing)'}</span>
              </span>
              <span className="text-[10px] text-slate-400">
                {stationPresets.length} {isEl ? 'σταθμοί' : 'stations'}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-40 overflow-y-auto no-scrollbar pr-1">
              {stationPresets.slice(0, 6).map(({ question, fieldSpot }) => (
                <button
                  key={question.id}
                  type="button"
                  onClick={() => {
                    handleCodeFound(fieldSpot.spotCode || question.id);
                  }}
                  className="p-2.5 rounded-xl bg-slate-950/70 hover:bg-amber-500/10 border border-slate-800 hover:border-amber-500/50 text-left transition-all cursor-pointer flex items-center gap-2.5 group"
                >
                  <div className="w-7 h-7 rounded-lg bg-slate-800 group-hover:bg-amber-500/20 text-slate-400 group-hover:text-amber-300 flex items-center justify-center shrink-0">
                    {fieldSpot.mediaType === 'video' ? (
                      <Film className="w-3.5 h-3.5" />
                    ) : (
                      <ImageIcon className="w-3.5 h-3.5" />
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <span className="font-bold text-xs text-slate-200 group-hover:text-amber-300 truncate block">
                      {isEl ? (fieldSpot.spotName || question.title) : (fieldSpot.spotName_en || question.title_en || question.title)}
                    </span>
                    <span className="font-mono text-[10px] text-slate-500 truncate block">
                      {fieldSpot.spotCode}
                    </span>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
