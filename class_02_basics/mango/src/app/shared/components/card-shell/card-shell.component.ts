import { Component } from '@angular/core';
import { MatCardModule } from '@angular/material/card';

@Component({
  selector: 'app-card-shell',
  templateUrl: './card-shell.component.html',
  styleUrl: './card-shell.component.css',
  imports: [MatCardModule],
})
export class CardShellComponent {}
