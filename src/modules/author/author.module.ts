import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '../users/entities/user.entity';
import { PermissionGuard } from './guards/permission.guard';
import { SuperAdminGuard } from './guards/super-admin.guard';
import { UsersModule } from '../users/users.module';

@Module({
  imports: [TypeOrmModule.forFeature([User]), UsersModule],
  providers: [PermissionGuard, SuperAdminGuard],
  exports: [PermissionGuard, SuperAdminGuard],
})
export class AuthorModule {}
