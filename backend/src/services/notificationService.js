import { Notification } from '../models/index.js';
import { NOTIFICATION_TYPES } from '../utils/constants.js';

/**
 * Create an in-app notification for a user.
 */
export async function createNotification(userId, { type = 'system', title, body, data = null }) {
  if (!userId || !title) return null;
  const safeType = NOTIFICATION_TYPES.includes(type) ? type : 'system';
  try {
    return await Notification.create({
      userId,
      type: safeType,
      title,
      body: body || '',
      data,
      isRead: false,
    });
  } catch {
    return null;
  }
}

export async function getUnreadCount(userId) {
  return Notification.count({ where: { userId, isRead: false } });
}
