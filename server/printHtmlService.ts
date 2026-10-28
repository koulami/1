import {
  Question,
  QuestionType,
  Team,
  MultipleChoicePayload,
  TrueFalsePayload,
  TextMatchPayload,
  ImageMatchPayload,
  QrScanPayload,
  TaskPayload,
  PuzzlePayload,
  PhotoUploadPayload,
  ResearchPayload,
  getMultipleChoiceCorrectIndices
} from '../src/types/game.ts';
import QRCode from 'qrcode';

export interface PrintHtmlOptions {
  title?: string;
  title_en?: string;
  description?: string;
  description_en?: string;
  includeAnswers?: boolean;
  printLang?: 'el' | 'en' | 'both';
  includeExplanations?: boolean;
  teamFilter?: string;
  statusFilter?: 'all' | 'active_only' | 'inactive_only';
  teams?: Array<{ id: string; name: string; name_en?: string; color?: string; avatar?: string; slogan?: string; slogan_en?: string }>;
  autoprint?: boolean;
  sessionId?: string;
}

function escapeHtml(str: string = ''): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

export async function generatePrintableQuestsHtml(
  questions: Question[],
  options: PrintHtmlOptions = {}
): Promise<string> {
  const {
    title = 'Αποστολή: Οι 4 Γύπες της Ελλάδας & Κύπρου - Vulture Arena',
    title_en = 'Mission: The 4 Vultures of Greece & Cyprus - Vulture Arena',
    description = 'Διαδραστική εκπαιδευτική αρένα αποστολών αφιερωμένη στη διάσωση του Όρνιου, του Γυπαετού, του Μαυρόγυπα και του Ασπροπάρη.',
    description_en = 'Interactive educational arena of quests dedicated to saving the Griffon, Bearded, Cinereous, and Egyptian Vultures.',
    includeAnswers = true,
    printLang = 'el',
    includeExplanations = true,
    teamFilter = 'all',
    statusFilter = 'all',
    teams = [],
    autoprint = false,
    sessionId = ''
  } = options;

  const validQuestions = Array.isArray(questions) ? questions.filter(q => q && q.id) : [];

  // Determine active & inactive counts across all questions
  const totalCount = validQuestions.length;
  const totalActiveCount = validQuestions.filter(q => q.isActive !== false).length;
  const totalInactiveCount = validQuestions.filter(q => q.isActive === false).length;

  const getTypeName = (type: QuestionType, language: 'el' | 'en') => {
    const mapEl: Record<QuestionType, string> = {
      multiple_choice: 'Πολλαπλής Επιλογής',
      true_false: 'Σωστό / Λάθος',
      text_match: 'Αντιστοίχιση Κειμένου',
      image_match: 'Αντιστοίχιση Εικόνας',
      qr_scan: 'QR Σταθμός',
      photo_upload: 'Φωτογραφική Αποστολή',
      puzzle: 'Διαδραστικό Παζλ',
      task: 'Αποστολή Πεδίου / Δράση',
      survey: 'Δημοσκόπηση & Επιλογή Γνώμης',
      research: 'Δραστηριότητα Έρευνας'
    };
    const mapEn: Record<QuestionType, string> = {
      multiple_choice: 'Multiple Choice',
      true_false: 'True / False',
      text_match: 'Text Matching',
      image_match: 'Image Matching',
      qr_scan: 'QR Code Station',
      photo_upload: 'Photo Quest',
      puzzle: 'Interactive Puzzle',
      task: 'Field Task / Action',
      survey: 'Opinion Poll & Survey',
      research: 'Research & Inquiry'
    };
    return language === 'en' ? mapEn[type] || type : mapEl[type] || type;
  };

  const getTeamNames = (assignedIds?: string[]) => {
    if (!assignedIds || assignedIds.length === 0 || assignedIds.length === teams.length) {
      return printLang === 'en' ? 'Shared across all teams' : 'Κοινή για όλες τις ομάδες';
    }
    return assignedIds
      .map((id) => {
        const tm = teams.find((t) => t.id === id);
        return tm ? tm.name.split(':')[0] : id;
      })
      .join(', ');
  };

  // Pre-generate QR code data URLs asynchronously
  const qrDataUrls: Record<string, string> = {};
  for (const q of validQuestions) {
    if (q.type === 'qr_scan') {
      const payload = q.payload as QrScanPayload;
      const code = payload?.targetCode || 'VULTURE-STATION';
      try {
        qrDataUrls[q.id] = await QRCode.toDataURL(code, {
          width: 140,
          margin: 1,
          color: { dark: '#4c1d95', light: '#ffffff' }
        });
      } catch {
        // fallback
      }
    }
  }

  // Render a single question card
  const renderQuestionCard = (quest: Question, index: number, isQuestActive: boolean) => {
    const questNum = index + 1;
    const assignedTeamsText = getTeamNames(quest.assignedTeamIds);

    const titleText = printLang === 'en' ? (quest.title_en || quest.title) : quest.title;
    const titleSecondary = printLang === 'both' && quest.title_en ? quest.title_en : null;

    const descText = printLang === 'en' ? (quest.description_en || quest.description) : quest.description;
    const descSecondary = printLang === 'both' && quest.description_en ? quest.description_en : null;

    const explanationText = printLang === 'en' ? (quest.explanation_en || quest.explanation) : quest.explanation;

    let payloadContentHtml = '';

    // 1. Multiple Choice
    if (quest.type === 'multiple_choice') {
      const payload = (printLang === 'en' && quest.payload_en ? quest.payload_en : quest.payload) as MultipleChoicePayload;
      const correctIndices = getMultipleChoiceCorrectIndices(payload);

      const optionsHtml = (payload.options || []).map((opt, optIdx) => {
        const isCorrect = correctIndices.includes(optIdx);
        if (includeAnswers && isCorrect) {
          return `
            <div class="text-xs p-2.5 rounded-lg flex items-start gap-2.5 bg-emerald-100 text-emerald-950 font-bold border-2 border-emerald-500 shadow-sm">
              <span class="font-mono text-xs shrink-0 font-bold text-emerald-800">[✓] ${String.fromCharCode(65 + optIdx)}.</span>
              <span class="flex-1">${escapeHtml(opt)}</span>
              <span class="ml-auto text-[10px] font-black tracking-wider uppercase text-emerald-950 bg-emerald-200 px-2 py-0.5 rounded shrink-0">
                ✓ ΟΡΘΗ ΑΠΑΝΤΗΣΗ
              </span>
            </div>
          `;
        } else {
          return `
            <div class="text-xs p-2 rounded-lg flex items-start gap-2.5 text-slate-800 bg-white border border-slate-300">
              <span class="font-mono text-xs shrink-0 font-bold text-slate-500">[  ] ${String.fromCharCode(65 + optIdx)}.</span>
              <span class="flex-1">${escapeHtml(opt)}</span>
            </div>
          `;
        }
      }).join('');

      payloadContentHtml = `<div class="space-y-1.5 pt-1 pl-1">${optionsHtml}</div>`;
    }
    // 2. True / False
    else if (quest.type === 'true_false') {
      const payload = quest.payload as TrueFalsePayload;
      const isTrue = payload.correctValue;

      if (includeAnswers) {
        payloadContentHtml = `
          <div class="pt-1 pl-1">
            <div class="p-2.5 rounded-lg bg-emerald-100 border-2 border-emerald-500 text-emerald-950 text-xs font-bold flex items-center gap-2">
              <span class="text-base font-black">✓</span>
              <span>ΟΡΘΗ ΑΠΑΝΤΗΣΗ:</span>
              <span class="uppercase tracking-wider font-black px-2.5 py-0.5 rounded bg-emerald-200 text-emerald-900">
                ${isTrue ? (printLang === 'en' ? 'TRUE (ΣΩΣΤΟ)' : 'ΣΩΣΤΟ') : (printLang === 'en' ? 'FALSE (ΛΑΘΟΣ)' : 'ΛΑΘΟΣ')}
              </span>
            </div>
          </div>
        `;
      } else {
        payloadContentHtml = `
          <div class="pt-1 pl-1 flex items-center gap-4 text-xs font-semibold text-slate-800">
            <span class="px-3 py-1.5 rounded border border-slate-300 bg-white">[  ] ΣΩΣΤΟ (True)</span>
            <span class="px-3 py-1.5 rounded border border-slate-300 bg-white">[  ] ΛΑΘΟΣ (False)</span>
          </div>
        `;
      }
    }
    // 3. Text Match
    else if (quest.type === 'text_match') {
      const payload = (printLang === 'en' && quest.payload_en ? quest.payload_en : quest.payload) as TextMatchPayload;
      const pairsHtml = (payload.pairs || []).map((pair) => {
        return `
          <div class="flex items-center justify-between p-2 rounded-lg bg-white border border-slate-300 text-xs text-slate-900">
            <span class="font-semibold text-slate-800">${escapeHtml(pair.left)}</span>
            <span class="text-slate-400 px-3 font-bold">➔</span>
            <span class="font-bold ${includeAnswers ? 'text-emerald-900 bg-emerald-100 px-2.5 py-1 rounded border border-emerald-300' : 'text-slate-400 italic'}">
              ${includeAnswers ? `✓ ${escapeHtml(pair.right)}` : '____________________'}
            </span>
          </div>
        `;
      }).join('');

      payloadContentHtml = `
        <div class="pt-1 pl-1 space-y-1.5">
          <div class="text-[11px] font-bold text-slate-700 uppercase tracking-wider">
            ${includeAnswers ? 'Σωστή Αντιστοίχιση Ζευγαριών:' : 'Ζεύγη προς αντιστοίχιση:'}
          </div>
          <div class="grid grid-cols-1 gap-1.5">${pairsHtml}</div>
        </div>
      `;
    }
    // 4. Image Match
    else if (quest.type === 'image_match') {
      const payload = (printLang === 'en' && quest.payload_en ? quest.payload_en : quest.payload) as ImageMatchPayload;
      const pairsHtml = (payload.pairs || []).map((p) => {
        return `
          <div class="flex items-center gap-3 p-2.5 rounded-lg bg-white border border-slate-300 text-xs">
            ${p.image ? `<img src="${p.image}" alt="Silhouette" class="w-12 h-12 object-cover rounded bg-slate-100 border border-slate-300 shrink-0" />` : ''}
            <div class="flex-1">
              <div class="font-bold text-slate-900">${escapeHtml(p.text)}</div>
              ${includeAnswers ? '<div class="text-[11px] text-emerald-800 font-semibold mt-0.5">✓ Αντιστοιχεί στη σιλουέτα του αντίστοιχου γύπα</div>' : ''}
            </div>
          </div>
        `;
      }).join('');

      payloadContentHtml = `
        <div class="pt-1 pl-1 space-y-1.5">
          <div class="text-[11px] font-bold text-slate-700 uppercase tracking-wider">
            ${includeAnswers ? 'Σωστή Αντιστοίχιση Σιλουέτας / Είδους:' : 'Χαρακτηριστικά Σιλουέτας:'}
          </div>
          <div class="grid grid-cols-1 gap-1.5">${pairsHtml}</div>
        </div>
      `;
    }
    // 5. QR Scan
    else if (quest.type === 'qr_scan') {
      const payload = quest.payload as QrScanPayload;
      const qrImg = qrDataUrls[quest.id];
      payloadContentHtml = `
        <div class="pt-1 pl-1 flex flex-row items-center justify-between gap-4 p-3 rounded-xl bg-purple-50 border border-purple-200">
          <div class="space-y-1">
            <div class="text-xs font-bold text-purple-900">Κωδικός Σταθμού QR (Target Code):</div>
            <div class="font-mono text-sm font-black text-purple-950 bg-white px-3 py-1 rounded-lg border border-purple-300 inline-block">
              ${escapeHtml(payload.targetCode)}
            </div>
            ${payload.locationHint ? `<div class="text-[11px] text-slate-700 font-medium">📍 Τοποθεσία: ${escapeHtml(payload.locationHint)}</div>` : ''}
            ${includeAnswers && payload.unlockedMedia ? `<div class="text-[11px] text-purple-800">🔓 Ξεκλειδώνει: <strong>${escapeHtml(payload.unlockedMedia.title || payload.unlockedMedia.type)}</strong></div>` : ''}
          </div>
          ${qrImg ? `
            <div class="bg-white p-2 rounded-xl border border-purple-300 shadow-xs shrink-0 text-center">
              <img src="${qrImg}" alt="QR Code" class="w-20 h-20" />
              <div class="text-[9px] font-mono text-purple-900 font-bold mt-1">Σκανάρετε εδώ</div>
            </div>
          ` : ''}
        </div>
      `;
    }
    // 6. Field Task
    else if (quest.type === 'task') {
      const payload = (printLang === 'en' && quest.payload_en ? quest.payload_en : quest.payload) as TaskPayload;
      const checklistHtml = Array.isArray(payload.checklist) && payload.checklist.length > 0 ? `
        <div class="space-y-1 mt-1.5">
          <div class="text-[11px] font-bold text-slate-700 uppercase">Λίστα Ελέγχου / Checkpoints:</div>
          ${payload.checklist.map((item) => `
            <div class="text-xs flex items-start gap-2 text-slate-800">
              <span class="font-mono text-slate-500 font-bold">[ ]</span>
              <span>${escapeHtml(item)}</span>
            </div>
          `).join('')}
        </div>
      ` : '';

      payloadContentHtml = `
        <div class="pt-1 pl-1 space-y-2">
          ${payload.instructions ? `
            <div class="text-xs text-slate-800 font-medium bg-amber-50 p-2.5 rounded-lg border border-amber-200">
              📋 <strong>Οδηγίες Δράσης:</strong> ${escapeHtml(payload.instructions)}
            </div>
          ` : ''}
          ${checklistHtml}
          ${includeAnswers && payload.completionPrompt ? `
            <div class="text-[11px] text-slate-600 italic">
              📝 Ζητούμενο τελικής αναφοράς: ${escapeHtml(payload.completionPrompt)}
            </div>
          ` : ''}
        </div>
      `;
    }
    // 7. Puzzle
    else if (quest.type === 'puzzle') {
      const payload = quest.payload as PuzzlePayload;
      payloadContentHtml = `
        <div class="pt-1 pl-1 text-xs text-slate-700 flex items-center gap-3 bg-sky-50 p-2.5 rounded-lg border border-sky-200">
          ${payload.imageUrl ? `<img src="${payload.imageUrl}" alt="Puzzle" class="w-16 h-12 object-cover rounded border border-sky-300" />` : ''}
          <div>
            <div>🧩 <strong>Διαδραστικό Παζλ:</strong> Σύνθεση ${payload.gridPieces || 9} κομματιών για την αναπαράσταση της σκηνής.</div>
            ${includeAnswers ? `<div class="text-emerald-800 font-semibold text-[11px] mt-0.5">✓ Η ολοκλήρωση αποδίδει πλήρεις πόντους (${quest.points} pts) αυτόματα.</div>` : ''}
          </div>
        </div>
      `;
    }
    // 8. Photo Upload
    else if (quest.type === 'photo_upload') {
      const payload = (printLang === 'en' && quest.payload_en ? quest.payload_en : quest.payload) as PhotoUploadPayload;
      payloadContentHtml = `
        <div class="pt-1 pl-1 text-xs text-slate-700 bg-amber-50 p-2.5 rounded-lg border border-amber-200">
          📷 <strong>Οδηγίες Φωτογράφισης:</strong> ${escapeHtml(payload.instructions || '')}
          ${includeAnswers ? '<div class="mt-1 text-emerald-800 text-[11px] font-semibold">✓ Απαιτείται τεκμήριο φωτογραφίας από την ομάδα για επικύρωση.</div>' : ''}
        </div>
      `;
    }
    // 9. Research
    else if (quest.type === 'research') {
      const payload = (printLang === 'en' && quest.payload_en ? quest.payload_en : quest.payload) as ResearchPayload;
      const gqHtml = Array.isArray(payload.guidingQuestions) && payload.guidingQuestions.length > 0 ? `
        <div class="space-y-1 bg-slate-50 p-2 rounded border border-slate-200">
          <div class="text-[10px] font-bold text-slate-600 uppercase">Ερευνητικά Ερωτήματα προς Απάντηση:</div>
          ${payload.guidingQuestions.map((gq) => `
            <div class="flex items-start gap-1.5 text-[11px]">
              <span class="font-mono text-slate-500 font-bold">•</span>
              <span>${escapeHtml(gq)}</span>
            </div>
          `).join('')}
        </div>
      ` : '';

      const sourcesHtml = Array.isArray(payload.suggestedSources) && payload.suggestedSources.length > 0 ? `
        <div class="text-[10px] text-slate-600">
          🔗 <strong>Πηγές:</strong> ${payload.suggestedSources.map(s => escapeHtml(s.title || s.url)).join(' · ')}
        </div>
      ` : '';

      payloadContentHtml = `
        <div class="pt-1 pl-1 space-y-2 text-xs text-slate-800">
          ${payload.researchTopic ? `
            <div class="font-bold text-teal-900 bg-teal-50 p-2 rounded border border-teal-200">
              🔬 <strong>Θέμα Έρευνας:</strong> ${escapeHtml(payload.researchTopic)}
            </div>
          ` : ''}
          ${payload.instructions ? `
            <div class="text-[11px] text-slate-700">
              📋 <strong>Οδηγίες:</strong> ${escapeHtml(payload.instructions)}
            </div>
          ` : ''}
          ${gqHtml}
          ${sourcesHtml}
        </div>
      `;
    }

    return `
      <div class="p-4 sm:p-5 rounded-xl border ${isQuestActive ? 'border-slate-300 bg-slate-50/90' : 'border-slate-200 bg-slate-100/70 opacity-90'} page-break-avoid space-y-3">
        <!-- Quest Item Header -->
        <div class="flex flex-row items-center justify-between gap-2 pb-2.5 border-b border-slate-200">
          <div class="flex items-center gap-2.5 flex-wrap">
            <span class="w-7 h-7 rounded-lg ${isQuestActive ? 'bg-slate-900 text-white' : 'bg-slate-400 text-white'} font-mono font-black text-xs flex items-center justify-center shrink-0">
              #${questNum}
            </span>
            <h4 class="font-bold text-sm text-slate-900">
              ${escapeHtml(titleText)}
            </h4>
            ${titleSecondary ? `<span class="text-xs text-slate-500 italic block sm:inline">(${escapeHtml(titleSecondary)})</span>` : ''}
          </div>

          <div class="flex items-center gap-1.5 flex-wrap text-xs shrink-0">
            <span class="font-semibold text-slate-700 px-2 py-0.5 rounded bg-slate-200 text-[11px]">
              ${escapeHtml(getTypeName(quest.type, printLang === 'en' ? 'en' : 'el'))}
            </span>
            <span class="font-mono font-bold ${isQuestActive ? 'text-emerald-800 bg-emerald-100' : 'text-slate-600 bg-slate-200'} text-[11px] px-2 py-0.5 rounded">
              ${quest.points || 100} pts
            </span>
            ${isQuestActive ? `
              <span class="px-2 py-0.5 rounded font-bold text-[10px] bg-emerald-100 text-emerald-800 border border-emerald-300">
                🟢 ΕΝΕΡΓΗ
              </span>
            ` : `
              <span class="px-2 py-0.5 rounded font-bold text-[10px] bg-slate-200 text-slate-700 border border-slate-300">
                💤 ΑΝΕΝΕΡΓΗ
              </span>
            `}
            <span class="text-[11px] text-slate-600 bg-slate-200/80 px-2 py-0.5 rounded" title="${escapeHtml(assignedTeamsText)}">
              ${escapeHtml(assignedTeamsText)}
            </span>
          </div>
        </div>

        <!-- Optional Reference Illustration -->
        ${quest.imageUrl ? `
          <div class="my-2 max-w-sm rounded-lg overflow-hidden border border-slate-300 shadow-xs">
            <img src="${quest.imageUrl}" alt="${escapeHtml(quest.title)}" class="w-full h-auto max-h-48 object-cover" />
          </div>
        ` : ''}

        <!-- Description -->
        <p class="text-xs text-slate-700 leading-relaxed font-normal">
          ${escapeHtml(descText)}
        </p>
        ${descSecondary ? `<p class="text-xs text-slate-500 italic leading-relaxed">${escapeHtml(descSecondary)}</p>` : ''}

        <!-- Question Specific Content -->
        ${payloadContentHtml}

        <!-- Solution Explanation / Ornithological Note -->
        ${includeAnswers && includeExplanations && explanationText ? `
          <div class="mt-2.5 p-3 rounded-lg bg-amber-50 border border-amber-300 text-xs text-amber-950 flex items-start gap-2.5">
            <span class="text-base shrink-0">💡</span>
            <div>
              <span class="font-bold block text-[11px] text-amber-900 uppercase tracking-wide">
                Επιστημονική Επεξήγηση / Ορνιθολογικό Σημείωμα:
              </span>
              <span class="leading-relaxed font-normal">${escapeHtml(explanationText)}</span>
            </div>
          </div>
        ` : ''}
      </div>
    `;
  };

  // Grouping logic:
  // We produce sections grouped by Team!
  // For each team:
  //   1) Active questions
  //   2) Inactive questions
  const teamsToProcess = teamFilter === 'all'
    ? teams
    : teams.filter(t => t.id === teamFilter);

  const teamSectionsHtml = teamsToProcess.map((team) => {
    // Questions belonging to this team or shared
    const teamQuests = validQuestions.filter((q) => {
      if (!q.assignedTeamIds || q.assignedTeamIds.length === 0) return true;
      return q.assignedTeamIds.includes(team.id);
    });

    const activeQuests = teamQuests.filter(q => q.isActive !== false);
    const inactiveQuests = teamQuests.filter(q => q.isActive === false);

    // Apply status filter if requested
    const showActive = statusFilter !== 'inactive_only' && activeQuests.length > 0;
    const showInactive = statusFilter !== 'active_only' && inactiveQuests.length > 0;

    if (!showActive && !showInactive) {
      return '';
    }

    const teamTitle = printLang === 'en' && team.name_en ? team.name_en : team.name;
    const teamSlogan = printLang === 'en' && team.slogan_en ? team.slogan_en : team.slogan;
    const teamColor = team.color || '#10b981';

    return `
      <section class="team-section mb-12 page-break-avoid">
        <!-- Team Banner Header -->
        <div class="p-4 sm:p-5 rounded-2xl border-2 mb-6 shadow-sm" style="border-color: ${teamColor}; background: linear-gradient(to right, ${teamColor}15, #f8fafc)">
          <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div class="flex items-center gap-3">
              <span class="text-3xl p-2 rounded-xl bg-white shadow-xs border border-slate-200 shrink-0">
                ${team.avatar || '🦅'}
              </span>
              <div>
                <h2 class="text-base sm:text-xl font-black text-slate-900 tracking-tight">
                  ${escapeHtml(teamTitle)}
                </h2>
                ${teamSlogan ? `
                  <p class="text-xs text-slate-600 font-medium italic mt-0.5">
                    «${escapeHtml(teamSlogan)}»
                  </p>
                ` : ''}
              </div>
            </div>
            <div class="flex items-center gap-2 flex-wrap text-xs font-mono shrink-0">
              <span class="px-3 py-1 rounded-lg bg-emerald-100 text-emerald-900 font-bold border border-emerald-300">
                🟢 ${activeQuests.length} Ενεργές
              </span>
              ${inactiveQuests.length > 0 ? `
                <span class="px-3 py-1 rounded-lg bg-slate-200 text-slate-800 font-bold border border-slate-300">
                  💤 ${inactiveQuests.length} Ανενεργές
                </span>
              ` : ''}
              <span class="px-2.5 py-1 rounded-lg bg-white text-slate-700 font-semibold border border-slate-200">
                Σύνολο: ${teamQuests.length}
              </span>
            </div>
          </div>
        </div>

        <!-- Section 1: Active Questions -->
        ${showActive ? `
          <div class="mb-8">
            <div class="flex items-center gap-2 mb-4 pb-2 border-b-2 border-emerald-500">
              <span class="w-3.5 h-3.5 rounded-full bg-emerald-500 shadow-xs"></span>
              <h3 class="text-sm font-black text-emerald-950 uppercase tracking-wider flex items-center gap-2">
                <span>🟢 Ενεργές Αποστολές</span>
                <span class="text-xs font-mono px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300">
                  ${activeQuests.length}
                </span>
              </h3>
            </div>
            <div class="space-y-6">
              ${activeQuests.map((q, idx) => renderQuestionCard(q, idx, true)).join('\n')}
            </div>
          </div>
        ` : ''}

        <!-- Section 2: Inactive Questions (Archived / Disabled) -->
        ${showInactive ? `
          <div class="mb-8 pt-4">
            <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4 pb-2 border-b-2 border-slate-400">
              <div class="flex items-center gap-2">
                <span class="w-3.5 h-3.5 rounded-full bg-slate-400"></span>
                <h3 class="text-sm font-black text-slate-800 uppercase tracking-wider flex items-center gap-2">
                  <span>💤 Ανενεργές Αποστολές / Αρχείο</span>
                  <span class="text-xs font-mono px-2 py-0.5 rounded-full bg-slate-200 text-slate-700 border border-slate-300">
                    ${inactiveQuests.length}
                  </span>
                </h3>
              </div>
              <span class="text-[11px] text-slate-500 italic bg-slate-100 px-2.5 py-0.5 rounded border border-slate-200">
                ℹ️ Αυτές οι αποστολές είναι προσωρινά ανενεργές στην εφαρμογή
              </span>
            </div>
            <div class="space-y-6">
              ${inactiveQuests.map((q, idx) => renderQuestionCard(q, idx, false)).join('\n')}
            </div>
          </div>
        ` : ''}
      </section>
    `;
  }).join('\n');

  // Also check if any question is not covered by the teams loop (e.g. general questions)
  const allTeamIds = new Set(teams.map(t => t.id));
  const generalQuestions = validQuestions.filter(q => q.assignedTeamIds && q.assignedTeamIds.length > 0 && !q.assignedTeamIds.some(id => allTeamIds.has(id)));
  let generalSectionHtml = '';
  if (generalQuestions.length > 0 && teamFilter === 'all') {
    const generalActive = generalQuestions.filter(q => q.isActive !== false);
    const generalInactive = generalQuestions.filter(q => q.isActive === false);
    generalSectionHtml = `
      <section class="team-section mb-12 page-break-avoid">
        <div class="p-4 rounded-2xl border-2 border-slate-400 bg-slate-100 mb-6">
          <h2 class="text-base font-black text-slate-900">🌐 Γενικές / Αδιάθετες Αποστολές (${generalQuestions.length})</h2>
        </div>
        <div class="space-y-6">
          ${generalActive.map((q, idx) => renderQuestionCard(q, idx, true)).join('\n')}
          ${generalInactive.map((q, idx) => renderQuestionCard(q, idx, false)).join('\n')}
        </div>
      </section>
    `;
  }

  const docTitle = printLang === 'en' ? (title_en || title) : title;
  const docDesc = printLang === 'en' ? (description_en || description) : description;

  const dateFormatted = new Date().toLocaleDateString(printLang === 'en' ? 'en-US' : 'el-GR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  const sessionParam = sessionId ? `&session=${encodeURIComponent(sessionId)}` : '';

  return `<!DOCTYPE html>
<html lang="${printLang === 'en' ? 'en' : 'el'}">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${escapeHtml(docTitle)} - ${totalCount} Αποστολές (Ενεργές & Ανενεργές ανά Ομάδα)</title>
  <script src="https://cdn.jsdelivr.net/npm/@tailwindcss/browser@4"></script>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800;900&display=swap');
    body {
      font-family: 'Plus Jakarta Sans', system-ui, -apple-system, sans-serif;
      background: #f1f5f9;
      color: #0f172a;
      margin: 0;
      padding: 0;
      -webkit-print-color-adjust: exact !important;
      print-color-adjust: exact !important;
    }
    @page {
      size: A4;
      margin: 12mm 10mm;
    }
    @media print {
      body {
        background: #ffffff !important;
        padding: 0 !important;
      }
      .no-print {
        display: none !important;
      }
      .print-shadow-none {
        box-shadow: none !important;
        border: none !important;
      }
      .page-break-avoid {
        break-inside: avoid !important;
        page-break-inside: avoid !important;
      }
    }
    .page-break-avoid {
      break-inside: avoid;
      page-break-inside: avoid;
    }
  </style>
</head>
<body class="antialiased">

  <!-- Floating Print Control Bar (Hidden when printing) -->
  <div class="no-print sticky top-0 z-50 bg-slate-900/95 backdrop-blur-md border-b border-slate-700 text-white px-4 py-3 shadow-xl">
    <div class="max-w-4xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-3">
      <div class="flex items-center gap-3">
        <span class="text-2xl">🦅</span>
        <div>
          <h1 class="font-black text-sm sm:text-base text-slate-100 flex items-center gap-2">
            <span>Όλες οι Αποστολές: Χωρισμένες ανά Ομάδα (Ενεργές & Ανενεργές)</span>
            <span class="text-xs px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 font-mono font-bold">
              ${totalCount} Αποστολές (${totalActiveCount} Ενεργές · ${totalInactiveCount} Ανενεργές)
            </span>
          </h1>
          <p class="text-xs text-slate-400">
            Πατήστε <strong>«Αποθήκευση σε PDF / Εκτύπωση»</strong> για να αποθηκεύσετε όλες τις αποστολές όπως εμφανίζονται παρακάτω.
          </p>
        </div>
      </div>

      <div class="flex items-center gap-2 flex-wrap">
        <!-- Print Button (Triggers browser save to PDF) -->
        <button
          onclick="window.print()"
          class="px-4 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-black text-xs flex items-center gap-2 shadow-lg shadow-emerald-500/25 cursor-pointer transition-all active:scale-95"
          title="Εκτύπωση ή Αποθήκευση ως PDF μέσω του προγράμματος περιήγησης"
        >
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z"></path></svg>
          <span>🖨️ Αποθήκευση σε PDF / Εκτύπωση</span>
        </button>

        <!-- Direct PDF Download Link -->
        <a
          href="/api/generate-pdf?answers=${includeAnswers}&lang=${printLang}&team=${teamFilter}&status=${statusFilter}${sessionParam}"
          download="${includeAnswers ? `BoundPad-Vulture-Arena-${totalCount}-Lyseis.pdf` : `BoundPad-Vulture-Arena-${totalCount}-Fyllo.pdf`}"
          class="px-3.5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-emerald-300 border border-emerald-500/30 font-bold text-xs flex items-center gap-1.5 transition-all"
          title="Άμεση λήψη αρχείου PDF"
        >
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path></svg>
          <span>📥 Αρχείο .pdf (${totalCount})</span>
        </a>

        <!-- Status Filter Toggle Links -->
        <div class="flex items-center rounded-xl bg-slate-800 p-0.5 border border-slate-700 text-xs">
          <a
            href="?answers=${includeAnswers}&lang=${printLang}&team=${teamFilter}&status=all${sessionParam}"
            class="px-2.5 py-1.5 rounded-lg font-bold transition-colors ${statusFilter === 'all' ? 'bg-emerald-600 text-white' : 'text-slate-400 hover:text-white'}"
            title="Όλες οι αποστολές (Ενεργές & Ανενεργές)"
          >
            Όλες (${totalCount})
          </a>
          <a
            href="?answers=${includeAnswers}&lang=${printLang}&team=${teamFilter}&status=active_only${sessionParam}"
            class="px-2.5 py-1.5 rounded-lg font-bold transition-colors ${statusFilter === 'active_only' ? 'bg-emerald-600 text-white' : 'text-slate-400 hover:text-white'}"
            title="Μόνο οι ενεργές αποστολές"
          >
            Ενεργές (${totalActiveCount})
          </a>
          <a
            href="?answers=${includeAnswers}&lang=${printLang}&team=${teamFilter}&status=inactive_only${sessionParam}"
            class="px-2.5 py-1.5 rounded-lg font-bold transition-colors ${statusFilter === 'inactive_only' ? 'bg-emerald-600 text-white' : 'text-slate-400 hover:text-white'}"
            title="Μόνο οι ανενεργές αποστολές"
          >
            Ανενεργές (${totalInactiveCount})
          </a>
        </div>

        <!-- Answers Toggle Links -->
        <div class="flex items-center rounded-xl bg-slate-800 p-0.5 border border-slate-700 text-xs">
          <a
            href="?answers=true&lang=${printLang}&team=${teamFilter}&status=${statusFilter}${sessionParam}"
            class="px-2.5 py-1.5 rounded-lg font-bold transition-colors ${includeAnswers ? 'bg-emerald-600 text-white' : 'text-slate-400 hover:text-white'}"
          >
            Με Λύσεις
          </a>
          <a
            href="?answers=false&lang=${printLang}&team=${teamFilter}&status=${statusFilter}${sessionParam}"
            class="px-2.5 py-1.5 rounded-lg font-bold transition-colors ${!includeAnswers ? 'bg-emerald-600 text-white' : 'text-slate-400 hover:text-white'}"
          >
            Φύλλο Μαθητή
          </a>
        </div>
      </div>
    </div>
  </div>

  <!-- Main Printable Document Sheet -->
  <main class="max-w-4xl mx-auto my-4 sm:my-8 bg-white text-slate-900 p-6 sm:p-10 rounded-2xl shadow-xl print-shadow-none">
    
    <!-- Document Header -->
    <header class="border-b-2 border-slate-900 pb-5 mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div>
        <div class="flex items-center gap-3">
          <span class="text-4xl">🦅</span>
          <div>
            <h1 class="text-xl sm:text-2xl font-black text-slate-950 tracking-tight leading-tight">
              ${escapeHtml(docTitle)}
            </h1>
            <div class="text-xs text-slate-600 font-semibold mt-0.5">
              Οι 4 Γύπες της Ελλάδας: Όρνιο, Γυπαετός, Μαυρόγυπας, Ασπροπάρης
            </div>
          </div>
        </div>
        <div class="mt-3 flex items-center gap-2 flex-wrap">
          <span class="text-xs font-bold uppercase tracking-wider px-2.5 py-1 rounded ${includeAnswers ? 'bg-emerald-800 text-white' : 'bg-slate-900 text-white'}">
            ${includeAnswers
              ? (printLang === 'en' ? 'Teacher Guide & Complete Solutions' : 'Οδηγός Εκπαιδευτικού & Πλήρεις Λύσεις Αποστολών')
              : (printLang === 'en' ? 'Student Field Activity Sheet' : 'Φύλλο Δραστηριοτήτων & Αποστολών Ομάδων')}
          </span>
          <span class="text-xs font-bold text-slate-700 bg-slate-100 px-2.5 py-1 rounded border border-slate-300">
            ${totalCount} Αποστολές (${totalActiveCount} Ενεργές · ${totalInactiveCount} Ανενεργές)
          </span>
          <span class="text-xs font-bold text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded border border-emerald-300">
            Χωρισμένες ανά Ομάδα & Κατάσταση
          </span>
        </div>
        <p class="text-xs text-slate-600 mt-2 max-w-2xl leading-relaxed">
          ${escapeHtml(docDesc)}
        </p>
      </div>

      <div class="text-left sm:text-right text-xs text-slate-500 shrink-0 border-t sm:border-t-0 pt-2 sm:pt-0 border-slate-200">
        <div class="font-black text-slate-900 text-sm">BoundPad Vulture Arena</div>
        <div>${dateFormatted}</div>
        <div class="font-mono text-[11px] text-slate-500 mt-0.5">
          ${teamFilter === 'all' ? (printLang === 'en' ? 'All Teams (Grouped)' : 'Και οι 4 Ομάδες (Ανά Ομάδα)') : escapeHtml(teams.find(t => t.id === teamFilter)?.name || getTeamNames([teamFilter]))}
        </div>
      </div>
    </header>

    <!-- Quests List (Grouped by Team, Active first, then Inactive) -->
    <div class="space-y-4">
      ${teamSectionsHtml}
      ${generalSectionHtml}
    </div>

    <!-- Document Footer -->
    <footer class="mt-12 pt-4 border-t-2 border-slate-300 text-center text-xs text-slate-500 flex flex-col sm:flex-row items-center justify-between gap-2">
      <div>BoundPad - Actionbound & Padlet Interactive Team Arena</div>
      <div class="font-bold text-slate-800">Εκπαιδευτικό Πρόγραμμα για τους 4 Γύπες της Ελλάδας & Κύπρου</div>
      <div>Σελίδα Οδηγού & Λύσεων (${totalCount} Αποστολές)</div>
    </footer>

  </main>

  ${autoprint ? `
  <script>
    window.addEventListener('load', () => {
      setTimeout(() => {
        window.print();
      }, 700);
    });
  </script>
  ` : ''}

</body>
</html>`;
}
