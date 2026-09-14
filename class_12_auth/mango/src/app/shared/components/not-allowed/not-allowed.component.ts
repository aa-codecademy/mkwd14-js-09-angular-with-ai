import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { MatAnchor, MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-not-allowed',
  imports: [RouterLink, MatAnchor, MatButtonModule, MatIconModule],
  styleUrl: './not-allowed.component.css',
  templateUrl: './not-allowed.component.html',
})
export class NotAllowedComponent {}
