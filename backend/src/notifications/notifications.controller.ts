import { 
  Controller, 
  Get, 
  Post, 
  Delete, 
  Param, 
  UseGuards, 
  Request, 
  Query,
  ParseIntPipe,
  DefaultValuePipe,
  ParseBoolPipe
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { NotificationsService } from './notifications.service';
import { NotificationType } from './schemas/notification.schema';

@Controller('api/notifications')
@UseGuards(JwtAuthGuard)
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @Get()
  async findByUser(
    @Request() req,
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit: number,
    @Query('type') type?: NotificationType,
    @Query('is_read', new DefaultValuePipe(null)) isRead?: string,
  ) {
    const isReadBool = isRead === 'true' ? true : isRead === 'false' ? false : undefined;
    
    const { notifications, total, unreadCount, urgentCount } = await this.notificationsService.findByUser(
      req.user.userId,
      page,
      limit,
      type,
      isReadBool
    );

    return {
      success: true,
      notifications,
      unread_count: unreadCount,
      urgent_count: urgentCount,
      pagination: {
        current_page: page,
        per_page: limit,
        total,
        total_pages: Math.ceil(total / limit),
      },
    };
  }

  @Post(':id/read')
  async markAsRead(@Param('id') id: string, @Request() req) {
    await this.notificationsService.markAsRead(id, req.user.userId);
    return {
      success: true,
      message: 'Notification marked as read',
    };
  }

  @Post('mark-all-read')
  async markAllAsRead(@Request() req) {
    await this.notificationsService.markAllAsRead(req.user.userId);
    return {
      success: true,
      message: 'All notifications marked as read',
    };
  }

  @Delete(':id')
  async remove(@Param('id') id: string, @Request() req) {
    await this.notificationsService.remove(id, req.user.userId);
    return {
      success: true,
      message: 'Notification deleted successfully',
    };
  }
}
