import { ConflictException, Injectable, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { User, UserRole } from './entities/user.entity';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { JwtPayload } from './strategies/jwt.strategy';

export interface PublicUser {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  createdAt: string;
}

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  user: PublicUser;
}

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User) private readonly usersRepository: Repository<User>,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  async register(dto: RegisterDto): Promise<AuthResponse> {
    const existing = await this.usersRepository.findOne({ where: { email: dto.email } });
    if (existing) throw new ConflictException('Email already registered');

    const user = this.usersRepository.create({
      email: dto.email,
      passwordHash: await bcrypt.hash(dto.password, 10),
      firstName: dto.firstName,
      lastName: dto.lastName,
      role: 'USER', // registering can never make you an ADMIN - that's seeded only
    });
    await this.usersRepository.save(user);

    return this.buildAuthResponse(user);
  }

  async login(dto: LoginDto): Promise<AuthResponse> {
    const user = await this.usersRepository.findOne({
      where: { email: dto.email },
      select: {
        id: true,
        email: true,
        passwordHash: true,
        firstName: true,
        lastName: true,
        role: true,
        createdAt: true,
      },
    });
    if (!user) throw new UnauthorizedException('Invalid credentials');

    const valid = await bcrypt.compare(dto.password, user.passwordHash);
    if (!valid) throw new UnauthorizedException('Invalid credentials');

    return this.buildAuthResponse(user);
  }

  /** Exchanges a still-valid, not-logged-out refresh token for a fresh token pair. */
  async refresh(refreshToken: string): Promise<AuthResponse> {
    let payload: JwtPayload;
    try {
      payload = this.jwtService.verify<JwtPayload>(refreshToken, {
        secret: this.configService.get<string>('JWT_REFRESH_SECRET'),
      });
    } catch {
      throw new UnauthorizedException('Invalid refresh token');
    }

    const user = await this.usersRepository.findOne({
      where: { id: payload.sub },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        createdAt: true,
        refreshTokenHash: true,
      },
    });
    if (!user?.refreshTokenHash) throw new UnauthorizedException('Invalid refresh token');

    const matches = await bcrypt.compare(refreshToken, user.refreshTokenHash);
    if (!matches) throw new UnauthorizedException('Invalid refresh token');

    return this.buildAuthResponse(user);
  }

  /** Logout: forget the stored refresh token so it can never be exchanged again. */
  async logout(userId: number): Promise<{ success: true }> {
    await this.usersRepository.update({ id: userId }, { refreshTokenHash: null });
    return { success: true };
  }

  async me(userId: number): Promise<PublicUser> {
    const user = await this.usersRepository.findOne({ where: { id: userId } });
    if (!user) throw new UnauthorizedException('User no longer exists');
    return this.toPublicUser(user);
  }

  private async buildAuthResponse(user: User): Promise<AuthResponse> {
    const accessToken = this.signToken(user, 'access');
    const refreshToken = this.signToken(user, 'refresh');

    await this.usersRepository.update(
      { id: user.id },
      { refreshTokenHash: await bcrypt.hash(refreshToken, 10) },
    );

    return { accessToken, refreshToken, user: this.toPublicUser(user) };
  }

  private toPublicUser(user: User): PublicUser {
    return {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      role: user.role,
      createdAt: new Date(user.createdAt).toISOString(),
    };
  }

  private signToken(user: User, kind: 'access' | 'refresh'): string {
    const payload: JwtPayload = { sub: user.id, email: user.email, role: user.role };
    const secret = this.configService.get<string>(
      kind === 'access' ? 'JWT_ACCESS_SECRET' : 'JWT_REFRESH_SECRET',
    );
    const expiresIn = this.configService.get<string>(
      kind === 'access' ? 'JWT_ACCESS_EXPIRES_IN' : 'JWT_REFRESH_EXPIRES_IN',
    ) as `${number}${'s' | 'm' | 'h' | 'd'}`;

    return this.jwtService.sign(payload, { secret, expiresIn });
  }
}
