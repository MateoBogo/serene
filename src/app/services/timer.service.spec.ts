import { fakeAsync, TestBed, tick } from '@angular/core/testing';

import { TimerService, TimerStatus } from './timer.service';

describe('TimerService', () => {
  let service: TimerService;
  let latest: TimerStatus;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(TimerService);
    service.status$.subscribe((status) => {
      latest = status;
    });
  });

  afterEach(() => {
    service.stop();
  });

  it('should start idle with a 10 minute duration', () => {
    expect(latest.state).toBe('idle');
    expect(latest.remainingSeconds).toBe(600);
    expect(latest.minutes).toBe(10);
  });

  it('should accept an exact duration in seconds', () => {
    service.setDurationSeconds(90);

    expect(latest.totalSeconds).toBe(90);
    expect(latest.remainingSeconds).toBe(90);
    expect(latest.minutes).toBe(1);
    expect(latest.seconds).toBe(30);
  });

  it('should allow zero seconds and durations longer than nine hours', () => {
    const longDuration = 12 * 60 * 60 + 5;

    service.setDurationSeconds(0);
    expect(latest.totalSeconds).toBe(0);
    expect(latest.remainingSeconds).toBe(0);

    service.setDurationSeconds(longDuration);
    expect(latest.totalSeconds).toBe(longDuration);
    expect(latest.remainingSeconds).toBe(longDuration);
    expect(latest.hours).toBe(12);
  });

  it('should count elapsed time without completing unlimited sessions', fakeAsync(() => {
    service.setUnlimitedDuration(true);
    service.start();

    tick(3_000);

    expect(latest.state).toBe('running');
    expect(latest.isUnlimited).toBeTrue();
    expect(latest.elapsedSeconds).toBe(3);
    expect(latest.remainingSeconds).toBe(3);
  }));

  it('should tick down once per second after start', fakeAsync(() => {
    service.setDuration(1);
    service.start();

    tick(1000);

    expect(latest.state).toBe('running');
    expect(latest.remainingSeconds).toBe(59);
  }));

  it('should pause and resume without losing the remaining time', fakeAsync(() => {
    service.setDuration(1);
    service.start();
    tick(2000);

    service.pause();
    tick(3000);

    expect(latest.state).toBe('paused');
    expect(latest.remainingSeconds).toBe(58);

    service.resume();
    tick(1000);

    expect(latest.state).toBe('running');
    expect(latest.remainingSeconds).toBe(57);
  }));
});
