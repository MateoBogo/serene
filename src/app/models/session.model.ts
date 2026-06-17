export interface MeditationSession {
  id: string;
  startTime: string;
  endTime: string;
  durationSeconds: number;
  ambiance: string;
  completed: boolean;
  mood?: number;
}

export interface SessionStats {
  totalMinutes: number;
  sessionCount: number;
  averageMinutes: number;
  averageMood: number;
  moodCount: number;
}

export interface CompletedSessionInput {
  durationSeconds: number;
  ambiance: string;
  completedAt?: Date;
  mood?: number;
}

export interface MoodOption {
  value: number;
  emoji: string;
  label: string;
}

export const MOODS: MoodOption[] = [
  { value: 1, emoji: '😣', label: 'Tendu' },
  { value: 2, emoji: '😕', label: 'Mitigé' },
  { value: 3, emoji: '😐', label: 'Neutre' },
  { value: 4, emoji: '🙂', label: 'Apaisé' },
  { value: 5, emoji: '😌', label: 'Serein' },
];

export function moodEmoji(value: number | undefined): string {
  if (!value) {
    return '–';
  }

  const rounded = Math.min(5, Math.max(1, Math.round(value)));

  return MOODS.find((mood) => mood.value === rounded)?.emoji ?? '–';
}
