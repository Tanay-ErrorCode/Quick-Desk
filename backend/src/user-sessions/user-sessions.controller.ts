import { 
  Controller, 
  Get, 
  Delete, 
  Param, 
  UseGuards, 
  Request
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { UserSessionsService } from './user-sessions.service';

@Controller('api/sessions')
@UseGuards(JwtAuthGuard)
export class UserSessionsController {
  constructor(private readonly userSessionsService: UserSessionsService) {}

  @Get('my')
  async getMySessions(@Request() req) {
    const sessions = await this.userSessionsService.findByUser(req.user.userId);
    return {
      success: true,
      sessions,
    };
  }

  @Delete('revoke/:token')
  async revokeSession(@Param('token') token: string, @Request() req) {
    await this.userSessionsService.revokeToken(token);
    return {
      success: true,
      message: 'Session revoked successfully',
    };
  }

  @Delete('revoke-all')
  async revokeAllSessions(@Request() req) {
    await this.userSessionsService.revokeAllUserSessions(req.user.userId);
    return {
      success: true,
      message: 'All sessions revoked successfully',
    };
  }
}
