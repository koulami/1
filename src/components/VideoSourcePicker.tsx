import React, { useState, useRef, useEffect } from 'react';
import {
  Upload,
  Globe,
  Film,
  X,
  Check,
  AlertCircle,
  Sparkles,
  FileVideo,
  Play,
  CheckCircle2,
  ExternalLink,
  Info
} from 'lucide-react';
import { Language } from '../types/game';
import { getEmbedVideoUrl } from './UnlockedMediaViewer';

interface Props {
  value?: string;
  onChange: (videoUrl: string) => void;
  onClear?: () => void;
  lang: Language;
  label?: string;
}

export const VideoSourcePicker: React.FC<Props> = ({
  value,
  onChange,
  onClear,
  lang,
  label
}) => {
  const [sourceTab, setSourceTab] = useState<'upload' | 'url' | 'presets'>('upload');
  const [urlInput, setUrlInput] = useState<string>('');
  const [urlError, setUrlError] = useState<string | null>(null);
  const [isProcessingFile, setIsProcessingFile] = useState<boolean>(false);
  const [fileError, setFileError] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);
  const [fileSize, setFileSize] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState<boolean>(false);

  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const uniqueId = useRef(`video-file-input-${Math.random().toString(36).substring(2, 9)}`).current;

  // Educational & Nature Sample Video Presets
  const samplePresets = [
    {
      id: 'vulture-flight',
      name: lang === 'el' ? '🦅 Πτήση Γύπα στη Φύση (Wild Vulture Flight)' : '🦅 Vulture Soaring in Nature',
      desc: lang === 'el' ? 'Πλάνα πτήσης Γύπα Πυρόχρους' : 'Griffon Vulture aerial soaring clip',
      url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4'
    },
    {
      id: 'nature-cyprus',
      name: lang === 'el' ? '🌿 Φυσικό Τοπίο & Άγρια Ζωή' : '🌿 Wildlife & Natural Habitat',
      desc: lang === 'el' ? 'Εκπαιδευτικό βίντεο οικοσυστήματος' : 'Ecosystem educational nature clip',
      url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4'
    },
    {
      id: 'aerial-exploration',
      name: lang === 'el' ? '🗺️ Εξερεύνηση & Περιπέτεια' : '🗺️ Exploration & Adventure',
      desc: lang === 'el' ? 'Εναέρια περιήγηση τοπίου' : 'Aerial exploration landscape clip',
      url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4'
    }
  ];

  // Sync urlInput with external value if it looks like an internet URL
  useEffect(() => {
    if (value && !value.startsWith('data:')) {
      setUrlInput(value);
    }
  }, [value]);

  // Determine what kind of video is currently selected
  const isDataUrl = Boolean(value && value.startsWith('data:video/'));
  const isBlobUrl = Boolean(value && value.startsWith('blob:'));
  const videoInfo = value ? getEmbedVideoUrl(value) : null;

  const detectUrlProvider = (url: string): { label: string; color: string } | null => {
    if (!url.trim()) return null;
    const lower = url.toLowerCase();
    if (lower.includes('youtube.com') || lower.includes('youtu.be')) {
      return { label: 'YouTube', color: 'bg-red-500/20 text-red-300 border-red-500/40' };
    }
    if (lower.includes('vimeo.com')) {
      return { label: 'Vimeo', color: 'bg-sky-500/20 text-sky-300 border-sky-500/40' };
    }
    if (lower.includes('drive.google.com')) {
      return { label: 'Google Drive', color: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40' };
    }
    if (lower.includes('dropbox.com')) {
      return { label: 'Dropbox', color: 'bg-blue-500/20 text-blue-300 border-blue-500/40' };
    }
    if (lower.match(/\.(mp4|webm|ogg|mov)(\?.*)?$/i)) {
      return { label: 'Direct Video (MP4)', color: 'bg-purple-500/20 text-purple-300 border-purple-500/40' };
    }
    return { label: 'Web Link', color: 'bg-amber-500/20 text-amber-300 border-amber-500/40' };
  };

  const detectedProvider = detectUrlProvider(urlInput);

  const processFile = (file: File) => {
    setFileError(null);

    // Validate video file
    const isVideo = file.type.startsWith('video/') ||
      /\.(mp4|webm|ogg|mov|m4v|mkv)$/i.test(file.name);

    if (!isVideo) {
      setFileError(
        lang === 'el'
          ? 'Παρακαλώ επιλέξτε ένα αρχείο βίντεο (MP4, WebM, MOV, OGG κτλ).'
          : 'Please select a valid video file (MP4, WebM, MOV, OGG etc).'
      );
      return;
    }

    // Format human-readable size
    const sizeMb = (file.size / (1024 * 1024)).toFixed(1);
    setFileName(file.name);
    setFileSize(`${sizeMb} MB`);

    setIsProcessingFile(true);

    const reader = new FileReader();

    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      if (dataUrl) {
        onChange(dataUrl);
      }
      setIsProcessingFile(false);
    };

    reader.onerror = () => {
      setIsProcessingFile(false);
      setFileError(
        lang === 'el'
          ? 'Σφάλμα ανάγνωσης του αρχείου βίντεο. Δοκιμάστε ξανά ή ελέγξτε το μέγεθος.'
          : 'Error reading video file. Please try again.'
      );
    };

    reader.readAsDataURL(file);
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      processFile(file);
    }
    e.target.value = '';
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      processFile(file);
    }
  };

  const handleApplyUrl = () => {
    setUrlError(null);
    const trimmed = urlInput.trim();
    if (!trimmed) {
      setUrlError(
        lang === 'el'
          ? 'Παρακαλώ εισάγετε έναν έγκυρο σύνδεσμο βίντεο.'
          : 'Please enter a valid video URL.'
      );
      return;
    }

    if (!trimmed.startsWith('http://') && !trimmed.startsWith('https://')) {
      setUrlError(
        lang === 'el'
          ? 'Ο σύνδεσμος πρέπει να ξεκινάει με https:// ή http://'
          : 'URL must start with https:// or http://'
      );
      return;
    }

    onChange(trimmed);
  };

  const handleClear = () => {
    setUrlInput('');
    setFileName(null);
    setFileSize(null);
    setFileError(null);
    setUrlError(null);
    if (onClear) {
      onClear();
    } else {
      onChange('');
    }
  };

  return (
    <div className="space-y-3">
      {/* Label & Active Status */}
      <div className="flex items-center justify-between">
        <label className="block text-xs font-semibold text-slate-300">
          {label || (lang === 'el' ? 'Βίντεο που θα προβληθεί στο Σκανάρισμα' : 'Video to Display upon Scan')}
        </label>
        {value && (
          <span className="text-[11px] font-medium text-emerald-400 flex items-center gap-1 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/30">
            <CheckCircle2 className="w-3 h-3" />
            {isDataUrl || isBlobUrl
              ? (lang === 'el' ? 'Αρχείο από τη συσκευή σας' : 'Device video file')
              : (lang === 'el' ? 'Σύνδεσμος Internet' : 'Internet video link')}
          </span>
        )}
      </div>

      {/* TABS: Upload from File vs Web Link vs Presets */}
      <div className="flex rounded-xl bg-slate-900/90 p-1 border border-slate-800">
        <button
          type="button"
          onClick={() => setSourceTab('upload')}
          className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
            sourceTab === 'upload'
              ? 'bg-amber-500 text-slate-950 shadow-sm'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Upload className="w-3.5 h-3.5" />
          <span>{lang === 'el' ? '📁 Αρχείο από Συσκευή' : '📁 Upload Video File'}</span>
        </button>

        <button
          type="button"
          onClick={() => setSourceTab('url')}
          className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
            sourceTab === 'url'
              ? 'bg-amber-500 text-slate-950 shadow-sm'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Globe className="w-3.5 h-3.5" />
          <span>{lang === 'el' ? '🌐 Σύνδεσμος Internet' : '🌐 Web Video Link'}</span>
        </button>

        <button
          type="button"
          onClick={() => setSourceTab('presets')}
          className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
            sourceTab === 'presets'
              ? 'bg-amber-500 text-slate-950 shadow-sm'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>{lang === 'el' ? '✨ Δείγματα' : '✨ Sample Clips'}</span>
        </button>
      </div>

      {/* TAB 1: UPLOAD FROM DEVICE */}
      {sourceTab === 'upload' && (
        <div className="space-y-2.5">
          <input
            id={uniqueId}
            ref={fileInputRef}
            type="file"
            accept="video/mp4,video/webm,video/ogg,video/quicktime,video/x-m4v,video/*"
            onChange={handleFileInputChange}
            className="hidden"
          />

          <div
            onDragOver={(e) => {
              e.preventDefault();
              setIsDragging(true);
            }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`border-2 border-dashed rounded-xl p-5 text-center cursor-pointer transition-all flex flex-col items-center justify-center gap-2 ${
              isDragging
                ? 'border-amber-400 bg-amber-500/10 scale-[1.01]'
                : 'border-slate-700 bg-slate-900/50 hover:bg-slate-900 hover:border-slate-600'
            }`}
          >
            <div className="w-12 h-12 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400 shadow-inner">
              {isProcessingFile ? (
                <div className="w-6 h-6 border-2 border-amber-400 border-t-transparent rounded-full animate-spin" />
              ) : (
                <FileVideo className="w-6 h-6" />
              )}
            </div>

            <div>
              <p className="text-xs font-bold text-slate-200">
                {isProcessingFile
                  ? (lang === 'el' ? 'Φόρτωση και επεξεργασία αρχείου βίντεο...' : 'Processing video file...')
                  : (lang === 'el' ? 'Πατήστε για επιλογή αρχείου βίντεο από τον υπολογιστή / συσκευή σας' : 'Click to select video from your device')}
              </p>
              <p className="text-[11px] text-slate-400 mt-0.5">
                {lang === 'el'
                  ? 'ή σύρετε και αφήστε το αρχείο εδώ (MP4, WebM, MOV)'
                  : 'or drag and drop your video file here (MP4, WebM, MOV)'}
              </p>
            </div>

            <div className="flex items-center gap-2 mt-1">
              <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-slate-800 text-slate-300 border border-slate-700">
                MP4 / WebM / MOV
              </span>
              <span className="px-2 py-0.5 rounded text-[10px] bg-amber-500/15 text-amber-300 border border-amber-500/30">
                {lang === 'el' ? 'Άμεση αναπαραγωγή' : 'Instant playback'}
              </span>
            </div>
          </div>

          {fileError && (
            <div className="p-2.5 rounded-lg bg-rose-950/40 border border-rose-800/60 flex items-center gap-2 text-rose-300 text-xs">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{fileError}</span>
            </div>
          )}

          {fileName && (
            <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800 flex items-center justify-between text-xs">
              <div className="flex items-center gap-2 truncate">
                <FileVideo className="w-4 h-4 text-amber-400 shrink-0" />
                <span className="font-medium text-slate-200 truncate">{fileName}</span>
                {fileSize && (
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-800 text-slate-400 shrink-0">
                    {fileSize}
                  </span>
                )}
              </div>
              <span className="text-[11px] text-emerald-400 font-semibold shrink-0">
                {lang === 'el' ? '✓ Έτοιμο' : '✓ Loaded'}
              </span>
            </div>
          )}

          <div className="flex items-start gap-1.5 p-2 rounded-lg bg-slate-950 border border-slate-800 text-[11px] text-slate-400">
            <Info className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
            <span>
              {lang === 'el'
                ? 'Συμβουλή: Για ταχύτερη φόρτωση στα κινητά των μαθητών σε εξωτερικό χώρο, προτιμήστε αρχεία MP4 έως 30-45MB ή σύνδεσμο YouTube / Google Drive.'
                : 'Tip: For faster streaming on student mobile devices outdoors, prefer MP4 files under 30-45MB or YouTube / Google Drive links.'}
            </span>
          </div>
        </div>
      )}

      {/* TAB 2: INTERNET VIDEO LINK */}
      {sourceTab === 'url' && (
        <div className="space-y-2.5">
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-[11px] font-medium text-slate-300">
                {lang === 'el'
                  ? 'Σύνδεσμος Βίντεο από το Internet (YouTube, Vimeo, Google Drive, MP4):'
                  : 'Internet Video URL (YouTube, Vimeo, Google Drive, MP4):'}
              </label>
              {detectedProvider && (
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${detectedProvider.color}`}>
                  {detectedProvider.label}
                </span>
              )}
            </div>

            <div className="flex gap-2">
              <input
                type="url"
                value={urlInput}
                onChange={(e) => {
                  setUrlInput(e.target.value);
                  setUrlError(null);
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleApplyUrl();
                  }
                }}
                placeholder="https://www.youtube.com/watch?v=... ή https://drive.google.com/..."
                className="flex-1 p-2.5 rounded-xl bg-slate-900 border border-slate-700 text-xs text-slate-200 focus:outline-none focus:border-amber-500 font-mono tracking-tight"
              />

              <button
                type="button"
                onClick={handleApplyUrl}
                className="px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer shadow-md active:scale-95 shrink-0"
              >
                <Check className="w-3.5 h-3.5" />
                <span>{lang === 'el' ? 'Εφαρμογή' : 'Apply'}</span>
              </button>
            </div>
          </div>

          {urlError && (
            <div className="p-2.5 rounded-lg bg-rose-950/40 border border-rose-800/60 flex items-center gap-2 text-rose-300 text-xs">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{urlError}</span>
            </div>
          )}

          {/* Quick Examples / Supported Providers Info */}
          <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 text-[11px] text-slate-400 space-y-1.5">
            <p className="font-semibold text-slate-300">
              {lang === 'el' ? 'Υποστηριζόμενοι τύποι συνδέσμων:' : 'Supported link types:'}
            </p>
            <ul className="list-disc list-inside space-y-0.5 text-slate-400">
              <li><strong className="text-slate-300">YouTube:</strong> κανονικά βίντεο, σύντομοι σύνδεσμοι youtu.be και YouTube Shorts</li>
              <li><strong className="text-slate-300">Google Drive:</strong> σύνδεσμοι κοινοποίησης (view/preview)</li>
              <li><strong className="text-slate-300">Vimeo & Dropbox:</strong> σύνδεσμοι προβολής ή απευθείας ροής</li>
              <li><strong className="text-slate-300">Απευθείας αρχείο (.mp4 / .webm):</strong> οποιοδήποτε URL βίντεο στο διαδίκτυο</li>
            </ul>
          </div>
        </div>
      )}

      {/* TAB 3: SAMPLE PRESETS */}
      {sourceTab === 'presets' && (
        <div className="space-y-2">
          <p className="text-[11px] text-slate-400">
            {lang === 'el'
              ? 'Επιλέξτε ένα από τα έτοιμα εκπαιδευτικά δείγματα βίντεο για γρήγορη δοκιμή της δραστηριότητας:'
              : 'Select a sample educational video clip to quickly test the QR activity:'}
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            {samplePresets.map((preset) => {
              const isSelected = value === preset.url;
              return (
                <button
                  key={preset.id}
                  type="button"
                  onClick={() => onChange(preset.url)}
                  className={`p-3 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between gap-2 ${
                    isSelected
                      ? 'bg-amber-500/20 border-amber-500 text-amber-200 shadow-md ring-1 ring-amber-500'
                      : 'bg-slate-900 border-slate-800 hover:border-slate-700 text-slate-300 hover:bg-slate-800/80'
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between gap-1">
                      <span className="text-xs font-bold leading-snug">{preset.name}</span>
                      {isSelected && <CheckCircle2 className="w-3.5 h-3.5 text-amber-400 shrink-0" />}
                    </div>
                    <p className="text-[10px] text-slate-400 mt-1">{preset.desc}</p>
                  </div>
                  <span className="text-[10px] font-medium text-amber-400 flex items-center gap-1">
                    <Play className="w-3 h-3" />
                    {isSelected ? (lang === 'el' ? 'Επιλεγμένο' : 'Selected') : (lang === 'el' ? 'Επιλογή' : 'Select')}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* LIVE PREVIEW PLAYER OF CURRENTLY SELECTED VIDEO */}
      {value && (
        <div className="mt-3 p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-2.5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Film className="w-4 h-4 text-amber-400" />
              <span className="text-xs font-bold text-slate-200">
                {lang === 'el' ? 'Προεπισκόπηση Επιλεγμένου Βίντεο:' : 'Selected Video Preview:'}
              </span>
            </div>

            <button
              type="button"
              onClick={handleClear}
              className="px-2.5 py-1 rounded-lg bg-rose-950/40 hover:bg-rose-900/60 border border-rose-800 text-rose-300 text-xs font-medium flex items-center gap-1 transition-colors cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
              <span>{lang === 'el' ? 'Αφαίρεση Βίντεο' : 'Remove Video'}</span>
            </button>
          </div>

          <div className="rounded-xl overflow-hidden border border-slate-700 bg-black flex items-center justify-center">
            {videoInfo ? (
              videoInfo.type === 'direct' ? (
                <video
                  src={videoInfo.embedUrl}
                  controls
                  playsInline
                  className="w-full max-h-56 object-contain bg-black"
                >
                  {lang === 'el'
                    ? 'Το πρόγραμμα περιήγησής σας δεν υποστηρίζει αναπαραγωγή βίντεο.'
                    : 'Your browser does not support HTML5 video.'}
                </video>
              ) : (
                <div className="w-full aspect-video max-h-64">
                  <iframe
                    src={videoInfo.embedUrl}
                    title="Video Preview"
                    className="w-full h-full"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                    allowFullScreen
                  />
                </div>
              )
            ) : (
              <video
                src={value}
                controls
                playsInline
                className="w-full max-h-56 object-contain bg-black"
              />
            )}
          </div>

          <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1">
            <span className="truncate max-w-[80%] font-mono text-[10px] text-slate-500">
              {value.startsWith('data:')
                ? (lang === 'el' ? 'Ενσωματωμένο αρχείο βίντεο (Data URL)' : 'Embedded video file (Data URL)')
                : value}
            </span>
            <span className="text-emerald-400 font-semibold shrink-0">
              {lang === 'el' ? '✓ Έγκυρο Βίντεο' : '✓ Video Ready'}
            </span>
          </div>
        </div>
      )}
    </div>
  );
};
