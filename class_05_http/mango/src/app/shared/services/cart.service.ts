import { Injectable } from '@angular/core';
import type { CartItem } from '../../core/models/cart-item.model';
import type { Product } from '../../core/models/product.model';

// providedIn: 'root' makes this a single app-wide instance, similar in spirit to a React context
// provider at the app root - except here every component just calls `inject(CartService)` instead of
// wrapping the tree in a <Provider> and calling useContext(). Navbar and CartComponent both read the
// same in-memory list, so adding an item anywhere updates the badge and the cart page in sync.
@Injectable({ providedIn: 'root' })
export class CartService {
  // No backend persistence here - the cart lives only in memory and resets on page reload.
  private _items: CartItem[] = [];

  get items(): CartItem[] {
    return this._items;
  }

  get itemsCount(): number {
    return this._items.length;
  }

  get total(): number {
    return this._items.reduce((sum, item) => {
      const price = item.product.price * (1 - item.product.discountPercent / 100);
      return sum + price * item.quantity;
    }, 0);
  }

  add(product: Product, quantity = 1) {
    const existing = this.items.find((i) => i.product.id === product.id);

    // Gotcha: we reassign `this._items` to a brand-new array (via .map/.filter/spread) rather than
    // mutating it in place (e.g. `this._items.push(...)`). Angular's change detection compares
    // references for things like the mat-table [dataSource] binding, so mutating the existing array
    // in place could leave the UI stale even though the data technically changed.
    if (existing) {
      this._items = this.items.map((i) => {
        if (i.product.id === product.id) {
          return {
            ...i,
            quantity: i.quantity + 1,
          };
        }
        return i;
      });
    } else {
      this._items = [...this.items, { product, quantity }];
    }
  }

  remove(productId: number) {
    this._items = this.items.filter((i) => i.product.id !== productId);
  }

  updateQuantity(productId: number, quantity: number) {
    if (quantity <= 0) {
      this.remove(productId);
      return;
    }

    this._items = this._items.map((i) => {
      if (i.product.id === productId) {
        return {
          ...i,
          quantity,
        };
      }
      return i;
    });
  }

  clear() {
    this._items = [];
  }
}
