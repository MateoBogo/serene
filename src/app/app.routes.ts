import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./home/home.page').then((m) => m.HomePage),
  },
  {
    path: 'timer',
    loadComponent: () => import('./timer/timer.page').then((m) => m.TimerPage),
  },
  {
    path: 'stats',
    loadComponent: () => import('./stats/stats.page').then((m) => m.StatsPage),
  },
  {
    path: 'settings',
    loadComponent: () => import('./settings/settings.page').then((m) => m.SettingsPage),
  },
  {
    path: '**',
    redirectTo: '',
  },
];
