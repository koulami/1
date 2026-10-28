import React, { useState, useEffect, useMemo, useRef } from 'react';
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
  BookOpen,
  Quote,
  Edit3,
  Crown,
  TrendingUp,
  Zap,
  Radio,
  Vote,
  BarChart3,
  Users,
  Check,
  Clock
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { Team, Question, Submission, CustomTeamTitleRecord, CoreTrackId, ThematicTrackInfo } from '../types/game';
import {
  masterTeamsPool,
  isTaskActive,
  isCheckpointTask,
  getAllTasks,
  getTeamsWithCustomTitles,
  getTeamEffectiveLanguage,
  getLocalizedTeamName,
  getLocalizedTeamSlogan,
  getActiveTasksForTeam,
  CORE_THEMATIC_TRACKS
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
  taskOrder?: string[];
  customTeamTitles?: Record<string, CustomTeamTitleRecord>;
  subgroups?: Team[];
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

// Curated authentic student reflection quotes & wow moments per team
export const DEFAULT_TEAM_REFLECTIONS: Record<string, { el: string; en: string }> = {
  'team-alpha': {
    el: '«Μας εντυπωσίασε το επιβλητικό άνοιγμα φτερών των 2.5 μέτρων και η ισόβια πίστη του ζευγαριού! Καταλάβαμε ότι το Όρνιο είναι ένα σύμβολο άγριας ομορφιάς που οφείλουμε να διαφυλάξουμε για πάντα στην Κύπρο.»',
    en: '“We were awestruck by the massive 2.5-meter wingspan and the lifelong devotion between vulture pairs! We realized that Gyps fulvus is an indispensable icon of Cyprus’s wilderness that we must safeguard forever.”'
  },
  'team-beta': {
    el: '«Η ικανότητά τους να εκμεταλλεύονται τα θερμικά ρεύματα και να διανύουν πάνω από 100 χιλιόμετρα χωρίς φτεροκόπημα πάνω από τους γκρεμούς της Επισκοπής μάς έδειξε την απόλυτη αρμονία του πουλιού με τους νόμους της φύσης!»',
    en: '“Their uncanny mastery of thermal air columns, patrolling over 100 km effortlessly without flapping over the cliffs of Episkopi, showed us the ultimate synergy between nature and physics!”'
  },
  'team-gamma': {
    el: '«Μάθαμε ότι το στομάχι τους με pH 1.0 εξουδετερώνει τον άνθρακα και τη χολέρα! Δεν είναι επικίνδυνα αρπακτικά, αλλά οι υπερ-απαραίτητοι υγειονομικοί καθαριστές που σώζουν την κυπριακή ύπαιθρο από επιδημίες.»',
    en: '“Discovering that their pH 1.0 stomach destroys anthrax and botulism was our wow moment! They are not aggressive predators, but heroic ecosystem sanitizers protecting Cyprus from infectious outbreaks.”'
  },
  'team-delta': {
    el: '«Συνειδητοποιήσαμε ότι η μεγαλύτερη απειλή είναι οι παράνομες φόλες. Οι εκπαιδευμένοι σκύλοι K9 και οι 4 ασφαλείς ταΐστρες του προγράμματος LIFE δίνουν πραγματική ελπίδα για να σωθούν τα Όρνια από την εξαφάνιση.»',
    en: '“Realizing that 90% of vulture deaths are caused by illegal poison baits opened our eyes. The K9 detection dog teams and safe feeding stations under LIFE with Vultures offer real hope to prevent extinction.”'
  }
};

export const TeamPresentationArena: React.FC<Props> = ({
  lang,
  submissions,
  taskOverrides,
  customQuestions = {},
  synthesisNotes,
  onGoBack,
  onSelectTeamMissions,
  taskOrder,
  customTeamTitles,
  subgroups: subgroupsProp
}) => {
  const isEl = lang === 'el';
  const allPoolTasks = useMemo(() => getAllTasks(customQuestions, taskOrder), [customQuestions, taskOrder]);

  const [storedSubgroups, setStoredSubgroups] = useState<Team[]>(() => subgroupsProp || storageService.getSubgroups());

  useEffect(() => {
    if (subgroupsProp) {
      setStoredSubgroups(subgroupsProp);
    }
  }, [subgroupsProp]);

  useEffect(() => {
    const handleSubgroupsSync = () => {
      setStoredSubgroups(storageService.getSubgroups());
    };
    window.addEventListener('boundpad:subgroups', handleSubgroupsSync);
    window.addEventListener('storage', handleSubgroupsSync);
    return () => {
      window.removeEventListener('boundpad:subgroups', handleSubgroupsSync);
      window.removeEventListener('storage', handleSubgroupsSync);
    };
  }, []);

  // Derived teams with custom Greek/English titles and slogans
  const activeTeams = useMemo(() => {
    return getTeamsWithCustomTitles(customTeamTitles, storedSubgroups);
  }, [customTeamTitles, storedSubgroups]);

  // Display Mode: 'leaderboard' vs 'spotlight' vs 'grid'
  const [viewMode, setViewMode] = useState<'leaderboard' | 'spotlight' | 'grid'>('leaderboard');
  const [spotlightIndex, setSpotlightIndex] = useState<number>(0);
  const [isPlayingAuto, setIsPlayingAuto] = useState<boolean>(false);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [selectedInspectTask, setSelectedInspectTask] = useState<Question | null>(null);
  const [lightboxMedia, setLightboxMedia] = useState<{ url: string; title: string; caption?: string } | null>(null);
  const [reflectionsVersion, setReflectionsVersion] = useState<number>(0);
  const [editingReflectionTeam, setEditingReflectionTeam] = useState<{ id: string; name: string; avatar: string; color: string; currentText: string } | null>(null);
  const [reflectionDraftText, setReflectionDraftText] = useState<string>('');

  const handleOpenEditReflection = (team: Team, currentText: string) => {
    setEditingReflectionTeam({
      id: team.id,
      name: isEl ? team.name : team.name_en || team.name,
      avatar: team.avatar,
      color: team.color,
      currentText
    });
    setReflectionDraftText(currentText);
  };

  const handleSaveReflection = () => {
    if (!editingReflectionTeam) return;
    const trimmed = reflectionDraftText.trim();
    storageService.saveTeamReflection(editingReflectionTeam.id, trimmed);
    setReflectionsVersion((v) => v + 1);
    triggerTeamConfetti(editingReflectionTeam.color);
    setEditingReflectionTeam(null);
  };

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
      setSpotlightIndex((prev) => (prev + 1) % activeTeams.length);
    }, 12000);
    return () => clearInterval(interval);
  }, [isPlayingAuto, activeTeams.length]);

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
    return activeTeams.map((team, idx) => {
      const trackId = team.trackId || team.id;
      const teamQuestions = allPoolTasks.filter((q) => {
        if (!q.assignedTeamIds || q.assignedTeamIds.length === 0) return true;
        return q.assignedTeamIds.includes(team.id) || q.assignedTeamIds.includes(trackId);
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
      const teamNotes = synthesisNotes.filter((n) => n.teamId === team.id || n.teamId === trackId);
      const wowMoments = GROUP_WOW_MOMENTS[trackId] || GROUP_WOW_MOMENTS['team-alpha'];
      const metrics = GROUP_INFOGRAPHIC_METRICS[trackId] || GROUP_INFOGRAPHIC_METRICS['team-alpha'];
      const defaultIllustration = GROUP_DEFAULT_ILLUSTRATIONS[trackId] || GROUP_DEFAULT_ILLUSTRATIONS['team-alpha'];

      // Student Reflection Extraction from storage or attempted mission data
      const storedReflection = storageService.getTeamReflection(team.id);
      let studentReflection = storedReflection ? storedReflection.trim() : '';
      let isCustomReflection = Boolean(studentReflection && studentReflection.length > 0);

      if (!studentReflection) {
        for (const item of attemptedTasks) {
          if (item.submission.reflectionText && item.submission.reflectionText.trim().length > 0) {
            studentReflection = item.submission.reflectionText.trim();
            isCustomReflection = true;
            break;
          }
          if (item.question.id.includes('reflection') && item.submission.answerData?.reportText) {
            studentReflection = item.submission.answerData.reportText.trim();
            isCustomReflection = true;
            break;
          }
        }
      }

      const effectiveLang = getTeamEffectiveLanguage(team, lang);
      if (!studentReflection) {
        studentReflection = DEFAULT_TEAM_REFLECTIONS[trackId]?.[effectiveLang] || DEFAULT_TEAM_REFLECTIONS['team-alpha'][effectiveLang];
      }

      // Extract Survey Responses for this subgroup
      const surveyQuestions = activeQuestions.filter((q) => q.type === 'survey' || q.id.includes('survey'));
      const surveyResponses = surveyQuestions.map((q) => {
        const sub = submissions[`${team.id}_${q.id}`];
        const p = q.payload as any;
        const optionsEl: string[] = Array.isArray(p?.options) ? p.options : [];
        const optionsEn: string[] = Array.isArray(p?.options_en) ? p.options_en : (Array.isArray(q.payload_en?.options) ? q.payload_en.options : optionsEl);

        let selectedOptions: string[] = [];
        if (sub) {
          if (Array.isArray(sub.answerData?.selectedOptions) && sub.answerData.selectedOptions.length > 0) {
            selectedOptions = sub.answerData.selectedOptions;
          } else if (Array.isArray(sub.answerData?.selectedIndices)) {
            selectedOptions = sub.answerData.selectedIndices.map((i: number) => {
              const isEn = effectiveLang === 'en';
              return isEn ? (optionsEn[i] || optionsEl[i] || `Option ${i + 1}`) : (optionsEl[i] || `Επιλογή ${i + 1}`);
            });
          } else if (typeof sub.answerData?.selectedIndex === 'number') {
            const i = sub.answerData.selectedIndex;
            const isEn = effectiveLang === 'en';
            selectedOptions = [isEn ? (optionsEn[i] || optionsEl[i] || `Option ${i + 1}`) : (optionsEl[i] || `Επιλογή ${i + 1}`)];
          }
        }

        const reason = sub ? (sub.answerData?.reason || sub.answerData?.customReason || sub.answerData?.reasonText || sub.reflectionText || '') : '';

        return {
          question: q,
          submission: sub,
          selectedOptions,
          reason,
          isSubmitted: Boolean(sub)
        };
      });

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
        defaultIllustration,
        studentReflection,
        isCustomReflection,
        effectiveLang,
        surveyResponses
      };
    });
  }, [activeTeams, submissions, taskOverrides, synthesisNotes, allPoolTasks, reflectionsVersion, lang]);

  // 4 Core Thematic Track Posters uniting all subgroups per track
  const trackPosters = useMemo(() => {
    return CORE_THEMATIC_TRACKS.map((track, trackIdx) => {
      const trackId = (track.trackId || track.id) as CoreTrackId;
      // All subgroups assigned to this track
      const trackSubgroups = teamPosters.filter((p) => {
        const tid = p.team.trackId || p.team.id;
        return tid === trackId;
      });

      // Default fallback team if no subgroups are active for this track
      const fallbackTeam: Team = masterTeamsPool.find((t) => t.id === trackId) || {
        id: trackId,
        trackId: trackId,
        name: track.title,
        name_en: track.title_en,
        color: track.color,
        avatar: track.avatar,
        slogan: 'Ανακαλύπτουμε τα πάντα για το Όρνιο!',
        slogan_en: 'Discovering all about the Griffon Vulture!',
        language: 'el'
      };

      const primarySubgroup = trackSubgroups[0] || {
        team: fallbackTeam,
        index: trackIdx,
        totalQuestions: 15,
        solvedTasks: [],
        attemptedTasks: [],
        recordedFacts: [],
        allTeamBaselineFacts: [],
        mistakesLearnedCount: 0,
        totalScore: 0,
        progressPercent: 0,
        uploadedMedia: [],
        solvedCheckpoints: [],
        teamNotes: [],
        wowMoments: GROUP_WOW_MOMENTS[trackId] || GROUP_WOW_MOMENTS['team-alpha'],
        metrics: GROUP_INFOGRAPHIC_METRICS[trackId] || GROUP_INFOGRAPHIC_METRICS['team-alpha'],
        defaultIllustration: GROUP_DEFAULT_ILLUSTRATIONS[trackId] || GROUP_DEFAULT_ILLUSTRATIONS['team-alpha'],
        studentReflection: DEFAULT_TEAM_REFLECTIONS[trackId]?.[lang] || DEFAULT_TEAM_REFLECTIONS['team-alpha'][lang],
        isCustomReflection: false,
        effectiveLang: lang,
        surveyResponses: []
      };

      // Combined Metrics across all subgroups on this track
      const combinedTotalScore = trackSubgroups.reduce((acc, sub) => acc + sub.totalScore, 0);
      const combinedUploadedMedia = trackSubgroups.flatMap((sub) => sub.uploadedMedia);
      const combinedNotes = trackSubgroups.flatMap((sub) => sub.teamNotes);

      // Questions for this track
      const trackQuestions = allPoolTasks.filter((q) => {
        if (!q.assignedTeamIds || q.assignedTeamIds.length === 0) return true;
        return q.assignedTeamIds.includes(trackId);
      });
      const activeTrackQuestions = trackQuestions.filter((q) => isTaskActive(q, taskOverrides));
      const surveyQuestions = activeTrackQuestions.filter((q) => q.type === 'survey' || q.id.includes('survey'));

      // Authoritative baseline facts in active language
      const allTrackBaselineFacts = activeTrackQuestions.map((q) => {
        return extractScientificFact(q, trackId, true);
      });

      const uniqueSolvedTaskIds = new Set<string>();
      trackSubgroups.forEach((sub) => {
        sub.solvedTasks.forEach((st: any) => uniqueSolvedTaskIds.add(st.question.id));
      });
      const combinedProgressPercent = activeTrackQuestions.length > 0
        ? Math.round((uniqueSolvedTaskIds.size / activeTrackQuestions.length) * 100)
        : 0;

      return {
        track,
        trackId,
        trackIndex: trackIdx,
        trackSubgroups,
        primarySubgroup,
        combinedTotalScore,
        combinedProgressPercent,
        combinedUploadedMedia,
        combinedNotes,
        activeTrackQuestions,
        surveyQuestions,
        allTrackBaselineFacts,
        wowMoments: GROUP_WOW_MOMENTS[trackId] || GROUP_WOW_MOMENTS['team-alpha'],
        metrics: GROUP_INFOGRAPHIC_METRICS[trackId] || GROUP_INFOGRAPHIC_METRICS['team-alpha'],
        defaultIllustration: GROUP_DEFAULT_ILLUSTRATIONS[trackId] || GROUP_DEFAULT_ILLUSTRATIONS['team-alpha'],
        // Backward-compatible properties for single-view
        team: primarySubgroup.team,
        totalScore: combinedTotalScore,
        progressPercent: combinedProgressPercent,
        totalQuestions: activeTrackQuestions.length,
        solvedTasks: primarySubgroup.solvedTasks,
        attemptedTasks: primarySubgroup.attemptedTasks,
        recordedFacts: primarySubgroup.recordedFacts,
        uploadedMedia: combinedUploadedMedia,
        solvedCheckpoints: primarySubgroup.solvedCheckpoints,
        teamNotes: combinedNotes,
        studentReflection: primarySubgroup.studentReflection,
        isCustomReflection: primarySubgroup.isCustomReflection,
        effectiveLang: lang
      };
    });
  }, [teamPosters, allPoolTasks, taskOverrides, lang]);

  // Real-time Leaderboard Rankings (Sorted by Total Score descending, then Solved Quests count)
  const rankedTeams = useMemo(() => {
    return [...teamPosters].sort((a, b) => {
      if (b.totalScore !== a.totalScore) return b.totalScore - a.totalScore;
      if (b.solvedTasks.length !== a.solvedTasks.length) return b.solvedTasks.length - a.solvedTasks.length;
      return a.index - b.index;
    });
  }, [teamPosters]);

  // Overall Classroom Metrics
  const totalClassroomScore = useMemo(() => teamPosters.reduce((acc, p) => acc + p.totalScore, 0), [teamPosters]);
  const totalClassroomSolved = useMemo(() => teamPosters.reduce((acc, p) => acc + p.solvedTasks.length, 0), [teamPosters]);
  const totalClassroomMedia = useMemo(() => teamPosters.reduce((acc, p) => acc + p.uploadedMedia.length, 0), [teamPosters]);
  const totalClassroomQuestions = useMemo(() => teamPosters.reduce((acc, p) => acc + p.totalQuestions, 0), [teamPosters]);

  // Focused subgroup within current track poster ('all' for side-by-side comparison, or specific subgroup id)
  const [focusedSubgroupId, setFocusedSubgroupId] = useState<string>('all');

  // Real-time Submission Animation & Pulse Detection
  const previousScoresRef = useRef<Record<string, number>>({});
  const isInitialMount = useRef(true);
  const [submissionPulse, setSubmissionPulse] = useState<{
    teamId: string;
    delta: number;
    teamName: string;
    avatar: string;
    color: string;
    timestamp: number;
  } | null>(null);

  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false;
      for (const p of teamPosters) {
        previousScoresRef.current[p.team.id] = p.totalScore;
      }
      return;
    }

    let detectedDelta = 0;
    let detectedTeamId = '';
    let detectedTeamName = '';
    let detectedAvatar = '';
    let detectedColor = '';

    for (const poster of teamPosters) {
      const prev = previousScoresRef.current[poster.team.id] ?? 0;
      if (poster.totalScore > prev) {
        detectedDelta = poster.totalScore - prev;
        detectedTeamId = poster.team.id;
        detectedTeamName = isEl ? poster.team.name : poster.team.name_en || poster.team.name;
        detectedAvatar = poster.team.avatar;
        detectedColor = poster.team.color;
      }
      previousScoresRef.current[poster.team.id] = poster.totalScore;
    }

    if (detectedDelta > 0 && detectedTeamId) {
      setSubmissionPulse({
        teamId: detectedTeamId,
        delta: detectedDelta,
        teamName: detectedTeamName,
        avatar: detectedAvatar,
        color: detectedColor,
        timestamp: Date.now()
      });
      triggerTeamConfetti(detectedColor);

      const timer = setTimeout(() => {
        setSubmissionPulse(null);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [teamPosters, isEl]);

  const currentPoster = trackPosters[spotlightIndex] || trackPosters[0];

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
                {isEl ? 'Αρένα Παρουσίασης & Εξέλιξης Ομάδων' : 'Presentation Arena & Team Progress'}
              </h1>
              <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-[10px] font-black uppercase tracking-wider flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span>LIVE SYNC</span>
              </span>
            </div>
            <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
              {isEl
                ? 'Αντικειμενική παρακολούθηση προόδου ομάδων και ψηφιακά Infographic Posters ανά θεματική ενότητα'
                : 'Objective tracking of team progress and scientific Infographic Posters per thematic track'}
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2.5 flex-wrap">
          {/* View Mode Toggle */}
          <div className="flex items-center bg-slate-950 p-1 rounded-xl border border-slate-800">
            <button
              type="button"
              onClick={() => setViewMode('leaderboard')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                viewMode === 'leaderboard'
                  ? 'bg-amber-500 text-slate-950 font-black shadow-xs'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <BarChart3 className="w-3.5 h-3.5" />
              <span>{isEl ? 'Πίνακας Εξέλιξης & Προόδου' : 'Progress & Analytics'}</span>
            </button>
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

          {/* Auto-Play Slideshow (for spotlight) */}
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
            onClick={() => triggerTeamConfetti(teamPosters[0]?.team.color || '#f59e0b')}
            className="px-3 py-1.5 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer active:scale-95"
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

      {/* ===================== DYNAMIC SUBMISSION PULSE TOAST ===================== */}
      {submissionPulse && (
        <div className="p-4 sm:p-5 rounded-3xl bg-gradient-to-r from-amber-500/25 via-emerald-500/25 to-purple-500/25 border-2 border-amber-400 shadow-2xl shadow-amber-500/20 flex items-center justify-between gap-4 flex-wrap animate-in slide-in-from-top-4 duration-300">
          <div className="flex items-center gap-4 min-w-0">
            <div
              style={{ backgroundColor: `${submissionPulse.color}35`, borderColor: submissionPulse.color }}
              className="w-14 h-14 rounded-2xl border-2 flex items-center justify-center text-3xl shadow-lg shrink-0 animate-bounce"
            >
              {submissionPulse.avatar}
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="px-2.5 py-0.5 rounded-full bg-amber-500 text-slate-950 font-black text-[10px] uppercase tracking-wider flex items-center gap-1 shadow-sm">
                  <Zap className="w-3 h-3 fill-slate-950" />
                  <span>{isEl ? 'ΖΩΝΤΑΝΗ ΥΠΟΒΟΛΗ' : 'LIVE SUBMISSION'}</span>
                </span>
                <span className="text-xs font-bold text-amber-300">
                  {isEl ? 'Αυτόματη ενημέρωση προόδου!' : 'Real-time progress update!'}
                </span>
              </div>
              <p className="text-base sm:text-lg font-black text-white mt-0.5 truncate">
                {submissionPulse.teamName}{' '}
                <span className="text-emerald-400 font-mono font-black ml-1.5 inline-block animate-pulse">
                  +{submissionPulse.delta} pts!
                </span>
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="px-3 py-1.5 rounded-xl bg-slate-950/80 border border-slate-700 text-slate-200 text-xs font-mono font-bold flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>{isEl ? 'Ενημέρωση Προόδου' : 'Progress Updated'}</span>
            </span>
          </div>
        </div>
      )}

      {/* ===================== VIEW 0: REAL-TIME LEADERBOARD VISUALIZATION ===================== */}
      {viewMode === 'leaderboard' && (
        <div className="space-y-8 animate-in fade-in duration-300">
          {/* Section Header & Classroom Stat Badges */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center justify-center text-xl shrink-0">
                🏆
              </div>
              <div>
                <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                  {isEl ? 'Συνολικοί Πόντοι' : 'Total Points'}
                </div>
                <div className="text-xl sm:text-2xl font-black text-amber-400 font-mono">
                  {totalClassroomScore} <span className="text-xs text-slate-400 font-sans">pts</span>
                </div>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center text-xl shrink-0">
                🎯
              </div>
              <div>
                <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                  {isEl ? 'Λυμένες Αποστολές' : 'Solved Quests'}
                </div>
                <div className="text-xl sm:text-2xl font-black text-emerald-400 font-mono">
                  {totalClassroomSolved}{' '}
                  <span className="text-xs text-slate-400 font-sans">/ {totalClassroomQuestions}</span>
                </div>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-purple-500/20 text-purple-400 border border-purple-500/30 flex items-center justify-center text-xl shrink-0">
                📸
              </div>
              <div>
                <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                  {isEl ? 'Τεκμήρια Πεδίου' : 'Field Media Evidence'}
                </div>
                <div className="text-xl sm:text-2xl font-black text-purple-400 font-mono">
                  {totalClassroomMedia} <span className="text-xs text-slate-400 font-sans">{isEl ? 'αρχεία' : 'files'}</span>
                </div>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 flex items-center justify-center text-xl shrink-0">
                ⚡
              </div>
              <div>
                <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                  {isEl ? 'Κατάσταση Αρένας' : 'Arena Status'}
                </div>
                <div className="text-sm font-black text-cyan-300 flex items-center gap-1.5 mt-1">
                  <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-pulse" />
                  <span>{isEl ? 'Ζωντανή Καταγραφή' : 'Real-Time Dynamic'}</span>
                </div>
              </div>
            </div>
          </div>

          {/* ================= OBJECTIVE PROGRESS & ANALYTICS DASHBOARD ================= */}
          <div className="space-y-4">
            <div className="flex items-center justify-between gap-4 flex-wrap">
              <div>
                <h3 className="text-xl font-black text-white flex items-center gap-2.5">
                  <BarChart3 className="w-6 h-6 text-emerald-400" />
                  <span>{isEl ? 'Αναλυτικός Πίνακας Βαθμολογίας & Εξέλιξης' : 'Analytics & Team Progress Board'}</span>
                </h3>
                <p className="text-xs text-slate-400 mt-1 max-w-2xl leading-relaxed">
                  {isEl
                    ? 'Αντικειμενική παρακολούθηση της πορείας κάθε θεματικής ομάδας. Επειδή κάθε ομάδα ερευνά διαφορετική πτυχή του Γύπα (Ταυτότητα, Βιότοπος, Βιολογία, Απειλές), η παρουσίαση εστιάζει στη συνεργατική γνώση χωρίς ανταγωνιστική κατάταξη.'
                    : 'Objective overview of each thematic subgroup. As each team investigates a distinct domain of the Griffon Vulture, this dashboard highlights collaborative learning without competitive rankings.'}
                </p>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-300 font-mono px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 flex items-center gap-2">
                  <Users className="w-3.5 h-3.5 text-cyan-400" />
                  <span>{teamPosters.length} {isEl ? 'ενεργές ομάδες' : 'active teams'}</span>
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4">
              {teamPosters.map((poster) => {
                const isJustUpdated = submissionPulse?.teamId === poster.team.id;
                const tTrackId = (poster.team.trackId || poster.team.id) as CoreTrackId;
                const trackInfo = CORE_THEMATIC_TRACKS.find((t) => (t.trackId || t.id) === tTrackId);
                const trackIdx = CORE_THEMATIC_TRACKS.findIndex((t) => (t.trackId || t.id) === tTrackId);

                return (
                  <div
                    key={poster.team.id}
                    style={{
                      borderColor: isJustUpdated ? '#f59e0b' : `${poster.team.color}40`,
                      boxShadow: isJustUpdated ? '0 0 30px rgba(245,158,11,0.35)' : 'none'
                    }}
                    className={`p-5 sm:p-6 rounded-3xl bg-slate-900 border-2 transition-all duration-300 relative overflow-hidden ${
                      isJustUpdated ? 'scale-[1.01] ring-2 ring-amber-400' : ''
                    }`}
                  >
                    {/* Background Subtle Themed Tint */}
                    <div
                      style={{
                        background: `linear-gradient(90deg, ${poster.team.color}15 0%, transparent 40%)`
                      }}
                      className="absolute inset-0 pointer-events-none"
                    />

                    <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                      {/* Left: Team/Subgroup Number + Avatar + Title & Slogan */}
                      <div className="flex items-start sm:items-center gap-4 sm:gap-5 min-w-0 flex-1">
                        {/* Team Indicator (Neutral, non-ranking) */}
                        <div
                          style={{
                            backgroundColor: `${poster.team.color}18`,
                            borderColor: `${poster.team.color}50`,
                            color: poster.team.color
                          }}
                          className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl border-2 flex flex-col items-center justify-center font-mono shadow-sm shrink-0"
                        >
                          <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">
                            {isEl ? 'ΟΜΑΔΑ' : 'TEAM'}
                          </span>
                          <span className="text-xl sm:text-2xl font-black leading-none mt-0.5">
                            {poster.index + 1}
                          </span>
                        </div>

                        {/* Team Avatar */}
                        <div
                          style={{ borderColor: poster.team.color }}
                          className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-slate-950 border-2 flex items-center justify-center text-3xl sm:text-4xl shadow-inner shrink-0"
                        >
                          {poster.team.avatar}
                        </div>

                        {/* Title, Thematic Track Badge & Slogan */}
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <h4 className="text-lg sm:text-xl font-black text-white truncate">
                              {isEl ? poster.team.name : poster.team.name_en || poster.team.name}
                            </h4>

                            {/* Thematic Track Pill */}
                            {trackInfo && (
                              <span
                                style={{
                                  backgroundColor: `${trackInfo.color}25`,
                                  borderColor: `${trackInfo.color}50`,
                                  color: '#f8fafc'
                                }}
                                className="px-2.5 py-0.5 rounded-lg border text-[11px] font-bold flex items-center gap-1.5"
                              >
                                <span>{trackInfo.avatar}</span>
                                <span>{isEl ? trackInfo.title : trackInfo.title_en}</span>
                              </span>
                            )}

                            {/* Language Tag */}
                            <span className="px-2 py-0.5 rounded-md bg-slate-800 text-slate-300 border border-slate-700 text-[10px] font-mono font-bold uppercase">
                              {poster.effectiveLang === 'el' ? '🇬🇷 EL' : '🇬🇧 EN'}
                            </span>

                            {isJustUpdated && (
                              <span className="px-2.5 py-0.5 rounded-full bg-emerald-500 text-slate-950 font-black text-[10px] uppercase tracking-wider animate-bounce">
                                +{submissionPulse?.delta} PTS!
                              </span>
                            )}
                          </div>

                          <p className="text-xs text-slate-400 mt-1 line-clamp-1 max-w-xl">
                            {isEl ? poster.team.slogan : poster.team.slogan_en || poster.team.slogan}
                          </p>
                        </div>
                      </div>

                      {/* Right: Progress Data, Stats, Total Points & Action Links */}
                      <div className="flex flex-col sm:flex-row sm:items-center gap-5 sm:gap-6 justify-between lg:justify-end border-t lg:border-t-0 pt-4 lg:pt-0 border-slate-800/80">
                        {/* Progress Bar & Detailed Counts */}
                        <div className="w-full sm:w-56 space-y-1.5">
                          <div className="flex items-center justify-between text-xs font-bold text-slate-300">
                            <span className="flex items-center gap-1 text-slate-300">
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                              <span>{isEl ? 'Σωστές Απαντήσεις' : 'Correct Tasks'}</span>
                            </span>
                            <span className="font-mono text-emerald-400 font-black">
                              {poster.solvedTasks.length} / {poster.totalQuestions}
                            </span>
                          </div>

                          <div className="w-full h-3 rounded-full bg-slate-950 border border-slate-800 overflow-hidden p-0.5">
                            <div
                              style={{
                                width: `${poster.progressPercent}%`,
                                backgroundColor: poster.team.color
                              }}
                              className="h-full rounded-full transition-all duration-700 shadow-sm"
                            />
                          </div>

                          <div className="flex items-center justify-between text-[11px] text-slate-400 font-medium">
                            <span className="text-cyan-300 font-mono font-bold">
                              {poster.progressPercent}% {isEl ? 'ολοκλήρωση' : 'completion'}
                            </span>
                            <div className="flex items-center gap-2">
                              <span>📸 {poster.uploadedMedia.length}</span>
                              <span>💡 {poster.recordedFacts.length}</span>
                              {poster.surveyResponses && poster.surveyResponses.length > 0 && (
                                <span className="text-emerald-400 font-bold" title={isEl ? 'Ψηφοφορία ολοκληρώθηκε' : 'Poll submitted'}>
                                  🗳️
                                </span>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Points Display (Objective) */}
                        <div className="text-left sm:text-right shrink-0 min-w-[90px]">
                          <div className="text-2xl sm:text-3xl font-black text-amber-400 font-mono tracking-tight flex items-baseline sm:justify-end gap-1">
                            <span>{poster.totalScore}</span>
                            <span className="text-xs text-slate-400 font-sans font-bold">pts</span>
                          </div>
                          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                            {isEl ? 'Συνολικοί Πόντοι' : 'Total Points'}
                          </span>
                        </div>

                        {/* Direct Links to Posters & Tasks */}
                        <div className="flex items-center gap-2 shrink-0">
                          <button
                            type="button"
                            onClick={() => {
                              setSpotlightIndex(trackIdx >= 0 ? trackIdx : 0);
                              setFocusedSubgroupId(poster.team.id);
                              setViewMode('spotlight');
                            }}
                            className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer border border-slate-700 active:scale-95 shadow-sm"
                            title={isEl ? 'Άμεση προβολή του Infographic Poster' : 'Direct link to Infographic Poster'}
                          >
                            <Award className="w-3.5 h-3.5 text-amber-400" />
                            <span>{isEl ? 'Πόστερ' : 'Poster'}</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              if (onSelectTeamMissions) onSelectTeamMissions(trackIdx >= 0 ? trackIdx : 0);
                            }}
                            className="px-3.5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs flex items-center gap-1.5 transition-colors cursor-pointer shadow-md shadow-amber-500/20 active:scale-95"
                            title={isEl ? 'Άμεση μετάβαση στις αποστολές της ομάδας' : 'Direct link to team missions'}
                          >
                            <span>{isEl ? 'Αποστολές' : 'Missions'}</span>
                            <ArrowRight className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* ===================== VIEW 1: SPOTLIGHT DISPLAY ===================== */}
      {viewMode === 'spotlight' && (
        <div className="space-y-4">
          {/* Real-Time Team Progress Ticker Bar */}
          <div className="p-2 sm:p-2.5 rounded-2xl bg-slate-950 border border-slate-800 flex items-center justify-between gap-2 overflow-x-auto">
            <span className="text-[10px] font-black uppercase text-cyan-400 px-2 shrink-0 flex items-center gap-1.5">
              <Users className="w-3.5 h-3.5 text-cyan-400" />
              <span>{isEl ? 'ΟΜΑΔΕΣ ΕΡΓΑΣΙΑΣ:' : 'STUDENT TEAMS:'}</span>
            </span>
            <div className="flex items-center gap-2">
              {teamPosters.map((tp) => {
                const tpTrackId = (tp.team.trackId || tp.team.id) as CoreTrackId;
                const isSelected = tpTrackId === currentPoster.trackId && (focusedSubgroupId === 'all' || focusedSubgroupId === tp.team.id);
                return (
                  <button
                    key={tp.team.id}
                    type="button"
                    onClick={() => {
                      const trackIdx = CORE_THEMATIC_TRACKS.findIndex((t) => (t.trackId || t.id) === tpTrackId);
                      setSpotlightIndex(trackIdx >= 0 ? trackIdx : 0);
                      setFocusedSubgroupId(tp.team.id);
                      setIsPlayingAuto(false);
                    }}
                    style={{
                      borderColor: isSelected ? tp.team.color : 'transparent',
                      backgroundColor: isSelected ? `${tp.team.color}25` : undefined
                    }}
                    className={`px-3 py-1 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer shrink-0 border ${
                      isSelected
                        ? 'text-white border shadow-md font-black ring-1 ring-white/20'
                        : 'bg-slate-900/80 text-slate-300 hover:bg-slate-850'
                    }`}
                  >
                    <span>{tp.team.avatar}</span>
                    <span className="text-[11px]">
                      {isEl ? tp.team.name.split(':')[0] : tp.team.name_en?.split(':')[0] || tp.team.name}
                    </span>
                    <span className="px-1.5 py-0.5 rounded-md bg-slate-950 text-[10px] font-mono text-cyan-300 font-bold">
                      {tp.progressPercent}%
                    </span>
                    <span className="px-1.5 py-0.5 rounded-md bg-slate-950 text-[10px] font-mono text-amber-400 font-bold">
                      {tp.totalScore}p
                    </span>
                  </button>
                );
              })}
            </div>
            <button
              type="button"
              onClick={() => setViewMode('leaderboard')}
              className="text-[10px] font-bold text-amber-400 hover:underline px-2 shrink-0 flex items-center gap-1"
            >
              <span>{isEl ? 'Πίνακας Προόδου →' : 'Progress Board →'}</span>
            </button>
          </div>

          {/* Thematic Track Quick Selector Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {trackPosters.map((poster, idx) => {
              const isSelected = idx === spotlightIndex;
              return (
                <button
                  key={poster.trackId}
                  type="button"
                  onClick={() => {
                    setSpotlightIndex(idx);
                    setFocusedSubgroupId('all');
                    setIsPlayingAuto(false);
                  }}
                  style={{
                    borderColor: isSelected ? poster.track.color : 'transparent',
                    boxShadow: isSelected ? `0 0 25px ${poster.track.color}35` : 'none'
                  }}
                  className={`p-3.5 rounded-2xl border-2 text-left transition-all cursor-pointer flex items-center justify-between ${
                    isSelected
                      ? 'bg-slate-800 text-white font-black scale-102 ring-1 ring-white/20'
                      : 'bg-slate-900/80 hover:bg-slate-800/60 text-slate-400 hover:text-white'
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <span className="text-2xl shrink-0">{poster.track.avatar}</span>
                    <div className="min-w-0">
                      <div className="text-xs font-bold truncate">
                        {isEl ? poster.track.title.split(':')[0] : poster.track.title_en.split(':')[0]}
                      </div>
                      <div className="text-[11px] text-slate-400 truncate">
                        {poster.trackSubgroups.length} {isEl ? (poster.trackSubgroups.length === 1 ? 'υποομάδα' : 'υποομάδες') : (poster.trackSubgroups.length === 1 ? 'group' : 'groups')} • {poster.combinedTotalScore} pts
                      </div>
                    </div>
                  </div>
                  {isSelected && (
                    <span
                      style={{ backgroundColor: poster.track.color }}
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
                setSpotlightIndex((prev) => (prev > 0 ? prev - 1 : trackPosters.length - 1));
                setFocusedSubgroupId('all');
                setIsPlayingAuto(false);
              }}
              className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold flex items-center gap-1.5 cursor-pointer transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
              <span>{isEl ? 'Προηγούμενος Πυλώνας' : 'Previous Track'}</span>
            </button>

            <span className="font-semibold text-slate-300">
              {isEl
                ? `Παρουσίαση Έκθεσης: Πυλώνας ${spotlightIndex + 1} από ${trackPosters.length}`
                : `Exhibition Stage: Track ${spotlightIndex + 1} of ${trackPosters.length}`}
            </span>

            <button
              type="button"
              onClick={() => {
                setSpotlightIndex((prev) => (prev + 1) % trackPosters.length);
                setFocusedSubgroupId('all');
                setIsPlayingAuto(false);
              }}
              className="px-3.5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black flex items-center gap-1.5 cursor-pointer transition-colors shadow-md active:scale-95"
            >
              <span>{isEl ? 'Επόμενος Πυλώνας' : 'Next Track'}</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          {/* Upgraded High-Impact Infographic Poster Card */}
          <VisualInfographicPoster
            poster={currentPoster}
            lang={lang}
            focusedSubgroupId={focusedSubgroupId}
            onSelectFocusSubgroup={(id) => setFocusedSubgroupId(id)}
            onInspectTask={(q) => setSelectedInspectTask(q)}
            onOpenLightbox={(media) => setLightboxMedia(media)}
            onGoToMissions={() => onSelectTeamMissions && onSelectTeamMissions(currentPoster.trackIndex)}
            onDirectUpload={(teamId, file) => handleDirectUpload(teamId, file)}
            onEditReflection={handleOpenEditReflection}
          />
        </div>
      )}

      {/* ===================== VIEW 2: 4-POSTER GALLERY ===================== */}
      {viewMode === 'grid' && (
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
          {trackPosters.map((poster) => (
            <VisualInfographicPoster
              key={poster.trackId}
              poster={poster}
              lang={lang}
              onInspectTask={(q) => setSelectedInspectTask(q)}
              onOpenLightbox={(media) => setLightboxMedia(media)}
              onGoToMissions={() => onSelectTeamMissions && onSelectTeamMissions(poster.trackIndex)}
              onDirectUpload={(teamId, file) => handleDirectUpload(teamId, file)}
              onEditReflection={handleOpenEditReflection}
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

      {/* ===================== EDIT STUDENT REFLECTION MODAL ===================== */}
      {editingReflectionTeam && (
        <div
          className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 sm:p-6 animate-in fade-in"
          onClick={() => setEditingReflectionTeam(null)}
        >
          <div
            className="max-w-xl w-full bg-slate-950 border-2 rounded-3xl p-6 sm:p-7 shadow-2xl space-y-5"
            style={{ borderColor: `${editingReflectionTeam.color}80` }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <div className="flex items-center gap-3">
                <span className="text-3xl p-2 rounded-2xl bg-slate-900 border border-slate-800">
                  {editingReflectionTeam.avatar}
                </span>
                <div>
                  <h3 className="font-black text-lg text-white">
                    {isEl ? 'Αναστοχασμός Ομάδας & Wow Moment' : 'Team Reflection & Wow Moment'}
                  </h3>
                  <p className="text-xs text-slate-400">
                    <span style={{ color: editingReflectionTeam.color }} className="font-bold">
                      {editingReflectionTeam.name}
                    </span>
                    {' • '}
                    {isEl ? 'Προσωπική Εντύπωση & Συμπέρασμα για το Πόστερ' : 'Field Takeaway for Team Poster'}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setEditingReflectionTeam(null)}
                className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Prompt Banner */}
            <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-start gap-3 text-xs text-amber-200">
              <Quote className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
              <p className="leading-relaxed">
                {isEl
                  ? 'Γράψτε τι εντυπωσίασε περισσότερο την ομάδα σας ή ποιο είναι το σπουδαιότερο επιστημονικό συμπέρασμα από τις αποστολές πεδίου. Το κείμενο αυτό θα προβληθεί περίοπτα στο επίσημο πόστερ της ομάδας!'
                  : 'Share what impressed your team the most or your crowning field realization. This quote will be prominently featured on your official presentation poster!'}
              </p>
            </div>

            {/* Textarea */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-300 block">
                {isEl ? 'Κείμενο Αναστοχασμού / Παράθεμα (Quote):' : 'Reflection Text / Quote Box:'}
              </label>
              <textarea
                value={reflectionDraftText}
                onChange={(e) => setReflectionDraftText(e.target.value)}
                rows={4}
                placeholder={isEl ? 'π.χ. Μας εντυπωσίασε το τεράστιο άνοιγμα των 2.5 μέτρων...' : 'e.g. We were astonished by the 2.5m wingspan...'}
                className="w-full bg-slate-900 border border-slate-700 rounded-2xl p-4 text-sm text-white focus:outline-none focus:border-amber-400 transition-colors placeholder:text-slate-600 leading-relaxed italic"
              />
            </div>

            {/* Reset to Curated Suggestion button */}
            <div className="flex items-center justify-between text-xs">
              <button
                type="button"
                onClick={() => {
                  const defaultSuggestion = DEFAULT_TEAM_REFLECTIONS[editingReflectionTeam.id]?.[lang] || DEFAULT_TEAM_REFLECTIONS['team-alpha'][lang];
                  setReflectionDraftText(defaultSuggestion);
                }}
                className="text-slate-400 hover:text-amber-300 underline font-medium cursor-pointer"
              >
                {isEl ? '↺ Επαναφορά προτεινόμενου κειμένου' : '↺ Reset to curated suggestion'}
              </button>
              <span className="text-slate-500 font-mono text-[11px]">
                {reflectionDraftText.length} {isEl ? 'χαρακτήρες' : 'chars'}
              </span>
            </div>

            {/* Action buttons */}
            <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setEditingReflectionTeam(null)}
                className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold transition-colors cursor-pointer"
              >
                {isEl ? 'Ακύρωση' : 'Cancel'}
              </button>
              <button
                type="button"
                onClick={handleSaveReflection}
                className="px-6 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-black transition-all shadow-lg shadow-amber-500/20 active:scale-95 cursor-pointer"
              >
                {isEl ? '💾 Αποθήκευση στο Πόστερ' : '💾 Save to Poster'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// ============================================================================
// COMPONENT: VISUAL INFOGRAPHIC POSTER (Digital Science / Museum Exhibit Panel)
// Supports Unified Thematic Core Science & Differentiated Subgroup Inputs
// ============================================================================
interface PosterProps {
  poster: any;
  lang: 'el' | 'en';
  focusedSubgroupId?: string;
  onSelectFocusSubgroup?: (subgroupId: string) => void;
  onInspectTask: (q: Question) => void;
  onOpenLightbox: (media: { url: string; title: string; caption?: string }) => void;
  onGoToMissions: () => void;
  onDirectUpload?: (teamId: string, file: File) => void;
  onEditReflection: (team: Team, currentText: string) => void;
}

const VisualInfographicPoster: React.FC<PosterProps> = ({
  poster,
  lang,
  focusedSubgroupId = 'all',
  onSelectFocusSubgroup,
  onInspectTask,
  onOpenLightbox,
  onGoToMissions,
  onDirectUpload,
  onEditReflection
}) => {
  const isEl = lang === 'el';

  // Thematic Track Information (Unified Foundation)
  const track: ThematicTrackInfo = poster.track || {
    id: poster.team?.trackId || 'team-alpha',
    trackNumber: (poster.index || 0) + 1,
    title: poster.team?.name || 'Θεματικός Πυλώνας',
    title_en: poster.team?.name_en || 'Thematic Track',
    theme: poster.team?.slogan || '',
    theme_en: poster.team?.slogan_en || '',
    color: poster.team?.color || '#10b981',
    avatar: poster.team?.avatar || '🦅'
  };

  // Subgroups assigned to this thematic track
  const trackSubgroups: any[] = poster.trackSubgroups && poster.trackSubgroups.length > 0
    ? poster.trackSubgroups
    : [poster];
  const hasMultipleSubgroups = trackSubgroups.length > 1;

  // Internal focus state fallback
  const [internalFocused, setInternalFocused] = useState<string>('all');
  const activeFocusedId = focusedSubgroupId || internalFocused;

  const handleSelectSubgroupTab = (id: string) => {
    if (onSelectFocusSubgroup) {
      onSelectFocusSubgroup(id);
    } else {
      setInternalFocused(id);
    }
  };

  // If viewing a single focused subgroup
  const focusedSub = activeFocusedId !== 'all'
    ? trackSubgroups.find((s) => s.team.id === activeFocusedId) || trackSubgroups[0]
    : null;

  // Single-view hero media index
  const [activeMediaIndex, setActiveMediaIndex] = useState<number>(0);
  const singleSubMedia = focusedSub
    ? focusedSub.uploadedMedia
    : trackSubgroups.flatMap((s) => s.uploadedMedia);
  const currentSingleMedia = singleSubMedia.length > 0
    ? singleSubMedia[activeMediaIndex] || singleSubMedia[0]
    : null;

  // Unified metrics and baseline facts (in active language)
  const metrics: InfographicMetric[] = poster.metrics || GROUP_INFOGRAPHIC_METRICS[track.id] || GROUP_INFOGRAPHIC_METRICS['team-alpha'];
  const wowMoments: WowMoment[] = poster.wowMoments || GROUP_WOW_MOMENTS[track.id] || GROUP_WOW_MOMENTS['team-alpha'];
  const defaultIllustration: string = poster.defaultIllustration || GROUP_DEFAULT_ILLUSTRATIONS[track.id] || GROUP_DEFAULT_ILLUSTRATIONS['team-alpha'];
  const allTrackBaselineFacts: ScientificFactRecord[] = poster.allTrackBaselineFacts || poster.allTeamBaselineFacts || [];
  const surveyQuestions: Question[] = poster.surveyQuestions || [];

  const displayScore = focusedSub
    ? focusedSub.totalScore
    : poster.combinedTotalScore ?? poster.totalScore ?? 0;
  const displayProgress = focusedSub
    ? focusedSub.progressPercent
    : poster.combinedProgressPercent ?? poster.progressPercent ?? 0;

  const primaryColor = focusedSub ? focusedSub.team.color : track.color;

  return (
    <article
      style={{
        borderColor: `${primaryColor}70`,
        boxShadow: `0 30px 80px -20px ${primaryColor}25`
      }}
      className="p-6 sm:p-10 rounded-[36px] bg-slate-950 border-2 shadow-2xl space-y-8 flex flex-col justify-between overflow-hidden relative"
    >
      {/* Background Museum Ambient Glow */}
      <div
        style={{
          background: `radial-gradient(circle at 85% 15%, ${primaryColor}18, transparent 55%), radial-gradient(circle at 15% 85%, ${primaryColor}10, transparent 50%)`
        }}
        className="absolute inset-0 pointer-events-none"
      />

      <div className="space-y-8 relative z-10">
        {/* ================= 1. HERO SECTION (POSTER BRANDING HEADER) ================= */}
        <div className="space-y-4 pb-6 border-b border-slate-800">
          {/* Top Exhibition Metadata Bar */}
          <div className="flex items-center justify-between text-xs font-black tracking-widest uppercase text-slate-400">
            <span className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: primaryColor }} />
              <span>{isEl ? 'ΕΠΙΣΗΜΟ ΕΚΘΕΜΑ ΠΕΔΙΟΥ' : 'OFFICIAL FIELD EXHIBIT'}</span>
              <span className="text-slate-600">·</span>
              <span style={{ color: primaryColor }}>
                {isEl ? `ΠΥΛΩΝΑΣ 0${track.trackNumber}` : `TRACK 0${track.trackNumber}`}
              </span>
            </span>
            <span className="text-amber-400 font-mono hidden sm:inline">
              GYPS FULVUS · LIFE WITH VULTURES CYPRUS
            </span>
          </div>

          <div className="flex items-center justify-between gap-6 flex-wrap">
            {/* Track Avatar, Thematic Title & Subgroups Roster */}
            <div className="flex items-center gap-5 min-w-0">
              <div
                style={{
                  backgroundColor: `${primaryColor}20`,
                  borderColor: `${primaryColor}60`,
                  boxShadow: `0 0 35px ${primaryColor}35`
                }}
                className="w-20 h-20 sm:w-26 sm:h-26 rounded-3xl flex items-center justify-center text-5xl sm:text-6xl border-2 shrink-0 select-none"
              >
                {track.avatar}
              </div>

              <div className="min-w-0">
                <h2 className="text-2xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight leading-tight">
                  {isEl ? track.title : track.title_en}
                </h2>

                <p className="text-sm sm:text-base text-amber-300 font-semibold italic mt-1.5 leading-snug">
                  «{isEl ? (track.theme || track.description) : (track.theme_en || track.description_en)}»
                </p>

                <div className="flex items-center gap-2 mt-2 text-xs text-slate-400 font-semibold flex-wrap">
                  {hasMultipleSubgroups ? (
                    <span className="px-2.5 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 font-bold">
                      👥 {trackSubgroups.length} {isEl ? 'Συνεργαζόμενες Υποομάδες' : 'Collaborating Subgroups'}
                    </span>
                  ) : (
                    <span>
                      {trackSubgroups[0]?.solvedTasks?.length || 0} / {poster.activeTrackQuestions?.length || 15} {isEl ? 'Ολοκληρωμένες Αποστολές' : 'Completed Missions'}
                    </span>
                  )}
                  <span>·</span>
                  <span className="text-slate-300">
                    {poster.activeTrackQuestions?.length || 15} {isEl ? 'Κοινές Ερωτήσεις Master Pool' : 'Shared Curriculum Tasks'}
                  </span>
                </div>
              </div>
            </div>

            {/* Striking Score, Facts & Progress Metric Island */}
            <div className="flex items-center gap-3.5 ml-auto shrink-0 flex-wrap sm:flex-nowrap">
              <div className="p-4 sm:p-5 rounded-2xl bg-slate-900/90 border border-slate-800 text-center min-w-[105px] shadow-lg">
                <span className="text-[11px] uppercase font-black text-slate-400 block tracking-wider">
                  {hasMultipleSubgroups && activeFocusedId === 'all'
                    ? (isEl ? 'ΣΥΝΟΛΟ ΒΑΘΜΩΝ' : 'TOTAL SCORE')
                    : (isEl ? 'ΒΑΘΜΟΙ' : 'SCORE')}
                </span>
                <span className="text-3xl sm:text-4xl font-black text-amber-400">
                  {displayScore}
                </span>
                <span className="text-xs font-bold text-amber-400/80 ml-1">pts</span>
              </div>

              <div className="p-4 sm:p-5 rounded-2xl bg-slate-900/90 border border-cyan-500/40 text-center min-w-[115px] shadow-lg shadow-cyan-500/5">
                <span className="text-[11px] uppercase font-black text-cyan-400 block tracking-wider">
                  {isEl ? 'ΓΕΓΟΝΟΤΑ' : 'FACTS'}
                </span>
                <span className="text-3xl sm:text-4xl font-black text-white">
                  {allTrackBaselineFacts.length}
                </span>
                <span className="text-[10px] font-bold text-slate-400 block mt-0.5">
                  {isEl ? 'επιστημονικά σημεία' : 'verified points'}
                </span>
              </div>

              <div className="p-4 sm:p-5 rounded-2xl bg-slate-900/90 border border-slate-800 text-center min-w-[105px] shadow-lg">
                <span className="text-[11px] uppercase font-black text-slate-400 block tracking-wider">
                  {isEl ? 'ΠΡΟΟΔΟΣ' : 'PROGRESS'}
                </span>
                <span className="text-3xl sm:text-4xl font-black text-emerald-400">
                  {displayProgress}%
                </span>
                <span className="text-[10px] font-bold text-slate-400 block mt-0.5">
                  {isEl ? 'κάλυψη πυλώνα' : 'track coverage'}
                </span>
              </div>
            </div>
          </div>

          {/* Subgroup Collaboration Selector Bar (when multiple subgroups exist on this track) */}
          {hasMultipleSubgroups && (
            <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between gap-3 flex-wrap">
              <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none flex-wrap">
                <span className="text-xs font-bold text-slate-400 shrink-0">
                  {isEl ? 'Προβολή Υποομάδων:' : 'Subgroup View:'}
                </span>
                <button
                  type="button"
                  onClick={() => handleSelectSubgroupTab('all')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer shrink-0 border flex items-center gap-1.5 ${
                    activeFocusedId === 'all'
                      ? 'bg-amber-500 text-slate-950 font-black border-amber-400 shadow-md shadow-amber-500/20'
                      : 'bg-slate-900 border-slate-800 text-slate-300 hover:text-white'
                  }`}
                >
                  <Users className="w-3.5 h-3.5" />
                  <span>{isEl ? 'Σύγκριση Όλων (Side-by-Side)' : 'Compare All (Side-by-Side)'}</span>
                </button>

                {trackSubgroups.map((sub) => {
                  const isSelected = activeFocusedId === sub.team.id;
                  return (
                    <button
                      key={sub.team.id}
                      type="button"
                      onClick={() => handleSelectSubgroupTab(sub.team.id)}
                      style={{
                        borderColor: isSelected ? sub.team.color : undefined,
                        backgroundColor: isSelected ? `${sub.team.color}25` : undefined
                      }}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer shrink-0 border flex items-center gap-1.5 ${
                        isSelected
                          ? 'text-white border shadow-md font-black ring-1 ring-white/20'
                          : 'bg-slate-900 border-slate-800 text-slate-300 hover:text-white'
                      }`}
                    >
                      <span>{sub.team.avatar}</span>
                      <span className="font-bold">{isEl ? sub.team.name : sub.team.name_en || sub.team.name}</span>
                      <span className="text-[10px] px-1.5 py-0.2 rounded bg-slate-800 text-slate-300 font-mono">
                        {sub.effectiveLang === 'el' ? '🇬🇷 EL' : '🇬🇧 EN'}
                      </span>
                      <span className="font-mono text-amber-400 font-bold">
                        {sub.totalScore}p
                      </span>
                    </button>
                  );
                })}
              </div>

              <div className="text-[11px] text-slate-400 font-mono">
                {activeFocusedId === 'all'
                  ? (isEl ? '★ Πλήρες συνδυαστικό πόστερ με παράλληλη προβολή' : '★ Unified poster with side-by-side inputs')
                  : (isEl ? `★ Εστίαση: ${focusedSub?.team.name}` : `★ Focused on ${focusedSub?.team.name_en || focusedSub?.team.name}`)}
              </div>
            </div>
          )}
        </div>

        {/* ================= 2. BOLD STATISTICAL METRIC CALLOUTS (UNIFIED CORE SCIENCE) ================= */}
        <div className="space-y-3">
          <div className="flex items-center justify-between text-xs font-black uppercase tracking-wider text-slate-400">
            <span className="text-white flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>{isEl ? 'Κοινά Επιστημονικά Βιομετρικά Δεδομένα Πυλώνα' : 'Core Thematic Biometric Baseline Data'}</span>
            </span>
            <span className="text-emerald-400 font-mono text-[11px]">
              {isEl ? '✓ Ενιαία Επιστημονική Αλήθεια (Unified Science)' : '✓ Authoritative Shared Science'}
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {metrics.map((metric, mIdx) => (
              <div
                key={mIdx}
                style={{
                  borderColor: `${primaryColor}40`,
                  background: `linear-gradient(135deg, ${primaryColor}15, #0a0f1d 85%)`
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

        {/* ================= 3. DIFFERENTIATED FIELD EVIDENCE & HERO MEDIA ================= */}
        <div className="space-y-4">
          <div className="flex items-center justify-between text-xs font-black uppercase tracking-wider">
            <span className="text-white flex items-center gap-2">
              <Camera className="w-4 h-4 text-emerald-400" />
              <span className="text-sm font-black">
                {hasMultipleSubgroups && activeFocusedId === 'all'
                  ? (isEl ? 'Αυθεντικά Τεκμήρια Πεδίου ανά Υποομάδα (Side-by-Side Evidence)' : 'Field Visual Evidence by Subgroup (Side-by-Side)')
                  : (isEl ? 'Κεντρικό Έκθεμα Πεδίου & Οπτικά Τεκμήρια' : 'Central Field Showcase & Visual Evidence')}
              </span>
            </span>
            <span className="text-emerald-400 bg-emerald-950/60 border border-emerald-500/40 px-3 py-1 rounded-full text-xs font-bold">
              {hasMultipleSubgroups && activeFocusedId === 'all'
                ? (isEl ? 'Παράλληλη Προβολή Ομάδων' : 'Side-by-Side Showcase')
                : (isEl ? 'Επίσημο Έκθεμα' : 'Official Showcase')}
            </span>
          </div>

          {/* SIDE-BY-SIDE DISPLAY: When multiple subgroups share this track */}
          {hasMultipleSubgroups && activeFocusedId === 'all' ? (
            <div className={`grid grid-cols-1 ${trackSubgroups.length === 2 ? 'md:grid-cols-2' : 'md:grid-cols-3'} gap-5`}>
              {trackSubgroups.map((sub) => {
                const subMedia = sub.uploadedMedia?.[0] || null;
                const subLang = sub.effectiveLang || 'el';
                return (
                  <div
                    key={sub.team.id}
                    style={{ borderColor: `${sub.team.color}80` }}
                    className="p-5 rounded-3xl bg-slate-900/90 border-2 shadow-2xl space-y-4 flex flex-col justify-between"
                  >
                    {/* Subgroup Header Tag */}
                    <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                      <div className="flex items-center gap-2.5">
                        <span className="text-2xl p-1.5 rounded-xl bg-slate-950 border border-slate-800">
                          {sub.team.avatar}
                        </span>
                        <div>
                          <h4 className="text-sm font-black text-white">
                            {isEl ? sub.team.name : sub.team.name_en || sub.team.name}
                          </h4>
                          <span className="text-[11px] text-slate-400 italic">
                            «{isEl ? sub.team.slogan : sub.team.slogan_en || sub.team.slogan}»
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-800 text-slate-300 border border-slate-700">
                          {subLang === 'el' ? '🇬🇷 EL' : '🇬🇧 EN'}
                        </span>
                        <span style={{ color: sub.team.color }} className="font-mono font-black text-xs">
                          {sub.totalScore}p
                        </span>
                      </div>
                    </div>

                    {/* Media Display */}
                    <div className="rounded-2xl overflow-hidden border border-slate-800 bg-slate-950 relative group">
                      {subMedia ? (
                        subMedia.type === 'video' ? (
                          <video src={subMedia.url} controls className="w-full h-56 sm:h-64 object-contain bg-black" />
                        ) : (
                          <div
                            onClick={() => onOpenLightbox({ url: subMedia.url, title: sub.team.name, caption: subMedia.caption })}
                            className="relative overflow-hidden cursor-pointer"
                          >
                            <img
                              src={subMedia.url}
                              alt={subMedia.caption || sub.team.name}
                              className="w-full h-56 sm:h-64 object-cover group-hover:scale-102 transition-transform duration-300"
                            />
                            <div className="absolute top-3 right-3 p-2 rounded-xl bg-black/80 text-white backdrop-blur-md border border-white/20 opacity-0 group-hover:opacity-100 transition-opacity">
                              <ZoomIn className="w-5 h-5 text-amber-400" />
                            </div>
                          </div>
                        )
                      ) : (
                        <div className="relative">
                          <img
                            src={defaultIllustration}
                            alt={sub.team.name}
                            className="w-full h-56 sm:h-64 object-cover opacity-80"
                          />
                          <div className="absolute inset-0 bg-slate-950/60 flex items-center justify-center p-4 text-center">
                            <span className="text-xs text-slate-300 font-semibold">
                              {isEl ? 'Αναμονή φωτογραφίας από την ομάδα' : 'Awaiting field photo from this subgroup'}
                            </span>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Caption & Actions for this Subgroup */}
                    <div className="space-y-3 pt-2">
                      <p className="text-xs text-slate-300 italic line-clamp-2">
                        {subMedia?.caption ? `"${subMedia.caption}"` : (isEl ? 'Εκπαιδευτικό διάγραμμα πυλώνα' : 'Thematic scientific diagram')}
                      </p>

                      <div className="flex items-center justify-between gap-2 pt-2 border-t border-slate-800">
                        {onDirectUpload && (
                          <label
                            htmlFor={`subgroup-file-upload-${sub.team.id}`}
                            className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-[11px] font-bold flex items-center gap-1.5 cursor-pointer transition-colors border border-slate-700"
                          >
                            <Upload className="w-3.5 h-3.5 text-emerald-400" />
                            <span>{subMedia ? (isEl ? 'Αλλαγή' : 'Replace') : (isEl ? 'Μεταφόρτωση' : 'Upload')}</span>
                            <input
                              id={`subgroup-file-upload-${sub.team.id}`}
                              type="file"
                              accept="image/*,video/*"
                              className="sr-only"
                              onChange={(e) => {
                                const file = e.target.files?.[0];
                                if (file && onDirectUpload) onDirectUpload(sub.team.id, file);
                                e.target.value = '';
                              }}
                            />
                          </label>
                        )}

                        {subMedia && (
                          <button
                            type="button"
                            onClick={() => onOpenLightbox({ url: subMedia.url, title: sub.team.name, caption: subMedia.caption })}
                            className="px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-[11px] font-black flex items-center gap-1.5 cursor-pointer transition-colors"
                          >
                            <ZoomIn className="w-3.5 h-3.5" />
                            <span>{isEl ? 'Μεγέθυνση' : 'Zoom'}</span>
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            /* SINGLE FOCUS VIEW: Standard prominent hero frame */
            <div
              style={{
                borderColor: `${primaryColor}60`,
                boxShadow: `0 25px 60px -15px ${primaryColor}35`
              }}
              className="rounded-3xl overflow-hidden border-2 bg-slate-950 relative group shadow-2xl"
            >
              {currentSingleMedia ? (
                <div className="relative">
                  {currentSingleMedia.type === 'video' ? (
                    <video
                      src={currentSingleMedia.url}
                      controls
                      className="w-full h-80 sm:h-[460px] lg:h-[540px] object-contain bg-black"
                    />
                  ) : (
                    <div
                      className="relative overflow-hidden cursor-pointer"
                      onClick={() => onOpenLightbox({ url: currentSingleMedia.url, title: focusedSub ? focusedSub.team.name : track.title, caption: currentSingleMedia.caption })}
                    >
                      <img
                        src={currentSingleMedia.url}
                        alt={currentSingleMedia.caption || track.title}
                        className="w-full h-80 sm:h-[460px] lg:h-[540px] object-cover hover:scale-102 transition-transform duration-500"
                      />
                      <div className="absolute top-4 right-4 p-3 rounded-2xl bg-black/80 text-white backdrop-blur-md border border-white/20 opacity-0 group-hover:opacity-100 transition-opacity shadow-lg">
                        <ZoomIn className="w-6 h-6 text-amber-400" />
                      </div>
                    </div>
                  )}

                  <div className="p-4 sm:p-5 bg-slate-950/95 border-t border-slate-800 flex items-center justify-between gap-4 flex-wrap">
                    <div className="min-w-0">
                      <span className="text-[10px] font-black uppercase tracking-wider text-emerald-400 block">
                        {isEl ? '✓ ΕΠΑΛΗΘΕΥΜΕΝΟ ΤΕΚΜΗΡΙΟ ΠΕΔΙΟΥ' : '✓ VERIFIED FIELD EVIDENCE'}
                      </span>
                      <p className="text-sm sm:text-base font-bold text-white truncate mt-0.5">
                        "{currentSingleMedia.caption || (isEl ? 'Καταγραφή πεδίου ομάδας' : 'Team field observation')}"
                      </p>
                    </div>

                    <div className="flex items-center gap-2.5 flex-wrap">
                      {onDirectUpload && (
                        <label
                          htmlFor="poster-file-change-single"
                          className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold flex items-center gap-2 cursor-pointer transition-colors shrink-0 border border-slate-700"
                        >
                          <Upload className="w-4 h-4 text-emerald-400" />
                          <span>{isEl ? 'Νέο Αρχείο' : 'New File'}</span>
                          <input
                            id="poster-file-change-single"
                            type="file"
                            accept="image/*,video/*"
                            className="sr-only"
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              const targetTeamId = focusedSub ? focusedSub.team.id : trackSubgroups[0]?.team.id;
                              if (file && onDirectUpload && targetTeamId) onDirectUpload(targetTeamId, file);
                              e.target.value = '';
                            }}
                          />
                        </label>
                      )}
                      <button
                        type="button"
                        onClick={() => onOpenLightbox({ url: currentSingleMedia.url, title: track.title, caption: currentSingleMedia.caption })}
                        className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-black flex items-center gap-2 cursor-pointer transition-colors shrink-0 shadow-md shadow-amber-500/20"
                      >
                        <ZoomIn className="w-4 h-4 text-slate-950" />
                        <span>{isEl ? 'Μεγέθυνση Προβολέα' : 'Projector Zoom'}</span>
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="relative overflow-hidden">
                  <img
                    src={defaultIllustration}
                    alt={track.title}
                    className="w-full h-80 sm:h-[460px] lg:h-[540px] object-cover bg-slate-950"
                  />
                  <div className="p-4 sm:p-5 bg-slate-950/95 border-t border-slate-800 flex items-center justify-between gap-4 flex-wrap">
                    <div className="min-w-0">
                      <span className="text-[10px] font-black uppercase tracking-wider text-amber-400 block">
                        {isEl ? 'ΕΠΙΣΤΗΜΟΝΙΚΟ ΔΙΑΓΡΑΜΜΑ ΠΥΛΩΝΑ' : 'THEMATIC TOPIC DIAGRAM'}
                      </span>
                      <p className="text-xs sm:text-sm font-semibold text-slate-200 truncate mt-0.5">
                        {isEl ? 'Έτοιμο για προβολή στην τάξη' : 'Classroom ready presentation diagram'}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* ================= 4. DIFFERENTIATED SURVEY / OPINION POLL CHOICES (SIDE-BY-SIDE) ================= */}
        {surveyQuestions.length > 0 && (
          <div className="p-6 sm:p-8 rounded-[32px] bg-gradient-to-br from-indigo-950/40 via-slate-900 to-slate-950 border-2 border-indigo-500/50 space-y-6 shadow-2xl">
            <div className="flex items-center justify-between gap-3 flex-wrap pb-4 border-b border-indigo-500/30">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-2xl bg-indigo-500/20 border border-indigo-500/40 text-indigo-400 flex items-center justify-center text-xl shrink-0">
                  <Vote className="w-5 h-5 text-indigo-400" />
                </div>
                <div>
                  <h3 className="text-base sm:text-lg font-black text-white flex items-center gap-2">
                    <span>{isEl ? '🗳️ Δημοσκόπηση & Αποφάσεις Προτεραιότητας Υποομάδων (Survey Choices)' : '🗳️ Subgroup Opinion Poll & Decision Consensus'}</span>
                    <span className="px-2.5 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/40 text-[10px] font-bold">
                      {isEl ? 'Διαφοροποιημένες Επιλογές' : 'Differentiated Choices'}
                    </span>
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    {isEl
                      ? 'Σύγκριση των προτεραιοτήτων και της αιτιολόγησης που εξέφρασε κάθε μαθητική ομάδα για τη διατήρηση του Γύπα'
                      : 'Comparison of priority conservation measures and justifications expressed by each student subgroup'}
                  </p>
                </div>
              </div>
            </div>

            {/* Questions List */}
            <div className="space-y-6">
              {surveyQuestions.map((sq) => (
                <div key={sq.id} className="space-y-3">
                  <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800">
                    <span className="text-[10px] font-black uppercase text-amber-400 block tracking-wider">
                      {isEl ? 'ΕΡΩΤΗΣΗ ΔΗΜΟΣΚΟΠΗΣΗΣ / ΔΙΑΒΟΥΛΕΥΣΗΣ:' : 'OPINION POLL QUERY:'}
                    </span>
                    <h4 className="font-bold text-white text-sm sm:text-base mt-0.5">
                      {isEl ? sq.title : sq.title_en || sq.title}
                    </h4>
                    <p className="text-xs text-slate-300 mt-1">
                      {isEl ? sq.description : sq.description_en || sq.description}
                    </p>
                  </div>

                  {/* Side-by-Side Subgroup Survey Answers */}
                  <div className={`grid grid-cols-1 ${trackSubgroups.length === 2 ? 'md:grid-cols-2' : 'md:grid-cols-3'} gap-4`}>
                    {trackSubgroups.map((sub) => {
                      const response = sub.surveyResponses?.find((r: any) => r.question.id === sq.id);
                      const isAnswered = Boolean(response && response.isSubmitted && response.selectedOptions.length > 0);
                      const subLang = sub.effectiveLang || 'el';

                      return (
                        <div
                          key={sub.team.id}
                          style={{ borderColor: `${sub.team.color}60` }}
                          className="p-5 rounded-2xl bg-slate-950/90 border flex flex-col justify-between space-y-3"
                        >
                          {/* Subgroup Header */}
                          <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                            <div className="flex items-center gap-2">
                              <span className="text-xl">{sub.team.avatar}</span>
                              <span className="font-bold text-xs text-white">
                                {isEl ? sub.team.name : sub.team.name_en || sub.team.name}
                              </span>
                            </div>
                            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-800 text-slate-300 border border-slate-700">
                              {subLang === 'el' ? '🇬🇷 EL' : '🇬🇧 EN'}
                            </span>
                          </div>

                          {/* Selected Vote / Choice */}
                          <div className="space-y-2">
                            <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block">
                              {isEl ? 'Επιλογή Προτεραιότητας Ομάδας:' : 'Subgroup Chosen Priority:'}
                            </span>
                            {isAnswered ? (
                              <div className="space-y-1.5">
                                {response.selectedOptions.map((opt: string, oIdx: number) => (
                                  <div
                                    key={oIdx}
                                    className="p-2.5 rounded-xl bg-emerald-500/15 border border-emerald-500/40 text-emerald-300 text-xs font-bold flex items-start gap-2"
                                  >
                                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                                    <span>{opt}</span>
                                  </div>
                                ))}
                              </div>
                            ) : (
                              <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 text-slate-500 text-xs italic flex items-center gap-2">
                                <Clock className="w-4 h-4" />
                                <span>{isEl ? 'Εκκρεμεί η ψηφοφορία της ομάδας' : 'Subgroup vote pending submission'}</span>
                              </div>
                            )}
                          </div>

                          {/* Subgroup Reason / Justification */}
                          <div className="pt-2 border-t border-slate-800/80">
                            <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block mb-1">
                              {isEl ? 'Αιτιολόγηση Απόφασης:' : 'Justification Reasoning:'}
                            </span>
                            {response?.reason ? (
                              <blockquote className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-xs italic text-slate-200 leading-relaxed font-medium">
                                "{response.reason}"
                              </blockquote>
                            ) : isAnswered ? (
                              <span className="text-xs text-slate-400 italic">
                                {isEl ? '✓ Κατοχυρωμένη ομοφωνία ομάδας' : '✓ Team consensus certified'}
                              </span>
                            ) : (
                              <span className="text-xs text-slate-500 italic">
                                {isEl ? '—' : '—'}
                              </span>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ================= 5. DIFFERENTIATED STUDENT REFLECTIONS & WOW MOMENTS ================= */}
        <div className="space-y-4">
          <div className="flex items-center justify-between text-xs font-black uppercase tracking-wider text-slate-400">
            <span className="text-white flex items-center gap-2">
              <Quote className="w-4 h-4 text-amber-400" />
              <span className="text-sm font-black">
                {hasMultipleSubgroups && activeFocusedId === 'all'
                  ? (isEl ? 'Αναστοχασμός & Προσωπικά Συμπεράσματα ανά Υποομάδα (Side-by-Side)' : 'Subgroup Reflections & Personal Takeaways (Side-by-Side)')
                  : (isEl ? 'Αναστοχασμός Ομάδας & Wow Moment' : 'Team Reflection & Wow Moment')}
              </span>
            </span>
            <span className="text-amber-400 font-mono text-[11px]">
              {isEl ? '★ Φωνή των Μαθητών' : '★ Student Voice'}
            </span>
          </div>

          {/* SIDE-BY-SIDE REFLECTIONS: When multiple subgroups share this track */}
          {hasMultipleSubgroups && activeFocusedId === 'all' ? (
            <div className={`grid grid-cols-1 ${trackSubgroups.length === 2 ? 'md:grid-cols-2' : 'md:grid-cols-3'} gap-5`}>
              {trackSubgroups.map((sub) => {
                const subLang = sub.effectiveLang || 'el';
                return (
                  <div
                    key={sub.team.id}
                    style={{
                      borderColor: `${sub.team.color}80`,
                      background: `linear-gradient(135deg, ${sub.team.color}15 0%, #030712 55%, ${sub.team.color}10 100%)`,
                      boxShadow: `0 15px 40px -15px ${sub.team.color}30`
                    }}
                    className="relative overflow-hidden rounded-[28px] p-6 border-2 shadow-xl flex flex-col justify-between space-y-4"
                  >
                    <div className="space-y-3">
                      <div className="flex items-center justify-between gap-2 pb-3 border-b border-slate-800">
                        <div className="flex items-center gap-2.5">
                          <span className="text-2xl">{sub.team.avatar}</span>
                          <div>
                            <span className="font-bold text-sm text-white block">
                              {isEl ? sub.team.name : sub.team.name_en || sub.team.name}
                            </span>
                            <span className="text-[10px] text-slate-400 font-mono">
                              {subLang === 'el' ? '🇬🇷 Ελληνικά' : '🇬🇧 English'}
                            </span>
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={() => onEditReflection(sub.team, sub.studentReflection)}
                          className="px-2.5 py-1 rounded-xl bg-slate-900/90 hover:bg-slate-800 text-slate-300 hover:text-amber-300 border border-slate-700 text-[11px] font-bold flex items-center gap-1 cursor-pointer transition-colors"
                        >
                          <Edit3 className="w-3 h-3 text-amber-400" />
                          <span>{isEl ? 'Επεξεργασία' : 'Edit'}</span>
                        </button>
                      </div>

                      <blockquote className="text-base sm:text-lg font-bold italic text-slate-100 leading-relaxed py-1">
                        {sub.studentReflection?.startsWith('«') || sub.studentReflection?.startsWith('“') || sub.studentReflection?.startsWith('"')
                          ? sub.studentReflection
                          : `«${sub.studentReflection || ''}»`}
                      </blockquote>
                    </div>

                    <div className="pt-2 border-t border-slate-800/80 text-[11px] text-slate-400 italic">
                      «{isEl ? sub.team.slogan : sub.team.slogan_en || sub.team.slogan}»
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            /* Single reflection prominent box */
            <div
              style={{
                borderColor: `${primaryColor}80`,
                background: `linear-gradient(135deg, ${primaryColor}18 0%, #030712 55%, ${primaryColor}10 100%)`,
                boxShadow: `0 20px 60px -15px ${primaryColor}35`
              }}
              className="relative overflow-hidden rounded-[32px] p-6 sm:p-8 border-2 shadow-2xl transition-all"
            >
              <div className="relative z-10 space-y-4">
                <div className="flex items-center justify-between gap-3 flex-wrap">
                  <div className="flex items-center gap-3">
                    <div
                      className="w-11 h-11 rounded-2xl flex items-center justify-center text-xl shadow-lg border shrink-0"
                      style={{
                        backgroundColor: `${primaryColor}30`,
                        borderColor: `${primaryColor}70`,
                        color: primaryColor
                      }}
                    >
                      <Quote className="w-5 h-5 fill-current" />
                    </div>
                    <div>
                      <span className="text-xs sm:text-sm font-black uppercase tracking-wider text-white block">
                        {isEl ? 'Αναστοχασμός Ομάδας & Wow Moment' : 'Team Reflection & Wow Moment'}
                      </span>
                      <span className="text-[11px] text-slate-400 block font-medium mt-0.5">
                        {isEl
                          ? 'Τι εντυπωσίασε και τι έμαθε η ομάδα κατά τη διάρκεια της αποστολής'
                          : 'What captivated and enlightened the team during their field investigations'}
                      </span>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => onEditReflection(focusedSub ? focusedSub.team : trackSubgroups[0]?.team, focusedSub ? focusedSub.studentReflection : trackSubgroups[0]?.studentReflection)}
                    className="px-4 py-2 rounded-xl bg-slate-900/90 hover:bg-slate-800 text-slate-200 border border-slate-700/80 hover:border-amber-400 text-xs font-bold flex items-center gap-2 cursor-pointer transition-all shadow-md group shrink-0"
                  >
                    <Edit3 className="w-3.5 h-3.5 text-amber-400 group-hover:scale-110 transition-transform" />
                    <span>{isEl ? 'Επεξεργασία Αναστοχασμού' : 'Edit Reflection'}</span>
                  </button>
                </div>

                <div className="py-2 px-1 sm:px-2">
                  <blockquote className="text-lg sm:text-xl md:text-2xl font-bold italic text-slate-100 leading-relaxed tracking-tight">
                    {(() => {
                      const text = focusedSub ? focusedSub.studentReflection : trackSubgroups[0]?.studentReflection || '';
                      return text.startsWith('«') || text.startsWith('“') || text.startsWith('"') ? text : `«${text}»`;
                    })()}
                  </blockquote>
                </div>
              </div>
            </div>
          )}

          {/* Core Graphic Wow Moments Cards (Unified for Track) */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
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

        {/* ================= 6. UNIFIED AUTHORITATIVE SCIENTIFIC FACTS & DISCOVERIES ================= */}
        <div className="space-y-4">
          <div className="flex items-center justify-between text-xs font-black uppercase tracking-wider text-slate-400">
            <span className="text-white flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-cyan-400" />
              <span className="text-sm font-black">
                {isEl ? 'Κατοχυρωμένα Επιστημονικά Δεδομένα Πυλώνα' : 'Recorded Thematic Scientific Truths'}
              </span>
            </span>
            <span className="text-cyan-400 font-mono text-[11px]">
              {allTrackBaselineFacts.length} {isEl ? 'επιστημονικά σημεία' : 'science facts'}
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {allTrackBaselineFacts.slice(0, 6).map((fact, fIdx) => (
              <div
                key={fact.taskId || fIdx}
                className="p-5 rounded-3xl border transition-all space-y-3 flex flex-col justify-between group shadow-xl bg-gradient-to-br from-slate-900 to-slate-950 border-slate-800 hover:border-slate-700"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-2.5">
                    <span className="text-2xl p-2 rounded-xl bg-slate-950 border border-slate-800 shadow-inner">
                      {fact.icon || '🔬'}
                    </span>
                    <span className="px-2.5 py-0.5 rounded-lg text-[10px] font-black uppercase tracking-wider border bg-emerald-500/20 text-emerald-300 border-emerald-500/50">
                      {isEl ? '✓ Επαληθευμένη Γνώση' : '✓ Verified Science'}
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

        {/* ================= 7. SUBGROUPS MISSIONS SNAPSHOT & FIELD VOICE ================= */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
          {/* Subgroups Tasks Snapshot */}
          <div className="p-5 rounded-3xl bg-slate-900/80 border border-slate-800 space-y-3 shadow-lg">
            <div className="flex items-center justify-between text-xs font-bold text-slate-300">
              <span className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span className="text-sm font-black">{isEl ? 'Πρόοδος Αποστολών ανά Υποομάδα' : 'Subgroup Mission Progress'}</span>
              </span>
              <span className="text-amber-400 font-mono text-xs">
                {trackSubgroups.length} {isEl ? 'υποομάδες' : 'groups'}
              </span>
            </div>

            <div className="space-y-2">
              {trackSubgroups.map((sub) => (
                <div
                  key={sub.team.id}
                  className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between text-xs"
                >
                  <div className="flex items-center gap-2">
                    <span>{sub.team.avatar}</span>
                    <span className="font-bold text-white">{isEl ? sub.team.name : sub.team.name_en || sub.team.name}</span>
                    <span className="text-[10px] px-1.5 py-0.2 rounded bg-slate-800 text-slate-400 font-mono">
                      {sub.effectiveLang === 'el' ? '🇬🇷' : '🇬🇧'}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-slate-400 font-mono">
                      {sub.solvedTasks?.length || 0} / {sub.totalQuestions || 15}
                    </span>
                    <span style={{ color: sub.team.color }} className="font-black font-mono">
                      {sub.totalScore} pts
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Subgroups Field Voice */}
          <div className="p-5 rounded-3xl bg-slate-900/80 border border-slate-800 space-y-3 shadow-lg">
            <div className="flex items-center justify-between text-xs font-bold text-slate-300">
              <span className="flex items-center gap-2">
                <MessageSquare className="w-4 h-4 text-cyan-400" />
                <span className="text-sm font-black">{isEl ? 'Σημειώσεις & Φωνή Πεδίου Μαθητών' : 'Student Field Notes & Voice'}</span>
              </span>
              <span className="text-cyan-400 font-mono text-xs">
                {poster.combinedNotes?.length || 0}
              </span>
            </div>

            <div className="space-y-2 max-h-44 overflow-y-auto pr-1 scrollbar-thin">
              {(!poster.combinedNotes || poster.combinedNotes.length === 0) ? (
                <p className="text-xs text-slate-500 italic py-4 text-center">
                  {isEl ? 'Καμία σημείωση πεδίου ακόμα.' : 'No field notes logged yet.'}
                </p>
              ) : (
                poster.combinedNotes.map((note: any) => (
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

      {/* ================= 8. POSTER FOOTER ACTIONS ================= */}
      <div className="pt-4 border-t border-slate-800/80 flex items-center justify-between gap-4 flex-wrap">
        <button
          type="button"
          onClick={onGoToMissions}
          className="text-xs sm:text-sm font-bold text-amber-400 hover:text-amber-300 flex items-center gap-2 cursor-pointer transition-colors"
        >
          <span>{isEl ? '→ Προβολή Όλων των Αποστολών του Πυλώνα' : '→ View All Thematic Track Missions'}</span>
          <ArrowRight className="w-4 h-4" />
        </button>

        <span className="text-[11px] text-slate-500 uppercase tracking-widest font-mono">
          LIFE WITH VULTURES CYPRUS · MODERN SCIENTIFIC INFOGRAPHIC EXHIBIT
        </span>
      </div>
    </article>
  );
};
