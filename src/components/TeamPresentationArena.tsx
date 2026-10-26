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
  RotateCcw,
  Upload,
  ZoomIn,
  X,
  ExternalLink,
  Flame,
  ShieldAlert,
  ShieldCheck,
  Compass,
  ArrowRight,
  BookOpen
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { Team, Question, Submission } from '../types/game';
import {
  masterTeamsPool,
  isTaskActive,
  isCheckpointTask,
  getAllTasks
} from '../data/masterTaskPool';
import { storageService } from '../services/storageService';
import { processLocalFile } from '../utils/fileUploadHelper';
import { extractScientificFact, ScientificFactRecord } from '../utils/scientificFactHelper';

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
  badge_en: string;
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
      badge_en: '2.5m Wingspan',
      description: 'Με άνοιγμα φτερών 2.5 μέτρα και βάρος έως 11 κιλά, το Όρνιο (Gyps fulvus) κυριαρχεί στους κυπριακούς ουρανούς ως το επιβλητικότερο πουλί του νησιού.',
      description_en: 'Spanning an incredible 2.5 metres with body mass up to 11 kg, Gyps fulvus reigns as the most majestic bird soaring over Cyprus.',
      icon: '🦅'
    },
    {
      title: 'Μονογαμία Ζωής & 1 Μόνο Αυγό Ετησίως',
      title_en: 'Lifelong Monogamy & 1 Annual Egg',
      badge: 'Αργή Βιολογία',
      badge_en: 'Slow Reproduction',
      description: 'Σχηματίζουν ισόβια ζευγάρια και γεννούν αυστηρά 1 αυγό τον χρόνο (Ιανουάριο-Φεβρουάριο), μοιράζοντας ισότιμα την επώαση για 52-58 ημέρες.',
      description_en: 'Mating strictly for life, pairs lay only one egg annually and share incubation equally for 52-58 days.',
      icon: '🥚'
    },
    {
      title: 'Φυλετικός Μονομορφισμός',
      title_en: 'Sexual Monomorphism',
      badge: 'Ανάλυση DNA',
      badge_en: 'DNA Sexing',
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
      badge_en: 'Thermal Currents',
      description: 'Εκμεταλλεύονται τις στήλες ανερχόμενου ζεστού αέρα (θερμικά) για να αιωρούνται για ώρες σχεδόν χωρίς να κουνήσουν τα φτερά τους.',
      description_en: 'Vultures ride thermal columns, gliding effortlessly across mountain ranges without flapping wings.',
      icon: '⚡'
    },
    {
      title: 'Η Ιστορική Αποικία των Γκρεμών της Επισκοπής',
      title_en: 'Episkopi Coastal Cliffs Colony',
      badge: 'Φυσικό Καταφύγιο',
      badge_en: 'Natural Sanctuary',
      description: 'Οι απόκρημνοι ασβεστολιθικοί παράκτιοι γκρεμοί της Επισκοπής παρέχουν απρόσιτες σχισμές για φωλιές, προστατευμένες από χερσαίους θηρευτές.',
      description_en: 'The limestone sea cliffs of Episkopi provide inaccessible caves and ledges, safeguarding vulture breeding pairs.',
      icon: '🏞️'
    },
    {
      title: 'Καθημερινή Ακτίνα Περιπολίας 100+ Χιλιομέτρων',
      title_en: '100+ km Daily Foraging Range',
      badge: 'Ακτίνα 100km+',
      badge_en: '100km+ Range',
      description: 'Μπορούν να διανύσουν πάνω από 100 χιλιόμετρα σε μία μέρα αναζητώντας τροφή από τις κοιλάδες της Πάφου έως τις πλαγιές του Τροόδους.',
      description_en: 'A single vulture routinely patrols over 100 kilometres per day searching for carcasses across western Cyprus.',
      icon: '🧭'
    }
  ],
  'team-gamma': [
    {
      title: 'Αποκλειστικοί Πτωματοφάγοι - Όχι Αρπακτικά!',
      title_en: 'Obligate Scavengers - Not Predators',
      badge: 'Φυσικοί Καθαριστές',
      badge_en: 'Natural Cleaners',
      description: 'Δεν επιτίθενται ποτέ σε υγιή ζωντανά ζώα. Τρέφονται αποκλειστικά με κουφάρια, καθαρίζοντας άμεσα και υγιεινά την κυπριακή ύπαιθρο.',
      description_en: 'They never hunt live animals; as obligate scavengers, they consume exclusively carcasses, maintaining a disease-free countryside.',
      icon: '♻️'
    },
    {
      title: 'Υπερ-Όξινο Στομάχι (pH 1.0) Εξουδετερώνει Επιδημίες',
      title_en: 'Gastric Acid pH 1.0 Neutralizes Pathogens',
      badge: 'pH 1.0 Ασπίδα',
      badge_en: 'pH 1.0 Shield',
      description: 'Τα πανίσχυρα γαστρικά υγρά τους (pH 1.0) εξοντώνουν ακόμα και άνθρακα, αλλαντίαση και χολέρα, λειτουργώντας ως ασπίδα δημόσιας υγείας.',
      description_en: 'Their gastric acid (pH 1.0) destroys lethal pathogens including anthrax and botulism, acting as an irreplaceable health shield.',
      icon: '🧪'
    },
    {
      title: 'Γυμνός Λαιμός & Ουροέφιδρωση για Υγιεινή',
      title_en: 'Bare Neck & Sanitary Adaptations',
      badge: 'Ανατομική Υπεροχή',
      badge_en: 'Sanitary Biology',
      description: 'Ο γυμνός λαιμός τους πλένεται εύκολα στον ήλιο και δεν κρατάει μικρόβια, ενώ αποβάλλουν ουρικό οξύ στα πόδια για απολύμανση.',
      description_en: 'The bare feathered neck prevents bacterial buildup, while urohidrosis sanitizes their talons on the ground.',
      icon: '🩺'
    }
  ],
  'team-delta': [
    {
      title: 'Η Θανάσιμη Απειλή των Παράνομων Φολών',
      title_en: 'The Lethal Threat of Illegal Poison Baits',
      badge: 'Νούμερο 1 Απειλή',
      badge_en: '#1 Extinction Threat',
      description: 'Οι παράνομες φόλες (όπως carbofuran) ευθύνονται για το 90% των θανάτων γυπών. Ένα μόνο δηλητηριασμένο κουφάρι μπορεί να αφανίσει όλη την αποικία.',
      description_en: 'Poison baits cause 90% of vulture mortalities; a single poisoned carcass can annihilate an entire breeding colony.',
      icon: '☠️'
    },
    {
      title: 'Οι 4 Ταΐστρες («Εστιατόρια Γυπών»)',
      title_en: '4 Fenced Vulture Restaurants',
      badge: 'Ασφαλής Τροφή',
      badge_en: 'Safe Feeding Sites',
      description: 'Οι 4 περιφραγμένες ταΐστρες (Άγιος Ιωάννης, Μούσερε, Λιμνάτης, Επισκοπή) εξασφαλίζουν καθαρή τροφή χωρίς δηλητήρια και μόλυβδο.',
      description_en: 'Four secured feeding stations provide certified, poison-free, and lead-free meat under the LIFE with Vultures project.',
      icon: '🍖'
    },
    {
      title: 'Ομάδες Σκύλων K9 & Ενίσχυση από Ισπανία',
      title_en: 'K9 Anti-Poison Units & Spanish Vultures',
      badge: 'LIFE with Vultures',
      badge_en: 'Active Conservation',
      description: 'Ειδικά εκπαιδευμένοι σκύλοι K9 της Υπηρεσίας Θήρας εντοπίζουν δηλητήρια, ενώ Όρνια από την Ισπανία εμπλουτίζουν τον απειλούμενο πληθυσμό.',
      description_en: 'Specialized K9 anti-poison dog teams patrol terrain, while rehabilitated vultures from Spain replenish the Cyprus population.',
      icon: '🐕'
    }
  ]
};

