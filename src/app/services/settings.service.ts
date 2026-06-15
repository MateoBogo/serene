import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

import { AmbianceKey } from './sound.service';

export interface AppSettings {
  defaultDurationMinutes: number;
  defaultAmbiance: AmbianceKey;
  reminder: boolean;
}

const SETTINGS_KEY = 'serene.settings';
const DEFAULT_SETTINGS: AppSettings = {
  defaultDurationMinutes: 10,
  defaultAmbiance: 'rain',
  reminder: true,
};

@Injectable({
  providedIn: 'root',
})
export class SettingsService {
  private readonly settingsSubject = new BehaviorSubject<AppSettings>(this.readSettings());
  readonly settings$ = this.settingsSubject.asObservable();

  get snapshot(): AppSettings {
    return this.settingsSubject.value;
  }

  update(patch: Partial<AppSettings>): void {
    const next = { ...this.settingsSubject.value, ...patch };
    this.settingsSubject.next(next);
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(next));
  }

  private readSettings(): AppSettings {
    const raw = localStorage.getItem(SETTINGS_KEY);

    if (!raw) {
      return { ...DEFAULT_SETTINGS };
    }

    try {
      return { ...DEFAULT_SETTINGS, ...(JSON.parse(raw) as Partial<AppSettings>) };
    } catch {
      return { ...DEFAULT_SETTINGS };
    }
  }
}
