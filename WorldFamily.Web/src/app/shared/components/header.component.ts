import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatBadgeModule } from '@angular/material/badge';
import { MatDividerModule } from '@angular/material/divider';
import { AuthService } from '../../core/services/auth.service';
import { User } from '../../core/models/user.interface';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatToolbarModule,
    MatButtonModule,
    MatIconModule,
    MatMenuModule,
    MatBadgeModule,
    MatDividerModule
  ],
  template: `
    <mat-toolbar color="primary" class="header-toolbar">
      <div class="toolbar-content">
        <!-- Logo and Brand -->
        <div class="brand" routerLink="/">
          <mat-icon class="brand-icon">family_restroom</mat-icon>
          <span class="brand-text">World Family</span>
        </div>

        <!-- Navigation Links -->
        <nav class="nav-links" *ngIf="currentUser$ | async">
          <a mat-button routerLink="/families" routerLinkActive="active">
            <mat-icon>groups</mat-icon>
            Семейства
          </a>
          <a mat-button routerLink="/members" routerLinkActive="active" 
             title="Моите роднини">
            <mat-icon>people</mat-icon>
            Роднини
          </a>
        </nav>

        <!-- User Menu -->
        <div class="user-menu">
          <ng-container *ngIf="currentUser$ | async as user; else loginButton">
            <button mat-button [matMenuTriggerFor]="userDropdown" class="user-button">
              <mat-icon>account_circle</mat-icon>
              <span class="user-name">{{ user.firstName }} {{ user.lastName }}</span>
              <mat-icon>arrow_drop_down</mat-icon>
            </button>
            <mat-menu #userDropdown="matMenu">
              <button mat-menu-item routerLink="/profile">
                <mat-icon>person</mat-icon>
                <span>Профил</span>
              </button>
              <button mat-menu-item routerLink="/admin" *ngIf="isAdmin">
                <mat-icon>admin_panel_settings</mat-icon>
                <span>Администрация</span>
              </button>
              <mat-divider></mat-divider>
              <button mat-menu-item (click)="logout()">
                <mat-icon>logout</mat-icon>
                <span>Излез</span>
              </button>
            </mat-menu>
          </ng-container>
          
          <ng-template #loginButton>
            <div class="auth-buttons">
              <a mat-button routerLink="/auth/login">Влез</a>
              <a mat-raised-button color="accent" routerLink="/auth/register">Регистрация</a>
            </div>
          </ng-template>
        </div>
      </div>
    </mat-toolbar>
  `,
  styles: [`
    .header-toolbar {
      position: sticky;
      top: 0;
      z-index: 100;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }

    .toolbar-content {
      display: flex;
      align-items: center;
      justify-content: space-between;
      width: 100%;
      max-width: 1200px;
      margin: 0 auto;
      padding: 0 16px;
    }

    .brand {
      display: flex;
      align-items: center;
      cursor: pointer;
      text-decoration: none;
      color: inherit;
    }

    .brand-icon {
      margin-right: 8px;
      font-size: 28px;
      width: 28px;
      height: 28px;
    }

    .brand-text {
      font-size: 20px;
      font-weight: 500;
    }

    .nav-links {
      display: flex;
      gap: 8px;
    }

    .nav-links a.active {
      background-color: rgba(255, 255, 255, 0.1);
    }

    .nav-links .mat-mdc-button {
      color: inherit;
    }

    .user-menu {
      display: flex;
      align-items: center;
    }

    .user-button {
      color: inherit;
      display: flex;
      align-items: center;
      gap: 4px;
    }

    .user-name {
      max-width: 120px;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    .auth-buttons {
      display: flex;
      gap: 8px;
      align-items: center;
    }

    .auth-buttons a {
      color: inherit;
    }

    @media (max-width: 768px) {
      .toolbar-content {
        padding: 0 8px;
      }
      
      .nav-links {
        display: none;
      }
      
      .brand-text {
        display: none;
      }
      
      .user-name {
        display: none;
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