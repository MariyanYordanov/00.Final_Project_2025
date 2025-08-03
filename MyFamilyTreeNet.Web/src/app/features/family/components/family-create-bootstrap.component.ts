import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { FamilyService } from '../../../core/services/family.service';
import { MemberService } from '../../../core/services/member.service';
import { AuthService } from '../../../core/services/auth.service';
import { CreateFamilyRequest, CreateMemberRequest } from '../../../core/models/family.interface';

@Component({
  selector: 'app-family-create-bootstrap',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule
  ],
  template: `
    <div class="container mt-4">
      <div class="row justify-content-center">
        <div class="col-lg-8 col-md-10">
          <!-- Header -->
          <div class="text-center mb-5">
            <h1 class="display-5 text-primary mb-3">
              <i class="fas fa-plus-circle me-3"></i>Създай ново семейство
            </h1>
            <p class="lead text-muted">Започнете вашата семейна история</p>
          </div>

          <!-- Form Card -->
          <div class="card border-0 shadow-lg">
            <div class="card-header bg-primary text-white text-center py-4">
              <h3 class="card-title mb-0">
                <i class="fas fa-home me-2"></i>
                Детайли за семейството
              </h3>
            </div>

            <div class="card-body p-5">
              <form [formGroup]="familyForm" (ngSubmit)="onSubmit()">
                
                <!-- Name Field -->
                <div class="mb-4">
                  <label class="form-label fw-bold">
                    <i class="fas fa-signature me-2 text-primary"></i>
                    Име на семейството *
                  </label>
                  <input 
                    type="text" 
                    class="form-control form-control-lg" 
                    formControlName="name"
                    placeholder="напр. Семейство Иванови"
                    [class.is-invalid]="familyForm.get('name')?.invalid && familyForm.get('name')?.touched">
                  <div class="invalid-feedback" *ngIf="familyForm.get('name')?.hasError('required') && familyForm.get('name')?.touched">
                    Името е задължително
                  </div>
                  <div class="invalid-feedback" *ngIf="familyForm.get('name')?.hasError('minlength') && familyForm.get('name')?.touched">
                    Името трябва да е поне 3 символа
                  </div>
                </div>

                <!-- Description Field -->
                <div class="mb-4">
                  <label class="form-label fw-bold">
                    <i class="fas fa-align-left me-2 text-primary"></i>
                    Описание
                  </label>
                  <textarea 
                    class="form-control" 
                    formControlName="description" 
                    rows="4"
                    placeholder="Добавете описание на вашето семейство..."></textarea>
                  <div class="form-text">
                    <i class="fas fa-info-circle me-1"></i>
                    Опционално - можете да добавите история или информация за семейството
                  </div>
                </div>

                <!-- Location Field -->
                <div class="mb-4">
                  <label class="form-label fw-bold">
                    <i class="fas fa-map-marker-alt me-2 text-primary"></i>
                    Местоположение
                  </label>
                  <input 
                    type="text" 
                    class="form-control" 
                    formControlName="location"
                    placeholder="напр. София, България">
                </div>

                <!-- Info Alert - All families are now public -->
                <div class="alert alert-info d-flex align-items-start mb-4">
                  <i class="fas fa-globe me-3 mt-1"></i>
                  <div>
                    <strong>Всички семейства са публични</strong>
                    <p class="mb-0 mt-1">Всеки може да разглежда семейството, но личните данни (дати на раждане) са видими само за създателя.</p>
                  </div>
                </div>

                <!-- Form Actions -->
                <div class="d-flex gap-3 justify-content-end">
                  <button 
                    type="button" 
                    class="btn btn-outline-secondary btn-lg px-4"
                    (click)="onCancel()">
                    <i class="fas fa-times me-2"></i>Отказ
                  </button>
                  <button 
                    type="submit" 
                    class="btn btn-primary btn-lg px-4"
                    [disabled]="familyForm.invalid || isLoading">
                    <span *ngIf="isLoading" class="spinner-border spinner-border-sm me-2"></span>
                    <i *ngIf="!isLoading" class="fas fa-plus me-2"></i>
                    {{ isLoading ? 'Създаване...' : 'Създай семейство' }}
                  </button>
                </div>
              </form>
            </div>
          </div>

          <!-- Success/Error Messages -->
          <div *ngIf="successMessage" class="alert alert-success mt-4 d-flex align-items-center">
            <i class="fas fa-check-circle me-2"></i>
            {{ successMessage }}
          </div>

          <div *ngIf="errorMessage" class="alert alert-danger mt-4 d-flex align-items-center">
            <i class="fas fa-exclamation-triangle me-2"></i>
            {{ errorMessage }}
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .card {
      border-radius: 1rem;
      overflow: hidden;
    }

    .card-header {
      border-radius: 1rem 1rem 0 0 !important;
    }

    .form-control, .form-select {
      border-radius: 0.75rem;
      border: 2px solid #e9ecef;
      padding: 0.75rem 1rem;
      transition: border-color 0.15s ease-in-out, box-shadow 0.15s ease-in-out;
    }

    .form-control:focus, .form-select:focus {
      border-color: #0d6efd;
      box-shadow: 0 0 0 0.25rem rgba(13, 110, 253, 0.25);
    }

    .form-label {
      color: #495057;
      margin-bottom: 0.75rem;
    }

    .btn {
      border-radius: 0.75rem;
      font-weight: 500;
      transition: all 0.3s ease;
    }

    .btn-primary {
      background: linear-gradient(45deg, #0d6efd, #6610f2);
      border: none;
    }

    .btn-primary:hover {
      background: linear-gradient(45deg, #0b5ed7, #5a0fcf);
      transform: translateY(-1px);
    }

    .alert {
      border-radius: 0.75rem;
      border: none;
    }

    .display-5 {
      font-weight: 600;
    }

    .spinner-border-sm {
      width: 1rem;
      height: 1rem;
    }

    @media (max-width: 768px) {
      .container {
        padding: 0 15px;
      }
      
      .card-body {
        padding: 2rem !important;
      }
      
      .d-flex.gap-3 {
        flex-direction: column;
      }
      
      .btn {
        width: 100%;
      }
    }
  `]
})
export class FamilyCreateBootstrapComponent implements OnInit {
  familyForm!: FormGroup;
  isLoading = false;
  successMessage = '';
  errorMessage = '';

