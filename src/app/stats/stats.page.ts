import { Component, inject, OnDestroy } from '@angular/core';
import { IonContent, IonHeader, IonTitle, IonToolbar } from '@ionic/angular/standalone';
import { Subscription } from 'rxjs';

import { SessionService } from '../services/session.service';

@Component({
  selector: 'app-stats',
  templateUrl: 'stats.page.html',
  styleUrls: ['stats.page.scss'],
  imports: [IonContent, IonHeader, IonTitle, IonToolbar],
})
export class StatsPage implements OnDestroy {
  totalMinutes = 0;
  sessionCount = 0;
  averageMinutes = 0;
  private readonly sessionService = inject(SessionService);
  private readonly sub: Subscription;

  constructor() {
    this.sub = this.sessionService.sessions$.subscribe(() => {
      const stats = this.sessionService.getWeeklyStats();
      this.totalMinutes = stats.totalMinutes;
      this.sessionCount = stats.sessionCount;
      this.averageMinutes = stats.averageMinutes;
    });
  }

  ngOnDestroy(): void {
    this.sub.unsubscribe();
  }
}
