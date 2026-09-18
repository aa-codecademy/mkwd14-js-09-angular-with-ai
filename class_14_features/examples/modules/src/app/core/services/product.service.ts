import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';

export interface Product {
  id: number;
  name: string;
  price: number;
  description: string;
}

// Provided in CoreModule (see core.module.ts) instead of `providedIn: 'root'`,
// so students can see the classic "module provides the service" wiring.
@Injectable()
export class ProductService {
  private products: Product[] = [
    { id: 1, name: 'Hario V60 Ceramic Dripper', price: 24.5, description: 'Cone dripper for pour-over brewing, size 02.' },
    { id: 2, name: 'Baratza Encore Grinder', price: 169.0, description: 'Conical burr grinder with 40 grind settings.' },
    { id: 3, name: 'Fellow Stagg EKG Kettle', price: 165.0, description: 'Gooseneck kettle with variable temperature control.' },
    { id: 4, name: 'Acaia Pearl Scale', price: 145.0, description: 'Brewing scale with built-in timer and flow display.' },
  ];

  getAll(): Observable<Product[]> {
    return of(this.products);
  }

  getById(id: number): Observable<Product | undefined> {
    return of(this.products.find((p) => p.id === id));
  }
}
