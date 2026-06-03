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
import { Subscription } from 'rxjs';

import { TimerCircleComponent } from '../components/timer-circle/timer-circle.component';
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
  readonly timerService = inject(TimerService);
  private readonly sub: Subscription;

  constructor() {
    addIcons({ add, pause, play, remove, stop });

    this.sub = this.timerService.status$.subscribe((status) => {
      this.status = status;
      this.hint = this.getHint(status.state);
    });
  }

  get estimatedEndTime(): string {
    const end = new Date(Date.now() + this.status.remainingSeconds * 1000);
    const time = end.toLocaleTimeString('fr-FR', {
      hour: '2-digit',
      minute: '2-digit',
    });

    return `Fin estimée : ${time}`;
  }

  start(): void {
    this.timerService.start();
  }

  pause(): void {
    this.timerService.pause();
  }

  resume(): void {
    this.timerService.resume();
  }

  stop(): void {
    this.timerService.stop();
  }

  close(): void {
    this.timerService.stop();
  }

  changeDuration(value: number): void {
    this.timerService.setDuration(Number(value));
  }

  increaseDuration(): void {
    this.timerService.adjustDuration(1);
  }

  decreaseDuration(): void {
    this.timerService.adjustDuration(-1);
  }

  ngOnDestroy(): void {
    this.sub.unsubscribe();
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
