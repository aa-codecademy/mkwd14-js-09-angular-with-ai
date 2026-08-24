import 'reflect-metadata';
import { config } from 'dotenv';
import { DataSource } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { Category } from './categories/category.entity';
import { Product } from './products/product.entity';
import { User } from './auth/entities/user.entity';
import { categoriesSeed, productsSeed, demoUsersSeed } from './seed/seed-data';

config();

const dataSource = new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT),
  username: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  entities: [Category, Product, User],
  synchronize: true,
});

const categories = categoriesSeed;
const productsBySlug = productsSeed;

async function seed() {
  await dataSource.initialize();

  const categoryRepo = dataSource.getRepository(Category);
  const productRepo = dataSource.getRepository(Product);
  const userRepo = dataSource.getRepository(User);

  const savedCategories = new Map<string, Category>();
  for (const c of categories) {
    let category = await categoryRepo.findOne({ where: { slug: c.slug } });
    if (!category) category = await categoryRepo.save(categoryRepo.create(c));
    savedCategories.set(c.slug, category);
  }

  for (const p of productsBySlug) {
    const existing = await productRepo.findOne({ where: { slug: p.slug } });
    if (existing) continue;
    const category = savedCategories.get(p.categorySlug)!;
    const { categorySlug, ...rest } = p;
    await productRepo.save(productRepo.create({ ...rest, categoryId: category.id }));
  }

  const demoUsers = demoUsersSeed;
  for (const u of demoUsers) {
    const existing = await userRepo.findOne({ where: { email: u.email } });
    if (existing) continue;
    const passwordHash = await bcrypt.hash(u.password, 10);
    await userRepo.save(
      userRepo.create({
        email: u.email,
        passwordHash,
        firstName: u.firstName,
        lastName: u.lastName,
        role: u.role,
      }),
    );
  }

  console.log(`Seeded ${categories.length} categories, ${productsBySlug.length} products, ${demoUsers.length} users.`);
  await dataSource.destroy();
}

seed().catch((err) => {
  console.error('Seed failed:', err);
  process.exit(1);
});
