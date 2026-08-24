import { Controller, Post } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { SeedService } from './seed.service';

@ApiTags('seed')
@Controller('seed')
export class SeedController {
  constructor(private readonly seedService: SeedService) {}

  @Post('categories')
  seedCategories() {
    return this.seedService.seedCategories();
  }

  @Post('products')
  seedProducts() {
    return this.seedService.seedProducts();
  }
}
