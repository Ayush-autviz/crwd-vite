import { useNavigate, Link } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Heart, MessageCircle, Share2, MoreHorizontal, Trash2 } from 'lucide-react';
import dayjs from 'dayjs';
import { useState, useRef, useEffect } from 'react';
import { SharePost } from '@/components/ui/SharePost';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { deletePost } from '@/services/api/social';
import { useAuthStore } from '@/stores/store';
import { DeletePostBottomSheet } from '@/components/post/DeletePostBottomSheet';
import { Toast } from '@/components/ui/toast';

interface PreviewDetails {
  title?: string | null;
  description?: string | null;
  image?: string | null;
  url?: string;
  domain?: string | null;
  site_name?: string | null;
}

interface PostResultCardProps {
  post: {
    id: number;
    content: string;
    media?: string;
    preview_details?: PreviewDetails | null;
    created_at: string;
    likes_count: number;
    comments_count: number;
    is_liked?: boolean;
    user?: {
      id: number;
      username: string;
      first_name?: string;
      last_name?: string;
      full_name?: string;
      profile_picture?: string;
      bio?: string;
      color?: string;
    };
    collective?: {
      id: number;
      name: string;
      description?: string;
      sort_name?: string;
    };
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
  };
}

// Get consistent color for avatar
const avatarColors = [
  '#3B82F6', '#EC4899', '#8B5CF6', '#10B981', '#F59E0B', '#EF4444', '#06B6D4',
  '#F97316', '#84CC16', '#A855F7', '#14B8A6', '#F43F5E', '#6366F1', '#22C55E', '#EAB308',
];

const getConsistentColor = (id: number | string, colors: string[]) => {
  const hash = typeof id === 'number' ? id : id.toString().split('').reduce((acc: number, char: string) => acc + char.charCodeAt(0), 0);
  return colors[hash % colors.length];
};



