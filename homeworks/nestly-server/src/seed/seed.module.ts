import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Stay } from '../stays/stay.entity';
import { User } from '../auth/entities/user.entity';
import { SeedService } from './seed.service';
import { SeedController } from './seed.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Stay, User])],
  providers: [SeedService],
  controllers: [SeedController],
})
export class SeedModule {}
