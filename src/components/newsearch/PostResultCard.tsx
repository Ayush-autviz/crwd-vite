import { useNavigate } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Heart, MessageCircle } from 'lucide-react';

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
      onClick={() => navigate(`/post/${post.id}`)}
      className="cursor-pointer hover:shadow-md transition-shadow border border-gray-200 bg-white rounded-lg"
    >
      <CardContent className="px-3 md:px-4 py-3 md:py-4">
        {/* User Header */}
        <div className="flex items-start gap-2.5 md:gap-3 mb-2.5 md:mb-3">
          {user && (
            <Avatar className="w-9 h-9 md:w-10 md:h-10 rounded-full flex-shrink-0">
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
              <h3 className="font-bold text-xs md:text-sm text-gray-900">
                {fullName}
              </h3>
              {post.collective && (
                <>
                  <span className="text-gray-400">•</span>
                  <span className="text-xs md:text-sm text-[#1600ff] font-medium">
                    {post.collective.name}
                  </span>
                </>
              )}
            </div>
            <p className="text-[10px] md:text-xs text-gray-500">{timeAgo}</p>
          </div>
        </div>

        {/* Post Content */}
        {post.content && (
          <p className="text-xs md:text-sm text-gray-900 mb-2.5 md:mb-3 line-clamp-3">
            {post.content}
          </p>
        )}

        {/* Show preview card if previewDetails exists, otherwise show image */}
        {post.preview_details ? (
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
                  <div className="text-[9px] md:text-[10px] text-gray-500 uppercase tracking-wide mb-0.5 md:mb-1">
                    {post.preview_details.site_name}
                  </div>
                )}
                {post.preview_details.title && (
                  <h3 className="text-xs md:text-sm font-semibold text-gray-900 mb-0.5 md:mb-1 line-clamp-2">
                    {post.preview_details.title}
                  </h3>
                )}
                {post.preview_details.description && (
                  <p className="text-[10px] md:text-xs text-gray-500 mb-0.5 md:mb-1 line-clamp-2">
                    {post.preview_details.description}
                  </p>
                )}
                {post.preview_details.domain && (
                  <div className="text-[10px] md:text-[11px] text-gray-500 truncate">
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
                <div className="w-full rounded-lg overflow-hidden mb-2.5 md:mb-3 border border-gray-200">
                  <img
                    src={post.media}
                    alt="Post"
                    className="w-full h-[180px] md:h-[200px] object-cover"
                  />
                </div>
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
                      <div className="flex-1 p-2.5 md:p-3">
                        <div className="text-[9px] md:text-[10px] text-gray-500 uppercase tracking-wide mb-0.5 md:mb-1">
                          {siteName}
                        </div>
                        <div className="text-[10px] md:text-[11px] text-gray-500 truncate">
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

        {/* Like and Comment Counts */}
        <div className="flex items-center gap-3 md:gap-4 text-xs md:text-sm text-gray-600">
          <div className="flex items-center gap-1">
            <Heart className={`w-3.5 h-3.5 md:w-4 md:h-4 ${post.is_liked ? 'fill-red-500 text-red-500' : ''}`} />
            <span>{post.likes_count}</span>
          </div>
          <div className="flex items-center gap-1">
            <MessageCircle className="w-3.5 h-3.5 md:w-4 md:h-4" />
            <span>{post.comments_count}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}


