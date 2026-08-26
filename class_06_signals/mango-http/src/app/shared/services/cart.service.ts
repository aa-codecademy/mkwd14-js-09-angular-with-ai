import { computed, effect, Injectable, signal } from '@angular/core';
import type { CartItem } from '../../core/models/cart-item.model';
import type { Product } from '../../core/models/product.model';

@Injectable({ providedIn: 'root' })
export class CartService {
  items = signal<CartItem[]>(this.#loadStoredItems());

  itemsCount = computed(() => this.items().reduce((total, item) => total + item.quantity, 0));

  total = computed(() =>
    this.items().reduce((sum, item) => {
      const price = item.product.price * (1 - item.product.discountPercent / 100);
      return sum + price * item.quantity;
    }, 0),
  );

  constructor() {
    effect(() => {
      localStorage.setItem('cart', JSON.stringify(this.items()));
    });
  }

  #loadStoredItems() {
    try {
      const raw = localStorage.getItem('cart');
      if (!raw) {
        return [];
      }

      return JSON.parse(raw);
    } catch {
      return [];
    }
  }

  add(product: Product, quantity = 1) {
    const existing = this.items().find((i) => i.product.id === product.id);

    if (existing) {
      this.items.update((items) =>
        items.map((i) => {
          if (i.product.id === product.id) {
            return {
              ...i,
              quantity: i.quantity + 1,
            };
          }
          return i;
        }),
      );
    } else {
      this.items.update((items) => [...items, { product, quantity }]);
    }
  }

  remove(productId: number) {
    this.items.update((items) => items.filter((i) => i.product.id !== productId));
  }

  updateQuantity(productId: number, quantity: number) {
    if (quantity <= 0) {
      this.remove(productId);
      return;
    }

    this.items.update((items) =>
      items.map((i) => {
        if (i.product.id === productId) {
          return {
            ...i,
            quantity,
          };
        }
        return i;
      }),
    );
  }

  clear() {
    this.items.set([]);
  }
}
