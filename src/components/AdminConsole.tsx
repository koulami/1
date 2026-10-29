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
  Award,
  ChevronUp,
  ChevronDown,
  ArrowUp,
  ArrowDown,
  GripVertical,
  Edit3,
  Users
} from 'lucide-react';
import { Question, Team, Submission, QuestionType, CustomTeamTitleRecord, CoreTrackId } from '../types/game';
import {
  masterTeamsPool,
  isTaskActive,
  isCheckpointTask,
  getCheckpointMetadata,
  getAllTasks,
  computeTeamTaskStats,
  getTeamsWithCustomTitles,
  getLocalizedTeamName,
  getLocalizedTeamSlogan,
  getTeamEffectiveLanguage,
  resolveTeamTrackId,
  CORE_THEMATIC_TRACKS
} from '../data/masterTaskPool';
import { storageService } from '../services/storageService';
import { exportService } from '../services/exportService';
import { TaskVisualEditForm } from './TaskVisualEditForm';
import { processLocalFile } from '../utils/fileUploadHelper';
import { TaskQrCodeModal } from './TaskQrCodeModal';
import { FieldMediaPlaybackModal } from './FieldMediaPlaybackModal';
import { AppJoinQrModal } from './AppJoinQrModal';
import { FieldSpotInfo } from '../types/game';

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
  taskOrder?: string[];
  onUpdateTaskOrder?: (newOrder: string[]) => void;
  customTeamTitles?: Record<string, CustomTeamTitleRecord>;
  onUpdateCustomTeamTitles?: (newTitles: Record<string, CustomTeamTitleRecord>) => void;
  subgroups?: Team[];
  onUpdateSubgroups?: (subgroups: Team[]) => void;
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
  onToggleLang,
  taskOrder,
  onUpdateTaskOrder,
  customTeamTitles,
  onUpdateCustomTeamTitles,
  subgroups: subgroupsProp,
  onUpdateSubgroups
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
  const [showJoinQrModal, setShowJoinQrModal] = useState<boolean>(false);

  // Subgroups list state
  const [subgroupsList, setSubgroupsList] = useState<Team[]>(() => subgroupsProp || storageService.getSubgroups());

  useEffect(() => {
    if (subgroupsProp) {
      setSubgroupsList(subgroupsProp);
    }
  }, [subgroupsProp]);

  useEffect(() => {
    const handleSubgroupsSync = () => {
      setSubgroupsList(storageService.getSubgroups());
    };
    window.addEventListener('boundpad:subgroups', handleSubgroupsSync);
    window.addEventListener('storage', handleSubgroupsSync);
    return () => {
      window.removeEventListener('boundpad:subgroups', handleSubgroupsSync);
      window.removeEventListener('storage', handleSubgroupsSync);
    };
  }, []);

  // Active teams with custom Greek/English titles and slogans merged
  const activeTeams = useMemo(() => {
    return getTeamsWithCustomTitles(customTeamTitles, subgroupsList);
  }, [customTeamTitles, subgroupsList]);

  // Subgroup Management State & Handlers
  const [showAddSubgroupModal, setShowAddSubgroupModal] = useState<boolean>(false);
  const [newSubTrackId, setNewSubTrackId] = useState<CoreTrackId>('team-delta');
  const [newSubNameEl, setNewSubNameEl] = useState<string>('');
  const [newSubNameEn, setNewSubNameEn] = useState<string>('');
  const [newSubSloganEl, setNewSubSloganEl] = useState<string>('');
  const [newSubSloganEn, setNewSubSloganEn] = useState<string>('');
  const [newSubLang, setNewSubLang] = useState<'el' | 'en'>('en');
  const [newSubAvatar, setNewSubAvatar] = useState<string>('🦅');

  const handleCreateSubgroup = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSubNameEl.trim() && !newSubNameEn.trim()) return;

    const baseTrack = masterTeamsPool.find((t) => t.id === newSubTrackId) || masterTeamsPool[0];
    const newId = `sub-${newSubTrackId}-${Date.now().toString(36)}`;
    const newTeam: Team = {
      id: newId,
      name: newSubNameEl.trim() || newSubNameEn.trim(),
      name_en: newSubNameEn.trim() || newSubNameEl.trim(),
      slogan: newSubSloganEl.trim() || baseTrack.slogan,
      slogan_en: newSubSloganEn.trim() || baseTrack.slogan_en || baseTrack.slogan,
      color: baseTrack.color,
      avatar: newSubAvatar || baseTrack.avatar,
      trackId: newSubTrackId,
      language: newSubLang
    };

    const updated = storageService.addSubgroup(newTeam);
    setSubgroupsList(updated);
    if (onUpdateSubgroups) onUpdateSubgroups(updated);

    showNotification(
      isEl
        ? `Η νέα υποομάδα "${newTeam.name}" δημιουργήθηκε και ανατέθηκε στον θεματικό πυλώνα!`
        : `New subgroup "${newTeam.name_en || newTeam.name}" created and assigned to the thematic track!`,
      'success'
    );

    setNewSubNameEl('');
    setNewSubNameEn('');
    setNewSubSloganEl('');
    setNewSubSloganEn('');
    setShowAddSubgroupModal(false);
  };

  const handleToggleSubgroupLang = (subgroupId: string) => {
    const target = subgroupsList.find((t) => t.id === subgroupId);
    const nextLang: 'el' | 'en' = target?.language === 'en' ? 'el' : 'en';
    const updated = storageService.updateSubgroup(subgroupId, { language: nextLang });
    setSubgroupsList(updated);
    if (onUpdateSubgroups) onUpdateSubgroups(updated);

    showNotification(
      isEl
        ? `Η γλώσσα της υποομάδας άλλαξε σε ${nextLang === 'el' ? 'Ελληνικά (🇬🇷)' : 'English (🇬🇧)'}`
        : `Subgroup language switched to ${nextLang === 'el' ? 'Greek (🇬🇷)' : 'English (🇬🇧)'}`,
      'info'
    );
  };

  const handleDeleteSubgroup = (subgroupId: string, name: string) => {
    const updated = storageService.deleteSubgroup(subgroupId);
    setSubgroupsList(updated);
    if (onUpdateSubgroups) onUpdateSubgroups(updated);

    showNotification(
      isEl
        ? `Η υποομάδα "${name}" διαγράφηκε.`
        : `Subgroup "${name}" deleted.`,
      'info'
    );
  };

  const handleResetSubgroupsToDefault = () => {
    const updated = storageService.resetSubgroupsToDefault();
    setSubgroupsList(updated);
    if (onUpdateSubgroups) onUpdateSubgroups(updated);

    showNotification(
      isEl
        ? 'Οι υποομάδες επανήλθαν στις 4 αρχικές.'
        : 'Subgroups reset to 4 default teams.',
      'info'
    );
  };

  // Inline reset confirmation states (100% reliable inside iframes, zero window.confirm blocking)
  const [confirmResetTeamId, setConfirmResetTeamId] = useState<string | null>(null);
  const [confirmResetAll, setConfirmResetAll] = useState<boolean>(false);

  const handleExecuteResetTeam = (targetTeamId: string, teamLabel?: string) => {
    try {
      onResetTeamSubmissions(targetTeamId);
      setConfirmResetTeamId(null);
      showNotification(
        isEl
          ? `Όλες οι απαντήσεις, τα σκορ και τα τεκμήρια για την ${teamLabel || targetTeamId} μηδενίστηκαν επιτυχώς!`
          : `All answers, scores and media for ${teamLabel || targetTeamId} have been reset successfully!`,
        'success'
      );
    } catch (err) {
      console.error('Error executing team reset:', err);
    }
  };

  const handleExecuteResetAll = () => {
    try {
      onResetAllSubmissions();
      setConfirmResetAll(false);
      showNotification(
        isEl
          ? 'Όλες οι υποβολές, τα σκορ και τα τεκμήρια όλων των ομάδων μηδενίστηκαν επιτυχώς!'
          : 'All submissions, scores and media across all teams have been cleared successfully!',
        'success'
      );
    } catch (err) {
      console.error('Error executing reset all:', err);
    }
  };

  // Draft state for team titles in Admin
  const [teamTitleDrafts, setTeamTitleDrafts] = useState<Record<string, CustomTeamTitleRecord>>(() => {
    return customTeamTitles || storageService.getCustomTeamTitles();
  });

  useEffect(() => {
    if (customTeamTitles) {
      setTeamTitleDrafts(customTeamTitles);
    }
  }, [customTeamTitles]);

  // Quick Rename Team Modal state (for Tab 1 individual group banner)
  const [quickRenameTeam, setQuickRenameTeam] = useState<Team | null>(null);

  const handleUpdateDraftField = (teamId: string, field: keyof CustomTeamTitleRecord, val: string) => {
    setTeamTitleDrafts((prev) => ({
      ...prev,
      [teamId]: {
        ...prev[teamId],
        [field]: val
      }
    }));
  };

  const handleSaveTeamTitle = (teamId: string) => {
    const draft = teamTitleDrafts[teamId] || {};
    storageService.saveCustomTeamTitle(teamId, draft);
    const updated = storageService.getCustomTeamTitles();
    setTeamTitleDrafts(updated);
    if (onUpdateCustomTeamTitles) {
      onUpdateCustomTeamTitles(updated);
    }
    showNotification(
      isEl
        ? 'Ο τίτλος και το σύνθημα της ομάδας αποθηκεύτηκαν επιτυχώς!'
        : 'Team title and slogan saved successfully!',
      'success'
    );
    if (quickRenameTeam && quickRenameTeam.id === teamId) {
      setQuickRenameTeam(null);
    }
  };

  const handleResetTeamTitle = (teamId: string) => {
    storageService.resetCustomTeamTitle(teamId);
    const updated = storageService.getCustomTeamTitles();
    setTeamTitleDrafts(updated);
    if (onUpdateCustomTeamTitles) {
      onUpdateCustomTeamTitles(updated);
    }
    showNotification(
      isEl
        ? 'Επαναφορά προεπιλεγμένου τίτλου και συνθήματος ομάδας.'
        : 'Reset team title and slogan to default curriculum names.',
      'info'
    );
    if (quickRenameTeam && quickRenameTeam.id === teamId) {
      setQuickRenameTeam(null);
    }
  };

  const handleResetAllTeamTitles = () => {
    storageService.resetAllCustomTeamTitles();
    setTeamTitleDrafts({});
    if (onUpdateCustomTeamTitles) {
      onUpdateCustomTeamTitles({});
    }
    showNotification(
      isEl
        ? 'Όλοι οι τίτλοι ομάδων επανήλθαν στις αρχικές ρυθμίσεις.'
        : 'All team titles reset to default curriculum names.',
      'info'
    );
  };

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

  // Survey / Poll creation state
  const [newSurveyOptions, setNewSurveyOptions] = useState<string[]>([
    isEl ? 'Εξάλειψη δηλητηριασμένων δολωμάτων (Ομάδες Ανίχνευσης K9)' : 'Elimination of poison baits (Anti-poison K9 units)',
    isEl ? 'Δίκτυο ασφαλών σταθμών σίτισης (Ταΐστρες)' : 'Network of secure feeding stations',
    isEl ? 'Ενίσχυση πληθυσμού με μεταφορά γυπών από Ισπανία' : 'Restocking population with Griffon vultures from Spain',
    isEl ? 'Μόνωση εναέριων γραμμών μεταφοράς ρεύματος' : 'Insulation of aerial power lines'
  ]);
  const [newSurveyOptionsEn, setNewSurveyOptionsEn] = useState<string[]>([
    'Elimination of poison baits (Anti-poison K9 units)',
    'Network of secure feeding stations',
    'Restocking population with Griffon vultures from Spain',
    'Insulation of aerial power lines'
  ]);
  const [newSurveyAllowMultiple, setNewSurveyAllowMultiple] = useState<boolean>(false);
  const [newSurveyAllowReason, setNewSurveyAllowReason] = useState<boolean>(true);
  const [newSurveyReasonPrompt, setNewSurveyReasonPrompt] = useState<string>(
    isEl ? 'Αιτιολογήστε την επιλογή σας (Ποια κριτήρια λάβατε υπόψη;):' : 'Justify your decision (What criteria guided your choice?):'
  );
  const [newSurveyReasonPromptEn, setNewSurveyReasonPromptEn] = useState<string>(
    'Justify your decision (What criteria guided your choice?):'
  );

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

  // Current custom sequence order
  const [currentOrder, setCurrentOrder] = useState<string[]>(() => {
    return taskOrder && taskOrder.length > 0 ? taskOrder : storageService.getTaskOrder();
  });

  // Modal states for QR Generation & Instant Media Playback
  const [qrModalTask, setQrModalTask] = useState<Question | null>(null);
  const [mediaModalInfo, setMediaModalInfo] = useState<{ question: Question; fieldSpot: FieldSpotInfo } | null>(null);

  useEffect(() => {
    if (taskOrder && taskOrder.length > 0) {
      setCurrentOrder(taskOrder);
    }
  }, [taskOrder]);

  // Compute stats with custom task overrides & custom sequential order
  const allTasks = useMemo(() => {
    return getAllTasks(customQuestions, currentOrder);
  }, [customQuestions, currentOrder]);
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

  // Helper to check if a task is specifically assigned to a group or its core track
  const isTaskAssignedToGroup = (task: Question, groupId: string) => {
    if (!task.assignedTeamIds || task.assignedTeamIds.length === 0) return true;
    const trackId = resolveTeamTrackId(groupId, activeTeams);
    return task.assignedTeamIds.includes(groupId) || task.assignedTeamIds.includes(trackId);
  };

  // Helper to check if a task is unassigned (available to be picked)
  const isTaskUnassigned = (task: Question) => {
    return !task.assignedTeamIds || task.assignedTeamIds.length === 0;
  };

  const matchesSearchAndType = (task: Question) => {
    if (selectedType !== 'all' && task.type !== selectedType) {
      return false;
    }
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim();
      const titleMatch = (task.title || '').toLowerCase().includes(query) || (task.title_en || '').toLowerCase().includes(query);
      const descMatch = (task.description || '').toLowerCase().includes(query);
      const idMatch = task.id.toLowerCase().includes(query);
      if (!titleMatch && !descMatch && !idMatch) return false;
    }
    return true;
  };

  // Filtered Tasks for All Groups Master View
  const filteredTasks = useMemo(() => {
    return allTasks.filter((task) => {
      const active = isTaskActive(task, taskOverrides);

      // Status filter
      if (poolFilterStatus === 'active' && !active) return false;
      if (poolFilterStatus === 'inactive' && active) return false;

      // Group filter
      if (selectedGroup !== 'all') {
        if (!isTaskAssignedToGroup(task, selectedGroup)) {
          return false;
        }
      }

      return matchesSearchAndType(task);
    });
  }, [allTasks, taskOverrides, poolFilterStatus, selectedGroup, selectedType, searchQuery]);

  // For Individual Group Management View:
  // Strictly only the active tasks specifically assigned to this group
  const groupActiveTasks = useMemo(() => {
    if (selectedGroup === 'all') return [];
    return allTasks.filter((task) => {
      if (!matchesSearchAndType(task)) return false;
      const active = isTaskActive(task, taskOverrides);
      const assigned = isTaskAssignedToGroup(task, selectedGroup);
      return active && assigned;
    });
  }, [allTasks, taskOverrides, selectedGroup, selectedType, searchQuery]);

  // Unassigned / Available tasks in the Master Pool (tasks not currently assigned to any group)
  const unassignedTasks = useMemo(() => {
    return allTasks.filter((task) => {
      if (!matchesSearchAndType(task)) return false;
      if (poolFilterStatus === 'active' && !isTaskActive(task, taskOverrides)) return false;
      if (poolFilterStatus === 'inactive' && isTaskActive(task, taskOverrides)) return false;
      return isTaskUnassigned(task);
    });
  }, [allTasks, taskOverrides, poolFilterStatus, selectedType, searchQuery]);

  // Reorder task sequence: move task up or down within current visible or group list
  const handleShiftTaskOrder = (taskId: string, direction: 'up' | 'down', contextList?: Question[]) => {
    const list = contextList || (selectedGroup !== 'all' ? groupActiveTasks : filteredTasks);
    const listIndex = list.findIndex((t) => t.id === taskId);
    if (listIndex === -1) return;
    if (direction === 'up' && listIndex === 0) return;
    if (direction === 'down' && listIndex === list.length - 1) return;

    const neighborTask = list[direction === 'up' ? listIndex - 1 : listIndex + 1];
    if (!neighborTask) return;

    // Build the updated master order of all tasks
    const fullIds = allTasks.map((t) => t.id);
    const withoutTarget = fullIds.filter((id) => id !== taskId);
    const neighborIndex = withoutTarget.indexOf(neighborTask.id);

    if (neighborIndex === -1) return;

    const insertIndex = direction === 'up' ? neighborIndex : neighborIndex + 1;
    const newFullOrder = [...withoutTarget];
    newFullOrder.splice(insertIndex, 0, taskId);

    // Save immediately to state and storage
    setCurrentOrder(newFullOrder);
    storageService.saveTaskOrder(newFullOrder);
    if (onUpdateTaskOrder) {
      onUpdateTaskOrder(newFullOrder);
    }

    showNotification(
      isEl
        ? `Η σειρά της αποστολής ενημερώθηκε επιτυχώς!`
        : `Task sequence order updated successfully!`
    );
  };

  // Quick 1-click assign and activate for individual group
  const handleAssignAndActivateForGroup = (task: Question, targetGroupId: string) => {
    // 1. Ensure assigned to targetGroupId
    const current = task.assignedTeamIds || [];
    let updatedTask = task;
    if (current.length > 0 && !current.includes(targetGroupId)) {
      const newAssigned = [...current, targetGroupId];
      updatedTask = {
        ...task,
        assignedTeamIds: newAssigned
      };
      if (onSaveCustomQuestion) {
        onSaveCustomQuestion(updatedTask);
      }
      storageService.saveCustomQuestion(updatedTask);
    }
    // 2. Ensure active
    if (!isTaskActive(task, taskOverrides)) {
      const newOverrides = {
        ...taskOverrides,
        [task.id]: true
      };
      onUpdateTaskOverrides(newOverrides);
      storageService.saveTaskActiveOverride(task.id, true);
    }
    showNotification(
      isEl
        ? `Η αποστολή "${task.title}" ενεργοποιήθηκε και ανατέθηκε στην ομάδα!`
        : `Task "${task.title}" assigned and activated for group!`,
      'success'
    );
  };

  // Quick 1-click unassign from an individual group
  const handleUnassignFromGroup = (task: Question, targetGroupId: string) => {
    const current = task.assignedTeamIds || [];
    const newAssigned = current.filter((id) => id !== targetGroupId);
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
        ? `Η αποστολή αφαιρέθηκε από την ομάδα και μεταφέρθηκε στις Διαθέσιμες / Unassigned.`
        : `Task removed from group and moved to Unassigned / Available tasks.`,
      'info'
    );
  };

  // Quick activate all tasks assigned to the current group
  const handleActivateAllForCurrentGroup = (groupId: string) => {
    const newOverrides: Record<string, boolean> = { ...taskOverrides };
    const groupTasks = allTasks.filter((t) => isTaskAssignedToGroup(t, groupId));
    for (const t of groupTasks) {
      newOverrides[t.id] = true;
      storageService.saveTaskActiveOverride(t.id, true);
    }
    onUpdateTaskOverrides(newOverrides);
    showNotification(
      isEl
        ? 'Όλες οι ανατεθειμένες αποστολές της ομάδας ενεργοποιήθηκαν!'
        : 'All assigned tasks for this group were activated!',
      'success'
    );
  };

  // Reset task sequence back to default
  const handleResetTaskOrder = () => {
    setCurrentOrder([]);
    storageService.resetTaskOrder();
    if (onUpdateTaskOrder) {
      onUpdateTaskOrder([]);
    }
    showNotification(
      isEl
        ? 'Η σειρά αποστολών επανήλθε στην αρχική προεπιλεγμένη.'
        : 'Task sequence reset to default curriculum order.'
    );
  };

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
      case 'survey': {
        const cleanOpts = newSurveyOptions.map((o) => o.trim()).filter(Boolean);
        const cleanOptsEn = newSurveyOptionsEn.map((o) => o.trim()).filter(Boolean);
        payload = {
          options: cleanOpts.length > 0 ? cleanOpts : ['Επιλογή 1', 'Επιλογή 2'],
          options_en: cleanOptsEn.length > 0 ? cleanOptsEn : undefined,
          allowMultiple: newSurveyAllowMultiple,
          allowCustomReason: newSurveyAllowReason,
          reasonPrompt: newSurveyReasonPrompt.trim() || undefined,
          reasonPrompt_en: newSurveyReasonPromptEn.trim() || undefined
        };
        break;
      }
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

  // Export filter: all tasks or only submitted tasks
  const [exportOnlySubmitted, setExportOnlySubmitted] = useState<boolean>(false);

  // Export handlers (Strictly 5 core educational fields: Ομάδα, Ερώτηση, Επιλογές, Απάντηση Μαθητών, Επιστημονική Εξήγηση)
  const handleExportCsv = () => {
    exportService.exportDetailedSubmissionsCsv({
      tasks: allTasks,
      teams: activeTeams,
      submissions,
      taskOverrides,
      lang,
      onlySubmitted: exportOnlySubmitted
    });
    showNotification(isEl ? 'Εξαγωγή εκπαιδευτικής αναφοράς CSV (5 πεδία) σε εξέλιξη...' : 'Exporting clean CSV report (5 core fields)...');
  };

  const handleExportJson = () => {
    exportService.exportCleanJsonReport({
      tasks: allTasks,
      teams: activeTeams,
      submissions,
      taskOverrides,
      lang,
      onlySubmitted: exportOnlySubmitted
    });
    showNotification(isEl ? 'Εξαγωγή εκπαιδευτικής αναφοράς JSON (5 πεδία) σε εξέλιξη...' : 'Exporting clean JSON report (5 core fields)...');
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

  const selectedTeamMeta = useMemo(() => {
    return activeTeams.find((t) => t.id === selectedGroup);
  }, [selectedGroup, activeTeams]);

  // Reusable Task Card Renderer for both Master Pool and Individual Group views
  const renderTaskCard = (
    task: Question,
    idx: number,
    list: Question[],
    isGroupView: boolean = false,
    isActiveSection: boolean = true
  ) => {
    const active = isTaskActive(task, taskOverrides);
    const isExpanded = expandedTaskId === task.id;
    const cpMeta = getCheckpointMetadata(task, lang);
    const taskSubmissions = Object.values(submissions).filter(
      (s) => s.questionId === task.id && s.status === 'correct'
    );
    const isAssignedToThisGroup = selectedGroup !== 'all' ? isTaskAssignedToGroup(task, selectedGroup) : true;

    return (
      <div
        key={task.id}
        className={`p-4 rounded-2xl border transition-all ${
          active && (!isGroupView || isActiveSection)
            ? 'bg-slate-900 border-slate-800 hover:border-slate-700 shadow-sm'
            : 'bg-slate-950/70 border-slate-800/80 hover:border-slate-700/80 opacity-90'
        }`}
      >
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div className="flex items-start gap-3.5 flex-1 min-w-[280px]">
            {/* Reordering Controls: shown in Active sections */}
            {isActiveSection ? (
              <div className="flex flex-col items-center justify-center shrink-0 bg-slate-950/90 p-1.5 rounded-2xl border border-slate-800 shadow-inner">
                <button
                  type="button"
                  disabled={idx === 0}
                  onClick={() => handleShiftTaskOrder(task.id, 'up', list)}
                  className={`p-1.5 rounded-lg transition-all ${
                    idx === 0
                      ? 'text-slate-700 cursor-not-allowed opacity-30'
                      : 'text-slate-300 hover:text-amber-400 hover:bg-slate-800 active:scale-90 cursor-pointer shadow-sm'
                  }`}
                  title={isEl ? 'Μετακίνηση αποστολής πάνω' : 'Move task up'}
                >
                  <ChevronUp className="w-4 h-4 stroke-[2.5]" />
                </button>

                <div className="py-0.5 px-1 font-mono text-[11px] font-black text-amber-400 select-none">
                  #{idx + 1}
                </div>

                <button
                  type="button"
                  disabled={idx === list.length - 1}
                  onClick={() => handleShiftTaskOrder(task.id, 'down', list)}
                  className={`p-1.5 rounded-lg transition-all ${
                    idx === list.length - 1
                      ? 'text-slate-700 cursor-not-allowed opacity-30'
                      : 'text-slate-300 hover:text-amber-400 hover:bg-slate-800 active:scale-90 cursor-pointer shadow-sm'
                  }`}
                  title={isEl ? 'Μετακίνηση αποστολής κάτω' : 'Move task down'}
                >
                  <ChevronDown className="w-4 h-4 stroke-[2.5]" />
                </button>
              </div>
            ) : (
              /* Placement badge in inactive section */
              <div className="flex flex-col items-center justify-center shrink-0 bg-slate-900/80 p-2 rounded-2xl border border-slate-800">
                <span className="text-base select-none">⏸️</span>
                <span className="font-mono text-[9px] text-slate-500 font-bold uppercase">Pool</span>
              </div>
            )}

            {/* Active Toggle Switch */}
            <div className="flex flex-col items-center gap-1.5 shrink-0 pt-1.5">
              <button
                type="button"
                onClick={() => handleToggleTask(task.id)}
                className={`w-12 h-6 rounded-full transition-colors relative cursor-pointer focus:outline-none ${
                  active ? 'bg-emerald-500' : 'bg-slate-700'
                }`}
                title={
                  active
                    ? isEl
                      ? 'Κάντε κλικ για απενεργοποίηση'
                      : 'Click to deactivate'
                    : isEl
                    ? 'Κάντε κλικ για ενεργοποίηση'
                    : 'Click to activate'
                }
              >
                <span
                  className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white transition-transform ${
                    active ? 'translate-x-6' : 'translate-x-0'
                  }`}
                />
              </button>
              <span className="text-[9px] font-bold uppercase tracking-wider text-slate-500">
                {active ? (isEl ? 'ΕΝΕΡΓΗ' : 'ON') : (isEl ? 'OFF' : 'OFF')}
              </span>
            </div>

            {/* Task Content */}
            <div className="flex-1 min-w-0 space-y-1.5">
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

                {/* Specific status badges for inactive/unassigned section in group view */}
                {isGroupView && !isActiveSection && (
                  <>
                    {!active && (
                      <span className="px-2 py-0.5 rounded-md bg-slate-800/90 text-slate-400 border border-slate-700 text-[10px] font-bold flex items-center gap-1">
                        ⏸️ <span>{isEl ? 'Ανενεργή στο Pool' : 'Inactive in Pool'}</span>
                      </span>
                    )}
                    {!isAssignedToThisGroup && (
                      <span className="px-2 py-0.5 rounded-md bg-amber-500/15 text-amber-300 border border-amber-500/30 text-[10px] font-bold flex items-center gap-1">
                        ➕ <span>{isEl ? 'Μη Ανατεθειμένη στην Ομάδα' : 'Unassigned to Group'}</span>
                      </span>
                    )}
                  </>
                )}
              </div>

              <h4 className="text-sm font-bold text-white leading-snug">
                {isEl ? task.title : task.title_en || task.title}
              </h4>

              <p className="text-xs text-slate-400 line-clamp-2">
                {isEl ? task.description : task.description_en || task.description}
              </p>

              {/* Group Assignment Controls */}
              <div className="pt-1.5 flex items-center gap-1.5 flex-wrap">
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
                      title={
                        isAssigned
                          ? isEl
                            ? 'Αφαιρέστε από την ομάδα'
                            : 'Remove from group'
                          : isEl
                          ? 'Αναθέστε στην ομάδα'
                          : 'Assign to group'
                      }
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
                  title={isEl ? 'Κοινή για όλες τις ομάδες' : 'Shared across all groups'}
                >
                  {isEl ? 'Όλες' : 'All'}
                </button>
              </div>
            </div>
          </div>

          {/* Right side Actions */}
          <div className="flex items-center gap-2 shrink-0 flex-wrap sm:flex-nowrap">
            {/* Quick action buttons for Group View */}
            {isGroupView && !isActiveSection && (
              <>
                {!isAssignedToThisGroup && !active ? (
                  <button
                    type="button"
                    onClick={() => handleAssignAndActivateForGroup(task, selectedGroup)}
                    className="px-3 py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-black flex items-center gap-1.5 shadow-md shadow-emerald-500/20 cursor-pointer transition-all hover:scale-105"
                    title={
                      isEl
                        ? 'Ανάθεση και άμεση ενεργοποίηση για αυτή την ομάδα'
                        : 'Assign and activate immediately for this group'
                    }
                  >
                    <Zap className="w-3.5 h-3.5 fill-slate-950" />
                    <span>{isEl ? 'Ανάθεση & Ενεργοποίηση' : 'Assign & Activate'}</span>
                  </button>
                ) : !isAssignedToThisGroup ? (
                  <button
                    type="button"
                    onClick={() => handleToggleTaskGroup(task, selectedGroup)}
                    className="px-3 py-1.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer transition-all hover:scale-105"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>{isEl ? 'Ανάθεση στην Ομάδα' : 'Assign to Group'}</span>
                  </button>
                ) : !active ? (
                  <button
                    type="button"
                    onClick={() => handleToggleTask(task.id)}
                    className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer transition-all hover:scale-105"
                  >
                    <Play className="w-3.5 h-3.5 fill-white" />
                    <span>{isEl ? 'Ενεργοποίηση' : 'Activate'}</span>
                  </button>
                ) : null}
              </>
            )}

            {isGroupView && isActiveSection && (
              <button
                type="button"
                onClick={() => handleUnassignFromGroup(task, selectedGroup)}
                className="px-2.5 py-1.5 rounded-xl bg-slate-800/80 hover:bg-rose-950/60 hover:text-rose-300 text-slate-400 border border-slate-700/60 text-xs font-medium transition-colors cursor-pointer"
                title={isEl ? 'Αφαίρεση από αυτή την ομάδα' : 'Remove from this group'}
              >
                <span>{isEl ? 'Αφαίρεση' : 'Remove'}</span>
              </button>
            )}

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

            {/* QR Code Definition & Playback Button */}
            <button
              type="button"
              onClick={() => setQrModalTask(task)}
              className="px-2.5 py-1.5 rounded-xl bg-purple-950/60 hover:bg-purple-900 border border-purple-500/40 hover:border-purple-400 text-purple-300 text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer shadow-sm active:scale-95"
              title={isEl ? 'Προβολή & Εκτύπωση QR Code Σταθμού / Δοκιμή Πολυμέσων' : 'View & Print Station QR / Test Media'}
            >
              <QrCode className="w-3.5 h-3.5 text-purple-400" />
              <span className="hidden sm:inline">{isEl ? 'QR Σταθμού' : 'Station QR'}</span>
            </button>

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
  };

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
            onClick={() => setShowJoinQrModal(true)}
            className="px-3.5 py-1.5 rounded-xl bg-sky-500/20 hover:bg-sky-500/30 text-sky-300 border border-sky-500/40 text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer shadow-sm active:scale-95"
            title={isEl ? 'QR Code για Άμεση Σύνδεση Μαθητών από Κινητά/Tablets' : 'Platform Join QR Code for Student Tablets/Mobiles'}
          >
            <QrCode className="w-3.5 h-3.5 text-sky-400" />
            <span>{isEl ? 'QR Σύνδεσης' : 'Join QR'}</span>
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
          <div className="space-y-6">
            {/* Quick Group Switcher Bar */}
            <div className="p-2 sm:p-2.5 rounded-2xl bg-slate-900 border border-slate-800 flex items-center gap-2 overflow-x-auto shadow-md">
              <span className="text-[10px] font-black uppercase text-slate-400 px-2 shrink-0">
                {isEl ? 'Ομάδα:' : 'Group:'}
              </span>

              {/* Master Pool button */}
              <button
                type="button"
                onClick={() => setSelectedGroup('all')}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer shrink-0 ${
                  selectedGroup === 'all'
                    ? 'bg-amber-500 text-slate-950 font-black shadow-md shadow-amber-500/20 scale-[1.02]'
                    : 'bg-slate-950/80 text-slate-300 hover:bg-slate-800 border border-slate-800'
                }`}
              >
                <Layers className="w-3.5 h-3.5" />
                <span>{isEl ? 'Master Pool (Όλες)' : 'Master Pool (All)'}</span>
                <span className="px-1.5 py-0.5 rounded-full bg-slate-900/60 text-[10px] font-mono">
                  {allTasks.length}
                </span>
              </button>

              {/* 4 Group Buttons */}
              {activeTeams.map((team) => {
                const isSelected = selectedGroup === team.id;
                const teamActiveCount = allTasks.filter(
                  (t) => isTaskActive(t, taskOverrides) && isTaskAssignedToGroup(t, team.id)
                ).length;

                return (
                  <button
                    key={team.id}
                    type="button"
                    onClick={() => setSelectedGroup(team.id)}
                    style={{
                      borderColor: isSelected ? team.color : undefined,
                      backgroundColor: isSelected ? `${team.color}25` : undefined
                    }}
                    className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer shrink-0 ${
                      isSelected
                        ? 'text-white border-2 shadow-md font-black ring-1 ring-white/20 scale-[1.02]'
                        : 'bg-slate-950/80 text-slate-400 hover:text-white hover:bg-slate-800 border border-slate-800'
                    }`}
                  >
                    <span className="text-sm">{team.avatar}</span>
                    <span>
                      {getLocalizedTeamName(team, lang).split(':')[0]}
                    </span>
                    <span
                      style={{ backgroundColor: `${team.color}40`, color: '#ffffff' }}
                      className="px-1.5 py-0.5 rounded-full text-[10px] font-mono font-bold"
                    >
                      {teamActiveCount}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* If an Individual Group is selected: Team View displays ONLY active tasks specifically assigned to this group */}
            {selectedGroup !== 'all' && selectedTeamMeta ? (
              <div className="space-y-6">
                {/* Group Header Banner */}
                <div
                  style={{
                    borderColor: `${selectedTeamMeta.color}60`,
                    background: `linear-gradient(135deg, ${selectedTeamMeta.color}18 0%, rgba(15,23,42,0.95) 100%)`
                  }}
                  className="p-5 sm:p-6 rounded-3xl border-2 shadow-xl space-y-4"
                >
                  <div className="flex items-center justify-between gap-4 flex-wrap">
                    <div className="flex items-center gap-3.5">
                      <div
                        style={{ borderColor: `${selectedTeamMeta.color}80` }}
                        className="w-14 h-14 rounded-2xl bg-slate-900 border-2 flex items-center justify-center text-3xl shadow-lg shrink-0"
                      >
                        {selectedTeamMeta.avatar}
                      </div>
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <h2 className="text-xl sm:text-2xl font-black text-white">
                            {getLocalizedTeamName(selectedTeamMeta, lang)}
                          </h2>
                          <span
                            style={{
                              backgroundColor: `${selectedTeamMeta.color}25`,
                              color: selectedTeamMeta.color,
                              borderColor: `${selectedTeamMeta.color}60`
                            }}
                            className="px-2.5 py-0.5 rounded-full text-xs font-black border uppercase"
                          >
                            {selectedTeamMeta.id.replace('team-', 'GROUP ')}
                          </span>
                        </div>
                        <p className="text-xs text-slate-300 mt-0.5 italic">
                          «{getLocalizedTeamSlogan(selectedTeamMeta, lang)}»
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 flex-wrap">
                      {/* Quick Rename Team Button */}
                      <button
                        type="button"
                        onClick={() => setQuickRenameTeam(selectedTeamMeta)}
                        className="px-3 py-2 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 text-xs font-bold flex items-center gap-1.5 cursor-pointer transition-colors active:scale-95 shadow-sm"
                        title={isEl ? `Μετονομασία τίτλου και συνθήματος για την ${selectedTeamMeta.name}` : `Rename title and slogan for ${selectedTeamMeta.name}`}
                      >
                        <Edit3 className="w-3.5 h-3.5 text-amber-400" />
                        <span>{isEl ? 'Μετονομασία Ομάδας' : 'Rename Team'}</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => handleActivateAllForCurrentGroup(selectedGroup)}
                        className="px-3.5 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs flex items-center gap-1.5 shadow-md shadow-emerald-500/20 cursor-pointer transition-all active:scale-95"
                      >
                        <CheckCircle2 className="w-4 h-4" />
                        <span>{isEl ? 'Ενεργοποίηση Όλων της Ομάδας' : 'Activate All for Group'}</span>
                      </button>
                      {confirmResetTeamId === selectedGroup ? (
                        <div className="flex items-center gap-1.5 animate-in fade-in zoom-in-95 duration-150">
                          <button
                            type="button"
                            onClick={() => handleExecuteResetTeam(selectedGroup, selectedTeamMeta.name)}
                            className="px-3 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-black flex items-center gap-1.5 cursor-pointer shadow-md shadow-rose-600/40 active:scale-95 animate-pulse"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                            <span>{isEl ? 'Επιβεβαίωση Μηδενισμού;' : 'Confirm Reset?'}</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => setConfirmResetTeamId(null)}
                            className="px-2.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold cursor-pointer transition-colors"
                            title={isEl ? 'Ακύρωση' : 'Cancel'}
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ) : (
                        <button
                          type="button"
                          onClick={() => setConfirmResetTeamId(selectedGroup)}
                          className="px-3 py-2 rounded-xl bg-rose-950/60 hover:bg-rose-900/80 text-rose-300 border border-rose-500/40 text-xs font-bold flex items-center gap-1.5 cursor-pointer transition-colors active:scale-95 shadow-sm"
                          title={isEl ? `Μηδενισμός απαντήσεων και σκορ ${selectedTeamMeta.name}` : `Reset submissions and scores for ${selectedTeamMeta.name}`}
                        >
                          <Trash2 className="w-3.5 h-3.5 text-rose-400" />
                          <span>{isEl ? 'Μηδενισμός Ομάδας' : 'Reset Team'}</span>
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={() => setSelectedGroup('all')}
                        className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold cursor-pointer transition-colors"
                      >
                        <span>{isEl ? '← Όλες οι Ομάδες (Master Pool)' : '← All Groups (Master Pool)'}</span>
                      </button>
                    </div>
                  </div>

                  {/* Group Metrics Row */}
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-2 border-t border-slate-800/80">
                    <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800/80">
                      <div className="text-[11px] font-bold text-slate-400 uppercase">
                        {isEl ? 'Ενεργές Αποστολές Ομάδας' : 'Active Tasks for Group'}
                      </div>
                      <div className="text-xl font-black text-emerald-400 mt-0.5">
                        {groupActiveTasks.length}
                      </div>
                    </div>
                    <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800/80">
                      <div className="text-[11px] font-bold text-slate-400 uppercase">
                        {isEl ? 'Συνολικοί Πόντοι Ομάδας' : 'Total Group Points'}
                      </div>
                      <div className="text-xl font-black text-amber-400 mt-0.5">
                        {groupActiveTasks.reduce((acc, t) => acc + (t.points || 0), 0)} pts
                      </div>
                    </div>
                    <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800/80">
                      <div className="text-[11px] font-bold text-slate-400 uppercase">
                        {isEl ? 'Σειρά Εκτέλεσης' : 'Sequence Order'}
                      </div>
                      <div className="text-xs font-bold text-amber-300 mt-1 flex items-center gap-1">
                        <span>⚡ {isEl ? 'Εξατομικευμένη (Βέλη)' : 'Customizable (Arrows)'}</span>
                      </div>
                    </div>
                  </div>

                  {/* Filter & Search Bar within Group View */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-slate-800/80">
                    <div className="relative">
                      <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                      <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder={
                          isEl
                            ? `Αναζήτηση στις ενεργές αποστολές της ${selectedTeamMeta.name}...`
                            : `Search active tasks in ${selectedTeamMeta.name}...`
                        }
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-amber-400"
                      />
                    </div>
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

                {/* Team View: Strictly displays ONLY the active tasks specifically assigned to that group */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between gap-3 flex-wrap p-4 rounded-2xl bg-emerald-950/40 border border-emerald-500/40 shadow-sm">
                    <div className="flex items-center gap-3">
                      <span className="w-3.5 h-3.5 rounded-full bg-emerald-400 animate-pulse shrink-0" />
                      <div>
                        <h3 className="text-sm sm:text-base font-black text-emerald-300 uppercase tracking-wider flex items-center gap-2">
                          <span>{isEl ? 'Ενεργές Αποστολές Ομάδας' : 'Active Tasks Specifically Assigned to Group'}</span>
                          <span className="px-2.5 py-0.5 rounded-full bg-emerald-500 text-slate-950 text-xs font-black">
                            {groupActiveTasks.length}
                          </span>
                        </h3>
                        <p className="text-xs text-slate-300 mt-0.5">
                          {isEl
                            ? 'Αποστολές που θα εμφανιστούν στην οθόνη των μαθητών αυτής της ομάδας, κατά σειρά εκτέλεσης (#1, #2, #3...). Χρησιμοποιήστε τα βέλη για αναδιάταξη.'
                            : 'Missions unlocked in arena for this team, in sequence order (#1, #2, #3...). Use up/down arrows to reorder.'}
                        </p>
                      </div>
                    </div>

                    {currentOrder.length > 0 && (
                      <button
                        type="button"
                        onClick={handleResetTaskOrder}
                        className="px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-amber-300 border border-amber-500/40 text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-sm"
                      >
                        <RotateCcw className="w-3.5 h-3.5" />
                        <span>{isEl ? 'Επαναφορά Σειράς' : 'Reset Sequence'}</span>
                      </button>
                    )}
                  </div>

                  {groupActiveTasks.length === 0 ? (
                    <div className="p-8 rounded-2xl bg-slate-900 border border-dashed border-emerald-500/40 text-center space-y-3">
                      <div className="text-3xl">📭</div>
                      <p className="text-sm font-bold text-emerald-300">
                        {isEl
                          ? 'Δεν υπάρχουν ενεργές αποστολές ανατεθειμένες σε αυτή την ομάδα.'
                          : 'No active tasks specifically assigned to this group.'}
                      </p>
                      <p className="text-xs text-slate-400 max-w-md mx-auto">
                        {isEl
                          ? 'Επιστρέψτε στο Master Pool για να επιλέξετε και να αναθέσετε αποστολές στην ομάδα αυτή με ένα κλικ.'
                          : 'Return to Master Pool to pick and assign tasks to this team with 1 click.'}
                      </p>
                      <button
                        type="button"
                        onClick={() => setSelectedGroup('all')}
                        className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs transition-colors cursor-pointer"
                      >
                        {isEl ? 'Μετάβαση στο Master Pool για Ανάθεση' : 'Go to Master Pool to Assign Tasks'}
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {groupActiveTasks.map((task, idx) =>
                        renderTaskCard(task, idx, groupActiveTasks, true, true)
                      )}
                    </div>
                  )}
                </div>
              </div>
            ) : (
              /* ========================================================================= */
              /* MASTER POOL / ADMIN OVERVIEW: Organized Clearly into Groups + Unassigned  */
              /* ========================================================================= */
              <div className="space-y-6">
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
                            ? 'bg-amber-500 text-slate-950 font-black'
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
                            ? 'bg-emerald-500 text-slate-950 font-black'
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
                            ? 'bg-slate-700 text-white font-black'
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
                        <span>{isEl ? 'Επαναφορά Ενεργών' : 'Reset Active'}</span>
                      </button>
                      <button
                        type="button"
                        onClick={handleResetTaskOrder}
                        disabled={currentOrder.length === 0}
                        className={`px-3 py-1.5 rounded-xl border text-xs font-semibold flex items-center gap-1.5 transition-colors ${
                          currentOrder.length > 0
                            ? 'bg-amber-500/15 hover:bg-amber-500/25 text-amber-300 border-amber-500/40 cursor-pointer shadow-sm'
                            : 'bg-slate-850 text-slate-600 border-slate-800 cursor-not-allowed opacity-50'
                        }`}
                        title={isEl ? 'Επαναφορά της σειράς αποστολών στην αρχική' : 'Reset task sequence to default'}
                      >
                        <ArrowDown className="w-3.5 h-3.5 rotate-180" />
                        <span>{isEl ? 'Επαναφορά Σειράς' : 'Reset Order'}</span>
                      </button>
                      {currentOrder.length > 0 && (
                        <span className="px-2.5 py-1 rounded-lg bg-amber-500/20 text-amber-300 border border-amber-500/40 text-[10px] font-bold">
                          ⚡ {isEl ? 'Προσαρμοσμένη Σειρά' : 'Custom Order'}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Filters & Search */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-slate-800/80">
                    <div className="relative">
                      <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                      <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder={isEl ? 'Αναζήτηση σε όλες τις αποστολές...' : 'Search across all tasks...'}
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-amber-400"
                      />
                    </div>

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
                      <option value="survey">{isEl ? 'Δημοσκόπηση / Γνώμη (Survey)' : 'Survey / Opinion Poll'}</option>
                    </select>
                  </div>
                </div>

                {/* ======================================================================= */}
                {/* 1. TASKS ORGANIZED CLEARLY BY GROUP (SHOWING WHICH BELONG TO WHICH TEAM)*/}
                {/* ======================================================================= */}
                <div className="space-y-6">
                  {masterTeamsPool.map((team) => {
                    const teamTasks = allTasks.filter((t) => {
                      if (!matchesSearchAndType(t)) return false;
                      if (poolFilterStatus === 'active' && !isTaskActive(t, taskOverrides)) return false;
                      if (poolFilterStatus === 'inactive' && isTaskActive(t, taskOverrides)) return false;
                      return isTaskAssignedToGroup(t, team.id);
                    });

                    const activeInTeamCount = teamTasks.filter((t) => isTaskActive(t, taskOverrides)).length;
                    const teamPoints = teamTasks
                      .filter((t) => isTaskActive(t, taskOverrides))
                      .reduce((acc, t) => acc + (t.points || 0), 0);

                    return (
                      <div
                        key={team.id}
                        style={{ borderColor: `${team.color}45` }}
                        className="rounded-3xl border bg-slate-900/70 p-4 sm:p-5 space-y-3 shadow-lg"
                      >
                        {/* Team Section Header */}
                        <div className="flex items-center justify-between gap-3 flex-wrap pb-3 border-b border-slate-800">
                          <div className="flex items-center gap-3">
                            <span
                              style={{ borderColor: `${team.color}70` }}
                              className="w-10 h-10 rounded-xl bg-slate-950 border flex items-center justify-center text-2xl shadow-inner shrink-0"
                            >
                              {team.avatar}
                            </span>
                            <div>
                              <div className="flex items-center gap-2 flex-wrap">
                                <h3 className="text-sm sm:text-base font-black text-white">
                                  {isEl ? team.name : team.name_en || team.name}
                                </h3>
                                <span
                                  style={{
                                    backgroundColor: `${team.color}25`,
                                    color: team.color,
                                    borderColor: `${team.color}50`
                                  }}
                                  className="px-2.5 py-0.5 rounded-full text-[10px] font-black border uppercase"
                                >
                                  {team.id.replace('team-', 'GROUP ')}
                                </span>
                              </div>
                              <p className="text-[11px] text-slate-400 mt-0.5">
                                {isEl ? team.slogan : team.slogan_en || team.slogan}
                              </p>
                            </div>
                          </div>

                          <div className="flex items-center gap-2 flex-wrap">
                            <div className="px-3 py-1 rounded-xl bg-slate-950 border border-slate-800 text-xs font-bold text-slate-300">
                              <span className="text-emerald-400 font-mono font-black">{activeInTeamCount}</span>
                              <span className="text-slate-500">/{teamTasks.length} {isEl ? 'ενεργές' : 'active'}</span>
                              <span className="text-amber-400 font-mono ml-2 font-black">+{teamPoints} pts</span>
                            </div>
                            <button
                              type="button"
                              onClick={() => setSelectedGroup(team.id)}
                              style={{ borderColor: `${team.color}60` }}
                              className="px-3.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold border transition-all cursor-pointer flex items-center gap-1.5 hover:scale-105 active:scale-95"
                            >
                              <span>{isEl ? 'Προβολή Ομάδας →' : 'View Team →'}</span>
                            </button>
                          </div>
                        </div>

                        {/* Team Tasks List */}
                        {teamTasks.length === 0 ? (
                          <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800/60 text-center">
                            <p className="text-xs text-slate-500 italic">
                              {isEl
                                ? 'Δεν υπάρχουν αποστολές για αυτή την ομάδα με τα επιλεγμένα φίλτρα.'
                                : 'No tasks match for this group under the selected filters.'}
                            </p>
                          </div>
                        ) : (
                          <div className="space-y-2.5">
                            {teamTasks.map((task, idx) =>
                              renderTaskCard(task, idx, teamTasks, true, true)
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>

                {/* ======================================================================= */}
                {/* 2. DEDICATED DISTINCT SECTION FOR UNASSIGNED / AVAILABLE TASKS          */}
                {/* ======================================================================= */}
                <div className="p-5 sm:p-6 rounded-3xl border-2 border-dashed border-amber-500/50 bg-slate-900/90 shadow-2xl space-y-4">
                  <div className="flex items-center justify-between gap-3 flex-wrap pb-3 border-b border-slate-800">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-2xl bg-amber-500/20 text-amber-400 border border-amber-500/40 flex items-center justify-center text-2xl font-black shrink-0">
                        📦
                      </div>
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <h3 className="text-base sm:text-lg font-black text-amber-400 uppercase tracking-wide">
                            {isEl ? 'Μη Ανατεθειμένες / Διαθέσιμες Αποστολές' : 'Unassigned / Available Tasks'}
                          </h3>
                          <span className="px-2.5 py-0.5 rounded-full bg-amber-500/20 border border-amber-500/40 text-amber-300 text-xs font-black">
                            {unassignedTasks.length} {isEl ? 'διαθέσιμες' : 'available'}
                          </span>
                        </div>
                        <p className="text-xs text-slate-300 mt-0.5">
                          {isEl
                            ? 'Αποστολές του αποθετηρίου που δεν έχουν ανατεθεί σε καμία ομάδα. Πατήστε στο κουμπί της αντίστοιχης ομάδας (G1, G2, G3, G4) για να τις αναθέσετε άμεσα!'
                            : 'Tasks not currently assigned to any group. Click any group button (G1, G2, G3, G4) to assign them immediately!'}
                        </p>
                      </div>
                    </div>
                  </div>

                  {unassignedTasks.length === 0 ? (
                    <div className="p-8 rounded-2xl bg-slate-950/70 border border-slate-800 text-center space-y-2">
                      <div className="text-3xl">✨</div>
                      <p className="text-sm font-bold text-slate-300">
                        {isEl
                          ? 'Όλες οι αποστολές του Master Pool είναι αυτή τη στιγμή ανατεθειμένες σε ομάδες!'
                          : 'All tasks in the Master Pool are currently assigned to groups!'}
                      </p>
                      <p className="text-xs text-slate-500">
                        {isEl
                          ? 'Αν αφαιρέσετε μια αποστολή από κάποια ομάδα, θα εμφανιστεί αυτόματα εδώ.'
                          : 'If you remove a task from any group, it will automatically appear here.'}
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {unassignedTasks.map((task) => {
                        const active = isTaskActive(task, taskOverrides);
                        const isExpanded = expandedTaskId === task.id;
                        const cpMeta = getCheckpointMetadata(task, lang);

                        return (
                          <div
                            key={task.id}
                            className={`p-4 rounded-2xl border transition-all ${
                              active
                                ? 'bg-slate-950/90 border-slate-800 hover:border-amber-500/40 shadow-sm'
                                : 'bg-slate-950/60 border-slate-800/60 opacity-80'
                            }`}
                          >
                            <div className="flex items-start justify-between gap-4 flex-wrap">
                              <div className="flex items-start gap-3.5 flex-1 min-w-[280px]">
                                {/* Available Badge Icon */}
                                <div className="flex flex-col items-center justify-center shrink-0 bg-amber-500/10 p-2 rounded-2xl border border-amber-500/30 text-amber-400">
                                  <span className="text-lg">📦</span>
                                  <span className="font-mono text-[9px] font-bold uppercase mt-0.5">Pool</span>
                                </div>

                                {/* Active Toggle Switch */}
                                <div className="flex flex-col items-center gap-1.5 shrink-0 pt-1.5">
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
                                  <span className="text-[9px] font-bold uppercase tracking-wider text-slate-500">
                                    {active ? (isEl ? 'ΕΝΕΡΓΗ' : 'ON') : (isEl ? 'OFF' : 'OFF')}
                                  </span>
                                </div>

                                {/* Task Details */}
                                <div className="flex-1 min-w-0 space-y-1.5">
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
                                    <span className="px-2 py-0.5 rounded-md bg-amber-500/15 text-amber-300 border border-amber-500/30 text-[10px] font-bold">
                                      {isEl ? 'Μη Ανατεθειμένη' : 'Unassigned'}
                                    </span>
                                  </div>

                                  <h4 className="text-sm font-bold text-white leading-snug">
                                    {isEl ? task.title : task.title_en || task.title}
                                  </h4>
                                  <p className="text-xs text-slate-400 line-clamp-2">
                                    {isEl ? task.description : task.description_en || task.description}
                                  </p>

                                  {/* 1-Click Pick / Assign Buttons */}
                                  <div className="pt-2 flex items-center gap-2 flex-wrap">
                                    <span className="text-xs font-bold text-amber-300 mr-1">
                                      {isEl ? '➕ Ανάθεση σε Ομάδα:' : '➕ Pick for Group:'}
                                    </span>
                                    {masterTeamsPool.map((team) => (
                                      <button
                                        key={team.id}
                                        type="button"
                                        onClick={() => handleToggleTaskGroup(task, team.id)}
                                        style={{
                                          borderColor: team.color,
                                          backgroundColor: `${team.color}18`,
                                          color: team.color
                                        }}
                                        className="px-2.5 py-1 rounded-xl border text-xs font-bold flex items-center gap-1.5 hover:scale-105 active:scale-95 transition-all cursor-pointer shadow-sm hover:brightness-125"
                                        title={isEl ? `Ανάθεση στην ${team.name}` : `Assign to ${team.name}`}
                                      >
                                        <span>{team.avatar}</span>
                                        <span>+ {team.name.split(':')[0]}</span>
                                      </button>
                                    ))}
                                  </div>
                                </div>
                              </div>

                              {/* Edit button */}
                              <div className="flex items-center gap-2 shrink-0">
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
                      })}
                    </div>
                  )}
                </div>
              </div>
            )}
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
                  <option value="survey">{isEl ? '9. Δημοσκόπηση & Επιλογή Γνώμης (Survey / Poll)' : '9. Opinion Poll / Survey'}</option>
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

              {/* Survey / Opinion Poll Options */}
              {newType === 'survey' && (
                <div className="p-4 rounded-2xl bg-purple-950/20 border border-purple-500/40 space-y-4">
                  <div className="flex items-center justify-between flex-wrap gap-2">
                    <label className="text-xs font-black text-purple-300 uppercase tracking-wider flex items-center gap-2">
                      <span>📊</span>
                      <span>{isEl ? 'Επιλογές Δημοσκόπησης / Ψηφοφορίας (Survey Options)' : 'Survey / Poll Choices'}</span>
                    </label>
                    <button
                      type="button"
                      onClick={() => {
                        setNewSurveyOptions([...newSurveyOptions, `${isEl ? 'Νέα Επιλογή' : 'New Option'} ${newSurveyOptions.length + 1}`]);
                        setNewSurveyOptionsEn([...newSurveyOptionsEn, `New Option ${newSurveyOptionsEn.length + 1}`]);
                      }}
                      className="text-xs text-purple-400 hover:text-purple-300 font-bold flex items-center gap-1 cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>{isEl ? 'Προσθήκη Επιλογής' : 'Add Choice'}</span>
                    </button>
                  </div>

                  {/* Options List */}
                  <div className="space-y-3">
                    {newSurveyOptions.map((opt, oIdx) => (
                      <div key={oIdx} className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 space-y-2">
                        <div className="flex items-center justify-between text-[11px] font-bold text-slate-400">
                          <span>{isEl ? `Επιλογή #${oIdx + 1}` : `Choice #${oIdx + 1}`}</span>
                          {newSurveyOptions.length > 2 && (
                            <button
                              type="button"
                              onClick={() => {
                                setNewSurveyOptions(newSurveyOptions.filter((_, i) => i !== oIdx));
                                setNewSurveyOptionsEn(newSurveyOptionsEn.filter((_, i) => i !== oIdx));
                              }}
                              className="text-rose-400 hover:text-rose-300 text-xs cursor-pointer flex items-center gap-1"
                            >
                              <Trash2 className="w-3 h-3" />
                              <span>{isEl ? 'Διαγραφή' : 'Delete'}</span>
                            </button>
                          )}
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                          <div>
                            <span className="text-[10px] text-slate-500 block mb-0.5">{isEl ? 'Ελληνικά:' : 'Greek:'}</span>
                            <input
                              type="text"
                              value={opt}
                              onChange={(e) => {
                                const updated = [...newSurveyOptions];
                                updated[oIdx] = e.target.value;
                                setNewSurveyOptions(updated);
                              }}
                              placeholder={isEl ? 'Κείμενο επιλογής...' : 'Option text in Greek...'}
                              className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white"
                            />
                          </div>
                          <div>
                            <span className="text-[10px] text-slate-500 block mb-0.5">English:</span>
                            <input
                              type="text"
                              value={newSurveyOptionsEn[oIdx] || ''}
                              onChange={(e) => {
                                const updated = [...newSurveyOptionsEn];
                                updated[oIdx] = e.target.value;
                                setNewSurveyOptionsEn(updated);
                              }}
                              placeholder="Option text in English..."
                              className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white"
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Settings: Multi-select & Reasoning */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-purple-500/20">
                    <label className="flex items-center gap-2 cursor-pointer text-xs text-slate-300">
                      <input
                        type="checkbox"
                        checked={newSurveyAllowMultiple}
                        onChange={(e) => setNewSurveyAllowMultiple(e.target.checked)}
                        className="rounded border-slate-700 text-purple-500 focus:ring-purple-400"
                      />
                      <span>{isEl ? 'Επιτρέπεται πολλαπλή επιλογή (Checkboxes)' : 'Allow multiple selections'}</span>
                    </label>

                    <label className="flex items-center gap-2 cursor-pointer text-xs text-slate-300">
                      <input
                        type="checkbox"
                        checked={newSurveyAllowReason}
                        onChange={(e) => setNewSurveyAllowReason(e.target.checked)}
                        className="rounded border-slate-700 text-purple-500 focus:ring-purple-400"
                      />
                      <span>{isEl ? 'Πεδίο αιτιολόγησης σκέψης ομάδας' : 'Require team written reasoning'}</span>
                    </label>
                  </div>

                  {newSurveyAllowReason && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                      <div>
                        <label className="text-[10px] text-slate-400 block mb-0.5">{isEl ? 'Προτροπή Αιτιολόγησης (Ελληνικά):' : 'Reason Prompt (Greek):'}</label>
                        <input
                          type="text"
                          value={newSurveyReasonPrompt}
                          onChange={(e) => setNewSurveyReasonPrompt(e.target.value)}
                          className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] text-slate-400 block mb-0.5">{isEl ? 'Προτροπή Αιτιολόγησης (English):' : 'Reason Prompt (English):'}</label>
                        <input
                          type="text"
                          value={newSurveyReasonPromptEn}
                          onChange={(e) => setNewSurveyReasonPromptEn(e.target.value)}
                          className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white"
                        />
                      </div>
                    </div>
                  )}
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

            {/* Classroom Live QR Code Generator & Projection Card */}
            <div className="p-6 rounded-3xl bg-slate-900 border border-sky-500/30 shadow-xl space-y-4">
              <div className="flex items-center justify-between gap-4 flex-wrap pb-3 border-b border-slate-800">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-sky-500/20 border border-sky-500/40 flex items-center justify-center text-sky-400">
                    <QrCode className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-black text-white flex items-center gap-2">
                      <span>{isEl ? 'QR Code Άμεσης Σύνδεσης Μαθητών & Προβολή Τάξης' : 'Student Live Join QR Code & Classroom Projection'}</span>
                      <span className="px-2 py-0.5 rounded-full bg-sky-500/20 text-sky-300 text-[10px] font-black uppercase">
                        AUTO-GENERATED
                      </span>
                    </h3>
                    <p className="text-xs text-slate-400 mt-0.5">
                      {isEl
                        ? 'Δημιουργείται αυτόματα με βάση το ενεργό live URL της εφαρμογής για άμεση σάρωση από tablet/κινητά.'
                        : 'Automatically generated from current live app URL for zero-friction tablet/mobile scanning.'}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setShowJoinQrModal(true)}
                    className="px-4 py-2 rounded-xl bg-sky-600 hover:bg-sky-500 text-white text-xs font-black flex items-center gap-2 shadow-md shadow-sky-600/30 transition-all cursor-pointer hover:scale-102 active:scale-95"
                  >
                    <QrCode className="w-4 h-4" />
                    <span>{isEl ? 'Προβολή QR σε Πλήρη Οθόνη (Beamer)' : 'Fullscreen Beamer Mode'}</span>
                  </button>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row items-center gap-6 pt-2">
                <div
                  onClick={() => setShowJoinQrModal(true)}
                  className="p-3 bg-white rounded-2xl shadow-lg ring-4 ring-sky-500/20 cursor-pointer hover:scale-105 transition-transform shrink-0"
                  title={isEl ? 'Κάντε κλικ για μεγέθυνση και προβολή' : 'Click to enlarge and project'}
                >
                  <div className="w-36 h-36 flex items-center justify-center relative">
                    <img
                      src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(
                        typeof window !== 'undefined' ? `${window.location.origin}${window.location.pathname}` : 'https://ais-dev-c76we52w6koqkel3h2r7ji-874757189421.europe-west2.run.app'
                      )}&margin=1`}
                      alt="Classroom Join QR Code"
                      className="w-full h-full object-contain rounded-xl"
                    />
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-7 h-7 rounded-lg bg-slate-900 border border-amber-400 flex items-center justify-center text-xs shadow-md">
                      🦅
                    </div>
                  </div>
                </div>

                <div className="space-y-3 flex-1 min-w-0">
                  <div className="p-3 rounded-2xl bg-slate-950/80 border border-slate-800">
                    <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                      {isEl ? 'Ενεργός Σύνδεσμος Πλατφόρμας (Live URL):' : 'Active Platform URL:'}
                    </div>
                    <div className="font-mono text-xs text-sky-300 break-all select-all">
                      {typeof window !== 'undefined' ? `${window.location.origin}${window.location.pathname}` : 'https://ais-dev-c76we52w6koqkel3h2r7ji-874757189421.europe-west2.run.app'}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 flex-wrap">
                    <button
                      type="button"
                      onClick={() => setShowJoinQrModal(true)}
                      className="px-3.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
                    >
                      <span>{isEl ? '🔍 Προσαρμογή & Εκτύπωση Κάρτας' : '🔍 Customize & Print Card'}</span>
                    </button>
                    <span className="text-xs text-slate-400">
                      {isEl
                        ? '💡 Συμβουλή: Πατήστε «Προβολή QR σε Πλήρη Οθόνη» για προβολή στον διαδραστικό πίνακα της τάξης.'
                        : '💡 Tip: Click Fullscreen to project onto classroom smartboard/beamer.'}
                    </span>
                  </div>
                </div>
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
                {activeTeams.map((team, tIdx) => {
                  const currentMins = groupTimers[team.id] ?? 20;
                  const localizedName = getLocalizedTeamName(team, lang);
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
                            {localizedName.includes(':') ? localizedName.split(':')[1]?.trim() : localizedName}
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
        {/* ================================================================= */}
        {/* TAB 4: EXPORT DATA (CSV / JSON EDUCATIONAL REPORT)                 */}
        {/* ================================================================= */}
        {activeTab === 'export' && (
          <div className="space-y-6">
            {/* Header Card Explaining the 5 Core Fields */}
            <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-4 shadow-xl">
              <div className="flex items-center justify-between gap-4 flex-wrap pb-4 border-b border-slate-800">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 flex items-center justify-center text-2xl font-bold shrink-0">
                    📋
                  </div>
                  <div>
                    <h3 className="text-lg font-black text-white flex items-center gap-2">
                      <span>{isEl ? 'Εξαγωγή Εκπαιδευτικής Αναφοράς (CSV / JSON)' : 'Educational Report Export (CSV / JSON)'}</span>
                      <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-[10px] font-black uppercase">
                        5 CORE FIELDS
                      </span>
                    </h3>
                    <p className="text-xs text-slate-400 mt-0.5 leading-relaxed">
                      {isEl
                        ? 'Καθαρή εξαγωγή εστιασμένη αποκλειστικά στα 5 ζητούμενα παιδαγωγικά πεδία, απαλλαγμένη από τεχνικά αναγνωριστικά και περιττές πληροφορίες.'
                        : 'Clean export strictly focused on the 5 essential pedagogical fields, eliminating clutter and technical IDs.'}
                    </p>
                  </div>
                </div>

                {/* Scope Filter Toggle */}
                <div className="flex items-center gap-1.5 p-1 rounded-xl bg-slate-950 border border-slate-800 text-xs font-bold">
                  <button
                    type="button"
                    onClick={() => setExportOnlySubmitted(false)}
                    className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                      !exportOnlySubmitted
                        ? 'bg-emerald-500 text-slate-950 font-black shadow-xs'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    {isEl ? 'Όλες οι Αποστολές' : 'All Tasks'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setExportOnlySubmitted(true)}
                    className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                      exportOnlySubmitted
                        ? 'bg-emerald-500 text-slate-950 font-black shadow-xs'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    {isEl ? 'Μόνο Υποβληθείσες Απαντήσεις' : 'Submitted Only'}
                  </button>
                </div>
              </div>

              {/* Badges of the 5 exact fields */}
              <div className="space-y-1.5">
                <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                  {isEl ? 'Στήλες Εξαγωγής (Export Schema):' : 'Export Columns Schema:'}
                </div>
                <div className="flex flex-wrap gap-2">
                  {[
                    { id: 'team', label: isEl ? '1. Ομάδα' : '1. Team Name', sub: isEl ? 'Όνομα Ομάδας / Υποομάδας' : 'Team / Subgroup Name' },
                    { id: 'question', label: isEl ? '2. Ερώτηση' : '2. Question', sub: isEl ? 'Κείμενο Ερώτησης' : 'Question Prompt Text' },
                    { id: 'options', label: isEl ? '3. Επιλογές' : '3. Options', sub: isEl ? 'Διαθέσιμες Επιλογές (αν υπάρχουν)' : 'Available choices/options' },
                    { id: 'answer', label: isEl ? '4. Απάντηση Μαθητών' : '4. Student Answer', sub: isEl ? 'Υποβληθείσα απάντηση' : 'Submitted student answer' },
                    { id: 'explanation', label: isEl ? '5. Επιστημονική Εξήγηση' : '5. Scientific Explanation', sub: isEl ? 'Ανατροφοδότηση / Fact' : 'Scientific feedback' }
                  ].map((col) => (
                    <div
                      key={col.id}
                      className="px-3 py-1.5 rounded-xl bg-slate-950/80 border border-slate-800 text-xs text-slate-200 flex items-center gap-2"
                    >
                      <span className="font-extrabold text-amber-400">{col.label}</span>
                      <span className="text-[11px] text-slate-500">({col.sub})</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Action Buttons: CSV & JSON */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                <button
                  type="button"
                  onClick={handleExportCsv}
                  className="py-3.5 px-5 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs sm:text-sm flex items-center justify-center gap-2.5 transition-all cursor-pointer shadow-lg shadow-emerald-500/20 active:scale-98"
                >
                  <FileSpreadsheet className="w-5 h-5 stroke-[2.5]" />
                  <span>{isEl ? 'Λήψη Αναφοράς CSV (Excel / Google Sheets)' : 'Download Clean CSV Report (Excel)'}</span>
                </button>

                <button
                  type="button"
                  onClick={handleExportJson}
                  className="py-3.5 px-5 rounded-2xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs sm:text-sm flex items-center justify-center gap-2.5 transition-all cursor-pointer shadow-lg shadow-amber-500/20 active:scale-98"
                >
                  <FileJson className="w-5 h-5 stroke-[2.5]" />
                  <span>{isEl ? 'Λήψη Αναφοράς JSON (5 Πεδία ανά Εγγραφή)' : 'Download Clean JSON Report (5 Fields)'}</span>
                </button>
              </div>
            </div>

            {/* Live Table Preview of the Export Data */}
            <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-4 shadow-xl">
              <div className="flex items-center justify-between gap-4 flex-wrap pb-3 border-b border-slate-800">
                <div className="flex items-center gap-2.5">
                  <h4 className="text-sm font-black text-white">
                    {isEl ? 'Προεπισκόπηση Δεδομένων Εξαγωγής' : 'Export Data Live Preview'}
                  </h4>
                  <span className="px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 text-[11px] font-mono">
                    {exportService.generateCleanReportRecords({
                      tasks: allTasks,
                      teams: activeTeams,
                      submissions,
                      taskOverrides,
                      lang,
                      onlySubmitted: exportOnlySubmitted
                    }).length}{' '}
                    {isEl ? 'γραμμές' : 'rows'}
                  </span>
                </div>
                <div className="text-xs text-slate-400">
                  {isEl ? 'Ακριβώς οι 5 στήλες που θα περιλαμβάνονται στο αρχείο' : 'Exact 5 columns that will be in the file'}
                </div>
              </div>

              {/* Table */}
              <div className="overflow-x-auto rounded-2xl border border-slate-800 max-h-[420px] overflow-y-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead className="bg-slate-950 sticky top-0 z-10 border-b border-slate-800">
                    <tr>
                      <th className="p-3 font-black text-amber-400 whitespace-nowrap">{isEl ? 'Ομάδα' : 'Team Name'}</th>
                      <th className="p-3 font-black text-white min-w-[220px]">{isEl ? 'Ερώτηση' : 'Question'}</th>
                      <th className="p-3 font-black text-slate-300 min-w-[200px]">{isEl ? 'Επιλογές' : 'Options'}</th>
                      <th className="p-3 font-black text-emerald-400 min-w-[180px]">{isEl ? 'Απάντηση Μαθητών' : 'Student Answer'}</th>
                      <th className="p-3 font-black text-sky-400 min-w-[240px]">{isEl ? 'Επιστημονική Εξήγηση' : 'Scientific Explanation'}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60 bg-slate-900/60 font-medium">
                    {exportService.generateCleanReportRecords({
                      tasks: allTasks,
                      teams: activeTeams,
                      submissions,
                      taskOverrides,
                      lang,
                      onlySubmitted: exportOnlySubmitted
                    }).slice(0, 15).map((row, rIdx) => (
                      <tr key={rIdx} className="hover:bg-slate-800/40 transition-colors">
                        <td className="p-3 font-bold text-amber-300 whitespace-nowrap align-top">{row.teamName}</td>
                        <td className="p-3 text-slate-200 leading-relaxed align-top">{row.question}</td>
                        <td className="p-3 text-slate-400 font-mono text-[11px] leading-relaxed align-top">{row.options}</td>
                        <td className="p-3 font-bold text-emerald-300 leading-relaxed align-top">{row.studentAnswer}</td>
                        <td className="p-3 text-slate-300 text-[11px] leading-relaxed align-top italic">{row.explanation}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
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
        {/* TAB 5: TEAMS & SUBMISSIONS + TEAM TITLE EDITING                   */}
        {/* ================================================================= */}
        {activeTab === 'teams' && (
          <div className="space-y-8">
            {/* Section 1: Team Title Editing & Bilingual Renaming */}
            {/* Section 1: Subgroup Architecture & Multilingual Management */}
            <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-6 shadow-xl">
              <div className="flex items-center justify-between gap-4 flex-wrap pb-4 border-b border-slate-800">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-cyan-500/20 text-cyan-400 border border-cyan-500/40 flex items-center justify-center text-2xl font-bold shrink-0">
                    <Users className="w-6 h-6 text-cyan-400" />
                  </div>
                  <div>
                    <h3 className="text-lg font-black text-white flex items-center gap-2">
                      <span>{isEl ? 'Μαθητικές Υποομάδες & Ανάθεση σε Θεματικούς Πυλώνες' : 'Student Subgroups & Track Architecture'}</span>
                      <span className="px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 text-[10px] font-bold">
                        {isEl ? 'Πολλαπλές Ομάδες ανά Πυλώνα' : 'Multiple Groups per Track'}
                      </span>
                    </h3>
                    <p className="text-xs text-slate-400 mt-0.5 leading-relaxed">
                      {isEl
                        ? 'Δυνατότητα ανάθεσης πολλαπλών μαθητικών υποομάδων στον ίδιο θεματικό πυλώνα (π.χ. 2 ομάδες στις «Απειλές» ή «Περιβάλλον»), με ανεξάρτητη επιλογή γλώσσας (Ελληνικά ή English), μοιραζόμενες το ίδιο σώμα ερωτήσεων.'
                        : 'Assign multiple student subgroups to the same core thematic track with independent language preferences (Greek or English), sharing the exact same core curriculum questions.'}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 flex-wrap">
                  <button
                    type="button"
                    onClick={handleResetSubgroupsToDefault}
                    className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <RotateCcw className="w-3.5 h-3.5 text-slate-400" />
                    <span>{isEl ? 'Επαναφορά στις 4 Αρχικές' : 'Reset to 4 Default Groups'}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setShowAddSubgroupModal(true)}
                    className="px-4 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 text-xs font-black flex items-center gap-1.5 shadow-md shadow-cyan-500/20 transition-all cursor-pointer hover:scale-102 active:scale-95"
                  >
                    <Plus className="w-4 h-4 stroke-[3]" />
                    <span>{isEl ? '➕ Προσθήκη Νέας Υποομάδας' : '➕ Add New Subgroup'}</span>
                  </button>
                </div>
              </div>

              {/* Subgroups Grouped by Thematic Track */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {CORE_THEMATIC_TRACKS.map((track) => {
                  const trackId = (track.trackId || track.id) as CoreTrackId;
                  const trackSubs = activeTeams.filter((t) => (t.trackId || t.id) === trackId);
                  return (
                    <div key={trackId} className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800 space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="font-bold text-xs text-white flex items-center gap-2">
                          <span className="w-2 h-2 rounded-full" style={{ backgroundColor: track.color }} />
                          <span>{isEl ? track.title : track.title_en}</span>
                        </div>
                        <span className="text-[11px] text-slate-400 font-mono">
                          {trackSubs.length} {isEl ? 'υποομάδες' : 'groups'}
                        </span>
                      </div>

                      <div className="space-y-2">
                        {trackSubs.map((sub) => {
                          const subLang = sub.language || 'el';
                          const isDefault = ['team-alpha', 'team-beta', 'team-gamma', 'team-delta'].includes(sub.id);
                          const subSubs = Object.values(submissions).filter((s) => s.teamId === sub.id);
                          const correctCount = subSubs.filter((s) => s.status === 'correct').length;
                          const totalScore = subSubs.filter((s) => s.status === 'correct').reduce((a, s) => a + (s.scoreEarned || 0), 0);

                          return (
                            <div
                              key={sub.id}
                              style={{ borderColor: `${sub.color}35` }}
                              className="p-3 rounded-xl bg-slate-900 border flex items-center justify-between gap-3 flex-wrap shadow-xs"
                            >
                              <div className="flex items-center gap-2.5 min-w-0">
                                <span className="text-2xl">{sub.avatar}</span>
                                <div className="min-w-0">
                                  <div className="font-bold text-xs text-white truncate">
                                    {getLocalizedTeamName(sub, lang)}
                                  </div>
                                  <div className="text-[10px] text-slate-400 flex items-center gap-1.5 mt-0.5">
                                    <span style={{ color: sub.color }} className="font-black font-mono">
                                      {totalScore} pts
                                    </span>
                                    <span>•</span>
                                    <span>{correctCount} {isEl ? 'σωστές' : 'solved'}</span>
                                  </div>
                                </div>
                              </div>

                              <div className="flex items-center gap-1.5">
                                {/* 1-Click Language Toggle */}
                                <button
                                  type="button"
                                  onClick={() => handleToggleSubgroupLang(sub.id)}
                                  className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-xs font-bold text-slate-200 flex items-center gap-1 transition-all cursor-pointer shadow-xs"
                                  title={isEl ? 'Εναλλαγή γλώσσας υποομάδας' : 'Toggle subgroup language'}
                                >
                                  <span>{subLang === 'el' ? '🇬🇷 EL' : '🇬🇧 EN'}</span>
                                  <span className="text-[10px] text-amber-400">⇄</span>
                                </button>

                                {/* Delete Subgroup if custom */}
                                {!isDefault && (
                                  <button
                                    type="button"
                                    onClick={() => handleDeleteSubgroup(sub.id, sub.name)}
                                    className="p-1 rounded-lg text-rose-400 hover:text-rose-200 hover:bg-rose-950/50 cursor-pointer transition-colors"
                                    title={isEl ? 'Διαγραφή υποομάδας' : 'Delete subgroup'}
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Section 2: Team Title & Slogan Editing */}
            <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-6 shadow-xl">
              <div className="flex items-center justify-between gap-4 flex-wrap pb-4 border-b border-slate-800">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-amber-500/20 text-amber-400 border border-amber-500/40 flex items-center justify-center text-2xl font-bold shrink-0">
                    <Edit3 className="w-6 h-6 text-amber-400" />
                  </div>
                  <div>
                    <h3 className="text-lg font-black text-white flex items-center gap-2">
                      <span>{isEl ? 'Επεξεργασία & Μετονομασία Τίτλων Ομάδων' : 'Edit & Rename Team Titles'}</span>
                      <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-[10px] font-bold">
                        {isEl ? 'Δίγλωσση Υποστήριξη (EL / EN)' : 'Bilingual Support (EL / EN)'}
                      </span>
                    </h3>
                    <p className="text-xs text-slate-400 mt-0.5 leading-relaxed">
                      {isEl
                        ? 'Επεξεργαστείτε τον τίτλο και το σύνθημα κάθε ομάδας/υποομάδας. Οι αλλαγές εφαρμόζονται αυτόματα σε ολόκληρη την εφαρμογή (καρτέλες πλοήγησης, αποστολές, αρχική οθόνη και ψηφιακά πόστερ/αρένα) σε Ελληνικά και Αγγλικά.'
                        : 'Rename each team title and slogan. Custom names automatically update across navigation tabs, group missions, home screen, and final presentation posters in both Greek and English.'}
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleResetAllTeamTitles}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
                  title={isEl ? 'Επαναφορά όλων των τίτλων ομάδων στις αρχικές τιμές' : 'Reset all team titles and slogans to default'}
                >
                  <RotateCcw className="w-3.5 h-3.5 text-amber-400" />
                  <span>{isEl ? 'Επαναφορά Όλων των Τίτλων' : 'Reset All Team Titles'}</span>
                </button>
              </div>

              {/* Team Title Editor Cards Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {activeTeams.map((team, tIdx) => {
                  const draft = teamTitleDrafts[team.id] || {};
                  const defaultTeam = masterTeamsPool[tIdx] || team;
                  const currentNameEl = draft.name !== undefined ? draft.name : (customTeamTitles?.[team.id]?.name || defaultTeam.name);
                  const currentNameEn = draft.name_en !== undefined ? draft.name_en : (customTeamTitles?.[team.id]?.name_en || defaultTeam.name_en || defaultTeam.name);
                  const currentSloganEl = draft.slogan !== undefined ? draft.slogan : (customTeamTitles?.[team.id]?.slogan || defaultTeam.slogan);
                  const currentSloganEn = draft.slogan_en !== undefined ? draft.slogan_en : (customTeamTitles?.[team.id]?.slogan_en || defaultTeam.slogan_en || defaultTeam.slogan);

                  const isCustomized = Boolean(
                    customTeamTitles?.[team.id]?.name ||
                    customTeamTitles?.[team.id]?.name_en ||
                    customTeamTitles?.[team.id]?.slogan ||
                    customTeamTitles?.[team.id]?.slogan_en
                  );

                  return (
                    <div
                      key={team.id}
                      style={{ borderColor: `${team.color}50` }}
                      className="p-5 rounded-3xl bg-slate-950/80 border-2 space-y-4 shadow-lg flex flex-col justify-between"
                    >
                      <div className="space-y-4">
                        {/* Team Header */}
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <span
                              style={{ backgroundColor: `${team.color}25` }}
                              className="w-11 h-11 rounded-2xl flex items-center justify-center text-2xl border border-current/30 shadow-inner"
                            >
                              {team.avatar}
                            </span>
                            <div>
                              <div className="flex items-center gap-2">
                                <span
                                  style={{ backgroundColor: `${team.color}20`, color: team.color }}
                                  className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider border border-current/30"
                                >
                                  {isEl ? `Ομάδα ${tIdx + 1}` : `Group ${tIdx + 1}`}
                                </span>
                                {isCustomized && (
                                  <span className="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40 text-[10px] font-bold">
                                    {isEl ? 'Προσαρμοσμένο' : 'Customized'}
                                  </span>
                                )}
                              </div>
                              <h4 className="font-black text-white text-sm mt-0.5">
                                {isEl ? team.name : team.name_en || team.name}
                              </h4>
                            </div>
                          </div>

                          <div
                            style={{ backgroundColor: team.color }}
                            className="w-3 h-3 rounded-full ring-2 ring-white/20"
                            title={`Team Color: ${team.color}`}
                          />
                        </div>

                        {/* Live Preview Box */}
                        <div className="p-3 rounded-2xl bg-slate-900 border border-slate-800 space-y-1.5 text-xs">
                          <div className="text-[10px] font-bold uppercase text-slate-500 tracking-wider flex items-center gap-1.5">
                            <Sparkles className="w-3 h-3 text-amber-400" />
                            <span>{isEl ? 'Προεπισκόπηση Εμφάνισης (Live Preview):' : 'Live Preview:'}</span>
                          </div>
                          <div className="text-white font-bold truncate">
                            <span className="text-emerald-400 font-mono text-[11px] mr-1.5">[EL]</span>
                            {currentNameEl || defaultTeam.name}
                          </div>
                          <div className="text-white font-bold truncate">
                            <span className="text-cyan-400 font-mono text-[11px] mr-1.5">[EN]</span>
                            {currentNameEn || defaultTeam.name_en || defaultTeam.name}
                          </div>
                          <div className="text-slate-400 text-[11px] italic truncate pt-0.5 border-t border-slate-800/80">
                            «{lang === 'el' ? (currentSloganEl || defaultTeam.slogan) : (currentSloganEn || defaultTeam.slogan_en || defaultTeam.slogan)}»
                          </div>
                        </div>

                        {/* Form Inputs Grid */}
                        <div className="space-y-3">
                          {/* Greek Title */}
                          <div>
                            <label className="text-xs font-bold text-slate-300 block mb-1">
                              {isEl ? 'Τίτλος Ομάδας (Ελληνικά):' : 'Team Title (Greek):'}
                            </label>
                            <input
                              type="text"
                              value={currentNameEl}
                              onChange={(e) => handleUpdateDraftField(team.id, 'name', e.target.value)}
                              placeholder={defaultTeam.name}
                              className="w-full bg-slate-900 border border-slate-700 focus:border-amber-400 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500"
                            />
                          </div>

                          {/* English Title */}
                          <div>
                            <label className="text-xs font-bold text-slate-300 block mb-1">
                              {isEl ? 'Team Title (English) • Αγγλικός Τίτλος:' : 'Team Title (English):'}
                            </label>
                            <input
                              type="text"
                              value={currentNameEn}
                              onChange={(e) => handleUpdateDraftField(team.id, 'name_en', e.target.value)}
                              placeholder={defaultTeam.name_en || defaultTeam.name}
                              className="w-full bg-slate-900 border border-slate-700 focus:border-amber-400 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500"
                            />
                          </div>

                          {/* Greek Slogan */}
                          <div>
                            <label className="text-xs font-bold text-slate-300 block mb-1">
                              {isEl ? 'Σύνθημα / Περιγραφή (Ελληνικά):' : 'Team Slogan (Greek):'}
                            </label>
                            <input
                              type="text"
                              value={currentSloganEl}
                              onChange={(e) => handleUpdateDraftField(team.id, 'slogan', e.target.value)}
                              placeholder={defaultTeam.slogan}
                              className="w-full bg-slate-900 border border-slate-700 focus:border-amber-400 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500"
                            />
                          </div>

                          {/* English Slogan */}
                          <div>
                            <label className="text-xs font-bold text-slate-300 block mb-1">
                              {isEl ? 'Team Slogan (English) • Αγγλικό Σύνθημα:' : 'Team Slogan (English):'}
                            </label>
                            <input
                              type="text"
                              value={currentSloganEn}
                              onChange={(e) => handleUpdateDraftField(team.id, 'slogan_en', e.target.value)}
                              placeholder={defaultTeam.slogan_en || defaultTeam.slogan}
                              className="w-full bg-slate-900 border border-slate-700 focus:border-amber-400 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500"
                            />
                          </div>
                        </div>
                      </div>

                      {/* Card Action Buttons */}
                      <div className="pt-4 border-t border-slate-800/80 flex items-center justify-between gap-2 flex-wrap">
                        <button
                          type="button"
                          onClick={() => handleResetTeamTitle(team.id)}
                          className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-slate-200 border border-slate-700 text-xs font-semibold flex items-center gap-1 cursor-pointer transition-colors"
                          title={isEl ? 'Επαναφορά στις αρχικές τιμές' : 'Reset to default curriculum title'}
                        >
                          <RotateCcw className="w-3 h-3 text-slate-400" />
                          <span>{isEl ? 'Προεπιλογή' : 'Default'}</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => handleSaveTeamTitle(team.id)}
                          style={{
                            backgroundColor: team.color,
                            color: '#0f172a'
                          }}
                          className="px-4 py-2 rounded-xl font-black text-xs flex items-center gap-1.5 shadow-md transition-all cursor-pointer hover:opacity-90 active:scale-95"
                        >
                          <Check className="w-3.5 h-3.5 stroke-[3]" />
                          <span>{isEl ? 'Αποθήκευση Αλλαγών' : 'Save Changes'}</span>
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Section 2: Submissions, Scores & Resets */}
            <div className="space-y-4">
              <h3 className="text-base font-black text-white flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>{isEl ? 'Υποβολές, Βαθμολογία & Μηδενισμός Ομάδων' : 'Submissions, Scores & Team Resets'}</span>
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {activeTeams.map((team) => {
                  const teamSubs = Object.values(submissions).filter((s) => s.teamId === team.id);
                  const correctSubs = teamSubs.filter((s) => s.status === 'correct');
                  const totalScore = correctSubs.reduce((acc, s) => acc + (s.scoreEarned || 0), 0);
                  const localizedName = getLocalizedTeamName(team, lang);

                  return (
                    <div
                      key={team.id}
                      style={{ borderColor: `${team.color}50` }}
                      className="p-5 rounded-3xl bg-slate-900 border space-y-3 shadow-md"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <span className="text-3xl">{team.avatar}</span>
                          <div>
                            <h4 className="font-bold text-white text-sm">
                              {localizedName}
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
                        {confirmResetTeamId === team.id ? (
                          <div className="flex items-center gap-1.5 animate-in fade-in zoom-in-95 duration-150">
                            <button
                              type="button"
                              onClick={() => handleExecuteResetTeam(team.id, localizedName)}
                              className="px-3 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-black flex items-center gap-1.5 cursor-pointer shadow-md shadow-rose-600/40 active:scale-95 animate-pulse"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                              <span>{isEl ? 'Επιβεβαίωση;' : 'Confirm?'}</span>
                            </button>
                            <button
                              type="button"
                              onClick={() => setConfirmResetTeamId(null)}
                              className="px-2 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold cursor-pointer transition-colors"
                              title={isEl ? 'Ακύρωση' : 'Cancel'}
                            >
                              <X className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        ) : (
                          <button
                            type="button"
                            onClick={() => setConfirmResetTeamId(team.id)}
                            className="px-3 py-1.5 rounded-xl bg-rose-950/40 hover:bg-rose-900/60 border border-rose-500/30 text-xs font-bold text-rose-300 hover:text-rose-100 flex items-center gap-1.5 cursor-pointer transition-colors active:scale-95"
                            title={isEl ? `Μηδενισμός απαντήσεων και σκορ ${localizedName}` : `Reset submissions and scores for ${localizedName}`}
                          >
                            <Trash2 className="w-3.5 h-3.5 text-rose-400" />
                            <span>{isEl ? 'Μηδενισμός Ομάδας' : 'Reset Team'}</span>
                          </button>
                        )}
                        <span className="text-[11px] text-slate-500 font-mono">
                          {teamSubs.length} {isEl ? 'υποβολές' : 'submissions'}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Global Reset Button */}
              <div className="p-5 rounded-3xl bg-rose-950/30 border-2 border-rose-500/40 flex items-center justify-between gap-4 flex-wrap shadow-xl">
                <div>
                  <h4 className="text-sm font-black text-rose-300 flex items-center gap-2">
                    <Trash2 className="w-4 h-4 text-rose-400" />
                    <span>{isEl ? 'Ολική Επαναφορά Όλων των Υποβολών (Global Reset)' : 'Reset All Submissions Globally'}</span>
                  </h4>
                  <p className="text-xs text-slate-300 mt-1 max-w-2xl leading-relaxed">
                    {isEl
                      ? 'Διαγράφει οριστικά όλες τις απαντήσεις, τα σκορ, τα ανεβασμένα τεκμήρια/φωτογραφίες και την πρόοδο όλων των ομάδων, επαναφέροντας την τάξη σε αρχική κατάσταση.'
                      : 'Clears all student answers, total points, uploaded photos/videos, reflections, and progress across all teams.'}
                  </p>
                </div>
                {confirmResetAll ? (
                  <div className="flex items-center gap-2 animate-in fade-in zoom-in-95 duration-150">
                    <button
                      type="button"
                      onClick={handleExecuteResetAll}
                      className="px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs sm:text-sm font-black flex items-center gap-2 cursor-pointer shadow-xl shadow-rose-600/50 transition-all active:scale-95 ring-2 ring-white/40 animate-pulse"
                    >
                      <Trash2 className="w-4 h-4" />
                      <span>{isEl ? 'Οριστικός Μηδενισμός Όλων!' : 'Confirm Full Reset!'}</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setConfirmResetAll(false)}
                      className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs sm:text-sm font-bold cursor-pointer transition-colors"
                    >
                      {isEl ? 'Ακύρωση' : 'Cancel'}
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => setConfirmResetAll(true)}
                    className="px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs sm:text-sm font-black flex items-center gap-2 cursor-pointer shadow-lg shadow-rose-600/30 transition-all hover:scale-102 active:scale-95"
                  >
                    <Trash2 className="w-4 h-4" />
                    <span>{isEl ? 'Ολικός Μηδενισμός' : 'Full Reset'}</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Quick Team Rename Modal (Triggered from Tab 1 Group Banner) */}
      {quickRenameTeam && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-lg w-full p-6 shadow-2xl space-y-5 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-3">
                <span className="text-3xl p-1.5 rounded-xl bg-slate-800 border border-slate-700">
                  {quickRenameTeam.avatar}
                </span>
                <div>
                  <h3 className="text-base font-black text-white flex items-center gap-2">
                    <span>{isEl ? 'Μετονομασία Ομάδας' : 'Rename Team'}</span>
                    <span
                      style={{ backgroundColor: `${quickRenameTeam.color}25`, color: quickRenameTeam.color }}
                      className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase border border-current/30"
                    >
                      {quickRenameTeam.id.replace('team-', 'GROUP ')}
                    </span>
                  </h3>
                  <p className="text-xs text-slate-400">
                    {isEl ? 'Προσαρμόστε τίτλο και σύνθημα σε Ελληνικά & Αγγλικά' : 'Custom title & slogan in Greek and English'}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setQuickRenameTeam(null)}
                className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Form inputs */}
            <div className="space-y-3.5">
              <div>
                <label className="text-xs font-bold text-slate-300 block mb-1">
                  {isEl ? 'Τίτλος Ομάδας (Ελληνικά):' : 'Team Title (Greek):'}
                </label>
                <input
                  type="text"
                  value={teamTitleDrafts[quickRenameTeam.id]?.name ?? quickRenameTeam.name}
                  onChange={(e) => handleUpdateDraftField(quickRenameTeam.id, 'name', e.target.value)}
                  placeholder="π.χ. Ομάδα 1: Ερευνητές Φύσης"
                  className="w-full bg-slate-950 border border-slate-700 focus:border-amber-400 rounded-xl px-3 py-2 text-xs text-white"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-300 block mb-1">
                  {isEl ? 'Team Title (English) • Αγγλικός Τίτλος:' : 'Team Title (English):'}
                </label>
                <input
                  type="text"
                  value={teamTitleDrafts[quickRenameTeam.id]?.name_en ?? quickRenameTeam.name_en ?? quickRenameTeam.name}
                  onChange={(e) => handleUpdateDraftField(quickRenameTeam.id, 'name_en', e.target.value)}
                  placeholder="e.g. Group 1: Nature Explorers"
                  className="w-full bg-slate-950 border border-slate-700 focus:border-amber-400 rounded-xl px-3 py-2 text-xs text-white"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-300 block mb-1">
                  {isEl ? 'Σύνθημα Ομάδας (Ελληνικά):' : 'Team Slogan (Greek):'}
                </label>
                <input
                  type="text"
                  value={teamTitleDrafts[quickRenameTeam.id]?.slogan ?? quickRenameTeam.slogan}
                  onChange={(e) => handleUpdateDraftField(quickRenameTeam.id, 'slogan', e.target.value)}
                  placeholder="π.χ. Ανακαλύπτουμε τα πάντα!"
                  className="w-full bg-slate-950 border border-slate-700 focus:border-amber-400 rounded-xl px-3 py-2 text-xs text-white"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-300 block mb-1">
                  {isEl ? 'Team Slogan (English) • Αγγλικό Σύνθημα:' : 'Team Slogan (English):'}
                </label>
                <input
                  type="text"
                  value={teamTitleDrafts[quickRenameTeam.id]?.slogan_en ?? quickRenameTeam.slogan_en ?? quickRenameTeam.slogan}
                  onChange={(e) => handleUpdateDraftField(quickRenameTeam.id, 'slogan_en', e.target.value)}
                  placeholder="e.g. Discovering everything!"
                  className="w-full bg-slate-950 border border-slate-700 focus:border-amber-400 rounded-xl px-3 py-2 text-xs text-white"
                />
              </div>
            </div>

            {/* Modal actions */}
            <div className="pt-3 border-t border-slate-800 flex items-center justify-between gap-3">
              <button
                type="button"
                onClick={() => handleResetTeamTitle(quickRenameTeam.id)}
                className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-slate-200 border border-slate-700 text-xs font-semibold cursor-pointer transition-colors"
              >
                {isEl ? 'Επαναφορά Προεπιλογής' : 'Reset to Default'}
              </button>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setQuickRenameTeam(null)}
                  className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold cursor-pointer"
                >
                  {isEl ? 'Ακύρωση' : 'Cancel'}
                </button>
                <button
                  type="button"
                  onClick={() => handleSaveTeamTitle(quickRenameTeam.id)}
                  className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs flex items-center gap-1.5 shadow-md shadow-amber-500/20 cursor-pointer"
                >
                  <Check className="w-3.5 h-3.5 stroke-[3]" />
                  <span>{isEl ? 'Αποθήκευση' : 'Save'}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Task QR Code Generator & Placard Print Modal */}
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
          onClose={() => setMediaModalInfo(null)}
        />
      )}

      {/* Modal: Create New Subgroup for Thematic Track */}
      {showAddSubgroupModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-slate-900 border border-emerald-500/30 rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <span className="text-2xl">{newSubAvatar}</span>
                <div>
                  <h3 className="text-base font-black text-white">
                    {isEl ? '➕ Προσθήκη Νέας Υποομάδας' : '➕ Add New Student Subgroup'}
                  </h3>
                  <p className="text-xs text-slate-400">
                    {isEl
                      ? 'Ανάθεση σε θεματικό πυλώνα με κοινές ερωτήσεις & ανεξάρτητη γλώσσα'
                      : 'Assign to a thematic track with shared curriculum & independent language'}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowAddSubgroupModal(false)}
                className="p-1 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateSubgroup} className="space-y-4 text-xs">
              {/* Select Thematic Track */}
              <div>
                <label className="font-bold text-slate-200 block mb-1.5">
                  {isEl ? '1. Επιλογή Θεματικού Πυλώνα (Κοινό Πρόγραμμα):' : '1. Select Thematic Track (Shared Pool):'}
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {CORE_THEMATIC_TRACKS.map((track) => {
                    const isSelected = newSubTrackId === track.id;
                    return (
                      <button
                        key={track.id}
                        type="button"
                        onClick={() => setNewSubTrackId(track.id)}
                        className={`text-left p-2.5 rounded-xl border transition-all cursor-pointer flex items-center gap-2 ${
                          isSelected
                            ? 'bg-emerald-500/10 border-emerald-500 text-white shadow-sm shadow-emerald-500/20'
                            : 'bg-slate-950 border-slate-800 text-slate-300 hover:border-slate-700'
                        }`}
                      >
                        <span className="text-xl">{track.avatar}</span>
                        <div className="truncate">
                          <p className="font-bold truncate text-[11px]">
                            {isEl ? track.title_el : track.title_en}
                          </p>
                          <p className="text-[10px] text-slate-400 truncate">
                            {track.tasksCount} {isEl ? 'κοινές ερωτήσεις' : 'shared tasks'}
                          </p>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Select Language Mode */}
              <div>
                <label className="font-bold text-slate-200 block mb-1.5">
                  {isEl ? '2. Γλώσσα Εργασίας Υποομάδας:' : '2. Subgroup Working Language:'}
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setNewSubLang('el')}
                    className={`py-2 px-3 rounded-xl border text-center font-bold text-xs transition-all cursor-pointer flex items-center justify-center gap-2 ${
                      newSubLang === 'el'
                        ? 'bg-blue-500/20 border-blue-400 text-blue-300'
                        : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                    }`}
                  >
                    <span>🇬🇷</span>
                    <span>Ελληνικά (Greek)</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setNewSubLang('en')}
                    className={`py-2 px-3 rounded-xl border text-center font-bold text-xs transition-all cursor-pointer flex items-center justify-center gap-2 ${
                      newSubLang === 'en'
                        ? 'bg-amber-500/20 border-amber-400 text-amber-300'
                        : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                    }`}
                  >
                    <span>🇬🇧</span>
                    <span>English (International)</span>
                  </button>
                </div>
              </div>

              {/* Subgroup Names */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-300 block mb-1">
                    {isEl ? 'Όνομα Υποομάδας (Ελληνικά):' : 'Subgroup Name (Greek):'}
                  </label>
                  <input
                    type="text"
                    required={!newSubNameEn}
                    value={newSubNameEl}
                    onChange={(e) => setNewSubNameEl(e.target.value)}
                    placeholder="π.χ. Ομάδα 4Β - Φύλακες"
                    className="w-full bg-slate-950 border border-slate-700 focus:border-emerald-400 rounded-xl px-3 py-2 text-white placeholder-slate-500"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-300 block mb-1">
                    {isEl ? 'Όνομα Υποομάδας (English):' : 'Subgroup Name (English):'}
                  </label>
                  <input
                    type="text"
                    required={!newSubNameEl}
                    value={newSubNameEn}
                    onChange={(e) => setNewSubNameEn(e.target.value)}
                    placeholder="e.g. Team 4B - Guardians"
                    className="w-full bg-slate-950 border border-slate-700 focus:border-emerald-400 rounded-xl px-3 py-2 text-white placeholder-slate-500"
                  />
                </div>
              </div>

              {/* Slogans */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-300 block mb-1">
                    {isEl ? 'Σύνθημα (Ελληνικά - προαιρετικό):' : 'Slogan (Greek - optional):'}
                  </label>
                  <input
                    type="text"
                    value={newSubSloganEl}
                    onChange={(e) => setNewSubSloganEl(e.target.value)}
                    placeholder="π.χ. Δράση για το περιβάλλον!"
                    className="w-full bg-slate-950 border border-slate-700 focus:border-emerald-400 rounded-xl px-3 py-2 text-white placeholder-slate-500"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-300 block mb-1">
                    {isEl ? 'Slogan (English - optional):' : 'Slogan (English - optional):'}
                  </label>
                  <input
                    type="text"
                    value={newSubSloganEn}
                    onChange={(e) => setNewSubSloganEn(e.target.value)}
                    placeholder="e.g. Taking action for wildlife!"
                    className="w-full bg-slate-950 border border-slate-700 focus:border-emerald-400 rounded-xl px-3 py-2 text-white placeholder-slate-500"
                  />
                </div>
              </div>

              {/* Avatar Selector */}
              <div>
                <label className="font-bold text-slate-300 block mb-1.5">
                  {isEl ? 'Εικονίδιο / Avatar:' : 'Avatar Symbol:'}
                </label>
                <div className="flex flex-wrap gap-2">
                  {['🦅', '🦉', '🧭', '🔬', '🌿', '⛰️', '🛡️', '⭐', '🐾', '🌊', '🎯', '✨'].map((emoji) => (
                    <button
                      key={emoji}
                      type="button"
                      onClick={() => setNewSubAvatar(emoji)}
                      className={`w-9 h-9 rounded-xl text-lg flex items-center justify-center border transition-all cursor-pointer ${
                        newSubAvatar === emoji
                          ? 'bg-emerald-500/20 border-emerald-400 scale-110 shadow-sm'
                          : 'bg-slate-950 border-slate-800 hover:border-slate-700'
                      }`}
                    >
                      {emoji}
                    </button>
                  ))}
                </div>
              </div>

              {/* Form Buttons */}
              <div className="pt-3 border-t border-slate-800 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddSubgroupModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold cursor-pointer"
                >
                  {isEl ? 'Ακύρωση' : 'Cancel'}
                </button>
                <button
                  type="submit"
                  disabled={!newSubNameEl.trim() && !newSubNameEn.trim()}
                  className="px-5 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black cursor-pointer shadow-lg shadow-emerald-500/20 flex items-center gap-1.5 disabled:opacity-50"
                >
                  <Check className="w-4 h-4 stroke-[3]" />
                  <span>{isEl ? 'Δημιουργία Υποομάδας' : 'Create Subgroup'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Platform Join QR Code Modal */}
      {showJoinQrModal && (
        <AppJoinQrModal
          isOpen={showJoinQrModal}
          onClose={() => setShowJoinQrModal(false)}
          lang={lang}
        />
      )}
    </div>
  );
};
