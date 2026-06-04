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
});
