import { GameState } from '../types/game';
import { SVG_IMAGES } from './vultureAssets';
import {
  VULTURE_TEAMS,
  VULTURES_QUESTS,
  BIOLOGY_QUESTS,
  ECOLOGY_QUESTS,
  THREATS_QUESTS,
  CONSERVATION_QUESTS,
  SYNTHESIS_QUESTS,
  VULTURES_GAME_STATE,
  getPaginatedVultureQuests
} from './vulturesData';

export {
  SVG_IMAGES,
  VULTURE_TEAMS,
  VULTURES_QUESTS,
  BIOLOGY_QUESTS,
  ECOLOGY_QUESTS,
  THREATS_QUESTS,
  CONSERVATION_QUESTS,
  SYNTHESIS_QUESTS,
  VULTURES_GAME_STATE,
  getPaginatedVultureQuests
};

export const EPIC_CHALLENGE_GAME_STATE: GameState = {
  id: 'arena-session-1',
  title: 'BoundPad Epic Challenge',
  description: 'Διαδραστικό κυνήγι γνώσης & δεξιοτήτων ομάδων',
  title_en: 'BoundPad Epic Challenge',
  description_en: 'Interactive Team Knowledge & Skills Quest',
  phase: 'waiting_lobby',
  synthesisPrompt: 'Συνθέστε τα συμπεράσματα, τα στοιχεία και τις πληροφορίες που αντλήσατε από τις αποστολές για τη συζήτηση στην τάξη:',
  synthesisPrompt_en: 'Synthesize your findings, evidence, and discoveries from the quests for the classroom discussion:',
  synthesisNotes: [],
  activeRound: 1,
  updatedAt: Date.now(),
  timer: {
    totalSeconds: 1200, // 20 minutes default
    remainingSeconds: 1200,
    isRunning: false,
    updatedAt: Date.now()
  },
  teams: [
    {
      id: 'team-alpha',
      name: 'Ομάδα Α: Οι Εξερευνητές',
      name_en: 'Team A: The Explorers',
      color: '#10b981', // Emerald
      avatar: '🧭',
      slogan: 'Ανακαλύπτουμε τα πάντα!',
      slogan_en: 'Discovering everything!'
    },
    {
      id: 'team-beta',
      name: 'Ομάδα Β: Οι Καινοτόμοι',
      name_en: 'Team B: The Innovators',
      color: '#06b6d4', // Cyan
      avatar: '⚡',
      slogan: 'Ταχύτητα και σκέψη!',
      slogan_en: 'Speed and intellect!'
    },
    {
      id: 'team-gamma',
      name: 'Ομάδα Γ: Οι Ταξιδιώτες',
      name_en: 'Team C: The Voyagers',
      color: '#f59e0b', // Amber
      avatar: '🚀',
      slogan: 'Στοχεύουμε στα αστέρια!',
      slogan_en: 'Aiming for the stars!'
    },
    {
      id: 'team-delta',
      name: 'Ομάδα Δ: Οι Επιστήμονες',
      name_en: 'Team D: The Scientists',
      color: '#8b5cf6', // Purple
      avatar: '🔬',
      slogan: 'Η λογική κερδίζει!',
      slogan_en: 'Logic prevails!'
    }
  ],
  questions: [
    {
      id: 'quest-1',
      title: 'Κουίζ με Φωτογραφία: Ιστορικό Μνημείο',
      title_en: 'Photo Quiz: Historic Monument',
      description: 'Παρατηρήστε την εικόνα και επιλέξτε το σωστό μνημείο της αρχαίας κλασικής εποχής.',
      description_en: 'Observe the image and select the correct monument from classical antiquity.',
      type: 'multiple_choice',
      points: 100,
      imageUrl: SVG_IMAGES.parthenon,
      assignedTeamIds: ['team-alpha', 'team-gamma', 'team-delta'],
      payload: {
        options: [
          'Ο Παρθενώνας στην Ακρόπολη Αθηνών',
          'Το Κολοσσαίο στη Ρώμη',
          'Ο Ναός του Απόλλωνα στους Δελφούς',
          'Η Πύλη του Βρανδεμβούργου'
        ],
        correctOptionIndex: 0,
        correctOptionIndices: [0]
      },
      payload_en: {
        options: [
          'The Parthenon on the Acropolis of Athens',
          'The Colosseum in Rome',
          'The Temple of Apollo in Delphi',
          'The Brandenburg Gate'
        ],
        correctOptionIndex: 0,
        correctOptionIndices: [0]
      },
      explanation: 'Ο Παρθενώνας κατασκευάστηκε τον 5ο αιώνα π.Χ. προς τιμήν της θεάς Αθηνάς.',
      explanation_en: 'The Parthenon was built in the 5th century BC in honour of the goddess Athena.'
    },
    {
      id: 'quest-2',
      title: 'Σωστό ή Λάθος: Βιολογία & Φύση',
      title_en: 'True or False: Biology & Nature',
      description: 'Εξετάστε τον ακόλουθο ισχυρισμό σχετικά με τη συμπεριφορά του χαμαιλέοντα.',
      description_en: 'Evaluate the following claim regarding chameleon behaviour: "Chameleons change colour exclusively for camouflage to hide from predators."',
      type: 'true_false',
      points: 80,
      imageUrl: SVG_IMAGES.chameleon,
      assignedTeamIds: ['team-beta', 'team-delta'],
      payload: {
        correctValue: false
      },
      payload_en: {
        correctValue: false
      },
      explanation: 'Λάθος! Οι χαμαιλέοντες αλλάζουν χρώμα κυρίως για επικοινωνία, ρύθμιση θερμοκρασίας και διάθεση, και όχι αποκλειστικά για καμουφλάζ.',
      explanation_en: 'False! Chameleons change colour primarily for communication, temperature regulation, and mood, rather than solely for camouflage.'
    },
    {
      id: 'quest-3',
      title: 'Αντιστοίχιση Κειμένου: Πρωτεύουσες Ευρώπης',
      title_en: 'Text Matching: European Capitals',
      description: 'Αντιστοιχίστε κάθε χώρα με τη σωστή πρωτεύουσά της.',
      description_en: 'Match each country with its correct capital city.',
      type: 'text_match',
      points: 120,
      assignedTeamIds: ['team-alpha', 'team-beta'],
      payload: {
        pairs: [
          { id: 'p1', left: 'Ελλάδα', right: 'Αθήνα' },
          { id: 'p2', left: 'Γαλλία', right: 'Παρίσι' },
          { id: 'p3', left: 'Ιταλία', right: 'Ρώμη' },
          { id: 'p4', left: 'Πορτογαλία', right: 'Λισαβόνα' }
        ]
      },
      payload_en: {
        pairs: [
          { id: 'p1', left: 'Greece', right: 'Athens' },
          { id: 'p2', left: 'France', right: 'Paris' },
          { id: 'p3', left: 'Italy', right: 'Rome' },
          { id: 'p4', left: 'Portugal', right: 'Lisbon' }
        ]
      }
    },
    {
      id: 'quest-4',
      title: 'Αντιστοίχιση Εικόνας με Κείμενο: Επιστημονικά Όργανα',
      title_en: 'Image-to-Text Matching: Scientific Instruments',
      description: 'Συνδέστε κάθε εικόνα επιστημονικού οργάνου με το αντίστοιχο όνομα και πεδίο χρήσης.',
      description_en: 'Match each scientific instrument image with its name and field of application.',
      type: 'image_match',
      points: 150,
      assignedTeamIds: ['team-gamma', 'team-delta'],
      payload: {
        pairs: [
          { id: 'im1', image: SVG_IMAGES.telescope, text: 'Τηλεσκόπιο (Αστρονομία & Παρατήρηση Διαστήματος)' },
          { id: 'im2', image: SVG_IMAGES.microscope, text: 'Μικροσκόπιο (Βιολογία & Κυτταρική Έρευνα)' },
          { id: 'im3', image: SVG_IMAGES.compass, text: 'Πυξίδα (Προσανατολισμός & Γεωγραφία)' },
          { id: 'im4', image: SVG_IMAGES.atom, text: 'Μοντέλο Ατόμου (Κβαντική & Πυρηνική Φυσική)' }
        ]
      },
      payload_en: {
        pairs: [
          { id: 'im1', image: SVG_IMAGES.telescope, text: 'Telescope (Astronomy & Space Observation)' },
          { id: 'im2', image: SVG_IMAGES.microscope, text: 'Microscope (Biology & Cellular Research)' },
          { id: 'im3', image: SVG_IMAGES.compass, text: 'Compass (Orientation & Geography)' },
          { id: 'im4', image: SVG_IMAGES.atom, text: 'Atom Model (Quantum & Nuclear Physics)' }
        ]
      }
    },
    {
      id: 'quest-5',
      title: 'Σκανάρισμα QR Code: Μυστικός Σταθμός',
      title_en: 'QR Code Hunt: Secret Station',
      description: 'Βρείτε το QR Code του πρώτου σταθμού (κωδικός: BOUND-ALPHA-2026), σαρώστε το με την κάμερα ή πληκτρολογήστε τον κωδικό σταθμού.',
      description_en: 'Find the QR Code for Station 1 (passcode: BOUND-ALPHA-2026), scan it with the camera, or enter the station passcode.',
      type: 'qr_scan',
      points: 150,
      assignedTeamIds: ['team-alpha', 'team-delta'],
      payload: {
        targetCode: 'BOUND-ALPHA-2026',
        locationHint: 'Ο σταθμός βρίσκεται στον κεντρικό πίνακα ή στην κάρτα σταθμών του διαχειριστή.',
        unlockedMedia: {
          type: 'image',
          url: SVG_IMAGES.treasureMap,
          title: 'Χάρτης Κρυμμένου Θησαυρού',
          caption: 'Συγχαρητήρια! Ξεκλειδώσατε τον ιστορικό χάρτη της αποστολής. Μελετήστε τα σημεία ενδιαφέροντος για το επόμενο στάδιο.'
        }
      },
      payload_en: {
        targetCode: 'BOUND-ALPHA-2026',
        locationHint: 'The station is located on the main board or on the facilitator station card.',
        unlockedMedia: {
          type: 'image',
          url: SVG_IMAGES.treasureMap,
          title: 'Hidden Treasure Map',
          caption: 'Congratulations! You unlocked the historical expedition map. Study the points of interest for the next phase.'
        }
      }
    },
    {
      id: 'quest-6',
      title: 'Δημιουργική Αποστολή: Ομαδική Φωτογραφία',
      title_en: 'Creative Challenge: Team Photo',
      description: 'Βγάλτε μία διασκεδαστική ομαδική φωτογραφία όπου όλα τα μέλη σχηματίζουν ένα γράμμα ή δείχνουν με χαμόγελο προς την κάμερα!',
      description_en: 'Take a fun team photograph where all members form a letter or smile toward the camera!',
      type: 'photo_upload',
      points: 180,
      assignedTeamIds: ['team-beta', 'team-gamma'],
      payload: {
        instructions: 'Χρησιμοποιήστε την κάμερα του κινητού ή υπολογιστή ή ανεβάστε μια πρόσφατη φωτογραφία της ομάδας σας.'
      },
      payload_en: {
        instructions: 'Use your device camera or upload a recent photo of your team.'
      }
    },
    {
      id: 'quest-text-quiz',
      title: 'Κουίζ Γνώσεων: Το Μεγαλύτερο Θηλαστικό (Χωρίς Φωτογραφία)',
      title_en: 'Knowledge Quiz: The Largest Mammal',
      description: 'Ποιο από τα παρακάτω είναι το μεγαλύτερο ζώο που έχει ζήσει ποτέ στον πλανήτη Γη;',
      description_en: 'Which of the following is the largest animal ever known to have lived on planet Earth?',
      type: 'multiple_choice',
      points: 100,
      assignedTeamIds: ['team-beta', 'team-alpha'],
      payload: {
        options: [
          'Η Γαλάζια Φάλαινα (Balaenoptera musculus)',
          'Ο Αφρικανικός Ελέφαντας',
          'Ο Μεγαλόδοντας',
          'Ο Τυραννόσαυρος Ρεξ'
        ],
        correctOptionIndex: 0,
        correctOptionIndices: [0]
      },
      payload_en: {
        options: [
          'The Blue Whale (Balaenoptera musculus)',
          'The African Elephant',
          'The Megalodon',
          'The Tyrannosaurus Rex'
        ],
        correctOptionIndex: 0,
        correctOptionIndices: [0]
      },
      explanation: 'Η γαλάζια φάλαινα μπορεί να φτάσει σε μήκος τα 30 μέτρα και βάρος τους 190 τόνους!',
      explanation_en: 'The blue whale can reach up to 30 metres in length and weigh as much as 190 tonnes!'
    },
    {
      id: 'quest-text-tf',
      title: 'Σωστό ή Λάθος: Ηλιακό Σύστημα (Χωρίς Φωτογραφία)',
      title_en: 'True or False: Solar System',
      description: 'Η Γη χρειάζεται περίπου 365 ημέρες και 6 ώρες για να ολοκληρώσει μία πλήρη περιφορά γύρω από τον Ήλιο.',
      description_en: 'Earth takes approximately 365 days and 6 hours to complete one full revolution around the Sun.',
      type: 'true_false',
      points: 90,
      assignedTeamIds: ['team-gamma', 'team-delta'],
      payload: {
        correctValue: true
      },
      payload_en: {
        correctValue: true
      },
      explanation: 'Σωστό! Για τον λόγο αυτό προσθέτουμε μία επιπλέον ημέρα κάθε τέσσερα έτη (δίσεκτο έτος).',
      explanation_en: 'True! This is why we add an extra day every four years (leap year).'
    },
    {
      id: 'quest-7',
      title: 'Παζλ Εικόνας: Ο Χάρτης των Θησαυρών',
      title_en: 'Jigsaw Puzzle: Treasure Map',
      description: 'Ανασυνθέστε την εικόνα ενώνοντας τα κομμάτια! Μπορείτε να επιλέξετε 4, 6 ή 9 κομμάτια.',
      description_en: 'Reconstruct the image by connecting the pieces! You can choose 4, 6, or 9 pieces.',
      type: 'puzzle',
      points: 200,
      imageUrl: SVG_IMAGES.treasureMap,
      assignedTeamIds: ['team-alpha', 'team-beta', 'team-gamma', 'team-delta'],
      payload: {
        imageUrl: SVG_IMAGES.treasureMap,
        gridPieces: 6 // 6 pieces (3x2) default, selectable 4, 6, 9
      },
      payload_en: {
        imageUrl: SVG_IMAGES.treasureMap,
        gridPieces: 6
      }
    },
    {
      id: 'quest-8',
      title: 'Αποστολή Πεδίου: Έρευνα & Συνεργασία',
      title_en: 'Field Mission: Research & Collaboration',
      description: 'Εκτελέστε τα βήματα της αποστολής με την ομάδα σας, σημειώστε τα ευρήματα και υποβάλετε την αναφορά σας!',
      description_en: 'Execute the mission steps with your team, record your findings, and submit your report!',
      type: 'task',
      points: 220,
      imageUrl: SVG_IMAGES.compass,
      assignedTeamIds: ['team-alpha', 'team-beta', 'team-gamma', 'team-delta'],
      payload: {
        instructions: 'Εντοπίστε 3 ιστορικά ή επιστημονικά στοιχεία στον χώρο, καταγράψτε τα και υποβάλετε την αναφορά και φωτογραφία της ομάδας!',
        checklist: [
          'Βήμα 1: Συγκέντρωση της ομάδας & ανάθεση ρόλων',
          'Βήμα 2: Εντοπισμός και καταγραφή των 3 στοιχείων',
          'Βήμα 3: Σύνταξη σύντομης αναφοράς και λήψη τελικής φωτογραφίας'
        ],
        requiresEvidence: 'both',
        completionPrompt: 'Γράψτε εδώ τη σύντομη αναφορά των ευρημάτων σας:'
      },
      payload_en: {
        instructions: 'Locate 3 historical or scientific artifacts in the area, document them, and submit your team report and photo!',
        checklist: [
          'Step 1: Gather the team & assign roles',
          'Step 2: Locate and document the 3 elements',
          'Step 3: Write a brief summary report and take a final team photo'
        ],
        requiresEvidence: 'both',
        completionPrompt: 'Enter your brief report of findings here:'
      },
      explanation: 'Εξαιρετική ομαδική συνεργασία και επιτυχής ολοκλήρωση αποστολής πεδίου!',
      explanation_en: 'Outstanding teamwork and successful completion of the field mission!'
    },
    {
      id: 'quest-delta-mc',
      title: 'Κουίζ Πολλαπλής Επιλογής: Επιστημονική Μέθοδος & Έρευνα',
      title_en: 'Multiple Choice Quiz: Scientific Method & Research',
      description: 'Ποιες από τις παρακάτω προτάσεις ισχύουν για την επιστημονική μέθοδο και τα πειράματα; (Προσοχή: Υπάρχουν περισσότερες από μία σωστές απαντήσεις!)',
      description_en: 'Which of the following statements apply to the scientific method and experiments? (Note: More than one answer is correct!)',
      type: 'multiple_choice',
      points: 140,
      imageUrl: SVG_IMAGES.telescope,
      assignedTeamIds: ['team-delta', 'team-beta'],
      payload: {
        options: [
          'Ένα επιστημονικό πείραμα πρέπει να μπορεί να επαναληφθεί από άλλους ερευνητές',
          'Μια επιστημονική υπόθεση ελέγχεται πάντα με παρατηρήσεις, δεδομένα και δοκιμές',
          'Μια επιστημονική θεωρία δεν επιτρέπεται ποτέ να αμφισβητηθεί ή να τροποποιηθεί',
          'Τα αποτελέσματα καταγράφονται αντικειμενικά με μετρήσεις και στοιχεία'
        ],
        correctOptionIndex: 0,
        correctOptionIndices: [0, 1, 3]
      },
      payload_en: {
        options: [
          'A scientific experiment must be reproducible by other researchers',
          'A hypothesis is always tested with observations, data, and tests',
          'A scientific theory can never be challenged or modified',
          'Results are recorded objectively using measurements and evidence'
        ],
        correctOptionIndex: 0,
        correctOptionIndices: [0, 1, 3]
      },
      explanation: 'Σωστά! Η επιστημονική μέθοδος βασίζεται στην επαναληψιμότητα, τον έλεγχο υποθέσεων και τις αντικειμενικές μετρήσεις. Οι επιστημονικές θεωρίες εξελίσσονται διαρκώς όταν προκύπτουν νέα δεδομένα.',
      explanation_en: 'Correct! The scientific method relies on repeatability, hypothesis testing, and objective measurements. Scientific theories constantly evolve as new evidence emerges.'
    },
    {
      id: 'quest-delta-station',
      title: 'Σταθμός QR Εργαστηρίου: Μυστικό Πείραμα',
      title_en: 'Laboratory QR Station: Secret Experiment',
      description: 'Βρείτε το QR Code του εργαστηρίου της 4ης ομάδας (κωδικός: LAB-DELTA-2026), σαρώστε το με την κάμερα για να ξεκλειδώσετε το επιστημονικό υλικό!',
      description_en: 'Find the 4th team laboratory QR Code (passcode: LAB-DELTA-2026), scan it with the camera to unlock the scientific material!',
      type: 'qr_scan',
      points: 150,
      assignedTeamIds: ['team-delta', 'team-alpha'],
      payload: {
        targetCode: 'LAB-DELTA-2026',
        locationHint: 'Ο σταθμός βρίσκεται στον πάγκο εργαστηρίου ή στην κάρτα επιστημών της 4ης ομάδας.',
        unlockedMedia: {
          type: 'image',
          url: SVG_IMAGES.atom,
          title: 'Μοντέλο Ατόμου & Εργαστηριακό Υλικό',
          caption: 'Συγχαρητήρια στην Ομάδα Δ! Ξεκλειδώσατε το επιστημονικό μοντέλο του εργαστηρίου.'
        }
      },
      payload_en: {
        targetCode: 'LAB-DELTA-2026',
        locationHint: 'The station is located at the laboratory bench or on the 4th team science card.',
        unlockedMedia: {
          type: 'image',
          url: SVG_IMAGES.atom,
          title: 'Atomic Model & Laboratory Material',
          caption: 'Congratulations to Team D! You unlocked the laboratory scientific model.'
        }
      }
    },
    {
      id: 'quest-delta-match',
      title: 'Αντιστοίχιση Κειμένου: Σπουδαίες Επιστημονικές Ανακαλύψεις',
      title_en: 'Text Matching: Great Scientific Discoveries',
      description: 'Συνδέστε κάθε σπουδαίο επιστήμονα με την ιστορική ανακάλυψη ή αρχή που διατύπωσε!',
      description_en: 'Match each renowned scientist with their historical discovery or formulated principle!',
      type: 'text_match',
      points: 130,
      imageUrl: SVG_IMAGES.microscope,
      assignedTeamIds: ['team-delta'],
      payload: {
        pairs: [
          { id: 'p-newton', left: 'Ισαάκ Νεύτων', right: 'Νόμος της Παγκόσμιας Έλξης' },
          { id: 'p-curie', left: 'Μαρία Κιουρί', right: 'Ραδιενέργεια & Στοιχεία Ράδιο/Πολώνιο' },
          { id: 'p-einstein', left: 'Άλμπερτ Αϊνστάιν', right: 'Θεωρία της Σχετικότητας' },
          { id: 'p-archimedes', left: 'Αρχιμήδης', right: 'Αρχή της Άνωσης & Υδροστατική' }
        ]
      },
      payload_en: {
        pairs: [
          { id: 'p-newton', left: 'Isaac Newton', right: 'Law of Universal Gravitation' },
          { id: 'p-curie', left: 'Marie Curie', right: 'Radioactivity & Radium/Polonium Elements' },
          { id: 'p-einstein', left: 'Albert Einstein', right: 'Theory of Relativity' },
          { id: 'p-archimedes', left: 'Archimedes', right: 'Principle of Buoyancy & Hydrostatics' }
        ]
      },
      explanation: 'Εξαιρετικά! Και οι τέσσερις ανακαλύψεις άλλαξαν ριζικά την πορεία της ανθρώπινης επιστήμης και τεχνολογίας.',
      explanation_en: 'Superb! All four discoveries fundamentally transformed human science and technology.'
    },
    {
      id: 'quest-delta-creative',
      title: 'Δημιουργική Αποστολή: Το Σύμβολο των Επιστημόνων',
      title_en: "Creative Challenge: The Scientists' Emblem",
      description: 'Βγάλτε μία διασκεδαστική ομαδική φωτογραφία όπου όλα τα μέλη συνεργάζονται σαν ερευνητική ομάδα εργαστηρίου ή σχηματίζουν με τα χέρια τους το σύμβολο του ατόμου!',
      description_en: 'Take a fun team photo where all members collaborate like a laboratory research squad or form an atom symbol with their hands!',
      type: 'photo_upload',
      points: 160,
      imageUrl: SVG_IMAGES.atom,
      assignedTeamIds: ['team-delta'],
      payload: {
        instructions: 'Χρησιμοποιήστε την κάμερα του υπολογιστή/κινητού ή ανεβάστε μια φωτογραφία της Ομάδας Δ εν δράσει!'
      },
      payload_en: {
        instructions: 'Use your device camera or upload a photo of Team D in action!'
      },
      explanation: 'Η φωτογραφία της Ομάδας Δ κατοχυρώθηκε με επιτυχία στο αρχείο ερευνών!',
      explanation_en: "Team D's photograph was successfully registered in the research archive!"
    }
  ],
  submissions: {}
};

