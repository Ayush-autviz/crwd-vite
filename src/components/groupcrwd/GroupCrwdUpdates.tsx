import React, { useState } from "react";
import {
  Plus,
  MoreHorizontal,
  Heart,
  MessageCircle,
  Share2,
  MessageSquare,
  X,
} from "lucide-react";
import ProfileActivity from "../profile/ProfileActivity";
import { profileActivity } from "@/lib/profile/profileActivity";
import EmptyState from "../ui/EmptyState";
import { Button } from "../ui/button";
import ReactConfetti from "react-confetti";

const updates = [
  {
    user: "Chad",
    avatar: "https://randomuser.me/api/portraits/men/32.jpg",
    time: "17h",
    text: "The quick, brown fox jumps over a lazy dog. DJs flock by when MTV ax quiz prog. Junk MTV quiz graced by fox whelps. Bawds jog, flick quartz, vex nymphs. Waltz, bad nymph, for quick jigs vex!",
    image: "",
    likes: 2,
    comments: 0,
    shares: 3,
  },
  {
    user: "Chad",
    avatar: "https://randomuser.me/api/portraits/men/32.jpg",
    time: "17h",
    text: "The quick, brown fox jumps over a lazy dog. DJs flock by when MTV ax quiz prog. Junk",
    image:
      "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=400&q=80",
    likes: 2,
    comments: 0,
    shares: 3,
  },
];

interface GroupCrwdUpdatesProps {
  posts?: any[];
  showEmpty?: boolean;
}

const GroupCrwdUpdates: React.FC<GroupCrwdUpdatesProps> = ({
  posts = profileActivity,
  showEmpty = false,
}) => {
  // Show empty state if showEmpty is true or if posts array is empty
  const shouldShowEmpty = showEmpty || posts.length === 0;

  return (
    <div className="px-4 pt-2 pb-2">
      {/* <div className="flex items-center justify-between mb-2 px-2">
        <span className="font-semibold text-base">4 Updates</span>
        <button className="bg-blue-100 text-blue-600 rounded-full p-1"><Plus size={18} /></button>
      </div> */}

      {shouldShowEmpty ? (
        <EmptyState
          icon={<MessageSquare size={48} />}
          title="Be the first one to share"
          description="Start the conversation by sharing an update with your group. Your post will help keep everyone engaged and informed."
          actionText="Create Post"
          actionLink="/create-post"
          className="bg-white rounded-lg border border-gray-200"
        />
      ) : (
        <div className="space-y-4">
          <ProfileActivity posts={posts} postButton={true} />
          <div className="lg:max-w-[600px]">
            <div className="space-y-4">
              {/* Member Action Post */}
              <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4">
                <div className="flex items-start gap-3">
                  <img
                    src="https://randomuser.me/api/portraits/men/31.jpg"
                    alt=""
                    className="w-10 h-10 rounded-full object-cover"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-semibold text-gray-900">@alex</span>
                      <span className="text-blue-600 text-sm">
                        cleanwaterfriends
                      </span>
                      <span className="text-gray-400 text-sm">2d</span>
                    </div>
                    <p className="text-gray-700 text-sm">
                      @alex joined Clean Water Friends. 🌊
                    </p>
                  </div>
                  <button className="text-gray-400 hover:text-gray-600 p-1">
                    <span className="text-lg">⋯</span>
                  </button>
                </div>
              </div>

              {/* Donation Activity Post */}
              <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4">
                <div className="flex items-start gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-semibold text-gray-900">
                        CRWD Updates
                      </span>
                      <span className="text-gray-400 text-sm">1d</span>
                    </div>
                    <p className="text-gray-700 text-sm">
                      "Save the Trees Atlanta" has collectively made 10
                      donations. 🌳
                    </p>
                  </div>
                  <button className="text-gray-400 hover:text-gray-600 p-1">
                    <span className="text-lg">⋯</span>
                  </button>
                </div>
              </div>

              {/* Milestone Post */}
              <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4">
                <div className="flex items-start gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-semibold text-gray-900">
                        CRWD Milestones
                      </span>
                      <span className="text-gray-400 text-sm">3d</span>
                    </div>
                    <p className="text-gray-700 text-sm">
                      "Save the Trees Atlanta" reached 25 members! 🎉
                    </p>
                  </div>
                  <button className="text-gray-400 hover:text-gray-600 p-1">
                    <span className="text-lg">⋯</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default GroupCrwdUpdates;