  constructor(
    private fb: FormBuilder,
    private familyService: FamilyService,
    private memberService: MemberService,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.familyForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(3)]],
      description: [''],
      location: ['']
    });
  }

  onSubmit(): void {
    if (this.familyForm.invalid) {
      this.markFormGroupTouched();
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';
    this.successMessage = '';
    
    const familyData: CreateFamilyRequest = {
      ...this.familyForm.value,
      isPublic: true // All families are now public
    };

    this.familyService.createFamily(familyData).subscribe({
      next: (family) => {
        // Automatically add the creator as a family member
        const currentUser = this.authService.getCurrentUser();
        if (currentUser) {
          const creatorMember: CreateMemberRequest = {
            firstName: currentUser.firstName,
            middleName: currentUser.middleName,
            lastName: currentUser.lastName,
            gender: 'Male', // Default - user can edit later
            dateOfBirth: currentUser.dateOfBirth,
            biography: 'Създател на семейството',
            familyId: family.id
          };

          this.memberService.createMember(creatorMember).subscribe({
            next: () => {
              this.successMessage = 'Семейството е създадено успешно! Вие сте добавени като член.';
              setTimeout(() => {
                this.router.navigate(['/families', family.id]);
              }, 2000);
            },
            error: () => {
              // Family was created but member creation failed - still navigate to family
              this.successMessage = 'Семейството е създадено успешно!';
              setTimeout(() => {
                this.router.navigate(['/families', family.id]);
              }, 2000);
            }
          });
        } else {
          this.successMessage = 'Семейството е създадено успешно!';
          setTimeout(() => {
            this.router.navigate(['/families', family.id]);
          }, 2000);
        }
      },
      error: (error) => {
        console.error('Error creating family:', error);
        this.isLoading = false;
        
        if (error.status === 401) {
          this.errorMessage = 'Моля, влезте в профила си';
          setTimeout(() => {
            this.router.navigate(['/auth/login']);
          }, 2000);
        } else if (error.error?.errors) {
          this.errorMessage = Object.values(error.error.errors).flat().join(', ');
        } else {
          this.errorMessage = 'Грешка при създаване на семейство. Моля опитайте отново.';
        }
      }
    });
  }

  private markFormGroupTouched(): void {
    Object.keys(this.familyForm.controls).forEach(field => {
      const control = this.familyForm.get(field);
      control?.markAsTouched({ onlySelf: true });
    });
  }

  onCancel(): void {
    this.router.navigate(['/families']);
  }
}