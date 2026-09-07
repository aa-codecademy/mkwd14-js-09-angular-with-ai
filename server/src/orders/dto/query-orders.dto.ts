import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsIn, IsInt, IsOptional, Min } from 'class-validator';
import { ORDER_STATUSES } from '../order.entity';
import type { OrderStatus } from '../order.entity';

export const ORDER_SORT_FIELDS = [
  'id',
  'total',
  'status',
  'createdAt',
] as const;

export type OrderSortField = (typeof ORDER_SORT_FIELDS)[number];

export class QueryOrdersDto {
  @ApiPropertyOptional({ enum: ORDER_STATUSES })
  @IsOptional()
  @IsIn([...ORDER_STATUSES])
  status?: OrderStatus;

  @ApiPropertyOptional({ description: 'Defaults to 1' })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number;

  @ApiPropertyOptional({ description: 'Defaults to 20' })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  limit?: number;

  @ApiPropertyOptional({ enum: ORDER_SORT_FIELDS })
  @IsOptional()
  @IsIn([...ORDER_SORT_FIELDS])
  sortBy?: OrderSortField;

  @ApiPropertyOptional({ enum: ['asc', 'desc'] })
  @IsOptional()
  @IsIn(['asc', 'desc'])
  sortDir?: 'asc' | 'desc';
}
