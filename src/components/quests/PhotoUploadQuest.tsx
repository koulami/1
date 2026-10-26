import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Camera, Upload, CheckCircle2, RefreshCw, Video, Film, AlertCircle, FileCheck } from 'lucide-react';
import { Question, PhotoUploadPayload, Submission } from '../../types/game';
import { translations } from '../../locales/translations';
import { sound } from '../../services/sound';
import { processLocalFile } from '../../utils/fileUploadHelper';

interface Props {
  question: Question;
  existingSubmission?: Submission;
  lang: 'el' | 'en';
  onSubmit: (data: {
    photoUrl?: string;
    videoUrl?: string;
    mediaType?: 'photo' | 'video';
    mediaMetadata?: {
      name?: string;
      size?: number;
      type?: string;
      thumbnail?: string;
    };
    caption?: string;
    points: number;
  }) => void;
  readOnly?: boolean;
}

export const PhotoUploadQuest: React.FC<Props> = ({
  question,
  existingSubmission,
  lang,
  onSubmit,
  readOnly = false
}) => {
  const t = translations[lang];
  const payload = question.payload as PhotoUploadPayload;

  // Media type state: 'photo' or 'video'
  const [selectedMediaType, setSelectedMediaType] = useState<'photo' | 'video'>('photo');

  // Preview / Data
  const [photoDataUrl, setPhotoDataUrl] = useState<string | null>(() => {
    return existingSubmission?.photoUrl || existingSubmission?.answerData?.photoUrl || null;
  });
  const [videoPreviewUrl, setVideoPreviewUrl] = useState<string | null>(() => {
    return existingSubmission?.answerData?.videoUrl || null;
  });
  const [videoPoster, setVideoPoster] = useState<string | null>(() => {
    return existingSubmission?.answerData?.mediaMetadata?.thumbnail || null;
  });
  const [mediaMetadata, setMediaMetadata] = useState<{
    name?: string;
    size?: number;
    type?: string;
    thumbnail?: string;
  } | null>(() => {
    return existingSubmission?.answerData?.mediaMetadata || null;
  });

  const [caption, setCaption] = useState<string>(() => {
    return existingSubmission?.answerData?.caption || '';
  });
  const [isCameraActive, setIsCameraActive] = useState<boolean>(false);
  const [hasSubmitted, setHasSubmitted] = useState<boolean>(Boolean(existingSubmission));
  const [uploadError, setUploadError] = useState<string | null>(null);

  // References for cleanup to guarantee ZERO memory leaks
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const currentObjectUrlRef = useRef<string | null>(null);

  // Safe object URL revocation
  const safeRevokeObjectUrl = useCallback(() => {
    if (currentObjectUrlRef.current) {
      try {
        URL.revokeObjectURL(currentObjectUrlRef.current);
      } catch (err) {
        // ignore
      }
      currentObjectUrlRef.current = null;
    }
  }, []);

  // Safe camera stream stoppage
  const stopCamera = useCallback(() => {
    if (videoRef.current && videoRef.current.srcObject) {
      try {
        const stream = videoRef.current.srcObject as MediaStream;
        stream.getTracks().forEach((track) => track.stop());
      } catch (err) {
        // ignore
      }
      videoRef.current.srcObject = null;
    }
    setIsCameraActive(false);
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopCamera();
      safeRevokeObjectUrl();
    };
  }, [stopCamera, safeRevokeObjectUrl]);

  // Start live webcam for photo snapshot
  const startCamera = async () => {
    setUploadError(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'user', width: { ideal: 1280 }, height: { ideal: 720 } }
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.setAttribute('playsinline', 'true');
        await videoRef.current.play();
        setIsCameraActive(true);
      }
    } catch {
      setUploadError(
        lang === 'el'
          ? 'Δεν ήταν δυνατή η πρόσβαση στην κάμερα. Επιλέξτε αποστολή αρχείου.'
          : 'Could not access camera. Please upload a file instead.'
      );
      setIsCameraActive(false);
    }
  };

  // Capture still from live webcam stream with canvas compression
  const captureCameraPhoto = () => {
    if (!videoRef.current) return;
    try {
      const video = videoRef.current;
      const canvas = document.createElement('canvas');
      const maxDim = 800;
      let w = video.videoWidth || 640;
      let h = video.videoHeight || 480;
      if (w > maxDim || h > maxDim) {
        const ratio = Math.min(maxDim / w, maxDim / h);
        w = Math.round(w * ratio);
        h = Math.round(h * ratio);
      }
      canvas.width = w;
      canvas.height = h;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(video, 0, 0, w, h);
        const dataUrl = canvas.toDataURL('image/jpeg', 0.8);
        safeRevokeObjectUrl();
        setVideoPreviewUrl(null);
        setPhotoDataUrl(dataUrl);
        setSelectedMediaType('photo');
        setMediaMetadata({
          name: `camera-snapshot-${Date.now()}.jpg`,
          size: Math.round(dataUrl.length * 0.75),
          type: 'image/jpeg'
        });
        sound.playSnap();
      }
    } catch (err) {
      console.error('Camera capture error', err);
    } finally {
      stopCamera();
    }
  };

  // Compress uploaded photo to fit safely in local state
  const processImageFile = (file: File) => {
    const reader = new FileReader();
    reader.onload = (event) => {
      const rawData = event.target?.result as string;
      if (!rawData) return;

      const img = new Image();
      img.onload = () => {
        try {
          const canvas = document.createElement('canvas');
          const maxDim = 800;
          let w = img.width;
          let h = img.height;
          if (w > maxDim || h > maxDim) {
            const ratio = Math.min(maxDim / w, maxDim / h);
            w = Math.round(w * ratio);
            h = Math.round(h * ratio);
          }
          canvas.width = w;
          canvas.height = h;
          const ctx = canvas.getContext('2d');
          if (ctx) {
            ctx.drawImage(img, 0, 0, w, h);
            const compressed = canvas.toDataURL('image/jpeg', 0.8);
            safeRevokeObjectUrl();
            setVideoPreviewUrl(null);
            setPhotoDataUrl(compressed);
            setSelectedMediaType('photo');
            setMediaMetadata({
              name: file.name,
              size: file.size,
              type: file.type
            });
          } else {
            setPhotoDataUrl(rawData);
          }
        } catch {
          setPhotoDataUrl(rawData);
        }
        sound.playSnap();
      };
      img.onerror = () => {
        setPhotoDataUrl(rawData);
        sound.playSnap();
      };
      img.src = rawData;
    };
    reader.readAsDataURL(file);
  };

  // Process uploaded video safely without blowing localStorage limits
  const processVideoFile = (file: File) => {
    safeRevokeObjectUrl();
    const objectUrl = URL.createObjectURL(file);
    currentObjectUrlRef.current = objectUrl;

    setPhotoDataUrl(null);
    setVideoPreviewUrl(objectUrl);
    setSelectedMediaType('video');

    // Extract quick video thumbnail via hidden video + canvas
    const tempVideo = document.createElement('video');
    tempVideo.src = objectUrl;
    tempVideo.muted = true;
    tempVideo.playsInline = true;
    tempVideo.currentTime = 0.5;

    tempVideo.onloadeddata = () => {
      try {
        const canvas = document.createElement('canvas');
        canvas.width = Math.min(480, tempVideo.videoWidth || 480);
        canvas.height = Math.min(270, tempVideo.videoHeight || 270);
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(tempVideo, 0, 0, canvas.width, canvas.height);
          const thumb = canvas.toDataURL('image/jpeg', 0.75);
          setVideoPoster(thumb);
          setMediaMetadata({
            name: file.name,
            size: file.size,
            type: file.type,
            thumbnail: thumb
          });
        }
      } catch {
        setMediaMetadata({
          name: file.name,
          size: file.size,
          type: file.type
        });
      }
    };

    sound.playSnap();
  };

  // Generic File Upload Handler with Native File Processing
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadError(null);

    try {
      const processed = await processLocalFile(file, 900, 0.82);
      safeRevokeObjectUrl();
      if (processed.type === 'video') {
        currentObjectUrlRef.current = processed.url;
        setPhotoDataUrl(null);
        setVideoPreviewUrl(processed.url);
        setVideoPoster(processed.thumbnail || null);
        setSelectedMediaType('video');
      } else {
        setVideoPreviewUrl(null);
        setPhotoDataUrl(processed.url);
        setSelectedMediaType('photo');
      }
      setMediaMetadata({
        name: processed.name,
        size: processed.size,
        type: file.type,
        thumbnail: processed.thumbnail
      });
      sound.playSnap();
    } catch (err: any) {
      setUploadError(
        err?.message || (lang === 'el' ? 'Σφάλμα ανάγνωσης αρχείου.' : 'Error reading file.')
      );
    }

    e.target.value = '';
  };

  const handleRetake = () => {
    if (readOnly || hasSubmitted) return;
    safeRevokeObjectUrl();
    setPhotoDataUrl(null);
    setVideoPreviewUrl(null);
    setVideoPoster(null);
    setMediaMetadata(null);
    setUploadError(null);
  };

  const handleSubmit = () => {
    if (readOnly || hasSubmitted) return;
    if (!photoDataUrl && !videoPreviewUrl) return;

    sound.playSuccess();
    setHasSubmitted(true);

    onSubmit({
      photoUrl: photoDataUrl || undefined,
      videoUrl: videoPreviewUrl || undefined,
      mediaType: selectedMediaType,
      mediaMetadata: mediaMetadata || undefined,
      caption: caption.trim(),
      points: question.points
    });
  };

  const hasMedia = Boolean(photoDataUrl || videoPreviewUrl);

  return (
    <div className="space-y-4">
      {/* Instructions */}
      <p className="text-sm text-slate-300 leading-relaxed font-normal">
        {(lang === 'en' && (question.payload_en as any)?.instructions)
          ? (question.payload_en as any).instructions
          : (payload.instructions || (lang === 'en' ? (question.description_en || question.description) : (question.description || t.photoUploadInstructions)))}
      </p>

      {/* Teacher Sample Reference Media if present */}
      {payload.sampleReferenceUrl && (
        <div className="p-3 rounded-2xl bg-slate-900 border border-slate-800 space-y-2">
          <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-400">
            <span>🔍</span>
            <span>{lang === 'el' ? 'Υπόδειγμα Τεκμηρίου (Τι πρέπει να καταγράψετε):' : 'Sample Evidence Reference:'}</span>
          </div>
          <div className="rounded-xl overflow-hidden border border-slate-800 bg-black max-h-60 flex items-center justify-center">
            <img
              src={payload.sampleReferenceUrl}
              alt="Reference sample"
              className="w-full h-auto max-h-60 object-contain rounded-xl"
              onError={(e) => {
                (e.target as HTMLElement).style.display = 'none';
              }}
            />
          </div>
        </div>
      )}

      {/* Error alert */}
      {uploadError && (
        <div className="p-3 rounded-xl bg-rose-950/40 border border-rose-800 text-rose-300 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
          <span>{uploadError}</span>
        </div>
      )}

      {/* Live Camera View for snapshot */}
      {isCameraActive && (
        <div className="relative rounded-2xl overflow-hidden border-2 border-cyan-500 bg-black aspect-video flex items-center justify-center shadow-xl">
          <video ref={videoRef} className="w-full h-full object-cover" />
          <div className="absolute bottom-3 left-0 right-0 flex items-center justify-center gap-3">
            <button
              type="button"
              onClick={captureCameraPhoto}
              className="px-5 py-2 rounded-xl bg-cyan-500 text-slate-950 text-xs font-bold hover:bg-cyan-400 transition-colors flex items-center gap-2 shadow-lg cursor-pointer"
            >
              <Camera className="w-4 h-4" />
              <span>{lang === 'el' ? 'Λήψη Στιγμιότυπου' : 'Take Snapshot'}</span>
            </button>
            <button
              type="button"
              onClick={stopCamera}
              className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs font-semibold hover:bg-slate-700 transition-colors cursor-pointer"
            >
              {t.cancel}
            </button>
          </div>
        </div>
      )}

      {/* Photo Preview */}
      {photoDataUrl && !isCameraActive && (
        <div className="space-y-3">
          <div className="relative rounded-2xl overflow-hidden border border-slate-700 bg-slate-950 flex items-center justify-center max-h-80 shadow-lg">
            <img
              src={photoDataUrl}
              alt="Team upload proof"
              className="w-full h-auto max-h-80 object-contain rounded-xl"
              referrerPolicy="no-referrer"
            />
            {!hasSubmitted && !readOnly && (
              <button
                type="button"
                onClick={handleRetake}
                className="absolute top-3 right-3 p-2 rounded-xl bg-slate-900/80 hover:bg-slate-800 text-slate-200 border border-slate-700 backdrop-blur-sm transition-colors text-xs flex items-center gap-1.5 cursor-pointer"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>{lang === 'el' ? 'Αλλαγή' : 'Retake'}</span>
              </button>
            )}
          </div>

          {/* Media Info Badge */}
          {mediaMetadata && (
            <div className="flex items-center justify-between text-[11px] text-slate-400 px-1 font-mono">
              <span>📷 {mediaMetadata.name || 'photo-proof.jpg'}</span>
              <span>{mediaMetadata.size ? `${Math.round(mediaMetadata.size / 1024)} KB` : ''}</span>
            </div>
          )}
        </div>
      )}

      {/* Video Preview */}
      {videoPreviewUrl && !isCameraActive && (
        <div className="space-y-3">
          <div className="relative rounded-2xl overflow-hidden border border-slate-700 bg-black max-h-80 shadow-lg flex items-center justify-center">
            <video
              src={videoPreviewUrl}
              poster={videoPoster || undefined}
              controls
              playsInline
              className="w-full max-h-80 object-contain rounded-xl"
            />
            {!hasSubmitted && !readOnly && (
              <button
                type="button"
                onClick={handleRetake}
                className="absolute top-3 right-3 p-2 rounded-xl bg-slate-900/80 hover:bg-slate-800 text-slate-200 border border-slate-700 backdrop-blur-sm transition-colors text-xs flex items-center gap-1.5 cursor-pointer z-10"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>{lang === 'el' ? 'Αλλαγή Βίντεο' : 'Replace Video'}</span>
              </button>
            )}
          </div>

          {mediaMetadata && (
            <div className="flex items-center justify-between text-[11px] text-slate-400 px-1 font-mono">
              <span>🎥 {mediaMetadata.name || 'video-proof.mp4'}</span>
              <span>{mediaMetadata.size ? `${(mediaMetadata.size / (1024 * 1024)).toFixed(1)} MB` : ''}</span>
            </div>
          )}
        </div>
      )}

      {/* Caption Input */}
      {hasMedia && !hasSubmitted && !readOnly && (
        <div>
          <label className="block text-xs font-medium text-slate-400 mb-1.5">
            {lang === 'el' ? 'Σχόλιο / Λεζάντα Τεκμηρίου Ομάδας:' : 'Team Proof Caption:'}
          </label>
          <input
            type="text"
            value={caption}
            onChange={(e) => setCaption(e.target.value)}
            placeholder={
              lang === 'el'
                ? 'π.χ. Φωτογραφία ομοιώματος με το άνοιγμα πτερύγων 2.5m (#36)'
                : 'e.g. Photo proof of replica wingspan 2.5m (#36)'
            }
            className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-xs text-slate-200 placeholder:text-slate-600 focus:outline-none focus:border-amber-500 font-sans"
          />
        </div>
      )}

      {/* Camera / Upload selection buttons when no media is uploaded */}
      {!hasMedia && !isCameraActive && !hasSubmitted && !readOnly && (
        <div className="space-y-3 pt-1">
          <div className={`grid gap-3 ${payload.acceptedTypes === 'video' ? 'grid-cols-1' : 'grid-cols-2'}`}>
            {payload.acceptedTypes !== 'video' && (
              <button
                type="button"
                onClick={startCamera}
                className="py-4 px-4 rounded-2xl border border-slate-700 bg-slate-800/80 hover:bg-slate-800 text-slate-200 font-semibold text-xs flex flex-col items-center justify-center gap-2 transition-all hover:border-cyan-500/50 cursor-pointer shadow-md active:scale-95"
              >
                <Camera className="w-5 h-5 text-cyan-400" />
                <span>{lang === 'el' ? 'Άνοιγμα Κάμερας' : 'Open Camera'}</span>
              </button>
            )}

            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="py-4 px-4 rounded-2xl border border-slate-700 bg-slate-800/80 hover:bg-slate-800 text-slate-200 font-semibold text-xs flex flex-col items-center justify-center gap-2 transition-all hover:border-amber-500/50 cursor-pointer shadow-md active:scale-95"
            >
              <div className="flex items-center gap-1 text-amber-400">
                <Upload className="w-4 h-4" />
                {payload.acceptedTypes !== 'photo' && <Film className="w-4 h-4 text-purple-400" />}
              </div>
              <span>
                {payload.acceptedTypes === 'photo'
                  ? (lang === 'el' ? 'Ανέβασμα Εικόνας' : 'Upload Photo')
                  : payload.acceptedTypes === 'video'
                  ? (lang === 'el' ? 'Ανέβασμα Βίντεο' : 'Upload Video')
                  : (lang === 'el' ? 'Ανέβασμα Εικόνας / Βίντεο' : 'Upload Image / Video')}
              </span>
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept={payload.acceptedTypes === 'video' ? 'video/*' : payload.acceptedTypes === 'photo' ? 'image/*' : 'image/*,video/*'}
              className="hidden"
              onChange={handleFileUpload}
            />
          </div>

          <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 text-[11px] text-slate-400 flex items-center justify-between gap-2 flex-wrap">
            <div className="flex items-center gap-2">
              <FileCheck className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>
                {payload.acceptedTypes === 'photo'
                  ? (lang === 'el' ? 'Απαιτείται φωτογραφία (.jpg, .png)' : 'Photo required (.jpg, .png)')
                  : payload.acceptedTypes === 'video'
                  ? (lang === 'el' ? 'Απαιτείται βίντεο (.mp4, .mov)' : 'Video required (.mp4, .mov)')
                  : (lang === 'el' ? 'Υποστηρίζονται φωτογραφίες (.jpg, .png) και βίντεο (.mp4, .mov)' : 'Supports photos (.jpg, .png) and videos (.mp4, .mov)')}
              </span>
            </div>
            {payload.maxFileSizeMb && (
              <span className="px-2 py-0.5 rounded bg-slate-800 text-[10px] text-slate-300 font-mono font-semibold shrink-0">
                Max: {payload.maxFileSizeMb}MB
              </span>
            )}
          </div>
        </div>
      )}

      {/* Submit Button */}
      {hasMedia && !hasSubmitted && !readOnly && (
        <button
          type="button"
          onClick={handleSubmit}
          className="w-full py-3.5 px-4 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-sm shadow-lg shadow-amber-500/20 transition-all cursor-pointer active:scale-95 flex items-center justify-center gap-2"
        >
          <CheckCircle2 className="w-4 h-4" />
          <span>
            {lang === 'el' ? 'Επικύρωση Τεκμηρίου & Υποβολή' : 'Submit Evidence'} (+{question.points} {t.pts})
          </span>
        </button>
      )}

      {/* Submitted Status */}
      {hasSubmitted && (
        <div className="p-4 rounded-xl bg-emerald-950/40 border border-emerald-800 text-emerald-300 text-xs leading-relaxed space-y-1 shadow-md">
          <div className="font-semibold flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>
              {lang === 'el'
                ? `Τεκμήριο Ολοκληρώθηκε Επιτυχώς! (+${question.points} πόντοι)`
                : `${t.photoUploadedSuccess} (+${question.points} ${t.pts})`}
            </span>
          </div>
          {caption && <p className="text-slate-300 italic pt-1">"{caption}"</p>}
        </div>
      )}
    </div>
  );
};
