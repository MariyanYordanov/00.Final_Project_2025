import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTabsModule } from '@angular/material/tabs';
import { MatChipsModule } from '@angular/material/chips';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { Subject, takeUntil, forkJoin } from 'rxjs';
import { MatSnackBar } from '@angular/material/snack-bar';

import { FamilyService } from '../../../core/services/family.service';
import { MemberService } from '../../../core/services/member.service';
import { AuthService } from '../../../core/services/auth.service';
import { RelationshipService } from '../../../core/services/relationship.service';
import { Family, FamilyMember, Relationship, RelationshipType } from '../../../core/models/family.interface';
import { FullNamePipe } from '../../../shared/pipes/full-name.pipe';
import { MemberAgePipe } from '../../../shared/pipes/member-age.pipe';

@Component({
  selector: 'app-my-members',
  standalone: true,
  imports: [
    CommonModule, 
    RouterLink,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatTabsModule,
    MatChipsModule,
    MatTooltipModule,
    MatDialogModule,
    MatSnackBarModule,
    FullNamePipe,
    MemberAgePipe
  ],
  template: `
    <div class="members-container">
      <div class="header">
        <h1>
          <mat-icon>people</mat-icon>
          Моите роднини
        </h1>
        <p class="subtitle">Всички роднини от семействата в системата</p>
        <div class="warning-banner">
          <mat-icon>info</mat-icon>
          <div>
            <strong>Роднинските връзки все още се разработват!</strong>
            <p>В момента можете да видите всички членове на семействата, но връзките между тях (кой на кого какъв роднина е) ще бъдат добавени скоро.</p>
          </div>
        </div>
      </div>

      <!-- Loading State -->
      <div *ngIf="isLoading" class="loading-container">
        <mat-spinner></mat-spinner>
        <p>Зареждане на роднини...</p>
      </div>

      <!-- Error State -->
      <div *ngIf="error" class="error-container">
        <mat-icon color="warn">error</mat-icon>
        <p>{{ error }}</p>
        <button mat-raised-button color="primary" (click)="loadMyMembers()">
          Опитайте отново
        </button>
      </div>

      <!-- Members Content -->
      <div *ngIf="!isLoading && !error">
        <!-- No Members -->
        <div *ngIf="familyMembers.length === 0" class="empty-state">
          <mat-icon>person_add</mat-icon>
          <h3>Няма роднини</h3>
          <p>Все още няма добавени роднини в семействата.</p>
          <button mat-raised-button color="primary" routerLink="/families">
            <mat-icon>family_restroom</mat-icon>
            Разгледай семейства
          </button>
        </div>

        <!-- Members by Family -->
        <div *ngIf="familyMembers.length > 0">
          <mat-tab-group>
            <mat-tab *ngFor="let familyGroup of familyMembers" [label]="familyGroup.family.name">
              <div class="family-section">
                <div class="family-info">
                  <h3>{{ familyGroup.family.name }}</h3>
                  <p>{{ familyGroup.members.length }} {{ familyGroup.members.length === 1 ? 'роднина' : 'роднини' }}</p>
                </div>

                <div class="members-grid">
                  <mat-card *ngFor="let member of familyGroup.members; trackBy: trackByMemberId" class="member-card">
                    <mat-card-header>
                      <mat-card-title>
                        {{ member.firstName | fullName:member.middleName:member.lastName }}
                      </mat-card-title>
                      <mat-card-subtitle>
                        {{ member.gender === 'Male' ? 'Мъж' : 'Жена' }}
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

                        <!-- Relationship info -->
                        <div class="relationship-section">
                          <mat-chip-set>
                            <ng-container *ngIf="getRelationshipsForMember(member).length > 0; else noRelationships">
                              <mat-chip *ngFor="let rel of getRelationshipsForMember(member)" 
                                       color="primary" 
                                       highlighted
                                       [matTooltip]="rel.notes || ''">
                                <mat-icon>family_restroom</mat-icon>
                                {{ getRelationshipDisplayText(rel) }}
                              </mat-chip>
                            </ng-container>
                            <ng-template #noRelationships>
                              <mat-chip color="warn" highlighted 
                                       matTooltip="Кликнете 'Добави връзка' за да определите роднинската връзка">
                                <mat-icon>help_outline</mat-icon>
                                Връзка неизвестна
                              </mat-chip>
                            </ng-template>
                          </mat-chip-set>
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
                      <button mat-button 
                              (click)="openRelationshipDialog(member, familyGroup.members)">
                        <mat-icon>link</mat-icon>
                        Добави връзка
                      </button>
                    </mat-card-actions>
                  </mat-card>
                </div>
              </div>
            </mat-tab>
          </mat-tab-group>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .members-container {
      padding: 24px;
      max-width: 1200px;
      margin: 0 auto;
    }

    .header {
      text-align: center;
      margin-bottom: 32px;
    }

    .header h1 {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 12px;
      margin: 0 0 8px 0;
      font-size: 2rem;
      color: #333;
    }

    .subtitle {
      color: #666;
      font-size: 1.1rem;
      margin: 0;
    }

    .warning-banner {
      display: flex;
      align-items: flex-start;
      gap: 16px;
      background-color: #fff8e1;
      border: 1px solid #ffc107;
      border-radius: 8px;
      padding: 16px;
      margin-top: 24px;
      max-width: 800px;
      margin-left: auto;
      margin-right: auto;
    }

    .warning-banner mat-icon {
      color: #f57c00;
      font-size: 28px;
      height: 28px;
      width: 28px;
    }

    .warning-banner strong {
      color: #e65100;
      display: block;
      margin-bottom: 4px;
    }

    .warning-banner p {
      margin: 0;
      color: #666;
      font-size: 0.95rem;
      line-height: 1.4;
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

    .empty-state {
      text-align: center;
      padding: 64px 24px;
      color: #666;
    }

    .empty-state mat-icon {
      font-size: 64px;
      height: 64px;
      width: 64px;
      margin-bottom: 16px;
      color: #ccc;
    }

    .empty-state h3 {
      margin: 16px 0 8px 0;
      color: #333;
    }

    .family-section {
      padding: 24px 0;
    }

    .family-info {
      margin-bottom: 24px;
      text-align: center;
    }

    .family-info h3 {
      margin: 0 0 8px 0;
      color: #333;
    }

    .family-info p {
      margin: 0;
      color: #666;
    }

    .members-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
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

    .info-item {
      display: flex;
      align-items: center;
      gap: 8px;
      color: #666;
    }

    .info-item mat-icon {
      font-size: 18px;
      height: 18px;
      width: 18px;
    }

    .relationship-section {
      margin-top: 12px;
      padding-top: 12px;
      border-top: 1px solid #e0e0e0;
    }

    .relationship-section mat-chip {
      font-size: 0.875rem;
    }

    .relationship-section mat-icon {
      font-size: 16px;
      height: 16px;
      width: 16px;
      margin-right: 4px;
    }

    .member-bio {
      color: #666;
      font-size: 0.9rem;
      line-height: 1.4;
      margin: 8px 0 0 0;
    }

    /* Responsive Design */
    @media (max-width: 768px) {
      .members-container {
        padding: 16px;
      }
      
      .members-grid {
        grid-template-columns: 1fr;
        gap: 16px;
      }
      
      .header h1 {
        font-size: 1.5rem;
      }
    }

    /* Global styles for snackbars - note: these need to be global */
    :host ::ng-deep .success-snackbar {
      background-color: #4caf50 !important;
      color: white !important;
    }

    :host ::ng-deep .error-snackbar {
      background-color: #f44336 !important;
      color: white !important;
    }
  `]
})
export class MyMembersComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();
  
  familyMembers: { family: Family, members: FamilyMember[] }[] = [];
  relationships: Relationship[] = [];
  isLoading = true;
  error: string | null = null;
  currentUserId: string | null = null;

  constructor(
    private familyService: FamilyService,
    private memberService: MemberService,
    private authService: AuthService,
    private relationshipService: RelationshipService,
    private dialog: MatDialog,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    const currentUser = this.authService.getCurrentUser();
    this.currentUserId = currentUser?.id || null;
    this.loadMyMembers();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadMyMembers(): void {
    this.isLoading = true;
    this.error = null;
    
    // Get all families first
    this.familyService.getFamilies()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (families) => {
          if (families.length === 0) {
            this.familyMembers = [];
            this.isLoading = false;
            return;
          }

          // Get members for each family
          const memberRequests = families.map(family =>
            this.memberService.getMembersByFamily(family.id).pipe(
              takeUntil(this.destroy$)
            )
          );

          forkJoin(memberRequests).subscribe({
            next: (allMembers) => {
              // Show all families with members
              this.familyMembers = families
                .map((family, index) => ({
                  family,
                  members: allMembers[index] || []
                }))
                .filter(group => group.members.length > 0);
              
              // Load relationships after members are loaded
              this.loadRelationships();
            },
            error: (err) => {
              this.error = 'Грешка при зареждане на роднини';
              this.isLoading = false;
              console.error('Error loading members:', err);
            }
          });
        },
        error: (err) => {
          this.error = 'Грешка при зареждане на семейства';
          this.isLoading = false;
          console.error('Error loading families:', err);
        }
      });
  }

  isCurrentUser(member: FamilyMember): boolean {
    // This would need to be implemented based on how you link users to family members
    // For now, we'll check if the member was added by the current user
    return false; // Placeholder - implement based on your user-member relationship
  }

  trackByMemberId(index: number, member: FamilyMember): number {
    return member.id;
  }

  loadRelationships(): void {
    // Load all relationships for the families
    const familyIds = this.familyMembers.map(group => group.family.id);
    const relationshipRequests = familyIds.map(familyId =>
      this.relationshipService.getRelationshipsByFamily(familyId)
    );

    if (relationshipRequests.length > 0) {
      forkJoin(relationshipRequests).subscribe({
        next: (allRelationships) => {
          this.relationships = allRelationships.flat();
          this.isLoading = false;
        },
        error: (err) => {
          console.error('Error loading relationships:', err);
          this.isLoading = false;
        }
      });
    } else {
      this.isLoading = false;
    }
  }

  getRelationshipsForMember(member: FamilyMember): Relationship[] {
    return this.relationships.filter(
      rel => rel.primaryMemberId === member.id || rel.relatedMemberId === member.id
    );
  }

  getRelationshipDisplayText(relationship: Relationship): string {
    const relationshipNames: { [key in RelationshipType]: string } = {
      [RelationshipType.Parent]: 'Родител',
      [RelationshipType.Child]: 'Дете',
      [RelationshipType.Spouse]: 'Съпруг/а',
      [RelationshipType.Sibling]: 'Брат/Сестра',
      [RelationshipType.Grandparent]: 'Баба/Дядо',
      [RelationshipType.Grandchild]: 'Внук/Внучка',
      [RelationshipType.Uncle]: 'Чичо/Вуйчо',
      [RelationshipType.Aunt]: 'Леля',
      [RelationshipType.Nephew]: 'Племенник',
      [RelationshipType.Niece]: 'Племенница',
      [RelationshipType.Cousin]: 'Братовчед/ка',
      [RelationshipType.GreatGrandparent]: 'Прабаба/Прадядо',
      [RelationshipType.GreatGrandchild]: 'Правнук/ка',
      [RelationshipType.StepParent]: 'Доведен родител',
      [RelationshipType.StepChild]: 'Доведено дете',
      [RelationshipType.StepSibling]: 'Доведен брат/сестра',
      [RelationshipType.HalfSibling]: 'Полубрат/сестра',
      [RelationshipType.Other]: 'Друго'
    };

    const relName = relationshipNames[relationship.relationshipType] || 'Неизвестна връзка';
    const otherMemberName = relationship.primaryMemberName || relationship.relatedMemberName || 'Неизвестен';
    
    return `${relName} на ${otherMemberName}`;
  }

  openRelationshipDialog(member: FamilyMember, familyMembers: FamilyMember[]): void {
    import('./add-relationship.component').then(m => {
      const dialogRef = this.dialog.open(m.AddRelationshipComponent, {
        width: '500px',
        data: { member1: member, familyMembers: familyMembers }
      });

      dialogRef.afterClosed().subscribe(result => {
        if (result && result.success) {
          this.snackBar.open('Роднинската връзка е добавена успешно!', 'Затвори', {
            duration: 3000,
            panelClass: ['success-snackbar']
          });
          // Reload relationships to show the new one
          this.loadRelationships();
        } else if (result && result.error) {
          this.snackBar.open('Грешка при добавяне на връзката', 'Затвори', {
            duration: 3000,
            panelClass: ['error-snackbar']
          });
        }
      });
    });
  }
}