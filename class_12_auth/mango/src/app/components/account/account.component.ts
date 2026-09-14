import { Component, inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { RouterLink } from '@angular/router';
import { AuthStore } from '../../store/auth/auth.store';

@Component({
  imports: [MatCardModule, MatButtonModule, MatIconModule, RouterLink],
  selector: 'app-account',
  styleUrl: './account.component.css',
  templateUrl: './account.component.html',
})
export class AccountComponent {
  auth = inject(AuthStore)
}