// Striking Metric Callouts for Science Poster Display
interface InfographicMetric {
  value: string;
  unit: string;
  unit_en: string;
  label: string;
  label_en: string;
  subtext: string;
  subtext_en: string;
  icon: string;
}

const GROUP_INFOGRAPHIC_METRICS: Record<string, InfographicMetric[]> = {
  'team-alpha': [
    {
      value: '2.5',
      unit: 'm',
      unit_en: 'm',
      label: 'Άνοιγμα Πτερύγων',
      label_en: 'Wingspan',
      subtext: 'Το μεγαλύτερο πτηνό στην Κύπρο',
      subtext_en: 'Largest flying raptor in Cyprus',
      icon: '🦅'
    },
    {
      value: '7 - 11',
      unit: 'kg',
      unit_en: 'kg',
      label: 'Βάρος Σώματος',
      label_en: 'Body Mass',
      subtext: 'Βαρύς αεροδυναμικός ανεμοπόρος',
      subtext_en: 'Heavy aerodynamic glider',
      icon: '⚖️'
    },
    {
      value: '1',
      unit: 'Αυγό / έτος',
      unit_en: 'Egg / year',
      label: 'Ετήσια Γέννα',
      label_en: 'Annual Clutch',
      subtext: '54 ημέρες ισότιμης επώασης',
      subtext_en: '54 days shared incubation',
      icon: '🥚'
    }
  ],
  'team-beta': [
    {
      value: '100+',
      unit: 'km',
      unit_en: 'km',
      label: 'Ακτίνα Περιπολίας',
      label_en: 'Daily Range',
      subtext: 'Από Επισκοπή έως Τρόοδος',
      subtext_en: 'From Episkopi to Troodos',
      icon: '🧭'
    },
    {
      value: '70',
      unit: 'km/h',
      unit_en: 'km/h',
      label: 'Ταχύτητα Ολίσθησης',
      label_en: 'Gliding Speed',
      subtext: 'Εκμετάλλευση θερμικών ανοδικών',
      subtext_en: 'Riding thermal updrafts',
      icon: '💨'
    },
    {
      value: '150',
      unit: 'm',
      unit_en: 'm',
      label: 'Ύψος Γκρεμών',
      label_en: 'Cliffs Height',
      subtext: 'Απρόσιτες φωλιές στην Επισκοπή',
      subtext_en: 'Inaccessible Episkopi ledges',
      icon: '🏔️'
    }
  ],
  'team-gamma': [
    {
      value: 'pH 1.0',
      unit: 'οξύτητα',
      unit_en: 'acidity',
      label: 'Γαστρικό Υγρό',
      label_en: 'Gastric Acidity',
      subtext: 'Εξουδετερώνει άνθρακα & αλλαντίαση',
      subtext_en: 'Destroys anthrax & botulism',
      icon: '🧪'
    },
    {
      value: '100%',
      unit: 'δίαιτα',
      unit_en: 'diet',
      label: 'Πτωματοφάγοι',
      label_en: 'Scavengers',
      subtext: 'Αποκλειστικοί καθαριστές φύσης',
      subtext_en: 'Sanitary ecosystem guardians',
      icon: '♻️'
    },
    {
      value: '0%',
      unit: 'κίνδυνος',
      unit_en: 'threat',
      label: 'Επίθεση σε Ζώα',
      label_en: 'Live Hunting',
      subtext: 'Απολύτως ακίνδυνοι για κοπάδια',
      subtext_en: 'Harmless to healthy livestock',
      icon: '🛡️'
    }
  ],
  'team-delta': [
    {
      value: '90%',
      unit: 'απώλειες',
      unit_en: 'mortality',
      label: 'Θάνατοι από Φόλες',
      label_en: 'Poison Mortality',
      subtext: 'Η #1 θανάσιμη απειλή εξαφάνισης',
      subtext_en: '#1 extinction threat in Cyprus',
      icon: '☠️'
    },
    {
      value: '4',
      unit: 'σταθμοί',
      unit_en: 'sites',
      label: 'Ασφαλείς Ταΐστρες',
      label_en: 'Feeding Stations',
      subtext: 'Περιφραγμένα «εστιατόρια γυπών»',
      subtext_en: 'Poison-free fenced sites',
      icon: '🥩'
    },
    {
      value: '2',
      unit: 'ομάδες',
      unit_en: 'teams',
      label: 'Σκύλοι K9',
      label_en: 'K9 Dog Units',
      subtext: 'Ανίχνευση δηλητηριασμένων δολωμάτων',
      subtext_en: 'Poison detection patrols',
      icon: '🐕'
    }
  ]
};

