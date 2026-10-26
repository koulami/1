import React, { useState, useEffect } from 'react';
import {
  Trash2, RotateCcw, Plus, Edit3, QrCode, Printer, CheckCircle2,
  AlertTriangle, Users, Award, ShieldAlert, Sparkles, Download, Upload,
  Image as ImageIcon, Power, Eye, EyeOff, Check, ArrowLeft,
  ArrowUp, ArrowDown, Shuffle, Lock, Unlock, Copy, Layers, Filter, Undo2, ShieldCheck,
  Loader2, Github, Camera, Film, ChevronLeft, ChevronRight
} from 'lucide-react';
import { GameState, Language, Question, Team, QuestionType, GamePhase } from '../types/game';
import { translations } from '../locales/translations';
import { TimerBar } from './TimerBar';
import { QuestionEditorModal } from './QuestionEditorModal';
import { TeamQuestSequenceManager } from './TeamQuestSequenceManager';
import { TeamEditorModal } from './TeamEditorModal';
import { getTeamOrderedQuestions, isTeamSequentialProgression } from '../utils/questOrder';
import { syncService, GameSnapshot } from '../services/storage';
import { ScannableQrImage } from './ScannableQrImage';
import { translateGreekToEnglish } from '../utils/translator';

interface Props {
  gameState: GameState;
  lang: Language;
  onLanguageChange?: (lang: Language) => void;
  onResetAllSubmissions: () => void;
  onResetTeamSubmissions: (teamId: string) => void;
  onStartTimer: () => void;
  onPauseTimer: () => void;
  onResetTimer: () => void;
  onSetTimerDuration: (seconds: number) => void;
  onAddQuestion: (q: Question) => void;
  onUpdateQuestion: (q: Question) => void;
  onDeleteQuestion: (qId: string) => void;
  onToggleQuestionActive: (qId: string) => void;
  onAddTeam: (team: Team) => void;
  onUpdateTeam: (team: Team) => void;
  onDeleteTeam: (teamId: string) => void;
  onSetPhase: (phase: GamePhase) => void;
  onSetSynthesisPrompt: (prompt: string, promptEn?: string) => void;
  onOpenJoinQr: () => void;
  onSetTeamQuestionOrder: (teamId: string, questionIds: string[]) => void;
  onSetTeamSequentialMode: (teamId: string, isSequential: boolean) => void;
  onApplyOrderToAllTeams: (questionIds: string[]) => void;
  onApplyStationRotation: () => void;
  canUndo?: boolean;
  onUndo?: () => void;
  onRestoreBackup?: (backupState: GameState) => void;
  onRestoreDefaultQuests?: () => void;
  onLoadPreset?: (preset: 'epic_challenge' | 'vultures' | 'combined') => void;
  onBulkAutoTranslate?: () => void;
  onOpenGitHubSync?: () => void;
  onOpenPrintPdf?: () => void;
  onClose?: () => void;
}

