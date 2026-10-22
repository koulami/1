import React, { useState } from 'react';
import {
  Printer, Download, CheckCircle2, Eye,
  FileText, Check, Layers, Users, Sparkles, Filter, X, Loader2, Code2
} from 'lucide-react';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import {
  GameState, Language, Question, QuestionType,
  MultipleChoicePayload, TrueFalsePayload, TextMatchPayload,
  ImageMatchPayload, QrScanPayload, TaskPayload, PuzzlePayload,
  PhotoUploadPayload, ResearchPayload, getMultipleChoiceCorrectIndices
} from '../types/game';
import { ScannableQrImage } from './ScannableQrImage';

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
  const [printLang, setPrintLang] = useState<'el' | 'en' | 'both'>('el');
  const [includeQrs, setIncludeQrs] = useState<boolean>(true);
  const [includeExplanations, setIncludeExplanations] = useState<boolean>(true);
  const [isGeneratingPdf, setIsGeneratingPdf] = useState<boolean>(false);
  const [pdfProgress, setPdfProgress] = useState<string>('');
  const [lastDownloadUrl, setLastDownloadUrl] = useState<string | null>(null);
  const [lastDownloadName, setLastDownloadName] = useState<string>('');
  const [downloadSuccess, setDownloadSuccess] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  // Filter questions according to team filter
  const filteredQuestions = gameState.questions.filter((q) => {
    if (teamFilter === 'all') return true;
    if (!q.assignedTeamIds || q.assignedTeamIds.length === 0) return true;
    return q.assignedTeamIds.includes(teamFilter);
  });

  const totalPoints = filteredQuestions.reduce((sum, q) => sum + (q.points || 0), 0);

  // Trigger native browser print
  const handleTriggerPrint = () => {
    document.body.classList.add('printing-quest-document');
    window.print();
    setTimeout(() => {
      document.body.classList.remove('printing-quest-document');
    }, 1500);
  };

  // Direct PDF generation and download via backend vector PDF generator
  const handleDownloadPdf = async () => {
    setIsGeneratingPdf(true);
    setPdfProgress(lang === 'el' ? 'Δημιουργία αρχείου PDF...' : 'Generating PDF file...');
    setErrorMessage(null);
    setDownloadSuccess(false);

    const dateStr = new Date().toISOString().slice(0, 10);
    const fileName = includeAnswers
      ? `BoundPad-Vulture-Arena-61-Apostoles-Lyseis-${dateStr}.pdf`
      : `BoundPad-Vulture-Arena-61-Apostoles-Fyllo-Mathiti-${dateStr}.pdf`;

    try {
      // 1. Send filtered questions and preferences to high-speed PDF generator
      const res = await fetch('/api/generate-pdf', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          questions: filteredQuestions,
          title: gameState.title,
          title_en: gameState.title_en,
          includeAnswers,
          printLang,
          includeExplanations,
          teamFilter,
          teams: gameState.teams
        })
      });

      if (!res.ok) {
        throw new Error(`Server returned HTTP ${res.status}`);
      }

      const blob = await res.blob();
      if (!blob || blob.size < 100) {
        throw new Error('Received invalid PDF payload');
      }

      const url = window.URL.createObjectURL(blob);
      setLastDownloadUrl(url);
      setLastDownloadName(fileName);

      // Trigger standard browser download
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
      console.warn('PDF POST generation failed, falling back to direct GET download:', err);
      try {
        const getUrl = `/api/generate-pdf?answers=${includeAnswers}&lang=${printLang}&team=${teamFilter}`;
        const fallbackLink = document.createElement('a');
        fallbackLink.href = getUrl;
        fallbackLink.download = fileName;
        fallbackLink.setAttribute('download', fileName);
        document.body.appendChild(fallbackLink);
        fallbackLink.click();
        setTimeout(() => {
          document.body.removeChild(fallbackLink);
        }, 500);

        setDownloadSuccess(true);
      } catch (fallbackErr: any) {
        setErrorMessage(
          lang === 'el'
            ? 'Η αυτόματη λήψη μπλοκαρίστηκε από τον περιηγητή. Πατήστε στον άμεσο σύνδεσμο παρακάτω.'
            : 'Download was blocked by the browser. Please use the direct link below.'
        );
      }
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
    link.download = `BoundPad-Vulture-Arena-${new Date().toISOString().slice(0, 10)}.html`;
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
              <h2 className="text-base sm:text-lg font-black text-slate-100 flex items-center gap-2">
                <span>{lang === 'el' ? 'Εκτύπωση & Αποθήκευση σε PDF' : 'Print & Save as PDF'}</span>
                <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 font-mono font-bold">
                  {filteredQuestions.length} {lang === 'el' ? 'Αποστολές Γυπών' : 'Vulture Quests'}
                </span>
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                {lang === 'el'
                  ? 'Κατεβάστε απευθείας αρχείο PDF (.pdf) ή εκτυπώστε όλες τις ερωτήσεις μαζί με τις πλήρεις απαντήσεις τους.'
                  : 'Download directly as PDF (.pdf) or print all questions with full answers and solutions.'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            {/* Primary Action: Direct Pixel-Perfect PDF Export (opens exact HTML preview with automatic Print-to-PDF) */}
            <a
              href={`/api/print-view?answers=${includeAnswers}&lang=${printLang}&team=${teamFilter}&autoprint=1`}
              target="_blank"
              rel="noopener noreferrer"
              className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-black text-xs flex items-center gap-2 shadow-lg shadow-emerald-500/25 cursor-pointer transition-all active:scale-95"
              title={lang === 'el' ? 'Ανοίγει σε νέα καρτέλα ακριβώς όπως φαίνεται στην προεπισκόπηση και ενεργοποιεί αυτόματα την αποθήκευση σε PDF' : 'Opens exactly as shown in preview and prompts Save to PDF'}
            >
              <Printer className="w-4 h-4 text-slate-950" />
              <span>{lang === 'el' ? '🖨️ Αποθήκευση ως PDF (Όπως η Προεπισκόπηση)' : '🖨️ Save as PDF (Exact Preview)'}</span>
            </a>

            {/* Direct Vector PDF Download File Button */}
            <button
              type="button"
              onClick={handleDownloadPdf}
              disabled={isGeneratingPdf}
              className="px-3.5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-emerald-300 border border-emerald-500/40 font-bold text-xs flex items-center gap-2 cursor-pointer transition-all active:scale-95 disabled:opacity-50"
              title={lang === 'el' ? 'Άμεση λήψη αρχείου PDF (.pdf) με όλες τις 61 αποστολές' : 'Download direct PDF file (.pdf) with all 61 quests'}
            >
              {isGeneratingPdf ? (
                <Loader2 className="w-4 h-4 animate-spin text-emerald-400" />
              ) : (
                <Download className="w-4 h-4 text-emerald-400" />
              )}
              <span>
                {isGeneratingPdf
                  ? (pdfProgress || (lang === 'el' ? 'Δημιουργία PDF...' : 'Generating PDF...'))
                  : (lang === 'el' ? '📥 Λήψη .pdf (61)' : '📥 Download .pdf (61)')}
              </span>
            </button>

            {/* Open Full Preview in New Tab */}
            <a
              href={`/api/print-view?answers=${includeAnswers}&lang=${printLang}&team=${teamFilter}`}
              target="_blank"
              rel="noopener noreferrer"
              className="px-3 py-2.5 rounded-xl bg-teal-500/15 hover:bg-teal-500/25 text-teal-300 border border-teal-500/40 hover:border-teal-500/70 font-bold text-xs flex items-center gap-1.5 transition-all shadow-xs"
              title={lang === 'el' ? 'Άνοιγμα της πλήρους σελίδας εκτύπωσης σε νέα καρτέλα' : 'Open full print page in new tab'}
            >
              <Eye className="w-3.5 h-3.5 text-teal-300" />
              <span>{lang === 'el' ? '👁️ Πλήρης Προβολή' : '👁️ Full View'}</span>
            </a>

            {/* Native Screen Print Button */}
            <button
              type="button"
              onClick={handleTriggerPrint}
              className="px-3 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 hover:border-slate-600 font-bold text-xs flex items-center gap-1.5 cursor-pointer transition-all active:scale-95"
              title={lang === 'el' ? 'Εκτύπωση στην οθόνη' : 'Print on screen'}
            >
              <Printer className="w-3.5 h-3.5 text-slate-300" />
              <span>{lang === 'el' ? 'Εκτύπωση' : 'Print'}</span>
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

        {/* Success or Error Notice Banner */}
        {downloadSuccess && (
          <div className="mx-4 sm:mx-6 my-2 p-3 rounded-2xl bg-emerald-500/15 border border-emerald-500/40 text-emerald-300 flex items-center justify-between gap-3 text-xs flex-wrap animate-fadeIn">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span className="font-semibold">
                {lang === 'el'
                  ? '✓ Το αρχείο PDF κατέβηκε στον υπολογιστή σας! (Ελέγξτε το φάκελο «Λήψεις» / Downloads).'
                  : '✓ PDF file downloaded to your computer! (Check your Downloads folder).'}
              </span>
            </div>
            {lastDownloadUrl && (
              <div className="flex items-center gap-2 shrink-0">
                <a
                  href={lastDownloadUrl}
                  download={lastDownloadName}
                  className="px-3 py-1 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs transition-all shadow-sm"
                >
                  {lang === 'el' ? 'Λήψη Ξανά' : 'Download Again'}
                </a>
                <a
                  href={lastDownloadUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs border border-slate-700 transition-all"
                >
                  {lang === 'el' ? 'Προβολή PDF' : 'View PDF'}
                </a>
              </div>
            )}
          </div>
        )}

        {errorMessage && (
          <div className="mx-4 sm:mx-6 my-2 p-3 rounded-2xl bg-rose-500/15 border border-rose-500/40 text-rose-300 flex items-center justify-between gap-3 text-xs flex-wrap animate-fadeIn">
            <span>{errorMessage}</span>
            <a
              href={`/api/generate-pdf?answers=${includeAnswers}&lang=${printLang}&team=${teamFilter}`}
              download={includeAnswers ? 'BoundPad-Vulture-Arena-61-Lyseis.pdf' : 'BoundPad-Vulture-Arena-61-Fyllo.pdf'}
              className="px-3 py-1 rounded-lg bg-rose-500 hover:bg-rose-400 text-white font-bold text-xs"
            >
              {lang === 'el' ? 'Κλικ για Άμεση Λήψη' : 'Click for Direct Download'}
            </a>
          </div>
        )}

        {/* Option Filters Bar */}
        <div className="px-5 py-3 border-b border-slate-800 bg-slate-950/70 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-4 flex-wrap">
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
                  ? (lang === 'el' ? '✓ Με Λύσεις & Απαντήσεις (Οδηγός Εκπαιδευτικού)' : '✓ With Answers & Keys (Teacher Guide)')
                  : (lang === 'el' ? 'Χωρίς Λύσεις (Φύλλο Μαθητή)' : 'Without Answers (Student Worksheet)')}
              </span>
            </label>

            {/* Toggle explanations */}
            {includeAnswers && (
              <label className="flex items-center gap-1.5 cursor-pointer text-slate-300 select-none">
                <input
                  type="checkbox"
                  checked={includeExplanations}
                  onChange={(e) => setIncludeExplanations(e.target.checked)}
                  className="w-3.5 h-3.5 rounded text-emerald-600 bg-slate-800 border-slate-700 cursor-pointer"
                />
                <span className="text-[11px]">Επεξηγήσεις / Ορνιθολογικά Σημειώματα</span>
              </label>
            )}

            {/* QR Codes preview toggle */}
            <label className="flex items-center gap-1.5 cursor-pointer text-slate-300 select-none">
              <input
                type="checkbox"
                checked={includeQrs}
                onChange={(e) => setIncludeQrs(e.target.checked)}
                className="w-3.5 h-3.5 rounded text-emerald-600 bg-slate-800 border-slate-700 cursor-pointer"
              />
              <span className="text-[11px]">QR Codes & Εικόνες</span>
            </label>

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
                <option value="both" className="bg-slate-900">🌐 Δίγλωσσο (Both)</option>
              </select>
            </div>

            {/* Team filter */}
            <div className="flex items-center gap-1.5 bg-slate-900 px-2.5 py-1 rounded-xl border border-slate-700">
              <span className="text-slate-400 text-[11px] font-medium">Ομάδα:</span>
              <select
                value={teamFilter}
                onChange={(e) => setTeamFilter(e.target.value)}
                className="bg-transparent text-slate-200 font-bold focus:outline-none cursor-pointer text-xs"
              >
                <option value="all" className="bg-slate-900">Όλες οι Ομάδες ({filteredQuestions.length})</option>
                {gameState.teams.map((t) => (
                  <option key={t.id} value={t.id} className="bg-slate-900">
                    {t.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="text-[11px] text-slate-400 font-mono font-semibold">
            {filteredQuestions.length} ερωτήσεις · {totalPoints} πόντοι
          </div>
        </div>

        {/* Printable Document Preview Area */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 bg-slate-950/60">
          <div
            id="printable-quest-document"
            className="max-w-4xl mx-auto bg-white text-slate-900 p-6 sm:p-10 rounded-2xl shadow-xl print:shadow-none print:p-0 print:m-0 print:rounded-none"
          >
            {/* Document Header */}
            <div className="border-b-2 border-slate-900 pb-5 mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-3xl">🦅</span>
                  <div>
                    <h1 className="text-xl sm:text-2xl font-black text-slate-950 tracking-tight leading-tight">
                      {printLang === 'en' ? (gameState.title_en || gameState.title) : gameState.title}
                    </h1>
                    <div className="text-xs text-slate-600 font-semibold mt-0.5">
                      Οι 4 Γύπες της Ελλάδας: Όρνιο (Gyps fulvus), Γυπαετός (Gypaetus barbatus), Μαυρόγυπας (Aegypius monachus), Ασπροπάρης (Neophron percnopterus)
                    </div>
                  </div>
                </div>
                <div className="mt-2.5 flex items-center gap-2 flex-wrap">
                  <span className={`text-xs font-bold uppercase tracking-wider px-2.5 py-1 rounded ${includeAnswers ? 'bg-emerald-800 text-white' : 'bg-slate-900 text-white'}`}>
                    {includeAnswers
                      ? (printLang === 'en' ? 'Teacher Guide & Complete Solutions' : 'Οδηγός Εκπαιδευτικού & Πλήρεις Λύσεις Αποστολών')
                      : (printLang === 'en' ? 'Student Field Activity Sheet' : 'Φύλλο Δραστηριοτήτων & Αποστολών Ομάδων')}
                  </span>
                  <span className="text-xs font-bold text-slate-700 bg-slate-100 px-2.5 py-1 rounded border border-slate-300">
                    {printLang === 'en'
                      ? `${filteredQuestions.length} Quests · ${totalPoints} Total Points`
                      : `${filteredQuestions.length} Αποστολές · ${totalPoints} Συνολικοί Πόντοι`}
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
                  {teamFilter === 'all' ? (printLang === 'en' ? 'All 4 Teams' : 'Και οι 4 Ομάδες') : getTeamNames([teamFilter])}
                </div>
              </div>
            </div>

            {/* Questions List */}
            <div className="space-y-6">
              {filteredQuestions.map((quest, index) => {
                const questNum = index + 1;
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
                    className="p-4 sm:p-5 rounded-xl border border-slate-300 bg-slate-50/80 page-break-avoid space-y-3"
                  >
                    {/* Quest Item Header */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2.5 border-b border-slate-200">
                      <div className="flex items-center gap-2.5 flex-wrap">
                        <span className="w-7 h-7 rounded-lg bg-slate-900 text-white font-mono font-black text-xs flex items-center justify-center shrink-0">
                          #{questNum}
                        </span>
                        <h3 className="font-bold text-sm text-slate-900">
                          {titleText}
                        </h3>
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
                        <span className="font-mono font-bold text-emerald-800 text-[11px] bg-emerald-100 px-2 py-0.5 rounded">
                          {quest.points} pts
                        </span>
                        <span className="text-[11px] text-slate-600 bg-slate-200/80 px-2 py-0.5 rounded" title={assignedTeamsText}>
                          {assignedTeamsText}
                        </span>
                      </div>
                    </div>

                    {/* Optional Reference Illustration / Graphic */}
                    {includeQrs && quest.imageUrl && (
                      <div className="my-2 max-w-sm rounded-lg overflow-hidden border border-slate-300 shadow-sm">
                        <img
                          src={quest.imageUrl}
                          alt={quest.title}
                          className="w-full h-auto max-h-48 object-cover"
                        />
                      </div>
                    )}

                    {/* Quest Video notice */}
                    {quest.videoUrl && (
                      <div className="my-2 p-2 rounded-lg bg-purple-50 border border-purple-200 text-purple-900 text-[11px] flex items-center gap-2">
                        <span className="font-bold">🎥 {printLang === 'en' ? 'Quest Video:' : 'Βίντεο Αποστολής:'}</span>
                        <span className="font-mono text-[10px] truncate">
                          {quest.videoUrl.startsWith('data:')
                            ? (printLang === 'en' ? 'Embedded video file' : 'Ενσωματωμένο αρχείο βίντεο')
                            : quest.videoUrl}
                        </span>
                      </div>
                    )}

                    {/* Description / Instructions */}
                    <p className="text-xs text-slate-700 leading-relaxed font-normal">
                      {descText}
                    </p>
                    {descSecondary && (
                      <p className="text-xs text-slate-500 italic leading-relaxed">
                        {descSecondary}
                      </p>
                    )}

                    {/* Question Specific Content & Solutions */}
                    {/* 1. Multiple Choice */}
                    {quest.type === 'multiple_choice' && (() => {
                      const payload = (printLang === 'en' && quest.payload_en ? quest.payload_en : quest.payload) as MultipleChoicePayload;
                      const correctIndices = getMultipleChoiceCorrectIndices(payload);

                      return (
                        <div className="space-y-1.5 pt-1 pl-2">
                          {payload.options.map((opt, optIdx) => {
                            const isCorrect = correctIndices.includes(optIdx);
                            return (
                              <div
                                key={optIdx}
                                className={`text-xs p-2 rounded-lg flex items-start gap-2.5 ${
                                  includeAnswers && isCorrect
                                    ? 'bg-emerald-100/90 text-emerald-950 font-bold border-2 border-emerald-500 shadow-xs'
                                    : 'text-slate-800 bg-white border border-slate-200'
                                }`}
                              >
                                <span className="font-mono text-[11px] shrink-0 font-bold">
                                  {includeAnswers && isCorrect ? '[✓]' : '[  ]'} {String.fromCharCode(65 + optIdx)}.
                                </span>
                                <span className="flex-1">{opt}</span>
                                {includeAnswers && isCorrect && (
                                  <span className="ml-auto text-[10px] font-black tracking-wider uppercase text-emerald-900 bg-emerald-200/90 px-2 py-0.5 rounded shrink-0">
                                    ✓ ΟΡΘΗ ΑΠΑΝΤΗΣΗ
                                  </span>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      );
                    })()}

                    {/* 2. True / False */}
                    {quest.type === 'true_false' && (() => {
                      const payload = quest.payload as TrueFalsePayload;
                      const isTrue = payload.correctValue;

                      return (
                        <div className="pt-1 pl-2">
                          {includeAnswers ? (
                            <div className="p-2.5 rounded-lg bg-emerald-100/90 border-2 border-emerald-500 text-emerald-950 text-xs font-bold flex items-center gap-2">
                              <span className="text-base font-black">✓</span>
                              <span>ΟΡΘΗ ΑΠΑΝΤΗΣΗ:</span>
                              <span className="uppercase tracking-wider font-black px-2 py-0.5 rounded bg-emerald-200 text-emerald-900">
                                {isTrue ? (printLang === 'en' ? 'TRUE (ΣΩΣΤΟ)' : 'ΣΩΣΤΟ') : (printLang === 'en' ? 'FALSE (ΛΑΘΟΣ)' : 'ΛΑΘΟΣ')}
                              </span>
                            </div>
                          ) : (
                            <div className="flex items-center gap-4 text-xs font-semibold text-slate-800">
                              <span className="px-3 py-1.5 rounded border border-slate-300 bg-white">[  ] ΣΩΣΤΟ (True)</span>
                              <span className="px-3 py-1.5 rounded border border-slate-300 bg-white">[  ] ΛΑΘΟΣ (False)</span>
                            </div>
                          )}
                        </div>
                      );
                    })()}

                    {/* 3. Text Match */}
                    {quest.type === 'text_match' && (() => {
                      const payload = (printLang === 'en' && quest.payload_en ? quest.payload_en : quest.payload) as TextMatchPayload;
                      return (
                        <div className="pt-1 pl-2 space-y-1.5">
                          <div className="text-[11px] font-bold text-slate-700 uppercase tracking-wider">
                            {includeAnswers ? 'Σωστή Αντιστοίχιση Ζευγαριών:' : 'Ζεύγη προς αντιστοίχιση:'}
                          </div>
                          <div className="grid grid-cols-1 gap-1.5">
                            {payload.pairs.map((pair, pIdx) => (
                              <div
                                key={pair.id || pIdx}
                                className="flex items-center justify-between p-2 rounded-lg bg-white border border-slate-300 text-xs text-slate-900"
                              >
                                <span className="font-semibold text-slate-800">{pair.left}</span>
                                <span className="text-slate-400 px-2 font-bold">➔</span>
                                <span className={`font-bold ${includeAnswers ? 'text-emerald-900 bg-emerald-100 px-2 py-1 rounded border border-emerald-300' : 'text-slate-500 italic'}`}>
                                  {includeAnswers ? `✓ ${pair.right}` : '____________________'}
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                      );
                    })()}

                    {/* 4. Image Match */}
                    {quest.type === 'image_match' && (() => {
                      const payload = (printLang === 'en' && quest.payload_en ? quest.payload_en : quest.payload) as ImageMatchPayload;
                      return (
                        <div className="pt-1 pl-2 space-y-1.5">
                          <div className="text-[11px] font-bold text-slate-700 uppercase tracking-wider">
                            {includeAnswers ? 'Σωστή Αντιστοίχιση Σιλουέτας / Εικόνας:' : 'Χαρακτηριστικά:'}
                          </div>
                          <div className="grid grid-cols-1 gap-1.5">
                            {payload.pairs.map((p, pIdx) => (
                              <div
                                key={p.id || pIdx}
                                className="flex items-center gap-3 p-2 rounded-lg bg-white border border-slate-300 text-xs"
                              >
                                {p.image && includeQrs && (
                                  <img
                                    src={p.image}
                                    alt="Silhouette"
                                    className="w-12 h-12 object-cover rounded bg-slate-100 border border-slate-300 shrink-0"
                                  />
                                )}
                                <div className="flex-1">
                                  <div className="font-bold text-slate-900">{p.text}</div>
                                  {includeAnswers && (
                                    <div className="text-[11px] text-emerald-800 font-semibold">
                                      ✓ Αντιστοιχεί στη σιλουέτα του αντίστοιχου γύπα
                                    </div>
                                  )}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      );
                    })()}

                    {/* 5. QR Scan Station */}
                    {quest.type === 'qr_scan' && (() => {
                      const payload = quest.payload as QrScanPayload;
                      return (
                        <div className="pt-1 pl-2 flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 rounded-xl bg-purple-50/70 border border-purple-200">
                          <div className="space-y-1">
                            <div className="text-xs font-bold text-purple-900">
                              Κωδικός Σταθμού QR (Target Code):
                            </div>
                            <div className="font-mono text-sm font-black text-purple-950 bg-white px-3 py-1 rounded-lg border border-purple-300 inline-block">
                              {payload.targetCode}
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

                          {includeQrs && (
                            <div className="bg-white p-2 rounded-xl border border-purple-300 shadow-sm shrink-0 self-start sm:self-auto text-center">
                              <ScannableQrImage value={payload.targetCode} size={90} />
                              <div className="text-[9px] font-mono text-purple-900 font-bold mt-1">Σκανάρετε εδώ</div>
                            </div>
                          )}
                        </div>
                      );
                    })()}

                    {/* 6. Field Task / Checklist */}
                    {quest.type === 'task' && (() => {
                      const payload = (printLang === 'en' && quest.payload_en ? quest.payload_en : quest.payload) as TaskPayload;
                      return (
                        <div className="pt-1 pl-2 space-y-2">
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
                        <div className="pt-1 pl-2 text-xs text-slate-700 flex items-center gap-3 bg-sky-50 p-2.5 rounded-lg border border-sky-200">
                          {includeQrs && payload.imageUrl && (
                            <img
                              src={payload.imageUrl}
                              alt="Puzzle preview"
                              className="w-16 h-12 object-cover rounded border border-sky-300"
                            />
                          )}
                          <div>
                            <div>🧩 <strong>Διαδραστικό Παζλ:</strong> Σύνθεση {payload.gridPieces || 9} κομματιών για την αναπαράσταση της σκηνής.</div>
                            {includeAnswers && (
                              <div className="text-emerald-800 font-semibold text-[11px] mt-0.5">
                                ✓ Η ολοκλήρωση αποδίδει πλήρεις πόντους ({quest.points} pts) αυτόματα.
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })()}

                    {/* 8. Photo Upload */}
                    {quest.type === 'photo_upload' && (() => {
                      const payload = (printLang === 'en' && quest.payload_en ? quest.payload_en : quest.payload) as PhotoUploadPayload;
                      return (
                        <div className="pt-1 pl-2 text-xs text-slate-700 bg-amber-50/80 p-2.5 rounded-lg border border-amber-200">
                          📷 <strong>Οδηγίες Φωτογράφισης:</strong> {payload.instructions}
                          {includeAnswers && (
                            <div className="mt-1 text-emerald-800 text-[11px] font-semibold">
                              ✓ Απαιτείται τεκμήριο φωτογραφίας από την ομάδα για επικύρωση.
                            </div>
                          )}
                        </div>
                      );
                    })()}

                    {/* 9. Research & Inquiry */}
                    {quest.type === 'research' && (() => {
                      const payload = (printLang === 'en' && quest.payload_en ? quest.payload_en : quest.payload) as ResearchPayload;
                      return (
                        <div className="pt-1 pl-2 space-y-2 text-xs text-slate-800">
                          {payload.researchTopic && (
                            <div className="font-bold text-teal-900 bg-teal-50 p-2 rounded border border-teal-200">
                              🔬 <strong>Θέμα Έρευνας:</strong> {payload.researchTopic}
                            </div>
                          )}
                          {payload.instructions && (
                            <div className="text-[11px] text-slate-700">
                              📋 <strong>Οδηγίες:</strong> {payload.instructions}
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
              })}
            </div>

            {/* Document Footer */}
            <div className="mt-8 pt-4 border-t-2 border-slate-300 text-center text-xs text-slate-500 flex flex-col sm:flex-row items-center justify-between gap-2">
              <div>BoundPad - Actionbound & Padlet Interactive Team Arena</div>
              <div className="font-bold text-slate-800">Εκπαιδευτικό Πρόγραμμα για τους Γύπες της Ελλάδας</div>
              <div>Σελίδα Οδηγού & Λύσεων</div>
            </div>
          </div>
        </div>

        {/* Modal Footer Controls */}
        <div className="p-4 border-t border-slate-800 bg-slate-900/95 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-400">
          <div className="flex items-center gap-2">
            <span className="text-emerald-400 font-bold">💡 Tip:</span>
            <span>
              {lang === 'el'
                ? 'Επιλέξτε «🖨️ Αποθήκευση ως PDF» για να αποθηκεύσετε το έγγραφο ακριβώς όπως φαίνεται στην προεπισκόπηση με όλα τα χρώματα και τις κάρτες.'
                : 'Select "🖨️ Save as PDF" to save the document exactly as shown in preview with full styling and colors.'}
            </span>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <a
              href={`/api/print-view?answers=${includeAnswers}&lang=${printLang}&team=${teamFilter}&autoprint=1`}
              target="_blank"
              rel="noopener noreferrer"
              className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-black text-xs flex items-center gap-1.5 shadow-sm transition-all"
            >
              <Printer className="w-3.5 h-3.5 text-slate-950" />
              <span>{lang === 'el' ? '🖨️ Αποθήκευση ως PDF' : '🖨️ Save as PDF'}</span>
            </a>
            <button
              type="button"
              onClick={handleDownloadPdf}
              disabled={isGeneratingPdf}
              className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-emerald-300 border border-emerald-500/40 font-bold text-xs flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
            >
              {isGeneratingPdf ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Download className="w-3.5 h-3.5" />}
              <span>{isGeneratingPdf ? 'Δημιουργία...' : (lang === 'el' ? 'Λήψη .pdf (61)' : 'Download .pdf (61)')}</span>
            </button>
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold transition-colors cursor-pointer"
            >
              {lang === 'el' ? 'Κλείσιμο' : 'Close'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
