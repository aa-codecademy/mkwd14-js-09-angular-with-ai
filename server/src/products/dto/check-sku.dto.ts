import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsInt, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CheckSkuDto {
  @ApiProperty({ example: 'AUDIO-001' })
  @IsString()
  @IsNotEmpty()
  sku: string;

  @ApiPropertyOptional({
    description: 'Product being edited — its own SKU is not reported as taken',
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  excludeId?: number;
}
