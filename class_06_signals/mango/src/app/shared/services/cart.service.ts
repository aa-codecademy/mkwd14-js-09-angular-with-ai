import { Injectable } from '@angular/core';
import type { CartItem } from '../../core/models/cart-item.model';
import type { Product } from '../../core/models/product.model';

@Injectable({ providedIn: 'root' })
// Deliberately NOT using signal() here - state is a plain private array plus getters. This works
// because templates that read cartService.items/total re-run on every change detection pass anyway
// (Material's mat-table and the *ngIf-style @if blocks trigger CD), but unlike a signal it gives you
// no fine-grained reactivity and no computed()-style memoization - each getter re-runs its full body
// on every read, even if nothing changed. Compare with ProductListComponent's `computed()` usage.
export class CartService {
  private _items: CartItem[] = [];

  get items(): CartItem[] {
    return this._items;
  }

  get itemsCount(): number {
    return this._items.length;
  }

  // Recalculates the whole sum from scratch on every single read (e.g. every time the template
  // re-renders) - a computed(signal) would instead cache this and only recompute when its
  // dependencies (the items array) actually change.
  get total(): number {
    return this._items.reduce((sum, item) => {
      const price = item.product.price * (1 - item.product.discountPercent / 100);
      return sum + price * item.quantity;
    }, 0);
  }

  // Reassigns `_items` to a brand-new array instead of mutating in place (e.g. push()) - the same
  // "treat state as immutable" discipline signals enforce via .set()/.update(), just done by hand here.
  add(product: Product, quantity = 1) {
    const existing = this.items.find((i) => i.product.id === product.id);

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
