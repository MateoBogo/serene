import { ComponentFixture, fakeAsync, TestBed, tick } from '@angular/core/testing';

import { SessionService } from '../services/session.service';
import { SoundService } from '../services/sound.service';
import { TimerService } from '../services/timer.service';
import { TimerPage } from './timer.page';

describe('TimerPage', () => {
  let component: TimerPage;
  let fixture: ComponentFixture<TimerPage>;

  beforeEach(async () => {
    localStorage.clear();

    fixture = TestBed.createComponent(TimerPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should wait 10 seconds before starting the timer', fakeAsync(() => {
    const timerService = TestBed.inject(TimerService);
    const soundService = TestBed.inject(SoundService);
    spyOn(timerService, 'start');
    spyOn(soundService, 'playStart');
    spyOn(soundService, 'playAmbiance');

    component.start();

    expect(component.isPreparing).toBeTrue();
    expect(component.circleStatus.remainingSeconds).toBe(10);
    expect(soundService.playStart).toHaveBeenCalledTimes(1);
    expect(timerService.start).not.toHaveBeenCalled();

    tick(10000);

    expect(component.isPreparing).toBeFalse();
    expect(soundService.playStart).toHaveBeenCalledTimes(2);
    expect(timerService.start).toHaveBeenCalled();
  }));

  it('should update duration from the wheel controls', () => {
    const timerService = TestBed.inject(TimerService);
    spyOn(timerService, 'setDurationSeconds').and.callThrough();

    component.changeTime('hours', 1);
    component.changeTime('seconds', 30);

    expect(component.durationHours).toBe(1);
    expect(component.durationMinutes).toBe(10);
    expect(component.durationSeconds).toBe(30);
    expect(component.durationPreview).toBe('01:10:30');
    expect(timerService.setDurationSeconds).toHaveBeenCalledWith(4230);
  });

  it('should save a session when timer is completed', fakeAsync(() => {
    const sessionService = TestBed.inject(SessionService);
    const soundService = TestBed.inject(SoundService);
    const timerService = TestBed.inject(TimerService);
    spyOn(sessionService, 'addCompletedSession');
    spyOn(soundService, 'playStart');
    spyOn(soundService, 'playAmbiance');
    spyOn(soundService, 'playEnd');

    timerService.setDurationSeconds(60);
    component.start();
    tick(10000);
    timerService.adjustDuration(-1);

    expect(sessionService.addCompletedSession).toHaveBeenCalledWith({
      ambiance: 'rain',
      durationSeconds: 60,
    });
  }));
});
