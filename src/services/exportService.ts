/**
 * Export and Backup Service
 * Generates JSON backups and UTF-8 encoded CSV files (with Excel BOM)
 * for tasks, team submissions, scores, and synthesis notes.
 */

import { Question, Team, Submission } from '../types/game';
import { TeamTaskStats, isTaskActive } from '../data/masterTaskPool';

export interface FullBackupPayload {
  version: number;
  appName: string;
  exportedAt: string;
  language: string;
  summary: {
    totalTasks: number;
    activeTasks: number;
    inactiveTasks: number;
    totalSubmissions: number;
    teamsCount: number;
  };
  teams: Team[];
  teamStats: TeamTaskStats[];
  taskActiveOverrides: Record<string, boolean>;
  submissions: Record<string, Submission>;
  synthesisNotes: any[];
  masterTasks: Question[];
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
 * Clean string for CSV cell (escaping double quotes)
 */
function escapeCsvCell(cell: any): string {
  if (cell === null || cell === undefined) return '""';
  const str = String(cell).replace(/"/g, '""');
  return `"${str}"`;
}

export const exportService = {
  /**
   * Export complete application state as a structured JSON backup file
   */
  exportFullJsonBackup(params: {
    tasks: Question[];
    teams: Team[];
    teamStats: TeamTaskStats[];
    submissions: Record<string, Submission>;
    synthesisNotes: any[];
    taskOverrides: Record<string, boolean>;
    lang: 'el' | 'en';
  }): void {
    const activeTasksCount = params.tasks.filter((t) =>
      isTaskActive(t, params.taskOverrides)
    ).length;

    const payload: FullBackupPayload = {
      version: 1,
      appName: 'Cyprus Griffon Vulture Educational Quest',
      exportedAt: new Date().toISOString(),
      language: params.lang,
      summary: {
        totalTasks: params.tasks.length,
        activeTasks: activeTasksCount,
        inactiveTasks: params.tasks.length - activeTasksCount,
        totalSubmissions: Object.keys(params.submissions).length,
        teamsCount: params.teams.length
      },
      teams: params.teams,
      teamStats: params.teamStats,
      taskActiveOverrides: params.taskOverrides,
      submissions: params.submissions,
      synthesisNotes: params.synthesisNotes,
      masterTasks: params.tasks
    };

    const jsonStr = JSON.stringify(payload, null, 2);
    const dateStr = new Date().toISOString().slice(0, 10);
    const filename = `cyprus-vulture-backup-${dateStr}.json`;

    downloadFile(jsonStr, filename, 'application/json;charset=utf-8;');
  },

  /**
   * Export detailed gradebook & submissions report as CSV
   * Uses UTF-8 BOM (\uFEFF) so Excel and Google Sheets open Greek text flawlessly.
   */
  exportDetailedSubmissionsCsv(params: {
    tasks: Question[];
    teams: Team[];
    submissions: Record<string, Submission>;
    taskOverrides: Record<string, boolean>;
    lang: 'el' | 'en';
  }): void {
    const isEl = params.lang === 'el';

    const headers = [
      isEl ? 'Ομάδα ID' : 'Team ID',
      isEl ? 'Όνομα Ομάδας' : 'Team Name',
      isEl ? 'ID Αποστολής' : 'Task ID',
      isEl ? 'Τίτλος Αποστολής' : 'Task Title',
      isEl ? 'Τύπος Αποστολής' : 'Task Type',
      isEl ? 'Ενεργή Αποστολή' : 'Is Active',
      isEl ? 'Checkpoint' : 'Is Checkpoint',
      isEl ? 'Μέγιστοι Πόντοι' : 'Max Points',
      isEl ? 'Κατάσταση' : 'Status',
      isEl ? 'Κερδισμένοι Πόντοι' : 'Earned Points',
      isEl ? 'Ημερομηνία / Ώρα Υποβολής' : 'Submitted At',
      isEl ? 'Στοιχεία Απάντησης' : 'Answer Details',
      isEl ? 'Επιστημονική Εξήγηση' : 'Scientific Note'
    ];

    const rows: string[][] = [];

    // For every team and every task assigned to it
    for (const team of params.teams) {
      const teamTasks = params.tasks.filter((t) => {
        if (!t.assignedTeamIds || t.assignedTeamIds.length === 0) return true;
        return t.assignedTeamIds.includes(team.id);
      });

      for (const task of teamTasks) {
        const subKey = `${team.id}_${task.id}`;
        const sub = params.submissions[subKey];
        const isActive = isTaskActive(task, params.taskOverrides);
        const isCp = task.id === 'cyprus-vulture-36' || task.id === 'cyprus-vulture-23' || task.id === 'cyprus-vulture-qr-56' || task.id === 'cyprus-vulture-61';

        // Format answer data summary
        let answerSummary = '-';
        if (sub?.answerData) {
          try {
            if (task.type === 'multiple_choice') {
              const selectedIdx = sub.answerData.selectedOption ?? sub.answerData.selectedIndex;
              const opts = (task.payload as any)?.options || [];
              answerSummary = typeof selectedIdx === 'number' && opts[selectedIdx]
                ? `[Επιλογή ${selectedIdx + 1}]: ${opts[selectedIdx]}`
                : JSON.stringify(sub.answerData);
            } else if (task.type === 'true_false') {
              const val = sub.answerData.selectedValue ?? sub.answerData.selectedTf;
              answerSummary = val === true ? (isEl ? 'Σωστό' : 'True') : (isEl ? 'Λάθος' : 'False');
            } else if (task.type === 'text_match' || task.type === 'image_match') {
              const pairs = sub.answerData.matchedPairs || {};
              answerSummary = Object.entries(pairs).map(([k, v]) => `${k} -> ${v}`).join(' | ');
            } else if (task.type === 'puzzle') {
              answerSummary = `${sub.answerData.moves || 0} κινήσεις σε ${sub.answerData.durationSeconds || 0}s`;
            } else if (task.type === 'qr_scan') {
              answerSummary = `QR Code: ${sub.answerData.decodedCode || sub.answerData.qrCode || '-'}`;
            } else if (task.type === 'photo_upload') {
              const cap = sub.answerData.caption ? ` ("${sub.answerData.caption}")` : '';
              answerSummary = `Τεκμήριο ${sub.answerData.mediaType || 'photo'}${cap}`;
            } else {
              answerSummary = sub.answerData.textAnswer || sub.answerData.reportText || JSON.stringify(sub.answerData);
            }
          } catch {
            answerSummary = JSON.stringify(sub.answerData);
          }
        }

        const submittedTime = sub?.submittedAt
          ? new Date(sub.submittedAt).toLocaleString(isEl ? 'el-GR' : 'en-US')
          : '-';

        const statusLabel = sub?.status === 'correct'
          ? (isEl ? 'Ολοκληρώθηκε' : 'Completed')
          : sub?.status === 'incorrect'
          ? (isEl ? 'Μη Ορθό' : 'Incorrect')
          : (isEl ? 'Εκκρεμεί' : 'Pending');

        rows.push([
          team.id,
          isEl ? team.name : team.name_en || team.name,
          task.id,
          isEl ? task.title : task.title_en || task.title,
          task.type,
          isActive ? (isEl ? 'ΝΑΙ' : 'YES') : (isEl ? 'ΟΧΙ' : 'NO'),
          isCp ? (isEl ? 'ΝΑΙ' : 'YES') : (isEl ? 'ΟΧΙ' : 'NO'),
          String(task.points),
          statusLabel,
          String(sub?.scoreEarned ?? 0),
          submittedTime,
          answerSummary,
          (isEl ? task.explanation : task.explanation_en || task.explanation) || ''
        ]);
      }
    }

    const csvContent = '\uFEFF' + [
      headers.map(escapeCsvCell).join(','),
      ...rows.map((row) => row.map(escapeCsvCell).join(','))
    ].join('\r\n');

    const dateStr = new Date().toISOString().slice(0, 10);
    const filename = `cyprus-vulture-results-${dateStr}.csv`;

    downloadFile(csvContent, filename, 'text/csv;charset=utf-8;');
  },

  /**
   * Export team scoreboard summary report as CSV
   */
  exportTeamScoreboardCsv(params: {
    teamStats: TeamTaskStats[];
    lang: 'el' | 'en';
  }): void {
    const isEl = params.lang === 'el';

    const headers = [
      isEl ? 'Κατάταξη' : 'Rank',
      isEl ? 'Ομάδα ID' : 'Team ID',
      isEl ? 'Όνομα Ομάδας' : 'Team Name',
      isEl ? 'Σύνθημα' : 'Slogan',
      isEl ? 'Ολοκληρωμένες Αποστολές' : 'Completed Missions',
      isEl ? 'Συνολικές Ενεργές Αποστολές' : 'Total Active Missions',
      isEl ? 'Ποσοστό Ολοκλήρωσης (%)' : 'Completion Rate (%)',
      isEl ? 'Συνολικό Σκορ' : 'Total Score'
    ];

    const sortedStats = [...params.teamStats].sort((a, b) => b.totalScore - a.totalScore);

    const rows = sortedStats.map((stat, idx) => [
      String(idx + 1),
      stat.team.id,
      isEl ? stat.team.name : stat.team.name_en || stat.team.name,
      isEl ? stat.team.slogan : stat.team.slogan_en || stat.team.slogan,
      String(stat.completedTasks),
      String(stat.totalActiveTasks),
      `${stat.progressPercent}%`,
      String(stat.totalScore)
    ]);

    const csvContent = '\uFEFF' + [
      headers.map(escapeCsvCell).join(','),
      ...rows.map((row) => row.map(escapeCsvCell).join(','))
    ].join('\r\n');

    const dateStr = new Date().toISOString().slice(0, 10);
    const filename = `cyprus-vulture-team-summary-${dateStr}.csv`;

    downloadFile(csvContent, filename, 'text/csv;charset=utf-8;');
  }
};
