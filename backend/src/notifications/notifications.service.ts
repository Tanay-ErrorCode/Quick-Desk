import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Notification, NotificationDocument, NotificationType } from './schemas/notification.schema';
import { CreateNotificationDto } from './dto/create-notification.dto';

@Injectable()
export class NotificationsService {
  constructor(
    @InjectModel(Notification.name) private notificationModel: Model<NotificationDocument>,
  ) {}

  async create(userId: string, createNotificationDto: CreateNotificationDto): Promise<Notification> {
    const notification = new this.notificationModel({
      ...createNotificationDto,
      user_id: new Types.ObjectId(userId),
    });
    return notification.save();
  }

  async createForMultipleUsers(userIds: string[], createNotificationDto: CreateNotificationDto): Promise<any[]> {
    const notifications = userIds.map(userId => ({
      ...createNotificationDto,
      user_id: new Types.ObjectId(userId),
    }));
    
    return this.notificationModel.insertMany(notifications);
  }

  async findByUser(
    userId: string, 
    page: number = 1, 
    limit: number = 10,
    type?: NotificationType,
    isRead?: boolean
  ): Promise<{ notifications: Notification[]; total: number; unreadCount: number; urgentCount: number }> {
    const skip = (page - 1) * limit;
    const filter: any = { user_id: new Types.ObjectId(userId) };
    
    if (type) filter.type = type;
    if (typeof isRead === 'boolean') filter.is_read = isRead;

    const [notifications, total, unreadCount, urgentCount] = await Promise.all([
      this.notificationModel
        .find(filter)
        .populate('sender_id', 'name email')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .exec(),
      this.notificationModel.countDocuments(filter),
      this.notificationModel.countDocuments({ 
        user_id: new Types.ObjectId(userId), 
        is_read: false 
      }),
      this.notificationModel.countDocuments({ 
        user_id: new Types.ObjectId(userId), 
        is_urgent: true, 
        is_read: false 
      }),
    ]);

    return { notifications, total, unreadCount, urgentCount };
  }

  async markAsRead(id: string, userId: string): Promise<Notification> {
    const notification = await this.notificationModel.findOneAndUpdate(
      { _id: id, user_id: new Types.ObjectId(userId) },
      { is_read: true },
      { new: true }
    );

    if (!notification) {
      throw new NotFoundException('Notification not found');
    }

    return notification;
  }

  async markAllAsRead(userId: string): Promise<void> {
    await this.notificationModel.updateMany(
      { user_id: new Types.ObjectId(userId), is_read: false },
      { is_read: true }
    );
  }

  async remove(id: string, userId: string): Promise<void> {
    const result = await this.notificationModel.findOneAndDelete({
      _id: id,
      user_id: new Types.ObjectId(userId),
    });

    if (!result) {
      throw new NotFoundException('Notification not found');
    }
  }

  // Helper methods for creating specific notification types
  async createTicketNotification(
    userId: string,
    ticketId: string,
    title: string,
    message: string,
    senderId?: string,
    isUrgent: boolean = false
  ): Promise<Notification> {
    return this.create(userId, {
      type: NotificationType.TICKET,
      title,
      message,
      is_urgent: isUrgent,
      action_url: `/tickets/${ticketId}`,
      action_text: 'View Ticket',
      sender_id: senderId ? new Types.ObjectId(senderId) : undefined,
      ticket_id: new Types.ObjectId(ticketId),
    });
  }

  async createAssignmentNotification(
    userId: string,
    ticketId: string,
    title: string,
    message: string,
    senderId: string
  ): Promise<Notification> {
    return this.create(userId, {
      type: NotificationType.ASSIGNMENT,
      title,
      message,
      action_url: `/tickets/${ticketId}`,
      action_text: 'View Ticket',
      sender_id: new Types.ObjectId(senderId),
      ticket_id: new Types.ObjectId(ticketId),
    });
  }

  async createUpgradeNotification(
    userId: string,
    title: string,
    message: string,
    senderId?: string
  ): Promise<Notification> {
    return this.create(userId, {
      type: NotificationType.UPGRADE,
      title,
      message,
      action_url: '/upgrade-requests',
      action_text: 'View Requests',
      sender_id: senderId ? new Types.ObjectId(senderId) : undefined,
    });
  }
}
