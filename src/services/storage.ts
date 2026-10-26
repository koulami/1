import { GameState, Submission, TimerState, Question, Team } from '../types/game';
import {
  INITIAL_GAME_STATE,
  EPIC_CHALLENGE_GAME_STATE,
  VULTURES_GAME_STATE,
  ALL_COMBINED_GAME_STATE
} from '../data/defaultGame';
import { translateGreekToEnglish, translateQuestionAsync, containsGreekCharacters } from '../utils/translator';
import { sanitizeGameState } from '../utils/sanitizeGame';

const STORAGE_KEY = 'boundpad_gamestate_v9';
const PREV_STORAGE_KEY = 'boundpad_gamestate_v8';
const SUBMISSIONS_STORAGE_KEY = 'boundpad_submissions_v9';
const BACKUP_KEY = 'boundpad_gamestate_backup_v9';
const CUSTOM_QUESTIONS_KEY = 'boundpad_custom_questions_v9';
const UNDO_HISTORY_KEY = 'boundpad_undo_history_v9';
const CHANNEL_NAME = 'boundpad_realtime_channel_v9';

export interface GameSnapshot {
  timestamp: number;
  state: GameState;
  label?: string;
  isManual?: boolean;
}

// ----------------- IndexedDB Storage Engine (Virtually Unlimited Quota) -----------------
const IDB_NAME = 'boundpad_storage_db';
const IDB_VERSION = 2;
const SNAPSHOTS_STORE = 'snapshots';
const STATE_STORE = 'gameState';

let dbPromise: Promise<IDBDatabase | null> | null = null;

function openIndexedDb(): Promise<IDBDatabase | null> {
  if (typeof window === 'undefined' || !window.indexedDB) {
    return Promise.resolve(null);
  }
  if (dbPromise) return dbPromise;

  dbPromise = new Promise((resolve) => {
    try {
      const request = window.indexedDB.open(IDB_NAME, IDB_VERSION);
      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        if (!db.objectStoreNames.contains(SNAPSHOTS_STORE)) {
          db.createObjectStore(SNAPSHOTS_STORE, { keyPath: 'timestamp' });
        }
        if (!db.objectStoreNames.contains(STATE_STORE)) {
          db.createObjectStore(STATE_STORE, { keyPath: 'id' });
        }
      };
      request.onsuccess = () => {
        const db = request.result;
        db.onversionchange = () => {
          db.close();
          dbPromise = null;
        };
        db.onerror = () => {
          dbPromise = null;
        };
        resolve(db);
      };
      request.onerror = () => {
        dbPromise = null;
        resolve(null);
      };
      request.onblocked = () => {
        dbPromise = null;
        resolve(null);
      };
    } catch {
      dbPromise = null;
      resolve(null);
    }
  });

  return dbPromise;
}

async function idbSaveGameState(state: GameState): Promise<boolean> {
  const db = await openIndexedDb();
  if (!db) return false;
  return new Promise((resolve) => {
    try {
      const tx = db.transaction(STATE_STORE, 'readwrite');
      const store = tx.objectStore(STATE_STORE);
      store.put({ id: 'current', state, updatedAt: state.updatedAt || Date.now() });
      tx.oncomplete = () => resolve(true);
      tx.onerror = () => resolve(false);
    } catch {
      resolve(false);
    }
  });
}

async function idbGetGameState(): Promise<GameState | null> {
  const db = await openIndexedDb();
  if (!db) return null;
  return new Promise((resolve) => {
    try {
      const tx = db.transaction(STATE_STORE, 'readonly');
      const store = tx.objectStore(STATE_STORE);
      const req = store.get('current');
      req.onsuccess = () => {
        if (req.result && req.result.state) {
          resolve(req.result.state as GameState);
        } else {
          resolve(null);
        }
      };
      req.onerror = () => resolve(null);
    } catch {
      resolve(null);
    }
  });
}

