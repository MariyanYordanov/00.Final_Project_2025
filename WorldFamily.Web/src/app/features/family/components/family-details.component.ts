import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { Subject, takeUntil } from 'rxjs';

import { FamilyService } from '../../../core/services/family.service';
import { MemberService } from '../../../core/services/member.service';
import { Family, FamilyMember } from '../../../core/models/family.interface';
import { RelativeDatePipe } from '../../../shared/pipes/relative-date.pipe';
import { FullNamePipe } from '../../../shared/pipes/full-name.pipe';
import { MemberAgePipe } from '../../../shared/pipes/member-age.pipe';

@Component({
  selector: 'app-family-details',
  standalone: true,
  imports: [
    CommonModule, 
    RouterLink,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    RelativeDatePipe,
    FullNamePipe,
    MemberAgePipe
  ],
  template: `
    <div class="details-container">
      <!-- Loading State -->
      <div *ngIf="isLoading" class="loading-container">
        <mat-spinner></mat-spinner>
        <p>Зареждане на семейство...</p>
      </div>

      <!-- Error State -->
      <div *ngIf="error" class="error-container">
        <mat-icon color="warn">error</mat-icon>
        <p>{{ error }}</p>
        <button mat-raised-button color="primary" (click)="loadFamily()">
          Опитайте отново
        </button>
      </div>

      <!-- Family Details -->
      <div *ngIf="family && !isLoading && !error">
        <div class="family-header">
          <button mat-button routerLink="/families" class="back-button">
            <mat-icon>arrow_back</mat-icon>
            Обратно към каталога
          </button>
          
          <mat-card class="family-card">
            <mat-card-header>
              <mat-card-title>{{ family.name }}</mat-card-title>
              <mat-card-subtitle>
                Създадено {{ family.createdAt | relativeDate }}
              </mat-card-subtitle>
            </mat-card-header>
            
            <mat-card-content>
              <p *ngIf="family.description" class="family-description">
                {{ family.description }}
              </p>
              
              <div class="family-info">
                <div class="info-item" *ngIf="family.location">
                  <mat-icon>location_on</mat-icon>
                  <span>{{ family.location }}</span>
                </div>
                
                <div class="info-item">
                  <mat-icon>people</mat-icon>
                  <span>{{ members.length }} членове</span>
                </div>
                
                <div class="info-item">
                  <mat-icon>{{ family.isPublic ? 'public' : 'lock' }}</mat-icon>
                  <span>{{ family.isPublic ? 'Публично' : 'Частно' }}</span>
                </div>
              </div>
            </mat-card-content>
          </mat-card>
        </div>

        <!-- Family Members -->
        <div class="members-section">
          <h2>Членове на семейството</h2>
          
          <div *ngIf="members.length === 0" class="empty-members">
            <mat-icon>person_add</mat-icon>
            <p>Няма добавени членове към това семейство</p>
          </div>
          
          <div class="members-grid" *ngIf="members.length > 0">
            <mat-card *ngFor="let member of members; trackBy: trackByMemberId" class="member-card">
              <mat-card-header>
                <mat-card-title>
                  {{ member.firstName | fullName:member.middleName:member.lastName }}
                </mat-card-title>
                <mat-card-subtitle>
                  {{ member.gender }}
                  <span *ngIf="member.dateOfBirth">
                    • {{ member.dateOfBirth | memberAge }}
                  </span>
                </mat-card-subtitle>
              </mat-card-header>
              
              <mat-card-content>
                <div class="member-info">
                  <div class="info-item" *ngIf="member.dateOfBirth">
                    <mat-icon>cake</mat-icon>
                    <span>{{ member.dateOfBirth | date:'dd.MM.yyyy' }}</span>
                  </div>
                  
                  <div class="info-item" *ngIf="member.placeOfBirth">
                    <mat-icon>place</mat-icon>
                    <span>{{ member.placeOfBirth }}</span>
                  </div>
                </div>
                
                <p *ngIf="member.biography" class="member-bio">
                  {{ member.biography | slice:0:100 }}
                  <span *ngIf="member.biography.length > 100">...</span>
                </p>
              </mat-card-content>
              
              <mat-card-actions>
                <button mat-button 
                        color="primary" 
                        [routerLink]="['/members', member.id]">
                  <mat-icon>visibility</mat-icon>
                  Детайли
                </button>
              </mat-card-actions>
            </mat-card>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .details-container {
      padding: 24px;
      max-width: 1200px;
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

    .family-card {
      margin-bottom: 32px;
    }

    .family-description {
      font-size: 1.1rem;
      line-height: 1.6;
      margin-bottom: 16px;
      color: #666;
    }

    .family-info {
      display: flex;
      flex-wrap: wrap;
      gap: 16px;
    }

    .info-item {
      display: flex;
      align-items: center;
      gap: 8px;
      color: #666;
    }

    .info-item mat-icon {
      font-size: 20px;
      height: 20px;
      width: 20px;
    }

    .members-section h2 {
      margin-bottom: 24px;
      color: #333;
    }

    .empty-members {
      text-align: center;
      padding: 48px 24px;
      color: #666;
    }

    .empty-members mat-icon {
      font-size: 48px;
      height: 48px;
      width: 48px;
      margin-bottom: 16px;
    }

    .members-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
      gap: 24px;
    }

    .member-card {
      transition: transform 0.2s ease-in-out;
    }

    .member-card:hover {
      transform: translateY(-2px);
    }

    .member-info {
      display: flex;
      flex-direction: column;
      gap: 8px;
      margin-bottom: 12px;
    }

    .member-bio {
      color: #666;
      font-size: 0.9rem;
      line-height: 1.4;
    }

    /* Responsive Design */
    @media (max-width: 768px) {
      .details-container {
        padding: 16px;
      }
      
      .members-grid {
        grid-template-columns: 1fr;
        gap: 16px;
      }
      
      .family-info {
        flex-direction: column;
        gap: 12px;
      }
    }
  `]
})
export class FamilyDetailsComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();
  
  family: Family | null = null;
  members: FamilyMember[] = [];
  isLoading = true;
  error: string | null = null;
  familyId: number = 0;

  constructor(
    private route: ActivatedRoute,
    private familyService: FamilyService,
    private memberService: MemberService
  ) {}

  ngOnInit(): void {
    this.route.params.pipe(takeUntil(this.destroy$)).subscribe(params => {
      this.familyId = +params['id'];
      if (this.familyId) {
        this.loadFamily();
      } else {
        this.error = 'Невалиден идентификатор на семейство';
        this.isLoading = false;
      }
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadFamily(): void {
    this.isLoading = true;
    this.error = null;
    
    // Load family details
    this.familyService.getFamilyById(this.familyId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (family) => {
          this.family = family;
          this.loadMembers();
        },
        error: (err) => {
          this.isLoading = false;
          this.error = 'Семейството не е намерено или възникна грешка при зареждането.';
          console.error('Error loading family:', err);
        }
      });
  }

  private loadMembers(): void {
    this.memberService.getMembersByFamily(this.familyId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (members) => {
          this.members = members;
          this.isLoading = false;
        },
        error: (err) => {
          this.members = [];
          this.isLoading = false;
          console.error('Error loading members:', err);
        }
      });
  }

  trackByMemberId(index: number, member: FamilyMember): number {
    return member.id;
  }
}