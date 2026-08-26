import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { MatAnchor, MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-not-found',
  imports: [MatIconModule, RouterLink, MatAnchor, MatButtonModule],
  templateUrl: './not-found.component.html',
  styleUrl: './not-found.component.css',
})
export class NotFound {}
