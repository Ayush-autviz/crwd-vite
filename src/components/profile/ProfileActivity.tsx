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
          <h2 className="text-lg font-semibold">Recent Activity</h2>
        )}
        {title && <h2 className="text-lg font-semibold">{title}</h2>}
        {postButton && (
          <Button
            onClick={() => navigate("/create-post", { state: { collectiveData } })}
            variant="outline"
            className="px-6 py-2 "
          >
            Start a Conversation
          </Button>
        )}
      </div>
      {subheading && (
        <i className="text-xs text-gray-500">
          Members share updates, questions and articles here.
        </i>
      )}
      <div className="space-y-4 mt-4">
        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <div className="flex flex-col items-center gap-2">
              <Loader2 className="w-6 h-6 animate-spin" />
              <p className="text-sm text-gray-600">Loading posts...</p>
            </div>
          </div>
        ) : error ? (
          <div className="flex items-center justify-center py-8">
            <div className="text-center">
              <p className="text-red-600 mb-2">Failed to load posts</p>
              <p className="text-sm text-gray-600">Please try again later</p>
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
            icon={<MessageSquare size={48} />}
            title="No posts yet"
            description="This user hasn't shared any posts yet. Check back later to see their activity."
            className="bg-white rounded-lg border border-gray-200"
          />
        )}
      </div>

      {/* Load More button only appears when showLoadMore is true and hasMore is true */}
      {showLoadMore && (hasMore !== false) && onLoadMore && (
        <div className="flex justify-center mt-6">
          <Button
            onClick={onLoadMore}
            disabled={isLoadingMore}
            variant="outline"
            className="px-6 py-2"
          >
            {isLoadingMore ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
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
