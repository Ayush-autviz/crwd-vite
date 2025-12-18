import React, { useMemo } from 'react';
import { Loader2, HandHeart, Users, Mountain } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Link } from "react-router-dom";
import { useQueries } from "@tanstack/react-query";
import { getUserProfileById } from "@/services/api/social";

// Avatar colors for consistent coloring
const avatarColors = [
  '#EF4444', // Red
  '#8B5CF6', // Purple
  '#EC4899', // Pink
  '#F97316', // Orange
  '#10B981', // Green
  '#3B82F6', // Blue
];

const getConsistentColor = (id: number | string, colors: string[]) => {
  const hash = typeof id === 'number' ? id : id.toString().split('').reduce((acc: number, char: string) => acc + char.charCodeAt(0), 0);
  return colors[hash % colors.length];
};

const getInitials = (firstName?: string, lastName?: string, username?: string) => {
  if (firstName) {
    return firstName.charAt(0).toUpperCase();
  }
  if (username) {
    return username.charAt(0).toUpperCase();
  }
  return 'U';
};

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
  // Filter personal notifications first
  const personalNotifications = useMemo(() => {
    return (notifications || []).filter((notification: any) => notification.type === "personal");
  }, [notifications]);

  // Extract unique user IDs from personal notifications for profile fetching
  const uniqueUserIdsFromPersonal = useMemo(() => {
    if (!personalNotifications || personalNotifications.length === 0) return [];
    return Array.from(
      new Set(
        personalNotifications
          .map((notification: any) => {
            const userId = 
              notification.data?.liker_id || 
              notification.data?.commenter_id || 
              notification.data?.mentioner_id ||
              notification.data?.follower_id ||
              notification.data?.donor_id || 
              notification.data?.new_member_id || 
              notification.user?.id || 
              notification.data?.user_id;
            return userId;
          })
          .filter((id: any) => id !== null && id !== undefined)
      )
    ) as (string | number)[];
  }, [personalNotifications]);

  // Fetch user profiles for personal notifications
  const userProfileQueries = useQueries({
    queries: uniqueUserIdsFromPersonal.map((userId: string | number) => ({
      queryKey: ["userProfile", userId],
      queryFn: () => getUserProfileById(userId.toString()),
      enabled: !!userId,
    })),
  });

  // Create a map of user ID to user profile
  const userProfilesMap = useMemo(() => {
    const map = new Map();
    userProfileQueries.forEach((query: any, index: number) => {
      if (query.data && uniqueUserIdsFromPersonal[index]) {
        const profileUser = query.data?.user || query.data;
        map.set(uniqueUserIdsFromPersonal[index].toString(), profileUser);
      }
    });
    return map;
  }, [userProfileQueries, uniqueUserIdsFromPersonal]);

  // Transform API notifications to match the new UI design
  const transformedNotifications = useMemo(() => {
    if (!personalNotifications || personalNotifications.length === 0) return [];

    return personalNotifications.map((notification: any) => {
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

        // Extract user info for avatar - get the user who triggered the notification
        // For likes, comments, mentions, etc., check liker_id, commenter_id, mentioner_id, etc.
        const userId = 
          notification.data?.liker_id || 
          notification.data?.commenter_id || 
          notification.data?.mentioner_id ||
          notification.data?.follower_id ||
          notification.data?.donor_id || 
          notification.data?.new_member_id || 
          notification.user?.id || 
          notification.data?.user_id;
        
        // Extract username from body if it contains @username pattern (e.g., "@jake_long liked your post")
        let username = '';
        if (notification.body) {
          const usernameMatch = notification.body.match(/@(\w+)/);
          if (usernameMatch) {
            username = usernameMatch[1];
          }
        }
        
        // Get user profile from fetched profiles map if available
        const userProfile = userId ? userProfilesMap.get(userId.toString()) : null;
        const profileUser = userProfile?.user || userProfile;
        
        // Get user info from fetched profile, notification.user, or notification.data
        const firstName = 
          profileUser?.first_name || 
          notification.user?.first_name || 
          notification.data?.first_name || '';
        const lastName = 
          profileUser?.last_name || 
          notification.user?.last_name || 
          notification.data?.last_name || '';
        const extractedUsername = 
          username || 
          profileUser?.username || 
          notification.user?.username || 
          notification.data?.username || '';

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
          userId: userId,
          firstName: firstName,
          lastName: lastName,
          username: extractedUsername,
        };
      });
  }, [personalNotifications, userProfilesMap]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8 md:py-12">
        <Loader2 className="w-5 h-5 md:w-6 md:h-6 animate-spin text-gray-400" />
        <span className="ml-1.5 md:ml-2 text-xs md:text-sm text-gray-600">Loading notifications...</span>
      </div>
    );
  }

  if (transformedNotifications.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 md:py-16 px-3 md:px-4">
        <div className="w-12 h-12 md:w-16 md:h-16 mx-auto mb-3 md:mb-4 bg-gray-100 rounded-full flex items-center justify-center">
          <svg className="w-6 h-6 md:w-8 md:h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
          </svg>
        </div>
        <h3 className="text-base md:text-lg font-semibold text-gray-900 mb-1.5 md:mb-2">No notifications yet</h3>
        <p className="text-xs md:text-sm text-gray-500 text-center max-w-sm">
          When someone follows you, mentions you, or interacts with your posts, you'll see it here.
        </p>
      </div>
    );
  }

  return (
    <div className="w-full flex flex-col bg-white">
      {transformedNotifications.map((notification, idx) => (
        <div key={notification.id || `regular-${idx}`} className="px-3 md:px-4 py-4 md:py-6 border-b border-gray-100 last:border-b-0">
          <div className="flex items-start gap-3 md:gap-4">
            {/* Avatar with overlay icon */}
            {notification.userId ? (
              <Link to={`/user-profile/${notification.userId}`} className="relative flex-shrink-0">
                {notification.type === 'donation' ? (
                  <>
                    {/* Green circle with 'C' */}
                    <div className="w-12 h-12 md:w-14 md:h-14 rounded-full bg-green-500 flex items-center justify-center">
                      <span className="text-white font-bold text-base md:text-lg">C</span>
                    </div>
                    {/* Hand icon overlay */}
                    <div className="absolute -bottom-0.5 md:-bottom-1 -right-0.5 md:-right-1 w-5 h-5 md:w-6 md:h-6 rounded-full bg-blue-400 flex items-center justify-center border-2 border-white">
                      <HandHeart className="w-3 h-3 md:w-3.5 md:h-3.5 text-white" />
                    </div>
                  </>
                ) : notification.type === 'new_member' ? (
                  <>
                    {/* Gray circle with landscape icon */}
                    <div className="w-12 h-12 md:w-14 md:h-14 rounded-full bg-gray-200 flex items-center justify-center border-2 border-gray-300">
                      <Mountain className="w-6 h-6 md:w-7 md:h-7 text-gray-500" />
                    </div>
                    {/* People icon overlay */}
                    <div className="absolute -bottom-0.5 md:-bottom-1 -right-0.5 md:-right-1 w-5 h-5 md:w-6 md:h-6 rounded-full bg-green-400 flex items-center justify-center border-2 border-white">
                      <Users className="w-3 h-3 md:w-3.5 md:h-3.5 text-white" />
                    </div>
                  </>
                ) : (
                  <>
                    {/* Default avatar */}
                    <Avatar className="w-12 h-12 md:w-14 md:h-14">
                      <AvatarImage src={notification.avatarUrl} />
                      <AvatarFallback
                        style={{ backgroundColor: notification.userId ? getConsistentColor(notification.userId, avatarColors) : '#E5E7EB' }}
                        className="text-white text-sm md:text-base font-bold"
                      >
                        {getInitials(notification.firstName, notification.lastName, notification.username)}
                      </AvatarFallback>
                    </Avatar>
                  </>
                )}
              </Link>
            ) : (
              <div className="relative flex-shrink-0">
                {notification.type === 'donation' ? (
                  <>
                    {/* Green circle with 'C' */}
                    <div className="w-12 h-12 md:w-14 md:h-14 rounded-full bg-green-500 flex items-center justify-center">
                      <span className="text-white font-bold text-base md:text-lg">C</span>
                    </div>
                    {/* Hand icon overlay */}
                    <div className="absolute -bottom-0.5 md:-bottom-1 -right-0.5 md:-right-1 w-5 h-5 md:w-6 md:h-6 rounded-full bg-blue-400 flex items-center justify-center border-2 border-white">
                      <HandHeart className="w-3 h-3 md:w-3.5 md:h-3.5 text-white" />
                    </div>
                  </>
                ) : notification.type === 'new_member' ? (
                  <>
                    {/* Gray circle with landscape icon */}
                    <div className="w-12 h-12 md:w-14 md:h-14 rounded-full bg-gray-200 flex items-center justify-center border-2 border-gray-300">
                      <Mountain className="w-6 h-6 md:w-7 md:h-7 text-gray-500" />
                    </div>
                    {/* People icon overlay */}
                    <div className="absolute -bottom-0.5 md:-bottom-1 -right-0.5 md:-right-1 w-5 h-5 md:w-6 md:h-6 rounded-full bg-green-400 flex items-center justify-center border-2 border-white">
                      <Users className="w-3 h-3 md:w-3.5 md:h-3.5 text-white" />
                    </div>
                  </>
                ) : (
                  <>
                    {/* Default avatar */}
                    <Avatar className="w-12 h-12 md:w-14 md:h-14">
                      <AvatarImage src={notification.avatarUrl} />
                      <AvatarFallback
                        style={{ backgroundColor: notification.userId ? getConsistentColor(notification.userId, avatarColors) : '#E5E7EB' }}
                        className="text-white text-sm md:text-base font-bold"
                      >
                        {getInitials(notification.firstName, notification.lastName, notification.username)}
                      </AvatarFallback>
                    </Avatar>
                  </>
                )}
              </div>
            )}

            {/* Content */}
            <div className="flex-1 min-w-0">
              <h3 className="font-bold text-gray-900 text-sm md:text-base mb-0.5 md:mb-1">
                {notification.title}
              </h3>
              <p className="text-gray-700 text-xs md:text-sm mb-1.5 md:mb-2">
                {notification.type === 'donation' 
                  ? `Your collective ${notification.collectiveName || 'Community Champions'} received a ${notification.donationAmount || '$50'} donation`
                  : notification.type === 'new_member'
                  ? `${notification.memberName || 'Taylor Kim'} joined ${notification.collectiveName || 'Community Champions'}`
                  : notification.description
                }
              </p>
              <p className="text-gray-500 text-[10px] md:text-xs">
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