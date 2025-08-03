import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, AbstractControl } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { RegisterRequest } from '../../../core/models/user.interface';
import { catchError, finalize } from 'rxjs/operators';
import { of } from 'rxjs';

function passwordMatchValidator(control: AbstractControl) {
  const password = control.get('password');
  const confirmPassword = control.get('confirmPassword');
  
  if (password && confirmPassword && password.value !== confirmPassword.value) {
    return { passwordMismatch: true };
  }
  return null;
}

@Component({
  selector: 'app-register',
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
            <i class="fas fa-user-plus me-2"></i>
            Регистрация в World Family
          </h2>
          <p class="mb-0 mt-2 opacity-75">Създайте акаунт за семейната мрежа</p>
        </div>

        <!-- Form Content -->
        <div class="p-4">
          <form [formGroup]="registerForm" (ngSubmit)="onSubmit()">
            <!-- Name Fields Row -->
            <div class="row g-3 mb-3">
              <div class="col-md-4">
                <label for="firstName" class="form-label">
                  <i class="fas fa-user me-1"></i>
                  Име *
                </label>
                <input 
                  type="text" 
                  class="form-control" 
                  id="firstName"
                  formControlName="firstName" 
                  placeholder="Име"
                  [class.is-invalid]="registerForm.get('firstName')?.invalid && registerForm.get('firstName')?.touched">
                <div class="invalid-feedback" *ngIf="registerForm.get('firstName')?.invalid && registerForm.get('firstName')?.touched">
                  Името е задължително
                </div>
              </div>
              
              <div class="col-md-4">
                <label for="middleName" class="form-label">
                  <i class="fas fa-user me-1"></i>
                  Презиме *
                </label>
                <input 
                  type="text" 
                  class="form-control" 
                  id="middleName"
                  formControlName="middleName" 
                  placeholder="Презиме"
                  [class.is-invalid]="registerForm.get('middleName')?.invalid && registerForm.get('middleName')?.touched">
                <div class="invalid-feedback" *ngIf="registerForm.get('middleName')?.invalid && registerForm.get('middleName')?.touched">
                  Презимето е задължително
                </div>
              </div>

              <div class="col-md-4">
                <label for="lastName" class="form-label">
                  <i class="fas fa-user me-1"></i>
                  Фамилия *
                </label>
                <input 
                  type="text" 
                  class="form-control" 
                  id="lastName"
                  formControlName="lastName" 
                  placeholder="Фамилия"
                  [class.is-invalid]="registerForm.get('lastName')?.invalid && registerForm.get('lastName')?.touched">
                <div class="invalid-feedback" *ngIf="registerForm.get('lastName')?.invalid && registerForm.get('lastName')?.touched">
                  Фамилията е задължителна
                </div>
              </div>
            </div>

            <!-- Email Field -->
            <div class="mb-3">
              <label for="email" class="form-label">
                <i class="fas fa-envelope me-1"></i>
                Email адрес *
              </label>
              <input 
                type="email" 
                class="form-control" 
                id="email"
                formControlName="email" 
                placeholder="Въведете вашия email"
                [class.is-invalid]="registerForm.get('email')?.invalid && registerForm.get('email')?.touched">
              <div class="invalid-feedback" *ngIf="registerForm.get('email')?.invalid && registerForm.get('email')?.touched">
                Моля въведете валиден email адрес
              </div>
            </div>

            <!-- Date of Birth Field -->
            <div class="mb-3">
              <label for="dateOfBirth" class="form-label">
                <i class="fas fa-calendar me-1"></i>
                Дата на раждане *
              </label>
              <input 
                type="date" 
                class="form-control" 
                id="dateOfBirth"
                formControlName="dateOfBirth" 
                placeholder="Изберете дата"
                [class.is-invalid]="registerForm.get('dateOfBirth')?.invalid && registerForm.get('dateOfBirth')?.touched">
              <div class="invalid-feedback" *ngIf="registerForm.get('dateOfBirth')?.invalid && registerForm.get('dateOfBirth')?.touched">
                Датата на раждане е задължителна
              </div>
            </div>

            <!-- Password Fields -->
            <div class="row g-3 mb-4">
              <div class="col-md-6">
                <label for="password" class="form-label">
                  <i class="fas fa-lock me-1"></i>
                  Парола *
                </label>
                <input 
                  type="password" 
                  class="form-control" 
                  id="password"
                  formControlName="password" 
                  placeholder="Въведете парола"
                  [class.is-invalid]="registerForm.get('password')?.invalid && registerForm.get('password')?.touched">
                <div class="invalid-feedback" *ngIf="registerForm.get('password')?.invalid && registerForm.get('password')?.touched">
                  Паролата трябва да е поне 8 символа и да съдържа малка/главна буква, цифра и специален символ (@$!%*?&)
                </div>
              </div>

              <div class="col-md-6">
                <label for="confirmPassword" class="form-label">
                  <i class="fas fa-lock me-1"></i>
                  Потвърдете паролата *
                </label>
                <input 
                  type="password" 
                  class="form-control" 
                  id="confirmPassword"
                  formControlName="confirmPassword" 
                  placeholder="Потвърдете паролата"
                  [class.is-invalid]="(registerForm.get('confirmPassword')?.invalid && registerForm.get('confirmPassword')?.touched) || (registerForm.hasError('passwordMismatch') && registerForm.get('confirmPassword')?.touched)">
                <div class="invalid-feedback" *ngIf="registerForm.get('confirmPassword')?.invalid && registerForm.get('confirmPassword')?.touched">
                  Потвърдената парола е задължителна
                </div>
                <div class="invalid-feedback" *ngIf="registerForm.hasError('passwordMismatch') && registerForm.get('confirmPassword')?.touched">
                  Паролите не съвпадат
                </div>
              </div>
            </div>

            <!-- Submit Button -->
            <button 
              type="submit" 
              class="btn btn-primary w-100 py-2"
              [disabled]="registerForm.invalid || isLoading">
              <span *ngIf="isLoading" class="spinner-border spinner-border-sm me-2"></span>
              <i *ngIf="!isLoading" class="fas fa-user-plus me-2"></i>
              {{ isLoading ? 'Регистриране...' : 'Регистрирай се' }}
            </button>
          </form>

          <!-- Login Link -->
          <div class="text-center mt-4">
            <p class="mb-0">
              Вече имате акаунт? 
              <a routerLink="/auth/login" class="text-decoration-none fw-bold">
                Влезте
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    /* Register page uses global auth-container and auth-card styles from styles.scss */
  `]
})
export class RegisterComponent {
  registerForm: FormGroup;
  isLoading = false;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {
    this.registerForm = this.fb.group({
      firstName: ['', [Validators.required]],
      middleName: ['', [Validators.required]],
      lastName: ['', [Validators.required]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [
        Validators.required, 
        Validators.minLength(8),
        Validators.pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/)
      ]],
      confirmPassword: ['', [Validators.required]],
      dateOfBirth: ['', [Validators.required]]
    }, { validators: passwordMatchValidator });
  }

  onSubmit(): void {
    if (this.registerForm.valid) {
      this.isLoading = true;
      const registerData: RegisterRequest = this.registerForm.value;

      this.authService.register(registerData)
        .pipe(
          catchError(error => {
            console.error('Register error:', error);
            alert(error.error?.message || 'Грешка при регистрация. Моля опитайте отново.');
            return of(null);
          }),
          finalize(() => this.isLoading = false)
        )
        .subscribe(response => {
          if (response) {
            console.log('Registration successful');
            alert('Регистрацията е успешна! Добре дошли!');
            this.router.navigate(['/families']);
          }
        });
    }
  }
}