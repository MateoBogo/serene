import { DOCUMENT } from '@angular/common';
import { inject, Injectable } from '@angular/core';

export type AppTheme = 'light' | 'dark';

const THEME_KEY = 'serene-theme';

@Injectable({
  providedIn: 'root',
})
export class ThemeService {
  private readonly document = inject(DOCUMENT);
  private currentTheme: AppTheme = this.readTheme();

  constructor() {
    this.applyTheme(this.currentTheme);
  }

  get theme(): AppTheme {
    return this.currentTheme;
  }

  get isDark(): boolean {
    return this.currentTheme === 'dark';
  }

  toggleTheme(): AppTheme {
    return this.setTheme(this.isDark ? 'light' : 'dark');
  }

  private setTheme(theme: AppTheme): AppTheme {
    this.currentTheme = theme;
    this.applyTheme(theme);
    localStorage.setItem(THEME_KEY, theme);
    return theme;
  }

  private applyTheme(theme: AppTheme): void {
    this.document.body.classList.toggle('serene-light', theme === 'light');
    this.document.body.classList.toggle('serene-dark', theme === 'dark');
  }

  private readTheme(): AppTheme {
    const savedTheme = localStorage.getItem(THEME_KEY);

    if (savedTheme === 'dark' || savedTheme === 'light') {
      return savedTheme;
    }

    return 'light';
  }
}
