// ============================================================================
// MASTER TASK POOL - STRICTLY 61 REAL CUSTOM QUESTIONS FOR CYPRUS GRIFFON VULTURES
// Mapped precisely to the 4 Groups:
// Group 1 (team-alpha): Identity & Basics (15 questions including checkpoint #36)
// Group 2 (team-beta): Habitat, Nesting & Flight (15 questions: Episkopi, thermals, 100+ km)
// Group 3 (team-gamma): Diet & Biology (15 questions: scavengers, bald neck, pH 1, QR #56)
// Group 4 (team-delta): Threats & Conservation (16 questions: poisons, 4 stations, K9, pledge)
// Zero generic placeholders. 100% real scientific educational content.
// ============================================================================

import { Question, Team, Submission } from "../types/game";

export const masterTeamsPool: Team[] = [
  {
    "id": "team-alpha",
    "name": "Ομάδα 1: Ταυτότητα & Γενικά Χαρακτηριστικά",
    "name_en": "Group 1: Identity & Basics",
    "color": "#10b981",
    "avatar": "🧭",
    "slogan": "Ανακαλύπτουμε τα πάντα για το Όρνιο!",
    "slogan_en": "Discovering all about the Griffon Vulture!"
  },
  {
    "id": "team-beta",
    "name": "Ομάδα 2: Περιβάλλον, Φωλεοποίηση & Πτήση",
    "name_en": "Group 2: Habitat, Nesting & Flight",
    "color": "#06b6d4",
    "avatar": "⚡",
    "slogan": "Κυρίαρχοι των γκρεμών και των αιθέρων!",
    "slogan_en": "Masters of the cliffs and the skies!"
  },
  {
    "id": "team-gamma",
    "name": "Ομάδα 3: Διατροφή & Βιολογία",
    "name_en": "Group 3: Diet & Biology",
    "color": "#f59e0b",
    "avatar": "🚀",
    "slogan": "Οι καθαριστές της κυπριακής φύσης!",
    "slogan_en": "The sanitary guardians of nature!"
  },
  {
    "id": "team-delta",
    "name": "Ομάδα 4: Απειλές & Προστασία",
    "name_en": "Group 4: Threats & Conservation",
    "color": "#8b5cf6",
    "avatar": "🔬",
    "slogan": "Δράση και λύσεις για το μέλλον!",
    "slogan_en": "Action and solutions for the future!"
  }
];

