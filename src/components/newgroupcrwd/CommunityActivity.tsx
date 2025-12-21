import { Button } from '@/components/ui/button';
import PopularPosts from '@/components/PopularPosts';
import { useNavigate } from 'react-router-dom';
import ActivityCard from './ActivityCard';

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
            className="bg-[#1600ff] hover:bg-[#1400cc] text-white font-bold px-3 md:px-4 py-1.5 md:py-2 rounded-full text-xs md:text-sm"
          >
            Join to post updates
          </div>
        ) : (
          <Button
            onClick={() => navigate("/create-post", { state: { collectiveData } })}
            variant="default"
            className="px-4 md:px-6 py-1.5 md:py-2 rounded-full text-xs md:text-sm"
          >
            Create Post
          </Button>
        )}
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-6 md:py-8">
          <p className="text-xs md:text-sm text-muted-foreground">Loading activity...</p>
        </div>
      ) : (
        <>
          {/* Posts Section */}
          {posts && posts.length > 0 ? (
            <PopularPosts
              posts={{ results: posts }}
              title="no title"
              showLoadMore={false}
            />
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

