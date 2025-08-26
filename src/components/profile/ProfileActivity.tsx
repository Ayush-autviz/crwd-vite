import React, { useState } from "react";
import { Link } from "react-router-dom";
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
}

const ProfileActivity: React.FC<ProfileActivityProps> = ({
  posts,
  showLabel,
  showLoadMore = false,
  imageUrl,
  title = "Activity",
}) => {
  const [allPosts, setAllPosts] = useState<PostDetail[]>(posts);
  const [isLoading, setIsLoading] = useState(false);

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
      {showLabel && (
        <h2 className="text-lg font-semibold mb-4">Recent Activity</h2>
      )}
      {title && <h2 className="text-lg font-semibold mb-4">{title}</h2>}
      <div className="space-y-4">
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