export const masterTaskPool: Question[] = [
  {
    "id": "cyprus-vulture-1",
    "title": "Είδος Γύπα στην Κύπρο (Gyps fulvus)",
    "title_en": "Griffon Vulture Species (Gyps fulvus)",
    "description": "Ποιο είναι το μοναδικό είδος γύπα που ζει και αναπαράγεται σήμερα στην Κύπρο;",
    "description_en": "Which is the unique vulture species living and breeding in Cyprus today?",
    "type": "multiple_choice",
    "points": 100,
    "assignedTeamIds": [
      "team-alpha"
    ],
    "isActive": true,
    "payload": {
      "options": [
        "Όρνιο ή Γύπας ο πυρόχρους (Gyps fulvus)",
        "Χρυσαετός (Aquila chrysaetos)",
        "Σπιζαετός (Aquila fasciata)",
        "Κοράκι (Corvus corax)"
      ],
      "correctOptionIndex": 0
    },
    "payload_en": {
      "options": [
        "Griffon Vulture (Gyps fulvus)",
        "Golden Eagle (Aquila chrysaetos)",
        "Bonelli's Eagle (Aquila fasciata)",
        "Common Raven (Corvus corax)"
      ],
      "correctOptionIndex": 0
    },
    "explanation": "Στην Κύπρο επιβιώνει μόνο ένα είδος γύπα: το Όρνιο (Gyps fulvus), γνωστό και ως Γύπας ο πυρόχρους.",
    "explanation_en": "Only one species of vulture survives in Cyprus: the Griffon Vulture (Gyps fulvus)."
  },
  {
    "id": "cyprus-vulture-2",
    "title": "Άνοιγμα Πτερύγων (Wingspan ~2.5m)",
    "title_en": "Wingspan (~2.5m)",
    "description": "Πόσο φτάνει το εντυπωσιακό άνοιγμα των πτερύγων ενός ενήλικου Όρνιου στην Κύπρο;",
    "description_en": "What is the impressive wingspan of an adult Griffon Vulture in Cyprus?",
    "type": "multiple_choice",
    "points": 100,
    "assignedTeamIds": [
      "team-alpha"
    ],
    "isActive": true,
    "payload": {
      "options": [
        "Περίπου 2.4 έως 2.8 μέτρα (κατά μέσο όρο 2.5m)",
        "Περίπου 1 μέτρο",
        "Περίπου 4 μέτρα",
        "Μόλις 60 εκατοστά"
      ],
      "correctOptionIndex": 0
    },
    "payload_en": {
      "options": [
        "About 2.4 to 2.8 metres (average 2.5m)",
        "About 1 metre",
        "About 4 metres",
        "Only 60 centimetres"
      ],
      "correctOptionIndex": 0
    },
    "explanation": "Το Όρνιο είναι ένα από τα μεγαλύτερα πουλιά της Ευρώπης, με άνοιγμα πτερύγων που αγγίζει τα 2.5 με 2.8 μέτρα.",
    "explanation_en": "The Griffon Vulture is one of Europe's largest birds, boasting a massive wingspan reaching 2.5 to 2.8 metres."
  },
  {
    "id": "cyprus-vulture-3",
    "title": "Κατάσταση Πληθυσμού στην Κύπρο (Critically Endangered)",
    "title_en": "Population Status in Cyprus (Critically Endangered)",
    "description": "Ποια είναι η κατάσταση διατήρησης του Γύπα στην Κύπρο σύμφωνα με το Κόκκινο Βιβλίο των Απειλούμενων Ειδών;",
    "description_en": "What is the conservation status of the Griffon Vulture in Cyprus according to the Red Data Book?",
    "type": "multiple_choice",
    "points": 110,
    "assignedTeamIds": [
      "team-alpha"
    ],
    "isActive": true,
    "payload": {
      "options": [
        "Κρίσιμα Κινδυνεύον (Critically Endangered) - ο πληθυσμός μετρά ελάχιστα αναπαραγωγικά πουλιά",
        "Κοινό και άφθονο είδος χωρίς καμία απειλή",
        "Είδος με υπερπληθυσμό στην ύπαιθρο",
        "Είδος ελάχιστης ανησυχίας (Least Concern)"
      ],
      "correctOptionIndex": 0
    },
    "payload_en": {
      "options": [
        "Critically Endangered - the population counts very few breeding individuals",
        "Common and abundant species without any threat",
        "Species with overpopulation in the countryside",
        "Least Concern"
      ],
      "correctOptionIndex": 0
    },
    "explanation": "Στην Κύπρο το Όρνιο κατατάσσεται ως Κρίσιμα Κινδυνεύον (CR), καθώς ο ντόπιος πληθυσμός έφτασε σε ιστορικό χαμηλό με λιγότερα από 15-20 άτομα.",
    "explanation_en": "In Cyprus, the Griffon Vulture is classified as Critically Endangered (CR), having plummeted to under 15-20 wild birds."
  },
  {
    "id": "cyprus-vulture-4",
    "title": "Διάρκεια Ζωής (Lifespan 20-30 έτη)",
    "title_en": "Lifespan (20-30 years)",
    "description": "Ποια είναι η φυσική διάρκεια ζωής ενός γύπα στη φύση όταν δεν απειλείται από ανθρώπινες επεμβάσεις;",
    "description_en": "What is the natural lifespan of a Griffon Vulture in the wild under undisturbed conditions?",
    "type": "multiple_choice",
    "points": 100,
    "assignedTeamIds": [
      "team-alpha"
    ],
    "isActive": true,
    "payload": {
      "options": [
        "20 έως 30 χρόνια (και έως 40+ σε ασφαλές περιβάλλον)",
        "Μόνο 2 έως 3 χρόνια",
        "Περίπου 70 έως 80 χρόνια",
        "Περίπου 6 μήνες"
      ],
      "correctOptionIndex": 0
    },
    "payload_en": {
      "options": [
        "20 to 30 years (and up to 40+ in captivity)",
        "Only 2 to 3 years",
        "About 70 to 80 years",
        "About 6 months"
      ],
      "correctOptionIndex": 0
    },
    "explanation": "Οι γύπες είναι μακρόβια αρπακτικά πουλιά. Στη φύση μπορούν να ζήσουν 20 με 30 έτη.",
    "explanation_en": "Vultures are long-lived apex scavengers, reaching 20 to 30 years of age in wild habitats."
  },
  {
    "id": "cyprus-vulture-5",
    "title": "Αριθμός Αυγών & Αναπαραγωγικός Ρυθμός (Clutch Size 1 egg)",
    "title_en": "Clutch Size (1 egg per year)",
    "description": "Πόσα αυγά γεννάει το ζευγάρι των Όρνιων κάθε χρόνο στη φωλιά του;",
    "description_en": "How many eggs does a Griffon Vulture pair lay each year in its cliff nest?",
    "type": "multiple_choice",
    "points": 100,
    "assignedTeamIds": [
      "team-alpha"
    ],
    "isActive": true,
    "payload": {
      "options": [
        "Μόνο 1 αυγό το χρόνο",
        "4 έως 6 αυγά",
        "8 έως 12 αυγά",
        "Γεννάει αυγά κάθε μήνα"
      ],
      "correctOptionIndex": 0
    },
    "payload_en": {
      "options": [
        "Only 1 single egg per year",
        "4 to 6 eggs",
        "8 to 12 eggs",
        "It lays eggs every month"
      ],
      "correctOptionIndex": 0
    },
    "explanation": "Το Όρνιο έχει εξαιρετικά χαμηλό αναπαραγωγικό ρυθμό: γεννά μόνο 1 λευκό αυγό ανά έτος (συνήθως Ιανουάριο-Φεβρουάριο).",
    "explanation_en": "Griffon Vultures have slow reproductive biology, laying strictly 1 egg annually in mid-winter."
  },
  {
    "id": "cyprus-vulture-6",
    "title": "Σωστό ή Λάθος: Μονογαμία στους Γύπες",
    "title_en": "True or False: Lifelong Monogamy in Vultures",
    "description": "Εξετάστε τον ακόλουθο ισχυρισμό: Τα Όρνια είναι μονογαμικά πουλιά και διατηρούν το ίδιο ταίρι για όλη τους τη ζωή.",
    "description_en": "Assess the following statement: Griffon Vultures are strictly monogamous, mating for life.",
    "type": "true_false",
    "points": 90,
    "assignedTeamIds": [
      "team-alpha"
    ],
    "isActive": true,
    "payload": {
      "correctValue": true
    },
    "payload_en": {
      "correctValue": true
    },
    "explanation": "Σωστό! Τα Όρνια σχηματίζουν ισχυρά ζευγάρια ζωής και μοιράζονται ισότιμα την επώαση του αυγού και το μεγάλωμα του νεοσσού.",
    "explanation_en": "True! Vulture pairs mate for life and share all parenting responsibilities equally."
  },
  {
    "id": "cyprus-vulture-7",
    "title": "Βάρος του Όρνιου",
    "title_en": "Weight of the Griffon Vulture",
    "description": "Πόσο ζυγίζει κατά μέσο όρο ένα ενήλικο Όρνιο;",
    "description_en": "What is the average body weight of an adult Griffon Vulture?",
    "type": "multiple_choice",
    "points": 100,
    "assignedTeamIds": [
      "team-alpha"
    ],
    "isActive": true,
    "payload": {
      "options": [
        "6 έως 11 κιλά",
        "1 έως 2 κιλά",
        "25 έως 30 κιλά",
        "500 γραμμάρια"
      ],
      "correctOptionIndex": 0
    },
    "payload_en": {
      "options": [
        "6 to 11 kilograms",
        "1 to 2 kilograms",
        "25 to 30 kilograms",
        "500 grams"
      ],
      "correctOptionIndex": 0
    },
    "explanation": "Με βάρος 6-11 κιλά, το Όρνιο είναι ένα από τα βαρύτερα πουλιά της Ευρώπης που μπορούν να πετάξουν.",
    "explanation_en": "Weighing between 6 and 11 kg, the Griffon Vulture is among the heaviest flight-capable birds in Europe."
  },
  {
    "id": "cyprus-vulture-8",
    "title": "Αναγνώριση Ηλικίας: Νεαρό vs Ενήλικο Όρνιο",
    "title_en": "Age Identification: Juvenile vs Adult",
    "description": "Πώς μπορούν οι ερευνητές να διακρίνουν ένα νεαρό Όρνιο από ένα ενήλικο με κιάλια στο πεδίο;",
    "description_en": "How can field biologists differentiate a juvenile Griffon Vulture from an adult through binoculars?",
    "type": "multiple_choice",
    "points": 110,
    "assignedTeamIds": [
      "team-alpha"
    ],
    "isActive": true,
    "payload": {
      "options": [
        "Το νεαρό έχει σκούρο ράμφος και καστανά μυτερά φτερά στο περιλαίμιο, ενώ το ενήλικο έχει κιτρινωπό ράμφος και λευκό απαλό χνούδι",
        "Το νεαρό είναι διπλάσιο σε μέγεθος από το ενήλικο",
        "Το ενήλικο έχει πράσινο ράμφος",
        "Δεν υπάρχει κανένας οπτικός τρόπος διάκρισης"
      ],
      "correctOptionIndex": 0
    },
    "payload_en": {
      "options": [
        "Juveniles have a dark bill and pointed brown neck ruff, whereas adults have a pale yellowish horn bill and fluffy white ruff",
        "Juveniles are twice as large as adults",
        "Adults have a bright green beak",
        "There is no visual distinction"
      ],
      "correctOptionIndex": 0
    },
    "explanation": "Τα νεαρά πουλιά (μέχρι 4-5 ετών) έχουν σκούρο ράμφος και καφέ περιλαίμιο. Τα ενήλικα αποκτούν λευκό χνουδωτό περιλαίμιο και ανοιχτόχρωμο ράμφος.",
    "explanation_en": "Subadults retain dark bills and lanceolate brown neck ruffs; maturity brings a creamy-white downy collar and horn-colored beak."
  },
  {
    "id": "cyprus-vulture-9",
    "title": "Σωστό ή Λάθος: Φυλετικός Μονομορφισμός",
    "title_en": "True or False: Sexual Monomorphism",
    "description": "Είναι δυνατόν να ξεχωρίσουμε ένα αρσενικό από ένα θηλυκό Όρνιο μόνο από το χρώμα και τα φτερά τους;",
    "description_en": "Is it possible to distinguish male and female Griffon Vultures strictly by plumage coloration?",
    "type": "true_false",
    "points": 90,
    "assignedTeamIds": [
      "team-alpha"
    ],
    "isActive": true,
    "payload": {
      "correctValue": false
    },
    "payload_en": {
      "correctValue": false
    },
    "explanation": "Λάθος! Τα Όρνια εμφανίζουν φυλετικό μονομορφισμό: αρσενικά και θηλυκά είναι πανομοιότυπα εξωτερικά. Ο διαχωρισμός φύλου γίνεται μόνο με γενετική ανάλυση DNA (αίμα ή φτερό).",
    "explanation_en": "False! Griffon Vultures display complete sexual monomorphism; genders appear identical and require DNA sexing."
  },
  {
    "id": "cyprus-vulture-10",
    "title": "Αντιστοίχιση Βασικών Χαρακτηριστικών του Όρνιου",
    "title_en": "Matching Core Griffon Vulture Characteristics",
    "description": "Συνδέστε κάθε βασικό βιολογικό στοιχείο του Όρνιου στην Κύπρο με τη σωστή επιστημονική του τιμή:",
    "description_en": "Match each foundational biological metric of the Cyprus Griffon Vulture to its accurate scientific value:",
    "type": "text_match",
    "points": 120,
    "assignedTeamIds": [
      "team-alpha"
    ],
    "isActive": true,
    "payload": {
      "pairs": [
        {
          "id": "m1",
          "left": "Επιστημονική Ονομασία",
          "right": "Gyps fulvus (Γύπας ο πυρόχρους)"
        },
        {
          "id": "m2",
          "left": "Μέσο Άνοιγμα Πτερύγων",
          "right": "2.4 έως 2.8 μέτρα (κατά μέσο όρο ~2.5m)"
        },
        {
          "id": "m3",
          "left": "Σωματικό Βάρος",
          "right": "6 έως 11 κιλά"
        },
        {
          "id": "m4",
          "left": "Ετήσιος Αριθμός Αυγών",
          "right": "Μόνο 1 λευκό αυγό ανά έτος"
        },
        {
          "id": "m5",
          "left": "Κατάσταση Διατήρησης στην Κύπρο",
          "right": "Κρίσιμα Κινδυνεύον (Critically Endangered)"
        }
      ]
    },
    "payload_en": {
      "pairs": [
        {
          "id": "m1",
          "left": "Scientific Binomial Name",
          "right": "Gyps fulvus (Griffon Vulture)"
        },
        {
          "id": "m2",
          "left": "Average Wingspan",
          "right": "2.4 to 2.8 metres (average ~2.5m)"
        },
        {
          "id": "m3",
          "left": "Adult Body Mass",
          "right": "6 to 11 kilograms"
        },
        {
          "id": "m4",
          "left": "Annual Clutch Size",
          "right": "Only 1 single white egg per year"
        },
        {
          "id": "m5",
          "left": "Cyprus Conservation Status",
          "right": "Critically Endangered (CR)"
        }
      ]
    },
    "explanation": "Το Όρνιο (Gyps fulvus) είναι ο μεγαλύτερος πτερωτός γίγαντας της Κύπρου. Με άνοιγμα πτερύγων 2.5m και βάρος έως 11kg, γεννά μόνο 1 αυγό τον χρόνο και προστατεύεται αυστηρά.",
    "explanation_en": "The Griffon Vulture is Cyprus's largest raptor, spanning 2.5m and laying strictly 1 egg annually under high-priority conservation status."
  },
  {
    "id": "cyprus-vulture-11",
    "title": "Πόδια & Νύχια: Προσαρμογή στο Έδαφος",
    "title_en": "Feet & Talons: Terrestrial Adaptation",
    "description": "Γιατί τα νύχια του Όρνιου δεν είναι τόσο γαμψά και σουβλερά όσο του αετού ή του γερακιού;",
    "description_en": "Why are Griffon Vulture talons blunt and flatter compared to eagles and falcons?",
    "type": "multiple_choice",
    "points": 100,
    "assignedTeamIds": [
      "team-alpha"
    ],
    "isActive": true,
    "payload": {
      "options": [
        "Επειδή δεν σκοτώνει ζωντανά θηράματα αλλά περπατά στο έδαφος γύρω από κουφάρια",
        "Επειδή τρίβονται στους βράχους κατά την προσγείωση",
        "Για να μπορεί να κολυμπάει σε λίμνες",
        "Επειδή είναι ελαττωματικά εκ γενετής"
      ],
      "correctOptionIndex": 0
    },
    "payload_en": {
      "options": [
        "Because it does not grasp living prey, but walks comfortably on the ground around carcasses",
        "Because they wear down on limestone during landing",
        "To facilitate swimming in alpine pools",
        "Due to congenital deformity"
      ],
      "correctOptionIndex": 0
    },
    "explanation": "Τα πόδια του γύπα είναι προσαρμοσμένα για βάδισμα και στήριξη στο έδαφος, όχι για σύλληψη και θανάτωση ζωντανής λείας.",
    "explanation_en": "Vulture feet are evolutionary tools for steady walking on rough ground, not weapons for clutching struggling prey."
  },
  {
    "id": "cyprus-vulture-12",
    "title": "Αναγνώριση Μορφολογίας & Χαρακτηριστικών με Εικόνες",
    "title_en": "Visual Trait & Habitat Identification",
    "description": "Συνδέστε κάθε οπτική κάρτα παρατήρησης με τη σωστή περιγραφή της ανατομίας ή του ενδιαιτήματος του Όρνιου στην Κύπρο:",
    "description_en": "Match each visual observation card with the corresponding anatomical or habitat description for the Cyprus Griffon Vulture:",
    "type": "image_match",
    "points": 130,
    "assignedTeamIds": [
      "team-alpha"
    ],
    "isActive": true,
    "payload": {
      "pairs": [
        {
          "id": "im1",
          "image": "data:image/svg+xml;utf8,<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 600 400\" width=\"600\" height=\"400\"><rect width=\"600\" height=\"400\" fill=\"%230ea5e9\"/><path d=\"M 130,80 C 50,50 -40,30 -50,60 C -10,95 80,105 120,95 Z\" fill=\"%2392400e\"/><path d=\"M 150,80 C 230,50 320,30 330,60 C 290,95 200,105 160,95 Z\" fill=\"%2392400e\"/><ellipse cx=\"140\" cy=\"85\" rx=\"22\" ry=\"16\" fill=\"%23b45309\"/><circle cx=\"140\" cy=\"74\" r=\"10\" fill=\"%23f8fafc\"/><path d=\"M 138,70 Q 140,55 140,46\" stroke=\"%23fed7aa\" stroke-width=\"6\" stroke-linecap=\"round\"/><circle cx=\"140\" cy=\"44\" r=\"7\" fill=\"%23fed7aa\"/><polygon points=\"137,42 143,42 140,34\" fill=\"%23e2e8f0\"/><text x=\"30\" y=\"360\" font-family=\"sans-serif\" font-weight=\"bold\" font-size=\"20\" fill=\"%23ffffff\">Όρνιο (Gyps fulvus) - 2.5m Wingspan</text></svg>",
          "text": "Πτέρυγα 2.5m με διαχωρισμένα πρωτεύοντα φτερά (δάχτυλα) για εκμετάλλευση θερμικών"
        },
        {
          "id": "im2",
          "image": "data:image/svg+xml;utf8,<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 600 400\" width=\"600\" height=\"400\"><rect width=\"600\" height=\"400\" fill=\"%231e293b\"/><path d=\"M 0,0 L 250,0 C 220,120 180,240 220,400 L 0,400 Z\" fill=\"%23334155\"/><ellipse cx=\"210\" cy=\"210\" rx=\"60\" ry=\"40\" fill=\"%23020617\"/><ellipse cx=\"210\" cy=\"225\" rx=\"45\" ry=\"15\" fill=\"%2378350f\"/><ellipse cx=\"210\" cy=\"222\" rx=\"14\" ry=\"18\" fill=\"%23f8fafc\" stroke=\"%23cbd5e1\" stroke-width=\"2\"/><text x=\"30\" y=\"360\" font-family=\"sans-serif\" font-weight=\"bold\" font-size=\"18\" fill=\"%2338bdf8\">Φωλιά σε Σπηλιά Γκρεμού (1 Αυγό)</text></svg>",
          "text": "Απόκρημνη φωλιά σε εσοχή ασβεστολιθικού γκρεμού με 1 αυγό"
        },
        {
          "id": "im3",
          "image": "data:image/svg+xml;utf8,<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 600 400\" width=\"600\" height=\"400\"><rect width=\"600\" height=\"400\" fill=\"%23020617\"/><circle cx=\"480\" cy=\"90\" r=\"28\" fill=\"%230284c7\" opacity=\"0.5\"/><rect x=\"460\" y=\"75\" width=\"40\" height=\"30\" rx=\"4\" fill=\"%2338bdf8\"/><rect x=\"150\" y=\"220\" width=\"90\" height=\"60\" rx=\"8\" fill=\"%231e293b\" stroke=\"%23f59e0b\" stroke-width=\"4\"/><line x1=\"230\" y1=\"220\" x2=\"280\" y2=\"150\" stroke=\"%23f59e0b\" stroke-width=\"3\"/><rect x=\"170\" y=\"310\" width=\"50\" height=\"30\" rx=\"4\" fill=\"%23fbbf24\"/><text x=\"180\" y=\"330\" font-family=\"monospace\" font-weight=\"bold\" font-size=\"14\" fill=\"%230f172a\">CY01</text><text x=\"30\" y=\"360\" font-family=\"sans-serif\" font-weight=\"bold\" font-size=\"18\" fill=\"%23fbbf24\">Δορυφορικός Πομπός GPS</text></svg>",
          "text": "Δορυφορικός πομπός GPS και οπτικό δακτυλίδι για τηλεμετρική παρακολούθηση"
        },
        {
          "id": "im4",
          "image": "data:image/svg+xml;utf8,<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 600 400\" width=\"600\" height=\"400\"><rect width=\"600\" height=\"400\" fill=\"%23064e3b\"/><polygon points=\"300,60 380,100 380,220 300,280 220,220 220,100\" fill=\"%23022c22\" stroke=\"%2310b981\" stroke-width=\"4\"/><text x=\"245\" y=\"160\" font-family=\"sans-serif\" font-weight=\"900\" font-size=\"20\" fill=\"%236ee7b7\">K9 UNIT</text><text x=\"230\" y=\"195\" font-family=\"sans-serif\" font-weight=\"bold\" font-size=\"12\" fill=\"%23a7f3d0\">ΑΝΤΙΔΗΛΗΤΗΡΙΟ</text><text x=\"240\" y=\"235\" font-size=\"40\">🐕</text><text x=\"30\" y=\"360\" font-family=\"sans-serif\" font-weight=\"bold\" font-size=\"18\" fill=\"%236ee7b7\">Ομάδα Σκύλων K9</text></svg>",
          "text": "Ειδική μονάδα σκύλων K9 ανίχνευσης παράνομων δηλητηριασμένων δολωμάτων"
        }
      ]
    },
    "payload_en": {
      "pairs": [
        {
          "id": "im1",
          "image": "data:image/svg+xml;utf8,<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 600 400\" width=\"600\" height=\"400\"><rect width=\"600\" height=\"400\" fill=\"%230ea5e9\"/><path d=\"M 130,80 C 50,50 -40,30 -50,60 C -10,95 80,105 120,95 Z\" fill=\"%2392400e\"/><path d=\"M 150,80 C 230,50 320,30 330,60 C 290,95 200,105 160,95 Z\" fill=\"%2392400e\"/><ellipse cx=\"140\" cy=\"85\" rx=\"22\" ry=\"16\" fill=\"%23b45309\"/><circle cx=\"140\" cy=\"74\" r=\"10\" fill=\"%23f8fafc\"/><path d=\"M 138,70 Q 140,55 140,46\" stroke=\"%23fed7aa\" stroke-width=\"6\" stroke-linecap=\"round\"/><circle cx=\"140\" cy=\"44\" r=\"7\" fill=\"%23fed7aa\"/><polygon points=\"137,42 143,42 140,34\" fill=\"%23e2e8f0\"/><text x=\"30\" y=\"360\" font-family=\"sans-serif\" font-weight=\"bold\" font-size=\"20\" fill=\"%23ffffff\">Griffon Vulture (Gyps fulvus)</text></svg>",
          "text": "2.5m broad wingspan with slotted flight primaries for updraft soaring"
        },
        {
          "id": "im2",
          "image": "data:image/svg+xml;utf8,<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 600 400\" width=\"600\" height=\"400\"><rect width=\"600\" height=\"400\" fill=\"%231e293b\"/><path d=\"M 0,0 L 250,0 C 220,120 180,240 220,400 L 0,400 Z\" fill=\"%23334155\"/><ellipse cx=\"210\" cy=\"210\" rx=\"60\" ry=\"40\" fill=\"%23020617\"/><ellipse cx=\"210\" cy=\"225\" rx=\"45\" ry=\"15\" fill=\"%2378350f\"/><ellipse cx=\"210\" cy=\"222\" rx=\"14\" ry=\"18\" fill=\"%23f8fafc\" stroke=\"%23cbd5e1\" stroke-width=\"2\"/><text x=\"30\" y=\"360\" font-family=\"sans-serif\" font-weight=\"bold\" font-size=\"18\" fill=\"%2338bdf8\">Cliff Cave Nest (1 Egg)</text></svg>",
          "text": "Cliff crevice nesting ledge with single white egg"
        },
        {
          "id": "im3",
          "image": "data:image/svg+xml;utf8,<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 600 400\" width=\"600\" height=\"400\"><rect width=\"600\" height=\"400\" fill=\"%23020617\"/><circle cx=\"480\" cy=\"90\" r=\"28\" fill=\"%230284c7\" opacity=\"0.5\"/><rect x=\"460\" y=\"75\" width=\"40\" height=\"30\" rx=\"4\" fill=\"%2338bdf8\"/><rect x=\"150\" y=\"220\" width=\"90\" height=\"60\" rx=\"8\" fill=\"%231e293b\" stroke=\"%23f59e0b\" stroke-width=\"4\"/><line x1=\"230\" y1=\"220\" x2=\"280\" y2=\"150\" stroke=\"%23f59e0b\" stroke-width=\"3\"/><rect x=\"170\" y=\"310\" width=\"50\" height=\"30\" rx=\"4\" fill=\"%23fbbf24\"/><text x=\"180\" y=\"330\" font-family=\"monospace\" font-weight=\"bold\" font-size=\"14\" fill=\"%230f172a\">CY01</text><text x=\"30\" y=\"360\" font-family=\"sans-serif\" font-weight=\"bold\" font-size=\"18\" fill=\"%23fbbf24\">GPS Satellite Transmitter</text></svg>",
          "text": "Satellite GPS backpack unit and alphanumeric visual leg ring"
        },
        {
          "id": "im4",
          "image": "data:image/svg+xml;utf8,<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 600 400\" width=\"600\" height=\"400\"><rect width=\"600\" height=\"400\" fill=\"%23064e3b\"/><polygon points=\"300,60 380,100 380,220 300,280 220,220 220,100\" fill=\"%23022c22\" stroke=\"%2310b981\" stroke-width=\"4\"/><text x=\"245\" y=\"160\" font-family=\"sans-serif\" font-weight=\"900\" font-size=\"20\" fill=\"%236ee7b7\">K9 UNIT</text><text x=\"230\" y=\"195\" font-family=\"sans-serif\" font-weight=\"bold\" font-size=\"12\" fill=\"%23a7f3d0\">ΑΝΤΙΔΗΛΗΤΗΡΙΟ</text><text x=\"240\" y=\"235\" font-size=\"40\">🐕</text><text x=\"30\" y=\"360\" font-family=\"sans-serif\" font-weight=\"bold\" font-size=\"18\" fill=\"%236ee7b7\">K9 Canine Detection Unit</text></svg>",
          "text": "Canine K9 anti-poison scent detection unit"
        }
      ]
    },
    "explanation": "Η οπτική αναγνώριση συνδυάζει τα βασικά εργαλεία έρευνας πεδίου στην Κύπρο: αεροδυναμική πτερύγων, ασφάλεια φωλιάς σε γκρεμούς, δορυφορικοί πομποί και σκύλοι K9.",
    "explanation_en": "Visual trait identification bridges core field tools: wing aerodynamics, cliff security, telemetry monitoring, and K9 poison detection."
  },
  {
    "id": "cyprus-vulture-13",
    "title": "Σταδιακή Πτερόρροια",
    "title_en": "Gradual Molting Pattern",
    "description": "Πώς εξασφαλίζει το Όρνιο ότι δεν θα χάσει την ικανότητα πτήσης κατά την ανανέωση των φτερών του;",
    "description_en": "How does the Griffon Vulture ensure continuous flight capability during feather renewal?",
    "type": "multiple_choice",
    "points": 90,
    "assignedTeamIds": [
      "team-alpha"
    ],
    "isActive": true,
    "payload": {
      "options": [
        "Ρίχνει τα φτερά πτήσης συμμετρικά και σταδιακά σε βάθος πολλών μηνών ή ετών",
        "Ρίχνει όλα τα φτερά του ταυτόχρονα και μένει στη φωλιά για ένα μήνα",
        "Δεν αλλάζει ποτέ φτερά στη ζωή του",
        "Μαδάει τα φτερά του μόνο τον χειμώνα"
      ],
      "correctOptionIndex": 0
    },
    "payload_en": {
      "options": [
        "It sheds flight feathers symmetrically and gradually over many months or years",
        "It sheds all primaries simultaneously and stays grounded for a month",
        "It never sheds feathers throughout its life",
        "It plucks feathers strictly in winter"
      ],
      "correctOptionIndex": 0
    },
    "explanation": "Η πτερόρροια στα μεγάλα αρπακτικά γίνεται αργά και συμμετρικά, ώστε το πουλί να παραμένει διαρκώς ικανό να πετάει και να βρίσκει τροφή.",
    "explanation_en": "Molting proceeds symmetrically in pairs over several seasons, preventing any loss of aerodynamic soaring efficiency."
  },
  {
    "id": "cyprus-vulture-14",
    "title": "Ιστορική Κατανομή στην Κύπρο",
    "title_en": "Historical Distribution in Cyprus",
    "description": "Σε ποιες περιοχές της Κύπρου ζούσαν γύπες τις δεκαετίες του 1950-1960;",
    "description_en": "Where were Griffon Vultures widely distributed across Cyprus during the 1950s-1960s?",
    "type": "multiple_choice",
    "points": 100,
    "assignedTeamIds": [
      "team-alpha"
    ],
    "isActive": true,
    "payload": {
      "options": [
        "Σε όλες σχεδόν τις ορεινές και ημιορεινές περιοχές (Πενταδάκτυλος, Τρόοδος, Ακάμας, Γκρεμοί Επισκοπής)",
        "Μόνο σε κλουβιά ζωολογικών κήπων",
        "Μόνο στα παραθαλάσσια έλη της Λάρνακας",
        "Δεν υπήρχαν ποτέ γύπες στην Κύπρο"
      ],
      "correctOptionIndex": 0
    },
    "payload_en": {
      "options": [
        "Across almost all mountainous and cliff regions (Pentadaktylos, Troodos, Akamas, Episkopi)",
        "Strictly in captive zoo collections",
        "Solely in Larnaca salt marshes",
        "Vultures never existed historically in Cyprus"
      ],
      "correctOptionIndex": 0
    },
    "explanation": "Παλαιότερα το Όρνιο ήταν κοινότατο σε όλη την Κύπρο, με αποικίες στον Πενταδάκτυλο, το Τρόοδος και τα φαράγγια της Πάφου και Λεμεσού.",
    "explanation_en": "Decades ago hundreds of vultures thrived across Cyprus, nesting in the Kyrenia range, Troodos, and southern gorges."
  },
  {
    "id": "cyprus-vulture-36",
    "title": "Εσωτερικός Σταθμός Φωτογράφισης: Το Ομοίωμα του Γύπα (#36)",
    "title_en": "Indoor Photography Checkpoint: The Vulture Replica (#36)",
    "description": "Εντοπίστε το ομοίωμα ή τη μεγάλη φωτογραφία του Γύπα στην αίθουσα ενημέρωσης και αποστείλετε φωτογραφία ή βίντεο τεκμηρίωσης της ομάδας σας (#36).",
    "description_en": "Locate the educational replica or life-sized photo of the Griffon Vulture inside the room and upload team photo or video proof (#36).",
    "type": "photo_upload",
    "points": 150,
    "assignedTeamIds": [
      "team-alpha"
    ],
    "isActive": true,
    "payload": {
      "instructions": "Εντοπίστε το ομοίωμα του Γύπα στην αίθουσα (#36). Χρησιμοποιήστε την κάμερα ή ανεβάστε φωτογραφία/βίντεο με το τεκμήριο παρατήρησης της ομάδας σας:",
      "sampleReferenceUrl": "data:image/svg+xml;utf8,<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 600 400\" width=\"600\" height=\"400\"><rect width=\"600\" height=\"400\" fill=\"%230ea5e9\"/><path d=\"M 130,80 C 50,50 -40,30 -50,60 C -10,95 80,105 120,95 Z\" fill=\"%2392400e\"/><path d=\"M 150,80 C 230,50 320,30 330,60 C 290,95 200,105 160,95 Z\" fill=\"%2392400e\"/><ellipse cx=\"140\" cy=\"85\" rx=\"22\" ry=\"16\" fill=\"%23b45309\"/><circle cx=\"140\" cy=\"74\" r=\"10\" fill=\"%23f8fafc\"/><path d=\"M 138,70 Q 140,55 140,46\" stroke=\"%23fed7aa\" stroke-width=\"6\" stroke-linecap=\"round\"/><circle cx=\"140\" cy=\"44\" r=\"7\" fill=\"%23fed7aa\"/><polygon points=\"137,42 143,42 140,34\" fill=\"%23e2e8f0\"/><text x=\"30\" y=\"360\" font-family=\"sans-serif\" font-weight=\"bold\" font-size=\"20\" fill=\"%23ffffff\">Ομοίωμα Όρνιου - Checkpoint #36</text></svg>",
      "checklist": [
        "Εντοπισμός του ομοιώματος/φωτογραφίας του Γύπα στην αίθουσα (#36)",
        "Παρατήρηση του μήκους των πτερύγων (2.5m) και του γυμνού λαιμού",
        "Επιβεβαίωση των βασικών στοιχείων ταυτότητας (είδος Gyps fulvus, 1 αυγό, κρίσιμος κίνδυνος)"
      ],
      "completionPrompt": "Επιβεβαιώστε ότι η Ομάδα 1 κατέγραψε τα βασικά στοιχεία αναγνώρισης του Όρνιου."
    },
    "payload_en": {
      "instructions": "Locate the vulture replica in the room (#36). Use the camera or upload photo/video evidence of your team's observation:",
      "checklist": [
        "Locate the vulture replica/photo in the exhibition room (#36)",
        "Observe the 2.5m wingspan and pale downy neck",
        "Confirm the core ID facts (species Gyps fulvus, 1 egg, critically endangered)"
      ],
      "completionPrompt": "Confirm Team 1 has logged the foundational identification metrics of the Griffon Vulture."
    },
    "explanation": "Η οπτική επαφή με το ομοίωμα σε φυσικό μέγεθος βοηθά στην κατανόηση του τεράστιου μεγέθους και της ανατομίας του Όρνιου.",
    "explanation_en": "Observing the life-sized replica anchors student understanding of the vulture's immense physical proportions."
  },
  {
    "id": "cyprus-vulture-16",
    "title": "Κύρια Αποικία στην Κύπρο: Γκρεμοί Επισκοπής",
    "title_en": "Main Colony in Cyprus: Episkopi Cliffs",
    "description": "Σε ποια ιστορική παραθαλάσσια τοποθεσία της Κύπρου βρίσκεται η τελευταία σταθερή αποικία φωλεοποίησης των γυπών;",
    "description_en": "Which iconic coastal cliff location in Cyprus hosts the historic nesting colony of Griffon Vultures?",
    "type": "multiple_choice",
    "points": 100,
    "assignedTeamIds": [
      "team-beta"
    ],
    "isActive": true,
    "payload": {
      "options": [
        "Στους απόκρημνους ασβεστολιθικούς γκρεμούς της Επισκοπής (Επαρχία Λεμεσού)",
        "Στην παραλία των Φοινικούδων στη Λάρνακα",
        "Στον Κάβο Γκρέκο στην Αγία Νάπα",
        "Στον κυκλικό κόμβο της Λευκωσίας"
      ],
      "correctOptionIndex": 0
    },
    "payload_en": {
      "options": [
        "The sheer coastal limestone cliffs of Episkopi (Limassol District)",
        "Finikoudes beach in Larnaca",
        "Cape Greco in Ayia Napa",
        "Nicosia urban roundabouts"
      ],
      "correctOptionIndex": 0
    },
    "explanation": "Οι επιβλητικοί λευκοί γκρεμοί της Επισκοπής πάνω από τη θάλασσα αποτελούν το παραδοσιακό καταφύγιο και τόπο φωλεοποίησης των Όρνιων στην Κύπρο.",
    "explanation_en": "The sheer maritime cliffs of Episkopi provide the premier traditional breeding bastion for Cyprus vultures."
  },
  {
    "id": "cyprus-vulture-17",
    "title": "Ασφάλεια Φωλιάς σε Απόκρημνους Βράχους",
    "title_en": "Cliff Ledge Nesting Strategy",
    "description": "Γιατί τα Όρνια επιλέγουν αποκλειστικά απόκρημνες εσοχές σε κατακόρυφους γκρεμούς για να χτίσουν τη φωλιά τους;",
    "description_en": "Why do Griffon Vultures strictly select inaccessible crevices on vertical crags to build their nests?",
    "type": "multiple_choice",
    "points": 100,
    "assignedTeamIds": [
      "team-beta"
    ],
    "isActive": true,
    "payload": {
      "options": [
        "Για απόλυτη προστασία από χερσαίους θηρευτές (όπως αλεπούδες, σκύλους) και εύκολη απογείωση στον αέρα",
        "Επειδή φοβούνται το πράσινο γρασίδι",
        "Για να είναι κοντά στη θάλασσα και να ψαρεύουν",
        "Επειδή δεν ξέρουν να κάθονται σε κλαδιά δέντρων"
      ],
      "correctOptionIndex": 0
    },
    "payload_en": {
      "options": [
        "For total security against terrestrial predators (foxes, feral dogs) and direct drop-off launch into updrafts",
        "Because they dislike green vegetation",
        "To fish in the nearby sea",
        "Because their anatomy cannot perch on trees"
      ],
      "correctOptionIndex": 0
    },
    "explanation": "Οι απρόσιτες σχισμές των γκρεμών κρατούν το ευάλωτο αυγό και τον νεοσσό ασφαλή από αρπακτικά, ενώ επιτρέπουν στο βαρύ πουλί να απογειωθεί εύκολα στο κενό.",
    "explanation_en": "Inaccessible rock alcoves safeguard the single egg from ground predators and allow effortless launch into wind currents."
  },
  {
    "id": "cyprus-vulture-18",
    "title": "Θερμά Ανοδικά Ρεύματα (Thermal Updrafts)",
    "title_en": "Thermal Updrafts & Soaring Flight",
    "description": "Πώς καταφέρνει το Όρνιο, ένα πουλί βάρους 8-10 κιλών, να πετάει για ώρες χωρίς να εξαντλείται;",
    "description_en": "How does an 8-10 kg Griffon Vulture remain aloft for hours without exhausting its muscular energy reserves?",
    "type": "multiple_choice",
    "points": 110,
    "assignedTeamIds": [
      "team-beta"
    ],
    "isActive": true,
    "payload": {
      "options": [
        "Εκμεταλλεύεται τα θερμά ανοδικά ρεύματα αέρα (θερμικά) κάνοντας κυκλική ανεμοπορία (soaring/gliding)",
        "Χτυπάει συνεχώς τα φτερά του με μεγάλη ταχύτητα",
        "Πετάει μόνο σε κατηφορικές πλαγιές",
        "Χρησιμοποιεί τον άνεμο που σπρώχνει τα άλλα πουλιά"
      ],
      "correctOptionIndex": 0
    },
    "payload_en": {
      "options": [
        "It harnesses thermal updrafts created by sun-warmed earth, circling efficiently in passive soaring flight",
        "By flapping its wings continuously with immense speed",
        "By gliding strictly downhill",
        "By relying on wake turbulence from other birds"
      ],
      "correctOptionIndex": 0
    },
    "explanation": "Το Όρνιο είναι κορυφαίος ανεμοπόρος. Σχεδόν δεν χτυπάει ποτέ τα φτερά του: στροβιλίζεται μέσα σε στήλες θερμού ανερχόμενου αέρα για να κερδίσει ύψος.",
    "explanation_en": "Griffon Vultures are soaring masters, circling inside columns of rising hot air with minimal flapping."
  },
  {
    "id": "cyprus-vulture-19",
    "title": "Ακτίνα Αναζήτησης Τροφής (Foraging Range 100+ km)",
    "title_en": "Daily Foraging Range (100+ km)",
    "description": "Πόση απόσταση μπορεί να καλύψει ένα Όρνιο σε μία ημέρα αναζητώντας τροφή στην Κύπρο;",
    "description_en": "What distance can a Griffon Vulture cover during a single day while scouting for food in Cyprus?",
    "type": "multiple_choice",
    "points": 100,
    "assignedTeamIds": [
      "team-beta"
    ],
    "isActive": true,
    "payload": {
      "options": [
        "Πάνω από 100 χιλιόμετρα την ημέρα, πετώντας από τη Λεμεσό μέχρι την Πάφο και το Τρόοδος",
        "Μόνο 1 με 2 χιλιόμετρα γύρω από τον βράχο",
        "Το πολύ 500 μέτρα",
        "2.000 χιλιόμετρα κάθε απόγευμα"
      ],
      "correctOptionIndex": 0
    },
    "payload_en": {
      "options": [
        "Well over 100 kilometres daily, covering distances from Limassol across Paphos to Troodos",
        "Only 1 to 2 km strictly around the cliff",
        "At most 500 metres",
        "2,000 kilometres every afternoon"
      ],
      "correctOptionIndex": 0
    },
    "explanation": "Ένας γύπας μπορεί εύκολα να διανύσει 100-150 χλμ. σε λίγες ώρες, επιθεωρώντας τεράστιες εκτάσεις της κυπριακής υπαίθρου.",
    "explanation_en": "Vultures effortlessly patrol territories spanning 100-150 km in a single patrol, surveying mountain valleys."
  },
  {
    "id": "cyprus-vulture-20",
    "title": "Αεροδυναμική: «Δάχτυλα» Πρωτευόντων Φτερών",
    "title_en": "Wing Aerodynamics: Slotted Primary Feathers",
    "description": "Ποια είναι η λειτουργία των ανοιχτών εξωτερικών φτερών («δάχτυλα») στις άκρες των πτερύγων του γύπα;",
    "description_en": "What aerodynamic function do the splayed primary wing-tip 'fingers' serve during soaring?",
    "type": "multiple_choice",
    "points": 100,
    "assignedTeamIds": [
      "team-beta"
    ],
    "isActive": true,
    "payload": {
      "options": [
        "Μειώνουν τους στροβιλισμούς του αέρα στις άκρες των πτερύγων και παρέχουν εξαιρετική άντωση σε χαμηλές ταχύτητες",
        "Βοηθούν στο να πιάνει έντομα στον αέρα",
        "Είναι διακοσμητικά για να τρομάζουν τα κοράκια",
        "Χρησιμεύουν ως αλεξίπτωτο κατά την κατάδυση"
      ],
      "correctOptionIndex": 0
    },
    "payload_en": {
      "options": [
        "They break up wingtip vortices, reducing drag and sustaining maximum lift at slow circling speeds",
        "They help catch flying insects in mid-air",
        "They are ornamental plumage meant to deter ravens",
        "They act like drag chutes during steep dives"
      ],
      "correctOptionIndex": 0
    },
    "explanation": "Τα «δάχτυλα» στις άκρες των φτερών μειώνουν την οπισθέλκουσα και επιτρέπουν στον γύπα να στρίβει άνετα μέσα στα στενά θερμικά ρεύματα.",
    "explanation_en": "Individual slotted primary tips diffuse air turbulence, dramatically lowering induced drag while cornering tightly inside thermals."
  },
  {
    "id": "cyprus-vulture-21",
    "title": "Ώρα Έναρξης Πτήσης & Ήλιος",
    "title_en": "Flight Timing & Solar Radiation",
    "description": "Γιατί τα Όρνια περιμένουν συνήθως να περάσουν μερικές ώρες μετά την ανατολή του ηλίου για να απογειωθούν;",
    "description_en": "Why do Griffon Vultures typically delay taking wing until mid-morning well after dawn?",
    "type": "multiple_choice",
    "points": 100,
    "assignedTeamIds": [
      "team-beta"
    ],
    "isActive": true,
    "payload": {
      "options": [
        "Επειδή χρειάζονται τη θερμότητα του ήλιου για να ζεστάνει το έδαφος και να δημιουργηθούν ισχυρά ανοδικά θερμικά ρεύματα",
        "Επειδή φοβούνται την πρωινή δροσιά",
        "Επειδή κοιμούνται μέχρι το μεσημέρι",
        "Επειδή το πρωί δεν υπάρχουν κουφάρια"
      ],
      "correctOptionIndex": 0
    },
    "payload_en": {
      "options": [
        "Because ground thermals require intense solar heating to generate buoyant lift capable of carrying heavy birds",
        "Because morning dew damages their feathers",
        "Because they sleep until midday",
        "Because food carcasses only appear after noon"
      ],
      "correctOptionIndex": 0
    },
    "explanation": "Χωρίς θερμικά ανοδικά ρεύματα, η ενεργειακή δαπάνη της πτήσης με συνεχή φτεροκοπήματα θα ήταν απαγορευτική για ένα πουλί 9 κιλών.",
    "explanation_en": "Flapping flight demands unsustainable muscular exertion for a 9 kg bird; vultures must wait for solar-powered thermals."
  },
  {
    "id": "cyprus-vulture-22",
    "title": "Κοιλάδα Διαρίζου & Χα-Ποτάμι",
    "title_en": "Diarizos Valley & Cha-Potami Canyons",
    "description": "Ποιες περιοχές της επαρχίας Πάφου και Λεμεσού αποτελούν παραδοσιακά φαράγγια πτήσης και αναζήτησης τροφής;",
    "description_en": "Which river valleys and gorges in Paphos/Limassol districts serve as critical vulture foraging corridors?",
    "type": "multiple_choice",
    "points": 100,
    "assignedTeamIds": [
      "team-beta"
    ],
    "isActive": true,
    "payload": {
      "options": [
        "Η κοιλάδα του ποταμού Διαρίζου, το Χα-Ποτάμι και οι γκρεμοί του Ασπρόκρεμμου",
        "Ο ποταμός Πεδιαίος στο κέντρο της πόλης",
        "Ο κόλπος της Αγίας Νάπας",
        "Η αλυκή της Λάρνακας"
      ],
      "correctOptionIndex": 0
    },
    "payload_en": {
      "options": [
        "The Diarizos river valley, Cha-Potami gorge, and Asprokremmos rocky ridges",
        "The Pedieos stream inside downtown Nicosia",
        "The resort beaches of Ayia Napa",
        "Larnaca salt lake shores"
      ],
      "correctOptionIndex": 0
    },
    "explanation": "Οι κοιλάδες Διαρίζου και Χα-Ποτάμι συνδέουν τους παράκτιους γκρεμούς με τις ορεινές βοσκές του Τροόδους, προσφέροντας ιδανικούς αεροδιαδρόμους.",
    "explanation_en": "The deep gorges of Diarizos and Cha-Potami act as natural avian transit corridors between nesting cliffs and inland grazing pastures."
  },
  {
    "id": "cyprus-vulture-23",
    "title": "Παζλ: Το Όρνιο σε Ανοδικά Θερμά Ρεύματα (#23)",
    "title_en": "Puzzle: Griffon Vulture in Thermal Updrafts (#23)",
    "description": "Συναρμολογήστε το παζλ που αναπαριστά το Όρνιο να γλιστρά αβίαστα πάνω από τους απόκρημνους γκρεμούς της Επισκοπής εκμεταλλευόμενο τα θερμικά ανοδικά ρεύματα.",
    "description_en": "Assemble the puzzle depicting the Griffon Vulture soaring over the Episkopi cliffs riding thermal updrafts.",
    "type": "puzzle",
    "points": 140,
    "assignedTeamIds": [
      "team-beta"
    ],
    "isActive": true,
    "imageUrl": "data:image/svg+xml;utf8,<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 600 400\" width=\"600\" height=\"400\"><defs><linearGradient id=\"skyG\" x1=\"0\" y1=\"0\" x2=\"0\" y2=\"1\"><stop offset=\"0%\" stop-color=\"%230ea5e9\"/><stop offset=\"70%\" stop-color=\"%23e0f2fe\"/><stop offset=\"100%\" stop-color=\"%23fef9c3\"/></linearGradient></defs><rect width=\"600\" height=\"400\" fill=\"url(%23skyG)\"/><path d=\"M 220,380 C 180,300 240,240 200,160 C 170,100 230,60 210,20\" stroke=\"%2338bdf8\" stroke-width=\"3\" stroke-dasharray=\"6,6\" fill=\"none\" opacity=\"0.6\"/><path d=\"M 380,380 C 340,300 400,240 360,160 C 330,100 390,60 370,20\" stroke=\"%2338bdf8\" stroke-width=\"3\" stroke-dasharray=\"6,6\" fill=\"none\" opacity=\"0.6\"/><polygon points=\"0,400 140,260 170,400\" fill=\"%2378350f\" opacity=\"0.9\"/><polygon points=\"450,400 480,240 600,400\" fill=\"%2378350f\" opacity=\"0.9\"/><g transform=\"translate(170, 90)\"><path d=\"M 130,80 C 50,50 -40,30 -50,60 C -10,95 80,105 120,95 Z\" fill=\"%2392400e\"/><path d=\"M -50,60 L -70,50 M -50,65 L -68,62 M -48,70 L -64,75\" stroke=\"%23451a03\" stroke-width=\"4\" stroke-linecap=\"round\"/><path d=\"M 150,80 C 230,50 320,30 330,60 C 290,95 200,105 160,95 Z\" fill=\"%2392400e\"/><path d=\"M 330,60 L 350,50 M 330,65 L 348,62 M 328,70 L 344,75\" stroke=\"%23451a03\" stroke-width=\"4\" stroke-linecap=\"round\"/><polygon points=\"128,95 118,140 162,140 152,95\" fill=\"%23451a03\"/><ellipse cx=\"140\" cy=\"85\" rx=\"22\" ry=\"16\" fill=\"%23b45309\"/><circle cx=\"140\" cy=\"74\" r=\"10\" fill=\"%23f8fafc\"/><path d=\"M 138,70 Q 140,55 140,46\" stroke=\"%23fed7aa\" stroke-width=\"6\" stroke-linecap=\"round\"/><circle cx=\"140\" cy=\"44\" r=\"7\" fill=\"%23fed7aa\"/><polygon points=\"137,42 143,42 140,34\" fill=\"%23e2e8f0\"/></g><text x=\"24\" y=\"375\" font-family=\"sans-serif\" font-weight=\"800\" font-size=\"16\" fill=\"%23451a03\">Όρνιο (Gyps fulvus) - Κυρίαρχος των Θερμών Ρευμάτων</text></svg>",
    "payload": {
      "gridPieces": 6,
      "imageUrl": "data:image/svg+xml;utf8,<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 600 400\" width=\"600\" height=\"400\"><defs><linearGradient id=\"skyG\" x1=\"0\" y1=\"0\" x2=\"0\" y2=\"1\"><stop offset=\"0%\" stop-color=\"%230ea5e9\"/><stop offset=\"70%\" stop-color=\"%23e0f2fe\"/><stop offset=\"100%\" stop-color=\"%23fef9c3\"/></linearGradient></defs><rect width=\"600\" height=\"400\" fill=\"url(%23skyG)\"/><path d=\"M 220,380 C 180,300 240,240 200,160 C 170,100 230,60 210,20\" stroke=\"%2338bdf8\" stroke-width=\"3\" stroke-dasharray=\"6,6\" fill=\"none\" opacity=\"0.6\"/><path d=\"M 380,380 C 340,300 400,240 360,160 C 330,100 390,60 370,20\" stroke=\"%2338bdf8\" stroke-width=\"3\" stroke-dasharray=\"6,6\" fill=\"none\" opacity=\"0.6\"/><polygon points=\"0,400 140,260 170,400\" fill=\"%2378350f\" opacity=\"0.9\"/><polygon points=\"450,400 480,240 600,400\" fill=\"%2378350f\" opacity=\"0.9\"/><g transform=\"translate(170, 90)\"><path d=\"M 130,80 C 50,50 -40,30 -50,60 C -10,95 80,105 120,95 Z\" fill=\"%2392400e\"/><path d=\"M -50,60 L -70,50 M -50,65 L -68,62 M -48,70 L -64,75\" stroke=\"%23451a03\" stroke-width=\"4\" stroke-linecap=\"round\"/><path d=\"M 150,80 C 230,50 320,30 330,60 C 290,95 200,105 160,95 Z\" fill=\"%2392400e\"/><path d=\"M 330,60 L 350,50 M 330,65 L 348,62 M 328,70 L 344,75\" stroke=\"%23451a03\" stroke-width=\"4\" stroke-linecap=\"round\"/><polygon points=\"128,95 118,140 162,140 152,95\" fill=\"%23451a03\"/><ellipse cx=\"140\" cy=\"85\" rx=\"22\" ry=\"16\" fill=\"%23b45309\"/><circle cx=\"140\" cy=\"74\" r=\"10\" fill=\"%23f8fafc\"/><path d=\"M 138,70 Q 140,55 140,46\" stroke=\"%23fed7aa\" stroke-width=\"6\" stroke-linecap=\"round\"/><circle cx=\"140\" cy=\"44\" r=\"7\" fill=\"%23fed7aa\"/><polygon points=\"137,42 143,42 140,34\" fill=\"%23e2e8f0\"/></g><text x=\"24\" y=\"375\" font-family=\"sans-serif\" font-weight=\"800\" font-size=\"16\" fill=\"%23451a03\">Όρνιο (Gyps fulvus) - Κυρίαρχος των Θερμών Ρευμάτων</text></svg>"
    },
    "payload_en": {
      "gridPieces": 6,
      "imageUrl": "data:image/svg+xml;utf8,<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 600 400\" width=\"600\" height=\"400\"><defs><linearGradient id=\"skyG\" x1=\"0\" y1=\"0\" x2=\"0\" y2=\"1\"><stop offset=\"0%\" stop-color=\"%230ea5e9\"/><stop offset=\"70%\" stop-color=\"%23e0f2fe\"/><stop offset=\"100%\" stop-color=\"%23fef9c3\"/></linearGradient></defs><rect width=\"600\" height=\"400\" fill=\"url(%23skyG)\"/><path d=\"M 220,380 C 180,300 240,240 200,160 C 170,100 230,60 210,20\" stroke=\"%2338bdf8\" stroke-width=\"3\" stroke-dasharray=\"6,6\" fill=\"none\" opacity=\"0.6\"/><path d=\"M 380,380 C 340,300 400,240 360,160 C 330,100 390,60 370,20\" stroke=\"%2338bdf8\" stroke-width=\"3\" stroke-dasharray=\"6,6\" fill=\"none\" opacity=\"0.6\"/><polygon points=\"0,400 140,260 170,400\" fill=\"%2378350f\" opacity=\"0.9\"/><polygon points=\"450,400 480,240 600,400\" fill=\"%2378350f\" opacity=\"0.9\"/><g transform=\"translate(170, 90)\"><path d=\"M 130,80 C 50,50 -40,30 -50,60 C -10,95 80,105 120,95 Z\" fill=\"%2392400e\"/><path d=\"M -50,60 L -70,50 M -50,65 L -68,62 M -48,70 L -64,75\" stroke=\"%23451a03\" stroke-width=\"4\" stroke-linecap=\"round\"/><path d=\"M 150,80 C 230,50 320,30 330,60 C 290,95 200,105 160,95 Z\" fill=\"%2392400e\"/><path d=\"M 330,60 L 350,50 M 330,65 L 348,62 M 328,70 L 344,75\" stroke=\"%23451a03\" stroke-width=\"4\" stroke-linecap=\"round\"/><polygon points=\"128,95 118,140 162,140 152,95\" fill=\"%23451a03\"/><ellipse cx=\"140\" cy=\"85\" rx=\"22\" ry=\"16\" fill=\"%23b45309\"/><circle cx=\"140\" cy=\"74\" r=\"10\" fill=\"%23f8fafc\"/><path d=\"M 138,70 Q 140,55 140,46\" stroke=\"%23fed7aa\" stroke-width=\"6\" stroke-linecap=\"round\"/><circle cx=\"140\" cy=\"44\" r=\"7\" fill=\"%23fed7aa\"/><polygon points=\"137,42 143,42 140,34\" fill=\"%23e2e8f0\"/></g><text x=\"24\" y=\"375\" font-family=\"sans-serif\" font-weight=\"800\" font-size=\"16\" fill=\"%23451a03\">Griffon Vulture (Gyps fulvus) - Soaring Updraft Master</text></svg>"
    },
    "explanation": "Τα Όρνια χρησιμοποιούν τα θερμά ανοδικά ρεύματα για να ανυψώνονται κυκλικά χωρίς κόπο έως και 3.000 μέτρα, διανύοντας πάνω από 100-200 χλμ ημερησίως.",
    "explanation_en": "Griffon Vultures exploit rising thermal columns to spiral up to 3,000m, covering vast 100-200km daily foraging sweeps effortlessly."
  },
  {
    "id": "cyprus-vulture-24",
    "title": "Υλικά Κατασκευής της Φωλιάς",
    "title_en": "Nest Construction Materials",
    "description": "Ποια υλικά μεταφέρει το ζευγάρι των γυπών στο ράμφος του για να στρώσει τη φωλιά του;",
    "description_en": "What natural materials do vulture pairs carry in their bills to line their cliff nest?",
    "type": "multiple_choice",
    "points": 90,
    "assignedTeamIds": [
      "team-beta"
    ],
    "isActive": true,
    "payload": {
      "options": [
        "Χοντρά κλαδιά για τη βάση, ξερά χόρτα και μαλλί προβάτων για μαλακό και ζεστό στρώσιμο",
        "Λάσπη και βότσαλα της θάλασσας",
        "Σύρματα και πλαστικά μπουκάλια",
        "Δεν χρησιμοποιούν απολύτως κανένα υλικό"
      ],
      "correctOptionIndex": 0
    },
    "payload_en": {
      "options": [
        "Stout wooden branches for structure, dried grasses and sheep wool for warm lining",
        "Maritime mud and sea pebbles",
        "Wire scraps and discarded plastic",
        "They never bring any lining materials"
      ],
      "correctOptionIndex": 0
    },
    "explanation": "Η φωλιά επενδύεται προσεκτικά με μαλλί προβάτων που συλλέγουν από θάμνους, προστατεύοντας το αυγό από το κρύο των χειμερινών βράχων.",
    "explanation_en": "Pairs line the rocky cradle with sheep fleece collected from thorn bushes, insulating the egg against freezing limestone winter chill."
  },
  {
    "id": "cyprus-vulture-25",
    "title": "Αντιστοίχιση Τοποθεσιών, Φωλεοποίησης & Πτήσης",
    "title_en": "Matching Habitat, Nesting & Flight Geography",
    "description": "Συνδέστε κάθε γεωγραφικό και οικολογικό στοιχείο της Κύπρου με τη σωστή λειτουργία του για τους γύπες:",
    "description_en": "Match each Cypriot geographic and ecological element to its biological role for the vultures:",
    "type": "text_match",
    "points": 120,
    "assignedTeamIds": [
      "team-beta"
    ],
    "isActive": true,
    "payload": {
      "pairs": [
        {
          "id": "hb1",
          "left": "Γκρεμοί Επισκοπής",
          "right": "Κύρια αποικία φωλεοποίησης σε απόκρημνους λευκούς βράχους"
        },
        {
          "id": "hb2",
          "left": "Θερμικά Ανοδικά Ρεύματα",
          "right": "Ανερχόμενες στήλες θερμού αέρα για πτήση χωρίς κόπο"
        },
        {
          "id": "hb3",
          "left": "Κοιλάδες Διαρίζου & Χα-Ποτάμι",
          "right": "Φυσικοί διάδρομοι πτήσης προς τα ορεινά βοσκοτόπια"
        },
        {
          "id": "hb4",
          "left": "Ακτίνα Αναζήτησης Τροφής",
          "right": "Ημερήσιες πτήσεις άνω των 100 χιλιομέτρων"
        },
        {
          "id": "hb5",
          "left": "Διάρκεια Επώασης Αυγού",
          "right": "52 έως 58 ημέρες από κοινού από τους δύο γονείς"
        }
      ]
    },
    "payload_en": {
      "pairs": [
        {
          "id": "hb1",
          "left": "Episkopi Sea Cliffs",
          "right": "Primary nesting bastion on sheer coastal limestone crags"
        },
        {
          "id": "hb2",
          "left": "Thermal Updrafts",
          "right": "Rising columns of solar-heated air for effortless gliding"
        },
        {
          "id": "hb3",
          "left": "Diarizos & Cha-Potami Valleys",
          "right": "Natural flight corridors towards mountain grazing lands"
        },
        {
          "id": "hb4",
          "left": "Foraging Range",
          "right": "Daily flight sweeps exceeding 100 kilometres"
        },
        {
          "id": "hb5",
          "left": "Egg Incubation Period",
          "right": "52 to 58 days shared equally between parents"
        }
      ]
    },
    "explanation": "Οι γκρεμοί της Επισκοπής παρέχουν καταφύγιο, τα θερμικά ρεύματα προσφέρουν ενέργεια και οι κοιλάδες Διαρίζου & Χα-Ποτάμι οδηγούν στις βοσκές του Τροόδους.",
    "explanation_en": "Episkopi cliffs offer nesting sanctuary, thermals provide fuel-free lift, and Diarizos gorges funnel vultures inland to Troodos pastures."
  },
  {
    "id": "cyprus-vulture-26",
    "title": "Χρόνος Παραμονής του Νεοσσού στη Φωλιά (Fledging)",
    "title_en": "Nestling Period & First Flight (Fledging)",
    "description": "Πόσο καιρό παραμένει το μικρό Όρνιο στη φωλιά από τη στιγμή που θα εκκολαφθεί μέχρι την πρώτη του πτήση;",
    "description_en": "How long does a vulture chick remain in the nest from hatching until its maiden flight?",
    "type": "multiple_choice",
    "points": 100,
    "assignedTeamIds": [
      "team-beta"
    ],
    "isActive": true,
    "payload": {
      "options": [
        "Περίπου 3.5 με 4 μήνες (110-120 ημέρες)",
        "Μόλις 10 ημέρες",
        "2 ολόκληρα χρόνια",
        "4 εβδομάδες"
      ],
      "correctOptionIndex": 0
    },
    "payload_en": {
      "options": [
        "Approximately 3.5 to 4 months (110-120 days)",
        "Merely 10 days",
        "2 full years",
        "4 weeks"
      ],
      "correctOptionIndex": 0
    },
    "explanation": "Ο νεοσσός μεγαλώνει αργά και εξαρτάται απόλυτα από τους γονείς του για 4 μήνες, κάνοντας την πρώτη του πτήση στις αρχές του καλοκαιριού.",
    "explanation_en": "The fledgling develops slowly, spending 110-120 days dependent on parental provisioning before fledging in early summer."
  },
  {
    "id": "cyprus-vulture-27",
    "title": "Κούρνιες (Roosts) & Κοινωνικότητα",
    "title_en": "Roosting Sites & Social Clustering",
    "description": "Τι ονομάζουμε «κούρνια» των γυπών;",
    "description_en": "What is an avian 'roost' in vulture ecology?",
    "type": "multiple_choice",
    "points": 90,
    "assignedTeamIds": [
      "team-beta"
    ],
    "isActive": true,
    "payload": {
      "options": [
        "Ασφαλής γκρεμός ή βράχος όπου συγκεντρώνονται πολλά Όρνια μαζί για να κοιμηθούν τη νύχτα και να περιποιηθούν τα φτερά τους",
        "Παγίδα για θηράματα",
        "Υπόγειο λαγούμι",
        "Σημείο όπου πίνουν νερό"
      ],
      "correctOptionIndex": 0
    },
    "payload_en": {
      "options": [
        "Sheltered cliff ledges where vultures congregate in groups to roost overnight and preen feathers",
        "A ground predator trap",
        "An underground burrow",
        "A drinking water spring"
      ],
      "correctOptionIndex": 0
    },
    "explanation": "Οι κούρνιες είναι κοινωνικά κέντρα όπου οι γύπες ανταλλάσσουν πληροφορίες: βλέποντας ποια πουλιά έχουν γεμάτο πρόλοβο, καταλαβαίνουν πού υπάρχει τροφή.",
    "explanation_en": "Roosts are vital social hubs where vultures gauge flock mates' crop fullness to identify foraging coordinates."
  },
  {
    "id": "cyprus-vulture-28",
    "title": "Σωστό ή Λάθος: Κοινωνική Φωλεοποίηση σε Αποικίες",
    "title_en": "True or False: Colonial Nesting Strategy",
    "description": "Τα Όρνια είναι μοναχικά πουλιά που δεν ανέχονται άλλα Όρνια κοντά στη φωλιά τους.",
    "description_en": "Griffon Vultures are strictly solitary nesters that fiercely drive away other vultures from cliff faces.",
    "type": "true_false",
    "points": 90,
    "assignedTeamIds": [
      "team-beta"
    ],
    "isActive": true,
    "payload": {
      "correctValue": false
    },
    "payload_en": {
      "correctValue": false
    },
    "explanation": "Λάθος! Το Όρνιο είναι ένα κατ' εξοχήν αποικιακό είδος. Πολλά ζευγάρια φωλιάζουν σε μικρή απόσταση στον ίδιο γκρεμό, σχηματίζοντας αποικίες.",
    "explanation_en": "False! Griffon Vultures are colonial breeders, constructing nests in loose clusters on the same cliff amphitheatre."
  },
  {
    "id": "cyprus-vulture-29",
    "title": "Ταχύτητα Πτήσης κατά τη Μετακίνηση",
    "title_en": "Cruising Speed Between Thermals",
    "description": "Με τι ταχύτητα γλιστράει ένα Όρνιο στον αέρα όταν ταξιδεύει από το ένα θερμικό ρεύμα στο άλλο;",
    "description_en": "At what glide speed does a Griffon Vulture cruise through calm air when transitioning between thermals?",
    "type": "multiple_choice",
    "points": 100,
    "assignedTeamIds": [
      "team-beta"
    ],
    "isActive": true,
    "payload": {
      "options": [
        "60 έως 80 χλμ/ώρα (και σε καταδύσεις πάνω από 120 χλμ/ώρα)",
        "Μόλις 10 χλμ/ώρα",
        "300 χλμ/ώρα",
        "5 χλμ/ώρα"
      ],
      "correctOptionIndex": 0
    },
    "payload_en": {
      "options": [
        "60 to 80 km/h (reaching over 120 km/h in steep descents)",
        "Only 10 km/h",
        "300 km/h",
        "5 km/h"
      ],
      "correctOptionIndex": 0
    },
    "explanation": "Μετά την άνοδο σε ένα θερμικό, το Όρνιο γλιστρά με ταχύτητα 60-80 χλμ/ώρα προς την κατεύθυνση που επιθυμεί χωρίς να κουνήσει τα φτερά του.",
    "explanation_en": "After topping out in a thermal elevator, vultures glide effortlessly forward at 60-80 km/h toward the next updraft."
  },
  {
    "id": "cyprus-vulture-30",
    "title": "Αντίδραση σε Δυσμενείς Καιρικές Συνθήκες",
    "title_en": "Weather Adaptations: Rain & Heavy Mist",
    "description": "Τι κάνουν τα Όρνια όταν βρέχει καταρρακτωδώς ή έχει πυκνή ομίχλη στην Κύπρο;",
    "description_en": "How do Griffon Vultures respond when heavy rainstorms or thick mountain fogs engulf the terrain?",
    "type": "multiple_choice",
    "points": 90,
    "assignedTeamIds": [
      "team-beta"
    ],
    "isActive": true,
    "payload": {
      "options": [
        "Παραμένουν προσγειωμένα στις προφυλαγμένες εσοχές των βράχων γιατί τα βρεγμένα φτερά βαραίνουν και δεν υπάρχουν ανοδικά ρεύματα",
        "Πετούν πάνω από τις καταιγίδες στο διάστημα",
        "Κολυμπούν στις κοίτες των ποταμών",
        "Περπατούν με τα πόδια στους δρόμους"
      ],
      "correctOptionIndex": 0
    },
    "payload_en": {
      "options": [
        "They remain anchored in sheltered cliff crevices because wet plumage adds drag and thermals collapse",
        "They fly into space above thunderstorm clouds",
        "They swim inside flooded riverbeds",
        "They hike on foot along asphalt highways"
      ],
      "correctOptionIndex": 0
    },
    "explanation": "Σε κακοκαιρία οι γύπες καθηλώνονται στα βράχια. Μπορούν να περιμένουν νηστικοί αρκετές ημέρες μέχρι να ξαναβγεί ήλιος.",
    "explanation_en": "Adverse weather grounds heavy soaring birds; vultures comfortably fast for days on dry ledges awaiting solar resurgence."
  },
  {
    "id": "cyprus-vulture-31",
    "title": "Αποκλειστικά Πτωματοφάγοι (Scavengers, not predators)",
    "title_en": "Strict Obligate Scavengers (Not Predators)",
    "description": "Επιτίθενται ποτέ τα Όρνια σε ζωντανά, υγιή ζώα όπως αρνιά ή λαγούς για να τα σκοτώσουν;",
    "description_en": "Do Griffon Vultures ever hunt or kill healthy, live animals such as sheep or hares?",
    "type": "multiple_choice",
    "points": 100,
    "assignedTeamIds": [
      "team-gamma"
    ],
    "isActive": true,
    "payload": {
      "options": [
        "Όχι ποτέ! Είναι υποχρεωτικά πτωματοφάγα πουλιά και τρέφονται αποκλειστικά με ήδη νεκρά ζώα",
        "Ναι, κυνηγούν δραστήρια με τα νύχια τους",
        "Ναι, επιτίθενται σε κοπάδια βοοειδών",
        "Τρέφονται μόνο με φρούτα και σπόρους"
      ],
      "correctOptionIndex": 0
    },
    "payload_en": {
      "options": [
        "Never! They are obligate scavengers feeding exclusively on already dead animal carcasses",
        "Yes, they actively hunt with their talons",
        "Yes, they ambush cattle herds",
        "They eat wild fruits and grain"
      ],
      "correctOptionIndex": 0
    },
    "explanation": "Ο μύθος ότι οι γύπες σκοτώνουν ζωντανά ζώα είναι παντελώς λανθασμένος. Η ανατομία τους δεν τους επιτρέπει να επιτεθούν σε ζωντανή λεία.",
    "explanation_en": "The myth that vultures attack livestock is baseless. Their blunt claws and anatomy prevent hunting live prey."
  },
  {
    "id": "cyprus-vulture-32",
    "title": "Γυμνός Λαιμός για Υγιεινή",
    "title_en": "Bare Neck Adaptation for Hygiene",
    "description": "Γιατί ο λαιμός και το κεφάλι του Όρνιου δεν έχουν πυκνά φτερά αλλά μόνο λεπτό, απαλό χνούδι;",
    "description_en": "Why are the head and long neck of the Griffon Vulture devoid of dense feathers, clad only in short down?",
    "type": "multiple_choice",
    "points": 110,
    "assignedTeamIds": [
      "team-gamma"
    ],
    "isActive": true,
    "payload": {
      "options": [
        "Για λόγους υγιεινής: για να μην λερώνεται με αίμα και βακτήρια όταν βυθίζει το κεφάλι του βαθιά στα κουφάρια και να καθαρίζει εύκολα στον ήλιο",
        "Επειδή το μαδούν οι άλλοι γύπες",
        "Για να δείχνει πιο άγριο στους εχθρούς",
        "Επειδή υποφέρει από κάποια δερματική ασθένεια"
      ],
      "correctOptionIndex": 0
    },
    "payload_en": {
      "options": [
        "For hygiene: preventing blood and rotting tissue from coagulating in feathers when reaching deep into carcasses, sanitized by solar UV",
        "Because flock mates pluck its feathers",
        "To look intimidating to competitors",
        "Due to endemic skin parasites"
      ],
      "correctOptionIndex": 0
    },
    "explanation": "Ο γυμνός λαιμός είναι θαύμα εξέλιξης: αποτρέπει τη συσσώρευση βακτηρίων. Η ηλιακή υπεριώδης ακτινοβολία (UV) απολυμαίνει άμεσα το δέρμα του.",
    "explanation_en": "A featherless neck prevents foul bacterial buildup when feeding deep within carcasses; solar UV rays bake the exposed skin sterile."
  },
  {
    "id": "cyprus-vulture-33",
    "title": "Προτίμηση Τροφής: Μαλακοί Ιστοί & Σπλάχνα",
    "title_en": "Dietary Niche: Soft Muscle & Viscera",
    "description": "Ποια μέρη του κουφαριού είναι ειδικά προσαρμοσμένο να καταναλώνει το Όρνιο;",
    "description_en": "Which specific anatomical portions of a carcass is the Griffon Vulture specialized in consuming?",
    "type": "multiple_choice",
    "points": 100,
    "assignedTeamIds": [
      "team-gamma"
    ],
    "isActive": true,
    "payload": {
      "options": [
        "Τους μαλακούς μυς, το κρέας και τα εσωτερικά σπλάχνα των νεκρών οπληφόρων ζώων",
        "Μόνο τα σκληρά κόκαλα (όπως ο Γυπαετός)",
        "Μόνο το σκληρό εξωτερικό δέρμα",
        "Τα κέρατα και τις οπλές"
      ],
      "correctOptionIndex": 0
    },
    "payload_en": {
      "options": [
        "Soft skeletal muscle tissues and internal viscera of dead ungulates",
        "Heavy dry marrow bones (like the Bearded Vulture)",
        "Strictly dried hide and hair",
        "Horns and hooves"
      ],
      "correctOptionIndex": 0
    },
    "explanation": "Στο οικολογικό «τραπέζι», το Όρνιο έχει τον ρόλο του καταναλωτή μαλακών ιστών και σπλάχνων, χάρη στο ισχυρό, κυρτό του ράμφος.",
    "explanation_en": "Within the scavenger guild, Griffon Vultures specialize in tearing tender muscle flesh and viscera with curved hook-beaks."
  },
  {
    "id": "cyprus-vulture-34",
    "title": "Πανίσχυρα Γαστρικά Οξέα (Stomach pH ~1-2)",
    "title_en": "Extreme Gastric Acidity (pH ~1.0)",
    "description": "Πόσο όξινο είναι το περιβάλλον στο στομάχι του γύπα και τι καταφέρνει με αυτό;",
    "description_en": "How acidic is the digestive environment of a vulture's stomach, and what is its biological purpose?",
    "type": "multiple_choice",
    "points": 110,
    "assignedTeamIds": [
      "team-gamma"
    ],
    "isActive": true,
    "payload": {
      "options": [
        "Εξαιρετικά όξινο (pH κοντά στο 1, σαν οξύ μπαταρίας), ικανό να σκοτώσει θανατηφόρα βακτήρια όπως ο άνθρακας, η αλλαντίαση και η χολέρα",
        "Εντελώς ουδέτερο σαν το καθαρό νερό",
        "Έχει pH ίδιο με του ανθρώπου",
        "Δεν έχει κανένα οξύ"
      ],
      "correctOptionIndex": 0
    },
    "payload_en": {
      "options": [
        "Extremely acidic (pH near 1.0, rivaling battery acid), sterilizing lethal spores of anthrax, botulism, and cholera",
        "Completely neutral like distilled water",
        "Identical to human stomach pH",
        "Devoid of digestive acids"
      ],
      "correctOptionIndex": 0
    },
    "explanation": "Το γαστρικό υγρό του γύπα εξουδετερώνει τα πιο επικίνδυνα παθογόνα μικρόβια της φύσης. Ο γύπας λειτουργεί ως απόλυτος βιολογικός απολυμαντής.",
    "explanation_en": "Vulture gastric secretions neutralize lethal pathogens (anthrax, botulinum toxins, cholera), recycling toxic flesh into pure biomass."
  },
  {
    "id": "cyprus-vulture-35",
    "title": "Όσφρηση vs Όραση: Πώς Βρίσκουν την Τροφή;",
    "title_en": "Olfaction vs Vision: Carcass Detection",
    "description": "Είναι αλήθεια ότι τα Όρνια μυρίζουν τα κουφάρια από χιλιόμετρα μακριά;",
    "description_en": "Is it true that Old World Griffon Vultures smell rotting carcasses from miles away?",
    "type": "multiple_choice",
    "points": 100,
    "assignedTeamIds": [
      "team-gamma"
    ],
    "isActive": true,
    "payload": {
      "options": [
        "Όχι! Οι γύπες του Παλαιού Κόσμου δεν έχουν ανεπτυγμένη όσφρηση. Εντοπίζουν την τροφή αποκλειστικά και μόνο με την εκπληκτική όρασή τους",
        "Ναι, μυρίζουν το κρέας από απόσταση 50 χιλιομέτρων",
        "Χρησιμοποιούν ειδικά μουστάκια για να μυρίζουν",
        "Ακολουθούν τη μυρωδιά του ανέμου"
      ],
      "correctOptionIndex": 0
    },
    "payload_en": {
      "options": [
        "No! Old World vultures have virtually no sense of smell; they locate food exclusively through exceptional optical acuity",
        "Yes, they detect meat scent across 50 kilometres",
        "They utilize specialized sensory whiskers",
        "They track smell plumes in air currents"
      ],
      "correctOptionIndex": 0
    },
    "explanation": "Μόνο ορισμένοι γύπες της Αμερικής έχουν όσφρηση. Το Όρνιο της Ευρώπης και Κύπρου βασίζεται 100% στα μάτια του και στη συμπεριφορά των άλλων πουλιών.",
    "explanation_en": "Unlike American turkey vultures, Old World vultures possess negligible olfaction, relying strictly on sharp eyesight."
  },
  {
    "id": "cyprus-vulture-qr-56",
    "title": "Σταθμός QR Πάρκου: Παρατηρητήριο & Ταΐστρα (#56)",
    "title_en": "Park QR Station: Feeding Site Observation (#56)",
    "description": "Σκανάρετε ή καταχωρήστε τον επίσημο κωδικό του σταθμού QR στο πάρκο (#56) για να ξεκλειδώσετε το αποκλειστικό βίντεο και φωτογραφίες σίτισης των γυπών.",
    "description_en": "Scan or enter the official QR station code at the park feeding point (#56) to unlock exclusive video and photos of the vultures.",
    "type": "qr_scan",
    "points": 150,
    "assignedTeamIds": [
      "team-gamma"
    ],
    "isActive": true,
    "payload": {
      "targetCode": "VULTURE-PARK-STATION-56",
      "locationHint": "Αναζητήστε τον σταθμό QR στον πίνακα παρατήρησης της ταΐστρας του πάρκου (#56).",
      "unlockedMedia": {
        "type": "video",
        "url": "https://www.youtube.com/watch?v=0hM4c_K4b9E",
        "title": "Αποκλειστικό Βίντεο: Γύπες στην Ταΐστρα της Κύπρου (LIFE with Vultures)",
        "caption": "Επιτόπια καταγραφή σίτισης γυπών στην ειδική περιφραγμένη ταΐστρα της επαρχίας Λεμεσού στο πλαίσιο του προγράμματος LIFE with Vultures."
      },
      "unlockedVideoUrl": "https://www.youtube.com/watch?v=0hM4c_K4b9E",
      "unlockedImageUrl": "data:image/svg+xml;utf8,<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 600 400\" width=\"600\" height=\"400\"><rect width=\"600\" height=\"400\" fill=\"%230f172a\"/><path d=\"M 130,80 C 50,50 -40,30 -50,60 C -10,95 80,105 120,95 Z\" fill=\"%2392400e\"/><path d=\"M 150,80 C 230,50 320,30 330,60 C 290,95 200,105 160,95 Z\" fill=\"%2392400e\"/><ellipse cx=\"140\" cy=\"85\" rx=\"22\" ry=\"16\" fill=\"%23b45309\"/><circle cx=\"140\" cy=\"74\" r=\"10\" fill=\"%23f8fafc\"/><text x=\"30\" y=\"360\" font-family=\"sans-serif\" font-weight=\"bold\" font-size=\"20\" fill=\"%2338bdf8\">Ταΐστρα Όρνιων Κύπρου - Σταθμός #56</text></svg>"
    },
    "payload_en": {
      "targetCode": "VULTURE-PARK-STATION-56",
      "locationHint": "Locate the QR code station placard at the park feeding observation shelter (#56).",
      "unlockedMedia": {
        "type": "video",
        "url": "https://www.youtube.com/watch?v=0hM4c_K4b9E",
        "title": "Exclusive Footage: Cyprus Vultures at Feeding Station (LIFE with Vultures)",
        "caption": "Field footage of Griffon Vultures feeding safely at the supplementary station in Limassol under the LIFE with Vultures project."
      },
      "unlockedVideoUrl": "https://www.youtube.com/watch?v=0hM4c_K4b9E"
    },
    "explanation": "Η παρατήρηση στις ειδικές ταΐστρες επιτρέπει την καταγραφή των διατροφικών συνηθειών και της κοινωνικής ιεραρχίας των γυπών.",
    "explanation_en": "Monitoring at supplementary stations provides researchers data on feeding dynamics and flock health."
  },
  {
    "id": "cyprus-vulture-37",
    "title": "Ανάγκη για Λουτρά & Καθαριότητα Φτερώματος",
    "title_en": "Preening & Post-Feeding Water Baths",
    "description": "Γιατί οι γύπες επισκέπτονται συχνά λιμνούλες και ρυάκια αμέσως μετά από ένα μεγάλο γεύμα;",
    "description_en": "Why do vultures seek mountain streams and ponds immediately after concluding a feast?",
    "type": "multiple_choice",
    "points": 100,
    "assignedTeamIds": [
      "team-gamma"
    ],
    "isActive": true,
    "payload": {
      "options": [
        "Για να πλυθούν σχολαστικά και να απομακρύνουν υπολείμματα τροφής και λίπους που θα κατέστρεφαν τη μόνωση και την πτήση των φτερών τους",
        "Για να πιάσουν βατράχια και ψάρια",
        "Επειδή τους αρέσει να κολυμπούν",
        "Για να αλλάξουν το χρώμα των ποδιών τους"
      ],
      "correctOptionIndex": 0
    },
    "payload_en": {
      "options": [
        "To thoroughly wash away blood and fat residues that would mat feathers and compromise flight aerodynamics",
        "To catch frogs and freshwater fish",
        "Because they enjoy recreational swimming",
        "To change leg coloration"
      ],
      "correctOptionIndex": 0
    },
    "explanation": "Οι γύπες είναι απρόσμενα καθαρά πουλιά. Περνούν ώρες πλένοντας το φτέρωμά τους και λιάζοντας τα φτερά τους στον ήλιο.",
    "explanation_en": "Vultures are meticulously hygienic birds, bathing vigorously and sunning their plumage to keep flight surfaces pristine."
  },
  {
    "id": "cyprus-vulture-38",
    "title": "Πρόλοβος (Crop Storage)",
    "title_en": "The Crop: Elastic Food Storage",
    "description": "Πόση τροφή μπορεί να αποθηκεύσει ένα Όρνιο στον πρόλοβό του σε ένα και μόνο γεύμα;",
    "description_en": "How much food can a Griffon Vulture store inside its elastic esophagus crop during a single meal?",
    "type": "multiple_choice",
    "points": 100,
    "assignedTeamIds": [
      "team-gamma"
    ],
    "isActive": true,
    "payload": {
      "options": [
        "Περίπου 1 έως 1.5 κιλό κρέας (προεξέχει φουσκωμένος στο στήθος)",
        "Μόλις 50 γραμμάρια",
        "10 κιλά",
        "Δεν έχει πρόλοβο"
      ],
      "correctOptionIndex": 0
    },
    "payload_en": {
      "options": [
        "Approximately 1 to 1.5 kilograms of meat (protruding conspicuously on the chest)",
        "Merely 50 grams",
        "10 kilograms",
        "Vultures lack an esophagus crop"
      ],
      "correctOptionIndex": 0
    },
    "explanation": "Ο πρόλοβος επιτρέπει στον γύπα να φάει γρήγορα μεγάλη ποσότητα κρέατος και να την μεταφέρει με ασφάλεια στη φωλιά για τον νεοσσό του.",
    "explanation_en": "The expandable crop enables a vulture to gorge over 1 kg of meat swiftly and regurgitate clean nutrition to its chick."
  },
  {
    "id": "cyprus-vulture-39",
    "title": "Κοινωνική Σίτιση: Η «Πληροφορία» στον Αέρα",
    "title_en": "Flock Information Transfer in Soaring Vultures",
    "description": "Πώς συγκεντρώνονται δεκάδες γύπες σε ένα κουφάρι μέσα σε ελάχιστα λεπτά;",
    "description_en": "How do dozens of widely dispersed vultures converge on a fresh carcass within minutes?",
    "type": "multiple_choice",
    "points": 100,
    "assignedTeamIds": [
      "team-gamma"
    ],
    "isActive": true,
    "payload": {
      "options": [
        "Παρακολουθούν ο ένας τις κινήσεις του άλλου στον ουρανό: όταν ένα Όρνιο εντοπίσει τροφή και αρχίσει κάθοδο, όλα τα γειτονικά πουλιά το αντιγράφουν αλυσιδωτά",
        "Τηλεφωνούνται με ειδικούς ήχους",
        "Τους ειδοποιούν οι λύκοι",
        "Έχουν τηλεπάθεια"
      ],
      "correctOptionIndex": 0
    },
    "payload_en": {
      "options": [
        "They watch each other across vast sky grids: when one vulture spirals downward, surrounding sentinels follow in chain reaction",
        "They broadcast loud calls across mountain ranges",
        "Wild wolves signal their location",
        "They share telepathic connections"
      ],
      "correctOptionIndex": 0
    },
    "explanation": "Οι γύπες σχηματίζουν ένα τεράστιο οπτικό δίκτυο στον ουρανό. Κάθε πουλί επιτηρεί όχι μόνο το έδαφος, αλλά και τους γύρω γύπες.",
    "explanation_en": "Vultures maintain a distributed celestial surveillance network; one diving bird triggers an island-wide convergence."
  },
  {
    "id": "cyprus-vulture-40",
    "title": "Ταχύτητα Κατανάλωσης Κουφαριού",
    "title_en": "Carcass Consumption Speed",
    "description": "Πόσο γρήγορα μπορεί μια ομάδα 10-15 γυπών να καθαρίσει πλήρως ένα κουφάρι προβάτου;",
    "description_en": "How swiftly can a feeding flock of 10-15 Griffon Vultures strip a sheep carcass down to bare bones?",
    "type": "multiple_choice",
    "points": 100,
    "assignedTeamIds": [
      "team-gamma"
    ],
    "isActive": true,
    "payload": {
      "options": [
        "Σε λιγότερο από 20 έως 40 λεπτά",
        "Χρειάζονται 3 εβδομάδες",
        "Σε 5 ολόκληρες μέρες",
        "Σε 10 δευτερόλεπτα"
      ],
      "correctOptionIndex": 0
    },
    "payload_en": {
      "options": [
        "In less than 20 to 40 minutes",
        "They require 3 weeks",
        "In 5 full days",
        "In 10 seconds"
      ],
      "correctOptionIndex": 0
    },
    "explanation": "Η απίστευτη ταχύτητα με την οποία τρώνε οι γύπες είναι μηχανισμός επιβίωσης για να μην προλάβουν άλλοι ανταγωνιστές να κλέψουν την τροφή.",
    "explanation_en": "Vulture ravenous feeding velocity is an evolutionary imperative to outcompete terrestrial mammalian carnivores."
  },
  {
    "id": "cyprus-vulture-41",
    "title": "Δημόσια Υγεία: Η «Υγειονομική Υπηρεσία» της Φύσης",
    "title_en": "Ecosystem Sanitation & Public Health",
    "description": "Πώς ωφελούν οι γύπες τις τοπικές κοινότητες και τους κτηνοτρόφους της Κύπρου;",
    "description_en": "How do vultures directly benefit rural communities and pastoralists across Cyprus?",
    "type": "multiple_choice",
    "points": 110,
    "assignedTeamIds": [
      "team-gamma"
    ],
    "isActive": true,
    "payload": {
      "options": [
        "Εξαφανίζουν γρήγορα και δωρεάν τα νεκρά ζώα, αποτρέποντας τη μόλυνση των πηγών νερού και τη διάδοση επιδημιών",
        "Βοηθούν στο όργωμα των χωραφιών",
        "Φυλάνε τα μαντριά τη νύχτα",
        "Δεν προσφέρουν καμία απολύτως ωφέλεια"
      ],
      "correctOptionIndex": 0
    },
    "payload_en": {
      "options": [
        "They eliminate carcasses swiftly free of charge, preventing groundwater contamination and infectious bacterial epidemics",
        "They assist in plowing agrarian fields",
        "They guard sheep pens at night",
        "They provide no ecosystem service"
      ],
      "correctOptionIndex": 0
    },
    "explanation": "Χωρίς γύπες, τα κουφάρια σαπίζουν στο έδαφος, πολλαπλασιάζοντας μύγες, ποντίκια και επικίνδυνα βακτήρια. Οι γύπες είναι η φυσική ανακύκλωση της υπαίθρου.",
    "explanation_en": "Without vultures, rotting carcasses foul water tables and breed disease vectors. Vultures provide vital sanitization."
  },
  {
    "id": "cyprus-vulture-42",
    "title": "Ουρο εφίδρωση (Urohidrosis) & Θερμορρύθμιση",
    "title_en": "Urohidrosis: Cooling & Leg Disinfection",
    "description": "Γιατί τα Όρνια αφοδεύουν συχνά πάνω στα ίδια τους τα πόδια τις ζεστές καλοκαιρινές ημέρες;",
    "description_en": "Why do Griffon Vultures excrete liquid uric acid onto their bare legs on scorching summer afternoons?",
    "type": "multiple_choice",
    "points": 100,
    "assignedTeamIds": [
      "team-gamma"
    ],
    "isActive": true,
    "payload": {
      "options": [
        "Για να δροσίζονται μέσω της εξάτμισης του υγρού και ταυτόχρονα να απολυμαίνουν τα πόδια τους από βακτήρια χάρη στο όξινο ουρικό οξύ",
        "Από λάθος επειδή δεν προσέχουν",
        "Για να αλλάζουν το χρώμα των ποδιών τους σε άσπρο",
        "Επειδή φοβούνται τους εχθρούς τους"
      ],
      "correctOptionIndex": 0
    },
    "payload_en": {
      "options": [
        "To cool their body temperature through evaporative cooling while sterilizing their scaly legs with acidic uric acid",
        "By accidental clumsy defecation",
        "To artificially camouflage their legs white",
        "Due to fear of airborne predators"
      ],
      "correctOptionIndex": 0
    },
    "explanation": "Η ουρο-εφίδρωση (urohidrosis) είναι εξειδικευμένη φυσιολογική συμπεριφορά: δροσίζει το αίμα στα πόδια και σκοτώνει τυχόν μικρόβια από τα κουφάρια.",
    "explanation_en": "Urohidrosis serves a dual purpose: lowering internal body heat via evaporation and chemically sanitizing legs against necrotizing bacteria."
  },
  {
    "id": "cyprus-vulture-43",
    "title": "Ανάγκη για Τροφή: Αντοχή στη Νηστεία",
    "title_en": "Fasting Endurance Between Meals",
    "description": "Πόσες ημέρες μπορεί να αντέξει ένα υγιές ενήλικο Όρνιο χωρίς καθόλου τροφή όταν οι καιρικές συνθήκες δεν επιτρέπουν πτήση;",
    "description_en": "How many days can a healthy adult Griffon Vulture comfortably fast when foul weather grounds the flock?",
    "type": "multiple_choice",
    "points": 100,
    "assignedTeamIds": [
      "team-gamma"
    ],
    "isActive": true,
    "payload": {
      "options": [
        "Από μία έως και δύο εβδομάδες (χάρη στα αποθέματα λίπους και τη χαμηλή κατανάλωση ενέργειας)",
        "Μόνο 2 ώρες",
        "Το πολύ 12 ώρες",
        "3 μήνες"
      ],
      "correctOptionIndex": 0
    },
    "payload_en": {
      "options": [
        "From one to two full weeks (thanks to fat reserves and minimal resting metabolic rate)",
        "Only 2 hours",
        "At most 12 hours",
        "3 months"
      ],
      "correctOptionIndex": 0
    },
    "explanation": "Οι γύπες είναι απόλυτα προσαρμοσμένοι στην εναλλαγή «αφθονίας και στέρησης». Μπορούν να φάνε τεράστια ποσότητα και μετά να αντέξουν μέρες νηστικοί.",
    "explanation_en": "Vultures are adapted to feast-and-famine cycles, enduring up to two weeks without food between carcass bonanzas."
  },
  {
    "id": "cyprus-vulture-44",
    "title": "Αντιστοίχιση Βιολογικών Προσαρμογών Διατροφής",
    "title_en": "Matching Dietary Biology & Anatomy",
    "description": "Συνδέστε κάθε ανατομική ή βιολογική προσαρμογή του Όρνιου με την ακριβή λειτουργία της στη διατροφή:",
    "description_en": "Match each anatomical or physiological adaptation of the Griffon Vulture to its dietary function:",
    "type": "text_match",
    "points": 120,
    "assignedTeamIds": [
      "team-gamma"
    ],
    "isActive": true,
    "payload": {
      "pairs": [
        {
          "id": "d1",
          "left": "Γυμνός Λαιμός με Χνούδι",
          "right": "Υγιεινή χωρίς συσσώρευση βακτηρίων και απολύμανση από τον ήλιο"
        },
        {
          "id": "d2",
          "left": "Πανίσχυρο Γαστρικό pH ~1.0",
          "right": "Εξουδετέρωση βακτηρίων άνθρακα, αλλαντίασης και χολέρας"
        },
        {
          "id": "d3",
          "left": "Πρόλοβος (Esophageal Crop)",
          "right": "Ελαστική αποθήκη 1 έως 1.5 κιλού κρέατος στο στήθος"
        },
        {
          "id": "d4",
          "left": "Ουρο-εφίδρωση (Urohidrosis)",
          "right": "Δροσισμός και αντισηψία των ποδιών με όξινο ουρικό οξύ"
        },
        {
          "id": "d5",
          "left": "Κύρια Πηγή Τροφής",
          "right": "Νεκρά αιγοπρόβατα της παραδοσιακής εκτατικής κτηνοτροφίας"
        }
      ]
    },
    "payload_en": {
      "pairs": [
        {
          "id": "d1",
          "left": "Bare Downy Neck",
          "right": "Hygiene without bacterial clotting and solar UV sterilization"
        },
        {
          "id": "d2",
          "left": "Gastric Stomach pH ~1.0",
          "right": "Neutralization of anthrax, botulinum, and cholera pathogens"
        },
        {
          "id": "d3",
          "left": "Esophageal Crop",
          "right": "Elastic thoracic food pouch holding 1 to 1.5 kg of meat"
        },
        {
          "id": "d4",
          "left": "Urohidrosis Defecation",
          "right": "Evaporative leg cooling and chemical uric acid disinfection"
        },
        {
          "id": "d5",
          "left": "Primary Food Base",
          "right": "Deceased sheep and goats from extensive pastoralism"
        }
      ]
    },
    "explanation": "Οι γύπες είναι τα απόλυτα βιολογικά εργαστήρια υγιεινής της φύσης: από το στομάχι pH 1 μέχρι τον γυμνό λαιμό, καθαρίζουν τη φύση χωρίς να μολύνονται.",
    "explanation_en": "Vultures are nature's sanitary bio-filters: from battery-acid gastric chemistry to hygiene down, they clean the ecosystem sterile."
  },
  {
    "id": "cyprus-vulture-45",
    "title": "Σωστό ή Λάθος: Μετάδοση Ασθενειών στα Κοπάδια",
    "title_en": "True or False: Disease Transmission Myth",
    "description": "Εξετάστε τον παλιό ισχυρισμό: Οι γύπες μεταδίδουν μολυσματικές ασθένειες στα ζωντανά κοπάδια των κτηνοτρόφων.",
    "description_en": "Assess the historical prejudice: Vultures spread infectious livestock diseases across pastoral flocks.",
    "type": "true_false",
    "points": 90,
    "assignedTeamIds": [
      "team-gamma"
    ],
    "isActive": true,
    "payload": {
      "correctValue": false
    },
    "payload_en": {
      "correctValue": false
    },
    "explanation": "Λάθος! Είναι επιστημονικά αποδεδειγμένο ότι τα ισχυρότατα οξέα του γύπα καταστρέφουν τα παθογόνα μικρόβια, σταματώντας τη μετάδοση ασθενειών.",
    "explanation_en": "False! Research proves vulture digestive enzymes permanently kill infectious pathogens, actively halting disease spread."
  },
  {
    "id": "cyprus-vulture-46",
    "title": "Η Κυριότερη Απειλή στην Κύπρο: Δηλητηριασμένα Δολώματα (Φόλες)",
    "title_en": "The Primary Threat: Illegal Poison Baits",
    "description": "Ποια είναι η υπ’ αριθμόν 1 αιτία θανάτου που έφερε το Όρνιο στα πρόθυρα του αφανισμού στην Κύπρο;",
    "description_en": "What is the number one cause of mortality that pushed the Griffon Vulture to the brink of extinction in Cyprus?",
    "type": "multiple_choice",
    "points": 110,
    "assignedTeamIds": [
      "team-delta"
    ],
    "isActive": true,
    "payload": {
      "options": [
        "Η παράνομη τοποθέτηση δηλητηριασμένων δολωμάτων (φόλες) στην ύπαιθρο για αλεπούδες και σκύλους",
        "Η έλλειψη ηλιοφάνειας",
        "Η επίθεση από αετούς",
        "Ο θάνατος από γεράματα"
      ],
      "correctOptionIndex": 0
    },
    "payload_en": {
      "options": [
        "The illegal placement of poisoned baits in the countryside aimed at foxes and stray dogs",
        "Lack of solar radiation",
        "Aggressive attacks by golden eagles",
        "Senile natural mortality"
      ],
      "correctOptionIndex": 0
    },
    "explanation": "Τα δηλητηριασμένα δολώματα είναι η πιο καταστροφική απειλή. Ένα μόνο δηλητηριασμένο κουφάρι μπορεί να ξεκάνει ολόκληρη την αποικία γυπών.",
    "explanation_en": "Illegal poison baiting is catastrophic: a single laced carcass can wipe out an entire breeding colony in hours."
  },
  {
    "id": "cyprus-vulture-47",
    "title": "Μόλυβδος & Κυνήγι: Η Αόρατη Δηλητηρίαση (Lead Poisoning)",
    "title_en": "Lead Poisoning from Ingested Shotgun Ammunition",
    "description": "Πώς δηλητηριάζονται οι γύπες από μόλυβδο στην κυπριακή ύπαιθρο;",
    "description_en": "How do foraging vultures succumb to chronic lead poisoning across rural Cyprus?",
    "type": "multiple_choice",
    "points": 100,
    "assignedTeamIds": [
      "team-delta"
    ],
    "isActive": true,
    "payload": {
      "options": [
        "Καταπίνοντας σκάγια μολύβδου που έχουν απομείνει μέσα σε πυροβολημένα θηράματα ή τραυματισμένα ζώα",
        "Πίνοντας νερό από βρύσες",
        "Από τα καυσαέρια των αυτοκινήτων",
        "Από τα καλώδια της τηλεόρασης"
      ],
      "correctOptionIndex": 0
    },
    "payload_en": {
      "options": [
        "By ingesting lead shotgun pellets embedded inside game carcasses or unretrieved shot wildlife",
        "By drinking spring water",
        "From vehicular exhaust fumes",
        "From television cables"
      ],
      "correctOptionIndex": 0
    },
    "explanation": "Ο μόλυβδος των σκαγιών διαλύεται στα πανίσχυρα γαστρικά οξέα του γύπα, απορροφάται στο αίμα και προκαλεί παράλυση και θάνατο.",
    "explanation_en": "Spent lead ammunition dissolves in extreme vulture gastric juices, entering the bloodstream and causing neurological failure."
  },
  {
    "id": "cyprus-vulture-48",
    "title": "Ηλεκτροπληξία σε Πυλώνες & Πρόσκρουση σε Καλώδια",
    "title_en": "Electrocution on Pylons & Wire Collisions",
    "description": "Γιατί τα εναέρια καλώδια μεταφοράς ρεύματος αποτελούν σοβαρό κίνδυνο για τα μεγάλα πουλιά;",
    "description_en": "Why do overhead medium-voltage power distribution lines pose severe hazards to large vultures?",
    "type": "multiple_choice",
    "points": 100,
    "assignedTeamIds": [
      "team-delta"
    ],
    "isActive": true,
    "payload": {
      "options": [
        "Κινδυνεύουν από θανατηφόρα ηλεκτροπληξία όταν ακουμπούν ταυτόχρονα καλώδια και πυλώνα, και από πρόσκρουση λόγω περιορισμένης ορατότητας μπροστά",
        "Επειδή το ρεύμα τους προκαλεί ζαλάδα",
        "Επειδή τους αρέσει να τρώνε τα καλώδια",
        "Δεν υπάρχει κανένας απολύτως κίνδυνος"
      ],
      "correctOptionIndex": 0
    },
    "payload_en": {
      "options": [
        "Fatal electrocution occurs when wingtips bridge live wires to grounded crossarms, plus collisions due to forward blind spots",
        "Electric currents cause disorientation",
        "Vultures attempt to ingest cables",
        "Overhead lines pose zero risk"
      ],
      "correctOptionIndex": 0
    },
    "explanation": "Λόγω του τεράστιου ανοίγματος πτερύγων (2.5m), ένας γύπας μπορεί εύκολα να γεφυρώσει δύο ηλεκτροφόρα σύρματα όταν προσγειώνεται σε πυλώνα.",
    "explanation_en": "A 2.5m wingspan easily bridges energized conductors and grounded steel, causing instantaneous lethal electrocution."
  },
  {
    "id": "cyprus-vulture-49",
    "title": "Σημαντήρες Καλωδίων (Power Line Markers)",
    "title_en": "Spiral Flight Diverters & Cable Marking",
    "description": "Τι τοποθετείται στα εναέρια καλώδια ηλεκτρισμού στην Κύπρο για να αποφεύγονται οι προσκρούσεις των γυπών;",
    "description_en": "What devices are installed along high-risk overhead power lines in Cyprus to avert vulture collisions?",
    "type": "multiple_choice",
    "points": 100,
    "assignedTeamIds": [
      "team-delta"
    ],
    "isActive": true,
    "payload": {
      "options": [
        "Ειδικοί σπειροειδείς σημαντήρες / εκτροπείς πτήσης (flappers) που κάνουν τα καλώδια ορατά από μακριά",
        "Φωτάκια νέον",
        "Κουδούνια με ήχο",
        "Δεν τοποθετείται τίποτα"
      ],
      "correctOptionIndex": 0
    },
    "payload_en": {
      "options": [
        "Special spiral bird flight diverters and flappers making thin wires visually conspicuous from afar",
        "Neon holiday lights",
        "Acoustic ringing bells",
        "Nothing is installed"
      ],
      "correctOptionIndex": 0
    },
    "explanation": "Οι σπειροειδείς σημαντήρες και η μόνωση των επικίνδυνων πυλώνων της ΑΗΚ έχουν μειώσει δραστικά τα ατυχήματα ηλεκτροπληξίας στην Κύπρο.",
    "explanation_en": "Spiral flappers and conductor insulation sleeves engineered with EAC have dramatically curbed electrocution casualties."
  },
  {
    "id": "cyprus-vulture-50",
    "title": "Οι 4 Περιφραγμένες Ταΐστρες στην Κύπρο (Vulture Restaurants)",
    "title_en": "The 4 Supplementary Feeding Stations ('Restaurants')",
    "description": "Πόσες επίσημες περιφραγμένες ταΐστρες γυπών λειτουργούν στην Κύπρο από την Υπηρεσία Θήρας και Πανίδας;",
    "description_en": "How many official fenced supplementary feeding stations ('restaurants') operate across Cyprus?",
    "type": "multiple_choice",
    "points": 100,
    "assignedTeamIds": [
      "team-delta"
    ],
    "isActive": true,
    "payload": {
      "options": [
        "4 ταΐστρες σε καίριες περιοχές (π.χ. Άγιος Ιωάννης, Μούσερε, Πάφος, Λεμεσός)",
        "Μόνο μία ταΐστρα σε όλη την Κύπρο",
        "50 ταΐστρες",
        "Καμία ταΐστρα"
      ],
      "correctOptionIndex": 0
    },
    "payload_en": {
      "options": [
        "4 strategically located feeding stations (e.g. Agios Ioannis, Mousere, Paphos, Limassol)",
        "Only 1 single feeder island-wide",
        "50 feeding stations",
        "No feeding stations exist"
      ],
      "correctOptionIndex": 0
    },
    "explanation": "Οι 4 περιφραγμένες ταΐστρες τροφοδοτούνται τακτικά με ελεγμένα, ασφαλή κουφάρια χωρίς δηλητήρια, διασφαλίζοντας τροφή όλο τον χρόνο.",
    "explanation_en": "Four fenced 'restaurants' are provisioned regularly with certified toxin-free livestock carcasses to sustain the flock."
  },
  {
    "id": "cyprus-vulture-51",
    "title": "Συνεργασία με Κτηνοτρόφους: Συλλογή Ασφαλούς Τροφής",
    "title_en": "Pastoralist Alliance: Safe Carcass Provisioning",
    "description": "Πώς βοηθούν οι τοπικοί κτηνοτρόφοι στη διάσωση του γύπα στην Κύπρο;",
    "description_en": "How do progressive livestock farmers actively contribute to vulture preservation in Cyprus?",
    "type": "multiple_choice",
    "points": 100,
    "assignedTeamIds": [
      "team-delta"
    ],
    "isActive": true,
    "payload": {
      "options": [
        "Παραδίδουν τα νεκρά ζώα τους στις επίσημες ταΐστρες αντί να τα αφήνουν ανεξέλεγκτα και δεν χρησιμοποιούν δηλητήρια στα βοσκοτόπια",
        "Πυροβολούν τους γύπες όταν πλησιάζουν",
        "Κλείνουν τα ζώα τους σε υπόγεια",
        "Δεν υπάρχει καμία συνεργασία"
      ],
      "correctOptionIndex": 0
    },
    "payload_en": {
      "options": [
        "They deliver deceased livestock to certified feeding stations and commit to zero poison bait use on pastures",
        "They shoot vultures that approach pens",
        "They keep flocks in underground bunkers",
        "No cooperative framework exists"
      ],
      "correctOptionIndex": 0
    },
    "explanation": "Η συμμαχία κτηνοτρόφων και ορνιθολόγων είναι το κλειδί: οι κτηνοτρόφοι απαλλάσσονται νόμιμα από τα κουφάρια και οι γύπες βρίσκουν καθαρή τροφή.",
    "explanation_en": "Partnering with cattlemen transforms livestock mortality into safe nutrition while abolishing poison traps."
  },
  {
    "id": "cyprus-vulture-52",
    "title": "Αντιστοίχιση Μέτρων Προστασίας του Προγράμματος LIFE with Vultures",
    "title_en": "Matching Conservation Actions of LIFE with Vultures",
    "description": "Συνδέστε κάθε καινοτόμο μέτρο προστασίας με τη σωστή του συμβολή στη διάσωση του Όρνιου στην Κύπρο:",
    "description_en": "Match each innovative conservation intervention to its role in preserving the Cyprus Griffon Vulture:",
    "type": "text_match",
    "points": 130,
    "assignedTeamIds": [
      "team-delta"
    ],
    "isActive": true,
    "payload": {
      "pairs": [
        {
          "id": "c1",
          "left": "Εκπαιδευμένοι Σκύλοι K9",
          "right": "Έγκαιρος εντοπισμός παράνομων δηλητηριασμένων δολωμάτων (φόλες)"
        },
        {
          "id": "c2",
          "left": "4 Περιφραγμένες Ταΐστρες",
          "right": "Παροχή ελεγμένης και ασφαλούς τροφής απαλλαγμένης από δηλητήρια"
        },
        {
          "id": "c3",
          "left": "Σπειροειδείς Σημαντήρες (Flappers)",
          "right": "Αποτροπή θανατηφόρων προσκρούσεων σε ηλεκτροφόρα καλώδια"
        },
        {
          "id": "c4",
          "left": "Δορυφορικοί Πομποί GPS",
          "right": "Παρακολούθηση θέσης σε πραγματικό χρόνο και άμεση διάσωση"
        },
        {
          "id": "c5",
          "left": "Ενίσχυση από Ισπανία",
          "right": "Μεταφορά νεαρών γυπών για αναπλήρωση του τοπικού πληθυσμού"
        }
      ]
    },
    "payload_en": {
      "pairs": [
        {
          "id": "c1",
          "left": "Trained Canine K9 Units",
          "right": "Early scent-tracking of illegal poison baits in the field"
        },
        {
          "id": "c2",
          "left": "4 Fenced Feeding Stations",
          "right": "Provision of certified, toxin-free safe supplementary carcasses"
        },
        {
          "id": "c3",
          "left": "Spiral Flight Diverters",
          "right": "Averting lethal collisions against high-voltage transmission wires"
        },
        {
          "id": "c4",
          "left": "Satellite GPS Telemetry",
          "right": "Real-time positional tracking and rapid emergency rescue dispatch"
        },
        {
          "id": "c5",
          "left": "Translocation from Spain",
          "right": "Releasing wild juveniles to genetically replenish the island flock"
        }
      ]
    },
    "explanation": "Ο συνδυασμός σκύλων K9, ασφαλών ταϊστρών, σημαντήρων καλωδίων, πομπών GPS και ενίσχυσης από Ισπανία συγκροτεί την ολοκληρωμένη ασπίδα σωτηρίας του Όρνιου.",
    "explanation_en": "Combining K9 detection, feeding stations, wire diverters, GPS telemetry, and Spanish translocation constitutes a complete rescue shield for the species."
  },
  {
    "id": "cyprus-vulture-53",
    "title": "Εισαγωγή Γυπών από την Ισπανία",
    "title_en": "Restocking Imports from Spain",
    "description": "Από ποια χώρα της Ευρώπης μεταφέρθηκαν νεαροί γύπες στην Κύπρο για να σωθεί ο πληθυσμός;",
    "description_en": "From which European nation were wild-rescued juvenile vultures translocated to Cyprus for genetic restocking?",
    "type": "multiple_choice",
    "points": 100,
    "assignedTeamIds": [
      "team-delta"
    ],
    "isActive": true,
    "payload": {
      "options": [
        "Από την Ισπανία (τη χώρα με τον μεγαλύτερο και υγιέστερο πληθυσμό γυπών στην Ευρώπη)",
        "Από την Αγγλία",
        "Από την Ισλανδία",
        "Από τη Γερμανία"
      ],
      "correctOptionIndex": 0
    },
    "payload_en": {
      "options": [
        "From Spain (home to over 90% of Europe's thriving Griffon Vulture population)",
        "From England",
        "From Iceland",
        "From Germany"
      ],
      "correctOptionIndex": 0
    },
    "explanation": "Η Ισπανία προσέφερε δεκάδες νεαρά Όρνια που αποκαταστάθηκαν σε κέντρα περίθαλψης, εμπλουτίζοντας τον εξαιρετικά μικρό πληθυσμό της Κύπρου.",
    "explanation_en": "Spain generously donated rehabilitated wild vultures, providing crucial genetic rescue to bolster the Cypriot population."
  },
  {
    "id": "cyprus-vulture-54",
    "title": "Ειδικά Εκπαιδευμένοι Σκύλοι Ανίχνευσης Δηλητηρίων (K9 Units)",
    "title_en": "Specially Trained K9 Poison Detection Units",
    "description": "Ποιος είναι ο ρόλος των ειδικών σκύλων ανίχνευσης της Υπηρεσίας Θήρας και Πανίδας στην Κύπρο;",
    "description_en": "What is the mission of the specialized K9 detection dogs deployed by the Game and Fauna Service?",
    "type": "multiple_choice",
    "points": 100,
    "assignedTeamIds": [
      "team-delta"
    ],
    "isActive": true,
    "payload": {
      "options": [
        "Εντοπίζουν με την όσφρηση δηλητηριασμένα δολώματα και νεκρά ζώα στην ύπαιθρο πριν τα βρουν οι γύπες",
        "Κυνηγούν τους γύπες για να τους πιάσουν",
        "Φρουρούν τα αυγά στα βράχια",
        "Καθοδηγούν τα κοπάδια των προβάτων"
      ],
      "correctOptionIndex": 0
    },
    "payload_en": {
      "options": [
        "Scent-tracking illegal poison baits and poisoned carcasses in the wild before foraging vultures locate them",
        "Hunting vultures to capture them",
        "Guarding eggs on inaccessible cliffs",
        "Herding mountain sheep flocks"
      ],
      "correctOptionIndex": 0
    },
    "explanation": "Οι σκύλοι K9 της Υπηρεσίας Θήρας (όπως ο Dixie και η Sophie) χτενίζουν την ύπαιθρο και σώζουν δεκάδες πουλιά εντοπίζοντας έγκαιρα τις φόλες.",
    "explanation_en": "Dedicated K9 handler teams patrol high-risk terrain, removing lethal baits before foraging scavengers arrive."
  },
  {
    "id": "cyprus-vulture-55",
    "title": "Δορυφορικοί Πομποί GPS & Τηλεμετρία",
    "title_en": "Satellite GPS Telemetry Transmitters",
    "description": "Γιατί όλοι οι απελευθερωμένοι γύπες στην Κύπρο εξοπλίζονται με δορυφορικούς πομπούς GPS στην πλάτη;",
    "description_en": "Why is every vulture released in Cyprus fitted with a solar-powered satellite GPS transmitter on its back?",
    "type": "multiple_choice",
    "points": 100,
    "assignedTeamIds": [
      "team-delta"
    ],
    "isActive": true,
    "payload": {
      "options": [
        "Για να παρακολουθούν οι επιστήμονες τις κινήσεις τους και να επεμβαίνουν άμεσα αν ένα πουλί μείνει ακίνητο (ένδειξη δηλητηρίασης ή τραυματισμού)",
        "Για να τους τηλεκατευθύνουν σαν drones",
        "Για να μετρούν το βάρος τους στον αέρα",
        "Είναι διακοσμητικά ταμπελάκια"
      ],
      "correctOptionIndex": 0
    },
    "payload_en": {
      "options": [
        "To track real-time movements and dispatch emergency rescue teams immediately if a bird becomes stationary",
        "To steer flight paths via remote control",
        "To calculate airborne body weight",
        "They are decorative vanity tags"
      ],
      "correctOptionIndex": 0
    },
    "explanation": "Οι πομποί GPS στέλνουν σήματα ανά λίγα λεπτά. Αν ένας γύπας παραμείνει ακίνητος στο έδαφος, η ομάδα διάσωσης σπεύδει αμέσως στο ακριβές σημείο.",
    "explanation_en": "GPS telemetry units log coordinates every few minutes; sudden immobility alerts rangers to potential poisoning events immediately."
  },
  {
    "id": "cyprus-vulture-56",
    "title": "Οπτικά Δακτυλίδια Πεδίου (Color Rings)",
    "title_en": "Field Identification Color Rings",
    "description": "Τι εξυπηρετούν τα μεγάλα πλαστικά δακτυλίδια με κωδικούς στα πόδια των γυπών;",
    "description_en": "What purpose do colored plastic alphanumeric leg bands serve on wild vultures?",
    "type": "multiple_choice",
    "points": 90,
    "assignedTeamIds": [
      "team-delta"
    ],
    "isActive": true,
    "payload": {
      "options": [
        "Επιτρέπουν στους ορνιθολόγους να αναγνωρίζουν κάθε γύπα ατομικά από απόσταση με τηλεσκόπιο χωρίς να χρειάζεται επανασύλληψη",
        "Για να μην γλιστράει στα βράχια",
        "Για να δείχνουν την ιδιοκτησία του πουλιού",
        "Για να μετρούν την ταχύτητα του ανέμου"
      ],
      "correctOptionIndex": 0
    },
    "payload_en": {
      "options": [
        "Allowing biologists to identify each bird individually from hundreds of metres away via spotting scopes without recapture",
        "To provide foothold traction on cliffs",
        "To signify commercial ownership",
        "To gauge ambient wind velocity"
      ],
      "correctOptionIndex": 0
    },
    "explanation": "Κάθε πουλί φέρει μοναδικό συνδυασμό χρωμάτων και γραμμάτων, επιτρέποντας την καταγραφή του ιστορικού του σε όλη τη διάρκεια της ζωής του.",
    "explanation_en": "High-contrast visual rings enable citizen scientists and rangers to monitor bird survival and pairing milestones remotely."
  },
  {
    "id": "cyprus-vulture-57",
    "title": "Κτηνιατρικό Φάρμακο Δικλοφενάκη (Diclofenac)",
    "title_en": "Veterinary Drug Diclofenac Toxicity",
    "description": "Γιατί το κτηνιατρικό αντιφλεγμονώδες φάρμακο δικλοφενάκη απαγορεύεται αυστηρά να χορηγείται σε ζώα βοσκής;",
    "description_en": "Why is the veterinary anti-inflammatory drug diclofenac strictly regulated in areas with scavengers?",
    "type": "multiple_choice",
    "points": 100,
    "assignedTeamIds": [
      "team-delta"
    ],
    "isActive": true,
    "payload": {
      "options": [
        "Προκαλεί οξεία θανατηφόρα νεφρική ανεπάρκεια στους γύπες μέσα σε 48 ώρες εάν φάνε κρέας από ζώο που έλαβε τη θεραπεία",
        "Κάνει τα πουλιά να χάνουν τα φτερά τους",
        "Εμποδίζει τα αυγά να εκκολαφθούν",
        "Δεν προκαλεί καμία βλάβη στους γύπες"
      ],
      "correctOptionIndex": 0
    },
    "payload_en": {
      "options": [
        "It triggers acute, lethal renal failure in vultures within 48 hours of ingesting treated livestock tissue",
        "It causes rapid feather loss",
        "It prevents egg shells from hardening",
        "It is harmless to scavengers"
      ],
      "correctOptionIndex": 0
    },
    "explanation": "Η δικλοφενάκη εξαφάνισε το 99% των γυπών στην Ινδία. Στην Κύπρο και την Ευρώπη υπάρχουν ασφαλή εναλλακτικά φάρμακα (όπως η μελοξικάμη).",
    "explanation_en": "Diclofenac caused catastrophic 99% vulture declines in Asia; safe alternatives (like meloxicam) must be used."
  },
  {
    "id": "cyprus-vulture-58",
    "title": "Πράσινη Γραμμή Καταγγελιών & Άμεση Επέμβαση",
    "title_en": "Anti-Poison Hotline & Rapid Response",
    "description": "Τι πρέπει να πράξει άμεσα ένας πολίτης αν εντοπίσει ύποπτο δόλωμα ή νεκρό πουλί στην κυπριακή φύση;",
    "description_en": "What should an outdoor enthusiast do immediately upon discovering a suspect bait or dead raptor?",
    "type": "multiple_choice",
    "points": 100,
    "assignedTeamIds": [
      "team-delta"
    ],
    "isActive": true,
    "payload": {
      "options": [
        "Να ειδοποιήσει άμεσα την Υπηρεσία Θήρας και Πανίδας ή την Αστυνομία χωρίς να αγγίξει το δόλωμα, σημειώνοντας τις συντεταγμένες GPS",
        "Να πιάσει το δόλωμα με γυμνά χέρια και να το πετάξει στα σκουπίδια",
        "Να το αγνοήσει και να μην μιλήσει σε κανέναν",
        "Να το ταΐσει στα κατοικίδιά του"
      ],
      "correctOptionIndex": 0
    },
    "payload_en": {
      "options": [
        "Call the Game & Fauna Service hotline or Police immediately without touching the toxic bait, noting GPS coordinates",
        "Pick up the bait with bare hands and discard in trash",
        "Ignore the scene entirely",
        "Offer it to domestic animals"
      ],
      "correctOptionIndex": 0
    },
    "explanation": "Η άμεση αναφορά σώζει ζωές! Οι ομάδες K9 σπεύδουν στο σημείο, απομακρύνουν τα δηλητήρια και συλλέγουν στοιχεία για ποινική δίωξη.",
    "explanation_en": "Prompt reporting alerts K9 units to sanitize the area, confiscate illegal poisons, and prosecute offenders."
  },
  {
    "id": "cyprus-vulture-59",
    "title": "Αιολικά Πάρκα & Συστήματα Αυτόματης Παύσης",
    "title_en": "Wind Farms & Radar Shutdown Systems",
    "description": "Ποια σύγχρονη τεχνολογία χρησιμοποιείται κοντά σε αιολικά πάρκα για την αποτροπή πρόσκρουσης γυπών;",
    "description_en": "What state-of-the-art technology is integrated into wind parks near flyways to avert collision trauma?",
    "type": "multiple_choice",
    "points": 100,
    "assignedTeamIds": [
      "team-delta"
    ],
    "isActive": true,
    "payload": {
      "options": [
        "Κάμερες και ραντάρ τεχνητής νοημοσύνης που σταματούν αυτόματα τις ανεμογεννήτριες όταν πλησιάζει γύπας",
        "Σειρήνες που εκπέμπουν εκκωφαντικό θόρυβο",
        "Μεγάλα προστατευτικά δίχτυα γύρω από τις τουρμπίνες",
        "Βάφουν τις ανεμογεννήτριες με φωσφορούχα χρώματα"
      ],
      "correctOptionIndex": 0
    },
    "payload_en": {
      "options": [
        "AI optical camera and radar detectors that automatically brake turbine blades when a soaring vulture approaches",
        "High-decibel acoustic air sirens",
        "Gigantic nylon netting enclosing turbines",
        "Luminescent phosphorescent paint coatings"
      ],
      "correctOptionIndex": 0
    },
    "explanation": "Τα συστήματα αυτόματης αναστολής λειτουργίας (shutdown on demand) φρενάρουν τα πτερύγια σε δευτερόλεπτα, επιτρέποντας στον γύπα να περάσει ασφαλής.",
    "explanation_en": "Automated shut-down-on-demand technology freezes spinning blades within seconds when a vulture enters collision trajectory."
  },
  {
    "id": "cyprus-vulture-60",
    "title": "Κλωβός Εγκλιματισμού (Acclimatization Aviary)",
    "title_en": "Acclimatization Aviary Pre-Release Protocol",
    "description": "Γιατί οι γύπες που έρχονται από την Ισπανία παραμένουν για μερικούς μήνες σε ειδικό κλωβό πριν απελευθερωθούν;",
    "description_en": "Why are translocated Spanish vultures held for months inside a custom mountain aviary before release?",
    "type": "multiple_choice",
    "points": 100,
    "assignedTeamIds": [
      "team-delta"
    ],
    "isActive": true,
    "payload": {
      "options": [
        "Για να συνηθίσουν το νέο τοπίο, το κλίμα, να δεθούν μεταξύ τους και να μάθουν να θεωρούν την Κύπρο μόνιμο σπίτι τους",
        "Γιατί δεν ξέρουν να πετάνε",
        "Για να γεννήσουν αυγά πριν βγουν έξω",
        "Για να τους επισκέπτονται τουρίστες"
      ],
      "correctOptionIndex": 0
    },
    "payload_en": {
      "options": [
        "To habituate to the local topography and climate, bond as a cohesive flock, and adopt Cyprus as their permanent home",
        "Because they forgot how to soar",
        "To lay eggs prior to flying wild",
        "To exhibit them as tourist attractions"
      ],
      "correctOptionIndex": 0
    },
    "explanation": "Η περίοδος εγκλιματισμού στον ειδικό κλωβό αποτρέπει την τάση των πουλιών να αποπροσανατολιστούν ή να προσπαθήσουν να επιστρέψουν στην πατρίδα τους.",
    "explanation_en": "Pre-release aviary acclimatization imprints the local landscape on the vultures, preventing disoriented dispersal."
  },
  {
    "id": "cyprus-vulture-61",
    "title": "Σύμφωνο Προστασίας των Γυπών της Κύπρου",
    "title_en": "Cyprus Vulture Conservation Charter & Pledge",
    "description": "Ολοκληρώστε το πρόγραμμα επικυρώνοντας το επίσημο Σύμφωνο Προστασίας για το Όρνιο στην Κύπρο.",
    "description_en": "Conclude the challenge by certifying your team's official Conservation Charter for the Griffon Vulture in Cyprus.",
    "type": "task",
    "points": 150,
    "assignedTeamIds": [
      "team-delta"
    ],
    "isActive": true,
    "payload": {
      "instructions": "Επιβεβαιώστε τις 4 βασικές δεσμεύσεις για τη σωτηρία του Γύπα στην Κύπρο:",
      "checklist": [
        "Μηδενική ανοχή στα δηλητηριασμένα δολώματα και άμεση καταγγελία περιστατικών (Green Line)",
        "Υποστήριξη της παραδοσιακής κτηνοτροφίας και των 4 ασφαλών ταϊστρών",
        "Προστασία των ιστορικών γκρεμών φωλεοποίησης (Επισκοπή, Διαρίζος) από όχληση",
        "Διάδοση της γνώσης για την ανεκτίμητη υγειονομική αξία του Γύπα στο οικοσύστημα της Κύπρου"
      ],
      "completionPrompt": "Επικυρώστε το επίσημο Σύμφωνο Προστασίας των Γυπών της Κύπρου."
    },
    "payload_en": {
      "instructions": "Certify the 4 core conservation commitments to safeguard the Cyprus Griffon Vulture:",
      "checklist": [
        "Zero tolerance for poison baits and prompt reporting to hotlines",
        "Active support for extensive pastoralism and the 4 certified feeding stations",
        "Protecting traditional breeding crags (Episkopi, Diarizos) against disturbance",
        "Spreading awareness of the vulture's invaluable sanitation role across Cyprus"
      ],
      "completionPrompt": "Ratify the Official Cyprus Vulture Conservation Charter."
    },
    "explanation": "Η σωτηρία του Όρνιου στην Κύπρο είναι συλλογική ευθύνη όλων μας. Με την ολοκλήρωση των 61 αποστολών γίνατε επίσημοι Πρεσβευτές Προστασίας!",
    "explanation_en": "Saving the Cyprus Griffon Vulture is our shared heritage. You are now official ambassadors for vulture conservation!"
  }
];

