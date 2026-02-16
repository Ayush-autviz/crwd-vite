import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { useState, useRef, useEffect } from 'react';
import { useAuthStore } from '@/stores/store';
import { MessageCircle, Heart } from 'lucide-react';
import ActivityCard from './ActivityCard';
import CommunityPostCard from '@/components/newHome/CommunityPostCard';

interface CommunityActivityProps {
  posts: any[];
  isLoading?: boolean;
  collectiveId?: string;
  isJoined?: boolean;
  collectiveData?: any;
  onJoin?: () => void;
}

export default function CommunityActivity({
  posts,
  isLoading = false,
  collectiveId,
  isJoined = false,
  collectiveData,
  onJoin,
}: CommunityActivityProps) {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [showCreateMenu, setShowCreateMenu] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowCreateMenu(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const isFounder = user?.id === collectiveData?.user?.id || user?.id === collectiveData?.created_by?.id;
  const toggleMenu = () => setShowCreateMenu(!showCreateMenu);

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
    fundraiser: post.fundraiser ? {
      id: post.fundraiser.id,
      name: post.fundraiser.name,
      description: post.fundraiser.description,
      image: post.fundraiser.image,
      color: post.fundraiser.color,
      target_amount: post.fundraiser.target_amount,
      current_amount: post.fundraiser.current_amount,
      progress_percentage: post.fundraiser.progress_percentage || 0,
      is_active: post.fundraiser.is_active,
      total_donors: post.fundraiser.total_donors,
      end_date: post.fundraiser.end_date,
    } : undefined,
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
          <h3 className="font-bold text-base xs:text-lg md:text-xl text-foreground">
            Community Activity
          </h3>
          {/* {posts && posts.length > 0 && (
            <p className="text-xs md:text-sm text-muted-foreground mt-0.5">
              {posts.length} Update{posts.length !== 1 ? 's' : ''}
            </p>
          )} */}
        </div>
        {!isJoined ? (
          <div
            onClick={onJoin}
            role="button"
            className="bg-white hover:bg-gray-100 text-gray-800 font-semibold border-1 border-gray-200 px-2 md:px-3 lg:px-4 py-1 md:py-1.5 lg:py-2 rounded-full text-xs xs:text-sm md:text-base cursor-pointer transition-colors"
          >
            Join to post updates
          </div>
        ) : (
          <div className="relative" ref={menuRef}>
            <Button
              onClick={isFounder ? toggleMenu : () => navigate("/create-post", { state: { collectiveData } })}
              variant="default"
              className="px-2 md:px-4 bg-white text-gray-800 shadow-none border-1 border-gray-200 hover:bg-gray-100 hover:text-gray-900  lg:px-6 py-1 md:py-1.5 lg:py-2 rounded-full text-xs xs:text-sm md:text-base font-semibold flex items-center gap-1"
            >
              {isFounder ? '+ Create' : 'Create Post'}
            </Button>

            {showCreateMenu && isFounder && (
              <div className="absolute right-0 top-full mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-100 z-50 overflow-hidden">
                <div className="py-1">
                  <button
                    onClick={() => navigate("/create-post", { state: { collectiveData } })}
                    className="w-full text-left px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-3 transition-colors font-medium"
                  >
                    <MessageCircle className="w-4 h-4 text-gray-500" />
                    Create Post
                  </button>
                  {/* <button
                    onClick={() => navigate("/create-event", { state: { collectiveData } })}
                    className="w-full text-left px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-3 transition-colors"
                  >
                    <Calendar className="w-4 h-4 text-gray-500" />
                    Create Event
                  </button> */}
                  <button
                    onClick={() => navigate(`/create-fundraiser/${collectiveId}`)}
                    className="w-full text-left px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-3 transition-colors font-medium"
                  >
                    <Heart className="w-4 h-4 text-gray-500" />
                    Create Fundraiser
                  </button>
                </div>
              </div>
            )}
          </div>
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
                <CommunityPostCard key={post.id} post={post} showSimplifiedHeader={true} />
              ))}
            </div>
          ) : (
            <div className="text-center py-6 md:py-8">
              <p className="text-sm xs:text-base md:text-lg text-muted-foreground">
                No community activity yet. Be the first to post!
              </p>
            </div>
          )}

          {/* Recent Activities Section */}
          {recentActivities.length > 0 && (
            <div className="mt-6 md:mt-8 space-y-0">
              <h3 className="font-bold text-base xs:text-lg md:text-xl text-foreground mb-3 md:mb-4">
                Recent Activities
              </h3>
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

