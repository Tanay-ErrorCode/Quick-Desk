import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { RoleUpgradeRequest, RoleUpgradeRequestDocument, RequestStatus } from './schemas/role-upgrade-request.schema';
import { CreateRoleUpgradeRequestDto } from './dto/create-role-upgrade-request.dto';
import { ReviewRoleUpgradeRequestDto } from './dto/review-role-upgrade-request.dto';
import { UsersService } from '../users/users.service';

@Injectable()
export class RoleUpgradeRequestsService {
  constructor(
    @InjectModel(RoleUpgradeRequest.name) private roleUpgradeRequestModel: Model<RoleUpgradeRequestDocument>,
    private usersService: UsersService,
  ) {}

  async create(userId: string, createRoleUpgradeRequestDto: CreateRoleUpgradeRequestDto): Promise<RoleUpgradeRequest> {
    const user = await this.usersService.findById(userId);
    
    if (!user) {
      throw new NotFoundException('User not found');
    }
    
    // Check if user already has a pending request
    const existingRequest = await this.roleUpgradeRequestModel.findOne({
      user_id: new Types.ObjectId(userId),
      status: RequestStatus.PENDING,
    });

    if (existingRequest) {
      throw new BadRequestException('You already have a pending role upgrade request');
    }

    const request = new this.roleUpgradeRequestModel({
      user_id: new Types.ObjectId(userId),
      current_role: user.role,
      ...createRoleUpgradeRequestDto,
    });

    return request.save();
  }

  async findAll(page: number = 1, limit: number = 10): Promise<{ requests: RoleUpgradeRequest[]; total: number }> {
    const skip = (page - 1) * limit;
    
    const [requests, total] = await Promise.all([
      this.roleUpgradeRequestModel
        .find()
        .populate('user_id', 'name email')
        .populate('reviewed_by', 'name email')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .exec(),
      this.roleUpgradeRequestModel.countDocuments(),
    ]);

    return { requests, total };
  }

  async findByStatus(status: RequestStatus): Promise<RoleUpgradeRequest[]> {
    return this.roleUpgradeRequestModel
      .find({ status })
      .populate('user_id', 'name email')
      .populate('reviewed_by', 'name email')
      .sort({ createdAt: -1 })
      .exec();
  }

  async findByUser(userId: string): Promise<RoleUpgradeRequest[]> {
    return this.roleUpgradeRequestModel
      .find({ user_id: new Types.ObjectId(userId) })
      .populate('reviewed_by', 'name email')
      .sort({ createdAt: -1 })
      .exec();
  }

  async approve(id: string, reviewerId: string, reviewDto: ReviewRoleUpgradeRequestDto): Promise<RoleUpgradeRequest> {
    const request = await this.roleUpgradeRequestModel.findById(id).populate('user_id');
    
    if (!request) {
      throw new NotFoundException('Role upgrade request not found');
    }

    if (request.status !== RequestStatus.PENDING) {
      throw new BadRequestException('Request has already been reviewed');
    }

    // Update user role
    await this.usersService.updateRole(request.user_id._id.toString(), request.requested_role);

    // Update request
    request.status = RequestStatus.APPROVED;
    request.reviewed_by = new Types.ObjectId(reviewerId);
    request.reviewed_at = new Date();
    request.admin_notes = reviewDto.admin_notes;

    return request.save();
  }

  async reject(id: string, reviewerId: string, reviewDto: ReviewRoleUpgradeRequestDto): Promise<RoleUpgradeRequest> {
    const request = await this.roleUpgradeRequestModel.findById(id);
    
    if (!request) {
      throw new NotFoundException('Role upgrade request not found');
    }

    if (request.status !== RequestStatus.PENDING) {
      throw new BadRequestException('Request has already been reviewed');
    }

    request.status = RequestStatus.REJECTED;
    request.reviewed_by = new Types.ObjectId(reviewerId);
    request.reviewed_at = new Date();
    request.admin_notes = reviewDto.admin_notes;

    return request.save();
  }
}
