import { Routes } from '@angular/router';
import { LoginComponent } from './components/login.component';
import { RegisterComponent } from './components/register.component';

export const authRoutes: Routes = [
  {
    path: 'login',
    component: LoginComponent
  },
  {
    path: 'register',
    component: RegisterComponent
  },
  {
    path: '',
    redirectTo: 'login',
    pathMatch: 'full'
  }
];