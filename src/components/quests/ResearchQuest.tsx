import React, { useState, useRef, useEffect } from 'react';
import {
  Search,
  BookOpen,
  ExternalLink,
  CheckCircle2,
  FileText,
  Camera,
  Upload,
  RefreshCw,
  Award,
  AlertCircle,
  Sparkles,
  Link2,
  Plus,
  Trash2,
  HelpCircle
} from 'lucide-react';
import { Question, ResearchPayload, Submission } from '../../types/game';
import { translations } from '../../locales/translations';
import { sound } from '../../services/sound';
import { getEmbedVideoUrl } from '../UnlockedMediaViewer';

interface Props {
  question: Question;
  existingSubmission?: Submission;
  lang: 'el' | 'en';
  onSubmit: (data: {
    points: number;
    findingsText: string;
    sourcesConsulted: string[];
    answeredQuestions: boolean[];
    photoUrl?: string;
  }) => void;
  readOnly?: boolean;
}

export const ResearchQuest: React.FC<Props> = ({
  question,
  existingSubmission,
  lang,
  onSubmit,
  readOnly = false
}) => {
  const t = translations[lang];
  const payload = (question.payload || {}) as ResearchPayload;

  const guidingQuestions = payload.guidingQuestions || [];
  const suggestedSources = payload.suggestedSources || [];
  const minWords = payload.minWords || 10;
  const requiresSourceLinks = payload.requiresSourceLinks ?? false;
  const allowsPhoto = payload.requiresEvidencePhoto ?? true;

  // Initial answers/state from existing submission if available
  const existingAnswerData = existingSubmission?.answerData || {};

  const initialAnswered = guidingQuestions.map((_, idx) => {
    if (existingAnswerData.answeredQuestions) {
      return !!existingAnswerData.answeredQuestions[idx];
    }
    return false;
  });
  const [answeredState, setAnsweredState] = useState<boolean[]>(initialAnswered);

  const [findingsText, setFindingsText] = useState<string>(
    existingAnswerData.findingsText || existingAnswerData.reportText || existingAnswerData.caption || ''
  );

  const [sourcesList, setSourcesList] = useState<string[]>(() => {
    if (Array.isArray(existingAnswerData.sourcesConsulted) && existingAnswerData.sourcesConsulted.length > 0) {
      return existingAnswerData.sourcesConsulted;
    }
    return [''];
  });

  const [photoUrl, setPhotoUrl] = useState<string | null>(
    existingSubmission?.photoUrl || existingAnswerData.photoUrl || null
  );

  const [isCameraActive, setIsCameraActive] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const isCompleted = !!existingSubmission;

  // Word counter
  const wordCount = findingsText
    .trim()
    .split(/\s+/)
    .filter((w) => w.length > 0).length;

  const stopCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach((track) => track.stop());
      videoRef.current.srcObject = null;
    }
    setIsCameraActive(false);
  };

  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, []);

  const handleToggleQuestionChecked = (index: number) => {
    if (readOnly || isCompleted) return;
    const next = [...answeredState];
    next[index] = !next[index];
    setAnsweredState(next);
    sound.click();
  };

  const handleAddSourceInput = () => {
    if (readOnly || isCompleted) return;
    setSourcesList([...sourcesList, '']);
  };

  const handleSourceChange = (index: number, value: string) => {
    if (readOnly || isCompleted) return;
    const next = [...sourcesList];
    next[index] = value;
    setSourcesList(next);
  };

  const handleRemoveSource = (index: number) => {
    if (readOnly || isCompleted) return;
    if (sourcesList.length === 1) {
      setSourcesList(['']);
    } else {
      setSourcesList(sourcesList.filter((_, i) => i !== index));
    }
  };

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' }
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.setAttribute('playsinline', 'true');
        await videoRef.current.play();
      }
      setIsCameraActive(true);
      setErrorMessage(null);
    } catch {
      setErrorMessage(t.cameraPermissionDenied);
    }
  };

  const capturePhoto = () => {
    if (!videoRef.current) return;
    const canvas = document.createElement('canvas');
    canvas.width = videoRef.current.videoWidth || 640;
    canvas.height = videoRef.current.videoHeight || 480;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
      const dataUrl = canvas.toDataURL('image/jpeg', 0.85);
      setPhotoUrl(dataUrl);
      stopCamera();
      sound.success();
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        if (reader.result) {
          setPhotoUrl(reader.result as string);
          sound.success();
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = () => {
    if (readOnly || isCompleted) return;

    if (minWords > 0 && wordCount < minWords) {
      setErrorMessage(
        lang === 'el'
          ? `Η αναφορά σας περιέχει ${wordCount} λέξεις. Χρειάζονται τουλάχιστον ${minWords} λέξεις.`
          : `Your report contains ${wordCount} words. Minimum requirement is ${minWords} words.`
      );
      sound.error();
      return;
    }

    const cleanSources = sourcesList.map((s) => s.trim()).filter((s) => s.length > 0);
    if (requiresSourceLinks && cleanSources.length === 0) {
      setErrorMessage(
        lang === 'el'
          ? 'Παρακαλούμε καταγράψτε τουλάχιστον μία πηγή ή σύνδεσμο που χρησιμοποιήσατε.'
          : 'Please provide at least one source or link that your team consulted.'
      );
      sound.error();
      return;
    }

    setErrorMessage(null);
    sound.success();

    onSubmit({
      points: question.points,
      findingsText: findingsText.trim(),
      sourcesConsulted: cleanSources,
      answeredQuestions: answeredState,
      photoUrl: photoUrl || undefined
    });
  };

  return (
    <div className="space-y-6">
      {/* 1. Header Banner & Topic */}
      <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-teal-950/80 to-slate-900 border border-teal-500/30 shadow-lg">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-xl bg-teal-500/20 border border-teal-500/40 flex items-center justify-center text-teal-300 shrink-0">
            <Search className="w-5 h-5" />
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 flex-wrap mb-1">
              <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-teal-500/20 text-teal-300 border border-teal-500/40">
                🔬 {t.research}
              </span>
              <span className="text-xs font-mono font-bold text-amber-400">
                +{question.points} {t.pts}
              </span>
            </div>

            {payload.researchTopic && (
              <h3 className="text-base sm:text-lg font-bold text-slate-100 leading-snug">
                {payload.researchTopic}
              </h3>
            )}

            {payload.instructions && (
              <p className="text-xs sm:text-sm text-slate-300 mt-1 leading-relaxed">
                {payload.instructions}
              </p>
            )}
          </div>
        </div>

        {/* Optional Media (Image or Video) */}
        {question.videoUrl && (
          <div className="mt-4 rounded-xl overflow-hidden border border-purple-500/30 bg-black/40">
            <iframe
              src={getEmbedVideoUrl(question.videoUrl).embedUrl}
              title="Research Quest Video"
              className="w-full aspect-video rounded-xl"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          </div>
        )}

        {!question.videoUrl && question.imageUrl && (
          <div className="mt-4 rounded-xl overflow-hidden border border-slate-700/60 max-h-64 flex items-center justify-center bg-slate-950">
            <img
              src={question.imageUrl}
              alt="Research reference"
              className="w-full max-h-64 object-cover"
              referrerPolicy="no-referrer"
            />
          </div>
        )}
      </div>

      {/* 2. Suggested Sources & Reference Links (if configured) */}
      {suggestedSources.length > 0 && (
        <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-3">
          <div className="flex items-center gap-2 text-xs font-bold text-slate-300 uppercase tracking-wide">
            <BookOpen className="w-4 h-4 text-teal-400" />
            <span>{t.researchSourcesTitle}</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {suggestedSources.map((source, idx) => (
              <a
                key={idx}
                href={source.url}
                target="_blank"
                rel="noopener noreferrer"
                className="p-3 rounded-xl bg-slate-950 border border-slate-800 hover:border-teal-500/50 hover:bg-slate-900 flex items-center justify-between gap-3 text-xs text-teal-300 font-semibold group transition-all"
              >
                <div className="flex items-center gap-2 min-w-0">
                  <ExternalLink className="w-4 h-4 text-teal-400 group-hover:scale-110 transition-transform shrink-0" />
                  <span className="truncate">{source.title || source.url}</span>
                </div>
                <span className="text-[10px] text-slate-500 shrink-0 font-mono">↗</span>
              </a>
            ))}
          </div>
        </div>
      )}

      {/* 3. Guiding Research Questions (Checklist of inquiry topics) */}
      {guidingQuestions.length > 0 && (
        <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs font-bold text-slate-300 uppercase tracking-wide">
              <HelpCircle className="w-4 h-4 text-amber-400" />
              <span>{t.researchQuestionsTitle}</span>
            </div>
            <span className="text-[11px] font-mono text-amber-400 font-bold">
              {answeredState.filter(Boolean).length}/{guidingQuestions.length}
            </span>
          </div>

          <div className="space-y-2">
            {guidingQuestions.map((qText, idx) => {
              const isChecked = answeredState[idx];
              return (
                <div
                  key={idx}
                  onClick={() => handleToggleQuestionChecked(idx)}
                  className={`p-3 rounded-xl border transition-all flex items-start gap-3 cursor-pointer ${
                    isChecked
                      ? 'bg-teal-950/40 border-teal-500/50 text-slate-200'
                      : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:border-slate-700'
                  }`}
                >
                  <div className="pt-0.5 shrink-0">
                    <div
                      className={`w-5 h-5 rounded-md flex items-center justify-center transition-all ${
                        isChecked
                          ? 'bg-teal-500 text-slate-950 shadow-sm'
                          : 'border-2 border-slate-600 bg-slate-900'
                      }`}
                    >
                      {isChecked && <CheckCircle2 className="w-4 h-4" />}
                    </div>
                  </div>
                  <div className="min-w-0 flex-1">
                    <span className="text-xs sm:text-sm font-medium leading-relaxed block">
                      {qText}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* 4. Team Findings & Report Editor */}
      <div className="p-4 sm:p-5 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-3">
        <div className="flex items-center justify-between">
          <label className="text-xs font-bold text-slate-200 uppercase tracking-wide flex items-center gap-2">
            <FileText className="w-4 h-4 text-teal-400" />
            <span>{t.researchFindingsTitle}</span>
          </label>
          <div className="flex items-center gap-2">
            <span
              className={`text-xs font-mono font-bold px-2 py-0.5 rounded ${
                wordCount >= minWords
                  ? 'bg-emerald-950/80 text-emerald-300 border border-emerald-500/40'
                  : 'bg-amber-950/80 text-amber-300 border border-amber-500/40'
              }`}
            >
              {wordCount} {lang === 'el' ? 'λέξεις' : 'words'}
              {minWords > 0 && ` (ελάχ. ${minWords})`}
            </span>
          </div>
        </div>

        <textarea
          rows={6}
          value={findingsText}
          onChange={(e) => setFindingsText(e.target.value)}
          disabled={readOnly || isCompleted}
          placeholder={t.researchFindingsPlaceholder}
          className="w-full p-3.5 rounded-xl bg-slate-950 border border-slate-700 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-teal-500 leading-relaxed disabled:opacity-80"
        />
      </div>

      {/* 5. Sources Consulted Input */}
      <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-3">
        <div className="flex items-center justify-between">
          <label className="text-xs font-bold text-slate-300 uppercase tracking-wide flex items-center gap-2">
            <Link2 className="w-4 h-4 text-cyan-400" />
            <span>{t.researchSourcesUsedTitle}</span>
          </label>
          {!readOnly && !isCompleted && (
            <button
              type="button"
              onClick={handleAddSourceInput}
              className="text-xs font-semibold text-teal-400 hover:text-teal-300 flex items-center gap-1 cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>{lang === 'el' ? 'Προσθήκη Πηγής' : 'Add Source'}</span>
            </button>
          )}
        </div>

        <div className="space-y-2">
          {sourcesList.map((source, idx) => (
            <div key={idx} className="flex items-center gap-2">
              <span className="text-xs font-mono text-slate-500 w-5 text-right shrink-0">
                #{idx + 1}
              </span>
              <input
                type="text"
                value={source}
                onChange={(e) => handleSourceChange(idx, e.target.value)}
                disabled={readOnly || isCompleted}
                placeholder={t.researchSourcesUsedPlaceholder}
                className="flex-1 p-2.5 rounded-xl bg-slate-950 border border-slate-700 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-teal-500 disabled:opacity-80"
              />
              {!readOnly && !isCompleted && sourcesList.length > 1 && (
                <button
                  type="button"
                  onClick={() => handleRemoveSource(idx)}
                  className="p-2 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-slate-800 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* 6. Optional Photo Evidence / Notes */}
      {allowsPhoto && (
        <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-3">
          <span className="text-xs font-bold text-slate-300 uppercase tracking-wide flex items-center gap-2">
            <Camera className="w-4 h-4 text-emerald-400" />
            <span>{t.researchPhotoEvidence}</span>
          </span>

          {photoUrl ? (
            <div className="space-y-3">
              <div className="rounded-xl overflow-hidden border border-emerald-500/40 bg-slate-950 flex items-center justify-center max-h-72">
                <img
                  src={photoUrl}
                  alt="Research evidence"
                  className="w-full max-h-72 object-cover"
                />
              </div>

              {!readOnly && !isCompleted && (
                <button
                  type="button"
                  onClick={() => setPhotoUrl(null)}
                  className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs text-rose-300 font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>{lang === 'el' ? 'Αλλαγή φωτογραφίας' : 'Retake / Change photo'}</span>
                </button>
              )}
            </div>
          ) : !readOnly && !isCompleted ? (
            <div className="space-y-3">
              {isCameraActive ? (
                <div className="space-y-3">
                  <div className="rounded-xl overflow-hidden bg-black border border-slate-700 aspect-video flex items-center justify-center">
                    <video ref={videoRef} className="w-full h-full object-cover" autoPlay playsInline />
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={capturePhoto}
                      className="flex-1 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-md cursor-pointer"
                    >
                      <Camera className="w-4 h-4" />
                      <span>{lang === 'el' ? 'Λήψη Φωτογραφίας' : 'Take Photo'}</span>
                    </button>
                    <button
                      type="button"
                      onClick={stopCamera}
                      className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold cursor-pointer"
                    >
                      {t.cancel}
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col sm:flex-row items-center gap-3">
                  <button
                    type="button"
                    onClick={startCamera}
                    className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center justify-center gap-2 border border-slate-700 transition-colors cursor-pointer"
                  >
                    <Camera className="w-4 h-4 text-emerald-400" />
                    <span>{t.startCamera}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center justify-center gap-2 border border-slate-700 transition-colors cursor-pointer"
                  >
                    <Upload className="w-4 h-4 text-sky-400" />
                    <span>{t.choosePhoto}</span>
                  </button>

                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                </div>
              )}
            </div>
          ) : null}
        </div>
      )}

      {/* Error notification */}
      {errorMessage && (
        <div className="p-3 rounded-xl bg-rose-950/80 border border-rose-500/50 text-rose-300 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* 7. Action Button */}
      {isCompleted ? (
        <div className="p-4 rounded-xl bg-emerald-950/80 border border-emerald-500/50 text-emerald-300 flex items-center gap-3">
          <Award className="w-6 h-6 text-emerald-400 shrink-0" />
          <div>
            <h4 className="text-sm font-bold">{lang === 'el' ? 'Ολοκληρώθηκε' : 'Completed'}</h4>
            <p className="text-xs text-emerald-400/90 mt-0.5">
              {lang === 'el'
                ? `Η έρευνα ολοκληρώθηκε με επιτυχία! Κερδίσατε ${existingSubmission.scoreEarned} πόντους.`
                : `Research successfully completed! Earned ${existingSubmission.scoreEarned} points.`}
            </p>
          </div>
        </div>
      ) : !readOnly ? (
        <button
          type="button"
          onClick={handleSubmit}
          className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-teal-500 to-emerald-500 hover:from-teal-400 hover:to-emerald-400 text-slate-950 font-black text-sm flex items-center justify-center gap-2 shadow-lg shadow-teal-500/25 transition-all cursor-pointer active:scale-98"
        >
          <Sparkles className="w-4 h-4" />
          <span>{t.researchSubmitBtn}</span>
        </button>
      ) : null}
    </div>
  );
};
