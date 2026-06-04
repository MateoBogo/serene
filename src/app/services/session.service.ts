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

  addCompletedSession(input: CompletedSessionInput): void {
    const end = input.completedAt ?? new Date();
    const start = new Date(end.getTime() - input.durationSeconds * 1000);

    const session: MeditationSession = {
      id: this.createId(),
      startTime: start.toISOString(),
      endTime: end.toISOString(),
      durationSeconds: input.durationSeconds,
      ambiance: input.ambiance,
      completed: true,
    };

    const updated = [session, ...this.sessionsSubject.value].slice(0, 50);
    this.sessionsSubject.next(updated);
    localStorage.setItem(SESSIONS_KEY, JSON.stringify(updated));
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

    return {
      totalMinutes,
      sessionCount,
      averageMinutes: sessionCount > 0 ? Math.round(totalMinutes / sessionCount) : 0,
    };
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
