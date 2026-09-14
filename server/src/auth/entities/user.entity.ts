import { ApiProperty } from '@nestjs/swagger';
import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
} from 'typeorm';

export const USER_ROLES = ['USER', 'ADMIN'] as const;

export type UserRole = (typeof USER_ROLES)[number];

@Entity('users')
export class User {
  @ApiProperty({ example: 1, description: 'Auto-generated user id' })
  @PrimaryGeneratedColumn()
  id: number;

  @ApiProperty({
    example: 'demo@example.com',
    format: 'email',
    description: 'Unique login email',
  })
  @Column({ unique: true })
  email: string;

  // select: false — the hash must never ride along on an eagerly loaded User
  // (orders load theirs). Login re-selects it explicitly.
  @Column({ name: 'password_hash', select: false })
  passwordHash: string;

  @ApiProperty({ example: 'Ada' })
  @Column({ name: 'first_name' })
  firstName: string;

  @ApiProperty({ example: 'Lovelace' })
  @Column({ name: 'last_name' })
  lastName: string;

  @ApiProperty({
    enum: USER_ROLES,
    enumName: 'UserRole',
    example: 'USER',
    description: 'ADMIN unlocks the product and order administration routes',
  })
  @Column({ type: 'varchar', default: 'USER' })
  role: UserRole;

  @ApiProperty({
    type: String,
    format: 'date-time',
    example: '2026-01-15T09:30:00.000Z',
  })
  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
