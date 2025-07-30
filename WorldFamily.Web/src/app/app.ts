import { Component } from '@angular/core';
import { MainLayoutComponent } from './layouts/main/main-layout.component';

@Component({
  selector: 'app-root',
  imports: [MainLayoutComponent],
  template: '<app-main-layout></app-main-layout>'
})
export class App {}
