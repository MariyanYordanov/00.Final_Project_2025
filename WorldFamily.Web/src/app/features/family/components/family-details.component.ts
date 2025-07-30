import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-family-details',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="details-container">
      <h1>Детайли за семейството</h1>
      <p>Тук ще бъдат показани детайлите за конкретно семейство.</p>
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
export class FamilyDetailsComponent {}