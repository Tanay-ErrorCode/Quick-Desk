import { 
  Controller, 
  Get, 
  UseGuards, 
  Request
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { TicketsService } from '../tickets/tickets.service';
import { UsersService } from '../users/users.service';
import { NotificationsService } from '../notifications/notifications.service';

@Controller('api/dashboard')
@UseGuards(JwtAuthGuard)
export class DashboardController {
  constructor(
    private readonly ticketsService: TicketsService,
    private readonly usersService: UsersService,
    private readonly notificationsService: NotificationsService,
  ) {}

  @Get('user')
  async getUserDashboard(@Request() req) {
    // This would need to be implemented in TicketsService
    const userId = req.user.userId;
    
    // For now, return mock data - you'd implement proper stats in TicketsService
    return {
      success: true,
      data: {
        total_tickets: 0,
        open_tickets: 0,
        in_progress_tickets: 0,
        resolved_tickets: 0,
        recent_tickets: [],
        unread_notifications: 0,
      },
    };
  }

  @Get('staff')
  async getStaffDashboard(@Request() req) {
    const userId = req.user.userId;
    
    // Mock data - implement proper stats
    return {
      success: true,
      data: {
        assigned_tickets: 0,
        in_progress_tickets: 0,
        urgent_tickets: 0,
        available_tickets: 0,
        recent_activity: [],
        performance_stats: {
          resolved_today: 0,
          avg_response_time: '0 hours',
          satisfaction_rating: 0,
        },
      },
    };
  }

  @Get('admin')
  async getAdminDashboard(@Request() req) {
    const users = await this.usersService.findAll();
    
    return {
      success: true,
      data: {
        total_users: users.length,
        total_agents: users.filter(user => user.role === 'Support Agent').length,
        total_tickets: 0,
        open_tickets: 0,
        closed_tickets: 0,
        pending_upgrades: 0,
        category_stats: [],
        agent_performance: [],
        recent_activity: [],
      },
    };
  }
}
