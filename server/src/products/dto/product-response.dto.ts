import { ApiProperty } from '@nestjs/swagger';
import { PaginationMetaDto } from '../../common/dto/paginated.dto';
import { Product } from '../product.entity';

/** The envelope GET /products always returns — never a bare array. */
export class PaginatedProductsDto extends PaginationMetaDto {
  @ApiProperty({ type: [Product], description: 'Products on the current page' })
  data: Product[];
}

/** The answer GET /products/sku-available gives the async form validator. */
export class SkuAvailabilityDto {
  @ApiProperty({
    example: 'AUDIO-001',
    description: 'The SKU that was checked',
  })
  sku: string;

  @ApiProperty({
    example: true,
    description:
      'True when no other product holds the SKU. The product named by `excludeId` does not count against itself.',
  })
  available: boolean;
}
