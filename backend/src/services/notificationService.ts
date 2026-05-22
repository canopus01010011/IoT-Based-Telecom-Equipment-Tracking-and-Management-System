import { fcm } from '../config/firebase.js';
import { Notification, User } from '../models/index.js';
import { Op } from 'sequelize';
import { emitNotification } from '../sockets/socketHandler.js';
import type { BatchResponse } from 'firebase-admin/messaging';

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
      if (!fcm) {
        console.log('⚠️ FCM not initialized, skipping notification');
        return null;
      }

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
      await this.storeNotification([user.id], title, body, data);

      return response;
    } catch (error) {
      console.error('❌ Failed to send notification:', error);
      return null;
    }
  }

  /**
   * Send notification to all users with a specific role
   */
  static async sendToRole(role: 'admin' | 'technician' | 'driver', title: string, body: string, data?: Record<string, any>): Promise<BatchResponse | null> {
    try {
      if (!fcm) {
        console.log('⚠️ FCM not initialized, skipping notification');
        return null;
      }

      const users = await User.findAll({
        where: { role },
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
      const userIds = users.map(u => u.id);
      if (userIds.length > 0) {
        await this.storeNotification(userIds, title, body, data);
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
  static async sendToAll(title: string, body: string, data?: Record<string, any>): Promise<BatchResponse | null> {
    try {
      if (!fcm) {
        console.log('⚠️ FCM not initialized, skipping notification');
        return null;
      }

      const users = await User.findAll({
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

      const userIds = users.map(u => u.id);
      if (userIds.length > 0) {
        await this.storeNotification(userIds, title, body, data);
      }

      return response;
    } catch (error) {
      console.error('❌ Failed to send broadcast:', error);
      return null;
    }
  }

  /**
   * Universal send: stores in DB + emits via socket + attempts FCM push.
   * Call this from any service to create a notification.
   */
  static async send(userIds: string[], title: string, body: string, data?: Record<string, any>) {
    await this.storeNotification(userIds, title, body, data);

    if (!fcm) return;

    const users = await User.findAll({
      where: { id: { [Op.in]: userIds } },
      attributes: ['id', 'fcm_token'],
    });

    const tokens = users.filter(u => u.fcm_token).map(u => u.fcm_token!);
    if (tokens.length === 0) return;

    try {
      await fcm.sendEachForMulticast({
        tokens,
        notification: { title, body },
        data: data ? this.formatData(data) : undefined,
      } as any);
    } catch (error) {
      console.error('❌ FCM send failed:', error);
    }
  }

  /**
   * Store notification in database
   */
  private static async storeNotification(userIds: string[], title: string, body: string, _data?: Record<string, any>) {
    try {
      const notif = await Notification.create({
        user_ids: userIds,
        title,
        body,
        sent_at: new Date(),
      });
      emitNotification({
        id: notif.id,
        title: notif.title,
        body: notif.body,
        sent_at: notif.sent_at.toISOString(),
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
    const where: any = { 
      user_ids: { [Op.contains]: [userId] } 
    };
    void unreadOnly;

    const notifications = await Notification.findAll({
      where,
      order: [['sent_at', 'DESC']],
      limit,
    });

    return notifications;
  }

}
