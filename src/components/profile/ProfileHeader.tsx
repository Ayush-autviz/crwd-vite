import { Avatar, AvatarImage, AvatarFallback } from "../ui/avatar";
import { Pencil } from "lucide-react";

interface UserProfileHeaderProps {
  profileData: any;
  profilePicture?: string;
  firstName?: string;
  lastName?: string;
  username?: string;
  fullName?: string;
  location?: string;
  followersCount?: number;
  followingCount?: number;
  getInitials: (firstName?: string, lastName?: string, fullName?: string, username?: string) => string;
  onStatPress?: (tab: 'causes' | 'following' | 'followers' | 'crwds') => void;
  isOwnProfile?: boolean;
}

export const UserProfileHeader = ({
  profileData,
  profilePicture,
  firstName,
  lastName,
  username,
  fullName,
  location,
  followersCount = 0,
  followingCount = 0,
  getInitials,
  onStatPress,
  isOwnProfile,
}: UserProfileHeaderProps) => {
  return (
    <div className="flex items-start gap-5">
      {/* Avatar */}
      <div className="relative group">
        <div className="relative">
          <Avatar className="w-20 h-20 rounded-full flex-shrink-0 border-none">
            <AvatarImage src={profilePicture} className="object-cover" />
            <AvatarFallback
              className="text-2xl font-bold text-white border-none"
              style={{ backgroundColor: profileData?.color }}
            >
              {getInitials(firstName, lastName, fullName, username)}
            </AvatarFallback>
          </Avatar>
          {isOwnProfile && !profilePicture && (
            <div 
              onClick={() => window.location.href = '/settings'}
              className="absolute -top-1 -right-1 bg-[#2222EE] rounded-full p-1.5 shadow-md cursor-pointer hover:bg-blue-700 transition-colors z-10"
            >
              <Pencil size={11} className="text-white" />
            </div>
          )}
        </div>
      </div>

      {/* Name/Location/Stats */}
      <div className="flex-1 ">
        <h2 className="text-xl font-bold text-gray-900 leading-tight">{fullName}</h2>
        {location ? (
          <p className="text-sm font-medium text-gray-500">{location}</p>
        ) : (
          isOwnProfile && (
            <button 
              onClick={() => window.location.href = '/settings'}
              className="text-sm font-semibold text-[#2222EE] hover:underline block text-left"
            >
              Add your location
            </button>
          )
        )}
        <div className="flex items-center gap-4 italic text-sm text-gray-600 mt-1">
          <button
            onClick={() => onStatPress?.('followers')}
            className="hover:underline"
          >
            <span className="font-bold text-black">{followersCount}</span> followers
          </button>
          <button
            onClick={() => onStatPress?.('following')}
            className="hover:underline"
          >
            <span className="font-bold text-black">{followingCount}</span> following
          </button>
        </div>
      </div>
    </div>
  );
};

export default UserProfileHeader;