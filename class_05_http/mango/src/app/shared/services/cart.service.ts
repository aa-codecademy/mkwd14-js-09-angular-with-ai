import { Injectable } from '@angular/core';
import type { CartItem } from '../../core/models/cart-item.model';
import type { Product } from '../../core/models/product.model';

@Injectable({ providedIn: 'root' })
export class CartService {
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
