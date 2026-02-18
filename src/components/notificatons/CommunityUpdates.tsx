import React, { useState, useMemo } from "react";
import { Card, CardContent } from "../ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { Heart, MessageCircle, EllipsisIcon } from "lucide-react";
import { IoArrowRedoOutline } from "react-icons/io5";
import { Link } from "react-router-dom";
import { AuthModal } from "../auth/AuthModal";
import { useFavorites } from "../../contexts/FavoritesContext";
import { Toast } from "../ui/toast";
import { Loader2 } from "lucide-react";
import { useAuthStore } from "../../stores/store";

interface CommunityUpdatesProps {
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

const CommunityUpdates: React.FC<CommunityUpdatesProps> = ({ 
  notifications = [], 
  isLoading = false 
}) => {
  const [open, setOpen] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const { toggleFavorite, isFavorite } = useFavorites();
  const { user: currentUser } = useAuthStore();

  const handleFavoriteClick = (postId: number) => {
    const wasAdded = toggleFavorite(`community-${postId}`);
    if (wasAdded) {
      setToastMessage("Added to favorites");
    } else {
      setToastMessage("Removed from favorites");
    }
    setShowToast(true);
  };

  const getHeartClassName = (postId: number) => {
    const baseClass = "w-4 h-4";
    const favoriteClass = isFavorite(`community-${postId}`)
      ? "fill-red-500 text-red-500"
      : "";
    return `${baseClass} ${favoriteClass}`;
  };

  // Transform API notifications to match the post format
  const transformedPosts = useMemo(() => {
    if (!notifications || notifications.length === 0) return [];

    return notifications
      .filter((notification: any) => notification.type === "community" || notification.type === "community_post")
      .map((notification: any) => {
        // Extract username from body if it contains @username pattern
        let username = '';
        const usernameMatch = notification.body?.match(/@(\w+)/);
        if (usernameMatch) {
          username = usernameMatch[1];
        } else {
          username = notification.user?.username || notification.data?.creator_id || notification.data?.new_member_id || '';
        }

        // Extract collective name from body - patterns like "posted in Heart for you" or "joined n jnum"
        let collectiveName = '';
        if (notification.body) {
          // Try pattern: "in [collective name]"
          const inMatch = notification.body.match(/in (.+)$/);
          if (inMatch) {
            collectiveName = inMatch[1].trim();
          }
          // If no match, try extracting after "joined"
          if (!collectiveName && notification.body.includes('joined')) {
            const joinMatch = notification.body.match(/joined (.+)$/);
            if (joinMatch) {
              collectiveName = joinMatch[1].trim();
            }
          }
        }

        // Extract user ID from notification data based on type
        const userId = 
          notification.data?.new_member_id || 
          notification.data?.creator_id || 
          notification.data?.donor_id ||
          notification.data?.liker_id ||
          notification.data?.user_id ||
          null;

        // Determine if it's a join notification
        const isJoin = notification.type === "community" && notification.body?.includes("joined");
        // Determine if it's a post notification
        const isPost = notification.type === "community_post" || (notification.type === "community" && notification.body?.includes("posted"));

        // Check if this is the current user's own profile
        const isCurrentUser = currentUser?.id && (
          (userId && currentUser.id.toString() === userId.toString()) || 
          (username && currentUser.username === username)
        );

        // Get profile link - use userId if available, otherwise use username
        const getProfileLink = () => {
          if (isCurrentUser) {
            return '/profile';
          }
          // if (userId) {
          //   return `/user-profile/${userId}`;
          // }
          if (username) {
            return `/u/${username}`;
          }
          return undefined;
        };

        const post = {
          id: notification.id,
          avatarUrl: notification.user?.profile_picture || notification.data?.profile_picture || '',
          username: username,
          userId: userId,
          profileLink: getProfileLink(),
          time: formatTimeAgo(notification.created_at || notification.updated_at),
          org: collectiveName || null,
          text: notification.body || notification.title || '',
          imageUrl: null, // API doesn't provide image in notifications
          likes: 0, // Not provided in notification API
          comments: 0, // Not provided in notification API
          shares: 0, // Not provided in notification API
          isJoin: isJoin,
          isPost: isPost,
          groupName: collectiveName,
          link: notification.data?.post_id ? `/post/${notification.data.post_id}` : undefined,
          collectiveId: notification.data?.collective_id,
        };

        return post;
      });
  }, [notifications, currentUser]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8 md:py-12">
        <Loader2 className="w-5 h-5 md:w-6 md:h-6 animate-spin text-gray-400" />
        <span className="ml-1.5 md:ml-2 text-xs md:text-sm text-gray-600">Loading community updates...</span>
      </div>
    );
  }

