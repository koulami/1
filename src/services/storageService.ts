/**
 * Bulletproof State Persistence Layer
 * Provides robust localStorage persistence with automatic JSON serialization/deserialization,
 * try/catch wrapping on every read/write, in-memory fail-safe caches,
 * and automatic synchronization across sessions and refreshes.
 */

import { Submission, TeamSynthesisNote, Team, CoreTrackId } from '../types/game';
import { masterTeamsPool } from '../data/masterTaskPool';

// Storage keys versioned for safety
export const STORAGE_KEYS = {
  SUBMISSIONS: 'boundpad_submissions_v10',
  TEAM_TASK_INDEXES: 'boundpad_team_task_indexes_v10',
  SYNTHESIS_NOTES: 'boundpad_synthesis_notes_v10',
  ACTIVE_TAB: 'boundpad_active_tab_v10',
  LANGUAGE: 'boundpad_lang_v10',
  BACKUP_TIMESTAMP: 'boundpad_last_backup_ts',
  TASK_ACTIVE_OVERRIDES: 'boundpad_task_active_overrides_v10',
  ADMIN_AUTH: 'boundpad_admin_auth_v10',
  CUSTOM_QUESTIONS: 'boundpad_custom_questions_v10',
  GAME_STARTED: 'boundpad_game_started_v10',
  GAME_START_TIMESTAMP: 'boundpad_game_start_ts_v10',
  GROUP_TIMERS: 'boundpad_group_timers_v10',
  TASK_TIMERS: 'boundpad_task_timers_v10',
  TEAM_REFLECTIONS: 'boundpad_team_reflections_v10',
  TASK_ORDER: 'boundpad_task_order_v10',
  CUSTOM_TEAM_TITLES: 'boundpad_custom_team_titles_v10',
  CUSTOM_SUBGROUPS: 'boundpad_subgroups_v12',
  SUBGROUPS_MODE_ENABLED: 'boundpad_subgroups_mode_enabled_v1',
  SYNC_VERSION: 'boundpad_sync_version_v12'
} as const;

// In-memory fallback cache in case localStorage is disabled, private, or quota-exceeded
const memoryCache: Record<string, string> = {};

function safeGetItem(key: string): string | null {
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      const val = window.localStorage.getItem(key);
      if (val !== null) return val;
    }
  } catch (err) {
    console.warn(`[StorageService] safeGetItem error for key "${key}":`, err);
  }
  return memoryCache[key] ?? null;
}

function safeSetItem(key: string, value: string): boolean {
  // Always update memory cache as instant fail-safe
  memoryCache[key] = value;
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      window.localStorage.setItem(key, value);
      return true;
    }
  } catch (err) {
    console.warn(`[StorageService] safeSetItem error for key "${key}":`, err);
  }
  return false;
}

function safeRemoveItem(key: string): void {
  delete memoryCache[key];
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      window.localStorage.removeItem(key);
    }
  } catch (err) {
    console.warn(`[StorageService] safeRemoveItem error for key "${key}":`, err);
  }
}

