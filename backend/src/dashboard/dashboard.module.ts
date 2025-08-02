import { Module } from '@nestjs/common';
import { DashboardController } from './dashboard.controller';
import { TicketsModule } from '../tickets/tickets.module';
import { UsersModule } from '../users/users.module';
import { NotificationsModule } from '../notifications/notifications.module';

@Module({
  imports: [
    TicketsModule,
    UsersModule,
    NotificationsModule,
  ],
  controllers: [DashboardController],
})
export class DashboardModule {}
