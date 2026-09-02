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
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column({ unique: true })
  slug: string;

  @Column('text')
  description: string;

  @Column('float')
  price: number;

  @Column({ name: 'discount_percent', type: 'int', default: 0 })
  discountPercent: number;

  @Column({ type: 'simple-array', nullable: true })
  images: string[] | null;

  @Column({ nullable: true })
  image: string;

  @ManyToOne(() => Category, (category) => category.products, { eager: true })
  @JoinColumn({ name: 'category_id' })
  category: Category;

  @Column({ name: 'category_id' })
  categoryId: number;

  @Column({ type: 'int', default: 0 })
  stock: number;

  @Column({ nullable: true, unique: true })
  sku: string;

  @Column({ type: 'boolean', default: false })
  featured: boolean;

  @Column('float', { default: 0 })
  rating: number;

  @Column({ name: 'review_count', type: 'int', default: 0 })
  reviewCount: number;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
