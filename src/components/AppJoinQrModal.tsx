import React, { useState, useEffect } from 'react';
import QRCode from 'qrcode';
import {
  X,
  QrCode,
  Copy,
  Check,
  Download,
  Printer,
  Maximize2,
  Minimize2,
  ExternalLink,
  Sparkles,
  Smartphone,
  Globe,
  Share2,
  RefreshCw
} from 'lucide-react';

interface AppJoinQrModalProps {
  isOpen: boolean;
  onClose: () => void;
  lang: 'el' | 'en';
  defaultTab?: string;
}

export const AppJoinQrModal: React.FC<AppJoinQrModalProps> = ({
  isOpen,
  onClose,
  lang,
  defaultTab = 'home'
}) => {
  const isEl = lang === 'el';

  // Base live URL of the application
  const getBaseLiveUrl = () => {
    if (typeof window === 'undefined') return 'https://ais-dev-c76we52w6koqkel3h2r7ji-874757189421.europe-west2.run.app';
    // Remove query params or hashes to ensure a clean root URL
    return `${window.location.origin}${window.location.pathname}`;
  };

  const [selectedDestination, setSelectedDestination] = useState<string>(defaultTab);
  const [customUrl, setCustomUrl] = useState<string>('');
  const [isCustomMode, setIsCustomMode] = useState<boolean>(false);
  const [qrDataUrl, setQrDataUrl] = useState<string>('');
  const [copied, setCopied] = useState<boolean>(false);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [qrSize, setQrSize] = useState<number>(360);

  // Compute active target URL
  const activeUrl = React.useMemo(() => {
    if (isCustomMode && customUrl.trim()) {
      return customUrl.trim();
    }
    const base = getBaseLiveUrl();
    if (!selectedDestination || selectedDestination === 'home') {
      return base;
    }
    return `${base}?tab=${encodeURIComponent(selectedDestination)}`;
  }, [isCustomMode, customUrl, selectedDestination]);

  // Generate high-resolution QR code whenever activeUrl or qrSize changes
  useEffect(() => {
    let isMounted = true;
    QRCode.toDataURL(activeUrl, {
      width: isFullscreen ? 500 : qrSize,
      margin: 2,
      errorCorrectionLevel: 'H',
      color: {
        dark: '#0f172a', // Deep slate for crisp scanning
        light: '#ffffff'
      }
    })
      .then((url) => {
        if (isMounted) setQrDataUrl(url);
      })
      .catch((err) => {
        console.error('Failed to generate platform join QR code:', err);
      });

    return () => {
      isMounted = false;
    };
  }, [activeUrl, isFullscreen, qrSize]);

  // Copy URL to clipboard
  const handleCopyUrl = async () => {
    try {
      if (typeof navigator !== 'undefined' && navigator.clipboard) {
        await navigator.clipboard.writeText(activeUrl);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      }
    } catch (e) {
      console.warn('Clipboard write failed:', e);
    }
  };

  // Download QR code as PNG
  const handleDownloadPng = () => {
    if (!qrDataUrl) return;
    const link = document.createElement('a');
    link.href = qrDataUrl;
    link.download = `Vultures-Cyprus-Platform-QR-${selectedDestination}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Print QR Code classroom invitation sheet
  const handlePrint = () => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    const titleText = isEl
      ? 'Στο χείλος της εξαφάνισης - Οι γύπες στην Κύπρο'
      : 'On the verge of extinction - Vultures in Cyprus';
    const subtitleText = isEl
      ? 'Σαρώστε με την κάμερα του κινητού ή του tablet για άμεση είσοδο στην εκπαιδευτική πλατφόρμα'
      : 'Scan with your smartphone or tablet camera to access the environmental learning platform instantly';
    const instructionsTitle = isEl ? 'Οδηγίες Σύνδεσης Μαθητών:' : 'Student Connection Instructions:';
    const step1 = isEl
      ? '1. Ανοίξτε την εφαρμογή Κάμερας (Camera) στο κινητό ή το tablet σας.'
      : '1. Open the default Camera app on your smartphone or tablet.';
    const step2 = isEl
      ? '2. Εστιάστε στο QR Code μέχρι να εμφανιστεί ο κίτρινος/μπλε σύνδεσμος.'
      : '2. Point the camera at the QR code until the link notification appears.';
    const step3 = isEl
      ? '3. Πατήστε στον σύνδεσμο για να ξεκινήσετε την αποστολή της ομάδας σας!'
      : '3. Tap the link to enter the platform and begin your team mission!';

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>${titleText} - QR Code</title>
          <style>
            @page { size: A4 portrait; margin: 15mm; }
            body {
              font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
              color: #0f172a;
              margin: 0;
              padding: 20px;
              text-align: center;
            }
            .card {
              border: 3px solid #0f172a;
              border-radius: 24px;
              padding: 30px;
              max-width: 600px;
              margin: 0 auto;
            }
            .badge {
              display: inline-block;
              background-color: #059669;
              color: white;
              padding: 6px 16px;
              border-radius: 9999px;
              font-size: 14px;
              font-weight: bold;
              margin-bottom: 15px;
            }
            h1 {
              font-size: 26px;
              margin: 0 0 10px 0;
              color: #0f172a;
              line-height: 1.2;
            }
            p.sub {
              font-size: 15px;
              color: #475569;
              margin: 0 0 25px 0;
            }
            .qr-wrap {
              display: inline-block;
              padding: 16px;
              border: 2px solid #e2e880;
              border-radius: 20px;
              background: white;
              box-shadow: 0 4px 12px rgba(0,0,0,0.08);
            }
            .qr-wrap img {
              width: 280px;
              height: 280px;
              display: block;
            }
            .url-box {
              margin-top: 18px;
              font-family: monospace;
              font-size: 13px;
              background: #f1f5f9;
              padding: 10px 14px;
              border-radius: 12px;
              color: #0284c7;
              word-break: break-all;
            }
            .steps {
              text-align: left;
              margin-top: 30px;
              background: #f8fafc;
              border: 1px solid #cbd5e1;
              border-radius: 16px;
              padding: 20px;
            }
            .steps h3 {
              margin: 0 0 10px 0;
              font-size: 16px;
            }
            .steps p {
              margin: 6px 0;
              font-size: 14px;
              color: #334155;
            }
            .footer-note {
              margin-top: 25px;
              font-size: 12px;
              color: #94a3b8;
            }
          </style>
        </head>
        <body>
          <div class="card">
            <div class="badge">🦅 LIFE with Vultures • Master Task Pool</div>
            <h1>${titleText}</h1>
            <p class="sub">${subtitleText}</p>
            <div class="qr-wrap">
              <img src="${qrDataUrl}" alt="QR Code" />
            </div>
            <div class="url-box">${activeUrl}</div>
            <div class="steps">
              <h3>${instructionsTitle}</h3>
              <p>${step1}</p>
              <p>${step2}</p>
              <p>${step3}</p>
            </div>
            <div class="footer-note">
              BoundPad Vulture Arena • Εκπαιδευτικό Πρόγραμμα Περιβαλλοντικής Έρευνας & Δράσης
            </div>
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

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-5 overflow-y-auto animate-in fade-in duration-200">
      <div
        className={`w-full bg-slate-900 border border-slate-700/80 rounded-3xl shadow-2xl transition-all duration-300 flex flex-col ${
          isFullscreen
            ? 'max-w-4xl p-6 sm:p-10 my-auto'
            : 'max-w-2xl p-5 sm:p-7 my-auto'
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800 gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-sky-500 to-indigo-600 flex items-center justify-center text-white shadow-lg shadow-sky-500/20">
              <QrCode className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg sm:text-xl font-black text-white tracking-tight">
                  {isEl ? 'QR Code Σύνδεσης Μαθητών' : 'Student Join QR Code'}
                </h3>
                <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-[10px] font-black uppercase">
                  LIVE
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                {isEl
                  ? 'Σάρωση από tablet/smartphone για απευθείας είσοδο στην πλατφόρμα'
                  : 'Scan from tablets or phones to jump directly into the platform'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => setIsFullscreen(!isFullscreen)}
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors cursor-pointer"
              title={isFullscreen ? (isEl ? 'Σμίκρυνση' : 'Exit Fullscreen') : (isEl ? 'Πλήρης Οθόνη για Προβολέα' : 'Fullscreen Presenter')}
            >
              {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors cursor-pointer"
              title={isEl ? 'Κλείσιμο' : 'Close'}
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content Body */}
        <div className="py-5 space-y-6">
          {/* Quick Target Tabs */}
          <div className="space-y-2">
            <div className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center justify-between">
              <span>{isEl ? 'Προορισμός Συνδέσμου:' : 'Target Destination:'}</span>
              <button
                type="button"
                onClick={() => setIsCustomMode(!isCustomMode)}
                className="text-[11px] text-sky-400 hover:text-sky-300 underline font-medium cursor-pointer"
              >
                {isCustomMode
                  ? (isEl ? '← Προεπιλεγμένοι Προορισμοί' : '← Default Targets')
                  : (isEl ? 'Επεξεργασία Προσαρμοσμένου URL' : 'Custom URL Input')}
              </button>
            </div>

            {!isCustomMode ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {[
                  { id: 'home', label: isEl ? 'Κεντρική (Όλες οι Ομάδες)' : 'Lobby (All Teams)', icon: '🏛️' },
                  { id: 'group-1', label: isEl ? 'Ομάδα 1: Ταυτότητα' : 'Group 1: Identity', icon: '🧭' },
                  { id: 'group-2', label: isEl ? 'Ομάδα 2: Βιότοπος' : 'Group 2: Habitat', icon: '⚡' },
                  { id: 'group-3', label: isEl ? 'Ομάδα 3: Βιολογία' : 'Group 3: Biology', icon: '🚀' },
                  { id: 'group-4', label: isEl ? 'Ομάδα 4: Προστασία' : 'Group 4: Protection', icon: '🔬' },
                  { id: 'arena', label: isEl ? 'Αρένα & Πόστερ' : 'Arena & Posters', icon: '📊' }
                ].map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setSelectedDestination(item.id)}
                    className={`px-3 py-2 rounded-xl text-xs font-bold flex items-center gap-2 border transition-all text-left cursor-pointer ${
                      selectedDestination === item.id
                        ? 'bg-sky-500/20 text-sky-300 border-sky-400 ring-2 ring-sky-400/20'
                        : 'bg-slate-800/60 hover:bg-slate-800 text-slate-300 border-slate-700/60'
                    }`}
                  >
                    <span>{item.icon}</span>
                    <span className="truncate">{item.label}</span>
                  </button>
                ))}
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={customUrl}
                  onChange={(e) => setCustomUrl(e.target.value)}
                  placeholder={getBaseLiveUrl()}
                  className="flex-1 bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-white placeholder:text-slate-600 focus:outline-none focus:border-sky-500 font-mono"
                />
                <button
                  type="button"
                  onClick={() => setCustomUrl(getBaseLiveUrl())}
                  className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold transition-colors cursor-pointer"
                  title={isEl ? 'Επαναφορά στο Live URL' : 'Reset to Live URL'}
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                </button>
              </div>
            )}
          </div>

          {/* QR Code Presentation Display */}
          <div className="flex flex-col items-center justify-center p-6 sm:p-8 rounded-3xl bg-slate-950/80 border border-slate-800/80 shadow-inner space-y-4">
            <div className="relative p-4 rounded-3xl bg-white shadow-2xl ring-8 ring-white/10 group transition-transform">
              {qrDataUrl ? (
                <img
                  src={qrDataUrl}
                  alt="Platform Join QR Code"
                  className={`rounded-2xl transition-all ${
                    isFullscreen ? 'w-80 h-80 sm:w-96 sm:h-96' : 'w-56 h-56 sm:w-64 sm:h-64'
                  }`}
                />
              ) : (
                <div className="w-56 h-56 flex items-center justify-center text-slate-400">
                  <div className="w-8 h-8 border-3 border-sky-500 border-t-transparent rounded-full animate-spin" />
                </div>
              )}

              {/* Center Vulture Emblem Badge */}
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-slate-900 border-2 border-amber-400 flex items-center justify-center shadow-lg text-lg sm:text-xl select-none pointer-events-none">
                🦅
              </div>
            </div>

            {/* Scannable Target URL pill */}
            <div className="w-full max-w-lg bg-slate-900/90 border border-slate-800 rounded-2xl p-2.5 px-3 flex items-center justify-between gap-3 shadow-md">
              <div className="flex items-center gap-2 min-w-0">
                <Globe className="w-4 h-4 text-sky-400 shrink-0" />
                <span className="text-xs font-mono text-slate-300 truncate select-all">
                  {activeUrl}
                </span>
              </div>
              <button
                type="button"
                onClick={handleCopyUrl}
                className="px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-bold text-sky-300 hover:text-white flex items-center gap-1.5 shrink-0 transition-colors cursor-pointer active:scale-95"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? (isEl ? 'Αντιγράφηκε!' : 'Copied!') : (isEl ? 'Αντιγραφή' : 'Copy')}</span>
              </button>
            </div>

            {/* Quick scanning guidance for classroom */}
            <div className="flex items-center gap-2 text-xs text-slate-400 text-center max-w-md">
              <Smartphone className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>
                {isEl
                  ? 'Οι μαθητές στρέφουν την κάμερα του tablet/smartphone στο QR Code για άμεση συμμετοχή χωρίς εγκατάσταση εφαρμογής.'
                  : 'Students point their device camera at the QR code for instant zero-install browser participation.'}
              </span>
            </div>
          </div>

          {/* Action Tools: Download PNG, Print Card, Open URL */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-2">
            <button
              type="button"
              onClick={handleDownloadPng}
              className="px-4 py-2.5 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700/80 text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer shadow-sm hover:scale-102 active:scale-95"
            >
              <Download className="w-4 h-4 text-sky-400" />
              <span>{isEl ? 'Λήψη Εικόνας QR (PNG)' : 'Download QR Image'}</span>
            </button>

            <button
              type="button"
              onClick={handlePrint}
              className="px-4 py-2.5 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700/80 text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer shadow-sm hover:scale-102 active:scale-95"
            >
              <Printer className="w-4 h-4 text-emerald-400" />
              <span>{isEl ? 'Εκτύπωση Κάρτας Τάξης' : 'Print Classroom Card'}</span>
            </button>

            <a
              href={activeUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="px-4 py-2.5 rounded-2xl bg-sky-600 hover:bg-sky-500 text-white text-xs font-black flex items-center justify-center gap-2 transition-all cursor-pointer shadow-lg shadow-sky-600/30 hover:scale-102 active:scale-95"
            >
              <ExternalLink className="w-4 h-4" />
              <span>{isEl ? 'Άνοιγμα σε Νέα Καρτέλα' : 'Open in New Tab'}</span>
            </a>
          </div>
        </div>

        {/* Footer info */}
        <div className="pt-3 border-t border-slate-800 flex items-center justify-between text-[11px] text-slate-500">
          <span>{isEl ? 'Στο χείλος της εξαφάνισης - Οι γύπες στην Κύπρο' : 'On the verge of extinction - Vultures in Cyprus'}</span>
          <span>BoundPad QR Generator</span>
        </div>
      </div>
    </div>
  );
};
