import { Module } from '@nestjs/common';
import { ApiTokensService } from './api-tokens.service';
import { ApiTokensController } from './api-tokens.controller';
import { ApiToken } from './entities/api-token.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [TypeOrmModule.forFeature([ApiToken]), AuthModule],
  controllers: [ApiTokensController],
  providers: [ApiTokensService],
  exports: [ApiTokensService],
})
export class ApiTokensModule {}
