import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import type { PostDetail } from "@/lib/types";
import ProfileActivityCard from "./ProfileActivityCard";
import { morePostsToLoad } from "@/lib/profile/profileActivity";
import { Button } from "@/components/ui/button";
import { Loader2, MessageSquare } from "lucide-react";
import EmptyState from "@/components/ui/EmptyState";

interface ProfileActivityProps {
  posts: PostDetail[];
  showLabel?: boolean;
  showLoadMore?: boolean;
  imageUrl?: string;
  title?: string;
  postButton?: boolean;
  subheading?: boolean;
  collectiveData?: any;
  isLoading?: boolean;
  error?: any;
  onLoadMore?: () => void;
  hasMore?: boolean;
  isLoadingMore?: boolean;
}

const ProfileActivity: React.FC<ProfileActivityProps> = ({
  posts,
  showLabel,
  showLoadMore = false,
  imageUrl,
  title = "Activity",
  postButton = false,
  subheading = false,
  collectiveData,
  isLoading = false,
  error = null,
  onLoadMore,
  hasMore,
  isLoadingMore = false,
}) => {
  const [allPosts, setAllPosts] = useState<PostDetail[]>(posts);
  const navigate = useNavigate();
  // const handleLoadMore = async () => {
  //   setIsLoadingMore(true);

  //   // Simulate loading delay
  //   await new Promise((resolve) => setTimeout(resolve, 1500));

  //   // Append new posts to the existing array
  //   setAllPosts((prevPosts) => [...prevPosts, ...morePostsToLoad]);

  //   setIsLoadingMore(false);
  // };    

  useEffect(() => {
    setAllPosts(posts);
  }, [isLoading]);

  return (
    <div className="w-full">
      <div className="flex items-center justify-between">
        {showLabel && (
          <h2 className="text-base md:text-lg font-semibold">Recent Activity</h2>
        )}
        {title && <h2 className="text-base md:text-lg font-semibold">{title}</h2>}
        {postButton && (
          <Button
            onClick={() => navigate("/create-post", { state: { collectiveData } })}
            variant="outline"
            className="px-4 md:px-6 py-1.5 md:py-2 text-xs md:text-sm"
          >
            Create Post
          </Button>
        )}
      </div>
      {subheading && (
        <i className="text-[10px] md:text-xs text-gray-500">
          Members share updates, questions and articles here.
        </i>
      )}
      <div className="space-y-3 md:space-y-4 mt-3 md:mt-4">
        {isLoading ? (
          <div className="flex items-center justify-center py-6 md:py-8">
            <div className="flex flex-col items-center gap-1.5 md:gap-2">
              <Loader2 className="w-5 h-5 md:w-6 md:h-6 animate-spin" />
              <p className="text-xs md:text-sm text-gray-600">Loading...</p>
            </div>
          </div>
        ) : error ? (
          <div className="flex items-center justify-center py-6 md:py-8">
            <div className="text-center">
              <p className="text-sm md:text-base text-red-600 mb-1.5 md:mb-2">Failed to load posts</p>
              <p className="text-xs md:text-sm text-gray-600">Please try again later</p>
            </div>
          </div>
        ) : allPosts.length > 0 ? (
          allPosts.map((post) => (
            // <Link to={`/posts/${post.id}`}>
            <ProfileActivityCard
              imageUrl={imageUrl}
              key={post.id}
              post={post}
            />
            // </Link>
          ))
        ) : (
          <EmptyState
            icon={<MessageSquare size={40} className="md:w-12 md:h-12" />}
            title="No posts yet"
            description="This user hasn't shared any posts yet. Check back later to see their activity."
            className="bg-white rounded-lg border border-gray-200"
          />
        )}
      </div>

      {/* Load More button only appears when showLoadMore is true and hasMore is true */}
      {showLoadMore && (hasMore !== false) && onLoadMore && (
        <div className="flex justify-center mt-4 md:mt-6">
          <Button
            onClick={onLoadMore}
            disabled={isLoadingMore}
            variant="outline"
            className="px-4 md:px-6 py-1.5 md:py-2 text-xs md:text-sm"
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

export default ProfileActivity;
