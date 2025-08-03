import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { Subject, takeUntil, forkJoin } from 'rxjs';

import { MemberService } from '../../../core/services/member.service';
import { FamilyService } from '../../../core/services/family.service';
import { RelationshipService } from '../../../core/services/relationship.service';
import { AuthService } from '../../../core/services/auth.service';
import { FamilyMember, Family, Relationship } from '../../../core/models/family.interface';

@Component({
  selector: 'app-member-details-bootstrap',
  standalone: true,
  imports: [
    CommonModule, 
    RouterLink
  ],
  template: `
    <div class="container mt-4">
      <!-- Loading State -->
      <div *ngIf="isLoading" class="text-center py-5">
        <div class="spinner-border text-primary" style="width: 3rem; height: 3rem;" role="status">
          <span class="visually-hidden">Зареждане...</span>
        </div>
        <p class="mt-3 text-muted">Зареждане на детайли...</p>
      </div>

      <!-- Error State -->
      <div *ngIf="error" class="alert alert-danger text-center">
        <i class="fas fa-exclamation-triangle fa-2x mb-3"></i>
        <h4>Грешка</h4>
        <p>{{ error }}</p>
        <button class="btn btn-outline-danger" (click)="loadMemberData()">
          <i class="fas fa-redo me-1"></i>Опитайте отново
        </button>
      </div>

      <!-- Member Details -->
      <div *ngIf="member && family && !isLoading && !error">
        <!-- Header -->
        <div class="row mb-4">
          <div class="col-12">
            <nav aria-label="breadcrumb">
              <ol class="breadcrumb">
                <li class="breadcrumb-item">
                  <a [routerLink]="['/families']" class="text-decoration-none">
                    <i class="fas fa-home me-1"></i>Семейства
                  </a>
                </li>
                <li class="breadcrumb-item">
                  <a [routerLink]="['/families', member.familyId]" class="text-decoration-none">
                    {{ family.name }}
                  </a>
                </li>
                <li class="breadcrumb-item active" aria-current="page">
                  {{ member.firstName }} {{ member.lastName }}
                </li>
              </ol>
            </nav>
          </div>
        </div>

        <!-- Member Profile Card -->
        <div class="row">
          <div class="col-lg-8 mx-auto">
            <div class="card border-0 shadow-lg">
              <!-- Card Header -->
              <div class="card-header bg-primary text-white text-center py-4">
                <div class="d-flex align-items-center justify-content-center mb-3">
                  <div class="avatar-circle me-3">
                    <i class="fas" [class.fa-mars]="member.gender === 'Male'" [class.fa-venus]="member.gender === 'Female'"></i>
                  </div>
                  <div>
                    <h2 class="card-title mb-1">
                      {{ member.firstName }} {{ member.middleName }} {{ member.lastName }}
                    </h2>
                    <p class="card-subtitle mb-0 opacity-75">
                      <i class="fas fa-users me-1"></i>
                      Член на {{ family.name }}
                    </p>
                  </div>
                </div>
              </div>

              <!-- Card Body -->
              <div class="card-body p-5">
                
                <!-- Basic Information -->
                <div class="row mb-5">
                  <div class="col-12">
                    <h4 class="text-primary mb-4">
                      <i class="fas fa-info-circle me-2"></i>Основна информация
                    </h4>
                    
                    <div class="row g-3">
                      <!-- Gender -->
                      <div class="col-md-6">
                        <div class="info-item">
                          <i class="fas fa-venus-mars text-muted me-2"></i>
                          <span class="label">Пол:</span>
                          <span class="value">{{ member.gender === 'Male' ? 'Мъж' : 'Жена' }}</span>
                        </div>
                      </div>

                      <!-- Birth Date (only if user can view) -->
                      <div class="col-md-6" *ngIf="member.dateOfBirth && canViewPersonalData()">
                        <div class="info-item">
                          <i class="fas fa-birthday-cake text-warning me-2"></i>
                          <span class="label">Рожден:</span>
                          <span class="value">{{ member.dateOfBirth | date:'dd.MM.yyyy' }}</span>
                        </div>
                      </div>

                      <!-- Age (only if user can view) -->
                      <div class="col-md-6" *ngIf="member.dateOfBirth && canViewPersonalData()">
                        <div class="info-item">
                          <i class="fas fa-calendar-alt text-info me-2"></i>
                          <span class="label">Възраст:</span>
                          <span class="value">{{ getAge(member.dateOfBirth) }} години</span>
                        </div>
                      </div>

                      <!-- Birth Place -->
                      <div class="col-md-6" *ngIf="member.placeOfBirth">
                        <div class="info-item">
                          <i class="fas fa-map-marker-alt text-danger me-2"></i>
                          <span class="label">Място на раждане:</span>
                          <span class="value">{{ member.placeOfBirth }}</span>
                        </div>
                      </div>

                      <!-- Death Date -->
                      <div class="col-md-6" *ngIf="member.dateOfDeath">
                        <div class="info-item">
                          <i class="fas fa-cross text-dark me-2"></i>
                          <span class="label">Починал:</span>
                          <span class="value">{{ member.dateOfDeath | date:'dd.MM.yyyy' }}</span>
                        </div>
                      </div>

                      <!-- Death Place -->
                      <div class="col-md-6" *ngIf="member.placeOfDeath">
                        <div class="info-item">
                          <i class="fas fa-map-marker-alt text-dark me-2"></i>
                          <span class="label">Място на смърт:</span>
                          <span class="value">{{ member.placeOfDeath }}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <!-- Relationships Section -->
                <div class="row mb-5" *ngIf="getGroupedRelationships() | keyvalue; let groupedRels">
                  <div class="col-12" *ngIf="groupedRels.length > 0">
                    <h4 class="text-primary mb-4">
                      <i class="fas fa-sitemap me-2"></i>Роднински връзки
                    </h4>
                    <div class="relationships-container">
                      <div *ngFor="let group of groupedRels" class="relationship-item mb-3">
                        <div class="relationship-header">
                          <i class="fas fa-users me-2"></i>
                          <strong>{{ group.key }}</strong>
                        </div>
                        <div class="relationship-names">
                          {{ group.value.join(', ') }}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <!-- No Relationships -->
                <div class="row mb-5" *ngIf="relationships.length === 0">
                  <div class="col-12">
                    <h4 class="text-primary mb-4">
                      <i class="fas fa-sitemap me-2"></i>Роднински връзки
                    </h4>
                    <div class="alert alert-info d-flex align-items-center">
                      <i class="fas fa-info-circle me-3"></i>
                      <div>
                        <strong>Няма записани връзки</strong>
                        <p class="mb-0 mt-1">Роднинските връзки могат да бъдат добавени от членове на семейството.</p>
                      </div>
                    </div>
                  </div>
                </div>

                <!-- Biography -->
                <div class="row mb-4" *ngIf="member.biography">
                  <div class="col-12">
                    <h4 class="text-primary mb-4">
                      <i class="fas fa-book me-2"></i>Биография
                    </h4>
                    <div class="biography-section">
                      <p class="biography-text">{{ member.biography }}</p>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Card Footer -->
              <div class="card-footer bg-light text-center py-4">
                <div class="d-flex gap-3 justify-content-center flex-wrap">
                  <a [routerLink]="['/families', member.familyId]" class="btn btn-outline-primary">
                    <i class="fas fa-users me-2"></i>Виж семейството
                  </a>
                  <a [routerLink]="['/members']" class="btn btn-outline-secondary">
                    <i class="fas fa-arrow-left me-2"></i>Всички роднини
                  </a>
                </div>
              </div>
            </div>
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

    .avatar-circle {
      width: 60px;
      height: 60px;
      background: rgba(255, 255, 255, 0.2);
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 1.5rem;
    }

    .info-item {
      background: #f8f9fa;
      padding: 0.75rem 1rem;
      border-radius: 0.5rem;
      border-left: 4px solid #0d6efd;
      display: flex;
      align-items: center;
      gap: 0.5rem;
      height: 100%;
    }

    .label {
      font-weight: 600;
      color: #495057;
      min-width: 100px;
    }

    .value {
      color: #6c757d;
      font-weight: 500;
    }

    .relationships-container {
      display: flex;
      flex-direction: column;
      gap: 0.75rem;
    }

    .relationship-item {
      background: #f8f9fa;
      border: 1px solid #e9ecef;
      border-radius: 0.75rem;
      padding: 1rem 1.25rem;
      border-left: 4px solid #28a745;
    }

    .relationship-header {
      display: flex;
      align-items: center;
      color: #495057;
      font-size: 1rem;
      margin-bottom: 0.5rem;
    }

    .relationship-names {
      color: #6c757d;
      font-size: 0.95rem;
      line-height: 1.4;
      padding-left: 1.75rem;
    }

    .biography-section {
      background: #f8f9fa;
      padding: 1.5rem;
      border-radius: 0.75rem;
      border-left: 4px solid #6c757d;
    }

    .biography-text {
      line-height: 1.6;
      color: #495057;
      margin: 0;
      font-size: 1.1rem;
    }

    .breadcrumb {
      background: transparent;
      padding: 0;
      margin: 0;
    }

    .breadcrumb-item + .breadcrumb-item::before {
      content: '>';
      color: #6c757d;
    }

    .btn {
      border-radius: 0.5rem;
      font-weight: 500;
      transition: all 0.3s ease;
    }

    .btn:hover {
      transform: translateY(-1px);
    }

    @media (max-width: 768px) {
      .container {
        padding: 0 15px;
      }
      
      .card-body {
        padding: 2rem !important;
      }
      
      .info-item {
        flex-direction: column;
        align-items: flex-start;
        text-align: left;
      }
      
      .label {
        min-width: auto;
        margin-bottom: 0.25rem;
      }

      .d-flex.gap-3 {
        flex-direction: column;
      }
    }
  `]
})
export class MemberDetailsBootstrapComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();
  
  member: FamilyMember | null = null;
  family: Family | null = null;
  relationships: Relationship[] = [];
  isLoading = true;
  error: string | null = null;
  memberId: number = 0;

  constructor(
    private route: ActivatedRoute,
    private memberService: MemberService,
    private familyService: FamilyService,
    private relationshipService: RelationshipService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.route.params.pipe(takeUntil(this.destroy$)).subscribe(params => {
      this.memberId = +params['id'];
      if (this.memberId) {
        this.loadMemberData();
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

  loadMemberData(): void {
    this.isLoading = true;
    this.error = null;
    
    this.memberService.getMemberById(this.memberId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (member) => {
          this.member = member;
          
          // Load family and relationships in parallel
          forkJoin({
            family: this.familyService.getFamilyById(member.familyId),
            relationships: this.relationshipService.getRelationshipsByMember(member.id)
          }).subscribe({
            next: (data) => {
              this.family = data.family;
              this.relationships = data.relationships;
              this.isLoading = false;
            },
            error: (err) => {
              console.error('Error loading additional data:', err);
              this.isLoading = false;
              // Continue even if family/relationships fail to load
            }
          });
        },
        error: (err) => {
          this.isLoading = false;
          this.error = 'Членът не е намерен или възникна грешка при зареждането.';
          console.error('Error loading member:', err);
        }
      });
  }

  canViewPersonalData(): boolean {
    if (!this.family) return false;
    const currentUser = this.authService.getCurrentUser();
    return currentUser?.id === this.family.createdByUserId;
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

  getGroupedRelationships(): { [key: string]: string[] } {
    const grouped: { [key: string]: string[] } = {};

    this.relationships.forEach(rel => {
      const relationshipType = this.getRelationshipTypeForMember(rel);
      const relatedPersonName = this.getRelatedPersonName(rel);
      
      if (relationshipType && relatedPersonName) {
        if (!grouped[relationshipType]) {
          grouped[relationshipType] = [];
        }
        grouped[relationshipType].push(relatedPersonName);
      }
    });

    return grouped;
  }

  private getRelationshipTypeForMember(relationship: Relationship): string {
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
    if (relationship.primaryMemberId === this.memberId) {
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

  private getRelatedPersonName(relationship: Relationship): string {
    if (relationship.primaryMemberId === this.memberId) {
      return relationship.relatedMemberName || 'Неизвестен';
    } else {
      return relationship.primaryMemberName || 'Неизвестен';
    }
  }
}