import { ApiProperty } from '@nestjs/swagger';
import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { Product } from '../products/product.entity';

@Entity('categories')
export class Category {
  @ApiProperty({ example: 1, description: 'Auto-generated category id' })
  @PrimaryGeneratedColumn()
  id: number;

  @ApiProperty({ example: 'Electronics' })
  @Column()
  name: string;

  @ApiProperty({
    example: 'electronics',
    description: 'Unique URL-friendly identifier',
  })
  @Column({ unique: true })
  slug: string;

  @ApiProperty({ example: 'Laptops, phones, audio and everything in between.' })
  @Column()
  description: string;

  @ApiProperty({
    example: 'https://picsum.photos/seed/electronics/600/400',
    format: 'uri',
  })
  @Column({ name: 'image_url' })
  imageUrl: string;

  @ApiProperty({
    type: () => [Product],
    description: 'Only populated when the relation is explicitly loaded',
    required: false,
  })
  @OneToMany(() => Product, (product) => product.category)
  products: Product[];
}
