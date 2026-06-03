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
