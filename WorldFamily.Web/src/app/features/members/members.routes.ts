import { Routes } from '@angular/router';

export const memberRoutes: Routes = [
  {
    path: '',
    loadComponent: () => import('./components/member-list.component').then(c => c.MemberListComponent)
  },
  {
    path: ':id',
    loadComponent: () => import('./components/member-details.component').then(c => c.MemberDetailsComponent)
  }
];