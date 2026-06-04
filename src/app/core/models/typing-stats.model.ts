export interface TypingStats {
  wpm: number;
  rawWpm: number;
  accuracy: number;
  progressPercent: number;
  correctChars: number;
  incorrectChars: number;
  remainingChars: number;
  totalKeystrokes: number;
  durationMs: number;
  completed: boolean;
}

export interface TypingProgress {
  index: number;
  errors: number;
  correctChars: number;
  incorrectChars: number;
  startedAt: number | null;
  finishedAt: number | null;
}