// Explicit Team to Group mapping
export const TEAM_GROUP_MAP: Record<string, { groupNumber: number; title: string; title_en: string; theme: string }> = {
  'team-alpha': {
    groupNumber: 1,
    title: 'Ομάδα 1: Ταυτότητα & Γενικά Χαρακτηριστικά',
    title_en: 'Group 1: Identity & Basics',
    theme: 'Ταυτότητα, μορφολογία, μέγεθος, αναπαραγωγή και πληθυσμός'
  },
  'team-beta': {
    groupNumber: 2,
    title: 'Ομάδα 2: Περιβάλλον, Φωλεοποίηση & Πτήση',
    title_en: 'Group 2: Habitat, Nesting & Flight',
    theme: 'Απόκρημνοι γκρεμοί Επισκοπής, θερμικά ανοδικά ρεύματα και πτήση 100+ km'
  },
  'team-gamma': {
    groupNumber: 3,
    title: 'Ομάδα 3: Διατροφή & Βιολογία',
    title_en: 'Group 3: Diet & Biology',
    theme: 'Αποκλειστικοί πτωματοφάγοι, γυμνός λαιμός, pH στομάχου 1-2 και όραση'
  },
  'team-delta': {
    groupNumber: 4,
    title: 'Ομάδα 4: Απειλές & Προστασία',
    title_en: 'Group 4: Threats & Conservation',
    theme: 'Παράνομες φόλες, σκύλοι K9, 4 ταΐστρες, σημαντήρες καλωδίων και Σύμφωνο'
  }
};