async function idbSaveSnapshot(snapshot: GameSnapshot): Promise<boolean> {
  const db = await openIndexedDb();
  if (!db) return false;
  return new Promise((resolve) => {
    try {
      const tx = db.transaction(SNAPSHOTS_STORE, 'readwrite');
      const store = tx.objectStore(SNAPSHOTS_STORE);
      store.put(snapshot);
      tx.oncomplete = () => resolve(true);
      tx.onerror = () => resolve(false);
    } catch {
      resolve(false);
    }
  });
}

async function idbDeleteSnapshot(timestamp: number): Promise<boolean> {
  const db = await openIndexedDb();
  if (!db) return false;
  return new Promise((resolve) => {
    try {
      const tx = db.transaction(SNAPSHOTS_STORE, 'readwrite');
      const store = tx.objectStore(SNAPSHOTS_STORE);
      store.delete(timestamp);
      tx.oncomplete = () => resolve(true);
      tx.onerror = () => resolve(false);
    } catch {
      resolve(false);
    }
  });
}

async function idbClearSnapshots(): Promise<boolean> {
  const db = await openIndexedDb();
  if (!db) return false;
  return new Promise((resolve) => {
    try {
      const tx = db.transaction(SNAPSHOTS_STORE, 'readwrite');
      const store = tx.objectStore(SNAPSHOTS_STORE);
      store.clear();
      tx.oncomplete = () => resolve(true);
      tx.onerror = () => resolve(false);
    } catch {
      resolve(false);
    }
  });
}

async function idbGetAllSnapshots(): Promise<GameSnapshot[]> {
  const db = await openIndexedDb();
  if (!db) return [];
  return new Promise((resolve) => {
    try {
      const tx = db.transaction(SNAPSHOTS_STORE, 'readonly');
      const store = tx.objectStore(SNAPSHOTS_STORE);
      const req = store.getAll();
      req.onsuccess = () => resolve((req.result as GameSnapshot[]) || []);
      req.onerror = () => resolve([]);
    } catch {
      resolve([]);
    }
  });
}

/**
 * Creates a lightweight copy of GameState for localStorage by trimming large base64 media.
 * The full media data remains completely intact in IndexedDB and in-memory!
 */
function createLightweightState(state: GameState): GameState {
  return {
    ...state,
    questions: state.questions.map((q) => {
      let payload = q.payload;
      let payload_en = q.payload_en;

      // Handle qr_scan with large video/image data URLs
      if (q.type === 'qr_scan') {
        const p = payload as any;
        if (p?.unlockedMedia?.url && typeof p.unlockedMedia.url === 'string' && p.unlockedMedia.url.startsWith('data:') && p.unlockedMedia.url.length > 20000) {
          payload = {
            ...p,
            unlockedMedia: {
              ...p.unlockedMedia,
              url: `[idb-media-cached:${q.id}:qr]`
            }
          };
        }

        const pen = payload_en as any;
        if (pen?.unlockedMedia?.url && typeof pen.unlockedMedia.url === 'string' && pen.unlockedMedia.url.startsWith('data:') && pen.unlockedMedia.url.length > 20000) {
          payload_en = {
            ...pen,
            unlockedMedia: {
              ...pen.unlockedMedia,
              url: `[idb-media-cached:${q.id}:qr_en]`
            }
          };
        }
      }

      // Handle large data URL in imageUrl (> 20KB)
      const isHugeImage = q.imageUrl && q.imageUrl.startsWith('data:') && q.imageUrl.length > 20000;
      // Handle large data URL in videoUrl (> 20KB)
      const isHugeVideo = q.videoUrl && q.videoUrl.startsWith('data:') && q.videoUrl.length > 20000;

      return {
        ...q,
        imageUrl: isHugeImage ? `[idb-media-cached:${q.id}:image]` : q.imageUrl,
        videoUrl: isHugeVideo ? `[idb-media-cached:${q.id}:video]` : q.videoUrl,
        payload,
        payload_en
      };
    })
  };
}

