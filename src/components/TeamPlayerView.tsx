import React, { useState, useEffect, useMemo } from 'react';
import {
  Users, CheckCircle2, Clock, Award, ChevronRight, ChevronLeft, HelpCircle, Camera,
  Puzzle, QrCode, SplitSquareVertical, MessageSquare, Sparkles, Radio, ArrowRight,
  Lock, Target, Film, Search
} from 'lucide-react';
import { GameState, Language, Team, Question, Submission, TeamSynthesisNote, FieldSpotInfo } from '../types/game';
import { translations } from '../locales/translations';
import { QuestSolverModal } from './QuestSolverModal';
import { TeamSynthesisPadlet } from './TeamSynthesisPadlet';
import { FieldQrScannerModal } from './FieldQrScannerModal';
import { FieldMediaPlaybackModal } from './FieldMediaPlaybackModal';
import { TaskQrCodeModal } from './TaskQrCodeModal';
import { getQuestionFieldSpot } from '../utils/qrMediaHelper';
import { getTeamOrderedQuestions, isTeamSequentialProgression, getQuestionStepInfo } from '../utils/questOrder';

interface Props {
  gameState: GameState;
  activeTeamId: string;
  onSelectTeam: (teamId: string) => void;
  lang: Language;
  onSubmitQuest: (questionId: string, teamId: string, data: Partial<Submission>) => void;
  onAddSynthesisNote: (note: Omit<TeamSynthesisNote, 'id' | 'createdAt'>) => void;
  onDeleteSynthesisNote: (noteId: string) => void;
  onLikeSynthesisNote?: (noteId: string) => void;
}

