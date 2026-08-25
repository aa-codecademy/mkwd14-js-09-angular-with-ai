import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Stay } from '../stays/stay.entity';
import { staysSeed } from './seed-data';

@Injectable()
export class SeedService {
  constructor(
    @InjectRepository(Stay) private readonly stayRepo: Repository<Stay>,
  ) {}

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
    const count = await this.stayRepo.count();
    return { staysInDatabase: count };
  }
}
