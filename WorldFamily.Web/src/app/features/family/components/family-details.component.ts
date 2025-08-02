import { Component, OnInit, OnDestroy, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink, Router, NavigationEnd } from '@angular/router';
import { Subject, takeUntil, filter } from 'rxjs';

import { FamilyService } from '../../../core/services/family.service';
import { MemberService } from '../../../core/services/member.service';
import { RelationshipService } from '../../../core/services/relationship.service';
import { AuthService } from '../../../core/services/auth.service';
import { Family, FamilyMember, Relationship } from '../../../core/models/family.interface';
import { FamilyTreeComponent } from './family-tree.component';
import { RelativeDatePipe } from '../../../shared/pipes/relative-date.pipe';

@Component({
  selector: 'app-family-details',
  standalone: true,
  imports: [
    CommonModule, 
    RouterLink,
    FamilyTreeComponent,
    RelativeDatePipe
  ],
  template: `
    <div class="container my-4">
      <!-- Loading State -->
      <div *ngIf="isLoading" class="text-center py-5">
        <div class="spinner-border text-primary mb-3" role="status">
          <span class="visually-hidden">Зареждане...</span>
        </div>
        <p class="text-muted">Зареждане на семейство...</p>
      </div>

      <!-- Error State -->
      <div *ngIf="error" class="alert alert-danger text-center" role="alert">
        <i class="fas fa-exclamation-triangle fa-2x mb-3"></i>
        <h4>Възникна грешка</h4>
        <p class="mb-3">{{ error }}</p>
        <button class="btn btn-primary" (click)="loadFamily()">
          <i class="fas fa-redo me-2"></i>
          Опитайте отново
        </button>
      </div>

      <!-- Family Details -->
      <div *ngIf="family && !isLoading && !error">
        <!-- Back Button -->
        <div class="mb-4">
          <a routerLink="/families" class="btn btn-outline-secondary">
            <i class="fas fa-arrow-left me-2"></i>
            Обратно към каталога
          </a>
        </div>
        
        <!-- Family Header Card -->
        <div class="card shadow-sm mb-4">
          <div class="card-header bg-primary text-white">
            <div class="d-flex justify-content-between align-items-center">
              <div>
                <h3 class="mb-0">
                  <i class="fas fa-home me-2"></i>
                  {{ family.name }}
                </h3>
                <small class="opacity-75">
                  <i class="fas fa-calendar me-1"></i>
                  Създадено {{ family.createdAt | relativeDate }}
                </small>
              </div>
            </div>
          </div>
          
          <div class="card-body">
            <p *ngIf="family.description" class="lead mb-4">
              {{ family.description }}
            </p>
            
            <div class="row g-3">
              <div class="col-md-4" *ngIf="family.location">
                <div class="d-flex align-items-center text-muted">
                  <i class="fas fa-map-marker-alt me-2"></i>
                  <span>{{ family.location }}</span>
                </div>
              </div>
              
              <div class="col-md-4">
                <div class="d-flex align-items-center text-muted">
                  <i class="fas fa-users me-2"></i>
                  <span>{{ members.length }} членове</span>
                </div>
              </div>
              
              <div class="col-md-4">
                <span class="badge" 
                     [class.bg-success]="family.isPublic" 
                     [class.bg-secondary]="!family.isPublic">
                  <i class="fas" [class.fa-globe]="family.isPublic" [class.fa-lock]="!family.isPublic" class="me-1"></i>
                  {{ family.isPublic ? 'Публично' : 'Частно' }}
                </span>
              </div>
            </div>
          </div>
        </div>

        <!-- Family Tree Section -->
        <div class="mb-5" *ngIf="members.length > 0">
          <app-family-tree 
            [members]="members" 
            [relationships]="relationships"
            [canViewBirthDates]="canViewPersonalData()">
          </app-family-tree>
        </div>

        <!-- Empty Members State -->
        <div *ngIf="members.length === 0" class="text-center py-5">
          <i class="fas fa-user-plus fa-4x text-muted mb-3"></i>
          <h4 class="text-muted">Няма добавени членове</h4>
          <p class="text-muted mb-4">Добавете първия член към това семейство</p>
          <a *ngIf="canManageFamily()" class="btn btn-primary" [routerLink]="['/families', family.id, 'members', 'create']">
            <i class="fas fa-plus me-2"></i>
            Добави първия член
          </a>
        </div>
      </div>
    </div>
  `,
  styles: []
})
export class FamilyDetailsComponent implements OnInit, AfterViewInit, OnDestroy {
  private destroy$ = new Subject<void>();
  
  family: Family | null = null;
  members: FamilyMember[] = [];
  relationships: Relationship[] = [];
  isLoading = true;
  error: string | null = null;
  familyId: number = 0;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private familyService: FamilyService,
    private memberService: MemberService,
    private relationshipService: RelationshipService,
    private authService: AuthService
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

  ngAfterViewInit(): void {
    // Refresh members every time this view is displayed
    setTimeout(() => {
      if (this.familyId) {
        this.loadMembers();
      }
    }, 500);
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
    // Load both members and relationships
    this.memberService.getMembersByFamily(this.familyId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (members) => {
          this.members = members;
          // Also load relationships for this family
          this.loadRelationships();
        },
        error: (err) => {
          this.members = [];
          this.isLoading = false;
          console.error('Error loading members:', err);
        }
      });
  }

  private loadRelationships(): void {
    this.relationshipService.getRelationshipsByFamily(this.familyId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (relationships) => {
          this.relationships = relationships;
          this.isLoading = false;
        },
        error: (err) => {
          this.relationships = [];
          this.isLoading = false;
          console.error('Error loading relationships:', err);
        }
      });
  }

  refreshMembers(): void {
    this.loadMembers();
  }

  canManageFamily(): boolean {
    if (!this.family) return false;
    const currentUser = this.authService.getCurrentUser();
    return currentUser?.id === this.family.createdByUserId;
  }

  canViewPersonalData(): boolean {
    return this.canManageFamily();
  }
}