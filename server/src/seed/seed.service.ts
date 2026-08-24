import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Category } from '../categories/category.entity';
import { Product } from '../products/product.entity';
import { categoriesSeed, productsSeed } from './seed-data';

@Injectable()
export class SeedService {
  constructor(
    @InjectRepository(Category) private readonly categoryRepo: Repository<Category>,
    @InjectRepository(Product) private readonly productRepo: Repository<Product>,
  ) {}

  async seedCategories() {
    const created: Category[] = [];
    for (const c of categoriesSeed) {
      let category = await this.categoryRepo.findOne({ where: { slug: c.slug } });
      if (!category) {
        category = await this.categoryRepo.save(this.categoryRepo.create(c));
        created.push(category);
      }
    }
    return { created: created.length, skipped: categoriesSeed.length - created.length };
  }

  async seedProducts() {
    let created = 0;
    for (const p of productsSeed) {
      const existing = await this.productRepo.findOne({ where: { slug: p.slug } });
      if (existing) continue;
      const category = await this.categoryRepo.findOne({ where: { slug: p.categorySlug } });
      if (!category) continue;
      const { categorySlug, ...rest } = p;
      await this.productRepo.save(this.productRepo.create({ ...rest, categoryId: category.id }));
      created++;
    }
    return { created, skipped: productsSeed.length - created };
  }
}
