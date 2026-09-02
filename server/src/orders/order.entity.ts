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

export type OrderStatus = 'PENDING' | 'PAID' | 'SHIPPED' | 'CANCELLED';

@Entity('orders')
export class Order {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => User, { eager: true })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column({ name: 'user_id' })
  userId: number;

  @OneToMany(() => OrderItem, (item) => item.order, {
    cascade: true,
    eager: true,
  })
  items: OrderItem[];

  @Column('float')
  total: number;

  @Column({ type: 'varchar', default: 'PENDING' })
  status: OrderStatus;

  @Column({ name: 'shipping_first_name' })
  shippingFirstName: string;

  @Column({ name: 'shipping_last_name' })
  shippingLastName: string;

  @Column({ name: 'shipping_street' })
  shippingStreet: string;

  @Column({ name: 'shipping_city' })
  shippingCity: string;

  @Column({ name: 'shipping_postal_code' })
  shippingPostalCode: string;

  @Column({ name: 'shipping_country' })
  shippingCountry: string;

  @Column({ name: 'shipping_phone', type: 'varchar', nullable: true })
  shippingPhone: string | null;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
