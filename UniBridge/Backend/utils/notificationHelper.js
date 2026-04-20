import Notification from '../models/Notification.js';

/**
 * Create a notification for a user
 * @param {string} userId - The user's MongoDB ID
 * @param {string} title - Notification title
 * @param {string} message - Notification message
 * @param {string} type - Notification type: 'application' | 'status_update' | 'exam' | 'general'
 * @param {string} relatedId - Optional related document ID
 * @returns {Promise} - The created notification
 */
export const createNotification = async (userId, title, message, type = 'general', relatedId = null) => {
  try {
    const notification = await Notification.create({
      userId,
      title,
      message,
      type,
      relatedId,
    });
    return notification;
  } catch (error) {
    console.error('Error creating notification:', error);
    throw error;
  }
};

/**
 * Create multiple notifications for multiple users
 * @param {Array<string>} userIds - Array of user IDs
 * @param {string} title - Notification title
 * @param {string} message - Notification message
 * @param {string} type - Notification type
 * @returns {Promise} - Array of created notifications
 */
export const createBulkNotifications = async (userIds, title, message, type = 'general') => {
  try {
    const notifications = userIds.map(userId => ({
      userId,
      title,
      message,
      type,
    }));
    
    const created = await Notification.insertMany(notifications);
    return created;
  } catch (error) {
    console.error('Error creating bulk notifications:', error);
    throw error;
  }
};
