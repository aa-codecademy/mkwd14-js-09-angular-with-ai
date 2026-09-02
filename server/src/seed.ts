import 'reflect-metadata';
import { config } from 'dotenv';
import { DataSource } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { Category } from './categories/category.entity';
import { Product } from './products/product.entity';
import { User } from './auth/entities/user.entity';

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

const categories = [
  { name: 'Laptops', slug: 'laptops', description: 'Portable computers for work and play', imageUrl: 'https://picsum.photos/seed/laptops/400/300' },
  { name: 'Audio', slug: 'audio', description: 'Headphones, speakers and earbuds', imageUrl: 'https://picsum.photos/seed/audio/400/300' },
  { name: 'Wearables', slug: 'wearables', description: 'Smartwatches and fitness trackers', imageUrl: 'https://picsum.photos/seed/wearables/400/300' },
  { name: 'Accessories', slug: 'accessories', description: 'Keyboards, mice and desk gear', imageUrl: 'https://picsum.photos/seed/accessories/400/300' },
];

const productsBySlug = [
  { slug: 'ultrabook-pro-14', name: 'UltraBook Pro 14', categorySlug: 'laptops', description: 'A lightweight 14" laptop with all-day battery life and a crisp OLED display.', price: 1399, discountPercent: 10, image: 'https://picsum.photos/seed/ultrabook-pro-14/600/400', stock: 24, featured: true, rating: 4.6, reviewCount: 128 },
  { slug: 'wireless-noise-cancelling-headphones', name: 'Wireless Noise-Cancelling Headphones', categorySlug: 'audio', description: 'Over-ear headphones with adaptive noise cancellation and 30-hour battery life.', price: 279, discountPercent: 15, image: 'https://picsum.photos/seed/anc-headphones/600/400', stock: 57, featured: true, rating: 4.7, reviewCount: 342 },
  { slug: 'fittrack-smartwatch', name: 'FitTrack Smartwatch', categorySlug: 'wearables', description: 'Track your heart rate, sleep and workouts with a week-long battery life.', price: 199, discountPercent: 0, image: 'https://picsum.photos/seed/fittrack-smartwatch/600/400', stock: 41, featured: true, rating: 4.3, reviewCount: 89 },
  { slug: 'mechanical-keyboard-rgb', name: 'Mechanical Keyboard RGB', categorySlug: 'accessories', description: 'Hot-swappable mechanical keyboard with per-key RGB lighting.', price: 129, discountPercent: 20, image: 'https://picsum.photos/seed/mech-keyboard/600/400', stock: 63, featured: true, rating: 4.5, reviewCount: 201 },
  { slug: 'compact-gaming-laptop', name: 'Compact Gaming Laptop', categorySlug: 'laptops', description: 'A 15.6" gaming laptop with a dedicated GPU in a slim chassis.', price: 1899, discountPercent: 5, image: 'https://picsum.photos/seed/gaming-laptop/600/400', stock: 12, featured: false, rating: 4.4, reviewCount: 76 },
  { slug: 'portable-bluetooth-speaker', name: 'Portable Bluetooth Speaker', categorySlug: 'audio', description: 'Waterproof speaker with rich bass, perfect for outdoor listening.', price: 89, discountPercent: 0, image: 'https://picsum.photos/seed/bt-speaker/600/400', stock: 90, featured: false, rating: 4.2, reviewCount: 154 },
  { slug: 'fitness-band-lite', name: 'Fitness Band Lite', categorySlug: 'wearables', description: 'An affordable fitness band with step counting and sleep tracking.', price: 49, discountPercent: 10, image: 'https://picsum.photos/seed/fitness-band/600/400', stock: 110, featured: false, rating: 4.0, reviewCount: 63 },
  { slug: 'ergonomic-wireless-mouse', name: 'Ergonomic Wireless Mouse', categorySlug: 'accessories', description: 'A vertical ergonomic mouse designed to reduce wrist strain.', price: 59, discountPercent: 0, image: 'https://picsum.photos/seed/ergo-mouse/600/400', stock: 75, featured: false, rating: 4.1, reviewCount: 47 },
];

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

  const demoUsers = [
    { email: 'demo@example.com', password: 'password123', firstName: 'Ada', lastName: 'Lovelace', role: 'USER' as const },
    { email: 'admin@example.com', password: 'password123', firstName: 'Grace', lastName: 'Hopper', role: 'ADMIN' as const },
  ];
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
