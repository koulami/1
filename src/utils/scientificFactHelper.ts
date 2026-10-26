import { Question, MultipleChoicePayload, TrueFalsePayload, TextMatchPayload, ImageMatchPayload, QrScanPayload, getMultipleChoiceCorrectIndices } from '../types/game';

export interface ScientificFactRecord {
  taskId: string;
  taskTitle: string;
  taskTitle_en?: string;
  taskType: string;
  points: number;
  correctAnswerText: string;
  correctAnswerText_en: string;
  explanation: string;
  explanation_en: string;
  keyTakeaway: string;
  keyTakeaway_en: string;
  isMistakeTurnedLearning: boolean;
  initialStatus: 'correct' | 'incorrect' | 'completed';
  recordedAt: number;
  teamId: string;
  badge?: string;
  badge_en?: string;
  icon?: string;
}

/**
 * Extracts a concise, punchy 1-sentence scientific takeaway from an explanation or question text.
 */
function extractTakeawayText(text?: string, fallback = ''): string {
  if (!text || !text.trim()) return fallback;
  const cleaned = text.trim();
  const firstPeriod = cleaned.indexOf('.');
  if (firstPeriod > 20 && firstPeriod < 160) {
    return cleaned.slice(0, firstPeriod + 1);
  }
  const firstExcl = cleaned.indexOf('!');
  if (firstExcl > 20 && firstExcl < 160) {
    return cleaned.slice(0, firstExcl + 1);
  }
  if (cleaned.length > 150) {
    return cleaned.slice(0, 147) + '...';
  }
  return cleaned;
}

/**
 * Derives a suitable scientific icon and theme badge for a question
 */
function deriveFactIconAndBadge(quest: Question, isMistake: boolean): { icon: string; badge: string; badge_en: string } {
  const t = (quest.title + ' ' + (quest.description || '')).toLowerCase();

  let icon = '🔬';
  let badge = 'Επιστημονικό Γεγονός';
  let badge_en = 'Scientific Fact';

  if (t.includes('πτέρυγ') || t.includes('άνοιγμα') || t.includes('wingspan')) {
    icon = '🦅';
    badge = '2.5m Άνοιγμα Πτερύγων';
    badge_en = '2.5m Wingspan';
  } else if (t.includes('γκρεμ') || t.includes('φωλ') || t.includes('επισκοπή') || t.includes('θερμικ') || t.includes('cliff')) {
    icon = '🏔️';
    badge = 'Βιότοπος & Φωλεοποίηση';
    badge_en = 'Cliffs & Habitat';
  } else if (t.includes('πτωμα') || t.includes('διατροφ') || t.includes('στομάχ') || t.includes('ph') || t.includes('diet')) {
    icon = '🥩';
    badge = 'Βιολογία & pH Στομάχου';
    badge_en = 'Biology & Stomach pH';
  } else if (t.includes('δηλητήρι') || t.includes('k9') || t.includes('προστασ') || t.includes('ταΐστρ') || t.includes('poison')) {
    icon = '🛡️';
    badge = 'Δράσεις Προστασίας';
    badge_en = 'Conservation Actions';
  } else if (t.includes('αυγ') || t.includes('μονογαμ') || t.includes('egg') || t.includes('αναπαραγ')) {
    icon = '🥚';
    badge = 'Αναπαραγωγή (1 αυγό)';
    badge_en = 'Breeding (1 egg)';
  } else if (t.includes('βάρος') || t.includes('κιλά') || t.includes('weight')) {
    icon = '⚖️';
    badge = 'Βιομετρία (7-11 kg)';
    badge_en = 'Biometrics (7-11 kg)';
  }

  if (isMistake) {
    badge = `💡 ${badge} (Ευκαιρία Μάθησης)`;
    badge_en = `💡 ${badge_en} (Learning Opportunity)`;
  }

  return { icon, badge, badge_en };
}

/**
 * Computes and permanently extracts the authoritative scientific fact, explanation,
 * and key takeaway for any question in the system.
 */
