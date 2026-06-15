import { Injectable } from '@angular/core';
import { BehaviorSubject, combineLatest, interval, map, Observable, Subscription } from 'rxjs';

export type TimerState = 'idle' | 'running' | 'paused' | 'completed';

export interface TimerStatus {
  remainingSeconds: number;
  totalSeconds: number;
  progress: number;
  state: TimerState;
  hours: number;
  minutes: number;
  seconds: number;
}

const MIN_DURATION_SECONDS = 30;
const MAX_DURATION_SECONDS = 9 * 60 * 60 + 59 * 60 + 59;

@Injectable({
  providedIn: 'root',
})
export class TimerService {
  private readonly durationSeconds$ = new BehaviorSubject<number>(10 * 60);
  private readonly remaining$ = new BehaviorSubject<number>(10 * 60);
  private readonly state$ = new BehaviorSubject<TimerState>('idle');
  private tickSubscription?: Subscription;

  readonly status$: Observable<TimerStatus> = combineLatest([
    this.durationSeconds$,
    this.remaining$,
    this.state$,
  ]).pipe(
    map(([durationSeconds, remaining, state]) => {
      const total = durationSeconds;
      const safeRemaining = Math.max(0, remaining);

      return {
        remainingSeconds: safeRemaining,
        totalSeconds: total,
        progress: total > 0 ? safeRemaining / total : 0,
        state,
        hours: Math.floor(safeRemaining / 3600),
        minutes: Math.floor((safeRemaining % 3600) / 60),
        seconds: safeRemaining % 60,
      };
    }),
  );

  get duration(): number {
    return Math.floor(this.durationSeconds$.value / 60);
  }

  get durationSeconds(): number {
    return this.durationSeconds$.value;
  }

  setDuration(minutes: number): void {
    this.setDurationSeconds(Number(minutes) * 60);
  }

  setDurationSeconds(seconds: number): void {
    if (this.state$.value === 'running' || this.state$.value === 'paused') {
      return;
    }

    const nextDuration = this.normalizeDurationSeconds(seconds);
    this.durationSeconds$.next(nextDuration);
    this.remaining$.next(nextDuration);
    this.state$.next('idle');
  }

  start(): void {
    if (this.state$.value === 'running') {
      return;
    }

    if (this.state$.value === 'idle' || this.state$.value === 'completed') {
      this.remaining$.next(this.durationSeconds$.value);
    }

    this.state$.next('running');
    this.startTicking();
  }

  pause(): void {
    if (this.state$.value !== 'running') {
      return;
    }

    this.state$.next('paused');
    this.stopTicking();
  }

  resume(): void {
    if (this.state$.value !== 'paused') {
      return;
    }

    this.state$.next('running');
    this.startTicking();
  }

  stop(): void {
    this.stopTicking();
    this.remaining$.next(this.durationSeconds$.value);
    this.state$.next('idle');
  }

  adjustDuration(deltaMinutes: number): void {
    if (this.state$.value !== 'running' && this.state$.value !== 'paused') {
      return;
    }

    const deltaSeconds = deltaMinutes * 60;
    const nextRemaining = Math.max(0, this.remaining$.value + deltaSeconds);
    const nextDuration =
      nextRemaining === 0
        ? this.durationSeconds$.value
        : this.normalizeDurationSeconds(this.durationSeconds$.value + deltaSeconds);

    this.durationSeconds$.next(nextDuration);
    this.remaining$.next(nextRemaining);

    if (nextRemaining === 0) {
      this.state$.next('completed');
      this.stopTicking();
    }
  }

  private startTicking(): void {
    this.stopTicking();

    this.tickSubscription = interval(1000).subscribe(() => {
      const next = this.remaining$.value - 1;

      if (next <= 0) {
        this.remaining$.next(0);
        this.state$.next('completed');
        this.stopTicking();
        return;
      }

      this.remaining$.next(next);
    });
  }

  private stopTicking(): void {
    this.tickSubscription?.unsubscribe();
    this.tickSubscription = undefined;
  }

  private normalizeDurationSeconds(seconds: number): number {
    const nextSeconds = Math.floor(Number(seconds));

    if (Number.isNaN(nextSeconds)) {
      return MIN_DURATION_SECONDS;
    }

    return Math.min(MAX_DURATION_SECONDS, Math.max(MIN_DURATION_SECONDS, nextSeconds));
  }
}