export const AdminPanel: React.FC<Props> = ({
  gameState,
  lang,
  onLanguageChange,
  onResetAllSubmissions,
  onResetTeamSubmissions,
  onStartTimer,
  onPauseTimer,
  onResetTimer,
  onSetTimerDuration,
  onAddQuestion,
  onUpdateQuestion,
  onDeleteQuestion,
  onToggleQuestionActive,
  onAddTeam,
  onUpdateTeam,
  onDeleteTeam,
  onSetPhase,
  onSetSynthesisPrompt,
  onOpenJoinQr,
  onSetTeamQuestionOrder,
  onSetTeamSequentialMode,
  onApplyOrderToAllTeams,
  onApplyStationRotation,
  canUndo,
  onUndo,
  onRestoreBackup,
  onRestoreDefaultQuests,
  onLoadPreset,
  onBulkAutoTranslate,
  onOpenGitHubSync,
  onOpenPrintPdf,
  onClose
}) => {
  const t = translations[lang];

  const [confirmResetAll, setConfirmResetAll] = useState<boolean>(false);
  const [selectedTeamToReset, setSelectedTeamToReset] = useState<string>('');
  const [resetNotification, setResetNotification] = useState<string | null>(null);
  const [editingQuestion, setEditingQuestion] = useState<Question | null | 'new'>(null);
  const [editorInitialTab, setEditorInitialTab] = useState<'both' | 'el' | 'en'>('both');
  const [isBulkTranslating, setIsBulkTranslating] = useState<boolean>(false);
  const [showQrPrintModal, setShowQrPrintModal] = useState<boolean>(false);
  const [editingTeam, setEditingTeam] = useState<Team | null | 'new'>(null);
  const [promptText, setPromptText] = useState<string>(gameState.synthesisPrompt || '');
  const [promptTextEn, setPromptTextEn] = useState<string>(gameState.synthesisPrompt_en || '');
  const [selectedTeamTab, setSelectedTeamTab] = useState<string>(gameState.teams[0]?.id || 'all');
  const [showHistoryModal, setShowHistoryModal] = useState<boolean>(false);
  const [snapshots, setSnapshots] = useState<GameSnapshot[]>(() => syncService.getSnapshots());
  const [newCheckpointName, setNewCheckpointName] = useState<string>('');
  const [isSavingCheckpoint, setIsSavingCheckpoint] = useState<boolean>(false);
  const [isManualSaving, setIsManualSaving] = useState<boolean>(false);
  const [justSaved, setJustSaved] = useState<boolean>(false);
  const [allQuestionsPage, setAllQuestionsPage] = useState<number>(1);
  const allQuestionsPageSize = 10;

  // Subscribe to real-time snapshot changes from storage/IndexedDB
  useEffect(() => {
    setSnapshots(syncService.getSnapshots());
    const unsub = syncService.onSnapshotsChange((updated) => {
      setSnapshots(updated);
    });
    return unsub;
  }, []);

  const handleCreateManualCheckpoint = (customLabel?: string) => {
    setIsSavingCheckpoint(true);
    const labelToUse = (customLabel || newCheckpointName).trim() || undefined;
    const success = syncService.createManualCheckpoint(gameState, labelToUse);
    setNewCheckpointName('');
    setIsSavingCheckpoint(false);
    setSnapshots(syncService.getSnapshots());

    if (success) {
      setResetNotification(
        lang === 'el'
          ? `✓ Το Checkpoint «${labelToUse || 'Νέο Checkpoint'}» αποθηκεύτηκε επιτυχώς!`
          : `✓ Checkpoint "${labelToUse || 'New Checkpoint'}" created successfully!`
      );
    } else {
      setResetNotification(
        lang === 'el'
          ? '⚠️ Σφάλμα κατά τη δημιουργία σημείου επαναφοράς.'
          : '⚠️ Could not create checkpoint.'
      );
    }
    setTimeout(() => setResetNotification(null), 3500);
  };

  const handleDeleteSnapshot = (timestamp: number) => {
    syncService.deleteSnapshot(timestamp);
    setSnapshots(syncService.getSnapshots());
    setResetNotification(
      lang === 'el' ? '✓ Το σημείο επαναφοράς διαγράφηκε.' : '✓ Checkpoint deleted.'
    );
    setTimeout(() => setResetNotification(null), 2500);
  };

  const handleClearAllSnapshots = () => {
    if (window.confirm(lang === 'el' ? 'Είστε σίγουροι ότι θέλετε να διαγράψετε όλα τα αποθηκευμένα checkpoints;' : 'Are you sure you want to clear all checkpoints?')) {
      syncService.clearAllSnapshots();
      setSnapshots([]);
      setResetNotification(
        lang === 'el' ? '✓ Όλα τα σημεία επαναφοράς διαγράφηκαν.' : '✓ All checkpoints cleared.'
      );
      setTimeout(() => setResetNotification(null), 2500);
    }
  };

  const handleExecuteResetAll = () => {
    onResetAllSubmissions();
    setConfirmResetAll(false);
    setResetNotification(t.clearSuccess);
    setTimeout(() => setResetNotification(null), 4000);
  };

  const handleExecuteResetTeam = () => {
    if (!selectedTeamToReset) return;
    onResetTeamSubmissions(selectedTeamToReset);
    setSelectedTeamToReset('');
    setResetNotification(t.clearSuccess);
    setTimeout(() => setResetNotification(null), 4000);
  };

  // Reorder an active question up/down for a specific team (within active items)
  const handleMoveActiveTeamQuestion = (teamId: string, index: number, direction: 'up' | 'down') => {
    const teamObj = gameState.teams.find((t) => t.id === teamId);
    if (!teamObj) return;
    const currentOrdered = getTeamOrderedQuestions(
      teamObj,
      gameState.questions,
      gameState.teamQuestionOrders,
      true
    );
    const activeQuests = currentOrdered.filter(q => q.isActive !== false);
    const inactiveQuests = currentOrdered.filter(q => q.isActive === false);

    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= activeQuests.length) return;

    const newActive = [...activeQuests];
    const temp = newActive[index];
    newActive[index] = newActive[targetIndex];
    newActive[targetIndex] = temp;

    const newFullOrder = [...newActive.map((q) => q.id), ...inactiveQuests.map((q) => q.id)];
    onSetTeamQuestionOrder(teamId, newFullOrder);
  };

  // Reorder an inactive question up/down for a specific team (within inactive items at the bottom)
  const handleMoveInactiveTeamQuestion = (teamId: string, index: number, direction: 'up' | 'down') => {
    const teamObj = gameState.teams.find((t) => t.id === teamId);
    if (!teamObj) return;
    const currentOrdered = getTeamOrderedQuestions(
      teamObj,
      gameState.questions,
      gameState.teamQuestionOrders,
      true
    );
    const activeQuests = currentOrdered.filter(q => q.isActive !== false);
    const inactiveQuests = currentOrdered.filter(q => q.isActive === false);

    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= inactiveQuests.length) return;

    const newInactive = [...inactiveQuests];
    const temp = newInactive[index];
    newInactive[index] = newInactive[targetIndex];
    newInactive[targetIndex] = temp;

    const newFullOrder = [...activeQuests.map((q) => q.id), ...newInactive.map((q) => q.id)];
    onSetTeamQuestionOrder(teamId, newFullOrder);
  };

  // Shuffle order for active questions of a specific team (keeping inactive at bottom)
  const handleShuffleTeam = (teamId: string) => {
    const teamObj = gameState.teams.find((t) => t.id === teamId);
    if (!teamObj) return;
    const currentOrdered = getTeamOrderedQuestions(
      teamObj,
      gameState.questions,
      gameState.teamQuestionOrders,
      true
    );
    const activeQuests = currentOrdered.filter(q => q.isActive !== false);
    const inactiveQuests = currentOrdered.filter(q => q.isActive === false);

    const ids = [...activeQuests.map((q) => q.id)];
    for (let i = ids.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [ids[i], ids[j]] = [ids[j], ids[i]];
    }
    const newFullOrder = [...ids, ...inactiveQuests.map((q) => q.id)];
    onSetTeamQuestionOrder(teamId, newFullOrder);
    setResetNotification(
      lang === 'el'
        ? `Η σειρά ενεργών δραστηριοτήτων για την ομάδα «${teamObj.name}» ανακατεύτηκε!`
        : `Active questions order shuffled for team «${teamObj.name}»!`
    );
    setTimeout(() => setResetNotification(null), 3500);
  };

  // Reset to default order for a specific team
  const handleResetTeamOrder = (teamId: string) => {
    const defaultIds = gameState.questions
      .filter((q) => {
        if (!q.assignedTeamIds || q.assignedTeamIds.length === 0) return true;
        return q.assignedTeamIds.includes(teamId);
      })
      .map((q) => q.id);
    onSetTeamQuestionOrder(teamId, defaultIds);
    setResetNotification(
      lang === 'el' ? 'Επαναφορά στην αρχική σειρά' : 'Reset to default order'
    );
    setTimeout(() => setResetNotification(null), 3500);
  };

  // Remove question from a specific team
  const handleRemoveQuestionFromTeam = (quest: Question, teamId: string) => {
    const isAll = !quest.assignedTeamIds || quest.assignedTeamIds.length === 0 || quest.assignedTeamIds.length === gameState.teams.length;
    if (isAll) {
      // It was assigned to all teams, now assign to all EXCEPT teamId
      const remainingTeamIds = gameState.teams.map((t) => t.id).filter((id) => id !== teamId);
      onUpdateQuestion({
        ...quest,
        assignedTeamIds: remainingTeamIds
      });
    } else {
      const remainingTeamIds = (quest.assignedTeamIds || []).filter((id) => id !== teamId);
      if (remainingTeamIds.length === 0) {
        // Only this team had it -> delete question
        onDeleteQuestion(quest.id);
      } else {
        onUpdateQuestion({
          ...quest,
          assignedTeamIds: remainingTeamIds
        });
      }
    }
  };

  // Explicit save all changes permanently to IndexedDB, localStorage, and snapshot
  const handleSaveAllChanges = () => {
    setIsManualSaving(true);
    syncService.saveState(gameState);
    syncService.createManualCheckpoint(
      gameState,
      lang === 'el' ? 'Μόνιμη Αποθήκευση' : 'Permanent Save'
    );
    setSnapshots(syncService.getSnapshots());
    setIsManualSaving(false);
    setJustSaved(true);
    setResetNotification(
      lang === 'el'
        ? '✓ Όλες οι αλλαγές, δραστηριότητες και ομάδες αποθηκεύτηκαν μόνιμα!'
        : '✓ All changes, quests, and teams permanently saved!'
    );
    setTimeout(() => setJustSaved(false), 3000);
    setTimeout(() => setResetNotification(null), 4000);
  };

  // Find QR code questions for print stations
  const qrQuestions = gameState.questions.filter(q => q.type === 'qr_scan');

  // Active team selection and derived data
  const activeTeam = gameState.teams.find((t) => t.id === selectedTeamTab);
  const teamQuestions = activeTeam
    ? getTeamOrderedQuestions(activeTeam, gameState.questions, gameState.teamQuestionOrders, true)
    : [];
  const activeTeamQuestions = teamQuestions.filter((q) => q.isActive !== false);
  const inactiveTeamQuestions = teamQuestions.filter((q) => q.isActive === false);
  const isSequential = activeTeam
    ? isTeamSequentialProgression(activeTeam, gameState.teamSequentialModes)
    : false;

  return (
    <div className="max-w-5xl mx-auto p-4 sm:p-6 space-y-8">
      {/* Title Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl">
        <div className="flex items-start sm:items-center gap-3">
          {onClose && (
            <button
              type="button"
              onClick={onClose}
              className="p-2 sm:px-3 sm:py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-amber-300 hover:text-amber-200 text-xs font-bold border border-slate-700 flex items-center gap-1.5 transition-colors cursor-pointer shrink-0"
              title={t.backToBoard}
            >
              <ArrowLeft className="w-4 h-4 text-amber-400" />
              <span className="hidden sm:inline">{t.backToBoard}</span>
            </button>
          )}
          <div>
            <h1 className="text-xl sm:text-2xl font-black text-slate-100 flex items-center gap-2.5">
              <span>{t.adminDashboard}</span>
            </h1>
            <p className="text-xs text-slate-400 mt-1 max-w-xl">
              {lang === 'el'
                ? 'Διαχειριστείτε πλήρως δραστηριότητες, ονόματα ομάδων, φωτογραφίες, ενεργοποίηση/απενεργοποίηση και χρονόμετρο.'
                : 'Full management for quest activities, team names, photos, enable/disable toggles, and countdown timer.'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {/* Undo Action Button */}
          {onUndo && (
            <button
              type="button"
              onClick={onUndo}
              disabled={!canUndo}
              className={`px-3 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                canUndo
                  ? 'bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/50 shadow-sm active:scale-95'
                  : 'bg-slate-800/50 text-slate-500 border border-slate-800 opacity-40 cursor-not-allowed'
              }`}
              title={canUndo ? t.undoLastChange : (lang === 'el' ? 'Δεν υπάρχει ενέργεια προς αναίρεση' : 'No action to undo')}
            >
              <Undo2 className="w-4 h-4" />
              <span>{t.undo}</span>
            </button>
          )}

          {/* Autosaved Indicator */}
          <div
            className="hidden sm:flex items-center gap-1.5 px-3 py-2 rounded-xl bg-emerald-950/60 border border-emerald-500/30 text-emerald-300 text-xs font-medium"
            title={lang === 'el' ? 'Αυτόματη αποθήκευση σε κάθε αλλαγή. Τα δεδομένα σας είναι πλήρως ασφαλή!' : 'Auto-saved on every change. Your data is protected!'}
          >
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
            <span>{t.autoSaved}</span>
          </div>

          {/* Explicit Permanent Save Button */}
          <button
            type="button"
            onClick={handleSaveAllChanges}
            disabled={isManualSaving}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-md transition-all cursor-pointer active:scale-95 ${
              justSaved
                ? 'bg-emerald-500 text-slate-950 shadow-emerald-500/25 ring-2 ring-emerald-400'
                : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-600/25 border border-emerald-400/40'
            }`}
            title={lang === 'el' ? 'Μόνιμη αποθήκευση όλων των αλλαγών και δημιουργία σημείου επαναφοράς' : 'Permanently save all changes and record restore checkpoint'}
          >
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>{justSaved ? (lang === 'el' ? '✓ Αποθηκεύτηκαν!' : '✓ Saved!') : (lang === 'el' ? '💾 Αποθήκευση' : '💾 Save All')}</span>
          </button>

          {/* GitHub Vultures Sync & Restore Button */}
          {onOpenGitHubSync && (
            <button
              type="button"
              onClick={onOpenGitHubSync}
              className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 text-xs font-black flex items-center gap-1.5 shadow-md shadow-amber-500/20 cursor-pointer active:scale-95 transition-all"
              title={lang === 'el' ? 'Σύνδεση με GitHub koulami/Koulami-vultures & Ανάκτηση των 31 αποστολών με τους γύπες' : 'Connect to GitHub koulami/Koulami-vultures & restore 31 vulture quests'}
            >
              <Github className="w-4 h-4" />
              <span>{lang === 'el' ? '🐙 Σύνδεση GitHub (31 Γύπες)' : '🐙 GitHub (31 Vultures)'}</span>
            </button>
          )}

          {/* Export JSON backup button */}
          <button
            type="button"
            onClick={() => {
              syncService.exportBackupFile(gameState);
              setResetNotification(
                lang === 'el'
                  ? 'Το αντίγραφο ασφαλείας λήφθηκε με επιτυχία στον υπολογιστή σας!'
                  : 'Backup file exported successfully!'
              );
              setTimeout(() => setResetNotification(null), 4000);
            }}
            className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold border border-slate-700 flex items-center gap-1.5 transition-colors cursor-pointer"
            title={t.exportBackup}
          >
            <Download className="w-4 h-4 text-sky-400" />
            <span className="hidden md:inline">{lang === 'el' ? 'Λήψη Αντιγράφου' : 'Export'}</span>
          </button>

          {/* Quick Manual Checkpoint button */}
          <button
            type="button"
            onClick={() => handleCreateManualCheckpoint()}
            disabled={isSavingCheckpoint}
            className="px-3 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 active:scale-95 text-white text-xs font-bold border border-emerald-500/80 flex items-center gap-1.5 transition-all shadow-sm cursor-pointer disabled:opacity-50"
            title={lang === 'el' ? 'Άμεση δημιουργία χειροκίνητου σημείου επαναφοράς (Checkpoint)' : 'Create manual restore checkpoint now'}
          >
            <Camera className="w-4 h-4 text-emerald-200" />
            <span>{lang === 'el' ? '📸 Νέο Checkpoint' : '📸 New Checkpoint'}</span>
          </button>

          {/* Browser snapshot history recovery button */}
          <button
            type="button"
            onClick={() => {
              setSnapshots(syncService.getSnapshots());
              setShowHistoryModal(true);
            }}
            className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold border border-slate-700 flex items-center gap-1.5 transition-colors cursor-pointer"
            title={lang === 'el' ? 'Προβολή ιστορικού στιγμιοτύπων περιηγητή για ανάκτηση προηγούμενης κατάστασης' : 'View browser snapshot history to restore a previous state'}
          >
            <RotateCcw className="w-4 h-4 text-purple-400" />
            <span className="hidden md:inline">{lang === 'el' ? 'Ιστορικό Στιγμιοτύπων' : 'History'}</span>
            {snapshots.length > 0 && (
              <span className="px-1.5 py-0.2 rounded-full text-[10px] font-bold bg-purple-900/80 text-purple-200 border border-purple-500/30">
                {snapshots.length}
              </span>
            )}
          </button>

          {/* Hidden file input for restore JSON */}
          {onRestoreBackup && (
            <label className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold border border-slate-700 flex items-center gap-1.5 transition-colors cursor-pointer">
              <Upload className="w-4 h-4 text-emerald-400" />
              <span className="hidden md:inline">{lang === 'el' ? 'Επαναφορά' : 'Restore'}</span>
              <input
                type="file"
                accept=".json,application/json"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (!file) return;
                  const reader = new FileReader();
                  reader.onload = (evt) => {
                    try {
                      const parsed = JSON.parse(evt.target?.result as string);
                      if (parsed && parsed.questions && parsed.teams) {
                        onRestoreBackup(parsed);
                        setResetNotification(
                          lang === 'el'
                            ? 'Το αντίγραφο ασφαλείας επαναφέρθηκε με επιτυχία!'
                            : 'Backup restored successfully!'
                        );
                        setTimeout(() => setResetNotification(null), 4000);
                      }
                    } catch {
                      alert(lang === 'el' ? 'Μη έγκυρο αρχείο JSON αντιγράφου.' : 'Invalid backup JSON file.');
                    }
                  };
                  reader.readAsText(file);
                }}
              />
            </label>
          )}

          {onLoadPreset && (
            <>
              <button
                type="button"
                onClick={() => {
                  onLoadPreset('epic_challenge');
                  setResetNotification(
                    lang === 'el'
                      ? '✅ Ενεργοποιήθηκαν οι 14 Ερωτήσεις & Απαντήσεις με τις 4 Ομάδες!'
                      : '✅ Loaded the 14 Questions & Answers with the 4 Teams!'
                  );
                  setTimeout(() => setResetNotification(null), 4000);
                }}
                className={`px-3 py-2 rounded-xl text-xs font-bold border flex items-center gap-1.5 transition-all cursor-pointer shadow-sm ${
                  gameState.questions.length === 14 || gameState.title.includes('Epic Challenge')
                    ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/50 ring-1 ring-emerald-500/30'
                    : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700'
                }`}
                title={lang === 'el' ? 'Φόρτωση των 14 ερωτήσεων & απαντήσεων που ζητήσατε' : 'Load the 14 questions & answers'}
              >
                <RotateCcw className="w-4 h-4 text-emerald-400" />
                <span>{lang === 'el' ? '🎯 14 Ερωτήσεις & Απαντήσεις' : '🎯 14 Questions & Answers'}</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  onLoadPreset('vultures');
                  setResetNotification(
                    lang === 'el'
                      ? '🦅 Ενεργοποιήθηκαν οι 32 Αποστολές των Γυπών!'
                      : '🦅 Loaded the 32 Vulture Missions!'
                  );
                  setTimeout(() => setResetNotification(null), 4000);
                }}
                className={`px-3 py-2 rounded-xl text-xs font-bold border flex items-center gap-1.5 transition-all cursor-pointer shadow-sm ${
                  gameState.questions.length >= 31 && gameState.title.includes('Γύπες')
                    ? 'bg-amber-500/20 text-amber-300 border-amber-500/50 ring-1 ring-amber-500/30'
                    : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700'
                }`}
                title={lang === 'el' ? 'Φόρτωση 32 Αποστολών Γυπών' : 'Load 32 Vulture Missions'}
              >
                <span>🦅 {lang === 'el' ? '32 Γύπες' : '32 Vultures'}</span>
              </button>
            </>
          )}

          {!onLoadPreset && onRestoreDefaultQuests && (
            <button
              type="button"
              onClick={() => {
                onRestoreDefaultQuests();
                setResetNotification(
                  lang === 'el'
                    ? '🎯 Επαναφορά των 14 Ερωτήσεων & Απαντήσεων!'
                    : '🎯 Restored the 14 Questions & Answers!'
                );
                setTimeout(() => setResetNotification(null), 4000);
              }}
              className="px-3 py-2 rounded-xl bg-amber-500/15 hover:bg-amber-500/25 text-amber-300 text-xs font-bold border border-amber-500/40 flex items-center gap-1.5 transition-colors cursor-pointer shadow-sm"
              title={lang === 'el' ? 'Επαναφορά ερωτήσεων' : 'Restore questions'}
            >
              <RotateCcw className="w-4 h-4 text-amber-400" />
              <span>{lang === 'el' ? '🎯 14 Ερωτήσεις & Απαντήσεις' : '🎯 14 Questions'}</span>
            </button>
          )}

          {onClose && (
            <button
              type="button"
              onClick={onClose}
              className="sm:hidden px-3 py-1.5 rounded-xl bg-slate-800 text-amber-300 text-xs font-bold border border-slate-700 flex items-center gap-1"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>{t.backToBoard}</span>
            </button>
          )}

          <button
            type="button"
            onClick={onOpenJoinQr}
            className="px-3.5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold flex items-center gap-1.5 transition-colors shadow-md shadow-amber-500/20 cursor-pointer"
          >
            <QrCode className="w-4 h-4" />
            <span>{t.showJoinQr}</span>
          </button>

          {qrQuestions.length > 0 && (
            <button
              type="button"
              onClick={() => setShowQrPrintModal(true)}
              className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold border border-slate-700 flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Printer className="w-4 h-4 text-purple-400" />
              <span>{t.printQrStationCards}</span>
            </button>
          )}

          {onOpenPrintPdf && (
            <button
              type="button"
              onClick={onOpenPrintPdf}
              className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold border border-emerald-500/80 flex items-center gap-1.5 transition-all shadow-md shadow-emerald-600/25 cursor-pointer"
              title={lang === 'el' ? 'Εκτύπωση & Αποθήκευση όλων των ερωτήσεων με απαντήσεις σε PDF' : 'Print & Save all questions with answers to PDF'}
            >
              <Printer className="w-4 h-4 text-emerald-200" />
              <span>{lang === 'el' ? '🖨️ Εκτύπωση / PDF Απαντήσεων' : '🖨️ Print / PDF Answers'}</span>
            </button>
          )}
        </div>
      </div>

      {/* Preset Showcase Banner: 14 Questions vs 31 Vultures vs All 45 */}
      <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-slate-900 via-indigo-950/40 to-slate-900 border border-indigo-500/40 shadow-xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-800">
          <div className="flex items-start sm:items-center gap-3.5">
            <span className="text-3xl p-2.5 rounded-2xl bg-slate-950 border border-indigo-500/40 shrink-0">
              📚
            </span>
            <div>
              <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2 flex-wrap">
                <span>{lang === 'el' ? 'Επιλογή Πακέτου Ερωτήσεων & Ομάδων (Presets)' : 'Question & Team Package Presets'}</span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-bold">
                  {lang === 'el' ? `Τρέχον: ${gameState.questions.length} Αποστολές` : `Current: ${gameState.questions.length} Quests`}
                </span>
              </h3>
              <p className="text-xs text-slate-300 mt-1 max-w-2xl leading-relaxed">
                {lang === 'el'
                  ? 'Μπορείτε να αλλάξετε άμεσα μεταξύ των 14 ερωτήσεων & απαντήσεων (Επιστήμη, Γεωγραφία, Βιολογία), των 31 αποστολών των Γυπών της Ελλάδας, ή του συνδυασμού και των 45 αποστολών!'
                  : 'Switch instantly between the 14 questions & answers (Science, Geography, Biology), the 31 Greek Vulture conservation quests, or combine all 45 missions!'}
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-4">
          {/* Preset 1: 14 Questions (User requested) */}
          <button
            type="button"
            onClick={() => {
              if (onLoadPreset) onLoadPreset('epic_challenge');
              else if (onRestoreDefaultQuests) onRestoreDefaultQuests();
              setResetNotification(
                lang === 'el'
                  ? '✅ Ενεργοποιήθηκαν οι 14 Ερωτήσεις & Απαντήσεις με τις 4 Ομάδες!'
                  : '✅ Loaded 14 Questions & Answers with 4 Teams!'
              );
              setTimeout(() => setResetNotification(null), 4000);
            }}
            className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer relative ${
              gameState.questions.length === 14 || gameState.title.includes('Epic Challenge')
                ? 'bg-emerald-950/40 border-emerald-500/60 ring-2 ring-emerald-500/30 shadow-lg shadow-emerald-950/50'
                : 'bg-slate-950/60 border-slate-800 hover:border-slate-700 hover:bg-slate-900/60'
            }`}
          >
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-sm font-bold text-slate-100 flex items-center gap-1.5">
                🎯 {lang === 'el' ? 'Οι 14 Ερωτήσεις & Απαντήσεις' : 'The 14 Questions & Answers'}
              </span>
              {(gameState.questions.length === 14 || gameState.title.includes('Epic Challenge')) && (
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500 text-slate-950 font-black">
                  {lang === 'el' ? 'ΕΝΕΡΓΟ' : 'ACTIVE'}
                </span>
              )}
            </div>
            <p className="text-[11px] text-slate-300 leading-snug">
              {lang === 'el'
                ? 'Παρθενώνας, Χαμαιλέοντας, Πρωτεύουσες, Επιστημονικά Όργανα, QR Code, Μπλε Φάλαινα, Ηλιακό Σύστημα, Παζλ κ.λπ. (4 Ομάδες)'
                : 'Parthenon, Chameleon, Capitals, Instruments, QR Code, Blue Whale, Solar System, Puzzle, etc. (4 Teams)'}
            </p>
            <div className="mt-2.5 text-[10px] font-bold text-emerald-400">
              {lang === 'el' ? '➔ Κλικ για ενεργοποίηση' : '➔ Click to activate'}
            </div>
          </button>

          {/* Preset 2: 32 Vulture Missions */}
          <button
            type="button"
            onClick={() => {
              if (onLoadPreset) onLoadPreset('vultures');
              setResetNotification(
                lang === 'el'
                  ? '🦅 Ενεργοποιήθηκαν οι 32 Αποστολές των Γυπών της Ελλάδας!'
                  : '🦅 Loaded the 32 Greek Vulture Missions!'
              );
              setTimeout(() => setResetNotification(null), 4000);
            }}
            className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer relative ${
              gameState.questions.length >= 31 && gameState.title.includes('Γύπες')
                ? 'bg-amber-950/40 border-amber-500/60 ring-2 ring-amber-500/30 shadow-lg shadow-amber-950/50'
                : 'bg-slate-950/60 border-slate-800 hover:border-slate-700 hover:bg-slate-900/60'
            }`}
          >
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-sm font-bold text-slate-100 flex items-center gap-1.5">
                🦅 {lang === 'el' ? 'Οι 32 Αποστολές Γυπών' : 'The 32 Vulture Quests'}
              </span>
              {(gameState.questions.length >= 31 && gameState.title.includes('Γύπες')) && (
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500 text-slate-950 font-black">
                  {lang === 'el' ? 'ΕΝΕΡΓΟ' : 'ACTIVE'}
                </span>
              )}
            </div>
            <p className="text-[11px] text-slate-300 leading-snug">
              {lang === 'el'
                ? 'Όρνια, Γυπαετοί, Μαυρόγυπες, Ασπροπάρηδες (Βιολογία, Δαδιά, Κρήτη, Δηλητήρια, Σταθμοί QR, Τηλεμετρία & Επιστημονική Έρευνα)'
                : 'Griffon, Bearded, Black & Egyptian Vultures (Biology, Dadia, Crete, Poison baits, QR, Telemetry & Research)'}
            </p>
            <div className="mt-2.5 text-[10px] font-bold text-amber-400">
              {lang === 'el' ? '➔ Κλικ για ενεργοποίηση' : '➔ Click to activate'}
            </div>
          </button>

          {/* Preset 3: All 46 Quests */}
          <button
            type="button"
            onClick={() => {
              if (onLoadPreset) onLoadPreset('combined');
              setResetNotification(
                lang === 'el'
                  ? '⚡ Ενεργοποιήθηκαν και οι 46 Αποστολές (Συνδυασμός όλων)!'
                  : '⚡ Loaded all 46 Quests combined!'
              );
              setTimeout(() => setResetNotification(null), 4000);
            }}
            className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer relative ${
              gameState.questions.length >= 45
                ? 'bg-purple-950/40 border-purple-500/60 ring-2 ring-purple-500/30 shadow-lg shadow-purple-950/50'
                : 'bg-slate-950/60 border-slate-800 hover:border-slate-700 hover:bg-slate-900/60'
            }`}
          >
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-sm font-bold text-slate-100 flex items-center gap-1.5">
                ⚡ {lang === 'el' ? 'Όλες οι Αποστολές (46)' : 'All Quests Combined (46)'}
              </span>
              {gameState.questions.length >= 45 && (
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-purple-500 text-slate-950 font-black">
                  {lang === 'el' ? 'ΕΝΕΡΓΟ' : 'ACTIVE'}
                </span>
              )}
            </div>
            <p className="text-[11px] text-slate-300 leading-snug">
              {lang === 'el'
                ? 'Το απόλυτο πακέτο: Και οι 14 ερωτήσεις επιστήμης & γνώσεων και οι 32 αποστολές για τους γύπες της Ελλάδας!'
                : 'The ultimate bundle: All 14 science & knowledge quests plus all 32 Greek vulture conservation missions!'}
            </p>
            <div className="mt-2.5 text-[10px] font-bold text-purple-400">
              {lang === 'el' ? '➔ Κλικ για ενεργοποίηση' : '➔ Click to activate'}
            </div>
          </button>
        </div>
      </div>

      {/* GitHub Vultures Sync & Recovery Banner */}
      <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-slate-900 via-amber-950/30 to-slate-900 border border-amber-500/40 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-start sm:items-center gap-3.5">
          <span className="text-3xl p-2.5 rounded-2xl bg-slate-950 border border-amber-500/40 shrink-0">
            🐙
          </span>
          <div>
            <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2 flex-wrap">
              <span>{lang === 'el' ? 'Σύνδεση με GitHub koulami/Koulami-vultures' : 'GitHub Integration: koulami/Koulami-vultures'}</span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 font-bold">
                {lang === 'el' ? '31 Αποστολές Γύπες' : '31 Vulture Quests'}
              </span>
            </h3>
            <p className="text-xs text-slate-300 mt-1 max-w-2xl leading-relaxed">
              {lang === 'el'
                ? 'Συνδεθείτε απευθείας με το GitHub αποθετήριο koulami/Koulami-vultures για να επαναφέρετε την τελευταία αποθήκευση με τις 31 αποστολές για τους γύπες ή επικολλήστε απευθείας το αρχείο.'
                : 'Connect directly with GitHub repository koulami/Koulami-vultures to restore the latest save containing the 31 vulture quests or paste the file directly.'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap shrink-0">
          {onOpenGitHubSync && (
            <button
              type="button"
              onClick={onOpenGitHubSync}
              className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black text-xs flex items-center gap-2 shadow-lg shadow-amber-500/20 transition-all cursor-pointer active:scale-95"
            >
              <Github className="w-4 h-4 text-slate-950" />
              <span>{lang === 'el' ? 'Άνοιγμα Σύνδεσης & Ανάκτησης' : 'Open Sync & Restore'}</span>
            </button>
          )}
        </div>
      </div>

      {/* Bilingual Feature Banner: Greek & English Translations */}
      <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-slate-900 via-sky-950/40 to-slate-900 border border-sky-800/50 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-start sm:items-center gap-3.5">
          <span className="text-3xl p-2.5 rounded-2xl bg-slate-950 border border-sky-800/60 shrink-0">
            🌐
          </span>
          <div>
            <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2 flex-wrap">
              <span>{lang === 'el' ? 'Δίγλωσση Λειτουργία & Μετάφραση (Greek + English)' : 'Bilingual Engine (Greek + English)'}</span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-bold">
                {lang === 'el' ? '✓ Ενεργή' : '✓ Active'}
              </span>
            </h3>
            <p className="text-xs text-slate-300 mt-1 max-w-2xl leading-relaxed">
              {lang === 'el'
                ? 'Όλες οι δραστηριότητες που έχετε γράψει διαθέτουν αγγλική μετάφραση! Δείτε παρακάτω την αγγλική απόδοση σε κάθε κάρτα και πατήστε «🇬🇧 Τελικό Editing» για να κάνετε τις δικές σας τελικές διορθώσεις.'
                : 'All activities include their English translations! You can view the English version below on every card and click "🇬🇧 Edit English" to perform your final touch-ups.'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap shrink-0">
          {onBulkAutoTranslate && (
            <button
              type="button"
              onClick={() => {
                onBulkAutoTranslate();
                setResetNotification(
                  lang === 'el'
                    ? '✓ Όλες οι δραστηριότητες και τα κείμενα μεταφράστηκαν αυτόματα στα Αγγλικά και αποθηκεύτηκαν!'
                    : '✓ All quests and texts were auto-translated to English and saved!'
                );
                setTimeout(() => setResetNotification(null), 4000);
              }}
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-sky-500 via-indigo-500 to-purple-600 hover:from-sky-400 hover:to-indigo-400 text-white font-bold text-xs flex items-center gap-2 transition-all shadow-md shadow-sky-500/25 cursor-pointer active:scale-95"
              title={lang === 'el' ? 'Μαζική αυτόματη μετάφραση όλων των ερωτήσεων στα Αγγλικά' : 'Auto-translate all questions to English'}
            >
              <Sparkles className="w-4 h-4 text-amber-300" />
              <span>{lang === 'el' ? '⚡ Μαζική Μετάφραση Όλων στα Αγγλικά' : '⚡ Auto-Translate All to English'}</span>
            </button>
          )}
        </div>
      </div>

      {/* Game Phase & Flow Controller */}
      <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-sm font-bold text-slate-200 uppercase tracking-wider flex items-center gap-2">
              <span>{t.gamePhase}</span>
              <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${
                gameState.phase === 'waiting_lobby'
                  ? 'bg-rose-500/10 text-rose-300 border border-rose-500/30'
                  : gameState.phase === 'in_progress'
                  ? 'bg-emerald-500/10 text-emerald-300 border border-emerald-500/30'
                  : gameState.phase === 'synthesis'
                  ? 'bg-amber-500/10 text-amber-300 border border-amber-500/30'
                  : 'bg-purple-500/10 text-purple-300 border border-purple-500/30'
              }`}>
                {t[`phase${gameState.phase === 'waiting_lobby' ? 'Lobby' : gameState.phase === 'in_progress' ? 'InProgress' : gameState.phase === 'synthesis' ? 'Synthesis' : 'Discussion'}` as keyof typeof t] || gameState.phase}
              </span>
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              {lang === 'el'
                ? 'Ελέγξτε τη ροή: Αίθουσα αναμονής → Ταυτόχρονη εκκίνηση → Σύνθεση στον πίνακα ομάδας → Συζήτηση στην τάξη.'
                : 'Control flow: Waiting lobby → Simultaneous start → Team synthesis board → Class discussion.'}
            </p>
          </div>

          {/* Quick Primary Flow Action */}
          <div>
            {gameState.phase === 'waiting_lobby' && (
              <button
                type="button"
                onClick={() => {
                  onSetPhase('in_progress');
                  onStartTimer();
                }}
                className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs flex items-center gap-2 shadow-lg shadow-amber-500/20 cursor-pointer animate-pulse"
              >
                <span>{t.simultaneousStart}</span>
              </button>
            )}

            {gameState.phase === 'in_progress' && (
              <button
                type="button"
                onClick={() => onSetPhase('synthesis')}
                className="px-5 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-black text-xs flex items-center gap-2 shadow-lg shadow-cyan-500/20 cursor-pointer"
              >
                <span>{t.moveToSynthesis}</span>
              </button>
            )}

            {gameState.phase === 'synthesis' && (
              <button
                type="button"
                onClick={() => onSetPhase('discussion')}
                className="px-5 py-2.5 rounded-xl bg-purple-500 hover:bg-purple-400 text-slate-950 font-black text-xs flex items-center gap-2 shadow-lg shadow-purple-500/20 cursor-pointer"
              >
                <span>{t.openDiscussion}</span>
              </button>
            )}

            {gameState.phase === 'discussion' && (
              <button
                type="button"
                onClick={() => onSetPhase('waiting_lobby')}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs flex items-center gap-2 border border-slate-700 cursor-pointer"
              >
                <span>{t.resetToLobby}</span>
              </button>
            )}
          </div>
        </div>

        {/* Phase Step Selectors */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1">
          {[
            { id: 'waiting_lobby', label: t.phaseLobby, num: '1' },
            { id: 'in_progress', label: t.phaseInProgress, num: '2' },
            { id: 'synthesis', label: t.phaseSynthesis, num: '3' },
            { id: 'discussion', label: t.phaseDiscussion, num: '4' }
          ].map((st) => (
            <button
              key={st.id}
              type="button"
              onClick={() => onSetPhase(st.id as GamePhase)}
              className={`p-2.5 rounded-xl border text-xs font-medium text-left transition-all ${
                gameState.phase === st.id
                  ? 'bg-amber-950/40 border-amber-500 text-amber-200 ring-2 ring-amber-500/30 font-bold'
                  : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:text-slate-200 hover:border-slate-700'
              }`}
            >
              <div className="flex items-center gap-1.5 mb-1">
                <span className="w-4 h-4 rounded-full bg-slate-800 text-[10px] font-mono flex items-center justify-center font-bold">
                  {st.num}
                </span>
                <span className="truncate">{st.label}</span>
              </div>
            </button>
          ))}
        </div>

        {/* Synthesis Prompt Customizer (Bilingual) */}
        <div className="pt-3 border-t border-slate-800 space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <label className="block text-xs font-bold text-slate-300">
              {lang === 'el' ? 'Κεντρικό Ερώτημα / Οδηγία Σύνθεσης Πληροφοριών Ομάδων:' : 'Central Team Synthesis Question & Clue Prompt:'}
            </label>
            <button
              type="button"
              onClick={() => {
                onSetSynthesisPrompt(promptText, promptTextEn);
                setResetNotification(lang === 'el' ? '✓ Η οδηγία σύνθεσης αποθηκεύτηκε επιτυχώς!' : '✓ Synthesis prompt saved successfully!');
                setTimeout(() => setResetNotification(null), 3500);
              }}
              className="px-4 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-black shadow-md shadow-amber-500/20 cursor-pointer transition-all self-end sm:self-auto"
            >
              {t.save}
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
            <div>
              <span className="text-[10px] text-slate-400 block mb-1 font-semibold">🇬🇷 Ελληνική Έκδοση</span>
              <input
                type="text"
                value={promptText}
                onChange={(e) => setPromptText(e.target.value)}
                placeholder="π.χ. Συνθέστε τις πληροφορίες και τα συμπεράσματα από τις αποστολές..."
                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-xs text-slate-200 focus:outline-none focus:border-amber-500"
              />
            </div>
            <div>
              <span className="text-[10px] text-sky-400 block mb-1 font-semibold">🇬🇧 English Translation (Τελική Επεξεργασία)</span>
              <input
                type="text"
                value={promptTextEn}
                onChange={(e) => setPromptTextEn(e.target.value)}
                placeholder="e.g. Synthesize your team findings and clues from the quests..."
                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-sky-600/70 text-xs text-slate-200 focus:outline-none focus:border-sky-400"
              />
            </div>
          </div>
        </div>
      </div>

      {resetNotification && (
        <div className="p-4 rounded-xl bg-emerald-950/80 border border-emerald-500 text-emerald-200 text-sm flex items-center gap-2 animate-fadeIn shadow-lg">
          <CheckCircle2 className="w-5 h-5 text-emerald-400" />
          <span>{resetNotification}</span>
        </div>
      )}

      {/* Countdown Timer Facilitator Control */}
      <div className="space-y-2">
        <h2 className="text-sm font-bold text-slate-300 uppercase tracking-wider">{t.timerTitle}</h2>
        <TimerBar
          timer={gameState.timer}
          lang={lang}
          isAdmin={true}
          onStart={onStartTimer}
          onPause={onPauseTimer}
          onReset={onResetTimer}
          onSetDuration={onSetTimerDuration}
        />
      </div>

      {/* Danger Zone: Reset Answers */}
      <div className="p-5 rounded-2xl bg-slate-900 border border-rose-900/40 shadow-xl space-y-4">
        <div className="flex items-center gap-2.5 text-rose-400">
          <AlertTriangle className="w-5 h-5" />
          <h2 className="text-sm font-bold uppercase tracking-wider">{t.dangerZone}</h2>
        </div>

        <p className="text-xs text-slate-400 leading-relaxed">
          {lang === 'el'
            ? 'Όταν ξεκινάτε ένα νέο παιχνίδι ή επόμενο γύρο στην τάξη, σβήστε όλες τις προηγούμενες απαντήσεις, φωτογραφίες και σκορ με ένα κλικ.'
            : 'When starting a fresh game or next class round, wipe all previous answers, photo submissions, and team scores with a single click.'}
        </p>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pt-2">
          {/* Reset All */}
          {confirmResetAll ? (
            <div className="flex items-center gap-2 bg-rose-950 p-2 rounded-xl border border-rose-600">
              <span className="text-xs text-rose-200 font-medium px-2">{t.resetAllAnswersConfirm}</span>
              <button
                type="button"
                onClick={handleExecuteResetAll}
                className="px-3.5 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs"
              >
                {t.confirm}
              </button>
              <button
                type="button"
                onClick={() => setConfirmResetAll(false)}
                className="px-3.5 py-1.5 rounded-lg bg-slate-800 text-slate-300 text-xs"
              >
                {t.cancel}
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => setConfirmResetAll(true)}
              className="px-4 py-2.5 rounded-xl bg-rose-600/90 hover:bg-rose-600 text-white font-bold text-xs flex items-center justify-center gap-2 transition-colors shadow-lg shadow-rose-900/20"
            >
              <Trash2 className="w-4 h-4" />
              <span>{t.resetAllAnswers}</span>
            </button>
          )}

          {/* Reset Single Team */}
          <div className="flex items-center gap-2 sm:ml-auto">
            <select
              value={selectedTeamToReset}
              onChange={(e) => setSelectedTeamToReset(e.target.value)}
              className="px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-xs text-slate-200 focus:outline-none"
            >
              <option value="">{t.selectTeamToReset}</option>
              {gameState.teams.map((tm) => (
                <option key={tm.id} value={tm.id}>
                  {tm.name}
                </option>
              ))}
            </select>
            <button
              type="button"
              disabled={!selectedTeamToReset}
              onClick={handleExecuteResetTeam}
              className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs border border-slate-700 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <RotateCcw className="w-3.5 h-3.5 mr-1 inline" />
              {t.resetSingleTeam}
            </button>
          </div>
        </div>
      </div>

      {/* Team-Centric Activity & Question Manager */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-sm font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
              <span>{lang === 'el' ? '🎯 Δραστηριότητες & Ερωτήσεις ανά Ομάδα' : '🎯 Team Activities & Quests'}</span>
              <span className="text-xs text-slate-500 font-normal">
                ({gameState.questions.filter(q => q.isActive !== false).length}/{gameState.questions.length} {lang === 'el' ? 'ενεργές' : 'active'})
              </span>
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              {lang === 'el'
                ? 'Επιλέξτε ομάδα για να διαχειριστείτε και να αλλάξετε τη σειρά (πάνω/κάτω) των δραστηριοτήτων της ξεχωριστά, ή προσθέστε νέα δραστηριότητα με επιλογή περάσματος και στις υπόλοιπες ομάδες.'
                : 'Select a team to manage and reorder (up/down) its activities independently, or add new quests with the option to pass them to other teams.'}
            </p>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            {onOpenPrintPdf && (
              <button
                type="button"
                onClick={onOpenPrintPdf}
                className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-1.5 transition-all shadow-md shadow-emerald-600/20 shrink-0 cursor-pointer"
                title={lang === 'el' ? 'Εκτύπωση & Αποθήκευση όλων των ερωτήσεων με απαντήσεις σε PDF' : 'Print & Save all questions with answers in PDF'}
              >
                <Printer className="w-4 h-4 text-emerald-200" />
                <span>{lang === 'el' ? '🖨️ Εκτύπωση / PDF (31 Αποστολές & Λύσεις)' : '🖨️ Print / PDF (31 Quests & Answers)'}</span>
              </button>
            )}

            <button
              type="button"
              onClick={() => setEditingQuestion('new')}
              className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs flex items-center gap-1.5 transition-colors shadow-md shadow-amber-500/10 shrink-0 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>
                {activeTeam && selectedTeamTab !== 'all'
                  ? (lang === 'el' ? `+ Νέα για ${activeTeam.name.split(':')[0]}` : `+ New for ${activeTeam.name.split(':')[0]}`)
                  : t.addQuestionBtn}
              </span>
            </button>
          </div>
        </div>

        {/* Bilingual Helper & Language Switch Bar */}
        <div className="p-4 rounded-2xl bg-gradient-to-r from-sky-950/70 via-slate-900 to-indigo-950/70 border border-sky-500/40 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div className="flex items-start gap-3">
            <span className="p-2.5 rounded-xl bg-sky-500/20 border border-sky-500/40 text-sky-300 text-lg shrink-0">
              🇬🇧
            </span>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="text-xs font-bold text-sky-200">
                  {lang === 'el' ? 'Αγγλικές Μεταφράσεις & Τελικό Editing' : 'English Translations & Final Editing'}
                </h3>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 font-bold">
                  ✓ {lang === 'el' ? 'Όλες οι δραστηριότητες έχουν μεταφραστεί στα Αγγλικά' : 'All quests translated to English'}
                </span>
              </div>
              <p className="text-[11px] text-slate-300 mt-1 leading-relaxed">
                {lang === 'el'
                  ? 'Όλες οι δραστηριότητες (και της Ομάδας 4) έχουν αυτόματη μετάφραση. Πατήστε «🇬🇧 Τελικό Editing» σε οποιαδήποτε δραστηριότητα για να ανοίξει απευθείας η αγγλική καρτέλα για τις δικές σας διορθώσεις, ή αλλάξτε την προβολή στα Αγγλικά παρακάτω:'
                  : 'All activities (including Team 4) have automated translations. Click "🇬🇧 Edit EN" on any quest to open the English tab for your final edits, or toggle English view below:'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0 self-start md:self-auto">
            {onLanguageChange && (
              <div className="flex items-center bg-slate-950 p-1 rounded-xl border border-slate-700 shadow-inner">
                <button
                  type="button"
                  onClick={() => onLanguageChange('el')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                    lang === 'el'
                      ? 'bg-amber-500 text-slate-950 shadow-sm'
                      : 'text-slate-400 hover:text-white'
                  }`}
                  title="Προβολή στα Ελληνικά"
                >
                  <span>🇬🇷</span>
                  <span>Ελληνικά</span>
                </button>
                <button
                  type="button"
                  onClick={() => onLanguageChange('en')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                    lang === 'en'
                      ? 'bg-amber-500 text-slate-950 shadow-sm'
                      : 'text-slate-400 hover:text-white'
                  }`}
                  title="Switch whole view to English"
                >
                  <span>🇬🇧</span>
                  <span>English View</span>
                </button>
              </div>
            )}

            {onBulkAutoTranslate && (
              <button
                type="button"
                disabled={isBulkTranslating}
                onClick={async () => {
                  setIsBulkTranslating(true);
                  try {
                    await onBulkAutoTranslate();
                    setResetNotification(
                      lang === 'el'
                        ? '✓ Όλες οι δραστηριότητες και τα κείμενα μεταφράστηκαν επιτυχώς στα Αγγλικά!'
                        : '✓ All activities and texts successfully translated to English!'
                    );
                  } catch (e) {
                    console.error(e);
                  } finally {
                    setIsBulkTranslating(false);
                    setTimeout(() => setResetNotification(null), 5000);
                  }
                }}
                className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-sky-500 via-indigo-500 to-purple-600 hover:from-sky-400 hover:to-indigo-400 disabled:opacity-60 text-white font-bold text-xs flex items-center gap-1.5 transition-all shadow-md shadow-sky-500/25 cursor-pointer active:scale-95"
                title={lang === 'el' ? 'Αυτόματη μετάφραση όλων των δραστηριοτήτων στα Αγγλικά' : 'Translate all activities to English'}
              >
                {isBulkTranslating ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin text-amber-300" />
                ) : (
                  <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                )}
                <span>
                  {isBulkTranslating
                    ? lang === 'el'
                      ? 'Μετάφραση όλων σε εξέλιξη...'
                      : 'Translating all...'
                    : lang === 'el'
                    ? '⚡ Μετάφραση Όλων στα Αγγλικά'
                    : '⚡ Translate All to English'}
                </span>
              </button>
            )}
          </div>
        </div>

        {/* Team Selector Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1.5 no-scrollbar">
          {gameState.teams.map((tm) => {
            const isSelected = selectedTeamTab === tm.id;
            const assignedCount = gameState.questions.filter(
              (q) => !q.assignedTeamIds || q.assignedTeamIds.length === 0 || q.assignedTeamIds.includes(tm.id)
            ).length;

            return (
              <button
                key={tm.id}
                type="button"
                onClick={() => setSelectedTeamTab(tm.id)}
                className={`px-3.5 py-2.5 rounded-xl border text-xs font-bold flex items-center gap-2 transition-all shrink-0 cursor-pointer ${
                  isSelected
                    ? 'bg-amber-950/60 border-amber-500 text-amber-200 ring-2 ring-amber-500/30 shadow-lg shadow-amber-500/10'
                    : 'bg-slate-900 border-slate-800 text-slate-300 hover:text-white hover:border-slate-700'
                }`}
              >
                <span className="text-base">{tm.avatar}</span>
                <span className="truncate max-w-[130px] sm:max-w-[160px]">{tm.name}</span>
                <span className={`px-1.5 py-0.5 rounded-full text-[10px] font-mono font-bold ${
                  isSelected ? 'bg-amber-500 text-slate-950' : 'bg-slate-800 text-slate-400'
                }`}>
                  {assignedCount}
                </span>
              </button>
            );
          })}

          <button
            type="button"
            onClick={() => setSelectedTeamTab('all')}
            className={`px-3.5 py-2.5 rounded-xl border text-xs font-bold flex items-center gap-2 transition-all shrink-0 cursor-pointer ${
              selectedTeamTab === 'all'
                ? 'bg-amber-950/60 border-amber-500 text-amber-200 ring-2 ring-amber-500/30 shadow-lg shadow-amber-500/10'
                : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white hover:border-slate-700'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>{lang === 'el' ? 'Όλες οι Ερωτήσεις (Σύνολο)' : 'All Quests (Overview)'}</span>
            <span className={`px-1.5 py-0.5 rounded-full text-[10px] font-mono font-bold ${
              selectedTeamTab === 'all' ? 'bg-amber-500 text-slate-950' : 'bg-slate-800 text-slate-400'
            }`}>
              {gameState.questions.length}
            </span>
          </button>
        </div>

        {/* VIEW A: SPECIFIC TEAM SELECTED */}
        {activeTeam && selectedTeamTab !== 'all' ? (
          <div className="space-y-4">
            {/* Team Control Bar */}
            <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex items-center gap-3 min-w-0">
                <span className="text-3xl p-2.5 rounded-2xl bg-slate-950 border border-slate-800 shrink-0">
                  {activeTeam.avatar}
                </span>
                <div className="min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="text-base font-bold text-slate-100 truncate">
                      {activeTeam.name}
                    </h3>
                    <span className="text-xs px-2.5 py-0.5 rounded-full bg-slate-800 text-amber-300 font-mono font-bold border border-slate-700">
                      {teamQuestions.length} {lang === 'el' ? 'δραστηριότητες' : 'activities'}
                    </span>
                  </div>
                  {activeTeam.slogan && (
                    <p className="text-xs text-slate-400 italic truncate mt-0.5">
                      «{activeTeam.slogan}»
                    </p>
                  )}
                </div>
              </div>

              {/* Quick Progression mode toggle & Actions for this team */}
              <div className="flex items-center gap-2 flex-wrap">
                {/* Sequential Progression Mode Toggle */}
                <button
                  type="button"
                  onClick={() => onSetTeamSequentialMode(activeTeam.id, !isSequential)}
                  className={`px-3 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer border ${
                    isSequential
                      ? 'bg-amber-500/10 border-amber-500/40 text-amber-300'
                      : 'bg-slate-800 border-slate-700 text-slate-300 hover:text-white'
                  }`}
                  title={isSequential ? t.sequentialProgressionDesc : t.freeProgressionDesc}
                >
                  {isSequential ? (
                    <>
                      <Lock className="w-3.5 h-3.5 text-amber-400" />
                      <span>{lang === 'el' ? 'Βήμα-προς-Βήμα' : 'Step-by-Step'}</span>
                    </>
                  ) : (
                    <>
                      <Unlock className="w-3.5 h-3.5 text-slate-400" />
                      <span>{lang === 'el' ? 'Ελεύθερη Επιλογή' : 'Free Choice'}</span>
                    </>
                  )}
                </button>

                {/* Shuffle button for this team */}
                <button
                  type="button"
                  onClick={() => handleShuffleTeam(activeTeam.id)}
                  disabled={teamQuestions.length < 2}
                  className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-bold border border-slate-700 flex items-center gap-1.5 cursor-pointer disabled:opacity-40"
                  title={t.shuffleOrder}
                >
                  <Shuffle className="w-3.5 h-3.5 text-cyan-400" />
                  <span className="hidden sm:inline">{lang === 'el' ? 'Ανακάτεμα' : 'Shuffle'}</span>
                </button>

                {/* Reset to default order for this team */}
                <button
                  type="button"
                  onClick={() => handleResetTeamOrder(activeTeam.id)}
                  className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-bold border border-slate-700 flex items-center gap-1.5 cursor-pointer"
                  title={t.resetDefaultOrder}
                >
                  <RotateCcw className="w-3.5 h-3.5 text-slate-400" />
                  <span className="hidden sm:inline">{lang === 'el' ? 'Επαναφορά' : 'Reset'}</span>
                </button>

                {/* Copy order to all teams */}
                <button
                  type="button"
                  onClick={() => {
                    onApplyOrderToAllTeams(teamQuestions.map(q => q.id));
                    setResetNotification(t.orderCopiedToAll);
                    setTimeout(() => setResetNotification(null), 3500);
                  }}
                  disabled={teamQuestions.length === 0}
                  className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-bold border border-slate-700 flex items-center gap-1.5 cursor-pointer disabled:opacity-40"
                  title={t.applyOrderToAll}
                >
                  <Copy className="w-3.5 h-3.5 text-amber-400" />
                  <span className="hidden sm:inline">{lang === 'el' ? 'Αντιγραφή σε όλες' : 'Copy to all'}</span>
                </button>

                {/* Add Activity Button specifically for this team */}
                <button
                  type="button"
                  onClick={() => setEditingQuestion('new')}
                  className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs flex items-center gap-1.5 transition-colors shadow-md shadow-amber-500/20 shrink-0 cursor-pointer"
                >
                  <Plus className="w-4 h-4 text-slate-950" />
                  <span>{lang === 'el' ? `+ Νέα για ${activeTeam.name.split(':')[0]}` : `+ New for ${activeTeam.name.split(':')[0]}`}</span>
                </button>
              </div>
            </div>

            {/* Activities List for this team in their defined order */}
            {teamQuestions.length === 0 ? (
              <div className="p-8 rounded-2xl bg-slate-900 border border-slate-800 text-center space-y-3">
                <span className="text-4xl block">🎯</span>
                <h4 className="text-sm font-bold text-slate-200">
                  {lang === 'el' ? `Δεν υπάρχουν ακόμη δραστηριότητες για την ομάδα «${activeTeam.name}».` : `No activities yet for team «${activeTeam.name}».`}
                </h4>
                <p className="text-xs text-slate-400 max-w-md mx-auto">
                  {lang === 'el'
                    ? 'Πατήστε το παραπάνω κουμπί για να προσθέσετε δραστηριότητα, ή μεταβείτε στην καρτέλα «Όλες οι Ερωτήσεις» για να αναθέσετε υπάρχουσες.'
                    : 'Click the button above to add an activity, or visit the "All Questions" tab to assign existing ones.'}
                </p>
                <button
                  type="button"
                  onClick={() => setEditingQuestion('new')}
                  className="mt-2 px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold inline-flex items-center gap-1.5 shadow-md cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>{lang === 'el' ? `Προσθήκη 1ης Δραστηριότητας για ${activeTeam.name}` : `Add 1st Quest for ${activeTeam.name}`}</span>
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {/* 1. ACTIVE QUESTIONS ON TOP */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between pb-1">
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-emerald-400"></span>
                      <span className="text-xs font-bold text-slate-200">
                        {lang === 'el' ? '🟢 Ενεργές Δραστηριότητες Ομάδας' : '🟢 Active Team Quests'}
                      </span>
                    </div>
                    <span className="text-xs font-mono font-bold text-emerald-400 bg-emerald-950/60 border border-emerald-800/40 px-2 py-0.5 rounded-full">
                      {activeTeamQuestions.length} {lang === 'el' ? 'ενεργές' : 'active'}
                    </span>
                  </div>

                  {activeTeamQuestions.length === 0 ? (
                    <div className="p-5 rounded-2xl bg-slate-950/60 border border-slate-800 text-center text-xs text-slate-400">
                      {lang === 'el'
                        ? 'Δεν υπάρχουν ενεργές δραστηριότητες για αυτή την ομάδα. Ενεργοποιήστε κάποια από τις ανενεργές παρακάτω ή προσθέστε νέα.'
                        : 'No active quests for this team. Activate an inactive one below or add a new one.'}
                    </div>
                  ) : (
                    activeTeamQuestions.map((quest, index) => {
                      const isActive = true;
                      const assignedTeams = quest.assignedTeamIds && quest.assignedTeamIds.length > 0
                        ? gameState.teams.filter(t => quest.assignedTeamIds?.includes(t.id))
                        : gameState.teams;
                      const isShared = !quest.assignedTeamIds || quest.assignedTeamIds.length === 0 || quest.assignedTeamIds.length > 1;

                      return (
                        <div
                          key={quest.id}
                          className="p-4 rounded-2xl border transition-all flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 bg-slate-900 border-slate-800 shadow-sm hover:border-slate-700"
                        >
                          {/* Left: Reordering buttons (Up / Down) & Step number */}
                          <div className="flex items-center gap-2.5 shrink-0">
                            <div className="flex flex-col items-center justify-center p-1 rounded-xl bg-slate-950 border border-slate-800 gap-1 shrink-0">
                              <button
                                type="button"
                                onClick={() => handleMoveActiveTeamQuestion(activeTeam.id, index, 'up')}
                                disabled={index === 0}
                                className="p-1 rounded-lg hover:bg-amber-500/20 text-slate-400 hover:text-amber-300 disabled:opacity-20 disabled:hover:bg-transparent disabled:hover:text-slate-400 cursor-pointer transition-colors"
                                title={lang === 'el' ? 'Μετακίνηση Πάνω (Αλλαγή Θέσης)' : 'Move Up'}
                              >
                                <ArrowUp className="w-4 h-4" />
                              </button>
                              <span className="font-mono text-xs font-black text-amber-400 px-1.5 py-0.5 rounded bg-slate-900">
                                #{index + 1}
                              </span>
                              <button
                                type="button"
                                onClick={() => handleMoveActiveTeamQuestion(activeTeam.id, index, 'down')}
                                disabled={index === activeTeamQuestions.length - 1}
                                className="p-1 rounded-lg hover:bg-amber-500/20 text-slate-400 hover:text-amber-300 disabled:opacity-20 disabled:hover:bg-transparent disabled:hover:text-slate-400 cursor-pointer transition-colors"
                                title={lang === 'el' ? 'Μετακίνηση Κάτω (Αλλαγή Θέσης)' : 'Move Down'}
                              >
                                <ArrowDown className="w-4 h-4" />
                              </button>
                            </div>

                            {/* Quest Image or Video Thumbnail if exists */}
                            {quest.videoUrl ? (
                              <div className="w-14 h-14 rounded-xl overflow-hidden bg-purple-950/70 border border-purple-500/50 shrink-0 flex flex-col items-center justify-center text-purple-300 shadow-sm" title={lang === 'el' ? 'Περιλαμβάνει Βίντεο' : 'Includes Video'}>
                                <Film className="w-5 h-5 text-purple-400" />
                                <span className="text-[9px] font-bold">VIDEO</span>
                              </div>
                            ) : quest.imageUrl ? (
                              <div className="w-14 h-14 rounded-xl overflow-hidden bg-slate-950 border border-slate-800 shrink-0 flex items-center justify-center">
                                <img
                                  src={quest.imageUrl}
                                  alt="Quest thumb"
                                  className="w-full h-full object-cover"
                                  referrerPolicy="no-referrer"
                                />
                              </div>
                            ) : null}
                          </div>

                          {/* Middle: Quest Title, Type, Description & Scope badge */}
                          <div className="min-w-0 flex-1 space-y-1.5">
                            <div className="flex items-center gap-2 flex-wrap text-xs">
                              <span className="font-semibold text-cyan-400 text-[11px] px-2 py-0.5 rounded bg-cyan-950/60 border border-cyan-800/40">
                                {t[quest.type]}
                              </span>
                              <span className="font-mono text-amber-400 font-bold text-[11px]">
                                {quest.points} {t.pts}
                              </span>

                              {/* Exclusive vs Shared Badge */}
                              {isShared ? (
                                <span
                                  className="text-[11px] text-slate-300 flex items-center gap-1 px-2 py-0.5 rounded bg-slate-800/80 border border-slate-700/60"
                                  title={assignedTeams.map(t => t.name).join(', ')}
                                >
                                  <span>🌐</span>
                                  <span>{lang === 'el' ? `Κοινή με ${assignedTeams.length - 1} άλλες ομάδες` : `Shared with ${assignedTeams.length - 1} other teams`}</span>
                                </span>
                              ) : (
                                <span className="text-[11px] text-emerald-300 flex items-center gap-1 px-2 py-0.5 rounded bg-emerald-950/50 border border-emerald-800/40 font-semibold">
                                  <span>🔒</span>
                                  <span>{lang === 'el' ? `Μόνο για ${activeTeam.name.split(':')[0]}` : `Exclusive to ${activeTeam.name.split(':')[0]}`}</span>
                                </span>
                              )}
                            </div>

                            <div className="space-y-1">
                              {/* Greek original title */}
                              <div className="flex items-center gap-1.5 flex-wrap">
                                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-300 border border-amber-500/30">
                                  🇬🇷 EL
                                </span>
                                <h4 className="text-sm font-bold text-slate-100 leading-snug">
                                  {quest.title}
                                </h4>
                              </div>

                              {/* English translation preview */}
                              <div className="flex items-center gap-1.5 flex-wrap">
                                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-sky-500/10 text-sky-300 border border-sky-500/30">
                                  🇬🇧 EN
                                </span>
                                <span className="text-xs font-semibold text-sky-200 leading-snug">
                                  {quest.title_en || translateGreekToEnglish(quest.title)}
                                </span>
                                {quest.title_en ? (
                                  <span className="text-[9px] text-emerald-400 font-mono bg-emerald-950/60 border border-emerald-800/40 px-1 rounded" title="Χειροκίνητα επεξεργασμένο στα Αγγλικά">
                                    ✓ Edited
                                  </span>
                                ) : (
                                  <span className="text-[9px] text-sky-400 font-mono bg-sky-950/60 border border-sky-800/40 px-1 rounded" title="Αυτόματη μετάφραση">
                                    ⚡ Auto-EN
                                  </span>
                                )}
                              </div>

                              <p className="text-xs text-slate-400 line-clamp-1 pt-0.5">
                                {quest.description}
                              </p>
                            </div>
                          </div>

                          {/* Right: Active Toggle, Full Edit & Remove from Team */}
                          <div className="flex items-center gap-2 shrink-0 pt-2 md:pt-0 border-t md:border-t-0 border-slate-800/60">
                            {/* Active toggle */}
                            <button
                              type="button"
                              onClick={() => onToggleQuestionActive(quest.id)}
                              className="px-2.5 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer bg-emerald-950/80 border border-emerald-500/60 text-emerald-300"
                              title={lang === 'el' ? 'Κλικ για απενεργοποίηση (μεταφορά στις ανενεργές στο κάτω μέρος)' : 'Click to deactivate (move to bottom)'}
                            >
                              <span className="w-2 h-2 rounded-full bg-emerald-400" />
                              <span>{lang === 'el' ? 'ΕΝΕΡΓΗ' : 'ACTIVE'}</span>
                            </button>

                            {/* Edit Button (Bilingual) */}
                            <button
                              type="button"
                              onClick={() => {
                                setEditingQuestion(quest);
                                setEditorInitialTab('both');
                              }}
                              className="px-3.5 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold flex items-center gap-1.5 transition-colors shadow-sm cursor-pointer"
                              title={lang === 'el' ? 'Επεξεργασία (Δίγλωσση Προβολή)' : 'Edit Quest (Bilingual)'}
                            >
                              <Edit3 className="w-3.5 h-3.5 text-slate-950" />
                              <span>{lang === 'el' ? 'Επεξεργασία' : 'Edit'}</span>
                            </button>

                            {/* Direct Final Editing Button for English */}
                            <button
                              type="button"
                              onClick={() => {
                                setEditingQuestion(quest);
                                setEditorInitialTab('en');
                              }}
                              className="px-3 py-1.5 rounded-xl bg-sky-950/80 hover:bg-sky-900 border border-sky-500/50 text-sky-300 text-xs font-bold flex items-center gap-1.5 transition-colors shadow-sm cursor-pointer"
                              title={lang === 'el' ? 'Απευθείας τελικό editing της Αγγλικής έκδοσης' : 'Direct final editing of English translation'}
                            >
                              <span>🇬🇧</span>
                              <span className="hidden sm:inline">{lang === 'el' ? 'Τελικό Editing' : 'Edit EN'}</span>
                            </button>

                            {/* Remove from this team */}
                            <button
                              type="button"
                              onClick={() => handleRemoveQuestionFromTeam(quest, activeTeam.id)}
                              className="p-1.5 rounded-xl bg-slate-800 text-slate-400 hover:text-rose-400 hover:bg-slate-700 transition-colors cursor-pointer"
                              title={lang === 'el' ? `Αφαίρεση από την ομάδα «${activeTeam.name}»` : `Remove from ${activeTeam.name}`}
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>

                {/* 2. INACTIVE QUESTIONS GROUPED AT THE BOTTOM */}
                {inactiveTeamQuestions.length > 0 && (
                  <div className="pt-6 mt-6 border-t-2 border-dashed border-slate-800/90 space-y-3">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between p-3.5 rounded-2xl bg-slate-950/80 border border-slate-800/80 gap-2">
                      <div className="flex items-center gap-2.5">
                        <div className="w-7 h-7 rounded-lg bg-slate-900 border border-slate-800 flex items-center justify-center text-sm shrink-0">
                          💤
                        </div>
                        <div>
                          <span className="text-xs font-bold text-slate-300 block">
                            {lang === 'el' ? 'Ανενεργές Ερωτήσεις Ομάδας (Στο κάτω μέρος)' : 'Inactive Team Quests (At the bottom)'}
                          </span>
                          <span className="text-[11px] text-slate-500">
                            {lang === 'el'
                              ? 'Ομαδοποιημένες ξεχωριστά στο κάτω μέρος. Δεν εμφανίζονται στους μαθητές μέχρι να ενεργοποιηθούν.'
                              : 'Grouped separately at the bottom. Hidden from players until activated.'}
                          </span>
                        </div>
                      </div>
                      <span className="px-2.5 py-1 rounded-full bg-slate-900 border border-slate-800 text-slate-400 font-mono text-xs font-bold self-start sm:self-auto">
                        {inactiveTeamQuestions.length} {lang === 'el' ? 'ανενεργές' : 'inactive'}
                      </span>
                    </div>

                    <div className="space-y-3">
                      {inactiveTeamQuestions.map((quest, index) => {
                        const assignedTeams = quest.assignedTeamIds && quest.assignedTeamIds.length > 0
                          ? gameState.teams.filter(t => quest.assignedTeamIds?.includes(t.id))
                          : gameState.teams;
                        const isShared = !quest.assignedTeamIds || quest.assignedTeamIds.length === 0 || quest.assignedTeamIds.length > 1;

                        return (
                          <div
                            key={quest.id}
                            className="p-4 rounded-2xl border border-dashed transition-all flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 bg-slate-950/50 border-slate-800/80 opacity-75 hover:opacity-100 hover:border-slate-700"
                          >
                            {/* Left: Reordering buttons within inactive & Inactive Icon */}
                            <div className="flex items-center gap-2.5 shrink-0">
                              <div className="flex flex-col items-center justify-center p-1 rounded-xl bg-slate-950 border border-slate-800 gap-1 shrink-0">
                                <button
                                  type="button"
                                  onClick={() => handleMoveInactiveTeamQuestion(activeTeam.id, index, 'up')}
                                  disabled={index === 0}
                                  className="p-1 rounded-lg hover:bg-slate-800 text-slate-500 hover:text-slate-300 disabled:opacity-20 cursor-pointer transition-colors"
                                  title={lang === 'el' ? 'Μετακίνηση Πάνω (στις ανενεργές)' : 'Move Up'}
                                >
                                  <ArrowUp className="w-4 h-4" />
                                </button>
                                <span className="text-xs font-mono text-slate-500 px-1 py-0.5 rounded bg-slate-900" title="Ανενεργή δραστηριότητα">
                                  💤
                                </span>
                                <button
                                  type="button"
                                  onClick={() => handleMoveInactiveTeamQuestion(activeTeam.id, index, 'down')}
                                  disabled={index === inactiveTeamQuestions.length - 1}
                                  className="p-1 rounded-lg hover:bg-slate-800 text-slate-500 hover:text-slate-300 disabled:opacity-20 cursor-pointer transition-colors"
                                  title={lang === 'el' ? 'Μετακίνηση Κάτω (στις ανενεργές)' : 'Move Down'}
                                >
                                  <ArrowDown className="w-4 h-4" />
                                </button>
                              </div>

                              {/* Quest Image or Video Thumbnail if exists */}
                              {quest.videoUrl ? (
                                <div className="w-14 h-14 rounded-xl overflow-hidden bg-purple-950/40 border border-purple-500/30 shrink-0 flex flex-col items-center justify-center text-purple-400 opacity-80" title={lang === 'el' ? 'Περιλαμβάνει Βίντεο' : 'Includes Video'}>
                                  <Film className="w-5 h-5" />
                                  <span className="text-[9px] font-bold">VIDEO</span>
                                </div>
                              ) : quest.imageUrl ? (
                                <div className="w-14 h-14 rounded-xl overflow-hidden bg-slate-950 border border-slate-800 shrink-0 flex items-center justify-center opacity-70">
                                  <img
                                    src={quest.imageUrl}
                                    alt="Quest thumb"
                                    className="w-full h-full object-cover"
                                    referrerPolicy="no-referrer"
                                  />
                                </div>
                              ) : null}
                            </div>

                            {/* Middle: Quest Title & Description */}
                            <div className="min-w-0 flex-1 space-y-1.5">
                              <div className="flex items-center gap-2 flex-wrap text-xs">
                                <span className="font-semibold text-slate-400 text-[11px] px-2 py-0.5 rounded bg-slate-900 border border-slate-800">
                                  {t[quest.type]}
                                </span>
                                <span className="font-mono text-slate-400 text-[11px]">
                                  {quest.points} {t.pts}
                                </span>
                                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-900 border border-slate-800 text-slate-400">
                                  {lang === 'el' ? '💤 ΑΝΕΝΕΡΓΗ' : '💤 INACTIVE'}
                                </span>

                                {isShared ? (
                                  <span className="text-[11px] text-slate-400 flex items-center gap-1 px-2 py-0.5 rounded bg-slate-900 border border-slate-800">
                                    <span>🌐</span>
                                    <span>{lang === 'el' ? `Κοινή (${assignedTeams.length} ομάδες)` : `Shared (${assignedTeams.length})`}</span>
                                  </span>
                                ) : (
                                  <span className="text-[11px] text-slate-400 flex items-center gap-1 px-2 py-0.5 rounded bg-slate-900 border border-slate-800">
                                    <span>🔒</span>
                                    <span>{lang === 'el' ? `Μόνο για ${activeTeam.name.split(':')[0]}` : `Exclusive`}</span>
                                  </span>
                                )}
                              </div>

                              <div className="space-y-0.5">
                                <h4 className="text-sm font-semibold text-slate-300 leading-snug">
                                  {quest.title}
                                </h4>
                                <p className="text-xs text-slate-500 line-clamp-1">
                                  {quest.description}
                                </p>
                              </div>
                            </div>

                            {/* Right: Reactivate button, Edit & Remove */}
                            <div className="flex items-center gap-2 shrink-0 pt-2 md:pt-0 border-t md:border-t-0 border-slate-800/60">
                              {/* Activate button */}
                              <button
                                type="button"
                                onClick={() => onToggleQuestionActive(quest.id)}
                                className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-emerald-950/80 hover:border-emerald-500/60 hover:text-emerald-300 border border-slate-700 text-slate-300 text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer"
                                title={lang === 'el' ? 'Ενεργοποίηση (μεταφορά στις ενεργές δραστηριότητες πάνω)' : 'Activate (move to top)'}
                              >
                                <span>🔄</span>
                                <span>{lang === 'el' ? 'Ενεργοποίηση' : 'Activate'}</span>
                              </button>

                              {/* Edit Button */}
                              <button
                                type="button"
                                onClick={() => {
                                  setEditingQuestion(quest);
                                  setEditorInitialTab('both');
                                }}
                                className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                                title={lang === 'el' ? 'Επεξεργασία' : 'Edit'}
                              >
                                <Edit3 className="w-3.5 h-3.5" />
                                <span>{lang === 'el' ? 'Επεξεργασία' : 'Edit'}</span>
                              </button>

                              {/* Remove from this team */}
                              <button
                                type="button"
                                onClick={() => handleRemoveQuestionFromTeam(quest, activeTeam.id)}
                                className="p-1.5 rounded-xl bg-slate-800 text-slate-400 hover:text-rose-400 hover:bg-slate-700 transition-colors cursor-pointer"
                                title={lang === 'el' ? `Αφαίρεση από την ομάδα «${activeTeam.name}»` : `Remove from ${activeTeam.name}`}
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        ) : (
          /* VIEW B: ALL QUESTIONS OVERVIEW (Paginated 10 per page) */
          <div className="space-y-4">
            {(() => {
              const allSorted = [
                ...gameState.questions.filter((q) => q.isActive !== false),
                ...gameState.questions.filter((q) => q.isActive === false)
              ];
              const totalPages = Math.max(1, Math.ceil(allSorted.length / allQuestionsPageSize));
              const safePage = Math.min(allQuestionsPage, totalPages);
              const start = (safePage - 1) * allQuestionsPageSize;
              const end = Math.min(start + allQuestionsPageSize, allSorted.length);
              const pagedQuestions = allSorted.slice(start, end);

              return (
                <>
                  <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-3 rounded-2xl bg-slate-900 border border-slate-800 text-xs">
                    <div className="text-slate-400 font-medium">
                      {lang === 'el'
                        ? `Εμφάνιση ${allSorted.length > 0 ? start + 1 : 0}-${end} από ${allSorted.length} ερωτήσεις`
                        : `Showing ${allSorted.length > 0 ? start + 1 : 0}-${end} of ${allSorted.length} questions`}
                      <span className="text-slate-600 ml-2">· (10 ανά σελίδα)</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => setAllQuestionsPage(p => Math.max(1, p - 1))}
                        disabled={safePage <= 1}
                        className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 disabled:opacity-30 disabled:cursor-not-allowed font-bold flex items-center gap-1 cursor-pointer transition-colors shadow-xs"
                      >
                        <ChevronLeft className="w-4 h-4" />
                        <span>{lang === 'el' ? 'Προηγούμενη' : 'Prev'}</span>
                      </button>
                      <span className="font-mono font-bold text-amber-400 px-3 py-1 rounded-lg bg-slate-950 border border-slate-800">
                        {safePage} / {totalPages}
                      </span>
                      <button
                        type="button"
                        onClick={() => setAllQuestionsPage(p => Math.min(totalPages, p + 1))}
                        disabled={safePage >= totalPages}
                        className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 disabled:opacity-30 disabled:cursor-not-allowed font-bold flex items-center gap-1 cursor-pointer transition-colors shadow-xs"
                      >
                        <span>{lang === 'el' ? 'Επόμενη' : 'Next'}</span>
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                    {pagedQuestions.map((quest, index) => {
                      const globalIndex = start + index;
              const isActive = quest.isActive !== false;
              const assignedTeams = quest.assignedTeamIds && quest.assignedTeamIds.length > 0
                ? gameState.teams.filter(t => quest.assignedTeamIds?.includes(t.id))
                : gameState.teams;
              const isAll = !quest.assignedTeamIds || quest.assignedTeamIds.length === 0 || quest.assignedTeamIds.length === gameState.teams.length;

              return (
                <div
                  key={quest.id}
                  className={`p-4 rounded-2xl border transition-all flex flex-col justify-between gap-3 ${
                    isActive
                      ? 'bg-slate-900 border-slate-800 shadow-sm hover:border-slate-700'
                      : 'bg-slate-950/60 border-slate-800/60 opacity-65'
                  }`}
                >
                  <div>
                    {/* Top line: Index, Type, Points, and Active Switch */}
                    <div className="flex items-center justify-between gap-2 text-xs mb-2">
                      <div className="flex items-center gap-2">
                        <span className={`w-5 h-5 rounded-md font-mono text-[11px] flex items-center justify-center font-bold ${
                          isActive ? 'bg-slate-800 text-amber-400' : 'bg-slate-900 text-slate-500 border border-slate-800'
                        }`}>
                          {isActive ? index + 1 : '💤'}
                        </span>
                        <span className="font-semibold text-cyan-400 text-[11px]">{t[quest.type]}</span>
                        <span className="text-slate-600">·</span>
                        <span className="font-mono text-amber-400 font-bold text-[11px]">{quest.points} {t.pts}</span>
                      </div>

                      {/* Enable/Disable Quick Toggle Switch */}
                      <button
                        type="button"
                        onClick={() => onToggleQuestionActive(quest.id)}
                        className={`px-2.5 py-1 rounded-lg text-[11px] font-bold flex items-center gap-1.5 transition-all ${
                          isActive
                            ? 'bg-emerald-950/80 border border-emerald-500/60 text-emerald-300'
                            : 'bg-slate-800 border border-slate-700 text-slate-400'
                        }`}
                        title={lang === 'el' ? 'Κλικ για ενεργοποίηση/απενεργοποίηση' : 'Toggle active'}
                      >
                        <span className={`w-2 h-2 rounded-full ${isActive ? 'bg-emerald-400' : 'bg-slate-500'}`} />
                        <span>{isActive ? (lang === 'el' ? 'ΕΝΕΡΓΗ' : 'ACTIVE') : (lang === 'el' ? 'ΑΝΕΝΕΡΓΗ' : 'DISABLED')}</span>
                      </button>
                    </div>

                    {/* Title & Preview Image */}
                    <div className="flex items-start gap-3">
                      {quest.videoUrl ? (
                        <div className="w-14 h-14 rounded-xl overflow-hidden bg-purple-950/70 border border-purple-500/50 shrink-0 flex flex-col items-center justify-center text-purple-300 shadow-sm" title={lang === 'el' ? 'Περιλαμβάνει Βίντεο' : 'Includes Video'}>
                          <Film className="w-5 h-5 text-purple-400" />
                          <span className="text-[9px] font-bold">VIDEO</span>
                        </div>
                      ) : quest.imageUrl ? (
                        <div className="w-14 h-14 rounded-xl overflow-hidden bg-slate-950 border border-slate-800 shrink-0 flex items-center justify-center">
                          <img
                            src={quest.imageUrl}
                            alt="Quest thumb"
                            className="w-full h-full object-cover"
                            referrerPolicy="no-referrer"
                          />
                        </div>
                      ) : null}
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <h4 className="text-xs font-bold text-slate-100 leading-snug line-clamp-2">
                            {lang === 'en'
                              ? quest.title_en || translateGreekToEnglish(quest.title)
                              : quest.title}
                          </h4>
                          {quest.title_en ? (
                            <span className="text-[9px] text-emerald-400 font-mono bg-emerald-950/60 border border-emerald-800/40 px-1 py-0.2 rounded">
                              🇬🇧 EN
                            </span>
                          ) : (
                            <span className="text-[9px] text-sky-400 font-mono bg-sky-950/60 border border-sky-800/40 px-1 py-0.2 rounded" title="Auto-translated from Greek">
                              ⚡ Auto
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] text-slate-400 line-clamp-1 mt-0.5">
                          {lang === 'en'
                            ? quest.description_en || translateGreekToEnglish(quest.description)
                            : quest.description}
                        </p>
                      </div>
                    </div>

                    {/* Assigned Teams Badge Bar */}
                    <div className="mt-3 pt-2.5 border-t border-slate-800/80 flex items-center gap-1.5 flex-wrap">
                      <span className="text-[10px] text-slate-500 font-semibold uppercase">
                        {lang === 'el' ? 'Ομάδες:' : 'Teams:'}
                      </span>
                      {isAll ? (
                        <span className="text-[11px] text-slate-300 font-medium px-2 py-0.5 rounded-md bg-slate-800/80 border border-slate-700">
                          {lang === 'el' ? 'Όλες οι Ομάδες' : 'All Teams'}
                        </span>
                      ) : (
                        assignedTeams.map((tm) => (
                          <span
                            key={tm.id}
                            className="text-[11px] text-slate-200 font-medium px-1.5 py-0.5 rounded-md bg-slate-800/90 border border-slate-700 flex items-center gap-1"
                          >
                            <span>{tm.avatar}</span>
                            <span>{tm.name.split(':')[0]}</span>
                          </span>
                        ))
                      )}
                    </div>
                  </div>

                  {/* Card Actions: Edit & Delete */}
                  <div className="flex items-center justify-end gap-2 pt-1 border-t border-slate-800/60">
                    <button
                      type="button"
                      onClick={() => {
                        setEditingQuestion(quest);
                        setEditorInitialTab('both');
                      }}
                      className="px-3.5 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold flex items-center gap-1.5 transition-colors shadow-sm cursor-pointer"
                    >
                      <Edit3 className="w-3.5 h-3.5 text-slate-950" />
                      <span>{lang === 'el' ? '✏️ Επεξεργασία' : '✏️ Edit'}</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setEditingQuestion(quest);
                        setEditorInitialTab('en');
                      }}
                      className="px-3 py-1.5 rounded-xl bg-sky-950/80 hover:bg-sky-900 border border-sky-500/50 text-sky-300 text-xs font-bold flex items-center gap-1.5 transition-colors shadow-sm cursor-pointer"
                      title={lang === 'el' ? 'Απευθείας τελικό editing της Αγγλικής έκδοσης' : 'Direct final editing of English translation'}
                    >
                      <span>🇬🇧</span>
                      <span className="hidden sm:inline">{lang === 'el' ? 'Τελικό Editing' : 'Edit EN'}</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => onDeleteQuestion(quest.id)}
                      className="p-1.5 rounded-xl bg-slate-800 text-slate-400 hover:text-rose-400 hover:bg-slate-700 transition-colors cursor-pointer"
                      title={t.deleteQuestion}
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
                  {totalPages > 1 && (
                    <div className="flex justify-end pt-2">
                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => setAllQuestionsPage(p => Math.max(1, p - 1))}
                          disabled={safePage <= 1}
                          className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 disabled:opacity-30 disabled:cursor-not-allowed font-bold flex items-center gap-1 cursor-pointer transition-colors text-xs shadow-xs"
                        >
                          <ChevronLeft className="w-4 h-4" />
                          <span>{lang === 'el' ? 'Προηγούμενη' : 'Prev'}</span>
                        </button>
                        <span className="font-mono font-bold text-amber-400 px-3 py-1 rounded-lg bg-slate-950 border border-slate-800 text-xs">
                          {safePage} / {totalPages}
                        </span>
                        <button
                          type="button"
                          onClick={() => setAllQuestionsPage(p => Math.min(totalPages, p + 1))}
                          disabled={safePage >= totalPages}
                          className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 disabled:opacity-30 disabled:cursor-not-allowed font-bold flex items-center gap-1 cursor-pointer transition-colors text-xs shadow-xs"
                        >
                          <span>{lang === 'el' ? 'Επόμενη' : 'Next'}</span>
                          <ChevronRight className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  )}
                </>
              );
            })()}
          </div>
        )}
      </div>

      {/* Advanced Batch Station Rotation Tool */}
      <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h3 className="text-xs font-bold text-slate-200 flex items-center gap-2">
            <span>🔁 {t.stationRotation}</span>
          </h3>
          <p className="text-[11px] text-slate-400 mt-0.5">
            {t.stationRotationDesc}
          </p>
        </div>
        <button
          type="button"
          onClick={() => {
            onApplyStationRotation();
            setResetNotification(
              lang === 'el' ? 'Η κυκλική εναλλαγή σταθμών εφαρμόστηκε στις ομάδες!' : 'Staggered rotation applied!'
            );
            setTimeout(() => setResetNotification(null), 3500);
          }}
          className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-cyan-300 hover:text-cyan-200 border border-slate-700 text-xs font-bold flex items-center gap-1.5 cursor-pointer shrink-0"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>{lang === 'el' ? 'Εφαρμογή Εναλλαγής Σταθμών' : 'Apply Rotation'}</span>
        </button>
      </div>

      {/* Teams Manager */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-sm font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
              <span>{t.manageTeams}</span>
              <span className="text-xs text-slate-500 font-normal">({gameState.teams.length})</span>
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              {lang === 'el'
                ? 'Κάντε κλικ στο «Αλλαγή» σε οποιαδήποτε ομάδα για να αλλάξετε το όνομα, το σύνθημα, το avatar ή το χρώμα της.'
                : 'Click "Edit" on any team to change its name, slogan, avatar emoji, or theme color.'}
            </p>
          </div>
          <button
            type="button"
            onClick={() => setEditingTeam('new')}
            className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs border border-slate-700 flex items-center gap-1.5 transition-colors cursor-pointer shrink-0"
          >
            <Plus className="w-4 h-4 text-amber-400" />
            <span>{t.addTeam}</span>
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
          {gameState.teams.map((tm) => (
            <div
              key={tm.id}
              className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between gap-2 shadow-sm hover:border-slate-700 transition-colors"
              style={{ borderLeft: `4px solid ${tm.color}` }}
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <span className="text-xl p-1.5 rounded-xl bg-slate-800/80 border border-slate-700/60 shrink-0">
                  {tm.avatar}
                </span>
                <div className="min-w-0">
                  <h4 className="text-xs font-bold text-slate-100 truncate" title={tm.name}>
                    {tm.name}
                  </h4>
                  <div className="flex items-center gap-1.5 text-[10px] text-slate-400">
                    <span className="truncate">{tm.slogan || (lang === 'el' ? 'Χωρίς σύνθημα' : 'No slogan')}</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-1 shrink-0">
                <button
                  type="button"
                  onClick={() => setEditingTeam(tm)}
                  className="px-2 py-1 rounded-lg bg-slate-800 hover:bg-amber-500 hover:text-slate-950 text-amber-400 text-[11px] font-bold border border-slate-700 hover:border-amber-400 transition-all flex items-center gap-1 cursor-pointer"
                  title={lang === 'el' ? `Αλλαγή ονόματος & στοιχείων για: ${tm.name}` : `Edit details for: ${tm.name}`}
                >
                  <Edit3 className="w-3 h-3" />
                  <span>{lang === 'el' ? 'Αλλαγή' : 'Edit'}</span>
                </button>

                {gameState.teams.length > 2 && (
                  <button
                    type="button"
                    onClick={() => onDeleteTeam(tm.id)}
                    className="p-1.5 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 transition-colors cursor-pointer shrink-0"
                    title={t.delete}
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Modal: Add or Edit Question */}
      {editingQuestion && (
        <QuestionEditorModal
          question={editingQuestion === 'new' ? null : editingQuestion}
          teams={gameState.teams}
          lang={lang}
          initialTeamId={selectedTeamTab !== 'all' ? selectedTeamTab : undefined}
          initialTab={(editingQuestion as any)?._openTab || editorInitialTab}
          onSave={(savedQuestion) => {
            if (editingQuestion === 'new') {
              onAddQuestion(savedQuestion);
              // If added while on a specific team tab, append to this team's sequence
              if (selectedTeamTab !== 'all') {
                const existingOrdered = getTeamOrderedQuestions(
                  activeTeam || ({ id: selectedTeamTab } as any),
                  gameState.questions,
                  gameState.teamQuestionOrders,
                  true
                ).map((q) => q.id);
                if (!existingOrdered.includes(savedQuestion.id)) {
                  onSetTeamQuestionOrder(selectedTeamTab, [...existingOrdered, savedQuestion.id]);
                }
              }
            } else {
              onUpdateQuestion(savedQuestion);
            }
            setEditingQuestion(null);
          }}
          onClose={() => setEditingQuestion(null)}
        />
      )}

      {/* Modal: Add or Edit Team */}
      {editingTeam && (
        <TeamEditorModal
          team={editingTeam === 'new' ? null : editingTeam}
          isOpen={!!editingTeam}
          lang={lang}
          onClose={() => setEditingTeam(null)}
          onSave={(savedTeam) => {
            if (editingTeam === 'new') {
              onAddTeam(savedTeam);
            } else {
              onUpdateTeam(savedTeam);
            }
            setEditingTeam(null);
          }}
        />
      )}

      {/* Modal: QR Printable Station Badges */}
      {showQrPrintModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md animate-fadeIn print:p-0 print:bg-white">
          <div className="w-full max-w-3xl max-h-[90vh] overflow-y-auto rounded-2xl bg-slate-900 border border-slate-800 p-6 space-y-5 print:border-none print:bg-white print:text-black">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4 print:hidden">
              <div>
                <h3 className="font-bold text-slate-100 text-base flex items-center gap-2">
                  <QrCode className="w-5 h-5 text-purple-400" />
                  <span>{t.printQrStationCards}</span>
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">{t.qrStationCardsHelp}</p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => window.print()}
                  className="px-3.5 py-1.5 rounded-xl bg-amber-500 text-slate-950 text-xs font-bold flex items-center gap-1.5"
                >
                  <Printer className="w-4 h-4" />
                  <span>Εκτύπωση</span>
                </button>
                <button
                  type="button"
                  onClick={() => setShowQrPrintModal(false)}
                  className="p-1.5 rounded-xl bg-slate-800 text-slate-400 hover:text-white"
                >
                  ✕
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {qrQuestions.map((q) => {
                const targetCode = (q.payload as any).targetCode || 'BOUND-QUEST';
                return (
                  <div
                    key={q.id}
                    className="p-5 rounded-2xl border-2 border-dashed border-slate-700 bg-slate-950 flex flex-col items-center text-center space-y-3 print:border-black print:bg-white print:text-black"
                  >
                    <div className="px-3 py-1 rounded-full bg-amber-500/10 text-amber-400 text-xs font-bold uppercase tracking-wider print:border print:border-black print:text-black">
                      Σταθμός Αποστολής / Station
                    </div>
                    <h4 className="font-bold text-sm text-slate-200 print:text-black">{q.title}</h4>

                    {/* Genuine scannable QR Code */}
                    <div className="p-2 bg-white rounded-xl shadow-md border border-slate-200 flex items-center justify-center">
                      <ScannableQrImage value={targetCode} size={150} />
                    </div>

                    <div className="font-mono text-xs font-black tracking-widest text-amber-400 bg-slate-900 px-3 py-1.5 rounded-lg border border-slate-800 print:bg-slate-100 print:text-black">
                      CODE: {targetCode}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Browser Snapshot History Recovery Modal */}
      {showHistoryModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-lg p-6 shadow-2xl flex flex-col max-h-[85vh]">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <RotateCcw className="w-5 h-5 text-purple-400" />
                <h3 className="text-lg font-bold text-slate-100">
                  {lang === 'el' ? 'Ανάκτηση από Ιστορικό Στιγμιοτύπων' : 'Restore from Snapshot History'}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setShowHistoryModal(false)}
                className="p-1 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-slate-200 cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Create New Checkpoint Section */}
            <div className="mt-3 mb-4 p-3.5 rounded-xl bg-slate-950/70 border border-slate-800 space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
                  <Camera className="w-3.5 h-3.5 text-emerald-400" />
                  {lang === 'el' ? 'Δημιουργία Νέου Checkpoint Τώρα' : 'Create New Checkpoint Now'}
                </span>
                <span className="text-[10px] text-slate-400 font-mono">
                  {gameState.questions?.length || 0} {lang === 'el' ? 'δραστηριότητες' : 'activities'}
                </span>
              </div>

              <div className="flex gap-2">
                <input
                  type="text"
                  value={newCheckpointName}
                  onChange={(e) => setNewCheckpointName(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleCreateManualCheckpoint(newCheckpointName);
                    }
                  }}
                  placeholder={
                    lang === 'el'
                      ? 'Όνομα σημείου (π.χ. Πριν τις αλλαγές, Ομάδα Α...)'
                      : 'Checkpoint name (e.g. Before shuffle, Team A...)'
                  }
                  className="flex-1 p-2 rounded-lg bg-slate-900 border border-slate-700 text-xs text-slate-200 focus:outline-none focus:border-emerald-500"
                />

                <button
                  type="button"
                  onClick={() => handleCreateManualCheckpoint(newCheckpointName)}
                  disabled={isSavingCheckpoint}
                  className="px-3.5 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 active:scale-95 text-white font-bold text-xs flex items-center gap-1.5 shadow-md cursor-pointer transition-all disabled:opacity-50 shrink-0"
                >
                  <Camera className="w-3.5 h-3.5" />
                  <span>{lang === 'el' ? '📸 Αποθήκευση' : '📸 Save'}</span>
                </button>
              </div>

              <p className="text-[10px] text-slate-400 leading-relaxed">
                {lang === 'el'
                  ? 'Αποθηκεύει ολόκληρη την τρέχουσα κατάσταση (ερωτήσεις, ομάδες, ρυθμίσεις) ως ανεξάρτητο σημείο επαναφοράς.'
                  : 'Saves the entire current game state (questions, teams, settings) as an independent restore point.'}
              </p>
            </div>

            {/* Checkpoints List */}
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-slate-300">
                {lang === 'el' ? 'Αποθηκευμένα Στιγμιότυπα & Checkpoints:' : 'Stored Snapshots & Checkpoints:'}
              </span>
              <span className="text-[10px] text-purple-300 font-mono">
                {snapshots.length} {lang === 'el' ? 'διαθέσιμα' : 'available'}
              </span>
            </div>

            <div className="flex-1 overflow-y-auto space-y-2 pr-1 min-h-[160px] max-h-[340px]">
              {snapshots.length === 0 ? (
                <div className="text-center py-8 px-4 rounded-xl bg-slate-950/40 border border-slate-800 text-slate-500 text-xs space-y-2">
                  <p>{lang === 'el' ? 'Δεν υπάρχουν ακόμη καταγεγραμμένα σημεία επαναφοράς.' : 'No snapshots recorded yet.'}</p>
                  <button
                    type="button"
                    onClick={() => handleCreateManualCheckpoint()}
                    className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs cursor-pointer transition-all"
                  >
                    {lang === 'el' ? '📸 Δημιουργήστε το 1ο Checkpoint' : '📸 Create 1st Checkpoint'}
                  </button>
                </div>
              ) : (
                snapshots
                  .slice()
                  .reverse()
                  .map((snap) => {
                    const isManual = snap.isManual || (snap.label && !snap.label.startsWith('Αυτόματο'));
                    return (
                      <div
                        key={snap.timestamp}
                        className="p-3 rounded-xl bg-slate-800/60 border border-slate-700/80 hover:border-purple-500/50 transition-all flex flex-col gap-2"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="space-y-1">
                            <div className="flex items-center gap-1.5 flex-wrap">
                              <span className="text-xs font-bold text-slate-200">
                                {new Date(snap.timestamp).toLocaleString(lang === 'el' ? 'el-GR' : 'en-US')}
                              </span>
                              <span
                                className={`text-[10px] px-1.5 py-0.5 rounded-md font-mono ${
                                  isManual
                                    ? 'bg-emerald-950 border border-emerald-500/40 text-emerald-300'
                                    : 'bg-slate-900 border border-slate-700 text-slate-400'
                                }`}
                              >
                                {isManual ? '📸 Χειροκίνητο' : '🔄 Αυτόματο'}
                              </span>
                            </div>

                            {snap.label && (
                              <p className="text-xs text-purple-300 font-medium leading-snug">
                                {snap.label}
                              </p>
                            )}

                            <div className="text-[11px] text-slate-400">
                              {snap.state.questions?.length || 0} {lang === 'el' ? 'δραστηριότητες' : 'activities'} • {snap.state.teams?.length || 0} {lang === 'el' ? 'ομάδες' : 'teams'}
                            </div>
                          </div>

                          {/* Actions */}
                          <div className="flex items-center gap-1.5 shrink-0">
                            <button
                              type="button"
                              onClick={() => {
                                syncService.exportCheckpoint(snap);
                              }}
                              className="p-1.5 rounded-lg bg-slate-700 hover:bg-slate-600 text-slate-300 hover:text-white transition-colors cursor-pointer"
                              title={lang === 'el' ? 'Λήψη αντιγράφου JSON' : 'Export JSON backup'}
                            >
                              <Download className="w-3.5 h-3.5 text-sky-400" />
                            </button>

                            <button
                              type="button"
                              onClick={() => handleDeleteSnapshot(snap.timestamp)}
                              className="p-1.5 rounded-lg bg-slate-700 hover:bg-rose-900/60 text-slate-400 hover:text-rose-300 transition-colors cursor-pointer"
                              title={lang === 'el' ? 'Διαγραφή Checkpoint' : 'Delete Checkpoint'}
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>

                            <button
                              type="button"
                              onClick={() => {
                                if (onRestoreBackup) {
                                  onRestoreBackup(snap.state);
                                  setShowHistoryModal(false);
                                  setResetNotification(
                                    lang === 'el'
                                      ? `✓ Επιτυχής επαναφορά στο σημείο: ${snap.label || 'Checkpoint'}!`
                                      : `✓ Restored checkpoint: ${snap.label || 'Checkpoint'}!`
                                  );
                                  setTimeout(() => setResetNotification(null), 4000);
                                }
                              }}
                              className="px-3 py-1.5 rounded-lg bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs cursor-pointer transition-colors shadow-sm"
                            >
                              {lang === 'el' ? 'Επαναφορά' : 'Restore'}
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })
              )}
            </div>

            {/* Modal Footer */}
            <div className="pt-3 border-t border-slate-800 mt-3 flex items-center justify-between">
              {snapshots.length > 0 ? (
                <button
                  type="button"
                  onClick={handleClearAllSnapshots}
                  className="text-[11px] text-slate-500 hover:text-rose-400 transition-colors cursor-pointer"
                >
                  {lang === 'el' ? '🗑️ Καθαρισμός Ιστορικού' : '🗑️ Clear History'}
                </button>
              ) : (
                <span className="text-[11px] text-slate-500">
                  {lang === 'el' ? '0 σημεία επαναφοράς' : '0 checkpoints'}
                </span>
              )}

              <button
                type="button"
                onClick={() => setShowHistoryModal(false)}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold cursor-pointer transition-colors"
              >
                {lang === 'el' ? 'Κλείσιμο' : 'Close'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
