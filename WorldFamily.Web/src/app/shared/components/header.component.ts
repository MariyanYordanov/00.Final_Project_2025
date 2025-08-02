import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { User } from '../../core/models/user.interface';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule
  ],
  template: `
    <nav class="navbar navbar-expand-lg navbar-light bg-white shadow-sm">
      <div class="container">
        <!-- Brand -->
        <a class="navbar-brand" routerLink="/">
          <i class="fas fa-tree me-2"></i>
          <strong>World Family</strong>
        </a>

        <!-- Mobile Toggle Button -->
        <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav">
          <span class="navbar-toggler-icon"></span>
        </button>

        <!-- Navigation -->
        <div class="collapse navbar-collapse" id="navbarNav">
          <!-- Center Navigation -->
          <ul class="navbar-nav me-auto" *ngIf="currentUser$ | async">
            <li class="nav-item">
              <a class="nav-link" routerLink="/families" routerLinkActive="active">
                <i class="fas fa-users me-1"></i>
                Семейства
              </a>
            </li>
            <li class="nav-item">
              <a class="nav-link" routerLink="/members" routerLinkActive="active">
                <i class="fas fa-user-friends me-1"></i>
                Роднини
              </a>
            </li>
          </ul>

          <!-- Right Navigation -->
          <div class="navbar-nav ms-auto">
            <ng-container *ngIf="currentUser$ | async as user; else loginButtons">
              <!-- User Dropdown -->
              <div class="nav-item dropdown">
                <a class="nav-link dropdown-toggle d-flex align-items-center" href="#" role="button" 
                   data-bs-toggle="dropdown" aria-expanded="false">
                  <i class="fas fa-user-circle me-2"></i>
                  <span class="d-none d-md-inline">{{ user.firstName }} {{ user.lastName }}</span>
                </a>
                <ul class="dropdown-menu dropdown-menu-end">
                  <li>
                    <a class="dropdown-item" routerLink="/profile">
                      <i class="fas fa-user me-2"></i>
                      Профил
                    </a>
                  </li>
                  <li *ngIf="isAdmin">
                    <a class="dropdown-item" routerLink="/admin">
                      <i class="fas fa-cog me-2"></i>
                      Администрация
                    </a>
                  </li>
                  <li><hr class="dropdown-divider"></li>
                  <li>
                    <a class="dropdown-item" (click)="logout()" style="cursor: pointer;">
                      <i class="fas fa-sign-out-alt me-2"></i>
                      Излез
                    </a>
                  </li>
                </ul>
              </div>
            </ng-container>
            
            <ng-template #loginButtons>
              <div class="d-flex gap-2">
                <a class="btn btn-outline-primary" routerLink="/auth/login">
                  Влез
                </a>
                <a class="btn btn-primary" routerLink="/auth/register">
                  Регистрация
                </a>
              </div>
            </ng-template>
          </div>
        </div>
      </div>
    </nav>
  `,
  styles: [`
    .navbar {
      position: sticky;
      top: 0;
      z-index: 1000;
    }

    .navbar-brand {
      font-size: 1.5rem;
      color: var(--primary-color) !important;
    }

    .nav-link.active {
      color: var(--primary-color) !important;
      font-weight: 600;
    }

    .dropdown-menu {
      border: none;
      box-shadow: 0 4px 12px rgba(0,0,0,0.1);
    }

    .dropdown-item:hover {
      background-color: var(--accent-color);
    }

    @media (max-width: 991px) {
      .navbar-nav {
        text-align: center;
      }
      
      .dropdown-menu {
        position: static !important;
        transform: none !important;
        border: 1px solid var(--border-color);
        margin-top: 0.5rem;
      }
    }
  `]
})
export class HeaderComponent implements OnInit {
  currentUser$: Observable<User | null>;
  isAdmin = false;

  constructor(private authService: AuthService) {
    this.currentUser$ = this.authService.currentUser$;
  }

  ngOnInit(): void {
    this.currentUser$.subscribe(user => {
      // TODO: Check if user has admin role
      this.isAdmin = false;
    });
  }

  logout(): void {
    this.authService.logout();
  }
}