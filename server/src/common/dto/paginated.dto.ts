import { ApiProperty } from '@nestjs/swagger';

/** Fields shared by every paginated envelope in the API. */
export abstract class PaginationMetaDto {
  @ApiProperty({ example: 137, description: 'Total rows matching the filter' })
  total: number;

  @ApiProperty({ example: 1, minimum: 1, description: 'Current 1-based page' })
  page: number;

  @ApiProperty({ example: 12, minimum: 1, description: 'Rows per page' })
  limit: number;

  @ApiProperty({
    example: 12,
    minimum: 1,
    description: 'Number of pages available',
  })
  totalPages: number;
}
