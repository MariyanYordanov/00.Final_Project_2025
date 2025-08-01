import { Routes } from '@angular/router';
import { AuthGuard } from '../../core/guards/auth.guard';

export const familyRoutes: Routes = [
  {
    path: '',
    redirectTo: 'catalog',
    pathMatch: 'full'
  },
  {
    path: 'catalog',
    loadComponent: () => import('./components/family-catalog.component').then(c => c.FamilyCatalogComponent)
  },
  {
    path: 'create',
    loadComponent: () => import('./components/family-create.component').then(c => c.FamilyCreateComponent),
    canActivate: [AuthGuard]
  },
  {
    path: ':familyId/members/create',
    loadComponent: () => import('./components/member-create.component').then(c => c.MemberCreateComponent),
    canActivate: [AuthGuard]
  },
  {
    path: ':id',
    loadComponent: () => import('./components/family-details.component').then(c => c.FamilyDetailsComponent),
    data: { renderMode: 'client-side' }
  }
];