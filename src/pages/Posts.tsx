import React from "react";
import { popularPosts } from "@/lib/profile/profileActivity";
import ProfileActivity from "@/components/profile/ProfileActivity";
import ProfileNavbar from "@/components/profile/ProfileNavbar";
import Footer from "@/components/Footer";

export default function Posts() {
  return (
    <div className="min-h-screen bg-white flex flex-col">
      <ProfileNavbar title="Posts" />
      <main className="flex-1 p-4">
        <div className="space-y-4">
          <ProfileActivity posts={popularPosts} />
        </div>
      </main>

      {/* Footer */}
      <div className="hidden md:block">
        <Footer />
      </div>
    </div>
  );
}
