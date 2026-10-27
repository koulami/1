import React, { useState, useMemo, useEffect } from 'react';
import {
  ShieldCheck,
  ShieldAlert,
  Download,
  Upload,
  RotateCcw,
  CheckCircle2,
  XCircle,
  Search,
  Filter,
  Eye,
  EyeOff,
  FileSpreadsheet,
  FileJson,
  Layers,
  Sparkles,
  Lock,
  Unlock,
  KeyRound,
  Trash2,
  RefreshCw,
  X,
  Compass,
  Zap,
  Rocket,
  Microscope,
  Info,
  Check,
  Plus,
  Play,
  Pause,
  Clock,
  Sliders,
  HelpCircle,
  Image as ImageIcon,
  Film,
  Camera,
  QrCode,
  Puzzle,
  Award
} from 'lucide-react';
import { Question, Team, Submission, QuestionType } from '../types/game';
import {
  masterTeamsPool,
  isTaskActive,
  isCheckpointTask,
  getCheckpointMetadata,
  getAllTasks,
  computeTeamTaskStats
} from '../data/masterTaskPool';
import { storageService } from '../services/storageService';
import { exportService } from '../services/exportService';
import { TaskVisualEditForm } from './TaskVisualEditForm';
import { processLocalFile } from '../utils/fileUploadHelper';

interface AdminConsoleProps {
  lang: 'el' | 'en';
  submissions: Record<string, Submission>;
  taskOverrides: Record<string, boolean>;
  customQuestions?: Record<string, Question>;
  onUpdateTaskOverrides: (overrides: Record<string, boolean>) => void;
  onSaveCustomQuestion?: (question: Question) => void;
  onResetCustomQuestion?: (questionId: string) => void;
  onResetAllSubmissions: () => void;
  onResetTeamSubmissions: (teamId: string) => void;
  onRestoreStateFromJson?: (jsonString: string) => boolean;
  synthesisNotes: any[];
  onClose: () => void;
  onToggleLang?: (newLang: 'el' | 'en') => void;
}

