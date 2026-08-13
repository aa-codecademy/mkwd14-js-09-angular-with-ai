import { Component } from '@angular/core';
import { MatCardModule } from '@angular/material/card';

// A "shell" / layout component - it has no state or logic of its own, it just wraps Angular Material's
// mat-card and exposes projection slots so any content can be dropped into a consistent card layout.
@Component({
  selector: 'app-card-shell',
  templateUrl: './card-shell.component.html',
  styleUrl: './card-shell.component.css',
  imports: [MatCardModule],
})
export class CardShellComponent {}
