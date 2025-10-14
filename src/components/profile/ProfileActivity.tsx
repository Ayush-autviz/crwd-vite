import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
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
}) => {
  const [allPosts, setAllPosts] = useState<PostDetail[]>(posts);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const handleLoadMore = async () => {
    setIsLoading(true);

    // Simulate loading delay
    await new Promise((resolve) => setTimeout(resolve, 1500));

    // Append new posts to the existing array
    setAllPosts((prevPosts) => [...prevPosts, ...morePostsToLoad]);

    setIsLoading(false);
  };

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
        {allPosts.length > 0 &&
          allPosts.map((post, idx) => (
            // <Link to={`/posts/${post.id}`}>
            <ProfileActivityCard
              imageUrl={imageUrl}
              key={post.id}
              post={post}
            />
            // </Link>
          ))}
      </div>

      {/* Load More button only appears when showLoadMore is true */}
      {showLoadMore && (
        <div className="flex justify-center mt-6">
          <Button
            onClick={handleLoadMore}
            disabled={isLoading}
            variant="outline"
            className="px-6 py-2"
          >
            {isLoading ? (
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
