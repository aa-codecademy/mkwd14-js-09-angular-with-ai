import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsBoolean, IsNumber, IsOptional, IsString, Max, Min } from 'class-validator';

export class CreateStayDto {
  @ApiProperty({ example: 'Cozy loft near the river' })
  @IsString()
  title: string;

  @ApiProperty({ example: 'Skopje, North Macedonia' })
  @IsString()
  location: string;

  @ApiProperty({ example: 68 })
  @IsNumber()
  @Min(0)
  pricePerNight: number;

  @ApiPropertyOptional({ example: 4.8, minimum: 0, maximum: 5 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(5)
  rating?: number;

  @ApiProperty({ example: 'https://picsum.photos/seed/cozy-loft/600/400' })
  @IsString()
  image: string;

  @ApiPropertyOptional({ default: false })
  @IsOptional()
  @IsBoolean()
  superhost?: boolean;

  @ApiProperty({ example: 'A bright, quiet loft two minutes from the old bridge.' })
  @IsString()
  description: string;
}
