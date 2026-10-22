import fs from 'fs';
import path from 'path';
import { jsPDF } from 'jspdf';
import {
  Question,
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

// Read Liberation Sans TTF fonts (supports full Greek, Cyrillic, Latin-1, Latin-A, Latin-B)
const fontDir = '/usr/share/fonts/truetype/liberation';
let regularFontBase64 = '';
let boldFontBase64 = '';
let italicFontBase64 = '';

try {
  if (fs.existsSync(path.join(fontDir, 'LiberationSans-Regular.ttf'))) {
    regularFontBase64 = fs.readFileSync(path.join(fontDir, 'LiberationSans-Regular.ttf')).toString('base64');
  }
  if (fs.existsSync(path.join(fontDir, 'LiberationSans-Bold.ttf'))) {
    boldFontBase64 = fs.readFileSync(path.join(fontDir, 'LiberationSans-Bold.ttf')).toString('base64');
  }
  if (fs.existsSync(path.join(fontDir, 'LiberationSans-Italic.ttf'))) {
    italicFontBase64 = fs.readFileSync(path.join(fontDir, 'LiberationSans-Italic.ttf')).toString('base64');
  }
} catch (e) {
  console.warn('Could not pre-load Liberation fonts:', e);
}

export interface PdfOptions {
  title?: string;
  title_en?: string;
  includeAnswers?: boolean;
  printLang?: 'el' | 'en' | 'both';
  includeExplanations?: boolean;
  teamFilter?: string;
  teams?: Array<{ id: string; name: string }>;
}

export function generateVultureQuestsPdf(questions: Question[], options: PdfOptions = {}): Buffer {
  const {
    title = 'Αποστολή: Οι 4 Γύπες της Ελλάδας & Κύπρου - Vulture Arena 61',
    title_en = 'Mission: The 4 Vultures of Greece & Cyprus - Vulture Arena 61',
    includeAnswers = true,
    printLang = 'el',
    includeExplanations = true,
    teamFilter = 'all',
    teams = []
  } = options;

  const doc = new jsPDF({ unit: 'mm', format: 'a4', orientation: 'portrait' });

  // Register fonts if loaded
  if (regularFontBase64) {
    doc.addFileToVFS('LiberationSans-Regular.ttf', regularFontBase64);
    doc.addFont('LiberationSans-Regular.ttf', 'LiberationSans', 'normal');
  }
  if (boldFontBase64) {
    doc.addFileToVFS('LiberationSans-Bold.ttf', boldFontBase64);
    doc.addFont('LiberationSans-Bold.ttf', 'LiberationSans', 'bold');
  }
  if (italicFontBase64) {
    doc.addFileToVFS('LiberationSans-Italic.ttf', italicFontBase64);
    doc.addFont('LiberationSans-Italic.ttf', 'LiberationSans', 'italic');
  }

  // Fallback to standard if not loaded
  const fontName = regularFontBase64 ? 'LiberationSans' : 'Helvetica';

  const pageWidth = 210;
  const pageHeight = 297;
  const margin = 14;
  const contentWidth = pageWidth - margin * 2;
  let y = margin;

  const checkPageBreak = (neededHeight: number) => {
    if (y + neededHeight > pageHeight - 16) {
      doc.addPage();
      y = margin;
      drawRunningHeaderFooter();
    }
  };

  const drawRunningHeaderFooter = () => {
    const totalP = doc.getNumberOfPages();
    doc.setFont(fontName, 'normal');
    doc.setFontSize(7.5);
    doc.setTextColor(140, 140, 140);
    doc.text('Vulture Arena · 61 Αποστολές των Γυπών · Εθνικό Πρόγραμμα Προστασίας', margin, 9);
    doc.setDrawColor(220, 225, 230);
    doc.line(margin, 11, pageWidth - margin, 11);

    // Footer
    doc.line(margin, pageHeight - 11, pageWidth - margin, pageHeight - 11);
    doc.text(`Σελίδα ${totalP}`, pageWidth / 2, pageHeight - 7, { align: 'center' });
  };

  // Header banner on first page
  drawRunningHeaderFooter();

  // Document Title Box
  doc.setFillColor(15, 23, 42); // slate-900
  doc.roundedRect(margin, y, contentWidth, 26, 2, 2, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFont(fontName, 'bold');
  doc.setFontSize(13);
  const docTitle = printLang === 'en' && title_en ? title_en : title;
  doc.text(docTitle, margin + 5, y + 8);

  doc.setFont(fontName, 'normal');
  doc.setFontSize(8);
  doc.setTextColor(226, 232, 240);
  doc.text('Οι 4 Γύπες της Ελλάδας: Όρνιο, Γυπαετός, Μαυρόγυπας, Ασπροπάρης', margin + 5, y + 14);

  // Badge: Teacher vs Student
  const badgeText = includeAnswers
    ? printLang === 'en'
      ? 'TEACHER GUIDE & COMPLETE SOLUTIONS (61 QUESTS)'
      : 'ΟΔΗΓΟΣ ΕΚΠΑΙΔΕΥΤΙΚΟΥ & ΠΛΗΡΕΙΣ ΛΥΣΕΙΣ (61 ΑΠΟΣΤΟΛΕΣ)'
    : printLang === 'en'
      ? 'STUDENT ACTIVITY SHEET (61 QUESTS)'
      : 'ΦΥΛΛΟ ΕΡΓΑΣΙΑΣ ΜΑΘΗΤΗ (61 ΑΠΟΣΤΟΛΕΣ)';

  doc.setFillColor(includeAnswers ? 5 : 30, includeAnswers ? 150 : 41, includeAnswers ? 105 : 59);
  doc.rect(margin + 5, y + 17.5, 90, 5, 'F');
  doc.setFont(fontName, 'bold');
  doc.setFontSize(7);
  doc.setTextColor(255, 255, 255);
  doc.text(badgeText, margin + 7, y + 21);

  // Summary tag
  doc.setFont(fontName, 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(203, 213, 225);
  const totalPoints = questions.reduce((acc, q) => acc + (q.points || 0), 0);
  doc.text(`${questions.length} Αποστολές · ${totalPoints} Πόντοι · 4 Ομάδες`, pageWidth - margin - 5, y + 21, {
    align: 'right'
  });

  y += 32;

  // Filter questions if needed
  const listToRender = questions.filter((q) => {
    if (teamFilter === 'all') return true;
    if (!q.assignedTeamIds || q.assignedTeamIds.length === 0) return true;
    return q.assignedTeamIds.includes(teamFilter);
  });

  listToRender.forEach((q, index) => {
    checkPageBreak(30);

    const questionTitle = (printLang === 'en' && q.title_en ? q.title_en : q.title) || q.title;
    const questionDesc = (printLang === 'en' && q.description_en ? q.description_en : q.description) || q.description;
    const explanationText = (printLang === 'en' && q.explanation_en ? q.explanation_en : q.explanation) || q.explanation;

    // Question Header Box
    const titleLines = doc.splitTextToSize(`${index + 1}. ${questionTitle}`, contentWidth - 28);
    const boxHeight = Math.max(8, titleLines.length * 4.5 + 3);
    checkPageBreak(boxHeight + 5);

    doc.setFillColor(248, 250, 252); // slate-50
    doc.setDrawColor(226, 232, 240); // slate-200
    doc.roundedRect(margin, y, contentWidth, boxHeight, 1.5, 1.5, 'FD');

    doc.setFont(fontName, 'bold');
    doc.setFontSize(9.5);
    doc.setTextColor(15, 23, 42);
    doc.text(titleLines, margin + 3, y + 5);

    doc.setFont(fontName, 'normal');
    doc.setFontSize(7.5);
    doc.setTextColor(100, 116, 139);
    doc.text(`${q.points || 100} pts`, pageWidth - margin - 3, y + 5, { align: 'right' });

    y += boxHeight + 3;

    // Question Description
    if (questionDesc) {
      doc.setFont(fontName, 'normal');
      doc.setFontSize(8);
      doc.setTextColor(51, 65, 85);
      const descLines = doc.splitTextToSize(questionDesc, contentWidth - 4);
      checkPageBreak(descLines.length * 4);
      doc.text(descLines, margin + 2, y);
      y += descLines.length * 4 + 2;
    }

    // 1. Multiple Choice
    if (q.type === 'multiple_choice') {
      const payload = (printLang === 'en' && q.payload_en ? q.payload_en : q.payload) as MultipleChoicePayload;
      const correctIndices = getMultipleChoiceCorrectIndices(payload);

      if (Array.isArray(payload?.options)) {
        payload.options.forEach((opt, optIdx) => {
          const isCorrect = correctIndices.includes(optIdx);
          checkPageBreak(6.5);

          if (includeAnswers && isCorrect) {
            doc.setFillColor(220, 252, 231); // emerald-100
            doc.rect(margin + 2, y - 3, contentWidth - 4, 6, 'F');
            doc.setFont(fontName, 'bold');
            doc.setFontSize(8);
            doc.setTextColor(6, 78, 59); // emerald-900
            const mark = '[✓] ';
            const optLines = doc.splitTextToSize(
              `${mark}${String.fromCharCode(65 + optIdx)}. ${opt}  (✓ ΟΡΘΗ ΑΠΑΝΤΗΣΗ)`,
              contentWidth - 8
            );
            doc.text(optLines, margin + 4, y + 1);
            y += optLines.length * 4.2 + 1.5;
          } else {
            doc.setFont(fontName, 'normal');
            doc.setFontSize(8);
            doc.setTextColor(71, 85, 105);
            const mark = '[  ] ';
            const optLines = doc.splitTextToSize(`${mark}${String.fromCharCode(65 + optIdx)}. ${opt}`, contentWidth - 8);
            doc.text(optLines, margin + 4, y + 1);
            y += optLines.length * 4.2 + 1;
          }
        });
      }
    }
    // 2. True / False
    else if (q.type === 'true_false') {
      const payload = q.payload as TrueFalsePayload;
      checkPageBreak(8);
      if (includeAnswers) {
        doc.setFillColor(220, 252, 231);
        doc.rect(margin + 2, y - 3, contentWidth - 4, 6, 'F');
        doc.setFont(fontName, 'bold');
        doc.setFontSize(8);
        doc.setTextColor(6, 78, 59);
        const ans = payload?.correctValue ? 'ΣΩΣΤΟ (True)' : 'ΛΑΘΟΣ (False)';
        doc.text(`[✓] ΟΡΘΗ ΑΠΑΝΤΗΣΗ: ${ans}`, margin + 4, y + 1.2);
        y += 7.5;
      } else {
        doc.setFont(fontName, 'normal');
        doc.setFontSize(8);
        doc.setTextColor(71, 85, 105);
        doc.text('[  ] ΣΩΣΤΟ (True)          [  ] ΛΑΘΟΣ (False)', margin + 4, y + 1);
        y += 6.5;
      }
    }
    // 3. Text Match
    else if (q.type === 'text_match') {
      const payload = (printLang === 'en' && q.payload_en ? q.payload_en : q.payload) as TextMatchPayload;
      doc.setFont(fontName, 'bold');
      doc.setFontSize(8);
      doc.setTextColor(30, 41, 59);
      doc.text(includeAnswers ? 'Σωστή Αντιστοίχιση Ζευγαριών:' : 'Αντιστοίχιση (Συνδέστε με γραμμή):', margin + 2, y);
      y += 4.5;

      if (Array.isArray(payload?.pairs)) {
        payload.pairs.forEach((pair) => {
          checkPageBreak(5);
          doc.setFont(fontName, 'normal');
          doc.setFontSize(7.5);
          doc.setTextColor(51, 65, 85);
          doc.text(`• ${pair.left}`, margin + 4, y);

          if (includeAnswers) {
            doc.setFont(fontName, 'bold');
            doc.setTextColor(5, 150, 105);
            doc.text(`➔  ✓ ${pair.right}`, margin + 85, y);
          } else {
            doc.setTextColor(150, 150, 150);
            doc.text('➔  __________________________', margin + 85, y);
          }
          y += 4.2;
        });
      }
    }
    // 4. Image Match
    else if (q.type === 'image_match') {
      const payload = (printLang === 'en' && q.payload_en ? q.payload_en : q.payload) as ImageMatchPayload;
      doc.setFont(fontName, 'bold');
      doc.setFontSize(8);
      doc.setTextColor(30, 41, 59);
      doc.text(includeAnswers ? 'Σωστή Αναγνώριση Σιλουέτας / Είδους:' : 'Χαρακτηριστικά Σιλουέτας:', margin + 2, y);
      y += 4.5;

      if (Array.isArray(payload?.pairs)) {
        payload.pairs.forEach((p) => {
          checkPageBreak(5);
          doc.setFont(fontName, 'normal');
          doc.setFontSize(7.5);
          doc.setTextColor(51, 65, 85);
          const lines = doc.splitTextToSize(`• ${p.text}`, contentWidth - 8);
          doc.text(lines, margin + 4, y);
          y += lines.length * 3.8 + 1;
        });
      }
    }
    // 5. QR Scan
    else if (q.type === 'qr_scan') {
      const payload = q.payload as QrScanPayload;
      checkPageBreak(12);
      doc.setFillColor(243, 232, 255); // purple-100
      doc.rect(margin + 2, y - 3, contentWidth - 4, 10, 'F');
      doc.setFont(fontName, 'bold');
      doc.setFontSize(8);
      doc.setTextColor(88, 28, 135);
      doc.text(`QR Σταθμός - Κωδικός Επικύρωσης: ${payload?.targetCode || 'VULTURE-STATION'}`, margin + 4, y + 1);
      if (payload?.locationHint) {
        doc.setFont(fontName, 'normal');
        doc.setFontSize(7);
        doc.setTextColor(107, 33, 168);
        doc.text(`Υπόδειξη Τοποθεσίας Πεδίου: ${payload.locationHint}`, margin + 4, y + 5);
      }
      y += 12;
    }
    // 6. Field Task
    else if (q.type === 'task') {
      const payload = (printLang === 'en' && q.payload_en ? q.payload_en : q.payload) as TaskPayload;
      if (payload?.instructions) {
        checkPageBreak(6);
        doc.setFont(fontName, 'bold');
        doc.setFontSize(7.5);
        doc.setTextColor(180, 83, 9);
        const instLines = doc.splitTextToSize(`📋 Οδηγίες: ${payload.instructions}`, contentWidth - 8);
        doc.text(instLines, margin + 4, y);
        y += instLines.length * 3.8 + 1;
      }
      if (Array.isArray(payload?.checklist)) {
        payload.checklist.forEach((item) => {
          checkPageBreak(5);
          doc.setFont(fontName, 'normal');
          doc.setFontSize(7.5);
          doc.setTextColor(51, 65, 85);
          const cLines = doc.splitTextToSize(`[  ] ${item}`, contentWidth - 8);
          doc.text(cLines, margin + 4, y);
          y += cLines.length * 3.8 + 1;
        });
      }
    }
    // 7. Research
    else if (q.type === 'research') {
      const payload = (printLang === 'en' && q.payload_en ? q.payload_en : q.payload) as ResearchPayload;
      if (payload?.researchTopic) {
        checkPageBreak(6);
        doc.setFont(fontName, 'bold');
        doc.setFontSize(8);
        doc.setTextColor(13, 148, 136);
        const tLines = doc.splitTextToSize(`🔬 Θέμα Έρευνας: ${payload.researchTopic}`, contentWidth - 8);
        doc.text(tLines, margin + 4, y);
        y += tLines.length * 4 + 1;
      }
      if (payload?.instructions) {
        checkPageBreak(5);
        doc.setFont(fontName, 'normal');
        doc.setFontSize(7.5);
        doc.setTextColor(71, 85, 105);
        const iLines = doc.splitTextToSize(`📋 ${payload.instructions}`, contentWidth - 8);
        doc.text(iLines, margin + 4, y);
        y += iLines.length * 3.8 + 1;
      }
      if (Array.isArray(payload?.guidingQuestions)) {
        payload.guidingQuestions.forEach((gq) => {
          checkPageBreak(5);
          doc.setFont(fontName, 'normal');
          doc.setFontSize(7.5);
          doc.setTextColor(51, 65, 85);
          const gLines = doc.splitTextToSize(`• ${gq}`, contentWidth - 8);
          doc.text(gLines, margin + 6, y);
          y += gLines.length * 3.8 + 1;
        });
      }
    }
    // 8. Photo Upload
    else if (q.type === 'photo_upload') {
      const payload = (printLang === 'en' && q.payload_en ? q.payload_en : q.payload) as PhotoUploadPayload;
      checkPageBreak(6);
      doc.setFont(fontName, 'normal');
      doc.setFontSize(7.5);
      doc.setTextColor(180, 83, 9);
      const pLines = doc.splitTextToSize(`📷 Οδηγίες Φωτογράφισης: ${payload?.instructions || 'Απαιτείται τεκμήριο φωτογραφίας'}`, contentWidth - 8);
      doc.text(pLines, margin + 4, y);
      y += pLines.length * 3.8 + 1;
    }
    // 9. Puzzle
    else if (q.type === 'puzzle') {
      const payload = q.payload as PuzzlePayload;
      checkPageBreak(5);
      doc.setFont(fontName, 'normal');
      doc.setFontSize(7.5);
      doc.setTextColor(2, 132, 199);
      doc.text(`🧩 Διαδραστικό Παζλ: Συναρμολόγηση εικόνας πεδίου (${payload?.gridPieces || 9} κομμάτια)`, margin + 4, y);
      y += 5;
    }

    // Explanation / Teacher Note
    if (includeAnswers && includeExplanations && explanationText) {
      checkPageBreak(12);
      doc.setFillColor(254, 243, 199); // amber-100
      const expLines = doc.splitTextToSize(`💡 Επιστημονική Επεξήγηση: ${explanationText}`, contentWidth - 8);
      const boxH = expLines.length * 3.8 + 3;
      doc.rect(margin + 2, y - 2, contentWidth - 4, boxH, 'F');
      doc.setFont(fontName, 'normal');
      doc.setFontSize(7.5);
      doc.setTextColor(146, 64, 14); // amber-800
      doc.text(expLines, margin + 4, y + 1.5);
      y += boxH + 2;
    }

    // Spacing between questions
    y += 2;
    doc.setDrawColor(226, 232, 240);
    doc.line(margin + 2, y, pageWidth - margin - 2, y);
    y += 4;
  });

  return Buffer.from(doc.output('arraybuffer'));
}
