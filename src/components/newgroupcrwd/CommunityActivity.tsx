import { Button } from '@/components/ui/button';
import PopularPosts from '@/components/PopularPosts';
import { useNavigate } from 'react-router-dom';

interface CommunityActivityProps {
  posts: any[];
  isLoading?: boolean;
  collectiveId?: string;
  isJoined?: boolean;
}

export default function CommunityActivity({
  posts,
  isLoading = false,
  collectiveId,
  isJoined = false,
}: CommunityActivityProps) {
  const navigate = useNavigate();

  return (
    <div className="px-4 py-6">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="font-bold text-lg md:text-xl text-foreground">
            Community Activity
          </h3>
          {posts && posts.length > 0 && (
            <p className="text-sm text-muted-foreground mt-0.5">
              {posts.length} Update{posts.length !== 1 ? 's' : ''}
            </p>
          )}
        </div>
        {!isJoined && (
          <Button
            onClick={() => {
              // Navigate to join or show join modal
              if (collectiveId) {
                navigate(`/newgroupcrwd/${collectiveId}`);
              }
            }}
            className="bg-[#1600ff] hover:bg-[#1400cc] text-white font-bold px-4 py-2 rounded-full text-sm"
          >
            Join to post updates
          </Button>
        )}
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-8">
          <p className="text-muted-foreground">Loading activity...</p>
        </div>
      ) : posts && posts.length > 0 ? (
        <PopularPosts
          posts={{ results: posts }}
          title="no title"
          showLoadMore={false}
        />
      ) : (
        <div className="text-center py-8">
          <p className="text-muted-foreground">
            No community activity yet. Be the first to post!
          </p>
        </div>
      )}
    </div>
  );
}

