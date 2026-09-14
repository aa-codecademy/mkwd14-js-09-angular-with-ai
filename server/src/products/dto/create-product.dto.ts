import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsArray,
  IsBoolean,
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';

export class CreateProductDto {
  @ApiProperty({ example: 'UltraBook Pro 14' })
  @IsString()
  name: string;

  @ApiPropertyOptional({
    example: 'ultrabook-pro-14',
    description: 'Derived from the name when omitted',
  })
  @IsOptional()
  @IsString()
  slug?: string;

  @ApiProperty({
    example: 'A lightweight 14" laptop with all-day battery life.',
  })
  @IsString()
  description: string;

  @ApiProperty({ example: 1399, minimum: 0, description: 'List price' })
  @IsNumber()
  @Min(0)
  price: number;

  @ApiPropertyOptional({
    example: 10,
    minimum: 0,
    description: 'Percentage off the list price. Defaults to 0.',
  })
  @IsOptional()
  @IsInt()
  @Min(0)
  discountPercent?: number;

  @ApiPropertyOptional({
    type: [String],
    example: [
      'https://picsum.photos/seed/ultrabook-1/600/600',
      'https://picsum.photos/seed/ultrabook-2/600/600',
    ],
    description: 'Gallery images',
  })
  @IsOptional()
  @IsArray()
  images?: string[];

  @ApiPropertyOptional({
    example: 'https://picsum.photos/seed/ultrabook/600/600',
    format: 'uri',
    description: 'Primary thumbnail',
  })
  @IsOptional()
  @IsString()
  image?: string;

  @ApiProperty({
    example: 1,
    description: 'Id of an existing category',
  })
  @IsInt()
  categoryId: number;

  @ApiPropertyOptional({
    example: 24,
    minimum: 0,
    description: 'Units on hand. Defaults to 0.',
  })
  @IsOptional()
  @IsInt()
  @Min(0)
  stock?: number;

  @ApiPropertyOptional({
    example: 'AUDIO-001',
    description: 'Stock keeping unit; must be unique across products',
  })
  @IsOptional()
  @IsString()
  sku?: string;

  @ApiPropertyOptional({
    default: false,
    example: true,
    description: 'Show the product on the storefront home page',
  })
  @IsOptional()
  @IsBoolean()
  featured?: boolean;
}
