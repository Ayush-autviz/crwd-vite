import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Link, useNavigate } from "react-router-dom";
import { Heart, MessageCircle, Share2, MoreHorizontal, Pin, Pencil, Flag, Trash2, Users } from "lucide-react";
import dayjs from 'dayjs';
import { useState, useRef, useEffect } from "react";
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import { likePost, unlikePost, followUser, unfollowUser, getUserProfileById, deletePost } from "@/services/api/social";
import { patchFundraiser } from "@/services/api/crwd";
import { toast } from "sonner";
import { Toast } from "@/components/ui/toast";
import CommentsBottomSheet from "@/components/post/CommentsBottomSheet";
import { SharePost } from "@/components/ui/SharePost";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { formatDistanceToNow } from 'date-fns';
import { useAuthStore } from "@/stores/store";
import { DeletePostBottomSheet } from "@/components/post/DeletePostBottomSheet";

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
      color?: string;
    };
    collective?: {
      name: string;
      id?: string | number;
      sort_name?: string;
    };
    content: string;
    imageUrl?: string;
    likes: number;
    comments: number;
    isLiked?: boolean;
    timestamp?: string;
    fundraiser?: {
      id: number;
      name: string;
      description?: string;
      image?: string | null;
      color?: string | null;
      target_amount: string;
      current_amount: string;
      progress_percentage: number;
      is_active?: boolean;
      total_donors?: number;
      end_date?: string;
    };
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
  showSimplifiedHeader?: boolean; // When true, only show name and timestamp (for collective view)
  isHomeFeed?: boolean;
}

