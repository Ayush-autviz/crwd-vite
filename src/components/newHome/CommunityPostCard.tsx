import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Link, useNavigate } from "react-router-dom";
import { Heart, MessageCircle, Share2, MoreHorizontal, Pin, Pencil, Flag } from "lucide-react";
import dayjs from 'dayjs';
import { useState, useRef, useEffect } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { likePost, unlikePost } from "@/services/api/social";
import { patchFundraiser } from "@/services/api/crwd";
import { Toast } from "@/components/ui/toast";
import CommentsBottomSheet from "@/components/post/CommentsBottomSheet";
import { SharePost } from "@/components/ui/SharePost";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { formatDistanceToNow } from 'date-fns';

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
}

export default function CommunityPostCard({ post, onCommentPress, showSimplifiedHeader = false }: CommunityPostCardProps) {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const [isLiked, setIsLiked] = useState(post.isLiked || false);
  const [likesCount, setLikesCount] = useState(post.likes || 0);
  const [showCommentsSheet, setShowCommentsSheet] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [showFundraiserMenu, setShowFundraiserMenu] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const menuRef = useRef<HTMLDivElement>(null);

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
  const avatarBgColor = post.user.color || getConsistentColor(post.user.id, post.user.username || post.user.name);
  const initials = getUserInitials();

  // Handle outside click to close menu
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowFundraiserMenu(false);
      }
    };

    if (showFundraiserMenu) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showFundraiserMenu]);

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
        {/* Pinned Fundraiser Header - Only show if active */}
        {post.fundraiser?.is_active && (
          <div className="flex items-center justify-between mb-2 md:mb-3">
            <div className="flex items-center gap-1.5 md:gap-2">
              <Pin className="w-3 h-3 md:w-4 md:h-4 text-[#1600ff]" />
              <span className="text-[10px] md:text-sm font-medium text-[#1600ff]">PINNED FUNDRAISER</span>
            </div>
            <div className="relative" ref={menuRef}>
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
              <div className="flex items-center gap-1 md:gap-2 mb-0.5 flex-wrap">
                <Link
                  to={`/user-profile/${post.user.id}`}
                  onClick={(e) => e.stopPropagation()}
                  className="text-xs md:text-base font-bold text-gray-900 hover:underline cursor-pointer"
                >
                  {displayName}
                </Link>
                {!showSimplifiedHeader && post.user.username && (
                  <>
                    <span className="text-gray-400">•</span>
                    <span className="text-xs md:text-sm text-gray-500">
                      @{post.user.username}
                    </span>
                  </>
                )}
                {post.fundraiser?.is_active && (
                  <span className="px-2 py-0.5 bg-[#1600ff] text-white text-[9px] md:text-[10px] font-medium rounded-full">
                    Founder
                  </span>
                )}
              </div>
              {!showSimplifiedHeader && post.collective && (
                <Link
                  to={post.collective.id ? `/groupcrwd/${post.collective.id}` : '#'}
                  onClick={(e) => e.stopPropagation()}
                  className="text-xs md:text-sm text-gray-500 hover:text-gray-700 block"
                >
                  {post.collective.name}
                </Link>
              )}
              {post.fundraiser?.is_active && (
                <p className="text-[10px] md:text-xs text-gray-500 mb-0.5">Started a fundraiser</p>
              )}
              {showSimplifiedHeader && post.timestamp && !post.fundraiser?.is_active && (
                <div className="text-[10px] md:text-sm text-gray-500">
                  {formatDistanceToNow(new Date(post.timestamp), { addSuffix: true })}
                </div>
              )}
            </div>
          </div>
        </div>

        <Link to={post.fundraiser ? `/fundraiser/${post.fundraiser.id}` : `/post/${post.id}`} className="block">
          {/* Fundraiser Post UI */}
          {post.fundraiser?.is_active ? (
            <>
              {/* Fundraiser Cover Image/Color */}
              <div className="w-full rounded-t-lg overflow-hidden" style={{ height: '180px' }}>
                {post.fundraiser.color ? (
                  <div
                    className="w-full h-full flex items-center justify-center"
                    style={{ backgroundColor: post.fundraiser.color }}
                  >
                    <span className="text-white text-base md:text-lg font-bold">
                      {post.fundraiser.name}
                    </span>
                  </div>
                ) : post.fundraiser.image ? (
                  <img
                    src={post.fundraiser.image}
                    alt={post.fundraiser.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div
                    className="w-full h-full flex items-center justify-center"
                    style={{ backgroundColor: '#1600ff' }}
                  >
                    <span className="text-white text-xl md:text-2xl font-bold">
                      {post.fundraiser.name}
                    </span>
                  </div>
                )}
              </div>

              {/* Fundraiser Info */}
              <div className="mb-2 md:mb-3 bg-white p-4 rounded-b-lg">
                <h3 className="text-sm md:text-base font-bold text-gray-900 mb-2 md:mb-3">
                  {post.fundraiser.name}
                </h3>

                {/* Amount and Progress */}
                <div className="mb-2">
                  <div className="flex items-baseline gap-2 mb-1.5">
                    <span className="text-lg md:text-2xl font-bold text-[#1600ff]">
                      ${parseFloat(post.fundraiser.current_amount || '0').toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
                    </span>
                    <span className="text-xs md:text-sm text-gray-500">
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
                  <div className="flex items-center gap-3 md:gap-4 text-xs md:text-sm text-gray-900">
                    {post.fundraiser.total_donors !== undefined && (
                      <span>
                        <span className="font-semibold">{post.fundraiser.total_donors}</span> donor{post.fundraiser.total_donors !== 1 ? 's' : ''}
                      </span>
                    )}
                    {post.fundraiser.end_date && (
                      <span>
                        <span className="font-semibold">
                          {Math.max(0, dayjs(post.fundraiser.end_date).diff(dayjs(), 'day'))}
                        </span> days left
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </>
          ) : post.fundraiser ? (
            <>
              {/* Legacy Fundraiser UI for inactive fundraisers */}
              <div className="w-full rounded-t-lg overflow-hidden" style={{ height: '180px' }}>
                {post.fundraiser.color ? (
                  <div
                    className="w-full h-full flex items-center justify-center"
                    style={{ backgroundColor: post.fundraiser.color }}
                  >
                    <span className="text-white text-base md:text-lg font-bold">
                      {post.fundraiser.name}
                    </span>
                  </div>
                ) : post.fundraiser.image ? (
                  <img
                    src={post.fundraiser.image}
                    alt={post.fundraiser.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div
                    className="w-full h-full flex items-center justify-center"
                    style={{ backgroundColor: '#1600ff' }}
                  >
                    <span className="text-white text-xl md:text-2xl font-bold">
                      {post.fundraiser.name}
                    </span>
                  </div>
                )}
              </div>
              <div className="mb-2 md:mb-3 bg-blue-50 p-4 rounded-b-lg">
                <p className="text-xs md:text-sm text-gray-500 mb-1">Started a fundraiser</p>
                <h3 className="text-sm md:text-base font-bold text-gray-900 mb-2 md:mb-3">
                  {post.fundraiser.name}
                </h3>
                <div className="mb-2">
                  <div className="flex items-baseline gap-2 mb-1.5">
                    <span className="text-base md:text-xl font-bold text-[#1600ff]">
                      ${parseFloat(post.fundraiser.current_amount || '0').toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
                    </span>
                    <span className="text-xs md:text-sm text-gray-700">
                      raised of ${parseFloat(post.fundraiser.target_amount || '0').toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })} goal
                    </span>
                  </div>
                  <div className="w-full h-1.5 md:h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-[#1600ff] transition-all duration-300"
                      style={{ width: `${Math.min(post.fundraiser.progress_percentage || 0, 100)}%` }}
                    />
                  </div>
                </div>
              </div>
            </>
          ) : (
            <>
              <div className="text-xs md:text-base text-gray-900 leading-relaxed mb-2 md:mb-4 whitespace-pre-line">
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
                    className={`w-3.5 h-3.5 md:w-5 md:h-5 ${isLiked ? "fill-[#ef4444] text-[#ef4444]" : "text-gray-500"
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
                  <MessageCircle className="w-3.5 h-3.5 md:w-5 md:h-5 text-gray-500" strokeWidth={2} />
                  <span className="text-xs md:text-base font-medium text-gray-500">{post.comments || 0}</span>
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
                <Share2 className="w-3.5 h-3.5 md:w-5 md:h-5 text-gray-500" strokeWidth={2} />
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
    </Card>
  );
}