/**
 * Designated Checkpoint Task IDs across the 4 groups
 */
export const CHECKPOINT_TASK_IDS: Record<
  string,
  { label: string; label_en: string; badge: string; badge_en: string; desc: string; desc_en: string }
> = {
  'cyprus-vulture-8': {
    label: 'Checkpoint 1: Προσδόκιμο & Ενηλικίωση',
    label_en: 'Checkpoint 1: Lifespan & Maturity',
    badge: '🚩 Checkpoint',
    badge_en: '🚩 Checkpoint',
    desc: 'Ερευνητικός σταθμός εξέλιξης και κύκλου ζωής του Όρνιου',
    desc_en: 'Research station on vulture lifecycle and maturity milestones'
  },
  'cyprus-vulture-36': {
    label: 'Checkpoint #36: Εσωτερικός Σταθμός Φωτογράφισης',
    label_en: 'Checkpoint #36: Indoor Photo Lab Station',
    badge: '📸 Checkpoint #36',
    badge_en: '📸 Checkpoint #36',
    desc: 'Εργαστήριο φωτογράφισης στο ομοίωμα του Γύπα',
    desc_en: 'Interactive photo verification on the life-size vulture replica'
  },
  'cyprus-vulture-23': {
    label: 'Checkpoint 2: Θερμικά Ανοδικά Ρεύματα',
    label_en: 'Checkpoint 2: Thermal Soaring Updrafts',
    badge: '⚡ Checkpoint #23',
    badge_en: '⚡ Checkpoint #23',
    desc: 'Σταθμός αεροδυναμικής και πτήσης χωρίς σπατάλη ενέργειας',
    desc_en: 'Aerodynamics station for soaring without energy expenditure'
  },
  'cyprus-vulture-30': {
    label: 'Checkpoint: Αποικία Γκρεμών Επισκοπής',
    label_en: 'Checkpoint: Episkopi Sea Cliffs Colony',
    badge: '🏔️ Checkpoint #30',
    badge_en: '🏔️ Checkpoint #30',
    desc: 'Καταγραφή του τελευταίου φυσικού καταφυγίου αναπαραγωγής',
    desc_en: 'Documenting the last natural wild breeding cliff sanctuary'
  },
  'cyprus-vulture-38': {
    label: 'Checkpoint 3: Γαστρικό pH 1-2 & Ασπίδα Υγείας',
    label_en: 'Checkpoint 3: Gastric pH 1-2 & Health Shield',
    badge: '🔬 Checkpoint #38',
    badge_en: '🔬 Checkpoint #38',
    desc: 'Βιολογικός σταθμός εξουδετέρωσης βακτηρίων και παθογόνων',
    desc_en: 'Biological station on neutralizing bacteria and lethal pathogens'
  },
  'cyprus-vulture-qr-56': {
    label: 'Checkpoint #56: Σταθμός QR Πάρκου - Παρατηρητήριο',
    label_en: 'Checkpoint #56: Park QR Station - Observation Post',
    badge: '📱 Checkpoint #56',
    badge_en: '📱 Checkpoint #56',
    desc: 'Σάρωση QR κωδικού παρατήρησης γυπών στο πεδίο',
    desc_en: 'Field QR code scanning for wild vulture observation'
  },
  'cyprus-vulture-54': {
    label: 'Checkpoint 4: Ομάδα Σκύλων K9 Ανίχνευσης Δηλητηρίων',
    label_en: 'Checkpoint 4: K9 Anti-Poison Dog Unit',
    badge: '🐕 Checkpoint #54',
    badge_en: '🐕 Checkpoint #54',
    desc: 'Σταθμός εντοπισμού παράνομων δολωμάτων με ειδικούς σκύλους',
    desc_en: 'Detection station for tracking illegal poison baits with K9 dogs'
  },
  'cyprus-vulture-61': {
    label: 'Checkpoint #61: Επίσημο Σύμφωνο Προστασίας Γυπών',
    label_en: 'Checkpoint #61: Official Vulture Protection Charter',
    badge: '🏆 Τελικό Checkpoint #61',
    badge_en: '🏆 Final Checkpoint #61',
    desc: 'Υπογραφή Χάρτας και ορκωμοσία Πρεσβευτών Προστασίας του Όρνιου',
    desc_en: 'Signing the Charter and swearing-in Vulture Protection Ambassadors'
  }
};

