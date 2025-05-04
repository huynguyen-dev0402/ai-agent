import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '@modules/users/entities/user.entity';
import { PermissionGuard } from '@modules/author/guards/permission.guard';
import { SuperAdminGuard } from '@modules/author/guards/super-admin.guard';
import { UsersModule } from '@modules/users/users.module';

@Module({
  imports: [TypeOrmModule.forFeature([User]), UsersModule],
  providers: [PermissionGuard, SuperAdminGuard],
  exports: [PermissionGuard, SuperAdminGuard],
})
export class AuthorModule {}