  if (transformedPosts.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 md:py-16 px-3 md:px-4">
        <div className="w-12 h-12 md:w-16 md:h-16 mx-auto mb-3 md:mb-4 bg-gray-100 rounded-full flex items-center justify-center">
          <svg className="w-6 h-6 md:w-8 md:h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
          </svg>
        </div>
        <h3 className="text-base md:text-lg font-semibold text-gray-900 mb-1.5 md:mb-2">No community updates yet</h3>
        <p className="text-xs md:text-sm text-gray-500 text-center max-w-sm">
          When members of your collectives post updates or join, you'll see them here.
        </p>
      </div>
    );
  }

  return (
    <div className="w-full flex flex-col">
      {/* Auth Modal */}
      <AuthModal open={open} onOpenChange={setOpen} />

      {/* Community Posts */}
      <div className="space-y-0">
        {transformedPosts.map((post: any) => (
          <Card
            key={post.id}
            className="overflow-hidden border-0 shadow-none rounded-none border-b border-gray-200 bg-white"
          >
            <CardContent className="p-3 md:p-4">
              <div className="flex gap-2.5 md:gap-3">
                {post.profileLink ? (
                  <Link to={post.profileLink}>
                    <Avatar className="h-9 w-9 md:h-10 md:w-10 flex-shrink-0 cursor-pointer hover:opacity-80 transition-opacity">
                      <AvatarImage src={post.avatarUrl} alt={post.username} />
                      <AvatarFallback className="text-xs md:text-sm">{post.username?.charAt(0).toUpperCase() || 'U'}</AvatarFallback>
                    </Avatar>
                  </Link>
                ) : (
                  <Avatar className="h-9 w-9 md:h-10 md:w-10 flex-shrink-0">
                    <AvatarImage src={post.avatarUrl} alt={post.username} />
                    <AvatarFallback className="text-xs md:text-sm">{post.username?.charAt(0).toUpperCase() || 'U'}</AvatarFallback>
                  </Avatar>
                )}

                <div className="flex-1 min-w-0">
                  {!post.isDonation && (
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-0.5 md:gap-1">
                        <span className="font-semibold text-xs md:text-sm text-gray-900">
                          {post.username}
                        </span>
                        <span className="text-[10px] md:text-xs text-gray-400">
                          • {post.time}
                        </span>
                      </div>
                      {/* <EllipsisIcon className="h-4 w-4 text-muted-foreground cursor-pointer" /> */}
                    </div>
                  )}

                  {post.org && (
                    <Link to={post.collectiveId ? `/groupcrwd/${post.collectiveId}` : `/groupcrwd`}>
                      <div className="text-[10px] md:text-xs text-blue-600 hover:underline cursor-pointer">
                        {typeof post.org === 'string' && post.org.startsWith('/') ? post.groupName : post.org}
                      </div>
                    </Link>
                  )}
                  {post.groupName && !post.org && (
                    <Link to={post.collectiveId ? `/groupcrwd/${post.collectiveId}` : `/groupcrwd`}>
                      <div className="text-[10px] md:text-xs text-blue-600 hover:underline cursor-pointer">
                        {post.groupName}
                      </div>
                    </Link>
                  )}

                  <div className="text-sm md:text-[0.98rem] mt-1.5 md:mt-2 mb-2 md:mb-3 text-gray-700 leading-snug">
                    {(() => {
                      if (post.isDonation) {
                        return (
                          <div className="flex items-center gap-1">
                            <span className=" font-semibold  text-gray-900">
                              @{post.username}
                            </span>
                            <span>{post.text}</span>
                            {post.donatedTo && (
                              <>
                                <span className="text-blue-500 font-semibold">
                                  {post.donatedTo}
                                </span>
                                <span className="text-xs text-gray-400">
                                  • {post.time}
                                </span>
                              </>
                            )}
                          </div>
                        );
                      }

                      if (post.isJoin) {
                        // Remove the duplicate collective name from text if it's already included
                        let displayText = post.text || '';
                        if (post.groupName && displayText.includes(post.groupName)) {
                          // Remove the duplicate collective name from the end of the text
                          const regex = new RegExp(`\\s*${post.groupName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\s*$`, 'i');
                          displayText = displayText.replace(regex, '').trim();
                        }
                        return (
                          <div className="flex items-center gap-2">
                            <span>{displayText}</span>
                            {post.groupName && (
                              // <Link to={post.collectiveId ? `/groupcrwd/${post.collectiveId}` : `/groupcrwd`}>
                                <span className="">
                                  {post.groupName}
                                </span>
                              // </Link>
                            )}
                          </div>
                        );
                      }

                      if (post.isPost && post.link) {
                        // For posts, show "post" (underlined) instead of the full link
                        return (
                          <div>
                            <span>{post.text}</span>
                            {' '}
                            <Link to={post.link}>
                              <span className="text-blue-600 hover:underline">post</span>
                            </Link>
                          </div>
                        );
                      }

                      return (
                        <div>
                          <div>{post.text}</div>
                          {post.link && (
                            <div className="text-blue-600 hover:underline mt-1">
                              {post.link}
                            </div>
                          )}
                        </div>
                      );
                    })()}
                  </div>

                  {post.imageUrl && (
                    <a
                      href={post.imageUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block w-full h-40 md:h-48 rounded-lg overflow-hidden mb-2 md:mb-3 lg:max-w-[600px] cursor-pointer hover:opacity-90 transition-opacity"
                    >
                      <img
                        src={post.imageUrl}
                        alt="Post"
                        className="w-full h-full object-cover"
                      />
                    </a>
                  )}

                  {post.linkPreview && (
                    <div className="border border-gray-200 rounded-lg p-2.5 md:p-3 mb-2 md:mb-3">
                      <h3 className="font-semibold text-gray-900 text-sm md:text-[0.98rem] mb-0.5 md:mb-1">
                        {post.linkPreview.title}
                      </h3>
                      <p className="text-xs md:text-[0.98rem] text-gray-600">
                        {post.linkPreview.description}
                      </p>
                    </div>
                  )}

                  {post.isEvent && post.eventDetails && (
                    <div className="space-y-1.5 md:space-y-2 mb-2 md:mb-3">
                      <div className="flex items-center gap-2 md:gap-4 text-xs md:text-[0.98rem] flex-wrap">
                        <div>
                          <span className="font-semibold text-gray-900">
                            Date
                          </span>
                          <span className="text-gray-600 ml-1">
                            {post.eventDetails.date}
                          </span>
                        </div>
                        <div>
                          <span className="font-semibold text-gray-900">
                            Time
                          </span>
                          <span className="text-gray-600 ml-1">
                            {post.eventDetails.time}
                          </span>
                        </div>
                        <div>
                          <span className="font-semibold text-gray-900">
                            RSVP
                          </span>
                          <span className="text-gray-600 ml-1">
                            {post.eventDetails.rsvp}
                          </span>
                        </div>
                        <div>
                          <span className="font-semibold text-gray-900">
                            Maybe
                          </span>
                          <span className="text-gray-600 ml-1">
                            {post.eventDetails.maybe}
                          </span>
                        </div>
                      </div>
                      <div className="text-xs md:text-[0.98rem]">
                        <span className="font-semibold text-gray-900">
                          Place
                        </span>
                        <span className="text-gray-600 ml-1">
                          {post.eventDetails.place}
                        </span>
                      </div>
                    </div>
                  )}

                  {/* <div className="flex items-center gap-4 text-muted-foreground mt-2">
                    <button
                      onClick={() => handleFavoriteClick(post.id)}
                      className="flex items-center gap-1 hover:text-red-500 transition-colors"
                    >
                      <Heart className={getHeartClassName(post.id)} />
                      <span className="text-xs">{post.likes}</span>
                    </button>
                    <button className="flex items-center gap-1 hover:text-blue-500 transition-colors">
                      <MessageCircle className="w-4 h-4" />
                      <span className="text-xs">{post.comments}</span>
                    </button>
                    <button className="flex items-center gap-1 hover:text-blue-500 transition-colors ml-auto">
                      <IoArrowRedoOutline className="w-4 h-4" />
                      <span className="text-xs">{post.shares}</span>
                    </button>
                  </div> */}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Toast notification */}
      <Toast
        message={toastMessage}
        show={showToast}
        onHide={() => setShowToast(false)}
        duration={2000}
      />
    </div>
  );
};

export default CommunityUpdates;
