import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-member-list',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="list-container">
      <h1>Списък с членове</h1>
      <p>Тук ще бъдат показани всички членове на семействата.</p>
    </div>
  `,
  styles: [`
    .list-container {
      padding: 24px;
      max-width: 1200px;
      margin: 0 auto;
    }
  `]
})
export class MemberListComponent {}