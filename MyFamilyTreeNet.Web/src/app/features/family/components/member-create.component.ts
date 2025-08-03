import { Component, OnInit, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MemberService } from '../../../core/services/member.service';
import { CreateMemberRequest } from '../../../core/models/family.interface';

@Component({
  selector: 'app-member-create',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatSelectModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatProgressSpinnerModule,
    MatSnackBarModule
  ],
  template: `
    <div class="create-container">
      <mat-card class="create-card">
        <mat-card-header>
          <mat-card-title>
            <mat-icon>person_add</mat-icon>
            Добави член на семейството
          </mat-card-title>
        </mat-card-header>

        <mat-card-content>
          <form [formGroup]="memberForm" (ngSubmit)="onSubmit()">
            <div class="name-fields">
              <mat-form-field appearance="fill" class="name-field">
                <mat-label>Име</mat-label>
                <input matInput 
                       formControlName="firstName" 
                       placeholder="Иван"
                       required>
                <mat-error *ngIf="memberForm.get('firstName')?.hasError('required')">
                  Името е задължително
                </mat-error>
              </mat-form-field>

              <mat-form-field appearance="fill" class="name-field">
                <mat-label>Презиме</mat-label>
                <input matInput 
                       formControlName="middleName" 
                       placeholder="Петров"
                       required>
                <mat-error *ngIf="memberForm.get('middleName')?.hasError('required')">
                  Презимето е задължително
                </mat-error>
              </mat-form-field>

              <mat-form-field appearance="fill" class="name-field">
                <mat-label>Фамилия</mat-label>
                <input matInput 
                       formControlName="lastName" 
                       placeholder="Иванов"
                       required>
                <mat-error *ngIf="memberForm.get('lastName')?.hasError('required')">
                  Фамилията е задължителна
                </mat-error>
              </mat-form-field>
            </div>

            <div class="info-fields">
              <mat-form-field appearance="fill" class="info-field">
                <mat-label>Пол</mat-label>
                <mat-select formControlName="gender" required>
                  <mat-option value="Male">Мъж</mat-option>
                  <mat-option value="Female">Жена</mat-option>
                </mat-select>
                <mat-error *ngIf="memberForm.get('gender')?.hasError('required')">
                  Полът е задължителен
                </mat-error>
              </mat-form-field>

              <mat-form-field appearance="fill" class="info-field">
                <mat-label>Дата на раждане</mat-label>
                <input matInput 
                       [matDatepicker]="birthPicker" 
                       formControlName="dateOfBirth"
                       placeholder="ДД/ММ/ГГГГ">
                <mat-datepicker-toggle matSuffix [for]="birthPicker"></mat-datepicker-toggle>
                <mat-datepicker #birthPicker></mat-datepicker>
              </mat-form-field>
            </div>

            <mat-form-field appearance="fill" class="full-width">
              <mat-label>Място на раждане</mat-label>
              <input matInput 
                     formControlName="placeOfBirth" 
                     placeholder="София, България">
              <mat-icon matSuffix>location_on</mat-icon>
            </mat-form-field>

            <mat-form-field appearance="fill" class="full-width">
              <mat-label>Биография</mat-label>
              <textarea matInput 
                        formControlName="biography" 
                        rows="4"
                        placeholder="Разкажете за този член на семейството..."></textarea>
              <mat-hint>Опционално - добавете информация за живота и историята</mat-hint>
            </mat-form-field>

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
                      [disabled]="memberForm.invalid || isLoading">
                <mat-icon>save</mat-icon>
                Добави член
              </button>
            </div>
          </form>
        </mat-card-content>

        <div *ngIf="isLoading" class="loading-overlay">
          <mat-spinner></mat-spinner>
          <p>Добавяне на член...</p>
        </div>
      </mat-card>
    </div>
  `,
  styles: [`
    .create-container {
      padding: 24px;
      max-width: 800px;
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

    .name-fields {
      display: grid;
      grid-template-columns: 1fr 1fr 1fr;
      gap: 16px;
      margin-bottom: 16px;
    }

    .name-field {
      width: 100%;
    }

    .info-fields {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 16px;
      margin-bottom: 16px;
    }

    .info-field {
      width: 100%;
    }

    .full-width {
      width: 100%;
      margin-bottom: 16px;
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

    @media (max-width: 768px) {
      .name-fields {
        grid-template-columns: 1fr;
      }
      
      .info-fields {
        grid-template-columns: 1fr;
      }
    }
  `]
})
export class MemberCreateComponent implements OnInit {
  memberForm!: FormGroup;
  isLoading = false;
  familyId!: number;

  constructor(
    private fb: FormBuilder,
    private memberService: MemberService,
    private router: Router,
    private route: ActivatedRoute,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.familyId = +this.route.snapshot.params['familyId'];
    
    this.memberForm = this.fb.group({
      firstName: ['', [Validators.required, Validators.minLength(2)]],
      middleName: ['', [Validators.required, Validators.minLength(2)]],
      lastName: ['', [Validators.required, Validators.minLength(2)]],
      gender: ['', Validators.required],
      dateOfBirth: [''],
      placeOfBirth: [''],
      biography: ['']
    });
  }

  onSubmit(): void {
    if (this.memberForm.invalid) {
      return;
    }

    this.isLoading = true;
    const memberData: CreateMemberRequest = {
      ...this.memberForm.value,
      familyId: this.familyId
    };

    this.memberService.createMember(memberData).subscribe({
      next: (member) => {
        this.snackBar.open('Членът е добавен успешно!', 'OK', {
          duration: 3000,
          horizontalPosition: 'center',
          verticalPosition: 'top'
        });
        this.router.navigate(['/families', this.familyId]);
      },
      error: (error) => {
        console.error('Error creating member:', error);
        this.isLoading = false;
        
        let errorMessage = 'Грешка при добавяне на член';
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
    this.router.navigate(['/families', this.familyId]);
  }
}