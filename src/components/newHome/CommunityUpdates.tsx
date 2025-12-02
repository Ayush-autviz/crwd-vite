import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Link } from "react-router-dom";

interface CommunityUpdate {
  id: string | number;
  user: {
    name: string;
    username: string;
    avatar?: string;
  };
  collective?: {
    name: string;
  };
  content: string;
  timestamp?: string;
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
    <div className="px-4 mt-8 md:px-0 md:mt-10">
      <div className="mb-4">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Community Updates</h2>
        <p className="text-sm text-gray-600">
          Activity, updates, and discoveries from your community
        </p>
      </div>

      <div className="space-y-4">
        {updates.map((update) => (
          <div
            key={update.id}
            className="bg-white rounded-lg border border-gray-200 p-4 hover:shadow-md transition-shadow"
          >
            <div className="flex items-start gap-3">
              {/* Avatar */}
              <Avatar className="h-10 w-10 flex-shrink-0">
                <AvatarImage src={update.user.avatar} />
                <AvatarFallback className="bg-[#0047FF] text-white">
                  {update.user.name
                    .split(" ")
                    .map((n) => n.charAt(0))
                    .join("")
                    .toUpperCase()}
                </AvatarFallback>
              </Avatar>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <Link
                    to={`/user-profile/${update.user.username}`}
                    className="font-bold text-gray-900 hover:underline"
                  >
                    {update.user.name}
                  </Link>
                  <span className="text-gray-500 text-sm">@{update.user.username}</span>
                </div>
                {update.collective && (
                  <p className="text-sm text-gray-600 mb-2">{update.collective.name}</p>
                )}
                <p className="text-sm text-gray-700 leading-relaxed line-clamp-3">
                  {update.content}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

