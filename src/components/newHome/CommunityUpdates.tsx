import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Link, useNavigate } from "react-router-dom";
import { HandHeart, UserPlus } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getPostById, followUser, unfollowUser, getUserProfileById } from "@/services/api/social";
import CommunityPostCard from "@/components/newHome/CommunityPostCard";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useAuthStore } from "@/stores/store";

interface CommunityUpdate {
  id: string | number;
  user: {
    id?: string | number;
    name: string;
    firstName?: string;
    lastName?: string;
    username: string;
    avatar?: string;
  };
  collective?: {
    name: string;
    id?: string | number;
  };
  content: string;
  timestamp?: string;
  likesCount?: number;
  commentsCount?: number;
  postId?: string | number | null;
  isJoinNotification?: boolean;
}

interface CommunityUpdatesProps {
  updates?: CommunityUpdate[];
  showHeading?: boolean;
}

// Component to display full post when postId exists
function PostWithData({ update }: { update: CommunityUpdate }) {
  const { data: postData, isLoading } = useQuery({
    queryKey: ['post', update.postId],
    queryFn: () => getPostById(update.postId?.toString() || ''),
    enabled: !!update.postId,
  });

  if (isLoading) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-2.5 md:p-4 animate-pulse">
        <div className="flex items-start gap-2 md:gap-4">
          <div className="w-8 h-8 md:w-12 md:h-12 bg-gray-200 rounded-full flex-shrink-0"></div>
          <div className="flex-1 space-y-2 md:space-y-3">
            <div className="flex items-center gap-1.5 md:gap-2">
              <div className="h-3 bg-gray-200 rounded w-20 md:w-24"></div>
              <div className="h-2.5 bg-gray-200 rounded w-12 md:w-16"></div>
            </div>
            <div className="space-y-1.5 md:space-y-2">
              <div className="h-2.5 bg-gray-200 rounded w-full"></div>
              <div className="h-2.5 bg-gray-200 rounded w-5/6"></div>
            </div>
            <div className="h-24 md:h-40 bg-gray-200 rounded-lg"></div>
            <div className="flex items-center gap-3 md:gap-4 pt-1.5 md:pt-2">
              <div className="h-3 bg-gray-200 rounded w-10 md:w-12"></div>
              <div className="h-3 bg-gray-200 rounded w-12 md:w-16"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!postData) {
    // Fallback to notification summary if post not found
    return <NotificationSummary update={update} />;
  }

  // Transform post data to match CommunityPostCard format
  const post = {
    id: postData.id,
    user: {
      id: postData.user?.id,
      name: update.user.name,
      firstName: update.user.firstName,
      lastName: update.user.lastName,
      username: postData.user?.username || update.user.username,
      avatar: postData.user?.profile_picture || update.user.avatar,
    },
    collective: postData.collective
      ? {
          name: postData.collective.name,
          id: postData.collective.id,
        }
      : update.collective,
    content: postData.content || '',
    imageUrl: postData.media || undefined,
    likes: postData.likes_count || 0,
    comments: postData.comments_count || 0,
    isLiked: postData.is_liked || false,
    timestamp: postData.created_at,
  };

  return <CommunityPostCard post={post} />;
}

