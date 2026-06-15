import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';

import { AppComponent } from './app.component';

describe('AppComponent', () => {
  beforeEach(() => {
    localStorage.clear();
    document.body.classList.remove('serene-light', 'serene-dark');
  });

  afterEach(() => {
    localStorage.clear();
    document.body.classList.remove('serene-light', 'serene-dark');
  });

  it('should create the app', async () => {
    await TestBed.configureTestingModule({
      imports: [AppComponent],
      providers: [provideRouter([])],
    }).compileComponents();

    const fixture = TestBed.createComponent(AppComponent);
    const app = fixture.componentInstance;
    expect(app).toBeTruthy();
  });

  it('should switch theme from the app button', async () => {
    await TestBed.configureTestingModule({
      imports: [AppComponent],
      providers: [provideRouter([])],
    }).compileComponents();

    const fixture = TestBed.createComponent(AppComponent);
    fixture.detectChanges();

    const button: HTMLElement | null = fixture.nativeElement.querySelector('.theme-toggle');
    expect(button).not.toBeNull();

    button?.click();
    fixture.detectChanges();

    expect(document.body.classList.contains('serene-dark')).toBeTrue();
  });
});
