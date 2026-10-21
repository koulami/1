import { GameState, Team, Question, Submission, TimerState, TeamSynthesisNote } from '../types/game';
import { INITIAL_GAME_STATE } from '../data/defaultGame';

/**
 * Universal GameState sanitizer.
 * Guarantees that any state (from localStorage, IndexedDB, BroadcastChannel, or network)
 * conforms 100% to the GameState interface with all fields, arrays, and objects safely defined.
 * Completely eliminates runtime TypeErrors and crashes right after mount.
 */
export function sanitizeGameState(raw: any): GameState {
  if (!raw || typeof raw !== 'object') {
    return { ...INITIAL_GAME_STATE, updatedAt: Date.now() };
  }

  // 1. Teams: guarantee array of valid teams with color, avatar, name, id
  const rawTeams = Array.isArray(raw.teams) && raw.teams.length > 0
    ? raw.teams.filter((t: any) => t && typeof t === 'object' && t.id)
    : INITIAL_GAME_STATE.teams;

  const teams: Team[] = (rawTeams.length > 0 ? rawTeams : INITIAL_GAME_STATE.teams).map((t: any, idx: number) => {
    const defaultTeam = INITIAL_GAME_STATE.teams[idx] || INITIAL_GAME_STATE.teams[0];
    return {
      id: String(t.id || defaultTeam.id),
      name: String(t.name || defaultTeam.name),
      name_en: t.name_en ? String(t.name_en) : defaultTeam.name_en,
      color: String(t.color || defaultTeam.color),
      avatar: String(t.avatar || defaultTeam.avatar),
      slogan: t.slogan !== undefined ? String(t.slogan) : defaultTeam.slogan,
      slogan_en: t.slogan_en !== undefined ? String(t.slogan_en) : defaultTeam.slogan_en,
      questionOrder: Array.isArray(t.questionOrder) ? t.questionOrder : undefined,
      sequentialProgression: typeof t.sequentialProgression === 'boolean' ? t.sequentialProgression : false
    };
  });

  const teamIdSet = new Set(teams.map((t) => t.id));

  // 2. Questions: guarantee valid array of questions
  const rawQuestions = Array.isArray(raw.questions) && raw.questions.length > 0
    ? raw.questions.filter((q: any) => q && typeof q === 'object' && q.id)
    : INITIAL_GAME_STATE.questions;

  const questions: Question[] = (rawQuestions.length > 0 ? rawQuestions : INITIAL_GAME_STATE.questions).map((q: any, idx: number) => {
    const rawAssigned = Array.isArray(q.assignedTeamIds) ? q.assignedTeamIds : [];
    const validAssigned = rawAssigned.filter((tid: string) => teamIdSet.has(tid));
    return {
      id: String(q.id || `quest-${idx + 1}`),
      title: String(q.title || `Αποστολή ${idx + 1}`),
      title_en: q.title_en ? String(q.title_en) : undefined,
      description: String(q.description || ''),
      description_en: q.description_en ? String(q.description_en) : undefined,
      explanation: q.explanation ? String(q.explanation) : undefined,
      explanation_en: q.explanation_en ? String(q.explanation_en) : undefined,
      type: q.type || 'multiple_choice',
      points: typeof q.points === 'number' && !isNaN(q.points) ? q.points : 100,
      imageUrl: q.imageUrl ? String(q.imageUrl) : undefined,
      videoUrl: q.videoUrl ? String(q.videoUrl) : undefined,
      assignedTeamIds: validAssigned.length > 0 ? validAssigned : teams.map((t) => t.id),
      isActive: q.isActive !== false,
      payload: q.payload && typeof q.payload === 'object' ? q.payload : {},
      payload_en: q.payload_en && typeof q.payload_en === 'object' ? q.payload_en : undefined
    };
  });

  // 3. Submissions: guaranteed Record<string, Submission>
  const submissions: Record<string, Submission> = {};
  if (raw.submissions && typeof raw.submissions === 'object') {
    Object.entries(raw.submissions).forEach(([k, v]) => {
      if (v && typeof v === 'object') {
        submissions[k] = v as Submission;
      }
    });
  }

  // 4. Timer: guaranteed TimerState
  const defaultTimer = INITIAL_GAME_STATE.timer;
  const rawTimer = raw.timer && typeof raw.timer === 'object' ? raw.timer : {};
  const totalSeconds = typeof rawTimer.totalSeconds === 'number' && !isNaN(rawTimer.totalSeconds)
    ? rawTimer.totalSeconds
    : defaultTimer.totalSeconds;
  const remainingSeconds = typeof rawTimer.remainingSeconds === 'number' && !isNaN(rawTimer.remainingSeconds)
    ? Math.min(totalSeconds, Math.max(0, rawTimer.remainingSeconds))
    : defaultTimer.remainingSeconds;

  const timer: TimerState = {
    totalSeconds,
    remainingSeconds,
    isRunning: Boolean(rawTimer.isRunning),
    updatedAt: typeof rawTimer.updatedAt === 'number' ? rawTimer.updatedAt : Date.now()
  };

  // 5. synthesisNotes: guaranteed array
  const synthesisNotes: TeamSynthesisNote[] = Array.isArray(raw.synthesisNotes)
    ? raw.synthesisNotes.filter((n: any) => n && typeof n === 'object' && n.id)
    : [];

  // 6. teamQuestionOrders: guaranteed object
  const teamQuestionOrders: Record<string, string[]> = {};
  if (raw.teamQuestionOrders && typeof raw.teamQuestionOrders === 'object') {
    Object.entries(raw.teamQuestionOrders).forEach(([k, v]) => {
      if (Array.isArray(v)) {
        teamQuestionOrders[k] = v.filter((id) => typeof id === 'string');
      }
    });
  }

  // 7. teamSequentialModes: guaranteed object
  const teamSequentialModes: Record<string, boolean> = {};
  if (raw.teamSequentialModes && typeof raw.teamSequentialModes === 'object') {
    Object.entries(raw.teamSequentialModes).forEach(([k, v]) => {
      teamSequentialModes[k] = Boolean(v);
    });
  }

  return {
    id: String(raw.id || INITIAL_GAME_STATE.id),
    title: String(raw.title || INITIAL_GAME_STATE.title),
    title_en: raw.title_en ? String(raw.title_en) : INITIAL_GAME_STATE.title_en,
    description: String(raw.description || INITIAL_GAME_STATE.description),
    description_en: raw.description_en ? String(raw.description_en) : INITIAL_GAME_STATE.description_en,
    phase: raw.phase || 'waiting_lobby',
    synthesisPrompt: raw.synthesisPrompt !== undefined ? String(raw.synthesisPrompt) : INITIAL_GAME_STATE.synthesisPrompt,
    synthesisPrompt_en: raw.synthesisPrompt_en !== undefined ? String(raw.synthesisPrompt_en) : INITIAL_GAME_STATE.synthesisPrompt_en,
    synthesisNotes,
    activeRound: typeof raw.activeRound === 'number' ? raw.activeRound : 1,
    updatedAt: typeof raw.updatedAt === 'number' ? raw.updatedAt : Date.now(),
    timer,
    teams,
    questions,
    submissions,
    teamQuestionOrders,
    teamSequentialModes
  };
}
