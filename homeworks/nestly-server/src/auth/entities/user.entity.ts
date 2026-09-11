import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';

export type UserRole = 'USER' | 'ADMIN';

@Entity('users')
export class User {
  @ApiProperty({ example: 1 })
  @PrimaryGeneratedColumn()
  id: number;

  @ApiProperty({ example: 'host@nestly.dev' })
  @Column({ unique: true })
  email: string;

  // select: false -> the hash is never loaded unless a query asks for it explicitly.
  @Column({ name: 'password_hash', select: false })
  passwordHash: string;

  // The hash of the refresh token handed out at the last login. Logout sets it to
  // null, which is what makes a logged-out refresh token stop working.
  @Column({ name: 'refresh_token_hash', type: 'varchar', nullable: true, select: false })
  refreshTokenHash: string | null;

  @ApiProperty({ example: 'Ada' })
  @Column({ name: 'first_name' })
  firstName: string;

  @ApiProperty({ example: 'Lovelace' })
  @Column({ name: 'last_name' })
  lastName: string;

  @ApiProperty({ example: 'USER', enum: ['USER', 'ADMIN'] })
  @Column({ type: 'varchar', default: 'USER' })
  role: UserRole;

  @ApiProperty()
  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
