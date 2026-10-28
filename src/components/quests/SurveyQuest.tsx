import React, { useState } from 'react';
import {
  Vote,
  BarChart3,
  CheckCircle2,
  MessageSquare,
  Send,
  Check,
  Sparkles,
  RotateCcw,
  Sliders,
  Users
} from 'lucide-react';
import { Question, SurveyPayload, Submission } from '../../types/game';
import { sound } from '../../services/sound';

interface Props {
  question: Question;
  existingSubmission?: Submission;
  lang: 'el' | 'en';
  onSubmit: (data: {
    selectedIndices: number[];
    selectedOptions: string[];
    selectedOptions_en: string[];
    reason?: string;
    isCorrect: boolean;
    points: number;
  }) => void;
  readOnly?: boolean;
}

export const SurveyQuest: React.FC<Props> = ({
  question,
  existingSubmission,
  lang,
  onSubmit,
  readOnly = false
}) => {
  const isEn = lang === 'en';
  const payload = (question.payload as SurveyPayload) || { options: [] };
  const rawOptionsEl = Array.isArray(payload.options) ? payload.options : [];
  const rawOptionsEn = (Array.isArray(payload.options_en) && payload.options_en.length > 0)
    ? payload.options_en
    : rawOptionsEl;

  const displayOptions = isEn ? rawOptionsEn : rawOptionsEl;
  const allowMultiple = Boolean(payload.allowMultiple);
  const allowReason = payload.allowCustomReason !== false; // enabled by default for student expression

  // Initial State from previous submission
  const [selectedIndices, setSelectedIndices] = useState<number[]>(() => {
    if (existingSubmission?.answerData?.selectedIndices) {
      return existingSubmission.answerData.selectedIndices;
    }
    if (typeof existingSubmission?.answerData?.selectedIndex === 'number') {
      return [existingSubmission.answerData.selectedIndex];
    }
    return [];
  });

  const [reasonText, setReasonText] = useState<string>(() => {
    return existingSubmission?.answerData?.reason || existingSubmission?.reflectionText || '';
  });

  const [hasVoted, setHasVoted] = useState<boolean>(() => Boolean(existingSubmission));
  const [showResults, setShowResults] = useState<boolean>(() => Boolean(existingSubmission));

  const handleToggleOption = (idx: number) => {
    if (readOnly || hasVoted) return;
    if (allowMultiple) {
      setSelectedIndices((prev) =>
        prev.includes(idx) ? prev.filter((i) => i !== idx) : [...prev, idx].sort((a, b) => a - b)
      );
    } else {
      setSelectedIndices([idx]);
    }
  };

  const handleSubmitVote = () => {
    if (selectedIndices.length === 0 || readOnly) return;

    const chosenEl = selectedIndices.map((i) => rawOptionsEl[i] || `Επιλογή ${i + 1}`);
    const chosenEn = selectedIndices.map((i) => rawOptionsEn[i] || rawOptionsEl[i] || `Choice ${i + 1}`);

    try {
      sound.playSuccess();
    } catch {
      // Audio fallback
    }

    setHasVoted(true);
    setShowResults(true);

    onSubmit({
      selectedIndices,
      selectedOptions: chosenEl,
      selectedOptions_en: chosenEn,
      reason: reasonText.trim() || undefined,
      isCorrect: true,
      points: question.points || 100
    });
  };

  const handleModifyVote = () => {
    if (readOnly) return;
    setHasVoted(false);
  };

  // Mock baseline votes to create a lively classroom consensus chart
  // The team's vote is dynamically integrated
  const baselineTallies = React.useMemo(() => {
    return displayOptions.map((_, idx) => {
      // Deterministic synthetic baseline distribution derived from question id and index
      const seed = (question.id.charCodeAt(Math.min(idx, question.id.length - 1)) + idx * 7) % 15 + 4;
      return seed;
    });
  }, [question.id, displayOptions]);

  const totalVotesCount = React.useMemo(() => {
    const baseTotal = baselineTallies.reduce((a, b) => a + b, 0);
    return baseTotal + (selectedIndices.length > 0 ? selectedIndices.length : 0);
  }, [baselineTallies, selectedIndices]);

  const description = isEn
    ? question.description_en || question.description
    : question.description;

  const reasonPrompt = isEn
    ? payload.reasonPrompt_en || payload.reasonPrompt || 'Explain the reasoning behind your team’s choice:'
    : payload.reasonPrompt || 'Αιτιολογήστε την επιλογή της ομάδας σας (π.χ. ποια επιχειρήματα σας οδήγησαν εδώ):';

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Survey Title & Badge Header */}
      <div className="p-4 rounded-2xl bg-gradient-to-r from-cyan-950/40 via-slate-900 to-indigo-950/40 border border-cyan-500/30 space-y-2">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 text-cyan-300 border border-cyan-500/30 text-xs font-bold">
            <Vote className="w-3.5 h-3.5 text-cyan-400" />
            <span>{isEn ? 'Opinion Poll & Team Consensus' : 'Δημοσκόπηση & Έρευνα Γνώμης'}</span>
          </div>
          <span className="text-xs text-slate-400 font-medium">
            {allowMultiple
              ? (isEn ? 'Multiple choices allowed' : 'Επιτρέπονται πολλαπλές επιλογές')
              : (isEn ? 'Select one primary choice' : 'Επιλέξτε μία κύρια απάντηση')}
          </span>
        </div>
        <p className="text-sm sm:text-base font-semibold text-slate-100 leading-relaxed">
          {description}
        </p>
      </div>

      {/* Choice Options List */}
      <div className="space-y-3">
        <label className="text-xs font-bold uppercase tracking-wider text-slate-400 block">
          {isEn ? 'Available Options / Proposals:' : 'Διαθέσιμες Προτάσεις / Επιλογές:'}
        </label>

        <div className="grid grid-cols-1 gap-3">
          {displayOptions.map((optText, idx) => {
            const isSelected = selectedIndices.includes(idx);
            const letter = String.fromCharCode(65 + idx); // A, B, C, D...

            // Compute vote percentage for live results
            const optionVotes = baselineTallies[idx] + (isSelected ? 1 : 0);
            const pct = totalVotesCount > 0 ? Math.round((optionVotes / totalVotesCount) * 100) : 0;

            return (
              <div
                key={idx}
                onClick={() => handleToggleOption(idx)}
                className={`p-4 rounded-2xl border-2 transition-all select-none ${
                  readOnly || hasVoted ? 'cursor-default' : 'cursor-pointer hover:border-cyan-400/80 active:scale-[0.99]'
                } ${
                  isSelected
                    ? 'bg-cyan-950/50 border-cyan-400 shadow-lg shadow-cyan-500/10 ring-1 ring-cyan-400/40'
                    : 'bg-slate-900/80 border-slate-800 hover:bg-slate-900'
                }`}
              >
                <div className="flex items-start gap-3.5">
                  {/* Option Badge / Indicator */}
                  <div
                    className={`w-8 h-8 rounded-xl font-black text-xs flex items-center justify-center shrink-0 transition-all ${
                      isSelected
                        ? 'bg-cyan-400 text-slate-950 shadow-md scale-105'
                        : 'bg-slate-800 text-slate-300 border border-slate-700'
                    }`}
                  >
                    {isSelected ? <Check className="w-4 h-4 stroke-[3]" /> : letter}
                  </div>

                  {/* Option Text */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <span className={`text-sm sm:text-base font-bold leading-snug ${isSelected ? 'text-white' : 'text-slate-200'}`}>
                        {optText}
                      </span>
                      {isSelected && (
                        <span className="px-2 py-0.5 rounded-full bg-cyan-400/20 text-cyan-300 border border-cyan-400/30 text-[10px] font-black uppercase tracking-wider shrink-0">
                          {isEn ? 'Your Vote' : 'Ψήφος Ομάδας'}
                        </span>
                      )}
                    </div>

                    {/* Live Results Bar Graph (shown when poll is submitted or in results mode) */}
                    {showResults && (
                      <div className="mt-3 pt-2.5 border-t border-slate-800/80 space-y-1.5 animate-in fade-in">
                        <div className="flex items-center justify-between text-xs text-slate-400">
                          <span className="font-semibold text-slate-300">
                            {optionVotes} {isEn ? 'votes' : 'ψήφοι'}
                          </span>
                          <span className="font-mono font-bold text-cyan-400">{pct}%</span>
                        </div>
                        <div className="h-2 rounded-full bg-slate-950 overflow-hidden border border-slate-800">
                          <div
                            style={{ width: `${pct}%` }}
                            className={`h-full rounded-full transition-all duration-700 ${
                              isSelected
                                ? 'bg-gradient-to-r from-cyan-400 to-emerald-400 shadow-sm'
                                : 'bg-slate-700'
                            }`}
                          />
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Team Reasoning / Justification Area */}
      {allowReason && (
        <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-2">
          <label className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
            <MessageSquare className="w-3.5 h-3.5 text-cyan-400" />
            <span>{reasonPrompt}</span>
          </label>
          {hasVoted ? (
            reasonText.trim() ? (
              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-xs sm:text-sm text-slate-200 italic leading-relaxed">
                «{reasonText.trim()}»
              </div>
            ) : (
              <p className="text-xs text-slate-500 italic">
                {isEn ? '(No reasoning text provided)' : '(Δεν καταγράφηκε γραπτή αιτιολόγηση)'}
              </p>
            )
          ) : (
            <textarea
              rows={3}
              disabled={readOnly}
              value={reasonText}
              onChange={(e) => setReasonText(e.target.value)}
              placeholder={
                isEn
                  ? 'Write your team’s arguments and thoughts on this choice...'
                  : 'Γράψτε τα επιχειρήματα και τις σκέψεις της ομάδας σας για την επιλογή αυτή...'
              }
              className="w-full bg-slate-950 border border-slate-700 focus:border-cyan-400 rounded-xl p-3 text-xs sm:text-sm text-white placeholder-slate-500 leading-relaxed outline-none transition-colors"
            />
          )}
        </div>
      )}

      {/* Action Controls */}
      <div className="pt-2 flex items-center justify-between gap-3 flex-wrap">
        {hasVoted ? (
          <div className="flex items-center justify-between w-full flex-wrap gap-3">
            <div className="flex items-center gap-2">
              <span className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              </span>
              <div>
                <div className="text-xs font-black text-emerald-400">
                  {isEn ? 'Vote Successfully Logged!' : 'Η ψήφος καταγράφηκε επιτυχώς!'}
                </div>
                <div className="text-[11px] text-slate-400">
                  +{question.points || 100} {isEn ? 'points earned' : 'πόντοι απονεμήθηκαν στην ομάδα'}
                </div>
              </div>
            </div>

            {!readOnly && (
              <button
                type="button"
                onClick={handleModifyVote}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer active:scale-95"
              >
                <RotateCcw className="w-3.5 h-3.5 text-cyan-400" />
                <span>{isEn ? 'Change Vote' : 'Τροποποίηση Ψήφου'}</span>
              </button>
            )}
          </div>
        ) : (
          <div className="flex items-center justify-between w-full flex-wrap gap-3">
            <span className="text-xs text-slate-400">
              {selectedIndices.length === 0
                ? (isEn ? 'Select an option to vote' : 'Επιλέξτε μία πρόταση για να ψηφίσετε')
                : (isEn ? `${selectedIndices.length} option(s) selected` : `${selectedIndices.length} επιλογή(ές) επιλέχθηκαν`)}
            </span>

            <button
              type="button"
              disabled={selectedIndices.length === 0 || readOnly}
              onClick={handleSubmitVote}
              className="px-6 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 disabled:opacity-30 disabled:pointer-events-none text-slate-950 font-black text-xs sm:text-sm flex items-center gap-2 shadow-lg shadow-cyan-500/20 transition-all cursor-pointer active:scale-95"
            >
              <Send className="w-4 h-4" />
              <span>{isEn ? 'Submit Team Vote' : 'Καταχώριση Ψήφου Ομάδας'}</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
