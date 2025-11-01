import React from "react";
import {
  MessageSquare,
  Loader2,
} from "lucide-react";
import { Link } from "react-router-dom";
import ProfileActivity from "../profile/ProfileActivity";
import { profileActivity } from "@/lib/profile/profileActivity";
import EmptyState from "../ui/EmptyState";
import type { PostDetail } from "@/lib/types";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { useQuery } from "@tanstack/react-query";
import { getUserProfileById } from "@/services/api/social";

interface GroupCrwdUpdatesProps {
  posts?: any[];
  showEmpty?: boolean;
  joined?: boolean;
  collectiveData?: any;
  isLoading?: boolean;
  recentActivities?: any[];
}

const GroupCrwdUpdates: React.FC<GroupCrwdUpdatesProps> = ({
  posts = profileActivity,
  showEmpty = false,
  joined = false,
  collectiveData,
  isLoading = false,
  recentActivities = [],
}) => {
  // Transform API posts to PostDetail format
  const transformedPosts: PostDetail[] = posts?.map((post: any) => ({
    id: post.id,
    userId: post.user?.id?.toString() || '', // Add userId for navigation, convert to string
    avatarUrl: post.user?.profile_picture || '/placeholder.svg',
    username: post.user?.username || post.user?.full_name || 'Unknown User',
    time: new Date(post.created_at).toLocaleDateString(),
    org: post.collective?.name || 'Unknown Collective',
    orgUrl: post.collective?.id,
    text: post.content || '',
    imageUrl: post.media || undefined,
    likes: post.likes_count || 0,
    comments: post.comments_count || 0,
    shares: 0, // API doesn't provide shares count
    isLiked: post.is_liked === true, // Ensure boolean conversion
  })) || [];

  // Show empty state if showEmpty is true or if posts array is empty
  const shouldShowEmpty = showEmpty || transformedPosts.length === 0;

  // Component for individual activity with user profile
  const ActivityItem = ({ activity }: { activity: any }) => {
    const isCommunityType = activity.type === "community";
    const isDonationType = activity.type === "donation" || activity.type === "donation_activity";
    const isMilestoneType = activity.type === "milestone";
    
    // Extract username from activity body (e.g., "@jake_long" -> "jake_long")
    const usernameMatch = activity.body?.match(/@(\w+)/);
    const username = usernameMatch ? usernameMatch[1] : null;
    const userId = activity.data?.new_member_id;
    
    // Fetch user profile for community type activities
    const { data: userProfile } = useQuery({
      queryKey: ['userProfile', userId],
      queryFn: () => getUserProfileById(userId?.toString() || ''),
      enabled: isCommunityType && !!userId,
    });

    // Get initials for fallback
    const getInitials = () => {
      if (userProfile?.username) {
        return userProfile.username.charAt(0).toUpperCase();
      }
      if (username) {
        return username.charAt(0).toUpperCase();
      }
      return '?';
    };

    return (
      <div
        key={activity.id}
        className="bg-white rounded-xl border border-gray-200 shadow-sm p-4"
      >
        <div className="flex items-start gap-3">
          {/* Show avatar for community type (member actions) */}
          {isCommunityType && userId && (
            <Link to={`/user-profile/${userId}`}>
              <Avatar className="h-10 w-10">
                <AvatarImage
                  src={userProfile?.profile_picture}
                  alt={username || 'User'}
                />
                <AvatarFallback className="bg-gray-100 text-gray-600 font-semibold">
                  {getInitials()}
                </AvatarFallback>
              </Avatar>
            </Link>
          )}
          
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              {isCommunityType && (
                <>
                  {username && userId ? (
                    <Link
                      to={`/user-profile/${userId}`}
                      className="font-semibold text-gray-900 hover:text-blue-600 transition-colors"
                    >
                      @{username}
                    </Link>
                  ) : (
                    <span className="font-semibold text-gray-900">
                      {username ? `@${username}` : '@member'}
                    </span>
                  )}
                  <span className="text-blue-600 text-sm">
                    {collectiveData?.name?.toLowerCase().replace(/\s+/g, '') || 'collective'}
                  </span>
                </>
              )}
              {isDonationType && (
                <span className="font-semibold text-gray-900">
                  CRWD Updates
                </span>
              )}
              {isMilestoneType && (
                <span className="font-semibold text-gray-900">
                  CRWD Milestones
                </span>
              )}
              <span className="text-gray-400 text-sm">
                {activity.timestamp || 'Recently'}
              </span>
            </div>
            <p className="text-gray-700 text-sm">
              {activity.body || activity.title}
            </p>
          </div>
          <button className="text-gray-400 hover:text-gray-600 p-1">
            <span className="text-lg">⋯</span>
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className="px-4 pt-2 pb-2">
      {/* <div className="flex items-center justify-between mb-2 px-2">
        <span className="font-semibold text-base">4 Updates</span>
        <button className="bg-blue-100 text-blue-600 rounded-full p-1"><Plus size={18} /></button>
      </div> */}

      <div className="space-y-4">
        {/* Recent Activities - Always shown */}
        {recentActivities && recentActivities.length > 0 && (
          <div className="lg:max-w-[600px]">
            <div className="space-y-4">
              {recentActivities.map((activity) => (
                <ActivityItem key={activity.id} activity={activity} />
              ))}
            </div>
          </div>
        )}

        {/* Posts Section */}
        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="w-6 h-6 animate-spin mr-2" />
            <span className="text-gray-600">Loading posts...</span>
          </div>
        ) : shouldShowEmpty ? (
          <EmptyState
            icon={<MessageSquare size={48} />}
            title="Be the first one to share"
            description="Start the conversation by sharing an update with your group. Your post will help keep everyone engaged and informed."
            actionText="Create Post"
            // actionLink="/create-post"
            className="bg-white rounded-lg border border-gray-200"
            collectiveData={collectiveData}
          />
        ) : (
          <ProfileActivity
            title="Conversations"
            subheading={true}
            posts={transformedPosts}
            postButton={joined}
            collectiveData={collectiveData}
          />
        )}
      </div>
    </div>
  );
};

export default GroupCrwdUpdates;
