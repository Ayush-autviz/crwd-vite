import React, { useMemo } from 'react';
import { Loader2, HandHeart, Users, Mountain } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

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
      return `${diffInSeconds} seconds ago`;
    } else if (diffInSeconds < 3600) {
      const minutes = Math.floor(diffInSeconds / 60);
      return `${minutes} ${minutes === 1 ? 'minute' : 'minutes'} ago`;
    } else if (diffInSeconds < 86400) {
      const hours = Math.floor(diffInSeconds / 3600);
      return `${hours} ${hours === 1 ? 'hour' : 'hours'} ago`;
    } else {
      const days = Math.floor(diffInSeconds / 86400);
      return `${days} ${days === 1 ? 'day' : 'days'} ago`;
    }
  } catch {
    return '';
  }
};

const RegularNotifications: React.FC<RegularNotificationsProps> = ({ 
  notifications = [], 
  isLoading = false 
}) => {
  // Transform API notifications to match the new UI design
  const transformedNotifications = useMemo(() => {
    if (!notifications || notifications.length === 0) return [];

    return notifications
      .filter((notification: any) => notification.type === "personal")
      .map((notification: any) => {
        // Determine notification type and extract data
        const isDonation = notification.title?.toLowerCase().includes('donation') || 
                          notification.body?.toLowerCase().includes('donation') ||
                          notification.data?.donor_id;
        const isNewMember = notification.title?.toLowerCase().includes('member') || 
                           notification.body?.toLowerCase().includes('joined') ||
                           notification.data?.new_member_id;
        
        // Extract collective name from body or title
        let collectiveName = '';
        if (notification.body) {
          const receivedMatch = notification.body.match(/received.*?donation.*?to (.+)/i);
          if (receivedMatch) {
            collectiveName = receivedMatch[1].trim();
          } else {
            const joinedMatch = notification.body.match(/joined (.+)/i);
            if (joinedMatch) {
              collectiveName = joinedMatch[1].trim();
            }
          }
        }
        
        // Extract user name for new member notifications
        let memberName = '';
        if (isNewMember && notification.body) {
          const nameMatch = notification.body.match(/^([^ ]+ [^ ]+)/);
          if (nameMatch) {
            memberName = nameMatch[1].trim();
          }
        }
        
        // Extract donation amount
        let donationAmount = '';
        if (isDonation && notification.body) {
          const amountMatch = notification.body.match(/\$(\d+)/);
          if (amountMatch) {
            donationAmount = `$${amountMatch[1]}`;
          }
        }

        return {
          id: notification.id,
          type: isDonation ? 'donation' : isNewMember ? 'new_member' : 'other',
          title: isDonation ? 'Donation Received' : isNewMember ? 'New Member' : notification.title || 'Notification',
          description: notification.body || notification.title || '',
          collectiveName: collectiveName,
          memberName: memberName,
          donationAmount: donationAmount,
          time: formatTimeAgo(notification.created_at || notification.updated_at),
          avatarUrl: notification.user?.profile_picture || notification.data?.profile_picture || '',
          collectiveId: notification.data?.collective_id,
        };
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
        <div key={notification.id || `regular-${idx}`} className="px-4 py-6 border-b border-gray-100 last:border-b-0">
          <div className="flex items-start gap-4">
            {/* Avatar with overlay icon */}
            <div className="relative flex-shrink-0">
              {notification.type === 'donation' ? (
                <>
                  {/* Green circle with 'C' */}
                  <div className="w-14 h-14 rounded-full bg-green-500 flex items-center justify-center">
                    <span className="text-white font-bold text-lg">C</span>
                  </div>
                  {/* Hand icon overlay */}
                  <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-blue-400 flex items-center justify-center border-2 border-white">
                    <HandHeart className="w-3.5 h-3.5 text-white" />
                  </div>
                </>
              ) : notification.type === 'new_member' ? (
                <>
                  {/* Gray circle with landscape icon */}
                  <div className="w-14 h-14 rounded-full bg-gray-200 flex items-center justify-center border-2 border-gray-300">
                    <Mountain className="w-7 h-7 text-gray-500" />
                  </div>
                  {/* People icon overlay */}
                  <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-green-400 flex items-center justify-center border-2 border-white">
                    <Users className="w-3.5 h-3.5 text-white" />
                  </div>
                </>
              ) : (
                <>
                  {/* Default avatar */}
                  <Avatar className="w-14 h-14">
                    <AvatarImage src={notification.avatarUrl} />
                    <AvatarFallback className="bg-gray-200 text-gray-600">
                      {notification.title.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                </>
              )}
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
              <h3 className="font-bold text-gray-900 text-base mb-1">
                {notification.title}
              </h3>
              <p className="text-gray-700 text-sm mb-2">
                {notification.type === 'donation' 
                  ? `Your collective ${notification.collectiveName || 'Community Champions'} received a ${notification.donationAmount || '$50'} donation`
                  : notification.type === 'new_member'
                  ? `${notification.memberName || 'Taylor Kim'} joined ${notification.collectiveName || 'Community Champions'}`
                  : notification.description
                }
              </p>
              <p className="text-gray-500 text-xs">
                {notification.time}
              </p>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default RegularNotifications; 