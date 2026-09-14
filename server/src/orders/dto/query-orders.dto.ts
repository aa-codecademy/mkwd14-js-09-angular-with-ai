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
  @ApiPropertyOptional({
    enum: ORDER_STATUSES,
    enumName: 'OrderStatus',
    example: 'PENDING',
    description: 'Only return orders currently in this status',
  })
  @IsOptional()
  @IsIn([...ORDER_STATUSES])
  status?: OrderStatus;

  @ApiPropertyOptional({
    type: Number,
    example: 1,
    minimum: 1,
    default: 1,
    description: '1-based page number',
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number;

  @ApiPropertyOptional({
    type: Number,
    example: 20,
    minimum: 1,
    default: 20,
    description: 'Orders per page',
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  limit?: number;

  @ApiPropertyOptional({
    enum: ORDER_SORT_FIELDS,
    enumName: 'OrderSortField',
    example: 'createdAt',
    default: 'createdAt',
    description: 'Column to sort by',
  })
  @IsOptional()
  @IsIn([...ORDER_SORT_FIELDS])
  sortBy?: OrderSortField;

  @ApiPropertyOptional({
    enum: ['asc', 'desc'],
    enumName: 'SortDirection',
    example: 'desc',
    default: 'desc',
    description: 'Sort direction',
  })
  @IsOptional()
  @IsIn(['asc', 'desc'])
  sortDir?: 'asc' | 'desc';
}
