import { 
  Controller, 
  Get, 
  Put, 
  Param, 
  Body, 
  UseGuards, 
  Request, 
  Query,
  ParseIntPipe,
  DefaultValuePipe
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { UsersService } from '../users/users.service';
import { RoleUpgradeRequestsService } from '../role-upgrade-requests/role-upgrade-requests.service';
import { CategoriesService } from '../categories/categories.service';
import { TagsService } from '../tags/tags.service';
import { UserRole, UserStatus } from '../users/schemas/user.schema';

@Controller('api/admin')
@UseGuards(JwtAuthGuard)
export class AdminController {
  constructor(
    private readonly usersService: UsersService,
    private readonly roleUpgradeRequestsService: RoleUpgradeRequestsService,
    private readonly categoriesService: CategoriesService,
    private readonly tagsService: TagsService,
  ) {}

  @Get('users')
  async getUsers(
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit: number,
    @Query('role') role?: UserRole,
    @Query('status') status?: UserStatus,
    @Query('search') search?: string,
  ) {
    // This would need to be implemented in UsersService
    const users = await this.usersService.findAll();
    
    // Basic filtering (you'd want to implement this properly in the service)
    let filteredUsers = users;
    if (role) {
      filteredUsers = filteredUsers.filter(user => user.role === role);
    }
    if (status) {
      filteredUsers = filteredUsers.filter(user => user.status === status);
    }
    if (search) {
      filteredUsers = filteredUsers.filter(user => 
        user.name.toLowerCase().includes(search.toLowerCase()) ||
        user.email.toLowerCase().includes(search.toLowerCase())
      );
    }

    const total = filteredUsers.length;
    const skip = (page - 1) * limit;
    const paginatedUsers = filteredUsers.slice(skip, skip + limit);

    return {
      success: true,
      users: paginatedUsers,
      pagination: {
        current_page: page,
        per_page: limit,
        total,
        total_pages: Math.ceil(total / limit),
      },
    };
  }

  @Put('users/:id/role')
  async updateUserRole(
    @Param('id') id: string,
    @Body() body: { role: UserRole; notes?: string },
  ) {
    const user = await this.usersService.updateRole(id, body.role);
    return {
      success: true,
      message: 'User role updated successfully',
      user,
    };
  }

  @Put('users/:id/status')
  async updateUserStatus(
    @Param('id') id: string,
    @Body() body: { status: UserStatus; reason?: string },
  ) {
    const user = await this.usersService.updateUserStatus(id, body.status);
    return {
      success: true,
      message: 'User status updated successfully',
      user,
    };
  }

  @Get('categories')
  async getCategories() {
    const categories = await this.categoriesService.findAll();
    return {
      success: true,
      categories,
    };
  }

  @Get('tags')
  async getTags() {
    const tags = await this.tagsService.findAll();
    return {
      success: true,
      tags,
    };
  }
}
