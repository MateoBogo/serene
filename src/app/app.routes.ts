import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./tabs/tabs.page').then((m) => m.TabsPage),
    children: [
      {
        path: '',
        redirectTo: 'timer',
        pathMatch: 'full',
      },
      {
        path: 'timer',
        loadComponent: () => import('./timer/timer.page').then((m) => m.TimerPage),
      },
      {
        path: 'stats',
        loadComponent: () => import('./stats/stats.page').then((m) => m.StatsPage),
      },
    ],
  },
  {
    path: '**',
    redirectTo: '',
  },
];