export const AdminConsole: React.FC<AdminConsoleProps> = ({
  lang,
  submissions,
  taskOverrides,
  customQuestions = {},
  onUpdateTaskOverrides,
  onSaveCustomQuestion,
  onResetCustomQuestion,
  onResetAllSubmissions,
  onResetTeamSubmissions,
  onRestoreStateFromJson,
  synthesisNotes,
  onClose,
  onToggleLang
}) => {
  const isEl = lang === 'el';

  // Authentication State
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    return storageService.isAdminAuthenticated();
  });
  const [passwordInput, setPasswordInput] = useState<string>('');
  const [authError, setAuthError] = useState<string | null>(null);

  // Active Admin Tab: 'pool' | 'create' | 'lobby_timer' | 'export' | 'teams'
  const [activeTab, setActiveTab] = useState<'pool' | 'create' | 'lobby_timer' | 'export' | 'teams'>('pool');

  // Filter states for Master Pool view
  const [poolFilterStatus, setPoolFilterStatus] = useState<'all' | 'active' | 'inactive'>('all');
  const [selectedGroup, setSelectedGroup] = useState<string>('all');
  const [selectedType, setSelectedType] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [expandedTaskId, setExpandedTaskId] = useState<string | null>(null);

  // Lobby and Timers state
  const [isGameStarted, setIsGameStarted] = useState<boolean>(() => {
    return storageService.getGameStarted();
  });
  const [groupTimers, setGroupTimers] = useState<Record<string, number>>(() => {
    return storageService.getGroupTimers();
  });

  // State for "Προσθήκη Νέας Δραστηριότητας" (Add New Task) Form
  const [newTitle, setNewTitle] = useState<string>('');
  const [newTitleEn, setNewTitleEn] = useState<string>('');
  const [newDesc, setNewDesc] = useState<string>('');
  const [newDescEn, setNewDescEn] = useState<string>('');
  const [newType, setNewType] = useState<QuestionType>('multiple_choice');
  const [newPoints, setNewPoints] = useState<number>(100);
  const [newTimeLimit, setNewTimeLimit] = useState<number>(0);
  const [newAssignedTeams, setNewAssignedTeams] = useState<string[]>(['team-alpha']);
  const [newExplanation, setNewExplanation] = useState<string>('');
  const [newExplanationEn, setNewExplanationEn] = useState<string>('');
  const [newMediaUrl, setNewMediaUrl] = useState<string>('');
  const [newVideoUrl, setNewVideoUrl] = useState<string>('');
  const [newMediaTab, setNewMediaTab] = useState<'image' | 'video' | 'none'>('image');

  // Type-specific state for New Task form
  const [newMcOptions, setNewMcOptions] = useState<string[]>([
    isEl ? 'Πρώτη επιλογή' : 'First option',
    isEl ? 'Δεύτερη επιλογή' : 'Second option',
    isEl ? 'Τρίτη επιλογή' : 'Third option',
    isEl ? 'Τέταρτη επιλογή' : 'Fourth option'
  ]);
  const [newMcCorrectIndices, setNewMcCorrectIndices] = useState<number[]>([0]);
  const [newTfCorrect, setNewTfCorrect] = useState<boolean>(true);
  const [newTmPairs, setNewTmPairs] = useState<{ left: string; right: string }[]>([
    { left: isEl ? 'Όρος 1' : 'Term 1', right: isEl ? 'Ορισμός 1' : 'Definition 1' },
    { left: isEl ? 'Όρος 2' : 'Term 2', right: isEl ? 'Ορισμός 2' : 'Definition 2' }
  ]);
  const [newImPairs, setNewImPairs] = useState<{ image: string; text: string }[]>([
    {
      image: 'https://images.unsplash.com/photo-1549608276-5786777e6587?auto=format&fit=crop&w=1200&q=80',
      text: isEl ? 'Όρνιο σε πτήση' : 'Vulture in flight'
    }
  ]);
  const [newPhotoInstructions, setNewPhotoInstructions] = useState<string>(
    isEl ? 'Καταγράψτε και ανεβάστε φωτογραφία ή βίντεο τεκμηρίου παρατήρησης.' : 'Capture and upload field photo or video evidence.'
  );
  const [newAcceptedTypes, setNewAcceptedTypes] = useState<'photo' | 'video' | 'both'>('both');
  const [newChecklist, setNewChecklist] = useState<string[]>([
    isEl ? 'Βήμα 1: Εντοπισμός σημείου' : 'Step 1: Locate station',
    isEl ? 'Βήμα 2: Καταγραφή μετρήσεων' : 'Step 2: Record metrics'
  ]);
  const [newQrCode, setNewQrCode] = useState<string>('VULTURE-PARK-STATION-NEW');
  const [newQrHint, setNewQrHint] = useState<string>(isEl ? 'Σταθμός Πάρκου' : 'Park Station');
  const [newPuzzleImage, setNewPuzzleImage] = useState<string>(
    'https://images.unsplash.com/photo-1549608276-5786777e6587?auto=format&fit=crop&w=1200&q=80'
  );
  const [newPuzzlePieces, setNewPuzzlePieces] = useState<4 | 6 | 9>(6);

  // Status notifications
  const [notification, setNotification] = useState<{ text: string; type: 'success' | 'info' | 'error' } | null>(null);

  const showNotification = (text: string, type: 'success' | 'info' | 'error' = 'success') => {
    setNotification({ text, type });
    setTimeout(() => setNotification(null), 3500);
  };

  // Password Verification
  const handleLogin = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const cleanPass = passwordInput.trim().toLowerCase();
    if (cleanPass === 'admin' || cleanPass === 'admin123' || cleanPass === 'vulture2026' || cleanPass === 'gyps') {
      setIsAuthenticated(true);
      storageService.setAdminAuthenticated(true);
      setAuthError(null);
      setPasswordInput('');
    } else {
      setAuthError(isEl ? 'Λανθασμένος κωδικός πρόσβασης. Δοκιμάστε admin123 ή vulture2026.' : 'Incorrect password. Try admin123 or vulture2026.');
    }
  };

  const handleFastPass = () => {
    setIsAuthenticated(true);
    storageService.setAdminAuthenticated(true);
    setAuthError(null);
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    storageService.setAdminAuthenticated(false);
  };

  // Compute stats with custom task overrides
  const allTasks = useMemo(() => getAllTasks(customQuestions), [customQuestions]);
  const activeCount = useMemo(() => {
    return allTasks.filter((t) => isTaskActive(t, taskOverrides)).length;
  }, [allTasks, taskOverrides]);
  const inactiveCount = allTasks.length - activeCount;

  // Single Task Active Toggle
  const handleToggleTask = (taskId: string) => {
    const currentActive = isTaskActive(
      allTasks.find((t) => t.id === taskId)!,
      taskOverrides
    );
    const newOverrides = {
      ...taskOverrides,
      [taskId]: !currentActive
    };
    onUpdateTaskOverrides(newOverrides);
    storageService.saveTaskActiveOverride(taskId, !currentActive);
    showNotification(
      isEl
        ? `Η αποστολή ${taskId} τέθηκε σε ${!currentActive ? 'ΕΝΕΡΓΗ' : 'ΑΝΕΝΕΡΓΗ (Pool)'}`
        : `Task ${taskId} set to ${!currentActive ? 'ACTIVE' : 'INACTIVE (Pool)'}`,
      'info'
    );
  };

  // Quick Group Re-assignment Toggle for a Task
  const handleToggleTaskGroup = (task: Question, targetTeamId: string) => {
    let newAssigned: string[];
    const current = task.assignedTeamIds || [];

    if (targetTeamId === 'all') {
      newAssigned = [];
    } else {
      if (current.includes(targetTeamId)) {
        newAssigned = current.filter((id) => id !== targetTeamId);
      } else {
        newAssigned = [...current, targetTeamId];
      }
    }

    const updatedTask: Question = {
      ...task,
      assignedTeamIds: newAssigned
    };

    if (onSaveCustomQuestion) {
      onSaveCustomQuestion(updatedTask);
    }
    storageService.saveCustomQuestion(updatedTask);
    showNotification(
      isEl
        ? `Η αποστολή ${task.id} ανατέθηκε: ${newAssigned.length === 0 ? 'Όλες οι Ομάδες' : newAssigned.map((id) => id.replace('team-', 'G-')).join(', ')}`
        : `Task ${task.id} assigned to: ${newAssigned.length === 0 ? 'All Groups' : newAssigned.map((id) => id.replace('team-', 'G-')).join(', ')}`
    );
  };

  // Bulk Actions
  const handleActivateAll = () => {
    const newOverrides: Record<string, boolean> = {};
    for (const t of allTasks) {
      newOverrides[t.id] = true;
    }
    onUpdateTaskOverrides(newOverrides);
    storageService.saveAllTaskActiveOverrides(newOverrides);
    showNotification(
      isEl ? 'Όλες οι αποστολές ενεργοποιήθηκαν επιτυχώς!' : 'All tasks activated successfully!'
    );
  };

  const handleDeactivateAll = () => {
    const newOverrides: Record<string, boolean> = {};
    for (const t of allTasks) {
      newOverrides[t.id] = false;
    }
    onUpdateTaskOverrides(newOverrides);
    storageService.saveAllTaskActiveOverrides(newOverrides);
    showNotification(
      isEl ? 'Όλες οι αποστολές μεταφέρθηκαν στο Αποθετήριο (Pool).' : 'All tasks moved to Inactive Pool.',
      'info'
    );
  };

  const handleResetDefaults = () => {
    onUpdateTaskOverrides({});
    storageService.resetTaskActiveOverrides();
    showNotification(
      isEl ? 'Επαναφορά προεπιλεγμένων ρυθμίσεων Master Pool.' : 'Reset to default Master Pool settings.'
    );
  };

  // Filtered Tasks
  const filteredTasks = useMemo(() => {
    return allTasks.filter((task) => {
      const active = isTaskActive(task, taskOverrides);

      // Status filter
      if (poolFilterStatus === 'active' && !active) return false;
      if (poolFilterStatus === 'inactive' && active) return false;

      // Group filter
      if (selectedGroup !== 'all') {
        if (!task.assignedTeamIds || !task.assignedTeamIds.includes(selectedGroup)) {
          return false;
        }
      }

      // Type filter
      if (selectedType !== 'all' && task.type !== selectedType) {
        return false;
      }

      // Search Query
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase().trim();
        const titleMatch = (task.title || '').toLowerCase().includes(query) || (task.title_en || '').toLowerCase().includes(query);
        const descMatch = (task.description || '').toLowerCase().includes(query);
        const idMatch = task.id.toLowerCase().includes(query);
        if (!titleMatch && !descMatch && !idMatch) return false;
      }

      return true;
    });
  }, [allTasks, taskOverrides, poolFilterStatus, selectedGroup, selectedType, searchQuery]);

  // Master Lobby / Start Toggle
  const handleToggleGameStart = () => {
    const next = !isGameStarted;
    setIsGameStarted(next);
    storageService.setGameStarted(next);
    showNotification(
      isEl
        ? (next ? '🚀 Η Δράση Ξεκίνησε Ταυτόχρονα για Όλες τις Ομάδες!' : '⏸️ Η Δράση τέθηκε σε Αναμονή (Lobby Mode).')
        : (next ? '🚀 Activity Started Simultaneously for All Teams!' : '⏸️ Activity reset to Waiting Lobby.'),
      next ? 'success' : 'info'
    );
  };

  // Group Timers Save
  const handleSaveGroupTimers = () => {
    storageService.saveGroupTimers(groupTimers);
    showNotification(
      isEl ? 'Τα χρονικά όρια αποστολών αποθηκεύτηκαν επιτυχώς!' : 'Group timer limits saved successfully!'
    );
  };

  // Create New Task Form Submit
  const handleCreateNewTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) {
      showNotification(isEl ? 'Παρακαλώ εισάγετε τίτλο αποστολής.' : 'Please enter task title.', 'error');
      return;
    }

    const taskId = `task-custom-${Date.now().toString().slice(-6)}`;
    let payload: any = {};

    switch (newType) {
      case 'multiple_choice': {
        const filteredOptions = newMcOptions.filter((o) => o.trim().length > 0);
        const validIndices = newMcCorrectIndices.filter((idx) => idx < filteredOptions.length);
        const finalIndices = validIndices.length > 0 ? validIndices : [0];
        payload = {
          options: filteredOptions,
          correctOptionIndices: finalIndices,
          correctOptionIndex: finalIndices[0] ?? 0
        };
        break;
      }
      case 'true_false':
        payload = { correctValue: newTfCorrect };
        break;
      case 'text_match':
        payload = {
          pairs: newTmPairs.map((p, idx) => ({ id: `pair-${idx + 1}`, left: p.left.trim(), right: p.right.trim() }))
        };
        break;
      case 'image_match':
        payload = {
          pairs: newImPairs.map((p, idx) => ({ id: `imp-${idx + 1}`, image: p.image.trim(), text: p.text.trim() }))
        };
        break;
      case 'photo_upload':
        payload = {
          instructions: newPhotoInstructions.trim() || newDesc.trim(),
          acceptedTypes: newAcceptedTypes
        };
        break;
      case 'task':
        payload = {
          instructions: newDesc.trim(),
          checklist: newChecklist.filter((c) => c.trim().length > 0)
        };
        break;
      case 'qr_scan':
        payload = {
          targetCode: (newQrCode.trim() || 'VULTURE-CODE').toUpperCase(),
          locationHint: newQrHint.trim()
        };
        break;
      case 'puzzle':
        payload = {
          imageUrl: newPuzzleImage.trim() || 'https://images.unsplash.com/photo-1549608276-5786777e6587?auto=format&fit=crop&w=1200&q=80',
          gridPieces: newPuzzlePieces
        };
        break;
      default:
        payload = {};
        break;
    }

    const newTask: Question = {
      id: taskId,
      title: newTitle.trim(),
      title_en: newTitleEn.trim() || newTitle.trim(),
      description: newDesc.trim(),
      description_en: newDescEn.trim() || newDesc.trim(),
      type: newType,
      points: Number(newPoints) || 100,
      timeLimitMinutes: Number(newTimeLimit) > 0 ? Number(newTimeLimit) : undefined,
      assignedTeamIds: newAssignedTeams.length > 0 ? newAssignedTeams : undefined,
      explanation: newExplanation.trim() || undefined,
      explanation_en: newExplanationEn.trim() || undefined,
      imageUrl: newMediaUrl.trim() || undefined,
      videoUrl: newVideoUrl.trim() || undefined,
      payload,
      isActive: true
    };

    if (onSaveCustomQuestion) {
      onSaveCustomQuestion(newTask);
    }
    storageService.saveCustomQuestion(newTask);

    showNotification(
      isEl
        ? `Η νέα αποστολή "${newTask.title}" δημιουργήθηκε και προστέθηκε στο Master Pool!`
        : `New task "${newTask.title}" created and added to Master Pool!`
    );

    // Reset Form & Switch to pool
    setNewTitle('');
    setNewTitleEn('');
    setNewDesc('');
    setNewDescEn('');
    setNewExplanation('');
    setNewMediaUrl('');
    setNewVideoUrl('');
    setExpandedTaskId(taskId);
    setActiveTab('pool');
  };

  // JSON Import handler
  const handleImportJsonFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const text = event.target?.result as string;
        const parsed = JSON.parse(text);

        if (!parsed || typeof parsed !== 'object') {
          showNotification(isEl ? 'Μη έγκυρο αρχείο JSON.' : 'Invalid JSON file.', 'error');
          return;
        }

        const confirmRestore = window.confirm(
          isEl
            ? 'Θέλετε να επαναφέρετε τα δεδομένα από αυτό το αρχείο; Οι τρέχουσες απαντήσεις θα αντικατασταθούν.'
            : 'Restore data from this backup file? Current answers will be replaced.'
        );

        if (!confirmRestore) return;

        if (parsed.taskActiveOverrides && typeof parsed.taskActiveOverrides === 'object') {
          onUpdateTaskOverrides(parsed.taskActiveOverrides);
          storageService.saveAllTaskActiveOverrides(parsed.taskActiveOverrides);
        }

        if (parsed.submissions && typeof parsed.submissions === 'object') {
          storageService.saveAllSubmissions(parsed.submissions);
        }

        if (onRestoreStateFromJson) {
          onRestoreStateFromJson(text);
        }

        showNotification(isEl ? 'Επιτυχής επαναφορά δεδομένων!' : 'Data restored successfully!');
      } catch {
        showNotification(isEl ? 'Σφάλμα ανάγνωσης αρχείου JSON.' : 'Error reading JSON file.', 'error');
      }
    };
    reader.readAsText(file);
  };

  // Export handlers
  const handleExportCsv = () => {
    exportService.exportDetailedSubmissionsCsv({
      tasks: allTasks,
      teams: masterTeamsPool,
      submissions,
      taskOverrides,
      lang
    });
    showNotification(isEl ? 'Εξαγωγή αναφοράς CSV σε εξέλιξη...' : 'Exporting CSV file...');
  };

  const handleExportJson = () => {
    const stats = masterTeamsPool.map((t) =>
      computeTeamTaskStats(t, submissions, taskOverrides, customQuestions)
    );
    exportService.exportFullJsonBackup({
      tasks: allTasks,
      teams: masterTeamsPool,
      teamStats: stats,
      submissions,
      synthesisNotes,
      taskOverrides,
      lang
    });
    showNotification(isEl ? 'Εξαγωγή αντιγράφου JSON σε εξέλιξη...' : 'Exporting JSON backup...');
  };

  // =========================================================================
  // VIEW: AUTHENTICATION LOCK SCREEN
  // =========================================================================
  if (!isAuthenticated) {
    return (
      <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
        <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-2xl space-y-6 text-slate-100 animate-in fade-in zoom-in-95">
          <div className="text-center space-y-2">
            <div className="w-16 h-16 rounded-2xl bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center justify-center text-3xl mx-auto shadow-lg shadow-amber-500/10">
              🛡️
            </div>
            <h2 className="text-xl font-black text-white">
              {isEl ? 'Κονσόλα Εκπαιδευτικού & Διαχείριση' : 'Teacher Admin Console'}
            </h2>
            <p className="text-xs text-slate-400">
              {isEl
                ? 'Πρόσβαση στο Master Pool (61 αποστολές), ταυτόχρονη έναρξη Lobby, χρονόμετρα και δημιουργία νέων αποστολών.'
                : 'Access the Master Pool (61 tasks), simultaneous Lobby start, timers and task creation.'}
            </p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1.5">
                {isEl ? 'Κωδικός Πρόσβασης Εκπαιδευτικού:' : 'Teacher Access Password:'}
              </label>
              <input
                type="password"
                value={passwordInput}
                onChange={(e) => setPasswordInput(e.target.value)}
                placeholder="π.χ. admin123 ή vulture2026"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-amber-400"
                autoFocus
              />
            </div>

            {authError && (
              <div className="p-3 rounded-xl bg-rose-950/50 border border-rose-500/40 text-xs text-rose-300 flex items-center gap-2">
                <ShieldAlert className="w-4 h-4 shrink-0 text-rose-400" />
                <span>{authError}</span>
              </div>
            )}

            <button
              type="submit"
              className="w-full py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-sm flex items-center justify-center gap-2 transition-colors cursor-pointer shadow-lg shadow-amber-500/20"
            >
              <Unlock className="w-4 h-4" />
              <span>{isEl ? 'Είσοδος στην Κονσόλα' : 'Enter Admin Console'}</span>
            </button>
          </form>

          <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-xs text-slate-500">
            <button
              type="button"
              onClick={handleFastPass}
              className="hover:text-amber-400 transition-colors flex items-center gap-1 cursor-pointer"
            >
              <span>⚡ {isEl ? 'Γρήγορη Είσοδος (Demo)' : 'Fast Pass (Demo)'}</span>
            </button>
            <button
              type="button"
              onClick={onClose}
              className="hover:text-slate-300 transition-colors cursor-pointer"
            >
              {isEl ? 'Κλείσιμο' : 'Close'}
            </button>
          </div>
        </div>
      </div>
    );
  }

  // =========================================================================
  // VIEW: AUTHENTICATED ADMIN CONSOLE
  // =========================================================================
  return (
    <div className="fixed inset-0 z-50 bg-slate-950 flex flex-col overflow-hidden text-slate-100">
      {/* Toast Notification */}
      {notification && (
        <div className="fixed top-5 left-1/2 -translate-x-1/2 z-50 animate-in fade-in slide-in-from-top-4 duration-200">
          <div
            className={`px-5 py-3 rounded-2xl shadow-2xl flex items-center gap-2.5 text-xs sm:text-sm font-bold border ${
              notification.type === 'error'
                ? 'bg-rose-950/90 border-rose-500 text-rose-200'
                : notification.type === 'info'
                ? 'bg-sky-950/90 border-sky-500 text-sky-200'
                : 'bg-emerald-950/90 border-emerald-500 text-emerald-200'
            }`}
          >
            {notification.type === 'error' ? (
              <XCircle className="w-5 h-5 text-rose-400" />
            ) : (
              <CheckCircle2 className="w-5 h-5 text-emerald-400" />
            )}
            <span>{notification.text}</span>
          </div>
        </div>
      )}

      {/* Top Navbar */}
      <header className="px-6 py-4 bg-slate-900 border-b border-slate-800 flex items-center justify-between shrink-0 flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/40 flex items-center justify-center text-xl font-bold">
            🛡️
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-black text-white">
                {isEl ? 'Κονσόλα Διαχείρισης Εκπαιδευτικού (Admin Panel)' : 'Teacher Admin Console'}
              </h1>
              <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                isGameStarted ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40' : 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
              }`}>
                {isGameStarted ? (isEl ? 'ΔΡΑΣΗ ΣΕ ΕΞΕΛΙΞΗ' : 'SESSION ACTIVE') : (isEl ? 'LOBBY ΑΝΑΜΟΝΗΣ' : 'LOBBY MODE')}
              </span>
            </div>
            <p className="text-xs text-slate-400">
              {isEl
                ? 'Master Pool, Ταυτόχρονη Έναρξη, Χρονικά Όρια & Προσθήκη Νέων Αποστολών'
                : 'Master Pool, Simultaneous Start, Timers & Custom Task Creation'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          {/* Master Lobby Start Toggle in Header */}
          <button
            type="button"
            onClick={handleToggleGameStart}
            className={`px-3.5 py-1.5 rounded-xl font-black text-xs flex items-center gap-1.5 transition-all cursor-pointer shadow-md ${
              isGameStarted
                ? 'bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border border-rose-500/40'
                : 'bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black scale-102 ring-2 ring-emerald-400/40'
            }`}
          >
            {isGameStarted ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5 fill-slate-950" />}
            <span>
              {isGameStarted
                ? (isEl ? 'Επαναφορά σε Lobby' : 'Reset to Lobby')
                : (isEl ? 'Έναρξη για Όλες τις Ομάδες' : 'Start All Teams')}
            </span>
          </button>

          <button
            type="button"
            onClick={handleLogout}
            className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold flex items-center gap-1.5 border border-slate-700 transition-colors cursor-pointer"
          >
            <Lock className="w-3.5 h-3.5" />
            <span>{isEl ? 'Κλείδωμα' : 'Lock'}</span>
          </button>

          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs sm:text-sm font-black flex items-center gap-1.5 shadow-md shadow-amber-500/20 transition-all cursor-pointer active:scale-95"
          >
            <X className="w-4 h-4" />
            <span>{isEl ? 'Επιστροφή στην Εφαρμογή' : 'Exit to App'}</span>
          </button>
        </div>
      </header>

      {/* Navigation Sub-Tabs */}
      <div className="px-6 py-2.5 bg-slate-900/60 border-b border-slate-800 flex items-center justify-between gap-4 overflow-x-auto shrink-0">
        <div className="flex items-center gap-2">
          {/* Tab 1: Master Pool */}
          <button
            type="button"
            onClick={() => setActiveTab('pool')}
            className={`px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2 transition-all cursor-pointer ${
              activeTab === 'pool'
                ? 'bg-amber-500 text-slate-950 shadow-md font-black'
                : 'bg-slate-800/80 hover:bg-slate-800 text-slate-300 border border-slate-700/60'
            }`}
          >
            <Layers className="w-4 h-4" />
            <span>{isEl ? 'Master Pool (Αποστολές)' : 'Master Pool (Tasks)'}</span>
            <span className="px-1.5 py-0.5 rounded-full bg-slate-950/40 text-[10px]">
              {activeCount}/{allTasks.length}
            </span>
          </button>

          {/* Tab 2: Add New Task */}
          <button
            type="button"
            onClick={() => setActiveTab('create')}
            className={`px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2 transition-all cursor-pointer ${
              activeTab === 'create'
                ? 'bg-amber-500 text-slate-950 shadow-md font-black'
                : 'bg-emerald-950/40 hover:bg-emerald-900/50 text-emerald-300 border border-emerald-500/40'
            }`}
          >
            <Plus className="w-4 h-4 text-emerald-400" />
            <span>{isEl ? 'Προσθήκη Νέας Δραστηριότητας' : 'Add New Task'}</span>
          </button>

          {/* Tab 3: Lobby & Timers */}
          <button
            type="button"
            onClick={() => setActiveTab('lobby_timer')}
            className={`px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2 transition-all cursor-pointer ${
              activeTab === 'lobby_timer'
                ? 'bg-amber-500 text-slate-950 shadow-md font-black'
                : 'bg-slate-800/80 hover:bg-slate-800 text-slate-300 border border-slate-700/60'
            }`}
          >
            <Clock className="w-4 h-4" />
            <span>{isEl ? 'Lobby & Χρονόμετρα' : 'Lobby & Deadlines'}</span>
          </button>

          {/* Tab 4: Exports */}
          <button
            type="button"
            onClick={() => setActiveTab('export')}
            className={`px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2 transition-all cursor-pointer ${
              activeTab === 'export'
                ? 'bg-amber-500 text-slate-950 shadow-md font-black'
                : 'bg-slate-800/80 hover:bg-slate-800 text-slate-300 border border-slate-700/60'
            }`}
          >
            <Download className="w-4 h-4" />
            <span>{isEl ? 'Εξαγωγή (JSON / CSV)' : 'Export Data'}</span>
          </button>

          {/* Tab 5: Teams */}
          <button
            type="button"
            onClick={() => setActiveTab('teams')}
            className={`px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2 transition-all cursor-pointer ${
              activeTab === 'teams'
                ? 'bg-amber-500 text-slate-950 shadow-md font-black'
                : 'bg-slate-800/80 hover:bg-slate-800 text-slate-300 border border-slate-700/60'
            }`}
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>{isEl ? 'Ομάδες & Υποβολές' : 'Teams & Submissions'}</span>
          </button>
        </div>

        {/* Global Task Metrics Chip */}
        <div className="hidden lg:flex items-center gap-3 text-xs">
          <div className="px-3 py-1 rounded-lg bg-emerald-950/50 border border-emerald-500/40 text-emerald-300 flex items-center gap-1.5 font-semibold">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>{isEl ? `Ενεργές: ${activeCount}` : `Active: ${activeCount}`}</span>
          </div>
          <div className="px-3 py-1 rounded-lg bg-slate-800/80 border border-slate-700 text-slate-400 flex items-center gap-1.5 font-semibold">
            <span>{isEl ? `Αποθετήριο (Pool): ${inactiveCount}` : `Inactive Pool: ${inactiveCount}`}</span>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto p-4 sm:p-6 max-w-7xl w-full mx-auto space-y-6">
        {/* ================================================================= */}
        {/* TAB 1: MASTER POOL MANAGEMENT & GROUP REASSIGNMENT                */}
        {/* ================================================================= */}
        {activeTab === 'pool' && (
          <div className="space-y-5">
            {/* Control Bar: Status Filter + Bulk Actions */}
            <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                {/* Active / Inactive / All Tabs */}
                <div className="flex items-center gap-1.5 bg-slate-950 p-1 rounded-xl border border-slate-800">
                  <button
                    type="button"
                    onClick={() => setPoolFilterStatus('all')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                      poolFilterStatus === 'all'
                        ? 'bg-amber-500 text-slate-950'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    {isEl ? `Όλες (${allTasks.length})` : `All (${allTasks.length})`}
                  </button>
                  <button
                    type="button"
                    onClick={() => setPoolFilterStatus('active')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                      poolFilterStatus === 'active'
                        ? 'bg-emerald-500 text-slate-950'
                        : 'text-emerald-400 hover:text-emerald-300'
                    }`}
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                    <span>{isEl ? `Ενεργές (${activeCount})` : `Active (${activeCount})`}</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setPoolFilterStatus('inactive')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                      poolFilterStatus === 'inactive'
                        ? 'bg-slate-700 text-white'
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-slate-500" />
                    <span>{isEl ? `Αποθετήριο Pool (${inactiveCount})` : `Pool (${inactiveCount})`}</span>
                  </button>
                </div>

                {/* Bulk Actions */}
                <div className="flex items-center gap-2 flex-wrap">
                  <button
                    type="button"
                    onClick={handleActivateAll}
                    className="px-3 py-1.5 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/40 text-xs font-bold flex items-center gap-1.5 cursor-pointer transition-colors"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>{isEl ? 'Ενεργοποίηση Όλων' : 'Activate All'}</span>
                  </button>
                  <button
                    type="button"
                    onClick={handleDeactivateAll}
                    className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 text-xs font-semibold flex items-center gap-1.5 cursor-pointer transition-colors"
                  >
                    <EyeOff className="w-3.5 h-3.5" />
                    <span>{isEl ? 'Μεταφορά Όλων στο Pool' : 'Deactivate All'}</span>
                  </button>
                  <button
                    type="button"
                    onClick={handleResetDefaults}
                    className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-slate-200 border border-slate-700 text-xs font-semibold flex items-center gap-1.5 cursor-pointer transition-colors"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>{isEl ? 'Επαναφορά' : 'Reset'}</span>
                  </button>
                </div>
              </div>

              {/* Filters & Search */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 border-t border-slate-800/80">
                <div className="relative">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder={isEl ? 'Αναζήτηση αποστολής...' : 'Search task...'}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-amber-400"
                  />
                </div>

                {/* Group Filter */}
                <select
                  value={selectedGroup}
                  onChange={(e) => setSelectedGroup(e.target.value)}
                  className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-amber-400"
                >
                  <option value="all">{isEl ? 'Όλες οι Ομάδες (All Groups)' : 'All Groups'}</option>
                  <option value="team-alpha">{isEl ? 'Ομάδα 1: Ταυτότητα & Βασικά' : 'Group 1: Identity & Basics'}</option>
                  <option value="team-beta">{isEl ? 'Ομάδα 2: Περιβάλλον & Πτήση' : 'Group 2: Habitat & Flight'}</option>
                  <option value="team-gamma">{isEl ? 'Ομάδα 3: Διατροφή & Βιολογία' : 'Group 3: Diet & Biology'}</option>
                  <option value="team-delta">{isEl ? 'Ομάδα 4: Απειλές & Προστασία' : 'Group 4: Threats & Conservation'}</option>
                </select>

                {/* Type Filter */}
                <select
                  value={selectedType}
                  onChange={(e) => setSelectedType(e.target.value)}
                  className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-amber-400"
                >
                  <option value="all">{isEl ? 'Όλοι οι Τύποι Αποστολών' : 'All Quest Types'}</option>
                  <option value="multiple_choice">{isEl ? 'Πολλαπλής Επιλογής' : 'Multiple Choice'}</option>
                  <option value="true_false">{isEl ? 'Σωστό / Λάθος' : 'True / False'}</option>
                  <option value="text_match">{isEl ? 'Αντιστοίχιση Κειμένου' : 'Text Matching'}</option>
                  <option value="image_match">{isEl ? 'Αντιστοίχιση Εικόνας' : 'Image Matching'}</option>
                  <option value="puzzle">{isEl ? 'Παζλ (Puzzle)' : 'Puzzle'}</option>
                  <option value="qr_scan">{isEl ? 'Σάρωση QR Code' : 'QR Scan'}</option>
                  <option value="photo_upload">{isEl ? 'Μεταφόρτωση Τεκμηρίου (Photo/Video)' : 'Evidence Upload'}</option>
                  <option value="task">{isEl ? 'Αποστολή / Checkpoint Task' : 'Task / Checklist'}</option>
                </select>
              </div>
            </div>

            {/* Task Cards List */}
            <div className="space-y-3">
              {filteredTasks.length === 0 ? (
                <div className="p-8 rounded-2xl bg-slate-900 border border-slate-800 text-center space-y-2">
                  <div className="text-3xl">🔍</div>
                  <p className="text-sm font-bold text-slate-300">
                    {isEl ? 'Δεν βρέθηκαν αποστολές με τα επιλεγμένα κριτήρια.' : 'No tasks match the selected filters.'}
                  </p>
                </div>
              ) : (
                filteredTasks.map((task, idx) => {
                  const active = isTaskActive(task, taskOverrides);
                  const isExpanded = expandedTaskId === task.id;
                  const cpMeta = getCheckpointMetadata(task, lang);
                  const taskSubmissions = Object.values(submissions).filter(
                    (s) => s.questionId === task.id && s.status === 'correct'
                  );

                  return (
                    <div
                      key={task.id}
                      className={`p-4 rounded-2xl border transition-all ${
                        active
                          ? 'bg-slate-900 border-slate-800 hover:border-slate-700'
                          : 'bg-slate-950/80 border-slate-800/60 opacity-80'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-4 flex-wrap">
                        <div className="flex items-start gap-3 flex-1 min-w-[280px]">
                          {/* Active Toggle Switch */}
                          <div className="flex flex-col items-center gap-1.5 shrink-0 pt-0.5">
                            <button
                              type="button"
                              onClick={() => handleToggleTask(task.id)}
                              className={`w-12 h-6 rounded-full transition-colors relative cursor-pointer focus:outline-none ${
                                active ? 'bg-emerald-500' : 'bg-slate-700'
                              }`}
                              title={active ? 'Ενεργή' : 'Ανενεργή'}
                            >
                              <span
                                className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white transition-transform ${
                                  active ? 'translate-x-6' : 'translate-x-0'
                                }`}
                              />
                            </button>
                            <span className="text-[10px] font-mono text-slate-500">#{idx + 1}</span>
                          </div>

                          {/* Task Content */}
                          <div className="flex-1 min-w-0 space-y-1">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="font-mono text-xs text-amber-400 font-bold">{task.id}</span>

                              <span className="px-2 py-0.5 rounded-md bg-slate-800 text-[10px] font-semibold text-slate-300 uppercase">
                                {task.type.replace('_', ' ')}
                              </span>

                              <span className="px-2 py-0.5 rounded-md bg-amber-500/10 text-amber-400 border border-amber-500/30 text-[10px] font-bold">
                                +{task.points} pts
                              </span>

                              {task.timeLimitMinutes && task.timeLimitMinutes > 0 && (
                                <span className="px-2 py-0.5 rounded-md bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 text-[10px] font-bold flex items-center gap-1">
                                  <Clock className="w-3 h-3" />
                                  <span>{task.timeLimitMinutes} min</span>
                                </span>
                              )}

                              {cpMeta.isCheckpoint && (
                                <span className="px-2 py-0.5 rounded-md bg-rose-500/20 text-rose-300 border border-rose-500/40 text-[10px] font-bold flex items-center gap-1">
                                  🚩 <span>{cpMeta.badge}</span>
                                </span>
                              )}
                            </div>

                            <h4 className="text-sm font-bold text-white leading-snug">
                              {isEl ? task.title : task.title_en || task.title}
                            </h4>

                            <p className="text-xs text-slate-400 line-clamp-2">
                              {isEl ? task.description : task.description_en || task.description}
                            </p>

                            {/* Quick Group Assignment Controls on Row */}
                            <div className="pt-2 flex items-center gap-1.5 flex-wrap">
                              <span className="text-[10px] font-bold text-slate-400 mr-1">
                                {isEl ? 'Ανάθεση:' : 'Assign:'}
                              </span>
                              {[
                                { id: 'team-alpha', label: 'G1', color: '#10b981' },
                                { id: 'team-beta', label: 'G2', color: '#06b6d4' },
                                { id: 'team-gamma', label: 'G3', color: '#f59e0b' },
                                { id: 'team-delta', label: 'G4', color: '#8b5cf6' }
                              ].map((grp) => {
                                const isAssigned = (task.assignedTeamIds || []).includes(grp.id);
                                return (
                                  <button
                                    key={grp.id}
                                    type="button"
                                    onClick={() => handleToggleTaskGroup(task, grp.id)}
                                    style={{
                                      borderColor: isAssigned ? grp.color : '#334155',
                                      backgroundColor: isAssigned ? `${grp.color}25` : 'transparent',
                                      color: isAssigned ? '#ffffff' : '#94a3b8'
                                    }}
                                    className="px-2 py-0.5 rounded-md border text-[10px] font-bold cursor-pointer transition-all hover:scale-105"
                                    title={isAssigned ? 'Αφαιρέστε από την ομάδα' : 'Αναθέστε στην ομάδα'}
                                  >
                                    {grp.label} {isAssigned && '✓'}
                                  </button>
                                );
                              })}
                              <button
                                type="button"
                                onClick={() => handleToggleTaskGroup(task, 'all')}
                                className={`px-2 py-0.5 rounded-md border text-[10px] font-bold cursor-pointer transition-all ${
                                  !task.assignedTeamIds || task.assignedTeamIds.length === 0
                                    ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                                    : 'text-slate-500 border-slate-800 hover:text-slate-300'
                                }`}
                              >
                                {isEl ? 'Όλες' : 'All'}
                              </button>
                            </div>
                          </div>
                        </div>

                        {/* Right side Actions */}
                        <div className="flex items-center gap-2 shrink-0">
                          {Boolean(customQuestions[task.id]) && (
                            <span className="px-2 py-0.5 rounded-full bg-violet-500/20 text-violet-300 border border-violet-500/40 text-[10px] font-bold">
                              ✏️ {isEl ? 'Τροποποιημένη' : 'Custom'}
                            </span>
                          )}

                          {taskSubmissions.length > 0 && (
                            <span className="px-2.5 py-1 rounded-lg bg-emerald-950/60 border border-emerald-500/40 text-emerald-300 text-xs font-bold flex items-center gap-1">
                              <Check className="w-3.5 h-3.5" />
                              <span>{taskSubmissions.length}</span>
                            </span>
                          )}

                          <button
                            type="button"
                            onClick={() => setExpandedTaskId(isExpanded ? null : task.id)}
                            className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                              isExpanded
                                ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
                                : 'bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white'
                            }`}
                          >
                            <span>{isExpanded ? '✕' : '✏️'}</span>
                            <span className="hidden sm:inline">
                              {isExpanded ? (isEl ? 'Κλείσιμο' : 'Close') : (isEl ? 'Επεξεργασία' : 'Edit')}
                            </span>
                          </button>
                        </div>
                      </div>

                      {/* Visual Edit Form */}
                      {isExpanded && (
                        <div className="mt-4 pt-4 border-t border-slate-800">
                          <TaskVisualEditForm
                            task={task}
                            lang={lang}
                            isCustomized={Boolean(customQuestions[task.id])}
                            onSave={(updated) => {
                              if (onSaveCustomQuestion) {
                                onSaveCustomQuestion(updated);
                              }
                              storageService.saveCustomQuestion(updated);
                              setExpandedTaskId(null);
                              showNotification(
                                isEl
                                  ? `Η αποστολή "${updated.title}" αποθηκεύτηκε επιτυχώς!`
                                  : `Task "${updated.title}" saved successfully!`
                              );
                            }}
                            onResetToDefault={() => {
                              if (onResetCustomQuestion) {
                                onResetCustomQuestion(task.id);
                              }
                              storageService.resetCustomQuestion(task.id);
                              setExpandedTaskId(null);
                              showNotification(
                                isEl ? 'Επαναφορά στις αρχικές ρυθμίσεις.' : 'Reset to defaults.'
                              );
                            }}
                            onCancel={() => setExpandedTaskId(null)}
                          />
                        </div>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          </div>
        )}

        {/* ================================================================= */}
        {/* TAB 2: INTERACTIVE "ΠΡΟΣΘΗΚΗ ΝΕΑΣ ΔΡΑΣΤΗΡΙΟΤΗΤΑΣ" FORM            */}
        {/* ================================================================= */}
        {activeTab === 'create' && (
          <form
            onSubmit={handleCreateNewTask}
            className="p-6 rounded-3xl bg-slate-900 border-2 border-emerald-500/40 shadow-2xl space-y-6"
          >
            <div className="flex items-center justify-between pb-4 border-b border-slate-800 flex-wrap gap-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 flex items-center justify-center text-xl font-bold">
                  ➕
                </div>
                <div>
                  <h3 className="text-lg font-black text-white">
                    {isEl ? 'Προσθήκη Νέας Δραστηριότητας στο Master Pool' : 'Add New Task to Master Pool'}
                  </h3>
                  <p className="text-xs text-slate-400">
                    {isEl
                      ? 'Δημιουργήστε από το μηδέν μια νέα εκπαιδευτική αποστολή και αναθέστε την άμεσα σε όποιες ομάδες επιθυμείτε.'
                      : 'Create a brand new educational mission from scratch and assign it directly to groups.'}
                  </p>
                </div>
              </div>

              <button
                type="submit"
                className="px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs sm:text-sm flex items-center gap-2 shadow-lg shadow-emerald-500/20 cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>{isEl ? 'Αποθήκευση & Δημοσίευση' : 'Save & Publish to Pool'}</span>
              </button>
            </div>

            {/* Row 1: Type, Points, Time Limit */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-300 block">
                  {isEl ? 'Τύπος Αποστολής:' : 'Question Type:'}
                </label>
                <select
                  value={newType}
                  onChange={(e) => setNewType(e.target.value as QuestionType)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-400"
                >
                  <option value="multiple_choice">{isEl ? '1. Πολλαπλής Επιλογής (Multiple Choice)' : '1. Multiple Choice'}</option>
                  <option value="true_false">{isEl ? '2. Σωστό / Λάθος (True / False)' : '2. True / False'}</option>
                  <option value="text_match">{isEl ? '3. Αντιστοίχιση Κειμένου (Text Match)' : '3. Text Match'}</option>
                  <option value="image_match">{isEl ? '4. Αντιστοίχιση Εικόνας (Image Match)' : '4. Image Match'}</option>
                  <option value="photo_upload">{isEl ? '5. Μεταφόρτωση Τεκμηρίου (Photo/Video Upload)' : '5. Photo/Video Upload'}</option>
                  <option value="task">{isEl ? '6. Checkpoint Αποστολή (Task Checklist)' : '6. Task Checklist'}</option>
                  <option value="qr_scan">{isEl ? '7. Σάρωση QR Code (QR Scan)' : '7. QR Scan'}</option>
                  <option value="puzzle">{isEl ? '8. Παζλ Παρατήρησης (Puzzle)' : '8. Puzzle'}</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-300 block">
                  {isEl ? 'Πόντοι Αποστολής:' : 'Points Value:'}
                </label>
                <input
                  type="number"
                  min={10}
                  max={500}
                  step={10}
                  value={newPoints}
                  onChange={(e) => setNewPoints(Number(e.target.value))}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs font-bold text-white focus:outline-none focus:border-emerald-400"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-300 block">
                  {isEl ? 'Χρονικό Όριο (λεπτά - 0=Χωρίς):' : 'Time Limit (mins - 0=No limit):'}
                </label>
                <input
                  type="number"
                  min={0}
                  max={60}
                  value={newTimeLimit}
                  onChange={(e) => setNewTimeLimit(Number(e.target.value))}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs font-bold text-white focus:outline-none focus:border-emerald-400"
                />
              </div>
            </div>

            {/* Row 2: Target Groups */}
            <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-2">
              <label className="text-xs font-bold text-slate-300 flex items-center gap-2">
                <Layers className="w-4 h-4 text-cyan-400" />
                <span>{isEl ? 'Ανάθεση σε Ομάδες (Target Groups):' : 'Assigned Target Groups:'}</span>
              </label>
              <div className="flex items-center gap-2 flex-wrap">
                {[
                  { id: 'team-alpha', label: isEl ? 'Ομάδα 1 (Ταυτότητα)' : 'Group 1 (Identity)', color: '#10b981' },
                  { id: 'team-beta', label: isEl ? 'Ομάδα 2 (Περιβάλλον)' : 'Group 2 (Habitat)', color: '#06b6d4' },
                  { id: 'team-gamma', label: isEl ? 'Ομάδα 3 (Διατροφή)' : 'Group 3 (Diet)', color: '#f59e0b' },
                  { id: 'team-delta', label: isEl ? 'Ομάδα 4 (Απειλές)' : 'Group 4 (Threats)', color: '#8b5cf6' }
                ].map((grp) => {
                  const isAssigned = newAssignedTeams.includes(grp.id);
                  return (
                    <button
                      key={grp.id}
                      type="button"
                      onClick={() => {
                        if (newAssignedTeams.includes(grp.id)) {
                          setNewAssignedTeams(newAssignedTeams.filter((t) => t !== grp.id));
                        } else {
                          setNewAssignedTeams([...newAssignedTeams, grp.id]);
                        }
                      }}
                      style={{
                        borderColor: isAssigned ? grp.color : '#334155',
                        backgroundColor: isAssigned ? `${grp.color}25` : 'transparent'
                      }}
                      className={`px-3 py-1.5 rounded-xl border text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                        isAssigned ? 'text-white shadow-xs' : 'text-slate-400'
                      }`}
                    >
                      <span>{isAssigned ? '✓' : '+'}</span>
                      <span>{grp.label}</span>
                    </button>
                  );
                })}
                <button
                  type="button"
                  onClick={() => setNewAssignedTeams([])}
                  className={`px-3 py-1.5 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                    newAssignedTeams.length === 0
                      ? 'bg-amber-500/20 text-amber-300 border-amber-500/40 ring-1 ring-amber-400/30'
                      : 'bg-slate-800 text-slate-400 border-slate-700'
                  }`}
                >
                  {isEl ? 'Όλες οι Ομάδες (Κοινή)' : 'All Groups (Shared)'}
                </button>
              </div>
            </div>

            {/* Row 3: Titles (Greek & English) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-300 block">
                  {isEl ? 'Τίτλος Αποστολής (Ελληνικά):' : 'Task Title (Greek):'}
                </label>
                <input
                  type="text"
                  required
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="π.χ. Μορφολογία Ράμφους & Ανατομία"
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs font-bold text-white focus:outline-none focus:border-emerald-400"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-300 block">
                  {isEl ? 'Τίτλος Αποστολής (English):' : 'Task Title (English):'}
                </label>
                <input
                  type="text"
                  value={newTitleEn}
                  onChange={(e) => setNewTitleEn(e.target.value)}
                  placeholder="e.g. Beak Morphology & Anatomy"
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs font-bold text-white focus:outline-none focus:border-emerald-400"
                />
              </div>
            </div>

            {/* Row 4: Descriptions (Greek & English) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-300 block">
                  {isEl ? 'Εκφώνηση / Περιγραφή Ερώτησης (Ελληνικά):' : 'Question Prompt (Greek):'}
                </label>
                <textarea
                  rows={2}
                  required
                  value={newDesc}
                  onChange={(e) => setNewDesc(e.target.value)}
                  placeholder="Διατυπώστε την ερώτηση ή την οδηγία για τους μαθητές..."
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-emerald-400 leading-relaxed"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-300 block">
                  {isEl ? 'Εκφώνηση / Περιγραφή Ερώτησης (English):' : 'Question Prompt (English):'}
                </label>
                <textarea
                  rows={2}
                  value={newDescEn}
                  onChange={(e) => setNewDescEn(e.target.value)}
                  placeholder="State the prompt or question for students..."
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-emerald-400 leading-relaxed"
                />
              </div>
            </div>

            {/* Universal Question Reference Media (Image or Video) */}
            <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <div>
                  <label className="text-xs font-bold text-amber-400 flex items-center gap-1.5">
                    <ImageIcon className="w-4 h-4 text-amber-400" />
                    <span>{isEl ? 'Πολυμέσα Αναφοράς Αποστολής (Προαιρετικό):' : 'Question Reference Media (Optional):'}</span>
                  </label>
                  <p className="text-[11px] text-slate-400">
                    {isEl ? 'Επισυνάψτε φωτογραφία ή βίντεο από τη συσκευή σας για επίδειξη στους μαθητές.' : 'Attach an image or video from your device for students to inspect.'}
                  </p>
                </div>

                <div className="flex items-center gap-1 bg-slate-900 p-1 rounded-xl border border-slate-800 text-xs">
                  <button
                    type="button"
                    onClick={() => setNewMediaTab('image')}
                    className={`px-2.5 py-1 rounded-lg font-bold transition-all cursor-pointer flex items-center gap-1 ${
                      newMediaTab === 'image' ? 'bg-amber-500 text-slate-950' : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    <ImageIcon className="w-3.5 h-3.5" />
                    <span>{isEl ? 'Εικόνα' : 'Image'}</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setNewMediaTab('video')}
                    className={`px-2.5 py-1 rounded-lg font-bold transition-all cursor-pointer flex items-center gap-1 ${
                      newMediaTab === 'video' ? 'bg-amber-500 text-slate-950' : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    <Film className="w-3.5 h-3.5" />
                    <span>{isEl ? 'Βίντεο' : 'Video'}</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setNewMediaTab('none');
                      setNewMediaUrl('');
                      setNewVideoUrl('');
                    }}
                    className={`px-2 py-1 rounded-lg font-bold transition-all cursor-pointer ${
                      newMediaTab === 'none' ? 'bg-slate-800 text-slate-300' : 'text-slate-500 hover:text-slate-300'
                    }`}
                  >
                    <span>{isEl ? 'Χωρίς' : 'None'}</span>
                  </button>
                </div>
              </div>

              {/* Direct Local File Upload Box */}
              {newMediaTab !== 'none' && (
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <input
                      type="url"
                      value={newMediaTab === 'image' ? newMediaUrl : newVideoUrl}
                      onChange={(e) => {
                        if (newMediaTab === 'image') setNewMediaUrl(e.target.value);
                        else setNewVideoUrl(e.target.value);
                      }}
                      placeholder={
                        newMediaTab === 'image'
                          ? (isEl ? 'URL εικόνας (https://...) ή επιλέξτε αρχείο από τη συσκευή...' : 'Image URL or choose file from device...')
                          : (isEl ? 'URL βίντεο MP4 ή επιλέξτε αρχείο...' : 'Video MP4 URL or choose file...')
                      }
                      className="flex-1 bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-400 font-mono"
                    />

                    <label className="px-3.5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs flex items-center gap-1.5 cursor-pointer shadow-md transition-all active:scale-95 shrink-0">
                      <Upload className="w-4 h-4" />
                      <span>{isEl ? 'Επιλογή Αρχείου' : 'Browse File'}</span>
                      <input
                        type="file"
                        accept={newMediaTab === 'video' ? 'video/*' : 'image/*'}
                        className="hidden"
                        onChange={async (e) => {
                          const file = e.target.files?.[0];
                          if (!file) return;
                          try {
                            const res = await processLocalFile(file, 800, 0.82);
                            if (res.type === 'video') {
                              setNewVideoUrl(res.url);
                              setNewMediaTab('video');
                            } else {
                              setNewMediaUrl(res.url);
                              setNewMediaTab('image');
                            }
                          } catch (err) {
                            console.error(err);
                          }
                          e.target.value = '';
                        }}
                      />
                    </label>

                    {(newMediaTab === 'image' ? newMediaUrl : newVideoUrl) && (
                      <button
                        type="button"
                        onClick={() => {
                          if (newMediaTab === 'image') setNewMediaUrl('');
                          else setNewVideoUrl('');
                        }}
                        className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white cursor-pointer"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>

                  {/* Thumbnail Preview */}
                  {newMediaTab === 'image' && newMediaUrl && (
                    <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 flex items-center gap-3">
                      <img
                        src={newMediaUrl}
                        alt="Preview"
                        className="w-20 h-16 object-cover rounded-lg border border-slate-700 bg-black shrink-0"
                        onError={(e) => { (e.target as HTMLElement).style.display = 'none'; }}
                      />
                      <div className="text-xs space-y-0.5 overflow-hidden">
                        <span className="font-bold text-emerald-400 flex items-center gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>{isEl ? 'Προεπισκόπηση Εικόνας Ενεργή' : 'Image Preview Active'}</span>
                        </span>
                        <p className="text-[11px] text-slate-400 truncate max-w-md font-mono">
                          {newMediaUrl.startsWith('data:') ? (isEl ? 'Τοπικό αρχείο εικόνας (Base64)' : 'Local image file (Base64)') : newMediaUrl}
                        </p>
                      </div>
                    </div>
                  )}

                  {newMediaTab === 'video' && newVideoUrl && (
                    <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 space-y-2">
                      <span className="text-[11px] font-bold text-emerald-400 flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>{isEl ? 'Προεπισκόπηση Βίντεο:' : 'Video Preview:'}</span>
                      </span>
                      <video
                        src={newVideoUrl}
                        controls
                        className="w-full max-h-48 rounded-lg bg-black object-contain border border-slate-700"
                      />
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Row 5: Type-Specific Payload Form Area */}
            <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-4">
              <h4 className="text-xs font-black text-amber-400 uppercase tracking-wider">
                {isEl ? 'Διαμόρφωση Επιλογών & Σωστής Απάντησης' : 'Configure Options & Correct Scientific Answer'}
              </h4>

              {/* Multiple Choice Options */}
              {newType === 'multiple_choice' && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between flex-wrap gap-2">
                    <span className="text-xs text-slate-400 block">
                      {isEl
                        ? 'Επιλογές απάντησης (τσεκάρετε τα κουτάκια για όλες τις σωστές επιλογές):'
                        : 'Choices (check boxes for all correct answer options):'}
                    </span>
                    <span className="text-[11px] font-bold text-emerald-400">
                      {newMcCorrectIndices.length > 1
                        ? (isEl ? `✓ ${newMcCorrectIndices.length} σωστές επιλογές (Checkboxes)` : `✓ ${newMcCorrectIndices.length} correct options (Checkboxes)`)
                        : (isEl ? '✓ 1 σωστή επιλογή' : '✓ 1 correct option')}
                    </span>
                  </div>
                  {newMcOptions.map((opt, oIdx) => {
                    const isChecked = newMcCorrectIndices.includes(oIdx);
                    return (
                      <div
                        key={oIdx}
                        className={`flex items-center gap-2 p-1.5 rounded-xl border transition-all ${
                          isChecked
                            ? 'bg-emerald-950/40 border-emerald-500/60 ring-1 ring-emerald-500/30'
                            : 'bg-slate-900 border-slate-800'
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => {
                            setNewMcCorrectIndices((prev) => {
                              if (prev.includes(oIdx)) {
                                return prev.length > 1 ? prev.filter((i) => i !== oIdx) : prev;
                              } else {
                                return [...prev, oIdx].sort((a, b) => a - b);
                              }
                            });
                          }}
                          className="w-4 h-4 rounded text-emerald-500 accent-emerald-500 cursor-pointer ml-1"
                        />
                        <span className="text-xs font-mono font-bold text-slate-400 w-5">
                          {String.fromCharCode(65 + oIdx)}.
                        </span>
                        <input
                          type="text"
                          value={opt}
                          onChange={(e) => {
                            const updated = [...newMcOptions];
                            updated[oIdx] = e.target.value;
                            setNewMcOptions(updated);
                          }}
                          className="flex-1 bg-transparent border-0 text-xs text-white focus:outline-none"
                        />
                        {isChecked && (
                          <span className="px-2 py-0.5 rounded-md bg-emerald-500/20 text-emerald-400 text-[10px] font-bold shrink-0">
                            {isEl ? 'Σωστή' : 'Correct'}
                          </span>
                        )}
                        {newMcOptions.length > 2 && (
                          <button
                            type="button"
                            onClick={() => {
                              const updated = newMcOptions.filter((_, idx) => idx !== oIdx);
                              setNewMcOptions(updated);
                              setNewMcCorrectIndices((prev) => {
                                const next = prev.filter((i) => i !== oIdx).map((i) => (i > oIdx ? i - 1 : i));
                                return next.length > 0 ? next : [0];
                              });
                            }}
                            className="p-1.5 text-slate-500 hover:text-rose-400 cursor-pointer"
                          >
                            ✕
                          </button>
                        )}
                      </div>
                    );
                  })}
                  {newMcOptions.length < 6 && (
                    <button
                      type="button"
                      onClick={() => setNewMcOptions([...newMcOptions, `${isEl ? 'Επιλογή' : 'Option'} ${newMcOptions.length + 1}`])}
                      className="text-xs text-emerald-400 hover:underline flex items-center gap-1 font-bold"
                    >
                      + {isEl ? 'Προσθήκη Επιλογής' : 'Add Option'}
                    </button>
                  )}
                </div>
              )}

              {/* True / False */}
              {newType === 'true_false' && (
                <div className="flex items-center gap-4">
                  <span className="text-xs text-slate-300 font-bold">{isEl ? 'Σωστή Απάντηση:' : 'Correct Value:'}</span>
                  <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-emerald-400">
                    <input
                      type="radio"
                      name="new_tf"
                      checked={newTfCorrect === true}
                      onChange={() => setNewTfCorrect(true)}
                    />
                    <span>{isEl ? '✓ Σωστό (True)' : '✓ True'}</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-rose-400">
                    <input
                      type="radio"
                      name="new_tf"
                      checked={newTfCorrect === false}
                      onChange={() => setNewTfCorrect(false)}
                    />
                    <span>{isEl ? '✕ Λάθος (False)' : '✕ False'}</span>
                  </label>
                </div>
              )}

              {/* Image Match */}
              {newType === 'image_match' && (
                <div className="space-y-3">
                  <span className="text-xs text-slate-400 block">{isEl ? 'Ζεύγη Εικόνας - Κειμένου:' : 'Image-Text Pairs:'}</span>
                  {newImPairs.map((pair, pIdx) => (
                    <div key={pIdx} className="flex items-center gap-2 p-2 rounded-xl bg-slate-900 border border-slate-800">
                      <input
                        type="url"
                        value={pair.image}
                        onChange={(e) => {
                          const updated = [...newImPairs];
                          updated[pIdx].image = e.target.value;
                          setNewImPairs(updated);
                        }}
                        placeholder={isEl ? 'URL Εικόνας ή αρχείο...' : 'Image URL or file...'}
                        className="flex-1 bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white font-mono"
                      />
                      <label className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 cursor-pointer shrink-0" title={isEl ? 'Επιλογή εικόνας από συσκευή' : 'Choose image from device'}>
                        <Upload className="w-3.5 h-3.5 text-amber-400" />
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={async (e) => {
                            const file = e.target.files?.[0];
                            if (!file) return;
                            try {
                              const res = await processLocalFile(file, 600, 0.8);
                              const updated = [...newImPairs];
                              updated[pIdx].image = res.url;
                              setNewImPairs(updated);
                            } catch (err) {
                              console.error(err);
                            }
                            e.target.value = '';
                          }}
                        />
                      </label>
                      <input
                        type="text"
                        value={pair.text}
                        onChange={(e) => {
                          const updated = [...newImPairs];
                          updated[pIdx].text = e.target.value;
                          setNewImPairs(updated);
                        }}
                        placeholder={isEl ? 'Ετικέτα' : 'Label'}
                        className="w-36 bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white"
                      />
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={() => setNewImPairs([...newImPairs, { image: '', text: '' }])}
                    className="text-xs text-emerald-400 hover:underline flex items-center gap-1 font-bold"
                  >
                    + {isEl ? 'Προσθήκη Ζεύγους' : 'Add Pair'}
                  </button>
                </div>
              )}

              {/* Puzzle Image & Pieces */}
              {newType === 'puzzle' && (
                <div className="space-y-3">
                  <div>
                    <label className="text-xs text-slate-300 block mb-1">
                      {isEl ? 'Εικόνα Παζλ (URL ή Επιλογή Αρχείου από Συσκευή):' : 'Puzzle Image (URL or Choose File from Device):'}
                    </label>
                    <div className="flex items-center gap-2">
                      <input
                        type="url"
                        value={newPuzzleImage}
                        onChange={(e) => setNewPuzzleImage(e.target.value)}
                        placeholder="https://..."
                        className="flex-1 bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white font-mono"
                      />
                      <label className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-bold flex items-center gap-1.5 cursor-pointer shrink-0">
                        <Upload className="w-3.5 h-3.5 text-amber-400" />
                        <span>{isEl ? 'Επιλογή' : 'Browse'}</span>
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={async (e) => {
                            const file = e.target.files?.[0];
                            if (!file) return;
                            try {
                              const res = await processLocalFile(file, 800, 0.82);
                              setNewPuzzleImage(res.url);
                            } catch (err) {
                              console.error(err);
                            }
                            e.target.value = '';
                          }}
                        />
                      </label>
                    </div>
                  </div>
                  <div>
                    <label className="text-xs text-slate-300 block mb-1">{isEl ? 'Κομμάτια Παζλ:' : 'Grid Pieces:'}</label>
                    <select
                      value={newPuzzlePieces}
                      onChange={(e) => setNewPuzzlePieces(Number(e.target.value) as 4 | 6 | 9)}
                      className="bg-slate-900 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-white"
                    >
                      <option value={4}>4 {isEl ? 'Κομμάτια (2x2)' : 'Pieces'}</option>
                      <option value={6}>6 {isEl ? 'Κομμάτια (3x2)' : 'Pieces'}</option>
                      <option value={9}>9 {isEl ? 'Κομμάτια (3x3)' : 'Pieces'}</option>
                    </select>
                  </div>
                </div>
              )}

              {/* Photo Upload Instructions */}
              {newType === 'photo_upload' && (
                <div className="space-y-3">
                  <div>
                    <label className="text-xs text-slate-300 block mb-1">{isEl ? 'Οδηγίες Μεταφόρτωσης:' : 'Upload Prompt:'}</label>
                    <input
                      type="text"
                      value={newPhotoInstructions}
                      onChange={(e) => setNewPhotoInstructions(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white"
                    />
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-xs text-slate-300">{isEl ? 'Αποδεκτά αρχεία:' : 'Accepted media:'}</span>
                    <select
                      value={newAcceptedTypes}
                      onChange={(e) => setNewAcceptedTypes(e.target.value as any)}
                      className="bg-slate-900 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-white"
                    >
                      <option value="both">{isEl ? 'Φωτογραφία & Βίντεο' : 'Both Photo & Video'}</option>
                      <option value="photo">{isEl ? 'Μόνο Φωτογραφία' : 'Photo Only'}</option>
                      <option value="video">{isEl ? 'Μόνο Βίντεο' : 'Video Only'}</option>
                    </select>
                  </div>
                </div>
              )}

              {/* Task Checklist */}
              {newType === 'task' && (
                <div className="space-y-2">
                  <span className="text-xs text-slate-400 block">{isEl ? 'Βήματα λίστας ελέγχου (Checklist):' : 'Checklist Steps:'}</span>
                  {newChecklist.map((item, cIdx) => (
                    <div key={cIdx} className="flex items-center gap-2">
                      <span className="text-xs text-emerald-400 font-bold">#{cIdx + 1}</span>
                      <input
                        type="text"
                        value={item}
                        onChange={(e) => {
                          const updated = [...newChecklist];
                          updated[cIdx] = e.target.value;
                          setNewChecklist(updated);
                        }}
                        className="flex-1 bg-slate-900 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-white"
                      />
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={() => setNewChecklist([...newChecklist, `${isEl ? 'Βήμα' : 'Step'} ${newChecklist.length + 1}`])}
                    className="text-xs text-emerald-400 hover:underline flex items-center gap-1 font-bold"
                  >
                    + {isEl ? 'Προσθήκη Βήματος' : 'Add Step'}
                  </button>
                </div>
              )}

              {/* QR Scan Code */}
              {newType === 'qr_scan' && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs text-slate-300 block mb-1">{isEl ? 'Μυστικός Κωδικός QR:' : 'Target QR Code:'}</label>
                    <input
                      type="text"
                      value={newQrCode}
                      onChange={(e) => setNewQrCode(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white font-mono uppercase"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-slate-300 block mb-1">{isEl ? 'Υπόδειξη Τοποθεσίας:' : 'Location Hint:'}</label>
                    <input
                      type="text"
                      value={newQrHint}
                      onChange={(e) => setNewQrHint(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Row 6: Scientific Explanation */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-300 block">
                  {isEl ? 'Επιστημονική Τεκμηρίωση / Επεξήγηση (Ελληνικά):' : 'Scientific Explanation (Greek):'}
                </label>
                <textarea
                  rows={2}
                  value={newExplanation}
                  onChange={(e) => setNewExplanation(e.target.value)}
                  placeholder="Επεξηγήστε την επιστημονική πραγματικότητα μετά την απάντηση..."
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl p-3 text-xs text-white leading-relaxed"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-300 block">
                  {isEl ? 'Επιστημονική Τεκμηρίωση / Επεξήγηση (English):' : 'Scientific Explanation (English):'}
                </label>
                <textarea
                  rows={2}
                  value={newExplanationEn}
                  onChange={(e) => setNewExplanationEn(e.target.value)}
                  placeholder="Explain the scientific background shown after solving..."
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl p-3 text-xs text-white leading-relaxed"
                />
              </div>
            </div>

            {/* Submit */}
            <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setActiveTab('pool')}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold"
              >
                {isEl ? 'Ακύρωση' : 'Cancel'}
              </button>

              <button
                type="submit"
                className="px-6 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs sm:text-sm flex items-center gap-2 shadow-lg shadow-emerald-500/20 cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>{isEl ? 'Αποθήκευση & Προσθήκη στο Master Pool' : 'Save & Add to Master Pool'}</span>
              </button>
            </div>
          </form>
        )}

        {/* ================================================================= */}
        {/* TAB 3: LOBBY & SIMULTANEOUS START & TIMER DEADLINES              */}
        {/* ================================================================= */}
        {activeTab === 'lobby_timer' && (
          <div className="space-y-6">
            {/* Master Simultaneous Start Banner */}
            <div className="p-6 rounded-3xl bg-slate-900 border-2 border-amber-500/40 shadow-2xl space-y-4">
              <div className="flex items-center justify-between gap-4 flex-wrap">
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-xl font-black text-white">
                      {isEl ? 'Ταυτόχρονη Έναρξη & Έλεγχος Lobby' : 'Simultaneous Start & Lobby Control'}
                    </h2>
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-xs font-black ${
                        isGameStarted
                          ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                          : 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                      }`}
                    >
                      {isGameStarted ? (isEl ? '🟢 ΣΕ ΕΞΕΛΙΞΗ' : '🟢 RUNNING') : (isEl ? '🟡 LOBBY ΑΝΑΜΟΝΗΣ' : '🟡 WAITING LOBBY')}
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 mt-1 max-w-2xl">
                    {isEl
                      ? 'Όταν η δράση δεν έχει ξεκινήσει, οι μαθητές που επιλέγουν την ομάδα τους παραμένουν στην οθόνη αναμονής. Με το πάτημα του κουμπιού, οι αποστολές ξεκλειδώνουν ταυτόχρονα για όλες τις ομάδες.'
                      : 'When session is not started, students entering a team stay in the waiting lobby. Clicking start unlocks missions simultaneously for all teams.'}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={handleToggleGameStart}
                  className={`px-6 py-3 rounded-2xl font-black text-sm flex items-center gap-2 shadow-xl transition-all cursor-pointer ${
                    isGameStarted
                      ? 'bg-rose-600 hover:bg-rose-500 text-white'
                      : 'bg-emerald-500 hover:bg-emerald-400 text-slate-950 scale-105 ring-4 ring-emerald-500/20'
                  }`}
                >
                  {isGameStarted ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5 fill-slate-950" />}
                  <span>
                    {isGameStarted
                      ? (isEl ? 'Επαναφορά σε Lobby Αναμονής' : 'Reset to Waiting Lobby')
                      : (isEl ? 'Έναρξη Δράσης για Όλες τις Ομάδες' : 'Start Session for All Teams')}
                  </span>
                </button>
              </div>
            </div>

            {/* Group Timers & Deadlines Configuration */}
            <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800 flex-wrap gap-2">
                <div className="flex items-center gap-2">
                  <Clock className="w-5 h-5 text-amber-400" />
                  <h3 className="text-base font-black text-white">
                    {isEl ? 'Χρονικά Όρια & Προθεσμίες ανά Ομάδα' : 'Group Time Limits & Deadlines'}
                  </h3>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setGroupTimers({ 'team-alpha': 15, 'team-beta': 15, 'team-gamma': 15, 'team-delta': 15 });
                    }}
                    className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold"
                  >
                    15 {isEl ? 'λεπτά όλες' : 'mins all'}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setGroupTimers({ 'team-alpha': 20, 'team-beta': 20, 'team-gamma': 20, 'team-delta': 20 });
                    }}
                    className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold"
                  >
                    20 {isEl ? 'λεπτά όλες' : 'mins all'}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setGroupTimers({ 'team-alpha': 30, 'team-beta': 30, 'team-gamma': 30, 'team-delta': 30 });
                    }}
                    className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold"
                  >
                    30 {isEl ? 'λεπτά όλες' : 'mins all'}
                  </button>
                </div>
              </div>

              <p className="text-xs text-slate-400">
                {isEl
                  ? 'Ορίστε προαιρετικό χρόνο αντίστροφης μέτρησης για κάθε ομάδα. Όταν ο χρόνος λήξει, η οθόνη της ομάδας κλειδώνει αυτόματα τις υποβολές.'
                  : 'Configure countdown deadlines per team. When time expires, submissions gracefully lock to challenge students.'}
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-2">
                {masterTeamsPool.map((team, tIdx) => {
                  const currentMins = groupTimers[team.id] ?? 20;
                  return (
                    <div
                      key={team.id}
                      style={{ borderColor: `${team.color}40` }}
                      className="p-4 rounded-2xl bg-slate-950 border space-y-3"
                    >
                      <div className="flex items-center gap-2">
                        <span className="text-2xl">{team.avatar}</span>
                        <div>
                          <div className="text-xs font-bold text-white">
                            {isEl ? `Ομάδα ${tIdx + 1}` : `Group ${tIdx + 1}`}
                          </div>
                          <div className="text-[10px] text-slate-400 truncate">
                            {isEl ? team.name.split(':')[1] : team.name_en?.split(':')[1]}
                          </div>
                        </div>
                      </div>

                      <div className="space-y-1">
                        <label className="text-[11px] font-bold text-slate-300 block">
                          {isEl ? 'Χρόνος Δράσης (λεπτά):' : 'Session Duration (mins):'}
                        </label>
                        <input
                          type="number"
                          min={1}
                          max={120}
                          value={currentMins}
                          onChange={(e) => {
                            setGroupTimers({
                              ...groupTimers,
                              [team.id]: Math.max(1, Number(e.target.value) || 1)
                            });
                          }}
                          className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-sm font-black text-amber-400"
                        />
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="pt-2 flex justify-end">
                <button
                  type="button"
                  onClick={handleSaveGroupTimers}
                  className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs sm:text-sm flex items-center gap-2 shadow-lg shadow-amber-500/20 cursor-pointer"
                >
                  <Check className="w-4 h-4" />
                  <span>{isEl ? 'Αποθήκευση Χρονικών Ορίων' : 'Save Timer Deadlines'}</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ================================================================= */}
        {/* TAB 4: EXPORT DATA (JSON / CSV)                                   */}
        {/* ================================================================= */}
        {activeTab === 'export' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* CSV Export Card */}
              <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-4">
                <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 flex items-center justify-center text-2xl font-bold">
                  📊
                </div>
                <div>
                  <h3 className="text-lg font-black text-white">
                    {isEl ? 'Εξαγωγή σε Excel / CSV' : 'Export to Excel / CSV'}
                  </h3>
                  <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                    {isEl
                      ? 'Κατεβάστε αναλυτικό αρχείο με όλες τις υποβολές, βαθμολογίες, ημερομηνίες και απαντήσεις των 4 ομάδων.'
                      : 'Download a spreadsheet containing all submissions, scores, timestamps and team answers.'}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleExportCsv}
                  className="w-full py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs sm:text-sm flex items-center justify-center gap-2 transition-colors cursor-pointer shadow-lg shadow-emerald-500/20"
                >
                  <FileSpreadsheet className="w-4 h-4" />
                  <span>{isEl ? 'Λήψη Υπολογιστικού Φύλλου CSV' : 'Download CSV Spreadsheet'}</span>
                </button>
              </div>

              {/* JSON Backup Card */}
              <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-4">
                <div className="w-12 h-12 rounded-2xl bg-amber-500/20 text-amber-400 border border-amber-500/40 flex items-center justify-center text-2xl font-bold">
                  💾
                </div>
                <div>
                  <h3 className="text-lg font-black text-white">
                    {isEl ? 'Πλήρες Αντίγραφο Ασφαλείας (JSON)' : 'Complete State Backup (JSON)'}
                  </h3>
                  <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                    {isEl
                      ? 'Αποθηκεύστε όλα τα δεδομένα (απαντήσεις, τροποποιημένες αποστολές, ρυθμίσεις) για μεταφορά σε άλλη συσκευή.'
                      : 'Backup all state (answers, custom questions, settings) for easy restoration on other devices.'}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleExportJson}
                  className="w-full py-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs sm:text-sm flex items-center justify-center gap-2 transition-colors cursor-pointer shadow-lg shadow-amber-500/20"
                >
                  <FileJson className="w-4 h-4" />
                  <span>{isEl ? 'Λήψη Αντιγράφου JSON' : 'Download JSON Backup'}</span>
                </button>
              </div>
            </div>

            {/* Restore from JSON Card */}
            <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-3">
              <h3 className="text-base font-black text-white flex items-center gap-2">
                <Upload className="w-4 h-4 text-cyan-400" />
                <span>{isEl ? 'Επαναφορά από Αρχείο JSON' : 'Restore from JSON Backup'}</span>
              </h3>
              <p className="text-xs text-slate-400">
                {isEl
                  ? 'Επιλέξτε ένα αρχείο backup που εξάγατε προηγουμένως για να επαναφέρετε την κατάσταση της τάξης.'
                  : 'Select a previously exported backup file to restore classroom state.'}
              </p>
              <input
                type="file"
                accept=".json"
                onChange={handleImportJsonFile}
                className="block w-full text-xs text-slate-400 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-slate-800 file:text-white hover:file:bg-slate-700 cursor-pointer"
              />
            </div>
          </div>
        )}

        {/* ================================================================= */}
        {/* TAB 5: TEAMS & SUBMISSIONS                                        */}
        {/* ================================================================= */}
        {activeTab === 'teams' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {masterTeamsPool.map((team, idx) => {
                const teamSubs = Object.values(submissions).filter((s) => s.teamId === team.id);
                const correctSubs = teamSubs.filter((s) => s.status === 'correct');
                const totalScore = correctSubs.reduce((acc, s) => acc + (s.scoreEarned || 0), 0);

                return (
                  <div
                    key={team.id}
                    style={{ borderColor: `${team.color}50` }}
                    className="p-5 rounded-3xl bg-slate-900 border space-y-3"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <span className="text-3xl">{team.avatar}</span>
                        <div>
                          <h4 className="font-bold text-white text-sm">
                            {isEl ? team.name : team.name_en || team.name}
                          </h4>
                          <span className="text-xs text-slate-400">
                            {correctSubs.length} {isEl ? 'σωστές απαντήσεις' : 'correct answers'}
                          </span>
                        </div>
                      </div>

                      <div className="text-right">
                        <span className="text-xl font-black text-amber-400">{totalScore}</span>
                        <span className="text-xs text-slate-400 ml-1">pts</span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-2 border-t border-slate-800">
                      <button
                        type="button"
                        onClick={() => {
                          const confirm = window.confirm(
                            isEl
                              ? `Θέλετε να μηδενίσετε τις απαντήσεις για την ${team.name};`
                              : `Reset all submissions for ${team.name}?`
                          );
                          if (confirm) {
                            onResetTeamSubmissions(team.id);
                            showNotification(isEl ? 'Οι απαντήσεις μηδενίστηκαν.' : 'Submissions reset.');
                          }
                        }}
                        className="text-xs font-bold text-rose-400 hover:text-rose-300 flex items-center gap-1 cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>{isEl ? 'Μηδενισμός Ομάδας' : 'Reset Team'}</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Global Reset Button */}
            <div className="p-4 rounded-2xl bg-rose-950/30 border border-rose-500/40 flex items-center justify-between gap-4 flex-wrap">
              <div>
                <h4 className="text-sm font-bold text-rose-300">
                  {isEl ? 'Ολική Επαναφορά Όλων των Υποβολών' : 'Reset All Submissions'}
                </h4>
                <p className="text-xs text-slate-400">
                  {isEl
                    ? 'Διαγράφει όλες τις απαντήσεις και τα σκορ όλων των ομάδων για νέα σχολική χρονιά/τάξη.'
                    : 'Clears all answers and scores across all 4 teams for a fresh session.'}
                </p>
              </div>
              <button
                type="button"
                onClick={() => {
                  const confirm = window.confirm(
                    isEl
                      ? 'ΠΡΟΣΟΧΗ: Θέλετε να διαγράψετε όλες τις απαντήσεις όλων των ομάδων;'
                      : 'WARNING: Clear all submissions for all teams?'
                  );
                  if (confirm) {
                    onResetAllSubmissions();
                    showNotification(isEl ? 'Όλες οι υποβολές διαγράφηκαν.' : 'All submissions reset.');
                  }
                }}
                className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer"
              >
                <Trash2 className="w-4 h-4" />
                <span>{isEl ? 'Ολικός Μηδενισμός' : 'Full Reset'}</span>
              </button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};
