import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import ActivityCard from './ActivityCard';
import CommunityPostCard from '@/components/newHome/CommunityPostCard';

interface CommunityActivityProps {
  posts: any[];
  isLoading?: boolean;
  collectiveId?: string;
  isJoined?: boolean;
  collectiveData?: any;
}

export default function CommunityActivity({
  posts,
  isLoading = false,
  collectiveId,
  isJoined = false,
  collectiveData,
}: CommunityActivityProps) {
  const navigate = useNavigate();
  
  // Get recent activities from collective data
  const recentActivities = collectiveData?.recent_activities || [];

  // Transform posts to match CommunityPostCard format
  const transformedPosts = posts.map((post: any) => ({
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
    <div className="px-3 md:px-4 py-4 md:py-6">
      <div className="flex items-center justify-between mb-3 md:mb-4">
        <div>
          <h3 className="font-bold text-base md:text-lg lg:text-xl text-foreground">
            Community Activity
          </h3>
          {posts && posts.length > 0 && (
            <p className="text-xs md:text-sm text-muted-foreground mt-0.5">
              {posts.length} Update{posts.length !== 1 ? 's' : ''}
            </p>
          )}
        </div>
        {!isJoined ? (
          <div
            className="bg-[#1600ff] hover:bg-[#1400cc] text-white font-bold px-2 md:px-3 lg:px-4 py-1 md:py-1.5 lg:py-2 rounded-full text-[10px] md:text-xs lg:text-sm"
          >
            Join to post updates
          </div>
        ) : (
          <Button
            onClick={() => navigate("/create-post", { state: { collectiveData } })}
            variant="default"
            className="px-2 md:px-4 lg:px-6 py-1 md:py-1.5 lg:py-2 rounded-full text-[10px] md:text-xs lg:text-sm"
          >
            Create Post
          </Button>
        )}
      </div>

      {isLoading ? (
        <div className="space-y-2.5 md:space-y-4">
          {[1, 2].map((i) => (
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
      ) : (
        <>
          {/* Posts Section */}
          {transformedPosts && transformedPosts.length > 0 ? (
            <div className="space-y-2.5 md:space-y-4">
              {transformedPosts.map((post: any) => (
                <CommunityPostCard key={post.id} post={post} />
              ))}
            </div>
          ) : (
            <div className="text-center py-6 md:py-8">
              <p className="text-xs md:text-sm text-muted-foreground">
                No community activity yet. Be the first to post!
              </p>
            </div>
          )}
          
          {/* Recent Activities Section */}
          {recentActivities.length > 0 && (
            <div className="mt-4 md:mt-6 space-y-0">
              {recentActivities.map((activity: any) => (
                <ActivityCard key={activity.id} activity={activity} />
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}