// Component to display notification summary
function NotificationSummary({ update }: { update: CommunityUpdate }) {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { user: currentUser, token } = useAuthStore();
  const actionText = update.content || "";
  const isJoinNotification = update.isJoinNotification || false;
  const isDonationNotification = !isJoinNotification && actionText.toLowerCase().includes('donated');

  // Fetch user profile to check follow status
  const { data: userProfile, isLoading: isLoadingProfile } = useQuery({
    queryKey: ['userProfile', update.user.id],
    queryFn: () => getUserProfileById(update.user.id?.toString() || ''),
    enabled: !!update.user.id && !!token?.access_token && isDonationNotification && currentUser?.id !== update.user.id,
  });

  // Check if user is being followed
  const isFollowing = userProfile?.is_following || false;

  // Follow user mutation
  const followMutation = useMutation({
    mutationFn: (userId: string) => followUser(userId),
    onSuccess: () => {
      toast.success('Following user');
      queryClient.invalidateQueries({ queryKey: ['userProfile', update.user.id] });
    },
    onError: (error: any) => {
      console.error('Error following user:', error);
      toast.error('Failed to follow user. Please try again.');
    },
  });

  // Unfollow user mutation
  const unfollowMutation = useMutation({
    mutationFn: (userId: string) => unfollowUser(userId),
    onSuccess: () => {
      toast.success('Unfollowed user');
      queryClient.invalidateQueries({ queryKey: ['userProfile', update.user.id] });
    },
    onError: (error: any) => {
      console.error('Error unfollowing user:', error);
      toast.error('Failed to unfollow user. Please try again.');
    },
  });

  const handleJoinClick = () => {
    if (update.collective?.id) {
      navigate(`/groupcrwd/${update.collective.id}`);
    } else if (update.collective?.name) {
      // If no ID, try to navigate by name (might need to search first)
      // For now, we'll try to construct the URL - this might need adjustment based on routing
      navigate(`/search?q=${encodeURIComponent(update.collective.name)}&type=collective`);
    }
  };

  const handleFollowClick = () => {
    if (update.user.id && currentUser?.id !== update.user.id) {
      if (isFollowing) {
        unfollowMutation.mutate(update.user.id.toString());
      } else {
        followMutation.mutate(update.user.id.toString());
      }
    }
  };

  return (
    <div className="bg-white rounded-lg border-0 p-2.5 md:p-4">
      {/* Top Section: Profile and Action Button */}
      <div className="flex items-start justify-between mb-2 md:mb-3">
        <div className="flex items-center gap-2 md:gap-3">
          {/* Avatar */}
          <Avatar className="h-8 w-8 md:h-11 md:w-11 flex-shrink-0 rounded-full">
            <AvatarImage src={update.user.avatar} />
            <AvatarFallback className="bg-[#1600ff] text-white text-[10px] md:text-sm">
              {update.user.name
                .split(" ")
                .map((n) => n.charAt(0))
                .join("")
                .toUpperCase()}
            </AvatarFallback>
          </Avatar>

          {/* User Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1 md:gap-2 lg:gap-3 flex-wrap">
              <Link
                to={`/user-profile/${update.user.id}`}
                className="font-bold text-xs md:text-base text-gray-900 hover:underline block"
              >
                {update.user.firstName && update.user.lastName 
                  ? `${update.user.firstName} ${update.user.lastName}`
                  : update.user.name || update.user.username}
              </Link>
              <p className="text-[10px] md:text-sm text-gray-500">@{update.user.username}</p>
            </div>
            {update.collective && (
              <p className="text-[10px] md:text-sm text-gray-500">{update.collective.name}</p>
            )}
          </div>
        </div>
        
        {/* Action Button - Join for join notifications, Follow for donation notifications */}
        {isJoinNotification && update.collective && (
          <button
            onClick={handleJoinClick}
            className="ml-1.5 sm:ml-2 md:ml-3 bg-white text-[#1600ff] border border-[#1600ff] hover:bg-[#1600ff] hover:text-white text-[10px] xs:text-xs sm:text-xs md:text-sm lg:text-base font-semibold px-2 xs:px-2.5 sm:px-3 md:px-4 lg:px-5 py-1 xs:py-1.5 sm:py-1.5   rounded-full flex-shrink-0"
          >
            Join
          </button>
        )}
        {isDonationNotification && update.user.id && currentUser?.id !== update.user.id && (
          <button
            onClick={handleFollowClick}
            disabled={followMutation.isPending || unfollowMutation.isPending || isLoadingProfile}
            className={`ml-1.5 sm:ml-2 md:ml-3 text-[10px] xs:text-xs sm:text-xs md:text-sm lg:text-base font-semibold px-2 xs:px-2.5 sm:px-3 md:px-4 lg:px-5 py-1 xs:py-1.5 sm:py-1.5 rounded-full flex-shrink-0 ${
              isFollowing
                ? 'bg-[#1600ff] text-white border border-[#1600ff] hover:bg-[#1400cc]'
                : 'bg-white text-[#1600ff] border border-[#1600ff] hover:bg-[#1600ff] hover:text-white'
            }`}
          >
            {followMutation.isPending || unfollowMutation.isPending ? 'Loading...' : isLoadingProfile ? 'Loading...' : isFollowing ? 'Following' : 'Follow'}
          </button>
        )}
      </div>

      {/* Content Box */}
      <div className={`rounded-lg p-1.5 md:p-2.5 mb-2 md:mb-3 flex items-center gap-2 md:gap-3 ${
        isJoinNotification 
          ? 'bg-gray-50' 
          : 'bg-gray-50'
      }`}>
        {/* Icon */}
        <div className={`h-6 w-6 md:h-8 md:w-8 rounded-full flex items-center justify-center flex-shrink-0 ${
          isJoinNotification 
            ? 'bg-blue-500' 
            : 'bg-[#13b981]'
        }`}>
          {isJoinNotification ? (
            <UserPlus className="h-2.5 w-2.5 md:h-4 md:w-4 text-white" />
          ) : (
            <HandHeart className="h-2.5 w-2.5 md:h-4 md:w-4 text-white" />
          )}
        </div>
        {/* Action Text */}
        <p className="text-[10px] md:text-sm font-semibold text-gray-900 flex-1">
          {actionText}
        </p>
      </div>
    </div>
  );
}

export default function CommunityUpdates({
  updates = [],
  showHeading = true,
}: CommunityUpdatesProps) {

  if (!updates || updates.length === 0) {
    return null;
  }

  return (
    <div className="w-full px-4 my-4 mb-6 md:px-0 md:my-8 md:mb-10">
      {showHeading && (
        <div className="mb-3 md:mb-6">
          <h2 className="text-base sm:text-xl md:text-3xl font-bold text-gray-900 mb-1 md:mb-2">Community Updates</h2>
          <p className="text-[10px] md:text-sm text-gray-600">
            Activity, updates, and discoveries from your community
          </p>
        </div>
      )}

      <div className="space-y-2.5 md:space-y-4">
        {updates.map((update) => {
          // If postId exists, fetch and display the full post
          const PostContent = update.postId ? PostWithData : NotificationSummary;
          
          return (
            <PostContent key={update.id} update={update} />
          );
        })}
      </div>
    </div>
  );
}



