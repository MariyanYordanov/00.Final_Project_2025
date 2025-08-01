import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { FamilyMember, RelationshipType, CreateRelationshipRequest } from '../../../core/models/family.interface';
import { RelationshipService } from '../../../core/services/relationship.service';

export interface RelationshipDialogData {
  member1: FamilyMember;
  familyMembers: FamilyMember[];
}

@Component({
  selector: 'app-add-relationship',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatButtonModule,
    MatIconModule,
    MatSelectModule,
    MatFormFieldModule
  ],
  template: `
    <h2 mat-dialog-title>Добави роднинска връзка</h2>
    <mat-dialog-content>
      <form [formGroup]="relationshipForm">
        <p class="info-text">
          Определете връзката на <strong>{{ data.member1.firstName }} {{ data.member1.lastName }}</strong> с друг член на семейството:
        </p>
        
        <mat-form-field appearance="fill" class="full-width">
          <mat-label>{{ data.member1.firstName }} е...</mat-label>
          <mat-select formControlName="relationshipType" required>
            <mat-option [value]="RelationshipType.Parent">родител на</mat-option>
            <mat-option [value]="RelationshipType.Child">дете на</mat-option>
            <mat-option [value]="RelationshipType.Spouse">съпруг/съпруга на</mat-option>
            <mat-option [value]="RelationshipType.Sibling">брат/сестра на</mat-option>
            <mat-option [value]="RelationshipType.Grandparent">баба/дядо на</mat-option>
            <mat-option [value]="RelationshipType.Grandchild">внук/внучка на</mat-option>
            <mat-option [value]="RelationshipType.Uncle">чичо/вуйчо на</mat-option>
            <mat-option [value]="RelationshipType.Aunt">леля на</mat-option>
            <mat-option [value]="RelationshipType.Cousin">братовчед/братовчедка на</mat-option>
          </mat-select>
        </mat-form-field>

        <mat-form-field appearance="fill" class="full-width">
          <mat-label>Изберете роднина</mat-label>
          <mat-select formControlName="member2Id" required>
            <mat-option *ngFor="let member of availableMembers" [value]="member.id">
              {{ member.firstName }} {{ member.middleName }} {{ member.lastName }}
            </mat-option>
          </mat-select>
        </mat-form-field>

        <mat-form-field appearance="fill" class="full-width">
          <mat-label>Бележки (по избор)</mat-label>
          <textarea matInput 
                    formControlName="notes" 
                    rows="2"
                    placeholder="Допълнителна информация за връзката..."></textarea>
        </mat-form-field>
      </form>
    </mat-dialog-content>
    <mat-dialog-actions align="end">
      <button mat-button (click)="onCancel()">Отказ</button>
      <button mat-raised-button 
              color="primary" 
              [disabled]="relationshipForm.invalid"
              (click)="onSave()">
        Запази връзката
      </button>
    </mat-dialog-actions>
  `,
  styles: [`
    mat-dialog-content {
      min-width: 400px;
    }

    .info-text {
      margin-bottom: 20px;
      color: #666;
    }

    .full-width {
      width: 100%;
      margin-bottom: 16px;
    }

    .note {
      display: flex;
      align-items: flex-start;
      gap: 12px;
      background-color: #e3f2fd;
      padding: 12px;
      border-radius: 8px;
      margin-top: 16px;
    }

    .note mat-icon {
      color: #1976d2;
      margin-top: 2px;
    }

    .note p {
      margin: 0;
      color: #666;
      font-size: 0.9rem;
    }
  `]
})
export class AddRelationshipComponent {
  relationshipForm: FormGroup;
  availableMembers: FamilyMember[] = [];
  RelationshipType = RelationshipType; // Make enum available in template

  constructor(
    private fb: FormBuilder,
    private relationshipService: RelationshipService,
    public dialogRef: MatDialogRef<AddRelationshipComponent>,
    @Inject(MAT_DIALOG_DATA) public data: RelationshipDialogData
  ) {
    this.availableMembers = data.familyMembers.filter(m => m.id !== data.member1.id);
    
    this.relationshipForm = this.fb.group({
      relationshipType: ['', Validators.required],
      member2Id: ['', Validators.required],
      notes: ['']
    });
  }

  onCancel(): void {
    this.dialogRef.close();
  }

  onSave(): void {
    if (this.relationshipForm.valid) {
      const relationshipData: CreateRelationshipRequest = {
        primaryMemberId: this.data.member1.id,
        relatedMemberId: this.relationshipForm.value.member2Id,
        relationshipType: this.relationshipForm.value.relationshipType,
        notes: this.relationshipForm.value.notes || undefined
      };

      this.relationshipService.createRelationship(relationshipData).subscribe({
        next: (relationship) => {
          this.dialogRef.close({
            success: true,
            relationship: relationship
          });
        },
        error: (error) => {
          console.error('Error creating relationship:', error);
          this.dialogRef.close({
            success: false,
            error: error
          });
        }
      });
    }
  }
}