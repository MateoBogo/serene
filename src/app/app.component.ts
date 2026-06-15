import { Component, inject } from '@angular/core';
import { IonApp, IonButton, IonIcon, IonRouterOutlet } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { moon, sunny } from 'ionicons/icons';

import { ThemeService } from './services/theme.service';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
  imports: [IonApp, IonButton, IonIcon, IonRouterOutlet],
})
export class AppComponent {
  readonly themeService = inject(ThemeService);

  constructor() {
    addIcons({ moon, sunny });
  }

  get themeIcon(): string {
    return this.themeService.isDark ? 'sunny' : 'moon';
  }

  get themeLabel(): string {
    return this.themeService.isDark ? 'Mode clair' : 'Mode sombre';
  }

  toggleTheme(): void {
    this.themeService.toggleTheme();
  }
}