/**
 * Merges full media from IndexedDB back into an existing base state.
 * Crucially: NEVER DROPS any questions that exist in mediaState!
 */
function mergeStatesPreservingMedia(baseState: GameState, mediaState: GameState): GameState {
  if (!mediaState || !Array.isArray(mediaState.questions) || mediaState.questions.length === 0) return baseState;
  if (!baseState || !Array.isArray(baseState.questions) || baseState.questions.length === 0) return mediaState;

  const mediaMap = new Map<string, Question>();
  mediaState.questions.forEach((q) => mediaMap.set(q.id, q));

  const questions = baseState.questions.map((baseQ) => {
    const fullQ = mediaMap.get(baseQ.id);
    if (!fullQ) return baseQ;

    let imageUrl = baseQ.imageUrl;
    if ((!imageUrl || (typeof imageUrl === 'string' && imageUrl.startsWith('[idb-media-cached'))) && fullQ.imageUrl) {
      imageUrl = fullQ.imageUrl;
    }

    let videoUrl = baseQ.videoUrl;
    if ((!videoUrl || (typeof videoUrl === 'string' && videoUrl.startsWith('[idb-media-cached'))) && fullQ.videoUrl) {
      videoUrl = fullQ.videoUrl;
    }

    let payload = baseQ.payload;
    if (baseQ.type === 'qr_scan') {
      const baseMediaUrl = (baseQ.payload as any)?.unlockedMedia?.url;
      if (baseMediaUrl && typeof baseMediaUrl === 'string' && baseMediaUrl.startsWith('[idb-media-cached')) {
        payload = fullQ.payload;
      }
    }

    let payload_en = baseQ.payload_en;
    if (baseQ.type === 'qr_scan' && baseQ.payload_en) {
      const baseMediaUrlEn = (baseQ.payload_en as any)?.unlockedMedia?.url;
      if (baseMediaUrlEn && typeof baseMediaUrlEn === 'string' && baseMediaUrlEn.startsWith('[idb-media-cached')) {
        payload_en = fullQ.payload_en;
      }
    }

    return {
      ...baseQ,
      imageUrl,
      videoUrl,
      payload,
      payload_en
    };
  });

  // Keep any questions that exist in mediaState but not in baseState
  const baseIds = new Set(baseState.questions.map((q) => q.id));
  const missingQuestions = mediaState.questions.filter((q) => !baseIds.has(q.id));
  const finalQuestions = [...questions, ...missingQuestions];

  return {
    ...baseState,
    questions: finalQuestions,
    updatedAt: Math.max(baseState.updatedAt || 0, mediaState.updatedAt || 0)
  };
}

class GameSyncService {
  private channel: BroadcastChannel | null = null;
  private listeners: Array<(state: GameState) => void> = [];
  private snapshotListeners: Array<(snapshots: GameSnapshot[]) => void> = [];
  private inMemorySnapshots: GameSnapshot[] = [];
  private activeState: GameState | null = null;

