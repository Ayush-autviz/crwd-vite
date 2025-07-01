import React, { useState } from "react";
import { popularPosts } from "@/lib/profile/profileActivity";
import ProfileActivity from "./profile/ProfileActivity";
import { morePostsToLoad } from "@/lib/profile/profileActivity";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import type { PostDetail } from "@/lib/types";

export const PopularPosts = () => {
  const [allPosts, setAllPosts] = useState<PostDetail[]>(popularPosts);
  const [isLoading, setIsLoading] = useState(false);
  const [loadCount, setLoadCount] = useState(0);

  const handleLoadMore = async () => {
    setIsLoading(true);
    
    // Simulate loading delay
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // Create new posts with unique IDs to avoid conflicts
    const newPosts: PostDetail[] = morePostsToLoad.map(post => ({
      ...post,
      id: post.id + (loadCount * 100), // Make IDs unique across loads
      imageUrl: post.imageUrl || "" // Ensure imageUrl is always a string
    }));
    
    // Append new posts to existing ones
    setAllPosts(prevPosts => [...prevPosts, ...newPosts]);
    setLoadCount(prev => prev + 1);
    
    setIsLoading(false);
  };

  return (
    <div className="w-full p-4 md:p-0">
      <h2 className="text-lg font-semibold mb-4">Popular Posts</h2>
      <div className="space-y-4">
        {allPosts.map((post) => (
          <ProfileActivity key={post.id} posts={[post]} />  
        ))}
      </div>
      
      {/* Load More button at the end of all posts */}
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
            'Load More'
          )}
        </Button>
      </div>
    </div>
  );
};  

export default PopularPosts;
