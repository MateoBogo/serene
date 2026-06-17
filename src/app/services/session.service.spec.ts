import { TestBed } from '@angular/core/testing';

import { SessionService } from './session.service';

describe('SessionService', () => {
  let service: SessionService;

  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({});
    service = TestBed.inject(SessionService);
  });

  it('should save a completed session and calculate weekly stats', () => {
    service.addCompletedSession({
      ambiance: 'rain',
      completedAt: new Date('2026-06-04T10:00:00.000Z'),
      durationSeconds: 600,
    });

    const stats = service.getWeeklyStats(new Date('2026-06-04T12:00:00.000Z'));

    expect(stats.totalMinutes).toBe(10);
    expect(stats.sessionCount).toBe(1);
    expect(stats.averageMinutes).toBe(10);
  });

  it('should ignore old sessions in weekly stats', () => {
    service.addCompletedSession({
      ambiance: 'forest',
      completedAt: new Date('2026-05-01T10:00:00.000Z'),
      durationSeconds: 900,
    });

    const stats = service.getWeeklyStats(new Date('2026-06-04T12:00:00.000Z'));

    expect(stats.totalMinutes).toBe(0);
    expect(stats.sessionCount).toBe(0);
    expect(stats.averageMinutes).toBe(0);
  });

  it('should store a mood and average it in weekly stats', () => {
    const reference = new Date('2026-06-04T12:00:00.000Z');

    const first = service.addCompletedSession({
      ambiance: 'rain',
      completedAt: new Date('2026-06-04T10:00:00.000Z'),
      durationSeconds: 600,
      mood: 5,
    });
    const second = service.addCompletedSession({
      ambiance: 'rain',
      completedAt: new Date('2026-06-03T10:00:00.000Z'),
      durationSeconds: 600,
    });

    service.setMood(second.id, 3);

    const stats = service.getWeeklyStats(reference);

    expect(first.mood).toBe(5);
    expect(stats.moodCount).toBe(2);
    expect(stats.averageMood).toBe(4);
  });

  it('should aggregate minutes per day for the heatmap', () => {
    service.addCompletedSession({
      ambiance: 'rain',
      completedAt: new Date(2026, 5, 4, 10, 0, 0),
      durationSeconds: 600,
    });
    service.addCompletedSession({
      ambiance: 'rain',
      completedAt: new Date(2026, 5, 4, 18, 0, 0),
      durationSeconds: 300,
    });

    const minutesByDay = service.getDailyMinutes();

    expect(minutesByDay.get('2026-06-04')).toBe(15);
  });
});
