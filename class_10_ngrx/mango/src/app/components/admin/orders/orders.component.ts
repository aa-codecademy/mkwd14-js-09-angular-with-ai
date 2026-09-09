import { Component, inject } from '@angular/core';
import { AdminOrdersStore } from '../../../store/orders/admin-orders.store';
import { RouterLink } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { MatAnchor, MatIconButton } from '@angular/material/button';
import { MatTable, MatTableModule } from '@angular/material/table';
import { MatSortModule } from '@angular/material/sort';
import { DatePipe } from '@angular/common';

@Component({
  imports: [
    RouterLink,
    MatIconModule,
    MatAnchor,
    MatTable,
    MatTableModule,
    MatSortModule,
    MatIconButton,
    DatePipe,
  ],
  selector: 'app-orders',
  styleUrl: './orders.component.css',
  templateUrl: './orders.component.html',
})
export class OrdersComponent {
  protected readonly store = inject(AdminOrdersStore);

  displayedColumns = ['expand', 'id', 'createdAt', 'customer'];

  onSortChange(event: any) {}
}