export function extractScientificFact(
  quest: Question,
  teamId: string,
  isCorrect: boolean,
  teamAnswerData?: any
): ScientificFactRecord {
  let correctAnswerText = '';
  let correctAnswerText_en = '';

  const isMistake = !isCorrect;

  // Determine correct answer based on question type
  switch (quest.type) {
    case 'multiple_choice': {
      const payload = quest.payload as MultipleChoicePayload;
      const payload_en = quest.payload_en as MultipleChoicePayload | undefined;
      const correctIndices = getMultipleChoiceCorrectIndices(payload);

      if (Array.isArray(payload?.options)) {
        correctAnswerText = correctIndices.map((i) => payload.options[i]).filter(Boolean).join(' • ');
      }
      if (Array.isArray(payload_en?.options)) {
        correctAnswerText_en = correctIndices.map((i) => payload_en.options[i]).filter(Boolean).join(' • ');
      } else {
        correctAnswerText_en = correctAnswerText;
      }
      break;
    }

    case 'true_false': {
      const payload = quest.payload as TrueFalsePayload;
      const isTrue = payload.correctValue === true;
      correctAnswerText = isTrue ? 'Σωστό (True)' : 'Λάθος (False)';
      correctAnswerText_en = isTrue ? 'True' : 'False';
      break;
    }

    case 'text_match': {
      const payload = quest.payload as TextMatchPayload;
      if (Array.isArray(payload?.pairs)) {
        correctAnswerText = payload.pairs.map((p) => `${p.left} ➔ ${p.right}`).join(' • ');
        correctAnswerText_en = correctAnswerText;
      }
      break;
    }

    case 'image_match': {
      const payload = quest.payload as ImageMatchPayload;
      if (Array.isArray(payload?.pairs)) {
        correctAnswerText = payload.pairs.map((p) => p.text).join(' • ');
        correctAnswerText_en = correctAnswerText;
      }
      break;
    }

    case 'qr_scan': {
      const payload = quest.payload as QrScanPayload;
      correctAnswerText = payload.locationHint || payload.targetCode || 'Επαληθευμένος Σταθμός Έρευνας';
      correctAnswerText_en = payload.locationHint || payload.targetCode || 'Verified Research Station';
      break;
    }

    case 'puzzle': {
      correctAnswerText = 'Ολοκλήρωση συναρμολόγησης επιστημονικού διαγράμματος ανατομίας/πεδίου';
      correctAnswerText_en = 'Complete scientific biometric/anatomy diagram reassembly';
      break;
    }

    case 'photo_upload': {
      const cap = teamAnswerData?.caption || (quest.payload as any)?.instructions;
      correctAnswerText = cap || 'Επαληθευμένο φωτογραφικό τεκμήριο πεδίου';
      correctAnswerText_en = cap || 'Verified field photographic evidence';
      break;
    }

    case 'task':
    case 'research': {
      correctAnswerText = (quest.payload as any)?.completionPrompt || (quest.payload as any)?.instructions || quest.title;
      correctAnswerText_en = quest.title_en || quest.title;
      break;
    }

    default: {
      correctAnswerText = quest.title;
      correctAnswerText_en = quest.title_en || quest.title;
    }
  }

  const explanation = quest.explanation || quest.description || '';
  const explanation_en = quest.explanation_en || quest.description_en || quest.explanation || quest.description || '';

  const keyTakeaway = extractTakeawayText(explanation, quest.title);
  const keyTakeaway_en = extractTakeawayText(explanation_en, quest.title_en || quest.title);

  const { icon, badge, badge_en } = deriveFactIconAndBadge(quest, isMistake);

  return {
    taskId: quest.id,
    taskTitle: quest.title,
    taskTitle_en: quest.title_en,
    taskType: quest.type,
    points: quest.points,
    correctAnswerText,
    correctAnswerText_en,
    explanation,
    explanation_en,
    keyTakeaway,
    keyTakeaway_en,
    isMistakeTurnedLearning: isMistake,
    initialStatus: isCorrect ? 'correct' : 'incorrect',
    recordedAt: Date.now(),
    teamId,
    badge,
    badge_en,
    icon
  };
}
