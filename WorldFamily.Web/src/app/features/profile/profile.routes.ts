import { Routes } from '@angular/router';
import { AuthGuard } from '../../core/guards/auth.guard';

export const profileRoutes: Routes = [
  {
    path: '',
    loadComponent: () => import('./profile.component').then(c => c.ProfileComponent),
    canActivate: [AuthGuard]
  }
];