import { Type } from 'class-transformer';
import { IsInt, IsOptional, Max, Min } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { DEFAULT_PRODUCT_COUNT } from '../seed-data';

export class SeedQueryDto {
  @ApiPropertyOptional({
    description: 'How many products the table should end up with.',
    default: DEFAULT_PRODUCT_COUNT,
    minimum: 1,
    maximum: 10000,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(10000)
  count?: number = DEFAULT_PRODUCT_COUNT;
}
