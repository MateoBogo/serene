import { Component, inject, OnDestroy } from '@angular/core';
import { RouterLink } from '@angular/router';
import {
  IonButton,
  IonCheckbox,
  IonContent,
  IonHeader,
  IonIcon,
  IonLabel,
  IonList,
  IonListHeader,
  IonSegment,
  IonSegmentButton,
  IonTitle,
  IonToolbar,
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import {
  add,
  cloudyOutline,
  leafOutline,
  pause,
  play,
  rainyOutline,
  remove,
  stop,
  thunderstormOutline,
  volumeMuteOutline,
  waterOutline,
} from 'ionicons/icons';
import { interval, Subscription } from 'rxjs';

import { BreathingComponent } from '../components/breathing/breathing.component';
import { TimerCircleComponent } from '../components/timer-circle/timer-circle.component';
import { MOODS } from '../models/session.model';
import { SessionService } from '../services/session.service';
import { SettingsService } from '../services/settings.service';
import { AmbianceKey, SoundService } from '../services/sound.service';
import { TimerService, TimerStatus } from '../services/timer.service';

type DurationPart = 'hours' | 'minutes' | 'seconds';

interface DurationReel {
  ariaLabel: string;
  label: string;
  part: DurationPart;
}

@Component({
  selector: 'app-timer',
  templateUrl: 'timer.page.html',
  styleUrls: ['timer.page.scss'],
  imports: [
    IonButton,
    IonCheckbox,
    IonContent,
    IonHeader,
    IonIcon,
    IonLabel,
    IonList,
    IonListHeader,
    IonSegment,
    IonSegmentButton,
    IonTitle,
    IonToolbar,
    RouterLink,
    BreathingComponent,
    TimerCircleComponent,
  ],
})
export class TimerPage implements OnDestroy {
  status: TimerStatus = {
    remainingSeconds: 600,
    totalSeconds: 600,
    elapsedSeconds: 0,
    progress: 1,
    state: 'idle',
    hours: 0,
    minutes: 10,
    seconds: 0,
    isUnlimited: false,
  };

  hint = 'Prêt à méditer';
  readonly preparationDuration = 10;
  durationHours = 0;
  durationMinutes = 10;
  durationSeconds = 0;
  isUnlimited = false;
  isPreparing = false;
  preparationRemaining = this.preparationDuration;
  selectedAmbiance: AmbianceKey = 'rain';
  readonly moods = MOODS;
  selectedMood?: number;
  mode: 'timer' | 'breathing' = 'timer';
  readonly durationReels: DurationReel[] = [
    { ariaLabel: 'Heures', label: 'h', part: 'hours' },
    { ariaLabel: 'Minutes', label: 'm', part: 'minutes' },
    { ariaLabel: 'Secondes', label: 's', part: 'seconds' },
  ];
  private lastSessionId?: string;
  readonly sessionService = inject(SessionService);
  readonly settingsService = inject(SettingsService);
  readonly soundService = inject(SoundService);
  readonly timerService = inject(TimerService);
  readonly ambiances = this.soundService.ambiances;
  private readonly sub: Subscription;
  private preparationSub?: Subscription;
  private previousState = this.status.state;

  constructor() {
    addIcons({
      add,
      cloudyOutline,
      leafOutline,
      pause,
      play,
      rainyOutline,
      remove,
      stop,
      thunderstormOutline,
      volumeMuteOutline,
      waterOutline,
    });

    const settings = this.settingsService.snapshot;
    this.selectedAmbiance = settings.defaultAmbiance;
    this.durationHours = Math.floor(settings.defaultDurationMinutes / 60);
    this.durationMinutes = settings.defaultDurationMinutes % 60;
    this.durationSeconds = 0;
    this.timerService.setDuration(settings.defaultDurationMinutes);

    this.sub = this.timerService.status$.subscribe((status) => {
      this.status = status;
      this.hint = this.getHint(status.state);

      if (
        status.state === 'completed' &&
        this.previousState !== 'completed' &&
        !status.isUnlimited &&
        status.totalSeconds > 0
      ) {
        const saved = this.sessionService.addCompletedSession({
          ambiance: this.selectedAmbiance,
          durationSeconds: status.totalSeconds,
        });
        this.lastSessionId = saved?.id;
        this.selectedMood = undefined;
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
      elapsedSeconds: this.preparationDuration - this.preparationRemaining,
      progress: this.preparationRemaining / this.preparationDuration,
      state: 'running',
      hours: 0,
      minutes: 0,
      seconds: this.preparationRemaining,
      isUnlimited: false,
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

    if (this.status.isUnlimited) {
      if (this.status.state === 'running' || this.status.state === 'paused') {
        return `Temps écoulé : ${this.formatDuration(this.status.elapsedSeconds)}`;
      }

      return 'Sans limite : arrête quand tu veux';
    }

    const end = new Date(Date.now() + this.status.remainingSeconds * 1000);
    const time = end.toLocaleTimeString('fr-FR', {
      hour: '2-digit',
      minute: '2-digit',
    });

    return `Fin estimée : ${time}`;
  }

  get durationPreview(): string {
    if (this.isUnlimited) {
      return 'Sans limite';
    }

    return this.formatDuration(this.selectedDurationSeconds);
  }

  get canStart(): boolean {
    return this.isUnlimited || this.selectedDurationSeconds > 0;
  }

  start(): void {
    if (this.isPreparing || this.status.state === 'running' || !this.canStart) {
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
    this.saveUnlimitedSessionIfNeeded();
    this.cancelPreparation();
    this.timerService.stop();
    this.soundService.stopAll();
    this.clearMood();
  }

  close(): void {
    this.saveUnlimitedSessionIfNeeded();
    this.cancelPreparation();
    this.timerService.stop();
    this.soundService.stopAll();
    this.clearMood();
  }

  setMode(value: string | number | undefined): void {
    const next = value === 'breathing' ? 'breathing' : 'timer';

    if (next === this.mode) {
      return;
    }

    if (next === 'breathing') {
      this.stop();
    }

    this.mode = next;
  }

  changeAmbiance(value: AmbianceKey): void {
    this.selectedAmbiance = value;
  }

  setUnlimited(checked: boolean): void {
    if (this.isPreparing || this.status.state !== 'idle') {
      return;
    }

    this.isUnlimited = checked;

    if (checked) {
      this.timerService.setUnlimitedDuration(true);
      return;
    }

    this.applyPickerDuration();
  }

  chooseMood(mood: number): void {
    this.selectedMood = mood;

    if (this.lastSessionId) {
      this.sessionService.setMood(this.lastSessionId, mood);
    }
  }

  changeTime(part: DurationPart, delta: number): void {
    if (this.isUnlimited || this.isPreparing || this.status.state !== 'idle') {
      return;
    }

    if (part === 'hours') {
      this.durationHours = Math.max(0, this.durationHours + delta);
    }

    if (part === 'minutes') {
      this.durationMinutes = this.clamp(this.durationMinutes + delta, 0, 59);
    }

    if (part === 'seconds') {
      this.durationSeconds = this.clamp(this.durationSeconds + delta, 0, 59);
    }

    this.applyPickerDuration();
  }

  selectTime(part: DurationPart, value: number): void {
    if (this.isUnlimited || this.isPreparing || this.status.state !== 'idle') {
      return;
    }

    const nextValue = Math.floor(Number(value));

    if (Number.isNaN(nextValue)) {
      return;
    }

    if (part === 'hours') {
      this.durationHours = Math.max(0, nextValue);
    }

    if (part === 'minutes') {
      this.durationMinutes = this.clamp(nextValue, 0, 59);
    }

    if (part === 'seconds') {
      this.durationSeconds = this.clamp(nextValue, 0, 59);
    }

    this.applyPickerDuration();
  }

  scrollTime(part: DurationPart, event: WheelEvent): void {
    event.preventDefault();

    if (Math.abs(event.deltaY) < 1) {
      return;
    }

    this.changeTime(part, event.deltaY > 0 ? 1 : -1);
  }

  getDurationPartValue(part: DurationPart): number {
    if (part === 'hours') {
      return this.durationHours;
    }

    if (part === 'minutes') {
      return this.durationMinutes;
    }

    return this.durationSeconds;
  }

  getPreviousDurationValue(part: DurationPart): number {
    return Math.max(0, this.getDurationPartValue(part) - 1);
  }

  getNextDurationValue(part: DurationPart): number {
    const current = this.getDurationPartValue(part);

    return part === 'hours' ? current + 1 : this.clamp(current + 1, 0, 59);
  }

  canDecreaseDurationPart(part: DurationPart): boolean {
    return this.getDurationPartValue(part) > 0;
  }

  increaseDuration(): void {
    if (this.status.isUnlimited) {
      return;
    }

    this.timerService.adjustDuration(1);
  }

  decreaseDuration(): void {
    if (this.status.isUnlimited) {
      return;
    }

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

  private clearMood(): void {
    this.lastSessionId = undefined;
    this.selectedMood = undefined;
  }

  private cancelPreparation(): void {
    this.preparationSub?.unsubscribe();
    this.preparationSub = undefined;
    this.isPreparing = false;
    this.preparationRemaining = this.preparationDuration;
  }

  private applyPickerDuration(): void {
    this.timerService.setDurationSeconds(this.selectedDurationSeconds);
  }

  private saveUnlimitedSessionIfNeeded(): void {
    if (
      !this.status.isUnlimited ||
      this.status.elapsedSeconds <= 0 ||
      (this.status.state !== 'running' && this.status.state !== 'paused')
    ) {
      return;
    }

    this.sessionService.addCompletedSession({
      ambiance: this.selectedAmbiance,
      durationSeconds: this.status.elapsedSeconds,
    });
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
