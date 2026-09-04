import { faker } from '@faker-js/faker';

export interface SeedCategory {
  name: string;
  slug: string;
  description: string;
  imageUrl: string;
}

export interface SeedProduct {
  slug: string;
  name: string;
  categorySlug: string;
  description: string;
  price: number;
  discountPercent: number;
  image: string;
  stock: number;
  featured: boolean;
  rating: number;
  reviewCount: number;
  sku?: string;
}

export const DEFAULT_PRODUCT_COUNT = 1000;

export const seedCategories: SeedCategory[] = [
  {
    name: 'Laptops',
    slug: 'laptops',
    description: 'Portable computers for work and play',
    imageUrl: 'https://picsum.photos/seed/laptops/400/300',
  },
  {
    name: 'Audio',
    slug: 'audio',
    description: 'Headphones, speakers and earbuds',
    imageUrl: 'https://picsum.photos/seed/audio/400/300',
  },
  {
    name: 'Wearables',
    slug: 'wearables',
    description: 'Smartwatches and fitness trackers',
    imageUrl: 'https://picsum.photos/seed/wearables/400/300',
  },
  {
    name: 'Accessories',
    slug: 'accessories',
    description: 'Keyboards, mice and desk gear',
    imageUrl: 'https://picsum.photos/seed/accessories/400/300',
  },
];

export const curatedProducts: SeedProduct[] = [
  {
    slug: 'ultrabook-pro-14',
    name: 'UltraBook Pro 14',
    categorySlug: 'laptops',
    description:
      'A lightweight 14" laptop with all-day battery life and a crisp OLED display.',
    price: 1399,
    discountPercent: 10,
    image: 'https://picsum.photos/seed/ultrabook-pro-14/600/400',
    stock: 24,
    featured: true,
    rating: 4.6,
    reviewCount: 128,
  },
  {
    slug: 'wireless-noise-cancelling-headphones',
    name: 'Wireless Noise-Cancelling Headphones',
    categorySlug: 'audio',
    description:
      'Over-ear headphones with adaptive noise cancellation and 30-hour battery life.',
    price: 279,
    discountPercent: 15,
    image: 'https://picsum.photos/seed/anc-headphones/600/400',
    stock: 57,
    featured: true,
    rating: 4.7,
    reviewCount: 342,
  },
  {
    slug: 'fittrack-smartwatch',
    name: 'FitTrack Smartwatch',
    categorySlug: 'wearables',
    description:
      'Track your heart rate, sleep and workouts with a week-long battery life.',
    price: 199,
    discountPercent: 0,
    image: 'https://picsum.photos/seed/fittrack-smartwatch/600/400',
    stock: 41,
    featured: true,
    rating: 4.3,
    reviewCount: 89,
  },
  {
    slug: 'mechanical-keyboard-rgb',
    name: 'Mechanical Keyboard RGB',
    categorySlug: 'accessories',
    description: 'Hot-swappable mechanical keyboard with per-key RGB lighting.',
    price: 129,
    discountPercent: 20,
    image: 'https://picsum.photos/seed/mech-keyboard/600/400',
    stock: 63,
    featured: true,
    rating: 4.5,
    reviewCount: 201,
  },
  {
    slug: 'compact-gaming-laptop',
    name: 'Compact Gaming Laptop',
    categorySlug: 'laptops',
    description:
      'A 15.6" gaming laptop with a dedicated GPU in a slim chassis.',
    price: 1899,
    discountPercent: 5,
    image: 'https://picsum.photos/seed/gaming-laptop/600/400',
    stock: 12,
    featured: false,
    rating: 4.4,
    reviewCount: 76,
  },
  {
    slug: 'portable-bluetooth-speaker',
    name: 'Portable Bluetooth Speaker',
    categorySlug: 'audio',
    description:
      'Waterproof speaker with rich bass, perfect for outdoor listening.',
    price: 89,
    discountPercent: 0,
    image: 'https://picsum.photos/seed/bt-speaker/600/400',
    stock: 90,
    featured: false,
    rating: 4.2,
    reviewCount: 154,
  },
  {
    slug: 'fitness-band-lite',
    name: 'Fitness Band Lite',
    categorySlug: 'wearables',
    description:
      'An affordable fitness band with step counting and sleep tracking.',
    price: 49,
    discountPercent: 10,
    image: 'https://picsum.photos/seed/fitness-band/600/400',
    stock: 110,
    featured: false,
    rating: 4.0,
    reviewCount: 63,
  },
  {
    slug: 'ergonomic-wireless-mouse',
    name: 'Ergonomic Wireless Mouse',
    categorySlug: 'accessories',
    description: 'A vertical ergonomic mouse designed to reduce wrist strain.',
    price: 59,
    discountPercent: 0,
    image: 'https://picsum.photos/seed/ergo-mouse/600/400',
    stock: 75,
    featured: false,
    rating: 4.1,
    reviewCount: 47,
  },
];

