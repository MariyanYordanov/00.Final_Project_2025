import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-family-catalog',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="catalog-container">
      <h1>Каталог на семейства</h1>
      <p>Тук ще бъдат показани всички семейства.</p>
    </div>
  `,
  styles: [`
    .catalog-container {
      padding: 24px;
      max-width: 1200px;
      margin: 0 auto;
    }
  `]
})
export class FamilyCatalogComponent {}