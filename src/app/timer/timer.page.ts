import { Component, inject, OnDestroy } from '@angular/core';
import {
  IonButton,
  IonContent,
  IonHeader,
  IonIcon,
  IonItem,
  IonLabel,
  IonList,
  IonListHeader,
  IonSelect,
  IonSelectOption,
  IonTitle,
  IonToolbar,
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { add, chevronDown, chevronUp, pause, play, remove, stop } from 'ionicons/icons';
import { interval, Subscription } from 'rxjs';

import { TimerCircleComponent } from '../components/timer-circle/timer-circle.component';
import { SessionService } from '../services/session.service';
import { AmbianceKey, SoundService } from '../services/sound.service';
import { TimerService, TimerStatus } from '../services/timer.service';

type DurationPart = 'hours' | 'minutes' | 'seconds';

@Component({
  selector: 'app-timer',
  templateUrl: 'timer.page.html',
  styleUrls: ['timer.page.scss'],
  imports: [
    IonButton,
    IonContent,
    IonHeader,
    IonIcon,
    IonItem,
    IonLabel,
    IonList,
    IonListHeader,
    IonSelect,
    IonSelectOption,
    IonTitle,
    IonToolbar,
    TimerCircleComponent,
  ],
})
export class TimerPage implements OnDestroy {
  status: TimerStatus = {
    remainingSeconds: 600,
    totalSeconds: 600,
    progress: 1,
    state: 'idle',
    hours: 0,
    minutes: 10,
    seconds: 0,
  };

  hint = 'Prêt à méditer';
  readonly maxHours = 9;
  readonly preparationDuration = 10;
  readonly minDurationSeconds = 30;
  durationHours = 0;
  durationMinutes = 10;
  durationSeconds = 0;
  isPreparing = false;
  preparationRemaining = this.preparationDuration;
  selectedAmbiance: AmbianceKey = 'rain';
  readonly sessionService = inject(SessionService);
  readonly soundService = inject(SoundService);
  readonly timerService = inject(TimerService);
  readonly ambiances = this.soundService.ambiances;
  private readonly sub: Subscription;
  private preparationSub?: Subscription;
  private previousState = this.status.state;

  constructor() {
    addIcons({ add, chevronDown, chevronUp, pause, play, remove, stop });

    this.sub = this.timerService.status$.subscribe((status) => {
      this.status = status;
      this.hint = this.getHint(status.state);

      if (status.state === 'completed' && this.previousState !== 'completed') {
        this.sessionService.addCompletedSession({
          ambiance: this.selectedAmbiance,
          durationSeconds: status.totalSeconds,
        });
        this.soundService.playEnd();
      }

      this.previousState = status.state;
    });
  }

  get circleStatus(): TimerStatus {
    if (!this.isPreparing) {
      return this.status;
    }

    return {
      remainingSeconds: this.preparationRemaining,
      totalSeconds: this.preparationDuration,
      progress: this.preparationRemaining / this.preparationDuration,
      state: 'running',
      hours: 0,
      minutes: 0,
      seconds: this.preparationRemaining,
    };
  }

  get circleHint(): string {
    if (this.isPreparing) {
      return 'Préparation';
    }

    return this.hint;
  }

  get selectedAmbianceLabel(): string {
    return this.ambiances.find((ambiance) => ambiance.value === this.selectedAmbiance)?.label ?? 'Silence';
  }

  get estimatedEndTime(): string {
    if (this.isPreparing) {
      return `Début dans : ${this.preparationRemaining} s`;
    }

    const end = new Date(Date.now() + this.status.remainingSeconds * 1000);
    const time = end.toLocaleTimeString('fr-FR', {
      hour: '2-digit',
      minute: '2-digit',
    });

    return `Fin estimée : ${time}`;
  }

  get durationPreview(): string {
    return this.formatDuration(this.selectedDurationSeconds);
  }

  start(): void {
    if (this.isPreparing || this.status.state === 'running') {
      return;
    }

    this.soundService.playStart();
    this.soundService.playAmbiance(this.selectedAmbiance);
    this.startPreparation();
  }

  pause(): void {
    this.timerService.pause();
    this.soundService.pauseAmbiance();
  }

  resume(): void {
    this.timerService.resume();
    this.soundService.resumeAmbiance();
  }

  stop(): void {
    this.cancelPreparation();
    this.timerService.stop();
    this.soundService.stopAll();
  }

  close(): void {
    this.cancelPreparation();
    this.timerService.stop();
    this.soundService.stopAll();
  }

  changeAmbiance(value: AmbianceKey): void {
    this.selectedAmbiance = value;
  }

  changeTime(part: DurationPart, delta: number): void {
    if (this.isPreparing || this.status.state !== 'idle') {
      return;
    }

    if (part === 'hours') {
      this.durationHours = this.clamp(this.durationHours + delta, 0, this.maxHours);
    }

    if (part === 'minutes') {
      this.durationMinutes = this.clamp(this.durationMinutes + delta, 0, 59);
    }

    if (part === 'seconds') {
      this.durationSeconds = this.clamp(this.durationSeconds + delta, 0, 59);
    }

    this.applyPickerDuration();
  }

  increaseDuration(): void {
    this.timerService.adjustDuration(1);
  }

  decreaseDuration(): void {
    this.timerService.adjustDuration(-1);
  }

  ngOnDestroy(): void {
    this.sub.unsubscribe();
    this.cancelPreparation();
    this.soundService.stopAll();
  }

  private startPreparation(): void {
    this.cancelPreparation();
    this.isPreparing = true;
    this.preparationRemaining = this.preparationDuration;

    this.preparationSub = interval(1000).subscribe(() => {
      this.preparationRemaining -= 1;

      if (this.preparationRemaining <= 0) {
        this.finishPreparation();
      }
    });
  }

  private finishPreparation(): void {
    this.cancelPreparation();
    this.soundService.playStart();
    this.timerService.start();
  }

  private cancelPreparation(): void {
    this.preparationSub?.unsubscribe();
    this.preparationSub = undefined;
    this.isPreparing = false;
    this.preparationRemaining = this.preparationDuration;
  }

  private applyPickerDuration(): void {
    let totalSeconds = this.selectedDurationSeconds;

    if (totalSeconds < this.minDurationSeconds) {
      totalSeconds = this.minDurationSeconds;
      this.durationHours = 0;
      this.durationMinutes = 0;
      this.durationSeconds = this.minDurationSeconds;
    }

    this.timerService.setDurationSeconds(totalSeconds);
  }

  private get selectedDurationSeconds(): number {
    return this.durationHours * 3600 + this.durationMinutes * 60 + this.durationSeconds;
  }

  private formatDuration(totalSeconds: number): string {
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;

    return `${this.pad(hours)}:${this.pad(minutes)}:${this.pad(seconds)}`;
  }

  pad(value: number): string {
    return value.toString().padStart(2, '0');
  }

  private clamp(value: number, min: number, max: number): number {
    return Math.min(max, Math.max(min, value));
  }

  private getHint(state: string): string {
    if (state === 'running') {
      return 'En cours';
    }

    if (state === 'paused') {
      return 'En pause';
    }

    if (state === 'completed') {
      return 'Session terminée';
    }

    return 'Prêt à méditer';
  }
}