export function isCheckpointTask(taskId: string): boolean {
  return Boolean(CHECKPOINT_TASK_IDS[taskId]);
}

export function getCheckpointMetadata(task: Question, lang: 'el' | 'en' = 'el') {
  const cp = CHECKPOINT_TASK_IDS[task.id];
  if (cp) {
    const isEn = lang === 'en';
    return {
      isCheckpoint: true,
      label: isEn ? cp.label_en || cp.label : cp.label,
      badge: isEn ? cp.badge_en || cp.badge : cp.badge,
      description: isEn ? cp.desc_en || cp.desc : cp.desc
    };
  }
  return {
    isCheckpoint: false,
    label: '',
    badge: '',
    description: ''
  };
}

/**
 * Merge custom question edits from localStorage with master pool base tasks
 */
export function mergeCustomQuestions(
  baseTasks: Question[],
  customQuestions?: Record<string, Question>
): Question[] {
  if (!customQuestions || Object.keys(customQuestions).length === 0) {
    return baseTasks;
  }
  return baseTasks.map((t) => {
    return customQuestions[t.id] ? { ...t, ...customQuestions[t.id] } : t;
  });
}

/**
 * Return all tasks in the master pool, optionally with custom edits
 */
export function getAllTasks(customOverrides?: Record<string, Question>): Question[] {
  return mergeCustomQuestions(masterTaskPool, customOverrides);
}

