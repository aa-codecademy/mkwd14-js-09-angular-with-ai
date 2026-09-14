import { ApiProperty } from '@nestjs/swagger';
import { IsIn } from 'class-validator';
import { ORDER_STATUSES } from '../order.entity';
import type { OrderStatus } from '../order.entity';

export class UpdateOrderStatusDto {
  @ApiProperty({
    enum: ORDER_STATUSES,
    enumName: 'OrderStatus',
    example: 'SHIPPED',
    description:
      'The status to move to. Allowed moves: PENDING -> SHIPPED (admin) or ' +
      'CANCELLED (admin or owner), SHIPPED -> DELIVERED (admin or owner). ' +
      'DELIVERED and CANCELLED are final.',
  })
  @IsIn([...ORDER_STATUSES])
  status: OrderStatus;
}
