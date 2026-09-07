import { Component, inject } from '@angular/core';
import { CartService } from '../../shared/services/cart.service';
import { MatIcon, MatIconModule } from '@angular/material/icon';
import { RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatTableModule } from '@angular/material/table';
import { CurrencyPipe } from '@angular/common';

@Component({
  selector: 'app-cart',
  templateUrl: './cart.component.html',
  styleUrl: './cart.component.css',
  imports: [MatIconModule, RouterLink, MatButtonModule, MatTableModule, CurrencyPipe],
})
export class CartComponent {
  // Public (not private) because the template reads cartService.items/total directly -
  // same singleton instance injected in NavbarComponent, so both stay in sync automatically.
  cartService = inject(CartService);

  // mat-table needs an explicit array of column keys matching each matColumnDef in the template -
  // this both defines and orders the table's columns.
  displayColumns = ['product', 'price', 'quantity', 'subtotal', 'actions'];
}
