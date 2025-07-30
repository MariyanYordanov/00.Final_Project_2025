import { Routes } from '@angular/router';

export const memberRoutes: Routes = [
  {
    path: '',
    redirectTo: '/families',
    pathMatch: 'full'
  },
  {
    path: ':id',
    redirectTo: '/families',
    pathMatch: 'full',
    data: { renderMode: 'client-side' }
  }
];