import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { User, UserRole } from '../auth/entities/user.entity';
import { JwtPayload } from '../auth/strategies/jwt.strategy';
import {
  DEV_USERS,
  DEV_USER_PASSWORD,
  DevUserSpec,
} from './dev-auth.constants';

@Injectable()
export class DevAuthService implements OnModuleInit {
  private readonly logger = new Logger('DevAuth');
  private bypassIdentity: JwtPayload | null = null;

  constructor(
    private readonly configService: ConfigService,
    @InjectRepository(User) private readonly usersRepository: Repository<User>,
  ) {}

  get enabled(): boolean {
    return this.configService.get<string>('AUTH_BYPASS') === 'true';
  }

  /** Role the implicit identity runs as. ADMIN by default so every route is reachable. */
  get bypassRole(): UserRole {
    return this.configService.get<string>('AUTH_BYPASS_ROLE') === 'USER'
      ? 'USER'
      : 'ADMIN';
  }

  async onModuleInit(): Promise<void> {
    if (!this.enabled) return;

    // A bypass that reaches production would make every guard in the app a no-op.
    if (this.configService.get<string>('NODE_ENV') === 'production') {
      throw new Error(
        'AUTH_BYPASS must never be enabled with NODE_ENV=production — refusing to start.',
      );
    }

    await this.seedDevUsers();
    this.logger.warn(
      `AUTH_BYPASS is ON — unauthenticated requests run as ${this.bypassIdentity?.email} (${this.bypassRole}). Never enable this outside local development.`,
    );
  }

  /** Creates the fixed dev accounts if they are missing, then caches the bypass identity. */
  async seedDevUsers(): Promise<User[]> {
    const users: User[] = [];
    for (const spec of DEV_USERS) {
      users.push(await this.ensureDevUser(spec));
    }

    const active =
      users.find((user) => user.role === this.bypassRole) ?? users[0];
    this.bypassIdentity = {
      sub: active.id,
      email: active.email,
      role: active.role,
    };

    return users;
  }

  /**
   * The identity attached to requests that arrive without a usable token while
   * the bypass is on. Seeds on demand so the first request cannot race boot.
   */
  async getBypassIdentity(): Promise<JwtPayload> {
    if (!this.bypassIdentity) await this.seedDevUsers();
    return this.bypassIdentity!;
  }

  private async ensureDevUser(spec: DevUserSpec): Promise<User> {
    const existing = await this.usersRepository.findOne({
      where: { email: spec.email },
    });
    if (existing) {
      // Keep the role in sync in case the spec changed between runs.
      if (existing.role !== spec.role) {
        existing.role = spec.role;
        return this.usersRepository.save(existing);
      }
      return existing;
    }

    const user = this.usersRepository.create({
      email: spec.email,
      passwordHash: await bcrypt.hash(DEV_USER_PASSWORD, 10),
      firstName: spec.firstName,
      lastName: spec.lastName,
      role: spec.role,
    });
    return this.usersRepository.save(user);
  }
}
