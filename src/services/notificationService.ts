import type { BatchResponse } from 'firebase-admin/messaging';
import { fcm } from '../config/firebase.js';
import { Notification, User } from '../models/index.js';

export class NotificationService {
  /**
   * Update user's FCM token (mobile app calls this after login)
   */
  static async updateFCMToken(userId: string, fcmToken: string) {
    const user = await User.findByPk(userId);
    if (!user) {
      throw new Error('User not found');
    }

    await user.update({ fcm_token: fcmToken });
    return { success: true, message: 'FCM token updated' };
  }

  /**
   * Send push notification to a specific user
   */
  static async sendToUser(userId: string, title: string, body: string, data?: Record<string, any>) {
    try {
      const user = await User.findByPk(userId, {
        attributes: ['id', 'fcm_token', 'full_name'],
      });

      if (!user || !user.fcm_token) {
        console.log(`⚠️ User ${userId} has no FCM token`);
        return null;
      }

      const message = {
        token: user.fcm_token,
        notification: {
          title,
          body,
        },
        data: data ? this.formatData(data) : undefined,
      };

      const response = await fcm.send(message as any);
      console.log(`✅ Notification sent to ${user.full_name}`);

      // Store in database for history
      await this.storeNotification(user.id, title, body, data);

      return response;
    } catch (error) {
      console.error('❌ Failed to send notification:', error);
      return null;
    }
  }

  /**
   * Send notification to all users with a specific role
   */
  static async sendToRole(role: 'admin' | 'technician' | 'driver', title: string, body: string, data?: Record<string, any>) {
    try {
      const users = await User.findAll({
        where: { role, is_active: true },
        attributes: ['id', 'fcm_token', 'full_name'],
      });

      const tokens = users.filter(u => u.fcm_token).map(u => u.fcm_token!);

      if (tokens.length === 0) {
        console.log(`⚠️ No users with role ${role} have FCM tokens`);
        return null;
      }

      const message = {
        tokens,
        notification: { title, body },
        data: data ? this.formatData(data) : undefined,
      };

      const response = await fcm.sendEachForMulticast(message as any);
      console.log(`✅ Sent to ${response.successCount}/${tokens.length} ${role}(s)`);

      // Store for each user
      for (const user of users) {
        await this.storeNotification(user.id, title, body, data);
      }

      return response;
    } catch (error) {
      console.error('❌ Failed to send role notification:', error);
      return null;
    }
  }

  /**
   * Send notification to all active users
   */
  static async sendToAll(title: string, body: string, data?: Record<string, any>) {
    try {
      const users = await User.findAll({
        where: { is_active: true },
        attributes: ['id', 'fcm_token', 'full_name'],
      });

      const tokens = users.filter(u => u.fcm_token).map(u => u.fcm_token!);

      if (tokens.length === 0) {
        console.log('⚠️ No users have FCM tokens');
        return null;
      }

      const message = {
        tokens,
        notification: { title, body },
        data: data ? this.formatData(data) : undefined,
      };

      const response = await fcm.sendEachForMulticast(message as any);
      console.log(`✅ Sent to ${response.successCount}/${tokens.length} users`);

      return response;
    } catch (error) {
      console.error('❌ Failed to send broadcast:', error);
      return null;
    }
  }

  /**
   * Store notification in database
   */
  private static async storeNotification(userId: string, title: string, body: string, data?: Record<string, any>) {
    try {
      await Notification.create({
        user_id: userId,
        title,
        body,
        data: data || {},
        sent_at: new Date(),
        is_read: false,
      });
    } catch (error) {
      console.error('❌ Failed to store notification:', error);
    }
  }

  /**
   * Format data for FCM (ensure all values are strings)
   */
  private static formatData(data: Record<string, any>): Record<string, string> {
    const formatted: Record<string, string> = {};
    for (const [key, value] of Object.entries(data)) {
      formatted[key] = String(value);
    }
    return formatted;
  }

  /**
   * Get user's notifications
   */
  static async getUserNotifications(userId: string, limit: number = 50, unreadOnly: boolean = false) {
    const where: any = { user_id: userId };
    if (unreadOnly) where.is_read = false;

    const notifications = await Notification.findAll({
      where,
      order: [['sent_at', 'DESC']],
      limit,
    });

    return notifications;
  }

  /**
   * Mark notification as read
   */
  static async markAsRead(notificationId: string, userId: string) {
    const notification = await Notification.findOne({
      where: { id: notificationId, user_id: userId },
    });

    if (!notification) {
      throw new Error('Notification not found');
    }

    await notification.update({ is_read: true });
    return notification;
  }

  /**
   * Get unread count for user
   */
  static async getUnreadCount(userId: string) {
    const count = await Notification.count({
      where: { user_id: userId, is_read: false },
    });
    return { unreadCount: count };
  }
}