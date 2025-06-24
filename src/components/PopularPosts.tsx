import React from "react";
import { popularPosts } from "@/lib/profile/profileActivity";
import ProfileActivity from "./profile/ProfileActivity";

export const PopularPosts = () => {
  return (
    <div className="w-full p-4 md:p-0">
      <h2 className="text-lg font-semibold mb-4">Popular Posts</h2>
      <div className="space-y-4">
       {
        popularPosts.map((post) => (
          <ProfileActivity key={post.id} posts={[post]} />  
        ))
       }
      </div>
    </div>
  );
};  

export default PopularPosts;
