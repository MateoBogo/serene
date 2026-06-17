import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

import { CompletedSessionInput, MeditationSession, SessionStats } from '../models/session.model';

const SESSIONS_KEY = 'serene.sessions';
const WEEK_IN_MS = 7 * 24 * 60 * 60 * 1000;

@Injectable({
  providedIn: 'root',
})
export class SessionService {
  private readonly sessionsSubject = new BehaviorSubject<MeditationSession[]>(this.readSessions());
  readonly sessions$ = this.sessionsSubject.asObservable();

  get sessionsSnapshot(): MeditationSession[] {
    return this.sessionsSubject.value;
  }

  addCompletedSession(input: CompletedSessionInput): MeditationSession {
    const end = input.completedAt ?? new Date();
    const start = new Date(end.getTime() - input.durationSeconds * 1000);

    const session: MeditationSession = {
      id: this.createId(),
      startTime: start.toISOString(),
      endTime: end.toISOString(),
      durationSeconds: input.durationSeconds,
      ambiance: input.ambiance,
      completed: true,
      mood: input.mood,
    };

    const updated = [session, ...this.sessionsSubject.value].slice(0, 50);
    this.persist(updated);

    return session;
  }

  setMood(sessionId: string, mood: number): void {
    const updated = this.sessionsSubject.value.map((session) =>
      session.id === sessionId ? { ...session, mood } : session,
    );

    this.persist(updated);
  }

  getWeeklyStats(referenceDate = new Date()): SessionStats {
    const endTime = referenceDate.getTime();
    const startTime = endTime - WEEK_IN_MS;
    const sessions = this.sessionsSubject.value.filter((session) => {
      const sessionTime = new Date(session.endTime).getTime();

      return session.completed && sessionTime >= startTime && sessionTime <= endTime;
    });
    const totalSeconds = sessions.reduce((total, session) => total + session.durationSeconds, 0);
    const totalMinutes = Math.round(totalSeconds / 60);
    const sessionCount = sessions.length;

    const moodSessions = sessions.filter((session) => typeof session.mood === 'number');
    const moodCount = moodSessions.length;
    const moodTotal = moodSessions.reduce((total, session) => total + (session.mood ?? 0), 0);

    return {
      totalMinutes,
      sessionCount,
      averageMinutes: sessionCount > 0 ? Math.round(totalMinutes / sessionCount) : 0,
      averageMood: moodCount > 0 ? Math.round((moodTotal / moodCount) * 10) / 10 : 0,
      moodCount,
    };
  }

  getDailyMinutes(): Map<string, number> {
    const minutesByDay = new Map<string, number>();

    for (const session of this.sessionsSubject.value) {
      if (!session.completed) {
        continue;
      }

      const key = this.dayKey(new Date(session.endTime));
      const minutes = session.durationSeconds / 60;
      minutesByDay.set(key, (minutesByDay.get(key) ?? 0) + minutes);
    }

    return minutesByDay;
  }

  dayKey(date: Date): string {
    const year = date.getFullYear();
    const month = `${date.getMonth() + 1}`.padStart(2, '0');
    const day = `${date.getDate()}`.padStart(2, '0');

    return `${year}-${month}-${day}`;
  }

  private persist(sessions: MeditationSession[]): void {
    this.sessionsSubject.next(sessions);
    localStorage.setItem(SESSIONS_KEY, JSON.stringify(sessions));
  }

  private readSessions(): MeditationSession[] {
    const raw = localStorage.getItem(SESSIONS_KEY);

    if (!raw) {
      return [];
    }

    try {
      return JSON.parse(raw) as MeditationSession[];
    } catch {
      return [];
    }
  }

  private createId(): string {
    if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
      return crypto.randomUUID();
    }

    return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
  }
}
