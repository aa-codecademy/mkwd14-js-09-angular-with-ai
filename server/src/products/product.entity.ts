import { ApiProperty } from '@nestjs/swagger';
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Category } from '../categories/category.entity';

@Entity('products')
export class Product {
  @ApiProperty({ example: 1, description: 'Auto-generated product id' })
  @PrimaryGeneratedColumn()
  id: number;

  @ApiProperty({ example: 'UltraBook Pro 14' })
  @Column()
  name: string;

  @ApiProperty({
    example: 'ultrabook-pro-14',
    description: 'Unique URL-friendly identifier, derived from the name',
  })
  @Column({ unique: true })
  slug: string;

  @ApiProperty({
    example: 'A lightweight 14" laptop with all-day battery life.',
  })
  @Column('text')
  description: string;

  @ApiProperty({ example: 1399, description: 'List price before any discount' })
  @Column('float')
  price: number;

  @ApiProperty({
    example: 10,
    minimum: 0,
    maximum: 100,
    description: 'Percentage taken off the list price; 0 means no discount',
  })
  @Column({ name: 'discount_percent', type: 'int', default: 0 })
  discountPercent: number;

  @ApiProperty({
    type: [String],
    nullable: true,
    example: [
      'https://picsum.photos/seed/ultrabook-1/600/600',
      'https://picsum.photos/seed/ultrabook-2/600/600',
    ],
    description: 'Gallery images',
  })
  @Column({ type: 'simple-array', nullable: true })
  images: string[] | null;

  @ApiProperty({
    example: 'https://picsum.photos/seed/ultrabook/600/600',
    format: 'uri',
    required: false,
    description: 'Primary thumbnail',
  })
  @Column({ nullable: true })
  image: string;

  @ApiProperty({
    type: () => Category,
    description: 'Eagerly loaded owning category',
  })
  @ManyToOne(() => Category, (category) => category.products, { eager: true })
  @JoinColumn({ name: 'category_id' })
  category: Category;

  @ApiProperty({ example: 1, description: 'Foreign key to the category' })
  @Column({ name: 'category_id' })
  categoryId: number;

  @ApiProperty({ example: 24, minimum: 0, description: 'Units on hand' })
  @Column({ type: 'int', default: 0 })
  stock: number;

  @ApiProperty({
    example: 'AUDIO-001',
    required: false,
    description: 'Unique stock keeping unit',
  })
  @Column({ nullable: true, unique: true })
  sku: string;

  @ApiProperty({
    example: false,
    description: 'Shown on the storefront home page',
  })
  @Column({ type: 'boolean', default: false })
  featured: boolean;

  @ApiProperty({ example: 4.5, minimum: 0, maximum: 5 })
  @Column('float', { default: 0 })
  rating: number;

  @ApiProperty({ example: 128, minimum: 0 })
  @Column({ name: 'review_count', type: 'int', default: 0 })
  reviewCount: number;

  @ApiProperty({
    type: String,
    format: 'date-time',
    example: '2026-01-15T09:30:00.000Z',
  })
  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
