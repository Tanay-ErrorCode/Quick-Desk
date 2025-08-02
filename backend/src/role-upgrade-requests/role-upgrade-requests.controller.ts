import { 
  Controller, 
  Get, 
  Post, 
  Body, 
  Param, 
  UseGuards, 
  Request, 
  Query,
  ParseIntPipe,
  DefaultValuePipe
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RoleUpgradeRequestsService } from './role-upgrade-requests.service';
import { CreateRoleUpgradeRequestDto } from './dto/create-role-upgrade-request.dto';
import { ReviewRoleUpgradeRequestDto } from './dto/review-role-upgrade-request.dto';
import { RequestStatus } from './schemas/role-upgrade-request.schema';

@Controller('api')
@UseGuards(JwtAuthGuard)
export class RoleUpgradeRequestsController {
  constructor(private readonly roleUpgradeRequestsService: RoleUpgradeRequestsService) {}

  @Post('upgrade-requests')
  async create(@Body() createRoleUpgradeRequestDto: CreateRoleUpgradeRequestDto, @Request() req) {
    const request = await this.roleUpgradeRequestsService.create(req.user.userId, createRoleUpgradeRequestDto);
    return {
      success: true,
      message: 'Role upgrade request submitted successfully',
      request,
    };
  }

  @Get('upgrade-requests/my')
  async getMyRequests(@Request() req) {
    const requests = await this.roleUpgradeRequestsService.findByUser(req.user.userId);
    return {
      success: true,
      requests,
    };
  }

  @Get('admin/upgrade-requests')
  async findAll(
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit: number,
    @Query('status') status?: RequestStatus,
  ) {
    if (status) {
      const requests = await this.roleUpgradeRequestsService.findByStatus(status);
      return {
        success: true,
        requests,
      };
    }

    const { requests, total } = await this.roleUpgradeRequestsService.findAll(page, limit);
    return {
      success: true,
      requests,
      pagination: {
        current_page: page,
        per_page: limit,
        total,
        total_pages: Math.ceil(total / limit),
      },
    };
  }

  @Post('admin/upgrade-requests/:id/approve')
  async approve(
    @Param('id') id: string,
    @Body() reviewDto: ReviewRoleUpgradeRequestDto,
    @Request() req,
  ) {
    const request = await this.roleUpgradeRequestsService.approve(id, req.user.userId, reviewDto);
    return {
      success: true,
      message: 'Upgrade request approved successfully',
      request,
    };
  }

  @Post('admin/upgrade-requests/:id/reject')
  async reject(
    @Param('id') id: string,
    @Body() reviewDto: ReviewRoleUpgradeRequestDto,
    @Request() req,
  ) {
    const request = await this.roleUpgradeRequestsService.reject(id, req.user.userId, reviewDto);
    return {
      success: true,
      message: 'Upgrade request rejected',
      request,
    };
  }
}
