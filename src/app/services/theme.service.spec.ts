import { TestBed } from '@angular/core/testing';

import { ThemeService } from './theme.service';

describe('ThemeService', () => {
  beforeEach(() => {
    localStorage.clear();
    document.body.classList.remove('serene-light', 'serene-dark');
    TestBed.configureTestingModule({});
  });

  afterEach(() => {
    localStorage.clear();
    document.body.classList.remove('serene-light', 'serene-dark');
    TestBed.resetTestingModule();
  });

  it('should use light mode by default', () => {
    const service = TestBed.inject(ThemeService);

    expect(service.theme).toBe('light');
    expect(document.body.classList.contains('serene-light')).toBeTrue();
    expect(document.body.classList.contains('serene-dark')).toBeFalse();
  });

  it('should switch theme and save it', () => {
    const service = TestBed.inject(ThemeService);

    const theme = service.toggleTheme();

    expect(theme).toBe('dark');
    expect(service.theme).toBe('dark');
    expect(localStorage.getItem('serene-theme')).toBe('dark');
    expect(document.body.classList.contains('serene-dark')).toBeTrue();
  });

  it('should restore the saved theme', () => {
    localStorage.setItem('serene-theme', 'dark');

    const service = TestBed.inject(ThemeService);

    expect(service.theme).toBe('dark');
    expect(document.body.classList.contains('serene-dark')).toBeTrue();
  });
});
