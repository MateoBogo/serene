import { Injectable } from '@angular/core';
import { BehaviorSubject, combineLatest, interval, map, Observable, Subscription } from 'rxjs';

export type TimerState = 'idle' | 'running' | 'paused' | 'completed';

export interface TimerStatus {
  remainingSeconds: number;
  totalSeconds: number;
  progress: number;
  state: TimerState;
  minutes: number;
  seconds: number;
}

@Injectable({
  providedIn: 'root',
})
export class TimerService {
  private readonly duration$ = new BehaviorSubject<number>(10);
  private readonly remaining$ = new BehaviorSubject<number>(10 * 60);
  private readonly state$ = new BehaviorSubject<TimerState>('idle');
  private tickSubscription?: Subscription;

  readonly status$: Observable<TimerStatus> = combineLatest([
    this.duration$,
    this.remaining$,
    this.state$,
  ]).pipe(
    map(([duration, remaining, state]) => {
      const total = duration * 60;
      const safeRemaining = Math.max(0, remaining);

      return {
        remainingSeconds: safeRemaining,
        totalSeconds: total,
        progress: total > 0 ? safeRemaining / total : 0,
        state,
        minutes: Math.floor(safeRemaining / 60),
        seconds: safeRemaining % 60,
      };
    }),
  );

  get duration(): number {
    return this.duration$.value;
  }

  setDuration(minutes: number): void {
    if (this.state$.value === 'running' || this.state$.value === 'paused') {
      return;
    }

    const nextDuration = Number(minutes);
    this.duration$.next(nextDuration);
    this.remaining$.next(nextDuration * 60);
    this.state$.next('idle');
  }

  start(): void {
    if (this.state$.value === 'running') {
      return;
    }

    if (this.state$.value === 'idle' || this.state$.value === 'completed') {
      this.remaining$.next(this.duration$.value * 60);
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
    this.remaining$.next(this.duration$.value * 60);
    this.state$.next('idle');
  }

  adjustDuration(deltaMinutes: number): void {
    if (this.state$.value !== 'running' && this.state$.value !== 'paused') {
      return;
    }

    const nextDuration = Math.max(1, this.duration$.value + deltaMinutes);
    const nextRemaining = Math.max(0, this.remaining$.value + deltaMinutes * 60);

    this.duration$.next(nextDuration);
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

}
