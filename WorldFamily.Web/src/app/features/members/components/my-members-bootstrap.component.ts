import { Component, OnInit, OnDestroy, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { Subject, takeUntil, forkJoin } from 'rxjs';

import { FamilyService } from '../../../core/services/family.service';
import { MemberService } from '../../../core/services/member.service';
import { AuthService } from '../../../core/services/auth.service';
import { RelationshipService } from '../../../core/services/relationship.service';
import { Family, FamilyMember, Relationship } from '../../../core/models/family.interface';
import { AddRelationshipBootstrapComponent } from './add-relationship-bootstrap.component';

@Component({
  selector: 'app-my-members-bootstrap',
  standalone: true,
  imports: [CommonModule, RouterLink, AddRelationshipBootstrapComponent],
  template: `
    <div class="container mt-4">
      <div class="row">
        <div class="col-12">
          <!-- Header -->
          <div class="text-center mb-4">
            <h1 class="display-4 text-primary mb-3">
              <i class="fas fa-users me-3"></i>Моите роднини
            </h1>
            <p class="lead text-muted">Всички роднини от семействата в системата</p>
            
            <!-- Info Card -->
            <div class="card border-0 bg-light mb-4">
              <div class="card-body text-center py-4">
                <i class="fas fa-users fa-3x text-primary mb-3"></i>
                <h4 class="text-primary">Добре дошли в семейната мрежа!</h4>
                <p class="text-muted mb-0">Разгледайте роднините от всички семейства и добавяйте нови връзки между тях.</p>
              </div>
            </div>
          </div>

          <!-- Loading State -->
          <div *ngIf="isLoading" class="text-center py-5">
            <div class="spinner-border text-primary" role="status">
              <span class="visually-hidden">Зареждане...</span>
            </div>
            <p class="mt-3 text-muted">Зареждане на роднини...</p>
          </div>

          <!-- Error State -->
          <div *ngIf="error" class="alert alert-danger text-center">
            <i class="fas fa-exclamation-triangle me-2"></i>
            {{ error }}
            <button class="btn btn-outline-danger mt-2 d-block mx-auto" (click)="loadMyMembers()">
              <i class="fas fa-redo me-1"></i>Опитайте отново
            </button>
          </div>

          <!-- Content -->
          <div *ngIf="!isLoading && !error">
            <!-- No Members -->
            <div *ngIf="familyMembers.length === 0" class="text-center py-5">
              <i class="fas fa-user-plus fa-4x text-muted mb-4"></i>
              <h3 class="text-muted">Няма роднини</h3>
              <p class="lead text-muted mb-4">Все още няма добавени роднини в семействата.</p>
              <a routerLink="/families" class="btn btn-primary btn-lg">
                <i class="fas fa-home me-2"></i>Разгледай семейства
              </a>
            </div>

            <!-- Family Tabs -->
            <div *ngIf="familyMembers.length > 0">
              <!-- Tab Navigation -->
              <ul class="nav nav-tabs nav-fill mb-4" id="familyTabs" role="tablist">
                <li class="nav-item" role="presentation" *ngFor="let familyGroup of familyMembers; let i = index">
                  <button 
                    class="nav-link"
                    [class.active]="i === 0"
                    [id]="'family-tab-' + i"
                    data-bs-toggle="tab"
                    [attr.data-bs-target]="'#family-' + i"
                    type="button"
                    role="tab">
                    <i class="fas fa-home me-2"></i>
                    {{ familyGroup.family.name }}
                    <span class="badge bg-secondary ms-2">{{ familyGroup.members.length }}</span>
                  </button>
                </li>
              </ul>

              <!-- Tab Content -->
              <div class="tab-content" id="familyTabsContent">
                <div 
                  *ngFor="let familyGroup of familyMembers; let i = index"
                  class="tab-pane fade"
                  [class.show]="i === 0"
                  [class.active]="i === 0"
                  [id]="'family-' + i"
                  role="tabpanel">
                  
                  <!-- Family Info -->
                  <div class="text-center mb-4">
                    <h3 class="text-primary">{{ familyGroup.family.name }}</h3>
                    <p class="text-muted">
                      {{ familyGroup.members.length }} 
                      {{ familyGroup.members.length === 1 ? 'роднина' : 'роднини' }}
                    </p>
                  </div>

                  <!-- Members Grid -->
                  <div class="row g-4">
                    <div class="col-lg-4 col-md-6" *ngFor="let member of familyGroup.members; trackBy: trackByMemberId; let memberIndex = index">
                      <div class="card h-100 shadow-sm member-card">
                        <!-- Card Header -->
                        <div class="card-header bg-light">
                          <h5 class="card-title mb-1">
                            {{ member.firstName }} {{ member.middleName }} {{ member.lastName }}
                          </h5>
                          <div class="d-flex align-items-center text-muted small">
                            <i class="fas me-1" [class.fa-mars]="member.gender === 'Male'" [class.fa-venus]="member.gender === 'Female'"></i>
                            <span class="me-2">{{ member.gender === 'Male' ? 'Мъж' : 'Жена' }}</span>
                            <span *ngIf="member.dateOfBirth && canViewBirthDate(familyGroup.family)" class="badge bg-secondary">
                              {{ getAge(member.dateOfBirth) }} год.
                            </span>
                          </div>
                        </div>

                        <!-- Card Body -->
                        <div class="card-body">
                          <!-- Member Info -->
                          <div class="mb-3">
                            <div class="d-flex align-items-center mb-2" *ngIf="member.dateOfBirth && canViewBirthDate(familyGroup.family)">
                              <i class="fas fa-birthday-cake text-warning me-2"></i>
                              <small class="text-muted">{{ member.dateOfBirth | date:'dd.MM.yyyy' }}</small>
                            </div>
                            
                            <div class="d-flex align-items-center mb-2" *ngIf="member.placeOfBirth">
                              <i class="fas fa-map-marker-alt text-danger me-2"></i>
                              <small class="text-muted">{{ member.placeOfBirth }}</small>
                            </div>
                          </div>

                          <!-- Relationship Status -->
                          <div class="mb-3">
                            <ng-container *ngIf="getGroupedRelationshipsForMember(member) | keyvalue; let groupedRels">
                              <div *ngIf="groupedRels.length > 0; else noRelationships" class="d-flex flex-column gap-2">
                                <div *ngFor="let group of groupedRels" class="relationship-group">
                                  <span class="badge bg-success">
                                    <i class="fas fa-users me-1"></i>
                                    {{ group.key }}: {{ group.value.join(', ') }}
                                  </span>
                                </div>
                              </div>
                            </ng-container>
                            <ng-template #noRelationships>
                              <div class="badge bg-warning text-dark">
                                <i class="fas fa-question-circle me-1"></i>
                                Връзка неизвестна
                              </div>
                            </ng-template>
                          </div>

                          <!-- Biography -->
                          <p *ngIf="member.biography" class="card-text text-muted small">
                            {{ member.biography | slice:0:100 }}
                            <span *ngIf="member.biography.length > 100">...</span>
                          </p>
                        </div>

                        <!-- Card Footer -->
                        <div class="card-footer bg-light d-flex gap-2">
                          <a [routerLink]="['/members', member.id]" class="btn btn-outline-primary btn-sm flex-fill">
                            <i class="fas fa-eye me-1"></i>Детайли
                          </a>
                          <button 
                            *ngIf="canManageFamily(familyGroup.family)"
                            class="btn btn-outline-success btn-sm flex-fill" 
                            data-bs-toggle="modal" 
                            data-bs-target="#addRelationshipModal"
                            (click)="selectMemberForRelationship(member, familyGroup.members)">
                            <i class="fas fa-link me-1"></i>Добави връзка
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Add Relationship Modal -->
    <app-add-relationship-bootstrap
      *ngIf="selectedMember"
      [member1]="selectedMember"
      [familyMembers]="selectedFamilyMembers"
      modalId="addRelationshipModal"
      (relationshipAdded)="onRelationshipAdded()"
      (relationshipError)="onRelationshipError($event)">
    </app-add-relationship-bootstrap>
  `,
  styles: [`
    .member-card {
      transition: transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out;
    }

    .member-card:hover {
      transform: translateY(-5px);
      box-shadow: 0 8px 25px rgba(0,0,0,0.15) !important;
    }

    .nav-tabs .nav-link {
      border-radius: 0.5rem 0.5rem 0 0;
      margin-bottom: -1px;
    }

    .nav-tabs .nav-link.active {
      background-color: var(--bs-primary);
      color: white;
      border-color: var(--bs-primary) var(--bs-primary) var(--bs-border-color);
    }

    .alert {
      border-radius: 0.75rem;
    }

    .card {
      border-radius: 0.75rem;
    }

    .card-header {
      border-radius: 0.75rem 0.75rem 0 0 !important;
    }

    .card-footer {
      border-radius: 0 0 0.75rem 0.75rem !important;
    }

    .badge {
      border-radius: 0.5rem;
    }

    .relationship-group .badge {
      display: block;
      width: 100%;
      text-align: left;
      font-size: 0.8rem;
      padding: 0.5rem 0.75rem;
      margin-bottom: 0.25rem;
    }

    .relationship-group .badge:last-child {
      margin-bottom: 0;
    }

    .btn {
      border-radius: 0.5rem;
    }

    .display-4 {
      font-weight: 600;
    }

    @media (max-width: 768px) {
      .container {
        padding: 0 15px;
      }
      
      .nav-tabs {
        flex-direction: column;
      }
      
      .nav-tabs .nav-link {
        text-align: center;
        margin-bottom: 2px;
        border-radius: 0.5rem;
      }
    }
  `]
})
export class MyMembersBootstrapComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();
  
  familyMembers: { family: Family, members: FamilyMember[] }[] = [];
  relationships: Relationship[] = [];
  isLoading = true;
  error: string | null = null;
  currentUserId: string | null = null;
  selectedMember: FamilyMember | null = null;
  selectedFamilyMembers: FamilyMember[] = [];

  constructor(
    private familyService: FamilyService,
    private memberService: MemberService,
    private authService: AuthService,
    private relationshipService: RelationshipService
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
    
    this.familyService.getFamilies()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (families) => {
          if (families.length === 0) {
            this.familyMembers = [];
            this.isLoading = false;
            return;
          }

          const memberRequests = families.map(family =>
            this.memberService.getMembersByFamily(family.id).pipe(
              takeUntil(this.destroy$)
            )
          );

          forkJoin(memberRequests).subscribe({
            next: (allMembers) => {
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

  trackByMemberId(index: number, member: FamilyMember): number {
    return member.id;
  }

  getAge(dateOfBirth: string | Date): number {
    const today = new Date();
    const birthDate = new Date(dateOfBirth);
    let age = today.getFullYear() - birthDate.getFullYear();
    const m = today.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
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

  getGroupedRelationshipsForMember(member: FamilyMember): { [key: string]: string[] } {
    const memberRelationships = this.getRelationshipsForMember(member);
    const grouped: { [key: string]: string[] } = {};

    memberRelationships.forEach(rel => {
      const relationshipType = this.getRelationshipTypeForMember(rel, member.id);
      const relatedPersonName = this.getRelatedPersonName(rel, member.id);
      
      if (relationshipType && relatedPersonName) {
        if (!grouped[relationshipType]) {
          grouped[relationshipType] = [];
        }
        grouped[relationshipType].push(relatedPersonName);
      }
    });

    return grouped;
  }

  private getRelationshipTypeForMember(relationship: Relationship, memberId: number): string {
    const relationshipNames: any = {
      1: 'Родител на',    // Parent
      2: 'Дете на',       // Child
      3: 'Съпруг/а на',   // Spouse
      4: 'Брат/Сестра на', // Sibling
      5: 'Баба/Дядо на',  // Grandparent
      6: 'Внук/Внучка на', // Grandchild
      7: 'Чичо/Вуйчо на', // Uncle
      8: 'Леля на',       // Aunt
      9: 'Племенник на',  // Nephew
      10: 'Племенница на', // Niece
      11: 'Братовчед/ка на', // Cousin
      12: 'Прабаба/Прадядо на', // GreatGrandparent
      13: 'Правнук/ка на', // GreatGrandchild
      14: 'Доведен родител на', // StepParent
      15: 'Доведено дете на', // StepChild
      16: 'Доведен брат/сестра на', // StepSibling
      17: 'Полубрат/сестра на', // HalfSibling
      99: 'Друго'      // Other
    };

    // If this member is the primary member, use the relationship type as is
    if (relationship.primaryMemberId === memberId) {
      return relationshipNames[relationship.relationshipType] || 'Неизвестна връзка';
    } else {
      // If this member is the related member, we need to get the reverse relationship
      return this.getReverseRelationshipName(relationship.relationshipType);
    }
  }

  private getReverseRelationshipName(type: number): string {
    const reverseNames: any = {
      1: 'Дете на',        // Parent -> Child
      2: 'Родител на',     // Child -> Parent  
      3: 'Съпруг/а на',    // Spouse -> Spouse
      4: 'Брат/Сестра на', // Sibling -> Sibling
      5: 'Внук/Внучка на', // Grandparent -> Grandchild
      6: 'Баба/Дядо на',   // Grandchild -> Grandparent
      7: 'Племенник/ца на', // Uncle -> Nephew/Niece
      8: 'Племенник/ца на', // Aunt -> Nephew/Niece
      9: 'Чичо/Вуйчо на',  // Nephew -> Uncle
      10: 'Леля на',       // Niece -> Aunt
      11: 'Братовчед/ка на', // Cousin -> Cousin
      12: 'Правнук/ка на', // GreatGrandparent -> GreatGrandchild
      13: 'Прабаба/Прадядо на', // GreatGrandchild -> GreatGrandparent
      14: 'Доведено дете на', // StepParent -> StepChild
      15: 'Доведен родител на', // StepChild -> StepParent
      16: 'Доведен брат/сестра на', // StepSibling -> StepSibling
      17: 'Полубрат/сестра на', // HalfSibling -> HalfSibling
      99: 'Друго'         // Other
    };

    return reverseNames[type] || 'Неизвестна връзка';
  }

  private getRelatedPersonName(relationship: Relationship, memberId: number): string {
    if (relationship.primaryMemberId === memberId) {
      return relationship.relatedMemberName || 'Неизвестен';
    } else {
      return relationship.primaryMemberName || 'Неизвестен';
    }
  }

  getRelationshipDisplayText(relationship: Relationship): string {
    const relationshipNames: any = {
      1: 'Родител',    // Parent
      2: 'Дете',       // Child
      3: 'Съпруг/а',   // Spouse
      4: 'Брат/Сестра', // Sibling
      5: 'Баба/Дядо',  // Grandparent
      6: 'Внук/Внучка', // Grandchild
      7: 'Чичо/Вуйчо', // Uncle
      8: 'Леля',       // Aunt
      9: 'Племенник',  // Nephew
      10: 'Племенница', // Niece
      11: 'Братовчед/ка', // Cousin
      12: 'Прабаба/Прадядо', // GreatGrandparent
      13: 'Правнук/ка', // GreatGrandchild
      14: 'Доведен родител', // StepParent
      15: 'Доведено дете', // StepChild
      16: 'Доведен брат/сестра', // StepSibling
      17: 'Полубрат/сестра', // HalfSibling
      99: 'Друго'      // Other
    };

    return relationshipNames[relationship.relationshipType] || 'Неизвестна връзка';
  }

  selectMemberForRelationship(member: FamilyMember, familyMembers: FamilyMember[]): void {
    this.selectedMember = member;
    this.selectedFamilyMembers = familyMembers;
  }

  onRelationshipAdded(): void {
    // Reload relationships to show the new one
    this.loadRelationships();
    console.log('Relationship added successfully');
  }

  onRelationshipError(error: string): void {
    console.error('Relationship error:', error);
    alert('Грешка при добавяне на връзката: ' + error);
  }

  canManageFamily(family: Family): boolean {
    const currentUser = this.authService.getCurrentUser();
    return currentUser?.id === family.createdByUserId;
  }

  canViewBirthDate(family: Family): boolean {
    return this.canManageFamily(family);
  }
}