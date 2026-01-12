import ProfileActivity from "./profile/ProfileActivity";
import { Button } from "@/components/ui/button";
import { Loader2, HelpCircle } from "lucide-react";

export const PopularPosts = ({
  related = false,
  title = "Recent Posts to Collectives",
  showLoadMore = true,
  posts,
  isLoading = false,
  onLoadMore,
  hasMore,
  isLoadingMore,
}: {
  related?: boolean;
  title?: string;
  showLoadMore?: boolean;
  posts?: any;
  isLoading?: boolean;
  onLoadMore?: () => void;
  hasMore?: boolean;
  isLoadingMore?: boolean;
}) => {
  const handleLoadMore = () => {
    if (onLoadMore && !isLoadingMore) {
      onLoadMore();
    }
  };


  console.log(posts?.results);


  return (
    <div className="w-full p-3 md:p-4 lg:p-0">
      <div className="flex items-center gap-1.5 md:gap-2 mb-3 md:mb-4">
        {title != "no title" && (
          <>
            <h2 className="text-base md:text-lg font-semibold">
              {related ? "Related Posts" : title}
            </h2>
            <div className="group relative">
              <HelpCircle className="w-3.5 h-3.5 md:w-4 md:h-4 text-gray-500 cursor-pointer" />
              <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2.5 md:px-3 py-1.5 md:py-2 bg-gray-100 text-gray-500 text-xs md:text-sm rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-10">
                You can engage with others in Collectives.
                <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900"></div>
              </div>
            </div>
          </>
        )}
      </div>
      {isLoading ? (
        <div className="flex justify-center items-center py-6 md:py-8">
          <Loader2 className="w-5 h-5 md:w-6 md:h-6 animate-spin" />
          <span className="ml-1.5 md:ml-2 text-sm md:text-base">Loading...</span>
        </div>
      ) : (
        <div className="space-y-3 md:space-y-4">
          {posts?.results.length > 0 ? (
            posts.results.map((post: any) => {
              // Transform API response to match PostDetail interface
              const transformedPost: any = {
                id: post.id,
                avatarUrl: post.user?.profile_picture || '/placeholder.svg',
                username: post.user?.username || post.user?.full_name || 'Unknown User',
                firstName: post.user?.first_name || '',
                lastName: post.user?.last_name || '',
                userId: post.user?.id?.toString() || '',
                color: post.user?.color,
                time: post.created_at || new Date().toISOString(), // Pass raw timestamp for proper relative time calculation
                created_at: post.created_at, // Also include created_at for ProfileActivityCard to use
                timestamp: post.created_at, // Include timestamp as well
                org: post.collective?.name || 'Unknown Collective',
                orgUrl: post.collective?.id,
                text: post.content || '',
                imageUrl: post.media || undefined,
                previewDetails: post.preview_details || null,
                likes: post.likes_count || 0,
                comments: post.comments_count || 0,
                shares: 0, // API doesn't provide shares count
                isLiked: post.is_liked === true, // Ensure boolean conversion
              };

              return (
                <ProfileActivity title="" key={post.id} posts={[transformedPost]} />
              );
            })
          ) : (
            <div className="text-center py-6 md:py-8 text-muted-foreground text-sm md:text-base">
              No posts available yet
            </div>
          )}
        </div>
      )}

      {/* Load More button at the end of all posts */}
      {showLoadMore && (hasMore || posts?.next) && (
        <div className="flex justify-center mt-4 md:mt-6 mb-6 md:mb-8">
          <Button
            onClick={handleLoadMore}
            disabled={isLoadingMore}
            variant="outline"
            className="px-4 md:px-6 py-1.5 md:py-2 text-sm md:text-base"
          >
            {isLoadingMore ? (
              <>
                <Loader2 className="w-3.5 h-3.5 md:w-4 md:h-4 mr-1.5 md:mr-2 animate-spin" />
                Loading...
              </>
            ) : (
              "Load More"
            )}
          </Button>
        </div>
      )}
    </div>
  );
};

export default PopularPosts;
