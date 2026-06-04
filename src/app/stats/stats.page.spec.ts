import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SessionService } from '../services/session.service';
import { StatsPage } from './stats.page';

describe('StatsPage', () => {
  let component: StatsPage;
  let fixture: ComponentFixture<StatsPage>;

  beforeEach(async () => {
    localStorage.clear();
    fixture = TestBed.createComponent(StatsPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should display stats from saved sessions', () => {
    const sessionService = TestBed.inject(SessionService);

    sessionService.addCompletedSession({
      ambiance: 'river',
      completedAt: new Date(),
      durationSeconds: 1200,
    });
    fixture.detectChanges();

    expect(component.totalMinutes).toBe(20);
    expect(component.sessionCount).toBe(1);
    expect(component.averageMinutes).toBe(20);
  });
});
