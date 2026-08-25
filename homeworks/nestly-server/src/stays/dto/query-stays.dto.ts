import { ApiPropertyOptional } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';
import { IsBoolean, IsIn, IsInt, IsOptional, IsString, Min } from 'class-validator';

export type StaySortField = 'title' | 'pricePerNight' | 'rating' | 'createdAt';
export type SortDirection = 'asc' | 'desc';

export class QueryStaysDto {
  @ApiPropertyOptional({ description: 'Only return superhost stays' })
  @IsOptional()
  @Transform(({ value }) => value === 'true' || value === true)
  @IsBoolean()
  superhost?: boolean;

  @ApiPropertyOptional({ description: 'Case-insensitive search across title and location' })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({ default: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @ApiPropertyOptional({ default: 12 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  limit?: number = 12;

  @ApiPropertyOptional({ enum: ['title', 'pricePerNight', 'rating', 'createdAt'] })
  @IsOptional()
  @IsIn(['title', 'pricePerNight', 'rating', 'createdAt'])
  sortBy?: StaySortField;

  @ApiPropertyOptional({ enum: ['asc', 'desc'] })
  @IsOptional()
  @IsIn(['asc', 'desc'])
  sortDir?: SortDirection;
}
