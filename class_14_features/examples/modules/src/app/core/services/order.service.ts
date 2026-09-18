import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';

export interface Order {
  id: number;
  customer: string;
  total: number;
  status: 'pending' | 'shipped' | 'delivered';
}

@Injectable()
export class OrderService {
  private orders: Order[] = [
    { id: 1041, customer: 'Marta Nikolovska', total: 193.5, status: 'delivered' },
    { id: 1042, customer: 'Stefan Ilievski', total: 165.0, status: 'shipped' },
    { id: 1043, customer: 'Ana Trajkova', total: 24.5, status: 'pending' },
  ];

  getAll(): Observable<Order[]> {
    return of(this.orders);
  }

  getById(id: number): Observable<Order | undefined> {
    return of(this.orders.find((o) => o.id === id));
  }
}
