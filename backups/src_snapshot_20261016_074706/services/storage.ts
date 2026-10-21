import { GameState, Submission, TimerState, Question, Team } from '../types/game';
import {
  INITIAL_GAME_STATE,
  EPIC_CHALLENGE_GAME_STATE,
  VULTURES_GAME_STATE,
  ALL_COMBINED_GAME_STATE
} from '../data/defaultGame';
import { translateGreekToEnglish, translateQuestionAsync, containsGreekCharacters } from '../utils/translator';

const STORAGE_KEY = 'boundpad_gamestate_v6';
const BACKUP_KEY = 'boundpad_gamestate_backup_v6';
const CUSTOM_QUESTIONS_KEY = 'boundpad_custom_questions_v6';
const UNDO_HISTORY_KEY = 'boundpad_undo_history_v6';
const CHANNEL_NAME = 'boundpad_realtime_channel_v6';

class GameSyncService {
  private channel: BroadcastChannel | null = null;
  private listeners: Array<(state: GameState) => void> = [];

  constructor() {
    if (typeof window !== 'undefined') {
      if ('BroadcastChannel' in window) {
        try {
          this.channel = new BroadcastChannel(CHANNEL_NAME);
          this.channel.onmessage = (event) => {
            if (event.data && event.data.type === 'SYNC_STATE') {
              this.notifyListeners(event.data.state);
            }
          };
        } catch {
          // BroadcastChannel unsupported or restricted
        }
      }
    }
  }

  loadState(): GameState {
    if (typeof window === 'undefined') return INITIAL_GAME_STATE;
    try {
      let saved = localStorage.getItem(STORAGE_KEY);
      if (!saved) {
        saved = localStorage.getItem(BACKUP_KEY);
      }

      // If no state saved in v6, initialize cleanly with INITIAL_GAME_STATE (14 questions)
      if (!saved) {
        this.saveState(INITIAL_GAME_STATE);
        return INITIAL_GAME_STATE;
      }

      const parsed = JSON.parse(saved);

      // Validate questions
      const questions: Question[] = Array.isArray(parsed.questions) && parsed.questions.length > 0
        ? parsed.questions
        : INITIAL_GAME_STATE.questions;

      // Validate teams (must have 4 teams)
      const teams: Team[] = Array.isArray(parsed.teams) && parsed.teams.length === 4
        ? parsed.teams
        : INITIAL_GAME_STATE.teams;

      const finalState: GameState = {
        ...INITIAL_GAME_STATE,
        ...parsed,
        teams,
        questions,
        submissions: parsed.submissions || {},
        teamQuestionOrders: parsed.teamQuestionOrders || {},
        teamSequentialModes: parsed.teamSequentialModes || {}
      };

      return finalState;
    } catch (err) {
      console.warn('Could not read state from primary storage, loading default...', err);
      return INITIAL_GAME_STATE;
    }
  }

  loadPreset(preset: 'epic_challenge' | 'vultures' | 'combined'): GameState {
    let presetState: GameState;
    if (preset === 'vultures') {
      presetState = { ...VULTURES_GAME_STATE, updatedAt: Date.now() };
    } else if (preset === 'combined') {
      presetState = { ...ALL_COMBINED_GAME_STATE, updatedAt: Date.now() };
    } else {
      presetState = { ...EPIC_CHALLENGE_GAME_STATE, updatedAt: Date.now() };
    }

    this.saveState(presetState);
    return presetState;
  }

  saveState(state: GameState) {
    if (typeof window === 'undefined') return;
    try {
      const serialized = JSON.stringify(state);
      // Save primary
      localStorage.setItem(STORAGE_KEY, serialized);
      // Dual-write redundancy backup to prevent data loss
      localStorage.setItem(BACKUP_KEY, serialized);

      // Save custom user questions to an independent indestructible backup key
      const defaultIds = new Set(INITIAL_GAME_STATE.questions.map((q) => q.id));
      const customQuestions = state.questions.filter((q) => !defaultIds.has(q.id));
      if (customQuestions.length > 0) {
        localStorage.setItem(CUSTOM_QUESTIONS_KEY, JSON.stringify(customQuestions));
      }

      // Rolling snapshot checkpoints (safely managed with quota fallback)
      try {
        const historyRaw = localStorage.getItem(UNDO_HISTORY_KEY);
        let historyList: Array<{ timestamp: number; state: GameState; label?: string }> = historyRaw ? JSON.parse(historyRaw) : [];
        const lastSnap = historyList[historyList.length - 1];
        const isQuestionCountChanged = lastSnap && lastSnap.state.questions.length !== state.questions.length;
        const isElapsed = !lastSnap || Date.now() - lastSnap.timestamp > 5000;

        if (!lastSnap || isQuestionCountChanged || isElapsed) {
          historyList.push({ timestamp: Date.now(), state });
          if (historyList.length > 10) historyList = historyList.slice(-10);
          try {
            localStorage.setItem(UNDO_HISTORY_KEY, JSON.stringify(historyList));
          } catch {
            // If quota exceeded, prune to last 3 snapshots
            try {
              historyList = historyList.slice(-3);
              localStorage.setItem(UNDO_HISTORY_KEY, JSON.stringify(historyList));
            } catch {
              // Ignore auto-snapshot if storage is fully packed
            }
          }
        }
      } catch {
        // ignore
      }

      if (this.channel) {
        this.channel.postMessage({ type: 'SYNC_STATE', state });
      }
      this.notifyListeners(state);
    } catch (err) {
      console.error('AutoSave failed (storage limit or disabled):', err);
    }
  }

