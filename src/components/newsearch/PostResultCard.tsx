import { useNavigate, Link } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Heart, MessageCircle, Share2 } from 'lucide-react';
import dayjs from 'dayjs';
import { useState } from 'react';
import { SharePost } from '@/components/ui/SharePost';

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
    };
    collective?: {
      id: number;
      name: string;
      description?: string;
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

// Format date to relative time
const formatTimeAgo = (dateString: string): string => {
  const date = new Date(dateString);
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (diffInSeconds < 60) return 'just now';
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
  if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)}d ago`;
  return date.toLocaleDateString();
};


export default function PostResultCard({ post }: PostResultCardProps) {
  const navigate = useNavigate();
  const [showShareModal, setShowShareModal] = useState(false);
  const user = post.user;
  const avatarBgColor = user ? getConsistentColor(user.id, avatarColors) : '#6B7280';

  // Get user initials
  const initials = user?.first_name && user?.last_name
    ? `${user.first_name.charAt(0)}${user.last_name.charAt(0)}`.toUpperCase()
    : user?.username?.charAt(0).toUpperCase() || 'U';

  // Get full name
  const fullName = user?.full_name ||
    (user?.first_name && user?.last_name
      ? `${user.first_name} ${user.last_name}`
      : user?.first_name || user?.username || 'Unknown User');

  // Format timestamp
  const timeAgo = formatTimeAgo(post.created_at);

  return (
    <Card
      onClick={() => navigate(post.fundraiser ? `/fundraiser/${post.fundraiser.id}` : `/post/${post.id}`)}
      className="cursor-pointer hover:shadow-md transition-shadow border border-gray-200 bg-white rounded-lg py-3"
    >
      <CardContent className="px-3 md:px-6">
        {/* User Header */}
        <div className="flex items-start gap-2.5 md:gap-3 mb-2.5 md:mb-3">
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
                  to={`/user-profile/${user.id}`}
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
                    to={`/groupcrwd/${post.collective.id}`}
                    onClick={(e) => e.stopPropagation()}
                    className="text-xs xs:text-sm md:text-base text-[#1600ff] font-medium hover:underline transition-colors cursor-pointer"
                  >
                    {post.collective.name}
                  </Link>
                </>
              )}
            </div>
            <p className="text-[10px] xs:text-xs md:text-sm text-gray-500">{timeAgo}</p>
          </div>
        </div>

        {/* Post Content */}
        {post.content && !post.fundraiser && (
          <p className="text-xs xs:text-sm md:text-base text-gray-900 mb-2.5 md:mb-3 line-clamp-3">
            {post.content}
          </p>
        )}

        {/* Fundraiser UI - show if fundraiser exists, otherwise show preview/media */}
        {post.fundraiser ? (
          <Link
            to={`/fundraiser/${post.fundraiser.id}`}
            onClick={(e) => e.stopPropagation()}
            className="block mb-2.5 md:mb-3 rounded-lg overflow-hidden border border-gray-200 bg-white"
          >
            {/* Fundraiser Cover Image/Color */}
            <div className="w-full rounded-t-lg overflow-hidden" style={{ height: '180px' }}>
              {post.fundraiser.color ? (
                <div
                  className="w-full h-full flex items-center justify-center"
                  style={{ backgroundColor: post.fundraiser.color }}
                >
                  <span className="text-white text-sm xs:text-base md:text-lg font-bold">
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
                  <span className="text-white text-lg xs:text-xl md:text-2xl font-bold">
                    {post.fundraiser.name}
                  </span>
                </div>
              )}
            </div>

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
                <div className="w-full md:w-48 h-[180px] md:h-[200px] lg:h-auto flex-shrink-0">
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
            // Check if media is likely an image URL
            const isImage = /\.(jpg|jpeg|png|gif|webp|svg|bmp)(\?|$)/i.test(post.media) ||
              /unsplash\.com|s3\.amazonaws\.com|crwd-bucket|imgur\.com/i.test(post.media);

            if (isImage) {
              return (
                <a
                  href={post.media}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={(e) => e.stopPropagation()}
                  className="block w-full rounded-lg overflow-hidden mb-2.5 md:mb-3 border border-gray-200 cursor-pointer hover:opacity-90 transition-opacity"
                >
                  <img
                    src={post.media}
                    alt="Post"
                    className="w-full h-[180px] md:h-[200px] object-cover"
                  />
                </a>
              );
            } else {
              // It's a link URL, show as preview-style card (even without preview_details)
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
                      {/* Preview Content - styled like preview card */}
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
                // Invalid URL, don't show anything
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
    </Card>
  );
}


