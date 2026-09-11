import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { Stay } from '../stays/stay.entity';
import { User } from '../auth/entities/user.entity';
import { staysSeed, usersSeed } from './seed-data';

@Injectable()
export class SeedService {
  constructor(
    @InjectRepository(Stay) private readonly stayRepo: Repository<Stay>,
    @InjectRepository(User) private readonly userRepo: Repository<User>,
  ) {}

  /** Creates the demo accounts (one ADMIN, one USER). Existing emails are left alone. */
  async seedUsers() {
    let created = 0;
    for (const u of usersSeed) {
      const existing = await this.userRepo.findOne({ where: { email: u.email } });
      if (existing) continue;
      await this.userRepo.save(
        this.userRepo.create({
          email: u.email,
          passwordHash: await bcrypt.hash(u.password, 10),
          firstName: u.firstName,
          lastName: u.lastName,
          role: u.role,
        }),
      );
      created++;
    }
    return { created, skipped: usersSeed.length - created, total: usersSeed.length };
  }

  async seedStays() {
    let created = 0;
    for (const s of staysSeed) {
      const existing = await this.stayRepo.findOne({ where: { title: s.title } });
      if (existing) continue;
      await this.stayRepo.save(this.stayRepo.create(s));
      created++;
    }
    return { created, skipped: staysSeed.length - created, total: staysSeed.length };
  }

  async reset() {
    await this.stayRepo.clear();
    return this.seedStays();
  }

  async status() {
    return {
      staysInDatabase: await this.stayRepo.count(),
      usersInDatabase: await this.userRepo.count(),
    };
  }
}
