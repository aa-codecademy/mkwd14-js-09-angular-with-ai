import { ApiProperty } from '@nestjs/swagger';
import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Order } from './order.entity';
import { Product } from '../products/product.entity';

@Entity('order_items')
export class OrderItem {
  @ApiProperty({ example: 1, description: 'Auto-generated order item id' })
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Order, (order) => order.items, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'order_id' })
  order: Order;

  @ApiProperty({ example: 42, description: 'Foreign key to the owning order' })
  @Column({ name: 'order_id' })
  orderId: number;

  @ApiProperty({
    type: () => Product,
    description: 'Eagerly loaded product this line refers to',
  })
  @ManyToOne(() => Product, { eager: true })
  @JoinColumn({ name: 'product_id' })
  product: Product;

  @ApiProperty({ example: 1, description: 'Foreign key to the product' })
  @Column({ name: 'product_id' })
  productId: number;

  @ApiProperty({ example: 2, minimum: 1, description: 'Units ordered' })
  @Column({ type: 'int' })
  quantity: number;

  @ApiProperty({
    example: 1259.1,
    description:
      'Unit price captured at checkout, with the discount already applied',
  })
  @Column('float')
  price: number;
}
