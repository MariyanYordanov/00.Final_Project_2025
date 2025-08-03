import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { Subject, takeUntil } from 'rxjs';

import { MemberService } from '../../../core/services/member.service';
import { FamilyMember } from '../../../core/models/family.interface';
import { FullNamePipe } from '../../../shared/pipes/full-name.pipe';
import { MemberAgePipe } from '../../../shared/pipes/member-age.pipe';

@Component({
  selector: 'app-member-details',
  standalone: true,
  imports: [
    CommonModule, 
    RouterLink,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    FullNamePipe,
    MemberAgePipe
  ],
  template: `
    <div class="details-container">
      <!-- Loading State -->
      <div *ngIf="isLoading" class="loading-container">
        <mat-spinner></mat-spinner>
        <p>Зареждане на член...</p>
      </div>

      <!-- Error State -->
      <div *ngIf="error" class="error-container">
        <mat-icon color="warn">error</mat-icon>
        <p>{{ error }}</p>
        <button mat-raised-button color="primary" (click)="loadMember()">
          Опитайте отново
        </button>
      </div>

      <!-- Member Details -->
      <div *ngIf="member && !isLoading && !error">
        <div class="member-header">
          <button mat-button [routerLink]="['/families', member.familyId]" class="back-button">
            <mat-icon>arrow_back</mat-icon>
            Обратно към семейството
          </button>
          
          <mat-card class="member-card">
            <mat-card-header>
              <mat-card-title>
                {{ member.firstName | fullName:member.middleName:member.lastName }}
              </mat-card-title>
              <mat-card-subtitle>
                Член на {{ member.familyName }}
              </mat-card-subtitle>
            </mat-card-header>
            
            <mat-card-content>
              <div class="member-details">
                <div class="detail-section" *ngIf="member.gender">
                  <div class="detail-item">
                    <mat-icon>person</mat-icon>
                    <span class="label">Пол:</span>
                    <span class="value">{{ member.gender === 'Male' ? 'Мъж' : 'Жена' }}</span>
                  </div>
                </div>

                <div class="detail-section" *ngIf="member.dateOfBirth">
                  <div class="detail-item">
                    <mat-icon>cake</mat-icon>
                    <span class="label">Дата на раждане:</span>
                    <span class="value">{{ member.dateOfBirth | date:'dd.MM.yyyy' }}</span>
                  </div>
                  
                  <div class="detail-item">
                    <mat-icon>schedule</mat-icon>
                    <span class="label">Възраст:</span>
                    <span class="value">{{ member.dateOfBirth | memberAge }}</span>
                  </div>
                </div>

                <div class="detail-section" *ngIf="member.placeOfBirth">
                  <div class="detail-item">
                    <mat-icon>place</mat-icon>
                    <span class="label">Място на раждане:</span>
                    <span class="value">{{ member.placeOfBirth }}</span>
                  </div>
                </div>

                <div class="detail-section" *ngIf="member.dateOfDeath">
                  <div class="detail-item">
                    <mat-icon>event_busy</mat-icon>
                    <span class="label">Дата на смърт:</span>
                    <span class="value">{{ member.dateOfDeath | date:'dd.MM.yyyy' }}</span>
                  </div>
                  
                  <div class="detail-item" *ngIf="member.placeOfDeath">
                    <mat-icon>place</mat-icon>
                    <span class="label">Място на смърт:</span>
                    <span class="value">{{ member.placeOfDeath }}</span>
                  </div>
                </div>

                <!-- Relationships Section -->
                <div class="relationships-section">
                  <h3><mat-icon>family_restroom</mat-icon> Роднински връзки</h3>
                  <div class="relationship-hint">
                    <mat-icon>info</mat-icon>
                    <p>Роднинските връзки ще бъдат добавени в следваща версия. Засега можете да видите всички членове на семейството.</p>
                    <button mat-stroked-button color="primary" [routerLink]="['/families', member.familyId]">
                      <mat-icon>people</mat-icon>
                      Виж всички членове
                    </button>
                  </div>
                </div>

                <div class="biography-section" *ngIf="member.biography">
                  <h3><mat-icon>auto_stories</mat-icon> Биография</h3>
                  <p class="biography-text">{{ member.biography }}</p>
                </div>
              </div>
            </mat-card-content>
            
            <mat-card-actions>
              <button mat-button color="primary" [routerLink]="['/families', member.familyId]">
                <mat-icon>family_restroom</mat-icon>
                Виж семейството
              </button>
            </mat-card-actions>
          </mat-card>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .details-container {
      padding: 24px;
      max-width: 800px;
      margin: 0 auto;
    }

    .loading-container, .error-container {
      text-align: center;
      padding: 48px 24px;
    }

    .loading-container mat-spinner {
      margin: 0 auto 16px;
    }

    .error-container mat-icon {
      font-size: 48px;
      height: 48px;
      width: 48px;
      margin-bottom: 16px;
    }

    .back-button {
      margin-bottom: 16px;
    }

    .member-card {
      margin-bottom: 32px;
    }

    .member-details {
      display: flex;
      flex-direction: column;
      gap: 24px;
    }

    .detail-section {
      border-left: 4px solid #1976d2;
      padding-left: 16px;
      display: flex;
      flex-direction: column;
      gap: 12px;
    }

    .detail-item {
      display: flex;
      align-items: center;
      gap: 12px;
    }

    .detail-item mat-icon {
      font-size: 20px;
      height: 20px;
      width: 20px;
      color: #666;
    }

    .label {
      font-weight: 500;
      color: #333;
      min-width: 120px;
    }

    .value {
      color: #666;
    }

    .relationships-section {
      background-color: #e8f5e8;
      padding: 16px;
      border-radius: 8px;
      border: 1px solid #4caf50;
    }

    .relationships-section h3 {
      display: flex;
      align-items: center;
      gap: 8px;
      margin: 0 0 12px 0;
      color: #333;
    }

    .relationship-hint {
      display: flex;
      flex-direction: column;
      align-items: center;
      text-align: center;
      gap: 12px;
    }

    .relationship-hint mat-icon {
      color: #4caf50;
      font-size: 24px;
      height: 24px;
      width: 24px;
    }

    .relationship-hint p {
      margin: 0;
      color: #666;
      line-height: 1.4;
    }

    .biography-section {
      background-color: #f5f5f5;
      padding: 16px;
      border-radius: 8px;
    }

    .biography-section h3 {
      display: flex;
      align-items: center;
      gap: 8px;
      margin: 0 0 12px 0;
      color: #333;
    }

    .biography-text {
      line-height: 1.6;
      color: #666;
      margin: 0;
    }

    /* Responsive Design */
    @media (max-width: 768px) {
      .details-container {
        padding: 16px;
      }
      
      .detail-item {
        flex-direction: column;
        align-items: flex-start;
        gap: 4px;
      }
      
      .label {
        min-width: auto;
      }
    }
  `]
})
export class MemberDetailsComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();
  
  member: FamilyMember | null = null;
  isLoading = true;
  error: string | null = null;
  memberId: number = 0;

  constructor(
    private route: ActivatedRoute,
    private memberService: MemberService
  ) {}

  ngOnInit(): void {
    this.route.params.pipe(takeUntil(this.destroy$)).subscribe(params => {
      this.memberId = +params['id'];
      if (this.memberId) {
        this.loadMember();
      } else {
        this.error = 'Невалиден идентификатор на член';
        this.isLoading = false;
      }
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadMember(): void {
    this.isLoading = true;
    this.error = null;
    
    this.memberService.getMemberById(this.memberId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (member) => {
          this.member = member;
          this.isLoading = false;
        },
        error: (err) => {
          this.isLoading = false;
          this.error = 'Членът не е намерен или възникна грешка при зареждането.';
          console.error('Error loading member:', err);
        }
      });
  }
}