  async syncAllQuestionsTranslations(currentState: GameState): Promise<GameState> {
    const updatedQuestions = await Promise.all(
      currentState.questions.map(async (q) => {
        const def = INITIAL_GAME_STATE.questions.find((dq) => dq.id === q.id);
        const isCustomized = !def || (q.title && q.title !== def.title) || (q.description && q.description !== def.description);
        const titleHasGreek = containsGreekCharacters(q.title_en || '');
        const missingTitleEn = !q.title_en || titleHasGreek;
        const staleTemplateTitle = !!(isCustomized && def && q.title_en === def.title_en);
        const missingPayloadEn = !q.payload_en && (q.type === 'multiple_choice' || q.type === 'task' || q.type === 'text_match');

        if (missingTitleEn || staleTemplateTitle || missingPayloadEn) {
          try {
            const trans = await translateQuestionAsync(q);
            return {
              ...q,
              title_en: trans.title_en || q.title_en,
              description_en: trans.description_en || q.description_en,
              explanation_en: trans.explanation_en !== undefined ? trans.explanation_en : q.explanation_en,
              payload_en: trans.payload_en || q.payload_en
            };
          } catch {
            return q;
          }
        }
        return q;
      })
    );

    const updatedState: GameState = {
      ...currentState,
      questions: updatedQuestions,
      updatedAt: Date.now()
    };

    this.saveState(updatedState);
    return updatedState;
  }

  createManualCheckpoint(state: GameState, label?: string): boolean {
    if (typeof window === 'undefined') return false;
    const now = Date.now();
    const newEntry = {
      timestamp: now,
      state,
      label: label || `Χειροκίνητο Checkpoint (${state.questions?.length || 0} ερωτήσεις)`
    };

    try {
      const historyRaw = localStorage.getItem(UNDO_HISTORY_KEY);
      let historyList: Array<{ timestamp: number; state: GameState; label?: string }> = historyRaw
        ? JSON.parse(historyRaw)
        : [];

      // Append new checkpoint
      historyList.push(newEntry);
      if (historyList.length > 15) historyList = historyList.slice(-15);

      try {
        localStorage.setItem(UNDO_HISTORY_KEY, JSON.stringify(historyList));
        return true;
      } catch (quotaErr) {
        // Fallback: Quota exceeded, keep last 5 snapshots
        try {
          historyList = historyList.slice(-5);
          localStorage.setItem(UNDO_HISTORY_KEY, JSON.stringify(historyList));
          return true;
        } catch {
          // If still exceeded, keep only the latest 2 snapshots
          try {
            historyList = [newEntry];
            localStorage.setItem(UNDO_HISTORY_KEY, JSON.stringify(historyList));
            return true;
          } catch {
            return false;
          }
        }
      }
    } catch {
      // If reading failed, overwrite with single current checkpoint
      try {
        localStorage.setItem(UNDO_HISTORY_KEY, JSON.stringify([newEntry]));
        return true;
      } catch {
        return false;
      }
    }
  }

  getSnapshots(): Array<{ timestamp: number; state: GameState; label?: string }> {
    if (typeof window === 'undefined') return [];
    try {
      const raw = localStorage.getItem(UNDO_HISTORY_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  }

  // Backup snapshot as JSON file download
  exportBackupFile(state: GameState, filename = `boundpad-backup-${new Date().toISOString().slice(0, 10)}.json`) {
    try {
      const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(state, null, 2));
      const downloadAnchor = document.createElement('a');
      downloadAnchor.setAttribute('href', dataStr);
      downloadAnchor.setAttribute('download', filename);
      document.body.appendChild(downloadAnchor);
      downloadAnchor.click();
      downloadAnchor.remove();
      return true;
    } catch {
      return false;
    }
  }

  subscribe(listener: (state: GameState) => void): () => void {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter((l) => l !== listener);
    };
  }

  private notifyListeners(state: GameState) {
    this.listeners.forEach((fn) => fn(state));
  }
}

export const syncService = new GameSyncService();
