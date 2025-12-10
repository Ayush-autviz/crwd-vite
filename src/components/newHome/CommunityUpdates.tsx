import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Link } from "react-router-dom";
import { HandHeart, Heart, MessageCircle } from "lucide-react";

interface CommunityUpdate {
  id: string | number;
  user: {
    id?: string | number;
    name: string;
    firstName?: string;
    lastName?: string;
    username: string;
    avatar?: string;
  };
  collective?: {
    name: string;
  };
  content: string;
  timestamp?: string;
  likesCount?: number;
  commentsCount?: number;
}

interface CommunityUpdatesProps {
  updates?: CommunityUpdate[];
}

export default function CommunityUpdates({
  updates = [],
}: CommunityUpdatesProps) {

  if (!updates || updates.length === 0) {
    return null;
  }

  return (
    <div className="px-4 my-8 mb-10 md:px-0 md:mt-10">
      <div className="mb-4">
        <h2 className="text-3xl font-bold text-gray-900 mb-2">Community Updates</h2>
        <p className="text-sm text-gray-600">
          Activity, updates, and discoveries from your community
        </p>
      </div>

      <div className="space-y-4">
        {updates.map((update) => {
          // Extract action text from content (e.g., "Donated to Paws Atlanta")
          const actionText = update.content || "";
          
          return (
            <div
              key={update.id}
              className="bg-white rounded-lg border border-gray-200 p-4 hover:shadow-md transition-shadow"
            >
              {/* Top Section: Profile and Follow Button */}
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  {/* Avatar */}
                  <Avatar className="h-12 w-12 flex-shrink-0 rounded-xl">
                    <AvatarImage src={update.user.avatar} />
                    <AvatarFallback className="bg-[#1600ff] text-white">
                      {update.user.name
                        .split(" ")
                        .map((n) => n.charAt(0))
                        .join("")
                        .toUpperCase()}
                    </AvatarFallback>
                  </Avatar>

                  {/* User Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <Link
                        to={`/user-profile/${update.user.username}`}
                        className="font-bold text-gray-900 hover:underline block"
                      >
                        {update.user.firstName && update.user.lastName 
                          ? `${update.user.firstName} ${update.user.lastName}`
                          : update.user.name || update.user.username}
                      </Link>
                    <p className="text-sm text-gray-500">@{update.user.username}</p>
                    </div>
                    {update.collective && (
                      <p className="text-sm text-gray-500">{update.collective.name}</p>
                    )}
                  </div>
                </div>


              </div>

              {/* Content Box */}
              <div className="bg-gray-50 rounded-lg p-3 mb-3 flex items-center gap-3">
                {/* Icon */}
                <div className="h-10 w-10 rounded-full bg-[#13b981] flex items-center justify-center flex-shrink-0">
                  <HandHeart className="h-5 w-5 text-white" />
                </div>
                {/* Action Text */}
                <p className="text-sm font-medium text-gray-900 flex-1">
                  {actionText}
                </p>
              </div>

              {/* Bottom Section: Engagement Metrics */}
             
            </div>
          );
        })}
      </div>
    </div>
  );
}



