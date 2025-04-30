import { Module } from '@nestjs/common';
import { EndUsersService } from './end-users.service';
import { EndUsersController } from './end-users.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EndUser } from './entities/end-user.entity';

@Module({
  imports: [TypeOrmModule.forFeature([EndUser])],
  controllers: [EndUsersController],
  providers: [EndUsersService],
})
export class EndUsersModule {}
