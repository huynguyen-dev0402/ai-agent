import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { AuthModule } from '../auth/auth.module';
import { Customer } from '../customers/entities/customer.entity';
import { ApiTokensModule } from '../api-tokens/api-tokens.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([User, Customer]),
    AuthModule,
    ApiTokensModule,
  ],
  controllers: [UsersController],
  providers: [UsersService],
  exports: [UsersService],
})
export class UsersModule {}
