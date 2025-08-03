import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FamilyMember, Relationship } from '../../../core/models/family.interface';
import { MemberDetailsModalComponent } from './member-details-modal.component';

interface TreeNode {
  member: FamilyMember;
  children: TreeNode[];
  level: number;
  spouse?: FamilyMember;
}

interface CoupleUnit {
  member1: FamilyMember;
  member2?: FamilyMember;
  children: FamilyMember[];
  generation: number;
}

@Component({
  selector: 'app-family-tree',
  standalone: true,
  imports: [CommonModule, MemberDetailsModalComponent],
  template: `
    <div class="family-tree-container">
      <div class="tree-header text-center mb-4">
        <h4 class="text-primary">
          <i class="fas fa-sitemap me-2"></i>
          Семейно дърво
        </h4>
        <p class="text-muted">Интерактивна визуализация на семейните връзки</p>
      </div>

      <div class="tree-content" *ngIf="getSimplifiedTree().length > 0; else noTreeData">
        <!-- Generation by generation display -->
        <div *ngFor="let generation of getSimplifiedTree(); let genIndex = index" class="generation-container mb-5">
          
          <!-- Generation Label -->
          <div class="text-center mb-4">
            <span class="badge bg-primary generation-badge">{{ getGenerationLabel(genIndex) }}</span>
          </div>

          <!-- Couples in this generation -->
          <div class="couples-container d-flex justify-content-center flex-wrap gap-4 mb-4">
            <div *ngFor="let couple of generation" class="couple-unit">
              
              <!-- Marriage relationship display -->
              <div class="couple-display d-flex align-items-center gap-3">
                <!-- Member 1 -->
                <div class="tree-node clickable" 
                     [class.male]="couple.member1.gender === 'Male'" 
                     [class.female]="couple.member1.gender === 'Female'"
                     (click)="showMemberDetails(couple.member1)"
                     [attr.title]="'Кликнете за повече информация за ' + couple.member1.firstName + ' ' + couple.member1.lastName">
                  <div class="member-photo">
                    <img *ngIf="couple.member1.profileImageUrl" 
                         [src]="couple.member1.profileImageUrl" 
                         [alt]="couple.member1.firstName + ' ' + couple.member1.lastName"
                         class="member-image">
                    <div *ngIf="!couple.member1.profileImageUrl" class="member-avatar">
                      <i class="fas" [class.fa-mars]="couple.member1.gender === 'Male'" [class.fa-venus]="couple.member1.gender === 'Female'"></i>
                    </div>
                  </div>
                  <div class="member-info">
                    <div class="member-name">{{ couple.member1.firstName }} {{ couple.member1.lastName }}</div>
                    <div class="member-details">
                      <small class="text-muted" *ngIf="couple.member1.dateOfBirth && canViewBirthDates">
                        {{ getAge(couple.member1.dateOfBirth) }} год.
                      </small>
                    </div>
                  </div>
                  <div class="member-actions">
                    <div class="action-hint">
                      <i class="fas fa-mouse-pointer"></i>
                      <small>Кликнете</small>
                    </div>
                  </div>
                </div>

                <!-- Marriage Connection -->
                <div class="marriage-connection" *ngIf="couple.member2">
                  <div class="marriage-line"></div>
                  <div class="marriage-symbol">♥</div>
                  <div class="marriage-label">женени</div>
                </div>

                <!-- Member 2 (spouse) -->
                <div *ngIf="couple.member2" 
                     class="tree-node clickable" 
                     [class.male]="couple.member2.gender === 'Male'" 
                     [class.female]="couple.member2.gender === 'Female'"
                     (click)="showMemberDetails(couple.member2)"
                     [attr.title]="'Кликнете за повече информация за ' + couple.member2.firstName + ' ' + couple.member2.lastName">
                  <div class="member-photo">
                    <img *ngIf="couple.member2.profileImageUrl" 
                         [src]="couple.member2.profileImageUrl" 
                         [alt]="couple.member2.firstName + ' ' + couple.member2.lastName"
                         class="member-image">
                    <div *ngIf="!couple.member2.profileImageUrl" class="member-avatar">
                      <i class="fas" [class.fa-mars]="couple.member2.gender === 'Male'" [class.fa-venus]="couple.member2.gender === 'Female'"></i>
                    </div>
                  </div>
                  <div class="member-info">
                    <div class="member-name">{{ couple.member2.firstName }} {{ couple.member2.lastName }}</div>
                    <div class="member-details">
                      <small class="text-muted" *ngIf="couple.member2.dateOfBirth && canViewBirthDates">
                        {{ getAge(couple.member2.dateOfBirth) }} год.
                      </small>
                    </div>
                  </div>
                  <div class="member-actions">
                    <div class="action-hint">
                      <i class="fas fa-mouse-pointer"></i>
                      <small>Кликнете</small>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Children indicator -->
              <div *ngIf="couple.children.length > 0" class="children-indicator text-center mt-3">
                <div class="children-line"></div>
                <div class="children-count badge bg-success">
                  <i class="fas fa-baby me-1"></i>
                  {{ couple.children.length }} {{ couple.children.length === 1 ? 'дете' : 'деца' }}
                </div>
                <div class="children-names text-muted small mt-1">
                  {{ getChildrenNames(couple.children) }}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <ng-template #noTreeData>
        <div class="no-tree-data text-center py-5">
          <i class="fas fa-sitemap fa-4x text-muted mb-3"></i>
          <h5 class="text-muted">Няма данни за семейно дърво</h5>
          <p class="text-muted">Добавете роднински връзки за да се покаже дървото</p>
        </div>
      </ng-template>
    </div>

    <!-- Member Details Modal -->
    <app-member-details-modal 
      [member]="selectedMember" 
      [canViewBirthDates]="canViewBirthDates"
      (close)="closeMemberDetails()">
    </app-member-details-modal>
  `,
  styles: [`
    .family-tree-container {
      background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
      border-radius: 1rem;
      padding: 2rem;
      border: 1px solid #dee2e6;
    }

    .generation-container {
      background: white;
      border-radius: 1rem;
      padding: 2rem;
      box-shadow: 0 4px 6px rgba(0,0,0,0.1);
      border: 1px solid #e9ecef;
    }

    .generation-badge {
      font-size: 1rem;
      padding: 0.75rem 1.5rem;
      border-radius: 2rem;
      font-weight: 600;
    }

    .couples-container {
      min-height: 200px;
    }

    .couple-unit {
      background: #f8f9fa;
      border-radius: 1rem;
      padding: 1.5rem;
      border: 2px solid #e9ecef;
      min-width: 300px;
    }

    .couple-display {
      justify-content: center;
    }

    .tree-node {
      background: white;
      border: 2px solid #e9ecef;
      border-radius: 1rem;
      padding: 1rem;
      width: 180px;
      box-shadow: 0 4px 6px rgba(0,0,0,0.1);
      transition: all 0.3s ease;
    }

    .tree-node:hover {
      transform: translateY(-3px);
      box-shadow: 0 6px 15px rgba(0,0,0,0.15);
    }

    .tree-node.clickable {
      cursor: pointer;
      user-select: none;
    }

    .tree-node.clickable:hover {
      transform: translateY(-5px);
      box-shadow: 0 8px 20px rgba(0,0,0,0.2);
    }

    .tree-node.clickable:active {
      transform: translateY(-2px);
      box-shadow: 0 4px 10px rgba(0,0,0,0.2);
    }

    .tree-node.male {
      border-color: #007bff;
      background: linear-gradient(135deg, #ffffff 0%, #e3f2fd 100%);
    }

    .tree-node.female {
      border-color: #e91e63;
      background: linear-gradient(135deg, #ffffff 0%, #fce4ec 100%);
    }

    .member-photo {
      width: 70px;
      height: 70px;
      margin: 0 auto 0.75rem;
      position: relative;
    }

    .member-image {
      width: 100%;
      height: 100%;
      border-radius: 12px;
      object-fit: cover;
      border: 2px solid rgba(255,255,255,0.8);
      box-shadow: 0 2px 8px rgba(0,0,0,0.15);
    }

    .member-avatar {
      width: 70px;
      height: 70px;
      border-radius: 12px;
      background: linear-gradient(45deg, #6c757d, #495057);
      display: flex;
      align-items: center;
      justify-content: center;
      color: white;
      font-size: 1.8rem;
      border: 2px solid rgba(255,255,255,0.8);
      box-shadow: 0 2px 8px rgba(0,0,0,0.15);
    }

    .tree-node.male .member-avatar {
      background: linear-gradient(45deg, #007bff, #0056b3);
    }

    .tree-node.female .member-avatar {
      background: linear-gradient(45deg, #e91e63, #ad1457);
    }

    .member-info {
      text-align: center;
      margin-bottom: 0.75rem;
    }

    .member-name {
      font-weight: 600;
      font-size: 0.9rem;
      color: #333;
      line-height: 1.2;
    }

    .member-details {
      margin-top: 0.25rem;
    }

    .member-actions {
      text-align: center;
    }

    .action-hint {
      color: #6c757d;
      font-size: 0.7rem;
      opacity: 0.8;
      transition: opacity 0.3s ease;
    }

    .tree-node.clickable:hover .action-hint {
      opacity: 1;
      color: #007bff;
    }

    .marriage-connection {
      display: flex;
      flex-direction: column;
      align-items: center;
      margin: 0 1rem;
    }

    .marriage-line {
      width: 3px;
      height: 40px;
      background: linear-gradient(to bottom, #e91e63, #ff6b9d);
      border-radius: 2px;
    }

    .marriage-symbol {
      color: #e91e63;
      font-size: 1.5rem;
      font-weight: bold;
      margin: 0.25rem 0;
      text-shadow: 0 1px 3px rgba(0,0,0,0.2);
    }

    .marriage-label {
      font-size: 0.7rem;
      color: #6c757d;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }

    .children-indicator {
      border-top: 2px solid #28a745;
      padding-top: 1rem;
      margin-top: 1rem;
    }

    .children-line {
      width: 2px;
      height: 20px;
      background: #28a745;
      margin: 0 auto 0.5rem;
    }

    .children-count {
      font-size: 0.8rem;
      padding: 0.5rem 1rem;
      border-radius: 2rem;
      display: inline-block;
    }

    .children-names {
      margin-top: 0.5rem;
      font-style: italic;
      max-width: 250px;
      margin-left: auto;
      margin-right: auto;
    }

    .no-tree-data {
      background: white;
      border-radius: 1rem;
      border: 2px dashed #dee2e6;
      margin: 2rem 0;
    }

    @media (max-width: 768px) {
      .family-tree-container {
        padding: 1rem;
      }
      
      .generation-container {
        padding: 1rem;
      }
      
      .couple-unit {
        min-width: 280px;
        padding: 1rem;
      }
      
      .tree-node {
        width: 140px;
        padding: 0.75rem;
      }
      
      .member-name {
        font-size: 0.8rem;
      }
      
      .couple-display {
        flex-direction: column;
        gap: 1rem;
      }
      
      .marriage-connection {
        margin: 0.5rem 0;
      }
      
      .marriage-line {
        height: 20px;
        width: 40px;
      }
    }
  `]
})
export class FamilyTreeComponent implements OnInit {
  @Input() members: FamilyMember[] = [];
  @Input() relationships: Relationship[] = [];
  @Input() canViewBirthDates: boolean = false;

