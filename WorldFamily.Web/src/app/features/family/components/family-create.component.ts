import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { FamilyService } from '../../../core/services/family.service';
import { MemberService } from '../../../core/services/member.service';
import { AuthService } from '../../../core/services/auth.service';
import { CreateFamilyRequest, CreateMemberRequest } from '../../../core/models/family.interface';

@Component({
  selector: 'app-family-create',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatSlideToggleModule,
    MatProgressSpinnerModule,
    MatSnackBarModule
  ],
  template: `
    <div class="create-container">
      <mat-card class="create-card">
        <mat-card-header>
          <mat-card-title>
            <mat-icon>add_circle</mat-icon>
            Създай ново семейство
          </mat-card-title>
        </mat-card-header>

        <mat-card-content>
          <form [formGroup]="familyForm" (ngSubmit)="onSubmit()">
            <mat-form-field appearance="fill" class="full-width">
              <mat-label>Име на семейството</mat-label>
              <input matInput 
                     formControlName="name" 
                     placeholder="напр. Семейство Иванови"
                     required>
              <mat-error *ngIf="familyForm.get('name')?.hasError('required')">
                Името е задължително
              </mat-error>
              <mat-error *ngIf="familyForm.get('name')?.hasError('minlength')">
                Името трябва да е поне 3 символа
              </mat-error>
            </mat-form-field>

            <mat-form-field appearance="fill" class="full-width">
              <mat-label>Описание</mat-label>
              <textarea matInput 
                        formControlName="description" 
                        rows="4"
                        placeholder="Добавете описание на вашето семейство..."></textarea>
              <mat-hint>Опционално - можете да добавите история или информация за семейството</mat-hint>
            </mat-form-field>

            <mat-form-field appearance="fill" class="full-width">
              <mat-label>Местоположение</mat-label>
              <input matInput 
                     formControlName="location" 
                     placeholder="напр. София, България">
              <mat-icon matSuffix>location_on</mat-icon>
            </mat-form-field>

            <div class="toggle-section">
              <mat-slide-toggle formControlName="isPublic" color="primary">
                <span class="toggle-label">
                  <mat-icon>{{ familyForm.get('isPublic')?.value ? 'public' : 'lock' }}</mat-icon>
                  {{ familyForm.get('isPublic')?.value ? 'Публично' : 'Частно' }} семейство
                </span>
              </mat-slide-toggle>
              <p class="toggle-hint">
                {{ familyForm.get('isPublic')?.value 
                  ? 'Всеки може да вижда вашето семейство' 
                  : 'Само вие можете да виждате вашето семейство' }}
              </p>
            </div>

            <div class="form-actions">
              <button mat-button 
                      type="button" 
                      (click)="onCancel()">
                <mat-icon>close</mat-icon>
                Отказ
              </button>
              <button mat-raised-button 
                      color="primary" 
                      type="submit"
                      [disabled]="familyForm.invalid || isLoading">
                <mat-icon>save</mat-icon>
                Създай семейство
              </button>
            </div>
          </form>
        </mat-card-content>

        <div *ngIf="isLoading" class="loading-overlay">
          <mat-spinner></mat-spinner>
          <p>Създаване на семейство...</p>
        </div>
      </mat-card>
    </div>
  `,
  styles: [`
    .create-container {
      padding: 24px;
      max-width: 600px;
      margin: 0 auto;
    }

    .create-card {
      position: relative;
    }

    mat-card-header {
      margin-bottom: 24px;
    }

    mat-card-title {
      display: flex;
      align-items: center;
      gap: 12px;
      font-size: 1.5rem;
    }

    .full-width {
      width: 100%;
      margin-bottom: 16px;
    }

    .toggle-section {
      margin: 24px 0;
      padding: 16px;
      background-color: #f5f5f5;
      border-radius: 8px;
    }

    .toggle-label {
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .toggle-hint {
      margin: 8px 0 0 0;
      font-size: 0.875rem;
      color: #666;
    }

    .form-actions {
      display: flex;
      justify-content: flex-end;
      gap: 12px;
      margin-top: 24px;
    }

    .loading-overlay {
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(255, 255, 255, 0.9);
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      gap: 16px;
      border-radius: 4px;
    }
  `]
})
export class FamilyCreateComponent implements OnInit {
  familyForm!: FormGroup;
  isLoading = false;

  constructor(
    private fb: FormBuilder,
    private familyService: FamilyService,
    private memberService: MemberService,
    private authService: AuthService,
    private router: Router,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.familyForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(3)]],
      description: [''],
      location: [''],
      isPublic: [true]
    });
  }

  onSubmit(): void {
    if (this.familyForm.invalid) {
      return;
    }

    this.isLoading = true;
    const familyData: CreateFamilyRequest = this.familyForm.value;

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
              this.snackBar.open('Семейството е създадено успешно! Вие сте добавени като член.', 'OK', {
                duration: 4000,
                horizontalPosition: 'center',
                verticalPosition: 'top'
              });
              this.router.navigate(['/families', family.id]);
            },
            error: () => {
              // Family was created but member creation failed - still navigate to family
              this.snackBar.open('Семейството е създадено успешно!', 'OK', {
                duration: 3000,
                horizontalPosition: 'center',
                verticalPosition: 'top'
              });
              this.router.navigate(['/families', family.id]);
            }
          });
        } else {
          this.snackBar.open('Семейството е създадено успешно!', 'OK', {
            duration: 3000,
            horizontalPosition: 'center',
            verticalPosition: 'top'
          });
          this.router.navigate(['/families', family.id]);
        }
      },
      error: (error) => {
        console.error('Error creating family:', error);
        this.isLoading = false;
        
        let errorMessage = 'Грешка при създаване на семейство';
        if (error.status === 401) {
          errorMessage = 'Моля, влезте в профила си';
          this.router.navigate(['/auth/login']);
        } else if (error.error?.errors) {
          errorMessage = Object.values(error.error.errors).flat().join(', ');
        }
        
        this.snackBar.open(errorMessage, 'OK', {
          duration: 5000,
          horizontalPosition: 'center',
          verticalPosition: 'top'
        });
      }
    });
  }

  onCancel(): void {
    this.router.navigate(['/families']);
  }
}