  constructor() {
    if (typeof window !== 'undefined') {
      // 0. Initial cleanup of redundant duplicate and legacy keys to free localStorage quota immediately
      try {
        localStorage.removeItem(BACKUP_KEY);
        localStorage.removeItem(CUSTOM_QUESTIONS_KEY);
        localStorage.removeItem('boundpad_gamestate_v8');
        localStorage.removeItem('boundpad_gamestate_v7');
        localStorage.removeItem('boundpad_gamestate_v6');
        localStorage.removeItem('boundpad_gamestate_v5');
        localStorage.removeItem('boundpad_undo_history_v8');
        localStorage.removeItem('boundpad_undo_history_v7');
      } catch {
        // ignore
      }

      if ('BroadcastChannel' in window) {
        try {
          this.channel = new BroadcastChannel(CHANNEL_NAME);
          this.channel.onmessage = (event) => {
            if (event.data && event.data.type === 'SYNC_STATE' && event.data.state) {
              const incoming = sanitizeGameState(event.data.state);
              // Deduplicate: avoid re-notifying if updatedAt is not newer
              if (this.activeState && (incoming.updatedAt || 0) <= (this.activeState.updatedAt || 0)) {
                return;
              }
              this.activeState = incoming;
              this.notifyListeners(incoming);
            }
          };
        } catch {
          // BroadcastChannel unsupported or restricted
        }
      }

      // 1. Initial synchronous load of snapshots from localStorage
      try {
        const historyRaw = localStorage.getItem(UNDO_HISTORY_KEY);
        if (historyRaw) {
          const parsed = JSON.parse(historyRaw);
          if (Array.isArray(parsed)) {
            this.inMemorySnapshots = parsed.slice(-15);
          }
        }
      } catch {
        this.inMemorySnapshots = [];
      }

      // 2. Asynchronous hydration of full authoritative state & checkpoints from IndexedDB
      this.hydrateAuthoritativeState().catch(() => {});

      // 3. Before unload hook to guarantee state is flushed
      window.addEventListener('beforeunload', () => {
        if (this.activeState) {
          try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(createLightweightState(this.activeState)));
          } catch {}
        }
      });
    }
  }

  /**
   * Asynchronously hydrates the authoritative state from IndexedDB.
   * If IndexedDB holds state or checkpoints with more questions or newer timestamps,
   * it returns and applies that authoritative state to guarantee NO DATA LOSS across reloads.
   */
  async hydrateAuthoritativeState(): Promise<GameState | null> {
    if (typeof window === 'undefined') return null;

    try {
      // 1. Fetch current state from IndexedDB
      const idbState = await idbGetGameState();

      // 2. Also fetch all snapshots from IndexedDB to check if a manual or auto checkpoint has newer/more data
      const idbSnaps = await idbGetAllSnapshots();
      if (idbSnaps && idbSnaps.length > 0) {
        const map = new Map<number, GameSnapshot>();
        this.inMemorySnapshots.forEach((s) => map.set(s.timestamp, s));
        idbSnaps.slice(-15).forEach((s) => map.set(s.timestamp, s));
        this.inMemorySnapshots = Array.from(map.values()).sort((a, b) => a.timestamp - b.timestamp).slice(-15);
        this.notifySnapshotListeners();
      }

      // Determine best state between idbState and latest snapshot
      let bestState: GameState | null = idbState;
      if (idbSnaps && idbSnaps.length > 0) {
        const latestSnap = idbSnaps[idbSnaps.length - 1];
        if (latestSnap && latestSnap.state && Array.isArray(latestSnap.state.questions)) {
          if (!bestState || latestSnap.state.questions.length > bestState.questions.length ||
              (latestSnap.timestamp > (bestState.updatedAt || 0) && latestSnap.state.questions.length >= bestState.questions.length)) {
            bestState = latestSnap.state;
          }
        }
      }

      if (bestState && Array.isArray(bestState.questions) && bestState.questions.length > 0) {
        // If bestState in IndexedDB is from the old 14-quest challenge, DO NOT overwrite the active Vultures arena!
        if (bestState.id === 'epic-challenge-14' || bestState.questions.length <= 14) {
          return this.activeState || INITIAL_GAME_STATE;
        }

        // Merge with activeState if activeState exists to ensure media and questions are preserved
        const resolvedState = this.activeState
          ? mergeStatesPreservingMedia(this.activeState, bestState)
          : bestState;

        const sanitized = sanitizeGameState({
          ...resolvedState,
          teams: INITIAL_GAME_STATE.teams
        });
        this.activeState = sanitized;
        this.notifyListeners(sanitized);
        return sanitized;
      }
    } catch (err) {
      console.warn('Hydration from IndexedDB failed:', err);
    }

    return this.activeState || INITIAL_GAME_STATE;
  }

  loadState(): GameState {
    if (this.activeState) {
      return this.activeState;
    }

    if (typeof window === 'undefined') return INITIAL_GAME_STATE;

    try {
      // Check for explicit reset flag in query string: ?reset=true or ?clean=true
      if (typeof window !== 'undefined' && window.location.search) {
        const params = new URLSearchParams(window.location.search);
        if (params.get('reset') === 'true' || params.get('clean') === 'true') {
          return this.resetToDefaultState();
        }
      }

      const saved = localStorage.getItem(STORAGE_KEY);
      if (!saved) {
        // Clean default boot: save and return INITIAL_GAME_STATE directly without legacy fallback
        this.saveState(INITIAL_GAME_STATE);
        return INITIAL_GAME_STATE;
      }

      const parsed = JSON.parse(saved);
      if (!parsed || !Array.isArray(parsed.questions) || parsed.questions.length === 0) {
        this.saveState(INITIAL_GAME_STATE);
        return INITIAL_GAME_STATE;
      }

      // Load submissions from state, with fallback merge from dedicated SUBMISSIONS_STORAGE_KEY
      let submissions = parsed.submissions || {};
      try {
        const directSubsRaw = localStorage.getItem(SUBMISSIONS_STORAGE_KEY);
        if (directSubsRaw) {
          const directSubs = JSON.parse(directSubsRaw);
          if (directSubs && typeof directSubs === 'object') {
            submissions = { ...directSubs, ...submissions };
          }
        }
      } catch {}

      const upgradedState: GameState = {
        ...INITIAL_GAME_STATE,
        ...parsed,
        teams: INITIAL_GAME_STATE.teams, // Enforce restored team names
        questions: (parsed.questions && parsed.questions.length >= 61) ? parsed.questions : INITIAL_GAME_STATE.questions,
        submissions,
        timer: parsed.timer || INITIAL_GAME_STATE.timer,
        updatedAt: Date.now()
      };

      const finalState = sanitizeGameState(upgradedState);
      this.activeState = finalState;
      return finalState;
    } catch {
      this.activeState = INITIAL_GAME_STATE;
      return INITIAL_GAME_STATE;
    }
  }

  /**
   * Immediately and synchronously persist a single team quest submission to localStorage.
   * Ensures team submissions are never lost, even on immediate page refresh or network drop.
   */
  saveSubmission(submission: Submission) {
    if (!submission || !submission.teamId || !submission.questionId) return;
    const subKey = `${submission.teamId}_${submission.questionId}`;
    try {
      if (typeof window !== 'undefined') {
        const raw = localStorage.getItem(SUBMISSIONS_STORAGE_KEY);
        const subs = raw ? JSON.parse(raw) : {};
        subs[subKey] = submission;
        localStorage.setItem(SUBMISSIONS_STORAGE_KEY, JSON.stringify(subs));
      }
    } catch (e) {
      console.warn('Failed writing submission to dedicated storage key:', e);
    }

    if (this.activeState) {
      const updatedState: GameState = {
        ...this.activeState,
        submissions: {
          ...this.activeState.submissions,
          [subKey]: submission
        },
        updatedAt: Date.now()
      };
      this.saveState(updatedState);
    }
  }

  /**
   * Resets the entire application to the clean initial default state,
   * purging legacy and bloated items from localStorage and IndexedDB.
   */
  resetToDefaultState(): GameState {
    this.activeState = INITIAL_GAME_STATE;
    this.inMemorySnapshots = [];

    if (typeof window !== 'undefined') {
      try {
        localStorage.removeItem(STORAGE_KEY);
        localStorage.removeItem(PREV_STORAGE_KEY);
        localStorage.removeItem(BACKUP_KEY);
        localStorage.removeItem(CUSTOM_QUESTIONS_KEY);
        localStorage.removeItem(UNDO_HISTORY_KEY);
        localStorage.removeItem('boundpad_gamestate_v8');
        localStorage.removeItem('boundpad_gamestate_v7');
      } catch {}

      idbClearSnapshots().catch(() => {});
      idbSaveGameState(INITIAL_GAME_STATE).catch(() => {});
      this.notifySnapshotListeners();
      this.notifyListeners(INITIAL_GAME_STATE);
    }

    this.saveState(INITIAL_GAME_STATE);
    return INITIAL_GAME_STATE;
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

  /**
   * Resilient saveState that never crashes or exceeds localStorage quota.
   * Full state is persisted to IndexedDB, while localStorage acts as a self-healing cache.
   */
  saveState(state: GameState) {
    if (typeof window === 'undefined') return;

    const sanitized = sanitizeGameState(state);

    // 1. Maintain in-memory instant state
    this.activeState = sanitized;

    // 2. Persist full state with all media into IndexedDB (unlimited capacity)
    idbSaveGameState(sanitized).catch(() => {});

    // 2b. Synchronous persistence of team submissions to dedicated key
    if (sanitized.submissions && Object.keys(sanitized.submissions).length > 0) {
      try {
        localStorage.setItem(SUBMISSIONS_STORAGE_KEY, JSON.stringify(sanitized.submissions));
      } catch {}
    }

    // 3. Persist to localStorage with intelligent multi-stage quota handling
    try {
      const serialized = JSON.stringify(state);
      try {
        localStorage.setItem(STORAGE_KEY, serialized);
      } catch {
        // Quota exceeded: clean up redundant keys
        try {
          localStorage.removeItem(BACKUP_KEY);
          localStorage.removeItem(CUSTOM_QUESTIONS_KEY);
          const historyRaw = localStorage.getItem(UNDO_HISTORY_KEY);
          if (historyRaw) {
            const h = JSON.parse(historyRaw);
            if (Array.isArray(h) && h.length > 3) {
              localStorage.setItem(UNDO_HISTORY_KEY, JSON.stringify(h.slice(-3)));
            }
          }
        } catch {}

        // Try writing full serialized state again
        try {
          localStorage.setItem(STORAGE_KEY, serialized);
        } catch {
          // If still exceeding (large data URLs for video/images), save lightweight state
          try {
            const lightweight = createLightweightState(state);
            localStorage.setItem(STORAGE_KEY, JSON.stringify(lightweight));
          } catch {
            // If even that fails, purge old undo history completely from localStorage
            try {
              localStorage.removeItem(UNDO_HISTORY_KEY);
              const lightweight = createLightweightState(state);
              localStorage.setItem(STORAGE_KEY, JSON.stringify(lightweight));
            } catch {
              // IndexedDB and in-memory already hold the full state securely
            }
          }
        }
      }
    } catch {
      // Memory and IndexedDB ensure state integrity
    }

    // 4. Auto-snapshot check
    const lastSnap = this.inMemorySnapshots[this.inMemorySnapshots.length - 1];
    const isQuestionCountChanged = lastSnap && lastSnap.state.questions.length !== state.questions.length;
    const isElapsed = !lastSnap || Date.now() - lastSnap.timestamp > 20000;

    if (!lastSnap || isQuestionCountChanged || isElapsed) {
      this.recordSnapshotInternal(state, undefined, false);
    }

    if (this.channel) {
      try {
        this.channel.postMessage({ type: 'SYNC_STATE', state });
      } catch {}
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

  /**
   * Internal recorder that saves to In-Memory, IndexedDB, and localStorage safely.
   */
  private recordSnapshotInternal(state: GameState, label?: string, isManual = false): boolean {
    if (typeof window === 'undefined') return false;

    // Deep clone state to ensure mutation safety
    const clonedState: GameState = JSON.parse(JSON.stringify(state));
    const now = Date.now();
    const defaultLabel = isManual
      ? `Χειροκίνητο Checkpoint (${clonedState.questions?.length || 0} δραστηριότητες)`
      : `Αυτόματο (${clonedState.questions?.length || 0} δραστηριότητες)`;

    const newEntry: GameSnapshot = {
      timestamp: now,
      state: clonedState,
      label: label || defaultLabel,
      isManual
    };

    // 1. Update In-Memory cache (Keep up to 15 snapshots)
    this.inMemorySnapshots.push(newEntry);
    if (this.inMemorySnapshots.length > 15) {
      this.inMemorySnapshots = this.inMemorySnapshots.slice(-15);
    }

    // 2. Persist to IndexedDB (asynchronous, virtually unlimited quota)
    idbSaveSnapshot(newEntry).catch(() => {});

    // 3. Persist to localStorage safely (with multi-stage quota fallback)
    this.syncSnapshotsToLocalStorage();

    // 4. Notify all snapshot observers so React UI updates immediately!
    this.notifySnapshotListeners();

    return true;
  }

  /**
   * Syncs in-memory snapshots to localStorage, handling quota gracefully.
   */
  private syncSnapshotsToLocalStorage() {
    try {
      localStorage.setItem(UNDO_HISTORY_KEY, JSON.stringify(this.inMemorySnapshots));
    } catch {
      // Quota exceeded: try saving only the last 10 snapshots with lightweight state
      try {
        const lightweightSnapshots = this.inMemorySnapshots.slice(-10).map((snap) => ({
          ...snap,
          state: createLightweightState(snap.state)
        }));
        localStorage.setItem(UNDO_HISTORY_KEY, JSON.stringify(lightweightSnapshots));
      } catch {
        // Still exceeded: try saving last 4 lightweight snapshots
        try {
          const tiny = this.inMemorySnapshots.slice(-4).map((snap) => ({
            ...snap,
            state: createLightweightState(snap.state)
          }));
          localStorage.setItem(UNDO_HISTORY_KEY, JSON.stringify(tiny));
        } catch {
          // If still failing, purge history from localStorage (IndexedDB retains complete snapshots)
          try {
            localStorage.removeItem(UNDO_HISTORY_KEY);
          } catch {}
        }
      }
    }
  }

  /**
   * Explicit user-requested manual checkpoint.
   * Guarantees both active state and restore checkpoint are permanently saved.
   */
  createManualCheckpoint(state: GameState, label?: string): boolean {
    this.saveState(state);
    return this.recordSnapshotInternal(state, label, true);
  }

  /**
   * Delete a specific checkpoint by timestamp.
   */
  deleteSnapshot(timestamp: number): boolean {
    this.inMemorySnapshots = this.inMemorySnapshots.filter((s) => s.timestamp !== timestamp);
    idbDeleteSnapshot(timestamp).catch(() => {});
    this.syncSnapshotsToLocalStorage();
    this.notifySnapshotListeners();
    return true;
  }

  /**
   * Clear all stored checkpoints.
   */
  clearAllSnapshots(): boolean {
    this.inMemorySnapshots = [];
    idbClearSnapshots().catch(() => {});
    try {
      localStorage.removeItem(UNDO_HISTORY_KEY);
    } catch {
      // ignore
    }
    this.notifySnapshotListeners();
    return true;
  }

  /**
   * Return copy of currently recorded snapshots.
   */
  getSnapshots(): GameSnapshot[] {
    return [...this.inMemorySnapshots];
  }

  /**
   * Export a single snapshot as downloadable JSON file.
   */
  exportCheckpoint(snap: GameSnapshot) {
    const filename = `boundpad-checkpoint-${new Date(snap.timestamp).toISOString().slice(0, 19).replace(/[:T]/g, '-')}.json`;
    return this.exportBackupFile(snap.state, filename);
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

  onSnapshotsChange(listener: (snapshots: GameSnapshot[]) => void): () => void {
    this.snapshotListeners.push(listener);
    return () => {
      this.snapshotListeners = this.snapshotListeners.filter((l) => l !== listener);
    };
  }

  private notifyListeners(state: GameState) {
    this.listeners.forEach((fn) => fn(state));
  }

  private notifySnapshotListeners() {
    const list = this.getSnapshots();
    this.snapshotListeners.forEach((fn) => fn(list));
  }
}

export const syncService = new GameSyncService();
