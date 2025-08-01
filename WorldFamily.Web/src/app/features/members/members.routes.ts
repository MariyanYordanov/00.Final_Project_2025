import { Routes } from '@angular/router';

export const memberRoutes: Routes = [
  {
    path: '',
    loadComponent: () => import('./components/my-members.component').then(c => c.MyMembersComponent)
  },
  {
    path: ':id',
    loadComponent: () => import('./components/member-details.component').then(c => c.MemberDetailsComponent),
    data: { renderMode: 'client-side' }
  }
];