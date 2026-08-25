import { ApiProperty } from '@nestjs/swagger';
import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('stays')
export class Stay {
  @ApiProperty({ example: 1 })
  @PrimaryGeneratedColumn()
  id: number;

  @ApiProperty({ example: 'Cozy loft near the river' })
  @Column()
  title: string;

  @ApiProperty({ example: 'Skopje, North Macedonia' })
  @Column()
  location: string;

  @ApiProperty({ example: 68 })
  @Column({ name: 'price_per_night', type: 'float' })
  pricePerNight: number;

  @ApiProperty({ example: 4.8 })
  @Column({ type: 'float', default: 0 })
  rating: number;

  @ApiProperty({ example: 'https://picsum.photos/seed/cozy-loft/600/400' })
  @Column()
  image: string;

  @ApiProperty({ example: false })
  @Column({ type: 'boolean', default: false })
  superhost: boolean;

  @ApiProperty({ example: 'A bright, quiet loft two minutes from the old bridge.' })
  @Column('text')
  description: string;

  @ApiProperty()
  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
