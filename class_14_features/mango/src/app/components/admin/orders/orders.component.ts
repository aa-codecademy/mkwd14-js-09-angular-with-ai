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
import { TranslatePipe } from '@ngx-translate/core';
import { TranslateService } from '@ngx-translate/core';

@Component({
  imports: [
    TranslatePipe,
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
  private readonly translate = inject(TranslateService);
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

  // Same confirmation flow as the customer page, but this one cancels SOMEONE ELSE'S order -
  // all the more reason to make the admin click twice.
  async handleCancel(order: Order) {
    const confirmation = await this.confirmationService.confirm(
      this.translate.instant('admin.confirmCancelTitle', { id: order.id }),
      this.translate.instant('admin.confirmCancelMessage'),
      this.translate.instant('admin.confirmCancelLabel'),
    );

    // Say no and we simply never reach the store call - the order is untouched.
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
