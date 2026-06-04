export interface MeditationSession {
  id: string;
  startTime: string;
  endTime: string;
  durationSeconds: number;
  ambiance: string;
  completed: boolean;
}

export interface SessionStats {
  totalMinutes: number;
  sessionCount: number;
  averageMinutes: number;
}

export interface CompletedSessionInput {
  durationSeconds: number;
  ambiance: string;
  completedAt?: Date;
}
