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
  // Public on purpose - the template reads it directly. There is no local copy of the user
  // here: the component renders straight from the store's signals, so logging out updates
  // this page with no extra wiring.
  auth = inject(AuthStore);
}
