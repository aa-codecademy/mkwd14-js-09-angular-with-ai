import { Controller, Delete, Get, Post, Query } from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { SeedService } from './seed.service';
import { SeedQueryDto } from './dto/seed-query.dto';
import {
  SeedAllResultDto,
  SeedProductsResultDto,
  SeedStatusDto,
  SeedTableResultDto,
} from './dto/seed-response.dto';
import { ValidationErrorResponseDto } from '../common/dto/error-response.dto';

@ApiTags('seed')
@ApiBadRequestResponse({
  description: '`count` is not an integer between 1 and 10000',
  type: ValidationErrorResponseDto,
})
@Controller('seed')
export class SeedController {
  constructor(private readonly seedService: SeedService) {}

  @Get('status')
  @ApiOperation({
    summary: 'Count what is currently in the database',
  })
  @ApiOkResponse({
    description: 'Current row counts per seeded table',
    type: SeedStatusDto,
  })
  status() {
    return this.seedService.status();
  }

  @Post()
  @ApiOperation({
    summary: 'Seed categories, products and demo users',
    description:
      'Safe to call more than once — categories/users already present (matched by slug/email) ' +
      'are skipped, and products are only topped up to `count`, so you never get duplicates.',
  })
  @ApiCreatedResponse({
    description: 'What was created and skipped in each table',
    type: SeedAllResultDto,
  })
  seedAll(@Query() query: SeedQueryDto) {
    return this.seedService.seedAll(query.count);
  }

  @Post('categories')
  @ApiOperation({ summary: 'Seed only the categories' })
  @ApiCreatedResponse({
    description: 'Categories created, skipped, and the resulting total',
    type: SeedTableResultDto,
  })
  seedCategories() {
    return this.seedService.seedCategories();
  }

  @Post('products')
  @ApiOperation({
    summary: 'Top the products table up to `count` products',
    description:
      'Inserts the 8 curated products first, then fills the rest with faker-generated ones. ' +
      'Existing products are left untouched.',
  })
  @ApiCreatedResponse({
    description: 'Curated and generated counts, and the resulting total',
    type: SeedProductsResultDto,
  })
  seedProducts(@Query() query: SeedQueryDto) {
    return this.seedService.seedProducts(query.count);
  }

  @Post('users')
  @ApiOperation({ summary: 'Seed only the demo users' })
  @ApiCreatedResponse({
    description: 'Users created, skipped, and the resulting total',
    type: SeedTableResultDto,
  })
  seedUsers() {
    return this.seedService.seedUsers();
  }

  @Delete('products')
  @ApiOperation({
    summary: 'Wipe and re-seed the products',
    description:
      'Deletes every product — and, because order items point at them, every order too — ' +
      'then seeds `count` products fresh.',
  })
  @ApiOkResponse({
    description: 'The result of the fresh product seed',
    type: SeedProductsResultDto,
  })
  resetProducts(@Query() query: SeedQueryDto) {
    return this.seedService.resetProducts(query.count);
  }

  @Delete()
  @ApiOperation({
    summary: 'Wipe and re-seed everything except users',
    description:
      'Deletes all orders, products and categories, then seeds them fresh. Users are kept.',
  })
  @ApiOkResponse({
    description: 'The result of the fresh seed across every table',
    type: SeedAllResultDto,
  })
  resetAll(@Query() query: SeedQueryDto) {
    return this.seedService.resetAll(query.count);
  }
}
