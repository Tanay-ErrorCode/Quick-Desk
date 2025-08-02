import { Module } from '@nestjs/common';
import { AdminController } from './admin.controller';
import { UsersModule } from '../users/users.module';
import { RoleUpgradeRequestsModule } from '../role-upgrade-requests/role-upgrade-requests.module';
import { CategoriesModule } from '../categories/categories.module';
import { TagsModule } from '../tags/tags.module';

@Module({
  imports: [
    UsersModule,
    RoleUpgradeRequestsModule,
    CategoriesModule,
    TagsModule,
  ],
  controllers: [AdminController],
})
export class AdminModule {}
