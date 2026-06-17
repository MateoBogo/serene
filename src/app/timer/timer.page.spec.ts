import { ComponentFixture, fakeAsync, TestBed, tick } from '@angular/core/testing';
import { provideRouter } from '@angular/router';

import { SessionService } from '../services/session.service';
import { SoundService } from '../services/sound.service';
import { TimerService } from '../services/timer.service';
import { TimerPage } from './timer.page';

describe('TimerPage', () => {
  let component: TimerPage;
  let fixture: ComponentFixture<TimerPage>;

  beforeEach(async () => {
    localStorage.clear();
    await TestBed.configureTestingModule({
      providers: [provideRouter([])],
    }).compileComponents();

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

  it('should allow a zero duration without forcing a minimum', () => {
    const timerService = TestBed.inject(TimerService);
    spyOn(timerService, 'setDurationSeconds').and.callThrough();

    component.selectTime('hours', 0);
    component.selectTime('minutes', 0);
    component.selectTime('seconds', 0);

    expect(component.durationPreview).toBe('00:00:00');
    expect(component.canStart).toBeFalse();
    expect(timerService.setDurationSeconds).toHaveBeenCalledWith(0);
  });

  it('should update duration when a reel is scrolled', () => {
    const event = {
      deltaY: 100,
      preventDefault: jasmine.createSpy('preventDefault'),
    } as unknown as WheelEvent;

    component.scrollTime('minutes', event);

    expect(event.preventDefault).toHaveBeenCalled();
    expect(component.durationMinutes).toBe(11);
  });

  it('should render every ambiance as a visible choice', () => {
    fixture.detectChanges();

    const ambianceButtons: NodeListOf<HTMLButtonElement> =
      fixture.nativeElement.querySelectorAll('.ambiance-option');

    expect(ambianceButtons.length).toBe(component.ambiances.length);
    expect(fixture.nativeElement.querySelector('ion-select')).toBeNull();
  });

  it('should save an unlimited session when stopped', fakeAsync(() => {
    const sessionService = TestBed.inject(SessionService);
    const soundService = TestBed.inject(SoundService);
    spyOn(sessionService, 'addCompletedSession');
    spyOn(soundService, 'playStart');
    spyOn(soundService, 'playAmbiance');
    spyOn(soundService, 'stopAll');

    component.setUnlimited(true);
    component.start();
    tick(10_000);
    tick(3_000);
    component.stop();

    expect(sessionService.addCompletedSession).toHaveBeenCalledWith({
      ambiance: 'rain',
      durationSeconds: 3,
    });
  }));

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
