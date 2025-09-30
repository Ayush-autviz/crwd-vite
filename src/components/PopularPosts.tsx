import React, { useState } from "react";
import { popularPosts } from "@/lib/profile/profileActivity";
import ProfileActivity from "./profile/ProfileActivity";
import { morePostsToLoad } from "@/lib/profile/profileActivity";
import { Button } from "@/components/ui/button";
import { Loader2, HelpCircle } from "lucide-react";
import type { PostDetail } from "@/lib/types";

export const PopularPosts = ({
  related = false,
  title = "Recent Posts to Collectives",
  showLoadMore = true,
}: {
  related?: boolean;
  title?: string;
  showLoadMore?: boolean;
}) => {
  const [allPosts, setAllPosts] = useState<PostDetail[]>(popularPosts);
  const [isLoading, setIsLoading] = useState(false);
  const [loadCount, setLoadCount] = useState(0);

  const handleLoadMore = async () => {
    setIsLoading(true);

    // Simulate loading delay
    await new Promise((resolve) => setTimeout(resolve, 1500));

    // Create new posts with unique IDs to avoid conflicts
    const newPosts: PostDetail[] = morePostsToLoad.map((post) => ({
      ...post,
      id: post.id + loadCount * 100, // Make IDs unique across loads
      imageUrl: post.imageUrl || "", // Ensure imageUrl is always a string
    }));

    // Append new posts to existing ones
    setAllPosts((prevPosts) => [...prevPosts, ...newPosts]);
    setLoadCount((prev) => prev + 1);

    setIsLoading(false);
  };

  return (
    <div className="w-full p-4 md:p-0">
      <div className="flex items-center gap-2 mb-4">
        <h2 className="text-lg font-semibold">
          {related ? "Related Posts" : title}
        </h2>
        <div className="group relative">
          <HelpCircle className="w-4 h-4 text-gray-500 cursor-pointer" />
          <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-gray-100 text-gray-500 text-sm rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-10">
            You can engage with others in Collectives.
            <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900"></div>
          </div>
        </div>
      </div>
      <div className="space-y-4">
        {allPosts.map((post) => (
          <ProfileActivity title="" key={post.id} posts={[post]} />
        ))}
      </div>

      {/* Load More button at the end of all posts */}
      {showLoadMore && (
        <div className="flex justify-center mt-6 mb-8">
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

export default PopularPosts;
