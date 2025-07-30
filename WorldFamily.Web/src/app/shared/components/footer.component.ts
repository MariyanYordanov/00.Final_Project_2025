import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatToolbarModule,
    MatIconModule,
    MatButtonModule
  ],
  template: `
    <footer class="app-footer">
      <div class="footer-content">
        <div class="footer-section">
          <h3>World Family</h3>
          <p>Свържете се с вашето семейство и открийте вашата история.</p>
        </div>
        
        <div class="footer-section">
          <h4>Бързи връзки</h4>
          <ul>
            <li><a routerLink="/families">Семейства</a></li>
            <li><a routerLink="/members">Членове</a></li>
            <li><a routerLink="/about">За нас</a></li>
            <li><a routerLink="/contact">Контакти</a></li>
          </ul>
        </div>
        
        <div class="footer-section">
          <h4>Следвайте ни</h4>
          <div class="social-links">
            <button mat-icon-button>
              <mat-icon>facebook</mat-icon>
            </button>
            <button mat-icon-button>
              <mat-icon>twitter</mat-icon>
            </button>
            <button mat-icon-button>
              <mat-icon>instagram</mat-icon>
            </button>
          </div>
        </div>
      </div>
      
      <div class="footer-bottom">
        <p>&copy; 2025 World Family. Всички права запазени.</p>
      </div>
    </footer>
  `,
  styles: [`
    .app-footer {
      background-color: #424242;
      color: white;
      margin-top: auto;
    }

    .footer-content {
      max-width: 1200px;
      margin: 0 auto;
      padding: 40px 16px;
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
      gap: 32px;
    }

    .footer-section h3,
    .footer-section h4 {
      margin-bottom: 16px;
      color: #fff;
    }

    .footer-section h3 {
      font-size: 24px;
      font-weight: 500;
    }

    .footer-section h4 {
      font-size: 18px;
      font-weight: 400;
    }

    .footer-section p {
      color: #ccc;
      line-height: 1.6;
    }

    .footer-section ul {
      list-style: none;
      padding: 0;
      margin: 0;
    }

    .footer-section ul li {
      margin-bottom: 8px;
    }

    .footer-section ul li a {
      color: #ccc;
      text-decoration: none;
      transition: color 0.3s ease;
    }

    .footer-section ul li a:hover {
      color: #fff;
    }

    .social-links {
      display: flex;
      gap: 8px;
    }

    .social-links button {
      color: #ccc;
    }

    .social-links button:hover {
      color: #fff;
    }

    .footer-bottom {
      border-top: 1px solid #555;
      text-align: center;
      padding: 16px;
      color: #ccc;
    }

    @media (max-width: 768px) {
      .footer-content {
        grid-template-columns: 1fr;
        text-align: center;
        padding: 24px 16px;
      }
    }
  `]
})
export class FooterComponent {}