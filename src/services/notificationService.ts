import { supabase } from '../lib/supabase';
import { Database } from '../types/supabase';

export interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: 'info' | 'warning' | 'success' | 'error';
  isRead: boolean;
  relatedEntityId?: string;
  relatedEntityType?: 'patient' | 'treatment' | 'user' | 'internship';
  createdAt: string;
}

// Convert from database model to frontend model
const mapDbNotificationToNotification = (dbNotification: any): Notification => ({
  id: dbNotification.id,
  userId: dbNotification.user_id,
  title: dbNotification.title,
  message: dbNotification.message,
  type: dbNotification.type,
  isRead: dbNotification.is_read,
  relatedEntityId: dbNotification.related_entity_id,
  relatedEntityType: dbNotification.related_entity_type,
  createdAt: dbNotification.created_at
});

export const notificationService = {
  // Get notifications for a user
  getUserNotifications: async (userId: string, limit = 20, onlyUnread = false): Promise<Notification[]> => {
    try {
      let query = supabase
        .from('notifications')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (onlyUnread) {
        query = query.eq('is_read', false);
      }

      const { data, error } = await query;

      if (error) throw error;
      return data ? data.map(mapDbNotificationToNotification) : [];
    } catch (error) {
      console.error('Error fetching user notifications:', error);
      return [];
    }
  },

  // Get notification by ID
  getNotificationById: async (notificationId: string): Promise<Notification | null> => {
    try {
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('id', notificationId)
        .single();

      if (error) throw error;
      return data ? mapDbNotificationToNotification(data) : null;
    } catch (error) {
      console.error('Error fetching notification:', error);
      return null;
    }
  },

  // Create a new notification
  createNotification: async (notificationData: Omit<Notification, 'id' | 'createdAt'>): Promise<Notification | null> => {
    try {
      const { data, error } = await supabase
        .from('notifications')
        .insert({
          user_id: notificationData.userId,
          title: notificationData.title,
          message: notificationData.message,
          type: notificationData.type,
          is_read: notificationData.isRead,
          related_entity_id: notificationData.relatedEntityId,
          related_entity_type: notificationData.relatedEntityType
        })
        .select()
        .single();

      if (error) throw error;
      return data ? mapDbNotificationToNotification(data) : null;
    } catch (error) {
      console.error('Error creating notification:', error);
      return null;
    }
  },

  // Mark notification as read
  markAsRead: async (notificationId: string): Promise<boolean> => {
    try {
      const { error } = await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('id', notificationId);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error marking notification as read:', error);
      return false;
    }
  },

  // Mark all notifications as read for a user
  markAllAsRead: async (userId: string): Promise<boolean> => {
    try {
      const { error } = await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('user_id', userId)
        .eq('is_read', false);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
      return false;
    }
  },

  // Delete a notification
  deleteNotification: async (notificationId: string): Promise<boolean> => {
    try {
      const { error } = await supabase
        .from('notifications')
        .delete()
        .eq('id', notificationId);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error deleting notification:', error);
      return false;
    }
  },

  // Get unread notification count for a user
  getUnreadCount: async (userId: string): Promise<number> => {
    try {
      const { count, error } = await supabase
        .from('notifications')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId)
        .eq('is_read', false);

      if (error) throw error;
      return count || 0;
    } catch (error) {
      console.error('Error getting unread notification count:', error);
      return 0;
    }
  },

  // Create notifications for multiple users
  createBulkNotifications: async (
    userIds: string[],
    notificationData: Omit<Notification, 'id' | 'userId' | 'createdAt'>
  ): Promise<boolean> => {
    try {
      const notifications = userIds.map(userId => ({
        user_id: userId,
        title: notificationData.title,
        message: notificationData.message,
        type: notificationData.type,
        is_read: notificationData.isRead,
        related_entity_id: notificationData.relatedEntityId,
        related_entity_type: notificationData.relatedEntityType
      }));

      const { error } = await supabase
        .from('notifications')
        .insert(notifications);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error creating bulk notifications:', error);
      return false;
    }
  },

  // Get all supervisors and admins for patient approval notifications
  getSupervisorsAndAdmins: async (): Promise<string[]> => {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('id')
        .in('role', ['Doctor', 'Admin']);

      if (error) throw error;
      return data ? data.map(user => user.id) : [];
    } catch (error) {
      console.error('Error fetching supervisors and admins:', error);
      return [];
    }
  },

  // Notify supervisors and admins about new patient pending approval
  notifyPatientPendingApproval: async (
    patientId: string,
    patientName: string,
    studentName: string
  ): Promise<boolean> => {
    try {
      const supervisorIds = await notificationService.getSupervisorsAndAdmins();

      if (supervisorIds.length === 0) {
        console.warn('No supervisors or admins found to notify');
        return false;
      }

      const success = await notificationService.createBulkNotifications(
        supervisorIds,
        {
          title: 'New Patient Pending Approval',
          message: `${studentName} has added a new patient "${patientName}" that requires your approval.`,
          type: 'info',
          isRead: false,
          relatedEntityId: patientId,
          relatedEntityType: 'patient'
        }
      );

      return success;
    } catch (error) {
      console.error('Error notifying patient pending approval:', error);
      return false;
    }
  },

  // Notify student about patient approval status
  notifyPatientApprovalStatus: async (
    studentId: string,
    patientId: string,
    patientName: string,
    approved: boolean,
    approverName: string
  ): Promise<boolean> => {
    try {
      const notification = await notificationService.createNotification({
        userId: studentId,
        title: approved ? 'Patient Approved' : 'Patient Rejected',
        message: approved
          ? `Your patient "${patientName}" has been approved by ${approverName}. You can now add treatments and procedures.`
          : `Your patient "${patientName}" has been rejected by ${approverName}. Please contact your supervisor for more information.`,
        type: approved ? 'success' : 'warning',
        isRead: false,
        relatedEntityId: patientId,
        relatedEntityType: 'patient'
      });

      return notification !== null;
    } catch (error) {
      console.error('Error notifying patient approval status:', error);
      return false;
    }
  }
};
