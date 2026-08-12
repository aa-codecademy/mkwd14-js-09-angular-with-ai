import { Component } from '@angular/core';
import { NavbarComponent } from './shared/components/navbar/navbar.component';
import { CardShellComponent } from './shared/components/card-shell/card-shell.component';
import { MatButtonModule } from '@angular/material/button';
import type { Product } from './core/models/product.model';
import { JsonPipe } from '@angular/common';
import { FooterComponent } from "./shared/components/footer/footer.component";

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrl: './app.component.css',
  imports: [NavbarComponent, CardShellComponent, MatButtonModule, JsonPipe, FooterComponent],
})
export class AppComponent {
  products: Product[] = [
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
  ];
}
