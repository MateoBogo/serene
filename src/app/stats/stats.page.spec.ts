import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';

import { SessionService } from '../services/session.service';
import { StatsPage } from './stats.page';

describe('StatsPage', () => {
  let component: StatsPage;
  let fixture: ComponentFixture<StatsPage>;

  beforeEach(async () => {
    localStorage.clear();
    await TestBed.configureTestingModule({
      providers: [provideRouter([])],
    }).compileComponents();

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

  it('should display sessions for the selected day', () => {
    const sessionService = TestBed.inject(SessionService);
    const selectedDate = new Date(2026, 5, 16, 9, 30);

    sessionService.addCompletedSession({
      ambiance: 'forest',
      completedAt: selectedDate,
      durationSeconds: 600,
    });

    component.selectDay(sessionService.dayKey(selectedDate));
    fixture.detectChanges();

    expect(component.selectedDaySessions.length).toBe(1);
    expect(component.selectedDaySessions[0].duration).toBe('10 min');
    expect(component.selectedDaySessions[0].ambiance).toBe('Forêt calme');
  });
});
