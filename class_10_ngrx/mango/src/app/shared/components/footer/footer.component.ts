import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

// A "dumb"/presentational component - no inputs, no logic, purely static markup extracted into its
// own component for reuse and to keep app.component.html focused on page layout.
@Component({
  selector: 'app-footer',
  imports: [RouterLink],
  templateUrl: './footer.component.html',
  styleUrl: './footer.component.css',
})
export class FooterComponent {}
