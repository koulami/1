import React, { useEffect, useState } from 'react';
import QRCode from 'qrcode';
import {
  X,
  QrCode as QrCodeIcon,
  Download,
  Printer,
  Copy,
  Check,
  Play,
  Film,
  Image as ImageIcon,
  Sparkles,
  MapPin,
  ExternalLink
} from 'lucide-react';
import { Question, FieldSpotInfo, Language } from '../types/game';
import { getQuestionFieldSpot, generateDefaultSpotCode } from '../utils/qrMediaHelper';

interface Props {
  question: Question;
  lang: Language;
  onClose: () => void;
  onTriggerMedia: (question: Question, fieldSpot: FieldSpotInfo) => void;
}

export const TaskQrCodeModal: React.FC<Props> = ({
  question,
  lang,
  onClose,
  onTriggerMedia
}) => {
  const isEl = lang === 'el';
  const [dataUrl, setDataUrl] = useState<string>('');
  const [copied, setCopied] = useState<boolean>(false);

  const fieldSpot: FieldSpotInfo = getQuestionFieldSpot(question) || {
    spotCode: generateDefaultSpotCode(question),
    spotName: question.title,
    spotName_en: question.title_en,
    mediaType: question.videoUrl ? 'video' : 'image',
    mediaUrl: question.videoUrl || question.imageUrl || '',
    mediaTitle: question.title,
    caption: question.description
  };

  const qrValue = fieldSpot.spotCode || generateDefaultSpotCode(question);

  useEffect(() => {
    let isMounted = true;
    QRCode.toDataURL(qrValue, {
      width: 320,
      margin: 2,
      errorCorrectionLevel: 'H',
      color: {
        dark: '#0f172a',
        light: '#ffffff'
      }
    })
      .then((url) => {
        if (isMounted) setDataUrl(url);
      })
      .catch((err) => {
        console.error('Failed to generate QR code', err);
      });

    return () => {
      isMounted = false;
    };
  }, [qrValue]);

  const handleCopyCode = async () => {
    try {
      await navigator.clipboard.writeText(qrValue);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback
    }
  };

  const handleDownloadQr = () => {
    if (!dataUrl) return;
    const a = document.createElement('a');
    a.href = dataUrl;
    a.download = `QR-Spot-${qrValue}.png`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const handlePrintPlacard = () => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>QR Field Station - ${qrValue}</title>
          <style>
            body {
              font-family: system-ui, -apple-system, sans-serif;
              text-align: center;
              padding: 40px;
              color: #0f172a;
            }
            .card {
              border: 3px solid #0f172a;
              border-radius: 20px;
              padding: 30px;
              max-width: 480px;
              margin: 0 auto;
            }
            .badge {
              display: inline-block;
              background: #fef3c7;
              color: #92400e;
              font-weight: 900;
              padding: 6px 14px;
              border-radius: 9999px;
              font-size: 14px;
              margin-bottom: 12px;
            }
            h1 {
              font-size: 22px;
              margin: 8px 0;
            }
            .code {
              font-family: monospace;
              font-size: 16px;
              background: #f1f5f9;
              padding: 6px 12px;
              border-radius: 8px;
              display: inline-block;
              font-weight: bold;
              margin-bottom: 16px;
            }
            img {
              width: 260px;
              height: 260px;
              margin: 10px 0;
            }
            p {
              font-size: 13px;
              color: #475569;
              margin-top: 10px;
            }
          </style>
        </head>
        <body>
          <div class="card">
            <div class="badge">🦅 CYPRUS GRIFFON VULTURE EXPEDITION</div>
            <h1>${fieldSpot.spotName || question.title}</h1>
            <div class="code">TRIGGER: ${qrValue}</div>
            <div>
              <img src="${dataUrl}" alt="QR Code" />
            </div>
            <p><strong>Σαρώστε με την εφαρμογή BoundPad για άμεση προβολή βίντεο / φωτογραφίας πεδίου.</strong></p>
          </div>
          <script>
            window.onload = function() {
              window.print();
            };
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
      <div
        className="w-full max-w-md rounded-3xl bg-slate-900 border-2 border-amber-500/50 shadow-2xl overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-800 bg-slate-950 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-300">
              <QrCodeIcon className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-black text-white">
                {isEl ? 'Κωδικός QR Σταθμού Πεδίου' : 'Field Station QR Code'}
              </h3>
              <p className="text-[11px] text-slate-400">
                {isEl ? 'Σάρωση & Άμεση Αναπαραγωγή' : 'Scan & Instant Playback'}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 sm:p-6 space-y-5 text-center flex flex-col items-center">
          {/* Station Info Header */}
          <div className="space-y-1">
            <span className="px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40 text-xs font-black uppercase tracking-wider inline-flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5" />
              <span>{fieldSpot.spotName || question.title}</span>
            </span>
            <h4 className="text-sm font-bold text-slate-100 max-w-xs mx-auto line-clamp-2">
              {isEl ? question.title : question.title_en || question.title}
            </h4>
          </div>

          {/* QR Code Container */}
          <div className="p-4 rounded-3xl bg-white shadow-2xl border-4 border-amber-400 flex flex-col items-center justify-center transition-transform hover:scale-105">
            {dataUrl ? (
              <img
                src={dataUrl}
                alt={`QR Code: ${qrValue}`}
                className="w-52 h-52 sm:w-60 sm:h-60 rounded-xl"
              />
            ) : (
              <div className="w-52 h-52 bg-slate-100 rounded-xl animate-pulse" />
            )}

            <span className="mt-2 font-mono text-xs font-black text-slate-900 tracking-wider">
              {qrValue}
            </span>
          </div>

          {/* Media Attached Hint */}
          <div className="w-full p-2.5 rounded-xl bg-slate-950/80 border border-slate-800 text-xs text-slate-300 flex items-center justify-between gap-2">
            <div className="flex items-center gap-2 min-w-0">
              {fieldSpot.mediaType === 'video' ? (
                <Film className="w-4 h-4 text-purple-400 shrink-0" />
              ) : (
                <ImageIcon className="w-4 h-4 text-cyan-400 shrink-0" />
              )}
              <span className="truncate text-[11px]">
                {fieldSpot.mediaType === 'video'
                  ? (isEl ? 'Συνδεδεμένο Βίντεο Πεδίου' : 'Associated Field Video')
                  : (isEl ? 'Συνδεδεμένη Φωτογραφία Υψηλής Ευκρίνειας' : 'High-Res Photo')}
              </span>
            </div>
            <span className="px-2 py-0.5 rounded-md bg-amber-500/20 text-amber-300 text-[10px] font-bold">
              +{question.points} pts
            </span>
          </div>

          {/* Instant Simulation / Trigger Button */}
          <button
            type="button"
            onClick={() => {
              onClose();
              onTriggerMedia(question, fieldSpot);
            }}
            className="w-full py-3 px-4 rounded-2xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black text-xs sm:text-sm flex items-center justify-center gap-2 shadow-lg shadow-amber-500/20 cursor-pointer active:scale-95 transition-all"
          >
            <Play className="w-4 h-4 fill-slate-950" />
            <span>{isEl ? '⚡ Δοκιμή Σάρωσης & Αναπαραγωγή' : '⚡ Simulate Scan & Play Media'}</span>
          </button>

          {/* Auxiliary Print & Download Actions */}
          <div className="grid grid-cols-3 gap-2 w-full pt-1">
            <button
              type="button"
              onClick={handleCopyCode}
              className="py-2 px-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-[11px] font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5 text-amber-400" />}
              <span>{copied ? (isEl ? 'Αντιγράφηκε!' : 'Copied!') : (isEl ? 'Αντιγραφή' : 'Copy')}</span>
            </button>

            <button
              type="button"
              onClick={handleDownloadQr}
              className="py-2 px-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-[11px] font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
            >
              <Download className="w-3.5 h-3.5 text-cyan-400" />
              <span>{isEl ? 'Λήψη PNG' : 'Save PNG'}</span>
            </button>

            <button
              type="button"
              onClick={handlePrintPlacard}
              className="py-2 px-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-[11px] font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5 text-emerald-400" />
              <span>{isEl ? 'Εκτύπωση' : 'Print'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
