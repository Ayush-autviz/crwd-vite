import { useQuery } from "@tanstack/react-query";
import { getPosts } from "@/services/api/social";
import CommunityPostCard from "@/components/newHome/CommunityPostCard";

interface CommunityPostsProps {
  limit?: number;
  startIndex?: number;
  showHeading?: boolean;
  onCommentPress?: (post: any) => void;
}

export default function CommunityPosts({ 
  limit = 3,
  startIndex = 0,
  showHeading = true,
  onCommentPress,
}: CommunityPostsProps) {
  const { data: postsData, isLoading } = useQuery({
    queryKey: ['posts', 'home'],
    queryFn: () => getPosts('', '', 1),
    enabled: true,
  });

  if (isLoading) {
    return (
      <div className="w-full px-4 my-4 mb-6 md:px-0 md:my-8 md:mb-10">
        {showHeading && (
          <div className="mb-3 md:mb-6">
            <h2 className="text-sm xs:text-base sm:text-xl md:text-3xl font-bold text-gray-900 mb-1 md:mb-2">
              Community Updates
            </h2>
            <p className="text-[10px] sm:text-xs md:text-sm text-gray-600">
              Activity, updates, and discoveries from your community
            </p>
          </div>
        )}
        <div className="space-y-2.5 md:space-y-4">
          {[1, 2].slice(0, limit).map((i) => (
            <div key={i} className="bg-white rounded-lg border border-gray-200 p-2.5 md:p-4 animate-pulse">
              <div className="flex items-start gap-2 md:gap-4">
                <div className="w-8 h-8 md:w-12 md:h-12 bg-gray-200 rounded-full flex-shrink-0"></div>
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                  <div className="h-3 bg-gray-200 rounded w-full"></div>
                  <div className="h-3 bg-gray-200 rounded w-5/6"></div>
                  <div className="h-32 md:h-40 bg-gray-200 rounded-lg"></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  const posts = postsData?.results || [];
  const limitedPosts = posts.slice(startIndex, startIndex + limit);

  if (limitedPosts.length === 0) {
    return null;
  }

  // Transform posts to match CommunityPostCard format
  const transformedPosts = limitedPosts.map((post: any) => ({
    id: post.id,
    user: {
      id: post.user?.id,
      name: post.user?.first_name && post.user?.last_name
        ? `${post.user.first_name} ${post.user.last_name}`
        : post.user?.username || 'Unknown User',
      firstName: post.user?.first_name,
      lastName: post.user?.last_name,
      username: post.user?.username || '',
      avatar: post.user?.profile_picture || '',
      color: post.user?.color,
    },
    collective: post.collective
      ? {
          name: post.collective.name,
          id: post.collective.id,
        }
      : undefined,
    content: post.content || '',
    imageUrl: post.media || undefined,
    likes: post.likes_count || 0,
    comments: post.comments_count || 0,
    isLiked: post.is_liked || false,
    timestamp: post.created_at,
    previewDetails: post.preview_details || post.previewDetails ? {
      url: post.preview_details?.url || post.previewDetails?.url,
      title: post.preview_details?.title || post.previewDetails?.title,
      description: post.preview_details?.description || post.previewDetails?.description,
      image: post.preview_details?.image || post.previewDetails?.image,
      site_name: post.preview_details?.site_name || post.previewDetails?.site_name,
      domain: post.preview_details?.domain || post.previewDetails?.domain,
    } : undefined,
  }));

  return (
    <div className="w-full px-4 my-4 mb-6 md:px-0 md:my-8 md:mb-10">
      {showHeading && (
        <div className="mb-3 md:mb-6">
          <h2 className="text-sm xs:text-base sm:text-xl md:text-3xl font-bold text-gray-900 mb-1 md:mb-2">
            Community Updates
          </h2>
          <p className="text-[10px] sm:text-xs md:text-sm text-gray-600">
            Activity, updates, and discoveries from your community
          </p>
        </div>
      )}

      <div className="space-y-2.5 md:space-y-4">
        {transformedPosts.map((post: any) => (
          <CommunityPostCard 
            key={post.id} 
            post={post} 
            onCommentPress={onCommentPress}
          />
        ))}
      </div>
    </div>
  );
}

