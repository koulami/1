/**
 * Educational Report Export Service
 * Produces clean, focused CSV and JSON educational reports containing strictly:
 * 1. Ομάδα (Team Name / Subgroup Name)
 * 2. Ερώτηση (The Question text)
 * 3. Επιλογές (The available choices/options for that question, if applicable)
 * 4. Απάντηση Μαθητών (The student's submitted answer)
 * 5. Επιστημονική Εξήγηση (The scientific explanation / feedback)
 */

import { Question, Team, Submission } from '../types/game';
import { isTaskActive } from '../data/masterTaskPool';

export interface CleanReportRecord {
  teamName: string;
  question: string;
  options: string;
  studentAnswer: string;
  explanation: string;
}

/**
 * Trigger a browser file download for a string blob
 */
function downloadFile(content: string, filename: string, mimeType: string) {
  try {
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setTimeout(() => URL.revokeObjectURL(url), 1500);
  } catch (err) {
    console.error('[ExportService] Failed to trigger file download:', err);
  }
}

/**
 * Clean string for CSV cell (escaping double quotes and inner line breaks)
 */
function escapeCsvCell(cell: any): string {
  if (cell === null || cell === undefined) return '""';
  const str = String(cell).replace(/"/g, '""');
  return `"${str}"`;
}

/**
 * Extract human-readable full question text
 */
function formatQuestionText(task: Question, isEl: boolean): string {
  const title = (isEl ? task.title : (task.title_en || task.title)) || '';
  const desc = (isEl ? task.description : (task.description_en || task.description)) || '';
  
  if (!desc.trim() || desc.trim() === title.trim()) {
    return title.trim();
  }
  return `${title.trim()} - ${desc.trim()}`;
}

/**
 * Extract choices/options for the question if applicable
 */
function formatQuestionOptions(task: Question, isEl: boolean): string {
  if (task.type === 'multiple_choice' || task.type === 'survey') {
    const rawOpts = isEl
      ? (task.payload as any)?.options || []
      : (task.payload as any)?.options_en || (task.payload as any)?.options || [];
    if (Array.isArray(rawOpts) && rawOpts.length > 0) {
      return rawOpts.map((opt: string, i: number) => `${i + 1}. ${opt}`).join(' | ');
    }
  } else if (task.type === 'true_false') {
    return isEl ? '1. Σωστό | 2. Λάθος' : '1. True | 2. False';
  } else if (task.type === 'text_match' || task.type === 'image_match') {
    const pairs = (task.payload as any)?.pairs || [];
    if (Array.isArray(pairs) && pairs.length > 0) {
      return pairs.map((p: any) => `${p.left || p.text || ''} ↔ ${p.right || p.image || ''}`).join(' | ');
    }
  }
  return '-';
}

/**
 * Extract student submitted answer formatted clearly
 */
function formatStudentAnswer(task: Question, sub: Submission | undefined, isEl: boolean): string {
  if (!sub || !sub.answerData) {
    return isEl ? 'Δεν έχει υποβληθεί ακόμη' : 'Not submitted yet';
  }

  try {
    const data = sub.answerData;
    if (task.type === 'multiple_choice') {
      const opts = isEl
        ? (task.payload as any)?.options || []
        : (task.payload as any)?.options_en || (task.payload as any)?.options || [];
      const idx = data.selectedOption ?? data.selectedIndex;
      if (typeof idx === 'number' && opts[idx]) {
        return `${idx + 1}. ${opts[idx]}`;
      }
      if (Array.isArray(data.selectedIndices)) {
        return data.selectedIndices.map((i: number) => `${i + 1}. ${opts[i]}`).join(', ');
      }
      if (typeof data.selectedOption === 'string') {
        return data.selectedOption;
      }
    } else if (task.type === 'true_false') {
      const val = data.selectedValue ?? data.selectedTf;
      if (val === true) return isEl ? 'Σωστό' : 'True';
      if (val === false) return isEl ? 'Λάθος' : 'False';
    } else if (task.type === 'text_match' || task.type === 'image_match') {
      const pairs = data.matchedPairs || {};
      const entries = Object.entries(pairs);
      if (entries.length > 0) {
        return entries.map(([k, v]) => `${k} -> ${v}`).join(' | ');
      }
    } else if (task.type === 'survey') {
      const choice = data.selectedOption || data.selectedOptions?.join(', ') || '';
      const reason = data.reason ? ` (${isEl ? 'Αιτιολόγηση' : 'Reason'}: "${data.reason}")` : '';
      return `${choice}${reason}`.trim() || (isEl ? 'Υποβλήθηκε' : 'Submitted');
    } else if (task.type === 'puzzle') {
      return isEl
        ? `Ολοκληρώθηκε (${data.moves || 0} κινήσεις σε ${data.durationSeconds || 0}s)`
        : `Completed (${data.moves || 0} moves in ${data.durationSeconds || 0}s)`;
    } else if (task.type === 'qr_scan') {
      return data.decodedCode ? `QR Code: ${data.decodedCode}` : (isEl ? 'Επιτυχής Σάρωση QR' : 'QR Scanned');
    } else if (task.type === 'photo_upload') {
      const cap = data.caption ? `: "${data.caption}"` : '';
      return isEl ? `Φωτογραφία / Τεκμήριο Πεδίου${cap}` : `Photo / Field Evidence${cap}`;
    }

    // Default text answer
    const text = data.textAnswer || data.reportText || data.text || sub.reflectionText;
    if (text) return String(text);
    return JSON.stringify(data);
  } catch {
    return isEl ? 'Υποβλήθηκε' : 'Submitted';
  }
}

/**
 * Extract scientific explanation
 */
function formatScientificExplanation(task: Question, isEl: boolean): string {
  const exp = isEl
    ? (task.explanation || (task as any).feedbackNote)
    : (task.explanation_en || task.explanation || (task as any).feedbackNote);
  return (exp && exp.trim()) ? exp.trim() : '-';
}

export const exportService = {
  /**
   * Builds clean, uncluttered educational report rows strictly focused on:
   * 1. Ομάδα (Team Name / Subgroup Name)
   * 2. Ερώτηση (The Question text)
   * 3. Επιλογές (The available choices/options for that question, if applicable)
   * 4. Απάντηση Μαθητών (The student's submitted answer)
   * 5. Επιστημονική Εξήγηση (The scientific explanation / feedback)
   */
  generateCleanReportRecords(params: {
    tasks: Question[];
    teams: Team[];
    submissions: Record<string, Submission>;
    taskOverrides?: Record<string, boolean>;
    lang: 'el' | 'en';
    onlySubmitted?: boolean;
  }): CleanReportRecord[] {
    const isEl = params.lang === 'el';
    const records: CleanReportRecord[] = [];

    for (const team of params.teams) {
      const teamDisplayName = isEl
        ? team.name
        : (team.name_en || team.name);

      // Tasks relevant to this team (or core track)
      const targetTrackId = team.trackId || team.id;
      const teamTasks = params.tasks.filter((t) => {
        if (!t.assignedTeamIds || t.assignedTeamIds.length === 0) return true;
        return t.assignedTeamIds.includes(team.id) || t.assignedTeamIds.includes(targetTrackId);
      });

      for (const task of teamTasks) {
        // Check submission for exact team.id first, then fallback to targetTrackId
        const subKey = `${team.id}_${task.id}`;
        const fallbackKey = `${targetTrackId}_${task.id}`;
        const sub = params.submissions[subKey] || params.submissions[fallbackKey];

        // Skip non-active tasks if overrides exist
        if (params.taskOverrides && !isTaskActive(task, params.taskOverrides)) {
          continue;
        }

        // If onlySubmitted filter is on, skip tasks that haven't been submitted
        if (params.onlySubmitted && (!sub || !sub.answerData)) {
          continue;
        }

        records.push({
          teamName: teamDisplayName,
          question: formatQuestionText(task, isEl),
          options: formatQuestionOptions(task, isEl),
          studentAnswer: formatStudentAnswer(task, sub, isEl),
          explanation: formatScientificExplanation(task, isEl)
        });
      }
    }

    return records;
  },

  /**
   * Export clean educational report as CSV with UTF-8 Excel BOM
   */
  exportDetailedSubmissionsCsv(params: {
    tasks: Question[];
    teams: Team[];
    submissions: Record<string, Submission>;
    taskOverrides?: Record<string, boolean>;
    lang: 'el' | 'en';
    onlySubmitted?: boolean;
  }): void {
    const isEl = params.lang === 'el';
    const records = this.generateCleanReportRecords(params);

    // Strictly the 5 requested core columns
    const headers = [
      isEl ? 'Ομάδα' : 'Team Name',
      isEl ? 'Ερώτηση' : 'Question',
      isEl ? 'Επιλογές' : 'Options',
      isEl ? 'Απάντηση Μαθητών' : 'Student Answer',
      isEl ? 'Επιστημονική Εξήγηση' : 'Scientific Explanation'
    ];

    const rows = records.map((r) => [
      r.teamName,
      r.question,
      r.options,
      r.studentAnswer,
      r.explanation
    ]);

    const csvContent = '\uFEFF' + [
      headers.map(escapeCsvCell).join(','),
      ...rows.map((row) => row.map(escapeCsvCell).join(','))
    ].join('\r\n');

    const dateStr = new Date().toISOString().slice(0, 10);
    const filename = isEl
      ? `ekpaideytiki-anafora-gypes-${dateStr}.csv`
      : `cyprus-vultures-educational-report-${dateStr}.csv`;

    downloadFile(csvContent, filename, 'text/csv;charset=utf-8;');
  },

  /**
   * Export clean educational report as JSON strictly focused on the 5 core fields
   */
  exportCleanJsonReport(params: {
    tasks: Question[];
    teams: Team[];
    submissions: Record<string, Submission>;
    taskOverrides?: Record<string, boolean>;
    lang: 'el' | 'en';
    onlySubmitted?: boolean;
  }): void {
    const isEl = params.lang === 'el';
    const records = this.generateCleanReportRecords(params);

    // Map each record strictly to the 5 requested keys
    const jsonOutput = records.map((r) => {
      if (isEl) {
        return {
          'Ομάδα': r.teamName,
          'Ερώτηση': r.question,
          'Επιλογές': r.options,
          'Απάντηση Μαθητών': r.studentAnswer,
          'Επιστημονική Εξήγηση': r.explanation
        };
      }
      return {
        'Team Name': r.teamName,
        'Question': r.question,
        'Options': r.options,
        'Student Answer': r.studentAnswer,
        'Scientific Explanation': r.explanation
      };
    });

    const jsonStr = JSON.stringify(jsonOutput, null, 2);
    const dateStr = new Date().toISOString().slice(0, 10);
    const filename = isEl
      ? `ekpaideytiki-anafora-gypes-${dateStr}.json`
      : `cyprus-vultures-educational-report-${dateStr}.json`;

    downloadFile(jsonStr, filename, 'application/json;charset=utf-8;');
  },

  /**
   * Full JSON state backup (keeps backwards-compatibility with restore while also including the clean report)
   */
  exportFullJsonBackup(params: {
    tasks: Question[];
    teams: Team[];
    teamStats?: any[];
    submissions: Record<string, Submission>;
    synthesisNotes?: any[];
    taskOverrides: Record<string, boolean>;
    lang: 'el' | 'en';
  }): void {
    // When teacher clicks JSON export, download the clean educational report
    this.exportCleanJsonReport({
      tasks: params.tasks,
      teams: params.teams,
      submissions: params.submissions,
      taskOverrides: params.taskOverrides,
      lang: params.lang
    });
  }
};