export const TeamPlayerView: React.FC<Props> = ({
  gameState,
  activeTeamId,
  onSelectTeam,
  lang,
  onSubmitQuest,
  onAddSynthesisNote,
  onDeleteSynthesisNote,
  onLikeSynthesisNote
}) => {
  const t = translations[lang];
  const safeTeams = Array.isArray(gameState.teams) && gameState.teams.length > 0 ? gameState.teams : [];
  const activeTeam = safeTeams.find(t => t.id === activeTeamId) || safeTeams[0] || {
    id: 'team-alpha',
    name: 'Ομάδα',
    color: '#eab308',
    avatar: '🦅'
  };
  const safeSubmissions = gameState.submissions || {};
  const [activeTab, setActiveTab] = useState<'quests' | 'synthesis'>('quests');
  const [activeFilter, setActiveFilter] = useState<'all' | 'pending' | 'completed'>('all');
  const [selectedQuest, setSelectedQuest] = useState<Question | null>(null);
  const [lockedNoticeQuest, setLockedNoticeQuest] = useState<{
    quest: Question;
    stepNumber: number;
    previousQuestTitle?: string;
  } | null>(null);

  // Field QR Scanner & Media Playback Modal states
  const [isQrScannerOpen, setIsQrScannerOpen] = useState<boolean>(false);
  const [qrModalTask, setQrModalTask] = useState<Question | null>(null);
  const [mediaModalInfo, setMediaModalInfo] = useState<{ question: Question; fieldSpot: FieldSpotInfo } | null>(null);

  // Filter & sort questions in the exact order configured for this team
  const visibleQuestions = getTeamOrderedQuestions(
    activeTeam,
    gameState.questions || [],
    gameState.teamQuestionOrders
  );

  // Stats for active team
  const teamSubmissions = visibleQuestions
    .map(q => safeSubmissions[`${activeTeam.id}_${q.id}`])
    .filter(Boolean);
  const teamScore = teamSubmissions.reduce((sum, s) => sum + (s?.scoreEarned || 0), 0);
  const completedCount = teamSubmissions.length;
  const isAllQuestsFinished = visibleQuestions.length > 0 && completedCount === visibleQuestions.length;

  const handleQuestCardClick = (quest: Question) => {
    const stepInfo = getQuestionStepInfo(quest.id, activeTeam, gameState);
    if (stepInfo.isLocked) {
      setLockedNoticeQuest({
        quest,
        stepNumber: stepInfo.stepNumber,
        previousQuestTitle: stepInfo.previousQuestTitle
      });
      return;
    }
    setSelectedQuest(quest);
  };

  const handleGoToCurrentQuest = () => {
    const currentUnfinished = visibleQuestions.find(
      q => !safeSubmissions[`${activeTeam.id}_${q.id}`]
    );
    setLockedNoticeQuest(null);
    if (currentUnfinished) {
      setSelectedQuest(currentUnfinished);
    }
  };

  // Pagination State for strict memory protection (8 quests per page)
  const PAGE_SIZE = 8;
  const [currentPage, setCurrentPage] = useState<number>(1);

  // Reset page to 1 when changing team or filter
  useEffect(() => {
    setCurrentPage(1);
  }, [activeTeamId, activeFilter]);

  const filteredQuestions = useMemo(() => {
    return visibleQuestions.filter(quest => {
      const isDone = !!safeSubmissions[`${activeTeam.id}_${quest.id}`];
      if (activeFilter === 'pending') return !isDone;
      if (activeFilter === 'completed') return isDone;
      return true;
    });
  }, [visibleQuestions, safeSubmissions, activeTeam.id, activeFilter]);

  const totalPages = Math.max(1, Math.ceil(filteredQuestions.length / PAGE_SIZE));
  const safeCurrentPage = Math.min(currentPage, totalPages);
  const startIndex = (safeCurrentPage - 1) * PAGE_SIZE;
  const endIndex = Math.min(startIndex + PAGE_SIZE, filteredQuestions.length);

  const paginatedQuestions = useMemo(() => {
    return filteredQuestions.slice(startIndex, endIndex);
  }, [filteredQuestions, startIndex, endIndex]);

  const getQuestIcon = (type: Question['type']) => {
    switch (type) {
      case 'multiple_choice':
      case 'true_false':
        return <HelpCircle className="w-4 h-4 text-amber-400" />;
      case 'text_match':
      case 'image_match':
        return <SplitSquareVertical className="w-4 h-4 text-cyan-400" />;
      case 'qr_scan':
        return <QrCode className="w-4 h-4 text-purple-400" />;
      case 'photo_upload':
        return <Camera className="w-4 h-4 text-emerald-400" />;
      case 'puzzle':
        return <Puzzle className="w-4 h-4 text-rose-400" />;
      case 'task':
        return <Target className="w-4 h-4 text-amber-400" />;
      case 'research':
        return <Search className="w-4 h-4 text-teal-400" />;
      default:
        return <Award className="w-4 h-4 text-slate-400" />;
    }
  };

  // ================= SCENARIO 1: WAITING ROOM LOBBY =================
  if (gameState.phase === 'waiting_lobby') {
    return (
      <div className="max-w-2xl mx-auto p-4 sm:p-6 space-y-6">
        {/* Waiting Card */}
        <div className="p-6 sm:p-8 rounded-3xl bg-slate-900 border border-slate-800 shadow-2xl text-center space-y-5">
          <div className="relative w-20 h-20 mx-auto flex items-center justify-center">
            <div className="absolute inset-0 rounded-full bg-amber-500/20 animate-ping" />
            <div className="relative w-16 h-16 rounded-2xl bg-amber-500/10 border border-amber-500/40 flex items-center justify-center text-3xl shadow-lg">
              {activeTeam.avatar}
            </div>
          </div>

          <div className="space-y-1">
            <span className="text-xs font-bold text-amber-400 uppercase tracking-widest flex items-center justify-center gap-1.5">
              <Radio className="w-3.5 h-3.5 animate-pulse text-rose-500" />
              <span>{t.phaseLobby}</span>
            </span>
            <h1 className="text-xl sm:text-2xl font-black text-slate-100">
              {activeTeam.name}
            </h1>
            {activeTeam.slogan && (
              <p className="text-xs text-slate-400 italic">"{activeTeam.slogan}"</p>
            )}
          </div>

          <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 max-w-md mx-auto text-xs text-slate-300 leading-relaxed space-y-2">
            <p className="font-semibold text-amber-300">
              {t.waitingForTeacherStart}
            </p>
            <p className="text-slate-400">
              {t.teamJoinedWaiting}
            </p>
          </div>

          {/* Switch team pills if student selected wrong team */}
          <div className="pt-4 border-t border-slate-800 space-y-2">
            <span className="text-xs text-slate-400 block">{t.selectYourTeam}:</span>
            <div className="flex flex-wrap items-center justify-center gap-2">
              {gameState.teams.map((tm) => (
                <button
                  key={tm.id}
                  type="button"
                  onClick={() => onSelectTeam(tm.id)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 ${
                    tm.id === activeTeam.id
                      ? 'bg-amber-500 text-slate-950 ring-2 ring-amber-500/30'
                      : 'bg-slate-800 hover:bg-slate-700 text-slate-300'
                  }`}
                >
                  <span>{tm.avatar}</span>
                  <span>{tm.name.split(':')[0]}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Connected Teams in Arena */}
        <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-3">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
            {t.connectedTeamsInArena} ({gameState.teams.length})
          </span>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {gameState.teams.map((tm) => (
              <div
                key={tm.id}
                className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 flex items-center gap-2 text-xs"
              >
                <span className="text-lg">{tm.avatar}</span>
                <span className="truncate text-slate-200 font-medium">{tm.name.split(':')[0]}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // ================= SCENARIO 2: ACTIVE MISSION & SYNTHESIS =================
  return (
    <div className="max-w-4xl mx-auto p-4 sm:p-6 space-y-6">
      {/* Team Header */}
      <div className="p-4 sm:p-5 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className="text-3xl p-2 rounded-2xl bg-slate-800 border border-slate-700">
              {activeTeam.avatar}
            </span>
            <div>
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: activeTeam.color }} />
                <span className="text-xs text-slate-400 font-semibold">{t.activeTeam}</span>
              </div>
              <h1 className="text-lg sm:text-xl font-black text-slate-100">
                {activeTeam.name}
              </h1>
              {activeTeam.slogan && (
                <p className="text-xs text-slate-400 italic">{activeTeam.slogan}</p>
              )}
            </div>
          </div>

          {/* Quick Score Badge */}
          <div className="flex items-center gap-4 bg-slate-950/80 p-3 rounded-xl border border-slate-800">
            <div>
              <span className="text-[10px] text-slate-400 uppercase font-semibold block">{t.pointsEarned}</span>
              <span className="text-xl font-extrabold font-mono text-amber-400">
                {teamScore} <span className="text-xs text-slate-400">{t.pts}</span>
              </span>
            </div>
            <div className="w-px h-8 bg-slate-800" />
            <div>
              <span className="text-[10px] text-slate-400 uppercase font-semibold block">{t.completedQuests}</span>
              <span className="text-xl font-extrabold font-mono text-slate-200">
                {completedCount}/{visibleQuestions.length}
              </span>
            </div>
          </div>
        </div>

        {/* Team Switcher Tabs */}
        <div className="pt-2 border-t border-slate-800 flex items-center gap-2 overflow-x-auto no-scrollbar">
          <span className="text-xs text-slate-400 font-medium shrink-0">{t.selectYourTeam}:</span>
          {gameState.teams.map((tm) => (
            <button
              key={tm.id}
              type="button"
              onClick={() => onSelectTeam(tm.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-1.5 ${
                tm.id === activeTeam.id
                  ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
                  : 'bg-slate-800 hover:bg-slate-700 text-slate-300'
              }`}
            >
              <span>{tm.avatar}</span>
              <span>{tm.name.split(':')[0]}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Main Tabs: 1. Quests | 2. Team Synthesis Padlet */}
      <div className="flex items-center gap-2 p-1 bg-slate-900 rounded-2xl border border-slate-800">
        <button
          type="button"
          onClick={() => setActiveTab('quests')}
          className={`flex-1 py-2.5 px-4 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 ${
            activeTab === 'quests'
              ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Award className="w-4 h-4" />
          <span>{lang === 'el' ? '1. Οι Αποστολές μας' : '1. Our Quests'} ({completedCount}/{visibleQuestions.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('synthesis')}
          className={`flex-1 py-2.5 px-4 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 relative ${
            activeTab === 'synthesis'
              ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <MessageSquare className="w-4 h-4" />
          <span>{lang === 'el' ? '2. Πίνακας Συμπερασμάτων' : '2. Synthesis Board'}</span>
          {isAllQuestsFinished && activeTab !== 'synthesis' && (
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping absolute top-2 right-3" />
          )}
        </button>

        <button
          type="button"
          onClick={() => setIsQrScannerOpen(true)}
          className="py-2.5 px-3.5 sm:px-4 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-1.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white shadow-md shadow-purple-600/20 active:scale-95 cursor-pointer shrink-0"
          title={lang === 'el' ? 'Σάρωση QR Code Σταθμού Πεδίου & Άμεση Αναπαραγωγή' : 'Scan Field Station QR Code & Instant Playback'}
        >
          <Camera className="w-3.5 h-3.5 text-purple-200" />
          <span className="hidden sm:inline">{lang === 'el' ? '📱 Σάρωση QR Σταθμού' : '📱 Scan Field QR'}</span>
          <span className="sm:hidden">{lang === 'el' ? '📱 QR' : '📱 QR'}</span>
        </button>
      </div>

      {/* TAB 1: QUESTS LIST */}
      {activeTab === 'quests' && (
        <div className="space-y-4">
          {/* Completion Callout to Move to Synthesis */}
          {isAllQuestsFinished && (
            <div className="p-4 rounded-2xl bg-emerald-950/60 border border-emerald-500/60 flex items-center justify-between gap-3 shadow-lg animate-fadeIn">
              <div className="flex items-center gap-2.5">
                <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
                <div>
                  <span className="text-xs font-bold text-emerald-300 block">
                    {lang === 'el' ? 'Μπράβο! Όλες οι αποστολές της ομάδας ολοκληρώθηκαν!' : 'Well done! All team quests completed!'}
                  </span>
                  <span className="text-[11px] text-slate-300">
                    {lang === 'el' ? 'Μπείτε στον πίνακα για να συνθέσετε τις πληροφορίες που ανακαλύψατε.' : 'Go to synthesis board to compile your discoveries.'}
                  </span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setActiveTab('synthesis')}
                className="px-3.5 py-2 rounded-xl bg-emerald-500 text-slate-950 font-bold text-xs flex items-center gap-1.5 shrink-0 hover:bg-emerald-400 transition-colors"
              >
                <span>{lang === 'el' ? 'Μετάβαση' : 'Go'}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

          {/* Filter Tabs */}
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-1 p-1 bg-slate-900 rounded-xl border border-slate-800">
              <button
                type="button"
                onClick={() => setActiveFilter('all')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                  activeFilter === 'all'
                    ? 'bg-slate-800 text-slate-100'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {t.allTeams} ({visibleQuestions.length})
              </button>
              <button
                type="button"
                onClick={() => setActiveFilter('pending')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                  activeFilter === 'pending'
                    ? 'bg-slate-800 text-slate-100'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {t.statusPending} ({visibleQuestions.length - completedCount})
              </button>
              <button
                type="button"
                onClick={() => setActiveFilter('completed')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                  activeFilter === 'completed'
                    ? 'bg-slate-800 text-slate-100'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {t.statusCompleted} ({completedCount})
              </button>
            </div>
          </div>

          {/* Pagination Top Bar */}
          {filteredQuestions.length > 0 && totalPages > 1 && (
            <div className="flex items-center justify-between px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs">
              <span className="text-slate-400 font-medium">
                {lang === 'el' ? `Προβολή ${startIndex + 1}-${endIndex} από ${filteredQuestions.length} αποστολές` : `Showing ${startIndex + 1}-${endIndex} of ${filteredQuestions.length} quests`}
              </span>
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  disabled={safeCurrentPage <= 1}
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 disabled:opacity-40 disabled:cursor-not-allowed text-slate-200 font-semibold flex items-center gap-1 cursor-pointer transition-colors"
                >
                  <ChevronLeft className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">{lang === 'el' ? 'Προηγούμενη' : 'Prev'}</span>
                </button>
                <span className="px-2 py-1 rounded-lg bg-slate-950 font-mono font-bold text-amber-400 text-[11px]">
                  {safeCurrentPage} / {totalPages}
                </span>
                <button
                  type="button"
                  disabled={safeCurrentPage >= totalPages}
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 disabled:opacity-40 disabled:cursor-not-allowed text-slate-200 font-semibold flex items-center gap-1 cursor-pointer transition-colors"
                >
                  <span className="hidden sm:inline">{lang === 'el' ? 'Επόμενη' : 'Next'}</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          )}

          {/* Cards List */}
          {visibleQuestions.length === 0 ? (
            <div className="p-12 text-center text-xs text-slate-500 bg-slate-900/40 rounded-2xl border border-slate-800">
              {lang === 'el' ? 'Δεν έχουν ανατεθεί αποστολές για αυτή την ομάδα ακόμα.' : 'No quests assigned to this team yet.'}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {paginatedQuestions.map((quest) => {
                const submission = gameState.submissions[`${activeTeam.id}_${quest.id}`];
                const isDone = !!submission;
                const isCorrect = submission?.status === 'correct' || submission?.status === 'completed';
                const stepInfo = getQuestionStepInfo(quest.id, activeTeam, gameState);

                return (
                  <div
                    key={quest.id}
                    onClick={() => handleQuestCardClick(quest)}
                    className={`p-4 rounded-2xl border transition-all cursor-pointer relative flex flex-col justify-between ${
                      stepInfo.isLocked
                        ? 'bg-slate-950/70 border-slate-800/80 opacity-65 hover:opacity-90 hover:border-slate-700'
                        : isDone
                        ? isCorrect
                          ? 'bg-slate-900/90 border-emerald-800/80 hover:border-emerald-600'
                          : 'bg-slate-900/90 border-rose-800/80 hover:border-rose-600'
                        : stepInfo.isCurrent
                        ? 'bg-slate-900 border-amber-500/80 shadow-lg shadow-amber-500/10 ring-1 ring-amber-500/40'
                        : 'bg-slate-900/80 border-slate-800 hover:border-amber-500/60 hover:shadow-lg'
                    }`}
                  >
                    <div>
                      {/* Top line: Step number, Quest type, Lock/Current badge, and Points */}
                      <div className="flex items-center justify-between text-xs mb-2">
                        <div className="flex items-center gap-2">
                          <span
                            className={`w-5 h-5 rounded-md font-mono text-[11px] flex items-center justify-center font-bold ${
                              isDone
                                ? 'bg-emerald-950 text-emerald-400 border border-emerald-800/80'
                                : stepInfo.isCurrent
                                ? 'bg-amber-500 text-slate-950 font-black'
                                : 'bg-slate-800 text-slate-400'
                            }`}
                          >
                            {isDone ? '✓' : `#${stepInfo.stepNumber}`}
                          </span>
                          <div className="flex items-center gap-1.5 font-medium text-slate-400">
                            {getQuestIcon(quest.type)}
                            <span className="truncate max-w-[120px]">{t[quest.type]}</span>
                          </div>
                        </div>

                        <div className="flex items-center gap-1.5">
                          {stepInfo.isLocked && (
                            <span className="px-2 py-0.5 rounded-full bg-slate-800/90 text-slate-400 text-[10px] font-semibold flex items-center gap-1 border border-slate-700">
                              <Lock className="w-3 h-3 text-amber-400/90" />
                              <span>{t.questLocked}</span>
                            </span>
                          )}
                          {stepInfo.isCurrent && !isDone && (
                            <span className="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 text-[10px] font-bold flex items-center gap-1 border border-amber-500/40 animate-pulse">
                              <span>{t.currentStepBadge}</span>
                            </span>
                          )}
                          <span className="font-mono font-bold text-amber-400">
                            {quest.points} {t.pts}
                          </span>
                        </div>
                      </div>

                      <h3 className="text-sm font-bold text-slate-100 leading-snug mb-2">
                        {quest.title}
                      </h3>

                      <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed mb-3">
                        {quest.description}
                      </p>

                      {quest.videoUrl ? (
                        <div className="rounded-xl overflow-hidden border border-purple-500/40 bg-purple-950/60 p-3 mb-3 flex items-center gap-2.5 text-purple-300">
                          <Film className="w-5 h-5 text-purple-400 shrink-0" />
                          <span className="font-bold text-xs truncate">
                            {lang === 'el' ? '🎥 Περιλαμβάνει Βίντεο Αποστολής' : '🎥 Includes Quest Video'}
                          </span>
                        </div>
                      ) : quest.imageUrl ? (
                        <div className="rounded-xl overflow-hidden border border-slate-800 h-28 bg-slate-950 mb-3 flex items-center justify-center">
                          <img
                            src={quest.imageUrl}
                            alt={quest.title}
                            className="w-full h-full object-cover"
                            referrerPolicy="no-referrer"
                            loading="lazy"
                            decoding="async"
                            onError={(e) => { e.currentTarget.style.display = 'none'; }}
                          />
                        </div>
                      ) : null}

                      {/* Locked contextual hint */}
                      {stepInfo.isLocked && (
                        <div className="mb-2 p-2 rounded-lg bg-slate-950 border border-slate-800/80 text-[11px] text-amber-400/90 flex items-center gap-1.5">
                          <Lock className="w-3.5 h-3.5 shrink-0 text-amber-400" />
                          <span className="truncate">
                            {t.mustCompletePrevious} #{stepInfo.stepNumber - 1}
                            {stepInfo.previousQuestTitle && ` («${stepInfo.previousQuestTitle}»)`}
                          </span>
                        </div>
                      )}
                    </div>

                    <div className="pt-3 border-t border-slate-800 flex items-center justify-between text-xs">
                      {isDone ? (
                        <div className={`flex items-center gap-1 font-bold ${
                          isCorrect ? 'text-emerald-400' : 'text-rose-400'
                        }`}>
                          <CheckCircle2 className="w-4 h-4" />
                          <span>{isCorrect ? `+${submission.scoreEarned} ${t.pts}` : t.statusIncorrect}</span>
                        </div>
                      ) : stepInfo.isLocked ? (
                        <div className="flex items-center gap-1 text-slate-500 font-medium">
                          <Lock className="w-3.5 h-3.5 text-slate-500" />
                          <span>{t.questLocked}</span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-1 text-slate-500 font-medium">
                          <Clock className="w-4 h-4" />
                          <span>{t.statusPending}</span>
                        </div>
                      )}

                      <div className="flex items-center gap-1.5 ml-auto">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setQrModalTask(quest);
                          }}
                          className="px-2.5 py-1.5 rounded-xl bg-purple-950/70 hover:bg-purple-900 border border-purple-500/40 text-purple-300 font-bold text-xs flex items-center gap-1 transition-colors cursor-pointer"
                          title={lang === 'el' ? 'Προβολή QR Code Σταθμού & Πολυμέσων' : 'View Station QR & Media'}
                        >
                          <QrCode className="w-3.5 h-3.5 text-purple-400" />
                          <span className="hidden sm:inline">{lang === 'el' ? 'QR' : 'QR'}</span>
                        </button>

                        <button
                          type="button"
                          className={`px-3 py-1.5 rounded-xl font-bold text-xs flex items-center gap-1 transition-colors ${
                            isDone
                              ? 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                              : stepInfo.isLocked
                              ? 'bg-slate-800/80 text-slate-400 hover:bg-slate-800 border border-slate-700/60'
                              : 'bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-md shadow-amber-500/10'
                          }`}
                        >
                          <span>
                            {isDone
                              ? t.viewSubmission
                              : stepInfo.isLocked
                              ? t.questLocked
                              : t.solveNow}
                          </span>
                          <ChevronRight className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Pagination Bottom Bar */}
          {filteredQuestions.length > 0 && totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 pt-2">
              <button
                type="button"
                disabled={safeCurrentPage <= 1}
                onClick={() => {
                  setCurrentPage((p) => Math.max(1, p - 1));
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                className="px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed text-slate-300 text-xs font-semibold flex items-center gap-1 cursor-pointer transition-colors"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
                <span>{lang === 'el' ? 'Προηγούμενη Σελίδα' : 'Previous Page'}</span>
              </button>
              <span className="text-xs text-slate-400 font-medium px-2">
                {safeCurrentPage} / {totalPages}
              </span>
              <button
                type="button"
                disabled={safeCurrentPage >= totalPages}
                onClick={() => {
                  setCurrentPage((p) => Math.min(totalPages, p + 1));
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                className="px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed text-slate-300 text-xs font-semibold flex items-center gap-1 cursor-pointer transition-colors"
              >
                <span>{lang === 'el' ? 'Επόμενη Σελίδα' : 'Next Page'}</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

          {/* Locked Quest Notice Popup */}
          {lockedNoticeQuest && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
              <div className="w-full max-w-sm rounded-2xl bg-slate-900 border border-slate-700 p-5 space-y-4 shadow-2xl text-center">
                <div className="w-14 h-14 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center mx-auto text-amber-400">
                  <Lock className="w-7 h-7" />
                </div>
                <div className="space-y-1">
                  <h3 className="font-bold text-slate-100 text-base">
                    {t.questLocked} (#{lockedNoticeQuest.stepNumber})
                  </h3>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    {t.mustCompletePrevious} #{lockedNoticeQuest.stepNumber - 1}{' '}
                    {lockedNoticeQuest.previousQuestTitle && (
                      <span className="font-semibold text-amber-300 block mt-1">
                        «{lockedNoticeQuest.previousQuestTitle}»
                      </span>
                    )}
                  </p>
                </div>
                <div className="pt-2 flex items-center justify-center gap-2">
                  <button
                    type="button"
                    onClick={() => setLockedNoticeQuest(null)}
                    className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition-colors"
                  >
                    {t.close}
                  </button>
                  <button
                    type="button"
                    onClick={handleGoToCurrentQuest}
                    className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold transition-colors shadow-md shadow-amber-500/20"
                  >
                    {lang === 'el' ? 'Μετάβαση στην Τρέχουσα 🚀' : 'Go to Current Quest 🚀'}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB 2: SYNTHESIS PADLET BOARD */}
      {activeTab === 'synthesis' && (
        <TeamSynthesisPadlet
          team={activeTeam}
          notes={gameState.synthesisNotes}
          synthesisPrompt={gameState.synthesisPrompt}
          lang={lang}
          onAddNote={onAddSynthesisNote}
          onDeleteNote={onDeleteSynthesisNote}
          onLikeNote={onLikeSynthesisNote}
        />
      )}

      {/* Quest Modal */}
      {selectedQuest && (
        <QuestSolverModal
          question={selectedQuest}
          team={activeTeam}
          existingSubmission={gameState.submissions[`${activeTeam.id}_${selectedQuest.id}`]}
          lang={lang}
          onClose={() => setSelectedQuest(null)}
          onSubmit={(subData) => {
            onSubmitQuest(selectedQuest.id, activeTeam.id, subData);
            if (selectedQuest.type !== 'qr_scan') {
              setSelectedQuest(null);
            }
          }}
        />
      )}

      {/* Field QR Scanner Modal */}
      {isQrScannerOpen && (
        <FieldQrScannerModal
          questions={gameState.questions || []}
          lang={lang}
          onClose={() => setIsQrScannerOpen(false)}
          onScanSuccess={(scannedQuestion, fs) => {
            setIsQrScannerOpen(false);
            setMediaModalInfo({ question: scannedQuestion, fieldSpot: fs });
            // If QR scan task, auto-submit the code
            if (scannedQuestion.type === 'qr_scan') {
              onSubmitQuest(scannedQuestion.id, activeTeam.id, {
                status: 'correct',
                scoreEarned: scannedQuestion.points,
                answerData: { decodedCode: fs.spotCode || scannedQuestion.id }
              });
            }
          }}
        />
      )}

      {/* Task QR Code Generator & Placard Modal */}
      {qrModalTask && (
        <TaskQrCodeModal
          question={qrModalTask}
          lang={lang}
          onClose={() => setQrModalTask(null)}
          onTriggerMedia={(q, fs) => {
            setQrModalTask(null);
            setMediaModalInfo({ question: q, fieldSpot: fs });
          }}
        />
      )}

      {/* Clean Field Media Playback Modal */}
      {mediaModalInfo && (
        <FieldMediaPlaybackModal
          question={mediaModalInfo.question}
          fieldSpot={mediaModalInfo.fieldSpot}
          lang={lang}
          activeTeam={activeTeam}
          isTaskCompleted={Boolean(gameState.submissions[`${activeTeam.id}_${mediaModalInfo.question.id}`])}
          onClose={() => setMediaModalInfo(null)}
          onSolveTask={(q) => {
            setMediaModalInfo(null);
            setSelectedQuest(q);
          }}
        />
      )}
    </div>
  );
};
