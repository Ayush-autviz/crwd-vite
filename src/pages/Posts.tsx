import React from "react";
import { popularPosts } from "@/lib/profile/profileActivity";
import ProfileActivity from "@/components/profile/ProfileActivity";
import ProfileNavbar from "@/components/profile/ProfileNavbar";

export default function Posts() {
  return (
    <div className="min-h-screen bg-white flex flex-col pb-16">
      <ProfileNavbar title="Posts" />
      <main className="flex-1 p-4">
        <div className="space-y-4">
          {popularPosts.map((post) => (
            <ProfileActivity key={post.id} posts={[post]} />
          ))}
        </div>
      </main>
    </div>
  );
}
