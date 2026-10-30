export type Language = 'el' | 'en';

export type QuestionType =
  | 'multiple_choice'
  | 'true_false'
  | 'text_match'
  | 'image_match'
  | 'qr_scan'
  | 'photo_upload'
  | 'puzzle'
  | 'task'
  | 'research'
  | 'survey';

export interface SurveyPayload {
  options: string[];
  options_en?: string[];
  allowMultiple?: boolean;
  allowCustomReason?: boolean;
  reasonPrompt?: string;
  reasonPrompt_en?: string;
}

export interface MultipleChoicePayload {
  options: string[];
  correctOptionIndex?: number;
  correctOptionIndices?: number[];
}

export function getMultipleChoiceCorrectIndices(payload: MultipleChoicePayload): number[] {
  if (Array.isArray(payload.correctOptionIndices) && payload.correctOptionIndices.length > 0) {
    return payload.correctOptionIndices;
  }
  if (typeof payload.correctOptionIndex === 'number') {
    return [payload.correctOptionIndex];
  }
  return [0];
}

export interface TrueFalsePayload {
  correctValue: boolean;
}

export interface TextMatchPair {
  id: string;
  left: string;
  right: string;
}

export interface TextMatchPayload {
  pairs: TextMatchPair[];
}

export interface ImageMatchPair {
  id: string;
  image: string;
  text: string;
}

export interface ImageMatchPayload {
  pairs: ImageMatchPair[];
}

export type QrMediaType = 'image' | 'video';

export interface QrScanMedia {
  type: QrMediaType;
  url: string;
  title?: string;
  caption?: string;
}

export interface QrScanPayload {
  targetCode: string;
  locationHint?: string;
  unlockedMedia?: QrScanMedia;
  unlockedImageUrl?: string;
  unlockedVideoUrl?: string;
}

export interface PhotoUploadPayload {
  instructions: string;
  sampleReferenceUrl?: string;
  acceptedTypes?: 'photo' | 'video' | 'both';
  maxFileSizeMb?: number;
  minWordCount?: number;
  promptGuidance?: string;
}

export interface PuzzlePayload {
  imageUrl: string;
  gridPieces: 4 | 6 | 9; // 4 (2x2), 6 (3x2), 9 (3x3)
  pieceShape?: 'standard' | 'classic';
}

export interface TaskPayload {
  instructions: string; // The mission objective & instructions
  checklist?: string[]; // Step-by-step checklist / checkpoints to complete
  requiresEvidence?: 'text' | 'photo' | 'both' | 'confirmation_only'; // Submission requirement
  minWords?: number;
  completionPrompt?: string; // Prompt for team's report/findings
}

export interface ResearchResourceLink {
  title: string;
  url: string;
  description?: string;
}

export interface ResearchPayload {
  researchTopic: string; // The inquiry topic or core question
  instructions: string; // Research prompt / guidelines
  suggestedSources?: ResearchResourceLink[]; // Helpful links or reference sources
  guidingQuestions?: string[]; // Specific inquiry questions to investigate
  minWords?: number; // Minimum words for findings
  requiresSourceLinks?: boolean; // Whether teams must cite links they found
  requiresEvidencePhoto?: boolean; // Whether teams may upload notes or evidence photo
}

export interface FieldSpotInfo {
  spotCode?: string; // QR code string or trigger value (e.g. "VULTURE-PARK-STATION-56")
  spotName?: string; // Station/spot name (e.g. "Σταθμός #56: Ταΐστρα Όρνιων")
  spotName_en?: string;
  mediaType?: 'video' | 'image';
  mediaUrl?: string; // High-res photo URL or field video URL
  mediaTitle?: string;
  mediaTitle_en?: string;
  caption?: string; // Educational observation field notes
  caption_en?: string;
}

