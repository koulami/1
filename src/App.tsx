import React, { useState, useMemo, useEffect } from 'react';
import {
  Award,
  CheckCircle2,
  Clock,
  Sparkles,
  BookOpen,
  RotateCcw,
  Languages,
  LayoutGrid,
  Home as HomeIcon,
  Compass,
  Zap,
  Rocket,
  Microscope,
  Check,
  ChevronRight,
  ChevronLeft,
  MessageSquare,
  Plus,
  Trash2,
  ThumbsUp,
  Info,
  List,
  Target,
  Flag,
  ArrowLeft,
  Camera,
  QrCode,
  ShieldCheck,
  Trophy,
  Play,
  Pause,
  Lock,
  Hourglass,
  AlertTriangle,
  Users
} from 'lucide-react';
import {
  masterTeamsPool,
  getActiveTasksForTeam,
  computeTeamTaskStats,
  TeamTaskStats,
  getCheckpointsForTeam,
  isCheckpointTask,
  getCheckpointMetadata,
  TEAM_GROUP_MAP,
  getAllTasks,
  getTeamsWithCustomTitles,
  getLocalizedTeamName,
  getLocalizedTeamSlogan,
  getTeamEffectiveLanguage,
  resolveTeamTrackId,
  CORE_THEMATIC_TRACKS
} from './data/masterTaskPool';
import { storageService } from './services/storageService';
import { Question, Team, Submission, FieldSpotInfo, CoreTrackId } from './types/game';
import { extractScientificFact } from './utils/scientificFactHelper';
import { SectionErrorBoundary } from './components/SectionErrorBoundary';
import { MultipleChoiceQuest } from './components/quests/MultipleChoiceQuest';
import { TrueFalseQuest } from './components/quests/TrueFalseQuest';
import { TextMatchQuest } from './components/quests/TextMatchQuest';
import { ImageMatchQuest } from './components/quests/ImageMatchQuest';
import { PuzzleQuest } from './components/quests/PuzzleQuest';
import { QrScanQuest } from './components/quests/QrScanQuest';
import { PhotoUploadQuest } from './components/quests/PhotoUploadQuest';
import { TaskQuest } from './components/quests/TaskQuest';
import { ResearchQuest } from './components/quests/ResearchQuest';
import { SurveyQuest } from './components/quests/SurveyQuest';
import { AdminConsole } from './components/AdminConsole';
import { TeamPresentationArena } from './components/TeamPresentationArena';
import { FieldQrScannerModal } from './components/FieldQrScannerModal';
import { FieldMediaPlaybackModal } from './components/FieldMediaPlaybackModal';

const VALID_TABS = ['home', 'group-1', 'group-2', 'group-3', 'group-4', 'arena'] as const;
type ValidTab = typeof VALID_TABS[number];

interface SynthesisNote {
  id: string;
  teamId: string;
  author: string;
  title: string;
  content: string;
  likes: number;
  createdAt: number;
}

const DEFAULT_SYNTHESIS_NOTES: SynthesisNote[] = [
  {
    id: 'note-1',
    teamId: 'team-alpha',
    author: 'Ομάδα 1 (Ταυτότητα & Βασικά)',
    title: 'Το Μοναδικό Όρνιο της Κύπρου (Gyps fulvus)',
    content: 'Το Gyps fulvus είναι το μοναδικό είδος γύπα στην Κύπρο. Με άνοιγμα πτερύγων 2.5m και βάρος 7-10kg, γεννά μόνο 1 αυγό το χρόνο και είναι κρίσιμα απειλούμενο.',
    likes: 6,
    createdAt: Date.now() - 3600000
  },
  {
    id: 'note-2',
    teamId: 'team-beta',
    author: 'Ομάδα 2 (Περιβάλλον & Πτήση)',
    title: 'Γκρεμοί Επισκοπής & Θερμικά Ρεύματα',
    content: 'Η ιστορική αποικία φωλεοποίησης βρίσκεται στους απόκρημνους παράκτιους γκρεμούς της Επισκοπής. Εκμεταλλεύονται τα θερμικά ανοδικά ρεύματα και καλύπτουν αποστάσεις άνω των 100km.',
    likes: 8,
    createdAt: Date.now() - 2400000
  },
  {
    id: 'note-3',
    teamId: 'team-gamma',
    author: 'Ομάδα 3 (Διατροφή & Βιολογία)',
    title: 'Αποκλειστικοί Πτωματοφάγοι & pH 1-2',
    content: 'Δεν κυνηγούν ζωντανά ζώα. Τα πανίσχυρα γαστρικά οξέα τους (pH 1-2) εξουδετερώνουν ακόμη και άνθρακα ή αλλαντίαση, καθαρίζοντας αποτελεσματικά την κυπριακή ύπαιθρο.',
    likes: 11,
    createdAt: Date.now() - 1200000
  },
  {
    id: 'note-4',
    teamId: 'team-delta',
    author: 'Ομάδα 4 (Απειλές & Προστασία)',
    title: 'LIFE with Vultures: Σκύλοι K9 & 4 Ταΐστρες',
    content: 'Κύρια απειλή οι παράνομες φόλες. Με το πρόγραμμα LIFE, οι ομάδες σκύλων K9 και οι 4 περιφραγμένες ταΐστρες («εστιατόρια γυπών») διασφαλίζουν την επιβίωση του είδους.',
    likes: 10,
    createdAt: Date.now() - 600000
  }
];

/**
 * Crash-proof image component with fallback icon
 */