// High-resolution vector diagrams for each theme
const GROUP_DEFAULT_ILLUSTRATIONS: Record<string, string> = {
  'team-alpha': "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 1000 550' width='1000' height='550'><rect width='1000' height='550' fill='%230f172a'/><circle cx='500' cy='275' r='230' fill='%23064e3b' opacity='0.3'/><path d='M 120,240 C 260,140 430,190 500,240 C 570,190 740,140 880,240 C 760,330 590,300 500,350 C 410,300 240,330 120,240 Z' fill='%23b45309'/><path d='M 200,240 Q 500,160 800,240' stroke='%23f59e0b' stroke-width='6' fill='none'/><circle cx='500' cy='220' r='26' fill='%23fef3c7'/><path d='M 495,200 L 505,200 L 500,175 Z' fill='%23e2e8f0'/><text x='500' y='460' font-family='sans-serif' font-weight='900' font-size='32' fill='%2334d399' text-anchor='middle'>Gyps fulvus • Άνοιγμα Πτερύγων 2.5 Μέτρα</text><text x='500' y='500' font-family='sans-serif' font-weight='600' font-size='18' fill='%2394a3b8' text-anchor='middle'>Βιομετρικό Διάγραμμα Μορφολογίας & Ταυτότητας Είδους</text></svg>",
  'team-beta': "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 1000 550' width='1000' height='550'><rect width='1000' height='550' fill='%230f172a'/><circle cx='500' cy='275' r='230' fill='%230e7490' opacity='0.3'/><path d='M 0,550 L 320,260 L 480,340 L 640,180 L 1000,420 L 1000,550 Z' fill='%23334155'/><path d='M 420,440 Q 500,260 520,120' stroke='%2338bdf8' stroke-width='6' stroke-dasharray='10,8' fill='none'/><circle cx='520' cy='120' r='10' fill='%2338bdf8'/><path d='M 460,140 Q 520,70 580,140 Q 520,105 460,140 Z' fill='%23f8fafc'/><text x='500' y='460' font-family='sans-serif' font-weight='900' font-size='32' fill='%2338bdf8' text-anchor='middle'>Γκρεμοί Επισκοπής & Θερμικά Ρεύματα</text><text x='500' y='500' font-family='sans-serif' font-weight='600' font-size='18' fill='%2394a3b8' text-anchor='middle'>Αεροδυναμική Ανεμοπορία Χωρίς Φτεροκόπημα • Ακτίνα 100+ km</text></svg>",
  'team-gamma': "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 1000 550' width='1000' height='550'><rect width='1000' height='550' fill='%230f172a'/><circle cx='500' cy='240' r='160' fill='%2378350f' opacity='0.4'/><circle cx='500' cy='240' r='120' fill='%23b45309'/><text x='500' y='245' font-family='sans-serif' font-weight='900' font-size='72' fill='%23fef08a' text-anchor='middle'>pH 1.0</text><text x='500' y='285' font-family='sans-serif' font-weight='bold' font-size='22' fill='%23ffffff' text-anchor='middle'>Υπερ-Όξινο Γαστρικό Υγρό</text><text x='500' y='460' font-family='sans-serif' font-weight='900' font-size='32' fill='%23fbbf24' text-anchor='middle'>Αποκλειστικοί Καθαριστές • Ασπίδα Δημόσιας Υγείας</text><text x='500' y='500' font-family='sans-serif' font-weight='600' font-size='18' fill='%2394a3b8' text-anchor='middle'>Εξουδετέρωση Άνθρακα & Βακτηρίων • 0% Επίθεση σε Ζωντανά</text></svg>",
  'team-delta': "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 1000 550' width='1000' height='550'><rect width='1000' height='550' fill='%230f172a'/><rect x='150' y='100' width='700' height='260' rx='32' fill='%233b0764' stroke='%23a855f7' stroke-width='4'/><text x='500' y='190' font-family='sans-serif' font-weight='900' font-size='48' fill='%23fbbf24' text-anchor='middle'>LIFE with Vultures Cyprus</text><text x='500' y='250' font-family='sans-serif' font-weight='bold' font-size='24' fill='%23e2e8f0' text-anchor='middle'>4 Ασφαλείς Ταΐστρες • Ομάδες K9 • Ενίσχυση από Ισπανία</text><text x='500' y='305' font-family='sans-serif' font-weight='bold' font-size='20' fill='%23c084fc' text-anchor='middle'>Καταπολέμηση Δηλητηριασμένων Δολωμάτων (Φόλες)</text><text x='500' y='460' font-family='sans-serif' font-weight='900' font-size='32' fill='%23c084fc' text-anchor='middle'>Προστασία & Δράσεις Διατήρησης</text><text x='500' y='500' font-family='sans-serif' font-weight='600' font-size='18' fill='%2394a3b8' text-anchor='middle'>GPS Πομποί Παρακολούθησης & Σύμφωνο Συνεργασίας Κοινοτήτων</text></svg>"
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
  const allPoolTasks = useMemo(() => getAllTasks(customQuestions), [customQuestions]);

  // Display Mode: 'spotlight' vs 'grid'
  const [viewMode, setViewMode] = useState<'spotlight' | 'grid'>('spotlight');
  const [spotlightIndex, setSpotlightIndex] = useState<number>(0);
  const [isPlayingAuto, setIsPlayingAuto] = useState<boolean>(false);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [selectedInspectTask, setSelectedInspectTask] = useState<Question | null>(null);
  const [lightboxMedia, setLightboxMedia] = useState<{ url: string; title: string; caption?: string } | null>(null);

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

  // Auto-play slideshow (12 seconds per team)
  useEffect(() => {
    if (!isPlayingAuto) return;
    const interval = setInterval(() => {
      setSpotlightIndex((prev) => (prev + 1) % masterTeamsPool.length);
    }, 12000);
    return () => clearInterval(interval);
  }, [isPlayingAuto]);

  // Trigger celebration confetti
  const triggerTeamConfetti = (teamColor: string) => {
    confetti({
      particleCount: 100,
      spread: 80,
      origin: { y: 0.6 },
      colors: [teamColor, '#f59e0b', '#10b981', '#ffffff']
    });
  };

  // Direct Field Media Upload Handler for Centerpiece
  const handleDirectUpload = async (teamId: string, file: File) => {
    try {
      const res = await processLocalFile(file, 1000, 0.85);
      const sub: Submission = {
        id: `field-evidence-${Date.now()}`,
        teamId,
        questionId: `${teamId}-field-photo`,
        submittedAt: Date.now(),
        status: 'correct',
        scoreEarned: 100,
        answerData: {
          photoUrl: res.type === 'image' ? res.url : undefined,
          videoUrl: res.type === 'video' ? res.url : undefined,
          caption: res.name || (lang === 'el' ? 'Καταγραφή πεδίου ομάδας' : 'Field team observation'),
          mediaMetadata: {
            name: res.name,
            size: res.size,
            type: file.type,
            thumbnail: res.thumbnail
          }
        }
      };
      storageService.saveSubmission(sub);
      window.dispatchEvent(new CustomEvent('boundpad:submissions', { detail: { submission: sub } }));
      triggerTeamConfetti('#10b981');
    } catch (err) {
      console.error('Direct upload failed:', err);
    }
  };

  // Compute stats and compile presentation data for each of the 4 teams
  const teamPosters = useMemo(() => {
    return masterTeamsPool.map((team, idx) => {
      const teamQuestions = allPoolTasks.filter((q) => {
        if (!q.assignedTeamIds || q.assignedTeamIds.length === 0) return true;
        return q.assignedTeamIds.includes(team.id);
      });

      const activeQuestions = teamQuestions.filter((q) => isTaskActive(q, taskOverrides));
      const solvedTasks: { question: Question; submission: Submission }[] = [];
      const attemptedTasks: { question: Question; submission: Submission; isCorrect: boolean }[] = [];
      const recordedFacts: ScientificFactRecord[] = [];
      let totalScore = 0;
      let mistakesLearnedCount = 0;

      for (const q of activeQuestions) {
        const sub = submissions[`${team.id}_${q.id}`];
        if (sub) {
          const isCorrect = sub.status === 'correct' || sub.status === 'completed';
          if (isCorrect) {
            solvedTasks.push({ question: q, submission: sub });
            totalScore += sub.scoreEarned || q.points || 0;
          } else {
            mistakesLearnedCount += 1;
          }
          attemptedTasks.push({ question: q, submission: sub, isCorrect });

          const fact: ScientificFactRecord = sub.scientificFact || extractScientificFact(q, team.id, isCorrect, sub.answerData);
          recordedFacts.push(fact);
        }
      }

      // Ensure every active question has its authoritative scientific fact available for the poster
      const allTeamBaselineFacts: ScientificFactRecord[] = activeQuestions.map((q) => {
        const existing = recordedFacts.find((f) => f.taskId === q.id);
        if (existing) return existing;
        return extractScientificFact(q, team.id, true);
      });

      const progressPercent = activeQuestions.length > 0
        ? Math.round((solvedTasks.length / activeQuestions.length) * 100)
        : 0;

      // Extract uploaded field photos / video evidence
      const uploadedMedia: { url: string; type: 'photo' | 'video'; caption?: string; taskId: string }[] = [];
      for (const item of attemptedTasks) {
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
        if (item.submission.photoUrl && !uploadedMedia.some((m) => m.url === item.submission.photoUrl)) {
          uploadedMedia.push({
            url: item.submission.photoUrl,
            type: 'photo',
            caption: item.question.title,
            taskId: item.question.id
          });
        }
      }

      const solvedCheckpoints = solvedTasks.filter((item) => isCheckpointTask(item.question.id));
      const teamNotes = synthesisNotes.filter((n) => n.teamId === team.id);
      const wowMoments = GROUP_WOW_MOMENTS[team.id] || GROUP_WOW_MOMENTS['team-alpha'];
      const metrics = GROUP_INFOGRAPHIC_METRICS[team.id] || GROUP_INFOGRAPHIC_METRICS['team-alpha'];
      const defaultIllustration = GROUP_DEFAULT_ILLUSTRATIONS[team.id] || GROUP_DEFAULT_ILLUSTRATIONS['team-alpha'];

      return {
        team,
        index: idx,
        totalQuestions: activeQuestions.length,
        solvedTasks,
        attemptedTasks,
        recordedFacts,
        allTeamBaselineFacts,
        mistakesLearnedCount,
        totalScore,
        progressPercent,
        uploadedMedia,
        solvedCheckpoints,
        teamNotes,
        wowMoments,
        metrics,
        defaultIllustration
      };
    });
  }, [submissions, taskOverrides, synthesisNotes, allPoolTasks]);

  const currentPoster = teamPosters[spotlightIndex] || teamPosters[0];

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* ===================== ARENA CONTROL BAR ===================== */}
      <div className="p-4 sm:p-5 rounded-3xl bg-slate-900 border border-slate-800 shadow-2xl flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-500/20 to-emerald-500/20 text-amber-400 border border-amber-500/30 flex items-center justify-center text-2xl font-black shadow-lg shadow-amber-500/10">
            🏛️
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                {isEl ? 'Αρένα Παρουσίασης & Ψηφιακά Infographic Posters' : 'Team Presentation Arena & Infographic Posters'}
              </h1>
              <span className="px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40 text-[10px] font-black uppercase tracking-wider">
                PROJECTOR EXHIBIT READY
              </span>
            </div>
            <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
              {isEl
                ? 'Επιστημονικά ψηφιακά πόστερ έκθεσης: Μεγάλα αριθμητικά στατιστικά, κεντρικό έκθεμα και punchy Wow Moments'
                : 'Scientific museum exhibit posters: Large metric callouts, central evidence hero, and punchy Wow Moments'}
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2.5 flex-wrap">
          {/* View Mode Toggle */}
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
              <span>{isEl ? 'Spotlight (1 Πόστερ)' : 'Spotlight (1 Poster)'}</span>
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
              <span>{isEl ? 'Πλέγμα 4 Posters' : '4-Poster Gallery'}</span>
            </button>
          </div>

          {/* Auto-Play Slideshow */}
          {viewMode === 'spotlight' && (
            <button
              type="button"
              onClick={() => setIsPlayingAuto((prev) => !prev)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold border flex items-center gap-1.5 transition-all cursor-pointer ${
                isPlayingAuto
                  ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/50 ring-1 ring-emerald-400'
                  : 'bg-slate-800 hover:bg-slate-700 text-slate-300 border-slate-700'
              }`}
              title={isPlayingAuto ? 'Παύση αυτόματης ροής' : 'Αυτόματη εναλλαγή ανά 12s'}
            >
              {isPlayingAuto ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
              <span>{isPlayingAuto ? (isEl ? 'Αυτόματο ON' : 'Auto ON') : (isEl ? 'Αυτόματη Ροή' : 'Auto Play')}</span>
            </button>
          )}

          {/* Celebration Confetti */}
          <button
            type="button"
            onClick={() => triggerTeamConfetti(currentPoster.team.color)}
            className="px-3 py-1.5 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
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

      {/* ===================== VIEW 1: SPOTLIGHT DISPLAY ===================== */}
      {viewMode === 'spotlight' && (
        <div className="space-y-4">
          {/* Team Quick Selector Bar */}
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
                    boxShadow: isSelected ? `0 0 25px ${poster.team.color}35` : 'none'
                  }}
                  className={`p-3.5 rounded-2xl border-2 text-left transition-all cursor-pointer flex items-center justify-between ${
                    isSelected
                      ? 'bg-slate-800 text-white font-black scale-102 ring-1 ring-white/20'
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
                      className="w-3 h-3 rounded-full shrink-0 animate-pulse"
                    />
                  )}
                </button>
              );
            })}
          </div>

          {/* Stepper controls */}
          <div className="flex items-center justify-between text-xs text-slate-400 px-1">
            <button
              type="button"
              onClick={() => {
                setSpotlightIndex((prev) => (prev > 0 ? prev - 1 : teamPosters.length - 1));
                setIsPlayingAuto(false);
              }}
              className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold flex items-center gap-1.5 cursor-pointer transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
              <span>{isEl ? 'Προηγούμενη Ομάδα' : 'Previous Team'}</span>
            </button>

            <span className="font-semibold text-slate-300">
              {isEl
                ? `Παρουσίαση Έκθεσης: Ομάδα ${spotlightIndex + 1} από ${teamPosters.length}`
                : `Exhibition Stage: Team ${spotlightIndex + 1} of ${teamPosters.length}`}
            </span>

            <button
              type="button"
              onClick={() => {
                setSpotlightIndex((prev) => (prev + 1) % teamPosters.length);
                setIsPlayingAuto(false);
              }}
              className="px-3.5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black flex items-center gap-1.5 cursor-pointer transition-colors shadow-md active:scale-95"
            >
              <span>{isEl ? 'Επόμενη Ομάδα' : 'Next Team'}</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          {/* Upgraded High-Impact Infographic Poster Card */}
          <VisualInfographicPoster
            poster={currentPoster}
            lang={lang}
            onInspectTask={(q) => setSelectedInspectTask(q)}
            onOpenLightbox={(media) => setLightboxMedia(media)}
            onGoToMissions={() => onSelectTeamMissions && onSelectTeamMissions(currentPoster.index)}
            onDirectUpload={(file) => handleDirectUpload(currentPoster.team.id, file)}
          />
        </div>
      )}

      {/* ===================== VIEW 2: 4-POSTER GALLERY ===================== */}
      {viewMode === 'grid' && (
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
          {teamPosters.map((poster) => (
            <VisualInfographicPoster
              key={poster.team.id}
              poster={poster}
              lang={lang}
              onInspectTask={(q) => setSelectedInspectTask(q)}
              onOpenLightbox={(media) => setLightboxMedia(media)}
              onGoToMissions={() => onSelectTeamMissions && onSelectTeamMissions(poster.index)}
              onDirectUpload={(file) => handleDirectUpload(poster.team.id, file)}
            />
          ))}
        </div>
      )}

      {/* ===================== PROJECTOR LIGHTBOX MODAL ===================== */}
      {lightboxMedia && (
        <div
          className="fixed inset-0 z-50 bg-black/95 backdrop-blur-md flex flex-col items-center justify-center p-4 sm:p-8 animate-in fade-in"
          onClick={() => setLightboxMedia(null)}
        >
          <div
            className="relative max-w-5xl w-full bg-slate-950 border border-slate-800 rounded-3xl overflow-hidden shadow-2xl space-y-3"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between p-4 border-b border-slate-800 bg-slate-900/90">
              <div className="flex items-center gap-2">
                <Camera className="w-5 h-5 text-amber-400" />
                <h3 className="font-bold text-base text-white">{lightboxMedia.title}</h3>
              </div>
              <button
                type="button"
                onClick={() => setLightboxMedia(null)}
                className="p-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-4 flex items-center justify-center bg-black/60 max-h-[75vh] overflow-hidden">
              <img
                src={lightboxMedia.url}
                alt={lightboxMedia.title}
                className="max-h-[70vh] w-auto max-w-full object-contain rounded-xl shadow-2xl"
              />
            </div>

            {lightboxMedia.caption && (
              <div className="p-4 bg-slate-900/80 border-t border-slate-800 text-center">
                <p className="text-sm text-slate-200 font-medium italic">
                  "{lightboxMedia.caption}"
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ===================== TASK INSPECT MODAL ===================== */}
      {selectedInspectTask && (() => {
        const inspectFact = extractScientificFact(selectedInspectTask, currentPoster.team.id, true);
        const sub = submissions[`${currentPoster.team.id}_${selectedInspectTask.id}`];
        const isMistakeLearned = sub && sub.status === 'incorrect';

        return (
          <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-xl w-full p-6 shadow-2xl space-y-4 animate-in fade-in zoom-in-95">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-400 border border-amber-500/30 text-xs font-bold">
                      +{selectedInspectTask.points} pts
                    </span>
                    {isMistakeLearned ? (
                      <span className="px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40 text-xs font-black">
                        💡 {isEl ? 'Ευκαιρία Μάθησης' : 'Learning Opportunity'}
                      </span>
                    ) : (
                      <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-xs font-bold">
                        ✓ {isEl ? 'Κατοχυρωμένο Γεγονός' : 'Logged Science Fact'}
                      </span>
                    )}
                  </div>
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

              {/* Official Scientific Correct Fact Highlight */}
              <div className="p-4 rounded-xl bg-emerald-950/40 border border-emerald-500/40 space-y-1">
                <span className="text-[11px] font-black uppercase text-emerald-400 block tracking-wider">
                  {isEl ? '✓ Ορθή Επιστημονική Αλήθεια:' : '✓ Official Scientific Truth:'}
                </span>
                <p className="font-bold text-white text-sm">
                  {isEl ? inspectFact.correctAnswerText : inspectFact.correctAnswerText_en}
                </p>
              </div>

              {inspectFact.explanation && (
                <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-300 space-y-1">
                  <span className="font-bold text-amber-300 block">
                    {isEl ? 'Επιστημονική Τεκμηρίωση:' : 'Scientific Documentation:'}
                  </span>
                  <p className="leading-relaxed">
                    {isEl ? inspectFact.explanation : inspectFact.explanation_en}
                  </p>
                </div>
              )}

              {inspectFact.keyTakeaway && (
                <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center gap-2 text-amber-300 text-xs font-semibold">
                  <span>🎯</span>
                  <span>{isEl ? 'Βασικό Συμπέρασμα για το Πόστερ: ' : 'Key Takeaway for Poster: '}</span>
                  <span className="text-white font-bold">{isEl ? inspectFact.keyTakeaway : inspectFact.keyTakeaway_en}</span>
                </div>
              )}

              <div className="p-2.5 rounded-xl bg-slate-950/60 border border-slate-800 text-[11px] text-slate-400 flex items-center gap-1.5">
                <span>📌</span>
                <span>
                  {isEl
                    ? 'Μόνιμη καταγραφή: Το επιστημονικό αυτό γεγονός παρουσιάζεται στο ψηφιακό πόστερ της ομάδας.'
                    : 'Permanent record: This scientific fact is featured in the team digital poster.'}
                </span>
              </div>

              <button
                type="button"
                onClick={() => setSelectedInspectTask(null)}
                className="w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold cursor-pointer"
              >
                {isEl ? 'Κλείσιμο Προεπισκόπησης' : 'Close Preview'}
              </button>
            </div>
          </div>
        );
      })()}
    </div>
  );
};

// ============================================================================
// COMPONENT: VISUAL INFOGRAPHIC POSTER (Digital Science / Museum Exhibit Panel)
// ============================================================================
interface PosterProps {
  poster: {
    team: Team;
    index: number;
    totalQuestions: number;
    solvedTasks: { question: Question; submission: Submission }[];
    attemptedTasks: { question: Question; submission: Submission; isCorrect: boolean }[];
    recordedFacts: ScientificFactRecord[];
    allTeamBaselineFacts: ScientificFactRecord[];
    mistakesLearnedCount: number;
    totalScore: number;
    progressPercent: number;
    uploadedMedia: { url: string; type: 'photo' | 'video'; caption?: string; taskId: string }[];
    solvedCheckpoints: { question: Question; submission: Submission }[];
    teamNotes: any[];
    wowMoments: WowMoment[];
    metrics: InfographicMetric[];
    defaultIllustration: string;
  };
  lang: 'el' | 'en';
  onInspectTask: (q: Question) => void;
  onOpenLightbox: (media: { url: string; title: string; caption?: string }) => void;
  onGoToMissions: () => void;
  onDirectUpload?: (file: File) => void;
}

const VisualInfographicPoster: React.FC<PosterProps> = ({
  poster,
  lang,
  onInspectTask,
  onOpenLightbox,
  onGoToMissions,
  onDirectUpload
}) => {
  const isEl = lang === 'el';
  const {
    team,
    totalScore,
    progressPercent,
    solvedTasks,
    attemptedTasks,
    recordedFacts,
    allTeamBaselineFacts,
    mistakesLearnedCount,
    totalQuestions,
    wowMoments,
    metrics,
    uploadedMedia,
    teamNotes,
    defaultIllustration
  } = poster;

  // Selected hero media in the centerpiece
  const [activeMediaIndex, setActiveMediaIndex] = useState<number>(0);
  const currentHeroMedia = uploadedMedia.length > 0 ? uploadedMedia[activeMediaIndex] || uploadedMedia[0] : null;

  return (
    <article
      style={{
        borderColor: `${team.color}70`,
        boxShadow: `0 30px 80px -20px ${team.color}25`
      }}
      className="p-6 sm:p-10 rounded-[36px] bg-slate-950 border-2 shadow-2xl space-y-8 flex flex-col justify-between overflow-hidden relative"
    >
      {/* Background Museum Ambient Glow */}
      <div
        style={{
          background: `radial-gradient(circle at 85% 15%, ${team.color}18, transparent 55%), radial-gradient(circle at 15% 85%, ${team.color}10, transparent 50%)`
        }}
        className="absolute inset-0 pointer-events-none"
      />

      <div className="space-y-8 relative z-10">
        {/* ================= 1. HERO SECTION (POSTER BRANDING HEADER) ================= */}
        <div className="space-y-4 pb-6 border-b border-slate-800">
          {/* Top Exhibition Metadata Bar */}
          <div className="flex items-center justify-between text-xs font-black tracking-widest uppercase text-slate-400">
            <span className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: team.color }} />
              <span>{isEl ? 'ΕΠΙΣΗΜΟ ΕΚΘΕΜΑ ΠΕΔΙΟΥ' : 'OFFICIAL FIELD EXHIBIT'}</span>
              <span className="text-slate-600">·</span>
              <span style={{ color: team.color }}>
                {isEl ? `ΟΜΑΔΑ 0${poster.index + 1}` : `GROUP 0${poster.index + 1}`}
              </span>
            </span>
            <span className="text-amber-400 font-mono hidden sm:inline">
              GYPS FULVUS · LIFE WITH VULTURES CYPRUS
            </span>
          </div>

          <div className="flex items-center justify-between gap-6 flex-wrap">
            {/* Team Avatar, Name & Catchy Slogan */}
            <div className="flex items-center gap-5 min-w-0">
              <div
                style={{
                  backgroundColor: `${team.color}20`,
                  borderColor: `${team.color}60`,
                  boxShadow: `0 0 35px ${team.color}35`
                }}
                className="w-20 h-20 sm:w-26 sm:h-26 rounded-3xl flex items-center justify-center text-5xl sm:text-6xl border-2 shrink-0 select-none"
              >
                {team.avatar}
              </div>

              <div className="min-w-0">
                <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight leading-none">
                  {isEl ? team.name : team.name_en || team.name}
                </h2>

                <p className="text-base sm:text-lg text-amber-300 font-semibold italic mt-2 leading-snug">
                  «{isEl ? team.slogan : team.slogan_en || team.slogan}»
                </p>

                <div className="flex items-center gap-2 mt-2 text-xs text-slate-400 font-semibold">
                  <span>{solvedTasks.length} / {totalQuestions} {isEl ? 'Ολοκληρωμένες Αποστολές' : 'Completed Missions'}</span>
                  {mistakesLearnedCount > 0 && (
                    <>
                      <span>·</span>
                      <span className="text-amber-400 font-bold">
                        💡 {mistakesLearnedCount} {isEl ? 'ευκαιρίες μάθησης έγιναν γνώση' : 'mistakes turned to knowledge'}
                      </span>
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* Striking Score, Facts & Progress Metric Island */}
            <div className="flex items-center gap-3.5 ml-auto shrink-0 flex-wrap sm:flex-nowrap">
              <div className="p-4 sm:p-5 rounded-2xl bg-slate-900/90 border border-slate-800 text-center min-w-[105px] shadow-lg">
                <span className="text-[11px] uppercase font-black text-slate-400 block tracking-wider">
                  {isEl ? 'ΒΑΘΜΟΙ' : 'SCORE'}
                </span>
                <span className="text-3xl sm:text-4xl font-black text-amber-400">
                  {totalScore}
                </span>
                <span className="text-xs font-bold text-amber-400/80 ml-1">pts</span>
              </div>

              <div className="p-4 sm:p-5 rounded-2xl bg-slate-900/90 border border-cyan-500/40 text-center min-w-[115px] shadow-lg shadow-cyan-500/5">
                <span className="text-[11px] uppercase font-black text-cyan-400 block tracking-wider">
                  {isEl ? 'ΓΕΓΟΝΟΤΑ' : 'FACTS'}
                </span>
                <span className="text-3xl sm:text-4xl font-black text-white">
                  {recordedFacts.length > 0 ? recordedFacts.length : allTeamBaselineFacts.length}
                </span>
                <span className="text-[10px] font-bold text-slate-400 block mt-0.5">
                  {isEl ? 'κατοχυρωμένα' : 'verified'}
                </span>
              </div>

              <div className="p-4 sm:p-5 rounded-2xl bg-slate-900/90 border border-slate-800 text-center min-w-[105px] shadow-lg">
                <span className="text-[11px] uppercase font-black text-slate-400 block tracking-wider">
                  {isEl ? 'ΠΡΟΟΔΟΣ' : 'PROGRESS'}
                </span>
                <span className="text-3xl sm:text-4xl font-black text-emerald-400">
                  {progressPercent}%
                </span>
                <span className="text-[10px] font-bold text-slate-400 block mt-0.5">
                  {solvedTasks.length}/{totalQuestions}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* ================= 2. BOLD STATISTICAL METRIC CALLOUTS ================= */}
        <div className="space-y-3">
          <div className="flex items-center justify-between text-xs font-black uppercase tracking-wider text-slate-400">
            <span className="text-white flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>{isEl ? 'Βασικοί Επιστημονικοί Δείκτες Ενότητας (Biometric Metrics)' : 'Key Scientific Metrics & Thresholds'}</span>
            </span>
            <span className="text-emerald-400 font-mono text-[11px]">
              {isEl ? '✓ Επαληθευμένα Δεδομένα Πεδίου' : '✓ Field Verified Data'}
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {metrics.map((metric, mIdx) => (
              <div
                key={mIdx}
                style={{
                  borderColor: `${team.color}40`,
                  background: `linear-gradient(135deg, ${team.color}15, #0a0f1d 85%)`
                }}
                className="p-5 sm:p-6 rounded-3xl border shadow-xl flex items-center gap-5 transition-transform hover:scale-[1.02]"
              >
                <div className="text-4xl sm:text-5xl shrink-0 p-3.5 rounded-2xl bg-slate-950/80 border border-slate-800 shadow-inner">
                  {metric.icon}
                </div>
                <div className="min-w-0">
                  <div className="flex items-baseline gap-2 flex-wrap">
                    <span className="text-4xl sm:text-5xl font-black text-white tracking-tight leading-none">
                      {metric.value}
                    </span>
                    <span className="text-lg font-black text-amber-400">
                      {isEl ? metric.unit : metric.unit_en}
                    </span>
                  </div>
                  <div className="text-xs sm:text-sm font-black text-slate-200 mt-1 uppercase tracking-wider truncate">
                    {isEl ? metric.label : metric.label_en}
                  </div>
                  <div className="text-xs text-slate-400 font-medium truncate mt-0.5">
                    {isEl ? metric.subtext : metric.subtext_en}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ================= 3. BIG VISUAL SHOWCASE (CENTRAL HERO CENTERPIECE) ================= */}
        <div className="space-y-3">
          <div className="flex items-center justify-between text-xs font-black uppercase tracking-wider">
            <span className="text-white flex items-center gap-2">
              <Camera className="w-4 h-4 text-emerald-400" />
              <span className="text-sm font-black">
                {isEl ? 'Κεντρικό Έκθεμα Πεδίου & Οπτικά Τεκμήρια' : 'Central Field Showcase & Visual Evidence'}
              </span>
            </span>
            {uploadedMedia.length > 0 ? (
              <span className="text-emerald-400 bg-emerald-950/60 border border-emerald-500/40 px-3 py-1 rounded-full text-xs font-bold">
                ✓ {uploadedMedia.length} {isEl ? 'τεκμήρια καταγράφηκαν' : 'media logged'}
              </span>
            ) : (
              <span className="text-slate-400 text-xs font-medium">
                {isEl ? 'Εκπαιδευτικό Επιστημονικό Διάγραμμα Ενότητας' : 'Educational Scientific Diagram'}
              </span>
            )}
          </div>

          {/* Focal Museum Hero Frame - Expanded Size for Projector Showcase */}
          <div
            style={{
              borderColor: `${team.color}60`,
              boxShadow: `0 25px 60px -15px ${team.color}35`
            }}
            className="rounded-3xl overflow-hidden border-2 bg-slate-950 relative group shadow-2xl"
          >
            {currentHeroMedia ? (
              <div className="relative">
                {currentHeroMedia.type === 'video' ? (
                  <video
                    src={currentHeroMedia.url}
                    controls
                    className="w-full h-80 sm:h-[460px] lg:h-[540px] object-contain bg-black"
                  />
                ) : (
                  <div
                    className="relative overflow-hidden cursor-pointer"
                    onClick={() => onOpenLightbox({ url: currentHeroMedia.url, title: team.name, caption: currentHeroMedia.caption })}
                  >
                    <img
                      src={currentHeroMedia.url}
                      alt={currentHeroMedia.caption || team.name}
                      className="w-full h-80 sm:h-[460px] lg:h-[540px] object-cover hover:scale-102 transition-transform duration-500"
                    />
                    <div className="absolute top-4 right-4 p-3 rounded-2xl bg-black/80 text-white backdrop-blur-md border border-white/20 opacity-0 group-hover:opacity-100 transition-opacity shadow-lg">
                      <ZoomIn className="w-6 h-6 text-amber-400" />
                    </div>
                  </div>
                )}

                {/* Sleek Caption Banner Underneath */}
                <div className="p-4 sm:p-5 bg-slate-950/95 border-t border-slate-800 flex items-center justify-between gap-4 flex-wrap">
                  <div className="min-w-0">
                    <span className="text-[10px] font-black uppercase tracking-wider text-emerald-400 block">
                      {isEl ? '✓ ΕΠΑΛΗΘΕΥΜΕΝΟ ΤΕΚΜΗΡΙΟ ΠΕΔΙΟΥ' : '✓ VERIFIED FIELD EVIDENCE'}
                    </span>
                    <p className="text-sm sm:text-base font-bold text-white truncate mt-0.5">
                      "{currentHeroMedia.caption || (isEl ? 'Καταγραφή πεδίου ομάδας' : 'Team field observation')}"
                    </p>
                  </div>

                  <div className="flex items-center gap-2.5 flex-wrap">
                    {onDirectUpload && (
                      <label
                        htmlFor={`poster-file-change-${team.id}`}
                        className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold flex items-center gap-2 cursor-pointer transition-colors shrink-0 border border-slate-700"
                        title={isEl ? 'Μεταφόρτωση νέου αρχείου πεδίου' : 'Upload new field media'}
                      >
                        <Upload className="w-4 h-4 text-emerald-400" />
                        <span>{isEl ? 'Νέο Αρχείο' : 'New File'}</span>
                        <input
                          id={`poster-file-change-${team.id}`}
                          type="file"
                          accept="image/*,video/*"
                          className="sr-only"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file && onDirectUpload) {
                              onDirectUpload(file);
                            }
                            e.target.value = '';
                          }}
                        />
                      </label>
                    )}
                    <button
                      type="button"
                      onClick={() => onOpenLightbox({ url: currentHeroMedia.url, title: team.name, caption: currentHeroMedia.caption })}
                      className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-black flex items-center gap-2 cursor-pointer transition-colors shrink-0 shadow-md shadow-amber-500/20"
                    >
                      <ZoomIn className="w-4 h-4 text-slate-950" />
                      <span>{isEl ? 'Μεγέθυνση Προβολέα' : 'Projector Zoom'}</span>
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              /* High-Impact Vector Diagram when no photo uploaded yet */
              <div className="relative overflow-hidden">
                <img
                  src={defaultIllustration}
                  alt={team.name}
                  className="w-full h-80 sm:h-[460px] lg:h-[540px] object-cover bg-slate-950"
                />

                <div className="p-4 sm:p-5 bg-slate-950/95 border-t border-slate-800 flex items-center justify-between gap-4 flex-wrap">
                  <div className="min-w-0">
                    <span className="text-[10px] font-black uppercase tracking-wider text-amber-400 block">
                      {isEl ? 'ΕΠΙΣΤΗΜΟΝΙΚΟ ΔΙΑΓΡΑΜΜΑ ΕΝΟΤΗΤΑΣ' : 'SCIENTIFIC TOPIC DIAGRAM'}
                    </span>
                    <p className="text-xs sm:text-sm font-semibold text-slate-200 truncate mt-0.5">
                      {isEl
                        ? 'Έτοιμο για προβολή στην τάξη • Περιλαμβάνει τις επίσημες βιομετρικές παραμέτρους'
                        : 'Classroom ready • Features official biometric baseline parameters'}
                    </p>
                  </div>

                  <div className="flex items-center gap-2.5 flex-wrap">
                    {onDirectUpload ? (
                      <label
                        htmlFor={`poster-file-upload-${team.id}`}
                        className="px-4 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-black flex items-center gap-2 cursor-pointer transition-colors shadow-lg shadow-emerald-500/20 shrink-0"
                      >
                        <Camera className="w-4 h-4" />
                        <span>{isEl ? 'Άμεση Μεταφόρτωση Φωτογραφίας / Βίντεο' : 'Upload Field Photo / Video'}</span>
                        <input
                          id={`poster-file-upload-${team.id}`}
                          type="file"
                          accept="image/*,video/*"
                          className="sr-only"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file && onDirectUpload) {
                              onDirectUpload(file);
                            }
                            e.target.value = '';
                          }}
                        />
                      </label>
                    ) : (
                      <button
                        type="button"
                        onClick={onGoToMissions}
                        className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-black flex items-center gap-2 cursor-pointer transition-colors shadow-md shrink-0"
                      >
                        <Camera className="w-4 h-4" />
                        <span>{isEl ? 'Ανέβασμα Τεκμηρίου Πεδίου' : 'Upload Field Photo'}</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Media selector thumbnails strip if multiple exist */}
          {uploadedMedia.length > 1 && (
            <div className="flex items-center gap-2.5 overflow-x-auto pb-1 pt-1">
              {uploadedMedia.map((media, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setActiveMediaIndex(idx)}
                  className={`w-20 h-14 rounded-2xl overflow-hidden border-2 shrink-0 transition-all cursor-pointer ${
                    activeMediaIndex === idx
                      ? 'border-amber-400 scale-105 shadow-lg'
                      : 'border-slate-800 opacity-60 hover:opacity-100'
                  }`}
                >
                  <img src={media.url} alt="Thumbnail" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* ================= 4. CLEAN INFOGRAPHIC CARDS: SCIENTIFIC FACTS & WOW MOMENTS ================= */}
        <div className="space-y-4">
          <div className="flex items-center justify-between text-xs font-black uppercase tracking-wider text-slate-400">
            <span className="text-white flex items-center gap-2">
              <Lightbulb className="w-4 h-4 text-amber-400" />
              <span className="text-sm font-black">
                {isEl ? 'Κορυφαία Επιστημονικά Συμπεράσματα (Wow Moments)' : 'Key Scientific Takeaways (Wow Moments)'}
              </span>
            </span>
            <span className="text-amber-400 font-mono text-[11px]">
              {isEl ? '3 Σημεία Αιχμής' : '3 Key Highlights'}
            </span>
          </div>

          {/* 3 Modern Graphic Cards (No Heavy Text Blocks) */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {wowMoments.map((moment, mIdx) => (
              <div
                key={mIdx}
                className="p-5 sm:p-6 rounded-3xl bg-slate-900/90 border border-slate-800 hover:border-slate-700 transition-all space-y-3 flex flex-col justify-between group shadow-xl"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <span className="text-3xl p-2.5 rounded-2xl bg-slate-950 border border-slate-800 group-hover:scale-110 transition-transform shadow-inner">
                      {moment.icon}
                    </span>
                    <span className="px-2.5 py-1 rounded-xl bg-amber-500/15 text-amber-300 border border-amber-500/30 text-[10px] font-black uppercase tracking-wider">
                      {isEl ? moment.badge : moment.badge_en}
                    </span>
                  </div>
                  <h4 className="text-base font-black text-white leading-snug group-hover:text-amber-300 transition-colors">
                    {isEl ? moment.title : moment.title_en}
                  </h4>
                </div>

                <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-medium">
                  {isEl ? moment.description : moment.description_en}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* ================= 4B. DEDICATED SCIENTIFIC FACTS & LEARNING DISCOVERIES ================= */}
        <div className="space-y-4">
          <div className="flex items-center justify-between text-xs font-black uppercase tracking-wider text-slate-400">
            <span className="text-white flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-cyan-400" />
              <span className="text-sm font-black">
                {isEl ? 'Κατοχυρωμένα Επιστημονικά Δεδομένα & Ευκαιρίες Μάθησης' : 'Recorded Scientific Facts & Learning Opportunities'}
              </span>
            </span>
            <span className="text-cyan-400 font-mono text-[11px]">
              {recordedFacts.length > 0
                ? `${recordedFacts.length} ${isEl ? 'καταγραφές' : 'logged'}`
                : `${allTeamBaselineFacts.length} ${isEl ? 'επιστημονικά σημεία' : 'science points'}`}
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {(recordedFacts.length > 0 ? recordedFacts : allTeamBaselineFacts.slice(0, 3)).map((fact, fIdx) => (
              <div
                key={fact.taskId || fIdx}
                className={`p-5 rounded-3xl border transition-all space-y-3 flex flex-col justify-between group shadow-xl ${
                  fact.isMistakeTurnedLearning
                    ? 'bg-gradient-to-br from-amber-950/30 via-slate-900 to-slate-950 border-amber-500/60 shadow-amber-500/10'
                    : 'bg-gradient-to-br from-emerald-950/20 via-slate-900 to-slate-950 border-emerald-500/40 shadow-emerald-500/10'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-2.5">
                    <span className="text-2xl p-2 rounded-xl bg-slate-950/90 border border-slate-800 shadow-inner">
                      {fact.icon || '🔬'}
                    </span>
                    <span
                      className={`px-2.5 py-0.5 rounded-lg text-[10px] font-black uppercase tracking-wider border ${
                        fact.isMistakeTurnedLearning
                          ? 'bg-amber-500/20 text-amber-300 border-amber-500/50'
                          : 'bg-emerald-500/20 text-emerald-300 border-emerald-500/50'
                      }`}
                    >
                      {fact.isMistakeTurnedLearning
                        ? (isEl ? '💡 Ευκαιρία Μάθησης' : '💡 Learning Opportunity')
                        : (isEl ? '✓ Επαληθευμένη Γνώση' : '✓ Verified Science')}
                    </span>
                  </div>

                  <h5 className="text-sm font-bold text-white line-clamp-1 group-hover:text-amber-300 transition-colors">
                    {isEl ? fact.taskTitle : fact.taskTitle_en || fact.taskTitle}
                  </h5>

                  <div className="mt-2.5 p-3 rounded-2xl bg-slate-950/90 border border-slate-800/80">
                    <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block">
                      {isEl ? 'Ορθή Επιστημονική Αλήθεια:' : 'Scientific Truth:'}
                    </span>
                    <p className="text-xs sm:text-sm font-bold text-amber-300 line-clamp-2 mt-0.5 leading-snug">
                      {isEl ? fact.correctAnswerText : fact.correctAnswerText_en}
                    </p>
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-800/80 text-xs text-slate-300 font-medium line-clamp-2 leading-relaxed">
                  <span className="text-emerald-400 font-bold">🎯 {isEl ? 'Συμπέρασμα: ' : 'Takeaway: '}</span>
                  {isEl ? fact.keyTakeaway : fact.keyTakeaway_en}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ================= 5. FIELD LOG & MISSIONS SNAPSHOT ================= */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
          {/* Attempted Missions & Mastered Facts Snapshot */}
          <div className="p-5 rounded-3xl bg-slate-900/80 border border-slate-800 space-y-3 shadow-lg">
            <div className="flex items-center justify-between text-xs font-bold text-slate-300">
              <span className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span className="text-sm font-black">{isEl ? 'Αποστολές & Επιστημονικά Δεδομένα' : 'Missions & Science Facts'}</span>
              </span>
              <span className="text-amber-400 font-mono text-xs">
                {attemptedTasks.length} / {totalQuestions}
                {mistakesLearnedCount > 0 && ` (${mistakesLearnedCount} ${isEl ? 'μάθησης' : 'learned'})`}
              </span>
            </div>

            <div className="space-y-2 max-h-40 overflow-y-auto pr-1 scrollbar-thin">
              {attemptedTasks.length === 0 ? (
                <p className="text-xs text-slate-500 italic py-4 text-center">
                  {isEl ? 'Δεν έχουν υποβληθεί αποστολές ακόμα • Όλες οι προσπάθειες καταγράφονται εδώ.' : 'No missions submitted yet • All attempts are recorded here.'}
                </p>
              ) : (
                attemptedTasks.slice(0, 6).map(({ question, isCorrect }) => (
                  <div
                    key={question.id}
                    onClick={() => onInspectTask(question)}
                    className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 hover:border-slate-700 flex items-center justify-between text-xs cursor-pointer transition-colors"
                  >
                    <span className="truncate text-slate-200 font-medium flex items-center gap-2">
                      {isCorrect ? (
                        <span className="text-emerald-400 font-bold shrink-0">✓</span>
                      ) : (
                        <span className="text-amber-400 font-bold shrink-0">💡</span>
                      )}
                      <span className="truncate">
                        {isEl ? question.title : question.title_en || question.title}
                      </span>
                    </span>
                    {isCorrect ? (
                      <span className="text-amber-400 font-black shrink-0 ml-2">
                        +{question.points}p
                      </span>
                    ) : (
                      <span className="text-[10px] px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30 font-bold shrink-0 ml-2">
                        {isEl ? 'Μάθηση' : 'Learned'}
                      </span>
                    )}
                  </div>
                ))
              )}
              {attemptedTasks.length > 6 && (
                <div className="text-[11px] text-slate-400 text-center pt-1 font-semibold">
                  {isEl ? `+ άλλες ${attemptedTasks.length - 6} αποστολές` : `+ ${attemptedTasks.length - 6} more missions`}
                </div>
              )}
            </div>
          </div>

          {/* Team Field Voice */}
          <div className="p-5 rounded-3xl bg-slate-900/80 border border-slate-800 space-y-3 shadow-lg">
            <div className="flex items-center justify-between text-xs font-bold text-slate-300">
              <span className="flex items-center gap-2">
                <MessageSquare className="w-4 h-4 text-cyan-400" />
                <span className="text-sm font-black">{isEl ? 'Φωνή Ομάδας & Σημειώσεις Πεδίου' : 'Team Voice & Field Notes'}</span>
              </span>
              <span className="text-cyan-400 font-mono text-xs">{teamNotes.length}</span>
            </div>

            <div className="space-y-2 max-h-40 overflow-y-auto pr-1 scrollbar-thin">
              {teamNotes.length === 0 ? (
                <p className="text-xs text-slate-500 italic py-4 text-center">
                  {isEl ? 'Καμία σημείωση πεδίου ακόμα.' : 'No field notes logged yet.'}
                </p>
              ) : (
                teamNotes.map((note) => (
                  <div
                    key={note.id}
                    className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 space-y-1 text-xs"
                  >
                    <div className="flex items-center justify-between text-slate-400 text-[10px]">
                      <span className="font-bold text-slate-200">{note.author}</span>
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

      {/* ================= 6. POSTER FOOTER ACTIONS ================= */}
      <div className="pt-4 border-t border-slate-800/80 flex items-center justify-between gap-4 flex-wrap">
        <button
          type="button"
          onClick={onGoToMissions}
          className="text-xs sm:text-sm font-bold text-amber-400 hover:text-amber-300 flex items-center gap-2 cursor-pointer transition-colors"
        >
          <span>{isEl ? '→ Προβολή Όλων των Αποστολών της Ομάδας' : '→ View All Team Missions'}</span>
          <ArrowRight className="w-4 h-4" />
        </button>

        <span className="text-[11px] text-slate-500 uppercase tracking-widest font-mono">
          LIFE WITH VULTURES CYPRUS · MODERN SCIENTIFIC INFOGRAPHIC EXHIBIT
        </span>
      </div>
    </article>
  );
};
