import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn } from 'typeorm';

export type UserRole = 'USER' | 'ADMIN';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  email: string;

  // select: false — the hash must never ride along on an eagerly loaded User
  // (orders load theirs). Login re-selects it explicitly.
  @Column({ name: 'password_hash', select: false })
  passwordHash: string;

  @Column({ name: 'first_name' })
  firstName: string;

  @Column({ name: 'last_name' })
  lastName: string;

  @Column({ type: 'varchar', default: 'USER' })
  role: UserRole;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
