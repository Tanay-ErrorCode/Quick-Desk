import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { UserSession, UserSessionDocument } from './schemas/user-session.schema';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class UserSessionsService {
  constructor(
    @InjectModel(UserSession.name) private userSessionModel: Model<UserSessionDocument>,
  ) {}

  async create(userId: string, ipAddress?: string, userAgent?: string): Promise<UserSession> {
    const token = uuidv4();
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7); // 7 days from now

    const session = new this.userSessionModel({
      user_id: new Types.ObjectId(userId),
      token,
      ip_address: ipAddress,
      user_agent: userAgent,
      expires_at: expiresAt,
    });

    return session.save();
  }

  async findByToken(token: string): Promise<UserSession | null> {
    return this.userSessionModel
      .findOne({ 
        token, 
        expires_at: { $gt: new Date() } 
      })
      .populate('user_id', 'name email role status')
      .exec();
  }

  async findByUser(userId: string): Promise<UserSession[]> {
    return this.userSessionModel
      .find({ 
        user_id: new Types.ObjectId(userId),
        expires_at: { $gt: new Date() }
      })
      .sort({ createdAt: -1 })
      .exec();
  }

  async revokeToken(token: string): Promise<void> {
    await this.userSessionModel.findOneAndDelete({ token });
  }

  async revokeAllUserSessions(userId: string): Promise<void> {
    await this.userSessionModel.deleteMany({ 
      user_id: new Types.ObjectId(userId) 
    });
  }

  async cleanupExpiredSessions(): Promise<void> {
    await this.userSessionModel.deleteMany({
      expires_at: { $lt: new Date() }
    });
  }

  async extendSession(token: string): Promise<UserSession> {
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7); // Extend by 7 days

    const session = await this.userSessionModel.findOneAndUpdate(
      { token, expires_at: { $gt: new Date() } },
      { expires_at: expiresAt },
      { new: true }
    );

    if (!session) {
      throw new NotFoundException('Session not found or expired');
    }

    return session;
  }
}
