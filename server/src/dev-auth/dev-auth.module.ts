import { Global, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '../auth/entities/user.entity';
import { DevAuthService } from './dev-auth.service';
import { DevAuthController } from './dev-auth.controller';
import { DevOnlyGuard } from './dev-only.guard';

/**
 * Global because JwtAuthGuard is applied from several feature modules and each
 * one instantiates it from its own injector — without this they could not
 * resolve DevAuthService.
 */
@Global()
@Module({
  imports: [TypeOrmModule.forFeature([User])],
  providers: [DevAuthService, DevOnlyGuard],
  controllers: [DevAuthController],
  exports: [DevAuthService],
})
export class DevAuthModule {}
