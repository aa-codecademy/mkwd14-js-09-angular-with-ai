import { ApiProperty } from '@nestjs/swagger';
import { IsIn } from 'class-validator';
import { ORDER_STATUSES } from '../order.entity';
import type { OrderStatus } from '../order.entity';

export class UpdateOrderStatusDto {
  @ApiProperty({ enum: ORDER_STATUSES, example: 'SHIPPED' })
  @IsIn([...ORDER_STATUSES])
  status: OrderStatus;
}
