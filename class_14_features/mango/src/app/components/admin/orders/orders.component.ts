import { Component, inject } from '@angular/core';
import { AdminOrdersStore } from '../../../store/orders/admin-orders.store';
import { RouterLink } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { MatAnchor, MatIconButton } from '@angular/material/button';
import { MatTable, MatTableModule } from '@angular/material/table';
import { MatSortModule, type Sort } from '@angular/material/sort';
import { CurrencyPipe, DatePipe } from '@angular/common';
import type { Order, OrderItem } from '../../../core/models/order.model';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { PaginationComponent } from '../../../shared/components/pagination/pagination.component';
import type { SortDirection } from '../../../core/types/sort-direction.type';
import { ConfirmationService } from '../../../shared/services/confimation.service';

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
    CurrencyPipe,
    MatFormFieldModule,
    MatSelectModule,
    PaginationComponent,
  ],
  selector: 'app-orders',
  styleUrl: './orders.component.css',
  templateUrl: './orders.component.html',
})
export class OrdersComponent {
  // Injecting the store is all the setup this page needs: the store's onInit already kicked
  // off the fetch, so there's no ngOnInit and nothing to unsubscribe from here.
  protected readonly store = inject(AdminOrdersStore);
  protected readonly confirmationService = inject(ConfirmationService);

  // mat-table renders columns in THIS array's order, matching each entry to a
  // matColumnDef of the same name. Forget a name here and that column silently won't render.
  displayedColumns = [
    'expand',
    'id',
    'createdAt',
    'customer',
    'shipTo',
    'items',
    'total',
    'status',
    'actions',
  ];

  async handleCancel(order: Order) {
    const confirmation = await this.confirmationService.confirm(
      `Are you sure you want to cancel order #${order.id}`,
      `This action is irreversible`,
      'Cancel Order',
    );

    if (!confirmation) {
      return;
    }

    this.store.updateStatus({ order, newStatus: 'CANCELLED' });
  }

  onSortChange(event: Sort) {
    this.store.setSortBy(event.active);
    this.store.setSortDir(event.direction as SortDirection);
  }

  itemCount(items: OrderItem[] = []): number {
    return items.reduce((sum, item) => sum + item.quantity, 0);
  }
}
