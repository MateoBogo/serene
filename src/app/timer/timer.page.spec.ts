import { ComponentFixture, fakeAsync, TestBed, tick } from '@angular/core/testing';

import { SoundService } from '../services/sound.service';
import { TimerService } from '../services/timer.service';
import { TimerPage } from './timer.page';

describe('TimerPage', () => {
  let component: TimerPage;
  let fixture: ComponentFixture<TimerPage>;

  beforeEach(async () => {
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
});
