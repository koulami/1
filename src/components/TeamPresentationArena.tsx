import React, { useState, useEffect, useMemo } from 'react';
import {
  Trophy,
  Maximize,
  Minimize,
  Sparkles,
  Play,
  Pause,
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
  Award,
  Layers,
  Camera,
  MessageSquare,
  Lightbulb,
  ThumbsUp,
  Share2,
  FileText,
  RotateCcw,
  Target,
  Clock,
  Compass,
  Zap,
  Rocket,
  Microscope,
  Info,
  Check,
  ShieldCheck,
  Download
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { Team, Question, Submission } from '../types/game';
import {
  masterTeamsPool,
  masterTaskPool,
  TeamTaskStats,
  isTaskActive,
  isCheckpointTask,
  getCheckpointMetadata,
  getAllTasks
} from '../data/masterTaskPool';
import { exportService } from '../services/exportService';

interface Props {
  lang: 'el' | 'en';
  submissions: Record<string, Submission>;
  taskOverrides: Record<string, boolean>;
  customQuestions?: Record<string, Question>;
  synthesisNotes: any[];
  onGoBack?: () => void;
  onSelectTeamMissions?: (teamIndex: number) => void;
}

// Curated authentic scientific Wow-Moments per Cyprus Vulture Group
interface WowMoment {
  title: string;
  title_en: string;
  badge: string;
  description: string;
  description_en: string;
  icon: string;
}

const GROUP_WOW_MOMENTS: Record<string, WowMoment[]> = {
  'team-alpha': [
    {
      title: 'Ο Μεγαλύτερος Πτερωτός Γίγαντας της Κύπρου',
      title_en: 'Cyprus’s Largest Flying Raptor',
      badge: '2.5m Άνοιγμα Πτερύγων',
      description: 'Με άνοιγμα φτερών 2.5 μέτρα και βάρος έως 11 κιλά, το Όρνιο (Gyps fulvus) κυριαρχεί στους κυπριακούς ουρανούς ως το επιβλητικότερο πουλί του νησιού.',
      description_en: 'Spanning an incredible 2.5 metres with a body mass up to 11 kg, Gyps fulvus reigns as the most majestic bird soaring over Cyprus.',
      icon: '🦅'
    },
    {
      title: 'Μονογαμία Ζωής & 1 Μόνο Αυγό Ετησίως',
      title_en: 'Lifelong Monogamy & 1 Annual Egg',
      badge: 'Αργή Βιολογία',
      description: 'Σχηματίζουν ισόβια ζευγάρια και γεννούν αυστηρά 1 αυγό τον χρόνο (Ιανουάριο-Φεβρουάριο), μοιράζοντας ισότιμα την επώαση για 52-58 ημέρες.',
      description_en: 'Mating strictly for life, pairs lay only one white egg annually in mid-winter and share incubation equally for 52-58 days.',
      icon: '🥚'
    },
    {
      title: 'Φυλετικός Μονομορφισμός',
      title_en: 'Sexual Monomorphism',
      badge: 'Ανάλυση DNA',
      description: 'Αρσενικά και θηλυκά είναι πανομοιότυπα εξωτερικά. Η ταυτοποίηση φύλου είναι εφικτή μόνο με γενετική ανάλυση DNA από πούπουλο ή αίμα.',
      description_en: 'Males and females are visually identical; determining gender requires molecular laboratory DNA sexing.',
      icon: '🧬'
    }
  ],
  'team-beta': [
    {
      title: 'Πτήση χωρίς Φτεροκόπημα στα Θερμικά Ρεύματα',
      title_en: 'Effortless Thermal Soaring',
      badge: 'Θερμικά Ρεύματα',
      description: 'Εκμεταλλεύονται τις στήλες ανερχόμενου ζεστού αέρα (θερμικά ρεύματα) για να αιωρούνται για ώρες σχεδόν χωρίς να κουνήσουν τα φτερά τους.',
      description_en: 'Vultures master thermal columns, spiraling upward and gliding effortlessly across mountain ranges without flapping wings.',
      icon: '⚡'
    },
    {
      title: 'Η Ιστορική Αποικία των Γκρεμών της Επισκοπής',
      title_en: 'Episkopi Coastal Cliffs Colony',
      badge: 'Φυσικό Καταφύγιο',
      description: 'Οι απόκρημνοι ασβεστολιθικοί παράκτιοι γκρεμοί της Επισκοπής παρέχουν απρόσιτες σχισμές για φωλιές, προστατευμένες από χερσαίους θηρευτές.',
      description_en: 'The limestone sea cliffs of Episkopi provide inaccessible caves and ledges, safeguarding vulture breeding pairs from ground threats.',
      icon: '🏞️'
    },
    {
      title: 'Καθημερινή Ακτίνα Περιπολίας 100+ Χιλιομέτρων',
      title_en: '100+ km Daily Foraging Range',
      badge: 'Ακτίνα 100km+',
      description: 'Μπορούν να διανύσουν πάνω από 100 χιλιόμετρα σε μία μέρα αναζητώντας τροφή από τις κοιλάδες της Πάφου έως τις πλαγιές του Τροόδους.',
      description_en: 'A single vulture routinely patrols over 100 kilometres per day searching for carcasses across western Cyprus and Troodos.',
      icon: '🧭'
    }
  ],
  'team-gamma': [
    {
      title: 'Αποκλειστικοί Πτωματοφάγοι - Όχι Αρπακτικά!',
      title_en: 'Obligate Scavengers - Not Predators',
      badge: 'Φυσικοί Καθαριστές',
      description: 'Δεν επιτίθενται ποτέ σε υγιή ζωντανά ζώα. Τρέφονται αποκλειστικά με κουφάρια, καθαρίζοντας άμεσα και υγιεινά την κυπριακή ύπαιθρο.',
      description_en: 'They never hunt live prey; as obligate scavengers, they consume exclusively carcasses, maintaining a disease-free countryside.',
      icon: '♻️'
    },
    {
      title: 'Υπερ-Όξινο Στομάχι (pH 1.0) Εξουδετερώνει Επιδημίες',
      title_en: 'Gastric Acid pH 1.0 Neutralizes Pathogens',
      badge: 'pH 1.0 Βακτήρια Off',
      description: 'Τα πανίσχυρα γαστρικά υγρά τους (pH 1.0) εξοντώνουν ακόμα και άνθρακα, αλλαντίαση και χολέρα, λειτουργώντας ως ασπίδα δημόσιας υγείας.',
      description_en: 'Their gastric acid (pH 1.0) destroys lethal pathogens including anthrax and botulism, acting as an irreplaceable public health shield.',
      icon: '🧪'
    },
    {
      title: 'Γυμνός Λαιμός & Ουροέφιδρωση για Υγιεινή',
      title_en: 'Bare Neck & Sanitary Adaptations',
      badge: 'Ανατομική Υπεροχή',
      description: 'Ο γυμνός λαιμός τους πλένεται εύκολα στον ήλιο και δεν κρατάει μικρόβια, ενώ αποβάλλουν ουρικό οξύ στα πόδια για απολύμανση.',
      description_en: 'The bare feathered neck prevents bacterial buildup inside carcasses, while urohidrosis sanitizes their talons on the ground.',
      icon: '🩺'
    }
  ],
  'team-delta': [
    {
      title: 'Η Θανάσιμη Απειλή των Παράνομων Φολών',
      title_en: 'The Lethal Threat of Illegal Poison Baits',
      badge: 'Νούμερο 1 Απειλή',
      description: 'Οι παράνομες φόλες (όπως carbofuran) ευθύνονται για το 90% των θανάτων γυπών. Ένα μόνο δηλητηριασμένο κουφάρι μπορεί να αφανίσει όλη την αποικία.',
      description_en: 'Poison baits cause 90% of vulture mortalities; a single poisoned carcass can annihilate an entire breeding colony.',
      icon: '☠️'
    },
    {
      title: 'Οι 4 Ταΐστρες («Εστιατόρια Γυπών»)',
      title_en: '4 Fenced Vulture Restaurants',
      badge: 'Ασφαλής Τροφή',
      description: 'Οι 4 περιφραγμένες ταΐστρες (Άγιος Ιωάννης, Μούσερε, Λιμνάτης, Επισκοπή) εξασφαλίζουν καθαρή τροφή χωρίς δηλητήρια και μόλυβδο.',
      description_en: 'Four secured feeding stations provide certified, poison-free, and lead-free meat under the LIFE with Vultures project.',
      icon: '🍖'
    },
    {
      title: 'Ομάδες Σκύλων K9 & Ενίσχυση από Ισπανία',
      title_en: 'K9 Anti-Poison Units & Spanish Vultures',
      badge: 'LIFE with Vultures',
      description: 'Ειδικά εκπαιδευμένοι σκύλοι K9 της Υπηρεσίας Θήρας εντοπίζουν δηλητήρια, ενώ Όρνια από την Ισπανία εμπλουτίζουν τον απειλούμενο κυπριακό πληθυσμό.',
      description_en: 'Specialized K9 anti-poison dog teams patrol terrain, while rehabilitated vultures from Spain replenish the Cyprus population.',
      icon: '🐕'
    }
  ]
};

// Educational vector SVG illustrations for poster badges
const GROUP_DEFAULT_ILLUSTRATIONS: Record<string, string> = {
  'team-alpha': "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 600 400' width='600' height='400'><rect width='600' height='400' fill='%230284c7'/><path d='M 130,120 C 50,70 -40,50 -50,90 C -10,135 80,145 120,135 Z' fill='%2392400e'/><path d='M 150,120 C 230,70 320,50 330,90 C 290,135 200,145 160,135 Z' fill='%2392400e'/><ellipse cx='140' cy='125' rx='22' ry='16' fill='%23b45309'/><circle cx='140' cy='105' r='10' fill='%23f8fafc'/><path d='M 138,100 Q 140,85 140,76' stroke='%23fed7aa' stroke-width='6' stroke-linecap='round'/><circle cx='140' cy='74' r='7' fill='%23fed7aa'/><polygon points='137,72 143,72 140,64' fill='%23e2e8f0'/><text x='40' y='360' font-family='sans-serif' font-weight='bold' font-size='22' fill='%23ffffff'>Gyps fulvus - Wingspan 2.5m (Ομάδα 1)</text></svg>",
  'team-beta': "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 600 400' width='600' height='400'><rect width='600' height='400' fill='%230891b2'/><path d='M 0,400 L 220,180 L 320,240 L 420,120 L 600,260 L 600,400 Z' fill='%2378716c'/><path d='M 280,150 Q 340,80 400,150 Q 340,110 280,150 Z' fill='%2344403c'/><circle cx='340' cy='115' r='6' fill='%23fef08a'/><path d='M 340,300 Q 330,220 350,160' stroke='%2338bdf8' stroke-width='4' stroke-dasharray='6,6' fill='none'/><text x='40' y='360' font-family='sans-serif' font-weight='bold' font-size='22' fill='%23ffffff'>Γκρεμοί Επισκοπής & Θερμικά Ρεύματα (Ομάδα 2)</text></svg>",
  'team-gamma': "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 600 400' width='600' height='400'><rect width='600' height='400' fill='%23d97706'/><circle cx='300' cy='200' r='140' fill='%2378350f'/><path d='M 230,240 Q 300,310 370,240 Q 300,260 230,240 Z' fill='%2310b981'/><text x='300' y='210' font-family='sans-serif' font-weight='900' font-size='44' fill='%23fef08a' text-anchor='middle'>pH 1.0</text><text x='300' y='245' font-family='sans-serif' font-weight='bold' font-size='16' fill='%23ffffff' text-anchor='middle'>Αποστείρωση Βακτηρίων & Υγιεινή</text><text x='40' y='360' font-family='sans-serif' font-weight='bold' font-size='22' fill='%23ffffff'>Βιολογία & Διατροφή Όρνιου (Ομάδα 3)</text></svg>",
  'team-delta': "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 600 400' width='600' height='400'><rect width='600' height='400' fill='%237c3aed'/><rect x='80' y='80' width='440' height='240' rx='24' fill='%234c1d95' stroke='%23a78bfa' stroke-width='4'/><text x='300' y='160' font-family='sans-serif' font-weight='900' font-size='36' fill='%23fbbf24' text-anchor='middle'>LIFE with Vultures</text><text x='300' y='210' font-family='sans-serif' font-weight='bold' font-size='20' fill='%23ffffff' text-anchor='middle'>4 Ταΐστρες • Ομάδες K9 • GPS</text><text x='40' y='360' font-family='sans-serif' font-weight='bold' font-size='22' fill='%23ffffff'>Προστασία & Δράσεις Διατήρησης (Ομάδα 4)</text></svg>"
};

export const TeamPresentationArena: React.FC<Props> = ({
  lang,
  submissions,
  taskOverrides,
  customQuestions = {},
  synthesisNotes,
  onGoBack,
  onSelectTeamMissions
}) => {
  const isEl = lang === 'el';

  // All tasks with custom question overrides
  const allPoolTasks = useMemo(() => getAllTasks(customQuestions), [customQuestions]);

  // Presentation Display Mode: 'spotlight' (Single team stage) vs 'grid' (All 4 posters)
  const [viewMode, setViewMode] = useState<'spotlight' | 'grid'>('spotlight');
  const [spotlightIndex, setSpotlightIndex] = useState<number>(0);
  const [isPlayingAuto, setIsPlayingAuto] = useState<boolean>(false);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [selectedInspectTask, setSelectedInspectTask] = useState<Question | null>(null);

  // Toggle browser fullscreen
  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
      setIsFullscreen(true);
    } else {
      document.exitFullscreen().catch(() => {});
      setIsFullscreen(false);
    }
  };

  // Auto-play slideshow timer (12 seconds per team)
  useEffect(() => {
    if (!isPlayingAuto) return;
    const interval = setInterval(() => {
      setSpotlightIndex((prev) => (prev + 1) % masterTeamsPool.length);
    }, 12000);
    return () => clearInterval(interval);
  }, [isPlayingAuto]);

  // Trigger celebration confetti for the presenting team
  const triggerTeamConfetti = (teamColor: string) => {
    confetti({
      particleCount: 80,
      spread: 70,
      origin: { y: 0.6 },
      colors: [teamColor, '#f59e0b', '#10b981', '#ffffff']
    });
  };

  // Compute stats and compile presentation data for each of the 4 teams
  const teamPosters = useMemo(() => {
    return masterTeamsPool.map((team, idx) => {
      // All designated questions for this team from Master Pool
      const teamQuestions = allPoolTasks.filter((q) => {
        if (!q.assignedTeamIds || q.assignedTeamIds.length === 0) return true;
        return q.assignedTeamIds.includes(team.id);
      });

      // Active questions considering current admin overrides
      const activeQuestions = teamQuestions.filter((q) => isTaskActive(q, taskOverrides));

      // Solved submissions
      const solvedTasks: { question: Question; submission: Submission }[] = [];
      let totalScore = 0;

      for (const q of activeQuestions) {
        const sub = submissions[`${team.id}_${q.id}`];
        if (sub && (sub.status === 'correct' || sub.status === 'completed')) {
          solvedTasks.push({ question: q, submission: sub });
          totalScore += sub.scoreEarned || q.points || 0;
        }
      }

      const progressPercent = activeQuestions.length > 0
        ? Math.round((solvedTasks.length / activeQuestions.length) * 100)
        : 0;

      // Extract real uploaded photo/video evidence from checkpoints or submissions
      const uploadedMedia: { url: string; type: 'photo' | 'video'; caption?: string; taskId: string }[] = [];
      for (const item of solvedTasks) {
        const data = item.submission.answerData;
        if (data) {
          if (data.photoUrl) {
            uploadedMedia.push({
              url: data.photoUrl,
              type: 'photo',
              caption: data.caption || item.question.title,
              taskId: item.question.id
            });
          } else if (data.videoUrl) {
            uploadedMedia.push({
              url: data.videoUrl,
              type: 'video',
              caption: data.caption || item.question.title,
              taskId: item.question.id
            });
          }
        }
      }

      // Checkpoints solved
      const solvedCheckpoints = solvedTasks.filter((item) => isCheckpointTask(item.question.id));

      // Team notes from Padlet
      const teamNotes = synthesisNotes.filter((n) => n.teamId === team.id);

      // Wow moments curated for this group
      const wowMoments = GROUP_WOW_MOMENTS[team.id] || GROUP_WOW_MOMENTS['team-alpha'];

      // Default visual asset
      const defaultIllustration = GROUP_DEFAULT_ILLUSTRATIONS[team.id] || GROUP_DEFAULT_ILLUSTRATIONS['team-alpha'];

      return {
        team,
        index: idx,
        totalQuestions: activeQuestions.length,
        solvedTasks,
        totalScore,
        progressPercent,
        uploadedMedia,
        solvedCheckpoints,
        teamNotes,
        wowMoments,
        defaultIllustration
      };
    });
  }, [submissions, taskOverrides, synthesisNotes]);

  const currentPoster = teamPosters[spotlightIndex] || teamPosters[0];

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* ===================== TOP ARENA CONTROL BAR ===================== */}
      <div className="p-4 sm:p-6 rounded-3xl bg-slate-900 border border-slate-800 shadow-2xl flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center justify-center text-2xl font-black shadow-lg shadow-amber-500/10">
            🏟️
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-black text-white">
                {isEl ? 'Αρένα Παρουσίασης & Ψηφιακά Posters Ομάδων' : 'Team Presentation Arena & Posters'}
              </h1>
              <span className="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40 text-[10px] font-extrabold uppercase">
                PROJECTOR READY
              </span>
            </div>
            <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
              {isEl
                ? 'Δυναμικά παραγόμενα πόστερ παρουσίασης για κάθε ομάδα με Wow Moments, τεκμήρια και επιτεύγματα'
                : 'Dynamically generated presentation posters for each team featuring Wow moments, evidence & milestones'}
            </p>
          </div>
        </div>

        {/* Presentation Controls */}
        <div className="flex items-center gap-2.5 flex-wrap">
          {/* View Mode Toggle: Spotlight vs 4-Poster Grid */}
          <div className="flex items-center bg-slate-950 p-1 rounded-xl border border-slate-800">
            <button
              type="button"
              onClick={() => setViewMode('spotlight')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                viewMode === 'spotlight'
                  ? 'bg-amber-500 text-slate-950 font-black shadow-xs'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Award className="w-3.5 h-3.5" />
              <span>{isEl ? 'Spotlight (1 Ομάδα)' : 'Spotlight (1 Team)'}</span>
            </button>
            <button
              type="button"
              onClick={() => setViewMode('grid')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                viewMode === 'grid'
                  ? 'bg-amber-500 text-slate-950 font-black shadow-xs'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>{isEl ? 'Πλέγμα 4 Posters' : '4-Poster Grid'}</span>
            </button>
          </div>

          {/* Auto-Play Slideshow Button */}
          {viewMode === 'spotlight' && (
            <button
              type="button"
              onClick={() => setIsPlayingAuto((prev) => !prev)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold border flex items-center gap-1.5 transition-all cursor-pointer ${
                isPlayingAuto
                  ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/50 ring-1 ring-emerald-400'
                  : 'bg-slate-800 hover:bg-slate-700 text-slate-300 border-slate-700'
              }`}
              title={isPlayingAuto ? 'Παύση αυτόματης εναλλαγής' : 'Αυτόματη εναλλαγή ανά 12 δευτερόλεπτα'}
            >
              {isPlayingAuto ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
              <span>{isPlayingAuto ? (isEl ? 'Αυτόματο ON' : 'Auto ON') : (isEl ? 'Αυτόματη Ροή' : 'Auto Play')}</span>
            </button>
          )}

          {/* Confetti Celebration Button */}
          <button
            type="button"
            onClick={() => triggerTeamConfetti(currentPoster.team.color)}
            className="px-3 py-1.5 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
            title="Εορτασμός Επιτευγμάτων"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>{isEl ? 'Εορτασμός!' : 'Celebrate!'}</span>
          </button>

          {/* Fullscreen Projector Toggle */}
          <button
            type="button"
            onClick={toggleFullscreen}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 transition-colors cursor-pointer"
            title={isFullscreen ? 'Έξοδος από πλήρη οθόνη' : 'Πλήρης οθόνη προβολέα'}
          >
            {isFullscreen ? <Minimize className="w-4 h-4" /> : <Maximize className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* ===================== VIEW 1: SPOTLIGHT PRESENTATION STAGE ===================== */}
      {viewMode === 'spotlight' && (
        <div className="space-y-4">
          {/* 4 Team Selector Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {teamPosters.map((poster, idx) => {
              const isSelected = idx === spotlightIndex;
              return (
                <button
                  key={poster.team.id}
                  type="button"
                  onClick={() => {
                    setSpotlightIndex(idx);
                    setIsPlayingAuto(false);
                  }}
                  style={{
                    borderColor: isSelected ? poster.team.color : 'transparent',
                    boxShadow: isSelected ? `0 0 20px ${poster.team.color}30` : 'none'
                  }}
                  className={`p-3.5 rounded-2xl border-2 text-left transition-all cursor-pointer flex items-center justify-between ${
                    isSelected
                      ? 'bg-slate-800 text-white font-black scale-102'
                      : 'bg-slate-900/80 hover:bg-slate-800/60 text-slate-400 hover:text-white'
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <span className="text-2xl shrink-0">{poster.team.avatar}</span>
                    <div className="min-w-0">
                      <div className="text-xs font-bold truncate">
                        {isEl ? `Ομάδα ${idx + 1}` : `Group ${idx + 1}`}
                      </div>
                      <div className="text-[11px] text-slate-400 truncate">
                        {poster.totalScore} pts • {poster.progressPercent}%
                      </div>
                    </div>
                  </div>
                  {isSelected && (
                    <span
                      style={{ backgroundColor: poster.team.color }}
                      className="w-2.5 h-2.5 rounded-full shrink-0"
                    />
                  )}
                </button>
              );
            })}
          </div>

          {/* Stepper Navigation Controls for Big Screen */}
          <div className="flex items-center justify-between text-xs text-slate-400 px-1">
            <button
              type="button"
              onClick={() => {
                setSpotlightIndex((prev) => (prev > 0 ? prev - 1 : teamPosters.length - 1));
                setIsPlayingAuto(false);
              }}
              className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold flex items-center gap-1.5 cursor-pointer transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
              <span>{isEl ? 'Προηγούμενη Ομάδα' : 'Previous Team'}</span>
            </button>

            <span className="font-semibold text-slate-300">
              {isEl
                ? `Παρουσίαση Ομάδας ${spotlightIndex + 1} από ${teamPosters.length}`
                : `Presenting Team ${spotlightIndex + 1} of ${teamPosters.length}`}
            </span>

            <button
              type="button"
              onClick={() => {
                setSpotlightIndex((prev) => (prev + 1) % teamPosters.length);
                setIsPlayingAuto(false);
              }}
              className="px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold flex items-center gap-1.5 cursor-pointer transition-colors shadow-md active:scale-95"
            >
              <span>{isEl ? 'Επόμενη Ομάδα' : 'Next Team'}</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          {/* Single Team Structured Digital Poster Card */}
          <DigitalTeamPosterCard
            poster={currentPoster}
            lang={lang}
            onInspectTask={(q) => setSelectedInspectTask(q)}
            onGoToMissions={() => onSelectTeamMissions && onSelectTeamMissions(currentPoster.index)}
          />
        </div>
      )}

      {/* ===================== VIEW 2: 4-POSTER CLASSROOM WALL GRID ===================== */}
      {viewMode === 'grid' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {teamPosters.map((poster) => (
            <DigitalTeamPosterCard
              key={poster.team.id}
              poster={poster}
              lang={lang}
              onInspectTask={(q) => setSelectedInspectTask(q)}
              onGoToMissions={() => onSelectTeamMissions && onSelectTeamMissions(poster.index)}
            />
          ))}
        </div>
      )}

      {/* ===================== TASK INSPECT MODAL ===================== */}
      {selectedInspectTask && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-xl w-full p-6 shadow-2xl space-y-4 animate-in fade-in zoom-in-95">
            <div className="flex items-start justify-between gap-3">
              <div>
                <span className="px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-400 border border-amber-500/30 text-xs font-bold">
                  +{selectedInspectTask.points} pts
                </span>
                <h3 className="text-lg font-bold text-white mt-1.5">
                  {isEl ? selectedInspectTask.title : selectedInspectTask.title_en || selectedInspectTask.title}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setSelectedInspectTask(null)}
                className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <p className="text-sm text-slate-300 leading-relaxed bg-slate-950 p-4 rounded-xl border border-slate-800">
              {isEl ? selectedInspectTask.description : selectedInspectTask.description_en || selectedInspectTask.description}
            </p>

            {selectedInspectTask.explanation && (
              <div className="p-4 rounded-xl bg-emerald-950/30 border border-emerald-500/40 text-xs text-slate-300 space-y-1">
                <span className="font-bold text-emerald-300 block">
                  {isEl ? 'Επιστημονική Τεκμηρίωση:' : 'Scientific Note:'}
                </span>
                <p className="leading-relaxed">
                  {isEl ? selectedInspectTask.explanation : selectedInspectTask.explanation_en || selectedInspectTask.explanation}
                </p>
              </div>
            )}

            <button
              type="button"
              onClick={() => setSelectedInspectTask(null)}
              className="w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold"
            >
              {isEl ? 'Κλείσιμο Προεπισκόπησης' : 'Close Preview'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

// ============================================================================
// COMPONENT: STRUCTURED DIGITAL TEAM POSTER CARD
// ============================================================================
interface PosterCardProps {
  poster: {
    team: Team;
    index: number;
    totalQuestions: number;
    solvedTasks: { question: Question; submission: Submission }[];
    totalScore: number;
    progressPercent: number;
    uploadedMedia: { url: string; type: 'photo' | 'video'; caption?: string; taskId: string }[];
    solvedCheckpoints: { question: Question; submission: Submission }[];
    teamNotes: any[];
    wowMoments: WowMoment[];
    defaultIllustration: string;
  };
  lang: 'el' | 'en';
  onInspectTask: (q: Question) => void;
  onGoToMissions: () => void;
}

const DigitalTeamPosterCard: React.FC<PosterCardProps> = ({
  poster,
  lang,
  onInspectTask,
  onGoToMissions
}) => {
  const isEl = lang === 'el';
  const { team, totalScore, progressPercent, solvedTasks, totalQuestions, wowMoments, uploadedMedia, teamNotes, defaultIllustration } = poster;

  return (
    <article
      style={{
        borderColor: `${team.color}60`,
        boxShadow: `0 10px 30px -10px ${team.color}25`
      }}
      className="p-6 rounded-3xl bg-slate-900 border-2 shadow-2xl space-y-6 flex flex-col justify-between overflow-hidden relative"
    >
      {/* Background Subtle Gradient Accent */}
      <div
        style={{
          background: `radial-gradient(circle at top right, ${team.color}15, transparent 70%)`
        }}
        className="absolute inset-0 pointer-events-none"
      />

      <div className="space-y-6 relative z-10">
        {/* POSTER BANNER / HEADER */}
        <div className="flex items-start justify-between gap-4 flex-wrap pb-4 border-b border-slate-800">
          <div className="flex items-center gap-4">
            <div
              style={{ backgroundColor: `${team.color}25`, borderColor: `${team.color}50` }}
              className="w-16 h-16 rounded-2xl flex items-center justify-center text-4xl border shadow-lg shrink-0"
            >
              {team.avatar}
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span
                  style={{ backgroundColor: `${team.color}20`, color: team.color }}
                  className="px-2.5 py-0.5 rounded-full text-xs font-black uppercase tracking-wider"
                >
                  {isEl ? `Ομάδα ${poster.index + 1}` : `Group ${poster.index + 1}`}
                </span>
                <span className="text-xs text-slate-400 font-semibold">
                  {solvedTasks.length} / {totalQuestions} {isEl ? 'Αποστολές' : 'Missions'}
                </span>
              </div>
              <h2 className="text-xl sm:text-2xl font-black text-white mt-1">
                {isEl ? team.name : team.name_en || team.name}
              </h2>
              <p className="text-xs text-slate-300 italic font-medium">
                "{isEl ? team.slogan : team.slogan_en || team.slogan}"
              </p>
            </div>
          </div>

          {/* Live Score Badge & Completion Ring */}
          <div className="flex items-center gap-3 shrink-0">
            <div className="text-right">
              <span className="text-[10px] uppercase font-bold text-slate-400 block">
                {isEl ? 'Συνολικό Σκορ' : 'Total Score'}
              </span>
              <span className="text-2xl sm:text-3xl font-black text-amber-400">
                {totalScore}
              </span>
              <span className="text-xs font-bold text-amber-400/80 ml-1">pts</span>
            </div>

            <div className="w-14 h-14 rounded-2xl bg-slate-950 border border-slate-800 flex flex-col items-center justify-center shrink-0">
              <span className="text-sm font-black text-white">{progressPercent}%</span>
              <span className="text-[9px] uppercase font-bold text-slate-500">
                {isEl ? 'Πρόοδος' : 'Progress'}
              </span>
            </div>
          </div>
        </div>

        {/* PROGRESS BAR */}
        <div className="space-y-1">
          <div className="flex items-center justify-between text-xs text-slate-300 font-semibold">
            <span>{isEl ? 'Επίπεδο Ολοκλήρωσης Έρευνας' : 'Research Completion'}</span>
            <span>{solvedTasks.length} / {totalQuestions} ({progressPercent}%)</span>
          </div>
          <div className="h-2.5 rounded-full bg-slate-950 overflow-hidden border border-slate-800">
            <div
              style={{ width: `${progressPercent}%`, backgroundColor: team.color }}
              className="h-full rounded-full transition-all duration-700 shadow-sm"
            />
          </div>
        </div>

        {/* SECTION 1: WOW MOMENT TAKEAWAYS */}
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Lightbulb className="w-4 h-4 text-amber-400" />
            <h3 className="text-sm font-extrabold text-white uppercase tracking-wider">
              {isEl ? 'Κορυφαία Επιστημονικά Συμπεράσματα (Wow Moments)' : 'Key Scientific Takeaways (Wow Moments)'}
            </h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {wowMoments.map((moment, mIdx) => (
              <div
                key={mIdx}
                className="p-3.5 rounded-2xl bg-slate-950/70 border border-slate-800 hover:border-slate-700 transition-all space-y-1.5 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between gap-1 mb-1">
                    <span className="text-xl">{moment.icon}</span>
                    <span className="px-2 py-0.5 rounded-md bg-amber-500/10 text-amber-300 border border-amber-500/30 text-[10px] font-bold">
                      {moment.badge}
                    </span>
                  </div>
                  <h4 className="text-xs font-bold text-white leading-snug">
                    {isEl ? moment.title : moment.title_en}
                  </h4>
                </div>
                <p className="text-[11px] text-slate-300 leading-relaxed">
                  {isEl ? moment.description : moment.description_en}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* SECTION 2: EVIDENCE & MEDIA SHOWCASE */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Camera className="w-4 h-4 text-emerald-400" />
              <h3 className="text-sm font-extrabold text-white uppercase tracking-wider">
                {isEl ? 'Τεκμήρια & Φωτογραφίες Πεδίου' : 'Field Evidence & Media'}
              </h3>
            </div>
            {uploadedMedia.length > 0 && (
              <span className="text-xs font-bold text-emerald-400 bg-emerald-950/50 px-2 py-0.5 rounded-full border border-emerald-500/30">
                ✓ {uploadedMedia.length} {isEl ? 'τεκμήρια καταγράφηκαν' : 'media logged'}
              </span>
            )}
          </div>

          <div className="rounded-2xl overflow-hidden border border-slate-800 bg-slate-950">
            {uploadedMedia.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3">
                {uploadedMedia.map((m, mIdx) => (
                  <div key={mIdx} className="rounded-xl overflow-hidden bg-slate-900 border border-slate-800 space-y-1.5">
                    {m.type === 'video' ? (
                      <video src={m.url} controls className="w-full h-36 object-cover bg-black" />
                    ) : (
                      <img src={m.url} alt="Evidence" className="w-full h-36 object-cover" />
                    )}
                    {m.caption && (
                      <p className="px-3 pb-2 text-[11px] text-slate-300 italic truncate">
                        "{m.caption}"
                      </p>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="relative group overflow-hidden">
                <img
                  src={defaultIllustration}
                  alt={team.name}
                  className="w-full h-44 object-contain bg-slate-950 p-2"
                />
                <div className="p-2.5 bg-slate-950/90 border-t border-slate-800 text-center">
                  <span className="text-[11px] text-slate-400 font-medium">
                    {isEl
                      ? 'Εκπαιδευτικό Επιστημονικό Διάγραμμα Ενότητας • Έτοιμο για προβολή'
                      : 'Scientific Topic Diagram • Ready for classroom presentation'}
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* SECTION 3: VERIFIED MISSIONS & PADLET VOICE */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Solved Tasks Snapshot */}
          <div className="space-y-2 p-3.5 rounded-2xl bg-slate-950/60 border border-slate-800">
            <div className="flex items-center justify-between text-xs font-bold">
              <span className="text-slate-300 flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                <span>{isEl ? 'Επιτυχείς Αποστολές' : 'Completed Missions'}</span>
              </span>
              <span className="text-amber-400">
                {solvedTasks.length} / {totalQuestions}
              </span>
            </div>

            <div className="space-y-1.5 max-h-36 overflow-y-auto pr-1">
              {solvedTasks.length === 0 ? (
                <p className="text-[11px] text-slate-500 italic py-2 text-center">
                  {isEl ? 'Δεν έχουν ολοκληρωθεί αποστολές ακόμα.' : 'No missions completed yet.'}
                </p>
              ) : (
                solvedTasks.slice(0, 5).map(({ question }) => (
                  <div
                    key={question.id}
                    onClick={() => onInspectTask(question)}
                    className="p-2 rounded-lg bg-slate-900 border border-slate-800/80 hover:border-slate-700 flex items-center justify-between text-[11px] cursor-pointer transition-colors"
                  >
                    <span className="truncate text-slate-200 font-medium">
                      ✓ {isEl ? question.title : question.title_en || question.title}
                    </span>
                    <span className="text-amber-400 font-bold shrink-0 ml-2">
                      +{question.points}p
                    </span>
                  </div>
                ))
              )}
              {solvedTasks.length > 5 && (
                <div className="text-[10px] text-slate-400 text-center pt-1 font-semibold">
                  {isEl ? `+ άλλες ${solvedTasks.length - 5} αποστολές` : `+ ${solvedTasks.length - 5} more missions`}
                </div>
              )}
            </div>
          </div>

          {/* Team Voice / Padlet Notes */}
          <div className="space-y-2 p-3.5 rounded-2xl bg-slate-950/60 border border-slate-800">
            <div className="flex items-center justify-between text-xs font-bold">
              <span className="text-slate-300 flex items-center gap-1.5">
                <MessageSquare className="w-3.5 h-3.5 text-cyan-400" />
                <span>{isEl ? 'Φωνή Ομάδας στο Padlet' : 'Team Padlet Notes'}</span>
              </span>
              <span className="text-cyan-400">{teamNotes.length}</span>
            </div>

            <div className="space-y-1.5 max-h-36 overflow-y-auto pr-1">
              {teamNotes.length === 0 ? (
                <p className="text-[11px] text-slate-500 italic py-2 text-center">
                  {isEl ? 'Καμία σημείωση Padlet ακόμα.' : 'No Padlet notes logged yet.'}
                </p>
              ) : (
                teamNotes.map((note) => (
                  <div
                    key={note.id}
                    className="p-2 rounded-lg bg-slate-900 border border-slate-800/80 space-y-1 text-[11px]"
                  >
                    <div className="flex items-center justify-between text-slate-400 text-[10px]">
                      <span className="font-semibold text-slate-200">{note.author}</span>
                      <span className="flex items-center gap-1 text-amber-400">
                        <ThumbsUp className="w-3 h-3" /> {note.likes || 0}
                      </span>
                    </div>
                    <p className="text-slate-300 font-medium line-clamp-2">
                      "{note.title}: {note.content}"
                    </p>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>

      {/* FOOTER ACTIONS */}
      <div className="pt-3 border-t border-slate-800 flex items-center justify-between gap-3 flex-wrap">
        <button
          type="button"
          onClick={onGoToMissions}
          className="text-xs font-bold text-slate-400 hover:text-white flex items-center gap-1 cursor-pointer transition-colors"
        >
          <span>{isEl ? '→ Προβολή Αποστολών Ομάδας' : '→ View Team Missions'}</span>
        </button>

        <span className="text-[10px] text-slate-500 uppercase tracking-widest font-mono">
          Cyprus Griffon Vulture • Projector Arena v4
        </span>
      </div>
    </article>
  );
};
