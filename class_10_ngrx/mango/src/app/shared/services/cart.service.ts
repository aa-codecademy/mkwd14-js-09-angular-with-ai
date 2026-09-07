import { computed, effect, Injectable, signal } from '@angular/core';
import type { CartItem } from '../../core/models/cart-item.model';
import type { Product } from '../../core/models/product.model';

// Signals replace the class_05 BehaviorSubject-based cart state: `items` is the single source of
// truth, and itemsCount/total are computed() signals derived from it. computed() only
// recalculates when a signal it reads actually changes, and caches the result otherwise - so
// prefer computed() over a plain method for derived values instead of recalculating on every read.
@Injectable({ providedIn: 'root' })
export class CartService {
  // Gotcha: signals are read by CALLING them as functions - `items()`, not `items`. Forgetting
  // the parentheses gives you the WritableSignal object itself, not its current value.
  items = signal<CartItem[]>(this.loadStoredItems());

  itemsCount = computed(() => this.items().reduce((total, item) => total + item.quantity, 0));

  total = computed(() =>
    this.items().reduce((sum, item) => {
      const price = item.product.price * (1 - item.product.discountPercent / 100);
      return sum + price * item.quantity;
    }, 0),
  );

  constructor() {
    // effect() re-runs whenever any signal it reads changes - here it's used as a side effect
    // (persisting to localStorage), not to compute a value. That's the key distinction from
    // computed(): use computed() for derived VALUES, effect() for side effects like this.
    effect(() => {
      localStorage.setItem('cart', JSON.stringify(this.items()));
    });
  }

  private loadStoredItems() {
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
