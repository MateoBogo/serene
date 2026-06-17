import { Injectable } from '@angular/core';
import { BehaviorSubject, combineLatest, interval, map, Observable, Subscription } from 'rxjs';

export type TimerState = 'idle' | 'running' | 'paused' | 'completed';

export interface TimerStatus {
  remainingSeconds: number;
  totalSeconds: number;
  elapsedSeconds: number;
  progress: number;
  state: TimerState;
  hours: number;
  minutes: number;
  seconds: number;
  isUnlimited: boolean;
}

const DEFAULT_DURATION_SECONDS = 10 * 60;

@Injectable({
  providedIn: 'root',
})
export class TimerService {
  private readonly durationSeconds$ = new BehaviorSubject<number>(DEFAULT_DURATION_SECONDS);
  private readonly remaining$ = new BehaviorSubject<number>(DEFAULT_DURATION_SECONDS);
  private readonly elapsed$ = new BehaviorSubject<number>(0);
  private readonly state$ = new BehaviorSubject<TimerState>('idle');
  private readonly unlimited$ = new BehaviorSubject<boolean>(false);
  private tickSubscription?: Subscription;

  readonly status$: Observable<TimerStatus> = combineLatest([
    this.durationSeconds$,
    this.remaining$,
    this.elapsed$,
    this.state$,
    this.unlimited$,
  ]).pipe(
    map(([durationSeconds, remaining, elapsed, state, isUnlimited]) => {
      const total = durationSeconds;
      const safeRemaining = Math.max(0, remaining);
      const safeElapsed = Math.max(0, elapsed);
      const displaySeconds = isUnlimited ? safeElapsed : safeRemaining;

      return {
        remainingSeconds: displaySeconds,
        totalSeconds: isUnlimited ? 0 : total,
        elapsedSeconds: safeElapsed,
        progress: isUnlimited ? 1 : total > 0 ? safeRemaining / total : 0,
        state,
        hours: Math.floor(displaySeconds / 3600),
        minutes: Math.floor((displaySeconds % 3600) / 60),
        seconds: displaySeconds % 60,
        isUnlimited,
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
    this.unlimited$.next(false);
    this.durationSeconds$.next(nextDuration);
    this.remaining$.next(nextDuration);
    this.elapsed$.next(0);
    this.state$.next('idle');
  }

  setUnlimitedDuration(enabled: boolean): void {
    if (this.state$.value === 'running' || this.state$.value === 'paused') {
      return;
    }

    this.unlimited$.next(enabled);
    this.remaining$.next(enabled ? 0 : this.durationSeconds$.value);
    this.elapsed$.next(0);
    this.state$.next('idle');
  }

  start(): void {
    if (this.state$.value === 'running') {
      return;
    }

    if (this.state$.value === 'idle' || this.state$.value === 'completed') {
      this.elapsed$.next(0);

      if (this.unlimited$.value) {
        this.remaining$.next(0);
      } else {
        this.remaining$.next(this.durationSeconds$.value);
      }
    }

    if (!this.unlimited$.value && this.durationSeconds$.value <= 0) {
      this.state$.next('completed');
      return;
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
    this.remaining$.next(this.unlimited$.value ? 0 : this.durationSeconds$.value);
    this.elapsed$.next(0);
    this.state$.next('idle');
  }

  adjustDuration(deltaMinutes: number): void {
    if (this.state$.value !== 'running' && this.state$.value !== 'paused') {
      return;
    }

    if (this.unlimited$.value) {
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
      this.elapsed$.next(nextDuration);
      this.state$.next('completed');
      this.stopTicking();
    }
  }

  private startTicking(): void {
    this.stopTicking();

    this.tickSubscription = interval(1000).subscribe(() => {
      if (this.unlimited$.value) {
        const nextElapsed = this.elapsed$.value + 1;
        this.elapsed$.next(nextElapsed);
        this.remaining$.next(nextElapsed);
        return;
      }

      const next = this.remaining$.value - 1;

      if (next <= 0) {
        this.remaining$.next(0);
        this.elapsed$.next(this.durationSeconds$.value);
        this.state$.next('completed');
        this.stopTicking();
        return;
      }

      this.elapsed$.next(this.elapsed$.value + 1);
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
      return DEFAULT_DURATION_SECONDS;
    }

    return Math.max(0, nextSeconds);
  }
}