  treeData: TreeNode[] = [];
  selectedMember: FamilyMember | null = null;

  ngOnInit(): void {
    this.buildFamilyTree();
  }

  private buildFamilyTree(): void {
    if (this.members.length === 0) {
      this.treeData = [];
      return;
    }

    // Find root members (those without parents in the relationships)
    const childrenIds = this.relationships
      .filter(rel => rel.relationshipType === 1) // Parent relationships
      .map(rel => rel.relatedMemberId);

    const rootMembers = this.members.filter(member => !childrenIds.includes(member.id));

    this.treeData = rootMembers.map(member => this.buildNodeForMember(member, 0));
  }

  private buildNodeForMember(member: FamilyMember, level: number): TreeNode {
    const children = this.getChildren(member.id);
    const spouse = this.getSpouse(member.id);

    const node: TreeNode = {
      member,
      children: children.map(child => this.buildNodeForMember(child, level + 1)),
      level,
      spouse
    };

    return node;
  }

  private getChildren(memberId: number): FamilyMember[] {
    const childRelationships = this.relationships.filter(
      rel => rel.relationshipType === 1 && rel.primaryMemberId === memberId
    );

    return childRelationships
      .map(rel => this.members.find(m => m.id === rel.relatedMemberId))
      .filter(member => member !== undefined) as FamilyMember[];
  }