function SafeImage({ src, alt, className = '' }: { src?: string; alt: string; className?: string }) {
  const [hasError, setHasError] = useState(false);

  if (!src || hasError) {
    return (
      <div className={`flex items-center justify-center bg-slate-800/80 text-3xl text-amber-400 select-none ${className}`}>
        🦅
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      loading="lazy"
      decoding="async"
      onError={() => setHasError(true)}
      className={`object-contain ${className}`}
    />
  );
}

export default function App() {
  // Safe Tab State with bulletproof persistence
  const [activeTab, setActiveTabRaw] = useState<string>(() => storageService.getActiveTab('home'));
  const [lang, setLangState] = useState<'el' | 'en'>(() => storageService.getLanguage('el'));

  const setLang = (newLang: 'el' | 'en') => {
    setLangState(newLang);
    storageService.saveLanguage(newLang);
  };

  // Robust tab setter that validates and persists
  const safeSetActiveTab = (tabName: string) => {
    try {
      if (VALID_TABS.includes(tabName as ValidTab)) {
        setActiveTabRaw(tabName);
        storageService.saveActiveTab(tabName);
      } else {
        setActiveTabRaw('home');
        storageService.saveActiveTab('home');
      }
    } catch {
      setActiveTabRaw('home');
    }
  };

  const currentTab: ValidTab = VALID_TABS.includes(activeTab as ValidTab)
    ? (activeTab as ValidTab)
    : 'home';

  // Submissions State with clean bulletproof persistence
  const [submissions, setSubmissions] = useState<Record<string, Submission>>(() => {
    return storageService.getSubmissions();
  });

  // Admin Console Open State, Task Active Overrides & Custom Question Edits
  const [isAdminOpen, setIsAdminOpen] = useState<boolean>(false);
  const [gameStarted, setGameStarted] = useState<boolean>(() => {
    return storageService.getGameStarted();
  });

  useEffect(() => {
    const syncGame = () => {
      setGameStarted(storageService.getGameStarted());
    };
    window.addEventListener('storage', syncGame);
    window.addEventListener('boundpad:gameStarted', syncGame);
    return () => {
      window.removeEventListener('storage', syncGame);
      window.removeEventListener('boundpad:gameStarted', syncGame);
    };
  }, []);

  const toggleGameStarted = () => {
    const next = !gameStarted;
    setGameStarted(next);
    storageService.setGameStarted(next);
  };

  const [taskOverrides, setTaskOverrides] = useState<Record<string, boolean>>(() => {
    return storageService.getTaskActiveOverrides();
  });
  const [customQuestions, setCustomQuestions] = useState<Record<string, Question>>(() => {
    return storageService.getCustomQuestions();
  });
  const [taskOrder, setTaskOrder] = useState<string[]>(() => {
    return storageService.getTaskOrder();
  });

  // Field Station QR Scanner & Media Playback Modal states
  const [isFieldScannerOpen, setIsFieldScannerOpen] = useState<boolean>(false);
  const [fieldPlaybackModal, setFieldPlaybackModal] = useState<{ question: Question; fieldSpot: FieldSpotInfo } | null>(null);

  useEffect(() => {
    const handleTaskOrderChange = () => {
      setTaskOrder(storageService.getTaskOrder());
    };
    window.addEventListener('boundpad:taskOrder', handleTaskOrderChange);
    window.addEventListener('storage', handleTaskOrderChange);
    return () => {
      window.removeEventListener('boundpad:taskOrder', handleTaskOrderChange);
      window.removeEventListener('storage', handleTaskOrderChange);
    };
  }, []);

  const handleUpdateTaskOrder = (newOrder: string[]) => {
    setTaskOrder(newOrder);
    storageService.saveTaskOrder(newOrder);
  };

  // Custom Team Titles state (Greek and English overrides)
  const [customTeamTitles, setCustomTeamTitles] = useState<Record<string, { name?: string; name_en?: string; slogan?: string; slogan_en?: string }>>(() => {
    return storageService.getCustomTeamTitles();
  });

  useEffect(() => {
    const syncTeamTitles = () => {
      setCustomTeamTitles(storageService.getCustomTeamTitles());
    };
    window.addEventListener('boundpad:teamTitles', syncTeamTitles);
    window.addEventListener('storage', syncTeamTitles);
    return () => {
      window.removeEventListener('boundpad:teamTitles', syncTeamTitles);
      window.removeEventListener('storage', syncTeamTitles);
    };
  }, []);

  const handleUpdateCustomTeamTitles = (
    newTitles: Record<string, { name?: string; name_en?: string; slogan?: string; slogan_en?: string }>
  ) => {
    setCustomTeamTitles(newTitles);
    storageService.saveCustomTeamTitles(newTitles);
  };

  // Subgroups state (allows multiple student groups per core thematic track with independent language)
  const [subgroups, setSubgroups] = useState<Team[]>(() => {
    return storageService.getSubgroups();
  });

  useEffect(() => {
    const syncSubgroups = () => {
      setSubgroups(storageService.getSubgroups());
    };
    window.addEventListener('boundpad:subgroups', syncSubgroups);
    window.addEventListener('storage', syncSubgroups);
    return () => {
      window.removeEventListener('boundpad:subgroups', syncSubgroups);
      window.removeEventListener('storage', syncSubgroups);
    };
  }, []);

  // Track the active subgroup for each of the 4 core thematic tracks
  const [selectedSubgroupIds, setSelectedSubgroupIds] = useState<Record<string, string>>({
    'team-alpha': 'team-alpha',
    'team-beta': 'team-beta',
    'team-gamma': 'team-gamma',
    'team-delta': 'team-delta'
  });

  const handleSelectSubgroupForTrack = (trackId: string, subgroupId: string) => {
    setSelectedSubgroupIds((prev) => ({
      ...prev,
      [trackId]: subgroupId
    }));
  };

  // Active teams / subgroups with custom Greek/English titles and slogans merged
  const activeTeams: Team[] = useMemo(() => {
    return getTeamsWithCustomTitles(customTeamTitles, subgroups);
  }, [customTeamTitles, subgroups]);

  // Map from track id to all subgroups assigned to that track
  const subgroupsByTrack = useMemo(() => {
    const map: Record<CoreTrackId, Team[]> = {
      'team-alpha': [],
      'team-beta': [],
      'team-gamma': [],
      'team-delta': []
    };
    activeTeams.forEach((t) => {
      const trackId = resolveTeamTrackId(t.id, activeTeams);
      if (map[trackId]) {
        map[trackId].push(t);
      }
    });
    return map;
  }, [activeTeams]);

  // Resolve current active team for each track
  const getActiveSubgroupForTrack = (trackId: CoreTrackId): Team => {
    const trackSubgroups = subgroupsByTrack[trackId] || [];
    const selectedId = selectedSubgroupIds[trackId];
    const found = trackSubgroups.find((t) => t.id === selectedId);
    return found || trackSubgroups[0] || masterTeamsPool.find((t) => t.id === trackId) || masterTeamsPool[0];
  };

  const handleToggleSubgroupLanguage = (subgroupId: string) => {
    const target = activeTeams.find((t) => t.id === subgroupId);
    const newLang = (target?.language === 'en') ? 'el' : 'en';
    const updated = storageService.updateSubgroup(subgroupId, { language: newLang });
    setSubgroups(updated);
  };

  const handleUpdateTaskOverrides = (newOverrides: Record<string, boolean>) => {
    setTaskOverrides(newOverrides);
  };

  const handleSaveCustomQuestion = (updated: Question) => {
    try {
      storageService.saveCustomQuestion(updated);
      setCustomQuestions((prev) => ({
        ...prev,
        [updated.id]: updated
      }));
    } catch (err) {
      console.error('Error saving custom question', err);
    }
  };

  const handleResetCustomQuestion = (questionId: string) => {
    try {
      storageService.resetCustomQuestion(questionId);
      setCustomQuestions((prev) => {
        const next = { ...prev };
        delete next[questionId];
        return next;
      });
    } catch (err) {
      console.error('Error resetting custom question', err);
    }
  };

  // Real-time synchronization of submissions across tabs/components
  useEffect(() => {
    const handleSubmissionsSync = () => {
      setSubmissions(storageService.getSubmissions());
    };
    window.addEventListener('boundpad:submissions', handleSubmissionsSync);
    window.addEventListener('storage', handleSubmissionsSync);
    return () => {
      window.removeEventListener('boundpad:submissions', handleSubmissionsSync);
      window.removeEventListener('storage', handleSubmissionsSync);
    };
  }, []);

  const handleResetTeamSubmissions = (teamId: string) => {
    try {
      const updated = storageService.clearTeamData(teamId);
      setSubmissions(updated);
    } catch (err) {
      console.error('Error resetting team submissions', err);
    }
  };

  const handleRestoreStateFromJson = (jsonString: string): boolean => {
    try {
      const success = storageService.importData(jsonString);
      if (success) {
        setSubmissions(storageService.getSubmissions());
        setSynthesisNotes(storageService.getSynthesisNotes(DEFAULT_SYNTHESIS_NOTES));
        setTaskOverrides(storageService.getTaskActiveOverrides());
        setCustomQuestions(storageService.getCustomQuestions());
        setTaskOrder(storageService.getTaskOrder());
        return true;
      }
    } catch (err) {
      console.error('Restore error', err);
    }
    return false;
  };

  // Collaborative Synthesis Notes
  const [synthesisNotes, setSynthesisNotes] = useState<SynthesisNote[]>(() => {
    return storageService.getSynthesisNotes<SynthesisNote>(DEFAULT_SYNTHESIS_NOTES);
  });

  // Save submission directly to bulletproof storage
  const saveSubmission = (sub: Submission) => {
    try {
      storageService.saveSubmission(sub);
      const key = `${sub.teamId}_${sub.questionId}`;
      setSubmissions((prev) => {
        const next = { ...prev, [key]: sub };
        if (typeof window !== 'undefined') {
          window.dispatchEvent(new CustomEvent('boundpad:submissions', { detail: { submission: sub, submissions: next } }));
        }
        return next;
      });

      // If this submission contains reflection text or is for a reflection task, save to team reflections
      const reflectionText = (sub.reflectionText || sub.answerData?.reportText || sub.answerData?.reflectionText || '').trim();
      if (reflectionText && (sub.questionId.includes('reflection') || sub.answerData?.reportText)) {
        storageService.saveTeamReflection(sub.teamId, reflectionText);
      }
    } catch (err) {
      console.error('saveSubmission error', err);
    }
  };

  // Global reset for all submissions, scores, photos and team reflections
  const resetAllSubmissions = (skipConfirm = true) => {
    if (!skipConfirm) {
      const msg = lang === 'el'
        ? 'Είστε βέβαιοι ότι θέλετε να μηδενίσετε όλες τις απαντήσεις και την πρόοδο;'
        : 'Are you sure you want to reset all submissions and progress?';
      if (!window.confirm(msg)) return;
    }
    try {
      storageService.clearAllSubmissionsAndProgress();
      setSubmissions({});
    } catch (err) {
      console.error('Error resetting all submissions', err);
    }
  };

  // Synthesis Note Form Modal
  const [showAddNote, setShowAddNote] = useState<boolean>(false);
  const [newNoteAuthor, setNewNoteAuthor] = useState('');
  const [newNoteTitle, setNewNoteTitle] = useState('');
  const [newNoteContent, setNewNoteContent] = useState('');
  const [newNoteTeam, setNewNoteTeam] = useState<string>('team-alpha');

  // Compute live team stats dynamically from master pool with task overrides, custom edits & task order
  const allTeamStats: TeamTaskStats[] = useMemo(() => {
    try {
      return activeTeams.map((team) =>
        computeTeamTaskStats(team, submissions, taskOverrides, customQuestions, taskOrder)
      );
    } catch {
      return [];
    }
  }, [activeTeams, submissions, taskOverrides, customQuestions, taskOrder]);

  // Tab mapping for the 4 groups
  const teamTabs: { tab: ValidTab; teamIndex: number; icon: any }[] = [
    { tab: 'group-1', teamIndex: 0, icon: Compass },
    { tab: 'group-2', teamIndex: 1, icon: Zap },
    { tab: 'group-3', teamIndex: 2, icon: Rocket },
    { tab: 'group-4', teamIndex: 3, icon: Microscope }
  ];

  // Synthesis note handlers
  const handleAddNote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNoteTitle.trim() || !newNoteContent.trim()) return;

    const note: SynthesisNote = {
      id: `note-${Date.now()}`,
      teamId: newNoteTeam,
      author: newNoteAuthor.trim() || (lang === 'el' ? 'Μαθητής / Ομάδα' : 'Student / Team'),
      title: newNoteTitle.trim(),
      content: newNoteContent.trim(),
      likes: 0,
      createdAt: Date.now()
    };

    const updated = [note, ...synthesisNotes];
    setSynthesisNotes(updated);
    storageService.saveSynthesisNotes(updated as any);

    setNewNoteTitle('');
    setNewNoteContent('');
    setShowAddNote(false);
  };

  const handleLikeNote = (noteId: string) => {
    const updated = synthesisNotes.map((n) =>
      n.id === noteId ? { ...n, likes: n.likes + 1 } : n
    );
    setSynthesisNotes(updated);
    storageService.saveSynthesisNotes(updated as any);
  };

  const handleDeleteNote = (noteId: string) => {
    const updated = synthesisNotes.filter((n) => n.id !== noteId);
    setSynthesisNotes(updated);
    storageService.saveSynthesisNotes(updated as any);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      {/* ===================== TOP HEADER ===================== */}
      <header className="sticky top-0 z-40 bg-slate-900/95 backdrop-blur-md border-b border-slate-800 shadow-lg px-4 py-3">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3">
          {/* Logo */}
          <div
            className="flex items-center gap-3 cursor-pointer select-none"
            onClick={(e) => {
              e.preventDefault();
              safeSetActiveTab('home');
            }}
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-emerald-600 flex items-center justify-center shadow-md text-2xl">
              🦅
            </div>
            <div>
              <h1 className="font-extrabold text-lg sm:text-xl tracking-tight text-white flex items-center gap-2">
                BoundPad <span className="text-amber-400 font-semibold text-sm sm:text-base">• {lang === 'el' ? 'Αρένα Γυπών' : 'Vulture Arena'}</span>
              </h1>
              <p className="text-xs text-slate-400">
                {lang === 'el'
                  ? 'Master Task Pool • 100% Σταθερότητα & Απομονωμένα Τμήματα'
                  : 'Master Task Pool • 100% Stability & Isolated Boundaries'}
              </p>
            </div>
          </div>

          {/* Controls */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setLang(lang === 'el' ? 'en' : 'el')}
              className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
              title="Εναλλαγή Γλώσσας / Switch Language"
            >
              <Languages className="w-4 h-4 text-emerald-400" />
              <span>{lang === 'el' ? 'English' : 'Ελληνικά'}</span>
            </button>

            {/* Master Start / Lobby Button for Teachers */}
            <button
              type="button"
              onClick={toggleGameStarted}
              className={`px-3 py-1.5 rounded-lg text-xs font-black flex items-center gap-1.5 transition-all cursor-pointer shadow-sm ${
                gameStarted
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 hover:bg-emerald-500/30'
                  : 'bg-amber-500 hover:bg-amber-400 text-slate-950 font-black shadow-md ring-2 ring-amber-400/40'
              }`}
              title={
                gameStarted
                  ? (lang === 'el' ? 'Η δράση είναι ενεργή για όλες τις ομάδες. Κάντε κλικ για επαναφορά σε Lobby.' : 'Session is active. Click to reset to Lobby.')
                  : (lang === 'el' ? 'Κάντε κλικ για ταυτόχρονη έναρξη της δράσης για όλες τις ομάδες.' : 'Click to start session for all teams simultaneously.')
              }
            >
              {gameStarted ? (
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              ) : (
                <Play className="w-3.5 h-3.5 fill-slate-950" />
              )}
              <span>
                {gameStarted
                  ? (lang === 'el' ? 'Ενεργή' : 'Active')
                  : (lang === 'el' ? 'Έναρξη Δράσης' : 'Start Session')}
              </span>
            </button>

            {/* Field Station QR Scanner Trigger */}
            <button
              type="button"
              onClick={() => setIsFieldScannerOpen(true)}
              className="px-3 py-1.5 rounded-lg bg-purple-950/70 hover:bg-purple-900 text-purple-300 hover:text-purple-200 border border-purple-500/40 text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer active:scale-95"
              title={lang === 'el' ? 'Σάρωση QR Code Σταθμού Πεδίου & Αναπαραγωγή' : 'Scan Field Station QR Code & Play Media'}
            >
              <Camera className="w-3.5 h-3.5 text-purple-400" />
              <span>{lang === 'el' ? 'QR Πεδίου' : 'Field QR'}</span>
            </button>

            <button
              type="button"
              onClick={() => setIsAdminOpen(true)}
              className="px-3 py-1.5 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/30 text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
              title={lang === 'el' ? 'Κονσόλα Διαχείρισης Εκπαιδευτικού & Εξαγωγές' : 'Admin Console & Exports'}
            >
              <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
              <span>{lang === 'el' ? 'Διαχείριση' : 'Admin'}</span>
            </button>

            <button
              type="button"
              onClick={() => resetAllSubmissions(false)}
              className="px-3 py-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 border border-rose-500/30 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
              title={lang === 'el' ? 'Επαναφορά Απαντήσεων Όλων των Ομάδων' : 'Reset All Teams Submissions'}
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">{lang === 'el' ? 'Επαναφορά' : 'Reset'}</span>
            </button>
          </div>
        </div>

        {/* ===================== TAB NAVIGATION BAR ===================== */}
        <div className="max-w-7xl mx-auto mt-3 pt-2 border-t border-slate-800/80 flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
          {/* Home Tab */}
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              safeSetActiveTab('home');
            }}
            className={`px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold flex items-center gap-2 shrink-0 transition-all cursor-pointer ${
              currentTab === 'home'
                ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20 font-bold'
                : 'bg-slate-800/60 hover:bg-slate-800 text-slate-300 hover:text-white'
            }`}
          >
            <HomeIcon className="w-4 h-4" />
            <span>{lang === 'el' ? 'Αρχική' : 'Home'}</span>
          </button>

          {/* 4 Group Tabs */}
          {teamTabs.map(({ tab, teamIndex }) => {
            const trackInfo = CORE_THEMATIC_TRACKS[teamIndex];
            const trackId = ((trackInfo && (trackInfo.trackId || trackInfo.id)) || masterTeamsPool[teamIndex]?.id || 'team-alpha') as CoreTrackId;
            const currentSubgroup = getActiveSubgroupForTrack(trackId);
            const trackSubgroups = subgroupsByTrack[trackId] || [];
            const stat = allTeamStats.find((s) => s.team.id === currentSubgroup.id || s.teamId === currentSubgroup.id);
            const isActive = currentTab === tab;
            const teamDisplayName = getLocalizedTeamName(currentSubgroup, lang);
            const effectiveSubLang = currentSubgroup.language || 'el';

            return (
              <button
                key={tab}
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  safeSetActiveTab(tab);
                }}
                style={{
                  borderColor: isActive ? currentSubgroup.color : 'transparent'
                }}
                className={`px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold flex items-center gap-2 shrink-0 border transition-all cursor-pointer ${
                  isActive
                    ? 'bg-slate-800 text-white shadow-md ring-1 ring-white/10'
                    : 'bg-slate-800/50 hover:bg-slate-800 text-slate-300 hover:text-white'
                }`}
                title={`${teamDisplayName} (${effectiveSubLang === 'el' ? 'Ελληνικά' : 'English'})`}
              >
                <span className="text-base">{currentSubgroup.avatar}</span>
                <span className="truncate max-w-[130px] sm:max-w-none">
                  {teamDisplayName}
                </span>
                <span className="px-1.5 py-0.5 rounded text-[10px] font-black bg-slate-900 border border-slate-700 text-slate-300">
                  {effectiveSubLang === 'el' ? '🇬🇷' : '🇬🇧'}
                </span>
                {trackSubgroups.length > 1 && (
                  <span className="px-1.5 py-0.5 rounded-full text-[10px] font-extrabold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                    {trackSubgroups.length}
                  </span>
                )}
                {stat && (
                  <span
                    style={{ backgroundColor: `${currentSubgroup.color}25`, color: currentSubgroup.color }}
                    className="px-1.5 py-0.5 rounded-md text-[10px] font-bold ml-0.5"
                  >
                    {stat.totalScore}p
                  </span>
                )}
              </button>
            );
          })}

          {/* Team Arena / Digital Posters Tab */}
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              safeSetActiveTab('arena');
            }}
            className={`px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold flex items-center gap-2 shrink-0 transition-all cursor-pointer ${
              currentTab === 'arena'
                ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20 font-black'
                : 'bg-slate-800/60 hover:bg-slate-800 text-amber-300 hover:text-white'
            }`}
          >
            <Trophy className="w-4 h-4 text-amber-400" />
            <span>{lang === 'el' ? 'Αρένα Παρουσίασης & Posters' : 'Team Arena & Posters'}</span>
          </button>

          {/* Admin Console Shortcut in Navbar */}
          <button
            type="button"
            onClick={() => setIsAdminOpen(true)}
            className="ml-auto px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2 shrink-0 bg-slate-800/80 hover:bg-slate-800 text-amber-300 border border-amber-500/40 hover:border-amber-400 shadow-sm transition-all cursor-pointer"
          >
            <ShieldCheck className="w-4 h-4 text-amber-400" />
            <span>{lang === 'el' ? 'Κονσόλα Admin & Εξαγωγές' : 'Admin & Exports'}</span>
          </button>
        </div>
      </header>

      {/* ===================== MAIN CONTENT WRAPPED IN GLOBAL SECTION ERROR BOUNDARY ===================== */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6">
        <SectionErrorBoundary sectionName="Main View" onReset={() => safeSetActiveTab('home')}>
          {currentTab === 'home' && (
            <SectionErrorBoundary sectionName="Home Screen" onReset={() => safeSetActiveTab('home')}>
              <HomeScreen
                lang={lang}
                teamStats={allTeamStats}
                onSelectTab={safeSetActiveTab}
                teams={activeTeams}
                subgroupsByTrack={subgroupsByTrack}
                onSelectSubgroupForTrack={(trackId, subgroupId) => {
                  handleSelectSubgroupForTrack(trackId, subgroupId);
                  const idx = CORE_THEMATIC_TRACKS.findIndex((t) => t.id === trackId || t.trackId === trackId);
                  safeSetActiveTab(`group-${idx + 1}` as ValidTab);
                }}
                onOpenAdmin={() => setIsAdminOpen(true)}
              />
            </SectionErrorBoundary>
          )}

          {currentTab === 'group-1' && (
            <SectionErrorBoundary sectionName="Group 1 (Ομάδα 1)" onReset={() => safeSetActiveTab('home')}>
              <GroupMissionsView
                teamIndex={0}
                teamProp={getActiveSubgroupForTrack('team-alpha')}
                subgroupsInTrack={subgroupsByTrack['team-alpha']}
                onSelectSubgroup={(id) => handleSelectSubgroupForTrack('team-alpha', id)}
                onToggleSubgroupLanguage={handleToggleSubgroupLanguage}
                lang={lang}
                submissions={submissions}
                taskOverrides={taskOverrides}
                customQuestions={customQuestions}
                taskOrder={taskOrder}
                gameStarted={gameStarted}
                onStartGame={toggleGameStarted}
                onSaveSubmission={saveSubmission}
                onGoHome={() => safeSetActiveTab('home')}
              />
            </SectionErrorBoundary>
          )}

          {currentTab === 'group-2' && (
            <SectionErrorBoundary sectionName="Group 2 (Ομάδα 2)" onReset={() => safeSetActiveTab('home')}>
              <GroupMissionsView
                teamIndex={1}
                teamProp={getActiveSubgroupForTrack('team-beta')}
                subgroupsInTrack={subgroupsByTrack['team-beta']}
                onSelectSubgroup={(id) => handleSelectSubgroupForTrack('team-beta', id)}
                onToggleSubgroupLanguage={handleToggleSubgroupLanguage}
                lang={lang}
                submissions={submissions}
                taskOverrides={taskOverrides}
                customQuestions={customQuestions}
                taskOrder={taskOrder}
                gameStarted={gameStarted}
                onStartGame={toggleGameStarted}
                onSaveSubmission={saveSubmission}
                onGoHome={() => safeSetActiveTab('home')}
              />
            </SectionErrorBoundary>
          )}

          {currentTab === 'group-3' && (
            <SectionErrorBoundary sectionName="Group 3 (Ομάδα 3)" onReset={() => safeSetActiveTab('home')}>
              <GroupMissionsView
                teamIndex={2}
                teamProp={getActiveSubgroupForTrack('team-gamma')}
                subgroupsInTrack={subgroupsByTrack['team-gamma']}
                onSelectSubgroup={(id) => handleSelectSubgroupForTrack('team-gamma', id)}
                onToggleSubgroupLanguage={handleToggleSubgroupLanguage}
                lang={lang}
                submissions={submissions}
                taskOverrides={taskOverrides}
                customQuestions={customQuestions}
                taskOrder={taskOrder}
                gameStarted={gameStarted}
                onStartGame={toggleGameStarted}
                onSaveSubmission={saveSubmission}
                onGoHome={() => safeSetActiveTab('home')}
              />
            </SectionErrorBoundary>
          )}

          {currentTab === 'group-4' && (
            <SectionErrorBoundary sectionName="Group 4 (Ομάδα 4)" onReset={() => safeSetActiveTab('home')}>
              <GroupMissionsView
                teamIndex={3}
                teamProp={getActiveSubgroupForTrack('team-delta')}
                subgroupsInTrack={subgroupsByTrack['team-delta']}
                onSelectSubgroup={(id) => handleSelectSubgroupForTrack('team-delta', id)}
                onToggleSubgroupLanguage={handleToggleSubgroupLanguage}
                lang={lang}
                submissions={submissions}
                taskOverrides={taskOverrides}
                customQuestions={customQuestions}
                taskOrder={taskOrder}
                gameStarted={gameStarted}
                onStartGame={toggleGameStarted}
                onSaveSubmission={saveSubmission}
                onGoHome={() => safeSetActiveTab('home')}
              />
            </SectionErrorBoundary>
          )}

          {currentTab === 'arena' && (
            <SectionErrorBoundary sectionName="Team Presentation Arena" onReset={() => safeSetActiveTab('home')}>
              <TeamPresentationArena
                lang={lang}
                submissions={submissions}
                taskOverrides={taskOverrides}
                customQuestions={customQuestions}
                taskOrder={taskOrder}
                synthesisNotes={synthesisNotes}
                customTeamTitles={customTeamTitles}
                subgroups={subgroups}
                onGoBack={() => safeSetActiveTab('home')}
                onSelectTeamMissions={(teamIdx) => safeSetActiveTab(`group-${teamIdx + 1}` as ValidTab)}
              />
            </SectionErrorBoundary>
          )}
        </SectionErrorBoundary>
      </main>

      {/* ================= CONDITIONAL MODAL: ADMIN CONSOLE ================= */}
      {isAdminOpen && (
        <AdminConsole
          lang={lang}
          onToggleLang={setLang}
          submissions={submissions}
          taskOverrides={taskOverrides}
          customQuestions={customQuestions}
          taskOrder={taskOrder}
          customTeamTitles={customTeamTitles}
          onUpdateCustomTeamTitles={handleUpdateCustomTeamTitles}
          subgroups={subgroups}
          onUpdateSubgroups={(newSubs) => {
            setSubgroups(newSubs);
            storageService.saveSubgroups(newSubs);
          }}
          onUpdateTaskOrder={handleUpdateTaskOrder}
          onUpdateTaskOverrides={handleUpdateTaskOverrides}
          onSaveCustomQuestion={handleSaveCustomQuestion}
          onResetCustomQuestion={handleResetCustomQuestion}
          onResetAllSubmissions={resetAllSubmissions}
          onResetTeamSubmissions={handleResetTeamSubmissions}
          onRestoreStateFromJson={handleRestoreStateFromJson}
          synthesisNotes={synthesisNotes}
          onClose={() => setIsAdminOpen(false)}
        />
      )}

      {/* ================= CONDITIONAL MODAL: ADD SYNTHESIS NOTE ================= */}
      {showAddNote && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <h3 className="text-lg font-bold text-white">
              {lang === 'el' ? 'Νέα Σημείωση Σύνθεσης' : 'New Synthesis Note'}
            </h3>
            <form onSubmit={handleAddNote} className="space-y-3">
              <div>
                <label className="text-xs text-slate-400 block mb-1">
                  {lang === 'el' ? 'Επιλογή Ομάδας' : 'Select Team'}
                </label>
                <select
                  value={newNoteTeam}
                  onChange={(e) => setNewNoteTeam(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white"
                >
                  {activeTeams.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.avatar} {getLocalizedTeamName(t, lang)}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs text-slate-400 block mb-1">
                  {lang === 'el' ? 'Όνομα / Συντάκτης' : 'Author'}
                </label>
                <input
                  type="text"
                  value={newNoteAuthor}
                  onChange={(e) => setNewNoteAuthor(e.target.value)}
                  placeholder={lang === 'el' ? 'π.χ. Μαρία, Νίκος (Ομάδα Α)' : 'e.g. John, Team Alpha'}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white"
                />
              </div>

              <div>
                <label className="text-xs text-slate-400 block mb-1">
                  {lang === 'el' ? 'Τίτλος Συμπεράσματος' : 'Title'}
                </label>
                <input
                  type="text"
                  required
                  value={newNoteTitle}
                  onChange={(e) => setNewNoteTitle(e.target.value)}
                  placeholder={lang === 'el' ? 'π.χ. Αποτέλεσμα έρευνας για τη Δαδιά' : 'e.g. Dadia Park Findings'}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white"
                />
              </div>

              <div>
                <label className="text-xs text-slate-400 block mb-1">
                  {lang === 'el' ? 'Περιεχόμενο' : 'Content'}
                </label>
                <textarea
                  required
                  rows={3}
                  value={newNoteContent}
                  onChange={(e) => setNewNoteContent(e.target.value)}
                  placeholder={lang === 'el' ? 'Γράψτε τι μάθατε από τις αποστολές...' : 'Write what you learned...'}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddNote(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 text-sm font-semibold hover:bg-slate-700 cursor-pointer"
                >
                  {lang === 'el' ? 'Ακύρωση' : 'Cancel'}
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-sm cursor-pointer"
                >
                  {lang === 'el' ? 'Ανάρτηση' : 'Post'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Field QR Scanner Modal */}
      {isFieldScannerOpen && (
        <FieldQrScannerModal
          lang={lang}
          questions={getAllTasks(customQuestions, taskOrder)}
          onClose={() => setIsFieldScannerOpen(false)}
          onScanSuccess={(question: Question, fieldSpot: FieldSpotInfo) => {
            setIsFieldScannerOpen(false);
            setFieldPlaybackModal({ question, fieldSpot });
          }}
        />
      )}

      {/* Field Media Playback Modal */}
      {fieldPlaybackModal && (
        <FieldMediaPlaybackModal
          question={fieldPlaybackModal.question}
          fieldSpot={fieldPlaybackModal.fieldSpot}
          lang={lang}
          onClose={() => setFieldPlaybackModal(null)}
          onSolveTask={(question: Question) => {
            setFieldPlaybackModal(null);
            const assignedTeam = question.assignedTeamIds?.[0] || 'team-alpha';
            const teamIndex = masterTeamsPool.findIndex((t) => t.id === assignedTeam);
            if (teamIndex >= 0) {
              safeSetActiveTab(`group-${teamIndex + 1}`);
            }
          }}
        />
      )}

      {/* ================= FOOTER ================= */}
      <footer className="border-t border-slate-800/80 bg-slate-900/60 px-4 py-4 text-center text-xs text-slate-500">
        <p>
          BoundPad • Αρένα των 4 Γυπών (Master Task Pool Architecture • 100% Stability & Isolated Boundaries)
        </p>
      </footer>
    </div>
  );
}

// ============================================================================
// COMPONENT: HOME SCREEN
// ============================================================================
interface HomeScreenProps {
  lang: 'el' | 'en';
  teamStats: TeamTaskStats[];
  onSelectTab: (tab: string) => void;
  teams?: Team[];
  subgroupsByTrack?: Record<CoreTrackId, Team[]>;
  onSelectSubgroupForTrack?: (trackId: CoreTrackId, subgroupId: string) => void;
  onOpenAdmin?: () => void;
}

function HomeScreen({
  lang,
  teamStats,
  onSelectTab,
  teams,
  subgroupsByTrack,
  onSelectSubgroupForTrack,
  onOpenAdmin
}: HomeScreenProps) {
  const isEl = lang === 'el';
  const displayTeams = teams && teams.length > 0 ? teams : masterTeamsPool;

  const handleSubgroupClick = (trackId: CoreTrackId, subgroupId: string, defaultIdx: number) => {
    if (onSelectSubgroupForTrack) {
      onSelectSubgroupForTrack(trackId, subgroupId);
    } else {
      onSelectTab(`group-${defaultIdx + 1}`);
    }
  };

  return (
    <div className="space-y-6">
      {/* Hero Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-slate-900 via-emerald-950/40 to-amber-950/40 border border-slate-800 p-6 sm:p-8 shadow-2xl">
        <div className="relative z-10 max-w-3xl space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs font-semibold">
            <Sparkles className="w-3.5 h-3.5" />
            <span>
              {isEl ? 'Ενιαίο Master Task Pool (61 Αποστολές Έρευνας)' : 'Master Task Pool (61 Research Missions)'}
            </span>
          </div>
          <h2 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight leading-tight">
            {isEl
              ? 'Το Όρνιο στην Κύπρο (Gyps fulvus) • LIFE with Vultures'
              : 'The Cyprus Griffon Vulture (Gyps fulvus) • LIFE with Vultures'}
          </h2>
          <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
            {isEl
              ? 'Διαδραστική εκπαιδευτική αρένα 61 πραγματικών αποστολών. Πολλαπλές μαθητικές υποομάδες μπορούν να εργαστούν ταυτόχρονα σε κάθε θεματικό πυλώνα με ανεξάρτητη επιλογή γλώσσας (Ελληνικά ή English), μοιραζόμενες το ίδιο επιστημονικό σώμα ερωτήσεων!'
              : 'Interactive inquiry arena with 61 real missions. Multiple student subgroups can work concurrently on any thematic track with independent language preferences (Greek or English), sharing the exact same scientific task curriculum!'}
          </p>
          <div className="pt-2 flex flex-wrap gap-3">
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                onSelectTab('group-1');
              }}
              className="px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-sm flex items-center gap-2 shadow-lg shadow-emerald-500/20 transition-all cursor-pointer"
            >
              <span>{isEl ? 'Έναρξη Αποστολών (Πυλώνες 1-4)' : 'Start Missions (Tracks 1-4)'}</span>
              <ChevronRight className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                onSelectTab('arena');
              }}
              className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-sm flex items-center gap-2 shadow-lg shadow-amber-500/20 transition-all cursor-pointer"
            >
              <Trophy className="w-4 h-4" />
              <span>{isEl ? 'Αρένα Παρουσίασης & Infographic Posters' : 'Team Arena & Infographic Posters'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Live Scores for All Active Student Subgroups */}
      <div>
        <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
          <h3 className="text-lg font-bold text-white flex items-center gap-2">
            <Award className="w-5 h-5 text-amber-400" />
            <span>{isEl ? 'Δυναμική Βαθμολογία Μαθητικών Υποομάδων' : 'Dynamic Student Subgroups Scoreboard'}</span>
          </h3>
          <span className="text-xs text-slate-400">
            {displayTeams.length} {isEl ? 'ενεργές υποομάδες' : 'active subgroups'}
          </span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {displayTeams.map((team, idx) => {
            const stat = teamStats.find((s) => s.team.id === team.id || s.teamId === team.id);
            const trackId = ((team.trackId || (masterTeamsPool[idx]?.id as CoreTrackId) || 'team-alpha')) as CoreTrackId;
            const trackIdx = CORE_THEMATIC_TRACKS.findIndex((t) => t.id === trackId || t.trackId === trackId);
            const teamLang = team.language || 'el';

            return (
              <div
                key={team.id}
                onClick={(e) => {
                  e.preventDefault();
                  handleSubgroupClick(trackId, team.id, trackIdx >= 0 ? trackIdx : idx);
                }}
                style={{ borderColor: `${team.color}40` }}
                className="p-5 rounded-2xl bg-slate-900 border hover:border-slate-600 transition-all cursor-pointer group shadow-lg flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-3xl p-2 rounded-xl bg-slate-800/80 border border-slate-700/60 group-hover:scale-110 transition-transform">
                      {team.avatar}
                    </span>
                    <div className="flex items-center gap-1.5">
                      <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-slate-800 border border-slate-700 text-slate-300">
                        {teamLang === 'el' ? '🇬🇷 EL' : '🇬🇧 EN'}
                      </span>
                      <div
                        style={{ backgroundColor: `${team.color}20`, color: team.color }}
                        className="px-2.5 py-1 rounded-full font-extrabold text-xs border border-current/30"
                      >
                        {stat ? stat.totalScore : 0} pts
                      </div>
                    </div>
                  </div>
                  <h4 className="font-bold text-white text-base group-hover:text-amber-300 transition-colors">
                    {getLocalizedTeamName(team, lang)}
                  </h4>
                  <p className="text-xs text-slate-400 mt-1 line-clamp-1">
                    {getLocalizedTeamSlogan(team, lang)}
                  </p>
                </div>

                <div className="mt-4 pt-4 border-t border-slate-800">
                  <div className="flex justify-between text-xs text-slate-400 mb-1.5">
                    <span>{isEl ? 'Ενεργές Αποστολές' : 'Active Quests'}</span>
                    <span className="font-semibold text-slate-200">
                      {stat ? `${stat.completedTasks} / ${stat.totalActiveTasks} (${stat.progressPercent}%)` : '0'}
                    </span>
                  </div>
                  <div className="h-2 rounded-full bg-slate-800 overflow-hidden">
                    <div
                      style={{
                        width: `${stat ? stat.progressPercent : 0}%`,
                        backgroundColor: team.color
                      }}
                      className="h-full rounded-full transition-all duration-500"
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 4 Thematic Pillars with assigned student subgroups */}
      <div className="rounded-2xl bg-slate-900/60 border border-slate-800 p-6 space-y-4">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <h3 className="text-lg font-bold text-white flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-emerald-400" />
            <span>
              {isEl
                ? 'Οι 4 Θεματικοί Πυλώνες & Ανάθεση Υποομάδων'
                : 'The 4 Thematic Tracks & Subgroup Assignments'}
            </span>
          </h3>
          {onOpenAdmin && (
            <button
              type="button"
              onClick={onOpenAdmin}
              className="text-xs text-amber-400 hover:text-amber-300 font-bold flex items-center gap-1 cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>{isEl ? 'Προσθήκη / Διαχείριση Υποομάδων (Admin)' : 'Manage Subgroups (Admin)'}</span>
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {CORE_THEMATIC_TRACKS.map((track, trackIdx) => {
            const trackId = (track.trackId || track.id) as CoreTrackId;
            const trackSubgroups: Team[] = subgroupsByTrack?.[trackId] || displayTeams.filter((t) => (t.trackId || t.id) === trackId);
            const pillarColors = ['border-emerald-700/40 text-emerald-400', 'border-cyan-700/40 text-cyan-400', 'border-amber-700/40 text-amber-400', 'border-purple-700/40 text-purple-400'];
            const colorClass = pillarColors[trackIdx % pillarColors.length];

            return (
              <div key={trackId} className={`p-4 rounded-xl bg-slate-800/40 border ${colorClass.split(' ')[0]} space-y-3 flex flex-col justify-between`}>
                <div className="space-y-2">
                  <div className={`font-bold text-sm ${colorClass.split(' ')[1]}`}>
                    {isEl ? track.title : track.title_en}
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    {isEl ? (track.description || track.theme) : (track.description_en || track.theme_en)}
                  </p>
                </div>

                {/* Assigned Subgroups Chips */}
                <div className="pt-2 border-t border-slate-700/50 space-y-1.5">
                  <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center justify-between">
                    <span>{isEl ? 'Υποομάδες Πυλώνα:' : 'Assigned Subgroups:'}</span>
                    <span className="text-slate-300">{trackSubgroups.length}</span>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {trackSubgroups.map((sub: Team) => {
                      const subLang = sub.language || 'el';
                      const subStat = teamStats.find((s) => s.team.id === sub.id || s.teamId === sub.id);
                      return (
                        <button
                          key={sub.id}
                          type="button"
                          onClick={() => handleSubgroupClick(trackId, sub.id, trackIdx)}
                          className="px-2 py-1 rounded-lg bg-slate-900 hover:bg-slate-700 border border-slate-700 text-[11px] font-bold text-white flex items-center gap-1.5 transition-all cursor-pointer shadow-xs"
                          title={getLocalizedTeamName(sub, lang)}
                        >
                          <span>{sub.avatar}</span>
                          <span className="truncate max-w-[90px]">{getLocalizedTeamName(sub, lang)}</span>
                          <span className="text-[9px] px-1 py-0.2 rounded bg-slate-800 text-slate-400">
                            {subLang === 'el' ? '🇬🇷' : '🇬🇧'}
                          </span>
                          {subStat && (
                            <span style={{ color: sub.color }} className="font-extrabold text-[10px]">
                              {subStat.totalScore}p
                            </span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// COMPONENT: TEAM LOBBY WAITING SCREEN (Simultaneous Start Barrier)
// ============================================================================
interface TeamLobbyWaitingScreenProps {
  team: Team;
  teamIndex: number;
  lang: 'el' | 'en';
  totalActiveTasks: number;
  timeLimitMinutes: number;
  onStartGame?: () => void;
  onGoHome: () => void;
}

function TeamLobbyWaitingScreen({
  team,
  teamIndex,
  lang,
  totalActiveTasks,
  timeLimitMinutes,
  onStartGame,
  onGoHome
}: TeamLobbyWaitingScreenProps) {
  return (
    <div className="space-y-6">
      {/* Top Back Navigation */}
      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={onGoHome}
          className="px-4 py-2 rounded-xl bg-slate-900 border border-slate-700/80 hover:bg-slate-800 text-slate-200 text-xs sm:text-sm font-bold flex items-center gap-2 shadow-md transition-all cursor-pointer group"
        >
          <ArrowLeft className="w-4 h-4 text-amber-400 group-hover:-translate-x-1 transition-transform" />
          <span>{lang === 'el' ? '← Επιστροφή στην Αρχική' : '← Return to Overview'}</span>
        </button>
      </div>

      {/* Main Lobby Container */}
      <div
        style={{ borderColor: `${team.color}50` }}
        className="relative overflow-hidden rounded-3xl bg-slate-900/90 border p-8 sm:p-12 shadow-2xl text-center space-y-8"
      >
        {/* Ambient Glow */}
        <div
          style={{ backgroundColor: `${team.color}15` }}
          className="absolute -top-24 -left-24 w-96 h-96 rounded-full blur-3xl pointer-events-none"
        />
        <div
          style={{ backgroundColor: `${team.color}10` }}
          className="absolute -bottom-24 -right-24 w-96 h-96 rounded-full blur-3xl pointer-events-none"
        />

        {/* Team Avatar & Badge */}
        <div className="relative z-10 flex flex-col items-center space-y-4">
          <div
            style={{ backgroundColor: `${team.color}20`, borderColor: `${team.color}60` }}
            className="w-24 h-24 sm:w-28 sm:h-28 rounded-3xl border-2 flex items-center justify-center text-6xl shadow-2xl shadow-black/40 ring-4 ring-white/5 animate-pulse"
          >
            {team.avatar}
          </div>

          <div className="space-y-1">
            <span
              style={{ backgroundColor: `${team.color}25`, color: team.color }}
              className="px-3.5 py-1 rounded-full text-xs font-black uppercase tracking-wider border border-current/30 inline-block"
            >
              {lang === 'el' ? `Ομάδα ${teamIndex + 1}` : `Group ${teamIndex + 1}`}
            </span>
            <h2 className="text-2xl sm:text-4xl font-black text-white tracking-tight">
              {getLocalizedTeamName(team, lang)}
            </h2>
            <p className="text-slate-400 text-sm max-w-lg mx-auto italic">
              «{getLocalizedTeamSlogan(team, lang)}»
            </p>
          </div>
        </div>

        {/* Waiting Status Card */}
        <div className="relative z-10 max-w-xl mx-auto p-6 rounded-2xl bg-slate-950/80 border border-amber-500/30 shadow-xl space-y-4">
          <div className="flex items-center justify-center gap-3">
            <div className="relative">
              <Hourglass className="w-6 h-6 text-amber-400 animate-spin" style={{ animationDuration: '6s' }} />
              <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-amber-400 rounded-full animate-ping" />
            </div>
            <h3 className="text-lg sm:text-xl font-black text-amber-300">
              {lang === 'el' ? 'Αναμονή για την Έναρξη...' : 'Waiting for Session Start...'}
            </h3>
          </div>

          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
            {lang === 'el'
              ? 'Η δράση δεν έχει ξεκινήσει ακόμη από τον εκπαιδευτικό. Μόλις πατηθεί η κεντρική εντολή έναρξης, οι αποστολές όλων των ομάδων θα ξεκλειδωθούν ταυτόχρονα και θα ξεκινήσει το χρονόμετρο!'
              : 'The session has not been started yet by the teacher. Once the teacher triggers the master start button, missions for all groups will unlock simultaneously and the countdown will begin!'}
          </p>

          <div className="grid grid-cols-2 gap-3 pt-2 text-left">
            <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
              <div className="text-[11px] text-slate-400 font-medium">
                {lang === 'el' ? 'Ενεργές Αποστολές' : 'Active Missions'}
              </div>
              <div className="text-lg font-black text-white mt-0.5">
                {totalActiveTasks} {lang === 'el' ? 'αποστολές' : 'tasks'}
              </div>
            </div>
            <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
              <div className="text-[11px] text-slate-400 font-medium">
                {lang === 'el' ? 'Όριο Χρόνου' : 'Time Limit'}
              </div>
              <div className="text-lg font-black text-amber-400 mt-0.5">
                {timeLimitMinutes > 0 ? `${timeLimitMinutes} min` : (lang === 'el' ? 'Χωρίς όριο' : 'Unlimited')}
              </div>
            </div>
          </div>
        </div>

        {/* Action Controls */}
        <div className="relative z-10 flex flex-wrap items-center justify-center gap-3 pt-2">
          {onStartGame && (
            <button
              type="button"
              onClick={onStartGame}
              className="px-6 py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-sm flex items-center gap-2 shadow-lg shadow-emerald-500/20 transition-all cursor-pointer hover:scale-105 active:scale-95"
            >
              <Play className="w-4 h-4 fill-slate-950" />
              <span>
                {lang === 'el'
                  ? 'Έναρξη Δράσης Τώρα (Εκπαιδευτικός)'
                  : 'Start Action Now (Teacher Override)'}
              </span>
            </button>
          )}
          <button
            type="button"
            onClick={onGoHome}
            className="px-5 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-sm cursor-pointer transition-all"
          >
            {lang === 'el' ? 'Επιστροφή στην Αρχική' : 'Back to Home'}
          </button>
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// COMPONENT: GROUP MISSIONS VIEW (1 Question At a Time OR Clean Accordion)
// ============================================================================
interface GroupMissionsViewProps {
  teamIndex: number;
  lang: 'el' | 'en';
  submissions: Record<string, Submission>;
  taskOverrides: Record<string, boolean>;
  customQuestions?: Record<string, Question>;
  taskOrder?: string[];
  gameStarted?: boolean;
  onStartGame?: () => void;
  onSaveSubmission: (submission: Submission) => void;
  onGoHome: () => void;
  teamProp?: Team;
  subgroupsInTrack?: Team[];
  onSelectSubgroup?: (subgroupId: string) => void;
  onToggleSubgroupLanguage?: (subgroupId: string) => void;
}

function GroupMissionsView({
  teamIndex,
  lang,
  submissions,
  taskOverrides,
  customQuestions = {},
  taskOrder,
  gameStarted = false,
  onStartGame,
  onSaveSubmission,
  onGoHome,
  teamProp,
  subgroupsInTrack,
  onSelectSubgroup,
  onToggleSubgroupLanguage
}: GroupMissionsViewProps) {
  const team = teamProp || masterTeamsPool[teamIndex] || masterTeamsPool[0];
  const effectiveLang = getTeamEffectiveLanguage(team, lang);

  // Query ONLY active tasks for this team dynamically from Master Pool with custom overrides & task order
  const tasks = useMemo(() => {
    try {
      return getActiveTasksForTeam(team.id, taskOverrides, customQuestions, taskOrder) || [];
    } catch {
      return [];
    }
  }, [team.id, taskOverrides, customQuestions, taskOrder]);

  // Designated checkpoints for this group
  const checkpoints = useMemo(() => {
    try {
      return getCheckpointsForTeam(team.id, taskOverrides, customQuestions, taskOrder) || [];
    } catch {
      return [];
    }
  }, [team.id, taskOverrides, customQuestions, taskOrder]);

  // Compute stats safely
  const { totalScore, completedTasks, totalActiveTasks } = useMemo(() => {
    try {
      return computeTeamTaskStats(team, submissions, taskOverrides, customQuestions, taskOrder);
    } catch {
      return { totalScore: 0, completedTasks: 0, totalActiveTasks: tasks.length };
    }
  }, [team, submissions, taskOverrides, customQuestions, taskOrder, tasks.length]);

  // View Mode: 'single' (Focus Mode, 1 task at a time) is DEFAULT
  const [viewStyle, setViewStyle] = useState<'single' | 'accordion'>('single');

  // Single Question Index initialized and persisted in bulletproof storage
  const [currentTaskIndex, setCurrentTaskIndex] = useState<number>(() => {
    return storageService.getTeamTaskIndex(team.id, 0);
  });

  const handleSetTaskIndex = (index: number) => {
    const safeIdx = Math.max(0, Math.min(tasks.length - 1, index));
    setCurrentTaskIndex(safeIdx);
    storageService.saveTeamTaskIndex(team.id, safeIdx);
  };

  // Accordion expanded question id
  const [expandedId, setExpandedId] = useState<string | null>(tasks[0]?.id || null);

  const safeIndex = Math.min(Math.max(0, currentTaskIndex), Math.max(0, tasks.length - 1));
  const currentTask = tasks[safeIndex];

  // ================= TIMER & DEADLINE SYSTEM =================
  const [groupTimers, setGroupTimers] = useState<Record<string, number>>(() => storageService.getGroupTimers());
  const [startTimestamp, setStartTimestamp] = useState<number>(() => storageService.getGameStartTimestamp());
  const [now, setNow] = useState<number>(Date.now());

  useEffect(() => {
    const handleTimersChange = () => {
      setGroupTimers(storageService.getGroupTimers());
    };
    const handleGameStarted = () => {
      setStartTimestamp(storageService.getGameStartTimestamp());
    };
    const handleTimerReset = () => {
      setStartTimestamp(storageService.getGameStartTimestamp());
    };

    window.addEventListener('boundpad:groupTimers', handleTimersChange);
    window.addEventListener('boundpad:gameStarted', handleGameStarted);
    window.addEventListener('boundpad:timerReset', handleTimerReset);

    return () => {
      window.removeEventListener('boundpad:groupTimers', handleTimersChange);
      window.removeEventListener('boundpad:gameStarted', handleGameStarted);
      window.removeEventListener('boundpad:timerReset', handleTimerReset);
    };
  }, []);

  // Update clock tick every second
  useEffect(() => {
    const timer = setInterval(() => {
      setNow(Date.now());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const timeLimitMinutes = groupTimers[team.id] ?? groupTimers[team.trackId || ''] ?? 20;
  const totalAllowedSeconds = timeLimitMinutes * 60;
  const elapsedSeconds = startTimestamp > 0 ? Math.max(0, Math.floor((now - startTimestamp) / 1000)) : 0;
  const remainingSeconds = totalAllowedSeconds > 0 && startTimestamp > 0
    ? Math.max(0, totalAllowedSeconds - elapsedSeconds)
    : totalAllowedSeconds;
  const isTimeExpired = totalAllowedSeconds > 0 && startTimestamp > 0 && remainingSeconds <= 0;

  const formatTimer = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  // If game has not been started by teacher, present the dedicated Lobby Screen
  if (!gameStarted) {
    return (
      <TeamLobbyWaitingScreen
        team={team}
        teamIndex={teamIndex}
        lang={effectiveLang}
        totalActiveTasks={tasks.length}
        timeLimitMinutes={timeLimitMinutes}
        onStartGame={onStartGame}
        onGoHome={onGoHome}
      />
    );
  }

  return (
    <div className="space-y-6">
      {/* ================= SAFE GO BACK NAVIGATION & TOP BAR ================= */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <button
          type="button"
          onClick={onGoHome}
          className="px-4 py-2 rounded-xl bg-slate-900 border border-slate-700/80 hover:bg-slate-800 text-slate-200 text-xs sm:text-sm font-bold flex items-center gap-2 shadow-md transition-all cursor-pointer group"
        >
          <ArrowLeft className="w-4 h-4 text-amber-400 group-hover:-translate-x-1 transition-transform" />
          <span>{effectiveLang === 'el' ? '← Επιστροφή στην Αρχική' : '← Return to Overview'}</span>
        </button>

        {/* View Mode Switcher */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setViewStyle('single')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
              viewStyle === 'single'
                ? 'bg-amber-500 text-slate-950 shadow-md font-black'
                : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
            }`}
          >
            <Target className="w-3.5 h-3.5" />
            <span>{effectiveLang === 'el' ? 'Focus Mode (1 Αποστολή)' : 'Focus Mode (1 Task)'}</span>
          </button>
          <button
            type="button"
            onClick={() => setViewStyle('accordion')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
              viewStyle === 'accordion'
                ? 'bg-amber-500 text-slate-950 shadow-md font-black'
                : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
            }`}
          >
            <List className="w-3.5 h-3.5" />
            <span>{effectiveLang === 'el' ? 'Προβολή Λίστας' : 'List View'}</span>
          </button>
        </div>
      </div>

      {/* Subgroup Switcher Bar for Multi-subgroup Tracks */}
      {subgroupsInTrack && subgroupsInTrack.length > 1 && (
        <div className="p-3.5 rounded-2xl bg-slate-900/90 border border-slate-800 flex items-center justify-between flex-wrap gap-2.5 shadow-lg">
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4 text-amber-400" />
            <span className="text-xs font-bold text-slate-300">
              {effectiveLang === 'el' ? 'Υποομάδες αυτού του Θεματικού Πυλώνα:' : 'Subgroups in this Thematic Track:'}
            </span>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            {subgroupsInTrack.map((sub) => {
              const isCurrent = sub.id === team.id;
              const subLang = sub.language || 'el';
              const subStat = computeTeamTaskStats(sub, submissions, taskOverrides, customQuestions, taskOrder);
              return (
                <button
                  key={sub.id}
                  type="button"
                  onClick={() => onSelectSubgroup && onSelectSubgroup(sub.id)}
                  style={{
                    borderColor: isCurrent ? sub.color : 'transparent'
                  }}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-2 border transition-all cursor-pointer ${
                    isCurrent
                      ? 'bg-slate-800 text-white shadow-md ring-2 ring-amber-400/50'
                      : 'bg-slate-950/70 hover:bg-slate-800 text-slate-300'
                  }`}
                >
                  <span>{sub.avatar}</span>
                  <span>{getLocalizedTeamName(sub, effectiveLang)}</span>
                  <span className="px-1.5 py-0.5 rounded text-[10px] font-black bg-slate-900 border border-slate-700">
                    {subLang === 'el' ? '🇬🇷 GR' : '🇬🇧 EN'}
                  </span>
                  <span
                    style={{ color: sub.color }}
                    className="text-[11px] font-black"
                  >
                    {subStat.totalScore}p
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Group Header Card */}
      <div
        style={{ borderColor: `${team.color}50` }}
        className="p-6 rounded-3xl bg-slate-900 border shadow-xl flex flex-wrap items-center justify-between gap-4"
      >
        <div className="flex items-center gap-4">
          <div
            style={{ backgroundColor: `${team.color}25` }}
            className="w-16 h-16 rounded-2xl flex items-center justify-center text-4xl border border-current/30 shadow-inner"
          >
            {team.avatar}
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span
                style={{ backgroundColor: `${team.color}20`, color: team.color }}
                className="px-2.5 py-0.5 rounded-full text-xs font-bold"
              >
                {effectiveLang === 'el' ? `Ομάδα ${teamIndex + 1}` : `Group ${teamIndex + 1}`}
              </span>
              <span className="text-xs text-slate-400">
                {getLocalizedTeamSlogan(team, effectiveLang)}
              </span>
              {/* 1-Click Language Switcher per Subgroup */}
              {onToggleSubgroupLanguage && (
                <button
                  type="button"
                  onClick={() => onToggleSubgroupLanguage(team.id)}
                  className="px-2.5 py-1 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-xs font-bold text-slate-200 flex items-center gap-1.5 transition-all cursor-pointer shadow-xs ml-1"
                  title={effectiveLang === 'el' ? 'Αλλαγή γλώσσας υποομάδας σε English' : 'Switch subgroup language to Greek'}
                >
                  <span>{effectiveLang === 'el' ? '🇬🇷 Ελληνικά' : '🇬🇧 English'}</span>
                  <span className="text-[10px] text-amber-400 font-normal">⇄ {effectiveLang === 'el' ? 'EN' : 'GR'}</span>
                </button>
              )}
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-white mt-1">
              {getLocalizedTeamName(team, effectiveLang)}
            </h2>
          </div>
        </div>

        {/* Score & Progress */}
        <div className="flex items-center gap-3">
          <div className="px-4 py-2 rounded-xl bg-slate-800 border border-slate-700 text-center">
            <div className="text-xs text-slate-400">{effectiveLang === 'el' ? 'Βαθμολογία' : 'Score'}</div>
            <div
              style={{ color: team.color }}
              className="text-xl font-black"
            >
              {totalScore} pts
            </div>
          </div>
          <div className="px-4 py-2 rounded-xl bg-slate-800 border border-slate-700 text-center">
            <div className="text-xs text-slate-400">{effectiveLang === 'el' ? 'Πρόοδος' : 'Progress'}</div>
            <div className="text-xl font-black text-emerald-400">
              {completedTasks} / {totalActiveTasks}
            </div>
          </div>
        </div>
      </div>

      {/* ================= LIVE COUNTDOWN TIMER & DEADLINE STATUS BANNER ================= */}
      {timeLimitMinutes > 0 && (
        <div
          className={`p-4 rounded-2xl border flex items-center justify-between flex-wrap gap-3 shadow-lg transition-all ${
            isTimeExpired
              ? 'bg-rose-950/80 border-rose-500 text-rose-200'
              : remainingSeconds < 180
              ? 'bg-amber-950/40 border-amber-500/70 text-amber-200'
              : 'bg-slate-900 border-slate-800 text-slate-200'
          }`}
        >
          <div className="flex items-center gap-3">
            <div
              className={`p-2.5 rounded-xl border flex items-center justify-center shrink-0 ${
                isTimeExpired
                  ? 'bg-rose-500/20 border-rose-500 text-rose-400'
                  : remainingSeconds < 180
                  ? 'bg-amber-500/20 border-amber-500 text-amber-400 animate-pulse'
                  : 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
              }`}
            >
              {isTimeExpired ? (
                <Lock className="w-5 h-5 text-rose-400" />
              ) : remainingSeconds < 180 ? (
                <AlertTriangle className="w-5 h-5 text-amber-400" />
              ) : (
                <Clock className="w-5 h-5 text-emerald-400" />
              )}
            </div>

            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs uppercase font-extrabold tracking-wider">
                  {isTimeExpired
                    ? (effectiveLang === 'el' ? 'ΛΗΞΗ ΧΡΟΝΟΥ ΑΠΟΣΤΟΛΗΣ' : 'MISSION TIME EXPIRED')
                    : (effectiveLang === 'el' ? 'Χρονόμετρο Πεδίου (Αντίστροφη Μέτρηση)' : 'Field Countdown Timer')}
                </span>
                <span className="text-[11px] text-slate-400">
                  ({effectiveLang === 'el' ? `Όριο: ${timeLimitMinutes} λεπτά` : `Limit: ${timeLimitMinutes} min`})
                </span>
              </div>
              <p className="text-xs text-slate-300 mt-0.5">
                {isTimeExpired
                  ? (effectiveLang === 'el'
                    ? 'Ο διαθέσιμος χρόνος έληξε! Οι απαντήσεις κλειδώθηκαν αυτόματα για αξιολόγηση.'
                    : 'Time expired! All tasks have been locked for evaluation.')
                  : (effectiveLang === 'el'
                    ? 'Συνεργαστείτε για την επίλυση των αποστολών πριν μηδενίσει ο χρόνος.'
                    : 'Work with your team to solve missions before time runs out.')}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 ml-auto">
            <div
              className={`px-4 py-2 rounded-xl border text-xl sm:text-2xl font-black font-mono tracking-wider shadow-inner ${
                isTimeExpired
                  ? 'bg-rose-950 border-rose-500 text-rose-400'
                  : remainingSeconds < 180
                  ? 'bg-amber-950/80 border-amber-500 text-amber-300 animate-pulse'
                  : 'bg-slate-950 border-slate-700 text-emerald-400'
              }`}
            >
              {formatTimer(remainingSeconds)}
            </div>
          </div>
        </div>
      )}

      {/* Checkpoints Quick Navigation Bar */}
      {checkpoints.length > 0 && (
        <div className="p-3.5 rounded-2xl bg-slate-900/90 border border-amber-500/30 flex items-center justify-between flex-wrap gap-2 shadow-lg">
          <div className="flex items-center gap-2 text-xs font-bold text-amber-400">
            <Flag className="w-4 h-4 text-amber-400" />
            <span>{effectiveLang === 'el' ? 'Επίσημοι Σταθμοί & Checkpoints:' : 'Official Checkpoints:'}</span>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            {checkpoints.map((cp) => {
              const cpIdx = tasks.findIndex((t) => t.id === cp.id);
              const isCpCurrent = cpIdx === safeIndex;
              const isCpDone = submissions[`${team.id}_${cp.id}`]?.status === 'correct';
              const meta = getCheckpointMetadata(cp, effectiveLang);

              return (
                <button
                  key={cp.id}
                  type="button"
                  onClick={() => handleSetTaskIndex(cpIdx)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                    isCpCurrent
                      ? 'bg-amber-500 text-slate-950 font-black shadow-md ring-2 ring-amber-300'
                      : isCpDone
                      ? 'bg-emerald-950/70 border border-emerald-500/50 text-emerald-300 hover:bg-emerald-900/60'
                      : 'bg-slate-800 border border-amber-500/30 text-amber-300 hover:bg-slate-700'
                  }`}
                  title={meta.description}
                >
                  <span>{meta.badge}</span>
                  {isCpDone && <Check className="w-3.5 h-3.5 text-emerald-400" />}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* ================= VIEW STYLE 1: FOCUS MODE (STRICT PAGINATION - ABSOLUTE DOM CLEANLINESS) ================= */}
      {viewStyle === 'single' && currentTask && (
        <div className="space-y-4">
          {/* Stepper / Dots Pagination Bar */}
          <div className="p-3 rounded-2xl bg-slate-900/70 border border-slate-800">
            <div className="flex items-center justify-between text-xs text-slate-400 mb-2 font-medium">
              <span>
                {effectiveLang === 'el'
                  ? `Αποστολή ${safeIndex + 1} από ${tasks.length}`
                  : `Mission ${safeIndex + 1} of ${tasks.length}`}
              </span>
              <span className="text-[11px] text-slate-500">
                {effectiveLang === 'el' ? 'Κλικ σε αριθμό για άμεση μετάβαση' : 'Click number to jump'}
              </span>
            </div>

            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-thin">
              {tasks.map((t, idx) => {
                const sub = submissions[`${team.id}_${t.id}`];
                const isDone = sub?.status === 'correct';
                const isIncorrect = sub?.status === 'incorrect';
                const isCurrent = idx === safeIndex;
                const isCp = isCheckpointTask(t.id);
                const taskTitle = effectiveLang === 'el' ? t.title : (t.title_en || t.title);

                return (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => handleSetTaskIndex(idx)}
                    className={`w-8 h-8 rounded-xl text-xs font-bold shrink-0 transition-all cursor-pointer flex items-center justify-center relative ${
                      isCurrent
                        ? 'bg-amber-500 text-slate-950 ring-2 ring-amber-300 shadow-md font-black scale-105'
                        : isDone
                        ? 'bg-emerald-950/60 text-emerald-400 border border-emerald-500/40'
                        : isIncorrect
                        ? 'bg-amber-950/60 text-amber-300 border border-amber-500/60 shadow-xs'
                        : isCp
                        ? 'bg-amber-950/40 text-amber-300 border border-amber-500/50'
                        : 'bg-slate-800 text-slate-400 hover:bg-slate-700 hover:text-white'
                    }`}
                    title={isIncorrect ? `${taskTitle} (💡 ${effectiveLang === 'el' ? 'Ευκαιρία Μάθησης' : 'Learning Opportunity'})` : taskTitle}
                  >
                    {isDone ? '✓' : isIncorrect ? '💡' : isCp ? '🚩' : idx + 1}
                  </button>
                );
              })}
            </div>
          </div>

          {/* EXACTLY 1 TASK IN THE DOM - WRAPPED IN STRICT SECTION ERROR BOUNDARY */}
          <SectionErrorBoundary
            sectionName={`Task ${currentTask.id}`}
            onReset={() => handleSetTaskIndex(safeIndex)}
          >
            <InlineQuestCard
              quest={currentTask}
              team={team}
              lang={effectiveLang}
              submission={submissions[`${team.id}_${currentTask.id}`]}
              isLocked={isTimeExpired}
              onSaveSubmission={onSaveSubmission}
              onNextTask={() => handleSetTaskIndex(safeIndex + 1)}
              hasNextTask={safeIndex < tasks.length - 1}
            />
          </SectionErrorBoundary>

          {/* Safe Stepper Navigation Controls */}
          <div className="flex items-center justify-between pt-2">
            <button
              type="button"
              disabled={safeIndex <= 0}
              onClick={() => handleSetTaskIndex(safeIndex - 1)}
              className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 disabled:opacity-30 disabled:pointer-events-none text-slate-200 text-xs sm:text-sm font-semibold flex items-center gap-2 cursor-pointer transition-colors shadow-md"
            >
              <ChevronLeft className="w-4 h-4" />
              <span>{effectiveLang === 'el' ? 'Προηγούμενη Αποστολή' : 'Previous Mission'}</span>
            </button>

            <span className="text-xs font-semibold text-slate-400">
              {safeIndex + 1} / {tasks.length}
            </span>

            <button
              type="button"
              disabled={safeIndex >= tasks.length - 1}
              onClick={() => handleSetTaskIndex(safeIndex + 1)}
              className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 disabled:opacity-30 disabled:pointer-events-none text-slate-950 text-xs sm:text-sm font-bold flex items-center gap-2 cursor-pointer transition-all shadow-md shadow-amber-500/20 active:scale-95"
            >
              <span>{effectiveLang === 'el' ? 'Επόμενη Αποστολή' : 'Next Mission'}</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* ================= VIEW STYLE 2: ACCORDION LIST ================= */}
      {viewStyle === 'accordion' && (
        <div className="space-y-3">
          {tasks.map((t, idx) => {
            const sub = submissions[`${team.id}_${t.id}`];
            const isDone = sub?.status === 'correct';
            const isIncorrect = sub?.status === 'incorrect';
            const isExpanded = expandedId === t.id;
            const isCp = isCheckpointTask(t.id);
            const taskTitle = effectiveLang === 'el' ? t.title : (t.title_en || t.title);

            return (
              <div
                key={t.id}
                className={`rounded-2xl border transition-all ${
                  isDone
                    ? 'bg-emerald-950/10 border-emerald-500/40'
                    : isIncorrect
                    ? 'bg-amber-950/15 border-amber-500/50'
                    : isCp
                    ? 'bg-amber-950/10 border-amber-500/40'
                    : 'bg-slate-900 border-slate-800'
                }`}
              >
                {/* Accordion Header */}
                <div
                  onClick={() => setExpandedId(isExpanded ? null : t.id)}
                  className="p-4 flex items-center justify-between cursor-pointer hover:bg-slate-800/40 rounded-2xl"
                >
                  <div className="flex items-center gap-3">
                    <span
                      className={`w-7 h-7 rounded-lg text-xs font-bold flex items-center justify-center shrink-0 ${
                        isDone
                          ? 'bg-emerald-500 text-slate-950'
                          : isIncorrect
                          ? 'bg-amber-500 text-slate-950 font-black'
                          : isCp
                          ? 'bg-amber-500 text-slate-950 font-black'
                          : 'bg-slate-800 text-slate-300'
                      }`}
                    >
                      {isDone ? '✓' : isIncorrect ? '💡' : isCp ? '🚩' : idx + 1}
                    </span>
                    <div>
                      <h4 className="font-bold text-white text-sm">
                        {taskTitle}
                      </h4>
                      <span className="text-[11px] text-slate-400">
                        {t.type.replace('_', ' ')} • +{t.points} pts
                      </span>
                    </div>
                  </div>

                  <span className="text-slate-400 font-bold text-sm px-2">
                    {isExpanded ? '▲' : '▼'}
                  </span>
                </div>

                {/* Expanded Card Body with Error Boundary */}
                {isExpanded && (
                  <div className="p-4 border-t border-slate-800">
                    <SectionErrorBoundary sectionName={`Accordion Task ${t.id}`}>
                      <InlineQuestCard
                        quest={t}
                        team={team}
                        lang={effectiveLang}
                        submission={submissions[`${team.id}_${t.id}`]}
                        isLocked={isTimeExpired}
                        onSaveSubmission={onSaveSubmission}
                      />
                    </SectionErrorBoundary>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ============================================================================
// COMPONENT: INLINE QUEST CARD & SOLVER
// ============================================================================
interface InlineQuestCardProps {
  quest: Question;
  team: Team;
  lang: 'el' | 'en';
  submission?: Submission;
  isLocked?: boolean;
  onSaveSubmission: (submission: Submission) => void;
  onNextTask?: () => void;
  hasNextTask?: boolean;
}

function InlineQuestCard({
  quest,
  team,
  lang,
  submission,
  isLocked = false,
  onSaveSubmission,
  onNextTask,
  hasNextTask
}: InlineQuestCardProps) {
  const effectiveLang = getTeamEffectiveLanguage(team, lang);
  const isDone = submission?.status === 'correct';
  const isIncorrect = submission?.status === 'incorrect';
  const hasAttempted = Boolean(submission);
  const isReadOnly = hasAttempted || Boolean(isLocked);
  const cpMeta = getCheckpointMetadata(quest, effectiveLang);

  const title = effectiveLang === 'el' ? quest.title : quest.title_en || quest.title;
  const explanation = effectiveLang === 'el' ? quest.explanation : quest.explanation_en || quest.explanation;

  const currentFact = submission?.scientificFact || extractScientificFact(quest, team.id, isDone, submission?.answerData);

  const handleSaveSub = (answerData: any, isCorrect: boolean, pointsEarned?: number) => {
    if (isLocked) return; // Prevent submission if time is expired
    const scientificFact = extractScientificFact(quest, team.id, isCorrect, answerData);
    const reflectionText = (answerData?.reportText || answerData?.reflectionText || '').trim() || undefined;
    const newSub: Submission = {
      id: submission?.id || `sub-${Date.now()}`,
      teamId: team.id,
      questionId: quest.id,
      submittedAt: Date.now(),
      status: isCorrect ? 'correct' : 'incorrect',
      scoreEarned: isCorrect ? (pointsEarned ?? quest.points) : 0,
      answerData,
      reflectionText,
      scientificFact
    };
    onSaveSubmission(newSub);
  };

  // Whether this quest type already displays the explanation internally
  const rendersExplanationInternally = quest.type === 'multiple_choice' || quest.type === 'true_false';

  return (
    <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl space-y-5">
      {/* Checkpoint Illuminated Banner */}
      {cpMeta.isCheckpoint && (
        <div className="p-4 rounded-2xl bg-gradient-to-r from-amber-950/70 via-slate-900 to-amber-950/40 border-2 border-amber-500/70 shadow-lg shadow-amber-500/10 flex items-start gap-3.5">
          <div className="p-2.5 rounded-xl bg-amber-500/20 text-amber-300 border border-amber-500/40 shrink-0 text-xl font-bold">
            🚩
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="px-2.5 py-0.5 rounded-full bg-amber-500 text-slate-950 font-black text-xs uppercase tracking-wider">
                {cpMeta.badge}
              </span>
              <span className="text-sm font-bold text-amber-300">{cpMeta.label}</span>
            </div>
            <p className="text-xs text-slate-300 mt-1 leading-relaxed">
              {cpMeta.description}
            </p>
          </div>
        </div>
      )}

      {/* Meta & Title */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1.5 flex-wrap">
            <span
              style={{ backgroundColor: `${team.color}20`, color: team.color }}
              className="px-2.5 py-0.5 rounded-full text-xs font-bold"
            >
              {team.avatar} {effectiveLang === 'el' ? team.name : team.name_en || team.name}
            </span>
            <span className="px-2.5 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/30 text-xs font-bold">
              +{quest.points} pts
            </span>
            {quest.timeLimitMinutes && (
              <span className="px-2.5 py-0.5 rounded-full bg-blue-500/10 text-blue-300 border border-blue-500/30 text-xs font-bold flex items-center gap-1">
                <Clock className="w-3 h-3 text-blue-400" />
                <span>{quest.timeLimitMinutes} min</span>
              </span>
            )}
            <span className="px-2 py-0.5 rounded-md bg-slate-800 text-[10px] uppercase font-semibold text-slate-400">
              {quest.type.replace('_', ' ')}
            </span>
          </div>
          <h3 className="text-xl sm:text-2xl font-extrabold text-white leading-snug">{title}</h3>
        </div>

        {isDone ? (
          <span className="px-3.5 py-1.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 text-xs font-bold flex items-center gap-1.5 shrink-0 shadow-sm">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>{effectiveLang === 'el' ? 'Ολοκληρώθηκε' : 'Completed'}</span>
          </span>
        ) : isIncorrect ? (
          <span className="px-3.5 py-1.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40 text-xs font-bold flex items-center gap-1.5 shrink-0 shadow-sm">
            <span className="text-amber-400">💡</span>
            <span>{effectiveLang === 'el' ? 'Ευκαιρία Μάθησης (Καταγράφηκε)' : 'Learning Fact (Logged)'}</span>
          </span>
        ) : isLocked ? (
          <span className="px-3.5 py-1.5 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/40 text-xs font-bold flex items-center gap-1.5 shrink-0 shadow-sm">
            <Lock className="w-4 h-4 text-rose-400" />
            <span>{effectiveLang === 'el' ? 'Κλειδώθηκε' : 'Locked'}</span>
          </span>
        ) : null}
      </div>

      {/* Lock Notification Banner if time expired */}
      {isLocked && !isDone && (
        <div className="p-3.5 rounded-2xl bg-rose-950/40 border border-rose-500/50 text-rose-300 flex items-center gap-3 text-xs sm:text-sm font-semibold">
          <Lock className="w-4 h-4 text-rose-400 shrink-0" />
          <span>
            {effectiveLang === 'el'
              ? '🔒 Ο χρόνος της αποστολής έληξε! Η υποβολή απαντήσεων έχει κλειδωθεί για αυτή τη δραστηριότητα.'
              : '🔒 Mission time has expired! Answer submissions are locked for this task.'}
          </span>
        </div>
      )}

      {/* Attached Question Reference Media (Image / Video) */}
      {quest.type !== 'multiple_choice' && quest.type !== 'puzzle' && (quest.imageUrl || quest.videoUrl) && (
        <div className="p-3 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-2">
          <div className="flex items-center gap-1.5 text-xs font-bold text-amber-400">
            <span>📷</span>
            <span>{effectiveLang === 'el' ? 'Πολυμέσο Αναφοράς Αποστολής:' : 'Mission Reference Media:'}</span>
          </div>
          {quest.imageUrl && (
            <div className="rounded-xl overflow-hidden border border-slate-700 bg-black max-h-72 flex items-center justify-center">
              <img
                src={quest.imageUrl}
                alt={title}
                className="w-full h-auto max-h-72 object-contain rounded-xl"
                onError={(e) => {
                  (e.target as HTMLElement).style.display = 'none';
                }}
              />
            </div>
          )}
          {quest.videoUrl && (
            <div className="rounded-xl overflow-hidden border border-slate-700 bg-black max-h-72 flex items-center justify-center">
              <video
                src={quest.videoUrl}
                controls
                playsInline
                className="w-full max-h-72 object-contain rounded-xl"
              />
            </div>
          )}
        </div>
      )}

      {/* Dynamic Interactive Quest Solver by Type */}
      <div className="pt-1">
        {quest.type === 'multiple_choice' && (
          <MultipleChoiceQuest
            question={quest}
            existingSubmission={submission}
            lang={effectiveLang}
            readOnly={isReadOnly}
            onSubmit={(data) => handleSaveSub(data, data.isCorrect, data.points)}
          />
        )}

        {quest.type === 'true_false' && (
          <TrueFalseQuest
            question={quest}
            existingSubmission={submission}
            lang={effectiveLang}
            readOnly={isReadOnly}
            onSubmit={(data) => handleSaveSub(data, data.isCorrect, data.points)}
          />
        )}

        {quest.type === 'text_match' && (
          <TextMatchQuest
            question={quest}
            existingSubmission={submission}
            lang={effectiveLang}
            readOnly={isReadOnly}
            onSubmit={(data) => handleSaveSub(data, data.isCorrect, data.points)}
          />
        )}

        {quest.type === 'image_match' && (
          <ImageMatchQuest
            question={quest}
            existingSubmission={submission}
            lang={effectiveLang}
            readOnly={isReadOnly}
            onSubmit={(data) => handleSaveSub(data, data.isCorrect, data.points)}
          />
        )}

        {quest.type === 'puzzle' && (
          <PuzzleQuest
            question={quest}
            existingSubmission={submission}
            lang={effectiveLang}
            readOnly={isReadOnly}
            onSubmit={(data) => handleSaveSub(data, true, data.points)}
          />
        )}

        {quest.type === 'qr_scan' && (
          <QrScanQuest
            question={quest}
            existingSubmission={submission}
            lang={effectiveLang}
            readOnly={isReadOnly}
            onSubmit={(data) => handleSaveSub(data, data.isCorrect, data.points)}
          />
        )}

        {quest.type === 'photo_upload' && (
          <PhotoUploadQuest
            question={quest}
            existingSubmission={submission}
            lang={effectiveLang}
            readOnly={isReadOnly}
            onSubmit={(data) => handleSaveSub(data, true, data.points)}
          />
        )}

        {quest.type === 'task' && (
          <TaskQuest
            question={quest}
            existingSubmission={submission}
            lang={effectiveLang}
            readOnly={isReadOnly}
            onSubmit={(data) => handleSaveSub(data, true, data.points)}
          />
        )}

        {quest.type === 'research' && (
          <ResearchQuest
            question={quest}
            existingSubmission={submission}
            lang={effectiveLang}
            readOnly={isReadOnly}
            onSubmit={(data) => handleSaveSub(data, true, data.points)}
          />
        )}

        {quest.type === 'survey' && (
          <SurveyQuest
            question={quest}
            existingSubmission={submission}
            lang={effectiveLang}
            readOnly={isReadOnly}
            onSubmit={(data) => handleSaveSub(data, true, data.points)}
          />
        )}
      </div>

      {/* Pedagogical Learning Card when initial answer is incorrect */}
      {isIncorrect && currentFact && (
        <div className="p-4 sm:p-5 rounded-2xl border-2 border-amber-500/60 bg-gradient-to-r from-amber-950/40 via-slate-900 to-amber-950/20 shadow-lg space-y-3 animate-in fade-in">
          <div className="flex items-center justify-between gap-2 flex-wrap">
            <span className="px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40 text-xs font-black uppercase tracking-wider flex items-center gap-1.5">
              <span>💡</span>
              <span>{effectiveLang === 'el' ? 'Ευκαιρία Μάθησης • Καταγράφηκε στο Πόστερ' : 'Learning Opportunity • Recorded to Poster'}</span>
            </span>
            <span className="text-[11px] font-bold text-slate-400">
              {effectiveLang === 'el' ? 'Το λάθος μετατρέπεται σε επιστημονική γνώση' : 'Mistake turned into verified science'}
            </span>
          </div>

          <div className="space-y-2 text-xs sm:text-sm">
            <div className="p-3 rounded-xl bg-slate-950/80 border border-emerald-500/40">
              <span className="text-[11px] font-bold text-emerald-400 uppercase tracking-wider block">
                {effectiveLang === 'el' ? '✓ Ορθή Επιστημονική Απάντηση:' : '✓ Correct Scientific Fact:'}
              </span>
              <p className="font-bold text-white mt-0.5 text-sm">
                {effectiveLang === 'el' ? currentFact.correctAnswerText : (currentFact.correctAnswerText_en || currentFact.correctAnswerText)}
              </p>
            </div>

            {currentFact.explanation && (
              <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800">
                <span className="text-[11px] font-bold text-amber-400 uppercase tracking-wider block">
                  {effectiveLang === 'el' ? 'Επιστημονική Τεκμηρίωση:' : 'Scientific Explanation:'}
                </span>
                <p className="text-slate-300 mt-0.5 leading-relaxed">
                  {effectiveLang === 'el' ? currentFact.explanation : (currentFact.explanation_en || currentFact.explanation)}
                </p>
              </div>
            )}

            {currentFact.keyTakeaway && (
              <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center gap-2 text-amber-300 text-xs font-semibold">
                <span>🎯</span>
                <span>{effectiveLang === 'el' ? 'Κύριο Συμπέρασμα: ' : 'Key Takeaway: '}</span>
                <span className="text-white font-bold">{effectiveLang === 'el' ? currentFact.keyTakeaway : (currentFact.keyTakeaway_en || currentFact.keyTakeaway)}</span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Authoritative Scientific Explanation when Solved (for types not displaying it internally) */}
      {isDone && !rendersExplanationInternally && explanation && (
        <div className="p-4 rounded-2xl border border-emerald-500/40 bg-emerald-950/20 text-xs text-slate-300 leading-relaxed space-y-1">
          <p className="font-bold text-emerald-300 flex items-center gap-1.5">
            <Info className="w-4 h-4 text-emerald-400" />
            <span>{effectiveLang === 'el' ? 'Επιστημονική Τεκμηρίωση:' : 'Scientific Note:'}</span>
          </p>
          <p className="text-slate-300">{explanation}</p>
        </div>
      )}

      {/* Stepper Navigation Footer - Available for both Correct and Mistakes-Turned-Learning */}
      {(isDone || isIncorrect) && hasNextTask && onNextTask && (
        <div className="pt-4 border-t border-slate-800 flex justify-end">
          <button
            type="button"
            onClick={onNextTask}
            className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs sm:text-sm flex items-center gap-2 cursor-pointer shadow-md shadow-amber-500/20 transition-all active:scale-95"
          >
            <span>{effectiveLang === 'el' ? 'Συνέχεια στην Επόμενη Αποστολή' : 'Continue to Next Mission'}</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
}
