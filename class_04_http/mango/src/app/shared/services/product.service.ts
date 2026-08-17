import { Injectable } from '@angular/core';
import type { Product } from '../../core/models/product.model';
import { BehaviorSubject, type Observable } from 'rxjs';

// providedIn: 'root' registers this service with Angular's dependency injection system as a single,
// app-wide singleton - every component that `inject()`s it shares the exact same instance and data.
@Injectable({ providedIn: 'root' })
export class ProductService {
  // BehaviorSubject keeps the "current" list in memory and immediately emits it to new subscribers -
  // this is what lets multiple components (navbar count, product list) stay in sync automatically.
  private _products: BehaviorSubject<Product[]> = new BehaviorSubject([
    {
      id: 1,
      name: 'Premium Wireless Headphones',
      description:
        'Experience immersive audio with our flagship noise-cancelling headphones. 30-hour battery life, premium drivers.',
      price: 199,
      discountPercent: 10,
      image: 'https://picsum.photos/seed/headphones/600/400',
      stock: 15,
      featured: true,
    },
    {
      id: 2,
      name: 'Mechanical Keyboard RGB',
      description:
        'RGB backlit mechanical keyboard with Cherry MX switches. Perfect for gaming and productivity.',
      price: 149,
      discountPercent: 0,
      image: 'https://picsum.photos/seed/keyboard/600/400',
      stock: 8,
      featured: true,
    },
    {
      id: 3,
      name: 'Smart Watch Pro',
      description:
        'Track fitness, receive notifications, and stay connected. Health monitoring, GPS, water-resistant to 50m.',
      price: 299,
      discountPercent: 15,
      image: 'https://picsum.photos/seed/watch/600/400',
      stock: 0,
      featured: false,
    },
    {
      id: 4,
      name: 'USB-C Hub 7-in-1',
      description:
        'Expand your laptop with 4K HDMI, USB 3.0, SD card reader, and 100W PD charging.',
      price: 59,
      discountPercent: 0,
      image: 'https://picsum.photos/seed/hub/600/400',
      stock: 25,
      featured: false,
    },
    {
      id: 5,
      name: 'Laptop Stand Aluminum',
      description:
        'Adjustable aluminum stand for laptops up to 17 inches. Improves posture and airflow.',
      price: 49,
      discountPercent: 20,
      image: 'https://picsum.photos/seed/stand/600/400',
      stock: 30,
      featured: true,
    },
    {
      id: 6,
      name: 'Wireless Charging Pad',
      description:
        'Fast wireless charging pad compatible with all Qi-enabled devices. 15W max output.',
      price: 35,
      discountPercent: 0,
      image: 'https://picsum.photos/seed/charger/600/400',
      stock: 42,
      featured: false,
    },
  ]);

  // Exposing an Observable (not the BehaviorSubject itself) hides the `.next()` write API from
  // consumers - they can only read/react to values, not push new ones directly.
  products(): Observable<Product[]> {
    return this._products.asObservable();
  }

  // Spreads the existing array into a new one rather than mutating in place - emitting a new
  // reference is what triggers subscribers (and change detection) to notice the update.
  addProduct(product: Product) {
    this._products.next([...this._products.getValue(), product]);
  }
}
