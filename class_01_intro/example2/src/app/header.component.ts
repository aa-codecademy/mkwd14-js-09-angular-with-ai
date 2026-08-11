import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  // CommonModule brings in the classic structural directives (*ngFor, *ngIf, etc.)
  // used in the template below. Note: newer code tends to use @for/@if instead,
  // which don't need this import — this file shows the older/module-based style.
  imports: [CommonModule],
})
export class Header {
  navLinks = ['Home', 'About', 'Contact'];
  isLoggedIn = false;
}
