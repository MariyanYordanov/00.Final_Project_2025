import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { Subject, takeUntil, finalize } from 'rxjs';

import { ProfileService } from '../../core/services/profile.service';
import { AuthService } from '../../core/services/auth.service';
import { User, UpdateProfileRequest, ChangePasswordRequest } from '../../core/models/user.interface';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="container mt-4">
      <div class="row">
        <div class="col-lg-8 mx-auto">
          <div class="card">
            <div class="card-header">
              <h3><i class="fas fa-user"></i> Моят профил</h3>
            </div>
            <div class="card-body">
              <!-- Profile Picture -->
              <div class="text-center mb-4" *ngIf="user">
                <img 
                  [src]="user.profilePictureUrl || '/assets/default-avatar.png'" 
                  [alt]="user.firstName + ' ' + user.lastName"
                  class="rounded-circle mb-3"
                  style="width: 120px; height: 120px; object-fit: cover;">
                <h5>{{ user.firstName }} {{ user.middleName }} {{ user.lastName }}</h5>
                <p class="text-muted">{{ user.email }}</p>
              </div>

              <!-- Profile Edit Form -->
              <form [formGroup]="profileForm" (ngSubmit)="onUpdateProfile()" *ngIf="!showPasswordForm">
                <div class="row">
                  <div class="col-md-4 mb-3">
                    <label for="firstName" class="form-label">Име *</label>
                    <input 
                      type="text" 
                      class="form-control"
                      [class.is-invalid]="profileForm.get('firstName')?.invalid && profileForm.get('firstName')?.touched"
                      id="firstName" 
                      formControlName="firstName">
                    <div class="invalid-feedback" *ngIf="profileForm.get('firstName')?.invalid && profileForm.get('firstName')?.touched">
                      <span *ngIf="profileForm.get('firstName')?.errors?.['required']">Името е задължително</span>
                      <span *ngIf="profileForm.get('firstName')?.errors?.['minlength']">Името трябва да е поне 2 символа</span>
                    </div>
                  </div>
                  <div class="col-md-4 mb-3">
                    <label for="middleName" class="form-label">Презиме *</label>
                    <input 
                      type="text" 
                      class="form-control"
                      [class.is-invalid]="profileForm.get('middleName')?.invalid && profileForm.get('middleName')?.touched"
                      id="middleName" 
                      formControlName="middleName">
                    <div class="invalid-feedback" *ngIf="profileForm.get('middleName')?.invalid && profileForm.get('middleName')?.touched">
                      <span *ngIf="profileForm.get('middleName')?.errors?.['required']">Презимето е задължително</span>
                      <span *ngIf="profileForm.get('middleName')?.errors?.['minlength']">Презимето трябва да е поне 2 символа</span>
                    </div>
                  </div>
                  <div class="col-md-4 mb-3">
                    <label for="lastName" class="form-label">Фамилия *</label>
                    <input 
                      type="text" 
                      class="form-control"
                      [class.is-invalid]="profileForm.get('lastName')?.invalid && profileForm.get('lastName')?.touched"
                      id="lastName" 
                      formControlName="lastName">
                    <div class="invalid-feedback" *ngIf="profileForm.get('lastName')?.invalid && profileForm.get('lastName')?.touched">
                      <span *ngIf="profileForm.get('lastName')?.errors?.['required']">Фамилията е задължителна</span>
                      <span *ngIf="profileForm.get('lastName')?.errors?.['minlength']">Фамилията трябва да е поне 2 символа</span>
                    </div>
                  </div>
                </div>

                <div class="row">
                  <div class="col-md-6 mb-3">
                    <label for="dateOfBirth" class="form-label">Дата на раждане</label>
                    <input 
                      type="date" 
                      class="form-control"
                      id="dateOfBirth" 
                      formControlName="dateOfBirth">
                  </div>
                  <div class="col-md-6 mb-3">
                    <label for="profilePictureUrl" class="form-label">URL на снимка</label>
                    <input 
                      type="url" 
                      class="form-control"
                      id="profilePictureUrl" 
                      formControlName="profilePictureUrl"
                      placeholder="https://example.com/photo.jpg">
                  </div>
                </div>

                <div class="mb-3">
                  <label for="bio" class="form-label">Биография</label>
                  <textarea 
                    class="form-control" 
                    id="bio" 
                    rows="4" 
                    formControlName="bio"
                    maxlength="1000"
                    placeholder="Разкажете нещо за себе си..."></textarea>
                  <div class="form-text">{{ profileForm.get('bio')?.value?.length || 0 }}/1000 символа</div>
                </div>

                <!-- Action Buttons -->
                <div class="d-flex gap-2 mb-3">
                  <button 
                    type="submit" 
                    class="btn btn-primary"
                    [disabled]="profileForm.invalid || isLoading">
                    <i class="fas fa-save me-1"></i>
                    <span *ngIf="!isLoading">Запази промените</span>
                    <span *ngIf="isLoading">
                      <span class="spinner-border spinner-border-sm me-1" role="status"></span>
                      Запазване...
                    </span>
                  </button>
                  <button 
                    type="button" 
                    class="btn btn-secondary"
                    (click)="onCancel()">
                    <i class="fas fa-times me-1"></i>
                    Отказ
                  </button>
                  <button 
                    type="button" 
                    class="btn btn-warning"
                    (click)="showPasswordChangeForm()">
                    <i class="fas fa-key me-1"></i>
                    Смени парола
                  </button>
                </div>
              </form>

              <!-- Password Change Form -->
              <form [formGroup]="passwordForm" (ngSubmit)="onChangePassword()" *ngIf="showPasswordForm">
                <h5 class="mb-3">Смяна на парола</h5>
                
                <div class="mb-3">
                  <label for="currentPassword" class="form-label">Текуща парола *</label>
                  <input 
                    type="password" 
                    class="form-control"
                    [class.is-invalid]="passwordForm.get('currentPassword')?.invalid && passwordForm.get('currentPassword')?.touched"
                    id="currentPassword" 
                    formControlName="currentPassword">
                  <div class="invalid-feedback" *ngIf="passwordForm.get('currentPassword')?.invalid && passwordForm.get('currentPassword')?.touched">
                    Текущата парола е задължителна
                  </div>
                </div>

                <div class="mb-3">
                  <label for="newPassword" class="form-label">Нова парола *</label>
                  <input 
                    type="password" 
                    class="form-control"
                    [class.is-invalid]="passwordForm.get('newPassword')?.invalid && passwordForm.get('newPassword')?.touched"
                    id="newPassword" 
                    formControlName="newPassword">
                  <div class="invalid-feedback" *ngIf="passwordForm.get('newPassword')?.invalid && passwordForm.get('newPassword')?.touched">
                    <span *ngIf="passwordForm.get('newPassword')?.errors?.['required']">Новата парола е задължителна</span>
                    <span *ngIf="passwordForm.get('newPassword')?.errors?.['minlength']">Паролата трябва да е поне 6 символа</span>
                  </div>
                </div>

                <div class="mb-3">
                  <label for="confirmNewPassword" class="form-label">Потвърди новата парола *</label>
                  <input 
                    type="password" 
                    class="form-control"
                    [class.is-invalid]="passwordForm.get('confirmNewPassword')?.invalid && passwordForm.get('confirmNewPassword')?.touched"
                    id="confirmNewPassword" 
                    formControlName="confirmNewPassword">
                  <div class="invalid-feedback" *ngIf="passwordForm.get('confirmNewPassword')?.invalid && passwordForm.get('confirmNewPassword')?.touched">
                    <span *ngIf="passwordForm.get('confirmNewPassword')?.errors?.['required']">Потвърждението е задължително</span>
                    <span *ngIf="passwordForm.get('confirmNewPassword')?.errors?.['passwordMismatch']">Паролите не съвпадат</span>
                  </div>
                </div>

                <div class="d-flex gap-2">
                  <button 
                    type="submit" 
                    class="btn btn-warning"
                    [disabled]="passwordForm.invalid || isLoading">
                    <i class="fas fa-key me-1"></i>
                    <span *ngIf="!isLoading">Смени парола</span>
                    <span *ngIf="isLoading">
                      <span class="spinner-border spinner-border-sm me-1" role="status"></span>
                      Променяне...
                    </span>
                  </button>
                  <button 
                    type="button" 
                    class="btn btn-secondary"
                    (click)="hidePasswordChangeForm()">
                    <i class="fas fa-times me-1"></i>
                    Отказ
                  </button>
                </div>
              </form>

              <!-- Success/Error Messages -->
              <div class="alert alert-success mt-3" *ngIf="successMessage">
                <i class="fas fa-check-circle me-1"></i>
                {{ successMessage }}
              </div>
              <div class="alert alert-danger mt-3" *ngIf="errorMessage">
                <i class="fas fa-exclamation-triangle me-1"></i>
                {{ errorMessage }}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `
})
export class ProfileComponent implements OnInit, OnDestroy {
  profileForm!: FormGroup;
  passwordForm!: FormGroup;
  user: User | null = null;
  showPasswordForm = false;
  isLoading = false;
  successMessage = '';
  errorMessage = '';
  private destroy$ = new Subject<void>();

  constructor(
    private fb: FormBuilder,
    private profileService: ProfileService,
    private authService: AuthService,
    private router: Router
  ) {
    this.initializeForms();
  }

  ngOnInit(): void {
    this.loadProfile();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private initializeForms(): void {
    this.profileForm = this.fb.group({
      firstName: ['', [Validators.required, Validators.minLength(2)]],
      middleName: ['', [Validators.required, Validators.minLength(2)]],
      lastName: ['', [Validators.required, Validators.minLength(2)]],
      dateOfBirth: [''],
      bio: ['', [Validators.maxLength(1000)]],
      profilePictureUrl: ['']
    });

    this.passwordForm = this.fb.group({
      currentPassword: ['', [Validators.required]],
      newPassword: ['', [Validators.required, Validators.minLength(6)]],
      confirmNewPassword: ['', [Validators.required]]
    }, { validators: this.passwordMatchValidator });
  }

  private passwordMatchValidator(control: any) {
    const newPassword = control.get('newPassword');
    const confirmNewPassword = control.get('confirmNewPassword');
    
    if (newPassword && confirmNewPassword && newPassword.value !== confirmNewPassword.value) {
      confirmNewPassword.setErrors({ passwordMismatch: true });
      return { passwordMismatch: true };
    }
    
    if (confirmNewPassword?.errors) {
      delete confirmNewPassword.errors['passwordMismatch'];
      if (Object.keys(confirmNewPassword.errors).length === 0) {
        confirmNewPassword.setErrors(null);
      }
    }
    
    return null;
  }

  private loadProfile(): void {
    this.isLoading = true;
    this.clearMessages();

    this.profileService.getProfile()
      .pipe(
        takeUntil(this.destroy$),
        finalize(() => this.isLoading = false)
      )
      .subscribe({
        next: (user) => {
          this.user = user;
          this.profileForm.patchValue({
            firstName: user.firstName,
            middleName: user.middleName,
            lastName: user.lastName,
            dateOfBirth: user.dateOfBirth ? new Date(user.dateOfBirth).toISOString().split('T')[0] : '',
            bio: user.bio,
            profilePictureUrl: user.profilePictureUrl
          });
        },
        error: (error) => {
          console.error('Грешка при зареждане на профил:', error);
          this.errorMessage = 'Възникна грешка при зареждане на профила.';
        }
      });
  }

  onUpdateProfile(): void {
    if (this.profileForm.invalid) return;

    this.isLoading = true;
    this.clearMessages();

    const formValue = this.profileForm.value;
    const updateData: UpdateProfileRequest = {
      firstName: formValue.firstName,
      middleName: formValue.middleName,
      lastName: formValue.lastName,
      dateOfBirth: formValue.dateOfBirth ? new Date(formValue.dateOfBirth) : undefined,
      bio: formValue.bio,
      profilePictureUrl: formValue.profilePictureUrl
    };

    this.profileService.updateProfile(updateData)
      .pipe(
        takeUntil(this.destroy$),
        finalize(() => this.isLoading = false)
      )
      .subscribe({
        next: (updatedUser) => {
          this.user = updatedUser;
          this.successMessage = 'Профилът е актуализиран успешно!';
          // Update the user in AuthService
          this.authService.currentUser$.pipe(takeUntil(this.destroy$)).subscribe(currentUser => {
            if (currentUser) {
              const updatedCurrentUser = { ...currentUser, ...updatedUser };
              // Update localStorage
              localStorage.setItem('user', JSON.stringify(updatedCurrentUser));
            }
          });
        },
        error: (error) => {
          console.error('Грешка при актуализация на профил:', error);
          this.errorMessage = error.error?.message || 'Възникна грешка при актуализация на профила.';
        }
      });
  }

  onChangePassword(): void {
    if (this.passwordForm.invalid) return;

    this.isLoading = true;
    this.clearMessages();

    const passwordData: ChangePasswordRequest = this.passwordForm.value;

    this.profileService.changePassword(passwordData)
      .pipe(
        takeUntil(this.destroy$),
        finalize(() => this.isLoading = false)
      )
      .subscribe({
        next: () => {
          this.successMessage = 'Паролата е променена успешно!';
          this.hidePasswordChangeForm();
        },
        error: (error) => {
          console.error('Грешка при смяна на парола:', error);
          this.errorMessage = error.error?.message || 'Възникна грешка при смяна на паролата.';
        }
      });
  }

  showPasswordChangeForm(): void {
    this.showPasswordForm = true;
    this.passwordForm.reset();
    this.clearMessages();
  }

  hidePasswordChangeForm(): void {
    this.showPasswordForm = false;
    this.passwordForm.reset();
  }

  onCancel(): void {
    this.router.navigate(['/families']);
  }

  private clearMessages(): void {
    this.successMessage = '';
    this.errorMessage = '';
  }
}