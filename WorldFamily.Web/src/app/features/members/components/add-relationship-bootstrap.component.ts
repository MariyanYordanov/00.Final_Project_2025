import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { FamilyMember, RelationshipType, CreateRelationshipRequest } from '../../../core/models/family.interface';
import { RelationshipService } from '../../../core/services/relationship.service';
import { finalize } from 'rxjs';

@Component({
  selector: 'app-add-relationship-bootstrap',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <!-- Modal -->
    <div class="modal fade" [id]="modalId" tabindex="-1" [attr.aria-labelledby]="modalId + 'Label'" aria-hidden="true">
      <div class="modal-dialog modal-lg">
        <div class="modal-content">
          <!-- Modal Header -->
          <div class="modal-header bg-primary text-white">
            <h5 class="modal-title" [id]="modalId + 'Label'">
              <i class="fas fa-link me-2"></i>
              Добави роднинска връзка
            </h5>
            <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal" aria-label="Close"></button>
          </div>

          <!-- Modal Body -->
          <div class="modal-body">
            <form [formGroup]="relationshipForm" (ngSubmit)="onSubmit()">
              <!-- Info Section -->
              <div class="alert alert-info d-flex align-items-start mb-4">
                <i class="fas fa-info-circle me-3 mt-1"></i>
                <div>
                  <strong>Определете връзката</strong>
                  <p class="mb-0 mt-1">
                    Изберете как се свързва <strong>{{ member1?.firstName }} {{ member1?.lastName }}</strong> 
                    с друг член от семейството.
                  </p>
                </div>
              </div>

              <!-- Relationship Type Selection -->
              <div class="mb-4">
                <label class="form-label fw-bold">
                  <i class="fas fa-users me-2"></i>
                  {{ member1?.firstName }} е...
                </label>
                <select class="form-select form-select-lg" formControlName="relationshipType" required>
                  <option value="">Изберете връзка</option>
                  <option [value]="RelationshipType.Parent">родител на</option>
                  <option [value]="RelationshipType.Child">дете на</option>
                  <option [value]="RelationshipType.Spouse">съпруг/съпруга на</option>
                  <option [value]="RelationshipType.Sibling">брат/сестра на</option>
                  <option [value]="RelationshipType.Grandparent">баба/дядо на</option>
                  <option [value]="RelationshipType.Grandchild">внук/внучка на</option>
                  <option [value]="RelationshipType.Uncle">чичо/вуйчо на</option>
                  <option [value]="RelationshipType.Aunt">леля на</option>
                  <option [value]="RelationshipType.Nephew">племенник на</option>
                  <option [value]="RelationshipType.Niece">племенница на</option>
                  <option [value]="RelationshipType.Cousin">братовчед/братовчедка на</option>
                  <option [value]="RelationshipType.StepParent">доведен родител на</option>
                  <option [value]="RelationshipType.StepChild">доведено дете на</option>
                  <option [value]="RelationshipType.Other">друго</option>
                </select>
                <div class="invalid-feedback" 
                     *ngIf="relationshipForm.get('relationshipType')?.invalid && relationshipForm.get('relationshipType')?.touched">
                  Моля изберете тип връзка.
                </div>
              </div>

              <!-- Related Member Selection -->
              <div class="mb-4">
                <label class="form-label fw-bold">
                  <i class="fas fa-user me-2"></i>
                  Роднина
                </label>
                <select class="form-select form-select-lg" formControlName="relatedMemberId" required>
                  <option value="">Изберете роднина</option>
                  <option *ngFor="let member of availableMembers" [value]="member.id">
                    {{ member.firstName }} {{ member.middleName }} {{ member.lastName }}
                    <span class="text-muted">({{ member.gender === 'Male' ? 'Мъж' : 'Жена' }})</span>
                  </option>
                </select>
                <div class="invalid-feedback" 
                     *ngIf="relationshipForm.get('relatedMemberId')?.invalid && relationshipForm.get('relatedMemberId')?.touched">
                  Моля изберете роднина.
                </div>
              </div>

              <!-- Notes (Optional) -->
              <div class="mb-4">
                <label class="form-label">
                  <i class="fas fa-sticky-note me-2"></i>
                  Бележки (по избор)
                </label>
                <textarea 
                  class="form-control" 
                  formControlName="notes" 
                  rows="3" 
                  placeholder="Допълнителна информация за връзката...">
                </textarea>
              </div>

              <!-- Error Message -->
              <div class="alert alert-danger d-flex align-items-center" *ngIf="errorMessage">
                <i class="fas fa-exclamation-triangle me-2"></i>
                {{ errorMessage }}
              </div>

              <!-- Success Message -->
              <div class="alert alert-success d-flex align-items-center" *ngIf="successMessage">
                <i class="fas fa-check-circle me-2"></i>
                {{ successMessage }}
              </div>
            </form>
          </div>

          <!-- Modal Footer -->
          <div class="modal-footer">
            <button type="button" class="btn btn-outline-secondary" data-bs-dismiss="modal" [disabled]="isLoading">
              <i class="fas fa-times me-1"></i>
              Отказ
            </button>
            <button 
              type="button" 
              class="btn btn-primary" 
              (click)="onSubmit()"
              [disabled]="relationshipForm.invalid || isLoading">
              <span *ngIf="isLoading" class="spinner-border spinner-border-sm me-2" role="status"></span>
              <i *ngIf="!isLoading" class="fas fa-plus me-1"></i>
              {{ isLoading ? 'Добавяне...' : 'Добави връзка' }}
            </button>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .modal-content {
      border-radius: 1rem;
      border: none;
      box-shadow: 0 1rem 3rem rgba(0,0,0,0.175);
    }

    .modal-header {
      border-radius: 1rem 1rem 0 0;
      padding: 1.5rem;
    }

    .modal-body {
      padding: 2rem;
    }

    .modal-footer {
      padding: 1.5rem;
      border-top: 1px solid #dee2e6;
    }

    .form-select, .form-control {
      border-radius: 0.75rem;
      border: 2px solid #e9ecef;
      padding: 0.75rem 1rem;
      transition: border-color 0.15s ease-in-out, box-shadow 0.15s ease-in-out;
    }

    .form-select:focus, .form-control:focus {
      border-color: #0d6efd;
      box-shadow: 0 0 0 0.25rem rgba(13, 110, 253, 0.25);
    }

    .form-label {
      color: #495057;
      margin-bottom: 0.75rem;
    }

    .alert {
      border-radius: 0.75rem;
      border: none;
    }

    .btn {
      border-radius: 0.5rem;
      padding: 0.75rem 1.5rem;
      font-weight: 500;
    }

    .btn-primary {
      background: linear-gradient(45deg, #0d6efd, #6610f2);
      border: none;
    }

    .btn-primary:hover {
      background: linear-gradient(45deg, #0b5ed7, #5a0fcf);
      transform: translateY(-1px);
    }

    .spinner-border-sm {
      width: 1rem;
      height: 1rem;
    }

    .invalid-feedback {
      display: block;
    }

    .form-select.is-invalid, .form-control.is-invalid {
      border-color: #dc3545;
    }
  `]
})
export class AddRelationshipBootstrapComponent {
  @Input() member1: FamilyMember | null = null;
  @Input() familyMembers: FamilyMember[] = [];
  @Input() modalId: string = 'addRelationshipModal';
  @Output() relationshipAdded = new EventEmitter<void>();
  @Output() relationshipError = new EventEmitter<string>();

  relationshipForm: FormGroup;
  isLoading = false;
  errorMessage = '';
  successMessage = '';
  RelationshipType = RelationshipType;

  constructor(
    private fb: FormBuilder,
    private relationshipService: RelationshipService
  ) {
    this.relationshipForm = this.fb.group({
      relationshipType: ['', Validators.required],
      relatedMemberId: ['', Validators.required],
      notes: ['']
    });
  }

  get availableMembers(): FamilyMember[] {
    return this.familyMembers.filter(m => m.id !== this.member1?.id);
  }

  onSubmit(): void {
    if (this.relationshipForm.invalid || !this.member1) {
      this.markFormGroupTouched();
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';
    this.successMessage = '';

    const formValue = this.relationshipForm.value;
    const relationshipData: CreateRelationshipRequest = {
      primaryMemberId: this.member1.id,
      relatedMemberId: parseInt(formValue.relatedMemberId),
      relationshipType: formValue.relationshipType,
      notes: formValue.notes || undefined
    };

    this.relationshipService.createRelationship(relationshipData)
      .pipe(finalize(() => this.isLoading = false))
      .subscribe({
        next: (relationship) => {
          this.successMessage = 'Роднинската връзка е добавена успешно!';
          this.relationshipForm.reset();
          
          // Close modal after 2 seconds
          setTimeout(() => {
            this.closeModal();
            this.relationshipAdded.emit();
          }, 2000);
        },
        error: (error) => {
          console.error('Error creating relationship:', error);
          this.errorMessage = error.error?.message || 'Грешка при добавяне на връзката. Моля опитайте отново.';
          this.relationshipError.emit(this.errorMessage);
        }
      });
  }

  private markFormGroupTouched(): void {
    Object.keys(this.relationshipForm.controls).forEach(field => {
      const control = this.relationshipForm.get(field);
      control?.markAsTouched({ onlySelf: true });
    });
  }

  private closeModal(): void {
    // Get modal element and hide it
    const modalElement = document.getElementById(this.modalId);
    if (modalElement) {
      const modal = (window as any).bootstrap?.Modal?.getInstance(modalElement);
      if (modal) {
        modal.hide();
      }
    }
  }

  resetForm(): void {
    this.relationshipForm.reset();
    this.errorMessage = '';
    this.successMessage = '';
    this.isLoading = false;
  }
}