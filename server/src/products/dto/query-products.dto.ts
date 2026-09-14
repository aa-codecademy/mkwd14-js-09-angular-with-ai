import { ApiPropertyOptional } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';
import {
  IsBoolean,
  IsIn,
  IsInt,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';

export const PRODUCT_SORT_FIELDS = [
  'id',
  'name',
  'sku',
  'price',
  'discountPercent',
  'stock',
  'rating',
  'reviewCount',
  'featured',
  'createdAt',
] as const;

export type ProductSortField = (typeof PRODUCT_SORT_FIELDS)[number];
export type SortDirection = 'asc' | 'desc';

export class QueryProductsDto {
  @ApiPropertyOptional({
    type: Boolean,
    example: true,
    description: 'Filter by featured flag',
  })
  @IsOptional()
  @Transform(({ value }) => value === 'true' || value === true)
  @IsBoolean()
  featured?: boolean;

  @ApiPropertyOptional({
    type: Number,
    example: 1,
    description: 'Filter by category id',
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  categoryId?: number;

  @ApiPropertyOptional({
    type: String,
    example: 'ultrabook',
    description: 'Case-insensitive substring match on the product name',
  })
  @IsOptional()
  @IsString()
  search?: string;

  // No default values here on purpose: the service distinguishes "no pagination
  // requested" (returns a plain array) from an explicit page/limit (returns a
  // paginated envelope), which is only possible while these stay undefined.
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
    example: 12,
    minimum: 1,
    default: 12,
    description: 'Products per page',
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  limit?: number;

  @ApiPropertyOptional({
    enum: PRODUCT_SORT_FIELDS,
    enumName: 'ProductSortField',
    example: 'price',
    default: 'id',
    description: 'Column to sort by',
  })
  @IsOptional()
  @IsIn([...PRODUCT_SORT_FIELDS])
  sortBy?: ProductSortField;

  @ApiPropertyOptional({
    enum: ['asc', 'desc'],
    enumName: 'SortDirection',
    example: 'asc',
    default: 'asc',
    description: 'Sort direction',
  })
  @IsOptional()
  @IsIn(['asc', 'desc'])
  sortDir?: SortDirection;
}
