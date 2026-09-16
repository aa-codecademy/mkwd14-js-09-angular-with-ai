import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { MatAnchor, MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

// A plain presentational component - no logic, no store, no inputs. adminGuard redirects
// here with a UrlTree, so the browser URL really is /not-allowed and the page is refreshable
// and shareable, unlike an error message rendered in place.
@Component({
  selector: 'app-not-allowed',
  imports: [RouterLink, MatAnchor, MatButtonModule, MatIconModule],
  styleUrl: './not-allowed.component.css',
  templateUrl: './not-allowed.component.html',
})
export class NotAllowedComponent {}
