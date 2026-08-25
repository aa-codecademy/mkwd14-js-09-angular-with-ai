import { Controller, Delete, Get, Post } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { SeedService } from './seed.service';

@ApiTags('seed')
@Controller('seed')
export class SeedController {
  constructor(private readonly seedService: SeedService) {}

  @Post('stays')
  @ApiOperation({
    summary: 'Seed sample stays',
    description:
      'Inserts the sample stays into the database. Safe to call more than once — ' +
      'stays that already exist (matched by title) are skipped, so you will never get duplicates.',
  })
  seedStays() {
    return this.seedService.seedStays();
  }

  @Delete('stays')
  @ApiOperation({
    summary: 'Wipe and re-seed stays',
    description:
      'Deletes every stay in the database and inserts the sample data fresh. ' +
      'Use this if you want a clean slate again (e.g. after testing create/update/delete from Angular).',
  })
  reset() {
    return this.seedService.reset();
  }

  @Get('status')
  @ApiOperation({ summary: 'Check how many stays currently exist in the database' })
  status() {
    return this.seedService.status();
  }
}
