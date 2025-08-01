import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatIconModule } from '@angular/material/icon';
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
    MatCardModule,
    MatButtonModule,
    MatInputModule,
    MatProgressSpinnerModule,
    MatIconModule,
    RelativeDatePipe
  ],
  template: `
    <div class="catalog-container">
      <div class="header-section">
        <h1>Каталог на семейства</h1>
        <p>Разгледайте семейните истории и открийте връзки</p>
        
        <button mat-raised-button color="primary" routerLink="/families/create" class="create-button">
          <mat-icon>add</mat-icon>
          Създай семейство
        </button>
        
        <!-- Search -->
        <mat-form-field appearance="outline" class="search-field">
          <mat-label>Търсене на семейства</mat-label>
          <input matInput 
                 placeholder="Въведете име на семейство..." 
                 [(ngModel)]="searchTerm"
                 (input)="onSearchChange($event)">
          <mat-icon matSuffix>search</mat-icon>
        </mat-form-field>
      </div>

      <!-- Loading State -->
      <div *ngIf="isLoading" class="loading-container">
        <mat-spinner></mat-spinner>
        <p>Зареждане на семейства...</p>
      </div>

      <!-- Error State -->
      <div *ngIf="error" class="error-container">
        <mat-icon color="warn">error</mat-icon>
        <p>Възникна грешка при зареждането: {{ error }}</p>
        <button mat-raised-button color="primary" (click)="loadFamilies()">
          Опитайте отново
        </button>
      </div>

      <!-- Family Grid -->
      <div *ngIf="!isLoading && !error" class="families-grid">
        <mat-card *ngFor="let family of filteredFamilies$ | async; trackBy: trackByFamilyId" 
                  class="family-card">
          <mat-card-header>
            <mat-card-title>{{ family.name }}</mat-card-title>
            <mat-card-subtitle>
              Създадено {{ family.createdAt | relativeDate }}
            </mat-card-subtitle>
          </mat-card-header>
          
          <mat-card-content>
            <p class="family-description">
              {{ family.description || 'Няма описание' | slice:0:150 }}
              <span *ngIf="family.description && family.description.length > 150">...</span>
            </p>
            
            <div class="family-stats">
              <span class="stat">
                <mat-icon>people</mat-icon>
                {{ family.memberCount || 0 }} членове
              </span>
              <span class="stat" *ngIf="family.isPublic">
                <mat-icon>public</mat-icon>
                Публично
              </span>
              <span class="stat" *ngIf="!family.isPublic">
                <mat-icon>lock</mat-icon>
                Частно
              </span>
            </div>
          </mat-card-content>
          
          <mat-card-actions>
            <button mat-button 
                    color="primary" 
                    [routerLink]="['/families', family.id]">
              <mat-icon>visibility</mat-icon>
              Разгледай
            </button>
            <button mat-button color="accent" *ngIf="family.isPublic">
              <mat-icon>share</mat-icon>
              Споделе
            </button>
          </mat-card-actions>
        </mat-card>
      </div>

      <!-- Empty State -->
      <div *ngIf="!isLoading && !error && (filteredFamilies$ | async)?.length === 0" 
           class="empty-state">
        <mat-icon>family_restroom</mat-icon>
        <h3>Няма намерени семейства</h3>
        <p>Опитайте с различен термин за търсене или създайте ново семейство.</p>
        <button mat-raised-button color="primary" routerLink="/families/create">
          <mat-icon>add</mat-icon>
          Създай семейство
        </button>
      </div>
    </div>
  `,
  styles: [`
    .catalog-container {
      padding: 24px;
      max-width: 1200px;
      margin: 0 auto;
    }

    .header-section {
      text-align: center;
      margin-bottom: 32px;
    }

    .create-button {
      margin: 16px 0;
    }

    .header-section h1 {
      font-size: 2.5rem;
      margin-bottom: 8px;
      color: #333;
    }

    .header-section p {
      font-size: 1.1rem;
      color: #666;
      margin-bottom: 24px;
    }

    .search-field {
      width: 100%;
      max-width: 400px;
    }

    .loading-container, .error-container, .empty-state {
      text-align: center;
      padding: 48px 24px;
    }

    .loading-container mat-spinner {
      margin: 0 auto 16px;
    }

    .error-container mat-icon, .empty-state mat-icon {
      font-size: 48px;
      height: 48px;
      width: 48px;
      margin-bottom: 16px;
    }

    .families-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
      gap: 24px;
      margin-top: 24px;
    }

    .family-card {
      transition: transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out;
    }

    .family-card:hover {
      transform: translateY(-4px);
      box-shadow: 0 8px 25px rgba(0,0,0,0.15);
    }

    .family-description {
      color: #666;
      line-height: 1.5;
      margin-bottom: 16px;
    }

    .family-stats {
      display: flex;
      gap: 16px;
      margin-bottom: 8px;
    }

    .stat {
      display: flex;
      align-items: center;
      gap: 4px;
      font-size: 0.9rem;
      color: #666;
    }

    .stat mat-icon {
      font-size: 18px;
      height: 18px;
      width: 18px;
    }

    mat-card-actions {
      display: flex;
      gap: 8px;
    }

    /* Responsive Design */
    @media (max-width: 768px) {
      .catalog-container {
        padding: 16px;
      }
      
      .families-grid {
        grid-template-columns: 1fr;
        gap: 16px;
      }
      
      .header-section h1 {
        font-size: 2rem;
      }
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