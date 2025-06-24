import React from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Link } from "react-router-dom";
import type { Topic } from "@/lib/types";

interface TopicsListProps {
  topics: Topic[];
  showTitle?: boolean;
}

// Static array of avatar image URLs
const avatarImages = [
  "https://randomuser.me/api/portraits/men/33.jpg",
  "https://randomuser.me/api/portraits/women/44.jpg",
  "https://randomuser.me/api/portraits/men/34.jpg",
  "https://randomuser.me/api/portraits/women/45.jpg",
  "https://randomuser.me/api/portraits/men/35.jpg",
  "https://randomuser.me/api/portraits/women/46.jpg",
  "https://randomuser.me/api/portraits/men/36.jpg",
  "https://randomuser.me/api/portraits/women/47.jpg",
  "https://randomuser.me/api/portraits/men/37.jpg",
  "https://randomuser.me/api/portraits/women/48.jpg",
];

const TopicsList = ({ topics, showTitle = true }: TopicsListProps) => {
  return (
    <div className="w-full">
      {showTitle && <h2 className="text-lg font-semibold">Topics</h2>}
      <div className="space-y-2">
        {topics.map((topic) => (
          <Link to="/search">
            <div
              key={topic.id}
              className="flex justify-between items-center hover:bg-muted/50 py-3 px-2 rounded-md cursor-pointer transition-colors"
            >
              <div className="flex items-center min-w-0">
                {/* <div className="flex -space-x-2 mr-3 flex-shrink-0">
                {topic.avatars.map((avatar, index) => {
                  // Pick a random image for each avatar
                  const imgIdx = Math.floor(Math.random() * avatarImages.length);
                  return (
                    <Avatar
                      key={index}
                      className="w-6 h-6 border-2 border-background"
                    >
                      <AvatarImage src={avatarImages[imgIdx]} alt={avatar} />
                      <AvatarFallback className="text-xs bg-muted">
                        {avatar.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                  );
                })} */}
                {/* {topic.avatars.length > 3 && (
                  <div className="w-6 h-6 rounded-full bg-muted border-2 border-background flex items-center justify-center text-xs">
                    +{topic.avatars.length - 3}
                  </div>
                )} */}
                {/* </div> */}
                <span className="text-sm font-medium truncate">{topic.name}</span>
              </div>

            </div>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default TopicsList;
