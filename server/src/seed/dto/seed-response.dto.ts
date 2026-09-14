import { ApiProperty } from '@nestjs/swagger';

/** What a single table's seed pass did. */
export class SeedTableResultDto {
  @ApiProperty({ example: 6, description: 'Rows inserted by this call' })
  created: number;

  @ApiProperty({
    example: 2,
    description: 'Rows that already existed and were left alone',
  })
  skipped: number;

  @ApiProperty({ example: 8, description: 'Rows in the table afterwards' })
  total: number;
}

/** Products are seeded from two sources, so the result breaks them out. */
export class SeedProductsResultDto {
  @ApiProperty({
    example: 8,
    description: 'Curated products inserted by this call',
  })
  curated: number;

  @ApiProperty({
    example: 992,
    description: 'Faker-generated products inserted to reach `count`',
  })
  generated: number;

  @ApiProperty({ example: 1000, description: 'curated + generated' })
  created: number;

  @ApiProperty({
    example: 1000,
    description: 'Products in the table afterwards',
  })
  total: number;
}

/** The combined result of seeding every table. */
export class SeedAllResultDto {
  @ApiProperty({ type: SeedTableResultDto })
  categories: SeedTableResultDto;

  @ApiProperty({ type: SeedProductsResultDto })
  products: SeedProductsResultDto;

  @ApiProperty({ type: SeedTableResultDto })
  users: SeedTableResultDto;
}

/** Row counts as they stand right now. */
export class SeedStatusDto {
  @ApiProperty({ example: 8, description: 'Rows in the categories table' })
  categories: number;

  @ApiProperty({ example: 1000, description: 'Rows in the products table' })
  products: number;

  @ApiProperty({ example: 3, description: 'Rows in the users table' })
  users: number;

  @ApiProperty({
    example: 1000,
    description: 'Product count the seeder aims for when `count` is omitted',
  })
  targetProductCount: number;
}
