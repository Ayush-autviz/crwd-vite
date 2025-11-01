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
  const transformedNotifications = useMemo(() => {
    if (!notifications || notifications.length === 0) return [];

    return notifications.map((notification: any) => {
      const baseNotification = {
        type: (notification.notification_type || notification.type) as NotificationType,
        message: notification.message || notification.text || '',
        time: formatTimeAgo(notification.created_at || notification.timestamp || notification.time),
        avatarUrl: notification.sender?.profile_picture || notification.avatar_url || notification.avatarUrl,
        username: notification.sender?.username || notification.username,
        groupName: notification.group?.name || notification.collective?.name || notification.group_name,
        groupAvatar: notification.group?.avatar || notification.collective?.cover_image || notification.group_avatar,
        link: notification.link || notification.url,
        eventTitle: notification.event?.title || notification.event_title,
        eventDate: notification.event?.date || notification.event_date,
        postContent: notification.post?.content || notification.post_content,
        organizationLogo: notification.organization?.logo || notification.org_logo,
        organizationName: notification.organization?.name || notification.org_name,
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
      <div className="flex items-center justify-center py-12">
        <p className="text-sm text-gray-500">No notifications found</p>
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