import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { Category } from '../categories/category.entity';
import { Product } from '../products/product.entity';
import { User } from '../auth/entities/user.entity';
import {
  DEFAULT_PRODUCT_COUNT,
  SeedProduct,
  curatedProducts,
  generateProducts,
  seedCategories,
  seedUsers,
} from './seed-data';

const INSERT_CHUNK_SIZE = 200;

@Injectable()
export class SeedService {
  private readonly logger = new Logger(SeedService.name);

  constructor(
    @InjectRepository(Category)
    private readonly categoryRepo: Repository<Category>,
    @InjectRepository(Product)
    private readonly productRepo: Repository<Product>,
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
    private readonly dataSource: DataSource,
  ) {}

  async seedAll(count = DEFAULT_PRODUCT_COUNT) {
    const categories = await this.seedCategories();
    const products = await this.seedProducts(count);
    const users = await this.seedUsers();
    return { categories, products, users };
  }

  async seedCategories() {
    const created: string[] = [];
    for (const c of seedCategories) {
      const existing = await this.categoryRepo.findOne({
        where: { slug: c.slug },
      });
      if (existing) continue;
      await this.categoryRepo.save(this.categoryRepo.create(c));
      created.push(c.slug);
    }
    return {
      created: created.length,
      skipped: seedCategories.length - created.length,
      total: await this.categoryRepo.count(),
    };
  }

  async seedProducts(count = DEFAULT_PRODUCT_COUNT) {
    const categoriesBySlug = await this.ensureCategoryMap();

    const existingSlugs = new Set(
      (await this.productRepo.find({ select: ['slug'] })).map((p) => p.slug),
    );

    const curated = curatedProducts.filter((p) => !existingSlugs.has(p.slug));
    curated.forEach((p) => existingSlugs.add(p.slug));

    const missing = Math.max(0, count - existingSlugs.size);
    const generated = generateProducts(missing, existingSlugs);

    await this.insertProducts([...curated, ...generated], categoriesBySlug);

    this.logger.log(
      `Seeded ${curated.length} curated + ${generated.length} generated products`,
    );

    return {
      curated: curated.length,
      generated: generated.length,
      created: curated.length + generated.length,
      total: await this.productRepo.count(),
    };
  }

  async seedUsers() {
    const created: string[] = [];
    for (const u of seedUsers) {
      const existing = await this.userRepo.findOne({
        where: { email: u.email },
      });
      if (existing) continue;
      const passwordHash = await bcrypt.hash(u.password, 10);
      await this.userRepo.save(
        this.userRepo.create({
          email: u.email,
          passwordHash,
          firstName: u.firstName,
          lastName: u.lastName,
          role: u.role,
        }),
      );
      created.push(u.email);
    }
    return {
      created: created.length,
      skipped: seedUsers.length - created.length,
      total: await this.userRepo.count(),
    };
  }

  async resetProducts(count = DEFAULT_PRODUCT_COUNT) {
    await this.wipeProducts();
    return this.seedProducts(count);
  }

  async resetAll(count = DEFAULT_PRODUCT_COUNT) {
    await this.wipeProducts();
    await this.categoryRepo.createQueryBuilder().delete().execute();
    return this.seedAll(count);
  }

  async status() {
    return {
      categories: await this.categoryRepo.count(),
      products: await this.productRepo.count(),
      users: await this.userRepo.count(),
      targetProductCount: DEFAULT_PRODUCT_COUNT,
    };
  }

  /**
   * order_items reference products without ON DELETE CASCADE, so the orders
   * have to go first or Postgres rejects the product delete.
   */
  private async wipeProducts() {
    await this.dataSource.query(
      'TRUNCATE TABLE "order_items", "orders", "products" RESTART IDENTITY CASCADE',
    );
  }

  private async ensureCategoryMap() {
    await this.seedCategories();
    const categories = await this.categoryRepo.find();
    return new Map(categories.map((c) => [c.slug, c]));
  }

  private async insertProducts(
    products: SeedProduct[],
    categoriesBySlug: Map<string, Category>,
  ) {
    for (let i = 0; i < products.length; i += INSERT_CHUNK_SIZE) {
      const chunk = products
        .slice(i, i + INSERT_CHUNK_SIZE)
        .map(({ categorySlug, ...rest }) =>
          this.productRepo.create({
            ...rest,
            categoryId: categoriesBySlug.get(categorySlug)!.id,
          }),
        );
      await this.productRepo.save(chunk);
    }
  }
}
