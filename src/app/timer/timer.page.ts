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
import { add, pause, play, remove, stop } from 'ionicons/icons';
import { interval, Subscription } from 'rxjs';

import { TimerCircleComponent } from '../components/timer-circle/timer-circle.component';
import { SessionService } from '../services/session.service';
import { AmbianceKey, SoundService } from '../services/sound.service';
import { TimerService, TimerStatus } from '../services/timer.service';

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
    minutes: 10,
    seconds: 0,
  };

  hint = 'Prêt à méditer';
  readonly durations = [5, 10, 15, 20, 30, 45, 60];
  readonly preparationDuration = 10;
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
    addIcons({ add, pause, play, remove, stop });

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

  changeDuration(value: number): void {
    this.timerService.setDuration(Number(value));
  }

  changeAmbiance(value: AmbianceKey): void {
    this.selectedAmbiance = value;
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