export default function CommunityPostCard({ post, onCommentPress, showSimplifiedHeader = false, isHomeFeed = false }: CommunityPostCardProps) {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const [isLiked, setIsLiked] = useState(post.isLiked || false);
  const [likesCount, setLikesCount] = useState(post.likes || 0);
  const [showCommentsSheet, setShowCommentsSheet] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [showFundraiserMenu, setShowFundraiserMenu] = useState(false);
  const [showPostMenu, setShowPostMenu] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const menuRef = useRef<HTMLDivElement>(null);
  const postMenuRef = useRef<HTMLDivElement>(null);
  const currentUser = useAuthStore((state) => state.user);
  console.log("post.collective", post.collective);

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

  // End Fundraiser Mutation
  // End Fundraiser Mutation
  const endFundraiserMutation = useMutation({
    mutationFn: (fundraiserId: number) => patchFundraiser(fundraiserId.toString(), { is_active: false }),
    onSuccess: () => {
      setToastMessage('Fundraiser ended successfully');
      setShowToast(true);
      queryClient.invalidateQueries({ queryKey: ['posts'] });
      queryClient.invalidateQueries({ queryKey: ['fundraiser', post.fundraiser?.id] });
      setShowFundraiserMenu(false);
    },
    onError: (error: any) => {
      console.error('Error ending fundraiser:', error);
      setToastMessage(`Failed to end fundraiser: ${error.response?.data?.message || error.message}`);
      setShowToast(true);
      setShowFundraiserMenu(false);
    },
  });

  const deletePostMutation = useMutation({
    mutationFn: () => deletePost(post.id.toString()),
    onSuccess: () => {
      setToastMessage("Post deleted successfully");
      setShowToast(true);
      queryClient.invalidateQueries({ queryKey: ['posts'] });
      setShowPostMenu(false);
    },
    onError: (error) => {
      console.error('Error deleting post:', error);
      toast.error('Failed to delete post');
    },
  });

  const handleDeleteClick = () => {
    deletePostMutation.mutate();
    setShowDeleteDialog(false);
  };

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
    // if (post.user.firstName && post.user.lastName) {
    //   return `${post.user.firstName.charAt(0)}${post.user.lastName.charAt(0)}`.toUpperCase();
    // }
    if (post.user.firstName) {
      return post.user.firstName.charAt(0).toUpperCase();
    }
    if (post.user.username) {
      return post.user.username.charAt(0).toUpperCase();
    }
  };

  // Fetch user profile to check follow status
  const { data: userProfile, isLoading: isLoadingProfile } = useQuery({
    queryKey: ['userProfile', String(post.user.id)],
    queryFn: () => getUserProfileById(post.user.id?.toString() || ''),
    enabled: !!post.user.id && !!currentUser?.token?.access_token && isHomeFeed && post.user.id !== currentUser?.id,
  });

  const isFollowing = userProfile?.is_following || false;

  // Follow user mutation
  const followMutation = useMutation({
    mutationFn: (userId: string) => followUser(userId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['userProfile', String(post.user.id)] });
      // toast.success('Following user');
    },
    onError: (error) => {
      console.error('Error following user:', error);
      toast.error('Failed to follow user');
    },
  });

  // Unfollow user mutation
  const unfollowMutation = useMutation({
    mutationFn: (userId: string) => unfollowUser(userId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['userProfile', String(post.user.id)] });
      // toast.success('Unfollowed user');
    },
    onError: (error) => {
      console.error('Error unfollowing user:', error);
      toast.error('Failed to unfollow user');
    },
  });

  const handleFollowClick = () => {
    if (post.user.id) {
      if (isFollowing) {
        unfollowMutation.mutate(post.user.id.toString());
      } else {
        followMutation.mutate(post.user.id.toString());
      }
    }
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
  const avatarBgColor = post.user.color || getConsistentColor(post.user.id, post.user.username || post.user.name);
  const initials = getUserInitials();

  // Handle outside click to close menu
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowFundraiserMenu(false);
      }
      if (postMenuRef.current && !postMenuRef.current.contains(event.target as Node)) {
        setShowPostMenu(false);
      }
    };

    if (showFundraiserMenu || showPostMenu) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showFundraiserMenu, showPostMenu]);

  const handleEditFundraiser = () => {
    if (post.fundraiser?.id) {
      navigate(`/edit-fundraiser/${post.fundraiser.id}`);
    }
    setShowFundraiserMenu(false);
  };

  const handleEndFundraiser = () => {
    if (post.fundraiser?.id) {
      endFundraiserMutation.mutate(post.fundraiser.id);
    }
  };

  return (
    <Card
      className={cn(
        "bg-white rounded-xl border-0 mb-0 pb-0 pt-1 overflow-hidden shadow-none",

      )}
    >
      <CardContent className={cn("p-2.5 md:p-4", post.fundraiser?.is_active && "bg-[#fbfcff] p-4 rounded-t-lg")}>
        {/* Pinned Fundraiser Header - Only show if active and not in home feed */}
        {post.fundraiser?.is_active && !isHomeFeed && (
          <div className="flex items-center justify-between mb-2 md:mb-3">
            <div className="flex items-center gap-1.5 md:gap-2">
              <Pin className="w-3 h-3 md:w-4 md:h-4 text-[#1600ff]" />
              <span className="text-[9px] xs:text-[10px] md:text-sm font-medium text-[#1600ff]">PINNED FUNDRAISER</span>
            </div>
            <div className="relative" ref={menuRef}>
              {post.user.id === currentUser?.id && (
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setShowFundraiserMenu(!showFundraiserMenu);
                  }}
                  className="p-1 hover:bg-gray-100 rounded-full transition-colors"
                >
                  <MoreHorizontal className="w-4 h-4 md:w-5 md:h-5 text-gray-500" />
                </button>
              )}

              {/* Dropdown Menu */}
              {showFundraiserMenu && (
                <div className="absolute right-0 top-8 md:top-10 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-50 min-w-[160px] md:min-w-[180px]">
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      handleEditFundraiser();
                    }}
                    className="w-full flex items-center gap-2 md:gap-3 px-3 md:px-4 py-2 md:py-2.5 text-xs md:text-sm text-gray-900 hover:bg-gray-50 transition-colors"
                  >
                    <Pencil className="w-4 h-4 md:w-5 md:h-5 text-gray-500" />
                    <span>Edit Fundraiser</span>
                  </button>
                  <div className="border-t border-gray-200 my-1"></div>
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      handleEndFundraiser();
                    }}
                    disabled={endFundraiserMutation.isPending}
                    className="w-full flex items-center gap-2 md:gap-3 px-3 md:px-4 py-2 md:py-2.5 text-xs md:text-sm text-red-600 hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Flag className="w-4 h-4 md:w-5 md:h-5 text-red-600" />
                    <span>{endFundraiserMutation.isPending ? 'Ending...' : 'End Fundraiser'}</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        <div className="flex items-center gap-2 md:gap-3">
          {/* Avatar */}
          <Link to={`/u/${post.user.username}`}>
            <Avatar className="h-8 w-8 xs:w-9 xs:h-9 md:h-10 md:w-10 flex-shrink-0">
              <AvatarImage src={post.user.avatar} alt={displayName} />
              <AvatarFallback
                style={{ backgroundColor: avatarBgColor }}
                className="text-white font-bold text-[10px] xs:text-xs md:text-sm"
              >
                {initials}
              </AvatarFallback>
            </Avatar>
          </Link>

          {/* User Info and Follow Button */}
          <div className="flex-1 min-w-0">
            <div className="mb-1.5 md:mb-3 flex items-center justify-between">
              <div className="flex flex-col">
                <div className="flex items-center gap-1 md:gap-2 flex-wrap">
                  <Link
                    to={`/u/${post.user.username}`}
                    onClick={(e) => e.stopPropagation()}
                    className="text-xs xs:text-base md:text-lg font-bold text-gray-900 hover:underline cursor-pointer"
                  >
                    {displayName}
                  </Link>
                  {post.fundraiser?.is_active && (
                    <span className="px-2 py-0.5 bg-[#1600ff] text-white text-[8px] xs:text-[10px] md:text-[12px] font-medium rounded-full">
                      Organizer
                    </span>
                  )}
                </div>
                {!showSimplifiedHeader && post.collective && (
                  <Link
                    to={post.collective.id ? `/g/${post.collective.sort_name}` : '#'}
                    onClick={(e) => e.stopPropagation()}
                    className="text-[11px] xs:text-sm md:text-base text-gray-500 hover:text-gray-700 flex items-center gap-1"
                  >
                    <Users className="text-gray-500 w-3 h-3 md:w-4 md:h-4" strokeWidth={2.5} />
                    {post.collective.name}
                  </Link>
                )}
                {post.fundraiser && !isHomeFeed && (
                  <p className="text-[10px] xs:text-xs md:text-sm text-gray-500 mb-0.5">Started a fundraiser</p>
                )}
                {/* {showSimplifiedHeader && post.timestamp && !post.fundraiser?.is_active && (
                  <div className="text-[10px] xs:text-xs md:text-sm text-gray-500">
                    {formatDistanceToNow(new Date(post.timestamp), { addSuffix: true })}
                  </div>
                )} */}
              </div>

              {/* Follow Button - Only show for not current user & in home feed */}
              {isHomeFeed && !isFollowing && post.user.id !== currentUser?.id && (
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    handleFollowClick();
                  }}
                  disabled={followMutation.isPending || unfollowMutation.isPending || isLoadingProfile}
                  className={`ml-2 text-[10px] xs:text-xs md:text-sm font-semibold px-2 xs:px-3 md:px-4 py-1 rounded-full flex-shrink-0 transition-colors ${isFollowing
                    ? 'bg-[#1600ff] text-white border border-[#1600ff] hover:bg-[#1400cc]'
                    : 'bg-white text-[#1600ff] border border-[#1600ff] hover:bg-blue-50'
                    }`}
                >
                  {followMutation.isPending || unfollowMutation.isPending || isLoadingProfile ? '...' : isFollowing ? 'Following' : 'Follow'}
                </button>
              )}

              {/* Ellipsis Menu for User's Own Posts */}
              {post.user.id === currentUser?.id && (
                <div className="relative ml-2" ref={postMenuRef}>
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      setShowPostMenu(!showPostMenu);
                    }}
                    className="p-1 hover:bg-gray-100 rounded-full transition-colors flex-shrink-0"
                  >
                    <MoreHorizontal className="w-4 h-4 md:w-5 md:h-5 text-gray-500" />
                  </button>

                  {/* Dropdown Menu */}
                  {showPostMenu && (
                    <div className="absolute right-0 top-8 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-50 min-w-[140px]">
                      <button
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          setShowPostMenu(false);
                          setShowDeleteDialog(true);
                        }}
                        disabled={deletePostMutation.isPending}
                        className="w-full flex items-center gap-2 px-3 py-2 text-xs md:text-sm text-red-600 hover:bg-gray-50 transition-colors"
                      >
                        <Trash2 className="w-4 h-4 text-red-600" />
                        <span>Delete Post</span>
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        <Link to={post.fundraiser ? `/fundraiser/${post.fundraiser.id}` : `/post/${post.id}`} className="block">
          {post.fundraiser ? (
            <>
              {/* Post Content */}
              {post.content && (
                <div className="text-xs xs:text-base text-gray-900 leading-relaxed mb-2 md:mb-4 whitespace-pre-line">
                  {post.content}
                </div>
              )}

              {/* Show fundraiser image like normal post image */}
              {post.fundraiser?.image ? (
                <div
                  className="w-full rounded-lg overflow-hidden mb-2 md:mb-3 cursor-pointer hover:opacity-90 transition-opacity relative "
                  style={{ maxWidth: '600px', maxHeight: '300px' }}
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    navigate(`/fundraiser/${post.fundraiser?.id}`);
                  }}
                >
                  <img
                    src={post.fundraiser.image}
                    alt="Fundraiser"
                    className=" max-h-[300px] object-contain rounded-lg"
                    style={{ objectPosition: 'center' }}
                  />
                </div>
              ) : null}

              {/* Fundraiser Cover Image/Color - Only show if no image (show color/default) */}
              {!post.fundraiser.image && (
                <div className="w-full rounded-t-lg overflow-hidden" style={{ height: '200px' }}>
                  {post.fundraiser.color ? (
                    <div
                      className="w-full h-full flex items-center justify-center"
                      style={{ backgroundColor: post.fundraiser.color }}
                    >
                      <span className="text-white text-sm xs:text-base md:text-lg font-bold text-center">
                        {post.fundraiser.name}
                      </span>
                    </div>
                  ) : (
                    <div
                      className="w-full h-full flex items-center justify-center"
                      style={{ backgroundColor: '#1600ff' }}
                    >
                      <span className="text-white text-lg xs:text-xl md:text-2xl font-bold text-center">
                        {post.fundraiser.name}
                      </span>
                    </div>
                  )}
                </div>
              )}

              {/* Fundraiser Info */}
              <div className="mb-2 md:mb-3 bg-white p-4 rounded-b-lg border border-t-0 border-gray-100">
                <h3 className="text-sm xs:text-base md:text-lg font-bold text-gray-900 mb-2 md:mb-3">
                  {post.fundraiser.name}
                </h3>

                {/* Amount and Progress */}
                <div className="mb-2">
                  <div className="flex items-baseline gap-2 mb-1.5">
                    <span className="text-lg xs:text-xl md:text-2xl font-bold text-[#1600ff]">
                      ${parseFloat(post.fundraiser.current_amount || '0').toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
                    </span>
                    <span className="text-xs xs:text-sm md:text-base text-gray-500">
                      raised of ${parseFloat(post.fundraiser.target_amount || '0').toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })} goal
                    </span>
                  </div>
                  {/* Progress Bar */}
                  <div className="w-full h-1.5 md:h-2 bg-gray-200 rounded-full overflow-hidden mb-1.5">
                    <div
                      className="h-full bg-[#1600ff] transition-all duration-300"
                      style={{ width: `${Math.min(post.fundraiser.progress_percentage || 0, 100)}%` }}
                    />
                  </div>
                  {/* Donors and Days Left */}
                  <div className="flex items-center gap-3 md:gap-4 text-xs xs:text-sm md:text-base text-gray-900">
                    {post.fundraiser.total_donors !== undefined && (
                      <span>
                        <span className="font-semibold">{post.fundraiser.total_donors}</span> donor{post.fundraiser.total_donors !== 1 ? 's' : ''}
                      </span>
                    )}
                    {post.fundraiser.end_date && post.fundraiser.is_active && (
                      <span>
                        <span className="font-semibold">
                          {Math.max(0, dayjs(post.fundraiser.end_date).diff(dayjs(), 'day'))}
                        </span> days left
                      </span>
                    )}
                    {!post.fundraiser.is_active && (
                      <span className="text-gray-500 font-medium">Fundraiser Ended</span>
                    )}
                  </div>
                </div>
              </div>
            </>
          ) : (
            <>
              <div className="text-xs xs:text-base text-gray-900 leading-relaxed mb-2 md:mb-4 whitespace-pre-line">
                {post.content}
              </div>

              {/* Show preview card if previewDetails exists, otherwise show image */}
              {post.previewDetails ? (
                // <a
                //   href={post.previewDetails.url}
                //   target="_blank"
                //   rel="noopener noreferrer"
                //   onClick={(e) => e.stopPropagation()}
                //   className="block w-full rounded-lg overflow-hidden mb-3 border border-gray-200 bg-white hover:opacity-90 transition-opacity cursor-pointer"
                // >
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
                // </a>
              ) : post.imageUrl ? (
                <div
                  className=" rounded-lg overflow-hidden mb-2 md:mb-3  cursor-pointer hover:opacity-90 transition-opacity relative"
                  style={{ maxWidth: '600px', maxHeight: '300px' }}
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    // Add logic to open image modal if desired, or just navigate to post
                    navigate(post.fundraiser ? `/fundraiser/${post.fundraiser.id}` : `/post/${post.id}`);
                  }}
                >
                  <img
                    src={post.imageUrl}
                    alt="Post"
                    className=" max-h-[300px] object-contain rounded-lg"
                  />
                </div>
              ) : null}
            </>
          )}

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
                    className={`w-4 h-4 md:w-5 md:h-5 ${isLiked ? "fill-[#ef4444] text-[#ef4444]" : "text-gray-500"
                      }`}
                    strokeWidth={2}
                  />
                  {/* )} */}
                  <span className="text-xs xs:text-sm md:text-base font-medium text-gray-500">{likesCount}</span>
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
                  <MessageCircle className="w-4 h-4 md:w-5 md:h-5 text-gray-500" strokeWidth={2} />
                  <span className="text-xs xs:text-sm md:text-base font-medium text-gray-500">{post.comments || 0}</span>
                </button>
              </div>
              <button
                className="flex items-center gap-1 p-0.5 hover:opacity-80 transition-opacity"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setShowShareModal(true);
                }}
              >
                <Share2 className="w-4 h-4 md:w-5 md:h-5 text-gray-500" strokeWidth={2} />
                {/* {post.fundraiser?.is_active && (
                  <span className="text-xs md:text-sm text-gray-500">Share</span>
                )} */}
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
          color: post.user.color,
        }}
      />

      {/* Share Modal */}
      <SharePost
        isOpen={showShareModal}
        onClose={() => setShowShareModal(false)}
        url={post.fundraiser
          ? `${window.location.origin}/fundraiser/${post.fundraiser.id}`
          : `${window.location.origin}/post/${post.id}`
        }
        title={post.fundraiser
          ? post.fundraiser.name
          : (post.collective?.name || `${post.user.firstName || ''} ${post.user.lastName || ''}`.trim() || post.user.name)
        }
        description={post.fundraiser
          ? post.fundraiser.description || post.content
          : post.content
        }
      />

      {/* Toast */}
      <Toast
        show={showToast}
        onHide={() => setShowToast(false)}
        message={toastMessage}
      />
      {/* Delete Confirmation Dialog */}
      <DeletePostBottomSheet
        isOpen={showDeleteDialog}
        onClose={() => setShowDeleteDialog(false)}
        onDelete={handleDeleteClick}
        isDeleting={deletePostMutation.isPending}
      />
    </Card>
  );
}

