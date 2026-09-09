import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { MatAnchor, MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { PaginationComponent } from '../../shared/components/pagination/pagination.component';
import { AdminProductsStore } from '../../store/products/admin-products.store';

// Placeholder landing page for the /admin area - the product list/table goes here next class.
// Note `template: ''` (inline, empty) instead of templateUrl: handy while scaffolding.
@Component({
  selector: 'app-admin',
  templateUrl: './admin.component.html',
  styleUrl: './admin.component.css',
  imports: [
    RouterLink,
    MatAnchor,
    MatIconModule,
    MatButtonModule,
    MatTableModule,
    PaginationComponent,
  ],
})
export class AdminComponent {
  readonly store = inject(AdminProductsStore);
  displayColumns = ['name', 'price', 'stock', 'actions'];
}
