import { ComponentFixture, fakeAsync, TestBed, tick } from '@angular/core/testing';

import { BreathingComponent } from './breathing.component';

describe('BreathingComponent', () => {
  let component: BreathingComponent;
  let fixture: ComponentFixture<BreathingComponent>;

  beforeEach(() => {
    fixture = TestBed.createComponent(BreathingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should advance through phases while running', fakeAsync(() => {
    component.start();

    expect(component.running).toBeTrue();
    expect(component.phaseLabel).toBe('Inspire');
    expect(component.remaining).toBe(4);

    tick(4000);

    expect(component.phaseLabel).toBe('Retiens');
    expect(component.cycle).toBe(1);

    component.stop();

    expect(component.running).toBeFalse();
    expect(component.phaseLabel).toBe('Prêt');
  }));

  it('should switch technique only while idle', () => {
    const box = component.selected;

    component.start();
    component.selectTechnique(component.techniques[1]);
    expect(component.selected).toBe(box);

    component.stop();
    component.selectTechnique(component.techniques[1]);
    expect(component.selected.key).toBe('478');
  });
});
