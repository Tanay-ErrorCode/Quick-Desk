import { Injectable, ConflictException, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as bcrypt from 'bcryptjs';
import { User, UserDocument, UserStatus } from './schemas/user.schema';
import { CreateUserDto } from './dto/create-user.dto';

@Injectable()
export class UsersService {
  constructor(@InjectModel(User.name) private userModel: Model<UserDocument>) {}

  async create(createUserDto: CreateUserDto): Promise<UserDocument> {
    const existingUser = await this.userModel.findOne({ email: createUserDto.email });
    if (existingUser) {
      throw new ConflictException('User with this email already exists');
    }

    const hashedPassword = await bcrypt.hash(createUserDto.password, 12);
    
    const createdUser = new this.userModel({
      ...createUserDto,
      password_hash: hashedPassword,
    });

    return createdUser.save();
  }

  async findByEmail(email: string): Promise<UserDocument | null> {
    return this.userModel.findOne({ 
      email, 
      status: UserStatus.ACTIVE 
    }).exec();
  }

  async findById(id: string): Promise<UserDocument | null> {
    return this.userModel.findById(id).select('-password_hash').exec();
  }

  async validatePassword(plainPassword: string, hashedPassword: string): Promise<boolean> {
    return bcrypt.compare(plainPassword, hashedPassword);
  }

  async updateLastLogin(userId: string): Promise<void> {
    // Since we removed lastLogin, we can either remove this method
    // or add it back to the schema if needed
    // For now, let's just return without doing anything
    return;
  }

  async findAll(): Promise<UserDocument[]> {
    return this.userModel.find().select('-password_hash').exec();
  }

  async updateUserRole(userId: string, role: string): Promise<UserDocument> {
    const user = await this.userModel.findByIdAndUpdate(
      userId,
      { role },
      { new: true }
    ).select('-password_hash');
    
    if (!user) {
      throw new NotFoundException('User not found');
    }
    
    return user;
  }

  async updateUserStatus(userId: string, status: UserStatus): Promise<UserDocument> {
    const user = await this.userModel.findByIdAndUpdate(
      userId,
      { status },
      { new: true }
    ).select('-password_hash');
    
    if (!user) {
      throw new NotFoundException('User not found');
    }
    
    return user;
  }
}