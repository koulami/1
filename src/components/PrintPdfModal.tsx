import React, { useState, useMemo, useEffect } from 'react';
import {
  Printer, Download, CheckCircle2, Eye,
  Layers, Users, X, Loader2, Code2,
  ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight,
  QrCode, FileText, Check, Sparkles
} from 'lucide-react';
import {
  GameState, Language, Question, QuestionType, Team,
  MultipleChoicePayload, TrueFalsePayload, TextMatchPayload,
  ImageMatchPayload, QrScanPayload, TaskPayload, PuzzlePayload,
  PhotoUploadPayload, ResearchPayload, getMultipleChoiceCorrectIndices
} from '../types/game';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  gameState: GameState;
  lang: Language;
}

export const PrintPdfModal: React.FC<Props> = ({
  isOpen,
  onClose,
  gameState,
  lang
}) => {
  const [includeAnswers, setIncludeAnswers] = useState<boolean>(true);
  const [teamFilter, setTeamFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active_only' | 'inactive_only'>('all');
  const [printLang, setPrintLang] = useState<'el' | 'en' | 'both'>('el');
  const [includeQrs, setIncludeQrs] = useState<boolean>(true);
  const [includeExplanations, setIncludeExplanations] = useState<boolean>(true);

  // Pagination State (Strict 8-10 quests per page to guarantee ZERO memory crashes)
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(8);

  const [isGeneratingPdf, setIsGeneratingPdf] = useState<boolean>(false);
  const [pdfProgress, setPdfProgress] = useState<string>('');
  const [lastDownloadUrl, setLastDownloadUrl] = useState<string | null>(null);
  const [lastDownloadName, setLastDownloadName] = useState<string>('');
  const [downloadSuccess, setDownloadSuccess] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Reset to page 1 whenever filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [teamFilter, statusFilter, pageSize]);

  const validQuestions = useMemo(() => {
    return Array.isArray(gameState.questions) ? gameState.questions.filter(q => q && q.id) : [];
  }, [gameState.questions]);

  const totalQuestsCount = validQuestions.length;
  const totalActiveCount = useMemo(() => validQuestions.filter(q => q.isActive !== false).length, [validQuestions]);
  const totalInactiveCount = useMemo(() => validQuestions.filter(q => q.isActive === false).length, [validQuestions]);

  // Compute filtered questions list according to team and status filter
  const filteredQuestions = useMemo(() => {
    return validQuestions.filter((q) => {
      // Status filter
      if (statusFilter === 'active_only' && q.isActive === false) return false;
      if (statusFilter === 'inactive_only' && q.isActive !== false) return false;

      // Team filter
      if (teamFilter !== 'all') {
        const inTeam = Array.isArray(q.assignedTeamIds) && q.assignedTeamIds.length > 0
          ? q.assignedTeamIds.includes(teamFilter)
          : ((q as any).teamId ? (q as any).teamId === teamFilter : true);
        if (!inTeam) return false;
      }
      return true;
    }).sort((a, b) => {
      // Keep active first, then inactive
      const aActive = a.isActive !== false ? 1 : 0;
      const bActive = b.isActive !== false ? 1 : 0;
      if (aActive !== bActive) return bActive - aActive;
      return 0;
    });
  }, [validQuestions, teamFilter, statusFilter]);

  const totalFilteredCount = filteredQuestions.length;
  const totalPages = Math.max(1, Math.ceil(totalFilteredCount / pageSize));
  const safeCurrentPage = Math.min(currentPage, totalPages);

  // Slice strictly for current page (only 8-10 cards in DOM at any time!)
  const startIndex = (safeCurrentPage - 1) * pageSize;
  const endIndex = Math.min(startIndex + pageSize, totalFilteredCount);
  const displayedQuestions = useMemo(() => {
    return filteredQuestions.slice(startIndex, endIndex);
  }, [filteredQuestions, startIndex, endIndex]);

  if (!isOpen) return null;

  // Trigger native browser print for the current paginated view
  const handleTriggerPrint = () => {
    document.body.classList.add('printing-quest-document');
    window.print();
    setTimeout(() => {
      document.body.classList.remove('printing-quest-document');
    }, 1500);
  };

  // Open exact HTML print view in new tab (sends all current client questions via print session)
  const handleOpenPrintView = async (autoprint: boolean = true) => {
    try {
      setIsGeneratingPdf(true);
      setPdfProgress(lang === 'el' ? 'Προετοιμασία εγγράφου...' : 'Preparing document...');
      setErrorMessage(null);

      const res = await fetch('/api/print-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          questions: validQuestions, // ALL current questions (e.g. 91)
          teams: gameState.teams,
          title: gameState.title,
          title_en: gameState.title_en,
          description: gameState.description,
          description_en: gameState.description_en,
          teamQuestionOrders: gameState.teamQuestionOrders
        })
      });

      if (!res.ok) throw new Error('Failed to create print session');
      const data = await res.json();
      const sessionId = data.sessionId;

      const printUrl = `/api/print-view?session=${sessionId}&answers=${includeAnswers}&status=${statusFilter}&lang=${printLang}&team=${teamFilter}${autoprint ? '&autoprint=1' : ''}`;
      
      const link = document.createElement('a');
      link.href = printUrl;
      link.target = '_blank';
      link.rel = 'noopener noreferrer';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (err: any) {
      console.warn('Print session failed, falling back to direct URL:', err);
      const fallbackUrl = `/api/print-view?answers=${includeAnswers}&status=${statusFilter}&lang=${printLang}&team=${teamFilter}${autoprint ? '&autoprint=1' : ''}`;
      const link = document.createElement('a');
      link.href = fallbackUrl;
      link.target = '_blank';
      link.rel = 'noopener noreferrer';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } finally {
      setIsGeneratingPdf(false);
      setPdfProgress('');
    }
  };

  // Direct Vector PDF Download (sends all current client questions via print session)
  const handleDownloadPdf = async () => {
    try {
      setIsGeneratingPdf(true);
      setErrorMessage(null);
      setDownloadSuccess(false);
      setPdfProgress(lang === 'el' ? 'Σύνθεση PDF (Και οι 91 αποστολές)...' : 'Generating PDF (All quests)...');

      const sessionRes = await fetch('/api/print-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          questions: validQuestions,
          teams: gameState.teams,
          title: gameState.title,
          title_en: gameState.title_en,
          description: gameState.description,
          description_en: gameState.description_en
        })
      });

      let sessionId: string | null = null;
      if (sessionRes.ok) {
        const sessionData = await sessionRes.json();
        sessionId = sessionData.sessionId;
      }

      const res = await fetch('/api/generate-pdf', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId: sessionId || undefined,
          questions: validQuestions,
          teams: gameState.teams,
          title: gameState.title,
          title_en: gameState.title_en,
          includeAnswers,
          printLang,
          includeExplanations,
          teamFilter,
          statusFilter
        })
      });

      if (!res.ok) {
        throw new Error(`Server returned status ${res.status}`);
      }

      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const dateStr = new Date().toISOString().slice(0, 10);
      const fileName = includeAnswers
        ? `BoundPad-Vulture-Arena-${totalQuestsCount}-Apostoles-Lyseis-${dateStr}.pdf`
        : `BoundPad-Vulture-Arena-${totalQuestsCount}-Apostoles-Fyllo-Mathiti-${dateStr}.pdf`;

      setLastDownloadUrl(url);
      setLastDownloadName(fileName);

      const link = document.createElement('a');
      link.href = url;
      link.download = fileName;
      link.setAttribute('download', fileName);
      document.body.appendChild(link);
      link.click();
      setTimeout(() => {
        document.body.removeChild(link);
      }, 500);

      setDownloadSuccess(true);
      setPdfProgress(lang === 'el' ? 'Το αρχείο PDF κατέβηκε!' : 'PDF downloaded!');
    } catch (err: any) {
      console.warn('PDF generation failed:', err);
      setErrorMessage(
        lang === 'el'
          ? 'Αποτυχία άμεσης λήψης PDF. Χρησιμοποιήστε το κουμπί «Αποθήκευση ως PDF» για άμεση εξαγωγή μέσω του περιηγητή.'
          : 'Direct PDF download failed. Please use "Save as PDF" button.'
      );
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  // Download standalone offline HTML file
  const handleDownloadHtml = () => {
    const element = document.getElementById('printable-quest-document');
    if (!element) return;

    const htmlContent = `<!DOCTYPE html>
<html lang="${lang}">
<head>
  <meta charset="UTF-8">
  <title>${gameState.title} - ${includeAnswers ? 'Λύσεις & Απαντήσεις' : 'Φύλλο Εργασίας'}</title>
  <script src="https://cdn.jsdelivr.net/npm/@tailwindcss/browser@4"></script>
  <style>
    body { font-family: system-ui, -apple-system, sans-serif; background: #f8fafc; padding: 20px; }
    @media print {
      body { background: #ffffff; padding: 0; }
      .page-break-avoid { break-inside: avoid; page-break-inside: avoid; }
    }
  </style>
</head>
<body>
  <div style="max-width: 900px; margin: 0 auto; background: #ffffff; padding: 30px; border-radius: 12px; box-shadow: 0 4px 20px rgba(0,0,0,0.08);">
    ${element.innerHTML}
  </div>
</body>
</html>`;

    const blob = new Blob([htmlContent], { type: 'text/html;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `BoundPad-Vulture-Arena-${totalQuestsCount}-Apostoles-${new Date().toISOString().slice(0, 10)}.html`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

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
      research: 'Research & Inquiry'
    };
    return language === 'en' ? mapEn[type] || type : mapEl[type] || type;
  };

  const getTeamNames = (assignedIds?: string[]) => {
    if (!assignedIds || assignedIds.length === 0 || assignedIds.length === gameState.teams.length) {
      return lang === 'el' ? 'Κοινή για όλες τις ομάδες' : 'Shared across all teams';
    }
    return assignedIds
      .map((id) => {
        const tm = gameState.teams.find((t) => t.id === id);
        return tm ? tm.name.split(':')[0] : id;
      })
      .join(', ');
  };

  // Lightweight Question Card Renderer (Uses lazy images and crisp vector QR badges to ensure zero memory bloat)
  const renderCard = (quest: Question, indexOnPage: number) => {
    const globalIdx = startIndex + indexOnPage + 1;
    const isQuestActive = quest.isActive !== false;
    const assignedTeamsText = getTeamNames(quest.assignedTeamIds);

    const titleText = printLang === 'en'
      ? (quest.title_en || quest.title)
      : quest.title;
    const titleSecondary = printLang === 'both' && quest.title_en ? quest.title_en : null;

    const descText = printLang === 'en'
      ? (quest.description_en || quest.description)
      : quest.description;
    const descSecondary = printLang === 'both' && quest.description_en ? quest.description_en : null;

    const explanationText = printLang === 'en'
      ? (quest.explanation_en || quest.explanation)
      : quest.explanation;

    return (
      <div
        key={quest.id}
        className={`p-4 sm:p-5 rounded-2xl border transition-all space-y-3 ${
          isQuestActive
            ? 'border-slate-300 bg-slate-50/90 shadow-xs'
            : 'border-slate-200 bg-slate-100/70 opacity-90'
        }`}
      >
        {/* Quest Item Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2.5 border-b border-slate-200">
          <div className="flex items-center gap-2.5 flex-wrap">
            <span className={`w-7 h-7 rounded-lg ${isQuestActive ? 'bg-slate-900 text-white' : 'bg-slate-500 text-white'} font-mono font-black text-xs flex items-center justify-center shrink-0`}>
              #{globalIdx}
            </span>
            <h4 className="font-bold text-sm text-slate-900 leading-snug">
              {titleText}
            </h4>
            {titleSecondary && (
              <span className="text-xs text-slate-500 italic block sm:inline">
                ({titleSecondary})
              </span>
            )}
          </div>

          <div className="flex items-center gap-1.5 flex-wrap text-xs shrink-0">
            <span className="font-semibold text-slate-700 px-2 py-0.5 rounded bg-slate-200 text-[11px]">
              {getTypeName(quest.type, printLang === 'en' ? 'en' : 'el')}
            </span>
            <span className={`font-mono font-bold text-[11px] px-2 py-0.5 rounded ${isQuestActive ? 'text-emerald-800 bg-emerald-100' : 'text-slate-600 bg-slate-200'}`}>
              {quest.points || 100} pts
            </span>
            {isQuestActive ? (
              <span className="px-2 py-0.5 rounded font-bold text-[10px] bg-emerald-100 text-emerald-800 border border-emerald-300">
                🟢 ΕΝΕΡΓΗ
              </span>
            ) : (
              <span className="px-2 py-0.5 rounded font-bold text-[10px] bg-slate-200 text-slate-700 border border-slate-300">
                💤 ΑΝΕΝΕΡΓΗ
              </span>
            )}
            <span className="text-[11px] text-slate-600 bg-slate-200/80 px-2 py-0.5 rounded font-medium" title={assignedTeamsText}>
              {assignedTeamsText}
            </span>
          </div>
        </div>

        {/* Optional Reference Illustration / Graphic */}
        {includeQrs && quest.imageUrl && (
          <div className="my-2 max-w-sm rounded-lg overflow-hidden border border-slate-300 shadow-xs">
            <img
              src={quest.imageUrl}
              alt={titleText}
              loading="lazy"
              className="w-full h-auto max-h-48 object-cover"
            />
          </div>
        )}

        {/* Description */}
        <p className="text-xs text-slate-700 leading-relaxed font-normal">
          {descText}
        </p>
        {descSecondary && (
          <p className="text-xs text-slate-500 italic leading-relaxed">
            {descSecondary}
          </p>
        )}

        {/* Payload Interactive Preview (Memory-Optimized) */}
        {/* 1. Multiple Choice */}
        {quest.type === 'multiple_choice' && (() => {
          const payload = (printLang === 'en' && quest.payload_en ? quest.payload_en : quest.payload) as MultipleChoicePayload;
          const correctIndices = getMultipleChoiceCorrectIndices(payload);

          return (
            <div className="space-y-1.5 pt-1">
              {(payload.options || []).map((opt, optIdx) => {
                const isCorrect = correctIndices.includes(optIdx);
                if (includeAnswers && isCorrect) {
                  return (
                    <div
                      key={optIdx}
                      className="text-xs p-2.5 rounded-lg flex items-start gap-2.5 bg-emerald-100 text-emerald-950 font-bold border-2 border-emerald-500 shadow-xs"
                    >
                      <span className="font-mono text-xs shrink-0 font-bold text-emerald-800">
                        [✓] {String.fromCharCode(65 + optIdx)}.
                      </span>
                      <span className="flex-1">{opt}</span>
                      <span className="ml-auto text-[10px] font-black tracking-wider uppercase text-emerald-950 bg-emerald-200 px-2 py-0.5 rounded shrink-0">
                        ✓ ΟΡΘΗ ΑΠΑΝΤΗΣΗ
                      </span>
                    </div>
                  );
                } else {
                  return (
                    <div
                      key={optIdx}
                      className="text-xs p-2 rounded-lg flex items-start gap-2.5 text-slate-800 bg-white border border-slate-300"
                    >
                      <span className="font-mono text-xs shrink-0 font-bold text-slate-500">
                        [  ] {String.fromCharCode(65 + optIdx)}.
                      </span>
                      <span className="flex-1">{opt}</span>
                    </div>
                  );
                }
              })}
            </div>
          );
        })()}

        {/* 2. True / False */}
        {quest.type === 'true_false' && (() => {
          const payload = quest.payload as TrueFalsePayload;
          const isTrue = payload.correctValue === true;
          return (
            <div className="flex items-center gap-3 pt-1">
              <div className={`px-4 py-2 rounded-lg text-xs font-bold border ${
                includeAnswers && isTrue
                  ? 'bg-emerald-100 border-emerald-500 text-emerald-950 ring-2 ring-emerald-500/30'
                  : 'bg-white border-slate-300 text-slate-700'
              }`}>
                {includeAnswers && isTrue ? '✓ ΣΩΣΤΟ (Ορθή Απάντηση)' : '[  ] ΣΩΣΤΟ'}
              </div>
              <div className={`px-4 py-2 rounded-lg text-xs font-bold border ${
                includeAnswers && !isTrue
                  ? 'bg-emerald-100 border-emerald-500 text-emerald-950 ring-2 ring-emerald-500/30'
                  : 'bg-white border-slate-300 text-slate-700'
              }`}>
                {includeAnswers && !isTrue ? '✓ ΛΑΘΟΣ (Ορθή Απάντηση)' : '[  ] ΛΑΘΟΣ'}
              </div>
            </div>
          );
        })()}

        {/* 3. Text Match */}
        {quest.type === 'text_match' && (() => {
          const payload = (printLang === 'en' && quest.payload_en ? quest.payload_en : quest.payload) as TextMatchPayload;
          return (
            <div className="space-y-1.5 pt-1">
              <div className="text-[11px] font-bold text-slate-600 uppercase">
                {includeAnswers ? 'Σωστά Ζεύγη Αντιστοίχισης:' : 'Ζητούμενα Αντιστοίχισης:'}
              </div>
              {Array.isArray(payload.pairs) && payload.pairs.map((p, pIdx) => (
                <div key={p.id || pIdx} className="text-xs p-2 rounded-lg bg-white border border-slate-300 flex items-center justify-between gap-3">
                  <span className="font-semibold text-slate-800">{p.left}</span>
                  <span className="text-slate-400 font-bold">➔</span>
                  <span className={`font-bold ${includeAnswers ? 'text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded' : 'text-slate-700'}`}>
                    {includeAnswers ? p.right : '___________'}
                  </span>
                </div>
              ))}
            </div>
          );
        })()}

        {/* 4. Image Match */}
        {quest.type === 'image_match' && (() => {
          const payload = (printLang === 'en' && quest.payload_en ? quest.payload_en : quest.payload) as ImageMatchPayload;
          return (
            <div className="space-y-2 pt-1">
              <div className="text-[11px] font-bold text-slate-600 uppercase">
                {includeAnswers ? 'Αναγνώριση & Ταυτοποίηση Εικόνων:' : 'Εικόνες προς Ταυτοποίηση:'}
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {Array.isArray(payload.pairs) && payload.pairs.map((pair, pIdx) => (
                  <div key={pair.id || pIdx} className="p-2.5 rounded-xl border border-slate-300 bg-white flex items-center gap-3">
                    {includeQrs && pair.image && (
                      <img
                        src={pair.image}
                        alt="Silhouette"
                        loading="lazy"
                        className="w-16 h-12 object-cover rounded-lg border border-slate-200 shrink-0"
                      />
                    )}
                    <div className="min-w-0 flex-1">
                      <div className="text-[10px] text-slate-500 font-mono">Εικόνα #{pIdx + 1}</div>
                      <div className={`text-xs font-bold leading-snug ${includeAnswers ? 'text-emerald-900 bg-emerald-50/80 p-1 rounded' : 'text-slate-700'}`}>
                        {includeAnswers ? `✓ ${pair.text}` : '______________________'}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })()}

        {/* 5. QR Scan Station (Ultra-Lightweight vector representation, ZERO memory overhead) */}
        {quest.type === 'qr_scan' && (() => {
          const payload = quest.payload as QrScanPayload;
          return (
            <div className="pt-1 flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 rounded-xl bg-purple-50/80 border border-purple-200">
              <div className="space-y-1">
                <div className="text-xs font-bold text-purple-900 flex items-center gap-1.5">
                  <QrCode className="w-4 h-4 text-purple-700" />
                  <span>Κωδικός Σταθμού QR (Target Code):</span>
                </div>
                <div className="font-mono text-sm font-black text-purple-950 bg-white px-3 py-1 rounded-lg border border-purple-300 inline-block shadow-xs">
                  {payload.targetCode || 'VULTURE-STATION'}
                </div>
                {payload.locationHint && (
                  <div className="text-[11px] text-slate-600 font-medium">
                    📍 Τοποθεσία / Υπόδειξη: {payload.locationHint}
                  </div>
                )}
                {includeAnswers && payload.unlockedMedia && (
                  <div className="text-[11px] text-purple-800">
                    🔓 Ξεκλειδώνει περιεχόμενο: <strong>{payload.unlockedMedia.title || payload.unlockedMedia.type}</strong>
                  </div>
                )}
              </div>

              <div className="bg-white p-2.5 rounded-xl border border-purple-300 shadow-xs shrink-0 self-start sm:self-auto text-center flex flex-col items-center">
                <div className="w-14 h-14 bg-purple-100 rounded-lg flex items-center justify-center text-purple-900 border border-purple-300">
                  <QrCode className="w-8 h-8 text-purple-800" />
                </div>
                <div className="text-[9px] font-mono text-purple-900 font-bold mt-1">
                  {payload.targetCode}
                </div>
              </div>
            </div>
          );
        })()}

        {/* 6. Field Task / Checklist */}
        {quest.type === 'task' && (() => {
          const payload = (printLang === 'en' && quest.payload_en ? quest.payload_en : quest.payload) as TaskPayload;
          return (
            <div className="pt-1 pl-1 space-y-2">
              {payload.instructions && (
                <div className="text-xs text-slate-800 font-medium bg-amber-50/80 p-2.5 rounded-lg border border-amber-200">
                  📋 <strong>Οδηγίες Δράσης:</strong> {payload.instructions}
                </div>
              )}
              {Array.isArray(payload.checklist) && payload.checklist.length > 0 && (
                <div className="space-y-1">
                  <div className="text-[11px] font-bold text-slate-700 uppercase">Λίστα Ελέγχου / Checkpoints:</div>
                  {payload.checklist.map((item, idx) => (
                    <div key={idx} className="text-xs flex items-start gap-2 text-slate-800">
                      <span className="font-mono text-slate-500 font-bold">[ ]</span>
                      <span>{item}</span>
                    </div>
                  ))}
                </div>
              )}
              {includeAnswers && payload.completionPrompt && (
                <div className="text-[11px] text-slate-600 italic">
                  📝 Ζητούμενο τελικής αναφοράς: {payload.completionPrompt}
                </div>
              )}
            </div>
          );
        })()}

        {/* 7. Puzzle */}
        {quest.type === 'puzzle' && (() => {
          const payload = quest.payload as PuzzlePayload;
          return (
            <div className="pt-1 pl-1 text-xs text-slate-700 flex items-center gap-3 bg-sky-50 p-2.5 rounded-lg border border-sky-200">
              {includeQrs && payload.imageUrl && (
                <img
                  src={payload.imageUrl}
                  alt="Puzzle preview"
                  loading="lazy"
                  className="w-16 h-12 object-cover rounded border border-sky-300"
                />
              )}
              <div>
                <div>🧩 <strong>Διαδραστικό Παζλ:</strong> Σύνθεση {payload.gridPieces || 9} κομματιών για την αναπαράσταση της σκηνής.</div>
                {includeAnswers && (
                  <div className="text-emerald-800 font-bold text-[11px] mt-0.5">
                    ✓ Ολοκληρώνεται με ορθή τοποθέτηση όλων των τμημάτων στο ταμπλό.
                  </div>
                )}
              </div>
            </div>
          );
        })()}

        {/* 8. Research */}
        {quest.type === 'research' && (() => {
          const payload = (printLang === 'en' && quest.payload_en ? quest.payload_en : quest.payload) as ResearchPayload;
          return (
            <div className="pt-1 pl-1 space-y-2">
              {payload.researchTopic && (
                <div className="text-xs font-bold text-teal-900 bg-teal-50 p-2.5 rounded-lg border border-teal-200">
                  🔬 <strong>Θέμα Έρευνας:</strong> {payload.researchTopic}
                </div>
              )}
              {payload.instructions && (
                <div className="text-xs text-slate-700">
                  📋 {payload.instructions}
                </div>
              )}
              {Array.isArray(payload.guidingQuestions) && payload.guidingQuestions.length > 0 && (
                <div className="space-y-1 bg-slate-50 p-2 rounded border border-slate-200">
                  <div className="text-[10px] font-bold text-slate-600 uppercase">Ερευνητικά Ερωτήματα προς Απάντηση:</div>
                  {payload.guidingQuestions.map((gq, idx) => (
                    <div key={idx} className="flex items-start gap-1.5 text-[11px]">
                      <span className="font-mono text-slate-500 font-bold">•</span>
                      <span>{gq}</span>
                    </div>
                  ))}
                </div>
              )}
              {Array.isArray(payload.suggestedSources) && payload.suggestedSources.length > 0 && (
                <div className="text-[10px] text-slate-600">
                  🔗 <strong>Πηγές:</strong> {payload.suggestedSources.map(s => s.title || s.url).join(' · ')}
                </div>
              )}
            </div>
          );
        })()}

        {/* Educational Note / Solution Explanation */}
        {includeAnswers && includeExplanations && explanationText && (
          <div className="mt-2.5 p-3 rounded-lg bg-amber-50/90 border border-amber-300 text-xs text-amber-950 flex items-start gap-2.5">
            <span className="text-base shrink-0">💡</span>
            <div>
              <span className="font-bold block text-[11px] text-amber-900 uppercase tracking-wide">
                Επιστημονική Επεξήγηση / Ορνιθολογικό Σημείωμα:
              </span>
              <span className="leading-relaxed font-normal">{explanationText}</span>
            </div>
          </div>
        )}
      </div>
    );
  };

  // Reusable Pagination Bar Component (renders top and bottom)
  const renderPaginationControls = () => {
    return (
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-3 rounded-xl bg-slate-900/90 border border-slate-700 text-xs">
        {/* Left: Summary Count */}
        <div className="flex items-center gap-2 text-slate-300 font-medium">
          <span className="font-mono text-emerald-400 font-bold">
            Εμφάνιση {totalFilteredCount > 0 ? startIndex + 1 : 0}-{endIndex} από {totalFilteredCount}
          </span>
          <span className="text-slate-500">|</span>
          <span className="text-slate-400">
            (Σύνολο: {totalQuestsCount} αποστολές)
          </span>
        </div>

        {/* Center: Pagination Buttons */}
        <div className="flex items-center gap-1.5 flex-wrap">
          <button
            type="button"
            onClick={() => setCurrentPage(1)}
            disabled={safeCurrentPage <= 1}
            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer transition-colors"
            title="Πρώτη σελίδα"
          >
            <ChevronsLeft className="w-4 h-4" />
          </button>

          <button
            type="button"
            onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
            disabled={safeCurrentPage <= 1}
            className="px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer transition-colors flex items-center gap-1"
          >
            <ChevronLeft className="w-4 h-4" />
            <span className="hidden sm:inline">Προηγούμενη</span>
          </button>

          {/* Quick page numbers */}
          <div className="flex items-center gap-1 px-1">
            {Array.from({ length: totalPages }).map((_, idx) => {
              const pageNum = idx + 1;
              // Show window around current page
              if (
                pageNum === 1 ||
                pageNum === totalPages ||
                (pageNum >= safeCurrentPage - 2 && pageNum <= safeCurrentPage + 2)
              ) {
                return (
                  <button
                    key={pageNum}
                    type="button"
                    onClick={() => setCurrentPage(pageNum)}
                    className={`w-7 h-7 rounded-lg text-xs font-mono font-bold transition-all cursor-pointer ${
                      pageNum === safeCurrentPage
                        ? 'bg-emerald-500 text-slate-950 shadow-sm shadow-emerald-500/30'
                        : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                    }`}
                  >
                    {pageNum}
                  </button>
                );
              } else if (
                (pageNum === safeCurrentPage - 3 && pageNum > 1) ||
                (pageNum === safeCurrentPage + 3 && pageNum < totalPages)
              ) {
                return <span key={pageNum} className="text-slate-500 text-xs px-0.5">...</span>;
              }
              return null;
            })}
          </div>

          <button
            type="button"
            onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
            disabled={safeCurrentPage >= totalPages}
            className="px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer transition-colors flex items-center gap-1"
          >
            <span className="hidden sm:inline">Επόμενη</span>
            <ChevronRight className="w-4 h-4" />
          </button>

          <button
            type="button"
            onClick={() => setCurrentPage(totalPages)}
            disabled={safeCurrentPage >= totalPages}
            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer transition-colors"
            title="Τελευταία σελίδα"
          >
            <ChevronsRight className="w-4 h-4" />
          </button>
        </div>

        {/* Right: Page Size selector */}
        <div className="flex items-center gap-1.5 text-slate-400 font-medium">
          <span className="text-[11px]">Ανά σελίδα:</span>
          <select
            value={pageSize}
            onChange={(e) => setPageSize(Number(e.target.value))}
            className="bg-slate-800 text-emerald-400 font-bold px-2 py-1 rounded-lg border border-slate-700 focus:outline-none cursor-pointer text-xs"
          >
            <option value={6}>6</option>
            <option value={8}>8 (Βέλτιστο)</option>
            <option value={10}>10</option>
            <option value={12}>12</option>
          </select>
        </div>
      </div>
    );
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-2 sm:p-4 animate-fadeIn">
      <div className="bg-slate-900 border border-slate-700/80 rounded-3xl w-full max-w-5xl shadow-2xl flex flex-col max-h-[96vh] overflow-hidden">
        {/* Header Bar with Export Controls */}
        <div className="p-4 sm:p-5 border-b border-slate-800 bg-slate-900/95 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400">
              <Printer className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-black text-slate-100 flex items-center gap-2 flex-wrap">
                <span>{lang === 'el' ? 'Εκτύπωση & Αποθήκευση σε PDF' : 'Print & Save as PDF'}</span>
                <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 font-mono font-bold">
                  {totalQuestsCount} {lang === 'el' ? 'Αποστολές' : 'Quests'}
                </span>
                <span className="text-xs text-slate-400 font-normal">
                  ({totalActiveCount} 🟢 · {totalInactiveCount} 💤)
                </span>
              </h2>
              <p className="text-xs text-slate-400 mt-0.5 flex items-center gap-1.5 flex-wrap">
                <span className="text-emerald-400 font-bold">⚡ Ενεργή Σελιδοποίηση (8 ανά σελίδα):</span>
                <span>Μηδενικό φορτίο μνήμης. Όλες οι 91 αποστολές εξάγονται πλήρως μέσω του server.</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            {/* Primary Action: Direct Pixel-Perfect PDF Export (opens exact HTML preview with automatic Print-to-PDF) */}
            <button
              type="button"
              onClick={() => handleOpenPrintView(true)}
              disabled={isGeneratingPdf}
              className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-black text-xs flex items-center gap-2 shadow-lg shadow-emerald-500/25 cursor-pointer transition-all active:scale-95 disabled:opacity-50"
              title={lang === 'el' ? 'Εξάγει και τις 91 αποστολές χωρισμένες ανά ομάδα (ενεργές/ανενεργές) για άμεση αποθήκευση σε PDF' : 'Save all quests to PDF grouped by team'}
            >
              <Printer className="w-4 h-4 text-slate-950" />
              <span>{lang === 'el' ? `🖨️ Αποθήκευση ως PDF (${totalQuestsCount})` : `🖨️ Save as PDF (${totalQuestsCount})`}</span>
            </button>

            {/* Direct Vector PDF Download File Button */}
            <button
              type="button"
              onClick={handleDownloadPdf}
              disabled={isGeneratingPdf}
              className="px-3.5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-emerald-300 border border-emerald-500/40 font-bold text-xs flex items-center gap-2 cursor-pointer transition-all active:scale-95 disabled:opacity-50"
              title={lang === 'el' ? `Άμεση λήψη αρχείου PDF (.pdf) με όλες τις ${totalQuestsCount} αποστολές` : 'Download direct PDF file (.pdf)'}
            >
              {isGeneratingPdf ? (
                <Loader2 className="w-4 h-4 animate-spin text-emerald-400" />
              ) : (
                <Download className="w-4 h-4 text-emerald-400" />
              )}
              <span>
                {isGeneratingPdf
                  ? (pdfProgress || (lang === 'el' ? 'Δημιουργία PDF...' : 'Generating PDF...'))
                  : (lang === 'el' ? `📥 Λήψη .pdf (${totalQuestsCount})` : `📥 Download .pdf (${totalQuestsCount})`)}
              </span>
            </button>

            {/* Open Full Preview in New Tab */}
            <button
              type="button"
              onClick={() => handleOpenPrintView(false)}
              disabled={isGeneratingPdf}
              className="px-3 py-2.5 rounded-xl bg-teal-500/15 hover:bg-teal-500/25 text-teal-300 border border-teal-500/40 hover:border-teal-500/70 font-bold text-xs flex items-center gap-1.5 transition-all shadow-xs cursor-pointer"
              title={lang === 'el' ? 'Πλήρης προβολή όλων των αποστολών σε νέα καρτέλα' : 'Open full view in new tab'}
            >
              <Eye className="w-3.5 h-3.5 text-teal-300" />
              <span>{lang === 'el' ? '👁️ Πλήρης Προβολή' : '👁️ Full View'}</span>
            </button>

            {/* Quick print of currently displayed items */}
            <button
              type="button"
              onClick={handleTriggerPrint}
              className="px-3 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 hover:border-slate-600 font-bold text-xs flex items-center gap-1.5 cursor-pointer transition-all active:scale-95"
              title="Εκτύπωση των αποστολών της τρέχουσας σελίδας"
            >
              <Printer className="w-3.5 h-3.5 text-slate-300" />
              <span>{lang === 'el' ? `Σελίδα (${displayedQuestions.length})` : `Page (${displayedQuestions.length})`}</span>
            </button>

            {/* Standalone HTML File Button */}
            <button
              type="button"
              onClick={handleDownloadHtml}
              className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 transition-colors cursor-pointer"
              title={lang === 'el' ? 'Λήψη Αυτόνομου Αρχείου HTML' : 'Download Standalone HTML'}
            >
              <Code2 className="w-4 h-4" />
            </button>

            {/* Close Button */}
            <button
              type="button"
              onClick={onClose}
              className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Success Notice Banner */}
        {downloadSuccess && (
          <div className="mx-4 sm:mx-6 my-2 p-3 rounded-2xl bg-emerald-500/15 border border-emerald-500/40 text-emerald-300 flex items-center justify-between gap-3 text-xs flex-wrap animate-fadeIn">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span className="font-semibold">
                {lang === 'el'
                  ? `✓ Το αρχείο PDF με όλες τις ${totalQuestsCount} αποστολές κατέβηκε στον υπολογιστή σας!`
                  : `✓ PDF file with all ${totalQuestsCount} quests downloaded!`}
              </span>
            </div>
            {lastDownloadUrl && (
              <div className="flex items-center gap-2 shrink-0">
                <a
                  href={lastDownloadUrl}
                  download={lastDownloadName}
                  className="px-3 py-1 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs transition-all shadow-xs"
                >
                  {lang === 'el' ? 'Λήψη Ξανά' : 'Download Again'}
                </a>
              </div>
            )}
          </div>
        )}

        {errorMessage && (
          <div className="mx-4 sm:mx-6 my-2 p-3 rounded-2xl bg-rose-500/15 border border-rose-500/40 text-rose-300 flex items-center justify-between gap-3 text-xs flex-wrap animate-fadeIn">
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Option Filters & Team Tabs Bar */}
        <div className="px-5 py-3 border-b border-slate-800 bg-slate-950/70 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-3 flex-wrap">
            {/* Toggle answers */}
            <label className="flex items-center gap-2 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={includeAnswers}
                onChange={(e) => setIncludeAnswers(e.target.checked)}
                className="w-4 h-4 rounded text-emerald-600 bg-slate-800 border-slate-700 focus:ring-emerald-500 cursor-pointer"
              />
              <span className={`font-bold ${includeAnswers ? 'text-emerald-400' : 'text-slate-400'}`}>
                {includeAnswers
                  ? (lang === 'el' ? '✓ Με Λύσεις (Οδηγός Εκπαιδευτικού)' : '✓ With Answers')
                  : (lang === 'el' ? 'Χωρίς Λύσεις (Φύλλο Μαθητή)' : 'Without Answers')}
              </span>
            </label>

            {/* Status Filter: All / Active / Inactive */}
            <div className="flex items-center gap-1 bg-slate-900 px-2 py-0.5 rounded-xl border border-slate-700">
              <span className="text-slate-400 text-[11px] font-medium mr-1">Κατάσταση:</span>
              <button
                type="button"
                onClick={() => setStatusFilter('all')}
                className={`px-2 py-0.5 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                  statusFilter === 'all' ? 'bg-emerald-600 text-white' : 'text-slate-400 hover:text-white'
                }`}
              >
                Όλες ({totalQuestsCount})
              </button>
              <button
                type="button"
                onClick={() => setStatusFilter('active_only')}
                className={`px-2 py-0.5 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                  statusFilter === 'active_only' ? 'bg-emerald-600 text-white' : 'text-slate-400 hover:text-white'
                }`}
              >
                🟢 Ενεργές ({totalActiveCount})
              </button>
              <button
                type="button"
                onClick={() => setStatusFilter('inactive_only')}
                className={`px-2 py-0.5 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                  statusFilter === 'inactive_only' ? 'bg-slate-700 text-white' : 'text-slate-400 hover:text-white'
                }`}
              >
                💤 Ανενεργές ({totalInactiveCount})
              </button>
            </div>

            {/* Language filter */}
            <div className="flex items-center gap-1.5 bg-slate-900 px-2.5 py-1 rounded-xl border border-slate-700">
              <span className="text-slate-400 text-[11px] font-medium">Γλώσσα:</span>
              <select
                value={printLang}
                onChange={(e) => setPrintLang(e.target.value as any)}
                className="bg-transparent text-slate-200 font-bold focus:outline-none cursor-pointer text-xs"
              >
                <option value="el" className="bg-slate-900">🇬🇷 Ελληνικά</option>
                <option value="en" className="bg-slate-900">🇬🇧 English</option>
                <option value="both" className="bg-slate-900">🌐 Δίγλωσσο</option>
              </select>
            </div>
          </div>

          <div className="text-[11px] text-slate-400 font-mono font-semibold">
            {totalFilteredCount} αποστολές στο φίλτρο
          </div>
        </div>

        {/* Team Quick Selection Tabs (Group by team) */}
        <div className="px-5 py-2.5 border-b border-slate-800 bg-slate-900 flex items-center gap-2 overflow-x-auto text-xs scrollbar-thin">
          <span className="text-slate-400 text-[11px] font-semibold shrink-0">Ομάδα:</span>
          <button
            type="button"
            onClick={() => setTeamFilter('all')}
            className={`px-3 py-1.5 rounded-xl font-bold whitespace-nowrap transition-all cursor-pointer ${
              teamFilter === 'all'
                ? 'bg-emerald-500 text-slate-950 shadow-sm'
                : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
            }`}
          >
            Όλες οι Ομάδες ({totalQuestsCount})
          </button>
          {gameState.teams.map((tm) => {
            const teamTotal = validQuestions.filter(q => {
              return Array.isArray(q.assignedTeamIds) && q.assignedTeamIds.length > 0
                ? q.assignedTeamIds.includes(tm.id)
                : ((q as any).teamId ? (q as any).teamId === tm.id : true);
            }).length;

            return (
              <button
                key={tm.id}
                type="button"
                onClick={() => setTeamFilter(tm.id)}
                className={`px-3 py-1.5 rounded-xl font-bold whitespace-nowrap transition-all flex items-center gap-1.5 cursor-pointer ${
                  teamFilter === tm.id
                    ? 'bg-emerald-500 text-slate-950 shadow-sm'
                    : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                }`}
              >
                <span>{tm.avatar || '🦅'}</span>
                <span>{tm.name}</span>
                <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
                  teamFilter === tm.id ? 'bg-slate-950/20 text-slate-950' : 'bg-slate-900 text-slate-400'
                }`}>
                  {teamTotal}
                </span>
              </button>
            );
          })}
        </div>

        {/* Top Pagination Control Bar */}
        <div className="px-5 py-2.5 border-b border-slate-800/80 bg-slate-950/40">
          {renderPaginationControls()}
        </div>

        {/* Printable Document Preview Area (Renders strictly ONLY the 8-10 items of currentPage) */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 bg-slate-950/60">
          <div
            id="printable-quest-document"
            className="max-w-4xl mx-auto bg-white text-slate-900 p-6 sm:p-10 rounded-2xl shadow-xl print:shadow-none print:p-0 print:m-0 print:rounded-none"
          >
            {/* Document Header */}
            <div className="border-b-2 border-slate-900 pb-5 mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-3">
                  <span className="text-4xl">🦅</span>
                  <div>
                    <h1 className="text-xl sm:text-2xl font-black text-slate-950 tracking-tight leading-tight">
                      {printLang === 'en' ? (gameState.title_en || gameState.title) : gameState.title}
                    </h1>
                    <div className="text-xs text-slate-600 font-semibold mt-0.5">
                      Οι 4 Γύπες της Ελλάδας: Όρνιο, Γυπαετός, Μαυρόγυπας, Ασπροπάρης
                    </div>
                  </div>
                </div>
                <div className="mt-3 flex items-center gap-2 flex-wrap">
                  <span className={`text-xs font-bold uppercase tracking-wider px-2.5 py-1 rounded ${includeAnswers ? 'bg-emerald-800 text-white' : 'bg-slate-900 text-white'}`}>
                    {includeAnswers
                      ? (printLang === 'en' ? 'Teacher Guide & Complete Solutions' : 'Οδηγός Εκπαιδευτικού & Πλήρεις Λύσεις Αποστολών')
                      : (printLang === 'en' ? 'Student Field Activity Sheet' : 'Φύλλο Δραστηριοτήτων & Αποστολών Ομάδων')}
                  </span>
                  <span className="text-xs font-bold text-slate-700 bg-slate-100 px-2.5 py-1 rounded border border-slate-300">
                    Σύνολο Αποστολών: {totalQuestsCount} ({totalActiveCount} 🟢 · {totalInactiveCount} 💤)
                  </span>
                  <span className="text-xs font-bold text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded border border-emerald-300">
                    Σελίδα {safeCurrentPage} από {totalPages}
                  </span>
                </div>
                <p className="text-xs text-slate-600 mt-2 max-w-2xl leading-relaxed">
                  {printLang === 'en' ? (gameState.description_en || gameState.description) : gameState.description}
                </p>
              </div>

              <div className="text-left sm:text-right text-xs text-slate-500 shrink-0 border-t sm:border-t-0 pt-2 sm:pt-0 border-slate-200">
                <div className="font-black text-slate-900 text-sm">BoundPad Vulture Arena</div>
                <div>{new Date().toLocaleDateString(printLang === 'en' ? 'en-US' : 'el-GR', { year: 'numeric', month: 'long', day: 'numeric' })}</div>
                <div className="font-mono text-[11px] text-slate-500 mt-0.5">
                  {teamFilter === 'all'
                    ? (printLang === 'en' ? 'All Teams' : 'Όλες οι Ομάδες')
                    : (gameState.teams.find(t => t.id === teamFilter)?.name || teamFilter)}
                </div>
              </div>
            </div>

            {/* Questions List (Strictly renders the current page's questions) */}
            {displayedQuestions.length === 0 ? (
              <div className="p-12 text-center text-slate-500 bg-slate-50 rounded-2xl border border-dashed border-slate-300 my-6">
                <p className="text-sm font-bold text-slate-700">Δεν βρέθηκαν αποστολές για τα επιλεγμένα κριτήρια.</p>
                <p className="text-xs text-slate-500 mt-1">Δοκιμάστε να αλλάξετε την επιλεγμένη ομάδα ή την κατάσταση (ενεργές/ανενεργές).</p>
              </div>
            ) : (
              <div className="space-y-4">
                {displayedQuestions.map((quest, idx) => renderCard(quest, idx))}
              </div>
            )}
          </div>
        </div>

        {/* Bottom Pagination Control Bar */}
        <div className="px-5 py-3 border-t border-slate-800 bg-slate-950/95">
          {renderPaginationControls()}
        </div>
      </div>
    </div>
  );
};

export default PrintPdfModal;
