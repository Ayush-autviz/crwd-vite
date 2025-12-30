import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Link } from "react-router-dom";
import { Heart, MessageCircle, Share2 } from "lucide-react";
import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { likePost, unlikePost } from "@/services/api/social";
import CommentsBottomSheet from "@/components/post/CommentsBottomSheet";
import { SharePost } from "@/components/ui/SharePost";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { Loader2 } from "lucide-react";

interface CommunityPostCardProps {
  post: {
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
    imageUrl?: string;
    likes: number;
    comments: number;
    isLiked?: boolean;
    timestamp?: string;
    previewDetails?: {
      url?: string;
      title?: string;
      description?: string;
      image?: string;
      site_name?: string;
      domain?: string;
    };
  };
  onCommentPress?: (post: CommunityPostCardProps['post']) => void;
}

export default function CommunityPostCard({ post, onCommentPress }: CommunityPostCardProps) {
  const queryClient = useQueryClient();
  const [isLiked, setIsLiked] = useState(post.isLiked || false);
  const [likesCount, setLikesCount] = useState(post.likes || 0);
  const [showCommentsSheet, setShowCommentsSheet] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);

  const likeMutation = useMutation({
    mutationFn: () => likePost(post.id.toString()),
    onSuccess: () => {
      setIsLiked(true);
      setLikesCount((prev) => prev + 1);
      queryClient.invalidateQueries({ queryKey: ['posts'] });
      queryClient.invalidateQueries({ queryKey: ['post', post.id] });
    },
    onError: (error) => {
      console.error('Error liking post:', error);
    },
  });

  const unlikeMutation = useMutation({
    mutationFn: () => unlikePost(post.id.toString()),
    onSuccess: () => {
      setIsLiked(false);
      setLikesCount((prev) => Math.max(0, prev - 1));
      queryClient.invalidateQueries({ queryKey: ['posts'] });
      queryClient.invalidateQueries({ queryKey: ['post', post.id] });
    },
    onError: (error) => {
      console.error('Error unliking post:', error);
    },
  });

  const handleLikeClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (isLiked) {
      unlikeMutation.mutate();
    } else {
      likeMutation.mutate();
    }
  };

  const displayName = post.user.firstName && post.user.lastName
    ? `${post.user.firstName} ${post.user.lastName}`
    : post.user.name || post.user.username;

  // Get user initials
  const getUserInitials = () => {
    if (post.user.firstName && post.user.lastName) {
      return `${post.user.firstName.charAt(0)}${post.user.lastName.charAt(0)}`.toUpperCase();
    }
    if (post.user.firstName) {
      return post.user.firstName.charAt(0).toUpperCase();
    }
    if (post.user.username) {
      return post.user.username.charAt(0).toUpperCase();
    }
    return "U";
  };

  // Generate vibrant avatar colors
  const avatarColors = [
    '#3B82F6', // Blue
    '#EC4899', // Pink
    '#8B5CF6', // Purple
    '#10B981', // Green
    '#F59E0B', // Amber
    '#EF4444', // Red
    '#06B6D4', // Cyan
    '#F97316', // Orange
    '#84CC16', // Lime
    '#A855F7', // Violet
    '#14B8A6', // Teal
    '#F43F5E', // Rose
    '#6366F1', // Indigo
    '#22C55E', // Emerald
    '#EAB308', // Yellow
  ];
  // Use user ID to generate a consistent color for each user (same user = same color across all posts)
  const getConsistentColor = (id: number | string | undefined, fallbackName?: string) => {
    if (id !== undefined && id !== null) {
      const hash = typeof id === 'number' ? id : id.toString().split('').reduce((acc: number, char: string) => acc + char.charCodeAt(0), 0);
      return avatarColors[hash % avatarColors.length];
    }
    if (fallbackName) {
      const hash = fallbackName.split('').reduce((acc: number, char: string) => acc + char.charCodeAt(0), 0);
      return avatarColors[hash % avatarColors.length];
    }
    return avatarColors[0];
  };
  const avatarBgColor = getConsistentColor(post.user.id, post.user.username || post.user.name);
  const initials = getUserInitials();

  return (
    <Card
      className={cn(
        "bg-white rounded-xl border-0 mb-0 pb-0 pt-1 overflow-hidden shadow-none",

      )}
    >
      <CardContent className="p-2.5 md:p-4">
        <div className="flex gap-2 md:gap-3">
          <Link to={`/user-profile/${post.user.id}`}>
            <Avatar className="h-8 w-8 md:h-10 md:w-10 flex-shrink-0">
              <AvatarImage
                src={post.user.avatar}
                alt={displayName}
              />
              <AvatarFallback
                style={{ backgroundColor: avatarBgColor }}
                className="text-white font-bold text-[10px] md:text-sm"
              >
                {initials}
              </AvatarFallback>
            </Avatar>
          </Link>
          <div className="flex-1 min-w-0">
            <div className="mb-1.5 md:mb-3">
              <div className="flex items-center gap-1 md:gap-2 mb-0.5">
                <Link
                  to={`/user-profile/${post.user.id}`}
                  onClick={(e) => e.stopPropagation()}
                  className="text-xs md:text-base font-bold text-gray-900 hover:underline cursor-pointer"
                >
                  {displayName}
                </Link>
                <span className="text-[10px] md:text-sm text-gray-500">@{post.user.username}</span>
              </div>
              {post.collective?.name && (
                <div className="text-[10px] md:text-sm text-gray-500 mb-0.5">
                  {post.collective.name}
                </div>
              )}
            </div>
            </div>
            </div>

            <Link to={`/post/${post.id}`} className="block">
              <div className="text-xs md:text-base text-gray-900 leading-relaxed mb-2 md:mb-4 whitespace-pre-line">
                {post.content}
              </div>

              {/* Show preview card if previewDetails exists, otherwise show image */}
              {post.previewDetails ? (
                <a
                  href={post.previewDetails.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={(e) => e.stopPropagation()}
                  className="block w-full rounded-lg overflow-hidden mb-3 border border-gray-200 bg-white hover:opacity-90 transition-opacity cursor-pointer"
                >
                  <div className="flex flex-col md:flex-row bg-white">
                    {/* Preview Image */}
                    {post.previewDetails.image && (
                      <div className="w-full md:w-48 h-[150px] md:h-auto flex-shrink-0">
                        <img
                          src={post.previewDetails.image}
                          alt={post.previewDetails.title || 'Link preview'}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    )}
                    {/* Preview Content */}
                    <div className="flex-1 p-2 md:p-3">
                      {post.previewDetails.site_name && (
                        <div className="text-[8px] md:text-[10px] text-gray-500 uppercase tracking-wide mb-0.5 md:mb-1">
                          {post.previewDetails.site_name}
                        </div>
                      )}
                      {post.previewDetails.title && (
                        <h3 className="text-[10px] md:text-sm font-semibold text-gray-900 mb-0.5 md:mb-1 line-clamp-2">
                          {post.previewDetails.title}
                        </h3>
                      )}
                      {post.previewDetails.description && (
                        <p className="text-[9px] md:text-xs text-gray-500 mb-0.5 md:mb-1 line-clamp-2">
                          {post.previewDetails.description}
                        </p>
                      )}
                      {post.previewDetails.domain && (
                        <div className="text-[9px] md:text-[11px] text-gray-500 truncate">
                          {post.previewDetails.domain}
                        </div>
                      )}
                    </div>
                  </div>
                </a>
              ) : post.imageUrl ? (
                <a
                  href={post.imageUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={(e) => e.stopPropagation()}
                  className="block w-full rounded-lg overflow-hidden mb-2 md:mb-3 border border-gray-200 cursor-pointer hover:opacity-90 transition-opacity"
                >
                  <img
                    src={post.imageUrl}
                    alt="Post"
                    className="w-full h-[140px] md:h-[200px] object-cover"
                  />
                </a>
              ) : null}

              {/* Footer */}
              <div className="border-y border-gray-100 py-2 md:py-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3 md:gap-6">
                    <button
                      onClick={handleLikeClick}
                      disabled={likeMutation.isPending || unlikeMutation.isPending}
                      className="flex items-center gap-1 hover:opacity-80 transition-opacity disabled:opacity-50"
                    >
                      {/* {likeMutation.isPending || unlikeMutation.isPending ? (
                        <Loader2 className="w-4 h-4 md:w-5 md:h-5 animate-spin text-gray-400" />
                      ) : ( */}
                      <Heart
                        className={`w-3.5 h-3.5 md:w-5 md:h-5 ${isLiked ? "fill-[#ef4444] text-[#ef4444]" : "text-gray-400"
                          }`}
                        strokeWidth={2}
                      />
                      {/* )} */}
                      <span className="text-xs md:text-base font-medium text-gray-500">{likesCount}</span>
                    </button>
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        if (onCommentPress) {
                          onCommentPress(post);
                        } else {
                          setShowCommentsSheet(true);
                        }
                      }}
                      className="flex items-center gap-1 hover:opacity-80 transition-opacity"
                    >
                      <MessageCircle className="w-3.5 h-3.5 md:w-5 md:h-5 text-gray-400" strokeWidth={2} />
                      <span className="text-xs md:text-base font-medium text-gray-500">{post.comments || 0}</span>
                    </button>
                  </div>
                  <button
                    className="p-0.5 hover:opacity-80 transition-opacity"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      setShowShareModal(true);
                    }}
                  >
                    <Share2 className="w-3.5 h-3.5 md:w-5 md:h-5 text-gray-400" strokeWidth={2} />
                  </button>
                </div>
              </div>
            </Link>
          {/* </div> */}
        {/* </div> */}
      </CardContent>

      {/* Comments Bottom Sheet */}
      <CommentsBottomSheet
        isOpen={showCommentsSheet}
        onClose={() => setShowCommentsSheet(false)}
        post={{
          id: typeof post.id === 'string' ? parseInt(post.id) : post.id,
          username: post.user.username,
          text: post.content,
          avatarUrl: post.user.avatar,
          firstName: post.user.firstName,
          lastName: post.user.lastName,
        }}
      />

      {/* Share Modal */}
      <SharePost
        isOpen={showShareModal}
        onClose={() => setShowShareModal(false)}
        url={`${window.location.origin}/post/${post.id}`}
        title={post.collective?.name || `${post.user.firstName} ${post.user.lastName}` || post.user.name}
        description={post.content}
      />
    </Card>
  );
}

