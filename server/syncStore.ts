import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { Team } from '../src/types/game.ts';
import { masterTeamsPool } from '../src/data/masterTaskPool.ts';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const STATE_FILE_PATH = path.join(__dirname, '../server_sync_state.json');

export interface ServerSyncState {
  version: number;
  updatedAt: number;
  subgroups: Team[];
  customTeamTitles: Record<string, { name?: string; name_en?: string; slogan?: string; slogan_en?: string }>;
  deletedSubgroupIds: string[];
  isSubgroupsMode?: boolean;
}

type SyncListener = (state: ServerSyncState) => void;

class ServerSyncStore {
  private state: ServerSyncState;
  private listeners: Set<SyncListener> = new Set();

  constructor() {
    this.state = this.loadInitialState();
  }

  private loadInitialState(): ServerSyncState {
    try {
      if (fs.existsSync(STATE_FILE_PATH)) {
        const raw = fs.readFileSync(STATE_FILE_PATH, 'utf-8');
        const parsed = JSON.parse(raw);
        if (parsed && Array.isArray(parsed.subgroups) && parsed.subgroups.length > 0) {
          return {
            version: typeof parsed.version === 'number' ? parsed.version : 1,
            updatedAt: typeof parsed.updatedAt === 'number' ? parsed.updatedAt : Date.now(),
            subgroups: parsed.subgroups,
            customTeamTitles: parsed.customTeamTitles || {},
            deletedSubgroupIds: Array.isArray(parsed.deletedSubgroupIds) ? parsed.deletedSubgroupIds : [],
            isSubgroupsMode: typeof parsed.isSubgroupsMode === 'boolean' ? parsed.isSubgroupsMode : true
          };
        }
      }
    } catch (err) {
      console.warn('[ServerSyncStore] Error loading state from disk, using defaults:', err);
    }

    return {
      version: 1,
      updatedAt: Date.now(),
      subgroups: masterTeamsPool,
      customTeamTitles: {},
      deletedSubgroupIds: [],
      isSubgroupsMode: true
    };
  }

  private persist(): void {
    try {
      fs.writeFileSync(STATE_FILE_PATH, JSON.stringify(this.state, null, 2), 'utf-8');
    } catch (err) {
      console.warn('[ServerSyncStore] Failed to write state to disk:', err);
    }
  }

  private notify(): void {
    this.persist();
    for (const listener of this.listeners) {
      try {
        listener(this.state);
      } catch (err) {
        console.warn('[ServerSyncStore] Error in listener callback:', err);
      }
    }
  }

  public getState(): ServerSyncState {
    return {
      version: this.state.version,
      updatedAt: this.state.updatedAt,
      subgroups: [...this.state.subgroups],
      customTeamTitles: { ...this.state.customTeamTitles },
      deletedSubgroupIds: [...this.state.deletedSubgroupIds],
      isSubgroupsMode: this.state.isSubgroupsMode ?? true
    };
  }

  public subscribe(listener: SyncListener): () => void {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  /**
   * Replace or update the full active subgroups list
   */
  public updateSubgroups(
    newSubgroups: Team[],
    options?: {
      deletedSubgroupId?: string;
      customTeamTitles?: Record<string, any>;
    }
  ): ServerSyncState {
    if (!Array.isArray(newSubgroups) || newSubgroups.length === 0) {
      return this.getState();
    }

    const currentIds = new Set(this.state.subgroups.map((s) => s.id));
    const newIds = new Set(newSubgroups.map((s) => s.id));

    // Detect any IDs that disappeared
    const deletedNow: string[] = [];
    if (options?.deletedSubgroupId) {
      deletedNow.push(options.deletedSubgroupId);
    }
    for (const oldId of currentIds) {
      if (!newIds.has(oldId) && !deletedNow.includes(oldId)) {
        deletedNow.push(oldId);
      }
    }

    const updatedDeletedList = Array.from(
      new Set([...this.state.deletedSubgroupIds, ...deletedNow])
    );

    this.state = {
      version: this.state.version + 1,
      updatedAt: Date.now(),
      subgroups: newSubgroups,
      customTeamTitles: options?.customTeamTitles
        ? { ...this.state.customTeamTitles, ...options.customTeamTitles }
        : this.state.customTeamTitles,
      deletedSubgroupIds: updatedDeletedList
    };

    this.notify();
    return this.getState();
  }

  /**
   * Delete a specific subgroup
   */
  public deleteSubgroup(teamId: string): ServerSyncState {
    if (!teamId) return this.getState();

    // Do not delete if only 1 remains
    if (this.state.subgroups.length <= 1) return this.getState();

    const filtered = this.state.subgroups.filter((s) => s.id !== teamId);
    const updatedDeletedList = Array.from(
      new Set([...this.state.deletedSubgroupIds, teamId])
    );

    // Also remove from customTeamTitles if present
    const updatedTitles = { ...this.state.customTeamTitles };
    delete updatedTitles[teamId];

    this.state = {
      version: this.state.version + 1,
      updatedAt: Date.now(),
      subgroups: filtered,
      customTeamTitles: updatedTitles,
      deletedSubgroupIds: updatedDeletedList
    };

    this.notify();
    return this.getState();
  }

  /**
   * Reset active subgroups back to the curriculum default masterTeamsPool
   */
  public resetToDefault(): ServerSyncState {
    const defaultIds = new Set(masterTeamsPool.map((s) => s.id));
    // Any custom IDs that existed become deleted
    const customDeleted = this.state.subgroups
      .filter((s) => !defaultIds.has(s.id))
      .map((s) => s.id);

    const updatedDeletedList = Array.from(
      new Set([...this.state.deletedSubgroupIds, ...customDeleted])
    );

    this.state = {
      version: this.state.version + 1,
      updatedAt: Date.now(),
      subgroups: masterTeamsPool,
      customTeamTitles: {},
      deletedSubgroupIds: updatedDeletedList,
      isSubgroupsMode: this.state.isSubgroupsMode ?? true
    };

    this.notify();
    return this.getState();
  }

  /**
   * Update custom titles for teams
   */
  public updateCustomTitles(
    titles: Record<string, { name?: string; name_en?: string; slogan?: string; slogan_en?: string }>
  ): ServerSyncState {
    this.state = {
      ...this.state,
      version: this.state.version + 1,
      updatedAt: Date.now(),
      customTeamTitles: { ...this.state.customTeamTitles, ...titles }
    };

    this.notify();
    return this.getState();
  }

  /**
   * Set Subgroups Mode toggle
   */
  public setSubgroupsMode(enabled: boolean): ServerSyncState {
    if (this.state.isSubgroupsMode === enabled) {
      return this.getState();
    }
    this.state = {
      ...this.state,
      version: this.state.version + 1,
      updatedAt: Date.now(),
      isSubgroupsMode: enabled
    };

    this.notify();
    return this.getState();
  }
}

export const serverSyncStore = new ServerSyncStore();
