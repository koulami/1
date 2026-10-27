import React, { useState } from 'react';
import {
  X,
  Play,
  Maximize2,
  Minimize2,
  Sparkles,
  Award,
  Film,
  Image as ImageIcon,
  CheckCircle2,
  MapPin,
  ExternalLink,
  Volume2,
  ArrowRight,
  ZoomIn,
  ZoomOut
} from 'lucide-react';
import { Question, FieldSpotInfo, Language, Team } from '../types/game';
import { getEmbedVideoUrl } from './UnlockedMediaViewer';

interface Props {
  question: Question;
  fieldSpot: FieldSpotInfo;
  lang: Language;
  activeTeam?: Team;
  isTaskCompleted?: boolean;
  onClose: () => void;
  onSolveTask?: (question: Question) => void;
}

export const FieldMediaPlaybackModal: React.FC<Props> = ({
  question,
  fieldSpot,
  lang,
  activeTeam,
  isTaskCompleted = false,
  onClose,
  onSolveTask
}) => {
  const isEl = lang === 'el';
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [isZoomed, setIsZoomed] = useState<boolean>(false);

  const isVideo = fieldSpot.mediaType === 'video' || (fieldSpot.mediaUrl && (fieldSpot.mediaUrl.includes('youtu') || fieldSpot.mediaUrl.endsWith('.mp4')));
  const videoInfo = isVideo && fieldSpot.mediaUrl ? getEmbedVideoUrl(fieldSpot.mediaUrl) : null;

  const spotTitle = isEl
    ? (fieldSpot.spotName || question.title)
    : (fieldSpot.spotName_en || question.title_en || fieldSpot.spotName || question.title);

  const spotCaption = isEl
    ? (fieldSpot.caption || question.description)
    : (fieldSpot.caption_en || question.description_en || fieldSpot.caption || question.description);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/85 backdrop-blur-md animate-fadeIn">
      <div
        className={`w-full ${
          isFullscreen ? 'max-w-6xl h-[95vh]' : 'max-w-3xl max-h-[92vh]'
        } flex flex-col rounded-3xl bg-slate-900 border-2 border-amber-500/50 shadow-2xl overflow-hidden transition-all duration-300`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header Bar */}
        <div className="p-4 sm:p-5 border-b border-slate-800 bg-slate-950/80 flex items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/20 border border-amber-500/50 flex items-center justify-center text-amber-300 shrink-0 shadow-md">
              {isVideo ? <Film className="w-5 h-5" /> : <ImageIcon className="w-5 h-5" />}
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40 text-[10px] font-black uppercase flex items-center gap-1">
                  <MapPin className="w-3 h-3 text-amber-400" />
                  <span>{fieldSpot.spotCode || question.id}</span>
                </span>
                <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-[10px] font-bold flex items-center gap-1">
                  <Award className="w-3 h-3 text-emerald-400" />
                  <span>+{question.points} pts</span>
                </span>
                {isTaskCompleted && (
                  <span className="px-2 py-0.5 rounded-full bg-emerald-500 text-slate-950 text-[10px] font-black flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" />
                    <span>{isEl ? 'ΟΛΟΚΛΗΡΩΘΗΚΕ' : 'COMPLETED'}</span>
                  </span>
                )}
              </div>
              <h3 className="text-sm sm:text-base font-black text-white truncate mt-0.5">
                {spotTitle}
              </h3>
            </div>
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            <button
              type="button"
              onClick={() => setIsFullscreen(!isFullscreen)}
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors cursor-pointer"
              title={isFullscreen ? (isEl ? 'Σμίκρυνση' : 'Exit Fullscreen') : (isEl ? 'Πλήρης Οθόνη' : 'Fullscreen')}
            >
              {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-xl bg-slate-800 hover:bg-rose-950 hover:text-rose-300 text-slate-400 border border-slate-700 transition-colors cursor-pointer"
              title={isEl ? 'Κλείσιμο' : 'Close'}
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Body / Media Viewport */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
          {/* Media Player Card */}
          <div className="relative rounded-2xl overflow-hidden border-2 border-slate-800 bg-black shadow-2xl flex items-center justify-center min-h-[260px] sm:min-h-[380px]">
            {isVideo && videoInfo ? (
              videoInfo.type === 'direct' ? (
                <video
                  src={videoInfo.embedUrl}
                  controls
                  autoPlay
                  playsInline
                  className="w-full max-h-[65vh] object-contain bg-black"
                />
              ) : (
                <div className="w-full aspect-video">
                  <iframe
                    src={videoInfo.embedUrl}
                    title={spotTitle}
                    className="w-full h-full border-0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                    allowFullScreen
                  />
                </div>
              )
            ) : fieldSpot.mediaUrl ? (
              <div
                className={`relative w-full flex items-center justify-center overflow-hidden cursor-pointer ${
                  isZoomed ? 'max-h-none' : 'max-h-[60vh]'
                }`}
                onClick={() => setIsZoomed(!isZoomed)}
              >
                <img
                  src={fieldSpot.mediaUrl}
                  alt={spotTitle}
                  className={`w-full object-contain transition-transform duration-300 ${
                    isZoomed ? 'scale-125' : 'scale-100 max-h-[60vh]'
                  }`}
                  referrerPolicy="no-referrer"
                  onError={(e) => {
                    // Fallback to vulture illustration placeholder
                    (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1549608276-5786777e6587?auto=format&fit=crop&w=1200&q=80';
                  }}
                />
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsZoomed(!isZoomed);
                  }}
                  className="absolute bottom-3 right-3 px-3 py-1.5 rounded-xl bg-black/75 hover:bg-black text-amber-300 border border-amber-500/40 text-xs font-bold flex items-center gap-1.5 backdrop-blur-sm shadow-lg transition-transform active:scale-95"
                >
                  {isZoomed ? <ZoomOut className="w-3.5 h-3.5" /> : <ZoomIn className="w-3.5 h-3.5" />}
                  <span>{isZoomed ? (isEl ? 'Επαναφορά' : 'Reset Zoom') : (isEl ? 'Μεγέθυνση' : 'Zoom In')}</span>
                </button>
              </div>
            ) : (
              <div className="p-12 text-center space-y-2">
                <div className="text-4xl">🦅</div>
                <p className="text-sm font-bold text-slate-300">
                  {isEl ? 'Σταθμός Πεδίου Όρνιου Κύπρου' : 'Cyprus Griffon Vulture Field Station'}
                </p>
                <p className="text-xs text-slate-500 font-mono">{fieldSpot.spotCode}</p>
              </div>
            )}
          </div>

          {/* Educational Notes & Field Observation Guide */}
          <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-2">
            <div className="flex items-center justify-between gap-2">
              <span className="text-xs font-black text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                <span>{isEl ? 'Επιστημονική Καταγραφή Πεδίου' : 'Scientific Field Observation'}</span>
              </span>
              <span className="text-[11px] font-mono text-slate-400">
                {isEl ? `Αποστολή: ${question.id}` : `Quest: ${question.id}`}
              </span>
            </div>

            <p className="text-xs sm:text-sm text-slate-200 leading-relaxed">
              {spotCaption}
            </p>

            {question.explanation && (
              <div className="pt-2 border-t border-slate-800/80 text-xs text-slate-300">
                <span className="font-bold text-emerald-400 mr-1.5">
                  {isEl ? '💡 Επεξήγηση:' : '💡 Key Insight:'}
                </span>
                <span>{isEl ? question.explanation : question.explanation_en || question.explanation}</span>
              </div>
            )}
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-4 sm:p-5 border-t border-slate-800 bg-slate-950 flex items-center justify-between gap-3 shrink-0 flex-wrap">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold transition-colors cursor-pointer"
          >
            {isEl ? 'Επιστροφή' : 'Close'}
          </button>

          {onSolveTask && (
            <button
              type="button"
              onClick={() => {
                onClose();
                onSolveTask(question);
              }}
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black text-xs sm:text-sm flex items-center gap-2 shadow-lg shadow-amber-500/20 transition-all cursor-pointer active:scale-95 ml-auto"
            >
              <span>{isTaskCompleted ? (isEl ? 'Προβολή Αποστολής' : 'View Quest') : (isEl ? '🎯 Επίλυση Αποστολής' : '🎯 Solve Mission')}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