  private getSpouse(memberId: number): FamilyMember | undefined {
    const spouseRelationship = this.relationships.find(
      rel => rel.relationshipType === 3 && 
            (rel.primaryMemberId === memberId || rel.relatedMemberId === memberId)
    );

    if (spouseRelationship) {
      const spouseId = spouseRelationship.primaryMemberId === memberId 
        ? spouseRelationship.relatedMemberId 
        : spouseRelationship.primaryMemberId;
      return this.members.find(m => m.id === spouseId);
    }

    return undefined;
  }

  getSimplifiedTree(): CoupleUnit[][] {
    if (this.members.length === 0 || this.relationships.length === 0) {
      return [];
    }

    const generations: CoupleUnit[][] = [];
    const processedMembers = new Set<number>();

    // Find all spouse relationships first
    const spouseRelationships = this.relationships.filter(rel => rel.relationshipType === 3);
    
    // Create couples from spouse relationships
    const couples: CoupleUnit[] = [];
    
    spouseRelationships.forEach(rel => {
      const member1 = this.members.find(m => m.id === rel.primaryMemberId);
      const member2 = this.members.find(m => m.id === rel.relatedMemberId);
      
      if (member1 && member2 && !processedMembers.has(member1.id) && !processedMembers.has(member2.id)) {
        const children = this.getChildrenOfCouple(member1.id, member2.id);
        
        couples.push({
          member1,
          member2,
          children,
          generation: 0 // Will be calculated later
        });
        
        processedMembers.add(member1.id);
        processedMembers.add(member2.id);
      }
    });

    // Add single members who have children
    this.members.forEach(member => {
      if (!processedMembers.has(member.id)) {
        const children = this.getChildren(member.id);
        if (children.length > 0) {
          couples.push({
            member1: member,
            member2: undefined,
            children,
            generation: 0
          });
          processedMembers.add(member.id);
        }
      }
    });

    // If no couples found but we have members, show them as single units
    if (couples.length === 0) {
      this.members.forEach(member => {
        if (!processedMembers.has(member.id)) {
          couples.push({
            member1: member,
            member2: undefined,
            children: this.getChildren(member.id),
            generation: 0
          });
        }
      });
    }

    // For now, put all couples in generation 0 (can be enhanced later)
    if (couples.length > 0) {
      generations.push(couples);
    }

    return generations;
  }

  private getChildrenOfCouple(parent1Id: number, parent2Id: number): FamilyMember[] {
    const parent1Children = this.getChildren(parent1Id);
    const parent2Children = this.getChildren(parent2Id);
    
    // Find common children (children of both parents)
    const commonChildren = parent1Children.filter(child => 
      parent2Children.some(p2Child => p2Child.id === child.id)
    );
    
    return commonChildren;
  }

  getGenerationLabel(index: number): string {
    const labels = [
      'Основатели', 
      'Първо поколение', 
      'Второ поколение', 
      'Трето поколение', 
      'Четвърто поколение'
    ];
    return labels[index] || `${index + 1}-то поколение`;
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

  getChildrenLineWidth(childrenCount: number): number {
    return Math.max(100, childrenCount * 50);
  }

  getChildrenNames(children: FamilyMember[]): string {
    if (!children || children.length === 0) {
      return '';
    }
    return children.map(child => `${child.firstName} ${child.lastName}`).join(', ');
  }

  showMemberDetails(member: FamilyMember): void {
    this.selectedMember = member;
  }

  closeMemberDetails(): void {
    this.selectedMember = null;
  }
}