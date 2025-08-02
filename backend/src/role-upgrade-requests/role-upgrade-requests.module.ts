import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { RoleUpgradeRequestsService } from './role-upgrade-requests.service';
import { RoleUpgradeRequestsController } from './role-upgrade-requests.controller';
import { RoleUpgradeRequest, RoleUpgradeRequestSchema } from './schemas/role-upgrade-request.schema';
import { UsersModule } from '../users/users.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: RoleUpgradeRequest.name, schema: RoleUpgradeRequestSchema }]),
    UsersModule,
  ],
  controllers: [RoleUpgradeRequestsController],
  providers: [RoleUpgradeRequestsService],
  exports: [RoleUpgradeRequestsService],
})
export class RoleUpgradeRequestsModule {}
