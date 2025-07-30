import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, AbstractControl } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
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
    RouterLink,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
    MatDatepickerModule,
    MatNativeDateModule
  ],
  template: `
    <div class="auth-container">
      <mat-card class="auth-card">
        <mat-card-header>
          <mat-card-title>Регистрация в World Family</mat-card-title>
        </mat-card-header>
        
        <mat-card-content>
          <form [formGroup]="registerForm" (ngSubmit)="onSubmit()">
            <div class="name-row">
              <mat-form-field appearance="outline" class="name-field">
                <mat-label>Име</mat-label>
                <input matInput formControlName="firstName" required>
                <mat-error *ngIf="registerForm.get('firstName')?.invalid && registerForm.get('firstName')?.touched">
                  Името е задължително
                </mat-error>
              </mat-form-field>

              <mat-form-field appearance="outline" class="name-field">
                <mat-label>Презиме</mat-label>
                <input matInput formControlName="middleName" required>
                <mat-error *ngIf="registerForm.get('middleName')?.invalid && registerForm.get('middleName')?.touched">
                  Презимето е задължително
                </mat-error>
              </mat-form-field>

              <mat-form-field appearance="outline" class="name-field">
                <mat-label>Фамилия</mat-label>
                <input matInput formControlName="lastName" required>
                <mat-error *ngIf="registerForm.get('lastName')?.invalid && registerForm.get('lastName')?.touched">
                  Фамилията е задължителна
                </mat-error>
              </mat-form-field>
            </div>

            <mat-form-field appearance="outline" class="full-width">
              <mat-label>Email</mat-label>
              <input matInput type="email" formControlName="email" required>
              <mat-error *ngIf="registerForm.get('email')?.invalid && registerForm.get('email')?.touched">
                Моля въведете валиден email
              </mat-error>
            </mat-form-field>

            <mat-form-field appearance="outline" class="full-width">
              <mat-label>Дата на раждане</mat-label>
              <input matInput [matDatepicker]="picker" formControlName="dateOfBirth">
              <mat-datepicker-toggle matIconSuffix [for]="picker"></mat-datepicker-toggle>
              <mat-datepicker #picker></mat-datepicker>
            </mat-form-field>

            <mat-form-field appearance="outline" class="full-width">
              <mat-label>Парола</mat-label>
              <input matInput type="password" formControlName="password" required>
              <mat-error *ngIf="registerForm.get('password')?.invalid && registerForm.get('password')?.touched">
                Паролата трябва да е поне 6 символа
              </mat-error>
            </mat-form-field>

            <mat-form-field appearance="outline" class="full-width">
              <mat-label>Потвърдете паролата</mat-label>
              <input matInput type="password" formControlName="confirmPassword" required>
              <mat-error *ngIf="registerForm.get('confirmPassword')?.invalid && registerForm.get('confirmPassword')?.touched">
                Потвърдената парола е задължителна
              </mat-error>
              <mat-error *ngIf="registerForm.hasError('passwordMismatch') && registerForm.get('confirmPassword')?.touched">
                Паролите не съвпадат
              </mat-error>
            </mat-form-field>

            <button 
              mat-raised-button 
              color="primary" 
              type="submit" 
              class="full-width submit-button"
              [disabled]="registerForm.invalid || isLoading">
              <mat-spinner diameter="20" *ngIf="isLoading"></mat-spinner>
              {{ isLoading ? 'Регистриране...' : 'Регистрирай се' }}
            </button>
          </form>
        </mat-card-content>

        <mat-card-actions>
          <p>Вече имате акаунт? <a routerLink="/auth/login" mat-button color="accent">Влезте</a></p>
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
      max-width: 500px;
      width: 100%;
    }

    .full-width {
      width: 100%;
      margin-bottom: 16px;
    }

    .name-row {
      display: flex;
      gap: 8px;
      margin-bottom: 16px;
    }

    .name-field {
      flex: 1;
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

    @media (max-width: 600px) {
      .name-row {
        flex-direction: column;
        gap: 0;
      }
    }
  `]
})
export class RegisterComponent {
  registerForm: FormGroup;
  isLoading = false;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private snackBar: MatSnackBar
  ) {
    this.registerForm = this.fb.group({
      firstName: ['', [Validators.required]],
      middleName: ['', [Validators.required]],
      lastName: ['', [Validators.required]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', [Validators.required]],
      dateOfBirth: ['']
    }, { validators: passwordMatchValidator });
  }

  onSubmit(): void {
    if (this.registerForm.valid) {
      this.isLoading = true;
      const registerData: RegisterRequest = this.registerForm.value;

      this.authService.register(registerData)
        .pipe(
          catchError(error => {
            this.snackBar.open(
              error.error?.message || 'Грешка при регистрация. Моля опитайте отново.',
              'Затвори',
              { duration: 5000 }
            );
            return of(null);
          }),
          finalize(() => this.isLoading = false)
        )
        .subscribe(response => {
          if (response) {
            this.snackBar.open('Успешна регистрация!', 'Затвори', { duration: 3000 });
            this.router.navigate(['/families']);
          }
        });
    }
  }
}