/**
 * Check if a task is active, accounting for any local admin overrides
 */
export function isTaskActive(task: Question, overrides?: Record<string, boolean>): boolean {
  if (overrides && overrides[task.id] !== undefined) {
    return overrides[task.id];
  }
  return task.isActive !== false;
}

/**
 * Dynamically filter ONLY designated active real questions for a specific group.
 * Group 1 -> team-alpha
 * Group 2 -> team-beta
 * Group 3 -> team-gamma
 * Group 4 -> team-delta
 */
export function getActiveTasksForTeam(
  teamId: string,
  overrides?: Record<string, boolean>,
  customOverrides?: Record<string, Question>
): Question[] {
  const pool = mergeCustomQuestions(masterTaskPool, customOverrides);
  return pool.filter((task) => {
    if (!isTaskActive(task, overrides)) return false;
    if (!task.assignedTeamIds || task.assignedTeamIds.length === 0) return true;
    return task.assignedTeamIds.includes(teamId);
  });
}

/**
 * Retrieve all checkpoints for a specific team
 */
export function getCheckpointsForTeam(
  teamId: string,
  overrides?: Record<string, boolean>,
  customOverrides?: Record<string, Question>
): Question[] {
  const teamTasks = getActiveTasksForTeam(teamId, overrides, customOverrides);
  return teamTasks.filter((t) => isCheckpointTask(t.id));
}

