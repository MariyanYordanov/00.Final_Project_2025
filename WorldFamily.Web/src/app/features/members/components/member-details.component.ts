import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-member-details',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="details-container">
      <h1>Детайли за член</h1>
      <p>Тук ще бъдат показани детайлите за конкретен член на семейството.</p>
    </div>
  `,
  styles: [`
    .details-container {
      padding: 24px;
      max-width: 1200px;
      margin: 0 auto;
    }
  `]
})
export class MemberDetailsComponent {}