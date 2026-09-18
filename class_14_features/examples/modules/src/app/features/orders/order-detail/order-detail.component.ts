import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Order, OrderService } from '../../../core/services/order.service';

@Component({
  selector: 'app-order-detail',
  standalone: false,
  template: `
    <a routerLink="..">← Back to orders</a>
    <app-card *ngIf="order" [title]="'Order #' + order.id">
      <p>Customer: {{ order.customer }}</p>
      <p>Total: {{ order.total | currency }}</p>
      <p><span [appOrderStatus]="order.status">{{ order.status }}</span></p>
    </app-card>
  `,
})
export class OrderDetailComponent implements OnInit {
  order?: Order;

  constructor(
    private route: ActivatedRoute,
    private orderService: OrderService,
  ) {}

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    this.orderService.getById(id).subscribe((order) => (this.order = order));
  }
}