export interface Question {
  id: string;
  title: string;
  description: string;
  type: QuestionType;
  points: number;
  imageUrl?: string; // Optional image for multiple_choice, true_false, task, etc.
  videoUrl?: string; // Optional video for multiple_choice, task, etc.
  assignedTeamIds?: string[]; // If empty or undefined, applies to all teams
  isActive?: boolean; // If false, question is temporarily disabled/hidden
  fieldSpot?: FieldSpotInfo; // Optional field spot & QR trigger metadata
  payload:
    | MultipleChoicePayload
    | TrueFalsePayload
    | TextMatchPayload
    | ImageMatchPayload
    | QrScanPayload
    | PhotoUploadPayload
    | PuzzlePayload
    | TaskPayload
    | ResearchPayload
    | SurveyPayload;
  explanation?: string;
  timeLimitMinutes?: number; // Optional time limit in minutes for task deadline
  // English localization
  title_en?: string;
  description_en?: string;
  explanation_en?: string;
  payload_en?: any;
}

export type CoreTrackId = 'team-alpha' | 'team-beta' | 'team-gamma' | 'team-delta';

export interface ThematicTrackInfo {
  id: CoreTrackId;
  trackId?: CoreTrackId;
  trackNumber: number;
  title: string;
  title_el?: string;
  title_en: string;
  theme: string;
  theme_en: string;
  description?: string;
  description_en?: string;
  color: string;
  avatar: string;
  tasksCount?: number;
}

export interface CustomTeamTitleRecord {
  name?: string;
  name_en?: string;
  slogan?: string;
  slogan_en?: string;
  language?: 'el' | 'en';
  trackId?: CoreTrackId;
}

export interface Team {
  id: string; // Unique subgroup identifier (e.g. 'team-alpha', 'team-delta', 'subgroup-delta-en', etc.)
  trackId?: CoreTrackId; // Core thematic track: team-alpha (Track 1), team-beta (Track 2), team-gamma (Track 3), team-delta (Track 4)
  name: string;
  name_en?: string;
  color: string;
  avatar: string;
  slogan?: string;
  slogan_en?: string;
  language?: 'el' | 'en'; // Independent language preference for this subgroup (el | en)
  questionOrder?: string[]; // IDs of questions in sequence for this team
  sequentialProgression?: boolean; // If true, team must answer questions in order
  reflectionText?: string; // Student reflection and wow moment quote
  isCustomTitle?: boolean; // True when teacher has saved a custom title override
}

export interface Submission {
  id: string;
  teamId: string;
  questionId: string;
  submittedAt: number;
  status: 'correct' | 'incorrect' | 'completed' | 'pending';
  scoreEarned: number;
  answerData: any;
  photoUrl?: string;
  reflectionText?: string; // Open-ended reflection text
  puzzleStats?: {
    moves: number;
    durationSeconds: number;
  };
  feedbackNote?: string;
  scientificFact?: {
    taskId: string;
    taskTitle: string;
    taskTitle_en?: string;
    taskType: string;
    points: number;
    correctAnswerText: string;
    correctAnswerText_en: string;
    explanation: string;
    explanation_en: string;
    keyTakeaway: string;
    keyTakeaway_en: string;
    isMistakeTurnedLearning: boolean;
    initialStatus: 'correct' | 'incorrect' | 'completed';
    recordedAt: number;
    teamId: string;
    badge?: string;
    badge_en?: string;
    icon?: string;
  };
}

export interface TimerState {
  totalSeconds: number;
  remainingSeconds: number;
  isRunning: boolean;
  updatedAt: number;
}

export type GamePhase = 'waiting_lobby' | 'in_progress' | 'synthesis' | 'discussion';

export interface TeamSynthesisNote {
  id: string;
  teamId: string;
  title: string;
  content: string;
  createdAt: number;
  author?: string;
  imageUrl?: string;
  likes?: number;
  feedbackComment?: string;
}

export interface GameState {
  id: string;
  title: string;
  description: string;
  title_en?: string;
  description_en?: string;
  phase: GamePhase;
  synthesisPrompt?: string;
  synthesisPrompt_en?: string;
  synthesisNotes: TeamSynthesisNote[];
  teams: Team[];
  questions: Question[];
  submissions: Record<string, Submission>; // key: `${teamId}_${questionId}`
  teamQuestionOrders?: Record<string, string[]>; // teamId -> ordered array of questionIds
  teamSequentialModes?: Record<string, boolean>; // teamId -> boolean (true: answer in order step-by-step)
  timer: TimerState;
  activeRound: number;
  updatedAt: number;
}

export type ViewMode = 'padlet_board' | 'team_play' | 'projector' | 'discussion' | 'admin';
