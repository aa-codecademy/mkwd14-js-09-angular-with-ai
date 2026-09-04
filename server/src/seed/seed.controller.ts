import { Controller, Delete, Get, Post, Query } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { SeedService } from './seed.service';
import { SeedQueryDto } from './dto/seed-query.dto';

@ApiTags('seed')
@Controller('seed')
export class SeedController {
  constructor(private readonly seedService: SeedService) {}

  @Get('status')
  @ApiOperation({
    summary: 'Count what is currently in the database',
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
  seedAll(@Query() query: SeedQueryDto) {
    return this.seedService.seedAll(query.count);
  }

  @Post('categories')
  @ApiOperation({ summary: 'Seed only the categories' })
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
  seedProducts(@Query() query: SeedQueryDto) {
    return this.seedService.seedProducts(query.count);
  }

  @Post('users')
  @ApiOperation({ summary: 'Seed only the demo users' })
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
  resetProducts(@Query() query: SeedQueryDto) {
    return this.seedService.resetProducts(query.count);
  }

  @Delete()
  @ApiOperation({
    summary: 'Wipe and re-seed everything except users',
    description:
      'Deletes all orders, products and categories, then seeds them fresh. Users are kept.',
  })
  resetAll(@Query() query: SeedQueryDto) {
    return this.seedService.resetAll(query.count);
  }
}
