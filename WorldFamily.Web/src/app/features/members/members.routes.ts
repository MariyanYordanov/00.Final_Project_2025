import { Routes } from '@angular/router';

export const memberRoutes: Routes = [
  {
    path: '',
    loadComponent: () => import('./components/my-members-bootstrap.component').then(c => c.MyMembersBootstrapComponent)
  },
  {
    path: ':id',
    loadComponent: () => import('./components/member-details-bootstrap.component').then(c => c.MemberDetailsBootstrapComponent),
    data: { renderMode: 'client-side' }
  }
];