export function getTaskById(taskId: string, customOverrides?: Record<string, Question>): Question | undefined {
  const pool = mergeCustomQuestions(masterTaskPool, customOverrides);
  return pool.find((task) => task.id === taskId);
}

export interface TeamTaskStats {
  team: Team;
  totalActiveTasks: number;
  completedTasks: number;
  totalScore: number;
  progressPercent: number;
}

export function computeTeamTaskStats(
  team: Team,
  submissions: Record<string, Submission>,
  overrides?: Record<string, boolean>,
  customOverrides?: Record<string, Question>
): TeamTaskStats {
  const activeTasks = getActiveTasksForTeam(team.id, overrides, customOverrides);
  let totalScore = 0;
  let completedTasks = 0;

  for (const task of activeTasks) {
    const sub = submissions[`${team.id}_${task.id}`];
    if (sub && (sub.status === "correct" || sub.status === "completed")) {
      completedTasks += 1;
      totalScore += sub.scoreEarned || task.points || 0;
    }
  }

  const totalActiveTasks = activeTasks.length;
  const progressPercent = totalActiveTasks > 0 ? Math.round((completedTasks / totalActiveTasks) * 100) : 0;

  return {
    team,
    totalActiveTasks,
    completedTasks,
    totalScore,
    progressPercent
  };
}
