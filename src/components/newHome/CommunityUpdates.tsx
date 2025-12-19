import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Link } from "react-router-dom";
import { HandHeart, UserPlus } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { getPostById } from "@/services/api/social";
import CommunityPostCard from "@/components/newHome/CommunityPostCard";

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
      <div className="bg-white rounded-lg border border-gray-200 p-3 md:p-4 animate-pulse">
        <div className="flex items-start gap-3 md:gap-4">
          <div className="w-10 h-10 md:w-12 md:h-12 bg-gray-200 rounded-full flex-shrink-0"></div>
          <div className="flex-1 space-y-3">
            <div className="flex items-center gap-2">
              <div className="h-4 bg-gray-200 rounded w-24"></div>
              <div className="h-3 bg-gray-200 rounded w-16"></div>
            </div>
            <div className="space-y-2">
              <div className="h-3 bg-gray-200 rounded w-full"></div>
              <div className="h-3 bg-gray-200 rounded w-5/6"></div>
            </div>
            <div className="h-32 md:h-40 bg-gray-200 rounded-lg"></div>
            <div className="flex items-center gap-4 pt-2">
              <div className="h-4 bg-gray-200 rounded w-12"></div>
              <div className="h-4 bg-gray-200 rounded w-16"></div>
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
  const actionText = update.content || "";
  const isJoinNotification = update.isJoinNotification || false;

  return (
    <div className="bg-white rounded-lg border-0 p-3 md:p-4 ">
      {/* Top Section: Profile and Follow Button */}
      <div className="flex items-start justify-between mb-2.5 md:mb-3">
        <div className="flex items-center gap-2.5 md:gap-3">
          {/* Avatar */}
          <Avatar className="h-10 w-10 md:h-12 md:w-12 flex-shrink-0 rounded-xl">
            <AvatarImage src={update.user.avatar} />
            <AvatarFallback className="bg-[#1600ff] text-white text-xs md:text-sm">
              {update.user.name
                .split(" ")
                .map((n) => n.charAt(0))
                .join("")
                .toUpperCase()}
            </AvatarFallback>
          </Avatar>

          {/* User Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5 md:gap-2 flex-wrap">
              <Link
                to={`/user-profile/${update.user.id}`}
                className="font-bold text-sm md:text-base text-gray-900 hover:underline block"
              >
                {update.user.firstName && update.user.lastName 
                  ? `${update.user.firstName} ${update.user.lastName}`
                  : update.user.name || update.user.username}
              </Link>
              <p className="text-xs md:text-sm text-gray-500">@{update.user.username}</p>
            </div>
            {update.collective && (
              <p className="text-xs md:text-sm text-gray-500">{update.collective.name}</p>
            )}
          </div>
        </div>
      </div>

      {/* Content Box */}
      <div className={`rounded-lg p-2.5 md:p-3 mb-2.5 md:mb-3 flex items-center gap-2.5 md:gap-3 ${
        isJoinNotification 
          ? 'bg-blue-50' 
          : 'bg-green-50'
      }`}>
        {/* Icon */}
        <div className={`h-8 w-8 md:h-10 md:w-10 rounded-full flex items-center justify-center flex-shrink-0 ${
          isJoinNotification 
            ? 'bg-blue-500' 
            : 'bg-[#13b981]'
        }`}>
          {isJoinNotification ? (
            <UserPlus className="h-4 w-4 md:h-5 md:w-5 text-white" />
          ) : (
            <HandHeart className="h-4 w-4 md:h-5 md:w-5 text-white" />
          )}
        </div>
        {/* Action Text */}
        <p className="text-xs md:text-sm font-semibold text-gray-900 flex-1">
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
    <div className="w-full px-4 my-6 mb-8 md:px-0 md:my-8 md:mb-10">
      {showHeading && (
        <div className="
        mb-4 md:mb-6">
          <h2 className="text-xl sm:text-2xl  md:text-3xl lg:text-3xl xl:text-4xl 2xl:text-5xl font-bold text-gray-900 mb-1.5 md:mb-2">Community Updates</h2>
          <p className="text-xs md:text-sm text-gray-600">
            Activity, updates, and discoveries from your community
          </p>
        </div>
      )}

      <div className="space-y-3 md:space-y-4">
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