export default function PostResultCard({ post }: PostResultCardProps) {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [showShareModal, setShowShareModal] = useState(false);
  const [showPostMenu, setShowPostMenu] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const postMenuRef = useRef<HTMLDivElement>(null);
  const currentUser = useAuthStore((state) => state.user);

  const deletePostMutation = useMutation({
    mutationFn: () => deletePost(post.id.toString()),
    onSuccess: () => {
      setToastMessage("Post deleted successfully");
      setShowToast(true);
      queryClient.invalidateQueries({ queryKey: ['posts'] });
      queryClient.invalidateQueries({ queryKey: ['search'] });
      setShowPostMenu(false);
    },
    onError: (error) => {
      console.error('Error deleting post:', error);
      setToastMessage("Failed to delete post");
      setShowToast(true);
    },
  });

  const handleDeleteClick = () => {
    deletePostMutation.mutate();
    setShowDeleteDialog(false);
  };

  // Handle outside click to close menu
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (postMenuRef.current && !postMenuRef.current.contains(event.target as Node)) {
        setShowPostMenu(false);
      }
    };

    if (showPostMenu) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showPostMenu]);

  const user = post.user;
  const avatarBgColor = user ? user.color || getConsistentColor(user.id, avatarColors) : '#6B7280';

  // Get user initials
  const initials = user?.first_name && user?.last_name
    ? `${user.first_name.charAt(0)}`.toUpperCase()
    : user?.username?.charAt(0).toUpperCase() || 'U';

  // Get full name
  const fullName = user?.full_name ||
    (user?.first_name && user?.last_name
      ? `${user.first_name} ${user.last_name}`
      : user?.first_name || user?.username || 'Unknown User');

  return (
    <Card
      onClick={() => navigate(post.fundraiser ? `/fundraiser/${post.fundraiser.id}` : `/post/${post.id}`)}
      className="cursor-pointer hover:shadow-md transition-shadow border border-gray-200 bg-white rounded-lg py-3 relative"
    >
      <CardContent className="px-3 md:px-6">
        {/* User Header */}
        <div className="flex items-start justify-between mb-2.5 md:mb-3">
          <div className="flex items-start gap-2.5 md:gap-3 flex-1 min-w-0">
            {user && (
              <Avatar className="w-8 h-8 md:w-11 md:h-11 rounded-full flex-shrink-0">
                <AvatarImage src={user.profile_picture} alt={fullName} />
                <AvatarFallback
                  style={{ backgroundColor: avatarBgColor }}
                  className="text-white font-bold text-xs md:text-sm"
                >
                  {initials}
                </AvatarFallback>
              </Avatar>
            )}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1.5 md:gap-2 flex-wrap">
                {user && (
                  <Link
                    to={`/u/${user.username}`}
                    onClick={(e) => e.stopPropagation()}
                    className="font-bold text-xs xs:text-sm md:text-base text-gray-900 hover:text-blue-600 transition-colors cursor-pointer"
                  >
                    {fullName}
                  </Link>
                )}
                {post.collective && (
                  <>
                    <span className="text-gray-400">•</span>
                    <Link
                      to={`/g/${post.collective.sort_name}`}
                      onClick={(e) => e.stopPropagation()}
                      className="text-xs xs:text-sm md:text-base text-gray-500 font-medium hover:underline transition-colors cursor-pointer"
                    >
                      {post.collective.name}
                    </Link>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Ellipsis Menu for User's Own Posts */}
          {user?.id === currentUser?.id && !post.fundraiser?.is_active && (
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

        {/* Post Content */}
        {post.content && !post.fundraiser && (
          <p className="text-xs xs:text-sm md:text-base text-gray-900 mb-2.5 md:mb-3 line-clamp-3">
            {post.content}
          </p>
        )}

        {/* Show fundraiser image like normal post image */}
        {post.fundraiser?.image ? (
          <div
            className="w-full rounded-lg overflow-hidden mb-2.5 md:mb-3 cursor-pointer hover:opacity-90 transition-opacity relative"
            style={{ maxWidth: '600px', maxHeight: '300px' }}
          >
            <img
              src={post.fundraiser.image}
              alt="Fundraiser"
              className="max-h-[300px] object-contain rounded-lg"
            />
          </div>
        ) : null}

        {/* Fundraiser UI - show if fundraiser exists, otherwise show preview/media */}
        {post.fundraiser ? (
          <Link
            to={`/fundraiser/${post.fundraiser.id}`}
            onClick={(e) => e.stopPropagation()}
            className="block mb-2.5 md:mb-3 rounded-lg overflow-hidden border border-gray-200 bg-white"
          >
            {/* Fundraiser Cover Image/Color - Only show if no image */}
            {!post.fundraiser.image && (
              <div className="w-full rounded-t-lg overflow-hidden">
                {post.fundraiser.color ? (
                  <div
                    className="w-full h-[200px] flex items-center justify-center"
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
            <div className="bg-white p-4 rounded-b-lg border border-t-0 border-gray-100">
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
          </Link>
        ) : post.preview_details ? (
          <a
            href={post.preview_details.url || post.media}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => e.stopPropagation()}
            className="block w-full rounded-lg overflow-hidden mb-2.5 md:mb-3 border border-gray-200 bg-white hover:opacity-90 transition-opacity cursor-pointer"
          >
            <div className="flex flex-col md:flex-row bg-white">
              {/* Preview Image */}
              {post.preview_details.image && (
                <div className="w-full md:w-48 aspect-[2/1] md:aspect-auto lg:h-auto flex-shrink-0">
                  <img
                    src={post.preview_details.image}
                    alt={post.preview_details.title || 'Link preview'}
                    className="w-full h-full object-cover"
                  />
                </div>
              )}
              {/* Preview Content */}
              <div className="flex-1 p-2.5 md:p-3">
                {post.preview_details.site_name && (
                  <div className="text-[9px] xs:text-[10px] md:text-xs text-gray-500 uppercase tracking-wide mb-0.5 md:mb-1">
                    {post.preview_details.site_name}
                  </div>
                )}
                {post.preview_details.title && (
                  <h3 className="text-xs xs:text-sm md:text-base font-semibold text-gray-900 mb-0.5 md:mb-1 line-clamp-2">
                    {post.preview_details.title}
                  </h3>
                )}
                {post.preview_details.description && (
                  <p className="text-[10px] xs:text-xs md:text-sm text-gray-500 mb-0.5 md:mb-1 line-clamp-2">
                    {post.preview_details.description}
                  </p>
                )}
                {post.preview_details.domain && (
                  <div className="text-[10px] xs:text-[11px] md:text-xs text-gray-500 truncate">
                    {post.preview_details.domain}
                  </div>
                )}
              </div>
            </div>
          </a>
        ) : post.media ? (
          (() => {
            const isImage = /\.(jpg|jpeg|png|gif|webp|svg|bmp)(\?|$)/i.test(post.media) ||
              /unsplash\.com|s3\.amazonaws\.com|crwd-bucket|imgur\.com/i.test(post.media);

            if (isImage) {
              return (
                <div
                  className="w-full rounded-lg overflow-hidden mb-2.5 md:mb-3 cursor-pointer hover:opacity-90 transition-opacity relative"
                  style={{ maxWidth: '600px', maxHeight: '300px' }}
                >
                  <img
                    src={post.media}
                    alt="Post"
                    className="max-h-[300px] object-contain rounded-lg"
                  />
                </div>
              );
            } else {
              try {
                const url = new URL(post.media);
                const domain = url.hostname.replace('www.', '');
                const siteName = domain.split('.')[0].toUpperCase();

                return (
                  <a
                    href={post.media}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={(e) => e.stopPropagation()}
                    className="block w-full rounded-lg overflow-hidden mb-2.5 md:mb-3 border border-gray-200 bg-white hover:opacity-90 transition-opacity cursor-pointer"
                  >
                    <div className="flex flex-col md:flex-row bg-white">
                      <div className="flex-1 p-2.5 md:p-4">
                        <div className="text-[9px] xs:text-[10px] md:text-xs text-gray-500 uppercase tracking-wide mb-0.5 md:mb-1">
                          {siteName}
                        </div>
                        <div className="text-[10px] xs:text-[11px] md:text-xs text-gray-500 truncate">
                          {domain}
                        </div>
                      </div>
                    </div>
                  </a>
                );
              } catch {
                return null;
              }
            }
          })()
        ) : null}

        {/* Like, Comment, and Share */}
        <div className="flex items-center justify-between border-y border-gray-100 py-2 md:py-4">
          <div className="flex items-center gap-3 md:gap-6">
            <div className="flex items-center gap-1">
              <Heart className={`w-4 h-4 md:w-5 md:h-5 ${post.is_liked ? 'fill-red-500 text-red-500' : 'text-gray-500'}`} />
              <span className="text-xs xs:text-sm md:text-base font-medium text-gray-500">{post.likes_count}</span>
            </div>
            <div className="flex items-center gap-1">
              <MessageCircle className="w-4 h-4 md:w-5 md:h-5 text-gray-500" />
              <span className="text-xs xs:text-sm md:text-base font-medium text-gray-500">{post.comments_count}</span>
            </div>
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
          </button>
        </div>
      </CardContent>

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
          : (post.collective?.name || fullName)
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