export const storageService = {
  /**
   * Load all submissions (scores, answers, completion status)
   */
  getSubmissions(): Record<string, Submission> {
    try {
      const raw = safeGetItem(STORAGE_KEYS.SUBMISSIONS);
      if (!raw) return {};
      const parsed = JSON.parse(raw);
      if (typeof parsed === 'object' && parsed !== null) {
        return parsed as Record<string, Submission>;
      }
      return {};
    } catch (e) {
      console.warn('[StorageService] Error reading submissions from localStorage:', e);
      return {};
    }
  },

  /**
   * Save a single submission and persist immediately to localStorage
   */
  saveSubmission(submission: Submission): Record<string, Submission> {
    try {
      const current = this.getSubmissions();
      const updated: Record<string, Submission> = {
        ...current,
        [`${submission.teamId}_${submission.questionId}`]: submission
      };
      safeSetItem(STORAGE_KEYS.SUBMISSIONS, JSON.stringify(updated));
      return updated;
    } catch (e) {
      console.warn('[StorageService] Error saving submission:', e);
      return {};
    }
  },

  /**
   * Batch save submissions
   */
  saveAllSubmissions(submissions: Record<string, Submission>): boolean {
    try {
      return safeSetItem(STORAGE_KEYS.SUBMISSIONS, JSON.stringify(submissions));
    } catch (e) {
      console.warn('[StorageService] Error saving all submissions:', e);
      return false;
    }
  },

  /**
   * Load all team reflections / wow moment quotes
   */
  getTeamReflections(): Record<string, string> {
    try {
      const raw = safeGetItem(STORAGE_KEYS.TEAM_REFLECTIONS);
      if (!raw) return {};
      const parsed = JSON.parse(raw);
      if (typeof parsed === 'object' && parsed !== null) {
        return parsed as Record<string, string>;
      }
      return {};
    } catch (e) {
      console.warn('[StorageService] Error reading team reflections:', e);
      return {};
    }
  },

  /**
   * Get reflection quote for a specific team
   */
  getTeamReflection(teamId: string): string | null {
    const all = this.getTeamReflections();
    return all[teamId] || null;
  },

  /**
   * Save reflection quote for a specific team
   */
  saveTeamReflection(teamId: string, reflectionText: string): void {
    try {
      const current = this.getTeamReflections();
      current[teamId] = reflectionText.trim();
      safeSetItem(STORAGE_KEYS.TEAM_REFLECTIONS, JSON.stringify(current));
    } catch (e) {
      console.warn('[StorageService] Error saving team reflection:', e);
    }
  },

  /**
   * Load last viewed task index for a given team (Focus mode pagination bookmark)
   */
  getTeamTaskIndex(teamId: string, fallback = 0): number {
    try {
      const raw = safeGetItem(STORAGE_KEYS.TEAM_TASK_INDEXES);
      if (!raw) return fallback;
      const parsed = JSON.parse(raw);
      if (parsed && typeof parsed[teamId] === 'number' && !isNaN(parsed[teamId])) {
        return Math.max(0, parsed[teamId]);
      }
      return fallback;
    } catch (e) {
      console.warn('[StorageService] Error getting team task index:', e);
      return fallback;
    }
  },

  /**
   * Save current viewed task index for a given team
   */
  saveTeamTaskIndex(teamId: string, index: number): void {
    try {
      const raw = safeGetItem(STORAGE_KEYS.TEAM_TASK_INDEXES);
      let map: Record<string, number> = {};
      if (raw) {
        try {
          map = JSON.parse(raw) || {};
        } catch {}
      }
      map[teamId] = Math.max(0, index);
      safeSetItem(STORAGE_KEYS.TEAM_TASK_INDEXES, JSON.stringify(map));
    } catch (e) {
      console.warn('[StorageService] Error saving team task index:', e);
    }
  },

  /**
   * Load Padlet / Synthesis notes
   */
  getSynthesisNotes<T = TeamSynthesisNote>(defaults: T[] = []): T[] {
    try {
      const raw = safeGetItem(STORAGE_KEYS.SYNTHESIS_NOTES);
      if (!raw) return defaults;
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed as T[];
      }
      return defaults;
    } catch (e) {
      console.warn('[StorageService] Error loading synthesis notes:', e);
      return defaults;
    }
  },

  /**
   * Save Padlet / Synthesis notes
   */
  saveSynthesisNotes<T = TeamSynthesisNote>(notes: T[]): boolean {
    try {
      return safeSetItem(STORAGE_KEYS.SYNTHESIS_NOTES, JSON.stringify(notes));
    } catch (e) {
      console.warn('[StorageService] Error saving synthesis notes:', e);
      return false;
    }
  },

  /**
   * Load active navigation tab with safe fallback
   */
  getActiveTab(fallback = 'home'): string {
    try {
      const tab = safeGetItem(STORAGE_KEYS.ACTIVE_TAB);
      return tab || fallback;
    } catch {
      return fallback;
    }
  },

  /**
   * Save active navigation tab
   */
  saveActiveTab(tab: string): void {
    try {
      safeSetItem(STORAGE_KEYS.ACTIVE_TAB, tab);
    } catch (e) {
      console.warn('[StorageService] Error saving active tab:', e);
    }
  },

  /**
   * Load UI language
   */
  getLanguage(fallback: 'el' | 'en' = 'el'): 'el' | 'en' {
    try {
      const lang = safeGetItem(STORAGE_KEYS.LANGUAGE);
      return lang === 'en' || lang === 'el' ? lang : fallback;
    } catch {
      return fallback;
    }
  },

  /**
   * Save UI language
   */
  saveLanguage(lang: 'el' | 'en'): void {
    try {
      safeSetItem(STORAGE_KEYS.LANGUAGE, lang);
    } catch (e) {
      console.warn('[StorageService] Error saving language:', e);
    }
  },

  /**
   * Export all game state as JSON string for backup / sync
   */
  exportAllData(): string {
    try {
      const data = {
        version: 10,
        exportedAt: new Date().toISOString(),
        submissions: this.getSubmissions(),
        teamIndexes: safeGetItem(STORAGE_KEYS.TEAM_TASK_INDEXES)
          ? JSON.parse(safeGetItem(STORAGE_KEYS.TEAM_TASK_INDEXES) || '{}')
          : {},
        synthesisNotes: this.getSynthesisNotes(),
        language: this.getLanguage(),
        taskOrder: this.getTaskOrder(),
        customTeamTitles: this.getCustomTeamTitles()
      };
      return JSON.stringify(data, null, 2);
    } catch (e) {
      console.error('[StorageService] Failed to export data:', e);
      return '{}';
    }
  },

  /**
   * Import data from JSON string
   */
  importData(jsonString: string): boolean {
    try {
      const parsed = JSON.parse(jsonString);
      if (!parsed || typeof parsed !== 'object') return false;

      if (parsed.submissions && typeof parsed.submissions === 'object') {
        safeSetItem(STORAGE_KEYS.SUBMISSIONS, JSON.stringify(parsed.submissions));
      }
      if (parsed.teamIndexes && typeof parsed.teamIndexes === 'object') {
        safeSetItem(STORAGE_KEYS.TEAM_TASK_INDEXES, JSON.stringify(parsed.teamIndexes));
      }
      if (Array.isArray(parsed.synthesisNotes)) {
        safeSetItem(STORAGE_KEYS.SYNTHESIS_NOTES, JSON.stringify(parsed.synthesisNotes));
      }
      if (parsed.language === 'el' || parsed.language === 'en') {
        safeSetItem(STORAGE_KEYS.LANGUAGE, parsed.language);
      }
      if (Array.isArray(parsed.taskOrder)) {
        this.saveTaskOrder(parsed.taskOrder);
      }
      if (parsed.customTeamTitles && typeof parsed.customTeamTitles === 'object') {
        this.saveCustomTeamTitles(parsed.customTeamTitles);
      }
      return true;
    } catch (e) {
      console.error('[StorageService] Failed to import data:', e);
      return false;
    }
  },

  /**
   * Load task active/inactive overrides
   */
  getTaskActiveOverrides(): Record<string, boolean> {
    try {
      const raw = safeGetItem(STORAGE_KEYS.TASK_ACTIVE_OVERRIDES);
      if (!raw) return {};
      const parsed = JSON.parse(raw);
      if (parsed && typeof parsed === 'object') {
        return parsed as Record<string, boolean>;
      }
      return {};
    } catch (e) {
      console.warn('[StorageService] Error loading task active overrides:', e);
      return {};
    }
  },

  /**
   * Save a single task active override
   */
  saveTaskActiveOverride(taskId: string, isActive: boolean): Record<string, boolean> {
    try {
      const current = this.getTaskActiveOverrides();
      const updated = { ...current, [taskId]: isActive };
      safeSetItem(STORAGE_KEYS.TASK_ACTIVE_OVERRIDES, JSON.stringify(updated));
      return updated;
    } catch (e) {
      console.warn('[StorageService] Error saving task active override:', e);
      return {};
    }
  },

  /**
   * Save all task active overrides
   */
  saveAllTaskActiveOverrides(overrides: Record<string, boolean>): boolean {
    try {
      return safeSetItem(STORAGE_KEYS.TASK_ACTIVE_OVERRIDES, JSON.stringify(overrides));
    } catch (e) {
      console.warn('[StorageService] Error saving all task active overrides:', e);
      return false;
    }
  },

  /**
   * Reset all task active overrides to defaults
   */
  resetTaskActiveOverrides(): void {
    try {
      safeRemoveItem(STORAGE_KEYS.TASK_ACTIVE_OVERRIDES);
    } catch (e) {
      console.warn('[StorageService] Error resetting task active overrides:', e);
    }
  },

  /**
   * Load custom reordered sequence of tasks (array of task IDs)
   */
  getTaskOrder(): string[] {
    try {
      const raw = safeGetItem(STORAGE_KEYS.TASK_ORDER);
      if (!raw) return [];
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        return parsed.map((item) => String(item).trim()).filter(Boolean);
      }
      return [];
    } catch (e) {
      console.warn('[StorageService] Error loading task order:', e);
      return [];
    }
  },

  /**
   * Save custom reordered sequence of tasks immediately to localStorage
   */
  saveTaskOrder(order: string[]): boolean {
    try {
      const success = safeSetItem(STORAGE_KEYS.TASK_ORDER, JSON.stringify(order));
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('boundpad:taskOrder', { detail: { order } }));
      }
      return success;
    } catch (e) {
      console.warn('[StorageService] Error saving task order:', e);
      return false;
    }
  },

  /**
   * Reset task sequence to default curriculum order
   */
  resetTaskOrder(): void {
    try {
      safeRemoveItem(STORAGE_KEYS.TASK_ORDER);
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('boundpad:taskOrder', { detail: { order: [] } }));
      }
    } catch (e) {
      console.warn('[StorageService] Error resetting task order:', e);
    }
  },

  /**
   * Check if admin is currently authenticated in session
   */
  isAdminAuthenticated(): boolean {
    try {
      const auth = safeGetItem(STORAGE_KEYS.ADMIN_AUTH);
      return auth === 'true';
    } catch {
      return false;
    }
  },

  /**
   * Set admin authentication status
   */
  setAdminAuthenticated(auth: boolean): void {
    try {
      if (auth) {
        safeSetItem(STORAGE_KEYS.ADMIN_AUTH, 'true');
      } else {
        safeRemoveItem(STORAGE_KEYS.ADMIN_AUTH);
      }
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('boundpad:adminAuth', { detail: auth }));
      }
    } catch (e) {
      console.warn('[StorageService] Error setting admin auth:', e);
    }
  },

  /**
   * Load custom edited questions
   */
  getCustomQuestions(): Record<string, any> {
    try {
      const raw = safeGetItem(STORAGE_KEYS.CUSTOM_QUESTIONS);
      if (!raw) return {};
      const parsed = JSON.parse(raw);
      if (parsed && typeof parsed === 'object') {
        return parsed;
      }
      return {};
    } catch (e) {
      console.warn('[StorageService] Error loading custom questions:', e);
      return {};
    }
  },

  /**
   * Save a single custom question to localStorage
   */
  saveCustomQuestion(question: any): Record<string, any> {
    try {
      const current = this.getCustomQuestions();
      const updated = { ...current, [question.id]: question };
      safeSetItem(STORAGE_KEYS.CUSTOM_QUESTIONS, JSON.stringify(updated));
      return updated;
    } catch (e) {
      console.warn('[StorageService] Error saving custom question:', e);
      return {};
    }
  },

  /**
   * Save all custom questions
   */
  saveAllCustomQuestions(questions: Record<string, any>): boolean {
    try {
      return safeSetItem(STORAGE_KEYS.CUSTOM_QUESTIONS, JSON.stringify(questions));
    } catch (e) {
      console.warn('[StorageService] Error saving all custom questions:', e);
      return false;
    }
  },

  /**
   * Reset a custom question back to original default
   */
  resetCustomQuestion(questionId: string): Record<string, any> {
    try {
      const current = this.getCustomQuestions();
      delete current[questionId];
      safeSetItem(STORAGE_KEYS.CUSTOM_QUESTIONS, JSON.stringify(current));
      return current;
    } catch (e) {
      console.warn('[StorageService] Error resetting custom question:', e);
      return {};
    }
  },

  /**
   * Reset all custom questions back to original defaults
   */
  resetAllCustomQuestions(): void {
    try {
      safeRemoveItem(STORAGE_KEYS.CUSTOM_QUESTIONS);
    } catch (e) {
      console.warn('[StorageService] Error resetting all custom questions:', e);
    }
  },

  /**
   * Check if game has been started by teacher (Lobby vs Started)
   */
  getGameStarted(): boolean {
    try {
      const val = safeGetItem(STORAGE_KEYS.GAME_STARTED);
      return val === 'true';
    } catch {
      return false;
    }
  },

  /**
   * Get timestamp when game was started (milliseconds since epoch)
   */
  getGameStartTimestamp(): number {
    try {
      const raw = safeGetItem(STORAGE_KEYS.GAME_START_TIMESTAMP);
      if (!raw) return 0;
      const parsed = parseInt(raw, 10);
      return isNaN(parsed) ? 0 : parsed;
    } catch {
      return 0;
    }
  },

  /**
   * Set game started status by teacher and dispatch storage event
   */
  setGameStarted(started: boolean): void {
    try {
      safeSetItem(STORAGE_KEYS.GAME_STARTED, started ? 'true' : 'false');
      if (started) {
        const currentTs = this.getGameStartTimestamp();
        if (!currentTs || currentTs <= 0) {
          safeSetItem(STORAGE_KEYS.GAME_START_TIMESTAMP, Date.now().toString());
        }
      } else {
        safeRemoveItem(STORAGE_KEYS.GAME_START_TIMESTAMP);
      }
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('boundpad:gameStarted', { detail: { started, timestamp: started ? this.getGameStartTimestamp() : 0 } }));
      }
    } catch (e) {
      console.warn('[StorageService] Error setting game started:', e);
    }
  },

  /**
   * Reset game start timestamp manually (e.g. restart timer)
   */
  restartGameTimer(): void {
    try {
      const now = Date.now();
      safeSetItem(STORAGE_KEYS.GAME_START_TIMESTAMP, now.toString());
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('boundpad:timerReset', { detail: { timestamp: now } }));
      }
    } catch (e) {
      console.warn('[StorageService] Error restarting game timer:', e);
    }
  },

  /**
   * Load group-specific timer deadlines (in minutes)
   */
  getGroupTimers(): Record<string, number> {
    try {
      const raw = safeGetItem(STORAGE_KEYS.GROUP_TIMERS);
      if (!raw) return { 'team-alpha': 20, 'team-beta': 20, 'team-gamma': 20, 'team-delta': 20 };
      const parsed = JSON.parse(raw);
      if (parsed && typeof parsed === 'object') return parsed;
      return { 'team-alpha': 20, 'team-beta': 20, 'team-gamma': 20, 'team-delta': 20 };
    } catch {
      return { 'team-alpha': 20, 'team-beta': 20, 'team-gamma': 20, 'team-delta': 20 };
    }
  },

  /**
   * Save group-specific timer deadlines
   */
  saveGroupTimers(timers: Record<string, number>): void {
    try {
      safeSetItem(STORAGE_KEYS.GROUP_TIMERS, JSON.stringify(timers));
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('boundpad:groupTimers', { detail: { timers } }));
      }
    } catch (e) {
      console.warn('[StorageService] Error saving group timers:', e);
    }
  },

  /**
   * Load task-specific timer limits (in minutes)
   */
  getTaskTimers(): Record<string, number> {
    try {
      const raw = safeGetItem(STORAGE_KEYS.TASK_TIMERS);
      if (!raw) return {};
      const parsed = JSON.parse(raw);
      if (parsed && typeof parsed === 'object') return parsed;
      return {};
    } catch {
      return {};
    }
  },

  /**
   * Save task-specific timer limits
   */
  saveTaskTimers(timers: Record<string, number>): void {
    try {
      safeSetItem(STORAGE_KEYS.TASK_TIMERS, JSON.stringify(timers));
    } catch (e) {
      console.warn('[StorageService] Error saving task timers:', e);
    }
  },

  /**
   * Load custom team/subgroup titles and slogans (both Greek and English)
   */
  getCustomTeamTitles(): Record<string, { name?: string; name_en?: string; slogan?: string; slogan_en?: string }> {
    try {
      const raw = safeGetItem(STORAGE_KEYS.CUSTOM_TEAM_TITLES);
      if (!raw) return {};
      const parsed = JSON.parse(raw);
      if (parsed && typeof parsed === 'object') {
        return parsed as Record<string, { name?: string; name_en?: string; slogan?: string; slogan_en?: string }>;
      }
      return {};
    } catch {
      return {};
    }
  },

  /**
   * Save all custom team titles immediately to localStorage & broadcast event
   */
  saveCustomTeamTitles(
    titles: Record<string, { name?: string; name_en?: string; slogan?: string; slogan_en?: string }>
  ): boolean {
    try {
      const success = safeSetItem(STORAGE_KEYS.CUSTOM_TEAM_TITLES, JSON.stringify(titles));
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('boundpad:teamTitles', { detail: { titles } }));
        window.dispatchEvent(new Event('storage'));
      }
      return success;
    } catch (e) {
      console.warn('[StorageService] Error saving custom team titles:', e);
      return false;
    }
  },

  /**
   * Save title overrides for a specific team
   */
  saveCustomTeamTitle(
    teamId: string,
    titleData: { name?: string; name_en?: string; slogan?: string; slogan_en?: string }
  ): Record<string, { name?: string; name_en?: string; slogan?: string; slogan_en?: string }> {
    try {
      const current = this.getCustomTeamTitles();
      const updatedTitles = {
        ...current,
        [teamId]: {
          ...(current[teamId] || {}),
          ...titleData
        }
      };
      this.saveCustomTeamTitles(updatedTitles);

      // Directly update the team in the active subgroups pool
      const currentSubgroups = this.getSubgroups();
      const updatedSubgroups = currentSubgroups.map((s) => {
        if (s.id === teamId) {
          return {
            ...s,
            name: titleData.name && titleData.name.trim().length > 0 ? titleData.name.trim() : s.name,
            name_en: titleData.name_en && titleData.name_en.trim().length > 0 ? titleData.name_en.trim() : (s.name_en || s.name),
            slogan: titleData.slogan && titleData.slogan.trim().length > 0 ? titleData.slogan.trim() : s.slogan,
            slogan_en: titleData.slogan_en && titleData.slogan_en.trim().length > 0 ? titleData.slogan_en.trim() : (s.slogan_en || s.slogan)
          };
        }
        return s;
      });
      this.saveSubgroups(updatedSubgroups);
      this.syncSubgroupsToServer(updatedSubgroups);

      return updatedTitles;
    } catch (e) {
      console.warn('[StorageService] Error saving custom team title:', e);
      return {};
    }
  },

  /**
   * Reset title overrides for a specific team back to default
   */
  resetCustomTeamTitle(
    teamId: string
  ): Record<string, { name?: string; name_en?: string; slogan?: string; slogan_en?: string }> {
    try {
      const current = this.getCustomTeamTitles();
      delete current[teamId];
      this.saveCustomTeamTitles(current);

      const defaultTeam = masterTeamsPool.find((t) => t.id === teamId);
      if (defaultTeam) {
        const currentSubgroups = this.getSubgroups();
        const updatedSubgroups = currentSubgroups.map((s) => {
          if (s.id === teamId) {
            return {
              ...s,
              name: defaultTeam.name,
              name_en: defaultTeam.name_en,
              slogan: defaultTeam.slogan,
              slogan_en: defaultTeam.slogan_en
            };
          }
          return s;
        });
        this.saveSubgroups(updatedSubgroups);
        this.syncSubgroupsToServer(updatedSubgroups);
      }

      return current;
    } catch (e) {
      console.warn('[StorageService] Error resetting custom team title:', e);
      return {};
    }
  },

  /**
   * Reset all custom team titles back to curriculum defaults
   */
  resetAllCustomTeamTitles(): void {
    try {
      safeRemoveItem(STORAGE_KEYS.CUSTOM_TEAM_TITLES);
      const currentSubgroups = this.getSubgroups();
      const updatedSubgroups = currentSubgroups.map((s) => {
        const defaultTeam = masterTeamsPool.find((t) => t.id === s.id);
        if (defaultTeam) {
          return {
            ...s,
            name: defaultTeam.name,
            name_en: defaultTeam.name_en,
            slogan: defaultTeam.slogan,
            slogan_en: defaultTeam.slogan_en
          };
        }
        return s;
      });
      this.saveSubgroups(updatedSubgroups);
      this.syncSubgroupsToServer(updatedSubgroups);

      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('boundpad:teamTitles', { detail: { titles: {} } }));
        window.dispatchEvent(new Event('storage'));
      }
    } catch (e) {
      console.warn('[StorageService] Error resetting all custom team titles:', e);
    }
  },

  /**
   * Clear all submissions, scores, uploaded photos, reflections, and progress for a single team
   */
  clearTeamData(teamId: string): Record<string, Submission> {
    try {
      const current = this.getSubmissions();
      const subgroups = this.getSubgroups();

      // Identify all related IDs (including any subgroups assigned to this track or the exact team ID)
      const matchingIds = new Set<string>([teamId]);
      for (const sub of subgroups) {
        if (sub.id === teamId || sub.trackId === teamId) {
          matchingIds.add(sub.id);
          if (sub.trackId) matchingIds.add(sub.trackId);
        }
      }

      const updated: Record<string, Submission> = {};
      for (const [key, sub] of Object.entries(current)) {
        const isMatch =
          matchingIds.has(sub?.teamId) ||
          Array.from(matchingIds).some((id) => key.startsWith(`${id}_`));
        if (isMatch) {
          continue; // Delete this team's submission
        }
        updated[key] = sub;
      }
      this.saveAllSubmissions(updated);

      // Clear team reflection quote
      try {
        const rawRef = safeGetItem(STORAGE_KEYS.TEAM_REFLECTIONS);
        if (rawRef) {
          const refs = JSON.parse(rawRef) || {};
          matchingIds.forEach((id) => delete refs[id]);
          safeSetItem(STORAGE_KEYS.TEAM_REFLECTIONS, JSON.stringify(refs));
        }
      } catch (err) {
        console.warn('Error clearing team reflection:', err);
      }

      // Reset team task index bookmark to 0
      matchingIds.forEach((id) => this.saveTeamTaskIndex(id, 0));

      // Dispatch instant UI broadcast
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('boundpad:submissions', { detail: { submissions: updated, resetTeamId: teamId, matchingIds: Array.from(matchingIds) } }));
        window.dispatchEvent(new CustomEvent('boundpad:teamReset', { detail: { teamId, matchingIds: Array.from(matchingIds) } }));
        window.dispatchEvent(new Event('storage'));
      }
      return updated;
    } catch (e) {
      console.warn('[StorageService] Error clearing team data:', e);
      return {};
    }
  },

  /**
   * Clear all answers, scores, photos, reflections and progress globally across all teams
   */
  clearAllSubmissionsAndProgress(): void {
    try {
      safeSetItem(STORAGE_KEYS.SUBMISSIONS, JSON.stringify({}));
      memoryCache[STORAGE_KEYS.SUBMISSIONS] = JSON.stringify({});

      safeSetItem(STORAGE_KEYS.TEAM_REFLECTIONS, JSON.stringify({}));
      memoryCache[STORAGE_KEYS.TEAM_REFLECTIONS] = JSON.stringify({});

      safeSetItem(STORAGE_KEYS.TEAM_TASK_INDEXES, JSON.stringify({}));
      memoryCache[STORAGE_KEYS.TEAM_TASK_INDEXES] = JSON.stringify({});

      // Also clean up any extra legacy keys in localStorage that might hold submissions
      if (typeof window !== 'undefined' && window.localStorage) {
        try {
          const keysToRemove: string[] = [];
          for (let i = 0; i < window.localStorage.length; i++) {
            const k = window.localStorage.key(i);
            if (k && (k.includes('submission') || k.includes('reflection') || k.includes('task_index'))) {
              if (k !== STORAGE_KEYS.SUBMISSIONS && k !== STORAGE_KEYS.TEAM_REFLECTIONS && k !== STORAGE_KEYS.TEAM_TASK_INDEXES) {
                keysToRemove.push(k);
              }
            }
          }
          keysToRemove.forEach((k) => window.localStorage.removeItem(k));
        } catch (e) {
          console.warn('Error scanning localStorage keys:', e);
        }
      }

      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('boundpad:submissions', { detail: { submissions: {}, resetAll: true } }));
        window.dispatchEvent(new CustomEvent('boundpad:globalReset', { detail: {} }));
        window.dispatchEvent(new Event('storage'));
      }
    } catch (e) {
      console.warn('[StorageService] Error clearing all submissions and progress:', e);
    }
  },

  /**
   * Clear all stored game data safely
   */
  clearAll(): void {
    try {
      safeRemoveItem(STORAGE_KEYS.SUBMISSIONS);
      safeRemoveItem(STORAGE_KEYS.TEAM_TASK_INDEXES);
      safeRemoveItem(STORAGE_KEYS.SYNTHESIS_NOTES);
      safeRemoveItem(STORAGE_KEYS.ACTIVE_TAB);
      safeRemoveItem(STORAGE_KEYS.TASK_ACTIVE_OVERRIDES);
      safeRemoveItem(STORAGE_KEYS.CUSTOM_QUESTIONS);
      safeRemoveItem(STORAGE_KEYS.TEAM_REFLECTIONS);
      safeRemoveItem(STORAGE_KEYS.CUSTOM_TEAM_TITLES);
      safeRemoveItem(STORAGE_KEYS.CUSTOM_SUBGROUPS);
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('boundpad:submissions', { detail: { submissions: {}, resetAll: true } }));
        window.dispatchEvent(new CustomEvent('boundpad:teamTitles', { detail: { titles: {} } }));
        window.dispatchEvent(new CustomEvent('boundpad:subgroups', { detail: { subgroups: masterTeamsPool } }));
        window.dispatchEvent(new Event('storage'));
      }
    } catch (e) {
      console.warn('[StorageService] Error clearing storage:', e);
    }
  },

  /**
   * Load active student subgroups (each mapped to a core thematic track)
   */
  getSubgroups(): Team[] {
    try {
      const raw = safeGetItem(STORAGE_KEYS.CUSTOM_SUBGROUPS);
      if (!raw) {
        return masterTeamsPool;
      }
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed as Team[];
      }
      return masterTeamsPool;
    } catch (e) {
      console.warn('[StorageService] Error reading subgroups:', e);
      return masterTeamsPool;
    }
  },

  /**
   * Completely purge deleted subgroups and their orphaned data from localStorage
   * so student devices never retain old deleted items.
   */
  purgeDeletedSubgroupsFromLocalStorage(activeSubgroups: Team[], explicitDeletedIds: string[] = []): void {
    try {
      const activeIdSet = new Set(activeSubgroups.map((s) => s.id));
      const deletedSet = new Set(explicitDeletedIds);

      // Save strictly the active subgroups to local storage and memory cache
      safeSetItem(STORAGE_KEYS.CUSTOM_SUBGROUPS, JSON.stringify(activeSubgroups));

      // 1. Purge from task indexes
      try {
        const rawIndexes = safeGetItem(STORAGE_KEYS.TEAM_TASK_INDEXES);
        if (rawIndexes) {
          const parsed = JSON.parse(rawIndexes);
          if (parsed && typeof parsed === 'object') {
            let changed = false;
            for (const key of Object.keys(parsed)) {
              if (deletedSet.has(key) || !activeIdSet.has(key)) {
                delete parsed[key];
                changed = true;
              }
            }
            if (changed) {
              safeSetItem(STORAGE_KEYS.TEAM_TASK_INDEXES, JSON.stringify(parsed));
            }
          }
        }
      } catch (err) {
        console.warn('Error purging task indexes:', err);
      }

      // 2. Purge from submissions
      try {
        const rawSubs = safeGetItem(STORAGE_KEYS.SUBMISSIONS);
        if (rawSubs) {
          const parsed = JSON.parse(rawSubs);
          if (parsed && typeof parsed === 'object') {
            let changed = false;
            for (const [key, sub] of Object.entries(parsed as Record<string, any>)) {
              const teamId = sub?.teamId || key.split('_')[0];
              if (deletedSet.has(teamId) || (teamId && !activeIdSet.has(teamId))) {
                delete parsed[key];
                changed = true;
              }
            }
            if (changed) {
              safeSetItem(STORAGE_KEYS.SUBMISSIONS, JSON.stringify(parsed));
              if (typeof window !== 'undefined') {
                window.dispatchEvent(new CustomEvent('boundpad:submissions', { detail: { submissions: parsed } }));
              }
            }
          }
        }
      } catch (err) {
        console.warn('Error purging submissions:', err);
      }

      // 3. Purge from reflections
      try {
        const rawReflections = safeGetItem(STORAGE_KEYS.TEAM_REFLECTIONS);
        if (rawReflections) {
          const parsed = JSON.parse(rawReflections);
          if (parsed && typeof parsed === 'object') {
            let changed = false;
            for (const key of Object.keys(parsed)) {
              if (deletedSet.has(key) || !activeIdSet.has(key)) {
                delete parsed[key];
                changed = true;
              }
            }
            if (changed) {
              safeSetItem(STORAGE_KEYS.TEAM_REFLECTIONS, JSON.stringify(parsed));
            }
          }
        }
      } catch (err) {
        console.warn('Error purging reflections:', err);
      }

      // 4. Purge from team titles
      try {
        const rawTitles = safeGetItem(STORAGE_KEYS.CUSTOM_TEAM_TITLES);
        if (rawTitles) {
          const parsed = JSON.parse(rawTitles);
          if (parsed && typeof parsed === 'object') {
            let changed = false;
            for (const key of Object.keys(parsed)) {
              if (deletedSet.has(key) || !activeIdSet.has(key)) {
                delete parsed[key];
                changed = true;
              }
            }
            if (changed) {
              safeSetItem(STORAGE_KEYS.CUSTOM_TEAM_TITLES, JSON.stringify(parsed));
              if (typeof window !== 'undefined') {
                window.dispatchEvent(new CustomEvent('boundpad:teamTitles', { detail: { titles: parsed } }));
              }
            }
          }
        }
      } catch (err) {
        console.warn('Error purging titles:', err);
      }

      // 5. Purge from group timers
      try {
        const rawTimers = safeGetItem(STORAGE_KEYS.GROUP_TIMERS);
        if (rawTimers) {
          const parsed = JSON.parse(rawTimers);
          if (parsed && typeof parsed === 'object') {
            let changed = false;
            for (const key of Object.keys(parsed)) {
              if (deletedSet.has(key) || (!['team-alpha', 'team-beta', 'team-gamma', 'team-delta'].includes(key) && !activeIdSet.has(key))) {
                delete parsed[key];
                changed = true;
              }
            }
            if (changed) {
              safeSetItem(STORAGE_KEYS.GROUP_TIMERS, JSON.stringify(parsed));
            }
          }
        }
      } catch (err) {
        console.warn('Error purging timers:', err);
      }

      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('boundpad:subgroups', { detail: { subgroups: activeSubgroups } }));
        window.dispatchEvent(new Event('storage'));
      }
    } catch (e) {
      console.warn('[StorageService] Error during localStorage purge of deleted subgroups:', e);
    }
  },

  /**
   * Apply authoritative state from server, purging any deleted items
   */
  applyAuthoritativeSubgroups(serverSubgroups: Team[], deletedIds: string[] = [], serverVersion?: number): boolean {
    if (!Array.isArray(serverSubgroups) || serverSubgroups.length === 0) {
      return false;
    }
    this.purgeDeletedSubgroupsFromLocalStorage(serverSubgroups, deletedIds);
    if (typeof serverVersion === 'number') {
      safeSetItem(STORAGE_KEYS.SYNC_VERSION, serverVersion.toString());
    }
    return true;
  },

  /**
   * Fetch current authoritative subgroups from server and sync localStorage
   */
  async fetchServerSubgroups(): Promise<Team[] | null> {
    try {
      if (typeof window === 'undefined') return null;
      const res = await fetch('/api/sync/subgroups', {
        headers: { 'Accept': 'application/json' },
        cache: 'no-store'
      });
      if (!res.ok) return null;
      const data = await res.json();
      if (data && Array.isArray(data.subgroups) && data.subgroups.length > 0) {
        this.applyAuthoritativeSubgroups(data.subgroups, data.deletedSubgroupIds || [], data.version);
        if (data.customTeamTitles && typeof data.customTeamTitles === 'object') {
          safeSetItem(STORAGE_KEYS.CUSTOM_TEAM_TITLES, JSON.stringify(data.customTeamTitles));
          window.dispatchEvent(new CustomEvent('boundpad:teamTitles', { detail: { titles: data.customTeamTitles } }));
        }
        if (typeof data.isSubgroupsMode === 'boolean') {
          const current = this.getSubgroupsModeEnabled();
          if (current !== data.isSubgroupsMode) {
            safeSetItem(STORAGE_KEYS.SUBGROUPS_MODE_ENABLED, data.isSubgroupsMode ? 'true' : 'false');
            window.dispatchEvent(new CustomEvent('boundpad:subgroupsMode', { detail: { enabled: data.isSubgroupsMode } }));
          }
        }
        return data.subgroups;
      }
      return null;
    } catch (err) {
      console.warn('[StorageService] fetchServerSubgroups error:', err);
      return null;
    }
  },

  /**
   * Asynchronously push subgroups updates to server
   */
  async syncSubgroupsToServer(subgroups: Team[], options?: { deletedSubgroupId?: string }): Promise<void> {
    try {
      if (typeof window === 'undefined') return;
      const currentTitles = this.getCustomTeamTitles();
      await fetch('/api/sync/subgroups', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          subgroups,
          customTeamTitles: currentTitles,
          deletedSubgroupId: options?.deletedSubgroupId
        })
      });
    } catch (err) {
      console.warn('[StorageService] syncSubgroupsToServer error:', err);
    }
  },

  /**
   * Asynchronously push subgroup deletion to server
   */
  async syncDeleteSubgroupToServer(teamId: string): Promise<void> {
    try {
      if (typeof window === 'undefined') return;
      await fetch('/api/sync/delete-subgroup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ subgroupId: teamId })
      });
    } catch (err) {
      console.warn('[StorageService] syncDeleteSubgroupToServer error:', err);
    }
  },

  /**
   * Asynchronously push reset to server
   */
  async syncResetSubgroupsToServer(): Promise<void> {
    try {
      if (typeof window === 'undefined') return;
      await fetch('/api/sync/reset-subgroups', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });
    } catch (err) {
      console.warn('[StorageService] syncResetSubgroupsToServer error:', err);
    }
  },

  /**
   * Save active subgroups list and broadcast event
   */
  saveSubgroups(subgroups: Team[]): boolean {
    try {
      const success = safeSetItem(STORAGE_KEYS.CUSTOM_SUBGROUPS, JSON.stringify(subgroups));
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('boundpad:subgroups', { detail: { subgroups } }));
        window.dispatchEvent(new Event('storage'));
      }
      return success;
    } catch (e) {
      console.warn('[StorageService] Error saving subgroups:', e);
      return false;
    }
  },

  /**
   * Add a new subgroup assigned to a core thematic track
   */
  addSubgroup(subgroup: Team): Team[] {
    try {
      const current = this.getSubgroups();
      // Ensure unique ID
      const exists = current.some((s) => s.id === subgroup.id);
      const finalId = exists ? `${subgroup.id}-${Date.now().toString().slice(-4)}` : subgroup.id;
      const updated = [...current, { ...subgroup, id: finalId }];
      this.saveSubgroups(updated);

      if (crossTabChannel) {
        try {
          crossTabChannel.postMessage({ type: 'UPDATE_SUBGROUPS', subgroups: updated });
        } catch {}
      }

      // Sync with server immediately
      this.syncSubgroupsToServer(updated);

      return updated;
    } catch (e) {
      console.warn('[StorageService] Error adding subgroup:', e);
      return this.getSubgroups();
    }
  },

  /**
   * Update fields of an existing subgroup
   */
  updateSubgroup(teamId: string, updates: Partial<Team>): Team[] {
    try {
      const current = this.getSubgroups();
      const updated = current.map((s) => (s.id === teamId ? { ...s, ...updates } : s));
      this.saveSubgroups(updated);

      if (crossTabChannel) {
        try {
          crossTabChannel.postMessage({ type: 'UPDATE_SUBGROUPS', subgroups: updated });
        } catch {}
      }

      // Sync with server immediately
      this.syncSubgroupsToServer(updated);

      return updated;
    } catch (e) {
      console.warn('[StorageService] Error updating subgroup:', e);
      return this.getSubgroups();
    }
  },

  /**
   * Delete a custom subgroup and purge all traces from localStorage
   */
  deleteSubgroup(teamId: string): Team[] {
    try {
      const current = this.getSubgroups();
      // Prevent deleting if it would leave zero subgroups
      if (current.length <= 1) return current;
      const updated = current.filter((s) => s.id !== teamId);

      // Clean all team data and purge deleted subgroup from all localStorage caches!
      this.purgeDeletedSubgroupsFromLocalStorage(updated, [teamId]);
      this.clearTeamData(teamId);

      if (crossTabChannel) {
        try {
          crossTabChannel.postMessage({ type: 'DELETE_SUBGROUP', teamId, subgroups: updated });
        } catch {}
      }

      // Immediately sync with server so student devices update instantaneously
      this.syncDeleteSubgroupToServer(teamId);

      return updated;
    } catch (e) {
      console.warn('[StorageService] Error deleting subgroup:', e);
      return this.getSubgroups();
    }
  },

  /**
   * Reset subgroups back to curriculum defaults (the 4 base groups)
   */
  resetSubgroupsToDefault(): Team[] {
    try {
      this.purgeDeletedSubgroupsFromLocalStorage(masterTeamsPool);

      if (crossTabChannel) {
        try {
          crossTabChannel.postMessage({ type: 'RESET_SUBGROUPS', subgroups: masterTeamsPool });
        } catch {}
      }

      this.syncResetSubgroupsToServer();
      return masterTeamsPool;
    } catch (e) {
      console.warn('[StorageService] Error resetting subgroups:', e);
      return masterTeamsPool;
    }
  },

  /**
   * Check whether Subgroups Mode is active (true: multiple subgroups like 1.1, 1.2; false: 4 main teams)
   */
  getSubgroupsModeEnabled(): boolean {
    try {
      const val = safeGetItem(STORAGE_KEYS.SUBGROUPS_MODE_ENABLED);
      if (val === null) return true; // Default to true (subgroups active)
      return val === 'true';
    } catch {
      return true;
    }
  },

  /**
   * Toggle or set Subgroups Mode (with strict idempotency to prevent render loops)
   */
  setSubgroupsModeEnabled(enabled: boolean): void {
    try {
      const current = this.getSubgroupsModeEnabled();
      if (current === enabled) {
        return; // Idempotent guard: already in target state
      }
      safeSetItem(STORAGE_KEYS.SUBGROUPS_MODE_ENABLED, enabled ? 'true' : 'false');
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('boundpad:subgroupsMode', { detail: { enabled } }));
      }
      if (crossTabChannel) {
        try {
          crossTabChannel.postMessage({ type: 'TOGGLE_SUBGROUPS_MODE', enabled });
        } catch {}
      }
      this.syncSubgroupsModeToServer(enabled);
    } catch (e) {
      console.warn('[StorageService] Error saving subgroups mode:', e);
    }
  },

  /**
   * Set Subgroups Mode locally without triggering syncToServer (used by SSE & server pull)
   */
  setSubgroupsModeLocally(enabled: boolean): void {
    try {
      const current = this.getSubgroupsModeEnabled();
      if (current === enabled) {
        return;
      }
      safeSetItem(STORAGE_KEYS.SUBGROUPS_MODE_ENABLED, enabled ? 'true' : 'false');
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('boundpad:subgroupsMode', { detail: { enabled } }));
      }
    } catch (e) {
      console.warn('[StorageService] Error saving subgroups mode locally:', e);
    }
  },

  /**
   * Push subgroups mode state to server
   */
  async syncSubgroupsModeToServer(enabled: boolean): Promise<void> {
    try {
      if (typeof window === 'undefined') return;
      await fetch('/api/sync/subgroups-mode', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ enabled })
      });
    } catch (err) {
      console.warn('[StorageService] syncSubgroupsModeToServer error:', err);
    }
  }
};

// ============================================================================
// CROSS-TAB BROADCAST CHANNEL INITIALIZATION
// ============================================================================
let crossTabChannel: BroadcastChannel | null = null;
if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
  try {
    crossTabChannel = new BroadcastChannel('boundpad_subgroups_sync_channel');
    crossTabChannel.onmessage = (event) => {
      const data = event.data;
      if (data && data.type === 'TOGGLE_SUBGROUPS_MODE') {
        const current = storageService.getSubgroupsModeEnabled();
        if (current !== data.enabled) {
          safeSetItem(STORAGE_KEYS.SUBGROUPS_MODE_ENABLED, data.enabled ? 'true' : 'false');
          window.dispatchEvent(new CustomEvent('boundpad:subgroupsMode', { detail: { enabled: data.enabled } }));
        }
      } else if (data && data.subgroups && Array.isArray(data.subgroups)) {
        storageService.purgeDeletedSubgroupsFromLocalStorage(
          data.subgroups,
          data.teamId ? [data.teamId] : []
        );
      }
    };
  } catch (e) {
    console.warn('BroadcastChannel error:', e);
  }
}

