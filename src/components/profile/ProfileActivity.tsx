import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import type { PostDetail } from "@/lib/types";
import ProfileActivityCard from "./ProfileActivityCard";
import { morePostsToLoad } from "@/lib/profile/profileActivity";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";

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
}) => {
  const [allPosts, setAllPosts] = useState<PostDetail[]>(posts);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
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
          <div className="flex items-center justify-center py-8">
            <p className="text-gray-600">No posts available yet</p>
          </div>
        )}
      </div>

      {/* Load More button only appears when showLoadMore is true */}
      {showLoadMore && (
        <div className="flex justify-center mt-6">
          <Button
            onClick={onLoadMore}
            disabled={isLoading}
            variant="outline"
            className="px-6 py-2"
          >
            Load More
          </Button>
        </div>
      )}
    </div>
  );
};

export default ProfileActivity;
