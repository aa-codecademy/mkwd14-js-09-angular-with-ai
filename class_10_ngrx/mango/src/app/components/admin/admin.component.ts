import { Component, ChangeDetectionStrategy } from '@angular/core';

// Placeholder landing page for the /admin area - the product list/table goes here next class.
// Note `template: ''` (inline, empty) instead of templateUrl: handy while scaffolding.
@Component({
  selector: 'app-admin',
  template: '',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrl: './admin.component.css',
})
export class AdminComponent {}
