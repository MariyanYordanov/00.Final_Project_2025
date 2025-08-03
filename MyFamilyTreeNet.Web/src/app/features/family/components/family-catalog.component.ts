import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { Subject, Observable, takeUntil, debounceTime, switchMap, startWith, catchError, of } from 'rxjs';

import { FamilyService } from '../../../core/services/family.service';
import { Family } from '../../../core/models/family.interface';
import { RelativeDatePipe } from '../../../shared/pipes/relative-date.pipe';

@Component({
  selector: 'app-family-catalog',
  standalone: true,
  imports: [
    CommonModule, 
    RouterLink, 
    FormsModule,
    RelativeDatePipe
  ],
  template: `
    <div class="container my-4">
      <!-- Hero Section -->
      <div class="text-center mb-5">
        <h1 class="display-4 text-primary-custom mb-3">
          <i class="fas fa-users me-3"></i>
          Каталог на семейства
        </h1>
        <p class="lead text-muted mb-4">Разгледайте семейните истории и открийте връзки</p>
        
        <div class="d-flex flex-column flex-md-row gap-3 justify-content-center align-items-center">
          <a routerLink="/families/create" class="btn btn-primary btn-lg">
            <i class="fas fa-plus me-2"></i>
            Създай семейство
          </a>
          
          <!-- Search -->
          <div class="input-group" style="max-width: 400px;">
            <span class="input-group-text">
              <i class="fas fa-search"></i>
            </span>
            <input 
              type="text" 
              class="form-control" 
              placeholder="Търсене на семейства..." 
              [(ngModel)]="searchTerm"
              (input)="onSearchChange($event)">
          </div>
        </div>
      </div>

      <!-- Loading State -->
      <div *ngIf="isLoading" class="text-center py-5">
        <div class="spinner-border spinner-border-custom mb-3" role="status">
          <span class="visually-hidden">Зареждане...</span>
        </div>
        <p class="text-muted">Зареждане на семейства...</p>
      </div>

      <!-- Error State -->
      <div *ngIf="error" class="alert alert-danger text-center" role="alert">
        <i class="fas fa-exclamation-triangle fa-2x mb-3"></i>
        <h4>Възникна грешка</h4>
        <p class="mb-3">{{ error }}</p>
        <button class="btn btn-primary" (click)="loadFamilies()">
          <i class="fas fa-redo me-2"></i>
          Опитайте отново
        </button>
      </div>

      <!-- Family Grid -->
      <div *ngIf="!isLoading && !error" class="row g-4">
        <div *ngFor="let family of filteredFamilies$ | async; trackBy: trackByFamilyId" 
             class="col-12 col-md-6 col-lg-4">
          <div class="card family-card h-100 shadow-sm">
            <!-- Card Header with Family Icon -->
            <div class="card-header bg-primary-custom text-white d-flex align-items-center">
              <i class="fas fa-home me-2"></i>
              <h5 class="mb-0">{{ family.name }}</h5>
            </div>
            
            <div class="card-body d-flex flex-column">
              <!-- Creation Date -->
              <p class="text-muted small mb-2">
                <i class="fas fa-calendar me-1"></i>
                Създадено {{ family.createdAt | relativeDate }}
              </p>
              
              <!-- Description -->
              <p class="card-text flex-grow-1">
                {{ family.description || 'Няма описание' | slice:0:120 }}
                <span *ngIf="family.description && family.description.length > 120">...</span>
              </p>
              
              <!-- Family Stats -->
              <div class="d-flex justify-content-between align-items-center mb-3">
                <small class="text-muted">
                  <i class="fas fa-users me-1"></i>
                  {{ family.memberCount || 0 }} членове
                </small>
                <small class="badge" 
                       [class.bg-success]="family.isPublic" 
                       [class.bg-secondary]="!family.isPublic">
                  <i class="fas" [class.fa-globe]="family.isPublic" [class.fa-lock]="!family.isPublic"></i>
                  {{ family.isPublic ? 'Публично' : 'Частно' }}
                </small>
              </div>
            </div>
            
            <!-- Card Actions -->
            <div class="card-footer bg-transparent">
              <a [routerLink]="['/families', family.id]" class="btn btn-outline-primary w-100">
                <i class="fas fa-eye me-2"></i>
                Разгледай семейството
              </a>
            </div>
          </div>
        </div>
      </div>

      <!-- Empty State -->
      <div *ngIf="!isLoading && !error && (filteredFamilies$ | async)?.length === 0" 
           class="text-center py-5">
        <i class="fas fa-family fa-4x text-muted mb-3"></i>
        <h3 class="text-muted">Няма намерени семейства</h3>
        <p class="text-muted mb-4">Станете първия, който ще създаде семейството си!</p>
        <a routerLink="/families/create" class="btn btn-primary">
          <i class="fas fa-plus me-2"></i>
          Създай първото семейство
        </a>
      </div>
    </div>
  `,
  styles: [`
    /* Bootstrap overrides for family cards */
    .family-card {
      transition: transform 0.3s ease, box-shadow 0.3s ease;
      border: none;
    }
    
    .family-card:hover {
      transform: translateY(-5px);
      box-shadow: 0 8px 25px rgba(0,0,0,0.15) !important;
    }
    
    .bg-primary-custom {
      background-color: var(--primary-color) !important;
    }
    
    .text-primary-custom {
      color: var(--primary-color) !important;
    }
  `]
})
export class FamilyCatalogComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();
  private searchSubject = new Subject<string>();

  families$: Observable<Family[]>;
  filteredFamilies$: Observable<Family[]>;
  isLoading = true;
  error: string | null = null;
  searchTerm = '';

  constructor(private familyService: FamilyService) {
    this.families$ = this.familyService.families$;
    
    // Set up search with debounce
    this.filteredFamilies$ = this.searchSubject.pipe(
      startWith(''),
      debounceTime(300),
      switchMap(term => this.familyService.searchFamilies(of(term))),
      catchError(err => {
        this.error = 'Грешка при търсене на семейства';
        return of([]);
      })
    );
  }

  ngOnInit(): void {
    this.loadFamilies();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadFamilies(): void {
    this.isLoading = true;
    this.error = null;
    
    this.familyService.getFamilies()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (families) => {
          this.isLoading = false;
          this.searchSubject.next(this.searchTerm);
        },
        error: (err) => {
          this.isLoading = false;
          this.error = 'Неуспешно зареждане на семейства. Моля опитайте отново.';
          console.error('Error loading families:', err);
        }
      });
  }

  onSearchChange(event: any): void {
    const value = event.target.value;
    this.searchTerm = value;
    this.searchSubject.next(value);
  }

  trackByFamilyId(index: number, family: Family): number {
    return family.id;
  }
}