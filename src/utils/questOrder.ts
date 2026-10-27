import { GameState, Question, Team } from '../types/game';

/**
 * Returns the list of active and assigned questions for a team,
 * sorted according to the custom team sequence configured by the administrator.
 */
export function getTeamOrderedQuestions(
  team: Team,
  allQuestions: Question[],
  teamQuestionOrders?: Record<string, string[]>,
  includeInactive: boolean = false
): Question[] {
  if (!team || !team.id) return [];
  const validQuestions = Array.isArray(allQuestions) ? allQuestions.filter((q) => q && q.id) : [];

  // 1. Filter questions that are assigned to this team (and active if includeInactive is false)
  const visible = validQuestions.filter((q) => {
    if (!includeInactive && q.isActive === false) return false;
    return Boolean(q.assignedTeamIds && q.assignedTeamIds.includes(team.id));
  });

  // 2. Determine defined sequence of question IDs
  const orderArray = teamQuestionOrders?.[team.id] || team.questionOrder;
  if (!orderArray || orderArray.length === 0) {
    if (includeInactive) {
      const active = visible.filter((q) => q.isActive !== false);
      const inactive = visible.filter((q) => q.isActive === false);
      return [...active, ...inactive];
    }
    return visible;
  }

  // 3. Sort matching the specified order array, appending any new/unranked items at the end
  const questionMap = new Map<string, Question>();
  visible.forEach((q) => questionMap.set(q.id, q));

  const ordered: Question[] = [];
  const visitedIds = new Set<string>();

  orderArray.forEach((id) => {
    const q = questionMap.get(id);
    if (q) {
      ordered.push(q);
      visitedIds.add(id);
    }
  });

  // Append any visible question that wasn't in the saved order array
  visible.forEach((q) => {
    if (!visitedIds.has(q.id)) {
      ordered.push(q);
    }
  });

  // 4. Always ensure active questions are on top and inactive questions are grouped at the bottom!
  if (includeInactive) {
    const active = ordered.filter((q) => q.isActive !== false);
    const inactive = ordered.filter((q) => q.isActive === false);
    return [...active, ...inactive];
  }

  return ordered;
}

/**
 * Returns whether the team has sequential progression (step-by-step unlock) enabled.
 */
export function isTeamSequentialProgression(
  team: Team,
  teamSequentialModes?: Record<string, boolean>
): boolean {
  if (teamSequentialModes && typeof teamSequentialModes[team.id] === 'boolean') {
    return teamSequentialModes[team.id];
  }
  return team.sequentialProgression ?? false;
}

/**
 * Computes step status for a specific question within a team:
 * - Step number & total steps
 * - Lock status based on sequential mode
 * - Active / current step status
 * - Which previous quest needs completion if locked
 */
export function getQuestionStepInfo(
  questionId: string,
  team: Team,
  gameState: GameState
): {
  stepNumber: number;
  totalSteps: number;
  isLocked: boolean;
  isCurrent: boolean;
  isDone: boolean;
  previousQuestTitle?: string;
} {
  if (!team || !gameState) {
    return {
      stepNumber: 1,
      totalSteps: 1,
      isLocked: false,
      isCurrent: true,
      isDone: false
    };
  }

  const submissions = gameState.submissions || {};
  const ordered = getTeamOrderedQuestions(
    team,
    gameState.questions || [],
    gameState.teamQuestionOrders
  );

  const index = ordered.findIndex((q) => q.id === questionId);
  const isDone = !!submissions[`${team.id}_${questionId}`];

  if (index === -1) {
    return {
      stepNumber: 1,
      totalSteps: Math.max(1, ordered.length),
      isLocked: false,
      isCurrent: false,
      isDone,
    };
  }

  const isSequential = isTeamSequentialProgression(
    team,
    gameState.teamSequentialModes
  );

  if (!isSequential) {
    return {
      stepNumber: index + 1,
      totalSteps: ordered.length,
      isLocked: false,
      isCurrent: !isDone,
      isDone,
    };
  }

  // Find index of the first quest that is NOT yet submitted
  const firstUnfinishedIndex = ordered.findIndex(
    (q) => !submissions[`${team.id}_${q.id}`]
  );

  // If all are finished
  if (firstUnfinishedIndex === -1) {
    return {
      stepNumber: index + 1,
      totalSteps: ordered.length,
      isLocked: false,
      isCurrent: false,
      isDone: true,
    };
  }

  const isLocked = index > firstUnfinishedIndex;
  const isCurrent = index === firstUnfinishedIndex;
  const previousQuestTitle =
    isLocked && firstUnfinishedIndex >= 0
      ? ordered[firstUnfinishedIndex]?.title
      : undefined;

  return {
    stepNumber: index + 1,
    totalSteps: ordered.length,
    isLocked,
    isCurrent,
    isDone,
    previousQuestTitle,
  };
}
