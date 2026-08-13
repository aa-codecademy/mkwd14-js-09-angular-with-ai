import { Component } from '@angular/core';
import { MatBadgeModule } from '@angular/material/badge';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatToolbarModule } from '@angular/material/toolbar';

// Each MatXModule below unlocks one specific Material directive/component used in the template -
// Angular Material is modular, so you only import what you actually use (toolbar, icon, button, badge).
@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.css',
  imports: [MatToolbarModule, MatIconModule, MatButtonModule, MatBadgeModule],
})
export class NavbarComponent {}
