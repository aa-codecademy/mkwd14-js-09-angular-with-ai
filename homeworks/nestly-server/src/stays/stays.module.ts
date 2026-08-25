import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Stay } from './stay.entity';
import { StaysService } from './stays.service';
import { StaysController } from './stays.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Stay])],
  providers: [StaysService],
  controllers: [StaysController],
  exports: [StaysService],
})
export class StaysModule {}
