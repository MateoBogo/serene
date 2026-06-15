import { Component, inject } from '@angular/core';
import {
  IonContent,
  IonHeader,
  IonItem,
  IonLabel,
  IonList,
  IonSelect,
  IonSelectOption,
  IonTitle,
  IonToggle,
  IonToolbar,
} from '@ionic/angular/standalone';

import { SettingsService } from '../services/settings.service';
import { AmbianceKey, SoundService } from '../services/sound.service';

@Component({
  selector: 'app-settings',
  templateUrl: 'settings.page.html',
  styleUrls: ['settings.page.scss'],
  imports: [
    IonContent,
    IonHeader,
    IonItem,
    IonLabel,
    IonList,
    IonSelect,
    IonSelectOption,
    IonTitle,
    IonToggle,
    IonToolbar,
  ],
})
export class SettingsPage {
  private readonly settingsService = inject(SettingsService);
  private readonly soundService = inject(SoundService);

  readonly durationOptions = [5, 10, 15, 20, 30, 45, 60];
  readonly ambiances = this.soundService.ambiances;

  defaultDurationMinutes = this.settingsService.snapshot.defaultDurationMinutes;
  defaultAmbiance: AmbianceKey = this.settingsService.snapshot.defaultAmbiance;
  reminder = this.settingsService.snapshot.reminder;

  onDurationChange(value: number): void {
    this.defaultDurationMinutes = value;
    this.settingsService.update({ defaultDurationMinutes: value });
  }

  onAmbianceChange(value: AmbianceKey): void {
    this.defaultAmbiance = value;
    this.settingsService.update({ defaultAmbiance: value });
  }

  onReminderChange(value: boolean): void {
    this.reminder = value;
    this.settingsService.update({ reminder: value });
  }
}
