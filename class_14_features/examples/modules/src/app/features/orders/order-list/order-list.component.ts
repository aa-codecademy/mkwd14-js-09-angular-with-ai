import { Component, OnInit } from '@angular/core';
import { Order, OrderService } from '../../../core/services/order.service';

@Component({
  selector: 'app-order-list',
  standalone: false,
  template: `
    <h2>Orders</h2>
    <app-card *ngFor="let order of orders" [title]="'Order #' + order.id">
      <p>{{ order.customer }} — {{ order.total | currency }}</p>
      <p><span [appOrderStatus]="order.status">{{ order.status }}</span></p>
      <a [routerLink]="[order.id]">Details</a>
    </app-card>
  `,
})
export class OrderListComponent implements OnInit {
  orders: Order[] = [];

  constructor(private orderService: OrderService) {}

  ngOnInit(): void {
    this.orderService.getAll().subscribe((orders) => (this.orders = orders));
  }
}
