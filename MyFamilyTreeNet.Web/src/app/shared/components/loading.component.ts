import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatProgressBarModule } from '@angular/material/progress-bar';

@Component({
  selector: 'app-loading',
  standalone: true,
  imports: [
    CommonModule,
    MatProgressSpinnerModule,
    MatProgressBarModule
  ],
  template: `
    <div class="loading-container" [ngClass]="{'fullscreen': fullscreen, 'inline': !fullscreen}">
      <div class="loading-content">
        <mat-spinner 
          [diameter]="diameter" 
          [color]="color"
          *ngIf="type === 'spinner'">
        </mat-spinner>
        
        <mat-progress-bar 
          mode="indeterminate" 
          [color]="color"
          *ngIf="type === 'bar'">
        </mat-progress-bar>
        
        <p class="loading-text" *ngIf="message">{{ message }}</p>
      </div>
    </div>
  `,
  styles: [`
    .loading-container {
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .loading-container.fullscreen {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background-color: rgba(255, 255, 255, 0.8);
      z-index: 9999;
    }

    .loading-container.inline {
      padding: 20px;
      min-height: 100px;
    }

    .loading-content {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 16px;
    }

    .loading-text {
      margin: 0;
      color: #666;
      font-size: 14px;
      text-align: center;
    }

    mat-progress-bar {
      width: 200px;
    }
  `]
})
export class LoadingComponent {
  @Input() type: 'spinner' | 'bar' = 'spinner';
  @Input() fullscreen = false;
  @Input() message = '';
  @Input() diameter = 40;
  @Input() color: 'primary' | 'accent' | 'warn' = 'primary';
}