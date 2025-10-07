import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

export interface NotificationData {
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

interface UseRealtimeNotificationsOptions {
  userId: string;
  enabled?: boolean;
}

/**
 * Hook for real-time notifications with automatic updates
 * Automatically subscribes to new notifications and updates
 */
export function useRealtimeNotifications(options: UseRealtimeNotificationsOptions) {
  const { userId, enabled = true } = options;
  const [notifications, setNotifications] = useState<NotificationData[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!enabled || !userId) {
      setLoading(false);
      return;
    }

    // Initial load
    const loadNotifications = async () => {
      try {
        setLoading(true);
        const { data, error: loadError } = await supabase
          .from('notifications')
          .select('*')
          .eq('user_id', userId)
          .order('created_at', { ascending: false });

        if (loadError) throw loadError;

        const mapped: NotificationData[] = (data || []).map((n: any) => ({
          id: n.id,
          userId: n.user_id,
          title: n.title,
          message: n.message,
          type: n.type,
          isRead: n.is_read,
          relatedEntityId: n.related_entity_id,
          relatedEntityType: n.related_entity_type,
          createdAt: n.created_at
        }));

        setNotifications(mapped);
        setUnreadCount(mapped.filter(n => !n.isRead).length);
        setError(null);
      } catch (err) {
        console.error('Error loading notifications:', err);
        setError(err as Error);
      } finally {
        setLoading(false);
      }
    };

    loadNotifications();

    // Set up real-time subscription
    const channel = supabase
      .channel('notifications-realtime')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${userId}`
        },
        (payload) => {
          console.log('Notification change detected:', payload);

          if (payload.eventType === 'INSERT') {
            const newNotif = payload.new as any;
            const mapped: NotificationData = {
              id: newNotif.id,
              userId: newNotif.user_id,
              title: newNotif.title,
              message: newNotif.message,
              type: newNotif.type,
              isRead: newNotif.is_read,
              relatedEntityId: newNotif.related_entity_id,
              relatedEntityType: newNotif.related_entity_type,
              createdAt: newNotif.created_at
            };
            setNotifications(prev => [mapped, ...prev]);
            if (!mapped.isRead) {
              setUnreadCount(prev => prev + 1);
            }
          } else if (payload.eventType === 'UPDATE') {
            const updatedNotif = payload.new as any;
            setNotifications(prev =>
              prev.map(n =>
                n.id === updatedNotif.id
                  ? {
                      ...n,
                      title: updatedNotif.title,
                      message: updatedNotif.message,
                      type: updatedNotif.type,
                      isRead: updatedNotif.is_read,
                      relatedEntityId: updatedNotif.related_entity_id,
                      relatedEntityType: updatedNotif.related_entity_type
                    }
                  : n
              )
            );
            // Recalculate unread count
            setNotifications(current => {
              setUnreadCount(current.filter(n => !n.isRead).length);
              return current;
            });
          } else if (payload.eventType === 'DELETE') {
            const deletedNotif = payload.old as any;
            setNotifications(prev => {
              const filtered = prev.filter(n => n.id !== deletedNotif.id);
              setUnreadCount(filtered.filter(n => !n.isRead).length);
              return filtered;
            });
          }
        }
      )
      .subscribe();

    // Cleanup
    return () => {
      supabase.removeChannel(channel);
    };
  }, [userId, enabled]);

  // Helper function to mark notification as read
  const markAsRead = async (notificationId: string) => {
    try {
      const { error } = await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('id', notificationId);

      if (error) throw error;

      setNotifications(prev =>
        prev.map(n => (n.id === notificationId ? { ...n, isRead: true } : n))
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (err) {
      console.error('Error marking notification as read:', err);
    }
  };

  // Helper function to mark all as read
  const markAllAsRead = async () => {
    try {
      const { error } = await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('user_id', userId)
        .eq('is_read', false);

      if (error) throw error;

      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
      setUnreadCount(0);
    } catch (err) {
      console.error('Error marking all notifications as read:', err);
    }
  };

  return {
    notifications,
    unreadCount,
    loading,
    error,
    markAsRead,
    markAllAsRead
  };
}
