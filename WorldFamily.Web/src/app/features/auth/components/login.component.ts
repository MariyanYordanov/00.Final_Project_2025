import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, ActivatedRoute, RouterLink } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';
import { AuthService } from '../../../core/services/auth.service';
import { LoginRequest } from '../../../core/models/user.interface';
import { catchError, finalize } from 'rxjs/operators';
import { of } from 'rxjs';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterLink,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatProgressSpinnerModule,
    MatSnackBarModule
  ],
  template: `
    <div class="auth-container">
      <mat-card class="auth-card">
        <mat-card-header>
          <mat-card-title>Вход в World Family</mat-card-title>
        </mat-card-header>
        
        <mat-card-content>
          <form [formGroup]="loginForm" (ngSubmit)="onSubmit()">
            <mat-form-field appearance="outline" class="full-width">
              <mat-label>Email</mat-label>
              <input matInput type="email" formControlName="email" required>
              <mat-error *ngIf="loginForm.get('email')?.invalid && loginForm.get('email')?.touched">
                Моля въведете валиден email
              </mat-error>
            </mat-form-field>

            <mat-form-field appearance="outline" class="full-width">
              <mat-label>Парола</mat-label>
              <input matInput type="password" formControlName="password" required>
              <mat-error *ngIf="loginForm.get('password')?.invalid && loginForm.get('password')?.touched">
                Паролата е задължителна
              </mat-error>
            </mat-form-field>

            <button 
              mat-raised-button 
              color="primary" 
              type="submit" 
              class="full-width submit-button"
              [disabled]="loginForm.invalid || isLoading">
              <mat-spinner diameter="20" *ngIf="isLoading"></mat-spinner>
              {{ isLoading ? 'Влизане...' : 'Влез' }}
            </button>
          </form>
        </mat-card-content>

        <mat-card-actions>
          <p>Нямате акаунт? <a routerLink="/auth/register" mat-button color="accent">Регистрирайте се</a></p>
        </mat-card-actions>
      </mat-card>
    </div>
  `,
  styles: [`
    .auth-container {
      display: flex;
      justify-content: center;
      align-items: center;
      min-height: 100vh;
      padding: 20px;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    }

    .auth-card {
      max-width: 400px;
      width: 100%;
    }

    .full-width {
      width: 100%;
      margin-bottom: 16px;
    }

    .submit-button {
      margin-top: 16px;
      height: 48px;
    }

    mat-card-title {
      text-align: center;
      color: #333;
      margin-bottom: 0;
    }

    mat-card-actions p {
      margin: 0;
      text-align: center;
    }
  `]
})
export class LoginComponent implements OnInit {
  loginForm: FormGroup;
  isLoading = false;
  returnUrl = '/families';

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private route: ActivatedRoute,
    private snackBar: MatSnackBar
  ) {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required]]
    });
  }

  ngOnInit(): void {
    this.returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/families';
    
    // Redirect if already logged in
    if (this.authService.isAuthenticated()) {
      this.router.navigate([this.returnUrl]);
    }
  }

  onSubmit(): void {
    if (this.loginForm.valid) {
      this.isLoading = true;
      const loginData: LoginRequest = this.loginForm.value;

      this.authService.login(loginData)
        .pipe(
          catchError(error => {
            this.snackBar.open(
              error.error?.message || 'Грешка при влизане. Моля опитайте отново.',
              'Затвори',
              { duration: 5000 }
            );
            return of(null);
          }),
          finalize(() => this.isLoading = false)
        )
        .subscribe(response => {
          if (response) {
            this.snackBar.open('Успешно влизане!', 'Затвори', { duration: 3000 });
            this.router.navigate([this.returnUrl]);
          }
        });
    }
  }
}