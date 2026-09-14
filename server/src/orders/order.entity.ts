import { ApiProperty } from '@nestjs/swagger';
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { User } from '../auth/entities/user.entity';
import { OrderItem } from './order-item.entity';

export const ORDER_STATUSES = [
  'PENDING',
  'SHIPPED',
  'DELIVERED',
  'CANCELLED',
] as const;

export type OrderStatus = (typeof ORDER_STATUSES)[number];

@Entity('orders')
export class Order {
  @ApiProperty({ example: 42, description: 'Auto-generated order id' })
  @PrimaryGeneratedColumn()
  id: number;

  @ApiProperty({
    type: () => User,
    description: 'Eagerly loaded customer who placed the order',
  })
  @ManyToOne(() => User, { eager: true })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @ApiProperty({ example: 1, description: 'Foreign key to the customer' })
  @Column({ name: 'user_id' })
  userId: number;

  @ApiProperty({
    type: () => [OrderItem],
    description: 'Eagerly loaded order lines',
  })
  @OneToMany(() => OrderItem, (item) => item.order, {
    cascade: true,
    eager: true,
  })
  items: OrderItem[];

  @ApiProperty({
    example: 2518.2,
    description: 'Sum of every line (quantity x discounted unit price)',
  })
  @Column('float')
  total: number;

  @ApiProperty({
    enum: ORDER_STATUSES,
    enumName: 'OrderStatus',
    example: 'PENDING',
    description:
      'Lifecycle position. PENDING -> SHIPPED | CANCELLED, SHIPPED -> DELIVERED. There is no undo.',
  })
  @Column({ type: 'varchar', default: 'PENDING' })
  status: OrderStatus;

  @ApiProperty({ example: 'Ana' })
  @Column({ name: 'shipping_first_name' })
  shippingFirstName: string;

  @ApiProperty({ example: 'Petrovska' })
  @Column({ name: 'shipping_last_name' })
  shippingLastName: string;

  @ApiProperty({ example: 'Partizanski Odredi 14' })
  @Column({ name: 'shipping_street' })
  shippingStreet: string;

  @ApiProperty({ example: 'Skopje' })
  @Column({ name: 'shipping_city' })
  shippingCity: string;

  @ApiProperty({ example: '1000' })
  @Column({ name: 'shipping_postal_code' })
  shippingPostalCode: string;

  @ApiProperty({ example: 'North Macedonia' })
  @Column({ name: 'shipping_country' })
  shippingCountry: string;

  @ApiProperty({ example: '+389 70 123 456', nullable: true })
  @Column({ name: 'shipping_phone', type: 'varchar', nullable: true })
  shippingPhone: string | null;

  @ApiProperty({
    type: String,
    format: 'date-time',
    example: '2026-01-15T09:30:00.000Z',
  })
  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
