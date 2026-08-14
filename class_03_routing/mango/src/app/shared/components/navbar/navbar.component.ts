import { Component, inject } from '@angular/core';
import { MatBadgeModule } from '@angular/material/badge';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatToolbarModule } from '@angular/material/toolbar';
import { RouterLink } from '@angular/router';
import { ProductService } from '../../services/product.service';

// Each MatXModule below unlocks one specific Material directive/component used in the template -
// Angular Material is modular, so you only import what you actually use (toolbar, icon, button, badge).
@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.css',
  imports: [MatToolbarModule, MatIconModule, MatButtonModule, MatBadgeModule, RouterLink],
})
export class NavbarComponent {
  // Same ProductService singleton injected in ProductListComponent - because it's providedIn: 'root',
  // both components read/write the exact same underlying data, so the badge count stays in sync.
  private productService = inject(ProductService);
  productCount: number = 0;

  // Subscribes on init and never unsubscribes - fine here because NavbarComponent lives for the
  // whole app lifetime, but the same pattern in a routed component would need cleanup (see ngOnDestroy
  // in ProductListComponent).
  ngOnInit() {
    this.productService.products().subscribe((products) => {
      this.productCount = products.length;
    });
  }
}
