import React, { useState } from 'react';
import { CheckCircle2, Clock, Award, HelpCircle, Camera, Puzzle, QrCode, SplitSquareVertical, Lock, Target, Edit3, Film, Search } from 'lucide-react';
import { Team, Question, Submission, Language } from '../types/game';
import { translations } from '../locales/translations';
import { getTeamOrderedQuestions, isTeamSequentialProgression } from '../utils/questOrder';

interface Props {
  team: Team;
  questions: Question[];
  submissions: Record<string, Submission>;
  lang: Language;
  onOpenQuest: (question: Question, team: Team) => void;
  isInteractive?: boolean;
  teamQuestionOrders?: Record<string, string[]>;
  teamSequentialModes?: Record<string, boolean>;
  onEditTeam?: (team: Team) => void;
  onEditQuest?: (quest: Question, tab?: 'both' | 'en') => void;
}

export const TeamColumn: React.FC<Props> = ({
  team,
  questions,
  submissions,
  lang,
  onOpenQuest,
  isInteractive = true,
  teamQuestionOrders,
  teamSequentialModes,
  onEditTeam,
  onEditQuest
}) => {
  const t = translations[lang];

  // Filter & sort questions in custom team order, with inactive questions grouped at the bottom
  const allTeamQuestions = getTeamOrderedQuestions(
    team,
    questions || [],
    teamQuestionOrders,
    true
  );

  const safeSubmissions = submissions || {};
  const validTeamQuestions = (allTeamQuestions || []).filter((q) => q && q.id);
  const activeQuestions = validTeamQuestions.filter((q) => q.isActive !== false);
  const inactiveQuestions = validTeamQuestions.filter((q) => q.isActive === false);

  const isSequential = isTeamSequentialProgression(team, teamSequentialModes);

  // Find index of first unfinished quest if sequential mode is active
  const firstUnfinishedIndex = isSequential
    ? activeQuestions.findIndex((q) => !safeSubmissions[`${team.id}_${q.id}`])
    : -1;

  // Progressive rendering / pagination: render initial batch of 8 quests for optimal memory & FPS
  const PAGE_SIZE = 8;
  const [displayLimit, setDisplayLimit] = useState<number>(() => {
    if (firstUnfinishedIndex >= PAGE_SIZE) {
      return firstUnfinishedIndex + 4;
    }
    return PAGE_SIZE;
  });

  const displayedActiveQuestions = activeQuestions.slice(0, displayLimit);
  const remainingCount = Math.max(0, activeQuestions.length - displayLimit);

  // Calculate team score & progress based on active questions
  const teamSubmissions = activeQuestions.map(q => safeSubmissions[`${team.id}_${q.id}`]).filter(Boolean);
  const completedCount = teamSubmissions.length;
  const totalScore = teamSubmissions.reduce((sum, s) => sum + (s?.scoreEarned || 0), 0);
  const progressPercent = activeQuestions.length > 0 ? (completedCount / activeQuestions.length) * 100 : 0;

  const getQuestIcon = (type?: Question['type']) => {
    switch (type) {
      case 'multiple_choice':
      case 'true_false':
        return <HelpCircle className="w-3.5 h-3.5 text-amber-400" />;
      case 'text_match':
      case 'image_match':
        return <SplitSquareVertical className="w-3.5 h-3.5 text-cyan-400" />;
      case 'qr_scan':
        return <QrCode className="w-3.5 h-3.5 text-purple-400" />;
      case 'photo_upload':
        return <Camera className="w-3.5 h-3.5 text-emerald-400" />;
      case 'puzzle':
        return <Puzzle className="w-3.5 h-3.5 text-rose-400" />;
      case 'task':
        return <Target className="w-3.5 h-3.5 text-amber-400" />;
      case 'research':
        return <Search className="w-3.5 h-3.5 text-teal-400" />;
      default:
        return <Award className="w-3.5 h-3.5 text-slate-400" />;
    }
  };

  return (
    <div className="flex flex-col w-80 sm:w-88 shrink-0 bg-slate-900/90 border border-slate-800 rounded-2xl overflow-hidden shadow-xl max-h-[calc(100vh-12rem)]">
      {/* Column Header */}
      <div
        className="p-4 border-b border-slate-800 relative bg-slate-950/60"
        style={{ borderTop: `4px solid ${team.color}` }}
      >
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2.5 min-w-0">
            <span className="text-xl shrink-0 p-1 bg-slate-900 rounded-lg border border-slate-800">
              {team.avatar}
            </span>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5">
                <h3 className="font-bold text-sm text-slate-100 truncate" title={team.name}>
                  {team.name}
                </h3>
                {onEditTeam && (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onEditTeam(team);
                    }}
                    className="p-1 rounded-md text-slate-400 hover:text-amber-400 hover:bg-slate-800 transition-colors cursor-pointer shrink-0"
                    title={lang === 'el' ? 'Αλλαγή ονόματος & στοιχείων ομάδας' : 'Edit team name and details'}
                  >
                    <Edit3 className="w-3 h-3" />
                  </button>
                )}
              </div>
              {team.slogan && (
                <p className="text-[11px] text-slate-400 truncate italic">
                  {team.slogan}
                </p>
              )}
            </div>
          </div>

          <div className="text-right shrink-0">
            <div className="text-xs font-mono font-bold text-amber-400">
              {totalScore} <span className="text-[10px] text-slate-400">{t.pts}</span>
            </div>
            <div className="text-[10px] text-slate-500 font-mono">
              {completedCount}/{activeQuestions.length}
            </div>
          </div>
        </div>

        {/* Mini progress bar */}
        <div className="w-full bg-slate-800 h-1 rounded-full overflow-hidden mt-3">
          <div
            className="h-full transition-all duration-300"
            style={{ width: `${progressPercent}%`, backgroundColor: team.color }}
          />
        </div>
      </div>

      {/* Cards List (Padlet board scrollable body) */}
      <div className="p-3 space-y-3 overflow-y-auto flex-1 no-scrollbar">
        {activeQuestions.length === 0 && inactiveQuestions.length === 0 && (
          <div className="p-6 text-center text-xs text-slate-500 italic">
            {lang === 'el' ? 'Δεν υπάρχουν αποστολές για αυτή την ομάδα' : 'No quests assigned to this team'}
          </div>
        )}

        {/* 1. ACTIVE QUESTIONS ON TOP */}
        {displayedActiveQuestions.map((quest, index) => {
          const submission = safeSubmissions[`${team.id}_${quest.id}`];
          const isDone = !!submission;
          const isCorrect = submission?.status === 'correct' || submission?.status === 'completed';
          const isLocked = isSequential && firstUnfinishedIndex >= 0 && index > firstUnfinishedIndex;
          const isCurrent = isSequential && index === firstUnfinishedIndex;

          return (
            <div
              key={quest.id}
              onClick={() => onOpenQuest(quest, team)}
              className={`group p-3.5 rounded-xl border transition-all text-left relative cursor-pointer ${
                isLocked
                  ? 'bg-slate-950/60 border-slate-800/60 opacity-65 hover:opacity-85 hover:border-slate-700'
                  : isDone
                  ? isCorrect
                    ? 'bg-slate-950/80 border-emerald-900/60 hover:border-emerald-700/80 shadow-xs'
                    : 'bg-slate-950/80 border-rose-900/60 hover:border-rose-700/80 shadow-xs'
                  : isCurrent
                  ? 'bg-slate-950/90 border-amber-500/70 shadow-md ring-1 ring-amber-500/30'
                  : 'bg-slate-950/50 border-slate-800/80 hover:border-slate-700 hover:bg-slate-950/90 shadow-sm'
              }`}
            >
              {/* Type tag, Step number & Points */}
              <div className="flex items-center justify-between text-[11px] mb-1.5 text-slate-400">
                <div className="flex items-center gap-1.5 font-medium">
                  <span
                    className={`w-4 h-4 rounded text-[10px] font-mono flex items-center justify-center font-bold ${
                      isDone
                        ? 'bg-emerald-950 text-emerald-400'
                        : isCurrent
                        ? 'bg-amber-500 text-slate-950'
                        : 'bg-slate-800 text-slate-400'
                    }`}
                  >
                    #{index + 1}
                  </span>
                  {isLocked && <Lock className="w-3 h-3 text-amber-400/90" />}
                  {getQuestIcon(quest.type)}
                  <span className="truncate max-w-[120px]">{t[quest.type] || quest.type || 'Quest'}</span>
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  {onEditQuest && (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onEditQuest(quest, 'en');
                      }}
                      className="px-1.5 py-0.5 rounded-md bg-sky-950/80 hover:bg-sky-900 border border-sky-500/40 text-sky-300 text-[10px] font-bold transition-all cursor-pointer"
                      title={lang === 'el' ? '🇬🇧 Τελικό editing Αγγλικής έκδοσης' : '🇬🇧 Final edit English version'}
                    >
                      🇬🇧 EN
                    </button>
                  )}
                  {onEditQuest && (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onEditQuest(quest, 'both');
                      }}
                      className="p-1 rounded-md text-slate-400 hover:text-amber-400 hover:bg-slate-800 transition-colors cursor-pointer"
                      title={lang === 'el' ? 'Επεξεργασία δραστηριότητας' : 'Edit quest'}
                    >
                      <Edit3 className="w-3 h-3" />
                    </button>
                  )}
                  <span className="font-mono font-semibold text-amber-400">
                    {isDone ? `+${submission.scoreEarned}` : `${quest.points}`} {t.pts}
                  </span>
                </div>
              </div>

              {/* Title */}
              <h4 className="text-xs font-semibold text-slate-200 leading-snug line-clamp-2 mb-2 group-hover:text-amber-300 transition-colors">
                {quest.title}
              </h4>

              {/* Photo preview if photo mission submitted */}
              {submission?.photoUrl && (
                <div className="mb-2.5 rounded-lg overflow-hidden border border-slate-800 max-h-32 bg-slate-900 flex items-center justify-center">
                  <img
                    src={submission.photoUrl}
                    alt="Team mission photo"
                    className="w-full h-28 object-cover group-hover:scale-105 transition-transform duration-300"
                    referrerPolicy="no-referrer"
                  />
                </div>
              )}

              {/* Quest video or photo preview if provided in question */}
              {!submission?.photoUrl && quest.videoUrl && (
                <div className="mb-2.5 rounded-lg overflow-hidden border border-purple-500/40 bg-purple-950/60 p-2 flex items-center gap-2 text-purple-300">
                  <Film className="w-4 h-4 text-purple-400 shrink-0" />
                  <span className="font-semibold text-[11px] truncate">
                    {lang === 'el' ? '🎥 Περιλαμβάνει Βίντεο' : '🎥 Includes Video'}
                  </span>
                </div>
              )}

              {!submission?.photoUrl && !quest.videoUrl && quest.imageUrl && (
                <div className="mb-2.5 rounded-lg overflow-hidden border border-slate-800 max-h-24 bg-slate-900 flex items-center justify-center">
                  <img
                    src={quest.imageUrl}
                    alt="Quest asset"
                    className="w-full h-20 object-cover opacity-80 group-hover:opacity-100 transition-opacity"
                    referrerPolicy="no-referrer"
                  />
                </div>
              )}

              {/* Puzzle stats preview */}
              {submission?.puzzleStats && (
                <div className="mb-2 text-[10px] text-slate-400 font-mono bg-slate-900/90 p-1.5 rounded-lg border border-slate-800 flex justify-between">
                  <span>{t.movesCount}: {submission.puzzleStats.moves}</span>
                  <span>{t.timeElapsed}: {submission.puzzleStats.durationSeconds}s</span>
                </div>
              )}

              {/* Status Footer */}
              <div className="flex items-center justify-between pt-1 border-t border-slate-800/60 text-[11px]">
                {isDone ? (
                  <div className={`flex items-center gap-1 font-semibold ${
                    isCorrect ? 'text-emerald-400' : 'text-rose-400'
                  }`}>
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>{isCorrect ? t.statusCompleted : t.statusIncorrect}</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-1 text-slate-500 font-medium">
                    <Clock className="w-3.5 h-3.5" />
                    <span>{t.statusPending}</span>
                  </div>
                )}

                {isInteractive && (
                  <span className="text-[10px] font-semibold text-slate-400 group-hover:text-amber-400 transition-colors">
                    {isDone ? t.viewSubmission : t.solveNow} →
                  </span>
                )}
              </div>
            </div>
          );
        })}

        {/* Pagination / Progressive Loading Controls */}
        {remainingCount > 0 && (
          <div className="pt-2 flex items-center gap-2">
            <button
              type="button"
              onClick={() => setDisplayLimit((prev) => prev + PAGE_SIZE)}
              className="flex-1 py-2 px-3 rounded-xl bg-slate-800/90 hover:bg-slate-700/90 border border-slate-700/80 text-amber-300 hover:text-amber-200 text-xs font-semibold flex items-center justify-center gap-1.5 transition-all shadow-xs cursor-pointer active:scale-98"
            >
              <span>{lang === 'el' ? `+ Προβολή επόμενων ${Math.min(PAGE_SIZE, remainingCount)} (${remainingCount} απομένουν)` : `+ Show next ${Math.min(PAGE_SIZE, remainingCount)} (${remainingCount} left)`}</span>
            </button>
            <button
              type="button"
              onClick={() => setDisplayLimit(activeQuestions.length)}
              className="py-2 px-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-400 hover:text-slate-200 text-[11px] font-medium transition-all cursor-pointer"
              title={lang === 'el' ? 'Προβολή όλων των αποστολών' : 'Show all quests'}
            >
              <span>{lang === 'el' ? 'Όλες' : 'All'}</span>
            </button>
          </div>
        )}
        {displayLimit > PAGE_SIZE && activeQuestions.length > PAGE_SIZE && remainingCount === 0 && (
          <div className="pt-1 text-center">
            <button
              type="button"
              onClick={() => setDisplayLimit(PAGE_SIZE)}
              className="text-[11px] text-slate-500 hover:text-slate-400 underline cursor-pointer"
            >
              {lang === 'el' ? 'Σύμπτυξη σε 8 αποστολές' : 'Collapse to 8 quests'}
            </button>
          </div>
        )}

        {/* 2. INACTIVE QUESTIONS GROUPED AT THE BOTTOM */}
        {inactiveQuestions.length > 0 && (
          <div className="pt-3 mt-4 border-t-2 border-dashed border-slate-800/80 space-y-2.5">
            <div className="flex items-center justify-between px-1.5 py-1 rounded-lg bg-slate-950/60 border border-slate-800/80 text-[11px] font-semibold text-slate-400">
              <span className="flex items-center gap-1.5">
                <span>💤</span>
                <span>{lang === 'el' ? 'Ανενεργές Ερωτήσεις (Στο κάτω μέρος)' : 'Inactive Quests (At bottom)'}</span>
              </span>
              <span className="font-mono text-[10px] px-1.5 py-0.5 rounded bg-slate-900 border border-slate-800 text-slate-400 font-bold">
                {inactiveQuestions.length}
              </span>
            </div>

            {inactiveQuestions.map((quest) => {
              const submission = safeSubmissions[`${team.id}_${quest.id}`];

              return (
                <div
                  key={quest.id}
                  onClick={() => onOpenQuest(quest, team)}
                  className="group p-3 rounded-xl border border-dashed border-slate-800/80 bg-slate-950/40 opacity-70 hover:opacity-100 hover:border-slate-700 transition-all text-left relative cursor-pointer"
                >
                  <div className="flex items-center justify-between text-[11px] mb-1 text-slate-500">
                    <div className="flex items-center gap-1.5 font-medium">
                      <span className="w-4 h-4 rounded text-[10px] font-mono flex items-center justify-center bg-slate-900 text-slate-500">
                        💤
                      </span>
                      {getQuestIcon(quest.type)}
                      <span className="truncate max-w-[120px]">{t[quest.type] || quest.type || 'Quest'}</span>
                      <span className="text-[9px] px-1 rounded bg-slate-900 border border-slate-800 text-slate-500 font-bold">
                        {lang === 'el' ? 'ΑΝΕΝΕΡΓΗ' : 'INACTIVE'}
                      </span>
                    </div>
                    <div className="flex items-center gap-1 shrink-0">
                      {onEditQuest && (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            onEditQuest(quest, 'both');
                          }}
                          className="p-1 rounded-md text-slate-400 hover:text-amber-400 hover:bg-slate-800 transition-colors cursor-pointer"
                          title={lang === 'el' ? 'Επεξεργασία δραστηριότητας' : 'Edit quest'}
                        >
                          <Edit3 className="w-3 h-3" />
                        </button>
                      )}
                      <span className="font-mono text-slate-500">
                        {quest.points} {t.pts}
                      </span>
                    </div>
                  </div>

                  <h4 className="text-xs font-semibold text-slate-400 leading-snug line-clamp-1 group-hover:text-slate-200 transition-colors">
                    {quest.title}
                  </h4>

                  <div className="flex items-center justify-between pt-1 mt-1 border-t border-slate-900 text-[10px] text-slate-500">
                    <span>{lang === 'el' ? 'Κλικ για προβολή ή επεξεργασία' : 'Click to view or edit'}</span>
                    {submission && (
                      <span className="text-emerald-500 font-medium">✓ {lang === 'el' ? 'Επιλύθηκε' : 'Solved'}</span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
