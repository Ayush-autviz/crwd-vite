import React, { useMemo } from 'react';
import NotificationItem from './NotificationItem';
import { Loader2 } from 'lucide-react';
import type { NotificationType } from '@/lib/types';

interface RegularNotificationsProps {
  notifications?: any[];
  isLoading?: boolean;
}

// Helper function to format time ago
const formatTimeAgo = (dateString: string): string => {
  if (!dateString) return '';
  
  try {
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
    
    if (diffInSeconds < 60) {
      return `${diffInSeconds}s`;
    } else if (diffInSeconds < 3600) {
      const minutes = Math.floor(diffInSeconds / 60);
      return `${minutes}m`;
    } else if (diffInSeconds < 86400) {
      const hours = Math.floor(diffInSeconds / 3600);
      return `${hours}h`;
    } else {
      const days = Math.floor(diffInSeconds / 86400);
      return `${days}d`;
    }
  } catch {
    return '';
  }
};

const RegularNotifications: React.FC<RegularNotificationsProps> = ({ 
  notifications = [], 
  isLoading = false 
}) => {
  // Transform API notifications to match NotificationItem props
  // Only show personal notifications (already filtered in NotificationTabs, but double-check here)
  const transformedNotifications = useMemo(() => {
    if (!notifications || notifications.length === 0) return [];

    return notifications
      .filter((notification: any) => notification.type === "personal")
      .map((notification: any) => {
        // Extract username from body if it contains @username pattern
        let username = '';
        const usernameMatch = notification.body?.match(/@(\w+)/);
        if (usernameMatch) {
          username = usernameMatch[1];
        } else {
          username = notification.user?.username || notification.data?.follower_username || '';
        }

        // Determine notification type based on title/body
        let notificationType: NotificationType = 'follow';
        if (notification.title?.includes('Follower') || notification.body?.includes('started following')) {
          notificationType = 'follow';
        } else if (notification.title?.includes('Mention') || notification.body?.includes('@')) {
          notificationType = 'mention';
        } else if (notification.title?.includes('Like')) {
          notificationType = 'like';
        } else if (notification.title?.includes('Comment')) {
          notificationType = 'comment';
        }

        // Extract user ID from notification data based on type
        const userId = 
          notification.data?.follower_id || 
          notification.data?.liker_id ||
          notification.data?.user_id || 
          notification.data?.creator_id || 
          notification.data?.donor_id ||
          notification.user?.id ||
          null;

        const baseNotification = {
          id: notification.id,
          type: notificationType as NotificationType,
          message: notification.body || notification.title || notification.message || '',
          time: formatTimeAgo(notification.created_at || notification.updated_at),
          avatarUrl: notification.user?.profile_picture || notification.data?.profile_picture || '',
          username: username,
          userId: userId,
          link: notification.data?.post_id ? `/posts/${notification.data.post_id}` : 
                notification.data?.collective_id ? `/groupcrwd/${notification.data.collective_id}` :
                userId ? `/user-profile/${userId}` : undefined,
        };

        return baseNotification;
      });
  }, [notifications]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
        <span className="ml-2 text-sm text-gray-600">Loading notifications...</span>
      </div>
    );
  }

  if (transformedNotifications.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 px-4">
        <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
          <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
          </svg>
        </div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">No notifications yet</h3>
        <p className="text-sm text-gray-500 text-center max-w-sm">
          When someone follows you, mentions you, or interacts with your posts, you'll see it here.
        </p>
      </div>
    );
  }

  return (
    <div className="w-full flex flex-col bg-white">
      {transformedNotifications.map((notification, idx) => (
        <NotificationItem key={notification.id || `regular-${idx}`} {...notification} />
      ))}
    </div>
  );
};

export default RegularNotifications; 