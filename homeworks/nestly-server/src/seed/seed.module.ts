import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Stay } from '../stays/stay.entity';
import { SeedService } from './seed.service';
import { SeedController } from './seed.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Stay])],
  providers: [SeedService],
  controllers: [SeedController],
})
export class SeedModule {}
