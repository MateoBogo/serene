import { Component, inject, OnDestroy } from '@angular/core';
import { IonContent, IonHeader, IonTitle, IonToolbar } from '@ionic/angular/standalone';
import { Subscription } from 'rxjs';

import { MeditationHeatmapComponent } from '../components/meditation-heatmap/meditation-heatmap.component';
import { MeditationSession, moodEmoji } from '../models/session.model';
import { SessionService } from '../services/session.service';
import { SoundService } from '../services/sound.service';

interface DaySessionItem {
  id: string;
  time: string;
  duration: string;
  ambiance: string;
  mood: string;
}

@Component({
  selector: 'app-stats',
  templateUrl: 'stats.page.html',
  styleUrls: ['stats.page.scss'],
  imports: [IonContent, IonHeader, IonTitle, IonToolbar, MeditationHeatmapComponent],
})
export class StatsPage implements OnDestroy {
  totalMinutes = 0;
  sessionCount = 0;
  averageMinutes = 0;
  averageMood = 0;
  moodCount = 0;
  selectedDayKey = '';
  selectedDayLabel = '';
  selectedDaySessions: DaySessionItem[] = [];
  private readonly sessionService = inject(SessionService);
  private readonly soundService = inject(SoundService);
  private readonly sub: Subscription;

  constructor() {
    this.selectedDayKey = this.sessionService.dayKey(new Date());
    this.selectedDayLabel = this.formatDayLabel(this.selectedDayKey);

    this.sub = this.sessionService.sessions$.subscribe((sessions) => {
      const stats = this.sessionService.getWeeklyStats();
      this.totalMinutes = stats.totalMinutes;
      this.sessionCount = stats.sessionCount;
      this.averageMinutes = stats.averageMinutes;
      this.averageMood = stats.averageMood;
      this.moodCount = stats.moodCount;
      this.updateSelectedDaySessions(sessions);
    });
  }

  get moodEmoji(): string {
    return moodEmoji(this.averageMood);
  }

  selectDay(dayKey: string): void {
    this.selectedDayKey = dayKey;
    this.selectedDayLabel = this.formatDayLabel(dayKey);
    this.updateSelectedDaySessions(this.sessionService.sessionsSnapshot);
  }

  ngOnDestroy(): void {
    this.sub.unsubscribe();
  }

  private updateSelectedDaySessions(sessions: MeditationSession[]): void {
    this.selectedDaySessions = sessions
      .filter(
        (session) =>
          session.completed &&
          this.sessionService.dayKey(new Date(session.endTime)) === this.selectedDayKey,
      )
      .map((session) => this.toItem(session));
  }

  private toItem(session: MeditationSession): DaySessionItem {
    return {
      id: session.id,
      time: this.formatTime(session.endTime),
      duration: this.formatDuration(session.durationSeconds),
      ambiance: this.ambianceLabel(session.ambiance),
      mood: moodEmoji(session.mood),
    };
  }

  private formatTime(iso: string): string {
    return new Date(iso).toLocaleTimeString('fr-FR', {
      hour: '2-digit',
      minute: '2-digit',
    });
  }

  private formatDuration(totalSeconds: number): string {
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;

    if (minutes === 0) {
      return `${seconds} s`;
    }

    return seconds === 0 ? `${minutes} min` : `${minutes} min ${seconds} s`;
  }

  private formatDayLabel(dayKey: string): string {
    const [year, month, day] = dayKey.split('-').map(Number);
    const date = new Date(year, month - 1, day);

    return date.toLocaleDateString('fr-FR', {
      weekday: 'long',
      day: '2-digit',
      month: 'long',
    });
  }

  private ambianceLabel(value: string): string {
    return this.soundService.ambiances.find((ambiance) => ambiance.value === value)?.label ?? 'Silence';
  }
}
