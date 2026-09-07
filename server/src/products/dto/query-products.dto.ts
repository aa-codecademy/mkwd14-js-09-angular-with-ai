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
  @ApiPropertyOptional({ description: 'Filter by featured flag' })
  @IsOptional()
  @Transform(({ value }) => value === 'true' || value === true)
  @IsBoolean()
  featured?: boolean;

  @ApiPropertyOptional({ description: 'Filter by category id' })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  categoryId?: number;

  @ApiPropertyOptional({ description: 'Case-insensitive name search' })
  @IsOptional()
  @IsString()
  search?: string;

  // No default values here on purpose: the service distinguishes "no pagination
  // requested" (returns a plain array) from an explicit page/limit (returns a
  // paginated envelope), which is only possible while these stay undefined.
  @ApiPropertyOptional({ description: 'Defaults to 1 when limit is supplied' })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number;

  @ApiPropertyOptional({ description: 'Defaults to 12 when page is supplied' })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  limit?: number;

  @ApiPropertyOptional({ enum: PRODUCT_SORT_FIELDS })
  @IsOptional()
  @IsIn([...PRODUCT_SORT_FIELDS])
  sortBy?: ProductSortField;

  @ApiPropertyOptional({ enum: ['asc', 'desc'] })
  @IsOptional()
  @IsIn(['asc', 'desc'])
  sortDir?: SortDirection;
}
