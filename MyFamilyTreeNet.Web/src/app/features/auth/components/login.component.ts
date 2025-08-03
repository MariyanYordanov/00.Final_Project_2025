import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, ActivatedRoute, RouterLink } from '@angular/router';
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
    RouterLink
  ],
  template: `
    <div class="auth-container">
      <div class="auth-card">
        <!-- Header -->
        <div class="auth-header">
          <h2 class="mb-0">
            <i class="fas fa-sign-in-alt me-2"></i>
            Вход в World Family
          </h2>
          <p class="mb-0 mt-2 opacity-75">Влезте в семейната мрежа</p>
        </div>

        <!-- Form Content -->
        <div class="p-4">
          <form [formGroup]="loginForm" (ngSubmit)="onSubmit()">
            <!-- Email Field -->
            <div class="mb-3">
              <label for="email" class="form-label">
                <i class="fas fa-envelope me-1"></i>
                Email адрес
              </label>
              <input 
                type="email" 
                class="form-control" 
                id="email"
                formControlName="email" 
                placeholder="Въведете вашия email"
                [class.is-invalid]="loginForm.get('email')?.invalid && loginForm.get('email')?.touched">
              <div class="invalid-feedback" *ngIf="loginForm.get('email')?.invalid && loginForm.get('email')?.touched">
                Моля въведете валиден email адрес
              </div>
            </div>

            <!-- Password Field -->
            <div class="mb-4">
              <label for="password" class="form-label">
                <i class="fas fa-lock me-1"></i>
                Парола
              </label>
              <input 
                type="password" 
                class="form-control" 
                id="password"
                formControlName="password" 
                placeholder="Въведете вашата парола"
                [class.is-invalid]="loginForm.get('password')?.invalid && loginForm.get('password')?.touched">
              <div class="invalid-feedback" *ngIf="loginForm.get('password')?.invalid && loginForm.get('password')?.touched">
                Паролата е задължителна
              </div>
            </div>

            <!-- Submit Button -->
            <button 
              type="submit" 
              class="btn btn-primary w-100 py-2"
              [disabled]="loginForm.invalid || isLoading">
              <span *ngIf="isLoading" class="spinner-border spinner-border-sm me-2"></span>
              <i *ngIf="!isLoading" class="fas fa-sign-in-alt me-2"></i>
              {{ isLoading ? 'Влизане...' : 'Влез' }}
            </button>
          </form>

          <!-- Register Link -->
          <div class="text-center mt-4">
            <p class="mb-0">
              Нямате акаунт? 
              <a routerLink="/auth/register" class="text-decoration-none fw-bold">
                Регистрирайте се
              </a>
            </p>
          </div>

          <!-- Demo Credentials -->
          <div class="mt-4 p-3 bg-light rounded">
            <small class="text-muted">
              <strong>Демо достъп:</strong><br>
              Email: admin@worldfamily.com<br>
              Парола: Admin123
            </small>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    /* Login page uses global auth-container and auth-card styles from styles.scss */
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
    private route: ActivatedRoute
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
            console.error('Login error:', error);
            alert(error.error?.message || 'Грешка при влизане. Моля опитайте отново.');
            return of(null);
          }),
          finalize(() => this.isLoading = false)
        )
        .subscribe(response => {
          if (response) {
            console.log('Login successful');
            this.router.navigate([this.returnUrl]);
          }
        });
    }
  }
}