import React, { useState, useMemo } from 'react';
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
  Check
} from 'lucide-react';
import { Question, Team, Submission } from '../types/game';
import {
  masterTeamsPool,
  masterTaskPool,
  TeamTaskStats,
  isTaskActive,
  isCheckpointTask,
  getCheckpointMetadata,
  getAllTasks
} from '../data/masterTaskPool';
import { storageService } from '../services/storageService';
import { exportService } from '../services/exportService';
import { TaskVisualEditForm } from './TaskVisualEditForm';

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
  onClose
}) => {
  const isEl = lang === 'el';

  // Authentication State
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    return storageService.isAdminAuthenticated();
  });
  const [passwordInput, setPasswordInput] = useState<string>('');
  const [authError, setAuthError] = useState<string | null>(null);

  // Active Admin Tab
  const [activeTab, setActiveTab] = useState<'pool' | 'export' | 'teams'>('pool');

  // Filter states for Master Pool view
  const [poolFilterStatus, setPoolFilterStatus] = useState<'all' | 'active' | 'inactive'>('all');
  const [selectedGroup, setSelectedGroup] = useState<string>('all');
  const [selectedType, setSelectedType] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [expandedTaskId, setExpandedTaskId] = useState<string | null>(null);

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
    // Accept standard educational passwords or master unlock
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

  // Bulk Actions
  const handleActivateAll = () => {
    const newOverrides: Record<string, boolean> = {};
    for (const t of allTasks) {
      newOverrides[t.id] = true;
    }
    onUpdateTaskOverrides(newOverrides);
    storageService.saveAllTaskActiveOverrides(newOverrides);
    showNotification(
      isEl ? 'Όλες οι 61 αποστολές ενεργοποιήθηκαν επιτυχώς!' : 'All 61 tasks activated successfully!'
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
            ? 'Θέλετε να επαναφέρετε τα δεδομένα από αυτό το αρχείο αντιγράφου ασφαλείας; Οι τρέχουσες απαντήσεις θα αντικατασταθούν.'
            : 'Do you want to restore data from this backup? Current submissions will be replaced.'
        );

        if (!confirmRestore) return;

        // Apply overrides if found
        if (parsed.taskActiveOverrides && typeof parsed.taskActiveOverrides === 'object') {
          onUpdateTaskOverrides(parsed.taskActiveOverrides);
          storageService.saveAllTaskActiveOverrides(parsed.taskActiveOverrides);
        }

        // Apply submissions if found
        if (parsed.submissions && typeof parsed.submissions === 'object') {
          storageService.saveAllSubmissions(parsed.submissions);
        }

        if (onRestoreStateFromJson) {
          onRestoreStateFromJson(text);
        }

        showNotification(isEl ? '✓ Τα δεδομένα επαναφέρθηκαν επιτυχώς!' : '✓ Data restored successfully!');
      } catch (err) {
        console.error('Import error', err);
        showNotification(isEl ? 'Σφάλμα κατά την ανάγνωση του αρχείου.' : 'Error reading backup file.', 'error');
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  // Team Task Stats calculation
  const teamStats: TeamTaskStats[] = useMemo(() => {
    return masterTeamsPool.map((team) => {
      const activeTasks = allTasks.filter((t) => {
        if (!isTaskActive(t, taskOverrides)) return false;
        if (!t.assignedTeamIds || t.assignedTeamIds.length === 0) return true;
        return t.assignedTeamIds.includes(team.id);
      });

      let completedTasks = 0;
      let totalScore = 0;

      for (const t of activeTasks) {
        const sub = submissions[`${team.id}_${t.id}`];
        if (sub && (sub.status === 'correct' || sub.status === 'completed')) {
          completedTasks += 1;
          totalScore += sub.scoreEarned || t.points || 0;
        }
      }

      return {
        team,
        totalActiveTasks: activeTasks.length,
        completedTasks,
        totalScore,
        progressPercent: activeTasks.length > 0 ? Math.round((completedTasks / activeTasks.length) * 100) : 0
      };
    });
  }, [allTasks, taskOverrides, submissions]);

  // =========================================================================
  // VIEW: PASSWORD GATE (IF NOT AUTHENTICATED)
  // =========================================================================
  if (!isAuthenticated) {
    return (
      <div className="fixed inset-0 z-50 bg-slate-950/90 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
        <div className="w-full max-w-md rounded-3xl bg-slate-900 border-2 border-slate-800 shadow-2xl p-6 sm:p-8 space-y-6 relative animate-in fade-in zoom-in-95 duration-200">
          <button
            type="button"
            onClick={onClose}
            className="absolute top-5 right-5 p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors cursor-pointer"
            title="Κλείσιμο"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="text-center space-y-2">
            <div className="w-16 h-16 rounded-2xl bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center justify-center mx-auto text-3xl shadow-lg shadow-amber-500/10">
              <Lock className="w-8 h-8" />
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-white">
              {isEl ? 'Κονσόλα Διαχείρισης Εκπαιδευτικού' : 'Teacher Admin Console'}
            </h2>
            <p className="text-xs sm:text-sm text-slate-400">
              {isEl
                ? 'Εισαγάγετε τον κωδικό πρόσβασης για να διαχειριστείτε το Master Pool και τις εξαγωγές.'
                : 'Enter the admin password to manage the Master Pool and export reports.'}
            </p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="text-xs font-bold text-slate-300 block mb-1.5 flex items-center gap-1.5">
                <KeyRound className="w-4 h-4 text-amber-400" />
                <span>{isEl ? 'Κωδικός Πρόσβασης:' : 'Admin Password:'}</span>
              </label>
              <input
                type="password"
                value={passwordInput}
                onChange={(e) => setPasswordInput(e.target.value)}
                placeholder={isEl ? 'π.χ. admin123 ή vulture2026' : 'e.g. admin123 or vulture2026'}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-amber-400 font-mono"
                autoFocus
              />
              {authError && (
                <p className="text-xs text-rose-400 mt-1.5 font-medium flex items-center gap-1">
                  <ShieldAlert className="w-3.5 h-3.5" />
                  <span>{authError}</span>
                </p>
              )}
            </div>

            <button
              type="submit"
              className="w-full py-3 px-4 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-sm shadow-lg shadow-amber-500/20 transition-all cursor-pointer active:scale-95 flex items-center justify-center gap-2"
            >
              <Unlock className="w-4 h-4" />
              <span>{isEl ? 'Είσοδος στην Κονσόλα' : 'Enter Admin Console'}</span>
            </button>
          </form>

          {/* Teacher Fast-Pass Demo Button */}
          <div className="pt-2 border-t border-slate-800 text-center space-y-2">
            <button
              type="button"
              onClick={handleFastPass}
              className="w-full py-2.5 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center justify-center gap-2 border border-slate-700 transition-colors cursor-pointer"
            >
              <Sparkles className="w-4 h-4 text-emerald-400" />
              <span>{isEl ? 'Γρήγορη Είσοδος Εκπαιδευτικού (Fast-Pass)' : 'Quick Teacher Unlock (Fast-Pass)'}</span>
            </button>
            <p className="text-[11px] text-slate-500">
              {isEl ? 'Προεπιλεγμένος κωδικός: admin123' : 'Default password: admin123'}
            </p>
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
              <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-[10px] font-bold text-emerald-300">
                ACTIVE
              </span>
            </div>
            <p className="text-xs text-slate-400">
              {isEl
                ? 'Διαχείριση Master Pool (Ενεργές / Pool), Εξαγωγή JSON & CSV, Παρακολούθηση Ομάδων'
                : 'Master Pool Management (Active / Pool), JSON & CSV Exports, Team Monitoring'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={handleLogout}
            className="px-3.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold flex items-center gap-1.5 border border-slate-700 transition-colors cursor-pointer"
            title="Αποσύνδεση"
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
          <button
            type="button"
            onClick={() => setActiveTab('pool')}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2 transition-all cursor-pointer ${
              activeTab === 'pool'
                ? 'bg-amber-500 text-slate-950 shadow-md font-black'
                : 'bg-slate-800/80 hover:bg-slate-800 text-slate-300 border border-slate-700/60'
            }`}
          >
            <Layers className="w-4 h-4" />
            <span>
              {isEl ? 'Master Pool (Ενεργές vs. Pool)' : 'Master Pool (Active vs. Pool)'}
            </span>
            <span className="px-1.5 py-0.5 rounded-full bg-slate-950/40 text-[10px]">
              {activeCount}/{allTasks.length}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('export')}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2 transition-all cursor-pointer ${
              activeTab === 'export'
                ? 'bg-amber-500 text-slate-950 shadow-md font-black'
                : 'bg-slate-800/80 hover:bg-slate-800 text-slate-300 border border-slate-700/60'
            }`}
          >
            <Download className="w-4 h-4" />
            <span>{isEl ? 'Εξαγωγή Δεδομένων (JSON / CSV)' : 'Export Data (JSON / CSV)'}</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('teams')}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2 transition-all cursor-pointer ${
              activeTab === 'teams'
                ? 'bg-amber-500 text-slate-950 shadow-md font-black'
                : 'bg-slate-800/80 hover:bg-slate-800 text-slate-300 border border-slate-700/60'
            }`}
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>{isEl ? 'Παρακολούθηση & Υποβολές Ομάδων' : 'Teams & Submissions'}</span>
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
          <div className="px-3 py-1 rounded-lg bg-amber-950/50 border border-amber-500/40 text-amber-300 flex items-center gap-1.5 font-semibold">
            <span>{isEl ? `Υποβολές: ${Object.keys(submissions).length}` : `Submissions: ${Object.keys(submissions).length}`}</span>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto p-4 sm:p-6 max-w-7xl w-full mx-auto space-y-6">
        {/* ================================================================= */}
        {/* TAB 1: MASTER POOL MANAGEMENT (ACTIVE VS INACTIVE) */}
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
                    className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 text-xs font-bold flex items-center gap-1.5 cursor-pointer transition-colors"
                  >
                    <EyeOff className="w-3.5 h-3.5" />
                    <span>{isEl ? 'Μεταφορά Όλων στο Pool' : 'Deactivate All to Pool'}</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleResetDefaults}
                    className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-amber-300 border border-amber-500/30 text-xs font-bold flex items-center gap-1.5 cursor-pointer transition-colors"
                    title="Επαναφορά στις αρχικές 61 ενεργές αποστολές"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>{isEl ? 'Επαναφορά Προεπιλογών' : 'Reset Defaults'}</span>
                  </button>
                </div>
              </div>

              {/* Filters & Search Row */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 border-t border-slate-800">
                {/* Search */}
                <div className="relative">
                  <Search className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder={isEl ? 'Αναζήτηση με ID, τίτλο ή λέξεις-κλειδιά...' : 'Search by ID, title or keywords...'}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-xs text-white focus:outline-none focus:border-amber-400 placeholder:text-slate-600"
                  />
                  {searchQuery && (
                    <button
                      type="button"
                      onClick={() => setSearchQuery('')}
                      className="absolute right-3 top-2.5 text-slate-500 hover:text-white"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>

                {/* Group Filter */}
                <select
                  value={selectedGroup}
                  onChange={(e) => setSelectedGroup(e.target.value)}
                  className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-amber-400"
                >
                  <option value="all">{isEl ? 'Όλες οι Ομάδες (Group 1 - 4)' : 'All Groups (Group 1 - 4)'}</option>
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
                  <option value="research">{isEl ? 'Έρευνα & Σύνθεση' : 'Research'}</option>
                </select>
              </div>
            </div>

            {/* Tasks Count */}
            <div className="flex items-center justify-between text-xs text-slate-400 px-1">
              <span>
                {isEl
                  ? `Εμφάνιση ${filteredTasks.length} από ${allTasks.length} αποστολές`
                  : `Showing ${filteredTasks.length} of ${allTasks.length} tasks`}
              </span>
              <span>
                {isEl ? 'Κάντε κλικ στον διακόπτη για άμεση εναλλαγή κατάστασης' : 'Click the toggle to change active state'}
              </span>
            </div>

            {/* Task Cards List */}
            <div className="space-y-3">
              {filteredTasks.length === 0 ? (
                <div className="p-8 rounded-2xl bg-slate-900 border border-slate-800 text-center space-y-2">
                  <div className="text-3xl">🔍</div>
                  <p className="text-sm font-bold text-slate-300">
                    {isEl ? 'Δεν βρέθηκαν αποστολές με τα επιλεγμένα κριτήρια.' : 'No tasks match the selected filters.'}
                  </p>
                  <button
                    type="button"
                    onClick={() => {
                      setPoolFilterStatus('all');
                      setSelectedGroup('all');
                      setSelectedType('all');
                      setSearchQuery('');
                    }}
                    className="text-xs text-amber-400 hover:underline cursor-pointer"
                  >
                    {isEl ? 'Καθαρισμός όλων των φίλτρων' : 'Clear all filters'}
                  </button>
                </div>
              ) : (
                filteredTasks.map((task, idx) => {
                  const active = isTaskActive(task, taskOverrides);
                  const isExpanded = expandedTaskId === task.id;
                  const cpMeta = getCheckpointMetadata(task);

                  // Group info
                  const targetTeamId = task.assignedTeamIds?.[0] || 'team-alpha';
                  const targetTeam = masterTeamsPool.find((t) => t.id === targetTeamId);

                  // Count submissions for this task
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
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex items-start gap-3 flex-1 min-w-0">
                          {/* Number & Toggle Switch */}
                          <div className="flex flex-col items-center gap-1.5 shrink-0 pt-0.5">
                            <button
                              type="button"
                              onClick={() => handleToggleTask(task.id)}
                              className={`w-12 h-6 rounded-full transition-colors relative cursor-pointer focus:outline-none ${
                                active ? 'bg-emerald-500' : 'bg-slate-700'
                              }`}
                              title={active ? 'Ενεργή (Κάντε κλικ για απενεργοποίηση)' : 'Ανενεργή (Κάντε κλικ για ενεργοποίηση)'}
                            >
                              <span
                                className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white transition-transform ${
                                  active ? 'translate-x-6' : 'translate-x-0'
                                }`}
                              />
                            </button>
                            <span className="text-[10px] font-mono text-slate-500">
                              #{idx + 1}
                            </span>
                          </div>

                          {/* Task Content */}
                          <div className="flex-1 min-w-0 space-y-1">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="font-mono text-xs text-amber-400 font-bold">
                                {task.id}
                              </span>

                              {targetTeam && (
                                <span
                                  style={{ backgroundColor: `${targetTeam.color}20`, color: targetTeam.color }}
                                  className="px-2 py-0.5 rounded-md text-[10px] font-bold"
                                >
                                  {targetTeam.avatar} {isEl ? targetTeam.name.split(':')[0] : targetTeam.name_en?.split(':')[0]}
                                </span>
                              )}

                              <span className="px-2 py-0.5 rounded-md bg-slate-800 text-[10px] font-semibold text-slate-300 uppercase">
                                {task.type.replace('_', ' ')}
                              </span>

                              <span className="px-2 py-0.5 rounded-md bg-amber-500/10 text-amber-400 border border-amber-500/30 text-[10px] font-bold">
                                +{task.points} pts
                              </span>

                              {cpMeta.isCheckpoint && (
                                <span className="px-2 py-0.5 rounded-md bg-rose-500/20 text-rose-300 border border-rose-500/40 text-[10px] font-bold flex items-center gap-1">
                                  🚩 <span>{cpMeta.badge}</span>
                                </span>
                              )}

                              <span
                                className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${
                                  active
                                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                                    : 'bg-slate-800 text-slate-500 border border-slate-700'
                                }`}
                              >
                                {active ? (isEl ? 'ΕΝΕΡΓΗ' : 'ACTIVE') : (isEl ? 'ΑΠΟΘΕΤΗΡΙΟ (POOL)' : 'POOL')}
                              </span>
                            </div>

                            <h4 className="text-sm font-bold text-white leading-snug">
                              {isEl ? task.title : task.title_en || task.title}
                            </h4>

                            <p className="text-xs text-slate-400 line-clamp-2">
                              {isEl ? task.description : task.description_en || task.description}
                            </p>
                          </div>
                        </div>

                        {/* Right side stats & Expand */}
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
                            className={`px-2.5 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                              isExpanded
                                ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
                                : 'bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white'
                            }`}
                            title={isExpanded ? 'Σύμπτυξη φόρμας' : 'Οπτική Επεξεργασία Αποστολής'}
                          >
                            <span>{isExpanded ? '✕' : '✏️'}</span>
                            <span className="hidden sm:inline">
                              {isExpanded ? (isEl ? 'Κλείσιμο' : 'Close') : (isEl ? 'Επεξεργασία' : 'Edit')}
                            </span>
                          </button>
                        </div>
                      </div>

                      {/* Expanded Visual Edit Form */}
                      {isExpanded && (
                        <div className="mt-4 pt-4 border-t border-slate-800">
                          <TaskVisualEditForm
                            task={task}
                            lang={lang}
                            isCustomized={Boolean(customQuestions[task.id])}
                            onSave={(updatedTask) => {
                              onSaveCustomQuestion?.(updatedTask);
                              showNotification(
                                isEl
                                  ? `Η αποστολή "${updatedTask.id}" (${updatedTask.title.slice(0, 30)}...) αποθηκεύτηκε επιτυχώς!`
                                  : `Task "${updatedTask.id}" saved successfully!`,
                                'success'
                              );
                              setExpandedTaskId(null);
                            }}
                            onResetToDefault={() => {
                              onResetCustomQuestion?.(task.id);
                              showNotification(
                                isEl
                                  ? `Η αποστολή "${task.id}" επανήλθε στις αρχικές προεπιλεγμένες τιμές!`
                                  : `Task "${task.id}" reset to default settings!`,
                                'info'
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
        {/* TAB 2: EXPORT & BACKUP CENTER */}
        {/* ================================================================= */}
        {activeTab === 'export' && (
          <div className="space-y-6">
            <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-2">
              <h2 className="text-xl font-black text-white flex items-center gap-2">
                <Download className="w-5 h-5 text-amber-400" />
                <span>{isEl ? 'Κέντρο Εξαγωγής & Αντιγράφων Ασφαλείας' : 'Export & Backup Center'}</span>
              </h2>
              <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
                {isEl
                  ? 'Κατεβάστε όλα τα δεδομένα των αποστολών, τις απαντήσεις των ομάδων και τα σκορ σε μορφή JSON ή CSV (έτοιμο για Excel/Google Sheets). Μπορείτε επίσης να εισαγάγετε ένα παλαιότερο αντίγραφο.'
                  : 'Download complete quest data, team submissions, and scores as JSON or CSV (Excel/Sheets ready). You can also restore a previous backup.'}
              </p>
            </div>

            {/* 3 Main Export Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              {/* Card 1: Full JSON Backup */}
              <div className="p-6 rounded-3xl bg-gradient-to-br from-slate-900 to-slate-900/80 border border-slate-800 hover:border-amber-500/50 shadow-xl space-y-4 flex flex-col justify-between transition-all">
                <div className="space-y-3">
                  <div className="w-12 h-12 rounded-2xl bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center justify-center">
                    <FileJson className="w-6 h-6" />
                  </div>
                  <h3 className="text-base font-bold text-white">
                    {isEl ? 'Πλήρες Αντίγραφο JSON (.json)' : 'Full System Backup (.json)'}
                  </h3>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    {isEl
                      ? 'Περιλαμβάνει το πλήρες Master Pool (61 αποστολές), κατάσταση Active/Inactive, όλες τις υποβολές των 4 ομάδων και τις σημειώσεις Padlet.'
                      : 'Includes the entire Master Pool (61 tasks), Active/Inactive overrides, all team submissions, and Padlet notes.'}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    exportService.exportFullJsonBackup({
                      tasks: allTasks,
                      teams: masterTeamsPool,
                      teamStats,
                      submissions,
                      synthesisNotes,
                      taskOverrides,
                      lang
                    });
                    showNotification(
                      isEl ? '✓ Το αρχείο αντιγράφου JSON δημιουργήθηκε και ξεκίνησε η λήψη!' : '✓ JSON backup generated and downloading!'
                    );
                  }}
                  className="w-full py-3 px-4 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs sm:text-sm flex items-center justify-center gap-2 shadow-lg shadow-amber-500/20 transition-all cursor-pointer active:scale-95"
                >
                  <Download className="w-4 h-4" />
                  <span>{isEl ? 'Λήψη Αντιγράφου JSON' : 'Download JSON Backup'}</span>
                </button>
              </div>

              {/* Card 2: Detailed Submissions CSV */}
              <div className="p-6 rounded-3xl bg-gradient-to-br from-slate-900 to-slate-900/80 border border-slate-800 hover:border-emerald-500/50 shadow-xl space-y-4 flex flex-col justify-between transition-all">
                <div className="space-y-3">
                  <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center">
                    <FileSpreadsheet className="w-6 h-6" />
                  </div>
                  <h3 className="text-base font-bold text-white">
                    {isEl ? 'Αναλυτικό Βαθμολόγιο CSV (.csv)' : 'Detailed Submissions CSV (.csv)'}
                  </h3>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    {isEl
                      ? 'Αρχείο CSV με κωδικοποίηση UTF-8 BOM για το Microsoft Excel. Περιέχει κάθε ερώτηση ανά ομάδα, κατάσταση, πόντους, χρονική σφραγίδα και πλήρεις απαντήσεις.'
                      : 'UTF-8 BOM CSV formatted for Excel/Sheets with per-task answers, timestamps, scores, and scientific notes.'}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    exportService.exportDetailedSubmissionsCsv({
                      tasks: allTasks,
                      teams: masterTeamsPool,
                      submissions,
                      taskOverrides,
                      lang
                    });
                    showNotification(
                      isEl ? '✓ Το αρχείο CSV αναλυτικών απαντήσεων δημιουργήθηκε!' : '✓ Submissions CSV generated!'
                    );
                  }}
                  className="w-full py-3 px-4 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs sm:text-sm flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20 transition-all cursor-pointer active:scale-95"
                >
                  <Download className="w-4 h-4" />
                  <span>{isEl ? 'Λήψη Αναλυτικού CSV' : 'Download Detailed CSV'}</span>
                </button>
              </div>

              {/* Card 3: Team Scoreboard Summary CSV */}
              <div className="p-6 rounded-3xl bg-gradient-to-br from-slate-900 to-slate-900/80 border border-slate-800 hover:border-cyan-500/50 shadow-xl space-y-4 flex flex-col justify-between transition-all">
                <div className="space-y-3">
                  <div className="w-12 h-12 rounded-2xl bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 flex items-center justify-center">
                    <CheckCircle2 className="w-6 h-6" />
                  </div>
                  <h3 className="text-base font-bold text-white">
                    {isEl ? 'Συγκεντρωτική Βαθμολογία CSV (.csv)' : 'Scoreboard Summary CSV (.csv)'}
                  </h3>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    {isEl
                      ? 'Συνοπτικός πίνακας κατάταξης των 4 ομάδων με ολοκληρωμένες αποστολές, ποσοστά προόδου και τελικό σκορ.'
                      : 'High-level scoreboard ranking the 4 teams by completed tasks, progress percentages, and total points.'}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    exportService.exportTeamScoreboardCsv({
                      teamStats,
                      lang
                    });
                    showNotification(
                      isEl ? '✓ Το αρχείο συγκεντρωτικής βαθμολογίας δημιουργήθηκε!' : '✓ Team scoreboard CSV generated!'
                    );
                  }}
                  className="w-full py-3 px-4 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-black text-xs sm:text-sm flex items-center justify-center gap-2 shadow-lg shadow-cyan-500/20 transition-all cursor-pointer active:scale-95"
                >
                  <Download className="w-4 h-4" />
                  <span>{isEl ? 'Λήψη Συνοπτικού CSV' : 'Download Summary CSV'}</span>
                </button>
              </div>
            </div>

            {/* Restore / Import Section */}
            <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-4">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-purple-500/20 text-purple-400 border border-purple-500/30">
                  <Upload className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">
                    {isEl ? 'Επαναφορά από Αρχείο Αντιγράφου JSON' : 'Restore from JSON Backup File'}
                  </h3>
                  <p className="text-xs text-slate-400">
                    {isEl
                      ? 'Επιλέξτε ένα αρχείο .json που δημιουργήθηκε προηγουμένως για να επαναφέρετε την κατάσταση των αποστολών και των απαντήσεων.'
                      : 'Select a previously exported .json file to restore task states and team answers.'}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3 flex-wrap">
                <label className="px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs sm:text-sm flex items-center gap-2 cursor-pointer transition-all shadow-md active:scale-95">
                  <Upload className="w-4 h-4" />
                  <span>{isEl ? 'Επιλογή Αρχείου JSON...' : 'Select JSON File...'}</span>
                  <input
                    type="file"
                    accept=".json,application/json"
                    onChange={handleImportJsonFile}
                    className="hidden"
                  />
                </label>
                <span className="text-xs text-slate-500">
                  {isEl ? 'Μέγιστο μέγεθος: 10MB • Μορφή: .json' : 'Max size: 10MB • Format: .json'}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* ================================================================= */}
        {/* TAB 3: TEAMS & SUBMISSIONS MONITORING */}
        {/* ================================================================= */}
        {activeTab === 'teams' && (
          <div className="space-y-6">
            <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 flex items-center justify-between gap-4 flex-wrap">
              <div>
                <h2 className="text-xl font-black text-white flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                  <span>{isEl ? 'Παρακολούθηση & Έλεγχος Υποβολών Ομάδων' : 'Teams & Submissions Monitoring'}</span>
                </h2>
                <p className="text-xs sm:text-sm text-slate-400 mt-1">
                  {isEl
                    ? 'Επισκόπηση της πορείας των 4 ομάδων, καταμέτρηση απαντήσεων και δυνατότητα μηδενισμού.'
                    : 'Overview of 4 teams progress, submission count and reset controls.'}
                </p>
              </div>

              <button
                type="button"
                onClick={onResetAllSubmissions}
                className="px-4 py-2 rounded-xl bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border border-rose-500/40 text-xs font-bold flex items-center gap-2 transition-colors cursor-pointer"
              >
                <Trash2 className="w-4 h-4" />
                <span>{isEl ? 'Μηδενισμός Όλων των Υποβολών' : 'Reset All Submissions'}</span>
              </button>
            </div>

            {/* 4 Team Scoreboard Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {teamStats.map((stat) => {
                const teamSubs = Object.values(submissions).filter(
                  (s) => s.teamId === stat.team.id && s.status === 'correct'
                );

                return (
                  <div
                    key={stat.team.id}
                    style={{ borderTopColor: stat.team.color }}
                    className="p-5 rounded-2xl bg-slate-900 border border-slate-800 border-t-4 shadow-lg space-y-4 flex flex-col justify-between"
                  >
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-2xl">{stat.team.avatar}</span>
                        <span className="px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 text-xs font-extrabold">
                          {stat.totalScore} pts
                        </span>
                      </div>

                      <h3 className="font-extrabold text-white text-sm line-clamp-1">
                        {isEl ? stat.team.name : stat.team.name_en || stat.team.name}
                      </h3>

                      <p className="text-xs text-slate-400 italic line-clamp-1">
                        "{isEl ? stat.team.slogan : stat.team.slogan_en || stat.team.slogan}"
                      </p>

                      {/* Progress Bar */}
                      <div className="space-y-1 pt-2">
                        <div className="flex items-center justify-between text-xs text-slate-300 font-semibold">
                          <span>{isEl ? 'Ολοκλήρωση' : 'Completed'}</span>
                          <span>
                            {stat.completedTasks} / {stat.totalActiveTasks} ({stat.progressPercent}%)
                          </span>
                        </div>
                        <div className="h-2 rounded-full bg-slate-800 overflow-hidden">
                          <div
                            style={{ width: `${stat.progressPercent}%`, backgroundColor: stat.team.color }}
                            className="h-full rounded-full transition-all duration-500"
                          />
                        </div>
                      </div>
                    </div>

                    <div className="pt-3 border-t border-slate-800 flex items-center justify-between">
                      <span className="text-[11px] text-slate-500">
                        {teamSubs.length} {isEl ? 'έγκυρες απαντήσεις' : 'answers logged'}
                      </span>
                      <button
                        type="button"
                        onClick={() => {
                          const conf = window.confirm(
                            isEl
                              ? `Θέλετε να μηδενίσετε τις απαντήσεις της ${stat.team.name};`
                              : `Reset all answers for ${stat.team.name}?`
                          );
                          if (conf) {
                            onResetTeamSubmissions(stat.team.id);
                            showNotification(
                              isEl ? `Οι απαντήσεις της ομάδας μηδενίστηκαν.` : `Team submissions cleared.`
                            );
                          }
                        }}
                        className="text-xs text-rose-400 hover:text-rose-300 hover:underline cursor-pointer"
                      >
                        {isEl ? 'Μηδενισμός' : 'Reset'}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </main>
    </div>
  );
};