export const ALL_COMBINED_GAME_STATE: GameState = {
  id: 'combined-all-quests-arena',
  title: 'BoundPad All-Stars: Πλήρης Συλλογή 46 Αποστολών',
  description: 'Πλήρης συλλογή 46 αποστολών που περιλαμβάνει όλες τις 32 αποστολές των 4 γυπών της Ελλάδας και τις 14 ερωτήσεις επιστήμης & γενικών γνώσεων.',
  title_en: 'BoundPad All-Stars: Complete 46-Quest Arena',
  description_en: 'Complete collection of 46 quests featuring all 32 Greek vulture conservation missions plus 14 science & knowledge questions.',
  phase: 'waiting_lobby',
  synthesisPrompt: 'Συνθέστε τα συμπεράσματα και τα επιστημονικά δεδομένα που συλλέξατε από όλες τις αποστολές.',
  synthesisPrompt_en: 'Synthesize your findings and scientific data gathered across all missions.',
  synthesisNotes: [],
  activeRound: 1,
  updatedAt: Date.now(),
  timer: {
    totalSeconds: 2400,
    remainingSeconds: 2400,
    isRunning: false,
    updatedAt: Date.now()
  },
  teams: VULTURES_GAME_STATE.teams,
  questions: [
    ...VULTURES_GAME_STATE.questions,
    ...EPIC_CHALLENGE_GAME_STATE.questions
  ],
  submissions: {}
};

// Initial default active state loaded by the application
export const INITIAL_GAME_STATE: GameState = VULTURES_GAME_STATE;