const productWordsByCategory: Record<
  string,
  { adjectives: string[]; nouns: string[] }
> = {
  laptops: {
    adjectives: [
      'UltraBook',
      'ProBook',
      'AeroBook',
      'ZenBook',
      'Compact',
      'Studio',
      'Nomad',
      'Titan',
    ],
    nouns: [
      'Laptop',
      'Notebook',
      'Ultrabook',
      'Workstation',
      'Chromebook',
      'Convertible',
    ],
  },
  audio: {
    adjectives: [
      'Wireless',
      'Studio',
      'Bass',
      'Noise-Cancelling',
      'Portable',
      'Hi-Fi',
      'Sport',
    ],
    nouns: [
      'Headphones',
      'Earbuds',
      'Speaker',
      'Soundbar',
      'Microphone',
      'DAC',
    ],
  },
  wearables: {
    adjectives: [
      'FitTrack',
      'PulseGuard',
      'Active',
      'Everyday',
      'Trail',
      'Sleep',
    ],
    nouns: [
      'Smartwatch',
      'Fitness Band',
      'Sleep Tracker',
      'Heart Monitor',
      'Smart Ring',
    ],
  },
  accessories: {
    adjectives: [
      'Ergonomic',
      'Mechanical',
      'Compact',
      'Aluminium',
      'Travel',
      'Desk',
    ],
    nouns: [
      'Keyboard',
      'Mouse',
      'Hub',
      'Dock',
      'Stand',
      'Cable',
      'Mousepad',
      'Webcam',
    ],
  },
};

function slugify(value: string): string {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

export function generateProducts(
  count: number,
  takenSlugs: Set<string>,
): SeedProduct[] {
  faker.seed(20260904);
  const generated: SeedProduct[] = [];

  while (generated.length < count) {
    const categorySlug = faker.helpers.arrayElement(seedCategories).slug;
    const words = productWordsByCategory[categorySlug];
    const name = `${faker.helpers.arrayElement(words.adjectives)} ${faker.helpers.arrayElement(
      words.nouns,
    )} ${faker.string.alpha({ length: 1, casing: 'upper' })}${faker.number.int({ min: 100, max: 999 })}`;

    const slug = slugify(name);
    if (takenSlugs.has(slug)) continue;
    takenSlugs.add(slug);

    const price = Number(faker.commerce.price({ min: 19, max: 2499, dec: 2 }));
    const reviewCount = faker.number.int({ min: 0, max: 900 });

    generated.push({
      slug,
      name,
      categorySlug,
      description: faker.commerce.productDescription(),
      price,
      discountPercent: faker.helpers.arrayElement([
        0, 0, 0, 5, 10, 15, 20, 25, 30,
      ]),
      image: `https://picsum.photos/seed/${slug}/600/400`,
      stock: faker.number.int({ min: 0, max: 250 }),
      featured: faker.datatype.boolean({ probability: 0.08 }),
      rating:
        reviewCount === 0
          ? 0
          : Number(faker.number.float({ min: 3, max: 5, fractionDigits: 1 })),
      reviewCount,
      // Derived from the slug rather than random: `sku` is unique in the DB and
      // faker is re-seeded on every call, so random SKUs collide when topping up.
      sku: `SKU-${slug.toUpperCase().replace(/-/g, '_')}`,
    });
  }

  return generated;
}

export interface SeedUser {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  role: 'USER' | 'ADMIN';
}

export const seedUsers: SeedUser[] = [
  {
    email: 'demo@example.com',
    password: 'password123',
    firstName: 'Ada',
    lastName: 'Lovelace',
    role: 'USER',
  },
  {
    email: 'admin@example.com',
    password: 'password123',
    firstName: 'Grace',
    lastName: 'Hopper',
    role: 'ADMIN',
  },
];
