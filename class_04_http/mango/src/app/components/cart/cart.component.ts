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
  cartService = inject(CartService);

  displayColumns = ['product', 'price', 'quantity', 'subtotal', 'actions'];
}
