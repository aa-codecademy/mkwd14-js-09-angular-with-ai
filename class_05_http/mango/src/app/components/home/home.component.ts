import { Component } from '@angular/core';
import { CardShellComponent } from '../../shared/components/card-shell/card-shell.component';

// This is the component lazy-loaded for the '' (root) route in app.routes.ts.
@Component({
  selector: 'app-home',
  // Must import CardShellComponent here to use <app-card-shell> in the template - standalone
  // components don't automatically "see" each other, each declares its own dependencies.
  imports: [CardShellComponent],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css',
})
// No logic needed here - this component's only job is to compose markup via CardShellComponent.
export class HomeComponent {}
