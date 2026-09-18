import { NgModule } from '@angular/core';

import { SharedModule } from '../../shared/shared.module';
import { OrdersRoutingModule } from './orders-routing.module';
import { OrderListComponent } from './order-list/order-list.component';
import { OrderDetailComponent } from './order-detail/order-detail.component';
import { OrderStatusDirective } from './order-status.directive';

@NgModule({
  declarations: [OrderListComponent, OrderDetailComponent, OrderStatusDirective],
  imports: [SharedModule, OrdersRoutingModule],
})
export class OrdersModule {}
