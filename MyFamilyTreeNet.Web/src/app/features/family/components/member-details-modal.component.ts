import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FamilyMember } from '../../../core/models/family.interface';
import { FullNamePipe } from '../../../shared/pipes/full-name.pipe';
import { MemberAgePipe } from '../../../shared/pipes/member-age.pipe';

@Component({
  selector: 'app-member-details-modal',
  standalone: true,
  imports: [CommonModule, FullNamePipe, MemberAgePipe],
  template: `
    <div class="modal fade show" style="display: block;" tabindex="-1" *ngIf="member" (click)="onBackdropClick($event)">
      <div class="modal-dialog modal-lg modal-dialog-centered">
        <div class="modal-content" (click)="$event.stopPropagation()">
          <div class="modal-header">
            <h5 class="modal-title">
              <i class="fas fa-user me-2"></i>
              {{ member.firstName | fullName:member.middleName:member.lastName }}
            </h5>
            <button type="button" class="btn-close" (click)="closeModal()"></button>
          </div>
          
          <div class="modal-body">
            <div class="row">
              <!-- Photo Section -->
              <div class="col-md-4 text-center mb-4">
                <div class="member-photo-large">
                  <img *ngIf="member.profileImageUrl" 
                       [src]="member.profileImageUrl" 
                       [alt]="member.firstName + ' ' + member.lastName"
                       class="member-image-large">
                  <div *ngIf="!member.profileImageUrl" 
                       class="member-avatar-large" 
                       [class.male-avatar]="member.gender === 'Male'" 
                       [class.female-avatar]="member.gender === 'Female'">
                    <i class="fas" 
                       [class.fa-mars]="member.gender === 'Male'" 
                       [class.fa-venus]="member.gender === 'Female'"></i>
                  </div>
                </div>
                
                <div class="mt-3">
                  <span class="badge" 
                        [class.bg-primary]="member.gender === 'Male'" 
                        [class.bg-danger]="member.gender === 'Female'">
                    <i class="fas me-1" 
                       [class.fa-mars]="member.gender === 'Male'" 
                       [class.fa-venus]="member.gender === 'Female'"></i>
                    {{ member.gender === 'Male' ? 'Мъж' : 'Жена' }}
                  </span>
                </div>
              </div>
              
              <!-- Details Section -->
              <div class="col-md-8">
                <div class="member-details">
                  
                  <!-- Basic Information -->
                  <div class="detail-section mb-4">
                    <h6 class="text-muted mb-3">
                      <i class="fas fa-info-circle me-2"></i>
                      Основна информация
                    </h6>
                    
                    <div class="row g-3">
                      <div class="col-12" *ngIf="member.dateOfBirth && canViewBirthDates">
                        <div class="detail-item">
                          <i class="fas fa-birthday-cake text-primary me-2"></i>
                          <span class="detail-label">Рождена дата:</span>
                          <span class="detail-value">
                            {{ member.dateOfBirth | date:'dd MMMM yyyy':'':'bg' }}
                            <span class="text-muted ms-2">({{ member.dateOfBirth | memberAge }})</span>
                          </span>
                        </div>
                      </div>
                      
                      <div class="col-12" *ngIf="member.dateOfDeath">
                        <div class="detail-item">
                          <i class="fas fa-cross text-secondary me-2"></i>
                          <span class="detail-label">Дата на смърт:</span>
                          <span class="detail-value">{{ member.dateOfDeath | date:'dd MMMM yyyy':'':'bg' }}</span>
                        </div>
                      </div>
                      
                      <div class="col-12" *ngIf="member.placeOfBirth">
                        <div class="detail-item">
                          <i class="fas fa-map-marker-alt text-success me-2"></i>
                          <span class="detail-label">Място на раждане:</span>
                          <span class="detail-value">{{ member.placeOfBirth }}</span>
                        </div>
                      </div>
                      
                      <div class="col-12" *ngIf="member.placeOfDeath">
                        <div class="detail-item">
                          <i class="fas fa-map-marker-alt text-secondary me-2"></i>
                          <span class="detail-label">Място на смърт:</span>
                          <span class="detail-value">{{ member.placeOfDeath }}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <!-- Biography -->
                  <div class="detail-section" *ngIf="member.biography">
                    <h6 class="text-muted mb-3">
                      <i class="fas fa-book me-2"></i>
                      Биография
                    </h6>
                    <div class="biography-text">
                      {{ member.biography }}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" (click)="closeModal()">
              <i class="fas fa-times me-2"></i>
              Затвори
            </button>
          </div>
        </div>
      </div>
    </div>
    
    <!-- Modal Backdrop -->
    <div class="modal-backdrop fade show" *ngIf="member"></div>
  `,
  styles: [`
    .member-photo-large {
      width: 150px;
      height: 150px;
      margin: 0 auto;
      position: relative;
    }

    .member-image-large {
      width: 100%;
      height: 100%;
      border-radius: 20px;
      object-fit: cover;
      border: 3px solid rgba(255,255,255,0.8);
      box-shadow: 0 4px 15px rgba(0,0,0,0.2);
    }

    .member-avatar-large {
      width: 100%;
      height: 100%;
      border-radius: 20px;
      display: flex;
      align-items: center;
      justify-content: center;
      color: white;
      font-size: 3rem;
      border: 3px solid rgba(255,255,255,0.8);
      box-shadow: 0 4px 15px rgba(0,0,0,0.2);
      background: linear-gradient(45deg, #6c757d, #495057);
    }

    .male-avatar {
      background: linear-gradient(45deg, #007bff, #0056b3) !important;
    }

    .female-avatar {
      background: linear-gradient(45deg, #e91e63, #ad1457) !important;
    }

    .detail-section {
      border-bottom: 1px solid #dee2e6;
      padding-bottom: 1rem;
    }

    .detail-section:last-child {
      border-bottom: none;
      padding-bottom: 0;
    }

    .detail-item {
      display: flex;
      align-items: center;
      margin-bottom: 0.75rem;
      padding: 0.5rem;
      background: #f8f9fa;
      border-radius: 0.5rem;
    }

    .detail-item:last-child {
      margin-bottom: 0;
    }

    .detail-label {
      font-weight: 600;
      color: #495057;
      margin-right: 0.5rem;
      min-width: 120px;
    }

    .detail-value {
      color: #212529;
    }

    .biography-text {
      background: #f8f9fa;
      padding: 1rem;
      border-radius: 0.5rem;
      border-left: 4px solid #007bff;
      line-height: 1.6;
      color: #495057;
    }

    .modal-content {
      border: none;
      border-radius: 1rem;
      box-shadow: 0 10px 30px rgba(0,0,0,0.3);
    }

    .modal-header {
      background: linear-gradient(135deg, #007bff, #0056b3);
      color: white;
      border-top-left-radius: 1rem;
      border-top-right-radius: 1rem;
      border-bottom: none;
    }

    .modal-header .btn-close {
      filter: invert(1) grayscale(100%) brightness(200%);
    }

    .modal-footer {
      border-top: 1px solid #dee2e6;
      background: #f8f9fa;
      border-bottom-left-radius: 1rem;
      border-bottom-right-radius: 1rem;
    }

    @media (max-width: 768px) {
      .member-photo-large {
        width: 120px;
        height: 120px;
      }

      .member-avatar-large {
        font-size: 2.5rem;
      }

      .detail-label {
        min-width: 100px;
        font-size: 0.9rem;
      }

      .detail-item {
        flex-direction: column;
        align-items: flex-start;
        text-align: left;
      }

      .detail-label {
        margin-bottom: 0.25rem;
        margin-right: 0;
      }
    }
  `]
})
export class MemberDetailsModalComponent implements OnInit {
  @Input() member: FamilyMember | null = null;
  @Input() canViewBirthDates: boolean = false;
  @Output() close = new EventEmitter<void>();

  ngOnInit(): void {
    // Prevent body scrolling when modal is open
    if (this.member) {
      document.body.style.overflow = 'hidden';
    }
  }

  closeModal(): void {
    // Restore body scrolling
    document.body.style.overflow = 'auto';
    this.close.emit();
  }

  onBackdropClick(event: Event): void {
    // Close modal when clicking on backdrop
    this.closeModal();
  }
}