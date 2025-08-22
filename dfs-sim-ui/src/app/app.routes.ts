import { Routes } from '@angular/router';

export const routes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'optimizer' },
  { path: 'optimizer', loadComponent: () => import('./pages').then(m => m.OptimizerPage) },
  { path: 'simulations', loadComponent: () => import('./pages').then(m => m.SimulationsPage) },
  { path: 'variants', loadComponent: () => import('./pages').then(m => m.VariantsPage) },
  { path: 'results', loadComponent: () => import('./pages').then(m => m.ResultsPage) },
  { path: 'settings', loadComponent: () => import('./pages').then(m => m.SettingsPage) },
  { path: 'assets', loadComponent: () => import('./pages').then(m => m.AssetsPage) },
  { path: '**', redirectTo: 'optimizer' }
];
